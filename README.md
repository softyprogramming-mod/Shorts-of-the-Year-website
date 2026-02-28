# Shorts of the Year

Shorts of the Year is a static site front-end with a Vercel API and Google Apps Script automation layer.

## Current Architecture

- Static site on GitHub Pages:
  - `/Users/willkempner/Dropbox/Projects/WEBSITES/Shorts-of-the-Year-website-main/index.html`
  - `/Users/willkempner/Dropbox/Projects/WEBSITES/Shorts-of-the-Year-website-main/film.html`
  - `/Users/willkempner/Dropbox/Projects/WEBSITES/Shorts-of-the-Year-website-main/store.html`
  - `/Users/willkempner/Dropbox/Projects/WEBSITES/Shorts-of-the-Year-website-main/submit.html`
  - `/Users/willkempner/Dropbox/Projects/WEBSITES/Shorts-of-the-Year-website-main/admin.html`
- API on Vercel:
  - `/Users/willkempner/Dropbox/Projects/WEBSITES/Shorts-of-the-Year-website-main/softy-api-main/api/admin.js`
  - `/Users/willkempner/Dropbox/Projects/WEBSITES/Shorts-of-the-Year-website-main/softy-api-main/api/films.js`
- Automation in Google Apps Script:
  - `/Users/willkempner/Dropbox/Projects/WEBSITES/Shorts-of-the-Year-website-main/google-apps-script.js`
- MongoDB is the source of truth for films, submissions, admin settings, and ordering.

## Current Feature Set

- Homepage hero + film grid sourced from the live API
- Individual film pages with Vimeo/YouTube support
- Store page with lightbox product viewing
- Embedded Google Form submission page
- Admin panel with:
  - secure password verification through API
  - films list, edit, add, delete, show/hide
  - drag reordering of live films
  - pending submissions review
  - full read-only submission details
  - review generation
  - rejection arc editor
  - rejection tracker with force-next and cancel actions
- Automated review generation in:
  - Apps Script
  - admin API
  - admin fallback UI
- Acceptance flow:
  - random decision delay between 1 and 3 days after submission
  - acceptance email
  - delayed publish 12 hours later
  - “now live on SoftY” email after publish
- Rejection flow:
  - configurable rejection arc stored through admin
  - consistent `[RANDOM NAME]` per arc
  - `[FILM NAME]` and `[SUBMITTERS NAME]` token replacement

## Important Deployment Surfaces

If you change these files, deploy them in the matching place:

- Static site files:
  - publish the repo to GitHub Pages
- API files:
  - redeploy the Vercel project in `/Users/willkempner/Dropbox/Projects/WEBSITES/Shorts-of-the-Year-website-main/softy-api-main`
- Apps Script:
  - save the script
  - redeploy the Apps Script Web App when webhook behavior changes

## Important Secrets / Settings

Apps Script Script Properties:

- `API_SECRET`
- `ADMIN_PASSWORD`
- `WEBHOOK_SECRET`

Vercel Environment Variables:

- `MONGODB_URI`
- `API_SECRET`
- `ADMIN_PASSWORD`
- `ALLOWED_ORIGINS`
- `APPS_SCRIPT_WEBHOOK_URL`
- `APPS_SCRIPT_WEBHOOK_SECRET`

## Operational Notes

- Keep exactly one `onFormSubmit` trigger in Apps Script.
- Do not manually run `onFormSubmit` from the Apps Script editor.
- If Apps Script webhook logic changes, redeploy the Web App or the live `/exec` endpoint will still run old code.
- Existing live films are ordered by `sortOrder` first; the top live film becomes the homepage hero.

## Docs

- `/Users/willkempner/Dropbox/Projects/WEBSITES/Shorts-of-the-Year-website-main/SETUP-GUIDE.md`
- `/Users/willkempner/Dropbox/Projects/WEBSITES/Shorts-of-the-Year-website-main/START-HERE.md`
- `/Users/willkempner/Dropbox/Projects/WEBSITES/Shorts-of-the-Year-website-main/CHECKLIST.md`
