# Repair Plate UI generated editor ownership

Objective:
Repair Plate UI registry ownership guidance so independently installable items
cannot import application-generated editor bindings, while explicit editor-host
and editor-kit-dependent example ownership remains legal.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-13-repair-plate-ui-generated-editor-ownership.md

Template:
docs/plans/templates/goal-repair.md

Primary template:
docs/plans/templates/goal-repair.md

Applied packs:

- none

Expectation:

- user expectation: Make generated editor binding ownership an explicit
  `plate-ui` rule and remove stale `EditorKit` API terminology from that rule.
- observed miss: `.agents/rules/plate-ui.mdc` implies generic registry ownership
  but does not explicitly ban `editor.generated` / editor-definition imports;
  it also teaches `EditorKit` as an application API in three places.
- owning skill/template/helper: `.agents/rules/plate-ui.mdc` plus its directly
  linked component-shape, registry, and component-audit guidance.
- repair classification: derived Plate UI skill rule repair

First checkpoint:

- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:

- requested duration: N/A: none requested
- semantics: N/A
- initial confidence score: N/A: binary source/sync audit is stronger
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:

- Zero `EditorKit` API references remain in Plate UI rule sources; the main and
  detailed rules explicitly prohibit application-generated bindings in
  independently installable registry items and name the narrow editor-host /
  explicitly dependent example exception.
