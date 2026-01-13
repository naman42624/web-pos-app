# Heroku Deployment Quick Checklist

## Pre-Deployment

- [ ] Heroku account created (https://www.heroku.com/)
- [ ] Heroku CLI installed: `npm install -g heroku`
- [ ] Code committed to Git
- [ ] MongoDB Atlas account created
- [ ] JWT secret generated

## Step-by-Step Deployment

### 1. Generate JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Save this value.

### 2. Set Up MongoDB Atlas

- [ ] Create MongoDB Atlas account (free tier)
- [ ] Create a cluster
- [ ] Create database user
- [ ] Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority`
- [ ] Update with database name: `mongodb+srv://user:pass@cluster.mongodb.net/pos-system?retryWrites=true&w=majority`
- [ ] Add Heroku IP to whitelist (use `0.0.0.0/0` for now, restrict later)

### 3. Install Heroku CLI

```bash
npm install -g heroku
```

### 4. Login to Heroku

```bash
heroku login
```

### 5. Create Heroku App

```bash
heroku create your-app-name
```

Replace `your-app-name` with your desired app name (e.g., `pos-system-prod`).

### 6. Set Environment Variables

```bash
heroku config:set MONGODB_URL="mongodb+srv://user:pass@cluster.mongodb.net/pos-system?retryWrites=true&w=majority"
heroku config:set JWT_SECRET="your-generated-jwt-secret-here"
heroku config:set NODE_ENV="production"
```

### 7. Deploy

```bash
git push heroku main
```

If using a different branch:

```bash
git push heroku your-branch:main
```

### 8. Watch Logs

```bash
heroku logs --tail
```

You should see:

```
🚀 Fusion Starter server running on port <PORT>
```

### 9. Test Your App

- [ ] Visit https://your-app-name.herokuapp.com
- [ ] Login with admin credentials
- [ ] Test adding an item
- [ ] Test creating a sale
- [ ] Check dashboard functionality

## Verify Setup

```bash
# View environment variables
heroku config

# View app info
heroku apps:info

# View logs
heroku logs -n 100

# Open app in browser
heroku open
```

## Troubleshooting

**App won't start:**

- Check logs: `heroku logs --tail`
- Ensure MONGODB_URL is set: `heroku config`
- Verify MongoDB connection string is correct
- Check MongoDB Atlas IP whitelist

**Cannot connect to database:**

- Verify MongoDB credentials in MONGODB_URL
- Check MongoDB Atlas Network Access includes Heroku IPs (use 0.0.0.0/0)
- Test connection string in MongoDB Compass

**Build failed:**

- Check build logs: `heroku logs --tail`
- Run `npm run build` locally to debug
- Clear cache: `heroku builds:cancel`

**"Cannot GET /":**

- Frontend not loading properly
- Check if dist/spa was built
- Restart: `heroku restart`

## Next Steps

1. **Monitor your app:**
   - Check logs regularly: `heroku logs --tail`
   - Set up alerts in MongoDB Atlas

2. **Optimize (optional):**
   - Scale up dyno if needed: `heroku dyno:type standard-1x`
   - Enable monitoring: Datadog or New Relic addon

3. **Custom domain (optional):**
   - Add domain in Heroku dashboard
   - Update DNS records

4. **Backups:**
   - MongoDB Atlas auto-backups (free tier: 7 days)
   - Code backups in Git

## Rollback

If something breaks:

```bash
# View releases
heroku releases

# Rollback to previous version
heroku releases:rollback v10
```

Or redeploy a previous Git commit:

```bash
git push heroku old-commit-hash:main
```

## Useful Commands

```bash
# View live logs
heroku logs --tail

# Restart app
heroku restart

# View and manage config
heroku config
heroku config:set KEY="value"
heroku config:unset KEY

# SSH into dyno (Pro tier only)
heroku ps:exec

# Check app status
heroku apps:info

# Open app in browser
heroku open
```

## Estimated Costs

- **Heroku**: Free tier (eco dyno) or $7+/month (standard dyno)
- **MongoDB**: Free tier (512MB) or $57+/month (paid)
- **Minimum estimated**: $7-10/month

See [HEROKU_DEPLOYMENT.md](./HEROKU_DEPLOYMENT.md) for comprehensive documentation.
