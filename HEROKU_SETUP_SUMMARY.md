# Heroku Setup Summary

Your project has been configured for Heroku deployment. Here's what was set up:

## Files Added/Modified

### 1. **Procfile** (NEW)

- Tells Heroku how to run your application
- Runs: `node dist/server/production.mjs`
- The compiled server that serves both the frontend and API

### 2. **runtime.txt** (NEW)

- Specifies Node.js version: 18.19.0
- Ensures consistent runtime across environments

### 3. **package.json** (MODIFIED)

- Updated start script to: `node dist/server/production.mjs`
- This is what Heroku runs when the app starts

### 4. **server/db/connection.ts** (MODIFIED)

- Added connection caching for serverless/dyno environments
- Better connection pooling (10 max, 2 min)
- Improved error handling and timeouts

### 5. **Documentation Files**

- `HEROKU_DEPLOYMENT.md` - Complete deployment guide
- `HEROKU_CHECKLIST.md` - Quick checklist for deployment
- `.env.example` - Environment variables reference
- `README.md` - Updated to reference Heroku instead of Netlify

## How It Works

### Build Process (Heroku automatically runs)

1. Heroku detects Node.js from `package.json`
2. Runs `npm install` to install dependencies
3. Runs `npm run build` which:
   - Builds React frontend → `dist/spa/`
   - Builds Express server → `dist/server/production.mjs`
   - The server knows to serve static files from `dist/spa/`

### Runtime (Heroku Dyno)

1. Heroku starts dyno and runs: `node dist/server/production.mjs`
2. Server listens on `process.env.PORT` (provided by Heroku)
3. Server serves:
   - Frontend (React app) at `/`
   - API routes at `/api/*`
   - MongoDB operations via connections

## Deployment Steps

1. **Install Heroku CLI**

   ```bash
   npm install -g heroku
   ```

2. **Create MongoDB Atlas cluster** (free tier)
   - Get connection string

3. **Generate JWT Secret**

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Login to Heroku**

   ```bash
   heroku login
   ```

5. **Create app**

   ```bash
   heroku create your-app-name
   ```

6. **Set environment variables**

   ```bash
   heroku config:set MONGODB_URL="your-mongodb-connection-string"
   heroku config:set JWT_SECRET="your-jwt-secret"
   heroku config:set NODE_ENV="production"
   ```

7. **Deploy**

   ```bash
   git push heroku main
   ```

8. **Watch logs**
   ```bash
   heroku logs --tail
   ```

## Key Features

✅ **Full-stack deployment**: Both frontend and backend on one Heroku dyno  
✅ **Automatic HTTPS**: Heroku provides SSL/TLS certificates  
✅ **MongoDB Atlas integration**: Scalable, reliable database  
✅ **Environment management**: Config vars for sensitive data  
✅ **Logging**: Easy access to application logs  
✅ **Git-based deployment**: Push to deploy  
✅ **Automatic buildpack detection**: No manual configuration needed

## Project Architecture on Heroku

```
Heroku Dyno (Node.js 18.19.0)
├── Frontend Server
│   └── Serves React SPA from dist/spa/
├── Express API Server
│   └── Handles /api/* routes
└── MongoDB Connection
    └── Connects to MongoDB Atlas
```

## Costs

- **Heroku Eco Dyno**: FREE (up to 1000 hours/month, ~1 app)
- **Heroku Standard-1X**: $7/month (recommended for production)
- **MongoDB Atlas Free**: 512MB storage (adequate for small to medium apps)
- **MongoDB Atlas Paid**: Starting $57/month (larger storage, dedicated cluster)

**Estimated minimum cost**: Free - $7/month

## What You Need Before Deployment

1. ✅ Heroku account (free)
2. ✅ MongoDB Atlas account (free)
3. ✅ Git repository with code
4. ✅ Heroku CLI installed
5. ✅ MONGODB_URL (from MongoDB Atlas)
6. ✅ JWT_SECRET (generated)

## Troubleshooting

### Common Issues

**"Function execution timeout"**

- Usually a MongoDB connection issue
- Check MONGODB_URL is correct
- Verify MongoDB Atlas IP whitelist

**"Cannot GET /"**

- Frontend not loading
- Check logs: `heroku logs --tail`
- Restart: `heroku restart`

**Build fails**

- Check logs: `heroku logs --tail`
- Test locally: `npm run build`

**Database connection errors**

- Verify MONGODB_URL environment variable is set
- Check MongoDB Atlas credentials
- Ensure IP whitelist includes Heroku

## Next Steps

1. Read [HEROKU_CHECKLIST.md](./HEROKU_CHECKLIST.md) for quick deployment
2. Or read [HEROKU_DEPLOYMENT.md](./HEROKU_DEPLOYMENT.md) for detailed guide
3. Set up MongoDB Atlas
4. Deploy!

## Files You Can Delete

The Netlify-specific files can be removed (optional):

- `netlify.toml` - Netlify configuration
- `netlify/` - Netlify functions directory
- `NETLIFY_DEPLOYMENT.md` - Netlify guide
- `DEPLOYMENT_CHECKLIST.md` - Netlify checklist

These are not needed for Heroku deployment.

## Support

- **Heroku Docs**: https://devcenter.heroku.com/
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **Node.js on Heroku**: https://devcenter.heroku.com/articles/nodejs-support

---

Ready to deploy? Start with [HEROKU_CHECKLIST.md](./HEROKU_CHECKLIST.md)! 🚀
