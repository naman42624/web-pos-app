# Netlify Deployment Checklist

Follow these steps to deploy your POS system to Netlify:

## 1. Prepare MongoDB

- [ ] Create MongoDB Atlas account (free tier: https://www.mongodb.com/cloud/atlas)
- [ ] Create a new cluster
- [ ] Create a database user with strong password
- [ ] Get the connection string (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority`)
- [ ] Add your IP to Network Access (or use `0.0.0.0/0` initially, then restrict later)

## 2. Generate JWT Secret

Run this command and save the output:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 3. Connect Repository to Netlify

- [ ] Go to https://app.netlify.com/
- [ ] Click "Add new site" → "Import an existing project"
- [ ] Select GitHub and authenticate
- [ ] Select your repository
- [ ] Click "Deploy site"

## 4. Configure Environment Variables

In Netlify Dashboard → Site Settings → Build & deploy → Environment:

Add these variables:

```
MONGODB_URL=<your-mongodb-connection-string>
JWT_SECRET=<your-generated-jwt-secret>
NODE_ENV=production
```

- [ ] MONGODB_URL set correctly
- [ ] JWT_SECRET set (keep it secret!)
- [ ] NODE_ENV set to "production"

## 5. Verify Build Settings

- [ ] Build command: `npm run build` (shown automatically)
- [ ] Publish directory: `dist/spa`
- [ ] Functions directory: `netlify/functions`

## 6. Test the Deployment

After Netlify deploys (usually 2-5 minutes):

- [ ] Visit your site URL (https://your-site-name.netlify.app)
- [ ] Login with your admin credentials
- [ ] Try to add an item (test the API)
- [ ] Check browser console for errors
- [ ] Check Netlify Function logs for backend errors

## 7. Post-Deployment (Optional but Recommended)

- [ ] Set up custom domain in Site settings
- [ ] Enable Netlify analytics
- [ ] Configure MongoDB backups
- [ ] Set up error monitoring/logging
- [ ] Test on mobile devices

## 8. Troubleshooting

If deployment fails:

**Check Netlify Deploy Logs:**

1. Go to Deploys tab
2. Click on failed deploy
3. Expand "Build log" to see errors

**Common Issues:**

- `Function execution timeout`: Check MongoDB connection
- `MONGODB_URL not found`: Verify environment variables are set
- `Build failed`: Run `npm run build` locally to see the error

**Roll Back:**

1. Go to Deploys tab
2. Select a previous successful deploy
3. Click "Publish deploy"

## 9. Monitoring

After deployment:

- [ ] Check Netlify Function logs regularly
- [ ] Monitor MongoDB Atlas for connection issues
- [ ] Set up alerts in MongoDB Atlas for unusual activity
- [ ] Review error logs in browser console

## Notes

- First API call after 30+ minutes may take 2-5 seconds (cold start)
- Subsequent calls are fast (< 500ms)
- Images must be < 3MB
- Keep JWT_SECRET secure and never commit to git

For detailed instructions, see: [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md)
