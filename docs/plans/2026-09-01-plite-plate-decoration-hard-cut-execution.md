# Plite and Plate Decoration hard cut execution

Objective:
Land one production Decoration path across Plite and Plate before Comments.
Delete every competing public path, migrate every live consumer, prove scale and
native behavior, and leave Comments unimplemented.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-09-01-plite-plate-decoration-hard-cut-execution.md

Major source:
- Accepted Plite, Plate, and 17-reference editor-audit decisions plus the
  explicit user instruction to execute the full cut before Comments.
- The implementation target was fixed before source work: Plite owns one
  Decoration manager and Plate plugins own one `decorate` descriptor.

Completion threshold:
- Plite exposes only `<Plite decorations={[...]}>` with
  `PliteDecorationSource { id, read, observe? }`.
- A source returns `{ key, range, attributes }`; attributes allow only class,
  style, ARIA, and data values.
- The provider observes each source once, compiles input-node-key buckets,
  merges ordered output-node-key buckets, and publishes node-key subscriptions
  to every mounted Editable.
- Public generic Projection, `Editable.decorate`, scope and dirtiness knobs,
  `renderSegment`, arbitrary Decoration data, store-family provider props,
  public source hooks, and imperative refresh handles do not exist.
- Plate plugins expose only `decorate: { read, observe? }`. Raw Plate,
  PlateContent, PlateStatic, transient leaf data, and hidden-source bypasses do
  not exist.
- Find, Markdown preview, code highlighting, Yjs, pagination, and live Plite
  examples use the sole path. Yjs caret geometry remains a Widget.
- The frozen production benchmark passes normal, large, stress, and
  pathological cohorts with exact deterministic counters.
- Package, browser, docs, doctrine, release, registry, barrel, benchmark-target,
  and stale-path gates pass.
- No Comments production package, schema, migration, channel, UI, public docs,
  or tests are added. The existing ownership plan remains planning-only.

Verification surface:
- Production manager benchmark:
  `docs/plans/artifacts/rendering-api-editor-audit/benchmark-decoration-manager.mjs`.
- Active locality benchmarks: `react-rerender-breadth`,
  `react-huge-document-overlays`, `react-stable-id-overlay-source`, and
  `decoration-manager-scalability`.
- Plite package tests, public type probes, strict Chromium proof, and
  `pnpm check:plite`.
- Plate compiler/static/Yjs/plugin tests, public package smoke, registry builds,
  Browser routes, and `pnpm check`.
- Bounded stale-symbol searches across production, tests, examples, public
  docs, current internal guidance, benchmark programs, and agent rules.

Constraints:
- Do not begin Comments implementation.
- Use no aliases, shims, overloads, fallbacks, deprecated exports, or dual paths.
- Preserve document data, native selection/input/IME/clipboard, history,
  static/live output, collaboration, multiple Editables, and callback inference.
- Keep private runtime machinery private; Plate plugin authoring compiles into
  the raw Plite contract.
- Do not commit, push, create a PR, or mutate a tracker without a separate
  request.

Boundaries:
- Source of truth is the current checkout plus the accepted Plite, Plate, and
  editor-audit artifacts.
- Allowed edits cover Plite/Plate rendering owners, named consumers, active
  benchmarks, tests/examples/docs/exports, release artifacts, registry output,
  Vision, and affected agent doctrine.
- Historical plans, archived drafts, research dossiers, transplant ledgers,
  and old solution write-ups remain historical evidence and are excluded from
  the live-API stale scan.
- The pre-existing Plite `comment-mode` example may migrate to the new API; no
  Comments feature owner may be created or changed.

Blocked condition:
Stop only after three materially different safe attempts leave the same native
correctness, production-scale, type-system, or browser blocker without a
narrower proof path. No such blocker remains.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: Comments only after explicit authorization
- goal_status: complete candidate

Current verdict:
- verdict: the full Decoration hard cut is implemented; Comments implementation
  is untouched
- confidence: high, backed by production scale, strict package, full repo, and
  Browser proof
