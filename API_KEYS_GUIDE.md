# API Keys & Credentials Setup Guide

This guide will walk you through obtaining all the necessary API keys and credentials for your StartupOps platform.

## 🔑 Required API Keys Overview

Your platform uses several external services:
- **Google OAuth** - User authentication with Google
- **Google Gemini AI** - AI-powered insights and recommendations
- **Cloudinary** - File upload and media management
- **SMTP Email** - Email notifications and OTP codes

## 1. 🔐 Google OAuth Setup

### Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create New Project**
   - Click "Select a project" dropdown
   - Click "New Project"
   - Enter project name: `StartupOps Platform`
   - Click "Create"

### Step 2: Enable Google+ API

1. **Navigate to APIs & Services**
   - In the left sidebar, click "APIs & Services" > "Library"
   
2. **Enable Required APIs**
   - Search for "Google+ API" and enable it
   - Search for "People API" and enable it (recommended)

### Step 3: Create OAuth Credentials

1. **Go to Credentials**
   - Click "APIs & Services" > "Credentials"
   
2. **Configure OAuth Consent Screen**
   - Click "OAuth consent screen"
   - Choose "External" (unless you have Google Workspace)
   - Fill required fields:
     - App name: `StartupOps Platform`
     - User support email: Your email
     - Developer contact: Your email
   - Click "Save and Continue"
   - Skip scopes for now, click "Save and Continue"
   - Add test users (your email), click "Save and Continue"

3. **Create OAuth Client ID**
   - Click "Credentials" > "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Name: `StartupOps Web Client`
   - Authorized redirect URIs:
     ```
     http://localhost:3001/api/auth/google/callback
     https://your-backend-domain.onrender.com/api/auth/google/callback
     ```
   - Click "Create"

4. **Copy Credentials**
   ```env
   GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

## 2. 🤖 Google Gemini AI Setup

### Step 1: Get Gemini API Key

1. **Visit Google AI Studio**
   - Go to: https://makersuite.google.com/app/apikey
   - Sign in with your Google account

2. **Create API Key**
   - Click "Create API Key"
   - Select your Google Cloud project (created above)
   - Click "Create API Key in existing project"
   - Copy the generated API key

3. **Add to Environment**
   ```env
   GEMINI_API_KEY="your-gemini-api-key"
   ```

### Alternative: Use Google Cloud Console

1. **Enable Generative AI API**
   - Go to Google Cloud Console
   - Navigate to "APIs & Services" > "Library"
   - Search for "Generative Language API"
   - Click "Enable"

2. **Create API Key**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated key
   - Optionally restrict the key to Generative Language API

## 3. ☁️ Cloudinary Setup (File Uploads)

### Step 1: Create Cloudinary Account

1. **Sign Up**
   - Visit: https://cloudinary.com/users/register/free
   - Create free account (generous free tier)

2. **Get Dashboard Credentials**
   - After signup, go to Dashboard
   - Find "Account Details" section
   - Copy the following:

   ```env
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   ```

### Step 2: Configure Upload Settings (Optional)

1. **Go to Settings**
   - Click gear icon > "Upload"
   - Configure upload presets if needed
   - Set file size limits and allowed formats

## 4. 📧 SMTP Email Setup

You have several options for email service:

### Option A: Gmail SMTP (Easiest)

1. **Enable 2-Factor Authentication**
   - Go to Google Account settings
   - Security > 2-Step Verification
   - Enable if not already enabled

2. **Generate App Password**
   - Go to Google Account > Security
   - Click "App passwords"
   - Select app: "Mail"
   - Select device: "Other" > "StartupOps"
   - Copy the 16-character password

3. **Configure Environment**
   ```env
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-16-character-app-password"
   SMTP_FROM="StartupOps <noreply@startupops.com>"
   ```

### Option B: SendGrid (Recommended for Production)

1. **Create SendGrid Account**
   - Visit: https://sendgrid.com/
   - Sign up for free account

2. **Create API Key**
   - Go to Settings > API Keys
   - Click "Create API Key"
   - Choose "Restricted Access"
   - Give permissions: Mail Send
   - Copy the API key

3. **Configure Environment**
   ```env
   SMTP_HOST="smtp.sendgrid.net"
   SMTP_PORT=587
   SMTP_USER="apikey"
   SMTP_PASS="your-sendgrid-api-key"
   SMTP_FROM="StartupOps <noreply@yourdomain.com>"
   ```

### Option C: Mailgun

1. **Create Mailgun Account**
   - Visit: https://www.mailgun.com/
   - Sign up for free account

2. **Get SMTP Credentials**
   - Go to Sending > Domain settings
   - Find SMTP credentials section
   - Copy username and password

3. **Configure Environment**
   ```env
   SMTP_HOST="smtp.mailgun.org"
   SMTP_PORT=587
   SMTP_USER="your-mailgun-username"
   SMTP_PASS="your-mailgun-password"
   SMTP_FROM="StartupOps <noreply@yourdomain.com>"
   ```

## 5. 🗄️ Database Setup

### Option A: Local PostgreSQL

1. **Install PostgreSQL**
   ```bash
   # macOS
   brew install postgresql
   brew services start postgresql
   
   # Create database
   createdb startupops
   ```

2. **Configure Environment**
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/startupops?schema=public"
   ```

