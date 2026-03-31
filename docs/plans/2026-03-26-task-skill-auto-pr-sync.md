# Task Skill Auto PR Sync

## Goal

Update the task skill so verified code-changing tracked work opens or updates the PR before any tracker comment, and any GitHub issue comment includes the PR URL.

## Checklist

- [completed] Read the current `task` skill source and adjacent skill/repo rules
- [completed] Update `.agents/rules/task.mdc` with PR-before-comment behavior
- [completed] Run the skill sync step
- [completed] Verify the generated task skill reflects the new rules

## Findings

- The current task skill explicitly says not to default to PR creation.
- The current GitHub sync-back section says not to mention PR mechanics in the issue comment.
- Repo rules already require `check` before PR creation, so the task skill should defer to that workflow instead of inventing a new one.
- `pnpm run prepare` runs `pnpm dlx skiller@latest apply`, which regenerated `.codex/skills/task/SKILL.md` with the new wording.
