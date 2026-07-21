# Wordgard Plite rewrite execution

Objective:
Complete Wordgard-to-Plite rewrite slices 1-10; done when hard-cut adoption,
proof matrix, browser/benchmark/release gates pass; plan
docs/plans/2026-07-17-wordgard-plite-rewrite-execution.md.

## Canonical-change closure correction (2026-07-18)

The original closure ledger overstated five architecture claims. The follow-up
execution in `docs/plans/2026-07-18-plite-canonical-change-architecture.md`
completed them against the live tree:

- hard-cut `EditorCommitImpact`, the operation-derived runtime impact builder,
  and duplicate commit construction;
- translate Yjs events to incremental `DocumentChange` values and lower
  canonical changes outbound;
- retain one shared incremental index for active anchor rebasing, reducing the
  10,000-block / 250-anchor / 250-change median from 19,997.52ms to 3,548.51ms
  with a 3,375.64ms best sample;
- add generated nested structural/property, multi-root, serialization,
  correction, and pair-transform laws;
- route Plite React DOM timing through one bounded per-root phase scheduler.

The follow-up also removed the false claim that pairwise transform implies a
general three-peer central-OT protocol. Yjs remains the production multi-peer
ordering owner.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-17-wordgard-plite-rewrite-execution.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- docs
- browser
- package-api

Mode:
- `deep`: the accepted rewrite changes the model, transaction law, selection,
  normalization, DOM/React consumers, history, collaboration, public API,
  docs, browser behavior, and performance contract.

Execution authorization:
- The user accepted `docs/plans/2026-07-16-wordgard-plite-rewrite-comparison.md`
  and explicitly ordered every remaining slice to run continuously.
- Slices are internal dependency/proof gates, not user approval stops.
- Continue through residual slice 0 ownership and slices 1-10; stop only for a
  real blocker satisfying the blocked condition or the final verified handoff.
- Prefer the production hard cut and deletion of old truth over more private
  prototype ceremony.

Completion threshold:
- Residual slice 0 baseline runners are repaired or replaced with current Plite
  owners and produce truthful transaction/normalization/history/selection/Yjs
  evidence.
- Slices 1-10 satisfy every entry/exit/proof row in the accepted parent plan;
  no required slice remains pending, deferred, or represented only by a note.
- `DocumentChange` is the only canonical document mutation truth; rejected
  operation-era ref mapping, rollback replay, eager commit impact, state-patch
  replay, closed selection aliases, and per-operation normalizer paths have
  zero surviving production callers, exports, docs, examples, or runtime flags.
- Every published package/API break is adopted by Plate/Yjs/apps, documented in
  latest-state voice, exported through generated barrels, and classified by a
  package changeset relative to `main`.
