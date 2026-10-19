# Markdown rule typing

Objective:
Define and execute the cast-free public typing model for `@platejs/markdown`;
done when the 45 deferred files have no `as any`, `: any`, or type-loss
`as unknown`, every rule infers its MDAST and Plate node pair, and package
lint, typecheck, 233 tests, build, and autoreview pass.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-07-12-markdown-rule-typing.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- none

Completion threshold:
- Close all 45 cast-bearing Markdown file rows without weakening `MdRules`,
  parser/plugin inference, MDAST unions, or open custom-rule support.
- Score >= 0.92, no score dimension below 0.85, all API conflict and proof
  rows closed, final handoff emitted, and `check-complete.mjs` passes.

Verification surface:
- `rg -n "as any|: any|as unknown" packages/markdown/src`
- `pnpm --filter @platejs/markdown lint:fix`
- `pnpm --filter @platejs/markdown typecheck`
- `pnpm --filter @platejs/markdown test`
- `pnpm --filter @platejs/markdown build`
- final package-scoped autoreview

Constraints:
- Preserve the direct `@platejs/core`, `@platejs/plite`, `@platejs/utils`,
  and `@udecode/utils` owners established by the parent packet.
- No callback parameter annotations or local fake helper types to silence
  inference.
- No `platejs` aggregate import, compatibility alias, public shim, or renamed
  duplicate helper.
- Custom Markdown rules remain open to app-defined node keys.

Boundaries:
- Scope: the 45 deferred files recorded in the parent Plate Next manifest,
  plus the smallest Core/Plite generic owner only if package inference proves a
  real upstream blocker.
- Public API: `MdRules`, `MdNodeParser`, `PlateType`, parser options, and
  serializer/deserializer option types.
- Non-goals: Markdown behavior redesign, helper/file renames, sibling package
  migrations, docs/app work, or restoring old Slate names.
- Browser proof: N/A unless the accepted type plan changes runtime behavior.

Blocked condition:
- Execution waits for explicit user acceptance of this Plate Plan.
- Planning is not blocked while a source/API/conflict/proof row remains
  researchable.

Plate Plan lane state:
- plate_plan_lane_status: pending
- current_pass: current-state-read
- current_pass_status: completed
- next_pass: intent-boundary
- next_action: define the public node/rule generic model
- final_handoff_status: pending

Current verdict:
- verdict: public typing plan required; runtime migration kept
- confidence: 0.61 initial
- keep / cut / revise call: keep Markdown behavior and direct owners; revise
  rule/node-map generics; cut all cast-based proof fixtures
- reason: parent packet removed aggregate imports and old editor APIs, isolated
  the test schema, fixed normalized inline-void serialization, and passed 233
  tests, but 45 files still contain 161 `as any`, 64 `: any`, and one
  `as unknown` occurrence.

