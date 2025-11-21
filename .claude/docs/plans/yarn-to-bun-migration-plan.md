# Yarn to Bun Migration Implementation Plan

**Goal:** Migrate the Plate monorepo from Yarn 4.6.0 to Bun 1.3.2 as the package manager

**Architecture:** Replace Yarn with Bun across all package management operations, CI/CD workflows, and documentation while maintaining the existing monorepo structure with Turbo and workspaces

**Tech Stack:** Bun 1.3.2, Turbo 2.5.4, TypeScript 5.8.3, Biome 2.3.6

**Testing Approach:** Manual verification with build, typecheck, and lint commands - logic is straightforward replacement work

---

## Task 1: Update Root Package Configuration

**Files:**
- Modify: `package.json:138-142`
- Delete: `.yarnrc.yml`

**Step 1: Update packageManager field**

```json
{
  "packageManager": "bun@1.3.2",
  "engines": {
    "node": ">=18.12.0",
    "npm": "please-use-bun",
    "bun": ">=1.3.0"
  }
}
```

**Step 2: Remove yarn configuration**

Run: `rm .yarnrc.yml`
Expected: File deleted

**Step 3: Commit package manager update**

```bash
git add package.json
git rm .yarnrc.yml
git commit -m "build: update package manager to bun@1.3.2"
```

---

## Task 2: Replace Yarn Scripts with Bun Commands

**Files:**
- Modify: `package.json:10-78`

**Step 1: Replace yarn with bun in all scripts**

Update the scripts section (changes shown for key scripts):

```json
{
  "scripts": {
    "brl": "bun g:brl",
    "build": "bun g:build",
    "build:apps": "turbo --filter \"./apps/www\" build",
    "build:templates": "turbo --filter \"./templates/**\" build",
    "build:tw": "bun workspace www build:tw",
    "build:watch": "ROARR_LOG=true turbowatch ./tooling/config/turbowatch.config.ts | roarr",
    "check": "bun lint && bun eslint",
    "deps:check": "bunx npm-check-updates@latest --configFileName config/ncurc.yml --workspaces --root --mergeConfig",
    "deps:update": "bunx npm-check-updates@latest --configFileName config/ncurc.yml -u --workspaces --root --mergeConfig",
    "dev": "turbo --filter=www dev",
    "dev:webrtc": "PORT=4444 node ./node_modules/y-webrtc/bin/server.js",
    "devt": "bun workspace www devt",
    "docs:build": "cd docs && bun install && bun build",
    "docs:start": "cd docs && bun install && bun start",
    "e2e": "bun playwright test --config tooling/config/playwright.config.ts",
    "g:Test:Watch": "turbo --filter \"./packages/**\" test:watch",
    "g:brl": "turbo --filter \"./packages/**\" brl",
    "g:build": "turbo --filter \"./packages/**\" build",
    "g:build:watch": "bun build:watch",
    "g:changeset": "changeset",
    "g:clean": "turbo --filter \"./packages/**\" clean",
    "g:dev": "turbo --filter=www dev",
    "g:plate-ui": "cd $INIT_CWD && COMPONENTS_REGISTRY_URL=http://http://localhost:3000 bun run -T plate-ui",
    "g:r": "bun workspace www r",
    "g:rd": "bun workspace www rd",
    "g:release:next": "bun build && changeset publish --tag next",
    "g:test": "turbo --filter \"./packages/**\" test",
    "g:test:cov": "bun g:test --coverage",
    "g:test:covw": "bun g:test:cov --watch",
    "g:test:covwa": "bun g:test:cov --watchAll",
    "g:test:wa": "bun g:test -- --watchAll",
    "g:test:watch": "bun g:test -- --watch",
    "g:typecheck": "turbo --filter \"./packages/**\" typecheck",
    "g:typecheck:all": "turbo typecheck",
    "gen:package": "bun plop --plopfile tooling/scripts/plop/plopfile.cjs package",
    "postinstall": "patch-package --patch-dir tooling/patches",
    "lint": "biome check .",
    "lint:fix": "biome check . --fix",
    "nuke:node_modules": "rimraf '**/node_modules'",
    "p:brl": "sh tooling/scripts/brl.sh",
    "p:build": "cd $INIT_CWD && bun p:tsup",
    "p:build:watch": "cd $INIT_CWD && bun p:tsup --watch",
    "p:clean": "cd $INIT_CWD && rimraf dist && jest --clear-cache",
    "p:lint": "biome check $INIT_CWD",
    "p:lint:fix": "biome check $INIT_CWD --fix",
    "p:test": "cd $INIT_CWD && jest --config=${PROJECT_CWD}/jest.config.cjs --maxWorkers=1 --passWithNoTests $INIT_CWD ",
    "p:tsup": "cd $INIT_CWD && tsup --config=${PROJECT_CWD}/tooling/config/tsup.config.ts",
    "p:typecheck": "cd $INIT_CWD && tsc -p $INIT_CWD/tsconfig.json",
    "r": "bun workspace www r",
    "rc": "turbo --filter=www rc",
    "rd": "bun workspace www rd",
    "release": "bun build && changeset publish",
    "shadcn:build": "bun workspace www shadcn:build",
    "sync:plate": "node templates/plate-playground-template/scripts/sync-plate.cjs",
    "sync:templates": "./tooling/scripts/sync-templates.sh \"templates/*\"",
    "test": "bun g:test",
    "test:nc": "bun g:test -- --no-cache",
    "test:r": "bun workspace www test:r",
    "test:wa": "bun g:test:wa",
    "test:watch": "bun g:test:watch",
    "translate": "ts-node tooling/scripts/translate.mjs",
    "typecheck": "bun g:typecheck",
    "typecheck:all": "bun g:typecheck:all",
    "verify": "turbo typecheck test"
  }
}
```

