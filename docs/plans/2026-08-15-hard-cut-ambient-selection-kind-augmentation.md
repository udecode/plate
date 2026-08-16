# Hard cut ambient selection kind augmentation

Objective:
Hard-cut ambient selection augmentation; done when installed extensions infer
exact selection unions and Plite/Core/Table proof passes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-15-hard-cut-ambient-selection-kind-augmentation.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- package-api
- docs
- agent-native

Mode:
- standard accepted-plan execution; the user's latest `go` authorizes the
  already-selected target.

Completion threshold:
- `EditorSelectionKindMap` and selection-related ambient module augmentation
  have zero production or test matches.
- Installed custom selection descriptors infer exact read and update payloads;
  an editor without the descriptor rejects that selection kind at compile time.
- Table declares `table-cell` once through `selectionKinds`, with no separate
  global type registration.
- Focused Plite, Core, and Table type/tests pass; package/release/doctrine
  adoption is complete; P2 autoreview and `check-complete` pass.

Verification surface:
- Source audits for `EditorSelectionKindMap`, `declare module '@platejs/plite'`,
  `selectionKinds`, and selection setter/read types.
- Compile-only positive and negative installation tests.
- Source-first typechecks and focused tests for `plite`, `@platejs/core`, and
  `@platejs/table`, followed by the affected Plite development lane.
- Package changesets, generated barrels when needed, doctrine mirror parity,
  P2 autoreview, and final plan checker.

Constraints:
- No public compatibility aliases or runtime shims.
- Preserve runtime selection codecs, validation, mapping, history,
  collaboration, and persistence behavior.
- Carry only the lightweight installed selection union through editor
  capabilities; do not pull full schema grammar or recursive dependency shapes
  into ordinary editor access.
- Keep `TableCellSelection` as Table's real persistence/runtime contract.
- Do not touch unrelated registry or application source.

Boundaries:
- In scope: Plite selection descriptor/type projection, Core's Plite lowering,
  Table's selection declaration, direct tests/exports/docs/doctrine, and
  changesets.
- Source owners: `packages/plite`, `packages/core`, `packages/table`, direct
  collaboration consumers only if their selection types break.
- Non-goals: selection runtime redesign, new selection kinds, schema grammar,
  registry UI, or compatibility with ambient augmentation.
- Direct Plate/collaboration adoption owners: Core and Table are required;
  history/Yjs are proof/adoption owners only if the new generic reaches them.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Stop only if TypeScript cannot project exact installed selections without a
  recursive capability expansion after three distinct owner-level designs and
  focused declaration proofs; otherwise pivot at the owning generic.

