# 🎬 SHORTS OF THE YEAR - START HERE!

Important: this file predates the current API + MongoDB + rejection-arc system.

Current source of truth:
- live site files in this repo
- Vercel API in `/softy-api-main`
- Google Apps Script in `/google-apps-script.js`

Use `/README.md` and `/CHECKLIST.md` first for the current setup model.

## 🎉 YOUR WEBSITE IS READY!

I've built you a complete, automated short film curation website that:

✅ **Accepts film submissions** via Google Form  
✅ **Waits 24 hours** automatically  
✅ **Accepts 99%** of films (rejects 1%)  
✅ **Generates professional reviews** from 200+ template sentences  
✅ **Sends acceptance/rejection emails** automatically  
✅ **Updates your website** automatically  
✅ **Notifies you for Instagram** with ready-to-post captions  
✅ **Hosts 100% FREE** on GitHub Pages  

---

## 📂 WHAT YOU GOT

### Website Files
- `index.html` - Homepage (featured film + grid)
- `film.html` - Individual film pages
- `store.html` - Merch page with "sold out shorts" joke
- `submit.html` - Submission form page
- `films.json` - Film database
- `css/` - Styling (dark, minimal aesthetic)
- `js/` - Functionality
- `images/` - Put your logos and clothing photos here

### Automation
- `google-apps-script.js` - The automation brain (form → email → website)

### Guides
- **📖 SETUP-GUIDE.md** ← **START WITH THIS!**
- `CHECKLIST.md` - Track your progress
- `README.md` - Project overview

---

## 🚀 QUICK START (1 HOUR TOTAL)

### Step 1: Read the Setup Guide (5 min)
Open **SETUP-GUIDE.md** - it has everything you need with screenshots-style instructions.

### Step 2: Follow the Setup (55 min)
1. Upload to GitHub Pages (15 min)
2. Create Google Form (10 min)  
3. Set up Google Apps Script (15 min)
4. Connect GoDaddy domain (10 min)
5. Test everything (5 min)

---

## 💡 KEY FEATURES

### Auto-Generated Reviews
Reviews are built from:
- **50 opening sentences** ("Director X brings us...", "In Film Title...")
- **100 middle sentences** (technical analysis, performances, style)
- **50 closing sentences** ("A filmmaker to watch", "An impressive achievement")

**This creates MILLIONS of unique combinations!**

Example generated review:
> "Sarah Chen brings us The Last Train, a poignant exploration through intimate cinematography and nuanced performances, while allowing moments of silence to speak volumes. The film showcases technical excellence with careful attention to detail. A confident work that announces a promising filmmaker."

### The Workflow
1. Filmmaker submits form
2. Google Apps Script waits 24 hours
3. System randomly decides: 99% accepted, 1% rejected
4. If accepted:
   - Generates unique review
   - Sends acceptance email to filmmaker
   - Adds film to website automatically
   - Sends YOU an Instagram notification with:
     - Film thumbnail URL
     - Ready-to-post caption
     - Link to film page
5. You just post to Instagram manually (30 seconds)

### Free Hosting
- GitHub Pages: $0/month (unlimited bandwidth)
- Google Apps Script: $0/month (free for this use)
- Total cost: **Just your domain** (~$12-20/year)

---

## 📋 YOUR CHECKLIST

Use `CHECKLIST.md` to track your setup progress!

---

## ❓ NEED HELP?

**The setup guide has:**
- Step-by-step instructions (like "click the green button")
- Troubleshooting section
- Exact settings to use
- What to do if things go wrong

**Everything is designed for non-coders!**

---

## 🎨 CUSTOMIZATION

Once it's working, you can:
- Change colors in `css/style.css`
- Add more review templates in Google Apps Script
- Adjust acceptance rate (99% → any number)
- Modify email text
- Add more form questions

---

## 📧 DAILY WORKFLOW (After Setup)

1. **Morning:** Check email for Instagram notifications
2. **Instagram:** Copy caption, post film thumbnail
3. **That's it!** Everything else is automatic

---

## 🎯 NEXT STEPS

1. **Open SETUP-GUIDE.md**
2. Follow along step-by-step
3. Use CHECKLIST.md to track progress
4. Your website will be live in ~1 hour!

---

## 📁 FILE STRUCTURE

```
shortsoftheyear/
├── index.html                 (Homepage)
├── film.html                  (Film pages)
├── store.html                 (Merch page)
├── submit.html                (Submission form)
├── films.json                 (Film database - auto-updated)
├── css/
│   └── style.css              (All styling)
├── js/
│   ├── main.js                (Homepage logic)
│   └── film.js                (Film page logic)
├── images/
│   └── README.md              (What images you need)
├── google-apps-script.js      (Automation code)
├── SETUP-GUIDE.md            ⭐ READ THIS FIRST
├── CHECKLIST.md               (Track your progress)
└── README.md                  (Project overview)
```

---

## 🎬 LET'S DO THIS!

**Open SETUP-GUIDE.md and let's get your website live!**

No coding knowledge needed - everything is explained step-by-step.

---

Questions? The SETUP-GUIDE.md troubleshooting section has you covered!

**Built with ❤️ for automated film curation**
