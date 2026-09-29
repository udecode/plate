---
review_scopes: []
review_basis: []
work_kind: workflow
---

# Autoclosure skill

Status: Complete

Objective:
Create a shared `autoclosure` skill that takes one pull request from
candid assessment through authorized repair, cleanup, exact proof, and a
truthful merge-ready or candidate-local handoff, then install it only in Plate.

Completion threshold:
- `../dotai/skills/autoclosure/SKILL.md` is the canonical source.
- The Skills CLI installs matching Codex and Claude Code copies in Plate.
- The skill reuses Task and specialist owners instead of copying their methods.
- Discovery distinguishes full PR closure from review-only, status-only, and
  merge requests.
- The workflow validator, skill validator, mirror check, and affected lint pass.

Boundaries:
- Preserve Task's lifecycle, Maintainer's GitHub ownership, and current Git and
  publication authority.
- Do not recreate the retired monolithic Autoclosure procedure.
- Do not commit, push, edit the live PR, merge, or propagate to other projects.

Work checklist:
- [x] Use the platform skill-authoring guidance for `SKILL.md` files.
- [x] Validate the skill: frontmatter has `name` and `description`, referenced
  files exist, and cross-skill links resolve.
- [x] Test structural behavior through the real Dotai catalog, Skills CLI, and
  Plate mirror path.
- [x] Skip Opening a PR because the user authorized local skill creation, not
  Git publication.
- [x] Inspect the retired Autoclosure history and its Task replacement.
- [x] Write the smallest coordinator at the shared Dotai source.
- [x] Remove the revived skill from generated-resource retirement.
- [x] Build the Dotai inventory, install both agent destinations, and inspect
  the result.
- [x] Apply Agent Native Reviewer to discovery, ownership, tool routes, and
  proof.
- [x] Run affected validation and final `lint:fix`.
- [x] Reconcile this checklist and record the final handoff.

Decisions:
- The reusable contract belongs in Dotai. Plate keeps its domain-specific
  repair, proof, publication, and branch policy in the project adaptation.
- Autoclosure coordinates one PR. It does not replace Task or the project's
  review, repair, performance, verification, release, GitHub, or monitoring
  owners.
- Automatic discovery remains enabled. The description carries narrow positive
  and negative triggers.

Evidence:
- Dotai's skill validator passed. The catalog build and check report 85 total
  skills, 77 maintained skills, eight upstream skills, 341 bundled files, and
  an inferred `autoclosure -> task` dependency.
- Skills CLI 1.5.25 installed `autoclosure` for project-scoped Codex and Claude
  Code. The installed source matches Dotai, Claude Code links to the Codex
  copy, the project listing includes both agents, and `skills-lock.json` records
  the local Dotai source and computed hash.
- Plate's resource mirror check is exact. Its resource test passes 1 of 1.
- Plate Next doctrine v251 validates with the revived shared-skill rule and its
  exact doctrine fingerprint. The all-package status remains red because the
  existing `platejs` and `test` package attestations are stale; this skill does
  not change either package or claim those attestations.
- `pnpm lint:fix` completed across Plate. Dotai and affected Plate diff checks
  pass.
- Agent Native Reviewer traced the complete action chain from the positive
  "perfect or fully close this candidate" trigger to the Dotai source, Task
  dependency, project install, proof, and truthful handoff. The description
  routes read-only review, status-only monitoring, and merge-only shipping away
  from Autoclosure.

Next action:
Invoke `$autoclosure <PR URL or candidate>` for a full closure run.
