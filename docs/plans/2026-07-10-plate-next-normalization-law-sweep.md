# Plate Next Normalization Law Sweep

Objective:
Repair Plate Next normalization law, remove unjustified feature-package
normalization calls, and prove every remaining editor normalization entrypoint
has a real owner and scoped invariant.

Goal plan:
docs/plans/2026-07-10-plate-next-normalization-law-sweep.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- plate-next skill repair
- autogoal lifecycle checkpoint
- cross-package same-class usage ledger

Plate Next source:
- prompt / link: user asked to repair `plate-next` and all normalize usages
  after questioning `tx.normalize()` in Date.
- mode: broad same-class normalization sweep across `packages/**`.
- target surface: Plate Next source/template/generated mirror, every explicit
  editor normalization entrypoint, and the smallest owner proof needed for
  each verdict.
- review target: explicit normalization is a semantic operation, not automatic
  punctuation after a transaction.
- broad Core sweep: no; Core is included only where the normalization class
  matches.
- correction-triggered related scoped sweep: 58 initial calls across all
  package source/tests, including legacy Plate and low-level Plite entrypoints.
- package review mode: no.
- package review target: N/A.
- package file checklist gate: N/A; the 55-call final usage ledger is the
  authoritative coverage gate.
- completion threshold summary: every call classified; feature-level full-root
  scans cut or narrowed; legacy normalization API calls cut; production owners
  green; source/generated skill mirror synced; no commit or push.

First checkpoint:
- Explicit target: repair the Plate Next source rule/template and all matching
  normalize usages, not only Date.
- Scope: inspect every production, test, lifecycle, and low-level Plite call;
  patch unjustified calls and preserve explicit normalizer tests.
- Non-goals: no unrelated package migration, public compatibility alias,
  broad Core drift sweep, docs/app/browser work, commit, or push.
- Stop condition: all calls have a verdict and evidence, focused production
  owner gates pass, generated mirror is current, and final source audits match
  the ledger.
- Final handoff: changed list, usage counts, kept/cut/narrowed verdicts,
  commands, workflow slowdown, remaining risk, and needs-attention rows.

Timed checkpoint:
- requested duration: none.
- semantics: finish the complete same-class sweep.
- initial confidence score: 72/100; Date was known wrong, Suggestion needed an
  owner experiment, and Plate Next had no explicit normalization law.
- improvement loop: inventory, classify, patch law, experiment, patch code,
  run owner proof, rerun inventory, review.
- final score / loop closure: 100/100 classification coverage; 55 final calls
  across 30 files match the ledger and no feature package retains an
  unexplained full-root scan.

Completion threshold:
- `.agents/rules/plate-next.mdc` defines explicit normalization semantics,
  valid verdicts, and the score cap for unexplained full-root calls.
- `docs/plans/templates/plate-next.md` requires the same audit.
- `.agents/skills/plate-next/SKILL.md` is regenerated from source.
- Every explicit normalize call is classified in the linked ledger.
- Date does not normalize solely to merge equivalent adjacent text leaves.
- Suggestion runs only the dirty-path passes proven necessary by behavior.
- Plite unwrap avoids a hidden full-root scan inside its loop.
- `editor.tf.normalize` and runtime-bridge normalize calls are zero.
- Date, Suggestion, and Plite unwrap owner proof is green.
- `check-complete.mjs` passes with fresh evidence.

Verification surface:
- focused tests / commands: Date and Suggestion full package tests; focused
  Plite unwrap fixtures.
- package proof: Date, Suggestion, and Plite source-first typecheck and lint.
- shared Core gate: N/A; retained Core call is the unchanged
  `shouldNormalizeEditor` lifecycle option.
- source audits: exact 55-call inventory, zero legacy entrypoint audit, and
  production `force: true` audit.
- related scoped sweep query / active scope / match count / patched count /
  deferred count: explicit normalization entrypoints across `packages/**`; 58
  initial calls; 26 call sites changed; 55 retained and classified; 0
  unclassified.
- package file manifest / row count / checked count / deferred count: N/A;
  same-class usage ledger replaces package review rows.
- Plite/Plate gap ledger: no remaining gap; `NodeApi.matches` repaired three
  Suggestion type regressions exposed by the proof gate.
