# Deployment Critical Rules
## Mandatory Guidelines to Prevent Production Failures

**Last Updated:** 2025-12-01
**Status:** MANDATORY - DO NOT OVERRIDE

---

## 🚨 RULE #1: NEVER Modify deploy.sh Line Endings

### The Rule
**`deploy.sh` MUST ALWAYS have Unix (LF) line endings, NEVER Windows (CRLF) line endings.**

### Why
- Production servers run Linux
- Bash scripts with CRLF line endings fail on Linux
- Causes silent deployment failures or script errors

### How to Enforce

#### ✅ CORRECT: Edit on Windows
If you must edit `deploy.sh` on Windows:

1. **Use editors that preserve LF:**
   - VS Code (set "End of Line" to LF)
   - Notepad++ (Edit → EOL Conversion → Unix LF)
   - Vim/Nano on WSL

2. **After editing, verify:**
   ```bash
   file deploy.sh
   # Must show: "with LF line terminators"
   ```

3. **If CRLF detected, fix before committing:**
   ```bash
   # Method 1: dos2unix (if installed)
   dos2unix deploy.sh

   # Method 2: sed
   sed -i 's/\r$//' deploy.sh

   # Method 3: In VS Code
   # Click "CRLF" in bottom right → Select "LF"
   ```

#### ❌ WRONG: Don't Use
- Windows Notepad (always uses CRLF)
- Editors without LF support
- Copy-paste from Windows to Linux (can change line endings)

### Protection Mechanisms (Already Implemented)

1. **`.gitattributes`** (in repository root):
   ```gitattributes
   *.sh text eol=lf
   ```
   This forces Git to check out shell scripts with LF endings.

2. **`.editorconfig`** (in repository root):
   ```editorconfig
   [*.sh]
   end_of_line = lf
   ```
   This tells compatible editors to use LF for shell scripts.

### Verification Before Commit

```bash
# Check line endings:
file deploy.sh

# ✅ GOOD OUTPUT:
# deploy.sh: Bourne-Again shell script, ASCII text executable, with LF line terminators

# ❌ BAD OUTPUT:
# deploy.sh: ... with CRLF line terminators
```

---

## 🚨 RULE #2: NEVER Deploy env.development.local to Production

### The Rule
**`env.development.local` MUST NEVER exist on production servers.**

### Why
- This file is designed to override `.env` for local development
- Code in `backend/extensions.py` loads it with `override=True`
- If it exists on production, it overrides `FLASK_ENV=production`
- ProxyFix doesn't activate → OAuth fails

### Protection Mechanisms (Already Implemented)

1. **Global `.gitignore`:**
   ```gitignore
   .env.development.local
   **/.env.development.local
   ```

2. **Deployment verification** in `deploy.sh`:
   Should check and warn if this file exists.

### Production Server Check

```bash
# On production, this should ALWAYS fail:
ssh ubuntu@production-server
ls -la /home/ubuntu/Plated/backend/env.development.local
# Must show: "No such file or directory"

# If file exists, DELETE IMMEDIATELY:
rm /home/ubuntu/Plated/backend/env.development.local
```

---

## 🚨 RULE #3: NEVER Modify .gitignore Without Review

### The Rule
**Changes to `.gitignore` MUST be reviewed to ensure critical files remain ignored.**

### Why
- `.gitignore` protects secrets and environment files
- Removing patterns can expose sensitive data
- Scoped patterns (like `frontend/.env.local`) don't protect other folders

### Critical Patterns (MUST REMAIN)

