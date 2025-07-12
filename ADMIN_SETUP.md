# Admin Panel Setup Guide

This guide will help you set up and use the admin panel for managing your portfolio content.

## Features

The admin panel includes:
- **Blog Posts**: Create, edit, and manage blog posts with markdown support
- **Pet Management**: Add and manage your pets with detailed profiles and stats
- **Data Management**: View and manage projects, skills, experience, and testimonials

## Setup Instructions

### 1. Backend Configuration

1. **Set Admin Password**:
   - **For Development**: Update `backend/.dev.vars` with your actual `ADMIN_SECRET` value
   - **For Production**: Set the `ADMIN_SECRET` environment variable in your Cloudflare Dashboard
   - **Important**: The `.dev.vars` file is automatically ignored by git and should never be committed

2. **Configure CORS Origin**:
   - In `backend/wrangler.toml`, update `CORS_ORIGIN` with your frontend URL
   - For development: `"http://localhost:5173"`
   - For production: `"https://yourdomain.com"`
   - This prevents unauthorized domains from accessing your API

2. **Database Setup**:
   - Update the `database_id` in `backend/wrangler.toml` with your actual D1 database ID
   - Run database migrations:
   ```bash
   cd backend
   npm run db:workflow
   ```

3. **Deploy Backend**:
   ```bash
   cd backend
   npm run deploy
   ```

### 2. Frontend Configuration

1. **Update API Endpoints**:
   - If your backend is deployed to a different URL, update the API calls in the frontend components
   - The default assumes the API is at the same domain

2. **Start Development Server**:
   ```bash
   cd frontend
   npm run dev
   ```

## Usage

### Accessing the Admin Panel

1. Open your portfolio website
2. Click the "⚙️ Admin" button in the top-right corner
3. Enter your admin password
4. You'll be redirected to the admin panel

### Managing Blog Posts

1. **Create a New Post**:
   - Click "New Post" in the Blog Posts section
   - Fill in the title, slug, excerpt, and content
   - Use the "Generate" button to auto-generate a slug from the title
   - Check "Published" to make the post live immediately
   - Click "Create" to save

2. **Edit Existing Posts**:
   - Click "Edit" on any post in the list
   - Make your changes
   - Click "Update" to save

3. **Delete Posts**:
   - Click "Delete" on any post
   - Confirm the deletion

### Managing Pets

1. **Add a New Pet**:
   - Click "Add New Pet" in the Pet Management section
   - Fill in the required fields (name, species)
   - Add optional details like breed, age, personality traits, etc.
   - Use JSON format for arrays (personality, special abilities, stats)
   - Click "Create" to save

2. **Pet Stats Format**:
   ```json
   {
     "hp": 100,
     "attack": 50,
     "defense": 30,
     "speed": 80
   }
   ```

3. **Personality/Abilities Format**:
   ```json
   ["friendly", "playful", "curious"]
   ```

### Data Management

The Data Management section allows you to view:
- **Projects**: Your portfolio projects
- **Skills**: Your technical skills and proficiency levels
- **Experience**: Work history and positions
- **Testimonials**: Client feedback and reviews

Currently, this section is read-only. Full CRUD operations can be added as needed.

## Security Notes

1. **Password Security**: Use a strong, unique password for the admin panel
2. **Environment Variables**: Never commit the actual admin password to version control
3. **CORS Configuration**: Set `CORS_ORIGIN` to your specific domain(s) instead of using wildcards
4. **HTTPS**: Always use HTTPS in production
5. **Rate Limiting**: Consider adding rate limiting to prevent brute force attacks

## Customization

### Adding New Admin Sections

1. Create a new component in `frontend/src/components/admin/`
2. Add it to the `AdminPanel.tsx` navigation
3. Add corresponding API endpoints in the backend

### Styling

The admin panel uses CSS-in-JS for styling. You can customize the appearance by modifying the style objects in each component.

### API Endpoints

The backend includes these admin endpoints:
- `POST /api/admin/auth` - Authentication
- `GET /api/admin/blog` - Get all blog posts
- `POST /api/admin/blog` - Create blog post
- `PUT /api/admin/blog/:id` - Update blog post
- `DELETE /api/admin/blog/:id` - Delete blog post
- `GET /api/admin/pets` - Get all pets
- `POST /api/admin/pets` - Create pet
- `PUT /api/admin/pets/:id` - Update pet
- `DELETE /api/admin/pets/:id` - Delete pet

## Troubleshooting

### Common Issues

1. **Authentication Fails**:
   - Check that the `ADMIN_SECRET` is set correctly in your environment variables
   - For development: Check your `.dev.vars` file in the `backend/` directory
   - For production: Check Cloudflare Dashboard environment variables
   - Ensure the backend is deployed and accessible

2. **Database Errors**:
   - Run `npm run db:workflow` to ensure migrations are applied
   - Check that the database ID is correct in `wrangler.toml`

3. **CORS Errors**:
   - Ensure the frontend and backend are on the same domain, or
   - Update CORS headers in the backend if needed

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Verify all configuration files are set up correctly
3. Ensure all dependencies are installed (`npm install` in both directories)

## Future Enhancements

Potential improvements:
- Rich text editor for blog posts
- Image upload functionality
- Bulk operations for data management
- User roles and permissions
- Activity logging
- Backup and restore functionality 