- broad Core drift ledger gate: N/A.
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-10-plate-next-normalization-law-sweep.md`.

Constraints:
- Bare explicit normalize defaults to `force: true`; never hide that cost.
- Feature code needs a named semantic invariant before explicit normalization.
- Prefer normal transaction dirty paths; use `force: false` only when focused
  proof shows immediate local canonicalization is required.
- A physical adjacent-leaf shape is not by itself a feature invariant.
- Explicit invalid-fixture normalizer tests remain valid.
- Fix universal invariants in Plite, not package-local wrappers.
- No public compatibility aliases or new helper wrappers.
- No browser proof because no UI surface changed.

Boundaries:
- allowed edit scope: Plate Next source/template/mirror, normalization call
  sites, Date/Suggestion behavior tests, the Plite unwrap owner, and the three
  Suggestion matcher type errors that blocked proof.
- package/API surfaces: Plite normalization lifecycle and Plate feature calls.
- docs/browser surfaces: no public docs or browser routes.
- non-goals: no migration of the six older packages whose suites already fail
  on removed Plate APIs.
- out-of-scope package errors: Layout, Tag, Link, List Classic, List, and Table
  fail before their changed normalizer tests execute because their package
  migrations still reference removed `createSlate*`, bridge, or old Plate APIs.

Output budget strategy:
- Keep one grouped ledger row per file with exact call counts.
- Summarize package blockers; do not paste hundreds of unrelated migration
  diagnostics into the handoff.

Blocked condition:
- Blocked only if a retained call has no inspectable owner or focused proof
  cannot distinguish feature semantics from physical tree shape. No current
  blocker remains.

Current verdict:
- verdict: main-parity-cleanup plus move-to-plite internal optimization.
- confidence: 100/100 on classification; 96/100 on the broad dirty tree because
  six unreviewed package suites have independent migration failures.
- next owner: plate-next package-by-package migration.
- keep / revert / quarantine call: keep.
- reason: the packet removes unjustified root scans, retains proven local
  invariants, and makes recurrence mechanically reviewable.

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured before work | yes | First checkpoint records target, scope, non-goals, stop condition, and handoff. |
| `plate-next` skill/rule read | yes | Source rule read before patching; generated mirror audited after install. |
| Active goal checked or created | yes | Goal created for normalization-law repair and complete usage proof. |
| Mode classified as named packet vs broad Core sweep | yes | Cross-package same-class sweep, not full Core manifest mode. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Semantic normalization law and zero `editor.tf.normalize`. |
| Broad Core drift ledger initialized when in scope | N/A | Not a broad Core sweep. |
| Source of truth and allowed workspace recorded | yes | Source rule/template own doctrine; generated skill comes from Skiller. |
| Output budget strategy recorded | yes | Grouped file ledger and concise blocker summary. |
| Public API fork routing checked | yes | No public fork; existing normalize options are sufficient. |
| Gap policy checked | yes | Universal invariant would route to Plite; no unresolved gap remains. |
| Related scoped sweep policy checked | yes | Every explicit normalization entrypoint under `packages/**` audited. |
| Review-mode rename freeze checked | yes | No files or public symbols renamed. |
| Package review checklist initialized when in scope | N/A | Same-class sweep, not package review mode. |

Work Checklist:
- [x] First checkpoint copied every explicit requirement before implementation.
- [x] Complete normalization entrypoint query defined.
- [x] Initial 58 calls inventoried and classified.
- [x] Plate Next source rule repaired.
- [x] Plate Next autogoal template repaired.
- [x] Generated skill mirror regenerated and audited.
- [x] Date full-root normalize cut and semantic expectation repaired.
- [x] Suggestion all-remove experiment run and failures understood.
- [x] Suggestion dirty-path experiment run and 101/101 proof recorded.
- [x] Redundant Suggestion fragment and middleware calls cut individually.
- [x] Plite unwrap hidden full-root pass narrowed to dirty paths.
- [x] Eight one-operation normalize callbacks replaced with one-shot calls.
- [x] Ten legacy normalize entrypoints moved off `editor.tf`/runtime bridge.
- [x] Three Suggestion `NodeMatch` type regressions repaired with
      `NodeApi.matches` rather than casts.
- [x] Final 55-call ledger written with zero unclassified rows.
- [x] Date, Suggestion, and Plite owner tests pass.
- [x] Date, Suggestion, and Plite typecheck/lint pass.
- [x] Legacy package suite failures classified as independent migration debt.
- [x] Zero legacy normalization entrypoint audit passes.
- [x] Production full-root audit leaves only Core's explicit initialization
      option.
- [x] Scoped diff check passes.
- [x] Changed list, risks, needs-attention, and next owner recorded.

Phase / pass table:
| Phase | Status | Evidence |
|---|---|---|
| Capture requirements | done | First checkpoint filled before runtime edits. |
| Inventory | done | 58 initial calls; complete query includes public, legacy, and Plite internal entrypoints. |
| Skill repair | done | Source/template patched; generated mirror synced. |
| Runtime repair | done | 3 calls cut, 5 narrowed to dirty paths, zero feature full-root scans. |
| API-shape cleanup | done | 8 callback wrappers and 10 legacy normalize calls repaired. |
| Owner proof | done | Date 24/24, Suggestion 101/101, Plite unwrap 29/29; all three typecheck/lint green. |
| Final audit | done | 55 calls across 30 files, all ledgered; zero legacy normalize entrypoints. |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Named verification threshold | yes | Prove every normalization call has an owner/verdict | 55/55 calls classified in the artifact ledger. |
| Broad Core drift ledger coverage | N/A | Full Core manifest only | This is a same-class sweep. |
| Score gate | yes | No unexplained feature full-root call | Production audit leaves only the Core initialization option. |
| Best Plate v2 recommendation | yes | Record semantic normalization law | Rule and template patched. |
| Plite/Plate gap ledger | yes | Name or close gaps | No normalize gap; matcher proof blocker repaired via `NodeApi.matches`. |
| Related scoped sweep after correction | yes | Audit all matching entrypoints | 58 initial, 55 final, 0 unclassified. |
| Package file checklist | N/A | Package-review-only gate | Same-class ledger used. |
| Package/API proof | yes | Run owner tests/typecheck/lint | Date, Suggestion, and Plite green. |
| Shared Core gate coverage | N/A | Needed only for changed Core behavior | Core lifecycle option unchanged. |
| Non-Core package error triage | yes | Classify failed package suites | Six older packages fail on independent unfinished migration APIs. |
| Source audit | yes | Zero legacy calls and exact final count | Zero `editor.tf.normalize`/bridge calls; final count 55. |
| Rename ledger | N/A | Required only for renames | No renames. |
| Extracted-file inventory | N/A | Required only for extracted files | No source file extraction. |
| Autoreview / review | yes | Review focused diff and proof | Scoped diff reviewed; no normalization finding remains. |
| Final lint/check | yes | Run scoped lint and diff check | Production owners lint green; scoped `git diff --check` green. |
| Changed list / top drift / needs attention | yes | Record handoff | Sections below are complete. |
| Goal plan complete | yes | Run plan verifier | Fresh final verifier is the last gate. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|---|---:|---|---|---|---|
| Date `tx.normalize()` | 4 | hard-cut | `@platejs/date` | Only old adjacent-leaf shape changed. | Keep cut. |
| Suggestion full-root passes | 4 | main-parity-cleanup | `@platejs/suggestion` | Dirty-path passes restore all 101 tests. | Keep `force: false` only where proven. |
| Suggestion fragment/middleware calls | 3 | hard-cut | `@platejs/suggestion` | 101 tests pass without them. | Keep cut. |
| Plite unwrap loop normalize | 4 | move-to-plite | `@platejs/plite` | 29 fixtures pass with dirty-path pass. | Keep narrowed. |
| Explicit invalid-fixture tests | 0 | keep-in-owner | package specs | Each intentionally triggers an installed normalizer. | Keep explicit. |
| Core `shouldNormalizeEditor` | 0 | lifecycle-option | `packages/core` | Option explicitly promises initial full normalization. | Keep. |
| Legacy normalize entrypoints | 3 | hard-cut | package tests | Zero final `editor.tf.normalize`/bridge normalize calls. | Keep cut. |

Best Plate v2 recommendation:
- Normalize implicitly at transaction closeout for ordinary edits.
- Request `force: false` only for a proven immediate touched-path invariant.
- Reserve `force: true` for explicit whole-root lifecycle/repair work and
  invalid-fixture tests.
- Never normalize merely to preserve an old physical leaf arrangement.

Plite / Plate gap ledger:
| Gap | Verdict | Evidence | Owner / next |
|---|---|---|---|
| Property matcher composition in Suggestion | closed | `NodeApi.matches` supports predicates and property objects; Suggestion typecheck green. | No next action. |
| Normalization ownership | closed | Existing lifecycle options represent full-root and dirty-path needs without a new API. | No next action. |

Related scoped sweep:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|---|---|---|---:|---:|---:|---|
| Date bare normalize | `packages/**` | Complete explicit entrypoint regex in artifact | 58 initial | 26 call sites | 0 unclassified | Six old package suites cannot execute until their package migrations land. |

Normalization ledger:
- [normalization-usage-ledger.md](artifacts/2026-07-10-plate-next-normalization-law-sweep/normalization-usage-ledger.md)

Verification evidence:
- `CI=1 pnpm install --no-frozen-lockfile`: passed; prepare regenerated skills.
- Source/generated audit found `semantic-dirty-path` and normalization law in
  both `.agents/rules/plate-next.mdc` and generated `SKILL.md`.
- `pnpm -r --filter @platejs/date --filter @platejs/suggestion test`: Date
  24/24 and Suggestion 101/101 passed after final install.
- `PLITE_FIXTURE_FILTER=transforms/unwrapNodes pnpm --filter @platejs/plite exec bun test --preload ../../config/plite-source-test-setup.ts ./test/index.spec.ts`:
  29/29 passed.
- `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/date --filter=./packages/suggestion`:
  16/16 tasks passed.
- `pnpm -r --filter @platejs/plite --filter @platejs/date --filter @platejs/suggestion lint`:
  all three passed.
- Complete normalization entrypoint audit: 55 calls across 30 files.
- Legacy audit: zero `editor.tf.normalize(...)` and zero runtime-bridge
  normalize calls.
- Production full-root audit: only
  `packages/core/src/lib/editor/withPlite.ts` under the explicit
  `shouldNormalizeEditor` option.
- Scoped `git diff --check`: passed. Whole-tree diff check reports three
  unrelated pre-existing docs whitespace lines.

Changed list:
- `.agents/rules/plate-next.mdc`: explicit normalization law and score cap.
- `.agents/skills/plate-next/SKILL.md`: regenerated source mirror.
- `docs/plans/templates/plate-next.md`: normalization audit gate.
- this plan and its normalization usage ledger.
- `packages/date/src/lib/transforms/insertDate.ts` and spec: removed shape-only
  normalization and asserted the actual spacer structure.
- `packages/suggestion/src/lib/transforms/{acceptSuggestion,deleteSuggestion,insertTextSuggestion,rejectSuggestion}.ts`:
  full-root passes narrowed to dirty paths.
- `packages/suggestion/src/lib/transforms/insertFragmentSuggestion.ts` and
  `packages/suggestion/src/lib/withSuggestion.ts`: redundant passes cut.
- Suggestion matcher helpers: property/predicate matches routed through
  `NodeApi.matches` so package typecheck is green.
- `packages/plite/src/transforms-node/unwrap-nodes.ts`: loop-local dirty-path
  normalization.
- Layout, Tag, Link, List, List Classic, and Table normalizer tests: direct
  `editor.update.normalize` entrypoint; no legacy normalize call remains.
- `pnpm-lock.yaml`: refreshed by the required install to match committed
  `auto-install-peers=false` configuration.

Needs attention:
- Layout, Tag, Link, List Classic, List, and Table remain next package-migration
  work. Their full suites fail on old removed Plate APIs before normalizer tests
  execute; this packet does not claim those packages are green.
- `pnpm-lock.yaml` changed substantially because its committed setting said
  `autoInstallPeers: true` while committed `.npmrc` says false. The required
  reinstall reconciled that mismatch.

Open risks:
- No known normalization regression in the three production owners changed.
- The six older package test rewrites have source-equivalent semantics but
  cannot receive runtime proof until those package migrations compile.

Final handoff contract:
- target surface and mode: complete cross-package normalization-class sweep.
- files/APIs reviewed: 55 final calls across 30 files, plus 3 removed calls.
- broad Core drift score coverage: N/A.
- package file checklist coverage: N/A.
- best Plate v2 recommendation: semantic normalization law above.
- verdict matrix summary: 46 explicit tests, 4 lifecycle calls, 5 dirty-path
  calls; zero unexplained feature full-root calls.
- Plite/Plate gaps or blockers: no normalization API gap; six independent
  package migration blockers recorded.
- related scoped sweep result: complete, 0 unclassified.
- changed files: listed above.
- proof commands: listed above.
- needs attention: package migration and lockfile reconciliation noted.
- next owner: `plate-next` package-by-package migration.

Reboot status:
- Current state: implementation and verification complete; final plan verifier
  remains.
- Goal: close normalization-law repair with exact usage coverage.
- Learned: Date needed no normalize; Suggestion and Plite unwrap need local,
  not root-wide, canonicalization.
- Done: skill/template/runtime/tests/ledger/proof complete.
- Next: run final verifier and mark goal complete if it passes.