- next owner: Comments design and delivery, only after user authorization

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Scope, no-Comments boundary, target API, migrations, scale, proof, release, and handoff are explicit above. |
| Accepted architecture read | yes | Plite, Plate, Comments-boundary, API scorecard, 17-reference audit, inference receipt, and frozen benchmark were read first. |
| Skills loaded | yes | `autogoal`, `major-task`, `hard-cut`, `best-api`, `benchmark`, `plite-plan`, `plate-plan`, `plate-plugin-creator`, `plate-ui`, `changeset`, `docs-creator`, `agent-native-reviewer`, `tdd`, and Browser were loaded. |
| Current owners refreshed | yes | Plite provider/rendering, Plate compiler/static/raw props, all named consumers, exports, tests, docs, and benchmark targets were mapped before edits. |
| Performance budget frozen | yes | Four cohorts, matched baseline/production paths, deterministic counters, timing budgets, samples, warmups, noise, and source hashes were fixed before production measurement. |
| Browser routes resolved | yes | Standalone Plite examples and Plate Find, Markdown preview, and collaboration demos were resolved from current source. |
| Docs source and style read | yes | Public Plite docs, nearest sibling pages, current internal ledgers, source owners, and docs style rules were read before repair. |
| Release paths selected | yes | Major changesets for `plitejs` and `platejs`, plus one registry changelog and generated registry output. |
| Branch or PR work requested | no | No branch change, commit, push, or PR was authorized. |
| External research needed | no | The pinned local 17-reference audit already supplied the accepted external comparison. |

Work Checklist:
- [x] Captured every explicit requirement and the no-Comments boundary before implementation.
- [x] Revalidated the accepted target against live Plite, Plate, consumer, docs, and benchmark owners.
- [x] Added the attribute-only Plite Decoration contract with inferred callback types.
- [x] Implemented one provider manager with ordered sources, one observation per source, compiled buckets, exact key refresh, and node subscriptions.
- [x] Proved source replacement, Strict Mode lifetime, multiple Editables, fault isolation, invalid-range handling, cleanup, and stable untouched-bucket identity.
- [x] Deleted public generic Projection, raw decorate/render bypasses, strategy knobs, source hooks, imperative refresh, arbitrary data, and provider store-family props.
- [x] Added the sole Plate plugin compiler path `decorate: { read, observe? }` and cut raw Plate/PlateContent/PlateStatic alternatives.
- [x] Migrated Find, Markdown preview, code highlighting, Yjs, pagination, Plite examples, and the pre-existing comment-mode example.
- [x] Kept Yjs carets and labels on Widget while moving remote text paint to Decoration attributes.
- [x] Preserved native undecorated DOM synchronization and cut the unsound decorated imperative text-sync path.
- [x] Passed strict callback inference and public package import/type proof.
- [x] Passed the frozen production benchmark in all four cohorts and registered it as the active benchmark target.
- [x] Migrated active React and mapped-view benchmarks away from deleted APIs; removed the rejected source-dirtiness benchmark lane.
- [x] Updated current public docs, current internal guidance, Vision, worker rules, release artifacts, barrels, API reference, benchmark reports, and registry output.
- [x] Regenerated skill mirrors with `pnpm install` and verified current rule discoverability.
- [x] Ran bounded live-surface stale-path scans with zero matches.
- [x] Proved Find, Markdown/code, Yjs/collaboration, pagination, synced blocks, lint, async Decorations, and existing comment-mode behavior in fresh Browser sessions.
- [x] Verified the only comment-named changed runtime consumer is the
  pre-existing Plite `comment-mode` example; the existing Comments ownership
  plan remains planning-only and no Comments feature owner changed.
- [x] Recorded the unrelated global changeset-status blocker without deleting or rewriting its owner.
- [x] Left the checkout uncommitted and unpushed as required.

