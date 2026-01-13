# Netlify Deployment Guide

This guide will help you deploy your POS system to Netlify for reliable, serverless hosting.

## Prerequisites

- Netlify account (already created)
- GitHub repository with your code
- MongoDB Atlas account with a connection string
- JWT secret for token signing

## Step 1: Connect Your Repository to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose GitHub as your repository provider
4. Authorize Netlify to access your GitHub account
5. Select your repository
6. Click **"Deploy site"**

## Step 2: Set Environment Variables

1. In Netlify Dashboard, go to **Site Settings** → **Build & deploy** → **Environment**
2. Click **"Edit variables"** and add the following:

```
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/pos-system?retryWrites=true&w=majority
JWT_SECRET=your-very-long-random-secret-key-here
NODE_ENV=production
```

**Important:**

- For `MONGODB_URL`, use MongoDB Atlas (recommended for serverless). Free tier available at https://www.mongodb.com/cloud/atlas
- For `JWT_SECRET`, generate a strong random string. Use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Do NOT commit these values to git

## Step 3: Configure Build Settings

The `netlify.toml` file is already configured, but verify:

1. Build command: `npm run build` (or `pnpm run build`)
2. Publish directory: `dist/spa`
3. Functions directory: `netlify/functions`

## Step 4: Deploy

Your site will automatically deploy when you push to your repository's main branch.

### Manual Deploy (if needed)

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Authenticate: `netlify login`
3. Deploy: `netlify deploy --prod`

## Step 5: Configure MongoDB Connection

### Option A: MongoDB Atlas (Recommended for Serverless)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with a strong password
4. Get your connection string
5. Add IP whitelist: Click **"Network Access"** → **"Add IP Address"** → Select **"Allow access from anywhere"** (or add Netlify's IP ranges)
6. Use the connection string as `MONGODB_URL`

### Option B: Self-hosted MongoDB

If you have your own MongoDB server, ensure it's:

- Accessible from the internet
- Has proper firewall rules allowing Netlify's IPs
- Has connection pooling enabled

## Troubleshooting

### "Failed to connect to MongoDB"

- Check `MONGODB_URL` environment variable is set correctly
- Ensure IP whitelist includes Netlify servers (use `0.0.0.0/0` for testing, but limit it in production)
- Verify MongoDB user credentials

### "Function execution timeout"

- Default is 30 seconds. Optimize your API calls
- Check MongoDB query performance
- Increase timeout in `netlify.toml` if needed (up to 30s for Netlify Free tier)

### "CORS errors"

- Already configured in `server/index.ts`
- If issues persist, check browser console for exact error message

### "Cold start delays"

- Netlify serverless functions have initial cold start (~1-5s)
- This is normal and improves after first request
- Subsequent requests are much faster

## Production Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] All environment variables set in Netlify
- [ ] Domain configured (custom domain or Netlify default)
- [ ] HTTPS enabled (automatic with Netlify)
- [ ] Database backups configured (MongoDB Atlas)
- [ ] Monitoring alerts set up (optional but recommended)

## Performance Tips

1. **Optimize Images**: Compress item images to < 3MB (already enforced)
2. **Monitor Cold Starts**: Check Function logs in Netlify Dashboard
3. **Use Analytics**: Enable Netlify Analytics to track function performance
4. **Database Indexing**: Add indexes to frequently queried fields in MongoDB

## Rollback

If deployment fails:

1. Netlify automatically keeps previous deployments
2. Go to **Deploys** tab in Netlify Dashboard
3. Select a previous successful deploy
4. Click **"Publish deploy"** to rollback

## Additional Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Mongoose Serverless Best Practices](https://mongoosejs.com/docs/connections.html)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