Completion rule:
- Do not complete this plan until every checklist/gate is closed and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-12-markdown-rule-typing.md`
  passes.
- Implementation begins only after explicit acceptance.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | Parent packet requires exact per-file 100/defer accounting |
| Active goal checked | yes | Parent Plate Next goal owns routing only |
| Source of truth read | yes | VISION, Plate/common doctrine, current package source and proof |
| Plite/Plate boundary identified | yes | Plite nodes/editor; Plate Markdown policy and rule typing |
| API conflict ledger needed | yes | Open custom keys conflict with finite typed node/MDAST pairs |
| Planning vs execution decided | yes | Planning only until accepted |
| Browser proof needed | no initially | Type-only target; add if runtime changes |

Work Checklist:
- [ ] Objective, constraints, boundaries, and proof threshold are accepted.
- [ ] All 45 deferred files are mapped to the owning generic/type decision.
- [ ] `MdRules` supports known key inference and open custom keys without `any`.
- [ ] MDAST attribute/custom MDX boundaries use `unknown` plus narrowing.
- [ ] Serializer/deserializer list, media, column, and mark rules infer outputs.
- [ ] Tests use real fixtures and typed event/parser boundaries without casts.
- [ ] Minimal breaking-change and adoption matrices are complete.
- [ ] Package proof, source audit, and autoreview pass.
- [ ] Final score >= 0.92 with no dimension below 0.85.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Run all commands in Verification surface | pending |
| Plite/Plate boundary rows closed | pending | Close node/editor vs Markdown policy ownership | pending |
| API conflict ledger closed | pending | Verdict for every public generic conflict | pending |
| Breaking changes accepted | pending | User accepts any public type break | pending |
| Package/source execution changed | pending | lint/typecheck/tests/build | pending |
| Browser behavior claim | no initially | Add only if runtime behavior changes | N/A pending confirmation |
| Autoreview | pending | Close all accepted findings | pending |
| Final user-review handoff | pending | Emit decision-complete handoff | pending |
| Goal plan complete | yes | Run check-complete command | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Current-state read and initial score | completed | 45 files; 161 `as any`; 64 `: any`; one `as unknown`; 233 tests green | intent-boundary |
| Intent, scope, boundary, non-goals | pending | | boundary audit |
| Plite/Plate boundary audit | pending | | API conflicts |
| API conflict inventory | pending | | breaking strategy |
| Minimal breaking-change strategy | pending | | runtime/testability |
| Runtime, performance, testability | pending | | docs/adoption |
| Objection and steelman pass | pending | | revision |
| Verification and final handoff | pending | | final response |

Scorecard:
| Dimension | Weight | Score | Evidence |
|-----------|-------:|------:|----------|
| Plite/Plate boundary correctness | 0.20 | 0.75 | runtime owners fixed; rule generic split pending |
| Plate API/DX quality | 0.20 | 0.55 | public types remain cast-heavy |
| Runtime, performance, testability | 0.20 | 0.88 | 233 tests green and sibling-source coupling removed |
| Minimal breaking-change strategy | 0.15 | 0.45 | public generic adoption not decided |
| Product/docs/examples coherence | 0.15 | 0.70 | runtime behavior preserved; caller type impact pending |
| Source evidence and proof completeness | 0.10 | 0.85 | exact inventory and package proof captured |

Plite / Plate boundary map:
| Surface | Current owner | Target owner | Verdict | Evidence |
|---------|---------------|--------------|---------|----------|
| editor, nodes, elements, text | direct Core/Plite imports | Core/Plite | keep | parent migration and green proof |
| Markdown syntax/rule policy | `@platejs/markdown` | `@platejs/markdown` | keep | package behavior suite |
| known Plate node map | `@platejs/utils` plus local overlays | explicit generic composition | revise | `types.ts` cast inventory |
| custom MDX/app rule keys | open record with `any` | unknown-safe custom rule boundary | revise | public `MdRules` API |

API conflict ledger:
| Surface | Conflict | Target shape | Verdict | Adoption/proof answer |
|---------|----------|--------------|---------|-----------------------|
| `MdRules` known keys vs open string keys | index signature erases known parser pairs | preserve known mapped inference plus typed custom rule fallback | pending | public type tests required |
| `AnyNodeParser` | `any` hides both directions | generic unknown-safe parser with explicit narrowing | pending | source and type tests |
| MDX attributes | untyped third-party unions | typed mdast-util-mdx attributes and narrowing | pending | malformed/custom MDX tests |
| list/media/column outputs | casts hide MDAST union mismatch | exact return unions or narrow adapters | pending | existing behavior suites |
| test fixtures | casts bypass public signatures | typed fixtures and `satisfies` | pending | 233-test suite |

Minimal breaking-change matrix:
| Break | Why required | Smaller option rejected | Migration route | Proof |
|-------|--------------|-------------------------|-----------------|-------|
| pending | pending | pending | pending | pending |

Proof matrix:
| Claim | Command / proof | Expected signal | Status |
|-------|-----------------|-----------------|--------|
| cast inventory closed | `rg -n "as any|: any|as unknown" packages/markdown/src` | no type-loss hits | pending |
| package types | `pnpm --filter @platejs/markdown typecheck` | pass | pending |
| behavior preserved | `pnpm --filter @platejs/markdown test` | 233 pass | pending |
| artifact valid | `pnpm --filter @platejs/markdown build` | pass | pending |

Applicable implementation-skill review matrix:
| Lens | Applies | Status | Findings | Plan delta |
|------|---------|--------|----------|------------|
| architecture-cleanup | yes | pending | | |
| typescript advanced types | yes | pending | | |
| testing | yes | pending | | |
| autoreview | yes on execution | pending | | |
| react / react-useeffect | only cast-bearing TSX tests | pending | | |

Objection ledger:
| Objection | Best version | Answer required before execution | Status |
|-----------|--------------|----------------------------------|--------|
| Open custom rules make full typing impossible | Apps can define arbitrary keys and nodes unknown to Plate | Prove a typed custom boundary without weakening known keys | pending |
| Removing casts may explode public generics | Better local casts than unusable error messages | Measure inferred signatures and declaration output | pending |
| The package is already behavior-green | Runtime proof does not prove public type quality | Keep runtime patch; route type design explicitly | answered |

High-risk deliberate-mode pre-mortem:
| Failure | Signal | Prevention | Proof |
|---------|--------|------------|-------|
| Known-key inference collapses to unknown | callbacks lose concrete node types | type tests per known rule family | pending |
| Custom rules become impossible | app-defined key rejected | custom key compile proof | pending |
| Third-party AST types leak unusable unions | noisy public errors | boundary adapters and declaration review | pending |

Verification evidence:
- Current parent proof: Markdown lint and typecheck pass; 233 tests / 368
  assertions pass; build passes.
- Current source audit: no `platejs`, `SlateEditor`, `TElement`, `TText`,
  `TNodeMap`, `createSlateEditor`, `createTSlatePlugin`, `editor.tf`, or old
  core `editor.api.*` compatibility calls remain.
- Remaining blocker: 45 files contain the type-loss inventory routed here.

Reboot status:
- Where am I? Current-state pass complete.
- What did I learn? Runtime/API drift and the normalized inline-void bug were
  independently fixable; the remaining issue is public rule generic design.
- What's done? Direct owners, Base plugin migration, local schema test harness,
  normalized mention serialization, package proof.
- What's next? Intent/boundary pass after user acceptance.

Open risks:
- Public custom-rule inference may require a narrow breaking type change.
- `mdast-util-mdx` attribute unions may need explicit boundary adapters.
- No runtime behavior change is authorized in this plan without new proof.
