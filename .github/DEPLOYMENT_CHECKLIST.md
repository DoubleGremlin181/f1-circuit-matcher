# GitHub Pages Deployment Checklist

Follow this checklist to ensure GitHub Pages deployment is working correctly.

## ✅ Pre-Deployment Setup

- [ ] **Repository is public** (or you have GitHub Pro for private repos with Pages)
- [ ] **DNS is configured** to point `circuit-sketch.kavi.sh` to GitHub Pages
  - CNAME record: `circuit-sketch` → `doublegremlin181.github.io`

## ✅ GitHub Pages Configuration (CRITICAL)

- [ ] **Navigate to repository Settings → Pages**
  - URL: https://github.com/DoubleGremlin181/f1-circuit-matcher/settings/pages
  
- [ ] **Set Source to GitHub Actions**
  - Under "Build and deployment" section
  - "Source" dropdown: Select **"GitHub Actions"** (NOT "Deploy from a branch")
  - This is the #1 reason deployments fail!

- [ ] **Configure Custom Domain** (if not already set)
  - Enter: `circuit-sketch.kavi.sh`
  - Click "Save"
  - Enable "Enforce HTTPS" after DNS check completes

## ✅ Verify Workflow Files Exist

- [ ] `.github/workflows/deploy.yml` exists and contains proper configuration
- [ ] `public/CNAME` file contains `circuit-sketch.kavi.sh`
- [ ] `public/.nojekyll` file exists (prevents Jekyll processing)

## ✅ Test Deployment

- [ ] **Push to main branch** or manually trigger workflow
  - Go to Actions tab
  - Select "Deploy to GitHub Pages"
  - Click "Run workflow" (if testing manually)

- [ ] **Check workflow status**
  - Workflow should show green checkmark (✓)
  - Both "build" and "deploy" jobs should succeed
  - Look for any red X (✗) indicating failures

- [ ] **Verify deployment status**
  - Settings → Pages should show: "Your site is live at https://circuit-sketch.kavi.sh/"
  - If it says "ready to be published", check the Source setting again

- [ ] **Test live site**
  - Visit https://circuit-sketch.kavi.sh/
  - Page should load the Circuit Sketch application
  - Test drawing a shape to verify functionality

## 🔧 Common Issues

### Workflow fails with "404 - File not found"
→ GitHub Pages source is not set to "GitHub Actions" - go to Settings → Pages and fix this

### Workflow succeeds but site shows 404
→ GitHub Pages is not enabled or takes 1-2 minutes to activate after first deployment

### Custom domain doesn't work
→ Check DNS propagation (can take up to 24 hours) or verify CNAME record is correct

---

## ✅ You're Done!

Once all items are checked, your GitHub Pages deployment should be working. The site will automatically redeploy on every push to the `main` branch.

For detailed troubleshooting, see [DEPLOYMENT.md](../../DEPLOYMENT.md)
