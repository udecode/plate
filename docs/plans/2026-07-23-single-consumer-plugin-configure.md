# single consumer plugin configure

Objective:
Make plugin authoring use extend and reserve one consumer configure step; done
when Core, package callers, docs, release prose, audits, browser proof, and
review pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-23-single-consumer-plugin-configure.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- docs
- package-api
- browser

Mode:
- `standard`; the user accepted the source-backed API review and explicitly
  authorized the complete implementation with `go fix all`.

Completion threshold:
- Exactly one consumer-owned `.configure(...)` call is accepted per plugin
  descriptor at type and runtime; authoring methods are terminally unavailable
  after configuration.
- Production package plugin definitions use `create*Plugin` plus `.extend*`;
  only the three reviewed Core installation factories may configure package
  plugins under `packages/**`.
- Package extensions read the consumer-configured options, while the single
  consumer configuration remains the final override for overlapping fields.
- Current Core tests/type contracts, package callers, tooling audits, EN/CN
  current docs, plans, package changeset, registry changelog, browser proof,
  `check:core`, docs checks, final autoreview, and `check-complete` pass with
  zero accepted actionable findings and zero stale multiple-configure doctrine.

Verification surface:
- Focused public runtime/type tests in `packages/core`, including one
  red-to-green resolver precedence row, one terminal type contract, and untyped
  runtime rejection.
- Exact production source audit for `.configure(` under `packages/**`, with
  only `getCorePlugins.ts` and `getPlateCorePlugins.ts` installation calls
  permitted.
- Focused typechecks/tests for Core, Media, Tabbable, DnD, Utils, Selection,
  and `www`; final `pnpm check:core`.
- `pnpm --filter www build:source`, `pnpm --filter www check:docs`, registry
  changelog generation/check, and Browser proof on `/blocks/playground-demo`
  with console/network inspection.
- Final scoped `autoreview` and this plan's `check-complete`.

Constraints:
- Implementation is explicitly authorized by the user's `go fix all`.
- No public compatibility aliases or runtime shims.
- Preserve object-form configuration in app-owned registry kits: those calls
  are the editable consumer customization point, not package definitions.
- Preserve callback inference and the sole `options` value bag.
- Do not change Plite extension configuration or live portal `setOption(s)`.
- Do not manually edit generated registry JSON or templates.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.

Boundaries:
- In scope: Core plugin descriptor typing/runtime/resolution, Base and Plate
  plugin authoring methods, seven package-owned declarations, affected registry
  kits, tooling audits, current docs, VISION doctrine, overlapping plans, the
  Core release artifact, and registry changelog.
- Source owners: `packages/core/src/lib/plugin`,
  `packages/core/src/react/plugin`, `packages/core/src/internal/plugin`, the
  seven affected feature packages, `apps/www/src/registry`, `content/docs`,
  `tooling/scripts`, VISION, and named plan/release files.
- Non-goals: behavior-manifest implementation, Plite runtime changes, public
  compatibility, package topology cleanup, unrelated configuration APIs, or
  commits/PRs.
- Direct Plite boundary owners: N/A; this changes Plate descriptor authoring and
  compilation only. Plite extensions and dynamic `editor.extend` remain
  untouched.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Block only if a package extension cannot both consume configured options and
  yield to the final consumer override without changing Plite publication law,
  or if the required Browser route remains unavailable after the documented
  local recovery path. Do not block while a focused Core repair remains.