**Step 2: Verify typecheck**

Run: `bun run typecheck`
Expected: TypeScript checks pass (may need to install first)

**Step 3: Commit script updates**

```bash
git add package.json
git commit -m "build: replace yarn with bun in all scripts"
```

---

## Task 3: Generate Bun Lockfile

**Files:**
- Create: `bun.lock` (auto-generated)
- Delete: `yarn.lock`

**Step 1: Remove existing lockfile and dependencies**

Run: `rm yarn.lock && rm -rf node_modules`
Expected: Lockfile and node_modules deleted

**Step 2: Install dependencies with Bun**

Run: `bun install`
Expected: Dependencies installed and bun.lock created

**Step 3: Verify installation**

Run: `bun run typecheck`
Expected: No errors

**Step 4: Commit new lockfile**

```bash
git add bun.lock
git rm yarn.lock
git commit -m "build: generate bun.lock and remove yarn.lock"
```

---

## Task 4: Remove Yarn-Specific Files and Directories

**Files:**
- Delete: `.yarn/` directory
- Delete: `.yarnrc.yml` (if not already removed)

**Step 1: Remove .yarn directory**

Run: `rm -rf .yarn`
Expected: Directory deleted

**Step 2: Verify no yarn references remain**

Run: `find . -name ".yarn*" -o -name "yarn.lock" | grep -v node_modules | grep -v tmp`
Expected: No output (all yarn files removed)

**Step 3: Commit cleanup**

```bash
git add -A
git commit -m "build: remove yarn cache and configuration files"
```

---

## Task 5: Update GitHub Actions - Create Bun Install Action

**Files:**
- Create: `.github/actions/bun-install/action.yml`

**Step 1: Create new Bun install action**

