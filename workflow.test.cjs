const { readFileSync } = require('node:fs');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { test } = require('node:test');
const source = readFileSync(require('node:path').join(__dirname, 'google-apps-script.js'), 'utf8');

function fixture() {
  const values = new Map([['API_SECRET', 'test'], ['ADMIN_PASSWORD', 'test'], ['SUBMISSION_RECEIPT_BCC', 'one@example.com,two@example.com']]);
  const native = new Map();
  const films = new Map();
  const mail = [];
  const faults = { save: false, update: false, config: false };
  let serial = 0;
  let now = Date.parse('2026-11-10T15:00:00Z');
  class Clock extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }
  const props = { getProperty: key => values.get(key) || null, setProperty: (key, value) => values.set(key, String(value)), getProperties: () => Object.fromEntries(values), deleteProperty: key => values.delete(key) };
  const lock = { held: false, tryLock() { if (this.held) return false; this.held = true; return true; }, waitLock() { assert(this.tryLock()); }, hasLock() { return this.held; }, releaseLock() { this.held = false; } };
  const response = (status, data) => ({ getResponseCode: () => status, getContentText: () => JSON.stringify(data) });
  const ctx = vm.createContext({
    Date: Clock, Logger: { log() {} },
    PropertiesService: { getScriptProperties: () => props },
    LockService: { getScriptLock: () => lock },
    Utilities: { getUuid: () => 'test-' + ++serial },
    ScriptApp: {
      getProjectTriggers: () => [...native.values()],
      deleteTrigger: trigger => native.delete(trigger.getUniqueId()),
      newTrigger(handler) { return { timeBased() { return this; }, everyMinutes(n) { assert.equal(n, 5); return this; },
        create() { const id = 'native-' + ++serial; const t = { getUniqueId: () => id, getHandlerFunction: () => handler }; native.set(id, t); return t; } }; }
    },
    MailApp: { sendEmail: message => mail.push(message) },
    UrlFetchApp: { fetch: (url, options) => {
      const u = new URL(url);
      const action = u.searchParams.get('action');
      const id = u.searchParams.get('id');
      if (u.hostname === 'i.ytimg.com') return response(200, {});
      if (u.pathname.endsWith('/films') && options.method === 'post') {
        if (faults.save) return response(503, {});
        const film = JSON.parse(options.payload);
        const existing = [...films.values()].find(f => f.submissionId === film.submissionId);
        if (existing) return response(200, {success: true, id: existing._id});
        film._id = String(films.size + 1); films.set(film._id, film);
        return response(201, {success: true, id: film._id});
      }
      if (action === 'update') {
        if (faults.update) return response(503, {});
        Object.assign(films.get(id), JSON.parse(options.payload)); return response(200, {success: true});
      }
      if (action === 'list') return response(200, {films: [...films.values()]});
      if (action === 'approve') {
        assert.equal(JSON.parse(options.payload).skipEmail,true);
        Object.assign(films.get(id), {live:true, accepted:true, pending:false}); return response(200, {success:true});
      }
      if (action === 'rejectionArc') return faults.config ? response(503,{}) : response(200,{config: faults.arc});
      throw Error('Unexpected request');
    }}
  });
  vm.runInContext(source,ctx);
  const submit = (title = 'Test film') => ctx.onFormSubmit({namedValues:{
    'Project Title':[title], Director:['QA Director'], 'Email address':['submitter@example.com'],
    'Link to Film':['https://youtu.be/Br006oI49SE?si=abc'],
    'Submission Terms: you grant us a license to your film/link':['I agree']
  }});
  const run = at => { now = at; ctx.runWorkflowQueue({triggerUid:'test'}); };
  const job = handler => ctx.queuedWorkflowJobs_().find(j=>j.handler===handler);
  const receipts = () => mail.filter(m=>m.subject.startsWith('We received'));
  return {ctx, values, native, films, mail, faults, submit, run, job, receipts};
}
test('failed database insert never sends a receipt and retries through a single worker', () => {
  const f=fixture(); f.faults.save=true; f.submit();
  assert.equal(f.receipts().length,0);
  assert.equal(f.films.size,0);
  f.faults.save=false; f.run(f.job('finishIntake_').due);
  assert.equal(f.films.size,1);
  assert.equal(f.receipts().length,1);
  assert.equal(f.receipts()[0].bcc,'one@example.com,two@example.com');
  assert.equal(f.receipts()[0].cc,undefined);
  const film=[...f.films.values()][0];
  assert.equal(film.filmLink,'https://www.youtube.com/watch?v=Br006oI49SE');
  assert.equal(film.submissionReceivedEmailSent,true);
  for(let i=0;i<25;i++) f.submit('Test film '+i);
  assert.equal(f.native.size,1);
});
test('status update failure does not resend the receipt', () => {
  const f=fixture(); f.faults.update=true; f.submit();
  assert.equal(f.receipts().length,1);
  f.faults.update=false; f.run(f.job('finishIntake_').due);
  assert.equal(f.receipts().length,1);
  assert(f.job('processSubmission'));
});
test('automatic acceptance waits 12 hours and sends the canonical link only when live', () => {
  const f=fixture(); f.submit();
  const decision=f.job('processSubmission'); f.values.set('decision_'+decision.payloadKey,'accept');
  f.run(decision.due);
  const film=[...f.films.values()][0];
  const publish=f.job('publishAcceptedSubmission');
  assert.equal(publish.due-decision.due,12*3600000);
  assert.match(f.mail.find(m=>m.subject.includes('has been selected')).body,/in about 12 hours/);
  f.run(publish.due-1); assert(!film.live);
  f.run(publish.due); assert(film.live);
  assert(f.mail.some(m=>m.body.includes('film.html?id='+film.slug)));
});
test('rejection retries a temporary config outage, keeps its sender, and does not duplicate a message', () => {
  const f=fixture(); f.submit();
  const step=(id, delayAmount)=>({id,name:id,stepType:'custom',delayAmount,delayUnit:'hours',enabled:true,subject:id,body:'[FILM NAME]',senderName:'[RANDOM NAME]'});
  f.faults.arc={enabled:true,steps:[step('first',0),step('second',1)]};
  const decision=f.job('processSubmission'); f.values.set('decision_'+decision.payloadKey,'reject'); f.run(decision.due);
  const first=f.mail.find(m=>m.subject==='first'); assert(first);
  f.faults.config=true; f.run(f.job('processRejectionArcStep').due);
  assert(f.job('processRejectionArcStep')); assert(!f.mail.find(m=>m.subject==='second'));
  f.faults.config=false; f.run(f.job('processRejectionArcStep').due);
  const second=f.mail.filter(m=>m.subject==='second'); assert.equal(second.length,1); assert.equal(second[0].name,first.name);
  assert(!f.job('processRejectionArcStep'));
});
test('an acceptance step inside the rejection arc also waits 12 hours', () => {
  const f=fixture(); f.submit();
  f.faults.arc={enabled:true,steps:[
    {id:'first',name:'First',stepType:'custom',delayAmount:0,delayUnit:'hours',enabled:true,subject:'first',body:'test'},
    {id:'accept',name:'Acceptance',stepType:'acceptance_builtin',delayAmount:1,delayUnit:'hours',enabled:true}
  ]};
  const decision=f.job('processSubmission');
  f.values.set('decision_'+decision.payloadKey,'reject');
  f.run(decision.due);
  const arc=f.job('processRejectionArcStep'); f.run(arc.due);
  const publish=f.job('publishAcceptedSubmission');
  assert.equal(publish.due-arc.due,12*3600000);
  assert.match(f.mail.find(m=>m.subject.includes('has been selected')).body,/in about 12 hours/);
  f.run(publish.due);
  assert([...f.films.values()][0].live);
});
test('a film already manually published does not get a second decision or email', () => {
  const f=fixture(); f.submit();
  const film=[...f.films.values()][0]; Object.assign(film,{live:true,pending:false,accepted:true});
  f.run(f.job('processSubmission').due);
  assert(!f.job('publishAcceptedSubmission'));
  assert(!f.mail.some(m=>m.subject.includes('has been selected')));
});
