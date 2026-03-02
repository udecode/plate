# Reviewing Pull Requests

For comprehensive PR reviews, use the compound-engineering workflows:review skill which provides exhaustive multi-agent analysis with ultra-thinking and worktrees.

## Quick Review (Use this reference)

For simple, fast PR reviews without the full workflows system:

### GitHub CLI Commands

```bash
# PR Info
gh pr view <number>                          # View PR details
gh pr view <number> --json number,title,body,files  # Get PR metadata
gh pr diff <number>                          # Get full PR diff

# Comments
gh pr view <number> --comments               # View existing comments
gh api repos/{owner}/{repo}/pulls/<number>/comments     # Get inline comments

# Review Actions
gh pr review <number> --approve --body ""    # Approve PR
gh pr review <number> --request-changes --body ""       # Request changes
gh pr review <number> --comment --body ""    # Comment without approval
```

### Simple Review Workflow

1. **Gather Context**:
   ```bash
   gh pr view <number> --json number,title,body,files
   gh pr view <number> --comments  # Check existing feedback
   gh pr diff <number>
   ```

2. **Analyze Changes**:
   - Code correctness and functionality
   - Project conventions and standards
   - Test coverage
   - Security considerations
   - Performance implications

3. **Post Review**:
   ```bash
   gh pr comment <number> --body "Review comments here"
   ```

## Comprehensive Review

For thorough, multi-agent reviews with ultra-thinking:

```bash
/workflows:review
```

This invokes the compound-engineering workflows:review skill which provides:
- Multi-agent parallel analysis
- Ultra-thinking mode for deep reasoning
- Git worktree isolation
- Comprehensive severity ratings
- Detailed recommendations