```yaml
########################################################################################
# "bun install" composite action for Bun 1.3+                                          #
#--------------------------------------------------------------------------------------#
# Requirement: @setup/node should be run before (for node binary)                      #
#                                                                                      #
# Usage in workflows steps:                                                            #
#                                                                                      #
#      - name: 📥 Monorepo install                                                     #
#        uses: ./.github/actions/bun-install                                           #
#        with:                                                                         #
#          bun-version: '1.3.2'                     # (default = '1.3.2')              #
#          cache-prefix: add cache key prefix       # (default = 'default')            #
#                                                                                      #
########################################################################################

name: 'Monorepo install (bun)'
description: 'Run bun install with cache enabled'
inputs:
  bun-version:
    description: 'Bun version to use'
    required: false
    default: '1.3.2'
  cache-prefix:
    description: 'Add a specific cache-prefix'
    required: false
    default: 'default'

runs:
  using: 'composite'

  steps:
    - name: ⚙️ Setup Bun
      uses: oven-sh/setup-bun@v2
      with:
        bun-version: ${{ inputs.bun-version }}

    - name: ⚙️ Expose bun config as "$GITHUB_OUTPUT"
      id: bun-config
      shell: bash
      run: |
        echo "CURRENT_NODE_VERSION=node-$(node --version)" >> $GITHUB_OUTPUT
        echo "CURRENT_BRANCH=$(echo ${GITHUB_REF#refs/heads/} | sed -r 's,/,-,g')" >> $GITHUB_OUTPUT

    - name: ♻️ Restore bun cache
      uses: actions/cache@v4
      id: bun-cache
      with:
        path: ~/.bun/install/cache
        key: bun-cache-${{ inputs.cache-prefix }}-${{ runner.os }}-${{ steps.bun-config.outputs.CURRENT_NODE_VERSION }}-${{ hashFiles('bun.lock') }}
        restore-keys: |
          bun-cache-${{ inputs.cache-prefix }}-${{ runner.os }}-${{ steps.bun-config.outputs.CURRENT_NODE_VERSION }}-

    - name: 📥 Install dependencies
      shell: bash
      run: bun install --frozen-lockfile
      env:
        HUSKY: '0' # By default do not run HUSKY install
```

**Step 2: Verify action syntax**

Run: `cat .github/actions/bun-install/action.yml`
Expected: Valid YAML with correct structure

**Step 3: Commit new action**

```bash
git add .github/actions/bun-install/action.yml
git commit -m "ci: add bun install GitHub action"
```

---

## Task 6: Update CI Workflow - Lint and Typecheck

**Files:**
- Modify: `.github/workflows/lint-typecheck.yml:12-13,32-33,63,66,74,77,80`

**Step 1: Update path triggers to use bun.lock**

```yaml
on:
  push:
    branches:
      - main
      - next
    paths:
      - 'packages/**'
      - '.github/actions/**'
      - '.github/workflows/lint-typecheck.yml'
      - 'bun.lock'
      - 'biome.jsonc'
      - 'eslint*'
      - 'jest.config.js'
      - 'tsconfig.json'
      - 'turbo.json'
      - 'config'
      - 'scripts'
      - 'patches'
  pull_request:
    types:
      - opened
      - synchronize
      - reopened
    paths:
      - 'packages/**'
      - '.github/actions/**'
      - '.github/workflows/**'
      - 'bun.lock'
      - 'biome.jsonc'
      - 'eslint*'
      - 'jest.config.js'
      - 'tsconfig.json'
      - 'turbo.json'
      - 'config'
      - 'scripts'
      - 'patches'

  workflow_dispatch:

# Add concurrency to cancel redundant runs
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  ci:
    name: CI
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: 📥 Monorepo install
        uses: ./.github/actions/bun-install

      - name: 🔬 Lint
        run: bun check

      - name: ♻️ Restore packages cache
        uses: actions/cache@v4
        with:
          path: |
            ${{ github.workspace }}/.cache
            ${{ github.workspace }}/**/tsconfig.tsbuildinfo
          key: packages-cache-${{ runner.os }}-${{ hashFiles('bun.lock') }}

      - name: 🏗 Build
        run: bun build

      - name: 🕵️ Typecheck + 🧪 Test (parallel)
        run: bun verify

  notify-failure:
    name: Discord Notification
    runs-on: ubuntu-latest
    needs: [ci]
    if: ${{ github.event_name == 'push' && failure() }}

    steps:
      - name: Send Discord Notification
        uses: nobrayner/discord-webhook@v1
        with:
          github-token: ${{ secrets.X_GITHUB_READ_ACTIONS_TOKEN }}
          discord-webhook: ${{ secrets.DISCORD_CI_WEBHOOK }}
          description: ${{ github.event.number && format('https://github.com/udecode/plate/pull/{0}', github.event.number) || 'Push' }}
```

**Step 2: Verify workflow syntax**

Run: `cat .github/workflows/lint-typecheck.yml`
Expected: Valid YAML with bun references

**Step 3: Commit workflow update**

```bash
git add .github/workflows/lint-typecheck.yml
git commit -m "ci: update lint-typecheck workflow to use bun"
```

