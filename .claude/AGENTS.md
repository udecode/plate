- In all interactions and commit messages, be extremely concise and sacrifice grammar for the sake of concision.

## PR Comments

- When tagging Claude in GitHub issues, use '@claude'

## GitHub

- Your primary method for interacting with GitHub should be the GitHub CLI.

## Plans

- At the end of each plan, give me a list of unresolved questions to answer, if any. Make the questions extremely concise. Sacrifice grammar for the sake of concision.

## Commands

### Development

**CRITICAL**: Before running type checking, you must first install dependencies and build the affected packages and their dependencies.

**Required sequence for type checking modified packages:**

1. `yarn install` - Install all dependencies and update lockfile if needed
2. `yarn turbo build --filter=./packages/modified-package` - Build only the modified package and its dependencies
3. `yarn turbo typecheck --filter=./packages/modified-package` - Run TypeScript type checking for modified package
4. `yarn lint:fix` - Auto-fix linting issues

**For multiple modified packages:**

```bash
# Build multiple specific packages and their dependencies
yarn turbo build --filter=./packages/core --filter=./packages/utils

# Typecheck multiple packages
yarn turbo typecheck --filter=./packages/core --filter=./packages/utils

# Lint multiple packages
yarn lint:fix
```

**Alternative approaches:**

```bash
# Build since last commit (useful for PR changes)
yarn turbo build --filter='[HEAD^1]'

# Build all changed packages in current branch
yarn turbo build --filter='...[origin/main]'

# For workspace-specific operations
yarn workspace @platejs/core build
yarn workspace @platejs/core typecheck
yarn workspace @platejs/core lint:fix
```

**Full project commands (use only if needed, these are very slow):**

- `yarn build` - Build all packages (only use when necessary)

- `yarn test` - Run tests
