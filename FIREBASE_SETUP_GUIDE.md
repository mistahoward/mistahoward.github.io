# Firebase Setup Guide for Comments System

## 🔧 Required Environment Variables

### Frontend (.env file in frontend directory)
```bash
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Backend (.env file in backend directory)
```bash
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"
```

## 📋 Firebase Project Setup Steps

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "portfolio-comments")
4. Follow setup wizard

### 2. Enable GitHub Authentication
1. In Firebase Console, go to Authentication → Sign-in method
2. Click on "GitHub" provider
3. Enable it and add your GitHub OAuth App credentials
4. Add authorized domains (your domain + localhost for development)

### 3. Create Web App
1. In Firebase Console, go to Project Settings
2. Click "Add app" → Web app
3. Register app and copy the config object
4. Use the config values for your frontend environment variables

### 4. Generate Service Account Key
1. In Firebase Console, go to Project Settings → Service accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Use the values for your backend environment variables

## 🧪 Testing Steps

### 1. Test Authentication
1. Start the frontend development server
2. Navigate to any blog post
3. Click "Sign in with GitHub" in the comments section
4. Verify you can log in and see your profile

### 2. Test Comment Creation
1. While logged in, try to create a comment
2. Verify the comment appears with your admin badge
3. Test markdown formatting in comments

### 3. Test Comment Management
1. Try editing your own comment
2. Try deleting your own comment
3. Test voting on comments

### 4. Test Admin Features
1. Verify your comments show the red "Admin" badge
2. Test that you can edit/delete any comment (admin privileges)

## 🔍 Troubleshooting

### Common Issues:
- **CORS errors**: Make sure your domain is in Firebase authorized domains
- **Authentication fails**: Check GitHub OAuth app settings
- **Backend auth errors**: Verify service account key format
- **Role not showing**: Check that GitHub username matches 'mistahoward'

### Debug Commands:
```bash
# Check environment variables are loaded
cd frontend && npm run dev
cd backend && npm run dev

# Test API endpoints
curl -X GET https://your-worker.your-subdomain.workers.dev/api/comments/test-slug
```

## 🚀 Deployment Checklist

- [ ] Firebase project created and configured
- [ ] GitHub OAuth app set up
- [ ] Environment variables added to both frontend and backend
- [ ] Frontend builds without errors
- [ ] Backend deploys successfully
- [ ] Authentication flow works
- [ ] Comments can be created, edited, deleted
- [ ] Admin badge displays correctly
- [ ] Voting system works

## 📞 Next Steps

Once Firebase is configured:
1. Test the authentication flow
2. Create a test comment
3. Verify admin badge appears
4. Test all CRUD operations
5. Move on to Phase 2 features (nested replies, vote counts, etc.) 