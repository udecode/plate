# restore base plugin component ownership

Objective:
Restore Base plugin component ownership; done when native Base authoring,
static/live rendering, adoption, doctrine, release evidence, and focused proof
all pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-31-restore-base-plugin-component-ownership.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- docs
- agent-native
- browser
- package-api

Mode:
- `standard` accepted-plan execution; the user explicitly approved the target
  with "ok go" after the source-backed API verdict.

Completion threshold:
- `createBasePlugin({ component })` compiles and renders through static and live
  Plate paths; Base `.configure({ component })` remains the replacement path.
- Every terminal consumer conversion used only to bind `component` is removed;
  owning React adapters remain when they publish a reusable Plate descriptor or
  add genuine Plate-only behavior.
- Core, affected package/app typechecks and focused tests pass; the Find Replace
  registry route renders without new console/network errors.
- Best API/Vision/Plate Next worker doctrine agrees, generated skills are in
  sync, the Plate Next doctrine version is bumped, release evidence is present,
  autoreview has zero accepted actionable findings, and `check-complete` passes.

Verification surface:
- Core compile-only and runtime tests for constructor/configure component
  binding, static HTML rendering, and live Plate publication.
- Scoped `toPlatePlugin` caller audit across Core and `apps/www`.
- `pnpm check:core`, affected package/www typechecks, generated-skill validation,
  Plate Next version validation, changeset validation, Biome/diff checks.
- Browser proof at the standalone Find Replace registry demo route.

Constraints:
- The user accepted execution in chat; continue without another plan-approval
  pause.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.
- Preserve static/RSC rendering and live React rendering; do not make a client
  component universal or move hooks into Base.
- Preserve unrelated shared WIP and do not message or delegate to other tasks.

Boundaries:
- In scope: Base/Plate component authoring types/runtime/tests, affected
  component-only adapters, Find Replace registry adoption, source doctrine,
  generated skills, Vision, release note, and focused browser proof.
- Source owners: `packages/core`, affected feature/app callers,
  `.agents/rules/best-api.mdc`, `.agents/rules/plate-next.mdc`, related worker
  doctrine, `VISION.md`/`docs/vision/plate.md`, and Plate Next versions.
- Non-goals: no change to hooks, DOM/runtime event ownership, unrelated plugin
  APIs, unrelated registry composition, or raw Plite extension shape.
- Direct Plite boundary owners: N/A; component publication/rendering is Plate
  Core product/runtime behavior over an unchanged Plite descriptor substrate.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Stop only if Base-native component binding cannot preserve both static and
  live runtime behavior without changing raw Plite, or the required browser
  route cannot be exercised after exhausting the documented local path.

