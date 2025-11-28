# Development Server Setup

## Quick Start

### Option 1: Use PowerShell Script (Recommended)
```powershell
.\start-dev.ps1
```

### Option 2: Manual Start
```powershell
npm run dev
```

## Troubleshooting

### Issue: "Cannot connect to website"

**Common Causes:**

1. **PowerShell Syntax Error**
   - ❌ Wrong: `cd Plated && npm run dev`
   - ✅ Correct: `cd Plated; npm run dev` or run commands separately

2. **Port Already in Use**
   ```powershell
   # Check if port 5173 is in use
   Get-NetTCPConnection -LocalPort 5173
   
   # Kill process on port 5173 (if needed)
   Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process
   ```

3. **Dependencies Not Installed**
   ```powershell
   npm install
   ```

4. **Server Started but Not Visible**
   - Check terminal output for the actual URL
   - Look for "Local: http://localhost:5173/"
   - Try the Network URL if Local doesn't work

### Server Status Check

```powershell
# Check if server is running
Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue

# If output shows a connection, server is running
```

## Best Practices

1. **Always check terminal output** - Vite shows the exact URL when it starts
2. **Use the start-dev.ps1 script** - It handles common issues automatically
3. **Check for port conflicts** - Port 5173 might be in use by another app
4. **Run in foreground first** - To see any error messages

## Server URLs

When the server starts successfully, you'll see:
```
VITE v7.1.7  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://YOUR_IP:5173/
```

Use the **Local** URL to access the app in your browser.

