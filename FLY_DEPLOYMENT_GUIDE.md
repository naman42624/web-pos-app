# Fly.dev Deployment Guide

## Current Status: Debugging "Failed to fetch" errors

### Quick Fix Checklist

1. **Verify Environment Variables in Fly.dev Dashboard**
   - Go to Settings → Secrets
   - Ensure `MONGODB_URL` is set correctly
   - Example: `mongodb+srv://user:pass@cluster.mongodb.net/?appName=Cluster0`

2. **Check Server Status**
   - Visit: `https://your-fly-app.fly.dev/health`
   - Should return: `{"status":"ok","timestamp":"..."}`
   - If this fails, the server isn't running

3. **Rebuild and Redeploy**
   ```bash
   # Force rebuild
   flyctl deploy --no-cache
   ```

4. **Check Recent Logs**
   ```bash
   flyctl logs -a your-app-name
   ```
   Look for:
   - "[DB] Connecting to MongoDB..." - indicates DB connection attempt
   - "[Server] MongoDB connected successfully" - good
   - "[Server] Failed to connect to MongoDB:" - investigate MONGODB_URL
   - Any uncaught exceptions

5. **Verify Build Completed**
   - Make sure `dist/spa/index.html` exists in the build
   - The build should complete: `npm run build`

### Troubleshooting Steps

**Problem: "Failed to fetch" errors**

Causes and solutions:
1. Server not listening on the port
2. MongoDB connection failing
3. Build files not present
4. Network/CORS issues

**Check server is running:**
```bash
flyctl ps -a your-app-name
# Should show running instances
```

**Check recent deployment:**
```bash
flyctl history -a your-app-name
# Look for successful builds
```

**View full application logs:**
```bash
flyctl logs -a your-app-name --follow
```

**Restart the app:**
```bash
flyctl restart -a your-app-name
```

### Database Connection Issues

If logs show `[DB] MongoDB connection error:`:

1. Verify MONGODB_URL format
2. Check MongoDB whitelist includes Fly.dev's IPs
3. Try increasing timeout: Connection string with `maxPoolSize=5&serverSelectionTimeoutMS=15000`
4. Test connectivity manually if possible

### Health Check Endpoint

The `/health` endpoint is available WITHOUT requiring database access.

```bash
curl https://your-fly-app.fly.dev/health
# Expected: {"status":"ok","timestamp":"2026-02-27T..."}
```

If health check works but API fails:
- Server is running ✅
- Database connection is failing ❌

### Recent Improvements Made

1. Added `/health` endpoint for status checking
2. Better server startup error handling
3. Non-blocking MongoDB connection (server starts even if DB unavailable)
4. Enhanced logging with `[DB]` and `[Server]` prefixes
5. Graceful error handling for uncaught exceptions

### Environment Variables Required

```
MONGODB_URL=mongodb+srv://...
NODE_ENV=production
PORT=8080 (auto-assigned by Fly.dev)
```

### Common Issues

| Issue | Solution |
|-------|----------|
| "API endpoint not found" on `/api/*` | Check routes exist in `server/routes/` |
| "SPA file not found" | Run `npm run build` locally to verify `dist/spa/` |
| MongoDB timeout errors | Check MONGODB_URL, increase timeout |
| Blank page loading | Check browser console, run `/health` check |
| "Cannot find module" errors | May need to rebuild if deps changed |

### Next Steps if Still Having Issues

1. Run health check: `curl https://your-app.fly.dev/health`
2. Check logs for specific errors: `flyctl logs -a your-app-name`
3. Verify all environment variables are set
4. Try a clean rebuild: `flyctl deploy --no-cache -a your-app-name`
