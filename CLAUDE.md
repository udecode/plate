# CLAUDE.md

## Project Overview

- @.cursor/rules/app-design-document.mdc - App design document
- @.cursor/rules/tech-stack.mdc - Tech stack, architecture

## Project Status

**Current Stage**: Framework Development (Fast-moving library with monthly breaking changes)

### DO Care About (Framework Excellence)

- **API Design**: Clean, intuitive, and powerful APIs that enable developers
- **Developer Experience**: Smooth onboarding, clear patterns, excellent TypeScript support
- **Plugin Architecture**: Extensible, composable, and maintainable plugin system
- **Documentation**: Comprehensive guides, API references, and examples
- **Performance**: Editor performance and bundle size optimization
- **Innovation**: Pushing boundaries with AI integration and modern editing features

### DO NOT Care About (Skip for Velocity)

- **Breaking Changes**: Monthly releases with breaking changes are acceptable
- **100% Backward Compatibility**: Move fast, deprecate quickly
- **Legacy Support**: Focus on modern React and browser environments
- **Perfect Stability**: Iterate rapidly based on community feedback

### Development Approach

- **Focus**: Innovation and developer experience over stability
- **Philosophy**: "Move fast and improve things" - rapid iteration with community
- **Release Cycle**: Monthly releases with clear migration guides
- **Community-Driven**: Responsive to user needs and feature requests

## Commands

### Development

**CRITICAL**: Before running type checking, you must first install dependencies and build the affected packages and their dependencies.

**Required sequence for type checking modified packages:**

1. `pnpm install` - Install all dependencies and update lockfile if needed
2. `pnpm turbo build --filter=./packages/modified-package` - Build only the modified package and its dependencies
3. `pnpm turbo typecheck --filter=./packages/modified-package` - Run TypeScript type checking for modified package
4. `pnpm turbo lint:fix --filter=./packages/modified-package` - Auto-fix linting issues for modified package

**For multiple modified packages:**

```bash
# Build multiple specific packages and their dependencies
pnpm turbo build --filter=./packages/core --filter=./packages/utils

# Typecheck multiple packages
pnpm turbo typecheck --filter=./packages/core --filter=./packages/utils

# Lint multiple packages
pnpm turbo lint:fix --filter=./packages/core --filter=./packages/utils
```

**Alternative approaches:**

```bash
# Build since last commit (useful for PR changes)
pnpm turbo build --filter='[HEAD^1]'

# Build all changed packages in current branch
pnpm turbo build --filter='...[origin/main]'

# For workspace-specific operations using Turbo filters
turbo build --filter=@platejs/core
turbo typecheck --filter=@platejs/core
turbo lint:fix --filter=@platejs/core

# For apps workspace
turbo build --filter=www
turbo dev --filter=www
```

**Full project commands (use only if needed, these are very slow):**

- `pnpm build` - Build all packages (only use when necessary)

- `pnpm test` - Run tests (or `turbo test --filter=./packages/modified-package` for specific packages)

### Database

<!-- Run /create-tech-stack to document your database commands -->
<!-- Example: -->
<!-- - `pnpm db:generate` - Generate database schema -->
<!-- - `pnpm db:migrate` - Run database migrations -->

### Testing

- `pnpm test` - Run all unit tests
- `turbo test --filter=<package-name>` - Run tests for a specific package
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
