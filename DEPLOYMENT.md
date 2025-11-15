# GitHub Pages Deployment Guide

This document explains how to deploy Circuit Sketch to GitHub Pages with a custom domain.

## ⚠️ CRITICAL FIRST STEP

**Before the deployment will work, you MUST configure GitHub Pages in your repository settings:**

1. Go to https://github.com/DoubleGremlin181/f1-circuit-matcher/settings/pages
2. Under "Build and deployment" > "Source": Select **GitHub Actions** (NOT "Deploy from a branch")
3. Click Save

Without this configuration, the deployment workflow will fail with a 404 error, even though the workflow appears to run successfully.

## Prerequisites

- Repository is public or you have GitHub Pages enabled for private repos
- DNS is configured to point circuit-sketch.kavi.sh to GitHub Pages

## Initial Setup

### 1. Enable GitHub Pages

**This is the most important step - the deployment will not work without it.**

1. Go to your repository settings: https://github.com/DoubleGremlin181/f1-circuit-matcher/settings/pages
2. Navigate to "Pages" in the left sidebar
3. Under "Build and deployment":
   - **Source: GitHub Actions** (This is crucial!)
4. The workflow will automatically deploy on pushes to `main`

### 2. Configure Custom Domain

The CNAME file in the `public/` directory will automatically configure the custom domain when deployed.

If you need to manually configure it:
1. Go to repository Settings > Pages
2. Under "Custom domain", enter: `circuit-sketch.kavi.sh`
3. Click Save
4. Enable "Enforce HTTPS" (wait for DNS check to complete)

### 3. DNS Configuration

Ensure your DNS has the following records:

```
Type: CNAME
Host: circuit-sketch
Value: <username>.github.io
TTL: 3600 (or your preference)
```

Or if using A records for apex domain:
```
Type: A
Host: circuit-sketch
Value: 185.199.108.153
Value: 185.199.109.153
Value: 185.199.110.153
Value: 185.199.111.153
```

## Automatic Deployment

The site automatically deploys when you push to the `main` branch via the `.github/workflows/deploy.yml` workflow.

## Manual Deployment

You can manually trigger a deployment:
1. Go to Actions tab
2. Select "Deploy to GitHub Pages" workflow
3. Click "Run workflow"

## Verify Deployment

### Step 1: Check Workflow Status
1. Go to https://github.com/DoubleGremlin181/f1-circuit-matcher/actions
2. Look for the "Deploy to GitHub Pages" workflow
3. Verify it shows a green checkmark (✓) for the latest run
4. If it shows a red X (✗), click on it to see the error logs

### Step 2: Confirm GitHub Pages is Active
1. Go to https://github.com/DoubleGremlin181/f1-circuit-matcher/settings/pages
2. You should see "Your site is live at https://circuit-sketch.kavi.sh/"
3. If you see "Your site is ready to be published", the Pages setting is not configured correctly

### Step 3: Test the Live Site
1. Visit https://circuit-sketch.kavi.sh/
2. The page should load the Circuit Sketch application
3. Try drawing a shape to verify functionality

## Troubleshooting

### ❌ "404 - File not found" Error in Workflow

**Cause:** GitHub Pages source is not set to "GitHub Actions"

**Solution:**
1. Go to https://github.com/DoubleGremlin181/f1-circuit-matcher/settings/pages
2. Under "Build and deployment" > "Source"
3. Change from "Deploy from a branch" to **"GitHub Actions"**
4. Re-run the workflow: Actions → Deploy to GitHub Pages → Re-run jobs

### ❌ Workflow Succeeds but Site Shows 404

**Cause:** GitHub Pages is not enabled or misconfigured

**Solution:**
1. Verify Pages is enabled at Settings > Pages
2. Confirm "Source" is set to "GitHub Actions"
3. Check if the repository is public (or you have GitHub Pages for private repos)
4. Wait 1-2 minutes after the workflow completes, then refresh

### ⚠️ DNS Not Resolving
- Wait up to 24 hours for DNS propagation
- Use `dig circuit-sketch.kavi.sh` to check DNS records
- Verify kavi.sh DNS is properly configured

### ⚠️ Custom Domain Not Working
- Check repository Settings > Pages for any warnings
- Ensure CNAME file contains: `circuit-sketch.kavi.sh`
- Try removing and re-adding the custom domain in settings
- Verify DNS CNAME record points to: `doublegremlin181.github.io`

## Monthly Data Updates

Circuit data automatically updates via `.github/workflows/update-data.yml`:
- Runs on the 1st of every month at 00:00 UTC
- Fetches latest circuit layouts
- Scrapes updated Wikipedia data
- Commits changes back to the repository
- Triggers a new deployment automatically

## Local Preview

To preview the production build locally:

```bash
npm run build
npm run preview
```

Then visit http://localhost:4173