---

## Task 7: Update Release Workflow

**Files:**
- Modify: `.github/workflows/release.yml:27,36`

**Step 1: Replace yarn-nm-install with bun-install**

```yaml
name: ReleaseOrVersionPR

on:
  push:
    branches: [main]

jobs:
  release:
    name: Release and changelog
    runs-on: ubuntu-latest
    # Basic security: the release job can only be executed from this repo and from the main branch
    if: ${{ github.repository == 'udecode/plate' && contains('refs/heads/main',github.ref)}}

    steps:
      - name: 📥 Checkout Repo
        uses: actions/checkout@v4
        with:
          # To run comparison we need more than the latest commit
          fetch-depth: 0

      - name: ♻️ Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: 📦 Monorepo install
        uses: ./.github/actions/bun-install

      # @link https://github.com/changesets/action
      - name: 🦋 Create Release Pull Request or Publish
        id: changesets
        uses: changesets/action@v1
        with:
          cwd: ${{ github.workspace }}
          title: '[Release] Version packages'
          publish: bun release
        env:
          # See https://github.com/changesets/action/issues/147
          HOME: ${{ github.workspace }}
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**Step 2: Commit release workflow update**

```bash
git add .github/workflows/release.yml
git commit -m "ci: update release workflow to use bun"
```

---

## Task 8: Update Remaining GitHub Workflows

**Files:**
- Modify: `.github/workflows/ci-templates.yml`
- Modify: `.github/workflows/sync-templates.yml`
- Modify: `.github/workflows/registry.yml`
- Modify: `.github/workflows/notify-release.yml`
- Modify: `.github/workflows/claude-*.yml` (all Claude workflows)

**Step 1: Find and update all workflow files**

For each workflow file, replace:
- `./.github/actions/yarn-nm-install` → `./.github/actions/bun-install`
- `yarn ` → `bun ` in run commands
- `hashFiles('yarn.lock')` → `hashFiles('bun.lock')`

Run: `find .github/workflows -name "*.yml" -exec sed -i '' 's/yarn-nm-install/bun-install/g' {} +`
Expected: All workflow files updated

Run: `find .github/workflows -name "*.yml" -exec sed -i '' 's/yarn /bun /g' {} +`
Expected: All yarn commands replaced with bun

Run: `find .github/workflows -name "*.yml" -exec sed -i '' "s/hashFiles('yarn.lock')/hashFiles('bun.lock')/g" {} +`
Expected: All lockfile references updated

**Step 2: Manually review workflow files**

Run: `git diff .github/workflows/`
Expected: Changes look correct

**Step 3: Commit all workflow updates**

```bash
git add .github/workflows/
git commit -m "ci: update all workflows to use bun"
```

---

## Task 9: Delete Old Yarn Install Action

**Files:**
- Delete: `.github/actions/yarn-nm-install/`

**Step 1: Remove yarn install action**

Run: `rm -rf .github/actions/yarn-nm-install`
Expected: Directory deleted

**Step 2: Commit deletion**

```bash
git add -A
git commit -m "ci: remove deprecated yarn-nm-install action"
```

---

## Task 10: Update CLAUDE.md Documentation

**Files:**
- Modify: `CLAUDE.md:19-50`

**Step 1: Update Commands section**

```markdown
## Commands

### Development

**CRITICAL**: Before running type checking, you must first install dependencies and build the affected packages and their dependencies.

**Required sequence for type checking modified packages:**

1. `bun install` - Install all dependencies and update lockfile if needed
2. `bun turbo build --filter=./packages/modified-package` - Build only the modified package and its dependencies
3. `bun turbo typecheck --filter=./packages/modified-package` - Run TypeScript type checking for modified package
4. `bun turbo lint:fix --filter=./packages/modified-package` - Auto-fix linting issues for modified package

**For multiple modified packages:**

```bash
# Build multiple specific packages and their dependencies
bun turbo build --filter=./packages/core --filter=./packages/utils

# Typecheck multiple packages
bun turbo typecheck --filter=./packages/core --filter=./packages/utils

# Lint multiple packages
bun turbo lint:fix --filter=./packages/core --filter=./packages/utils
```

**Alternative approaches:**

