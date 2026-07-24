# Plate full inferred editor API

Objective:
Restore the full inferred Plate editor API; done when installed plugin APIs are
available and discoverable at `editor.api.<pluginKey>`, scoped portals remain
typed, adoption and proof pass, and this plan closes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-24-plate-full-inferred-editor-api.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- docs
- agent-native
- package-api

Mode:
- `standard` accepted-plan execution.

Completion threshold:
- `editor.api.table`, `editor.api.link`, `editor.api.suggestion`, and every
  other installed plugin API are inferred under their plugin key.
- `editor.plugin(FooPlugin).api` remains the exact generic/package portal and
  resolves to the same immutable API object as `editor.api[FooPlugin.key]`.
- Explicit editor-level APIs such as `markdown`, `footnote`, core DOM,
  clipboard, React, navigation, and debug remain available without duplicated
  implementations.
- A large `EditorKit` type fixture proves explicit access and enumerable
  `keyof` coverage; focused runtime/type/package/www/docs/browser gates pass.
- Stale scoped-only teaching and `editor.plugin(Foo).editor.api.*` migration
  prose have zero current-source/docs matches outside historical material.
- Best API, Plate Vision, active related plans, docs, and release prose agree;
  `check-complete` passes with zero accepted P0/P1 review findings.

Verification surface:
- Core compile-only contracts for direct, dependency-installed, React-converted,
  configured, disabled, replaced, and large-kit plugin APIs.
- Core runtime tests for namespace publication, object identity, explicit
  editor API coexistence, collision diagnostics, immutability, and replacement.
- Source-first Core and affected feature package typechecks/tests; www
  typecheck/docs validation; Changeset and zero-match audits; lint/diff checks.
- Browser `/blocks/table-demo` plus one full editor route: query through
  `editor.api.table`, normal table interaction, zero API/publication errors,
  and an explicit record of unrelated baseline diagnostics.
- Agent-native source/generated sync and review.

Constraints:
- The user accepted execution with `ok go` on 2026-07-24.
- No public compatibility aliases or runtime shims.
- `editor.api` is the normal app discovery surface; plugin portals remain for
  generic package components, plugin options/state/type, and exact scoped use.
- Document mutations stay under `editor.update`; API publication must not
  create a second mutation channel.
- Do not duplicate one API implementation through both `.extendApi()` and
  `.extendEditorApi()`.
- Preserve immutable publication, deterministic plugin resolution, terminal
  configuration, dependency inference, and flat Plite extensions.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.

Boundaries:
- In scope: Core API inference/publication/portal types; feature API adoption;
  current EN/CN docs, registry/apps callers, Changesets, Best API and Plate
  Vision doctrine, and the related child-composition plan correction.
- Source owners: `packages/core`, feature packages using `.extendApi()` or
  `.extendEditorApi()`, `apps/www`, `content/docs`, `.changeset`,
  `.agents/rules/best-api.mdc`, and `docs/vision/plate.md`.
- Non-goals: redesign plugin dependencies/default composition, behavior
  profiles, Plite editor semantics, or unrelated package cleanup.
- Direct Plite boundary owners: type-provider composition only if Core cannot
  materialize the inferred API without a generic Plite fix; no Plite runtime
  publication change is expected.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Block only if three distinct Core type/publication approaches prove the full
  API cannot remain enumerable and sound without changing Plite public
  semantics, or browser proof cannot run after owner-level environment repair.