### Option B: Render PostgreSQL (Recommended)

1. **Create Render Account**
   - Visit: https://render.com/
   - Sign up with GitHub

2. **Create PostgreSQL Database**
   - Click "New" > "PostgreSQL"
   - Name: `startupops-db`
   - Choose free tier
   - Click "Create Database"

3. **Get Connection String**
   - Copy "External Database URL"
   - Add to environment:
   ```env
   DATABASE_URL="your-render-postgresql-url"
   ```

### Option C: Railway

1. **Create Railway Account**
   - Visit: https://railway.app/
   - Sign up with GitHub

2. **Deploy PostgreSQL**
   - Click "New Project"
   - Choose "Provision PostgreSQL"
   - Copy connection string

## 6. 🔒 Security Configuration

### JWT Secret

Generate a secure JWT secret:

```bash
# Generate random string
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Add to environment:
```env
JWT_SECRET="your-generated-secret-key"
```

## 7. 📝 Complete Environment File

Here's your complete `server/.env` file with all keys:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/startupops?schema=public"

# Security
JWT_SECRET="your-generated-jwt-secret"

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3001/api/auth/google/callback"

# Email SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="StartupOps <noreply@startupops.com>"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Google Gemini AI
GEMINI_API_KEY="your-gemini-api-key"
```

## 8. 🧪 Testing Your Setup

### Test Database Connection
```bash
cd server
npm run dev
# Look for "✅ Database connected successfully"
```

### Test API Health
```bash
curl http://localhost:3001/api/health
# Should return: {"status":"ok","database":"connected"}
```

### Test Google OAuth
1. Start your servers
2. Go to `http://localhost:3000/login`
3. Click "Sign in with Google"
4. Should redirect to Google OAuth flow

### Test Email (Optional)
- Try user registration
- Check if OTP email is sent

## 🚨 Security Best Practices

1. **Never commit API keys to Git**
   - Add `.env` to `.gitignore`
   - Use different keys for development/production

2. **Restrict API Keys**
   - Limit Google API keys to specific APIs
   - Set up domain restrictions for production

3. **Use Environment Variables**
   - Never hardcode credentials in source code
   - Use different credentials for each environment

4. **Regular Key Rotation**
   - Rotate API keys periodically
   - Monitor usage in respective dashboards

## 🔧 Troubleshooting

### Google OAuth Issues
- Verify redirect URIs match exactly
- Check OAuth consent screen is configured
- Ensure APIs are enabled

### Email Issues
- Verify SMTP credentials
- Check if 2FA is enabled for Gmail
- Test with a simple email client first

### Database Issues
- Verify connection string format
- Check if database exists
- Ensure PostgreSQL is running

### API Key Issues
- Check for extra spaces or quotes
- Verify keys are active in respective dashboards
- Test keys with simple API calls

---

**Need Help?** Check the main SETUP_GUIDE.md for additional troubleshooting steps.