Plite Plan state:
- status: done
- phase: close
- next: none
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Exact hard-cut, inference, Table, negative-installation, and proof rows are recorded above. |
| Active goal and plan verified | yes | Goal tool points to this plan. |
| Current owners read | yes | Prior live review identified `packages/plite/src/interfaces/selection.ts`, `packages/plite/src/interfaces/editor.ts`, Core lowering, and `packages/table/src/lib/BaseTablePlugin.ts`; execution starts by refreshing them. |
| Best API target resolved | yes | `best-api`: installed descriptor inference wins; global TypeScript augmentation is rejected. |
| Mode and execution boundary resolved | yes | One-shot execution authorized by the user's `go`. |
| Package/API pack selected | yes | Public package type contract changes across Plite/Core/Table. |
| Public surface or package boundary identified | yes | Plite selection types and Plate's lowered plugin contract. |
| Release artifact path selected | yes | One changeset per published package with a user-visible delta from `main`. |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded before implementation. |
| Barrel/export impact decision recorded | yes | Run `pnpm brl` only if public exports or exported file layout change. |
| Docs pack selected | yes | Vision/current doctrine may change; no user docs are assumed. |
| `docs-creator` loaded | yes | Loaded before final public API/docs validation. |
| Docs lane selected | yes | Current-state Plite extension/selection API reference plus package release prose. |
| Target docs and nearest sibling docs read | yes | Plite extension/selection reference and sibling API pages were audited against source. |
| Docs style doctrine read | yes | Current-state reference voice and package release prose rules applied. |
| Documented source owner identified | yes | Root `VISION.md`, `docs/vision/common.md`, `docs/vision/plite.md`, and `docs/vision/plate.md`. |
| Agent-native pack selected | yes | `best-api` and affected worker doctrine must reject ambient capability registration. |
| Agent-facing action surface identified | yes | `.agents/rules/**` source rules, never generated `SKILL.md` files. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**`, run `pnpm install`, then audit `.agents/skills/**`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Load before doctrine closeout and run its required review. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Delete `EditorSelectionKindMap` and every selection-kind ambient module augmentation.
- [x] Infer the exact selection union from installed extension/plugin descriptors without recursive schema/dependency expansion.
- [x] Prove custom installed selection read narrowing and update acceptance.
- [x] Prove a non-installed custom selection kind is rejected at compile time.
- [x] Keep Table's `TableCellSelection` contract and register it exactly once in `selectionKinds`.
- [x] Preserve selection codec, mapping, validation, persistence, history, and collaboration runtime behavior.
- [x] Current API/docs/tests/exports/behavior claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | Execution ledger defines binary source/type/runtime/proof gates. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Exact owner refresh is the first execution slice. |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | Installed inference is the accepted target; ambient/global/open-string alternatives are rejected. |
| Conditional risk and adoption | yes | Complete triggered risk/browser/benchmark/provenance work or give one scoped N/A reason | High-risk selection/type adoption is covered by compile/runtime and direct collaboration checks; browser only if a runnable affected behavior exists. |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Proof matrix below names source, compile, runtime, release, doctrine, and review gates. |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Final handoff fields are defined below and will be replaced with actual evidence. |
| P2 autoreview | yes | Run with `--max-priority P2` for implementation changes; P3 is opt-in only, or record planning-only N/A | Required after final formatting and tests. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-15-hard-cut-ambient-selection-kind-augmentation.md` | Final checker passes after this evidence update. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Audit `EditorSelection`, extension definition/provider inference, Core lowering, and Table declaration. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published type/API delta; changeset comparison must use `main`. |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | `changeset` loaded; exact affected package files decided after `main` comparison. |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: registry is outside scope. |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: package consumers observe the type-contract hard cut. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | `pnpm check:plite:dev` passed: 51 typechecks, `www` integration, every affected package test, Chromium 3/3. Focused Plite selection 15/15 and Table slow selection 21/21 also pass. |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: existing exported owners changed in place; no public file or barrel topology changed. |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | API reference check, docs source parity, exact stale-symbol sweep, and generated manifest check pass. |
| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names or record N/A | `check:docs` passed; the standalone Plite Chromium smoke passed. The www docs dev route remained blocked by unrelated stale generated registry imports, so no docs-wrapper browser claim is made. |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | `pnpm --filter www check:docs` ran `build:source`; docs source parity passed. |
| Plugin page specifics | no | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | N/A: no plugin docs page. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` regenerated mirrors; Plate Next v85 validation passes for 42 active and one retired package. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Source and generated Best API, Plate Plugin Creator, and Plate Next teach installed selection truth and layered/minimal helper inference. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Loaded; generated parity and exact source/resource validation pass. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Target, owners, constraints, and risks recorded from accepted review. | Decide |
| Decide | completed | Installed descriptor inference selected; ambient map and compatibility paths rejected. | Execute and prove |
| Execute and prove | completed | Exact selection projection, Core/Table adoption, docs/release/doctrine, full proof, and P2 review closed. | None |

Decision brief:
- outcome: selection types reflect the actual installed runtime graph.
- chosen shape: lightweight selection payload inference from each installed
  extension's `selectionKinds` descriptors.
- strongest rejected alternative: keep `EditorSelectionKindMap` as a global
  augmentable escape hatch.
- consequence: custom selection authors declare the codec/validator/type once;
  editor reads and writes gain the capability only when installed.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Selection union | Global augmentable map | Installed extension-derived union plus built-ins | Plite | Match type truth to runtime installation | Core carries the lightweight provider; Table consumes it | Positive/negative compile tests | Recursive generic expansion | rearchitect |
| Table selection | Runtime descriptor plus ambient type registration | One `selectionKinds` declaration | Table | Eliminate drift and global pollution | Delete augmentation; retain `TableCellSelection` | Table type/runtime tests | Declaration inference loss | cut |
| Plate lowering | Exact selection payload erased or globally recovered | Preserve descriptor payload through Core-to-Plite lowering | Core | Plate plugins must inherit Plite's native field inference | Core compile tests and Table portal/editor inference | Core/Table typecheck | Double expansion | rearchitect |
| Compatibility | Ambient map or open `kind: string` escape | No compatibility path | Plite | A second truth source defeats the cut | Sweep exports/tests/docs | Zero-match audit | Third-party break | cut |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Refresh and type model | Plite | Exact selection/extension/provider/source/test owners | Active accepted target | Smallest non-recursive projection chosen and compile fixtures defined | Source ledger and red/green type fixtures |
| 2. Substrate implementation | Plite | Selection types, extension capability inference, read/update surfaces | Slice 1 complete | Installed union works; ambient map deleted | Plite typecheck and focused tests |
| 3. Plate adoption | Core + Table | Preserve selection kind type through lowering; remove Table augmentation | Slice 2 complete | Table-only editor narrows/sets exact payload; no-Table editor rejects it | Core/Table typechecks and tests |
| 4. Release and doctrine | Changesets + Vision/rules | Main-relative release prose and best-api worker repair | Runtime/type shape stable | No stale teaching; generated mirrors synchronized | Changeset audit, `pnpm install`, source/mirror searches |
| 5. Closure | Root | Format/lint, affected lane, P2 autoreview, plan checker | All source settled | Zero accepted findings and every gate has fresh evidence | Final commands and checker |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Type truth follows installation | Current map and descriptor types | Installed, absent, annotated-callback, bare-editor, dependency, and same-kind/different-payload compile contracts pass | passed |
| Runtime selection behavior is unchanged | Existing codec/map/validate tests | Plite selection 15/15, Table fast 243/243 package suite, Table slow selection 21/21, all affected package tests | passed |
| Core preserves native selection payload | Current lowering source | Core contracts/typecheck and full `www` package integration pass without TS2589 | passed |
| No ambient compatibility remains | Repository-wide exact-name audit | Zero `EditorSelectionKindMap` or selection `declare module '@platejs/plite'` matches; one Table `selectionKinds` registration | passed |
| Published and agent teaching match source | Main comparison and doctrine owners | Changesets, API-reference/docs parity, `pnpm install`, Plate Next v85 validation, release contracts 8/8 | passed |

Conditional evidence:
- High-risk scenarios: (1) built-in text/node selection disappears from generic
  editors; (2) custom kind is accepted without installation; (3) dependency
  expansion triggers TS2589 or declaration widening. Each gets focused type or
  runtime proof.
- External research: N/A; target follows accepted local API law and current
  runtime ownership.
- Issue/PR provenance: N/A; user-directed local architecture hard cut.
- Browser/benchmark/docs/release/behavior-law owners: browser proof only if a
  runnable Table selection route is affected at runtime; no performance claim;
  Vision/rules and changesets apply.

Findings:
- `EditorSelectionKindMap` is a global TypeScript registry while runtime
  selection support is already installed through `selectionKinds`.
- Table registers `table-cell` twice: runtime descriptor and ambient module
  augmentation.
- The global map makes import presence look like editor installation and lets
  type, codec, validator, and runtime membership drift.

Decisions and tradeoffs:
- Carry only selection payload capability through installed extension typing;
  full extension definitions and schema grammar remain out of ordinary editor
  access.
- Keep `TableCellSelection` because it is a real runtime/persistence contract;
  delete only its ambient publication path.
- Reject an open custom-selection fallback and a moved `.d.ts` augmentation;
  both preserve the lie.

Review fixes:
- Removed `never` erasure from `usePlateEditor` and the React editor
  construction path; public generics now reach the checked constructor
  overload, while runtime erasure stays inside the implementation boundary.
- Restricted `getEditorRuntimeOwner` from arbitrary `object` to the shallow
  editor carrier it actually consumes (`id`, `read`, `update`).
- Made the hidden editor selection witness invariant over the complete payload,
  not merely `kind`, and added a same-kind/different-payload negative compile
  contract.
- Rejected the selector-proxy finding: every current descriptor-bearing state,
  transaction, block, and selection method is present in its lowering map;
  there is no inherited descriptor-aware method outside those owners.
- Rejected the bare-DOM finding: it cited the internal runtime alias in
  `plugin/dom-editor.ts`; the public root exports `DOMEditor` from
  `plugin/with-dom.ts`, whose default is already `readonly []`.
- Rejected final Autoformat and Code Block findings as unrelated shared-checkout
  work outside this plan's source boundary.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Raw Bun React path mismatch | 1 | Reset the workspace install instead of changing runtime code | Reinstall restored one React graph. |
| Yjs descriptor tuple inference widened | 1 | Split raw tuple inference from layered state-provider inference | Raw and layered hook overloads now infer independently. |
| Selection literal widened through descriptor projection | 1 | Preserve the descriptor's exact `selectionKinds` payload | Exact literal union retained. |
| React internal type expansion hit TS depth | 1 | Remove whole-editor re-intersection | Layered capabilities project once. |
| EditorKit app access hit TS2589 | 1 | Keep runtime capabilities shallow and schema grammar separate | App-scale access compiles. |
| Duplicate major changeset coverage | 1 | Reuse owning package changesets | One owning release entry per package retained. |
| Wrong release-contract test path | 1 | Resolve the package-owned test path | Release contracts pass 8/8. |
| Wrong Vitest runner for Bun-owned spec | 1 | Use the package's declared test runner | Focused suites pass under package scripts. |
| Selection setter became over-strict at runtime boundaries | 1 | Keep public exactness and named internal erasure | Public contracts stay exact; runtime implementations remain existential. |
| Editor captured before extension publication | 1 | Resolve through the published runtime owner | Publication order remains atomic. |
| www docs wrapper failed on stale generated registry imports | 1 | Use the runnable Plite browser surface and report the boundary | Chromium smoke passes 3/3; no docs-wrapper claim. |
| First P2 review reported unrelated Autoformat/Code Block issues | 2 | Verify scope and exact source ownership | Rejected as unrelated shared-checkout findings. |
| Bare editor defaults exposed `AnyEditor` boundary debt | 1 | Default public generics to `readonly []`; name runtime erasure | Bare editor negative contracts pass. |
| Packed API manifest was stale | 1 | Rebuild owning package and regenerate API reference | API reference check passes. |
| Redundant Plate `ReactEditor` intersection recursed | 1 | Project installed graph once and add only shallow Core API | Core and EditorKit compile. |
| Final Table callback lost DOM/selection capability | 1 | Carry installed selection witness and shallow Core API at the owner | Table callbacks infer exact payload and DOM API. |
| Yjs raw React type rejected layered Plate editor | 1 | Add raw tuple and layered-provider signatures | Yjs, apps/plite, and www compile. |
| Adding selection to synthetic transaction descriptor reconstructed raw editor | 1 | Keep exact explicit transaction selection without a fake descriptor field | Integration compiles without widening. |
| `createEditorView` reconstructed a raw editor from one provider | 1 | Preserve the complete layered caller through the public signature | Raw tuple and layered view inference both pass. |
| Geometry helpers required a whole `DOMEditor` | 1 | Accept minimal read/DOM capability shapes | Cursor/Floating and consumers typecheck. |
| Plite React surface contract caught direct internal imports | 1 | Re-export `AnyEditor` through the existing runtime facade | Surface contract passes 54/54. |
| Focused Bun preload was resolved from the wrong root | 1 | Run the package-owned test script | Plite selection passes 15/15. |
| Runtime-owner union caused recursive type comparison | 1 | Use a shallow editor carrier instead of a whole-editor union | Plite/Core typechecks pass. |

Verification evidence:
- `pnpm check:plite:dev`: passed in 127.47s; 51 package/app typechecks,
  `www` package integration, all affected package tests, and Chromium 3/3.
- `pnpm --filter @platejs/plite test test/selection-protocol.test.ts`: 15/15.
- `pnpm test:slow packages/table/src/lib/BaseTablePlugin.selection.slow.tsx`:
  21/21 with 463 assertions.
- Table package fast suite: 243/243 with 18,323 assertions.
- `pnpm turbo typecheck` for Plite, Plite React, Core, Yjs, Cursor, Floating,
  Table, and AI: 46/46 tasks.
- `pnpm --filter www exec tsc --noEmit -p tsconfig.package-integration.json`:
  passed.
- API reference generation/check, docs source parity, release contracts 8/8,
  Biome, and `git diff --check`: passed.
- Exact stale-symbol audit: zero ambient selection-map/augmentation matches;
  BaseTablePlugin has exactly one `selectionKinds` registration.
- `pnpm install` plus Plate Next v85 validation: 42 active, one retired,
  source/generated doctrine parity valid.
- P2 autoreview: four accepted selection/type-boundary findings fixed; two
  source-invalid and two unrelated findings explicitly rejected above.

Final handoff prepared:
- Ownership and target API/runtime: Plite derives custom selections solely from
  installed descriptors; Core preserves them through Plate projection; Table
  declares `table-cell` exactly once.
- Public break: `EditorSelectionKindMap` and ambient selection augmentation are
  gone with no compatibility path. Custom selection authors use
  `selectionKinds` only.
- Inference law: bare editors expose built-ins only; installed editors expose
  their full exact payload; same `kind` with a different payload is rejected.
- Layer law: generic helpers preserve layered callers or accept minimal
  capabilities. Plate Next doctrine v85 records and enforces it.
- Proof: full affected type/test/browser lane, focused slow/runtime/type
  contracts, API/docs/release/doctrine checks, and P2 review are closed.
- Remaining risk: none inside the selection boundary. The unrelated www docs
  wrapper import failure and unrelated Autoformat/Code Block review findings
  remain owned by their existing shared-checkout work.

Timeline:
- 2026-08-15T19:51:39.461Z Plite Plan created.
- 2026-08-16 exact installed-selection projection and Table/Core adoption completed.
- 2026-08-16 layered helper inference, Yjs adoption, docs/release/doctrine, and full proof completed.
- 2026-08-16 P2 findings triaged, accepted fixes proven, and handoff prepared.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Closed |
| Where am I going? | Handoff only |
| What is the goal? | Make selection types derive solely from installed descriptors. |
| What have I learned? | Exact selection truth requires full-payload invariance and layered helpers that do not rebuild raw editors. |
| What have I done? | Cut ambient truth, adopted Core/Table/Yjs/layered helpers, repaired doctrine, and passed every scoped gate. |

Open risks:
- None inside the completed scope. Full schema/dependency grammar remains
  intentionally separate from lightweight runtime capability projection.
