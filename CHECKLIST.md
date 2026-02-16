# SETUP CHECKLIST

Use this to track your progress!

## ☐ STEP 1: GitHub Setup (15 min)
- [ ] Create GitHub account
- [ ] Create new repository named "shortsoftheyear"
- [ ] Upload all website files
- [ ] Enable GitHub Pages in Settings
- [ ] Get Personal Access Token
- [ ] Save token somewhere safe

## ☐ STEP 2: Google Form (10 min)
- [ ] Create form at forms.google.com
- [ ] Add all 13 questions
- [ ] Get form embed URL
- [ ] Update submit.html with form URL
- [ ] Test form by filling it out once

## ☐ STEP 3: Google Apps Script (15 min)
- [ ] Open Script Editor from form
- [ ] Paste automation code
- [ ] Update CONFIG with GitHub token
- [ ] Update CONFIG with GitHub username
- [ ] Update CONFIG with your email
- [ ] Save the script
- [ ] Set up onFormSubmit trigger
- [ ] Grant permissions
- [ ] Test script runs without errors

## ☐ STEP 4: GoDaddy Domain (10 min)
- [ ] Login to GoDaddy
- [ ] Go to DNS Management for shortsoftheyear.com
- [ ] Add 4 A records (185.199.108-111.153)
- [ ] Add 1 CNAME record (www → your-username.github.io)
- [ ] Add custom domain in GitHub Pages settings
- [ ] Enable HTTPS
- [ ] Wait for DNS propagation (check whatsmydns.net)

## ☐ STEP 5: Testing (5 min)
- [ ] Submit test form
- [ ] Check Google Apps Script execution log
- [ ] Wait for email (or reduce delay for testing)
- [ ] Check films.json updated on GitHub
- [ ] Visit shortsoftheyear.com to see new film

## ☐ STEP 6: Merch Photos (5 min)
- [ ] Upload clothing photos to images/ folder
- [ ] Edit store.html to reference photos
- [ ] Check store page looks good

## ☐ FINAL CHECKS
- [ ] Website loads at shortsoftheyear.com
- [ ] Form submissions work
- [ ] Emails arrive
- [ ] Films appear on website
- [ ] Instagram notifications arrive
- [ ] Store page shows your photos

---

## Quick Reference

**GitHub Repo URL:** https://github.com/YOUR-USERNAME/shortsoftheyear
**Website URL:** https://shortsoftheyear.com
**Form URL:** [Get from Google Forms]
**Apps Script:** [Get from Google Forms → Script Editor]

**Important Files:**
- `films.json` - Film database
- `google-apps-script.js` - Automation code
- `SETUP-GUIDE.md` - Detailed instructions

**Key Settings (in Google Apps Script CONFIG):**
- GITHUB_TOKEN: [Your token]
- GITHUB_REPO: [Your username]/shortsoftheyear
- EMAIL_FROM: shortsoftheyear@gmail.com
- ACCEPTANCE_RATE: 0.99 (99%)
- DELAY_HOURS: 24
- INSTAGRAM_NOTIFICATION_EMAIL: [Your email]

---

**Stuck?** Check SETUP-GUIDE.md troubleshooting section!