```bash
# Build since last commit (useful for PR changes)
bun turbo build --filter='[HEAD^1]'

# Build all changed packages in current branch
bun turbo build --filter='...[origin/main]'

# For workspace-specific operations
bun workspace @platejs/core build
bun workspace @platejs/core typecheck
bun workspace @platejs/core lint:fix
```

**Full project commands (use only if needed, these are very slow):**

- `bun build` - Build all packages (only use when necessary)
- `bun test` - Run tests (or `turbo test --filter=./packages/modified-package` for specific packages)

### Database

<!-- Run /create-tech-stack to document your database commands -->
<!-- Example: -->
<!-- - `bun db:generate` - Generate database schema -->
<!-- - `bun db:migrate` - Run database migrations -->

### Testing

- `bun test` - Run all unit tests
- `bun workspace <package-name> test` - Run tests for a specific package
- See **@.cursor/rules/testing.mdc** for comprehensive testing guidelines
```

**Step 2: Commit CLAUDE.md updates**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md to use bun commands"
```

---

## Task 11: Update Tech Stack Documentation

**Files:**
- Modify: `.cursor/rules/tech-stack.mdc` (multiple sections)

**Step 1: Update Package Manager section**

Find and replace in tech-stack.mdc:

```markdown
### Package Manager

```yaml
# No configuration needed - Bun uses package.json packageManager field
```

### Code Quality Tools

#### ESLint Configuration

- **Version**: 9.28.0 with flat config
- Custom rules for React, TypeScript
- Import sorting and organization
- Accessibility checks

#### Prettier Setup

- **Version**: 3.5.3

```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 80
}
```

### Type Checking

**Important**: Before running `bun typecheck`, you must first run `bun install --frozen-lockfile`, then `bun build` to ensure all packages are built and type definitions are available.

```bash
# Required sequence for type checking
bun install --frozen-lockfile  # Install all dependencies
bun run build                  # Build all packages (generates type definitions)
bun typecheck                  # Check all packages
```

### Testing Strategy

#### Unit Testing

- **Framework**: Jest 29.7.0 with SWC
- **Configuration**:
  ```javascript
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest'
  }
  ```

#### E2E Testing

- **Framework**: Playwright
- **Target**: Chrome, Firefox, Safari
- **Location**: apps/e2e-examples

### Development Workflow

**Important**: For monorepo type checking, always build packages first.

```bash
# Required sequence for development
bun install --frozen-lockfile  # Install dependencies
bun run build                  # Build all packages first
bun typecheck                  # Type checking (requires built packages)

# Other development commands
bun dev                        # Start development server
bun run test                   # Run tests
bun lint                       # Run Biome linter
```

These are root commands, but if you modified just a few packages, it's more efficient to run those commands in the modified packages.
```

**Step 2: Commit tech stack updates**

```bash
git add .cursor/rules/tech-stack.mdc
git commit -m "docs: update tech stack documentation for bun"
```

---

## Task 12: Update Main README

**Files:**
- Modify: `README.md` (if it contains installation instructions)

**Step 1: Find installation instructions**

Run: `grep -n "yarn\|npm install" README.md`
Expected: Lines with installation commands (if any)

**Step 2: Update installation commands**

Replace any:
- `yarn install` → `bun install`
- `yarn add` → `bun add`
- `yarn dev` → `bun dev`
- `yarn build` → `bun build`

**Step 3: Commit README updates**

```bash
git add README.md
git commit -m "docs: update README with bun installation instructions"
```

---

## Task 13: Update Template Workflows

**Files:**
- Modify: `templates/plate-template/.github/workflows/build.yml`
- Modify: `templates/plate-playground-template/.github/workflows/build.yml`

**Step 1: Update plate-template workflow**

In `templates/plate-template/.github/workflows/build.yml`, replace yarn references with bun:

```yaml
# Update install steps to use bun
# Replace yarn commands with bun commands
# Update cache keys to use bun.lock
```

**Step 2: Update plate-playground-template workflow**

Same changes for `templates/plate-playground-template/.github/workflows/build.yml`

**Step 3: Commit template workflow updates**

```bash
git add templates/*/./github/workflows/
git commit -m "ci: update template workflows to use bun"
```

---

## Task 14: Test Build and Typecheck

