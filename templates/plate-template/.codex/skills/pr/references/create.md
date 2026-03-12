# Creating Regular Pull Requests

Complete workflow for creating PRs with comprehensive descriptions and meaningful commits.

## Workflow

### 1. Branch Management

- Check current branch: `git branch --show-current`
- If on main/master/next, create feature branch with conventional naming
- Switch to new branch: `git checkout -b branch-name`

### 2. Analyze & Stage

- Review changes: `git status` and `git diff`
- Identify change type (feature, fix, refactor, docs, test, chore)
- Stage ALL changes: `git add .` (preferred due to slow Husky hooks)
- Verify: `git diff --cached`

### 3. Commit & Push

- **Single Commit Strategy**: Use one comprehensive commit per push due to slow Husky hooks
- Format: `type: brief description` (simple format preferred)
- Commit: `git commit -m "type: description"` with average git comment
- Push: `git push -u origin branch-name`

### 4. PR Management

- Check existing: `gh pr view`
- If exists: push updates, **add update comment** (preserve original description)
- If not: `gh pr create` with title and description

## Update Comment Templates

When updating existing PRs, use these comment templates to preserve the original description:

### General PR Update Template

```markdown
## 🔄 PR Update

**Commit**: `<commit-sha>` - `<commit-message>`

### Changes Made

- [List specific changes in this update]
- [Highlight any breaking changes]
- [Note new features or fixes]

### Impact

- [Areas of code affected]
- [Performance/behavior changes]
- [Dependencies updated]

### Testing

- [How to test these changes]
- [Regression testing notes]

### Next Steps

- [Remaining work if any]
- [Items for review focus]

🤖 Generated with [Claude Code](https://claude.ai/code)
```

### Critical Fix Update Template

```markdown
## 🚨 Critical Fix Applied

**Commit**: `<commit-sha>` - `<commit-message>`

### Issue Addressed

[Description of critical issue fixed]

### Solution

[Technical approach taken]

### Verification Steps

1. [Step to reproduce original issue]
2. [Step to verify fix]
3. [Regression test steps]

### Risk Assessment

- **Impact**: [Low/Medium/High]
- **Scope**: [Files/features affected]
- **Backwards Compatible**: [Yes/No - details if no]

🤖 Generated with [Claude Code](https://claude.ai/code)
```

### Feature Enhancement Template

```markdown
## ✨ Feature Enhancement

**Commit**: `<commit-sha>` - `<commit-message>`

### Enhancement Details

[Description of feature improvement/addition]

### Technical Implementation

- [Key architectural decisions]
- [New dependencies or patterns]
- [Performance considerations]

### User Experience Impact

[How this affects end users]

### Testing Strategy

[Approach to testing this enhancement]

🤖 Generated with [Claude Code](https://claude.ai/code)
```

## Example Usage

### Creating PR

1. Create branch and make changes
2. Stage, commit, push → triggers PR creation
3. Each subsequent push triggers update comment