Plate Plan state:
- status: complete
- phase: prove-and-hand-off
- next: none
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | User correction captured: static/RSC rendering needs the native `component` field; approved implementation with "ok go". |
| Active goal and plan verified | yes | Active goal objective names this exact plan and binary outcome. |
| Current owners read | yes | Read Core Base/Plate input/runtime/tests, static renderer tests, Find Replace caller, root/common/Plate Vision, and all affected source rules. |
| Best API target resolved | yes | Native Base `component`; direct Base `.configure({ component })`; `toPlatePlugin` only when Plate-only capabilities are added. |
| Mode and execution boundary resolved | yes | Standard one-shot execution explicitly authorized by the user. |
| Docs pack selected | yes | Public plugin-method and Core API references, affected Comment examples, plus durable Vision doctrine. |
| `docs-creator` loaded | yes | Loaded before editing `content/**`; current-state reference voice and source-backed snippets applied. |
| Docs lane selected | yes | Existing public reference pages plus the smallest relevant Vision owner. |
| Target docs and nearest sibling docs read | yes | Read EN/CN plugin-method, Core API, Comment pages, `VISION.md`, `docs/vision/common.md`, and `docs/vision/plate.md`. |
| Docs style doctrine read | yes | `docs-creator` and repo docs rules loaded; no changelog voice in reference docs. |
| Documented source owner identified | yes | Live Core builders/tests own API truth; root `VISION.md` and `docs/vision/plate.md` own durable doctrine. |
| Agent-native pack selected | yes | Best API and Plate Next reusable rules are stale. |
| Agent-facing action surface identified | yes | Base/Plate component ownership and adapter decision during plugin authoring/review. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**`; regenerate `.agents/skills/**` with `pnpm install`; never hand-edit mirrors. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded and used to audit route, proof, and generated-source ownership. |
| Browser pack selected | yes | `apps/www` Find Replace registry example is an affected teaching/runtime surface. |
| Browser route / app surface identified | yes | Standalone Find Replace demo route; resolve exact route from registry metadata before launch. |
| Browser tool decision recorded | yes | Use Browser for normal route/DOM/console proof. |
| Console/network caveat policy recorded | yes | New errors block closure; unrelated existing warnings are recorded exactly. |
| Package/API pack selected | yes | `@platejs/core` public plugin authoring input changes. |
| Public surface or package boundary identified | yes | `BasePluginDefinitionInput`, constructor runtime normalization, component publication. |
| Release artifact path selected | yes | Package changeset required for published `@platejs/core` authoring/API behavior. |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded; repaired the existing Core-major migration owner instead of adding a duplicate. |
| Barrel/export impact decision recorded | yes | No exported file move/add/remove planned; run `pnpm brl` only if the live diff changes exports. |

Work Checklist:
- [x] Restore `component` to native `createBasePlugin()` authoring without widening terminal `.configure()` or exposing `render.node`.
- [x] Prove constructor-defined and configured components publish identically to static and live renderers.
- [x] Audit every scoped `toPlatePlugin` caller; remove terminal consumer conversions whose only job is component binding and preserve owning adapters with genuine Plate-only contributions.
- [x] Replace the Find Replace demo adapter with direct `FindReplacePlugin.configure({ component, initialState })` and prove its standalone route.
- [x] Run `best-api repair`: patch source rule, smallest Vision owner, contradictory worker wording, Plate Next doctrine version, generated skill mirrors, and agent-native review.
- [x] Repair the existing Core-major changeset and verify release wording describes only the final current API.
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | Native Base component path, adoption, doctrine, release, and focused proof complete. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Final scoped searches found no terminal component-only conversion or contradictory current doctrine. |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | Accepted split implemented: constructor default, configure replacement, extend rejection, private render slot. |
| Conditional risk and adoption | yes | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | Static/live paths and affected docs/app callers covered; no external provenance applies. |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Exact commands and counts recorded below. |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Final handoff section complete. |
| Autoreview | yes | Run for implementation changes or record planning-only N/A | Final run completed; its sole P1 is rejected as unrelated shared AI-kit rename/generated-registry WIP outside this packet. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-31-restore-base-plugin-component-ownership.md` | Passed after recording all closure evidence. |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | All snippets use current exported factories/descriptors and match tested constructor/configure behavior. |
| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names or record N/A | No new links/anchors/previews; all three affected docs routes render. |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | `build:source` and `check:docs` pass. |
| Plugin page specifics | yes | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | Existing guide/API/plugin pages repaired in place; no new kit/manual surface. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` regenerated mirrors; source/generated text parity and Plate Next v36 validate. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Best API, Plate Next, creator, UI, and docs owner rules all expose the constructor/configure/adapter decision. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Review passed with no route/proof/source-ownership finding. |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Find Replace route loaded; query `text` produced two highlights and `decorations` produced one. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Clean-load capture: 128 responses, zero HTTP failures/loading failures, zero console warnings/errors. |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | Browser screenshot visually confirmed `decorations` highlight; three docs routes rendered. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Core public input and builder tests cover Base/Plate paths; no export topology changed. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published Core API/runtime behavior within the existing v54 major migration. |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | Existing `.changeset/plugin-portal-scoped-api.md` repaired; `changeset status --since=origin/main` passes with Core major. |
| Registry changelog | yes | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: registry adoption demonstrates a published Core API delta already owned by the Core changeset. |
| No release artifact | yes | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: published Core delta has an existing changeset. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Core typecheck 10/10; focused Core 44/44; www typecheck 57/57; static integration 5/5. |
| Barrel/export generation | yes | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no public file, barrel, or export layout changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Live owners, docs, doctrine, callers, and release owner audited | Decide |
| Decide | completed | Native Base component shape accepted and implemented | Prove and hand off |
| Prove and hand off | completed | Runtime/type/docs/checker/browser proof green; autoreview has zero accepted in-scope findings | Close goal |

Decision brief:
- outcome: Base plugins own ordinary node components for static/RSC and live
  Plate rendering without a mandatory React adapter.
- chosen shape: `createBasePlugin({ component })` for author defaults and
  `BasePlugin.configure({ component })` for terminal replacement;
  `toPlatePlugin(BasePlugin, {...})` only when the adapter adds Plate-only
  authoring such as hooks/live event context, and it may colocate a component
  with those genuine additions.
- strongest rejected alternative: keep constructor rejection and force
  `toPlatePlugin(...).configure({ component })` for live callers.
- consequence: normalize Base constructor `component` into the same private
  `render.node` publication slot; simplify Plate factory lowering; remove
  component-only adapter noise and contradictory doctrine.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Base component authoring | Constructor rejects `component`; terminal configuration accepts it | Constructor and terminal configuration both accept ordinary `component`; `.extend()` still rejects replacement | Core Base plugin builder | Static/RSC and live renderers consume the same compiled component slot | Core types/runtime/tests and direct callers | Compile-only, resolve/publication, static HTML, live browser | Accidentally exposing `render.node` or widening `.configure()` | rearchitect |
| Plate factory lowering | Strips `component` from Base and re-adds it through the React adapter | Let Base normalize `component`, then lift the complete descriptor | Core Plate plugin builder | Plate should build on Base instead of special-casing a Base-owned render field | Internal simplification; no call-site break | Existing Plate constructor/configure tests | Descriptor marker loss during merge | rearchitect |
| Component-only caller | Find Replace calls `toPlatePlugin(...).configure({ component })` | Direct `FindReplacePlugin.configure({ component, initialState })` | Registry example | Adapter adds no Plate-only capability | Remove import/call | www typecheck and standalone route | Duplicate membership through EditorKit | cut |
| Reusable doctrine | Vision and four worker rules call Base constructors renderer-neutral | Base constructors are server-capable render owners; adapters are for Plate-only authoring | Best API + Plate Vision; workers link/apply | Current doctrine caused the regression | Repair source rules, bump doctrine, regenerate mirrors | source audit, version validation, agent-native review | stale generated mirrors or old version fingerprint | rearchitect |
| Release prose | Existing Core changeset teaches the rejected restriction | Teach native Base `component` and direct configuration; adapters require a real Plate-only job | `.changeset/plugin-portal-scoped-api.md` | Delta must be relative to main, where Base plugin components already exist | Repair existing changeset; no duplicate file | changeset audit | branch-relative migration prose | rearchitect |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1 | Core | Base input/runtime, Plate lowering, type/runtime/static tests | Target API locked | Component publishes identically from Base constructor/configure and Plate constructor | Focused Core tests + typecheck |
| 2 | Adoption | Find Replace and component-only static integration callers | Core proof green | No unnecessary adapter in scoped callers | source audit + www typecheck |
| 3 | Doctrine/release | Best API, Vision, Plate Next/creator/UI, versions, existing changeset | Source shape final | No contradictory rule; mirrors/version valid | `pnpm install`, version validation, source audit |
| 4 | Closure | browser, lint, review, plan | All edits final | Route green, no accepted findings, checker passes | Browser + Biome/diff + autoreview + checker |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Base already owns static component publication | `BasePluginConfiguration` accepts `NodeComponent`; static renderer reads compiled components | Constructor/configure runtime and static HTML tests | pass |
| Live Plate accepts configured Base descriptors | `createPlateEditor` docs and shared resolver consume `BasePluginInput` | live publication test and Find Replace browser route | pass |
| Adapter is unnecessary for terminal component binding alone | Base constructor/configure normalize to the same private slot | scoped caller audit and direct-call typecheck | pass |

Conditional evidence:
- High-risk scenarios: constructor component lost during normalization; terminal
  replacement loses precedence; static HTML works but live publication fails.
- External research: N/A; live local Core is authoritative.
- Issue/PR provenance: N/A; user-directed current-tree correction.
- Docs/registry/browser/release/behavior-law owners: Plate Vision, generated
  agent rules, Find Replace standalone demo, existing Core migration changeset.

Findings:
- `BasePluginDefinitionInput` explicitly sets `component?: never`, while
  `BasePluginConfiguration` accepts `NodeComponent` and describes static use.
- `createBasePlugin` rejects root `component`, yet Base author fields already
  include React/static render callbacks and Core static renderers publish
  `render.node` through one compiled component map.
- `createPlatePlugin` strips `component`, builds Base, then re-adds the same
  private slot through `toPlatePlugin`; this is redundant lowering.
- The Find Replace adapter adds only `component` and terminal `initialState`;
  direct Base configuration is sufficient.
- `origin/main` already exposes a Base plugin component field, so release prose
  must describe the final v54 authoring shape rather than invent a new API.

Decisions and tradeoffs:
- Keep `component` out of the normalized capability definition witness: it is
  render publication data, not an inferred editor API capability.
- Keep `.extend({ component })` rejected: constructor owns the default and
  terminal `.configure()` owns consumer replacement.
- Preserve `toPlatePlugin` component support when the same adapter also adds a
  genuine Plate-only contribution; delete only adapter-only ceremony.

Review fixes:
- Accepted stale-checker finding: the schema/docs adoption guards still rejected
  native Base constructor components. Repaired both checker owners and their
  contract tests to accept constructors, reject Base `.extend({ component })`,
  and reject terminal consumer `toPlatePlugin(...).configure({ component })`.
- Agent-native review found no missing route, proof, or source-of-truth owner.
- Final implementation autoreview reported one P1 at
  `apps/www/src/registry/components/editor/plugins/ai-kit.tsx`: generated
  registry payloads still reference a renamed `AIChatKitPlugin` export. Rejected
  for this packet because neither the AI rename nor CI-owned generated registry
  artifacts belong to Base-component ownership; no in-scope finding remained.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| `normalizeComponent` inferred a union wider than `PluginRecord` | 1 | Repair the private helper return type at the owner | Core typecheck passes without callback casts. |
| Bun interpreted the app test path as a package name | 1 | Prefix the repository path with `./` | Static integration test passes 5/5. |
| Browser wait helper did not support `networkidle` | 1 | Capture CDP network events and paginate the event log | Clean-load network proof recorded: 128 responses, zero failures. |
| Core checker encoded the rejected Base-constructor ban | 1 | Update the checker contract to the accepted API split | Checker contracts pass 67/67; no component-related `check:core` failure remains. |
| Root `pnpm check:core` reaches unrelated shared schema-lineage failures | 1 | Preserve shared WIP and prove the exact component lane independently | Only named schema-lineage fixtures fail; all component gates are green. |
| Root Plite-doc checker reaches unrelated `isMarkableVoid` docs WIP | 1 | Preserve shared WIP and run the exact repaired checker contracts | Only named schema docs fail; component rule contracts pass. |
| Root `pnpm lint:fix` reports 216 unrelated diagnostics | 1 | Run exact-file Biome after preserving unrelated files | All 16 in-scope source/docs/tooling files are clean. |

Verification evidence:
- `bun test packages/core/src/lib/plugin/createBasePlugin.spec.ts packages/core/src/react/plugin/createPlatePlugin.spec.ts packages/core/src/react/plugin/toPlatePlugin.spec.ts packages/core/src/static/renderStaticHtml.node-props.spec.ts packages/core/src/internal/plugin/compilePlateModel.spec.ts packages/core/src/lib/editor/withPlite.slow.ts`: 44 passed, 0 failed.
- `bun test ./apps/www/src/__tests__/package-integration/core-static-html/serialize-html.render.slow.tsx`: 5 passed, 0 failed.
- `node --test tooling/scripts/check-plate-schema-adoption.test.mjs tooling/scripts/check-plite-docs.test.mjs`: 67 passed, 0 failed.
- `pnpm turbo typecheck --filter=./packages/core`: 10/10 tasks passed.
- `pnpm turbo typecheck --filter=./apps/www`: 57/57 tasks passed, including registry source/docs parity.
- `pnpm --filter www build:source && pnpm --filter www check:docs`: passed.
- `pnpm changeset status --since=origin/main`: passed; Core remains major, no forbidden minor.
- `node .agents/rules/plate-next/scripts/version.mjs fingerprint` returns `sha256:2e18a081b5803485d37d5b5b1c893937af277ab01118cf4e83c9e8c93f27b454`; `validate` passes Plate Next v36 with 42 active and 1 retired package rows.
- Exact-file `pnpm exec biome check --write ...`: 16 checked, no fixes; `git diff --check && git diff --cached --check`: passed.
- Browser `/blocks/find-replace-demo`: `text` -> two visible highlights; `decorations` -> one correct highlight; clean reload 128 responses, zero HTTP/loading failures, zero console warnings/errors.
- Browser `/docs/plugin-methods`, `/docs/api/core/plate-plugin`, and `/docs/comment`: all render with HTTP 200 and no console errors.
- `pnpm check:core` remains blocked only by unrelated shared named-schema lineage fixtures in editor/yjs docs/tests. `check-plite-docs.mjs` remains blocked only by unrelated shared `isMarkableVoid` docs WIP.

Final handoff prepared:
- Ownership and target API: Base constructor owns default `component`; terminal
  `.configure()` replaces it; Base `.extend()` and public `render.node` reject it.
- Public breaks and adoption: terminal component-only conversion removed from
  Find Replace; Version History keeps its genuine `render.aboveNodes` adapter
  and colocates `component` in that adapter definition.
- Applicable runtime/package/docs/browser decisions: Core normalizes one private
  render slot used by static/RSC and live Plate; public EN/CN references,
  doctrine, generated skills, and existing Core-major release prose agree.
- Proof and execution risks: focused type/runtime/static/docs/checker/browser
  proof is green; repo-wide red rows are exact unrelated shared schema WIP.
- Execution order and user attention: implementation is complete; no user
  decision remains and no git mutation was requested.

Timeline:
- 2026-07-31T14:56:19.803Z Plate Plan created.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Complete |
| Where am I going? | Close the goal and hand off |
| What is the goal? | Restore native Base component ownership across static and live rendering |
| What have I learned? | See Findings |
| What have I done? | Implemented Core, adopted callers, repaired docs/doctrine/release/checkers, and proved static/live/browser paths |

Open risks:
- Broad no-op React wrapper cleanup is not automatic: a public `/react`
  descriptor can remain an authoring extension point. This packet removes only
  adapters whose active call site adds no Plate-only capability.
