# SHORTS OF THE YEAR - COMPLETE SETUP GUIDE

This guide will walk you through setting up your entire website system. No coding experience needed!

---

## 🎯 WHAT YOU'LL BUILD

A fully automated short film showcase website where:
- Filmmakers submit via Google Form
- System waits 24 hours, then auto-accepts 99% of submissions
- Auto-generates professional film reviews
- Sends acceptance/rejection emails automatically
- Updates your website automatically
- Sends you Instagram posting notifications
- **All hosted 100% FREE** (just keep your GoDaddy domain)

---

## 📋 TABLE OF CONTENTS

1. [GitHub Pages Setup](#step-1-github-pages-setup) (15 min)
2. [Google Form Setup](#step-2-google-form-setup) (10 min)
3. [Google Apps Script Setup](#step-3-google-apps-script-setup) (15 min)
4. [GoDaddy Domain Connection](#step-4-godaddy-domain-connection) (10 min)
5. [Testing Everything](#step-5-testing-everything) (5 min)
6. [Adding Merch Photos](#step-6-adding-merch-photos) (5 min)

**Total Time: About 1 hour**

---

## STEP 1: GITHUB PAGES SETUP

GitHub Pages will host your website for free.

### 1.1 Create GitHub Account

1. Go to https://github.com
2. Click "Sign up" (top right)
3. Choose a username (can be anything, like "shortsoftheyear")
4. Enter your email and create a password
5. Verify your account via email

### 1.2 Create New Repository

1. Once logged in, click the "+" icon (top right)
2. Click "New repository"
3. Name it: `shortsoftheyear` (lowercase, no spaces)
4. Make it **Public** (required for free hosting)
5. Check "Add a README file"
6. Click "Create repository"

### 1.3 Upload Your Website Files

1. In your new repository, click "Add file" → "Upload files"
2. Drag and drop ALL the website files I created for you:
   - index.html
   - film.html
   - store.html
   - submit.html
   - films.json
   - css/ folder (with style.css inside)
   - js/ folder (with main.js and film.js inside)
   - images/ folder (for logos, favicons - you'll add these)

3. In the "Commit changes" box at bottom, type: "Initial website upload"
4. Click "Commit changes"

### 1.4 Enable GitHub Pages

1. In your repository, click "Settings" (top menu)
2. Scroll down the left sidebar and click "Pages"
3. Under "Source", select "Deploy from a branch"
4. Under "Branch", select "main" and folder "/ (root)"
5. Click "Save"
6. Wait 1-2 minutes
7. Refresh the page - you'll see: "Your site is live at https://YOUR-USERNAME.github.io/shortsoftheyear/"

**✅ Your website is now live!** Visit that URL to see it.

### 1.5 Get GitHub Personal Access Token (for automation)

1. Click your profile picture (top right) → Settings
2. Scroll to bottom of left sidebar → "Developer settings"
3. Click "Personal access tokens" → "Tokens (classic)"
4. Click "Generate new token" → "Generate new token (classic)"
5. Name it: "Shorts of the Year Automation"
6. Check the box for: **repo** (this gives full repository access)
7. Scroll down and click "Generate token"
8. **IMPORTANT:** Copy this token and save it somewhere safe! You'll need it for the Google Apps Script. You can't see it again!

---

## STEP 2: GOOGLE FORM SETUP

### 2.1 Create the Form

1. Go to https://forms.google.com
2. Click "+ Blank" to create new form
3. Title it: "Shorts of the Year - Film Submission"

### 2.2 Add Form Questions

Add these questions in order (all are "Short answer" unless noted):

1. **Project Title** (Short answer, Required)
2. **Logline** (Paragraph, Required)
3. **Director** (Short answer, Required)
4. **Writer** (Short answer, Required)
5. **Producer** (Short answer, Optional)
6. **Genre** (Dropdown, Required)
   - Options: Drama, Comedy, Documentary, Horror, Sci-Fi, Thriller, Animation, Experimental
7. **Runtime** (Short answer, Required)
   - Add help text: "Format: MM:SS (example: 12:30)"
8. **Online Premiere?** (Multiple choice, Required)
   - Options: Yes, No
9. **Director's Statement** (Paragraph, Optional)
10. **Email address** (Short answer, Required)
11. **Link to Film** (Short answer, Required)
    - Add help text: "Vimeo or YouTube URL"
12. **Password** (Short answer, Optional)
    - Add help text: "If your film is password-protected"
13. **Twitter/Instagram handle** (Short answer, Optional)

### 2.3 Get Form Embed Code

1. Click the "Send" button (top right)
2. Click the "<>" icon (Embed HTML)
3. Copy the URL that looks like: `https://docs.google.com/forms/d/e/FORM_ID/viewform`
4. Open your `submit.html` file
5. Find the line with: `src="https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform?embedded=true"`
6. Replace `YOUR_FORM_ID` with your actual form ID

---

## STEP 3: GOOGLE APPS SCRIPT SETUP

This is the automation brain!

### 3.1 Open Script Editor

1. In your Google Form, click the three dots (⋮) → "Script editor"
2. This opens a new tab with Google Apps Script
3. Delete any existing code in the editor

### 3.2 Paste the Automation Code

1. Copy ALL the code from `google-apps-script.js` file I created
2. Paste it into the Script Editor
3. Click "File" → "Save"
4. Name the project: "Shorts of the Year Automation"

### 3.3 Configure the Settings

Find the `CONFIG` object at the top of the code and update:

```javascript
const CONFIG = {
  GITHUB_TOKEN: 'paste_your_github_token_here',
  GITHUB_REPO: 'YOUR-USERNAME/shortsoftheyear', // Replace with your GitHub username
  GITHUB_FILE_PATH: 'films.json',
  EMAIL_FROM: 'shortsoftheyear@gmail.com',
  ACCEPTANCE_RATE: 0.99,
  DELAY_HOURS: 24,
  INSTAGRAM_NOTIFICATION_EMAIL: 'your-email@example.com' // Your email
};
```

**What to change:**
- `GITHUB_TOKEN`: Paste the token you saved from Step 1.5
- `GITHUB_REPO`: Replace `YOUR-USERNAME` with your GitHub username
- `INSTAGRAM_NOTIFICATION_EMAIL`: Your email address

### 3.4 Set Up Form Trigger

1. Click the clock icon ⏰ (Triggers) in the left sidebar
2. Click "+ Add Trigger" (bottom right)
3. Configure:
   - Choose function: `onFormSubmit`
   - Choose deployment: `Head`
   - Event source: `From form`
   - Event type: `On form submit`
4. Click "Save"
5. Google will ask for permissions:
   - Click "Review permissions"
   - Choose your Google account
   - Click "Advanced" → "Go to Shorts of the Year Automation (unsafe)"
   - Click "Allow"

### 3.5 Test the Script

1. In the Script Editor, select `onFormSubmit` from the function dropdown
2. Click "Run" (▶️ button)
3. Check for errors in the "Execution log" at bottom
4. If you see "Completed", you're good! If errors, let me know.

---

## STEP 4: GODADDY DOMAIN CONNECTION

Connect your shortsoftheyear.com domain to GitHub Pages.

### 4.1 Login to GoDaddy

1. Go to https://www.godaddy.com
2. Click "Sign In"
3. Enter your credentials

### 4.2 Access DNS Settings

1. Click your profile icon → "My Products"
2. Find "shortsoftheyear.com" in your domain list
3. Click the three dots (⋯) → "Manage DNS"

### 4.3 Add DNS Records

You need to add 5 records total:

**A Records (4 total):**
1. Click "Add" button
2. Type: A
3. Name: @
4. Value: `185.199.108.153`
5. TTL: 600 seconds
6. Click "Save"

Repeat for these 3 more A records (same Name "@", different Values):
- `185.199.109.153`
- `185.199.110.153`
- `185.199.111.153`

**CNAME Record (1 total):**
1. Click "Add"
2. Type: CNAME
3. Name: www
4. Value: `YOUR-USERNAME.github.io` (replace with your GitHub username)
5. TTL: 1 Hour
6. Click "Save"

### 4.4 Add Custom Domain to GitHub

1. Go back to your GitHub repository
2. Click "Settings" → "Pages"
3. Under "Custom domain", enter: `shortsoftheyear.com`
4. Click "Save"
5. Check "Enforce HTTPS" (might take a few minutes to appear)

### 4.5 Wait for DNS Propagation

- DNS changes take 1-48 hours (usually 2-4 hours)
- Check status at: https://www.whatsmydns.net/#A/shortsoftheyear.com
- When you see the IP addresses, your domain is connected!

---

## STEP 5: TESTING EVERYTHING

### 5.1 Test Form Submission

1. Go to your Google Form
2. Click "Preview" (eye icon)
3. Fill out the form with test data
4. Submit it
5. Check your "Execution log" in Google Apps Script - you should see the submission logged

### 5.2 Test Email (Optional - Skip 24hr Wait)

To test immediately without waiting 24 hours:

1. In Google Apps Script, find the line: `DELAY_HOURS: 24,`
2. Change it to: `DELAY_HOURS: 0.01,` (this means ~36 seconds)
3. Submit another test form
4. Wait 1 minute
5. Check your email - you should receive an acceptance email!
6. **Remember to change it back to 24 after testing**

### 5.3 Check Website Update

1. Go to your GitHub repository
2. Check if `films.json` was updated (should show new film)
3. Visit your website: https://shortsoftheyear.com
4. The new film should appear!

---

## STEP 6: ADDING MERCH PHOTOS

### 6.1 Add Your Shorts Photos

1. Save your clothing photos as: `short1.jpg`, `short2.jpg`, etc.
2. In GitHub repository, go to `images/` folder
3. Click "Add file" → "Upload files"
4. Upload your clothing photos
5. Click "Commit changes"

### 6.2 Update Store Page

1. In GitHub, open `store.html`
2. Click the pencil icon ✏️ (Edit)
3. Find each product div and update:
   ```html
   <div class="product-image" style="background-image: url('images/short1.jpg');"></div>
   ```
4. Remove the placeholder text
5. Click "Commit changes"

---

## 🎉 YOU'RE DONE!

Your website is now:
- ✅ Live at shortsoftheyear.com
- ✅ Accepting film submissions
- ✅ Auto-generating reviews
- ✅ Sending emails automatically
- ✅ Updating itself automatically
- ✅ 100% free hosting

---

## 📧 DAILY WORKFLOW

1. **Morning:** Check your email for Instagram notifications
2. **Post to Instagram:** Copy the suggested caption, download the thumbnail, post!
3. **That's it!** Everything else is automated.

---

## ❓ TROUBLESHOOTING

**Form submissions not triggering emails:**
- Check Google Apps Script "Executions" tab for errors
- Make sure the trigger is set up correctly
- Check spam folder for emails

**Website not updating:**
- Check GitHub token is correct and has "repo" permissions
- Check `films.json` in GitHub to see if it updated
- GitHub Pages can take 1-2 minutes to rebuild

**Domain not working:**
- DNS can take up to 48 hours
- Check DNS propagation at whatsmydns.net
- Make sure CNAME file exists in GitHub repo

**Need help?**
- Check the Google Apps Script execution log for detailed errors
- Make sure all CONFIG values are set correctly
- Verify your GitHub token hasn't expired

---

## 🔧 ADVANCED: CUSTOMIZATION

**To change acceptance rate:**
- In Google Apps Script, change `ACCEPTANCE_RATE: 0.99` to any value (0.90 = 90%, etc.)

**To add more template sentences:**
- Edit the sentence arrays in Google Apps Script
- More sentences = more unique combinations

**To change email wording:**
- Edit `sendAcceptanceEmail()` and `sendRejectionEmail()` functions

**To change design:**
- Edit `css/style.css` in GitHub
- Colors, fonts, spacing - all in this file

---

## 📝 MAINTENANCE

**Monthly:**
- Check that emails are still sending
- Review any rejected films (check spam folder)

**When GitHub token expires (every ~1 year):**
- Generate a new one (Step 1.5)
- Update it in Google Apps Script CONFIG

---

**That's everything! Your automated film curation website is ready to go! 🎬**