Plate Plan state:
- status: completed
- phase: prove and hand off
- next: user review
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Full inferred root API, scoped generic portal, no manual duplication, autocomplete/AX repair, doctrine/plan repair, and execution/proof are recorded above. |
| Active goal and plan verified | yes | Active goal objective names this exact plan and the full-editor API completion threshold; created and re-read on 2026-07-24. |
| Current owners read | yes | `pluginRuntimeTypes.ts`, `resolvePlugins.ts`, `extendApi` runtime/tests, `EditorKit`, Table/Link/Suggestion/Markdown/Footnote API owners, docs, and portal Changeset read on 2026-07-24. |
| Best API target resolved | yes | User accepted automatic namespaced full-editor publication plus the exact scoped portal escape path. |
| Mode and execution boundary resolved | yes | One-shot execution explicitly authorized by `ok go`. |
| Docs pack selected | yes | Current EN/CN plugin/editor/API docs and package examples change. |
| `docs-creator` loaded | yes | Read `.agents/skills/docs-creator/SKILL.md` completely on 2026-07-24. |
| Docs lane selected | yes | Existing API/guides adoption; no new docs section family. |
| Target docs and nearest sibling docs read | yes | Read the EN/CN editor, plugin-methods, API, and affected plugin pages before repair; final source audit found and fixed one remaining scoped-only English table row. |
| Docs style doctrine read | yes | Current-state voice, source-backed API examples, API-reference lane, and browser/content proof rules recorded. |
| Documented source owner identified | yes | Core `extendApi`/editor API publication and feature plugin descriptors. |
| Agent-native pack selected | yes | Best API reusable doctrine changes. |
| Agent-facing action surface identified | yes | `.agents/rules/best-api.mdc` is source; generated `.agents/skills/best-api/SKILL.md` is mirror. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**`, never generated skills; regenerate with `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Read `.agents/skills/agent-native-reviewer/SKILL.md` completely on 2026-07-24. |
| Package/API pack selected | yes | `@platejs/core`, `platejs`, and feature package public API/type behavior changes. |
| Public surface or package boundary identified | yes | `editor.api`, `editor.plugin(...).api`, plugin authoring API publication, and inferred `MyEditor`. |
| Release artifact path selected | yes | Repair `.changeset/plugin-portal-scoped-api.md` and affected package release coverage. |
| `changeset` skill loaded when `.changeset` is required | yes | Read `.agents/skills/changeset/SKILL.md` completely on 2026-07-24; release truth stays relative to `main`, one package per file, and no Core `minor`. |
| Barrel/export impact decision recorded | yes | No new exported files expected; run `pnpm brl` only if the implementation changes exports/layout. |

Work Checklist:
- [x] Publish every installed non-empty `.extendApi()` result at
      `editor.api[plugin.key]`, including direct, dependency-installed,
      React-converted, configured, and same-key replacement descriptors.
- [x] Keep `editor.plugin(FooPlugin).api` fully typed for generic/package code,
      options/state/type ownership, and exact descriptor access.
- [x] Prove `editor.api[FooPlugin.key] === editor.plugin(FooPlugin).api` and
      preserve frozen API publication.
- [x] Preserve explicit editor APIs from `.extendEditorApi()` including
      `markdown`, `footnote`, DOM, clipboard, React, navigation, and debug.
- [x] Keep document mutations under `editor.update.*`; add no competing root
      mutation namespace.
- [x] Do not duplicate a feature implementation across `.extendApi()` and
      `.extendEditorApi()`.
- [x] Materialize the final inferred API type so large-kit IntelliSense and
      `keyof MyEditor['api']` enumerate installed plugin keys.
- [x] Define and test deterministic plugin-key/API collision behavior instead
      of silently overwriting an explicit editor API.
- [x] Omit empty and disabled plugin API namespaces and honor final same-key
      replacement ownership.
- [x] Keep the hard cut: no compatibility aliases, `getApi` resurrection, or
      canonical `editor.plugin(Foo).editor.api.foo` path.
- [x] Adopt `editor.api.<key>` in app/registry code that owns a concrete
      inferred editor; retain scoped portals where consumer editor capability
      is intentionally generic.
- [x] Add compile-only and runtime red contracts before implementation, then
      make the smallest owning Core change.
- [x] Repair current EN/CN API, guide, plugin, and migration prose; teach the
      root full-editor path first and the scoped generic path second.
- [x] Repair `.changeset/plugin-portal-scoped-api.md` and classify every
      affected published package relative to `main`, one package per changeset.
- [x] Update `.agents/rules/best-api.mdc`, the smallest Plate Vision owner, and
      contradictory worker doctrine; regenerate mirrors with `pnpm install`.
- [x] Repair only conflicting API claims in the active child-composition plan;
      do not reopen dependencies/plugins/behavior-profile design.
- [x] Verify Core and affected package types/tests, www types/docs, lint/diff,
      zero-match audits, agent-native parity, Browser routes, and plan closure.
- [x] Do not change Plite runtime publication, exported file layout, package
      kits, dependency/default composition, or unrelated shared WIP.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | Core contracts, 89 focused runtime tests, Link/AI/Docx types, and the complete www source/docs/type graph pass. The package-wide Core command is separately red only in shared child-composition test owners listed under Open risks. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Final source audits rechecked Core publication, `main` migration shape, root/scoped call sites, Link key/type separation, generated mirrors, and release frontmatter. |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | Accepted dual-access shape implemented; final structured review reports no accepted or actionable findings. |
