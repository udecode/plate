# Next Issue Triage

## Goal

Pick the best open GitHub issue for the next agent-run task using the `task` workflow.

## Selection Criteria

- Clear reproduction or acceptance criteria
- High odds an agent can make progress without human-only setup
- Reasonable scope for one focused slice
- Current relevance to `main`, not obviously stale
- Good fit for code-first execution rather than endless investigation

## Phases

| Phase | Status | Notes |
| --- | --- | --- |
| Load skills and set triage criteria | complete | `task`, `planning-with-files`, `issue-intelligence-analyst` |
| Fetch open issue list | in_progress | Need current issue pool |
| Inspect strongest candidates | pending | Prefer a few high-signal tickets |
| Recommend best next task | pending | One primary recommendation, maybe one fallback |

## Notes

- This is recommendation-only, not implementation.
- Favor issues where an agent can verify progress directly.
