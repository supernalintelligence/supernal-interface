# Publishing Guide for @supernal-interface/core

## 🚀 Automated Publishing Workflow

This package is set up with automated publishing to NPM and deployment to Vercel using GitHub Actions.

## 📋 Prerequisites

### Required Secrets in GitHub Repository

1. **NPM_TOKEN**: NPM authentication token for publishing
2. **VERCEL_TOKEN**: Vercel deployment token
3. **VERCEL_ORG_ID**: Vercel organization ID
4. **VERCEL_PROJECT_ID**: Vercel project ID for interface.supernal.ai
5. **GTM_CONTAINER_ID**: Google Tag Manager container ID

### Setting up NPM Token

```bash
# Login to NPM
npm login

# Generate automation token
npm token create --type=automation

# Add token to GitHub Secrets as NPM_TOKEN
```

### Setting up Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login and get project info
vercel login
vercel link
vercel env ls

# Get org and project IDs from .vercel/project.json
```

## 🔄 Publishing Methods

### Method 1: Manual Release (Recommended)

```bash
# For patch release (1.0.0 -> 1.0.1)
npm run release:patch

# For minor release (1.0.0 -> 1.1.0)
npm run release:minor

# For major release (1.0.0 -> 2.0.0)
npm run release:major
```

### Method 2: GitHub Actions Workflow Dispatch

1. Go to GitHub Actions tab
2. Select "Publish to NPM" workflow
3. Click "Run workflow"
4. Choose version type (patch/minor/major)
5. Click "Run workflow"

### Method 3: Git Tag Release

```bash
# Create and push a version tag
git tag v1.0.1
git push origin v1.0.1

# This triggers automatic publishing
```

## 🔍 Pre-push Checks

Every push runs comprehensive checks:

### Local Pre-push Hook
```bash
# Runs automatically on git push
npm run pre-push

# Or run manually
./scripts/pre-push.sh
```

### GitHub Actions Checks
- ✅ ESLint validation
- ✅ TypeScript compilation
- ✅ Unit tests
- ✅ Package build
- ✅ Demo build
- ✅ Artifact verification

## 📦 Package Structure

```
@supernal-interface/core/
├── src/                 # Source TypeScript files
├── dist/                # Built JavaScript files (auto-generated)
├── demo/                # Demo application
├── tests/               # Test files
├── scripts/             # Build and deployment scripts
├── .github/workflows/   # GitHub Actions
└── package.json         # Package configuration
```

## 🏗️ Build Process

### Core Package Build
```bash
cd core
npm run build          # Compile TypeScript to dist/
npm run test           # Run Jest tests
npm run lint           # Run ESLint
```

### Demo Build
```bash
cd core/demo
npm run build          # Build Next.js application
npm run start          # Start production server
```

## 🌐 Deployment Pipeline

### NPM Publishing
1. **Pre-publish**: Runs build, test, and lint
2. **Version**: Updates package.json version
3. **Publish**: Publishes to NPM registry
4. **Post-publish**: Pushes git tags

### Vercel Deployment
1. **Build**: Compiles Next.js demo
2. **Deploy**: Deploys to interface.supernal.ai
3. **Environment**: Uses production GTM container

## 🔧 Environment Variables

### For Demo Deployment
```bash
# Required for analytics
NEXT_PUBLIC_GTM_CONTAINER_ID=GTM-XXXXXXX

# Optional
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_DEBUG_MODE=false
```

### For GitHub Actions
```yaml
env:
  NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
  NEXT_PUBLIC_GTM_CONTAINER_ID: ${{ secrets.GTM_CONTAINER_ID }}
```

## 📊 Release Checklist

Before releasing:

- [ ] All tests pass locally
- [ ] Demo builds and runs correctly
- [ ] Documentation is up to date
- [ ] Version number is appropriate
- [ ] CHANGELOG.md is updated
- [ ] No TODO/FIXME in production code
- [ ] Build artifacts are clean

## 🐛 Troubleshooting

### Build Failures
```bash
# Clean build
rm -rf dist node_modules
npm install
npm run build
```

### Test Failures
```bash
# Run tests with coverage
npm run test:coverage

# Run specific test
npm run test -- --testNamePattern="ToolRegistry"
```

### Publishing Issues
```bash
# Check NPM authentication
npm whoami

# Verify package.json
npm run prepublishOnly

# Dry run publish
npm publish --dry-run
```

### Demo Deployment Issues
```bash
# Test local build
cd demo
npm run build
npm run start

# Check environment variables
echo $NEXT_PUBLIC_GTM_CONTAINER_ID
```

## 📈 Monitoring

### NPM Package
- **Registry**: https://www.npmjs.com/package/@supernal-interface/core
- **Downloads**: Track via NPM dashboard
- **Issues**: Monitor GitHub Issues

### Demo Site
- **URL**: https://interface.supernal.ai
- **Analytics**: Google Tag Manager dashboard
- **Performance**: Vercel analytics

## 🔄 Version Strategy

- **Patch** (1.0.x): Bug fixes, documentation updates
- **Minor** (1.x.0): New features, backward compatible
- **Major** (x.0.0): Breaking changes, API changes

## 🎯 Automated Workflows

### On Push to Main
- Run all pre-push checks
- Build and test everything
- Deploy demo to staging (if configured)

### On Version Tag
- Run full test suite
- Build and publish to NPM
- Deploy demo to production
- Create GitHub release

### On Pull Request
- Run pre-push checks
- Build verification
- Comment with build status

---

**Ready for Production**: All workflows tested and verified ✅
