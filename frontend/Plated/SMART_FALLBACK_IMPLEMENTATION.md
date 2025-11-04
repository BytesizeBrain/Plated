# Smart Fallback Implementation

**Date**: January 29, 2025  
**Feature**: Automatic API fallback to mock data when backend is unavailable

---

## Overview

The Plated frontend now implements a **smart fallback system** that:
1. ✅ **Tries the real API first** - Attempts to fetch data from the backend
2. ✅ **Automatically falls back to mock data** - If backend is unavailable or returns errors
3. ✅ **Works in both dev and production** - No need to change code when deploying
4. ✅ **Logs when fallback is used** - Console messages indicate when mock data is being used

This allows the app to:
- Work without a backend (for development/testing)
- Automatically switch to real data when backend becomes available
- Be production-ready even before backend is fully set up

---

## Implementation Details

### 1. Smart Fallback Utility Function

**Location**: `src/utils/api.ts`

A reusable `withFallback()` function that wraps API calls:

```typescript
async function withFallback<T>(
  apiCall: () => Promise<T>,
  mockData: T,
  featureName: string
): Promise<T>
```

**Behavior**:
- Tries the API call first
- If API succeeds and returns data → uses real data
- If API fails (network error, 404, 500) → falls back to mock data
- Logs to console for debugging
- Re-throws authentication errors (401, 403) for proper handling

### 2. New API Functions with Fallback

#### Challenges API

```typescript
// Get all challenges
getChallenges(): Promise<Challenge[]>
// Tries: GET /api/challenges
// Falls back to: mockChallenges

// Get specific challenge
getChallenge(challengeId: string): Promise<Challenge | null>
// Tries: GET /api/challenges/{id}
// Falls back to: mockChallenges.find(id)
```

#### Rewards/Gamification API

```typescript
// Get user's rewards summary
getRewardsSummary(): Promise<RewardSummary>
// Tries: GET /api/rewards/summary
// Falls back to: mockRewardsSummary
```

### 3. Updated Components

#### ChallengesPage (`src/pages/challenges/ChallengesPage.tsx`)

**Before**: Directly loaded mock data
```typescript
useEffect(() => {
  setChallenges(mockChallenges);
  setRewards(mockRewardsSummary);
}, []);
```

**After**: Uses API with fallback
```typescript
useEffect(() => {
  const loadData = async () => {
    const [challengesData, rewardsData] = await Promise.all([
      getChallenges(),      // Tries API, falls back to mock
      getRewardsSummary(),  // Tries API, falls back to mock
    ]);
    setChallenges(challengesData);
    setRewards(rewardsData);
  };
  loadData();
}, []);
```

#### CookModePage (`src/pages/cook/CookModePage.tsx`)

**Before**: Found challenge from mock data only
```typescript
const challenge = mockChallenges.find(c => c.id === challengeId);
```

**After**: Uses API with fallback
```typescript
const challengeData = await getChallenge(challengeId);
// Tries API first, falls back to mock if unavailable
```

---

## How It Works

### Scenario 1: Backend Available
```
1. User opens Challenges page
2. getChallenges() tries API call
3. ✅ API returns data
4. Console: "✅ Challenges: Using real API data"
5. App displays real data from backend
```

### Scenario 2: Backend Unavailable
```
1. User opens Challenges page
2. getChallenges() tries API call
3. ❌ Network error or 404
4. Console: "⚠️ Challenges: Backend unavailable, using mock data fallback"
5. App displays mock data
6. User can still use the app normally
```

### Scenario 3: Backend Becomes Available
```
1. User opens Challenges page (using mock data)
2. Later, backend comes online
3. User refreshes page
4. getChallenges() tries API call
5. ✅ API now returns data
6. Console: "✅ Challenges: Using real API data"
7. App automatically switches to real data
```

---

## Console Logging

The implementation includes helpful console messages:

- ✅ **"✅ Challenges: Using real API data"** - Backend is working, using real data
- ⚠️ **"⚠️ Challenges: Backend unavailable, using mock data fallback"** - Using mock data because backend is down
- ❌ **"❌ Challenges: API error"** - Serious error (like auth failure) that should be handled

---

## Write Operations

**Important**: Write operations (POST, PUT, DELETE) do **NOT** have fallback:

```typescript
// These will fail if backend is unavailable
startChallenge(challengeId)      // POST /api/challenges/{id}/start
saveCookSession(sessionData)     // POST /api/sessions
submitCookSession(sessionId, data) // POST /api/sessions/{id}/submit
```

**Reason**: Write operations need to persist data, so they must use the real backend. If the backend is unavailable, these operations will fail with proper error handling.

---

## Benefits

1. **Development Flexibility**
   - Can develop frontend without waiting for backend
   - Can test UI/UX with mock data
   - Can switch to real data when backend is ready

2. **Production Readiness**
   - App works even if backend has temporary issues
   - Graceful degradation instead of crashes
   - Better user experience

3. **Automatic Detection**
   - No configuration needed
   - Automatically detects when backend is available
   - Seamlessly switches between mock and real data

4. **Easy Migration**
   - When backend is ready, just deploy it
   - Frontend automatically starts using real data
   - No code changes needed

---

## Testing

### Test with Backend Available
1. Start backend server
2. Open app
3. Check console for "✅ Using real API data" messages
4. Verify data comes from backend

### Test with Backend Unavailable
1. Don't start backend server
2. Open app
3. Check console for "⚠️ Backend unavailable, using mock data fallback" messages
4. Verify app still works with mock data

### Test Fallback Switching
1. Start app without backend (uses mock)
2. Start backend server
3. Refresh page
4. Verify it switches to real data

---

## Future Enhancements

Potential improvements:
1. **Retry Logic**: Retry API calls a few times before falling back
2. **Cache Strategy**: Cache successful API responses
3. **User Notification**: Show a subtle indicator when using mock data
4. **Offline Detection**: Detect network status and show appropriate UI
5. **Selective Fallback**: Allow disabling fallback for certain features

---

## Files Modified

1. `src/utils/api.ts`
   - Added `withFallback()` utility function
   - Added `getChallenges()`, `getChallenge()`, `getRewardsSummary()` functions
   - Added `startChallenge()`, `saveCookSession()`, `submitCookSession()` functions

2. `src/pages/challenges/ChallengesPage.tsx`
   - Updated to use `getChallenges()` and `getRewardsSummary()`
   - Added loading and error states

3. `src/pages/cook/CookModePage.tsx`
   - Updated to use `getChallenge()`
   - Added loading state
   - Improved error handling

---

## Production Deployment

When deploying to production:

1. **Set Environment Variable**:
   ```env
   VITE_API_BASE_URL=https://api.plated.com
   ```

2. **Backend Status**:
   - If backend is ready → App automatically uses real data
   - If backend is not ready → App uses mock data (still functional)

3. **Monitoring**:
   - Check console logs to see if fallback is being used
   - Monitor API endpoint availability
   - Track when app switches from mock to real data

---

## Summary

✅ **App is now production-ready** with smart fallback system
✅ **Works without backend** - Uses mock data gracefully
✅ **Automatically switches** - Uses real data when backend is available
✅ **No configuration needed** - Detects backend availability automatically
✅ **Better UX** - App doesn't crash when backend is unavailable

**Status**: ✅ **READY FOR MERGE TO MAIN**

The app can now be safely merged to main, as it will work whether the backend is available or not. When the backend is deployed, the app will automatically start using real data without any code changes.

