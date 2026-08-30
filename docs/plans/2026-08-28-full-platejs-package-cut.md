# Full platejs package cut

Objective:
Hard-cut editor-facing packages into `platejs` subpaths; done when only four
package roots survive and source, package, Turbo, browser, and release gates
pass.

Flow mode:
one-shot execution of the accepted Phase 3 package cut

Goal plan:
docs/plans/2026-08-28-full-platejs-package-cut.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)
- docs (docs/plans/templates/packs/docs.md)
- browser (docs/plans/templates/packs/browser.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Major source:
- type: accepted user direction plus the completed Phase 2 distribution plan
- id / link: `docs/plans/2026-08-26-plitejs-platejs-distribution-hard-cut.md`
- title: Full `platejs` package cut
- decision to make: execute Phase 3 by absorbing every editor-facing package into explicit `platejs` subpaths and deleting the old workspace/package owners.
- decision criteria: four surviving package roots; one truthful entrypoint DAG; optional-peer isolation; zero stale package imports, manifests, exports, docs, or generated consumers; scoped development and atomic release proof pass.

Major lane:
- lane: framework migration and public package architecture
- output type: repository implementation, migration ledger, and verification evidence
- implementation expected: yes, explicitly authorized by “ok full cutout platejs let's goo!!!”
- affected packages / surfaces: every current `@platejs/*` and remaining editor-facing workspace package; `packages/platejs`; consumers, docs, registry, tooling, CI, release, and agent doctrine.
- dominant risk: a moved subpath silently reaches an undeclared peer, React from a headless root, a forbidden sibling entrypoint, or a deleted package name through declarations/generated artifacts.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: no duration requested.
- semantics: N/A: completion is binary-gate driven.
- initial confidence score: N/A: explicit package/import/artifact counts are stronger than a score.
- improvement loop: migrate one dependency-ordered entrypoint slice, run focused proof, then expand until the deletion and stale-reference counts are zero.
- final score / loop closure: N/A: close only when every named gate is proved.

Completion threshold:
- Exactly four public package roots remain: `plitejs`, `platejs`,
  `@platejs/cli`, and `@platejs/browser`.
- Every editor feature, including AI, DOCX, code drawing, Excalidraw,
  Markdown, Math, DnD, collaboration, and Yjs, is exported from one explicit
  `platejs/<feature>` or `platejs/<feature>/react` entrypoint; no forwarding
  package or compatibility alias survives.
- Only `packages/platejs` imports or depends on `plitejs`; Plate packages,
  applications, docs, registry, tests, and generated artifacts consume
  `platejs`.
- One generated entrypoint DAG owns direct import permissions and Turbo task
  dependencies. Roots remain React-free, sibling imports are allowlisted only
  through declared entrypoint dependencies, and reverse invalidation is exact.
- Advanced implementation libraries are optional peers when their entrypoint
  is optional. Unrelated base consumers neither install nor import them; each
  packed subpath proves its runtime and declaration dependency closure and
  reports sibling peers brought transitively by a required vendor.
- Zero live stale old-package imports, dependencies, exports, workspace paths,
  docs examples, registry payloads, release inputs, or built declarations remain.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-28-full-platejs-package-cut.md`
  passes.

Verification surface:
- Counted package inventory and old-name source/manifests/generated-artifact
  audits under `/Users/zbeyens/git/plate-2`.
- Generated DAG/Oxlint/Turbo contracts, per-entrypoint typecheck/test tasks,
  atomic `platejs` build, public type contracts, and isolated packed consumers.
- Source-first checks for all surviving packages and repository adopters;
  strict Plite proof remains direct and Plate proof remains facade-only.
- Representative Plate registry demos in Browser with console/network checks,
  followed by applicable root, release-boundary, barrel, lint, plan, and review gates.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Execute the accepted hard cut; compatibility and migration effort do not weaken the target.
- Keep `plitejs` the raw substrate and `platejs` the only ordinary Plate distribution.
- `platejs` reexports approved Plite APIs by identity and replaces or omits only its explicit exception set.
- Package and entrypoint select the layer; keep the unified editor API and the React/non-React split.
- Manual installation of optional peers is accepted; package-manager peer UX is not grounds for retaining a package.
- Do not publish, mutate dist-tags, deprecate npm packages, commit, push, or open a PR without separate authority.
- Do not edit `templates/**` by hand.

Boundaries:
- Source of truth: live package manifests/exports/source, root and Plate Vision, the accepted Phase 2 plan, canonical entrypoint DAG, Oxlint/Turbo generators, docs/registry owners, and release scripts.
- Allowed edit scope: every package owner and repository consumer needed to complete the cut, generated barrels/configs, lockfile, current docs, registry metadata/output, release tooling, and affected `.agents/rules/**` sources.
- External sources: N/A: repo evidence and the already accepted direction decide this migration.
- Browser surface: representative standalone `/blocks/*-demo` routes covering ordinary editing plus advanced React entrypoints when runnable.
- Tracker sync: N/A: no issue or PR owns this request.
- Non-goals: editor behavior redesign, npm publication, stable/beta dist-tag changes, compatibility proxy packages, and preserving granular feature versioning.

Output budget strategy:
- Inventory manifests and import names as counts/filenames first. Exclude
  `node_modules`, `.turbo`, `.next`, `dist`, coverage, historical changelogs,
  migration archives, and binary/generated caches unless the named gate owns
  them. Store the full migration map in this plan or a compact artifact rather
  than streaming repository-wide matches.

Blocked condition:
- Stop only when the same compiler, bundler, or package-law conflict prevents
  every dependency-honest subpath after three distinct owner-level repairs, or
  when completion requires npm/GitHub authority not granted here. A failing
  package, docs, Browser, or generated-artifact gate routes back to its owner.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: final handoff
- goal_status: complete

Current verdict:
- verdict: execute the full hard cut
- confidence: high; source, packed-package, strict browser, and rendered-registry proof passed on the final tree
- next owner: maintainer release workflow when publication is separately authorized
- reason: no editor feature retains an independent package job; optional peers, Oxlint DAG rules, entrypoint Turbo tasks, and packed consumers preserve every material boundary.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-28-full-platejs-package-cut.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | The explicit requirements checklist below records the four survivors, full feature absorption, facade direction, optional peers, DAG permissions, Turbo locality, and proof threshold. |
| Timed checkpoint parsed | no | N/A: no duration or deadline was requested. |
| `major-task` loaded | yes | `.agents/skills/major-task/SKILL.md` was read before implementation. |
| Active goal checked or created | yes | Goal `01a04564-9e3a-77e3-b2ec-ec98f549c3bc` names this plan and binary threshold. |
| Source of truth read before analysis | yes | Root `VISION.md`, `docs/vision/common.md`, `docs/vision/plate.md`, the Phase 2 plan, and current entrypoint Turbo plan were read. |
| Major lane selected | yes | Framework migration and public package architecture with implementation. |
| Decision criteria stated | yes | Four surviving roots, zero stale old owners, dependency-honest subpaths, direct-only imports, exact invalidation, and full release/package proof. |
| Existing repo patterns / prior decisions checked | yes | Phase 2 facade cut, remaining-udecode cut, peer normalization, Yjs entrypoints, and entrypoint Turbo evidence were checked. |
| Helper stack selected | yes | `autogoal`, `major-task`, `plate-plan`, `hard-cut`, and automatic `best-api repair`; docs/release/review helpers load only when their phase starts. |
| External research decision recorded | no | N/A: live repository source and the accepted target settle this migration. |
| Implementation expectation recorded | yes | The latest user message explicitly authorizes the full cut. |
| Workspace authority selected | yes | `/Users/zbeyens/git/plate-2`; no cross-repo mutation. |
| Branch / PR expectation decided | no | N/A: no branch, commit, push, or PR was requested. |
| Output budget strategy recorded | yes | Count/file-first audits with generated/build/cache exclusions are recorded above. |
| Package/API pack selected | yes | Every public package identity, export, peer, type, and release artifact changes. |
| Public surface or package boundary identified | yes | One `platejs` distribution with explicit feature and React subpaths replaces all editor-facing feature packages. |
| Release artifact path selected | yes | `.changeset` files for surviving published package deltas; deleted packages receive no forwarding release artifact. |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded before creating the `platejs` major and CLI minor changesets and remapping existing release entries. |
| Barrel/export impact decision recorded | yes | Run `pnpm brl` after moved public files and export-map changes. |
| Docs pack selected | yes | Current package/import docs and registry teaching must adopt `platejs` subpaths. |
| `docs-creator` loaded | yes | Loaded before current-state docs and registry changelog edits. |
| Docs lane selected | yes | Source-backed package/import reference adoption, not changelog prose. |
| Target docs and nearest sibling docs read | yes | Troubleshooting, TypeScript, installation, feature, and registry import teaching were audited against the new exports. |
| Docs style doctrine read | yes | `docs-creator` current-state and style doctrine were applied. |
| Documented source owner identified | yes | `packages/platejs/package.json` exports and public source entrypoints own every documented import. |
| Browser pack selected | yes | Package/registry adoption needs real app proof. |
| Browser route / app surface identified | yes | Representative standalone `/blocks/*-demo` routes selected after feature inventory; strict Plite remains its own proof app. |
| Browser tool decision recorded | yes | Use Browser for ordinary editor routes; no native Chrome/OS interaction is expected. |
| Console/network caveat policy recorded | yes | Record both for every selected Browser route; unrelated dev-server noise is classified, not ignored. |
| Observable browser case captured | no | N/A: architecture migration, not a report-backed behavior defect; record route/setup/action/outcome before final proof. |
| Agent-native pack selected | yes | Vision and package-boundary worker rules must stop teaching feature packages. |
| Agent-facing action surface identified | yes | `best-api`, `plate-plan`, `plate-feature`, `plate-plugin-creator`, `docs-creator`, and `plate-next` source rules are audited for the old package law. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**`; regenerate `.agents/skills/**` only through `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded; source rules, generated mirrors, Plate Next versioning, and discoverability were audited. |

Work Checklist:
- [x] N/A: no duration or score threshold was requested; completion is binary-gate driven.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Major source records source type, id/link, title, decision type, expected
      outcome, decision criteria, likely files/packages/surfaces, browser
      surface, and highest-leverage owner.
- [x] Exactly `plitejs`, `platejs`, `@platejs/cli`, and `@platejs/browser` remain; 42 retired package manifests and one internal source directory moved under the recoverable Trash checkpoint.
- [x] Every editor feature is owned by `platejs`, `platejs/react`, an advanced `platejs/<feature>` path, or its React adapter; no forwarding package survives.
- [x] AI, DOCX, code drawing, Excalidraw, Markdown, Math, DnD, Yjs, media, tables, suggestions, and every remaining editor feature are covered by the export and packed-subpath ledger.
- [x] Only `packages/platejs` imports or declares `plitejs`; ordinary Plate applications consume `platejs`. `apps/www` declares `plitejs` only as the raw Plite example-source proof owner consumed by `apps/plite`.
- [x] The public editor vocabulary is unified across root and React entrypoints; no Plite/Plate application variant or compatibility proxy remains.
- [x] Optional advanced libraries are optional peers and direct imports stay inside their explicit entrypoints; isolated packed consumers prove base closure and report required-vendor overlap.
- [x] `tooling/entrypoints/entrypoint-dag.mjs` generates Oxlint permissions and Turbo dependencies; tests prove undeclared sibling imports, root-to-React reachability, cycles, and facade bypasses fail closed.
- [x] Entrypoint-scoped Turbo tasks have exact inputs and reverse dependents; the exact hash test proves leaf changes and renames invalidate only the owning closure, while the package build remains atomic.
- [x] Live apps, docs, registry, tests, benchmarks, tooling, CI, release metadata, and generated consumers use the four-root topology. Old names remain only in immutable changelog, migration, release-history, Plate Next retired-package, and this execution-plan evidence.
- [x] Release artifacts exist for the surviving deltas; no publish, deprecation, commit, push, or PR action was taken.
- [x] Current state, prior repo decisions, constraints, options, tradeoffs, rejection reasons, blast radius, and facts versus recommendation are recorded above and below; external research was N/A because accepted repo doctrine settled the target.
- [x] The hard-cut, best-api, package/API, docs, Browser, changeset, registry-changelog, and agent-native pressure passes completed; accepted findings are reflected in the final graph and proof.
- [x] Every proof command ran from `/Users/zbeyens/git/plate-2`; broad audits were scoped by live roots and generated/history exclusions after the one recorded over-broad search.
- [x] Package/API proof covers exports, optional peers, source types, atomic build, barrels, 4 tarballs, 50 subpaths, NodeNext/Bundler declarations, Node runtime, DCE, and package direction.
- [x] `platejs` has a major changeset, CLI has a minor changeset for `plate deps`, existing unreleased changesets name only surviving roots, and the registry changelog is source-backed.
- [x] Docs use current-state reference voice; troubleshooting and TypeScript package guidance were migrated, links/routes were generated, and the edited English docs plus registry changelog passed the required Unslop pass with protected imports intact.
- [x] Browser used fresh navigation on the final regenerated tree for `/blocks/table-demo`, `/blocks/ai-demo`, `/blocks/preview-markdown-demo`, and `/blocks/collaboration-demo`; editors rendered, the table rendered, both collaboration peers reported `Synced`, and console errors were empty.
- [x] N/A: this architecture migration makes no report-backed paint, exact-case, pushed-ref, clean-checkout, or native-browser stability claim, so screenshot controls, red-before-green replay, production fingerprints, and 5/5 native warm runs do not apply.
- [x] Browser proof used real registry routes with no stubs, aliases, generated-file edits, or route bypasses.
- [x] `.agents/rules/**` source owners were updated, `pnpm install` regenerated mirrors, Plate Next v116 teaches the four-root law, and its final `platejs` fingerprint is recorded.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | complete | Run root, strict Plite/browser, packed-release, registry, rendered Browser, stale-name, and plan gates | All named gates passed on the final tree. |
| Current-state source audit | complete | Map current owner, boundaries, constraints, and affected surfaces | Four manifests remain; all editor source is owned by `platejs` or `plitejs`. |
| Decision criteria closure | complete | Close every criterion with evidence | Every completion-threshold row is satisfied. |
| Options / tradeoffs / rejection record | complete | Record viable targets and rejection reasons | Standard-root plus optional-peer subpaths won; forwarding packages and one-subpath-per-former-package were rejected. |
| Review / pressure pass | complete | Run selected owner lenses | Hard-cut, best-api repair, package, docs, Browser, and agent-native lenses completed. |
| Review findings closure | complete | Fix accepted findings | DnD peer identity, collaboration focus, root imports, module mocks, missing Markdown legacy codec, CSS DAG classification, and stale tooling were repaired and re-proved. |
| External-source audit | complete | Use external sources only when repo evidence is insufficient | N/A: accepted repository doctrine and source settled the implementation. |
| Implementation gates | complete | Close primary-template and touched-surface gates | Root, package, docs, browser, release, and agent gates passed. |
| Final handoff contract | complete | Record evidence, caveats, and next owner | Recorded below. |
| Final lint | complete | Run `pnpm lint:fix` and final lint checks | Root `pnpm lint:fix`, `pnpm check`, and package lint gates passed. |
| Output budget discipline | complete | Scope broad output and record recovery | One generated-payload search was over-broad; later audits excluded generated/history owners and were count/file-first. |
| Timed checkpoint | complete | Honor a requested duration | N/A: no duration requested. |
| Goal plan complete | yes | Run the plan checker after this evidence update | Final checker is the last gate. |
| Public API / package boundary proof | complete | Audit exports and package reachability | 50 explicit packed subpaths and the generated DAG passed. |
| Release artifact classification | complete | Classify published and registry deltas | `platejs` major, CLI minor, and registry changelog. |
| Published package changeset | complete | Add legal surviving-package changesets | `.changeset/consolidate-platejs-package.md` and `.changeset/add-cli-deps-command.md`; all active changesets name only four roots. |
| Registry changelog | complete | Add source registry changelog | `2026-08-28-consolidate-platejs-dependencies.mdx` generated successfully. |
| No release artifact | complete | State N/A when published behavior changed | N/A: published behavior did change and has release artifacts. |
| Package typecheck/build/test | complete | Run owning package proof | 44 typecheck tasks, 62 test tasks, four-package build, public types, and strict contracts passed. |
| Barrel/export generation | complete | Run `pnpm brl` | Passed with generated barrels current. |
| Docs source-backed claim audit | complete | Check imports against exports | Current docs and registry imports resolve to the final export map. |
| Required Unslop pass | complete | Audit edited prose | Edited English troubleshooting, TypeScript, and registry changelog prose passed with imports intact. |
| Requirements disclosure | complete | Tie claims to owners | Package, optional-peer, raw-Plite proof-owner, and build-owner requirements are explicit. |
| Docs links / routes / previews | complete | Generate and verify docs/registry routes | Registry generated 378 payloads and 15 overlays; four selected routes returned 200. |
| Docs MDX/content parser | complete | Run `pnpm --filter www build:source` | Passed. |
| Plugin page specifics | complete | Apply plugin-page doctrine when relevant | N/A: no new plugin manual/API page was authored. |
| Browser interaction proof | complete | Exercise representative final routes | Table, AI, Markdown, and collaboration demos rendered. |
| Browser console/network check | complete | Check console and route responses | All four routes returned 200 with zero console errors. |
| Browser final proof artifact | complete | Record route/native proof or caveat | Route/DOM/console receipt recorded below; no screenshot was needed for a non-visual package cut. |
| Exact case replay | complete | Replay report-backed behavior when applicable | N/A: not a report-backed behavior fix. |
| Final ref and fingerprints | complete | Record applicable package fingerprint | Local uncommitted tree; Plate Next fingerprint `sha256:81a9792676c95b1108a8edab53f15c24eefe136ecce0160802f31a490f64b883`. |
| Clean final runtime | complete | Require immutable clean proof only for shipped-fix claims | N/A: local uncommitted architecture implementation; no shipped/fixed claim. |
| Retry-free stability | complete | Require 5/5 for native lifecycle claims | N/A: no native-selection, paint, focus, DnD, compositor, or exact-Chrome claim. |
| Agent source / generated sync | complete | Regenerate mirrors after source-rule edits | `pnpm install` completed and source/mirror contracts passed. |
| Agent action discoverability | complete | Audit owning rule/skill route | Package law is discoverable through Plate plan/feature/plugin and Plate Next owners. |
| Agent-native review | complete | Load owner and close findings | Completed; v116 and the final `platejs` attestation are current. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Prompt, Vision, Phase 2 plan, package manifests, DAG/Turbo/Oxlint owners, and feature source topology read. | done |
| Current-state map | complete | 46 package manifests counted: four survivors and 42 retired owners; 43 source directories moved because one internal directory had no manifest. | done |
| Options and recommendation | complete | Standard features live in `platejs`/`platejs/react`; optional-peer or advanced runtimes use explicit subpaths. | done |
| Review / pressure pass | complete | Hard-cut, best-api, package/API, docs, Browser, changeset, registry, and agent-native owners applied. | done |
| Implementation or plan artifact | complete | Full cut, adoption, release metadata, doctrine, and proof tooling implemented. | done |
| Verification | complete | Root check, strict Chromium closure, packed consumers, registry build, source build, Browser replay, and stale-name audit passed. | done |
| Closeout | complete | Final fingerprint, recovery path, caveat, and handoff recorded. | final response |

Findings:
- Live `packages/*/package.json` inventory contains 46 package roots. The exact
  target therefore requires 42 directory-owner deletions or moves, including
  public `depset` and private `@plate/scripts`, not only feature packages.
- The 38 feature packages contain about 450 source files. Most already split
  cleanly into root and `react`; four old root-only packages are actually React
  owners (`cursor`, `dnd`, `floating`, and `resizable`).
- The current `platejs` entrypoint graph has 11 public entrypoints and exact
  per-entrypoint Turbo tasks. It can scale to feature modules, but its fallback
  owner is the public root. A standard aggregate root without cycles requires
  a private `core` owner plus public root and React aggregator files.
- Old manifest dependency edges are sometimes stale (`link` declares
  `@platejs/floating` without a production import). The target graph must use
  source-backed direct permissions, not blindly preserve dead package edges.
- Optional-peer boundaries are declaration boundaries too. A feature whose
  public types mention `katex`, `yjs`, `tabbable`, Emoji Mart, AI SDK, DOCX
  libraries, Floating UI, or React DnD cannot be reexported from the common
  root without making that peer reachable.

Decisions and tradeoffs:
- Merge ordinary editor features into the literal `platejs` and
  `platejs/react` roots. This keeps the normal editor discoverable and avoids
  absurd imports such as a dedicated path for bold or headings.
- Retain explicit subpaths only for optional-peer or advanced runtimes:
  `ai`, `code-drawing`, `csv`, `docx`, `emoji`, `excalidraw`, `juice`,
  `markdown`, `math`, `yjs`, plus React-only `dnd/react`, `floating/react`, and
  `tabbable/react`.
- Split the DAG's physical implementation owner from the public aggregate:
  private `core` and `react-core` nodes feed standard feature modules; public
  `root` and `react` aggregate them. Private nodes remain unresolvable as
  package subpaths.
- Move `@plate/scripts` into root tooling. Move the `depset` job into
  `@platejs/cli` rather than preserving a fifth package root.
- Reject one public subpath per former package. It would preserve package
  navigation and import fragmentation after deleting only npm metadata.

Implementation notes:
- Moved 43 retired owner directories into `/Users/zbeyens/.Trash/plate-full-cut-20260828135346`; the move is recoverable.
- Standard root and React exports aggregate ordinary features. Optional-peer features use explicit entrypoints, including `ai`, `docx`, `markdown`, `math`, `yjs`, `code-drawing`, `excalidraw`, and React adapters for DnD/floating/tabbable.
- `@platejs/cli` owns the former `depset` job as `plate deps`; `@plate/scripts` moved into root tooling.
- `apps/www` retains a `plitejs` development dependency only because it owns raw Plite example source consumed by the strict `apps/plite` proof app. Ordinary application and Plate code never import Plite.

Review fixes:
- Aligned `react-dnd` and the HTML5 backend on v16 to prevent two runtime contexts after consolidation.
- Used the semantic collaboration selection handle so concurrent browser runs do not misplace native `End` input.
- Consolidated imports and Bun module mocks that previously relied on separate package identities.
- Restored the moved legacy `media_embed` Markdown decode path and excluded the Math CSS export from the JavaScript entrypoint DAG.
- Removed the deleted `depset` package-directory mapping from current release tooling.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| A broad `rg` for `depset` reached one-line generated registry payloads and exceeded the intended output budget. | 1 | Exclude `apps/www/public/r/**`, generated release indexes, changelogs, plans, templates, and build/cache trees before printing matches. | Search policy tightened; no product decision relied on truncated output. |
| The first strict DnD route resolved `react-dnd` v14 in moved source while the provider used v16. | 1 | Audit runtime identity instead of changing DnD behavior. | Plate development dependencies aligned to v16; focused DnD and strict Chromium proof passed. |
| Concurrent collaboration proof placed native `End` input at the start of the document. | 1 | Use the existing semantic selection handle. | Focused collaboration and the 79-batch Chromium gate passed. |
| Consolidated package imports produced duplicate import declarations and separate Bun mocks overwrote one shared `platejs` module. | 1 | Merge imports and mocks by final module identity. | Root type-aware lint, 612 fast tests, and focused registry tests passed. |
| Turbo hash integration proof exceeded Bun's default 5-second test budget at 5.7 seconds. | 1 | Give the bounded integration test an explicit 15-second timeout. | The test passed in 7.6 seconds and the full slow suite passed. |

Verification evidence:
- Package inventory: exactly four manifests under `packages/*/package.json`.
- DAG/Turbo: generated state current; 14 focused contracts plus the 3-case exact hash/reverse-dependency suite passed.
- Root: `pnpm lint:fix` and `pnpm check` passed, including 44 typecheck tasks, 612 fast tests, and 190 slow tests.
- Strict editor proof: `pnpm check:plite` passed all package/type/contract gates and Chromium with 710 passed, 8 intentional skips, and 79 bounded batches.
- Release: `pnpm plite:release:packages` verified four tarballs, 50 public subpaths, NodeNext/Bundler declarations, Node runtime, direction, root React isolation, Yjs, and bare/named DCE.
- Registry/docs: `pnpm --filter www build:registry` generated 378 canonical payloads and 15 overlays; `pnpm --filter www build:source` passed.
- Browser: final regenerated table, AI, Markdown, and two-peer collaboration routes rendered with zero console errors; both collaboration peers were `Synced`.
- Stale-name audit: zero live old-package imports or paths after excluding immutable changelog, migration, release-index, retired-package, and execution-plan evidence.
- Agent doctrine: Plate Next v116 validates and `platejs` fingerprints to `sha256:81a9792676c95b1108a8edab53f15c24eefe136ecce0160802f31a490f64b883`.

Final handoff contract:
- Recommendation: ship the four-root topology as the only Plate distribution model.
- Confidence: high on the current local tree; source, package, release, and rendered-app gates agree.
- Evidence: four manifests, 50 packed subpaths, exact entrypoint invalidation, zero live stale owners, and current doctrine fingerprint.
- Tests / commands: `pnpm check`, `pnpm check:plite`, `pnpm plite:release:packages`, `pnpm brl`, registry/source builds, manifest and DAG contracts.
- Browser proof: table, AI, Markdown, and collaboration demo routes; zero console errors; both peers synced.
- PR / tracker: N/A; no commit, push, PR, publication, deprecation, or tracker mutation was authorized.
- Caveats: npm publication and external consumer migration are intentionally unperformed. The raw Plite example-source owner keeps a development-only `plitejs` dependency for strict proof.
- Next owner: release workflow after separate commit/publish authority.

Timeline:
- 2026-08-28T13:47:08.832Z Major-task goal plan created.
- 2026-08-28: activated one-shot execution goal and copied every explicit requirement before implementation.
- 2026-08-28: counted 46 live package roots, classified source/dependency/React ownership, and selected the standard-root plus advanced-subpath target.
- 2026-08-28: moved 43 retired source owners to a recoverable Trash checkpoint, migrated consumers, and reduced the package inventory to four roots.
- 2026-08-28: completed root, strict Chromium, packed-release, registry, rendered Browser, stale-name, release-artifact, and agent-doctrine gates.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final handoff; release work needs separate authority. |
| What is the goal? | Four package roots with every editor feature owned by dependency-honest `platejs` entrypoints. |
| What have I learned? | Package boundaries were mostly installation metadata; entrypoint permissions, optional peers, and packed consumers preserve the real laws with less package noise. |
| What have I done? | Completed the full cut and every named local proof gate. |

Open risks:
- npm publication and third-party migration remain outside this local implementation.
- Package managers still cannot explain which optional peer belongs to which subpath; the accepted contract is explicit documentation plus isolated packed proof.
