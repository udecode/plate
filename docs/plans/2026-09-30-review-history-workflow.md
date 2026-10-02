# Review history intake repair

Status: Complete.

Objective:
Repair Best API Review so every ledger item accounts for earlier work before another recommendation or audit, as the user requested. The autocomplete queue answer missed completed combobox work because `unassessed` was treated as a statement about history.

The shared method lives in `../dotai/skills/best-api-review/SKILL.md`. Plate owns its command routing in `AGENTS.md` and `.agents/rules/best-api/references/review.md`. Installed skill copies come from those owners.

Completion threshold:
The shared method and Plate routing require history intake before recommendations, their installed copies match the source owners, and a fresh read-only autocomplete replay accounts for earlier work without claiming unproved runtime adoption.

Work Checklist:

- [x] Repair the shared method at recommendation intake, including first audits, queue answers and historical work outside a dedicated review record.
- [x] Repair Plate routing with the actual compact/detail lookup fields and bounded historical search.
- [x] Install the shared skill for this project, regenerate local resources and validate source/mirror parity.
- [x] Replay the autocomplete failure through a fresh read-only reviewer and record the result and proof limits.

Constraints:
History reconciliation must preserve earlier records and distinguish completed design, implementation claims and current proof. A stale or missing binding cannot erase earlier work or make an earlier decision immune to a stronger argument.

Boundaries:

- Workflow maintenance only. No autocomplete implementation or fresh feature audit.
- Preserve earlier review and execution records. Do not change their proof or adoption status.
- No global installation, other-project sync, commit, push or publication.
- The old Maintain Workflow skill and Task workflow reference are absent after workflow consolidation. pstack's skill-authoring playbook supplies the available maintenance route. Its PR step does not apply because the user owns publication.

Blocked condition:
The source owner or installer cannot preserve the shared fix and current-project routing. No such blocker remains. Unrelated concurrent workflow edits remain outside this repair.

Verification surface:

- Dotai skill validation and generated workflow manifest check.
- Plate source-rule resource check and installed skill comparison.
- Actual `lookup autocomplete` history, followed by an independent bounded read-only routing replay.

Verification evidence:

- Dotai `scripts/validate-skills` passes. `node scripts/build-workflow.mjs --check` verifies all 8 skills, 42 bundle files and local references.
- The Skills CLI installs only `best-api-review` from `../dotai` for this project's Codex and Claude Code runtimes. The lock keeps its relative local source path.
- Skiller apply and the canonical resource sync run. Byte comparisons match the shared source with both installed skills and Plate's reference with both generated resources.
- The global resource check found unrelated generated skills stale during concurrent workflow maintenance. This task proves its own skill/reference parity; it does not claim that global gate passed.
- Actual compact autocomplete lookup reports `current: null`, zero compact review summaries, 3 total history records, 3 later execution records, 4 associated plans and 28 historical candidates. Missing review state therefore cannot establish missing work.
- A fresh-context inherited-model reviewer answered the fake queue task by identifying the prior repairs and completed UI extraction, comparing their shared completion ownership with `BaseComboboxPlugin` and `InlineCombobox`, and refusing to equate unassessed review status with untouched code. It found no concrete defect in the history-intake section. This proves one workflow replay, not universal agent compliance or current autocomplete runtime behavior.
- The reflection of the user's correction is this intake repair. Reconciliation requires judgment and already has canonical lookup/storage owners, so no second history tracker or new checklist helper is introduced.
- No package API or editor behavior changes. Product tests and application launches do not apply. No lintable file changes in this task; Oxfmt/Oxlint exclude these Markdown instruction files.
- Final scoped source/mirror parity and `git diff --check` pass after the edits.

Open risks:
The global resource check remains red during unrelated concurrent workflow maintenance. One successful replay does not guarantee every future agent will comply. Other installed copies do not receive this local source change until their owner requests a sync.

Next action: use the repaired history intake for the next selected ledger item. Other project and global skill installations require their own requested sync of `best-api-review`.
