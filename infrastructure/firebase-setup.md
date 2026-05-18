# Firebase Project Setup Guide

Follow these steps to set up Firebase Authentication for the job search platform.

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project**
3. Project name: `jobsearch-se4458`
4. Disable Google Analytics (not needed for this project)
5. Click **Create project**

## 2. Enable Authentication Providers

1. In the Firebase Console, navigate to **Build > Authentication**
2. Click **Get started**
3. Go to the **Sign-in method** tab

### Email/Password Provider

1. Click **Email/Password**
2. Toggle **Enable** to ON
3. Leave **Email link (passwordless sign-in)** disabled
4. Click **Save**

### Google Provider

1. Click **Add new provider > Google**
2. Toggle **Enable** to ON
3. Set the **Project support email** to your email address
4. Click **Save**

## 3. Register Web Application

1. In the Firebase Console, go to **Project Overview**
2. Click the **Web** icon (`</>`) to add a web app
3. App nickname: `jobsearch-frontend`
4. Do NOT enable Firebase Hosting
5. Click **Register app**
6. Copy the `firebaseConfig` object — you will need these values for the frontend `.env`:

```
VITE_FIREBASE_API_KEY=<apiKey>
VITE_FIREBASE_AUTH_DOMAIN=<authDomain>
VITE_FIREBASE_PROJECT_ID=<projectId>
VITE_FIREBASE_APP_ID=<appId>
```

## 4. Generate Service Account Key (for server-side JWT verification)

1. Go to **Project Settings > Service accounts**
2. Select **Firebase Admin SDK**
3. Language: Java (for Spring Boot services) or Node.js (for Node services)
4. Click **Generate new private key**
5. Download the JSON file
6. **NEVER commit this file to Git** — it is in `.gitignore`

### Using the Service Account Key

There are two supported methods:

**Method A — File path (local development):**
```
FIREBASE_CREDENTIALS_PATH=/path/to/serviceAccountKey.json
```

**Method B — Raw JSON (Azure App Service):**
```
FIREBASE_CREDENTIALS_JSON={"type":"service_account","project_id":"...","private_key":"..."}
```

Set the entire JSON content as a single-line environment variable in Azure App Service configuration.

## 5. Create Test Users

For development and grading, create a few test users:

1. Go to **Authentication > Users**
2. Click **Add user**
3. Create the following test accounts:

| Email | Password | Notes |
|---|---|---|
| admin@jobsearch.com | Test1234! | Will be assigned ADMIN role in the database |
| company@jobsearch.com | Test1234! | Will be assigned COMPANY role |
| user@jobsearch.com | Test1234! | Default USER role |

Note the **User UID** for each — you will seed these into the PostgreSQL `users` table with the appropriate roles.

## 6. Security Rules

No Firestore or Storage rules are needed. This project only uses Firebase Authentication (no Firestore, no Storage).

## Summary

| Item | Value |
|---|---|
| Project name | jobsearch-se4458 |
| Auth providers | Email/Password, Google |
| Web app name | jobsearch-frontend |
| Service account JSON | Downloaded, stored securely |
| Test users | 3 (admin, company, user) |
