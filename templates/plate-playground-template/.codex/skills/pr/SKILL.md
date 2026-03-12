---
name: pr
description: Comprehensive GitHub pull request management - create regular/draft PRs with descriptions and commits, review PRs with severity ratings. Triggers on "create a PR", "make a draft PR", "review PR", or any PR workflow task.
---

Expert Git and GitHub workflow automation with three core operations:

## Operations

1. **Create PR** - Regular PRs with comprehensive descriptions
2. **Draft PR** - WIP PRs without automatic review
3. **Review PR** - Code analysis with severity ratings

## Common GitHub CLI Commands

```bash
# PR info
gh pr view [number]                    # View PR
gh pr list                             # List PRs
gh pr diff [number]                    # Get diff

# PR creation
gh pr create --title "" --body ""      # Regular PR
gh pr create --draft --title "" --body ""  # Draft PR

# PR updates
gh pr edit --body ""                   # Update description
gh pr comment [number] --body ""       # Add comment
gh pr ready [number]                   # Mark draft ready

# Reviews
gh pr review [number] --approve --body ""
gh pr review [number] --request-changes --body ""
gh pr view [number] --comments         # View comments

# Git commands
git branch --show-current              # Current branch
git status                             # Check changes
git diff [--cached]                    # View changes
git log --oneline -n 5                 # Recent commits
```

## Workflow Selection

Determine operation from user request:

- **"Create a PR"** → Read [references/create.md](references/create.md)
- **"Create a draft PR"** or **"Draft PR"** → Read [references/draft.md](references/draft.md)
- **"Review PR"** or **"Review this PR"** → Read [references/review.md](references/review.md)

Each reference file contains complete workflow, templates, and best practices for that operation.

## Branch Naming Conventions

- `feature/description` - New features
- `fix/bug-description` - Bug fixes
- `refactor/component-name` - Code refactoring
- `docs/update-readme` - Documentation
- `test/add-unit-tests` - Test additions

## Commit Message Conventions

- `feat:` - New features
- `fix:` - Bug fixes
- `refactor:` - Code refactoring
- `docs:` - Documentation
- `test:` - Tests
- `chore:` - Maintenance
- `style:` - Formatting
