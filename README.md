# Shorts of the Year

A fully automated short film curation website with AI-generated reviews.

## Features

- 📽️ **Automatic Film Curation:** 99% acceptance rate with 1% rejection
- ✍️ **Auto-Generated Reviews:** Professional, curatorial reviews from 200+ template sentences
- 📧 **Email Automation:** Acceptance/rejection emails sent 24 hours after submission
- 🌐 **Self-Updating Website:** New films automatically appear on your site
- 📱 **Instagram Notifications:** Get notified with pre-written captions ready to post
- 💰 **100% Free Hosting:** Via GitHub Pages (just keep your domain registration)

## What's Included

### Website Files
- `index.html` - Homepage with featured film and grid
- `film.html` - Individual film pages with embedded video
- `store.html` - Merch page (sold out shorts joke)
- `submit.html` - Google Form embed page
- `films.json` - Film database (auto-updated)
- `css/style.css` - Dark, minimal design
- `js/main.js` - Homepage functionality
- `js/film.js` - Film page functionality

### Automation
- `google-apps-script.js` - Complete automation system with:
  - Form submission handler
  - 24-hour delay system
  - 99%/1% acceptance algorithm
  - Template sentence generator (50 openings, 100 middles, 50 closings)
  - Email system
  - GitHub integration
  - Instagram notifications

### Documentation
- `SETUP-GUIDE.md` - Complete step-by-step setup instructions

## Quick Start

See `SETUP-GUIDE.md` for detailed instructions.

1. Upload to GitHub Pages
2. Create Google Form
3. Set up Google Apps Script
4. Connect GoDaddy domain
5. Done!

## Template Review System

Reviews are generated from:
- **50 opening sentences** - Introduce the film and director
- **100 middle sentences** - Analyze technique, style, performances
- **50 closing sentences** - Conclude with impact and recommendation

This creates **millions of unique combinations** with a professional, curatorial tone.

## Tech Stack

- **Frontend:** Pure HTML, CSS, JavaScript (no frameworks, no build process)
- **Hosting:** GitHub Pages (free)
- **Automation:** Google Apps Script
- **Data Storage:** JSON file on GitHub
- **Email:** Gmail via Google Apps Script

## Customization

- **Acceptance Rate:** Change `ACCEPTANCE_RATE` in Google Apps Script
- **Review Templates:** Add more sentences to the arrays
- **Design:** Edit `css/style.css`
- **Email Text:** Modify email functions in Apps Script

## Cost

**$0/month**

Just maintain your GoDaddy domain registration (~$12-20/year).

## Support

All instructions are in `SETUP-GUIDE.md`. No coding knowledge required!

---

Built for automated short film curation with professional-quality reviews.