| Conditional risk and adoption | yes | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | Recursive inference, replacement, collision, docs, release, agent-native, app adoption, and Browser proof all closed; issue/PR provenance is N/A because the user directly authorized the checkout change. |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Exact commands and results are recorded under Verification evidence. |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Final handoff records source owners, public shape, proof, baseline caveats, and no remaining implementation step. |
| Autoreview | yes | Run for implementation changes or record planning-only N/A | Final `.agents/skills/autoreview/scripts/autoreview --mode local ... --no-web-search` pass: clean, no accepted/actionable findings. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-plate-full-inferred-editor-api.md` | Final checker command is the last plan gate. |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | Root plugin APIs, scoped generic portals, Markdown/HTML, Link key/type, and mutation examples match current source; the last scoped-only English table row was repaired. |
| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names or record N/A | Existing leaf routes and component preview names were preserved; Browser loaded `/blocks/table-demo` and `/blocks/playground`. |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | `pnpm --filter www typecheck` includes `build:source`, docs source parity, registry source validation, and both TypeScript projects; pass. |
| Plugin page specifics | yes | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | Affected EN/CN pages teach installed root APIs first, generic descriptor portals second, and only source-backed API/update surfaces. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` regenerated mirrors; Best API, docs-creator, Plate Next, and Plate UI source/mirror wording matches. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `AGENTS.md` routes public-shape work to `best-api`; the source rule and generated skill expose the full inferred API law and proof owner. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | PASS: user action → `best-api` route → `.agents/rules/best-api.mdc` owner → generated skill/Vision/docs → type/runtime/browser proof is complete. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Core types/runtime own publication; Link owns readable key versus serialized type; Plite runtime and exported file layout are unchanged. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published Core API/type/runtime behavior and Link descriptor identity require major release prose; app/docs adoption is downstream proof. |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | Portal, Link, Markdown, CSV, AI, Table, Suggestion, Toggle, List, and aggregate release prose reflect the final API. Structural audit passes for 17 live changed Changeset markdown files: one package each and no forbidden Core/Plite/platejs minor. |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | Not registry-only; registry edits adopt a published Core API change covered by package Changesets. |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | A release artifact is required and present because installed plugin API typing/publication changes for package users. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Core contracts and 89 runtime tests pass; Link, AI, Docx, and www typechecks pass. Full Core test-project failures are isolated to concurrent child-composition fixtures, not this lane. |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | No exported files, barrels, or public export layout changed; no barrel generation is required. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Runtime, type, feature, app, docs, release, and doctrine owners identified from live source. | Execute |
| Decide | completed | User accepted automatic plugin-key publication on the full editor API with the scoped portal retained. | Execute |
| Execute | completed | Core inference/publication, permanent contracts, concrete app adoption, Link identity, docs/release, Vision, and source rules implemented. | Prove and hand off |
| Prove and hand off | completed | Focused runtime/types, full www graph, Browser, lint/diff, Changeset, agent-native, and clean structured review evidence recorded. | User review |

Decision brief:
- outcome: A concrete `PlateEditor<Value, InferPlugins<typeof EditorKit>>`
  exposes the complete installed API graph through discoverable
  `editor.api.<key>` properties.
- chosen shape: `.extendApi()` owns one plugin API implementation; Core freezes
  it once, stores it in the scoped portal, and projects that same object into
  the root API under the resolved plugin key. `.extendEditorApi()` remains for
  intentionally editor-wide namespaces.
- strongest rejected alternative: Scoped-only feature APIs through
  `editor.plugin(FooPlugin).api`, with app code reaching explicit editor APIs
  through `editor.plugin(FooPlugin).editor.api.foo`. It protects generic typing
  by making the ordinary inferred editor incomplete and autocomplete hostile.
- consequence: Root API typing/publication grows with installed plugins, so
  Core must materialize the inferred map and reject ambiguous key collisions;
  generic package code keeps the descriptor-scoped escape path.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Plugin API type | `InferPluginApi<C>` is visible through the plugin portal but absent from `InstalledPluginApi<P>` | Map every enabled installed config key to its plugin API and materialize the merged root API | `packages/core/src/lib/editor/pluginRuntimeTypes.ts` | Full editor types should describe the editor users actually configured | Compile-only contracts plus concrete `EditorKit` fixture | Recursive inference may widen keys or degrade IntelliSense | accept |
