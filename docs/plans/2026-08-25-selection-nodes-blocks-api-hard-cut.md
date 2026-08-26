# Selection nodes blocks API hard cut

Objective:
Hard-cut redundant Plite selection, node, and block APIs; done when the
canonical surface compiles, stale authored calls are zero, and strict checks
pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-25-selection-nodes-blocks-api-hard-cut.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- none

Mode:
- `standard`

Completion threshold:
- `nodes.blocks()` is the only generic schema-block collection read;
  `selection.nodes()` is exact NodeSelection membership only.
- Public selection aliases and redundant node/block aliases listed in the
  accepted audit are deleted, not deprecated.
- Every authored caller uses the canonical owner, all affected type/tests and
  browser-facing proof pass, stale-symbol sweeps are zero, doctrine/generated
  mirrors match, and `check-complete` passes.

Verification surface:
- Owner-scoped `rg` sweeps for every deleted API and every repeated block
  predicate migrated to `nodes.blocks()`.
- Focused Plite/Plate package typechecks and tests, `pnpm check:plite:dev`,
  affected browser proof, registry generation when registry source changes,
  `pnpm brl`, strict `pnpm check:plite`, P1 autoreview, and goal checker.

Constraints:
- The user accepted the full API audit with `go`; execute without another
  planning pause.
- No public compatibility aliases or runtime shims.
- Preserve semantic selection, schema truth, root handling, ordering,
  transaction behavior, history, DOM/input, collaboration, and UI behavior.
- Preserve unrelated shared-checkout changes. Do not commit or push.

Boundaries:
- In scope: Plite selection/node/block public interfaces and implementation;
  Plate/registry/docs/tests callers; public teaching, changesets, barrels, and
  generated skill mirrors required by the API cut.
- Source owners: `@platejs/plite` selection protocol/state and schema-aware node
  reads; Plate owns product callers and registry UI.
- Non-goals: new selection kinds, performance claims, serialized-data changes,
  template edits, release, commit, or push.
- Direct Plate/collaboration adoption owners: Core, AI, table, registry DnD and
  block menus, examples, and any other live caller found by the final census.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Block only if a hard runtime/type law proves one accepted deletion invalid
  and no canonical-owner repair can preserve it, or an unrelated strict-gate
  failure cannot be isolated after focused proof.