Plate Plan state:
- status: complete
- phase: complete
- next: user review
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Single user-facing configure, package extend ownership, complete source/docs/release/proof sweep, and no partial fix are captured above. |
| Active goal and plan verified | yes | Active goal points to this exact plan and the user authorized one-shot execution. |
| Current owners read | yes | Core method types, constructor, resolver, merge/portal owners, seven package declarations, current docs, prior plans, and release prose were read. |
| Mode and execution boundary resolved | yes | Standard one-shot accepted-plan execution; no additional approval pause. |
| Docs pack selected | yes | Public guide/API doctrine and EN/CN mirrors change under the Core API implementation. |
| `docs-creator` loaded | yes | Complete skill read before docs edits. |
| Docs lane selected | yes | Guide/system plus API-reference correction; no page topology change. |
| Target docs and nearest sibling docs read | yes | `plugin-methods.mdx`, `plate-plugin.mdx`, their CN mirrors, plugin guide usages, and live Core source are the bounded owners. |
| Docs style doctrine read | yes | Root/docs creator doctrine and current-state anti-changelog rules read. |
| Documented source owner identified | yes | `BasePluginMethods`, `PlatePluginMethods`, `createBasePlugin`, and `resolvePlugin` own every API claim. |
| Package/API pack selected | yes | `@platejs/core` public method typing/runtime and package-owned adoption change. |
| Public surface or package boundary identified | yes | `.configure`, `.extend*`, configured descriptor return types, resolver precedence, and package/app ownership. |
| Release artifact path selected | yes | Update existing `.changeset/plugin-portal-scoped-api.md` relative to `main`; add registry changelog because copied kit grammar changes. |
| `changeset` skill loaded when `.changeset` is required | yes | Complete `changeset` and `registry-changelog` skills read. |
| Barrel/export impact decision recorded | yes | Existing files/types only; run `pnpm brl` only if the implementation creates or moves public exports. |
| Browser pack selected | yes | Packages and registry kits change, triggering runnable app proof. |
| Browser route / app surface identified | yes | `/blocks/playground-demo` installs the affected editor/plugin kits and exercises Block Selection. |
| Browser tool decision recorded | yes | Use Browser for DOM/editor interaction; no native Chrome/OS behavior applies. |
| Console/network caveat policy recorded | yes | Route, interaction, errors, failed requests, and any known unrelated hydration warning will be recorded separately. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | Core/package/docs/release/browser/review gates all pass on the final stable snapshot. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Core terminal typing/runtime, resolver, package call sites, docs, and artifacts were reread after the final review repairs. |
| Conditional risk and adoption | yes | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | Input-rule replacement, callback cardinality, Base-to-Plate state, EN/CN docs, release artifacts, and registry callers are covered. |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Focused Core/package tests, typecheck, lint, source/docs audits, docs build, release checks, Browser observations, and the shared-gate blocker are recorded below. |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Ownership, hard cut, adoption, proof, and the unrelated current-tree blocker are recorded below. |
| Autoreview | yes | Run for implementation changes or record planning-only N/A | Final scoped autoreview exited clean with zero accepted actionable findings after four review decisions. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-23-single-consumer-plugin-configure.md` | Final invocation passed after this evidence update. |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | `check-plate-doc-code-contracts.mjs` passed across 366 docs after source-backed EN/CN edits. |
| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names or record N/A | Existing plugin-method and Plate-plugin leaf routes remain unchanged; `www check:docs` passed source and parity checks. |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | `pnpm --filter www check:docs` ran `build:source` and passed. |
| Plugin page specifics | yes | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | Guide/API pages use author-vs-consumer examples backed by the current Core signatures and resolver. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Terminal configured descriptor types and runtime guards passed focused type/runtime contracts; production package audit passed. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Core exposes a published major API/runtime contract; copied registry grammar also has a registry changelog event. |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | Existing Core major changeset was updated; `pnpm changeset status` passed with no forbidden minor. |
| Registry changelog | yes | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | Source entry and generated event were updated; generator `--check` passed with 26 events. |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A because both the published Core surface and copied registry kit grammar have user-visible deltas. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Core typecheck/contracts, 108 focused Core tests, 30 package tests, Utils build, www typecheck, lint, and the complete 45-package `check:core` matrix passed. |
| Barrel/export generation | yes | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | `pnpm brl` passed 56/56 packages; later Media rewrites are owned by the separate colocation task. |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Fresh Browser run rendered 101 playground blocks and 8 block-menu blocks, found one configured context-menu wrapper per route, and focused the editor through interaction. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Both routes returned HTTP 200 with no module/request errors; the sole console error is the pre-existing random table-cell-ID hydration mismatch. |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | Fresh playground screenshot visually showed the complete toolbar/editor; DOM counts, interaction, route responses, and console state are recorded below. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Live Core, callers, docs, plans, release prose, and call-chain inventory read | Decide |
| Decide | completed | One terminal consumer configuration with extension-first definition ownership selected | Execute |
| Execute | completed | Core law, package/registry adoption, docs, audits, changeset, and changelog implemented | Prove and hand off |
| Prove and hand off | completed | Complete 45-package shared gate, stable Browser proof, clean autoreview, and final evidence recorded | User review |

Decision brief:
- outcome: Package/plugin authors define behavior with `.extend*`; apps and
  copied registry kits apply at most one terminal `.configure(...)`.
- chosen shape: keep object and contextual configure inputs, return a terminal
  configured descriptor, reject repeat/after-config authoring at runtime, let
  deferred extensions read configured values, then apply the captured
  configuration as the final override.
- strongest rejected alternative: mechanically replace package configure calls
  with `.extend` while keeping configure-before-extend resolution. That makes
  package defaults overwrite user choices.
- consequence: configured call chains must put `.configure(...)` last; existing
  app/registry chains are reordered or consolidated in the same hard cut.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Authoring ownership | Seven exported package declarations use `.configure`; three Core installation factories also configure descriptors | Package declarations use `.extend*`; reviewed installation factories retain one configure call | Feature packages + Core | Non-widening does not mean user configuration | Media, Tabbable, DnD, Utils, Selection, Core | exact AST/source audit and package checks | Misclassifying an install-time owner | rearchitect |
| Consumer cardinality | Public types/runtime/docs accept arbitrary configuration layers | One object or contextual configure call per descriptor; configured result is terminal | Plate Core | One obvious customization owner and no hidden middleware stack | all TS/JS/docs callers | type-negative, runtime-negative, audit | Widened types erase the terminal marker | hard cut plus runtime guard |
| Resolution precedence | All configure layers run before deferred extensions, so package extensions win overlaps | Evaluate one configure result, expose its values to extensions, then reapply it once as final override | Plate Core resolver | Extensions need configured options but users own final values | heading/list/contextual owners and seven migrated packages | focused resolver behavior tests | duplicate input rules or callback evaluation | rearchitect |
| Contextual configuration | Callback configure is public and non-widening | Keep callback form for consumer values/handlers/render/shortcuts, but only once and terminal | Plate Core | Registry consumers genuinely need editor context | Copilot, Block Selection, Tabbable kits | type/runtime/www/browser | Model-field admission | keep narrowed |
| Docs/release doctrine | Guide/changeset teach layers; API reference still teaches object-only | One current-state author-vs-consumer grammar across EN/CN docs, changeset, registry changelog, plans, and VISION | Docs/release owners | Current public contract must be learnable | all matching current surfaces | exact text audit, docs build/check | historical plans mistaken for current | rearchitect |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Core TDD law | Core types/runtime/tests | Add failing terminal-cardinality and precedence contracts, then implement singular public behavior | Accepted target | Red tests fail for expected old behavior; green proves final override and rejection | focused Core tests + type contracts |
| 2. Package adoption | Feature packages + Core | Convert seven package declarations to `.extend`; retain three installation configure calls | Core law green | Zero production package-definition configure calls | source audit, focused typechecks/tests |
| 3. App/docs/release adoption | Registry/docs/plans/VISION/release | Put configure last, consolidate repeat calls, align current doctrine and artifacts | Package grammar stable | Zero stale layered doctrine and valid copied kit source | www typecheck/docs checks/changelog checks |
| 4. Closure | Core + www | Lint, `check:core`, Browser, autoreview, plan checker | All implementation slices green | Every required gate passes with zero accepted findings | root/package/docs/browser/review gates |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| A configured descriptor cannot be configured or extended again | Current return types retained every method and runtime appended layers | Type-negative contracts plus untyped runtime throws pass | passed |
| Package extensions see configured options | Previous configure-before-extend context exposed them | Focused extension callback observes the configured value | passed |
| Consumer configuration wins overlaps | Previous deferred extension overwrote configured fields | Captured configuration is reapplied once; final-options and input-rule replacement rows pass | passed |
| Package definitions never consume configure | Seven exact production declarations found; three installation factories classified | schema-adoption audit passes with only the two actual Core owner files permitted | passed |
| Registry behavior remains usable | Playground installs Block Selection and copied kits | Fresh Browser render, configured-wrapper counts, editor focus, HTTP 200 responses, and screenshot pass | passed |

Conditional evidence:
- High-risk scenarios: extension callbacks fail to see user options; extension
  output silently overwrites user config; input rules duplicate during the
  two-phase merge; configured marker disappears through Base-to-Plate wrapping.
- External research: N/A; current local API/source and the accepted user
  correction fully determine the target.
- Issue/PR provenance: N/A; direct user-requested current-tree architecture fix.
- Docs/registry/browser/release/behavior-law owners: all apply; current EN/CN
  docs, registry kit grammar, existing Core changeset, VISION, tooling audits,
  and Browser proof are included.

Findings:
- `configure` currently appends every object/callback to
  `__configurationLayers`; Core tests explicitly require four layers.
- The completed contextual-configure plan says repeated calls replace matching
  layers, but implementation, guide, and changeset instead accumulate them.
- Seven exported production package declarations consume `.configure`; the
  three remaining production package calls are Core installation factories
  applying caller settings.
- Four current app call chains continue authoring after configure and one
  Tabbable kit calls configure twice; these need same-slice adoption when the
  configured descriptor becomes terminal.
- The API reference already teaches contextual definition through `.extend`,
  while the plugin-methods guide and Core changeset teach contextual configure
  layers.

Decisions and tradeoffs:
- Keep callback configure because app-owned kits need editor context; cardinality
  and ownership, not callback syntax, are the defect.
- Keep internal configuration storage compatible with nested
  `configurePlugin` until focused evidence justifies changing that separate API;
  direct `.configure` is enforced as one terminal consumer step.
- Use a terminal configured descriptor type plus runtime guard. Type erasure
  cannot be allowed to reopen authoring in JavaScript or widened TypeScript.
- Reapply the already-evaluated configuration result after extensions; never
  evaluate a contextual configure callback twice.

Review fixes:
- Rejected a whole-descriptor deep snapshot at `.configure(...)`: it would
  destroy nominal plugin references and opaque host resources. Model identity
  is captured at configure time; the full graph remains snapshotted by the
  publication owner.
- Accepted input-rule replacement finding: terminal configuration now replaces
  or clears prior input rules instead of being compiled as an additive layer.
- Accepted callback-cardinality finding: source descriptor identity is cached
  per editor so a configured descriptor reached as both dependency and root
  evaluates its callback once.
- Accepted same-key merge finding: duplicate descriptors preserve Plite editor
  extensions as well as API, selector, and transaction extensions.
- Final scoped autoreview: clean, zero accepted actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Package-local Bun runs missed the root preload | 1 | Invoke the focused specs through the root test contract | Focused package suite passed 30/30. |
| Utils export inference produced TS4023 | 1 | Type the true exported boundary, not callback locals | `TrailingBlockPlugin` uses its public `BasePlugin` boundary; Utils build passed. |
| Broad Turbo typecheck surfaced unrelated AI declarations | 1 | Use owning package checks and the shared Core gate | Owning checks passed; unrelated branch-wide AI errors were excluded. |
| Browser app graph lost Media barrels/imports during proof | 2 | Run barrels once, then stop editing the separately owned package | `pnpm brl` passed; after Media reached a green snapshot, fresh app proof passed without module errors. |
| Fresh `check:core` reached concurrent Media type errors | 1 | Retry only after Media source movement stops | Retry passed all 45 reviewed packages and the complete test matrix; no Media files were changed by this packet. |

Verification evidence:
- Core focused runtime/type suite: 108 tests passed, 0 failed, 258 assertions
  across resolver, multi-plugin resolution, Base authoring, and Base-to-Plate
  wrapping owners.
- Package adoption suite: 30 tests passed, 0 failed, 75 assertions across the
  seven migrated package definitions and related registry behavior.
- Core package typecheck and test-contract runner passed after the final
  input-rule, callback-cache, and editor-extension merge repairs.
- Core package lint passed; root `pnpm lint:fix` also passed with only the known
  large coverage-manifest warning.
- `check-plate-schema-adoption.mjs` passed across 4,741 source/docs files;
  `check-plate-doc-code-contracts.mjs` passed across 366 docs.
- `pnpm --filter www check:docs` passed its source build and EN/CN parity
  checks; the earlier `www` typecheck passed before Media began moving files.
- `pnpm changeset status` passed with the Core major release; registry
  changelog generation check passed with 26 events.
- `pnpm brl` passed all 56 packages when run; the separate Media task continued
  changing its exported layout afterward.
- Fresh `pnpm check:core` passed runner contracts, source/docs audits, 45
  reviewed-package typechecks and lints, Core/Plite generic contracts, and the
  complete Core/Plite/reviewed-package test matrix.
- Fresh Browser proof returned HTTP 200 for `/blocks/playground-demo` and
  `/blocks/block-menu-demo`, rendered 101 and 8 blocks respectively, found one
  configured context-menu wrapper on each route, focused the editor, and
  captured the complete playground UI.
- Browser console inspection found only the pre-existing random table-cell ID
  hydration mismatch; no request, module, or configure-scope runtime error
  occurred.
- Final autoreview exited clean with zero accepted actionable findings.
- Final plan-completion checker passed.

Final handoff prepared:
- Ownership and target API: plugin/package authors own `.extend*`; one app or
  registry consumer owns the terminal object or contextual `.configure(...)`.
- Public breaks and adoption: repeat configure, clone, component wrapping, and
  every extend variant after configure are type- and runtime-invalid; all
  in-scope package and registry callers were reordered or consolidated.
- Applicable runtime/package/docs/browser decisions: consumer values are
  visible to deferred extensions and reapplied once as final values; EN/CN docs,
  VISION, plans, changeset, and registry changelog teach that same grammar.
- Proof and execution risks: focused and shared
  Core/package/type/docs/release/browser/review gates pass; no accepted
  configure-scope risk remains.
- Execution order and user attention: no API or proof choice remains.

Timeline:
- 2026-07-23T10:35:42.417Z Plate Plan created.
- 2026-07-23 user accepted the review and authorized the full one-shot hard cut.
- 2026-07-23 live call-chain AST found 408 configure calls and 22 immediate
  post-config method chains; bounded production ownership audit found seven
  package-definition calls and three Core installation calls.
- 2026-07-23 Core TDD law, package/registry adoption, EN/CN docs, current
  doctrine, release artifacts, mechanical audits, focused proof, and final
  autoreview completed.
- 2026-07-23 fresh shared closure reached only the independently active Media
  colocation; Browser likewise became unavailable after Media HMR removed
  imports/barrels during the run.
- 2026-07-23 Media reached a green snapshot; the complete 45-package Core gate
  and fresh two-route Browser proof passed.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Complete |
| Where am I going? | User review |
| What is the goal? | One terminal consumer configure; package authoring uses extend |
| What have I learned? | Source-identity caching and final input-rule replacement are required for honest one-call semantics |
| What have I done? | Implemented and adopted the hard cut, documented/released it, proved focused owners, and closed autoreview |

Open risks:
- No accepted configure-scope implementation risk remains.
- The playground still emits the pre-existing random table-cell-ID hydration
  mismatch; it is unrelated to plugin configuration and was not widened into
  this packet.