- Repair closure is legal only when the source owner is patched, generated
  skills are synced when `.agents/rules/**` changed, a source audit proves the
  repair text exists, the repaired template or rule is smoke-checked, deliberate
  non-repairs are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-13-repair-plate-ui-generated-editor-ownership.md` passes.

Verification surface:

- `rg` audit across `.agents/rules/plate-ui.mdc` and `.agents/rules/plate-ui/**`.
- `pnpm install` regenerates `.agents/skills/plate-ui/SKILL.md` from source.
- Direct inspection confirms generated skill contains the new ownership rule.

Constraints:

- Repair one expectation narrowly.
- Patch source-of-truth files, not generated skill mirrors.
- Do not weaken evidence safety or completion gates just to reduce annoyance.
- Do not broaden the repair to unrelated skills/templates.

Boundaries:

- Source of truth: latest `autogoal repair <expectation>` request.
- Allowed edit scope: Plate UI source rule, directly linked Plate UI guidance,
  shared skill-resource sync/version enforcement, regenerated Plate UI skill,
  doctrine version record, and this repair plan.
- Derived skill scope: registry/editor binding ownership and stale `EditorKit`
  terminology only.
- Non-goals: no package, app, registry metadata, generated registry output,
  Best API, or runtime API changes.

Output budget strategy:

- Read only the four bounded Plate UI rule files and use capped `rg` output;
  exclude app/package/generated registry trees from this rule repair.

Blocked condition:

- Stop only if `pnpm install` cannot regenerate the skill or source rules prove
  the ownership exception cannot be stated without deciding the runtime API.

Repair state:

- repair_type: derived skill source repair
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:

- verdict: Patch Plate UI only; the reusable-registry boundary belongs here.
- confidence: high
- next owner: Plate UI source rule
- reason: The current rule has the principle but lacks the enforceable import
  boundary and still names the rejected runtime `EditorKit` noun.

Completion rule:

- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final repair evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-13-repair-plate-ui-generated-editor-ownership.md` passes.
- Do not create hook state for this repair. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Expectation, scope, non-goals, verification, and threshold recorded above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Expectation restated | yes | Expectation section |
| Active goal checked | yes | No active goal; repair goal created for this plan |
| Named plan or skill read | yes | Full `plate-ui` skill and bounded linked rules read |
| Owning source selected | yes | `.agents/rules/plate-ui.mdc` and directly linked ownership guidance |
| Repair classification selected | yes | Derived Plate UI skill rule repair |
| Safety conflict checked | yes | No evidence or runtime safety rule is weakened |
| Output budget strategy recorded | yes | Bounded four-file reads and capped searches |

Work Checklist:

- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; N/A: no duration requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Expectation and observed miss are stated with source evidence.
- [x] Primary owner selected: runtime plan, template, skill rule, or
      helper/checker.
- [x] Secondary owners are justified: only directly linked Plate UI guidance
      repeats the same rule; Best API is deliberately excluded.
- [x] Patch touches source-of-truth files only, followed by generated sync.
- [x] Derived skill vs generic `autogoal` ownership decision is recorded.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Deliberate non-repairs are recorded.
- [x] Final response shape is recorded.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Source owner patched | yes | Patch the selected source owner or record runtime-plan-only repair | Plate UI source rule and three directly linked resources patched |
| Generated skill sync | yes | If `.agents/rules/**` changed, run `pnpm install` and verify generated `SKILL.md` sync | `pnpm install` passed; three required Plate UI resources compare exactly |
| Template smoke | no | Instantiate the repaired template or inspect it directly when a smoke plan would create noise | N/A: no template changed; generated skill and resources inspected directly |
| Incomplete-plan guard | no | Verify an unfinished generated plan still fails `check-complete.mjs`, or record N/A with reason | N/A: no goal template or checker behavior changed |
| Completed-plan representability | no | Verify the repaired expectation can be recorded in a completed plan without editing the template again, or record N/A | N/A: no goal template changed |
| Helper/checker tests | yes | If scripts changed, run focused script tests; otherwise N/A | `node --test .agents/rules/plate-next/scripts/version.test.mjs`: 10/10 passed |
| P2 autoreview / review | no | Run applicable autoreview gate with `--max-priority P2`; P3 is opt-in only, or record N/A for docs-only/source-rule-only repair | N/A: source-rule-only repair; scoped diff and generated parity reviewed directly |
| Final lint | yes | Run scoped formatter/lint or record ignored-path/N/A reason | Biome, Prettier, and `git diff --check` passed on touched surfaces |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Reads/searches remained file-bounded; shell quoting and formatter misses are recorded below |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-13-repair-plate-ui-generated-editor-ownership.md` | Final checker passed after evidence closure |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake | complete | Skill and bounded linked rules read; requirements recorded | complete |
| Target selection | complete | Plate UI source plus generated-resource owner selected | complete |
| Patch | complete | Ownership law, sync manifest, tests, and doctrine v71 updated | complete |
| Verification | complete | Resource parity, 10 tests, doctrine validation, formatting, and zero-symbol audit passed | complete |
| Closeout | complete | Plan evidence finalized | final response |

Findings:

- The main rule contains three stale `EditorKit` API references.
- Detailed registry guidance contains an `...EditorKit` composition example.
- Component-shape and audit guidance already establish generic registry
  ownership but do not explicitly prohibit generated bindings or definitions.
- `pnpm install` synchronized the main skill and `component-shape.md` but left
  the edited registry and audit resources stale because the shared resource
  manifest omitted them.

Decisions and tradeoffs:

- Keep `editor-kit` as the registry item label; remove `EditorKit` only as an
  application runtime noun.
- Permit generated binding imports only in the editor host, app-owned code, and
  registry examples whose metadata explicitly depends on `editor-kit`.
- Keep reusable registry items on core hooks plus descriptor portals.
- Add only the two touched linked resources to the shared sync/version manifest;
  do not broaden this repair into unrelated stale Plate UI resource adoption.
- Bump Plate Next doctrine because its version law includes Plate UI pattern
  changes and the shared resource sync owner.

Repair patch notes:

- Replaced positive `EditorKit` teaching with the `editor-kit` registry item and
  application-definition ownership language.
- Added explicit generated binding / editor-definition import boundaries to the
  main rule, component-shape detail, registry detail, and audit reference.
- Added the registry and component-audit resources to shared generation and
  version enforcement; recorded the pattern as Plate Next doctrine v71.

Deliberate non-repairs:

- `best-api` and runtime/codegen APIs are not changed; this request repairs only
  the Plate UI registry ownership rule.
- Product source and registry metadata are not audited or migrated in this
  narrow skill repair.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Backticks in a double-quoted `rg` shell argument triggered a harmless `editor-kit: command not found` substitution | 1 | Use single-quoted patterns without shell-active backticks | Search still completed; final audit uses safe quoting |
| Prettier was run against Biome-owned `.mjs` files and caused quote churn | 1 | Use Biome for `.mjs` and reserve Prettier for Markdown | Biome restored repository style; scoped diff contains only intended script changes |
| Initial doctrine fingerprint preceded the final source snapshot | 1 | Recompute only after source formatting is stable | v71 stores final fingerprint `sha256:e8af3cde42cb1a4db16d730e9e4d3c12f086cc15cc9d9699db9ec66fc0366fcb` |

Verification evidence:

- `pnpm install` -> source rules regenerated successfully.
- `node --test .agents/rules/plate-next/scripts/version.test.mjs` -> 10/10
  passed.
- `node .agents/rules/plate-next/scripts/sync-resources.mjs --check` -> exact.
- `node .agents/rules/plate-next/scripts/version.mjs validate` -> Plate Next
  v71 valid, 42 active and 1 retired package.
- Biome, Prettier, and `git diff --check` -> passed on touched surfaces.
- `rg -n 'EditorKit'` over Plate UI source and generated skill -> zero matches.
- `cmp` for component-shape, registry, and component-audit source/generated
  pairs -> all exact.

Final repair handoff:

- Expectation: Generated application bindings never leak into independent
  registry items.
- Repaired owner: Plate UI source rule and directly linked guidance.
- Files changed: Plate UI source/generated guidance, shared resource/version
  enforcement, doctrine v71, and this repair plan.
- Verification: generation, parity, 10 focused tests, doctrine validation,
  formatting, diff check, and zero-symbol audit passed.
- Caveat: Runtime/codegen adoption remains a separate implementation.

Timeline:

- 2026-08-13T20:50:40.448Z Goal repair plan created.
- 2026-08-13 Plate UI ownership rule and linked guidance repaired.
- 2026-08-13 Shared resource sync gap repaired and doctrine v71 recorded.
- 2026-08-13 Final proof gates passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Make Plate UI enforce generated-editor ownership without stale EditorKit API language |
| What have I learned? | The rule and generated-resource manifest both needed repair |
| What have I done? | Patched, regenerated, versioned, tested, and audited the rule |

Open risks:

- The accepted generated-hook runtime API is not implemented by this rule-only
  repair; this is an explicit non-goal, not an unverified claim.