Execution Checklist:
- [x] Plite public API is only `<Plite decorations>` plus the data-only Decoration types.
- [x] Plate public authoring is only plugin `decorate: { read, observe? }`.
- [x] Decoration output is keyed, non-empty, ordered, and attribute-only.
- [x] Observation, compilation, merging, subscription, and cleanup have one runtime owner.
- [x] Static and live Plate paths compile through the same descriptor contract.
- [x] Every named runtime consumer and active benchmark uses the canonical path.
- [x] Every rejected live symbol and call shape has zero matches in the bounded scan.
- [x] Package changesets, registry changelog, barrels, generated registry, API reference, and benchmark reports are current.
- [x] Plite strict checks, full repo checks, production benchmark, and Browser proof are recorded.
- [x] Comments remains the next unstarted phase.

Completion Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Current-state source audit | yes | Exact Plite/Plate owners, consumers, benchmark targets, docs, exports, and generated owners were inspected. |
| Public API hard cut | yes | Sole raw `decorations` input and sole Plate plugin `decorate` descriptor; rejected live-path scan is empty. |
| Production runtime | yes | Provider manager owns observation, compilation, ordered merge, key subscriptions, replacement, and cleanup. |
| Pre-acceptance scale proof | yes | Disposable matched benchmark passed four frozen cohorts before implementation. |
| Production scale rerun | yes | Production manager benchmark reports `production-scales` with zero hard-guard failures across all cohorts. |
| Pathological subscription bound | yes | 10k nodes by 32 sources retains 10,032 production subscriptions versus 320,000 baseline subscriptions. |
| Pathological read bound | yes | Read p95 is 2.752083 ms production versus 12.781917 ms baseline, with 10k bucket reads and zero source reads during render. |
| Pathological update bound | yes | Update p95 is 0.67075 ms with exactly 128 source reads and 128 node wakes. |
| Pathological mount bound | yes | Mount p95 is 62.370583 ms production versus 56.242209 ms baseline, within frozen absolute and relative budgets. |
| Cleanup and renderer guard | yes | Zero observers/subscriptions remain after destroy and production invokes zero transient render callbacks. |
| Active benchmark programs | yes | Full default runs pass for rerender breadth, huge-document overlays, and stable-id mapped source; target registry and generated reports pass. |
| Native behavior | yes | Strict Chromium suite passed 710 rows with 8 expected skips; focused async IME, image navigation, lint, and delayed-source rows passed repeated warm runs. |
| Plate behavior | yes | Find, Markdown preview, code highlighting, Yjs, static compiler, and public package tests pass. |
| Browser interaction | yes | Fresh Plite static and Plate demo routes show the expected Decorations and collaboration state. |
| Browser console and network | yes | Final Plite and Plate sessions recorded zero relevant console errors, network failures, or HTTP failures. |
| Pixel proof | no | No pixel-perfect paint regression was claimed; DOM attributes, visible counts, interactions, and error state are the applicable proof. |
| Exact report replay | no | This is an architecture migration, not a report-backed issue. |
| Immutable pushed ref | no | The result is a local uncommitted candidate because commit and push were not requested. |
| Public type inference | yes | Strict inference probe and package public-type smoke pass without callback annotations or casts. |
| Package proof | yes | `pnpm check:plite`, Plate package tests/typecheck, www typecheck, and `pnpm check` pass. |
| Barrels and generated owners | yes | `pnpm brl`, API reference generation, registry source/build, changelog generation, and benchmark report generation pass. |
| Docs source audit | yes | Public docs and current internal guidance name only the sole path; links/routes are source-backed. |
| Docs prose pass | yes | Edited docs received the required source-backed and prose cleanup pass with API literals preserved. |
| Agent doctrine sync | yes | Source rules changed, `pnpm install` regenerated mirrors, and live-rule stale scan is empty. |
| Release artifacts | yes | Major `plitejs` and `platejs` changesets plus registry changelog `2026-09-01-plugin-decoration-highlights` exist. |
| Global changeset status | no | The command is blocked only by unrelated `.changeset/core-navigation-flash-scroll.md` naming removed package `@platejs/core`; this task does not own that file. |
| Final review | yes | Accepted `best-api`, Plite, Plate, editor-audit, performance, and implementation pressure passes are closed; `autoreview` is forbidden on `next`. |
| Comments boundary | yes | Changed-path audit finds the migrated pre-existing Plite `comment-mode` runtime example plus the planning-only ownership document; no Comments feature implementation changed. |
| Commit, push, or PR | no | No delivery mutation was requested or performed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Intake and accepted decision | complete | Full target and no-Comments boundary captured | source implementation |
| Plite manager and renderer | complete | Unit, rendering, native, type, and scale proof | Plate compiler |
| Plate compiler and consumers | complete | Find, Markdown, code, Yjs, static, and raw-prop cut | active benchmarks |
| Active benchmark cut | complete | Four current benchmark owners run without deleted APIs | docs and release |
| Docs, doctrine, and generated output | complete | Source, mirrors, registry, API reference, barrels, and reports aligned | final proof |
| Verification | complete | Strict Plite, full repo, production benchmark, and Browser gates green | closeout |
| Closeout | complete | Stale scan empty, Comments untouched, local candidate recorded | user handoff |

