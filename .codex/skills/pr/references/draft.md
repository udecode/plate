# Creating Draft Pull Requests

Streamline draft PR creation and management for work-in-progress. **Focus**: Create and update draft PRs efficiently without automatic reviews.

## Workflow

### 1. Branch Management

- Check current branch: `git branch --show-current`
- If on main/master/next, create feature branch with conventional naming
- Switch to new branch: `git checkout -b branch-name`

### 2. Analyze & Stage Changes

- Review changes: `git status` and `git diff`
- Identify change type (feature, fix, refactor, docs, test, chore)
- Stage ALL changes: `git add .` (preferred due to slow Husky hooks)
- Verify: `git diff --cached`

### 3. Commit & Push

- **Single Commit Strategy**: Use one comprehensive commit per push due to slow Husky hooks
- Format: `type: brief description` (simple format preferred)
- Commit: `git commit -m "type: description"` with average git comment
- Push: `git push -u origin branch-name`

### 4. Draft PR Management

- Check existing: `gh pr view`
- If exists: push updates, **add update comment** (preserve original description)
- If not: `gh pr create --draft` with comprehensive title and description

## PR Description Template

```markdown
## Summary

[Brief description of what this PR accomplishes]

## Changes Made

- [List key changes made]
- [Include file modifications]
- [Highlight new features/fixes]

## Technical Details

- [Implementation approach]
- [Key architectural decisions]
- [Dependencies added/removed]

## Testing

- [How to test the changes]
- [Test cases covered]
- [Manual testing steps]

## Screenshots/Demo

[If applicable, include screenshots or demo links]

## Checklist

- [ ] Tests pass
- [ ] Documentation updated
- [ ] Ready for review

## Notes

[Any additional context, considerations, or follow-up items]

🤖 Generated with [Claude Code](https://claude.ai/code)
```

## Update Comment Templates

When updating existing draft PRs, use these comment templates instead of editing the original description:

### New Commit Update Template

```markdown
## 📝 Draft PR Update

**Commit**: `<commit-sha>` - `<commit-message>`

### Changes Made

- [List specific changes in this commit]
- [Highlight new features/fixes added]
- [Note any breaking changes]

### Status

- [Current implementation status]
- [Remaining work items]
- [Any blockers or questions]

### Testing

- [How to test the new changes]
- [Updated test instructions if needed]

🤖 Generated with [Claude Code](https://claude.ai/code)
```

### Feature Addition Template

```markdown
## ✨ Feature Added

**Commit**: `<commit-sha>` - `<commit-message>`

### New Feature

[Description of the feature added]

### Implementation Details

- [Key technical decisions]
- [Files modified/added]
- [Dependencies changed]

### Testing Instructions

[How to test the new feature]

🤖 Generated with [Claude Code](https://claude.ai/code)
```

### Bug Fix Template

```markdown
## 🐛 Bug Fix Applied

**Commit**: `<commit-sha>` - `<commit-message>`

### Issue Fixed

[Description of the bug that was fixed]

### Root Cause

[What caused the issue]

### Solution

[How it was resolved]

### Verification

[How to verify the fix works]

🤖 Generated with [Claude Code](https://claude.ai/code)
```

## Example Usage

### Creating a new draft PR

1. Make changes on feature branch
2. Stage and commit with conventional message
3. Push changes: `git push -u origin feature-branch`
4. Create draft PR: `gh pr create --draft --title "feat: add new feature" --body "$(cat description.md)"`

### Updating existing draft PR

1. Make additional changes
2. Commit and push
3. **Add update comment**: `gh pr comment <pr-number> --body "$(cat update-comment.md)"`
4. Use appropriate template based on change type (feature, fix, general update)

### Making PR ready for review

1. Ensure all changes are complete
2. Run final tests
3. Mark as ready: `gh pr ready`

## Draft PR Best Practices

- **Clear Titles**: Use descriptive, action-oriented titles
- **Comprehensive Descriptions**: Include context, changes, and testing info (preserve original)
- **Progressive Updates**: Keep pushing improvements to the same draft
- **Update Comments**: Add comments for each significant update instead of editing description
- **Change History**: Use update comment templates to track evolution of changes
- **Testing Notes**: Always include how to test the changes (in comments for updates)
- **Screenshots**: Add visuals for UI changes
- **Dependencies**: Note any new packages or breaking changes
- **Preserve Context**: Keep original PR description intact for reference

## Labels and Metadata

Common labels to add:

- `draft` - Work in progress
- `feature` - New functionality
- `bug` - Bug fixes
- `enhancement` - Improvements
- `documentation` - Docs updates
- `breaking-change` - Breaking changes

Use `gh pr edit --add-label "label-name"` to add labels.
