# Setup Checklist

Use this against the current stack, not the older `films.json` / GitHub-token workflow.

## Static Site

- [ ] GitHub Pages is publishing the repo root from `main`
- [ ] Custom domain is configured in GitHub Pages
- [ ] DNS records point to GitHub Pages correctly
- [ ] Homepage loads
- [ ] Film pages load
- [ ] Store page loads
- [ ] Submit page loads
- [ ] Admin page loads

## Vercel API

- [ ] Vercel project for `/softy-api-main` is deployed
- [ ] `MONGODB_URI` is set
- [ ] `API_SECRET` is set
- [ ] `ADMIN_PASSWORD` is set
- [ ] `ALLOWED_ORIGINS` is set
- [ ] `APPS_SCRIPT_WEBHOOK_URL` is set
- [ ] `APPS_SCRIPT_WEBHOOK_SECRET` is set

## Google Apps Script

- [ ] Latest `/google-apps-script.js` is saved
- [ ] Script Properties include:
  - [ ] `API_SECRET`
  - [ ] `ADMIN_PASSWORD`
  - [ ] `WEBHOOK_SECRET`
- [ ] Exactly one `onFormSubmit` trigger exists
- [ ] Web App is deployed as:
  - [ ] `Execute as: Me`
  - [ ] `Who has access: Anyone`
- [ ] Web App `/exec` URL matches Vercel `APPS_SCRIPT_WEBHOOK_URL`

## Submission / Approval Flow

- [ ] Test submission appears in Admin `Submissions`
- [ ] Acceptance email sends
- [ ] Film publishes 12 hours after acceptance email
- [ ] “Film is now live on SoftY” email sends
- [ ] New accepted film rises to the top live position

## Rejection Arc

- [ ] Rejection Arc config loads in admin
- [ ] `Enable custom rejection arc` is set correctly
- [ ] Rejection Tracker loads without webhook errors
- [ ] Rejecting a submission starts the arc
- [ ] Active arc appears in `Rejection Tracker`
- [ ] `Force Next` works
- [ ] `Cancel Arc` works

## Admin

- [ ] Films tab loads
- [ ] Add film works
- [ ] Edit/save works
- [ ] Generate review works
- [ ] Drag reorder works
- [ ] Submissions view button works
- [ ] Rejection Arc editor saves
- [ ] Rejection Tracker updates

## Operational Safety

- [ ] Do not manually run `onFormSubmit`
- [ ] If webhook code changes, redeploy the Apps Script Web App
- [ ] If API code changes, redeploy Vercel
- [ ] If frontend code changes, republish GitHub Pages
