# Heroku Deployment Guide

This guide will help you deploy your POS system to Heroku for reliable hosting.

## Prerequisites

- Heroku account (create at https://www.heroku.com/)
- Heroku CLI installed (`npm install -g heroku`)
- Git repository with your code
- MongoDB Atlas account with a connection string
- JWT secret for token signing

## Step 1: Install Heroku CLI

```bash
npm install -g heroku
```

Or download from: https://devcenter.heroku.com/articles/heroku-cli

## Step 2: Create Heroku App

```bash
heroku login
heroku create your-app-name
```

Replace `your-app-name` with your desired app name (e.g., `pos-system-prod`).

**Note:** You can skip `--buildpacks` as Heroku will auto-detect Node.js from package.json

## Step 3: Set Environment Variables

Add your environment variables to Heroku:

```bash
heroku config:set MONGODB_URL="mongodb+srv://user:password@cluster.mongodb.net/pos-system?retryWrites=true&w=majority"
heroku config:set JWT_SECRET="your-very-long-random-secret-key"
heroku config:set NODE_ENV="production"
```

Or use Heroku Dashboard:

1. Go to your app on https://dashboard.heroku.com/
2. Go to Settings → Config Vars
3. Add the variables listed above

### Generate a Strong JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 4: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with a strong password
4. Get your connection string (looks like):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
   ```
5. Update the database name if needed:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/pos-system?retryWrites=true&w=majority
   ```
6. Go to Network Access and add Heroku's IP (use `0.0.0.0/0` for development, restrict later)

## Step 5: Configure Build Environment (Optional)

The project includes `Procfile` and `runtime.txt` for Heroku configuration. These files are already set up and don't need changes.

- `Procfile` - Tells Heroku how to run the app
- `runtime.txt` - Specifies Node.js version (18.19.0)

## Step 6: Deploy

Push your code to Heroku:

```bash
git push heroku main
```

If using a different branch:

```bash
git push heroku your-branch:main
```

Heroku will:

1. Detect Node.js environment
2. Run `npm install` (or `pnpm install`)
3. Run `npm run build`
4. Start the app with `npm start`

## Step 7: Verify Deployment

```bash
heroku logs --tail
```

You should see:

```
🚀 Fusion Starter server running on port <PORT>
```

Visit your app at: `https://your-app-name.herokuapp.com`

## Step 8: First Time Setup

1. Go to your deployed app URL
2. Login with admin credentials:
   - Email: `gauravbhatia3630@gmail.com`
   - Or reset password if needed
3. Test basic functionality:
   - Add an item
   - Create a sale
   - Check the dashboard

## Useful Heroku Commands

```bash
# View logs
heroku logs --tail

# View logs for specific time period
heroku logs -n 100

# Connect to database shell
heroku addons:create heroku-postgresql:hobby-dev  # if using PostgreSQL
heroku pg:psql

# View app info
heroku apps:info

# Restart app
heroku restart

# View environment variables
heroku config

# Set a variable
heroku config:set KEY="value"

# Remove a variable
heroku config:unset KEY

# Deploy specific branch
git push heroku branch-name:main

# View app URL
heroku open
```

## Troubleshooting

### "Cannot find module" errors

```bash
# Clear Heroku cache and rebuild
heroku builds:cancel
rm -rf node_modules
npm install
git push heroku main
```

### MongoDB Connection Failed

- Check MONGODB_URL is set: `heroku config | grep MONGODB_URL`
- Verify MongoDB Atlas IP whitelist includes Heroku
- Test connection string locally

### Build fails

- Check build logs: `heroku logs --tail`
- Run `npm run build` locally to see the exact error
- Ensure all dependencies are in package.json (not devDependencies)

### "Port already in use" or "Cannot GET /"

- App is running but frontend not loading
- Check `dist/spa` directory was built
- Verify server/node-build.ts is compiled
- Restart: `heroku restart`

### App crashes after deployment

- Check logs: `heroku logs --tail`
- Verify environment variables are set
- Ensure MongoDB connection is working
- Check for runtime errors in code

## Performance Tips

1. **Enable Metrics**
   - Go to app → Resources → add Datadog or New Relic

2. **Scale Up (if needed)**
   - Default: Eco Dyno (shared, always free)
   - For better performance: Standard-1x ($7/month)

   ```bash
   heroku dyno:type standard-1x --app your-app-name
   ```

3. **Monitor Database**
   - Set up MongoDB Atlas monitoring
   - Enable email alerts for issues

4. **Optimize Images**
   - Keep item images < 3MB (enforced)
   - Compress before upload

## Monitoring & Maintenance

### Set Up Alerts

- MongoDB Atlas: Database monitoring and alerts
- Heroku: Uptime monitoring

### Regular Maintenance

- Check logs weekly for errors
- Monitor MongoDB storage usage
- Update dependencies monthly

### Backups

- MongoDB Atlas: Enable automatic backups (included)
- Code: Git commits serve as version control

## Costs

**Heroku:**

- Eco dyno (shared): Free for first 1000 hours/month (~1 app)
- Standard-1x: $7/month (recommended for production)

**MongoDB Atlas:**

- Free tier: 512MB storage, shared cluster
- Paid: $57+/month for dedicated clusters

**Estimated minimum cost:** $7-10/month

## Rolling Back

If something goes wrong:

```bash
# View releases
heroku releases

# Rollback to previous release
heroku releases:rollback v123
```

Or redeploy a previous commit:

```bash
git push heroku commit-hash:main
```

## Additional Resources

- [Heroku Docs](https://devcenter.heroku.com/)
- [Node.js on Heroku](https://devcenter.heroku.com/articles/nodejs-support)
- [Procfile Documentation](https://devcenter.heroku.com/articles/procfile)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Heroku CLI Documentation](https://devcenter.heroku.com/articles/heroku-cli)

## Summary

1. Install Heroku CLI
2. Create Heroku app
3. Set environment variables
4. Set up MongoDB Atlas
5. Deploy: `git push heroku main`
6. Verify with `heroku logs --tail`
7. Visit your deployed app!

That's it! Your app is now live on Heroku.
