# native inactive selection focus marker

Objective:
Make inactive canonical-selection paint native to each Plite `Editable`, driven
by an explicit focus-target marker, and delete the Plate selection-retention
plugin without replacing it with another public state API.

Goal plan:
docs/plans/2026-08-31-native-inactive-selection-focus-marker.md

Template:
docs/plans/templates/plate-feature.md

Primary template:
docs/plans/templates/plate-feature.md

Applied packs:

- package-api
- docs
- browser
- registry-changelog
- performance-observability
- agent-native

Flow mode:

- existing package plus React/registry

Completion threshold:

- Every applicable Feature Manifest row is complete with evidence.
- Every excluded row has an explicit N/A reason.
- Selected packs, the explicit Plate Next and `next`-branch review waivers,
  feature checker, and goal checker are closed.
- The exact marked-target focus transition renders one inactive selection per
  originating `Editable`; focus return or an unmarked target renders none.
- Expanded selections, collapsed carets, multi-editor ownership, native-paint
  deduplication, and 5/5 retry-free warm browser runs pass.
- `SelectionRetentionPlugin`, `SelectionRetentionKit`, the copied
  `selection-retention` item, and the superseded boolean-prop proposal have zero
  live runtime or doctrine owners.

Verification surface:

- Focused Plite React tests and source-first `plitejs` typecheck.
- Plate registry tests, registry generation/checks, and the standalone
  `/blocks/selection-retention-demo` browser route before that registry item is
  removed or renamed to its final native-behavior demo owner.
- Package changeset, registry changelog source/generated output, Vision/rule
  source checks, generated skill mirror parity, Plate Next validation, feature
  checker, and goal checker.

Constraints:

- Use one Feature Manifest through every phase.
- Load worker skills only when their phase is active.
- Do not add package-generation tooling.
- Do not copy worker doctrine into this plan.

Boundaries:

- Source of truth: `packages/plitejs/src/react/**` owns the built-in focus and
  paint behavior; root/Plite/Plate Vision and `.agents/rules/**` own the public
  law; `apps/www/src/registry/**` owns product styling and adoption.
- Allowed edit scope: the owning Plite React implementation/tests; Plate facade
  proof if required; selection-retention registry consumers, metadata, demo,
  tests, changelog, and generated registry output; one package changeset; the
  smallest stale Vision/rule/plan sources plus regenerated skill mirrors and
  Plate Next evidence.
- Browser surface: the standalone selection-retention block demo, evolved to
  prove native marker behavior without installing a plugin.
- Release surface: both a patch changeset for `plitejs` and a registry
  changelog update.
- Non-goals: Find, remote cursors, collaboration/Yjs, Floating UI placement,
  custom public renderers, editor-global retention state, copied `Range` state,
  compatibility aliases, and unrelated registry/editor cleanup.

Output budget strategy:

- Use exact `rg` inventories, scoped diffs, a focused package fingerprint,
  deterministic scale counters, focused tests/typechecks, generator summaries,
  and named browser observations. Avoid broad build logs and unrelated
  generated/template scans.

Blocked condition:

- Block only if the normal Browser path cannot run after safe server/tool
  retries, or if a proven native DOM selection law makes the accepted marker
  contract impossible without a materially different public API.

