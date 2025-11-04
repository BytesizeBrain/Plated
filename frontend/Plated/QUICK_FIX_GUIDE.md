# Quick Fix Guide - Production Issues

## TL;DR - What's Wrong

Your app works in development but fails in production because:

1. **Critical functions don't use the fallback system** - They check `import.meta.env.DEV` instead
2. **API URL defaults to localhost** - If `VITE_API_BASE_URL` isn't set, all API calls fail
3. **No error handling** - When API fails, app crashes instead of falling back

## The Problem

In development: `import.meta.env.DEV === true` → Uses mock data  
In production: `import.meta.env.DEV === false` → Tries API, but no fallback if it fails

## Quick Fixes

### Fix 1: Update Critical Functions (30 minutes)

Update these functions in `src/utils/api.ts` to use `withFallback()`:

- `getUserProfile()` - Line 71
- `getFeedPosts()` - Line 105
- `getConversations()` - Line 189
- `getUnreadCount()` - Line 227

### Fix 2: Environment Variable Check (10 minutes)

Add validation in `src/utils/api.ts` to warn if `VITE_API_BASE_URL` is missing.

### Fix 3: Production Testing (20 minutes)

```bash
npm run build
npm run preview
# Test without backend running - should use mock data
```

## Expected Behavior

✅ **Production with backend**: Uses real API data  
✅ **Production without backend**: Falls back to mock data (read-only features)  
✅ **Write operations**: Show error messages when backend is unavailable

## Is Backend Required?

**No** - With proper fallbacks, the app should work without a backend:
- Read operations → Use mock data
- Write operations → Show error messages

The "saferails" you mentioned (smart fallback) exists but isn't applied to all functions.