- Focused package tests, source-first typechecks, lint, `pnpm check:plite`, the
  closure browser matrix, applicable benchmarks, `pnpm check`, deletion audits,
  and final `autoreview` are green.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-17-wordgard-plite-rewrite-execution.md`
  passes after fresh evidence is recorded.

Verification surface:
- Package/source proof across `packages/plite*`, `packages/browser`,
  `packages/yjs`, direct Plate adopters, `apps/plite`, and affected `apps/www`
  examples/docs.
- Algebra/schema/index/transaction/field/facet/selection/correction/history/
  DOM/React/Yjs/layout tests plus compile-time inference fixtures.
- `pnpm check:plite`, focused Browser proof on richtext, DOM coverage, huge
  document, multi-root, pagination, paste, table/selection, undo/redo, and Yjs,
  then `pnpm check:plite:browser-matrix` at closure.
- Fair current/new-engine benchmark artifacts for transaction, normalization,
  history retention, selection, render/fanout, huge document, and Yjs where the
  accepted plan claims performance or locality.
- Exact `rg` deletion/export/docs audits, package changesets relative to
  `main`, barrel generation, root typecheck/lint/check, plan checker, and final
  scoped review.

Constraints:
- This is accepted-plan execution; do not pause for slice approval.
- No public compatibility aliases or runtime shims.
- No dual engine, public feature flag, operation sidecar truth, or docs for the
  rejected architecture.
- Preserve plain JSON storage, stable runtime identity, typed extension DX,
  implicit primary root, multi-root atomicity, React host behavior, Plite DOM/
  IME coverage, Yjs provider/awareness/offline behavior, and layout ownership.
- Type inference is mandatory for callbacks; fix owning generics instead of
  annotating callback parameters.
- Templates remain CI-owned; do not edit `templates/**`.
- No git publication unless the user explicitly requests it.

Boundaries:
- In scope: residual slice 0 plus slices 1-10 from the accepted parent plan,
  including production packages, direct adoption callers, docs/examples,
  browser proof, benchmarks, barrels, and changesets.
- Source owners: `packages/plite`, `plite-dom`, `plite-react`, `plite-history`,
  `plite-hyperscript`, `plite-layout`, `browser`, `yjs`, `packages/core`, and
  only direct Plate adopters named by the adoption inventory/compiler.
- Non-goals: editing `../wordgard`, bundling Wordgard product UI/features into
  Plite, unrelated Plate packages/registry UI, PR/commit/push, or preserving old
  public APIs for compatibility.
- Direct adoption owners: the exhaustive
  `docs/plans/artifacts/wordgard-plite-rewrite-comparison/adoption-inventory.md`,
  expanded only by live compiler/source evidence.

Output budget strategy:
- Read named owners and inventories first; use `rg --files`, counts, and
  file-list artifacts before content; cap reads by owner/line range; exclude
  dependencies, generated output, caches, fixtures, `.next`, `.turbo`, and
  benchmark samples unless they are the named proof owner.
- Persist large caller/deletion/benchmark evidence under
  `docs/plans/artifacts/wordgard-plite-rewrite-execution/` and inspect bounded
  summaries instead of streaming repo-wide output.

Blocked condition:
- Block only when the same required slice gate fails after three genuinely
  different focused fixes and no smaller truthful architecture path remains,
  or when required browser/device/external authority is unavailable and no
  equivalent local proof can establish the claim. Breadth, compiler fallout,
  failing tests with an identifiable owner, and review findings are not blockers.

Plite Plan state:
- status: complete
- phase: verified handoff
- next: none
- handoff: prepared below

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Continuous slices, no approval pauses, real-blocker/final stop conditions, hard-cut preference, proof and handoff requirements copied above |
| Active goal and plan verified | yes | Active goal names this exact execution plan and slices 1-10 threshold |
| Current owners read | yes | Root/plite vision, accepted parent plan, slice-0 ledger, source/comparison/adoption inventories are execution authority; exact live owners are refreshed per slice |
| Mode and execution boundary resolved | yes | Deep one-shot accepted-plan execution; residual slice 0 plus slices 1-10 |
| Docs pack selected | yes | Architecture/API/spec/latest-state docs change in slice 10 |
| `docs-creator` loaded | yes | `.agents/skills/docs-creator/SKILL.md` read in full before docs execution |
| Docs lane selected | yes | Spec/law plus API-reference and architecture-guide lanes |
| Target docs and nearest sibling docs read | yes | Plite API, concepts, walkthroughs, React annotation docs, and package README siblings were read before the hard cut |
| Docs style doctrine read | yes | `docs-creator` current-state, ownership, source-backed, anti-changelog rules apply |
| Documented source owner identified | yes | Production Plite exports/runtime own claims; `VISION.md`, `docs/vision/plite.md`, `docs/plite/**`, and apps examples consume them |
| Browser pack selected | yes | Slices 7-9 and closure change browser-owned behavior |
| Browser route / app surface identified | yes | `apps/plite` richtext, DOM coverage, huge-document, multi-root, pagination, paste/table, undo/redo, and Yjs surfaces |
| Browser tool decision recorded | yes | Use in-app Browser for normal route/interaction proof; Chrome/Computer only if native OS/browser UI becomes necessary |
| Console/network caveat policy recorded | yes | Record console/network state for each final route proof; no silent waiver |
| Package/API pack selected | yes | Slices 1-10 change published package APIs, exports, types, and runtime behavior |
| Public surface or package boundary identified | yes | Plite substrate packages plus named Plate/Yjs adopters; no product UI moved into core |
| Release artifact path selected | yes | `.changeset/*.md`, one package per file, for final published deltas relative to `main`; registry changelog only if registry source changes |
| `changeset` skill loaded when `.changeset` is required | yes | `.agents/skills/changeset/SKILL.md` read; one package per file, relative to `main` |
| Barrel/export impact decision recorded | yes | Public production files/exports will change; run `pnpm brl` after export layout stabilizes |

Work Checklist:
- [x] First checkpoint: explicit user requirements, scope, no-pause execution,
      stop conditions, deliverables, verification surface, and final handoff are
      copied into this plan before production implementation.
- [x] Accepted parent plan, root/plite vision, slice-0 evidence, and editor
      candidate map are read before live-owner grounding.
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports/behavior claims cite live source.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and private internal intent lowering have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console errors are checked; no network owner changed and the static proof app used no external dependency.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied through package changesets; registry changelog is N/A because no registry source changed.
- [x] Package/API pack: `.changeset` work loaded `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work is N/A because this is package/runtime/docs work.
- [x] Package/API pack: no-artifact decisions are N/A because every published package delta has a changeset.
- [x] Package/API pack: the public hard cut is explicit; no compatibility aliases survive.
- [x] Package/API pack: package-owned source-first typecheck and test proof is recorded.
- [x] Package/API pack: `pnpm brl` completed after export changes.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | Slices 0-10 are implemented; closeout commands below are fresh |
| Fresh source evidence | yes | Recheck decision-changing current claims | Final source/docs/export scans use the current checkout |
| Conditional risk and adoption | yes | Complete triggered risk/browser/benchmark/provenance work or give one scoped N/A reason | Browser matrix, Yjs demo, 13 benchmarks, package adoption, and changesets are covered; public provenance is N/A for a local rewrite |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Proof matrix and artifact summary record exact commands/results |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Final handoff section below is resolved |
| Autoreview | yes | Run for implementation changes or record planning-only N/A | Final local Codex review is clean: no accepted/actionable findings; patch correct at 0.72 confidence |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-17-wordgard-plite-rewrite-execution.md` | Passed on the final verified ledger |
| Docs source-backed claim audit | yes | Verify docs claims against current source | Stale refs/bookmarks/replay prose removed; canonical anchor/change docs match exports |
| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names | `www` source parity and typecheck passed |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` | Passed |
| Plugin page specifics | no | Plugin-page kit rules | N/A: no plugin manual page changed |
| Browser interaction proof | yes | Exercise target route/interaction with Browser | Richtext edit/undo, multi-root state/undo, pagination, and four-peer Yjs sync passed |
| Browser console/network check | yes | Record console/network state | No console warnings/errors on final pagination or Yjs routes; local static app has no external network owner |
| Browser final proof artifact | yes | Record route/interaction proof | Evidence recorded below and in the execution artifact |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Hard-cut adoption plus barrel and typecheck proof |
| Release artifact classification | yes | Classify release impact | Published breaking package API/runtime changes |
| Published package changeset | yes | Add one package changeset per published delta and reject forbidden minors | Plite/core/React/history/layout/Yjs/DOM/hyperscript/browser/adopter changesets present; Footnote covered by `footnote-v54-runtime.md` |
| Registry changelog | no | Registry-only source work | N/A: registry source did not change |
| No release artifact | no | Internal/docs-only work | N/A: package users see breaking deltas |
| Package typecheck/build/test | yes | Run owning package checks | `check:plite`, Plite/Footnote source-first typecheck, Plite 65/65, history 18/18 passed |
| Barrel/export generation | yes | Run `pnpm brl` | 56 tasks passed |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Residual 0. Current baseline ownership | done | All 13 current runners execute against live Plite source; Yjs uses the shared source alias owner | Keep as before-rewrite comparison corpus |
| 1. Immutable snapshot, index, schema | done | Frozen structurally shared snapshots, compiled schema, indexed document cache, atomic abort, model/schema/index laws | Closed |
| 2. Canonical change, transaction, commit | done | `DocumentChange` owns apply/compose/invert/map; commits carry canonical changes and lazy impact; direct change application is atomic | Closed |
| 3. Fields, facets, effects, slots, commands | done | Typed fields/facets/effects/annotations/slots/commands adopted without callback annotations | Closed |
| 4. Anchors and extensible selections | done | Refs/bookmarks hard-cut to root-aware anchors; text/node/cell/custom selections map through the protocol | Closed |
| 5. Schema fit and changed-range correction | done | Changed-range corrections converge; intent paths rebase through later intents; old normalizer truth deleted | Closed |
| 6. Inverse-change history | done | History stores inverse changes, selections, effects, annotations; replay/state-patch stacks removed | Closed |
| 7. DOM codecs, scheduler, view layers | done | DOM/React consumers use changes, anchors, stable content roots, and bounded publication | Closed |
| 8. React/input adoption | done | Input/IME/selection/huge-document packages and Chromium proof green | Closed |
| 9. Yjs, multi-root, layout adoption | done | Yjs uses canonical changes plus derived-intent lowering; multi-root atomicity/layout/browser matrix green | Closed |
| 10. Plate hard cut, docs, release | done | Callers/docs/exports changed together; barrels and per-package changesets present | Closed |
| Closeout | done | Fresh package/root/browser/benchmark gates, clean final autoreview, and strict goal checker are green | Closed |

Decision brief:
- outcome: Ship a from-scratch Plite engine where immutable JSON snapshots and
  root-aware `DocumentChange` are document truth, then migrate every consumer
  and delete the operation-era engine without compatibility mode.
- chosen shape: compiled schema + persistent root indexes + canonical changes +
  native transactions/compact commits + typed fields/effects + anchors/custom
  selections + changed-range correction + inverse history, consumed by existing
  DOM/React/Yjs/layout package boundaries.
- strongest rejected alternative: retain operations as canonical mutation and
  layer `ChangeSet` beside them. That creates two truths and preserves the exact
  mapping/impact/rollback duplication the rewrite exists to delete.
- consequence: broad breaking API/runtime adoption is intentional; Plate,
  history, DOM/React, Yjs, examples, docs, exports, and changesets move together.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Model/schema/index | Mutable transaction tree with snapshot/index retrofits | Frozen structurally shared JSON with compiled schema and private root token/path/runtime-ID indexes | `packages/plite` | Preserve JSON/identity while gaining structural law/locality | Constructors, external values, Plate schema contributions | Model/schema/index fuzz, serialization, identity, multi-root, benchmark | Accidental mutation and schema rigidity | hard cut storage, keep JSON |
| Canonical delta/transaction | Operation stream plus rollback/commit inference | Root-aware `DocumentChange`, one draft, one compact commit, derived replay-validated intents | `packages/plite` | One mapping/inversion/impact truth | All writes, commit consumers, Yjs bridge | Algebra laws, atomic abort/no-op/nested policy, publication/huge-doc benchmarks | Largest blast radius | hard cut operations as truth |
| Transaction extensions/commands | State patches and imperative handlers | Typed fields, facets, effects, annotations, slots, mostly pure command specs | `packages/plite`, `packages/core`, `packages/ai` | Coherent extensibility without losing inference | State users, commands, AI state | Runtime/type inference/reconfigure/headless tests | Over-general abstraction | adopt narrowly |
| Locations/selections | Paths/points plus three live ref families and `Range | null` | Snapshot paths plus root-aware anchors and extensible selection protocol | Plite core/DOM/React plus table/selection callers | One mapping law and real non-text selections | Adoption inventory callers | Mapping fuzz, serialization, DOM/table/bidi/browser proof | Massive typing/DOM reach | breaking hard cut |
| Structural correction | Dirty paths and per-operation normalization | Schema fit plus deterministic changed-range corrections with cycle diagnostics | `packages/plite`, core/list/table correction owners | Repairs should compose into canonical transaction changes | Every normalizer caller | Existing corpus, malformed fuzz, list/table, convergence/cycle benchmark | Outcome/order drift | rewrite/delete old loop |
| History | Operation/state-patch stacks | Inverse changes + selection + inverted effects + annotations | `packages/plite-history` | Algebra owns inverse/mapping/group policy | History consumers/examples | Full history/browser/memory proof | Snapshot retention | rewrite |
| DOM/view/React/input | Wide commit impact and mixed timing/store paths | Anchor mapping, phased scheduler, mapped view layers, snapshot selectors, one publication | `plite-dom`, `plite-react`, `browser`, apps | Keep proven input/IME behavior while simplifying consumers | DOM/input/controllers/stores/examples | DOM/React suites, Browser routes, fanout/render/huge-doc benchmarks | Under-invalidation and React timing | keep behavior, rewrite substrate |
| Collaboration/multi-root/layout | Yjs operation bridge; root/layout consume operation-era commits | Yjs change adapter, atomic root changes, changed-range layout invalidation | `packages/yjs`, `plite-layout`, apps | Keep stronger Plite capabilities over new truth | Provider/awareness/history/examples | Convergence/offline/undo/browser/benchmark/layout tests | Granular lowering/identity | keep features, replace adapter |
| Public adoption/docs/release | Existing operation/ref/selection/normalizer teaching and callers | Only final change/anchor/selection/schema API and current-state docs | Direct Plate adopters, `apps/www`, barrels, changesets | No dual public story | Full adoption inventory + compiler expansion | Zero legacy matches, docs build/routes, package proof, `pnpm check` | Long migration leaving sludge | hard cut |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 0b | Benchmarks/current corpus | Repair or replace five stale current baseline runners | Representation gate passed | Current targets run on live Plite and artifact current behavior/cost | Focused tests + transaction/normalization/history/selection/Yjs runners |
| 1 | `packages/plite` | Immutable snapshots, persistent indexes, compiled schema | 0b green | Values validate/freeze/share; roots and identities index consistently | Model/schema/index fuzz, serialization, multi-root, typecheck |
| 2 | `packages/plite` | Production `ChangeSet`/`DocumentChange`, native transaction, compact commit | 1 stable | Every write lowers to changes; old mutation/rollback/eager commit path deleted | Algebra/atomicity/publication/huge-doc proof |
| 3 | Plite/core/AI | Fields, facets, effects, annotations, slots, commands | 2 stable | State-patch users gone; typed reconfigure/commands green | Runtime/type/headless/AI tests |
| 4 | Core/DOM/React + callers | Anchors and extensible selections | 2-3 stable | Ref/closed-selection callers and exports gone | Mapping/type/selection/browser proof |
| 5 | Plite + correction callers | Schema fit and changed-range correction | 1-4 stable | Old dirty/per-op normalizer path deleted | Corpus/fuzz/list/table/convergence/perf |
| 6 | `plite-history` | Inverse-change history | 2-5 stable | Replay/state-patch history gone; behavior retained | History/browser/memory proof |
| 7 | `plite-dom`, `plite-react` stores | Codecs, mapping, scheduler, mapped view layers | 4/6 stable | DOM and stores consume anchors/changes; duplicate impact paths gone | DOM/paste/decorations/hidden-content/fanout proof |
| 8 | `plite-react`, apps | React/input adoption | 7 stable | One publish; input/IME/coverage green; obsolete controllers deleted with proof | React, `check:plite`, Browser, render/huge-doc benchmarks |
| 9 | Yjs/layout/apps | Collaboration, roots, layout adoption | 2/4/6/8 stable | Yjs/features retained; root commits atomic; layout consumes changes | Yjs/layout/browser/matrix/benchmarks |
| 10 | All adoption/docs/release owners | Plate migration, deletion, docs, exports, changesets | 1-9 green | Zero legacy/dual paths; docs/package/root release proof green | Deletion audit, barrels, typecheck/lint/checks/browser/review |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Immutable indexed JSON is viable | Slice-0 prototype and benchmark | Production model/schema/index laws and locality benchmark | passed |
| One change law owns mutation/mapping/inverse | Donor algebra + private 14-test gate | Production algebra fuzz, serialized replay, intent hash, deleted operation truth | passed |
| Transactions are atomic and publish once | Parent target contract | Abort/no-op/nested/multi-root/effect tests + publication benchmark | passed |
| Extension DX remains typed | Plite inference strength retained | Compile-time field/facet/effect/command/slot fixtures | passed |
| All locations map through anchors | Parent mapping decision | 31 focused anchor contracts plus package/browser coverage and deletion audit | passed |
| Selections are extensible and DOM-correct | Wordgard protocol gap + Plite browser corpus | Text/node/cell/custom serialization/mapping/DOM/table/browser | passed |
| Schema/correction preserves behavior | Parent correction design | Normalization corpus + malformed/list/table/cycle/convergence/perf | passed |
| History is simpler without policy loss | Inverse algebra | 18/18 history tests, selection/effects/root policies, undo browser, retention benchmark | passed |
| DOM/React consumers stay local and correct | Existing corpus retained | DOM/React suites, route proof, fanout/render/huge-doc benchmark | passed |
| Yjs/multi-root/layout remain production-grade | Plite strengths retained | Convergence/offline/provider/awareness/history/root/layout/browser | passed |
| Hard cut and public teaching are complete | Adoption inventory | Production/docs drift scan, compiler, docs routes, changesets, barrels | passed; final scan has zero public `.api.anchor` callers |

Conditional evidence:
- High-risk scenarios: transaction atomicity, identity transfer, anchor mapping,
  custom selection DOM projection, correction cycles/order, React invalidation,
  IME/input timing, Yjs lowering, multi-root commits, history retention, and
  long-document locality are mandatory slice proof.
- External research: N/A for execution; accepted architecture is grounded in
  local Wordgard and live Plite source. Use external research only if a specific
  algorithm law remains unresolved after local evidence.
- Issue/PR provenance: N/A; this is an accepted local architecture program, not
  a public issue/PR claim.
- Browser owner: `apps/plite` + `packages/browser`; benchmark owner:
  `benchmarks/**` + target registry; docs owner: latest-state Plite vision/
  architecture/API/example docs; release owner: package changesets relative to
  `main`; behavior owner: package tests and apps/plite browser corpus.

Findings:
- Slice 0 proved section algebra plus a persistent JSON tree index and rejected
  flat full-document materialization and non-serialized sidecars.
- The entire inherited current benchmark family, not only the five initially
  reported runners, referenced stale Slate-era imports or APIs. All 13 runners
  now execute against live Plite owners.
- The live target registry is `benchmarks/targets/slate-v2.json`; the accepted
  parent plan's `benchmarks/targets/plite.json` path is stale.
- Plite commits can be made canonical without a dual engine: operations mutate
  only a private draft, derived intents are replay-validated, and
  `DocumentChange` materializes the frozen committed document.
- Snapshot structural sharing is trustworthy only when runtime identity is
  transferred from the draft index to the canonical committed tree.
- The accepted parent plan is the decision authority; this file is its one-shot
  execution ledger and may repair stale source claims, not reopen settled taste.
- Anchor state must share one immutable document snapshot per editor. Reading a
  fresh cloned document per anchor made creation scale with anchor count times
  document size.
- `editor.anchor` is root editor-lifetime state. Nesting it under `editor.api`
  would misclassify a stateful identity/mapping primitive as a stateless API
  method and weaken the transaction ownership boundary.
- Replay-validated intents remain adapter metadata. A trial that reused them as
  a commit-time anchor shortcut broke richtext mark-selection semantics and was
  rejected.
- The collaboration benchmark mixed editor-wide string traversal into its
  anchor timer. Separate setup/create/rebase/resolve phases are required for a
  truthful locality claim.

Decisions and tradeoffs:
- Run every slice continuously; dependency gates decide sequencing, not pauses.
- Promote laws from the private prototype, not the test file wholesale.
- Delete replaced owners in the same program; no public or indefinite private
  compatibility layer.
- Keep Plite's proven input/IME/React/Yjs/layout behavior and package boundaries;
  rewrite their consumed substrate rather than transplant Wordgard host code.

Review fixes:
- Pre-closeout source review removed stale `tx.refs`, `PathRef`/`PointRef`/
  `RangeRef`, bookmark cleanup, and `tx.operations.replay` teaching from live
  API/docs/package README surfaces.
- Pre-closeout performance review split benchmark phases and removed
  full-document correctness traversal from the resolve timer. The attempted
  commit-batched anchor mapper was reverted after Chromium caught selection
  regressions.
- Final review's anchor-commit P1 was rejected against the live apply/direct-
  change notification owners and 30/30 focused transaction anchor tests; the
  caller now documents why the final document is not redundantly diffed once
  per active anchor.
- Final review correctly found shallow selection validation and stale custom
  selection fields in `replaceChildren`. Selection guards now validate `Point`
  endpoints, replacement mapping delegates the whole selection to its installed
  selection spec, and focused validation/custom/legacy replacement proof passes
  33/33.
- Final algebra review found a non-advancing overlapping-delete branch in
  `ChangeSet.transform`. The transform now consumes the shared deletion piece;
  an exhaustive 225-pair non-empty deletion-span matrix proves termination and
  convergence, and the Yjs suite remains green.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Baseline runners imported removed Slate namespaces and old update/history/clipboard APIs | 1 | Repair the whole runner family against source owners instead of patching the reported five | All 13 current runners green |
| Yjs benchmark resolved built declarations instead of source | 1 | Reuse one shared Plite source-alias setup and add the missing root Yjs test dependency | Runner green after install |
| Repo-wide operation caller search exceeded the useful output budget | 1 | Inventory file names by exact owner and migrate bounded consumer groups | Bounded owner inventory produced |
| Commit-batched anchor mapping passed focused contracts but broke toolbar mark selection | 1 | Restore proven per-operation anchor semantics and keep the benchmark phase split only | Deterministic richtext row passed after revert |
| Anchor benchmark reported 24-48 seconds as rebase/resolve | 1 | Split setup/create/rebase/resolve and move correctness traversal outside timers | Stress result now exposes create, rebase, and 0.08ms resolve independently |
| Reviewer inferred normal commits skipped anchor notifications | 1 | Trace the apply/direct-change owners and run exact insert/remove/move transaction contracts | Finding rejected; source calls `notifyAnchorChanges` and 30/30 tests pass |
| Identical concurrent deletes left both transform iterators stationary | 1 | Consume the minimum overlapping delete piece and exhaust every span pair | 225/225 delete pairs converge; Plite 70/70 and Yjs 226/226 pass |

Performance:
- Owner: `packages/plite/src/core/anchor-state.ts`,
  `packages/plite/src/core/anchor.ts`, and
  `benchmarks/slate-v2/donor/core/current/collab-readiness.mjs`.
- Law: anchors map through each canonical incremental change so transforms,
  mark splitting, affinity, deletion, and replacement semantics stay exact.
  Derived intents do not bypass that law.
- Shared per-editor anchor state avoids one document clone/diff per anchor.
  The rejected commit-batched experiment is recorded because focused contracts
  alone did not cover toolbar mark-selection behavior.
- The 10,000-block / 250-anchor / 250-intent post-revert stress medians are:
  setup 164.19ms, creation 612.31ms, rebase 19,997.52ms, and resolve 0.06ms.
  The expensive rebase is explicit calibration debt, not hidden behind the
  rejected 2.8-second shortcut.
  The earlier aggregate mixed full-document correctness traversal into the
  timer and reported 24-48 seconds; that number was not an anchor metric.
- The unrestricted three-sample artifact and target registry report are closure
  evidence; thresholds remain calibration-only and are not misrepresented as a
  release budget.

Verification evidence:
- Residual slice 0: all 13 `benchmarks/slate-v2/donor/core/current/*.mjs`
  runners green against live source owners.
- Slice 1 model: `packages/plite/test/accessor-transaction.test.ts` proves
  frozen committed reads, exact abort restoration, unchanged sibling identity,
  canonical replay, and atomic main/secondary-root commits.
- Slice 2 algebra: `packages/plite/test/document-change.test.ts` plus the
  focused accessor suite pass (27 tests); the broader public/import/algebra/
  accessor selection passed 43 tests before the latest commit integration.
- `pnpm turbo typecheck --filter=./packages/plite` passed after production
  `DocumentChange` promotion.
- Final `pnpm --filter @platejs/plite test` passed 70/70;
  `@platejs/plite-history`
  passed 18/18; focused anchor mapping contracts passed 31/31.
- Final `packages/plite/test/document-change.test.ts` passed 24/24, including
  identical, containing, partially overlapping, and disjoint concurrent delete
  pairs; final `@platejs/yjs` package proof passed 226/226.
- Final `pnpm check:plite` passed: package/type proof, 587 Chromium functional
  rows with 7 skips, then 3 mutation rows, 45 huge-document rows, and 46
  pagination rows with 1 skip. The full daily gate exited 0 after all 18
  package/build/typecheck owners and package/Yjs/layout tests passed.
- `pnpm check:plite:browser-matrix` exited 0 after the runner changed from one
  10-worker cross-browser launch storm to sequential projects with bounded
  per-engine workers. Chromium passed 586 functional rows with 7 skips,
  Firefox 528 with 63 skips, mobile 284 with 310 skips, and WebKit 546 with 48
  skips; mutation, huge-document, pagination, and synced tail rows had no final
  failures.
- In-app Browser proof passed a richtext append followed by undo; the marker was
  removed and the final warning/error log was empty.
- `pnpm --filter www build:source` passed after the final docs edits.
- `pnpm bench:targets:check`, `pnpm bench:targets:report`, and
  `pnpm bench:targets:report:check` passed for all 32 registered targets.
- `pnpm brl` passed 56 tasks; final `pnpm lint:fix` passed 4,815 files with no
  fixes required.
- Root `pnpm check` exited 0: lint completed with 19 warnings and no errors, 58
  builds and 58 source-first package typechecks passed, the fast suite passed
  3,188 tests, and the slow suite passed 1,306 with 55 skips.
- Final deletion audit found zero `.api.anchor` matches. Remaining
  `createAnchor` matches are the private Plite constructor and the unrelated
  hyperscript creator.
- Final local Codex autoreview reported no accepted/actionable findings and
  classified the patch as correct at 0.72 confidence.

Final handoff prepared:
- Ownership and target API/runtime: immutable JSON, canonical
  `DocumentChange`, anchors under `editor.anchor`, extensible selections,
  changed-range correction, inverse history, and existing DOM/React/Yjs/layout
  package boundaries.
- Public breaks and Plate/collaboration adoption: refs/bookmarks, public replay,
  old commit fields, state-patch history, and old normalizer paths are hard-cut;
  Plate/Yjs/apps compile against the final surface.
- Applicable browser/benchmark/docs/provenance decisions: Browser and benchmark
  evidence is recorded; public issue/PR provenance is N/A for this local rewrite.
- Proof and execution risks: the former all-project matrix caused a macOS
  browser-launch storm; sequential bounded project runs remove that false
  failure mode. A few retry-only coordinate/readiness flakes remain visible,
  with no final assertion failure. Calibration benchmarks have no invented
  release threshold.
- Execution order and user attention: no migration slice or implementation
  follow-up remains; final review/checker closeout is the only ledger action.

Timeline:
- 2026-07-17T10:02:42.407Z Plite Plan created.
- 2026-07-17 User authorized uninterrupted execution through every remaining
  slice; one-shot goal created and requirement/proof/deletion gates materialized.
- 2026-07-17 Residual slice 0 repaired across all 13 current runners; shared
  source-alias setup made Yjs proof truthful.
- 2026-07-17 Production snapshots became frozen and structurally shared;
  transaction abort restores exact root references without inverse replay.
- 2026-07-17 `DocumentChange`/`ChangeSet` moved from prototype ownership into
  Plite core and became the committed-document materialization path.
- 2026-07-17 Slices 3-10 hard-cut fields/effects, anchors/selections,
  corrections, history, DOM/React, Yjs/layout, Plate adopters, docs, exports,
  and changesets onto the final architecture.
- 2026-07-18 Package tests, `check:plite`, root `check`, the closure browser
  matrix, in-app Browser proof, docs checks, target registry, barrels, and lint
  passed.
- 2026-07-18 Anchor locality and benchmark phase attribution were repaired;
  focused contracts stayed green.
- 2026-07-18 Final review repairs closed selection validation, custom
  replacement mapping, and concurrent-delete transform progress; fresh daily
  Plite/root gates and autoreview passed.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Verified final handoff |
| Where am I going? | No remaining execution phase |
| What is the goal? | Make immutable JSON plus `DocumentChange` the sole Plite truth and hard-cut every old owner with full proof |
| What have I learned? | Canonical changes own truth; derived intents are useful only as replay-validated adapter/performance hints; benchmark phase attribution matters |
| What have I done? | Completed slices 0-10, migrated consumers/docs/exports, passed package/root/browser/benchmark/review/checker gates, repaired anchor locality, and proved root `editor.anchor` behavior |

Open risks:
- Retry-only coordinate-click and page-readiness flakes remain visible in the
  browser logs; bounded per-project execution completes every engine without a
  final failure.
- Collaboration thresholds remain calibration-only. The artifact proves
  correctness and phase cost, not an invented release SLO.