| Plugin API runtime | `apiByPlugin[key]` stores plugin APIs while root `editor.api` receives only editor APIs | Publish the same frozen plugin API object under `editor.api[key]` | `packages/core/src/internal/plugin/resolvePlugins.ts` and runtime extension owner | One implementation, two access paths with distinct jobs | Focused runtime tests and app adoption | Collision with explicit editor API namespace | accept with explicit rejection diagnostic |
| Explicit editor APIs | `.extendEditorApi()` publishes root namespaces such as `markdown` and `footnote` | Preserve unchanged; use only for genuinely editor-wide namespaces | Existing feature/Core descriptors | Avoid duplicate implementation and preserve intentional ergonomics | Existing plus coexistence tests | Accidental merge/order regression | keep |
| Mutations | Feature transforms live under `editor.update.*` | Unchanged | Core/feature update extension owners | Query/command APIs and document mutation channels stay distinct | Type/runtime regression tests | Scope creep into transform redesign | keep |
| App call sites | Concrete apps often use `editor.plugin(Foo).api` because root lacks the feature | Prefer `editor.api.foo` where the editor type owns the installed kit; keep scoped calls in generic package code | `apps/www`, registry, feature packages | Best DX/AX without weakening reusable components | Targeted source audit and www typecheck | Blind replacement could erase generic ownership | selective adoption |
| Docs/release | Current docs and portal changeset teach scoped-only access | Root full-editor path first; scoped generic path second; no `plugin(...).editor.api` recommendation | `content/docs`, `.changeset` | Docs must match shipped source and migration truth | MDX build, docs check, zero-match audit | Historical migration prose may need before/after context | repair |
| Reusable doctrine | Best API/Plate Vision and worker wording do not encode the accepted dual-access law | Add one durable law and remove scoped-only contradictions | `.agents/rules/best-api.mdc`, `docs/vision/plate.md`, relevant `.agents/rules/*.mdc` | Prevent the same regression | Generated mirror diff plus agent-native review | Duplicated doctrine | minimal owner text |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Red contracts | Core tests | Type enumeration, runtime identity/freeze/absence/replacement/coexistence/collision | Accepted target | Focused tests fail for the intended missing behavior | Exact failing assertions/typecheck |
| 2. Core type/publication | Core runtime types and plugin resolution | Add namespaced inference and one-object publication | Red contracts | Focused Core contracts pass | Core typecheck and focused test files |
| 3. Adoption | Feature/app/registry owners | Root calls for concrete editors; scoped calls retained for generic owners | Core green | Source call sites reflect ownership law | Feature/www typechecks and focused tests |
| 4. Docs/release/doctrine | Docs, Changesets, Vision, agent rules | Current-state teaching, migration truth, durable API law | Shipped source settled | No contradictory current prose; generated mirrors synced | Docs build/check, source audits, `pnpm install` |
| 5. Closure | Browser and review owners | Runtime route proof, lint/diff, autoreview, agent-native review, plan checker | All source slices green | No accepted P0/P1; goal complete | Browser receipts and exact commands |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Full editor types enumerate installed plugin APIs | Live `InferPlugins`/`InstalledPluginApi` audit and reproduced missing autocomplete | Core direct/dependency/React/configured/disabled/replaced contracts plus permanent 20-key `EditorKit` exact-key fixture; Core contracts and www package integration pass | pass |
| Root and scoped paths share one immutable API | Live `apiByPlugin`/root publication audit | Reference identity, freeze, method-call, HTML core, and replacement assertions pass in the 89-test Core packet | pass |
| Explicit editor APIs coexist | Markdown, Footnote, and Core descriptors use `.extendEditorApi()` | Core type/runtime coexistence contracts and exact `EditorKit` key union pass | pass |
| Disabled/empty/replaced plugins do not leak namespaces | Resolver and config-tree inference are the topology owners | Focused runtime/type cases pass; serialized Link type `a` is explicitly absent from `keyof MyEditor['api']` | pass |
| Collisions cannot silently change ownership | Root editor API and plugin-key namespaces share one object | Deterministic collision diagnostic assertions pass | pass |
| Concrete registry editor exposes Table API | `EditorKit` installs Table and defines `MyEditor` | Permanent method/key fixture passes; `/blocks/table-demo` renders and accepts a table-cell edit | pass |
| Docs and agents teach the shipped shape | Current docs/changeset/rule source identified | www source/docs checks, scoped-only audit, `pnpm install`, and source/generated parity pass | pass |
| Published users receive accurate release prose | Portal changeset names the `main`-era `getApi(Plugin).namespace.method()` migration | Narrow `main` audit confirms the old shape; one-package Changeset structural audit passes | pass |