```gitignore
# Environment files - NEVER remove these
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
**/.env.development.local

# Python
__pycache__/
**/__pycache__/
*.pyc
*.db

# Node
node_modules/
**/node_modules/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

### Use Global Patterns

❌ **WRONG (scoped to one location):**
```gitignore
frontend/Plated/.env.development.local
```

✅ **CORRECT (applies everywhere):**
```gitignore
.env.development.local
**/.env.development.local
```

---

## 🚨 RULE #4: ALWAYS Verify Line Endings in CI/CD

### The Rule
**CI/CD pipeline SHOULD check line endings before deployment.**

### Implementation (Recommended)

Add to `.github/workflows/deploy.yml`:

```yaml
- name: Verify Line Endings
  run: |
    echo "Checking shell scripts for Windows line endings..."
    if file deploy.sh | grep -q "CRLF"; then
      echo "❌ ERROR: deploy.sh has Windows (CRLF) line endings!"
      echo "Fix with: dos2unix deploy.sh"
      exit 1
    fi
    echo "✅ deploy.sh has correct Unix (LF) line endings"
```

---

## 🚨 RULE #5: Production .env Must Have These Variables

### The Rule
**Production `backend/.env` MUST contain these exact variables.**

### Required Configuration

```bash
# Environment mode (CRITICAL - ProxyFix depends on this)
ENV=production
FLASK_ENV=production

# OAuth (use PRODUCTION client, not dev)
CLIENT_ID=<your-google-oauth-client-id>
CLIENT_SECRET=<production-secret-from-google-console>

# URLs (MUST be production domains)
FRONTEND_URL=https://platedwithfriends.life

# Security
SECRET_KEY=<secure-random-key-32-bytes>
JWT_SECRET=<secure-random-key-32-bytes>
```

### Verification

```bash
ssh ubuntu@production
cd /home/ubuntu/Plated/backend
python3 validate_env.py
# Must show all checks passing
```

---

## 📋 Pre-Deployment Checklist (MANDATORY)

Before EVERY deployment to production:

### Local Checks
- [ ] Verify `deploy.sh` has LF line endings (`file deploy.sh`)
- [ ] Verify no `env.development.local` in backend/ (`ls backend/env.development.local`)
- [ ] Run `python3 backend/validate_env.py` with production values
- [ ] Verify `.gitignore` still has critical patterns
- [ ] Code review approved by senior developer

### Post-Deployment Checks
- [ ] SSH to production and verify no `env.development.local`
- [ ] Run `python3 backend/diagnose_oauth.py` on production
- [ ] Test OAuth login flow end-to-end
- [ ] Check logs for errors: `tail -f backend.log`

---

## 🔧 Tools & Files That Enforce These Rules

### 1. `.gitattributes` (Root)
- Forces LF line endings for shell scripts
- **DO NOT MODIFY** without team discussion

### 2. `.editorconfig` (Root)
- Configures editors to use correct line endings
- **DO NOT MODIFY** without team discussion

### 3. `.gitignore` (Root)
- Protects sensitive files
- **DO NOT MODIFY** without senior review

### 4. `backend/validate_env.py`
- Validates environment configuration
- Run before every deployment

### 5. `backend/diagnose_oauth.py`
- Shows actual generated OAuth redirect URI
- Run after every deployment

---

## 🚀 Emergency Recovery Procedures

If production OAuth breaks:

### 1. Check Line Endings
```bash
ssh ubuntu@production
file /home/ubuntu/Plated/deploy.sh
# If CRLF: dos2unix deploy.sh
```

### 2. Check for Override Files
```bash
ssh ubuntu@production
rm /home/ubuntu/Plated/backend/env.development.local  # If exists
```

### 3. Verify Environment
```bash
cd /home/ubuntu/Plated/backend
python3 diagnose_oauth.py
```

### 4. Restart
```bash
cd /home/ubuntu/Plated
bash deploy.sh
```

---

## 📚 Related Documentation

- [Quick Reference Card](../../DEPLOYMENT_RULES_QUICKREF.md) - Quick checklist for deployments

---

## ⚖️ Rule Exceptions

**There are NO exceptions to these rules.**

If you believe a rule needs to be changed:
1. Discuss with senior developers
2. Document why the change is needed
3. Update this document
4. Notify entire team
5. Update CI/CD checks

**DO NOT make exceptions in emergency situations - that's how production breaks.**

