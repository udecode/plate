---
name: autoreview
description: "Review an explicit code candidate or actual PR closeout with actionable findings and bounded correction rounds."
metadata:
  source: udecode/dotai
  source-path: skills/autoreview
---

# Autoreview

Review only when requested or as the one review in an authorized PR closure. Ordinary edits, planning, goals, maintenance and deployment do not independently add reviews.

1. Identify the real candidate: local diff, a named commit, or branch against its actual PR base. Include relevant untracked source when reviewing local work. Do not review an empty branch comparison after the candidate has already landed.
2. Bind the review to the acceptance criteria, source authority, affected callers and available verification. Use a project-owned structured review helper when present. Otherwise use an available native review facility or inspect the diff and call sites directly. Do not invent a CLI, model entitlement, receipt or independent reviewer.
3. Inspect correctness, required behavior, security, data loss, error paths and affected consumers. Report concrete defects with file/line, trigger, user consequence, priority and the smallest owner-level correction. A claimed dependency behavior needs source or documentation evidence.
4. Verify every finding at the actual call site before accepting it. Reject unrealistic scenarios, taste, speculative rewrites and duplicate reports. One proven issue outweighs agreement among reviewers. Inspect sibling occurrences of a confirmed defect within the authorized candidate.
5. Batch accepted corrections through `task`, then run affected proof. If needed, the second review checks frozen blockers, failed acceptance and corrective regressions. Do not repeat a clean unchanged review.

Use at most two rounds within one persisted fifteen-minute deadline across retries and resume, unless the user supplied another explicit budget. Store the target, start/deadline, rounds, findings and dispositions in the existing plan or review record. Expiry stops the review mechanism; it does not waive broken acceptance or require renewed permission for an already-authorized repair.

P0/P1 defects and failed acceptance block approval. P2/P3 findings need evidence and follow the project's actual release policy; do not create tickets or publish comments unless authorized. Mark each finding accepted, rejected with reason, corrected with proof, or unresolved.

Report reviewed candidate, coverage, accepted findings, proof gaps and verdict. When native/independent review is unavailable, label direct inspection honestly. No nested panel, automatic model switch, source push or publication just to run a review.
