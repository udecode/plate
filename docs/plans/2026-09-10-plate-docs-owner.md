# Plate Docs ownership extraction

Objective:
Extract Plate's public documentation method into `plate-docs`, narrow Dotai's
Technical Writing to reusable writing guidance, and adopt the owner throughout
the current Plate workflow.

Completion threshold:
The local skill and all four existing references are discoverable through
generated Codex/Claude skills; active callers use the new owner; Task's old
copies are removed by the generator; provenance, source parity, helper checks
and concrete request-routing review pass.

Verification surface:
Owned rules, installed skills, Skills CLI lock, Plate Next registry/resource
helpers, Dotai provenance checker, and source-backed request walkthroughs.

Constraints:
Preserve public API teaching, house style, proof commands, document modes,
scope, existing upstream methods, immutable history and package attestations.

Boundaries:
Plate workflow sources/templates/helpers and generated mirrors; Dotai's
Technical Writing source and its named Plate install. No product/docs-page
edits, publication, other checkout, global install or downstream-project sync.

Blocked condition:
Unavailable canonical source or a missing decision that prevents every
authorized move; neither is currently present.

Task state:
- status: complete
- current_phase: verified
- next: hand off the local result

Work Checklist:
- [x] Inspect real sources and callers before mutation; source baseline saved in `/tmp/plate-docs-extraction-20260910` (Maintain Workflow, Task workflow).
- [x] Move all five docs source files into Plate Docs without losing technical content; all four references match the baseline after link relocation, and every original main-owner technical literal remains (user decision, Skill Creator).
- [x] Update AGENTS, Task, feature/plugin/UI/review/migration callers and current templates; active-source scan found no old ownership or path links (user decision, Task workflow).
- [x] Narrow Dotai to reusable example quality; exact upstream replay and preservation checker passed for 40 skills / 99 upstream files (Maintain Workflow, Technical Writing UPSTREAM.md).
- [x] Update Plate Next tracked paths and generated skill inventory; resource sync retired both agents' Task docs copies; v181 preserves the complete prior history and package attestations (Plate Next version law).
- [x] Regenerate via `pnpm install` and named-install Technical Writing for Codex/Claude; source/install files match, only that lock entry changed, both Plate Docs copies and all links resolve (Maintain Workflow, Sync Skills).
- [x] Run applicable skill, provenance, resource and version helper checks; 15 helper tests pass and Plate Docs passes the skill validator (Skill Creator, Task workflow).
- [x] Review feature-doc, docs-audit, reference, general-prose and wording-only routes; source review below records the proof limit (Agent Native Reviewer).
- [x] Reconcile source obligations and decision trail; record the final completion-check result below and the proposed Ellie sync (Autogoal, Show Me Your Work, Maintain Workflow).

Decisions:
Move the existing documentation owner rather than creating a wrapper. Keep
general prose in Dotai and Plate-specific page order, demos, imports and proof
selection local. No new validator or independent lifecycle is needed.

Verification evidence:
- Decision log: `.audit/plate-docs-extraction.tsv`.
- Command receipts: `/tmp/plate-docs-extraction-20260910`.
- `node --test .agents/rules/plate-next/scripts/version.test.mjs .agents/rules/plate-next/scripts/sync-resources.test.mjs`: 15/15 passed (`helper-tests.log`).
- Dotai `scripts/validate-skills` and `python3 scripts/check-pstack-preservation.py`: pass; 40 skills / 99 pinned upstream files, zero errors.
- Named install: `npx skills add ../dotai --skill technical-writing --agent codex claude-code -y`; exactly one skill installed (`technical-writing-install.log`).
- `pnpm install`: generated the new owner and removed retired resources; final run passed (`pnpm-install-final.log`).
- `quick_validate.py .agents/skills/plate-docs`: skill valid; both generated entries name the local `.agents/rules/plate-docs.mdc` source.
- Resource checker: exact. Version checker: v181 valid, 2 active / 44 retired packages. Prior history and all package attestations equal the baseline.
- Scoped Git whitespace checks pass in Plate and Dotai. Four reference bodies, original technical literals, both agent copies, named lock scope, and relative links/anchors verified.

Source-based request review:

| Request | Agent route and result | Proof boundary |
| --- | --- | --- |
| Improve Comments documentation | Plate Docs selects the feature lane and plugin/API mechanics; applies focused demos, meaningful states, current source, fixtures and integration requirements. | Actual preview changes route to Verify Plate; no runtime claim comes from reading guidance. |
| Audit Comments coverage | Same owner reports in-scope tasks, their homes and gaps; its explicit audit boundary prevents implementation without edit authority. | Source-backed findings; no imposed demo count. |
| Clarify an API reference | Plate Docs selects reference shape and the changed claim's owner; Technical Writing preserves exact meaning. | No forced preview or lifecycle examples; source checks match the actual edit. |
| Rewrite a PR description | Task's general-prose row routes directly to Technical Writing. | No Plate MDX, registry, navigation or browser workflow. |
| Fix punctuation in a docs introduction | AGENTS and Plate Docs both permit direct text/link checking. | No new plan, goal, broad audit or app launch. |

This was an agent-route and source review, not an independent model trial or
application/browser test. No new independent test was necessary for the preserved
documentation method; existing helper tests and actual regeneration exercised
the changed resource ownership.

Exclusions:
Autoreview is not applicable on `next`. Browser/package tests are not applicable
to this workflow-only change. No new product law or public API is introduced,
so Vision/product implementation are outside scope. Existing helper suites
cover resource migration; do not add assertions about removed prose.

Open risks:
None in scope. The source-owned retirement list removes the obsolete generated
copies, and the doctrine tracker includes Plate Docs and its four references.

Final handoff:
Plate Docs is locally generated for Codex and Claude, Task routes to it, and
Dotai's general writing source is installed by name in Plate. No commits,
pushes, product changes, global installs or other-project syncs were performed.
Ellie's existing Technical Writing copy is a named downstream sync candidate;
its project-specific documentation method should remain local.

Completion check:
`node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-10-plate-docs-owner.md`
passed. Claude's root `CLAUDE.md` imports `.agents/AGENTS.md`, so the revised
documentation routing is available to both configured agents.