Conditional evidence:
- High-risk scenarios: recursive dependency inference, disabled descriptors,
  same-key replacements, React conversion, large-kit enumeration, runtime
  namespace collisions, frozen identity, and SSR/browser publication all apply.
- External research: N/A; this is a repo-owned public API decision already
  accepted from current Plate/Plite source and Vision, not a library comparison.
- Issue/PR provenance: N/A; the user directly reported the current-checkout
  IntelliSense regression and authorized the hard-cut implementation.
- Docs/registry/browser/release/behavior-law owners: all apply because Core,
  registry callers, current docs, release prose, and reusable API doctrine
  change. Browser proof uses `/blocks/table-demo` and one full editor route.

Findings:
- `InferPlugins<typeof EditorKit>` permits explicit access to some nested
  editor APIs but exposes an incomplete IntelliSense property list, so
  assignability alone is insufficient proof.
- `.extendApi()` output is frozen and stored by plugin key, while only
  `.extendEditorApi()` output is merged into root `editor.api`.
- Current migration prose intentionally made plugin portals the only direct
  feature-API path; that decision caused the reported AX regression.
- Existing Markdown and Footnote root namespaces are legitimate explicit
  editor APIs and do not require duplicated `.extendApi()` implementations.
- The docs worker rule itself teaches scoped-only API references and must be
  repaired alongside Best API doctrine.

Decisions and tradeoffs:
- Root `editor.api` is the canonical discovery surface for a concrete inferred
  editor. Descriptor-scoped access is an advanced ownership/type surface, not
  a second implementation.
- Plugin keys own automatic root namespaces. An explicit editor API collision
  is an authoring error, not a merge-order choice.
- Empty plugin APIs earn no root namespace.
- Exact generic package code may keep `editor.plugin(Foo).api`; app code should
  not import descriptors merely to reach an already-inferred API.

Review fixes:
- Accepted: migrate `AIPlugin` dependency access in the concrete AI kit to
  `editor.api.ai`; keep `AIChatPlugin` self access scoped because that generic
  recursive plugin context intentionally does not infer its own root namespace.
- Accepted: replace Plate UI's scoped-first rule with concrete root-first and
  generic descriptor-portal guidance, then regenerate the installed skill.
- Accepted from the final source audit: repair the remaining English
  plugin-method table rows that described `.extendApi()` as scoped-only.
- Added the permanent exact 20-key `EditorKit` compile contract after recognizing
  that a deleted temporary language-service probe would not prevent regression.
- Final structured review: no accepted or actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Goal helper used the prior UTC date and an empty move-only patch was rejected | 1 | Move while changing file content and use the local-date path consistently | Plan lives at `docs/plans/2026-07-24-plate-full-inferred-editor-api.md`; completion command corrected |
| First Changeset audit read a deleted file from the diff | 1 | Restrict the audit to live `ACMRT` markdown paths | 17 live files pass one-package and forbidden-minor checks |
| First focused Core test command used the old `lib/plugin/extendApi.spec.ts` path | 1 | Resolve the live owner with `rg --files` | Correct `lib/utils/extendApi.spec.ts` packet passes 89/89 |
| A second www dev server tried port 3111 while the repo dev owner was already active | 1 | Use the existing server reported by Next | Browser proof ran against `http://localhost:3000` |
| Review suggested root access for the AIChat plugin's own recursive context | 1 | Let the full www type graph arbitrate concrete dependency versus generic self ownership | Dependency access stays root; self access stays scoped; www passes |

Verification evidence:
- `pnpm --filter @platejs/core typecheck:contracts` → pass.
- `bun test packages/core/src/lib/plugins/html/HtmlPlugin.spec.ts packages/core/src/lib/utils/extendApi.spec.ts packages/core/src/internal/plugin/plateModelPublication.spec.ts packages/core/src/internal/plugin/resolvePlugins.spec.tsx`
  → 89 pass, 0 fail, 332 assertions.
- `pnpm --filter @platejs/link typecheck`,
  `pnpm --filter @platejs/ai typecheck`, and
  `pnpm --filter @platejs/docx-io typecheck` → pass.