Findings:
- The old render-time path multiplied subscriptions by nodes times sources and
  could invoke transient callbacks while rendering every node.
- The production manager makes retained work additive: mounted nodes plus
  sources. Exact source refresh reads and wakes only affected keys.
- The first closeout scan found active benchmark programs and current internal
  guidance that still taught deleted APIs. They were part of the real blast
  radius and were migrated or cut before closure.
- Decorated text cannot safely use the imperative DOM text-sync shortcut; React
  must render decorated text from the committed model while undecorated text
  keeps the native fast path.

Decisions and tradeoffs:
- Keep `decorate` only as Plate plugin authoring because it is the stable plugin
  contribution noun; compile it into Plite Decoration sources.
- Keep Plite Decoration sources because external stores need one observation
  lifetime and exact invalidation. Do not expose the manager, buckets, or
  provider registry.
- Cut the old active source-dirtiness benchmark lane because dirtiness classes
  were deleted public machinery. Exact node-key work is proved by the manager
  benchmark instead.
- Accept a small pathological mount overhead to remove 309,968 retained
  subscriptions and render-time source fan-out.

Implementation notes:
- Plite data types live in `packages/plitejs/src/interfaces/decoration.ts`.
- Runtime management lives in
  `packages/plitejs/src/react/decoration-source.ts` and
  `packages/plitejs/src/react/decoration-context.tsx`.
- Plate compiles plugin descriptors in
  `packages/platejs/src/internal/plugin/getPlateDecorationSources.ts`.
- Static Plate uses a private adapter; it does not reopen a public bypass.
- `PliteAnnotationProvider` remains a sibling context for annotation readers;
  annotation stores feed Decoration through ordinary source descriptors.

Review fixes:
- Attached observed sources before their first mounted read, avoiding the
  rejected 160.589 ms pathological reread shape.
- Moved innermost single-attribute output onto the string host after pagination
  exceeded its DOM-node budget.
- Fixed synced-root owner resolution and cross-root beforeinput selection
  authority.
- Moved the data-only public contract into Plite core interfaces and re-exported
  it through Plate, removing a raw cross-package React import.
- Cut decorated imperative DOM mutation after async IME and image-caret proof
  showed model/DOM authority conflicts.
- Repaired active benchmark targets, programs, generated reports, and current
  internal guidance found by the final stale-path audit.

Error attempts:
| Error or rejected attempt | Resolution |
| --- | --- |
| Observed sources reread before observer attachment | Attach once, then compile from the observer-owned state. |
| Pagination created 1,661 DOM nodes against a 1,600 budget | Put single innermost attributes on the existing string host. |
| Synced-root decorations resolved against the wrong owner | Carry the exact root owner through source compilation. |
| Cross-root beforeinput reused host selection authority | Resolve the committed view selection before native input repair. |
| Decorated imperative DOM sync broke image caret and async IME cases | Remove that path; render decorated text from committed model state. |
| Plate compiler imported raw Plite React internals | Move the public type to Plite interfaces and consume it through the Plate facade. |
| Active benchmark programs imported deleted stores/hooks | Migrate their visible Decoration lanes and delete the rejected dirtiness lane. |
| Generated benchmark Markdown failed formatting | Make the report generator emit formatter-stable Markdown. |
| `127.0.0.1` caused Next chunk 403 responses during manual proof | Use the canonical `localhost` origin for the final Plate Browser session. |
| Global changeset status names removed `@platejs/core` | Record the unrelated blocker; do not mutate another task's changeset. |