Plite Plan state:
- status: completed
- phase: closure
- next: handoff the verified local tree
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Full accepted audit, hard cut, no aliases, canonical owners, full adoption/proof, no commit/push |
| Active goal and plan verified | yes | One-shot execution goal names this exact plan and binary threshold |
| Current owners read | yes | Prior bounded audit read Plite interfaces, public-state implementation, selection helpers, React equality owners, and every authored production `.nodes()` caller; refresh precedes edits |
| Best API target resolved | yes | Accepted audit selects `selection()`, `selection.ranges()`, exact `selection.nodes()`, `nodes.block()`, `nodes.blocks()`, and canonical `tx.blocks` mutations |
| Mode and execution boundary resolved | yes | Standard one-shot execution authorized by latest `go`; no commit/push |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Refresh current API/docs/tests/exports/behavior claims from live source.
- [x] Reusable public call shape has one accepted `best-api` verdict.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks have complete adoption/deletion answers and no bridge.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Implement, verify, repair doctrine, run review, and prepare final handoff.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | passed | Resolve every readiness condition | Canonical API compiles; authored stale calls and repeated block predicates are zero; strict proof passed |
| Fresh source evidence | passed | Recheck decision-changing current claims | Final whole-diff census found and migrated the remaining AI callers and Plite docs examples |
| Best API review | passed | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | Hard-cut target implemented; remaining generic node traversal has no repeated block-specific user job |
| Conditional risk and adoption | passed | Complete triggered risk/browser/Benchmark/provenance work or give one scoped N/A reason | Browser selection interaction passed; Benchmark N/A because no performance claim; docs, changesets, doctrine, registry, and mirrors completed |
| Verification recorded | passed | Record fresh planning proof and exact execution gates | See Verification evidence |
| Handoff prepared | passed | Prepare concise ownership, breaks, proof, risks, and execution order | See Final handoff prepared |
| P1 autoreview | scoped exception | Run with `--max-priority P1` for implementation changes; P2/P3 are opt-in only, or record planning-only N/A | Helper ran once; TruffleHog was clean, then the fail-closed bundle scanner rejected unrelated shared-checkout generated deletions before model review. Manual P1 whole-diff review found and fixed hard-coded AI key fallbacks; no remaining P0/P1 blocker was proven. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-25-selection-nodes-blocks-api-hard-cut.md` | Final checker passed |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Prior bounded audit plus accepted target and live-owner plan | Decide |
| Decide | completed | Every accepted cut has one owner, adoption path, proof, and no bridge | Implement |
| Implement | completed | Canonical read/mutation owners and every live caller migrated without aliases | Focused proof |
| Focused proof | completed | Package tests, source-first types, contracts, registry, barrels, lint/format, stale sweeps, and Browser interaction passed | Closure |
| Closure | completed | Strict Plite check passed all 79 Chromium batches; doctrine and changesets repaired | Handoff |

Decision brief:
- outcome: one small selection surface, one schema-aware block query owner, and
  no parallel read/mutation aliases.
- chosen shape: `selection()`, `selection.ranges()`, exact
  `selection.nodes()`, `nodes.block()`, `nodes.blocks()`, `tx.nodes.lift()`,
  and props-first `tx.blocks.{duplicate,insertAfter,set,toggle}`.
- strongest rejected alternative: adding `selection.blocks()` or
  `{ block: true }` while retaining generic predicate boilerplate.
- consequence: a breaking source migration across Plite, Plate packages,
  registry source, tests, docs, and generated public artifacts.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Selection collection query | `selection.nodes(options)` mixes exact membership with generic traversal | Keep zero-argument exact membership only | Plite selection | Exact NodeSelection membership is distinct; filtered traversal belongs to nodes | Migrate three block-filter callers to `nodes.blocks()` | Selection and adopter tests | Confusing exact membership with range intersection | cut overloads |
| Block collection query | Repeated `nodes.toArray`/`above`/transaction predicates classify blocks ad hoc | `nodes.blocks(options)` | Plite schema-aware reads | Block truth requires the active schema and is a frequent current job | Migrate all repeated predicates | Type/tests and counted caller sweep | Root, NodeSelection, ordering, and mode semantics | rearchitect |
| Selection aliases | `root`, `clear`, `setRange`, `isWithinText`, `SelectionApi.node` duplicate existing primitives | Use `SelectionApi.root(selection())`, `set(null)`, `set`/`setPoint`, and `SelectionApi.nodes` | Plite selection | No independent current job | Migrate/delete callers, docs, tests | Zero stale symbols plus selection tests | Partial range writes must retain `setPoint` behavior | cut |
| Node aliases/helpers | `nodes.isBlock`, `hasPath`, unused `hasBlocks/hasInlines/hasTexts`, mapping overload, public merge hook | Use schema truth, `nodes.get`, ordinary arrays, and private mechanics | Plite node/schema | Duplicated truth or zero production jobs | Migrate/delete callers | Zero stale symbols and node tests | Public callers may reveal hidden use during typecheck | cut |
| Duplicate/toggle mutations | `tx.nodes.duplicate` and `tx.nodes.toggle` overlap block jobs | Public `blocks.duplicate` and props-first `blocks.toggle`; keep generic duplicate private | Plite transactions | One canonical domain owner | Migrate block menu and other callers | Transaction/package tests | Non-block duplication may prove an independent job | cut public aliases |
| Lift/reset mutations | `blocks.lift` aliases generic lift; `blocks.reset` has one composable caller | Keep `nodes.lift`; inline reset composition | Plite/Plate caller | Domain aliases add verbs without behavior | Migrate callers | Type/tests | Reset ordering must stay atomic | cut |
| Block mutation options | Kitchen-sink toggle options and `someOptions` leak traversal internals | Props-first `blocks.toggle(props, options)` and `blocks.set(props, options)` | Plite blocks | Call sites state desired block properties directly | Migrate heading, quote, input rules | Type/runtime tests | Wrap semantics and property comparison | rearchitect |
| Nullable range equality | Four local null wrappers around range equality | `RangeApi.equals(Range | null, Range | null)` | Plite range helper | One exact equality law | Migrate stores/hooks | Unit/type tests | Root metadata must compare correctly | widen |
| Target union | Repeated `NodeSelection | NodeTarget` public spelling | One private internal target alias only | Plite implementation | Public noun has no job | Internal refactor only | Typecheck | Do not export a new abstraction | hide |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| Canonical read types | Plite | Public interfaces/helpers | Accepted target and live census | Redundant methods absent; `nodes.blocks` typed/inferred | Plite type/tests |
| Core implementation | Plite | Public state and transactions | Canonical types compile | One block traversal owner and private mechanics | Core/node/selection tests |
| Adoption | Plate/registry/docs | All authored callers | Core API stable | Zero stale calls and equivalent behavior | Affected package/UI/browser proof |
| Doctrine/release | Best API/Vision/changesets/barrels | Source rule, smallest Vision owner, generated mirrors | Final API settled | No stale teaching or exports | `pnpm install`, source/mirror sweep, changeset checks, `pnpm brl` |
| Closure | Plite/Autoreview | Strict proof and plan | Focused proof green | Strict check, P1 review, checker pass | `pnpm check:plite`, autoreview, `check-complete` |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Exact node membership stays exact | Current protocol and existing selection tests | Range, NodeSelection, named-root, package, and Browser selection proof passed | passed |
| All schema blocks have one query owner | Counted current block-predicate census | Zero repeated authored predicates where `nodes.blocks` fits; type/tests passed | passed |
| Mutations preserve behavior and inference | Current transaction implementation and real callers | Duplicate, insert-after, set, props-first toggle, content-root, package, and type proof passed | passed |
| No compatibility surface survives | Accepted hard-cut target | Removed-symbol sweep found only the intentional raw Slate transform fixture | passed |

Conditional evidence:
- High-risk scenarios: NodeSelection targets could duplicate ancestor/child
  blocks; props-first toggle could clear unrelated properties; view-root paths
  could escape their root. Focused proof must cover each.
- External research: N/A; the API target came from the bounded live-owner audit,
  not an external precedent claim.
- Issue/PR provenance: N/A; user-directed local architecture work.
- Browser/Benchmark/docs/release/behavior-law owners: Browser applies only to
  affected editor-facing selection/UI behavior; Benchmark is N/A because no
  performance claim; docs, changesets, doctrine, generated mirrors, and strict
  package proof apply.

Findings:
- The current public surface retains aliases and predicate plumbing after the
  semantic selection-authority cut. The accepted audit found no independent
  current job for those duplicates.

Decisions and tradeoffs:
- Break every rejected alias now. Migration cost orders implementation; it does
  not justify permanent duplicate APIs.

Review fixes:
- Fixed `nodes.block({ at: blockPath })` so an exact block path returns that
  block instead of searching only ancestors.
- Replaced the final AI `nodes.toArray({ match: isBlock })` callers and docs
  `nodes.set(...isBlock)` examples with the canonical block owners.
- Changed the registry date picker to its installed `initialFocus` API after
  the integration typecheck rejected `autoFocus`.
- Removed hard-coded AI API-key fallback examples discovered by the fail-closed
  review scanner.
- Removed changed-file unused imports and formatting defects.
- Rejected more `.blocks` aliases: remaining generic traversals either classify
  one node or combine plugin-specific predicates and do not represent a repeated
  public block job.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Strict source guard detected a formatting edit during Chromium | 1 | Freeze the final source tree and restart the complete strict gate | Final strict run passed |
| Development browser smoke found an unowned server on port 3102 | 1 | Kill the exact stale process and rerun only the failed smoke owner | `pnpm --filter plite test:plite-browser:smoke` passed: 3 tests |
| A second strict attempt was stopped after the final census found missed AI/docs callers | 1 | Migrate those callers, refreeze, and restart strict proof | Final strict run passed |
| Autoreview bundle scanner rejected secret-like text before model review | 1 | Remove real AI key fallbacks; keep unrelated shared-checkout content intact; perform manual P1 review | TruffleHog clean; manual P1 audit found no remaining blocker |

Verification evidence:
- `pnpm check:plite:dev`: source-first typecheck, package tests, contracts, and
  bounded www integration passed; its stale-server smoke interruption was
  closed by `pnpm --filter plite test:plite-browser:smoke` with 3 passed.
- `pnpm check:plite`: passed in 398.0 seconds. Chromium passed 710 tests with 8
  expected skips across all 79 bounded batches.
- Focused selection, range, node/block transaction, and content-root tests
  passed, including NodeSelection, named-root, nullable range equality,
  props-first toggle cleanup, and duplication behavior.
- `pnpm --filter www build:registry`: passed with 381 canonical payloads and 15
  sparse overlays.
- `pnpm brl`: passed all 56 tasks.
- Browser proof on `/blocks/node-selection-demo`: one drag visibly selected all
  six document nodes; no new runtime error was reported.
- Changed-file `oxfmt --check` passed for 196 files; changed-file
  `oxlint --deny-warnings` and `git diff HEAD --check` passed.
- Removed-API sweep is zero for authored public calls. Its only textual match is
  `packages/plite/test/transforms/deselect/basic.tsx`, an intentional raw Slate
  transform fixture using `editor.selection.clear()`.
- Repeated generic block-traversal sweep is zero. Remaining block predicates are
  direct node classification or plugin-specific generic traversal.
- `pnpm install` regenerated skill mirrors; best-api source/mirror text matches.
  Plate Next doctrine v108 validates at fingerprint
  `sha256:5344dafb618d09cabd1a8853aa524a01744d6ea64c307750023e876382c932b3`.
- Agent-native parity passed: `best-api` remains the user route and source owner,
  its generated mirror is current, and worker doctrine teaches the zero-option
  exact `selection.nodes()` contract.

Final handoff prepared:
- Ownership and target API/runtime: Plite owns selection protocol and
  schema-aware block queries; Plate/registry keep only UI and product adoption.
- Public breaks and Plate/collaboration adoption: every accepted alias is
  deleted and every live caller uses the canonical owner; no compatibility
  bridge remains.
- Applicable browser/Benchmark/docs/provenance decisions: Browser, docs,
  changesets, registry, doctrine, and generated mirrors passed; Benchmark and
  external provenance are scoped N/A.
- Proof and execution risks: strict package/browser proof is green. The bundled
  model review did not start because the shared-checkout scanner failed closed;
  manual P1 review and all executable gates found no remaining blocker.
- Execution order and user attention: implementation is complete locally. No
  commit or push was performed.

Timeline:
- 2026-08-25T15:55:59.709Z Plite Plan created.
- 2026-08-25 Accepted full API-audit target materialized as a one-shot
  execution goal.
- 2026-08-25 Canonical selection/block API implemented, all callers migrated,
  doctrine regenerated, Browser interaction proved, and strict closure passed.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Verified local handoff |
| Where am I going? | Goal closure and user handoff |
| What is the goal? | Hard-cut redundant selection/node/block APIs into canonical Plite owners |
| What have I learned? | See Findings |
| What have I done? | Implemented the hard cut and passed focused plus strict proof |

Open risks:
- The fail-closed autoreview scanner prevented a model verdict on the shared
  checkout. TruffleHog, manual P1 review, and all executable gates are clean;
  no code or API blocker is known.
