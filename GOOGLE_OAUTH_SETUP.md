# Google OAuth Setup Guide

This guide explains how to enable Google login in your system.

## Prerequisites

Make sure you have installed the required dependencies:

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
npm install --prefix client
```

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Click "Enable APIs and Services"
   - Search for "Google+ API"
   - Click "Enable"
4. Create OAuth 2.0 Credentials:
   - Go to "Credentials" in the left sidebar
   - Click "Create Credentials" → "OAuth client ID"
   - Select "Web application"
   - Add Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `http://localhost:5000` (for server)
     - Your production domain
   - Add Authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback` (for development)
     - Your production callback URL
   - Click "Create"
   - Copy your **Client ID** and **Client Secret**

## Step 2: Configure Environment Variables

### Backend (.env in root directory)

Create or update your `.env` file with:

```env
# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string

# JWT Configuration
JWT_SECRET=your_jwt_secret

# Port
PORT=5000

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

### Frontend (.env.local in client directory)

Create or update your `client/.env.local` file with:

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

## Step 3: Database Changes

The User model has been updated with the following new fields:

- `authProvider`: Tracks whether user registered via 'email' or 'google'
- `googleId`: Stores the unique Google user ID
- `googleEmail`: Stores the Google-associated email

These fields are automatically set when a user logs in with Google.

## Step 4: Run the Application

```bash
# From the root directory
npm run dev
```

This will start both the backend server (port 5000) and frontend (port 3000).

## How Google Login Works

### Frontend Flow:
1. User clicks the Google Login button
2. Google OAuth provider displays the login dialog
3. User authenticates with their Google account
4. Google returns a credential token to the frontend
5. Frontend sends the token to `/api/auth/google-login` endpoint

### Backend Flow:
1. Server receives the Google token
2. Verifies the token with Google's servers
3. Extracts user information (email, name, profile picture)
4. Checks if user exists:
   - **If Google ID exists**: Returns existing user
   - **If email exists**: Links Google account to existing email account
   - **If new user**: Creates new account with auto-approval
5. Generates JWT token for session
6. Returns user data and token to frontend

### User Database Updates:

**New Google User:**
- `authProvider` = 'google'
- `googleId` = Google's unique user ID
- `googleEmail` = User's Google email
- `status` = 'active' (auto-approved)
- `avatar` = Google profile picture (if available)

**Existing Email User Adding Google:**
- `authProvider` = 'google'
- `googleId` = Google's unique user ID
- `googleEmail` = Google email
- Existing data preserved

## API Endpoints

### Google Login
**POST** `/api/auth/google-login`

Request:
```json
{
  "token": "google_id_token_from_frontend"
}
```

Response (Success):
```json
{
  "message": "Google login successful",
  "token": "jwt_token",
  "id": "user_id",
  "name": "User Name",
  "email": "user@example.com",
  "role": "Student"
}
```

Response (Error):
```json
{
  "message": "Google authentication failed"
}
```

## Important Notes

1. **Password Handling**: Google OAuth users don't have passwords. The system stores a placeholder "oauth_user" as password.

2. **Auto-Approval**: Google users are automatically approved (status = 'active') upon first login.

3. **Existing Users**: If an email already exists in the system from email/password registration, the Google account gets linked to the existing user.

4. **Avatar**: If a user doesn't have an avatar, Google's profile picture is automatically set.

## Troubleshooting

### "Token is invalid or expired"
- Make sure your `GOOGLE_CLIENT_ID` matches the one used in the frontend
- Verify the token is being sent correctly from frontend
- Check that your Google OAuth credentials are still valid

### "Callback URL mismatch"
- Ensure `GOOGLE_CALLBACK_URL` in `.env` matches the one configured in Google Cloud Console
- Check for trailing slashes or protocol mismatches (http vs https)

### CORS Issues
- Make sure your frontend and backend are running on correct ports
- Check `VITE_API_URL` in `client/.env.local`

### "VITE_GOOGLE_CLIENT_ID is not set"
- Ensure `client/.env.local` exists with correct environment variables
- Restart the frontend dev server after adding env variables

## Production Deployment

Before deploying to production:

1. Update `GOOGLE_CALLBACK_URL` to your production domain
2. Add production domain to Google Cloud Console authorized origins and redirect URIs
3. Update `VITE_API_URL` in production environment
4. Use environment variables from your deployment platform
5. Ensure HTTPS is enabled for production URLs

## Testing

To test Google login locally:

1. Make sure both backend and frontend are running
2. Go to `http://localhost:3000/login`
3. Click the Google login button
4. Sign in with your Google account
5. You should be redirected to the home page with a JWT token stored in localStorage