- `pnpm --filter www typecheck` → MDX generation, docs source parity,
  registry source validation, app TypeScript, and package-integration
  TypeScript pass. This includes the permanent exact 20-key
  `editor-api-inference.contract.ts`.
- TypeScript 6 language-service probe against `MyEditor` returned the same 20
  enumerable completion keys before the permanent fixture replaced the
  temporary probe.
- Browser `/blocks/table-demo` → editor/table rendered and a cell changed from
  `Heading` to `HeadingAPI`; no API/accessor/runtime crash. It retains the
  existing SSR/client random `data-table-cell-id` hydration diagnostic.
- Browser `/blocks/playground` → full editor rendered; console warnings/errors:
  zero.
- `pnpm install` → agent source mirrors regenerated; direct source/mirror
  audits for Best API, docs-creator, Plate Next, and Plate UI match.
- `pnpm lint:fix` → 4,545 files checked; one unrelated existing oversized
  Wordgard manifest warning, no lint error.
- Changeset structural audit → 17 live changed markdown files, one package per
  file, no forbidden `minor` on `@platejs/core`, `@platejs/plite`, or
  `platejs`.
- Zero-match audit → no live `editor.plugin(...).editor.api`, `editor.api.a`,
  Link `key: KEYS.link`, `getType(KEYS.link)`, or Link plugin-map lookup by
  serialized type. Remaining Plate portals are generic/package/self contexts;
  Plite's `editor.getApi(extension)` is a separate valid API.
- `git diff --check` → pass.
- Final autoreview command:
  `.agents/skills/autoreview/scripts/autoreview --mode local --prompt-file docs/plans/2026-07-24-plate-full-inferred-editor-api.md --prompt 'Second pass after the two accepted findings...' --stream-engine-output --no-web-search`
  → clean, no accepted/actionable findings.
- Agent-native review → PASS: the `best-api` route, source owner, generated
  mirror, Vision/docs, exact proof commands, and handoff are discoverable.
- `pnpm turbo typecheck --filter=./packages/core` remains red in concurrent
  one-level child-composition fixtures (`pluginSourceResolution.spec.ts`,
  `createBasePlugin.typed.spec.ts`, and `PlateContent.spec.tsx`). The focused
  Core contract/runtime lane and every affected downstream package pass; this
  task did not rewrite that separate owner.

Final handoff prepared:
- Ownership and target API: Core publishes each non-empty plugin API once under
  its readable key on concrete `editor.api`; the exact plugin portal references
  the same frozen object.
- Public breaks and adoption: `editor.api.<pluginKey>` is canonical for
  concrete inferred editors; generic package/self contexts keep
  `editor.plugin(Plugin).api`; Link uses readable key `link` and serialized type
  `a`; no aliases or duplicate implementations survive.
- Applicable runtime/package/docs/browser decisions: Core and Link release
  prose, current EN/CN docs, registry adoption, Best API/Plate Vision, and agent
  worker rules agree with the final surface.
- Proof and execution risks: all lane-specific gates pass. The table demo's
  random-ID hydration diagnostic and the shared child-composition Core
  typecheck failures are recorded as separate owners.
- Execution order and user attention: implementation and closure are complete;
  the user only needs to review the final shape.

Timeline:
- 2026-07-23T23:02:21.931Z Plate Plan created.
- 2026-07-24: Accepted API target, explicit requirements, owner ledger,
  execution slices, and proof matrix locked before source implementation.
- 2026-07-24: Core/API implementation, permanent contracts, adoption,
  docs/release/doctrine repair, Browser proof, generated sync, and clean
  structured review completed.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Prove and hand off: complete |
| Where am I going? | User review |
| What is the goal? | Make the full inferred editor API complete and discoverable without weakening the exact plugin portal |
| What have I learned? | Concrete editors should expose their complete installed capability graph; generic plugin/self contexts still need exact descriptor ownership. |
| What have I done? | Implemented Core inference/publication, permanent regression contracts, selective adoption, readable Link identity, docs/release/doctrine repair, Browser proof, and clean review closure. |

Open risks:
- The table demo still generates random SSR/client table-cell IDs and reports a
  hydration mismatch. This predates and is independent of API publication.
- The shared one-level child-composition work leaves the package-wide Core test
  TypeScript project red. This lane's exact Core contracts/runtime tests and
  every affected downstream package pass.
- No API-publication risk remains open in this lane.
