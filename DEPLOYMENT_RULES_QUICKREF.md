# Deployment Rules - Quick Reference Card

⚠️ **CRITICAL: Read this before EVERY deployment**

---

## 🚨 The Two Rules That Broke Production (2025-11-27)

### Rule #1: deploy.sh MUST have Unix (LF) line endings
```bash
# Before committing deploy.sh, verify:
file deploy.sh
# Must show: "with LF line terminators" ✅
# NOT: "with CRLF line terminators" ❌

# If CRLF, fix it:
dos2unix deploy.sh
# Or: sed -i 's/\r$//' deploy.sh
```

### Rule #2: env.development.local MUST NOT exist in backend/
```bash
# This file should NOT exist:
ls backend/env.development.local
# Should show: "No such file or directory" ✅

# If it exists, delete it:
rm backend/env.development.local
```

---

## ✅ Pre-Deployment Checklist

Before pushing to production:

```bash
# 1. Check deploy.sh line endings
file deploy.sh | grep "LF"

# 2. Check no env.development.local
! ls backend/env.development.local 2>/dev/null

# 3. Validate environment
python3 backend/validate_env.py

# 4. All checks pass? Safe to deploy
git push origin main
```

---

## 🔧 Post-Deployment Verification

After deployment completes:

```bash
# SSH to production
ssh ubuntu@ec2-3-139-205-219.us-east-2.compute.amazonaws.com

# Run diagnostic
cd /home/ubuntu/Plated/backend
python3 diagnose_oauth.py

# Test OAuth
# Visit: https://platedwithfriends.life
# Click: Login with Google
# Should: Redirect to Google (not error page)
```

---

## 📚 Full Documentation

- [Deployment Critical Rules](docs/plans/DEPLOYMENT_CRITICAL_RULES.md)
- [Critical Deployment Issues](docs/deployment/CRITICAL_DEPLOYMENT_ISSUES.md)
- [Production Deployment Guide](docs/deployment/PRODUCTION_DEPLOYMENT.md)

---

## 🆘 Emergency: OAuth Broken in Production

```bash
ssh ubuntu@production

# Fix line endings
dos2unix /home/ubuntu/Plated/deploy.sh

# Remove override file
rm /home/ubuntu/Plated/backend/env.development.local

# Verify .env has FLASK_ENV=production
grep FLASK_ENV /home/ubuntu/Plated/backend/.env

# Restart
bash /home/ubuntu/Plated/deploy.sh

# Test
python3 /home/ubuntu/Plated/backend/diagnose_oauth.py
```

---

**Remember:** These rules exist because they broke production. Follow them EVERY time.
