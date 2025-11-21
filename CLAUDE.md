# CLAUDE.md

## Project Overview

- @.cursor/rules/app-design-document.mdc - App design document
- @.cursor/rules/tech-stack.mdc - Tech stack, architecture

## Commands

### Development

**CRITICAL**: Before running type checking, you must first install dependencies and build the affected packages and their dependencies.

**Required sequence for type checking modified packages:**

1. `yarn install` - Install all dependencies and update lockfile if needed
2. `yarn turbo build --filter=./packages/modified-package` - Build only the modified package and its dependencies
3. `yarn turbo typecheck --filter=./packages/modified-package` - Run TypeScript type checking for modified package
4. `yarn turbo lint:fix --filter=./packages/modified-package` - Auto-fix linting issues for modified package

**For multiple modified packages:**

```bash
# Build multiple specific packages and their dependencies
yarn turbo build --filter=./packages/core --filter=./packages/utils

# Typecheck multiple packages
yarn turbo typecheck --filter=./packages/core --filter=./packages/utils

# Lint multiple packages
yarn turbo lint:fix --filter=./packages/core --filter=./packages/utils
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

- `yarn test` - Run tests (or `turbo test --filter=./packages/modified-package` for specific packages)

### Database

<!-- Run /create-tech-stack to document your database commands -->
<!-- Example: -->
<!-- - `pnpm db:generate` - Generate database schema -->
<!-- - `pnpm db:migrate` - Run database migrations -->

### Testing

- `yarn test` - Run all unit tests
- `yarn workspace <package-name> test` - Run tests for a specific package
- See **@.cursor/rules/testing.mdc** for comprehensive testing guidelines

## Development Rules

This CLAUDE.md file references Cursor rules rather than duplicating them. This approach ensures:

- Updates to Cursor rules automatically apply to Claude Code
- Single source of truth for development patterns
- Consistent behavior between Cursor and Claude Code
- Easier maintenance of coding standards

The @.cursor/rules/ references below tell Claude Code to follow the same rules that Cursor uses.

### Core Development Guidelines

**@.cursor/rules/cursor-rules.mdc**

- Context: Creating and maintaining Cursor rules to ensure consistency and effectiveness
- Applies to: .cursor/rules/\*.mdc
- Required structure, frontmatter, formatting, and AI optimization guidelines for rule files

**@.cursor/rules/project-status.mdc**

- Context: Project stage assessment and stage-based development priorities
- Applies to: All development decisions and feature implementations
- Stage-based guidelines (Pre-MVP, MVP, Production, Enterprise) with specific DO/DON'T lists

**@.cursor/rules/self-improve.mdc**

- Context: Continuously improving rules based on emerging code patterns and best practices
- Applies to: \*_/_
- Pattern recognition, rule updates, quality checks, and documentation maintenance

**@.cursor/rules/testing.mdc**

- Context: Writing unit tests using Jest, React Testing Library, and Slate Hyperscript JSX
- Applies to: packages/**/\*.spec.{ts,tsx}, packages/**/\*.test.{ts,tsx}
- Comprehensive testing patterns including plugin testing, transforms, mocking, and test utilities