**Files:**
- None (testing only)

**Step 1: Clean and reinstall**

Run: `rm -rf node_modules && bun install`
Expected: Clean installation completes

**Step 2: Test build**

Run: `bun build`
Expected: All packages build successfully

**Step 3: Test typecheck**

Run: `bun typecheck`
Expected: No type errors

**Step 4: Test linting**

Run: `bun check`
Expected: No linting errors

**Step 5: Test individual package operations**

Run: `bun turbo typecheck --filter=./packages/core`
Expected: Core package typechecks successfully

---

## Task 15: Create Migration Summary

**Files:**
- Create: `.claude/docs/bun-migration-summary.md`

**Step 1: Create migration summary document**

```markdown
# Bun Migration Summary

## Migration Completed: [Date]

### Changes Made

1. **Package Manager**: Yarn 4.6.0 → Bun 1.3.2
2. **Lockfile**: yarn.lock → bun.lock
3. **Configuration**: Removed .yarnrc.yml and .yarn/ directory
4. **Scripts**: All package.json scripts updated from yarn to bun
5. **CI/CD**: All GitHub workflows updated to use bun-install action
6. **Documentation**: CLAUDE.md, tech-stack.mdc, and README.md updated

### Files Removed

- `.yarnrc.yml`
- `yarn.lock`
- `.yarn/` directory
- `.github/actions/yarn-nm-install/`

### Files Created

- `bun.lock`
- `.github/actions/bun-install/action.yml`

### Files Modified

- `package.json` (packageManager, engines, all scripts)
- All `.github/workflows/*.yml` files
- `CLAUDE.md`
- `.cursor/rules/tech-stack.mdc`
- `README.md`
- Template workflow files

### Key Commands Changed

| Old Command | New Command |
|-------------|-------------|
| `yarn install` | `bun install` |
| `yarn build` | `bun build` |
| `yarn test` | `bun test` |
| `yarn workspace X Y` | `bun workspace X Y` |
| `npx command` | `bunx command` |

### Performance Improvements

- Faster dependency installation
- Faster script execution
- Simpler configuration
- Better monorepo support out of the box

### Breaking Changes

- Developers must install Bun 1.3.2 or later
- All local yarn commands must be replaced with bun
- CI/CD now requires oven-sh/setup-bun action

### Migration Verification Checklist

- [x] Dependencies install correctly
- [x] Build process works
- [x] Typecheck passes
- [x] Linting works
- [x] Tests run successfully
- [x] CI/CD workflows updated
- [x] Documentation updated
- [x] Template projects updated

### Next Steps

1. Update team documentation
2. Notify contributors about the change
3. Update contributing guidelines if needed
4. Monitor first CI runs after merge
5. Update any external tooling that depends on yarn

### Rollback Plan

If issues arise:

1. Revert commits in reverse order
2. Run `yarn install` to restore yarn.lock
3. Rebuild with `yarn build`
4. Notify team of rollback

### References

- Bun Documentation: https://bun.sh/docs
- Migration reference: tmp/ultracite project
- GitHub Action: https://github.com/oven-sh/setup-bun
```

**Step 2: Commit migration summary**

```bash
git add .claude/docs/bun-migration-summary.md
git commit -m "docs: add bun migration summary"
```

---

## Task 16: Final Verification and Push

**Files:**
- None (verification only)

**Step 1: Verify all tests pass**

Run: `bun verify`
Expected: All tests and typechecking pass

**Step 2: Review all commits**

Run: `git log --oneline origin/main..HEAD`
Expected: Clean commit history with descriptive messages

**Step 3: Create migration branch and push**

Run: `git checkout -b migration/yarn-to-bun && git push -u origin migration/yarn-to-bun`
Expected: Branch pushed to remote

**Step 4: Open pull request**

- Title: "Migration: Replace Yarn with Bun"
- Description: Reference migration summary document
- Include verification checklist

---

## Execution Complete

**Estimated Time**: 2-3 hours for full migration
**Risk Level**: Medium (affects all development workflows)
**Reversibility**: High (can revert commits if needed)

**Post-Migration Monitoring:**
- Watch CI/CD runs for first week
- Monitor developer feedback
- Document any edge cases discovered
- Update troubleshooting guide as needed
