---
date: 2026-04-15
topic: slate-v2-browser-input-post-rc-deferral
status: completed
source_repos:
  - /Users/zbeyens/git/plate-2
---

# Goal

Move browser/input parity out of the current RC blocker set and into post-RC
follow-up work without lying about the broader blanket replacement claim.

# Scope

- live verdict docs only
- `Target A` / `Target B` blocker logic
- no browser/input proof rows are deleted

# Loaded Skills

- `major-task`
- `task`
- `planning-with-files`
- `learnings-researcher`

# Phases

- [x] Load source-of-truth docs
- [x] Rewrite live verdict/control docs
- [x] Run consistency sweeps
- [x] Summarize the new blocker read

# Findings

- the live docs currently treat browser/input parity as a blocker for both
  `Target A` and `Target B`
- the unresolved browser/input slice is already mostly external evidence:
  Android keyboard features plus broader iOS Safari composition/focus
- the coherent interpretation of “defer to post-RC” is:
  - `Target A` can stop treating browser/input parity as a current blocker
  - `Target B` still cannot honestly claim blanket zero-regression until that
    follow-up work lands or the broader claim is explicitly narrowed

# Progress

## 2026-04-15

- read the live verdict stack:
  - `release-readiness-decision.md`
  - `master-roadmap.md`
  - `overview.md`
  - `true-slate-rc-proof-ledger.md`
  - `replacement-gates-scoreboard.md`
- rewrote the live verdict stack so:
  - `Target A` returns to `Go`
  - browser/input parity becomes post-RC follow-up instead of a current RC
    blocker
  - `Target B` stays challenged by exhaustive API/public-surface audit and the
    still-unclosed broader browser/input claim
- ran consistency sweeps across the live verdict docs

# Errors

- none yet