Feature Manifest:
| Surface | Applies | Owner | Artifacts | Consumer | Proof | Status |
| --- | --- | --- | --- | --- | --- | --- |
| API | yes | best-api + plitejs/react | DOM input marker `data-plite-keep-selection-visible`; output hooks `data-plite-inactive-selection` and `data-plite-inactive-selection-caret`; no prop/plugin/store | Plite and Plate editor consumers | exact source/type tests plus zero stale public owners | complete |
| Package | yes | `plitejs` | existing React entrypoint implementation and tests | direct Plite consumers and Plate facade | focused tests, source-first typecheck, changeset | complete |
| React adapter | yes | Plite `Editable` | private view-local transition/rendering machinery inside existing `Editable`; Plate inherits through `PlateContent` | Plite and Plate React apps | direct Plite test plus Plate registry/browser proof | complete |
| Registry UI | yes | plate-ui | editor CSS for output hooks and marker placement on owned focus targets | copied Plate UI consumers | registry test and browser paint controls | complete |
| Composition | yes | plate-ui | remove `SelectionRetentionKit` from `editor-plugins`; no replacement kit | registry editor composition | zero kit/plugin imports and working demo | complete |
| Scale proof | yes | benchmark | broadcaster prototype versus one-active-store coordinator; final 100-store production contract | users and maintainers | embedded probe plus focused Plite correctness test | complete |
| Registry metadata/examples | yes | plate-ui + shadcn | remove the installable `selection-retention` item; keep only a native-behavior demo with no plugin dependency | docs/block consumers | registry generation and route proof | complete |
| Docs | yes | docs-creator + Vision/rule owners | current-state marker/output contract and corrected active plans/doctrine | maintainers, humans, agents | source-backed phrase audit, parser where applicable, unslop | complete |
| Release artifacts | yes | changeset + registry-changelog | patch changeset and updated source/generated registry changelog | package and registry users | artifact policy checks and generator check | complete |
| Proof | yes | plate-feature | package, registry, browser, stale-surface, doctrine, and checker receipts | maintainers | all named completion gates | complete |
| Plate Next attestation | no | plate-next | N/A: focused work in existing unreviewed raw-substrate package `plitejs`; do not invent a 1,671-file package score or enroll it as a migrated Plate package | maintainers | N/A: changed-file proof plus doctrine validation, with no package advancement | N/A: focused package work does not authorize mass attestation |
| Review/handoff | yes | agent-native-reviewer + autoreview policy | agent-native audit; P1 autoreview only if permitted off `next`, otherwise explicit repo-rule waiver | user | accepted finding closed; `next` branch forbids autoreview, so scoped source review and proof replace that command | complete |

Focused package evidence:

- Package: `plitejs`.
- Plate Next state: untracked/unreviewed; a full current review does not apply to
  this focused feature packet.
- Diagnostic manifest: `computePackageFingerprint` found 1,671 current files,
  including volatile package-local `.tmp/check-core` output. Treating that as a
  score-100 review would be fake evidence.
- Final focused Plite production/test fingerprint:
  `sha256:493d1eca13d086d9d2845a37e1699700d4f578650184959140a545ef93df160b`.
- Changed production/test owners: `src/react/inactive-selection.ts`,
  `src/react/view-selection-decoration.ts`,
  `src/react/components/editable-text-blocks.tsx`,
  `src/react/components/editable-text.tsx`, and
  `test/react/editable-behavior.tsx`.

Package boundary contract:
| Contract | Decision | Evidence |
| --- | --- | --- |
| shared Plate host | N/A: no new Plate package or host | Existing `plitejs/react` entrypoint is the canonical host; Plate consumes it. |
| Plite ownership | raw behavior belongs to Plite; Plate adds no competing state/plugin | Native selection/focus behavior is editor-substrate presentation used by both Plite and Plate. |
| external dependency ownership | N/A: no new dependency | Use existing React, Slate/Plite, DOM, decoration, and selection-geometry owners. |
| entrypoint direction | keep existing `plitejs/react` client entrypoint | No new exported file or reverse Plate-to-Plite dependency. |
| Oxlint coverage | existing package/source coverage; audit changed paths | No new package root or override is planned. |

Phase state:

- current phase: closeout
- status: complete
- next phase: N/A: implementation, generated artifacts, review, and proof are closed.

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Feature Manifest complete before source writes | yes | All rows resolve applicability, owner, artifact, consumer, proof, and pending execution status above. |
| Flow mode selected | yes | Existing package plus React/registry. |
| Public API decision owner selected | yes | `best-api` accepted the literal DOM marker/output-hook contract; Plite React owns it. |
| Manual package decision recorded | yes | N/A: no package creation; edit existing `plitejs`. |
| Conditional packs selected | yes | package-api, docs, browser, registry-changelog, plate-next-attestation, agent-native. |
| Active goal checked or created | yes | Goal `01a0563b-e374-78a2-bc8e-c1dda1f857fc` created from this checkpoint. |
| Package/API pack selected | yes | Package behavior and public DOM contract change. |
| Public surface or package boundary identified | yes | Existing `plitejs/react` `Editable`, inherited by Plate. |
| Release artifact path selected | yes | Both `.changeset/*.md` and the existing `2026-08-31-transient-editor-geometry` registry changelog source/generated entry. |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded before release-artifact edits. |
| Barrel/export impact decision recorded | yes | N/A: no exported symbol or exported file-layout change; no `pnpm brl` unless implementation disproves this. |
| Docs pack selected | yes | Current-state API/ownership doctrine and active architecture/execution plans. |
| `docs-creator` loaded | yes | Loaded before docs edits. |
| Docs lane selected | yes | Vision/rule/plan doctrine; content docs only if source inventory finds a public page owning the removed registry item. |
| Target docs and nearest sibling docs read | yes | Read the old retention pages, Plite `Editable`, Find, and event-handling siblings. |
| Docs style doctrine read | yes | Read the docs-creator style/lane references and required shadcn corpus before edits; Unslop remains a final prose pass. |
| Documented source owner identified | yes | Root/Plite/Plate Vision plus `.agents/rules/best-api.mdc` and affected worker-rule sources. |
| Browser pack selected | yes | Native selection paint/focus requires rendered proof. |
| Browser route / app surface identified | yes | `/blocks/selection-retention-demo`, evolved to the final native behavior owner. |
| Browser tool decision recorded | yes | Use in-app Browser first; no native Chrome-only feature is involved. |
| Console/network caveat policy recorded | yes | Any new console error or failed issue-owned request blocks proof; unrelated pre-existing noise must be named. |
| Observable browser case captured | yes | `INACTIVE-SELECTION-FOCUS-001`: on the standalone demo, make expanded and collapsed selections, focus a marked control and observe one fallback, return focus or focus an unmarked control and observe none; repeat across two editors and 5/5 warm Chromium runs. Local uncommitted ref and final production/test/fixture fingerprints are recorded; this is not a public-report case. |
| Registry changelog pack selected | yes | Registry item/composition/demo behavior changes visibly. |
| User-visible registry impact classified | yes | Removing a required copied plugin/kit changes installed registry composition and styling. |
| Source entry path selected | yes | Update `apps/www/src/registry/changelog/entries/2026-08-31-transient-editor-geometry.mdx`; generate outputs. |
| Generator command selected | yes | Manual source edit, `generate-ui-changelog-entries.mjs --write`, then `--check`; run registry build required by this checkout when source changes. |
| Scale proof selected | yes | A private store, document subscription, and focus-event path changed; the embedded Benchmark probe is recorded below. |
| Package review applies | no | `plitejs` is an existing unreviewed raw-substrate package; focused work records changed-file proof without manufacturing whole-package attestation. |
| Starting doctrine/package version recorded | yes | Started at Plate Next doctrine v129; `plitejs` has no active package-attestation row. Doctrine reached v133 after the durable derived-DOM, lifecycle, focus-repair, and literal copied-UI laws stabilized. |
| Feature Manifest reused | yes | This single table controls all applicable phases; attestation is explicitly N/A. |
| No mass-attestation acknowledged | yes | The 1,671-file diagnostic inventory is not scored or advanced. |
| Agent-native pack selected | yes | Public API doctrine and worker routing currently teach the superseded boolean prop. |
| Agent-facing action surface identified | yes | `best-api`, Plite/Plate plans, plate-feature, plate-ui, plugin creator, docs creator, and Plate Next must route to the native marker law. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**` only, then run `pnpm install`; never hand-edit generated `.agents/skills/**` mirrors. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded after generated mirrors synced; its stale boolean-prop finding was fixed in the source rule and regenerated mirror. |

Work Checklist:

- [x] Complete the Feature Manifest and settle the hard-cut API before implementation.
- [x] Keep ownership in existing `plitejs/react`; no package, dependency, entrypoint, or public renderer is added.
- [x] Implement exact-Editable focus tracking, live expanded paint, collapsed caret geometry, cleanup, multi-editor ownership, Strict Mode safety, and forced selection-export suppression.
- [x] Prove composed-ancestor focus through direct, null-`relatedTarget`, and open-Shadow-DOM paths.
- [x] Remove `SelectionRetentionPlugin`, `SelectionRetentionKit`, and the installable registry item with no compatibility alias.
- [x] Adopt the marker and neutral output-hook styling in copied registry UI and its standalone demo.
- [x] Write source-backed current-state docs and run the required Unslop pass without changing protected literals or claims.
- [x] Publish both required release artifacts: one `plitejs` patch changeset and one generated registry changelog update.
- [x] Run package tests, typecheck, lint, manifest, registry, docs, generated-artifact, stale-surface, and doctrine proof.
- [x] Use a fresh in-app Browser page and fresh server for the final visual replay.
- [x] Record `positive-control: pass`, `negative-control: pass`, and `duplicate-control: pass`: one expanded fill, zero paint after unmarked/refocus, and no native-plus-fallback duplicate layer.
- [x] Record final ref plus production, test, fixture, and harness fingerprints after the last runtime edit.
- [x] Pass the native focus/paint case 5/5 retry-free in Chromium with real keyboard selection and real button focus.
- [x] Record N/A for clean pushed-ref certification: this checkout is intentionally local and uncommitted, so the handoff does not claim committed, pushed, shipped, or publicly fixed.
- [x] Record N/A for whole-package Plate Next attestation instead of manufacturing a 1,671-file review.
- [x] Waive P1 autoreview under the explicit repo rule forbidding it on `next`; close the scope with manual source review and exact proof.
- [x] Edit agent source rules, regenerate mirrors with `pnpm install`, and close the accepted stale boolean-prop finding.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Manifest coverage | yes | Run the feature checker | All applicable manifest rows are complete; final checker receipt is recorded below. |
| Selected pack closure | yes | Close package-api, docs, browser, registry-changelog, performance-observability, and agent-native packs | Every selected pack has named evidence in this table and Verification evidence. |
| Package proof | yes | Run focused Plite React proof | 4 files and 63 tests pass; `typecheck:entrypoint:react` and `lint:entrypoint:react` pass. |
| Package boundary proof | yes | Run manifest and scoped lint proof | `pnpm test:manifests` passes; no package, dependency, export, or Oxlint-boundary change exists. |
| Registry/browser proof | yes | Prove copied UI and standalone route | Registry demo test passes 2/2; fresh Chromium case passes expanded and collapsed paths 5/5. |
| Docs/release proof | yes | Prove docs and both release lanes | `www build:source`, full `www typecheck`, changelog generation/check, registry build, and the patch changeset pass. |
| Plate Next attestation | no | Do not mass-attest raw Plite | N/A: doctrine v133 validates; `plitejs` remains intentionally outside package attestation. |
| P1 autoreview | yes | Obey the current-branch review policy | Repo rule forbids autoreview on `next`; scoped manual source review, agent-native review, 63/63 tests, type/lint, and fresh Browser/Chromium proof close the review gate. |
| Goal plan complete | yes | Run the autogoal checker after this closeout save | The final checker command and receipt are recorded in Verification evidence. |
| Public API / package boundary proof | yes | Audit public nouns and stale owners | Literal marker plus two output hooks remain; zero `showInactiveSelection`, plugin, kit, or copied-item owners remain. |
| Release artifact classification | yes | Classify package and registry deltas separately | Published `plitejs` runtime behavior needs a patch changeset; copied registry behavior needs a registry changelog entry. |
| Published package changeset | yes | Add one valid patch changeset | `.changeset/plite-inactive-selection.md` declares only a `plitejs` patch. |
| Registry changelog | yes | Update source and generated registry changelog | The `2026-08-31-transient-editor-geometry` source names real item ids; write/check and registry build pass. |
| Barrel/export generation | no | Decide export impact | N/A: no symbol export or exported file-layout change; `pnpm brl` is not required. |
| Docs source-backed claim audit | yes | Audit docs against runtime owners | English/Chinese guide and Plite Editable docs use the exact marker/output strings and current-state voice. |
| Required Unslop pass | yes | Review every edited selection-retention doc | The two guide files and Plite Editable page remain concise; protected literals and technical claims are unchanged. |
| Requirements disclosure | yes | Separate runtime, copied styling, and repo-only setup | Docs assign mechanics to Plite, styling to copied registry CSS, and contain no generated-contract requirement. |
| Docs links / routes / previews | yes | Verify leaf route and preview | `/blocks/selection-retention-demo` renders the source registry example; `www build:source` and typecheck pass. |
| Docs MDX/content parser | yes | Run content generation | `pnpm --filter www build:source` passes. |
| Plugin page specifics | no | Apply only to plugin pages | N/A: this hard cut removes the plugin; the guide teaches native Editable behavior. |
| Browser interaction proof | yes | Exercise real selection and focus | In-app Browser shows one expanded fill, one collapsed caret, and zero paint after clear/refocus. |
| Browser console/network check | yes | Inspect diagnostics | Browser logs contain only React DevTools info and HMR connection; the fresh server returns the route with HTTP 200 and no issue-owned failed request. |
| Browser final proof artifact | yes | Capture positive and collapsed screenshots | Fresh-page screenshots visibly show `Sele` paint and the collapsed caret; DOM/focus/style observations agree. |
| Exact case replay | yes | Replay the accepted local behavior contract | Real keyboard selection plus real marked-button focus is replayed; this is not a public issue or shipped-fix claim. |
| Final ref and fingerprints | yes | Freeze exact replay inputs | Local `next` at HEAD `377a77a537971b793a4ddbb34cc13797fdfeee15`; production `a87bb0d54b8ca98d93f465950cf28cf87b1d63cabc804cf4e797417ecc86c731`, test `ac21e558dbe29c605dc23032bd2eee623800fb5d127754f76ccf157ebd27c62b`, fixture `b9ab843b578db089bd09a3ebaa59ed7837c235b3f25e9bb7c193fae46b6bf490`, harness `89d24d28ff97a28f9ca1d82d91fbee4008c353d132ed599f9a32cd9ae63f5a86`. |
| Clean final runtime | no | State the local authority boundary | N/A: final proof uses a fresh process and page on local uncommitted inputs; nothing is claimed committed, pushed, shipped, or publicly fixed. |
| Retry-free stability | yes | Run the native lifecycle case warm 5/5 | Playwright Chromium passes expanded and collapsed paths 5/5 with retry 0. |
| Registry generator test | no | Decide schema/generator impact | N/A: generator and schema are unchanged; source write/check and registry build are the applicable gates. |
| Source fingerprint | yes | Record focused Plite owners | Focused production/test fingerprint is `sha256:493d1eca13d086d9d2845a37e1699700d4f578650184959140a545ef93df160b`. |
| Version validation | yes | Validate doctrine and inspect package status | Plate Next v133 validates and resource sync is exact; two unrelated pre-existing package rows remain stale. |
| Attestation | no | Advance only a fully reviewed package | N/A: no fake `plitejs` package review or registry advancement. |
| Agent source / generated sync | yes | Regenerate mirrors | `pnpm install` regenerated skills; source/mirror resource parity is exact. |
| Agent action discoverability | yes | Audit agent routes and literal API teaching | `best-api`/plans route public decisions; `plate-ui` teaches marker placement and both literal output hooks; proof routes to package and Browser lanes. |
| Agent-native review | yes | Close accepted findings | Fixed the stale boolean-prop instruction in `.agents/rules/plate-ui.mdc`, regenerated its mirror, and found zero stale examples. |

Scale proof receipt:

- User operation: move focus from one Editable to a marked or unmarked target.
- Repeated unit and independent variable: mounted inactive-selection stores;
  cohorts are 1, 10, 100, and 1,000 stores.
- Rejected baseline: one shared DOM listener that broadcasts each focus event to
  every mounted store, O(number of Editables).
- Accepted target: one shared listener set and one active store per Document;
  each focus event visits exactly one store, O(1).
- Frozen budget: exactly one visited store per event; at 1,000 stores target
  work is at most 0.001 of broadcaster work. Timing is directional at 100 and
  1,000 stores, with a target width ratio at most 4; deterministic work is the
  authority because sub-millisecond JavaScript timings are noisy.
- Probe: `bun docs/plans/artifacts/2026-08-31-native-inactive-selection-focus-marker/inactive-selection-focus-probe.ts`.
- Result: pass. Nine measured packets after three warmups over 20,000 events
  kept target work at one visited store for every cohort. At 1,000 stores,
  median target time was 0.009541 ms versus 14.281209 ms for the broadcaster.
- Final probe fingerprints: harness
  `sha256:9b15bf7e1fee7139a8241620cd5476d059d15c4826e632aa5e993cb7d603a495`,
  production
  `sha256:eae3b8ea4210d6267f04284c6d63ec4424dbfb1d824ab9ebf2dfa321493f3000`,
  and test
  `sha256:b6985b6066048405918ed3dcac20c6d2bc29fd80f4b8d85c43c359f193a296b9`.
- Final production guard: `editable-behavior.test.tsx` registers 100 stores,
  proves one `focusin`/`focusout`/window-`blur` listener set, and proves only the
  two activated stores receive notifications. Full correctness and final source
  fingerprints are rerun after formatting and generation.

Findings:

- The copied `selection-retention` plugin duplicates an exact-view focus state
  that `Editable` can derive directly from its own blur/focus transition.
- A public `showInactiveSelection` prop would expose redundant state, invite
  invalid always-on paint, and force Plate products to coordinate a Plite view
  invariant manually.

Decisions and tradeoffs:

- Hard cut the plugin, kit, store, and boolean-prop proposal.
- Use one literal input marker on arbitrary focusable targets or ancestors.
- Keep transient fallback state private to the originating `Editable`; do not
  copy the canonical `Range` into a plugin or editor store.
- Expose neutral output data attributes for CSS only. Plite owns segmentation,
  caret geometry, native-paint suppression, pointer/ARIA neutrality, and cleanup.
- Preserve advanced custom structure through existing Decoration and
  Widget/selection-geometry APIs rather than a new renderer slot.

Failed-fix interrupt and architecture escalation:

- Attempt 1 was invalidated by exact Browser replay. The marked button received
  focus while the Editable blur delivered `relatedTarget = null`, so the
  synthetic direct-related-target tests were green while the real fallback did
  not render.
- Classification: `exact-replay`. Frozen product bytes reproduced the failure
  deterministically in Browser; source, CSS, marker presence, active element,
  and console state were correct. The missed variable was browser focus-event
  delivery, not product nondeterminism.
- Regression repair: the Regression rule, methodology, template, semantic
  validator, and workflow tests require both direct `relatedTarget` and
  null-then-document-`focusin` sequences. Focused source/generated proof passes.
- Architecture trigger: timer/focus/blur correctness. Best API keeps the same
  literal marker and neutral output hooks; it rejects a prop, plugin store,
  timer, or consumer-managed callback because the browser already supplies the
  authoritative second event.
- Plite plan: a null Editable blur stages only the originating private store;
  marked document `focusin` activates it, unmarked `focusin` and window blur
  clear it, and a pending store never paints. Direct `relatedTarget` remains an
  immediate path. The document coordinator retains O(1) work.
- Attempt 2 was invalidated by exact Browser replay on the current source-first
  package graph. The canonical editor selection, inactive-selection store,
  decoration read, range projection, and keyed segment were all correct, but
  the decoration source's published snapshot stayed empty.
- Classification: `exact-replay`. The failure remained deterministic after the
  stale Plite `dist` proof host was replaced with explicit source mappings. The
  source was already destroyed before its first live publication.
- Regression repair: disposable effect-owned sources must survive React Strict
  Mode's mount, cleanup, and remount rehearsal and must publish after remount.
  The Regression rule, methodology, template, validator, source tests, generated
  skill, and resource parity encode that oracle.
- Architecture trigger: lifecycle ownership. Best API adds no public concept;
  Plite reuses its existing strict-safe decoration-source lifecycle for every
  internally owned source instead of maintaining three cleanup variants.
- Plite plan: move `Editable`'s decorate source, inactive-selection source, and
  view-selection source onto the canonical deferred-destroy lifecycle. A
  rehearsal remount cancels destruction; a real source replacement or unmount
  still destroys the old source.
- Attempt 3 was invalidated by the fresh retry-free browser test. A fast native
  selection followed immediately by a marked-button click let a queued
  model-to-DOM selection export rewrite the browser selection between blur and
  focus. That browser write reclaimed focus for the Editable before inactive
  paint could stabilize.
- Classification: `exact-replay`. The route first waits for the Plite browser
  handle, then uses native keyboard selection and a real button click. Captured
  `Selection.removeAllRanges`, `addRange`, and `setBaseAndExtent` stacks all
  originated in the queued Plite selection-export owner.
- Regression repair: the existing methodology already required a hydrated
  runtime gate and real interaction. The case oracle now enforces both, keeps
  the zero-delay focus transition, and repeats expanded and collapsed paths
  5/5. A focused policy contract proves inactive focus blocks even a forced
  model-to-DOM export.
- Architecture trigger: focus and selection side-effect ownership. Best API
  adds no public surface. The private per-editor inactive state joins Plite's
  existing selection-side-effect policy, so queued DOM selection and focus
  repair cannot overrule the marked target.

Review fixes:

- Agent-native review found one stale `plate-ui` instruction that still taught
  an accepted boolean prop. The source rule now teaches the exact marker and
  output hooks; `pnpm install` regenerated the mirror and the stale scan is zero.
- Final source review found Shadow DOM focus retargeting could hide a marker on
  the actual control. The shared coordinator now resolves the capture-phase
  `focusin` composed path, with an open-shadow-root regression test.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | --- | --- | --- |
| `collect-vision-diff.mjs --status` failed with `spawnSync git ENOBUFS` while reading the large current overlay | 1 | Use bounded manual changed-input accounting and direct owner checks instead of the oversized collector | resolved; bounded Vision/rule/stale audits and generated-resource parity pass |
| Attempt 1 exact Browser replay: marked focus delivered null Editable `relatedTarget`, leaving zero inactive-selection output | 1 | Repair Regression's focus-transfer oracle, then use a pending-origin/document-`focusin` transition with an exact red test | resolved by the pending-origin coordinator and final 5/5 replay |
| First fresh Browser host loaded stale `plitejs/react` output from `dist` | 1 | Add the Plite source-entry mappings used by the package-facing www proof host, then restart from a fresh process | resolved; Browser loaded `packages/plitejs/src` |
| Attempt 2 exact Browser replay: Strict Mode rehearsal destroyed the render-created source before live publication | 1 | Repair Regression's disposable-effect oracle, add an exact Strict Mode red test, and reuse the canonical decoration-source lifecycle | resolved by the shared deferred-destroy lifecycle and final 5/5 replay |
| Attempt 3 fresh Playwright replay: queued model-to-DOM selection export reclaimed focus from the marked button | 1 | Keep the real zero-delay click oracle and route inactive focus through the canonical selection-side-effect policy, including forced exports | resolved; focused policy 8/8, Plite React contracts 62/62, and browser case 5/5 pass |

Verification evidence:

- Red: new Plite behavior tests initially found no expanded fallback, no
  marked-to-unmarked cleanup, and no collapsed caret.
- Green: four focused Plite React files pass 63/63, including expanded,
  collapsed, marked cleanup, two-editor ownership, null `relatedTarget`, open
  Shadow DOM, Strict Mode, O(1) coordination, and forced export suppression.
- Green: `pnpm --filter plitejs typecheck:entrypoint:react` and
  `pnpm --filter plitejs lint:entrypoint:react` pass.
- Green: `bun test apps/www/src/registry/examples/selection-retention-demo.spec.tsx`
  passes 2/2 for expanded cleanup/document purity and collapsed caret output.
- Green: `pnpm test:manifests`, `pnpm --filter www build:source`, full
  `pnpm --filter www typecheck`, registry generation, changelog write/check,
  and doctrine/resource validation pass.
- Green: the performance probe passes every cohort; at 1,000 stores the target
  visits one store per event and the broadcaster visits 1,000.
- Green: fresh-process Playwright Chromium passes the exact real-input case
  5/5 with retry 0.
- Green: fresh in-app Browser replay records one expanded `Sele` fill, one
  collapsed caret, zero paint after clear/refocus, marked-button focus retained,
  visible screenshots for both positive states, and no console error.
- Green: `node tooling/scripts/check-plate-feature.mjs
  docs/plans/2026-08-31-native-inactive-selection-focus-marker.md` reports
  `Plate feature plan: complete (12 surfaces)`.
- Green: `node .agents/skills/autogoal/scripts/check-complete.mjs
  docs/plans/2026-08-31-native-inactive-selection-focus-marker.md` reports
  `[autogoal] complete`.

Final handoff contract:

- Outcome: native marker-driven inactive selection is implemented locally in
  Plite; the Plate plugin/kit/item and boolean-prop design are deleted.
- Evidence: 63/63 focused package tests, typecheck, lint, registry 2/2,
  generated-artifact checks, scale proof, zero-stale API scan, and doctrine
  validation pass.
- Browser proof: fresh Chromium 5/5 plus fresh in-app expanded, collapsed,
  negative, duplicate-layer, focus, style, screenshot, and console checks pass.
- Release artifacts: `.changeset/plite-inactive-selection.md` and the generated
  `2026-08-31-transient-editor-geometry` registry changelog lane are complete.
- Residual risk: Firefox/WebKit and a clean pushed ref are not certified in this
  local packet; nothing is claimed committed, pushed, released, or shipped.
- Next owner: N/A for implementation. A maintainer may commit, push, widen the
  browser matrix, and release under separate authority.

Phase / pass table:
| Phase | Status |
| --- | --- |
| API and ownership | complete |
| Plite implementation | complete |
| Plugin hard cut and registry adoption | complete |
| Docs, Vision, rules, and release artifacts | complete |
| Package, scale, generated, and browser proof | complete |
| Review and closeout | complete |

Reboot status:

- Goal `01a0563b-e374-78a2-bc8e-c1dda1f857fc` is complete on local `next`.
- Resume only for separately authorized commit/push/release or wider browser
  matrix work; do not recreate a selection-retention plugin or boolean prop.

Open risks:

- No known local Chromium behavior defect remains. Firefox/WebKit and a clean
  pushed-ref replay are unverified release risks, explicitly outside this local
  uncommitted handoff.

Timeline:

- 2026-08-31: accepted marker-driven API, wrote red Plite behavior coverage,
  implemented exact-Editable lifecycle/rendering, removed the registry
  plugin/kit/item, and passed focused package and registry tests.
- 2026-08-31: started current-state docs, Vision, worker-rule, plan, and release
  repair before generated artifacts and browser proof.
- 2026-08-31: closed the forced selection-export race, composed-path focus
  retargeting, 63/63 package proof, fresh Chromium 5/5, in-app visual proof,
  generated artifacts, agent-native review, and doctrine v133 validation.
