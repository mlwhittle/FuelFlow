# 🔑 Google Fit Setup Instructions

Follow these steps to get your Google Cloud OAuth Client ID (takes ~2 minutes):

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: **"FuelFlow"**
4. Click **"Create"**

## Step 2: Enable Google Fit API

1. In the search bar, type **"Google Fit API"**
2. Click on **"Google Fit API"**
3. Click **"Enable"**

## Step 3: Create OAuth Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. If prompted, click **"Configure Consent Screen"**:
   - Select **"External"** → Click **"Create"**
   - App name: **"FuelFlow"**
   - User support email: **your email**
   - Developer contact: **your email**
   - Click **"Save and Continue"** (skip optional fields)
   - Click **"Save and Continue"** on Scopes page
   - Click **"Save and Continue"** on Test users page
   - Click **"Back to Dashboard"**

4. Go back to **"Credentials"** → **"+ Create Credentials"** → **"OAuth client ID"**
5. Application type: **"Web application"**
6. Name: **"FuelFlow Web"**
7. **Authorized JavaScript origins:**
   - Click **"+ Add URI"**
   - Add: `http://localhost:5174`
   - Add: `http://localhost:5173` (backup)
8. **Authorized redirect URIs:**
   - Click **"+ Add URI"**
   - Add: `http://localhost:5174`
9. Click **"Create"**

## Step 4: Copy Your Client ID

1. A popup will show your **Client ID** - it looks like:
   ```
   123456789-abcdefghijk.apps.googleusercontent.com
   ```
2. **Copy this entire Client ID**

## Step 5: Add Client ID to FuelFlow

1. Open the file: `src/services/googleFitService.js`
2. Find line 5:
   ```javascript
   const GOOGLE_CLIENT_ID = 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com';
   ```
3. Replace `YOUR_CLIENT_ID_HERE.apps.googleusercontent.com` with your actual Client ID
4. Save the file

## ✅ Done!

Restart your dev server and the Google Fit integration will work!

---

## 📝 Quick Reference

**Google Cloud Console:** https://console.cloud.google.com/
**Your Project:** https://console.cloud.google.com/apis/dashboard
**Credentials:** https://console.cloud.google.com/apis/credentials

---

## 🔒 Security Note

- Your Client ID is safe to commit to GitHub (it's public)
- Never share your Client Secret (not needed for web apps)
- The OAuth flow keeps your Google account secure