Verification evidence:
- Production benchmark: `production-scales`; four of four cohorts pass every
  deterministic and timing guard. Environment: Bun 1.3.12, Node 24.3.0,
  Darwin arm64, Apple M5 Max. Clock p95 packet noise is 0.003708 ms.
- Final source hashes include Decoration manager
  `191977ae2b080e5589d7826d02f029d3eb8328bbfb656c57d7b6138947d8e5d4`,
  Plite provider
  `60566a73d478b2d090d614da5521671f0852d05cd5ca00db76e10fa9d569b72a`,
  renderer `470322dc2ab7ab92a32ab949b8c8b8f4bf09b95a37825ee28f88fc05ca7ccfca`,
  and benchmark `64203a2da589003ab3494f5c4cd0b7a288f2e9a166078fd4e3c62e08aff9882f`.
- Full default active benchmark runs pass: rerender breadth, huge-document
  overlays, stable-id mapped source, and Decoration manager.
- `pnpm check:plite` passes 86 typechecks, 134 package tasks, 232 Node
  contracts, 25 benchmark contracts, 46 benchmark targets, public package
  types/build, and Chromium with 710 passed plus 8 expected skips.
- `pnpm check` passes lint/format, 89 typecheck tasks, 679 fast tests, and 222
  slow tests.
- Final Plite Browser proof: search 1 highlight; Markdown 4 tokens; code 154
  tokens; Yjs 4 editors and 100 peer attributes; pagination 156 line
  attributes; synced blocks 3 attributes; lint 2; async 2; existing
  comment-mode 2; zero relevant console/network errors.
- Final Plate Browser proof: Find opens by shortcut and reports one active match;
  Markdown preview has 11 decorated tokens; collaboration has 2 synced editors
  and 2 peers; zero relevant console/network errors.
- `pnpm brl`, registry changelog generation/check, `www build:source`,
  `www build:registry`, API-reference generation, `www typecheck`, strict
  inference, matrix validation, benchmark target/report checks, `pnpm install`,
  and `git diff --check` pass.
- Live stale-path scan returns zero rejected symbols. Changed comment-named
  paths are the pre-existing Plite `comment-mode` example and the planning-only
  Comments ownership document; no Comments feature implementation changed.

Final handoff contract:
- Recommendation: keep this as the only Plite/Plate transient paint model.
- Confidence: high.
- Evidence: production scale, package/type, full repo, active benchmark, and
  Browser proof are green.
- Delivery state: local uncommitted candidate; no commit, push, or PR.
- Caveat: unrelated global changeset status remains blocked by
  `.changeset/core-navigation-flash-scroll.md`.
- Next owner: Comments, only after explicit authorization.

Timeline:
- 2026-09-01: accepted API, architecture, and performance target carried into
  execution.
- 2026-09-01: Plite manager, Plate compiler, migrations, docs/doctrine, release,
  active benchmarks, strict proof, Browser proof, and closeout completed.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Closeout is complete for the Decoration hard cut. |
| Where am I going? | Handoff only; Comments stays unstarted. |
| What is the goal? | One scalable Plite/Plate Decoration path and zero alternatives. |
| What was proved? | Additive subscriptions, exact key work, package/browser correctness, and zero live stale APIs. |
| What remains? | User authorization for the separate Comments phase. |

Open risks:
- The checkout is intentionally uncommitted and unpushed, so no immutable-ref
  release claim is made.
- Global changeset status remains blocked by an unrelated stale package name.
- Historical plans, archives, research, transplant ledgers, and old solution
  notes still describe their period accurately; they are not live API guidance.
