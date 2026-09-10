# Kit-owned AI and DnD lifetimes

Installing `AIKit` or `DndKit` should install the feature's required React
integration. Delete routine `AIChatSession` and `DndRoot` mounts, together with
Editable state and ref plumbing that exist only to feed them.

The earlier cut removed `useHooks` but distributed its replacement across
application assemblies. This implementation changes the call shape from phase 3 of
[the September 4 hard-cut plan](./2026-09-04-plate-plite-architecture-hard-cut-audit.md#phase-3--give-dnd-and-ai-effects-explicit-component-lifetime).
Its original behavior receipts remain historical evidence.

**Status:** execution authorized by the user on 2026-09-06 ("ok go").
**Goal state:** blocked after three consecutive September 8 turns confirming
the same timing and root/WWW acceptance blockers; objective incomplete.
The September 7 blocked audit remains historical evidence.
The complete local implementation is applied: all 49 routine mounts across
23 application files are removed, with current kit, docs, registry, and doctrine
adoption. Behavior, installation, and broad Plite browser proof pass on the
recorded source. The refreshed six-consumer installation and native interactions
pass. The September 8 strict Plite aggregate passes; the latest closure matrix
passes using matching complete cached receipts for all five browser projects.
Fresh Base/Nova and Radix/Luma resize replays pass after the full-editor grid fix.
Root/WWW checks and timing acceptance still prevent completion.
All 22 scale cohorts and all 11 profiling cohorts are collected. Runtime
acceptance remains provisional because unchanged-path timing controls miss the
frozen limits. September 8 checkout checks encounter an unclassified
`PlateBlockInsertOptions` API-reference entry and unrelated formatting/lint failures. The September 7 standing
Autogoal instruction uses this existing goal and plan.

Objective:

Implement kit-owned AI and DnD setup through all three phases, remove routine
caller wiring, and prove behavior, installation, public teaching, and scale.

Flow mode:

Execute the approved scoped Improve plan; no hour or token budget, publication,
or additional checkout. The earlier planning deliverable remains recorded below.

Goal plan:

docs/plans/2026-09-06-kit-owned-ai-and-dnd-lifetimes.md

Primary template:

docs/plans/templates/plate-plan.md; implementation and final acceptance.

Applied packs:

- performance-observability: runtime applicability and frozen acceptance contract.

Completion threshold:

All execution checklist items and applicable proof gates pass on the final
source. Prototypes do not count as implementation proof. Record any real
capability gap honestly; no unresolved required repair is a completed goal.

Verification surface:

- Source audit of the two feature families, their React mount owners, authored
  consumers, public teaching, registry metadata, and existing proof.
- Existing AI and DnD lifecycle tests as current-source behavior evidence.
- Source fingerprints, caller-count reconciliation, file/link checks, and the
  goal plan completion checker.
- The production, browser, installation, and performance gates below govern
  execution; their individual open states prevent completion.

Constraints:

- Keep the requested scope to AI and DnD kit integration and its full adoption.
- Preserve one AI command/stream owner per editor object and exact-view DOM
  ownership for DnD. An editor ID, container, or last-focused element cannot
  substitute for the actual owner.
- Keep optional features optional. Generic `Editor`, `Plate`, and Plite must not
  import the AI SDK, copied AI components, or the HTML5 backend.
- Preserve transport customization, CommentsProvider integration, preview and
  suggestion behavior, shared/custom DnD managers, and lazy drag activation.
- No compatibility alias, public replacement wrapper, or extra setup step in
  ordinary editor assemblies.
- No publication, cross-project sync, release, worktree, or native-device claim.

Boundaries:

- In scope: copied AI/DnD families; the minimum Plate React mount-owner repair;
  all 23 affected application files; advanced/custom callers; docs, registry
  metadata/output, behavior tests, and affected doctrine.
- Plate owns plugin composition and its React integration. Copied AI owns its
  transport/session policy. Copied DnD owns default provider and activation UI;
  package DnD owns drag behavior and exact-view cleanup.
- Plite owns neutral view attachment/read-only mechanics if a missing primitive
  is demonstrated. No Plite session service or DnD policy is proposed.
- Non-goals: Yjs ownership, compiler cuts, a DnD backend replacement, a new AI
  protocol, unrelated editor features, document formats, and a whole-repository
  stylistic audit.

Blocked condition:

Runtime acceptance requires the frozen comparison contract below. Shared-host
noise is reported as inconclusive; it does not require pausing user applications
or prevent collecting paired baseline/candidate evidence. Other proof continues
while that gate remains open; missing acceptance is not evidence of a runtime defect.

Plate Plan state:

- status: provisional
- phase: local implementation candidate; lifetime proof complete, timing acceptance open
- next: resolve timing acceptance and the concurrent checkout check failures; all bounded measurement, counter, and cache-repair work is recorded
- handoff: no architecture completion or performance acceptance is claimed

Start Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| User request and authority | yes | Full three-phase execution authorized by the user; local checkout only |
| Previous decision recovered | yes | September 4 plan, phase 3; current source and tests re-read |
| Current owners and complete direct caller set | yes | Source map and caller table below |
| Best API counterfactual | yes | Alternatives below; public caller cut implemented; timing acceptance provisional |
| Runtime scale applicability | yes | Sessions per editor, listeners per view, provider/activation fan-out per block |
| Performance pack | yes | Frozen contract below; final production receipt remains required |

Work Checklist:

- [x] Read the complete Poteto principles and the applicable domain/laziness leaves.
- [ ] Prove the selected owner with the phase 1 lifetime and scale comparison.
- [x] Implement and migrate all 23 callers, custom integration paths, and tests.
- [x] Adopt current English/Chinese docs, registry metadata/output, and doctrine teaching.
- [ ] Complete final source/type/browser/install/performance proof and closeout.

### Execution obligations and checkpoint, 2026-09-07

| Obligation | Governing source | Evidence / unresolved state |
| --- | --- | --- |
| Preserve one goal, source-linked checklists, and actual completion | Autogoal `references/method.md#checklist-retention`; Task workflow | This plan is the only acceptance ledger; all rows below remain required unless explicitly N/A |
| Keep the public cut and advanced current jobs | Best API; Plate UI; alternatives and lifetime matrix in this plan | No ordinary `AIChatSession`/`DndRoot` mounts; custom slots, transport, CommentsProvider, shared managers, exact refs, and optional-feature boundaries covered by source and 30 actual-kit lifecycle tests |
| Core model/view correctness | Plate Plan; Verify Plate; Patch | Core/DnD package proof 67 tests, SSR 1 test; AI command/preview 43 tests pass. Refreshed proof: 30 actual-kit lifecycle/comment tests and all 1,224 React package tests pass. September 8 strict Plite passes; the closure matrix passes using matching complete cached receipts. Root/WWW and timing closure remain open |
| Public retry after early cancellation | Patch; `kit-lifetimes:retry-before-first-chunk` below | Package red/green; actual-kit public command test; native Chrome exact replay, accepted response, and follow-up typing pass. `ai-production-retry-accepted.png` visually inspected |
| Source-first package/app types and lint | Project AGENTS; Verify Plate | Earlier resumed proof passes all 87 package type tasks, www type/docs/registry checks, root check, and focused harness lint. After the verifier repairs, direct WWW and integration types and focused lint pass. Latest aggregate WWW/root checks fail on the PlateBlockInsertOptions API-reference entry and formatting/lint issues; see sept8-audit4-www.log and sept8-audit4-root.log |
| Generated/source and teaching parity | Best API doctrine repair; Technical Writing; Task docs reference | PASS on the recorded source: 8 affected MDX pages, direct registry dependencies/output, doctrine version 161 and mirrors, API manifest, docs/source parity. Refreshed frozen receipt covers 1,509 source files, 447 static export files and 367 registry JSON files |
| Fresh installed AI, DnD, editor-ai in both primitive families | Verify Plate registry installation; phase 3 | All six refreshed consumer builds and React/React DOM/DnD identity checks pass. Both standalone DnD styles reorder and type; both standalone AI styles accept and type; both full editors generate/accept rich Markdown and type. Base standalone also cancels before the first retry chunk and retries. All six error receipts are empty; screenshots inspected. Earlier unchanged UI receipts retain emoji, font-size, comments, and narrow-state coverage |
| Existing homepage native selection guard | Verify Plate; `apps/www/tests/browser/dnd.spec.ts` | PASS: native cross-block selection includes Collaborative Editing and excludes the handle. The former text-edge gesture also fails in plain HTML. Start inside the same preceding text; all original assertions retained. homepage-selection-green.log |
| Cross-editor DnD behavior | Verify Plate; `plate-dnd-cross-editor.test.ts` | 3/3 Chromium cases pass, 0 skipped: move, copy, bystander isolation, held-drag native selection/cursor guard, follow-up typing |
| Real routes, desktop and narrow viewport | Verify Plate; actual copied UI row below | PASS: desktop/narrow AI menu, cancellation/retry, accepted AI comments; DnD reorder, typing, undo and native edge scrolling with released overlays; homepage selection; installed editor-ai; 10,000-line code editing and undo. Narrow proof used an effective 433 CSS-pixel viewport; final discussion desktop measured 1422 CSS pixels. Screenshots inspected; no raw-device claim |
| Final frozen scale comparison | Benchmark; performance contract below | All 22 warm/cold cohorts are collected at the prescribed workload and sample counts, plus 400 same-source control samples. All lifetime assertions pass. Timing acceptance remains inconclusive. All 11 separate profiling cohorts supply actual root commit counts |
| Strict Plite and root closure | Project AGENTS; Verify Plate | September 8 strict aggregate passes types, tests, contracts and Chromium (743 passed, 8 skipped). The refreshed five-project matrix passes with matching cached receipts and runner integrity checks. Root check still fails on 36 formatting files and transforms.ts / PlateTest.d.ts lint; WWW stops at PlateBlockInsertOptions API classification. Exact logs: sept8-audit3-strict.log and sept8-audit4-{matrix,root,www}.log |
| Export/barrel/artifact obligations | Project AGENTS; Verify Plate | No exported file added or removed by this task: barrel regeneration N/A unless that changes. Package artifacts rebuilt for copied-install verification |
| Review, Git/publication, native device, cross-project sync | Task workflow; project AGENTS; user scope | Autoreview N/A on `next`; no publication, Git mutation, native-device claim, or cross-project sync authorized |

Fresh-install repairs are in canonical sources: Date accepts `autoFocus`, with
www's Calendar adapting its installed DayPicker version; DnD and the full
editor own required Tooltip providers. The create/install harness injects
workspace runtime dependencies into each consumer's peer context and verifies
shared module identities. All six final builds pass in the retained
`plate-create-local-bsB1TS` workspace; see
[install receipts](./artifacts/2026-09-06-kit-owned-ai-and-dnd-lifetimes/installed-six-consumers.log).

The final four AI consumers were recreated in `plate-create-local-guaEas` after
the comment callback and full-editor SSR repairs. Emoji Picker uses the existing
FloatingPopover adapter; the font-size input uses its anchor. Base and Radix
production hydration, emoji search/insertion, AI generation/acceptance, and
follow-up typing pass, with empty browser error receipts. Standalone AI proof
uses plain-text continuation because that minimal schema installs no formatting
kits; the full editor proves rich Markdown. The last direct `tooltip` metadata
addition makes an already installed transitive dependency explicit and leaves
the tested copied source and package closure unchanged. See
[final AI install receipts](./artifacts/2026-09-06-kit-owned-ai-and-dnd-lifetimes/installed-final-four-consumers.log).

The final source-level AI comment replay selected a real discussion anchor,
created a third draft thread, and accepted it; the draft indicator disappeared.
Registry regeneration briefly removed its generated index during development
HMR, then recovered. This transient build-time message is separate from the
completed callback and the clean production-consumer receipts.

Throughput checkpoint: prove shared mount ownership first; core, AI, and DnD
integration are coupled and use one writer. Caller/doc migration follows the
accepted public shape. Keep the same design questions and critique sequentially
under the project's agent-tool mapping; no independent-agent verdict is claimed.
The smallest safe decomposition is one ownership prototype, one adoption wave,
and one final proof/teaching wave.


- [x] Bound the requested audit and distinguish planning from implementation.
- [x] Trace the previous cut and current AI/DnD mount ownership.
- [x] Enumerate every direct application caller and separate advanced callers.
- [x] Review the applicable rule, docs, registry, proof, and performance lanes.
- [x] Challenge deletion, existing-owner reuse, slot composition, and new machinery.
- [x] Record findings, proposed ownership, all adoption paths, and runtime gates.
- [x] Run existing focused lifecycle proof and preserve its limits.
- [x] Prepare three execution phases and a reviewable handoff.

## Intake owner audit (historical baseline)

This section records the pre-implementation owner audit, not the current API.
Paths are relative to the repository root. Baseline fingerprints are in
[the source receipt](./artifacts/2026-09-06-kit-owned-ai-and-dnd-lifetimes/source-fingerprints.json).

| Contract | Live owner and evidence | Finding/disposition |
| --- | --- | --- |
| AI kit composition | `apps/www/src/registry/components/editor/ai.tsx:53-205`; `plugins.ts:37` | AIKit installs leaf, menu, anchor, and plugin configuration, while applications mount the required session separately. **P2: confirmed ownership/DX defect.** |
| AI session authority | `ai.tsx:62-202`; `use-chat.ts:202-387` in that family | Preserve one adapter/chunk consumer, endpoint/editor replacement, read-only guards, and captured cleanup. These are real jobs, not removable ceremony. |
| AI customization | `use-chat.ts:17-33`; `settings-dialog.tsx:233`; AI manual docs | Endpoint/body configuration and the application CommentsProvider are current users. They must survive an integration move. |
| DnD kit composition | `apps/www/src/registry/components/editor/dnd.tsx:711-773`; `plugins.ts:70` | DndKit installs the block wrapper but callers must separately supply provider, activation context, and lifecycle. **P2: confirmed ownership/DX defect.** |
| DnD DOM cleanup | `packages/platejs/src/dnd/react/useDndPlugin.ts:7-78` | Two document listeners bind to the supplied element's ownerDocument; DndRoot adds three activation-reset listeners. Preserve exact-view cleanup even with scroller disabled or read-only. |
| Optional presentation | `dnd/react/DndPlugin.tsx`; `DndScroller.tsx:196-214`; copied `ai.tsx:53-60` | Scroller/menu visibility cannot own required integration. Existing presentation slots are replaceable. |
| React mount boundary | `packages/platejs/src/react/components/Plate.tsx`; `PlateContent.tsx`; `PlateRoot.tsx`; `EditorRefEffect.tsx` | Plate is keyed by editor object, but more than one Plate can use that object. PlateContent owns the exact Editable ref and readiness. wrapRoot runs per view; other slots can be suppressed in read-only mode. A blind component move is insufficient. |
| Global DnD provider | `apps/www/src/components/context/providers.tsx:4-22` | Default DndRoot and the cross-editor fixture already supply providers. Remove this application-wide default after proving every drag consumer is covered. This is a secondary cut, not the primary fix. |
| Backend sharing | Installed `react-dnd` 16.0.1 `src/core/DndProvider.tsx:21-95` | Default providers use the library's singleton context; nested provider JSX does **not** establish duplicate backend instances. Do not invent another backend manager. Custom `manager` remains a real boundary. |
| Existing teaching | `.agents/rules/plate-ui.mdc:124-133`; `docs/vision/plate.md:627-632`; four AI/DnD feature pages | Lifetime laws are useful. Requiring applications to mount feature internals is not a hard law. Repair the teaching when the new runtime exists. Current public docs truthfully describe current code. |

No current P0/P1 behavior defect was demonstrated by this audit. The risks below
are acceptance obligations for the proposed change. The fresh baseline passes;
that does not certify every browser interaction or the proposed replacement.

### Scope and rule coverage

| Lane and governing source | Governed set reviewed | Disposition |
| --- | --- | --- |
| Task workflow, autonomous architecture, Improve; root AGENTS and app AGENTS | This proposal, prior phase 3, current checkout authority | Reviewed; no product execution/publication authority inferred |
| Best API, Plate Plan, Plate UI, scoped Vision | Both public mount APIs, their feature stores, Plate mount/slot types and components, custom ownership paths | Reviewed; two caller cuts justified; exact runtime API remains provisional |
| Correctness; Testing and Verify Plate | AI lifecycle and async-comment suites/support, copied DnD lifecycle suite, package cleanup and scroller suites, browser proof owners | Reviewed; 33 baseline tests pass; automatic-kit cases still required |
| Runtime and scale; Benchmark review | Session/view/block fan-out, ref-state rerenders, listener/observer lifetime, provider sharing and lazy activation | Reviewed; no timing improvement claimed; executable comparison required before acceptance |
| DX and CI | Root Bun preloads, package/app scripts, registry generator, test ownership | Reviewed for this contract; no independent tooling defect established |
| Docs; Technical Writing and Task docs reference | English/Chinese AI and DnD feature pages; Plate slot/component references if their API changes | Current teaching matches current source; complete affected adoption required. No general prose violation was established to trigger a whole-docs rewrite |
| Registry and components; Plate UI | Both feature families, all direct mount consumers below, shared Demo metadata, feature/editor/block metadata | Reviewed for integration ownership. Generated output is checked through its generator, not edited as a separate owner |
| Rules and workflow | Plate UI lifetime rule, scoped Vision, prior plan, Plate Next version owner | The call-site requirement is contested; preserve hard lifetime laws. Doctrine repair belongs in phase 3; no reusable workflow change is made by this proposal |

Unrelated installed vendor skills, database/SSR design, release lanes, external
issue queues, raw-device certification, and unrelated Plite kernel audits are
outside this explicitly scoped request. Migration/changelog history records past
states and is not a current API tutorial to rewrite.

## Implemented user contract

`EditorKit` already includes AIKit and DndKit. Its ordinary editor assembly is:

```tsx
const editor = useCreateEditor({ plugins: EditorKit });

return (
  <Plate editor={editor}>
    <EditorContainer>
      <Editor />
    </EditorContainer>
  </Plate>
);
```

Applications selecting the individual kits get the same automatic integration.
Custom refs remain available for real application jobs. No caller-maintained
array of view elements, session key, or feature-root wrapper is required.

### Ownership requirements

1. **Kit installation selects the feature integration.** Copied AI and DnD keep
   their policies together. Bare core components carry no optional-feature imports.
2. **Plate owns the real React mount boundary.** Reuse existing editor and
   PlateContent ownership first. Repair that boundary if it cannot compose
   integration independently of replaceable presentation. Do not infer exact
   DOM ownership from container refs, editor IDs, selectors, or last focus.
3. **AI owns one session per editor object.** Multiple views contribute mounted
   authority without creating multiple SDK sessions or chunk consumers. Detaching
   one view must not cancel work while another authorized view remains. The last
   view detaching retires the session. Endpoint/editor replacement retires only
   the captured old resources. Read-only periods keep the adapter available but
   disallow submission and late writes under the current authority rules.
4. **DnD owns integration per mounted Editable.** Provider/context must enclose
   the drag consumers. Cleanup follows that element and its ownerDocument, with
   zero listeners before readiness and after detach. Scroller, menu, and slot
   customization cannot remove required cleanup. Reuse an existing DnD manager;
   keep a default backend available for standalone installed kits.
5. **Plite remains neutral.** Only a proven missing neutral view primitive may
   move there; copied feature policy, transports, and providers remain above it.

These requirements fix the intended behavior and layer ownership. They do not
name a speculative public `lifecycle`, `services`, or `providers` API.

### Hard-cut counterfactual

| Alternative | Benefit | Hard objection / result |
| --- | --- | --- |
| Delete the two caller APIs and repair the canonical mount owner | Makes kits sufficient; preserves feature-local ownership | **Preferred direction**, subject to the phase 1 executable proof |
| Put effects in AIMenu or DndScroller | Small diff | Reject: hidden/replaced UI and disabled scroller lose required lifetime |
| Put both in `slots.wrapRoot` unchanged | Reuses existing composition | Reject as a complete solution: per-view AI duplication, no exact Editable element prop, and callers can replace wrapRoot. The current tests explicitly do so |
| Put effects unconditionally in generic Editor | Removes caller ceremony | Reject: couples every editor to optional SDK/backend features and misses bare PlateContent users |
| Restore arbitrary `useHooks` registration | Makes kit registration easy | Reject unchanged: it does not define editor versus view cardinality, authority, or resource transfer. It also restores the generic hook program the earlier cut rejected |
| Add a general session registry/manager and two new public mount APIs | Can encode every lifetime | Reject without an independently proved need. First reuse Plate ownership and feature state; do not replace two public burdens with a framework |
| Replace the SDK React session with a feature-local headless controller | Could preserve one session across independent view mounts | Keep as a phase 1 candidate only if ordinary React composition cannot preserve that lifetime. It must preserve CommentsProvider behavior and pass the same comparison; a transport rewrite is not assumed necessary |
| Keep manual roots as an advanced fallback for ordinary kits | Avoids a hard cut | Reject: it retains the original setup burden. Advanced custom-manager/transport jobs get explicit supported contracts, not aliases for routine setup |

### Decision ledger

| Surface | Current | Proposed target | Owner | Adoption and proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| Ordinary feature setup | 49 explicit mounts plus ref plumbing | Kits supply required integration; delete both caller-facing mount APIs | Copied AI/DnD and Plate React | All callers below; zero manual mounts in ordinary assemblies; functional install proof | Missing implicit setup | Proposed cut; runtime acceptance gated |
| Editor/view integration mechanism | Caller composition | Minimum existing-owner repair; exact component contract selected by probe | Plate React with Best API and Benchmark | Inference, lifecycle matrix, matched scale receipt | Scope confusion, render fan-out, context loss | Provisional; phase 1 decision |
| AI session state | One explicit React owner and feature-store ownership token | One feature-owned session across eligible views | Copied AI | Existing stream/comment guards plus automatic multi-view ownership tests | Duplicate chunks or stale writes | Provisional; phase 1 decision |
| DnD integration | Explicit root, private interaction context, five listeners/view | Kit-owned provider/context and exact-view cleanup | Copied DnD; package DnD behavior | Custom slots, shared managers, scroller off, cross-editor drag, detach | Backend replacement or wrong-document cleanup | Provisional; phase 1 decision |
| Advanced `useDndPlugin` | Package hook used by custom cross-editor fixture | Preserve its independent exact-view/custom composition job unless automatic package integration fully replaces it | Package DnD | Fixture and docs; no public deletion without an executable replacement | Removing real advanced behavior | Retain as an execution constraint; no API cut claimed |
| Application-wide default DndProvider | Generic Providers wraps every route | Delete once kit and advanced consumers cover all three current import owners | App composition | Standalone kit install, shared-manager fixture, homepage drag | Masked missing local provider | Proposed secondary cut, dependent on phase 1 |
| Lifetime doctrine | Explicit components interpreted as explicit caller mounts | Kits own integration; editor/view authority laws stay literal | Plate UI and scoped Vision | Best API doctrine repair, version append, generated mirror check | Re-teaching the same assembly burden | Required adoption work |

## Complete direct caller adoption

The authored application denominator is **23 files**, containing **24 AI mounts
in 22 files** and **25 DnD mounts in 23 files**. Definitions, test fixtures,
generated registry output, and historical changelogs are separate below.
Every row's local state/ref wiring feeds only these two mounts and its Editor;
remove that wiring while retaining unrelated editor, input, and channel state.

The first 19 paths are under `apps/www/src/registry/examples/`.

| File | AI mounts | DnD mounts | Adoption concern |
| --- | ---: | ---: | --- |
| `code-block-codemirror-demo.tsx` | 1 | 1 | Preserve external-text/native behavior |
| `code-block-demo.tsx` | 1 | 1 | Preserve code-block behavior |
| `code-block-huge-demo.tsx` | 1 | 1 | Full DOM and no per-block lifetime work |
| `code-drawing-demo.tsx` | 1 | 1 | Preserve custom plugin composition |
| `copilot-demo.tsx` | 1 | 1 | Keep Copilot integration independent |
| `demo.tsx` | 1 | 1 | Shared source for registry examples; audit all its metadata consumers |
| `discussion-demo.tsx` | 1 | 1 | Keep CommentsProvider above feature integration |
| `document-migration-demo.tsx` | 1 | 1 | Preserve migration setup and document data |
| `docx-demo.tsx` | 1 | 1 | Preserve import schema/plugins |
| `editable-voids-demo.tsx` | 2 | 2 | Nested independent editor objects remain isolated |
| `editor-default.tsx` | 1 | 1 | Minimal copied example |
| `editor-full-width.tsx` | 1 | 1 | Preserve presentation |
| `excalidraw-demo.tsx` | 1 | 1 | Preserve custom plugin composition |
| `find-demo.tsx` | 1 | 1 | Preserve focus/find behavior |
| `markdown-streaming-demo.tsx` | 1 | 1 | Mount toggles and a separate streaming demonstration |
| `markdown-to-plite-demo.tsx` | 1 | 1 | Keep the other markdown editor independent |
| `playground-demo.tsx` | 1 | 1 | Homepage and localized playground share this owner |
| `tabbable-demo.tsx` | 1 | 1 | Focus/navigation unchanged |
| `table-nomerge-demo.tsx` | 1 | 1 | Preserve table configuration |
| `apps/www/src/registry/components/editor/plate-to-html.tsx` | 1 | 1 | Read-only client rendering; no accidental requests |
| `apps/www/src/registry/blocks/editor-ai/components/editor/plate-editor.tsx` | 1 | 1 | Comments context, settings, and standalone block install |
| `apps/www/src/app/(blocks)/blocks/discussion-proof/discussion-proof.tsx` | 2 | 2 | Separate primary/reviewer editors and read-only reviewer |
| `apps/www/src/app/dev/table-perf/page.tsx` | 0 | 1 | DnD-only setup and performance route |

Other governed consumers:

- `ai.lifecycle.spec.tsx` and `ai.lifecycle-test-support.tsx`: preserve the
  behavior matrix, replace explicit session assembly, and replace the obsolete
  public duplicate-mount assertion with automatic single-session behavior.
- `use-chat.lifecycle.spec.tsx` and `ai.lifecycle-preload.ts`: preserve async
  comment anchor transfer/release and stale-completion guards. Retain the
  `ai-menu.slow.tsx` presentation contracts independently of session lifetime.
- `dnd.lifecycle.spec.tsx`: prove installation through DndKit, with custom
  presentation slots and no test-only manual DndRoot.
- `packages/platejs/src/dnd/react/{useDndPlugin.spec.tsx,DndPlugin.slow.tsx}`:
  preserve package-local exact-document cleanup and scroller proof. Do not
  import copied UI into package tests. Reuse `useDndNode.ssr.spec.tsx` for the
  inert server-render boundary and `useDndNode.spec.ts` for drag behavior.
- `apps/www/src/app/(app)/examples/plite/_examples/plate-dnd-cross-editor.tsx`:
  advanced shared provider, three editors, custom block UI, direct useDndPlugin.
  Preserve the job and use it to prove package behavior independently of DndKit.
- `settings-dialog.tsx`, `use-chat.ts`, AI manual docs: retain endpoint/body
  customization and the provider adapter contract.
- `registry-features.ts`, `registry-editor.ts`, `registry-components.ts`,
  `registry-blocks.ts`, and `registry-examples.ts`: derive dependencies from final
  authored imports. The shared Demo has 35 direct file references in
  registry-examples; do not verify only the AI and DnD labels. Do not remove an
  AI/DnD dependency that is still required through the installed kit.
- Current public pages: `content/docs/(plugins)/(ai)/ai.mdx`, `ai.cn.mdx`,
  `content/docs/(plugins)/(functionality)/dnd.mdx`, and `dnd.cn.mdx`. Remove routine
  mount instructions in both kit and manual examples; teach one coherent custom
  integration path. Update `content/docs/api/core/plate-plugin{,.cn}.mdx` and
  `plate-components{,.cn}.mdx` only if phase 1 changes those public contracts.
- Source doctrine: `.agents/rules/plate-ui.mdc`, the relevant Best API/Plate Plan
  teaching if affected, `docs/vision/plate.md`, and
  `.agents/rules/plate-next/versions.json`. Append a new doctrine version at
  implementation closure; preserve old history and package attestations.
- Generated `apps/www/public/r` output comes from `build:registry` on `next`.
  Never hand-edit it or CI-controlled `templates/**`.

## Execution phases

No runtime design has passed the complete acceptance gate. After repeated
unchanged-source timing failures, execution prepares the complete local
candidate before returning to the unchanged scale gate. This reorders local
implementation and proof work; it does not accept the runtime, waive a timing
limit, reduce a workload, or authorize publication. A measured candidate
regression still requires repair or rejection of the coherent packet.

| Phase | Owner and entry | Work | Exit |
| --- | --- | --- | --- |
| 1. Prove automatic ownership | Plate Plan + Best API; execution authorized | Prototype the smallest canonical mount repair and AI/DnD integration. Compare materially different ownership candidates. Resolve the public/internal contract, context access, editor/view cardinality, and advanced manager behavior | Full lifetime matrix and matched Benchmark receipt pass; Best API selects the final shape. Update this plan to accepted before mass adoption |
| 2. Adopt and hard-cut | Plate React, copied feature owners; phase 1 accepted | Implement that shape, migrate all 23 caller files and advanced/test consumers, remove routine roots and redundant refs, remove the global default provider when proved redundant | Current behavior tests and automatic kit cases pass; no ordinary caller imports/mounts; no compatibility path; package/app types and optional-feature boundaries pass |
| 3. Prove installation and repair teaching | Verify Plate, Plate UI, Technical Writing, Best API; phase 2 coherent | Update complete affected docs/metadata, regenerate registry/barrels as applicable, perform doctrine repair and version append, prove actual installed and browser paths, rerun frozen performance contract on final source | Source/install/docs parity, browser/native behavior, final performance and applicable root gates pass; current proof fingerprints recorded |

The most valuable change is the caller API cut. Execution starts at the mount
owner because deleting callers first would turn working behavior into broken
implicit setup. No separate generic feature framework is an accepted deliverable.

### Phase 1 evidence, 2026-09-06 (historical candidate)

The candidate passes PlateContent's exact Editable ref through the existing
`wrapRoot` prop contract. Each kit supplies a private integration plugin, so
customizing the public AI/DnD presentation slots preserves required integration.
Copied AI shares a headless SDK session by editor object; copied DnD inherits an
existing manager and owns listeners for its exact view. Generic Plate has no
optional-feature imports.

- Core ref lifetime proof: 27 tests, 90 assertions; package source typecheck and
  authored slot inference/type-error cases pass.
- Automatic kit prototype: 29 tests, 220 assertions, covering the existing AI
  and async-comment laws, separate/shared editors, first/last view detach,
  standalone AIKit, custom slots, DnD readiness, and supplied manager reuse.
  The AI application schema requires a positive root minimum. No test relaxes
  that schema to manufacture an empty AI document; absent/detached views cover
  AI authority without changing model laws. DnD's lower-level empty-root
  fixture passes with zero listeners when no Editable exists.
- Happy DOM's recursive observer bookkeeping dominated the 10k timing fixture.
  Timing therefore uses the repository-owned Chromium runner against a frozen
  production export, with actual full-DOM editors and controlled transport.
  Bun remains the correctness host. Workloads and budgets are unchanged.
- Normal cohort: 100 measured samples per variant after 20 warmups pass every
  timing budget. Two interleaved unchanged-source cohorts also pass the noise
  limit. [Raw comparison](./artifacts/2026-09-06-kit-owned-ai-and-dnd-lifetimes/prototype-normal.jsonl),
  [raw controls](./artifacts/2026-09-06-kit-owned-ai-and-dnd-lifetimes/control-normal.jsonl).
- 1,000 full-DOM blocks: 100 samples per variant pass the deterministic counters,
  but drag activation p95 is 106.9 ms versus 97.4 ms and read-only transition
  p95 is 139.9 ms versus 131.4 ms. Both miss the frozen timing contract.
  Same-source controls at this size are running; no regression or acceptance
  conclusion is drawn before their noise check.
  [Raw comparison](./artifacts/2026-09-06-kit-owned-ai-and-dnd-lifetimes/prototype-blocks-1000.jsonl).
- Measurement refinement: variants use separate BrowserContexts, while sample
  order remains interleaved. This prevents the comparison from mixing separate
  copied implementations in one JavaScript realm. The isolated 1,000-block
  comparison passes all timing limits: activation p95 125.6 ms versus 123.3 ms,
  read-only p95 150.8 ms versus 146.7 ms. Two isolated unchanged-source controls
  also pass. Earlier shared-realm runs remain diagnostic evidence, not the
  acceptance environment. No candidate runtime changed during this check.
  [Controls](./artifacts/2026-09-06-kit-owned-ai-and-dnd-lifetimes/isolated-control-blocks-1000-summary.json),
  [comparison](./artifacts/2026-09-06-kit-owned-ai-and-dnd-lifetimes/isolated-prototype-blocks-1000-summary.json).
- The initial two-view probe exposed an invalid fixture assertion: after its
  primary Editable detaches, the model read-only flag stays false, even when
  the surviving view is read-only. The assertion follows that existing law;
  per-view authority and cleanup checks remain unchanged. The normal and 1k
  fixtures keep their primary view attached, so their assertion and workload
  are unchanged.
- Withdrawn two-view timing receipt: mutating the visibility array in place
  allowed React to preserve the first Editable during streaming. The fixture
  uses a fresh array and asserts the actual remaining Editable, listener, and
  observer counts immediately after detach. No multi-view timing is accepted
  from the earlier receipt. The eight-view attempt also requires explicit
  command selection after all views attach; the probe sets and checks that
  selection before timed submission.
- The remaining scale axes, fresh-process cold measurements, final source
  adoption, installation, docs, browser behavior, and final performance remain
  open. The complete 49-mount/23-file caller patch is applied.

### Required lifetime matrix

`kit-lifetimes:retry-before-first-chunk` is a Plate command/history case found
on Chrome/macOS at `/blocks/ai-demo` during production-candidate proof. Generate
the Markdown sample, choose Try Again, stop before its first chunk, then choose
Try Again once more. Expected: one fresh request streams into the original
target. Observed: the menu remains idle and no request starts. The shared
`AIChatPlugin.reload` guard returns when AI undo reports no work; the same guard
exists in the checkout's HEAD. No retry repair had been claimed before this red.
Patch's boundary is that command and its package/application tests. Preserve
refusal when an existing preview cannot be safely rolled back. The package
regression is red before the repair; the actual-kit test covers public submit,
stop, retry, late first-request chunks, final stream cleanup, and detach. Native
Chrome replay passes through cancellation, retry, acceptance, and follow-up
typing; `ai-production-retry-accepted.png` is retained and visually inspected.
Final source fingerprints remain part of closure.

Phase 1 uncovered `kit-lifetimes:readonly-sibling-selection`, a Plite browser
selection ownership defect in the existing baseline. On
`/dev/kit-lifetime-probe`, eight views share one editor, including read-only
siblings. The first writable view is focused and selected before explicit AI
submission. A sibling's native selection-change handler writes `null` to the
shared model before the first chunk. The request remains live; insertion loses
its target. The production and development Chromium probes both reproduce it.
The development commit stack identifies `applyEditableDOMSelectionChange` in
`packages/plitejs/src/react/editable/selection-controller.ts`; the adjacent
outside-focus listener has the same shared-selection assumption.

Patch owns this bounded neutral repair: a sibling may release its own native
state, but cannot clear the selection held by another mounted view of the same
document. Source refs are this plan's mixed-view lifetime contract and
`/tmp/kit-debug-selection-v8.log`. The permitted boundary is Plite's DOM/view
ownership helpers and those two cleanup paths, with package regression proof
and the exact browser probe. AI policy and serialized data remain outside this
repair. Timing comparison resumes only after the baseline can execute the
unchanged workload.

The two regression cases fail before the repair (`null` model selection after
native selection-change or outside-pointer processing). All 89 tests in the
runtime-provider and selection-controller suites pass after it, including an
independent-editor control. Plite React source typecheck passes. Both variants
then pass all 11 browser preflight shapes, including the eight-view exact case
and 10k full-DOM stream. The fix reuses the mounted DOM runtime lookup and
compares document and root identity before read-only cleanup; it adds no public
API, persistent state, feature policy, or document scan.

The final measurement fixture also performs the read-only transition inside
every churn cycle. Earlier timing receipts do not cover that complete churn
workload. The `full-lifetimes` measurement round uses fresh receipts and both
variants share the Plite selection repair. Raw earlier receipts remain
diagnostic evidence. The first detach uses immutable visibility state and
immediate DOM/listener/observer assertions.

The full-lifetimes normal comparison and control pass all timing limits. The
1k unchanged-source control is inconclusive: read-only p95 is 108.5 versus
120.5 ms; cleanup is 9.1 versus 10.2 ms. The comparison round was stopped.
CPU profiles and an explicit-GC intervention do not isolate collection as the
cause. Splitting the 200 control rows by execution order reveals 13 read-only
samples above 110 ms after a page switch and zero after consecutive runs in
the same page. Reversing the pair every sample creates that unequal history.
The next controlled intervention alternates pages on every run and reverses
the pair only halfway through the sample set. Workloads, 20 warmups, 100 warm
samples, 10 cold samples, and the timing limits stay unchanged. GC remains
outside each complete sample as before; no phase-GC timing is accepted.

The balanced-order 1k control passes read-only timing (107.1 versus 105.9 ms)
and seven other metrics, but cleanup remains inconclusive (8.3 versus 10.2 ms).
All eight cleanup samples above 9 ms belong to the second renderer. Chromium
launches that renderer with `--disable-gpu-compositing`, while the first
renderer lacks that flag. CPU samples show no collection within the slow
cleanup intervals. The next isolated comparison gives each replica its own
browser process, retaining the same export, alternating order, workload, and
budgets. This tests a concrete host asymmetry; it does not establish a runtime
regression or accept the candidate.

Separate browser processes retain matching renderer configurations, but the
100-sample control still misses seven timing limits during substantial host
variation. Chunk p95 differs by 17% between identical copies. A short fixed
background-scheduling diagnostic also remains variable and is rejected as the
measurement environment. The task proceeds with the already-authorized
coherent implementation and non-timing proof while runtime acceptance remains
open. Final source must still pass the complete frozen contract; behavioral
green alone cannot close this plan.

| State/transition | AI requirement | DnD requirement |
| --- | --- | --- |
| Kit absent | No AI session, observer, or transport allocation | No kit provider/activation/cleanup work |
| Kit installed; no ready Editable | No writable DOM authority or request | No per-view DOM listeners |
| One ready writable view | One adapter, one chunk consumer, one explicit request | One integration, exact-document listeners, working drag handle |
| Initially read-only; later writable | Adapter available, no unintended submission, recovery on explicit command | Cleanup remains live; read-only prevents editing |
| Menu/scroller hidden or disabled | Session continues independently | Drag/drop cleanup continues independently |
| afterEditable or afterContainer replaced; custom root composed | Required session behavior survives sibling-slot replacement; an explicit root replacement composes or owns integration | Provider/cleanup survive sibling-slot replacement; a custom root composes or owns integration and retains its UI |
| Two views of one editor, including separate Plate providers | One session and chunk consumer; preserve model plus per-view read-only law | Per-view attachment, no cross-view DOM lookup |
| Two independent editors/nested editor | Independent sessions and callbacks | Correct target and bystander isolation |
| One of two views detaches or becomes read-only | Remaining authorized view can continue; no stale authority from detached view | Remove only detached view's owned resources |
| Last view detaches, root becomes empty, or unmount | Abort and fence late chunks/comment completion; release adapter ownership | Zero retained owned listeners/timers/frames |
| StrictMode, ref replacement, editor or endpoint replacement | No duplicate active owner; captured old cleanup cannot stop the new session | Balanced attach/detach; no stale old-document listener |
| HTTP/stream failure, cancellation, explicit retry | Preserve existing abort/fallback/preview/suggestion behavior and one explicit restart | Drag end/drop/mouseup and scroller cleanup recover |
| Shared/custom manager, standalone kit, SSR/hydration | Session does not submit during rendering | Reuse supplied manager; standalone default works; server render does not activate browser hooks |

## Performance acceptance contract

Applicability is **yes**: integration changes render/effect placement, per-editor
sessions, per-view listeners/observers, and per-block activation context. The
current lifecycle tests are correctness evidence, not a performance comparison.

Benchmark owns the browser comparison in
`apps/www/tests/browser/kit-lifetime-probe.spec.ts` and the actual-owner fixture
under `apps/www/src/__tests__/package-integration/kit-lifetime-probe`.
`current` imports frozen caller-owned AI/DnD sources; `production` imports the
final automatic kits. Both use the current neutral Plate/Plite correctness
repairs. Only the external transport response is controlled. The discarded
prototype implementation is removed; historical measurements stay diagnostic.

Freeze these cohorts and thresholds before reading a candidate result:

| Independent variable | Normal | Large | Stress / pathological |
| --- | --- | --- | --- |
| Blocks in one view | 100 | 1,000 | 10,000 full DOM blocks |
| Views of one editor | 1 | 2 | 8, mixed read-only, remove the first owner while streaming |
| Independent editors | 1 | 8 | 32 small editors; no-feature control at the same count |
| Lifecycle churn | Single mount/unmount | 20 replacements | 100 attach/detach/read-only cycles and 100 controlled chunks |

Vary one axis at a time, then run an eight-editor/two-view integration cohort.
Do not silently reduce blocks, mounted DOM, subscribed views, or stream work.

- Deterministic budgets: one active AI SDK session and one chunk consumer per
  editor object; zero duplicate chunk/application writes; DnD cleanup at most
  the current five owned listener registrations per attached view, independent
  of block count; zero retained feature listeners, observers, timers, requests,
  and ownership records after final unmount. Optional-feature absence owns zero
  feature work. Separate SDK/backend listeners from owned feature listeners.
- Preserve lazy DnD activation. No new per-block global listeners, lifecycle
  effects, or session subscriptions. Record render and subscription counts for
  inactive, active-drag, stream-update, and read-only transitions.
- Timing contract: matched current/candidate operation p95 must be no more than
  current p95 plus `max(1 ms, 5% of current p95)`. Existing stricter owning-route
  budgets also apply. This is a prospective no-regression threshold, not a
  measured result or a relaxation of existing 10k mount limits.
- Measure cold mount, warm attach/detach, explicit submit to first controlled
  chunk, 100-chunk application, first drag activation, and final cleanup.
  Separate construction from mount and background SDK latency from local work.
- Record 10 fresh-process cold samples, 20 warmups and 100 warm samples per
  variant/cohort, p50/p95/p99, and deterministic counters. Use interleaved order
  and at least two unchanged-source control runs. If control noise exceeds the
  threshold, report inconclusive and repair the measurement; do not relax it.
- Record source hashes, runtime versions, fixtures, sample counts, transport
  bytes, DOM counts, heap after cleanup, and owning listener documents. Receipts
  must contain no prompts, document contents, headers, keys, or user identifiers.
- Correctness guard: the lifetime matrix above plus existing lifecycle tests;
  final browser drag/selection and AI/comment flows remain required.
- No production telemetry infrastructure is justified by this setup cut.
  Record local runtime errors and owned resource counts. Any later production
  performance claim needs its own real detector; lab results do not imply RUM.

Final production commands against the freshly fingerprinted static export:

```sh
node docs/plans/artifacts/2026-09-06-kit-owned-ai-and-dnd-lifetimes/run-matrix.mjs production warm
node docs/plans/artifacts/2026-09-06-kit-owned-ai-and-dnd-lifetimes/run-matrix.mjs production cold
```

`KIT_ROUND` distinguishes new receipts; `PLAYWRIGHT_BASE_URL` identifies the
owned static server. The runner fixes 100 samples/20 warmups and 10 fresh
processes per variant/cohort. At least two unchanged-source controls remain
mandatory. Earlier receipts cannot certify final source or an incomplete churn
workload. Runtime acceptance remains open.

### Earlier source checkpoint, 2026-09-07

Both final unchanged-source controls completed 100 measured samples per realm
after 20 warmups, with separate browser processes and the same frozen export.
All deterministic laws passed. Both controls miss only lifecycle churn:

| Control | Realm 0 p95 | Realm 1 p95 | Allowed difference | Verdict |
| --- | --- | --- | --- | --- |
| 100 blocks | 24.9 ms | 23.0 ms | 1.15 ms | inconclusive |
| 1,000 blocks | 175.7 ms | 163.7 ms | 8.19 ms | inconclusive |

See the [control receipt](./artifacts/2026-09-06-kit-owned-ai-and-dnd-lifetimes/final-control-receipt.json)
and [final proof receipt](./artifacts/2026-09-06-kit-owned-ai-and-dnd-lifetimes/final-proof-receipt.json).
The final fingerprint comparison detected a concurrent change to
`packages/plitejs/src/react/editable/runtime-selection-engine.ts` at 11:10 UTC
and a replacement of `apps/plite/out` at 11:11 UTC. The static timing server
retains an immutable in-memory snapshot of its original export, so both control
realms used the same build. The controls and earlier checks remain evidence for
their recorded source; latest-checkout verification requires refreshing the
affected selection behavior and build fingerprints. Registry output is unchanged.
Owned verification tabs and servers were stopped before timing.
Hades continued using roughly two CPU cores; this is observed
host load, not a proven cause of the tail difference. Approval to pause that
application temporarily was requested and remains pending. No user application
was paused or terminated.

The next isolating probe is the same two controls after approved host-load
isolation and current-source verification. Keep the current receipts and every
workload/sample/budget intact.
The 11 warm and 11 cold candidate cohorts remain pending; no candidate timing
acceptance or full goal completion follows from passing behavior proof.

The source refresh passed its package types/tests/contracts and reached
Chromium batch 34/81 before the runner detected a change to
`packages/plitejs/src/react/editable/mutation-controller.ts` and invalidated
the run. The other `code (2)` task is actively modifying this checkout. The
[aborted receipt](./artifacts/2026-09-06-kit-owned-ai-and-dnd-lifetimes/latest-check-plite-source-changed.log)
is a source-change stop, not a failing browser assertion. Further full closure
runs wait for a stable checkout. All task-owned verification servers and tabs
are stopped; no user application or other task was interrupted.

At the next goal checkpoint, `code (2)` remained active and Hades used 176.7%
CPU. The four changed kernel owners were stable across a focused 77-test,
five-file Vitest pass and type-aware lint; see the
[current mutation receipt](./artifacts/2026-09-06-kit-owned-ai-and-dnd-lifetimes/current-mutation-proof-receipt.json).
This advances current-source package evidence. It does not replace the
invalidated broad browser run or either pending timing-control repair.

The same blockers were revalidated across three consecutive resumed goal
turns. At the third check, `code (2)` was still active, the four kernel owners
matched the 77-test receipt, and the host was running Hades at 188.7% CPU plus
an active Next server and browser verification workload. No further focused
rerun is justified by a source change. Final acceptance waits for external
conditions to change: a stable checkout and a timing host whose unchanged-source
controls pass. Approval to pause Hades remains pending; no user application or
other task has been interrupted. The entire 11-cohort warm/cold contract and
latest-source browser closure remain required when the goal resumes.

### Resumed execution checkpoint, 2026-09-07

The user resumed execution with "go i dont care about hades". Hades remains
running, and the earlier pause request is no longer a prerequisite. Current
Benchmark guidance also says to preserve shared-host timing failures as
inconclusive without requiring a quiet workstation. The next work is a fresh
current-source closure run and paired baseline/production measurements across
all 11 warm and cold cohorts. Workloads, sample counts, thresholds, and previous
failures remain unchanged; only a proven cause pauses further measurement.

The resumed source audit found the current doctrine-161 composition: AI and DnD
put `wrapRoot` on their existing feature plugin. There are no companion
integration plugins. Sibling presentation slots retain integration; an explicit
root replacement composes or takes responsibility for it. All 30 actual-kit
lifecycle/comment tests pass with this composition, and registry generation and
doctrine parity pass. The 23-file, 49-mount caller cut is unchanged.

The fresh strict attempt passed all 87 type tasks but hit two elapsed-time
limits in the React package suite. Both files pass with their original timeout
limits when run serially (74 tests). The complete React suite also passes with
two workers: 1,224 tests across 81 files. Keep the initial aggregate failure as
a diagnostic receipt; it does not demonstrate an assertion failure. Root check
and www type/docs/registry checks pass. The broad browser matrix reached
Chromium batch 52/120 and Firefox batch 31/120 before a concurrent edit to
`packages/plitejs/src/core/editor-schema.ts` invalidated its source identity.
That partial run is retained; it is not a complete current-checkout matrix.

All six refreshed consumer builds and shared-module identity checks pass in
`plate-create-local-W9UhDr`. Actual Base and Radix DnD consumers reorder and
accept follow-up typing. Both standalone AI consumers generate, accept, and
remain editable; Base additionally cancels before the first retry chunk and
retries successfully. Both full editors accept rich Markdown and remain
editable. All six browser error receipts are empty, and all six screenshots
were inspected. Verification tabs and consumer servers were closed afterward.

The frozen timing export has 447 files and a 1,509-file source receipt with
no source edits during its build. The full-workload correctness preflight
passes all 11 shapes. Paired timing completed on that export with separate
browser processes per variant, the prescribed balanced order, unchanged
workloads and sample counts, and Hades left running. Two new same-source
controls are diagnostic, not a requirement to pause user applications. The
receipt includes the actual browser version; p99 is omitted for ten-sample
cold cohorts rather than reported as an estimate from insufficient samples.

The normal production export disables React Profiler callbacks. Its historical
`commits: 0` fields mean unavailable, not zero renders. The probe returns `null`
for that state, verified in both variants after restoring a normal export.
All 11 full-workload shapes pass with Next's `build --profile` and the required
counter guard. Across the ten AI-enabled shapes, stream root commits are
209–213 in the baseline and 4–8 in the candidate; mount, activation, and
read-only counts match. These count whole React root commits, not individual
component render calls. Instrumented durations are excluded from timing
acceptance. Observed listeners/observers, the single-session/chunk-owner tests,
and the two SDK subscriptions per shared session supply subscription evidence.
See the [profiling receipt](./artifacts/2026-09-06-kit-owned-ai-and-dnd-lifetimes/resumed-profile-receipt.json).

The regular Plite build-input list initially omitted the probe's external import
graph. A local import audit, including the exact WWW TypeScript aliases, found
55 uncovered files among 67 local inputs, with no unresolved local imports;
see the [cache-input red receipt](./artifacts/2026-09-06-kit-owned-ai-and-dnd-lifetimes/resumed-probe-input-coverage-red.json).
This timing run explicitly forced its build and pinned its source and export.
After collection, the existing input list was repaired. The new contract test
fails before the fix; all 22 input tests and all 66 browser-runner contracts
pass afterward. All 67 local inputs are covered, including aliased UI adapters.
The complete editor family replaces the former individual editor-file entries.
See the [coverage receipt](./artifacts/2026-09-06-kit-owned-ai-and-dnd-lifetimes/resumed-probe-input-coverage-green.json).

All eleven warm cohorts are complete: 2,200 measured samples after the prescribed
warmups, with every lifetime assertion passing.
Normal, eight shared views, and 32 independent editors pass all nine timing
limits. The 1k-block, two-view, and eight-editor comparisons each miss one
limit. The 32-editor no-feature control misses construction, read-only, and
churn despite both variants executing the same feature-free path; all its
feature resource and transport counts are zero. Both churn cohorts pass churn
timing and miss only construction. The 20-cycle construction miss exceeds its
25.2 ms limit by only `4.77e-8 ms`, a floating-point boundary retained in the raw
verdict. The integration cohort misses stream and activation p95 while both
medians are lower than baseline. All completed deterministic assertions pass.
The 10k full-DOM cohort passes seven timing limits and misses churn
(2,409.6 to 2,532.3 ms p95; 120.48 ms allowance) and cleanup
(131.5 to 146.6 ms p95; 6.575 ms allowance). Its cleanup median is lower;
all 200 samples retain 10,000 mounted blocks during the workload and release
their five owned listeners and one observer after unmount.
These controls keep elapsed acceptance inconclusive. No timing limit, workload,
or sample count is changed. The complete fresh-process cold matrix is also collected;
results are in
[the resumed timing receipt](./artifacts/2026-09-06-kit-owned-ai-and-dnd-lifetimes/resumed-timing-receipt.json).

### Completed resumed timing collection

All 22 cohorts completed on the immutable export: 2,200 warm and 220
fresh-process cold samples, plus 400 samples in two unchanged-source controls.
All lifetime assertions pass. Three warm and two cold cohorts meet every timing
limit; the remaining timing verdicts and the unchanged-path control failures
remain inconclusive. No timing limit or workload was changed.

| Cohort | Warm timing misses | Cold timing misses | Lifetime assertions |
| --- | --- | --- | --- |
| normal | none | activation | pass |
| blocks-1000 | mount | none | pass |
| views-2 | churn | construction, mount, activation, readonly, siblingDetach, cleanup | pass |
| views-8 | none | none | pass |
| editors-8 | firstChunk | construction, mount, firstChunk, activation, readonly | pass |
| editors-32 | none | construction, mount, firstChunk, chunks, churn, cleanup | pass |
| no-features-32 | construction, readonly, churn | cleanup | pass |
| cycles-20 | construction | construction, mount, chunks, activation, churn | pass |
| cycles-100 | construction | activation, readonly | pass |
| integration | chunks, activation | construction, mount, firstChunk, chunks, readonly, siblingDetach | pass |
| blocks-10000 | churn, cleanup | construction, firstChunk, churn | pass |

The 20-cycle warm construction result is the floating-point boundary documented
above. Cold percentiles use the prescribed ten observations per variant; p99
is unavailable at that count. The cold 32-editor construction and mount medians
are higher, while its churn and cleanup medians are lower; the noisy controls
do not establish or exclude a candidate regression. Timing acceptance remains
open. The [validation receipt](./artifacts/2026-09-06-kit-owned-ai-and-dnd-lifetimes/resumed-timing-validation.json)
reconciles all 2,820 measured rows and pins the raw data and summaries. All 23
served HTML/script assets still match the original snapshot after collection;
see [serving identity](./artifacts/2026-09-06-kit-owned-ai-and-dnd-lifetimes/resumed-serving-identity-after-timing.json).
The owned timing server was stopped after this readback.

### Resumed closeout checkpoint

The cache repair, profiler guard, all 22 timing cohorts, all 11 profiling cohorts,
and normal-build readback are complete. The normal export is restored and its
freshness check passes. Both direct WWW and package-integration TypeScript
projects pass; doctrine parity also passes. All owned verification servers and
browser tabs are stopped.

The latest aggregate WWW command stops before typechecking because the table
API reference does not classify `TableResize` exactly once. The latest root
check stops in lint on concurrent `schema-compiler.ts` formatting,
`editor-schema.ts`'s unchanged loop condition, and two shadowed variables in
`incremental-schema-validation.test.ts`. The other task remains active. These
failures are retained separately from the earlier passing aggregate receipts;
no latest-checkout green or complete browser-matrix claim is made.

[The closeout receipt](./artifacts/2026-09-06-kit-owned-ai-and-dnd-lifetimes/resumed-closeout-receipt.json)
links the direct typechecks, runner contracts, normal readback, and current
aggregate failures. Timing controls and the current checkout gates remain open;
the goal is not complete. No user application or other task was interrupted.

### Follow-up isolation, 2026-09-07

The previous execution turn completed measurement and verifier repairs. This
follow-up inspected the live task and unchanged failed-check owners, then
analyzed paired differences across all 22 cohorts and both controls. The
32-editor cold construction delta changes sign with execution order; its mount
delta stays positive in both order groups. These diagnostics preserve every
original timing verdict. See the [paired-order analysis](./artifacts/2026-09-06-kit-owned-ai-and-dnd-lifetimes/resumed-paired-order-diagnostic.json).

Four full-workload cold CPU profiles use baseline/candidate/candidate/baseline
order on the restored normal export. Both pairs have lower candidate mount
times, and all lifetime assertions pass. Four instrumented observations cannot
accept or reject the original timing regression, and no integration-specific
causal repair is established. The [CPU receipt](./artifacts/2026-09-06-kit-owned-ai-and-dnd-lifetimes/resumed-cold-mount-cpu-receipt.json)
preserves the profiles, counters, sample identities, and limitations separately
from acceptance measurements.

The export was fresh when this diagnostic started. Its output digest remains
unchanged, and all 22 served script hashes matched. The owned server is stopped.
After collection, concurrent static-rendering source edits made the export
stale against the checkout; see the [build identity](./artifacts/2026-09-06-kit-owned-ai-and-dnd-lifetimes/resumed-cold-mount-profile-build.json).
The live other task and current-checkout gates remain unresolved. Repeating the
unchanged full timing matrix or changing product code without a causal result
would not establish acceptance. Final closure still requires settled, passing
checkout inputs and a conclusive comparison under the frozen contract.

### Blocked audit after the resumed run

The third resumed turn re-ran both aggregate gates. Root `pnpm check` still
fails on schema formatting, the unchanged loop condition, and two shadowed
test variables. WWW typecheck still stops at the unclassified `TableResize`
export. The other task is confirmed active, and the normal export remains
stale against the shared checkout. The [audit receipt](./artifacts/2026-09-06-kit-owned-ai-and-dnd-lifetimes/resumed-blocked-audit.json)
links these fresh failures and the completed isolation evidence.

The same final-proof blockers persisted across all three resumed goal turns.
Implementation, adoption, and bounded verification work are preserved; the
goal is blocked rather than complete. Resume final closure after the concurrent
source work settles and its table/schema gates are repaired. Timing acceptance
still requires a conclusive comparison under the unchanged contract.

### Current-source resume, 2026-09-08

The previous turn revalidated blockers; this resumed turn starts a fresh
blocked audit and continues independent proof. Current source differs from
the September 7 timing snapshot in 292 recorded paths. AI session ownership
is in package `useAIChat`; copied `use-chat.ts` supplies transport and comment
integration. The 23 original callers still contain zero manual roots. Current
proof passes 31 copied-kit lifecycle tests, 14 AI hook/command tests, 31 BaseAI
tests, direct integration types, and doctrine parity.

Root check fails on 36 formatting files and lint in `transforms.ts` and
`PlateTest.d.ts`. WWW typecheck stops on a stale API-reference decision for
removed `DOMPlugin`. These replace the September 7 failure details; neither
aggregate is green. The live other task remains active.

#### `kit-probe:completed-transport-authority`

Current-source browser preflight passes the baseline normal cohort, then fails
the candidate's `retained transport authority` assertion. The response was
closed and its send promise awaited before teardown. The probe incorrectly
equates transport retirement with `AbortSignal.aborted`. Installed AI SDK
`AbstractChat.stop` only aborts submitted/streaming responses and clears
`activeResponse` after completion; a completed response needs no abort.

Regression proof repair owns this oracle failure. Product source is frozen.
The existing `transport()` fixture becomes testable `createProbeTransport`,
and its live-request counter distinguishes open, completed, and aborted
responses. `transport.spec.ts` is unit-red: a fully consumed, completed response
incorrectly counts as active; the open/abort control already passes. The repair
counts completed or aborted requests as terminal while still rejecting open,
unaborted requests. It preserves the full stream workload and every other
lifetime assertion and emits `retainedRequests` in the browser result.

Expected-outcome authority: the plan requires zero retained requests, not
aborting already completed responses. Exact route: `/dev/kit-lifetime-probe`.
Runtime modes: 100-block normal insert stream followed by readonly, churn and
unmount. Fixture scope: complete 100 chunks; the unit test isolates the same
transport helper. No focus, paint, popup, or native-pointer claim is introduced.
Earlier timing/counter artifacts remain historical; no current-source pass
is carried across this red assertion.

Methodology decision: repair-now in the owned proof helper with executable
completed/open/abort controls; no product workaround or general workflow rule.
The helper is discovered through the existing browser spec and root Bun test
runner. Run Bun from the repository root so its DOM/source preloads apply;
the first app-directory invocation was a setup error and supplies no product
verdict. `pnpm install` and source/mirror parity follow the proof repair.
Agent-native review checks the same source-to-test-to-browser path without
adding a wrapper, another case registry, or another agent.

The repaired helper passes its two tests and the combined 33-test kit corpus.
Direct integration types, focused lint, installation, and doctrine parity pass.
All 11 full-workload browser cohorts pass for both variants; five additional
normal samples per variant pass without retries. All retained request,
listener, and observer counts are zero. The source-built route and its 24
served assets are fingerprinted in `sept8-transport-serving-identity.json`.
The official local regression receipt is retained in
`sept8-transport-official-receipt.log`. These are correctness receipts, not
timing acceptance.

All six fresh standalone consumer builds and module-identity checks pass in
`plate-create-local-UkBGXL`. Actual installed Base/Radix AI consumers generate,
accept, and remain editable; both full editor variants render and accept rich
Markdown. The installed API handler returns HTTP 401 without a gateway key.
Interactive proof therefore intercepts only `/api/ai/command` and supplies a
controlled AI SDK v1 stream; copied source and handlers remain unchanged.
This proves client integration, not a real provider request. Both standalone
DnD variants reorder blocks after lazy activation and accept follow-up typing.
All six browser error logs are empty. Four screenshots are saved and visually
inspected. See `sept8-install-receipt.json` for installed file fingerprints and
the exact interaction boundaries. All six temporary servers are stopped.

The final seven-file source readback matches the corrected browser receipt.
The earlier 22-cohort timing comparison and 11-cohort profiling results remain
historical because the package AI owner changed. Current lifetime correctness
does not close the frozen timing contract or the broader checkout gates.

The September 8 strict Plite attempt passes all 89 typecheck tasks and both
package-test stages. Contracts stop with four failures: the additional `find`
entrypoint changes three frozen feature/runtime counts, and WWW's current
`plitejs` aliases violate its source-alias contract. The aggregate browser stage
does not run. See `sept8-strict-plite.log`; this is distinct from the passing
focused kit browser proof. The goal checker retains both unfinished checklist
items and the final phase's open status. This resumed turn supplies new proof
and a bounded oracle repair; it does not mark the full goal complete or change
the accepted timing limits.

#### September 8 control follow-up

The previous turn made progress through the oracle repair and fresh consumer
proof. The second resumed turn confirms that the browser build is still fresh,
all recorded source inputs match, and all 24 served assets retain their hashes.
Root check has the same formatting/lint failures. WWW's API-reference check
instead stops on `PlateBlockInsertOptions`. The other task remains active.

Two unchanged-production controls complete 100 samples per realm after 20
warmups, in separate browser processes, with the prescribed workload intact.
The normal control passes every timing limit. The 1,000-block control passes
all except activation: p95 is 67.7 ms versus 74.5 ms, exceeding the 3.385 ms
allowance. That realm offset persists in both halves despite reversed ordering;
it is not an isolated tail sample. All 400 samples retain zero requests,
listeners, and observers after cleanup. No product-specific regression follows
from a comparison of identical implementations. Timing acceptance remains
inconclusive; the thresholds are unchanged. `sept8-controls-receipt.json`
retains distributions, order diagnostics, hashes, and exact counts. The timing
server is stopped. A further measurement repair needs a causal explanation for
the activation realm offset; repeating the full matrix cannot resolve it.

#### September 8 third resumed turn

The four contract failures are resolved in the current checkout: their three
owning files pass all 52 tests. The refreshed strict aggregate passes types,
package tests, contracts, and Chromium: 743 passed, 8 skipped, 81 bounded
batches. `sept8-audit3-strict.log` records the terminal pass. The closure matrix
is running separately. Root check still fails on the recorded formatting
and lint issues, and WWW still requires an API-reference decision for
`PlateBlockInsertOptions`.

Ten CPU profiles cover five full-workload samples per production replica after
five warmups at 1,000 blocks. Activation ranges overlap in this instrumented
run, unlike the persistent offset in the full uninstrumented control. The
fixture supplies no activation timestamps, so whole-workflow CPU self time
cannot isolate that operation. No causal measurement or product repair is
established. The profiles and their limits are retained in
`sept8-activation-profile-receipt.json`; they do not provide timing acceptance.

#### September 8 blocked readback

The sixth goal turn confirms the same root lint and API-reference failures
with fresh commands. All 1,459 recorded inputs match the focused activation
profile snapshot. Earlier independent progress is retained: installed layout
replay, integration API inference, strict Plite, and the source-matched cached
browser matrix. The diagnostic fixture change still requires fresh final-source
proof before closure. Timing controls remain inconclusive; focused profiles
establish no causal repair. The same blockers have recurred across three
consecutive turns, and no further justified in-scope mutation is identified.
The goal is blocked with its scope and frozen limits unchanged. See
`sept8-blocked-audit.json` for exact failures and resumption requirements.

#### September 8 activation attribution

The 1,459-input audit finds only the tested full-editor grid change since the
previous timing snapshot. The fixture then gains an activation interval in its
existing timeline receipt, using the same timer boundaries and workload. A fresh
production build and ten CPU profiles pass all lifetime and cleanup assertions.
The activation interval isolates the largest named self-time difference in the
DnD monitor state-change subscriber: 27.229 ms versus 44.186 ms across five
samples per replica. Garbage collection also differs. Both replicas contain
identical code; no product regression or causal intervention follows from this
attribution. `sept8-activation-span-receipt.json` retains the profiles and scope.
Uninstrumented acceptance remains open with unchanged limits.

The source-first integration check exposed a stale exact API-key contract that
omitted the installed `dnd.prepareDrag` API. Adding `dnd` to the exact key set
and asserting `prepareDrag` restores the complete integration typecheck; the
before/after logs are `sept8-activation-span-types.log` and
`sept8-activation-span-types-green.log`. No runtime API changes accompany this
contract correction. The diagnostic fixture change requires fresh final-source
proof before closure; earlier browser receipts remain attached to their source.

### Installed editor width repair

`kit-install:editor-grid-width` is a newly isolated block-layout bug, not a
failed DnD lifetime repair. Source tracing corrects the initial attribution:
AI and DnD integrations add no DOM wrapper here. The block context-menu trigger
is a grid item, and the full editor leaves its column implicitly sized. The
installed column reaches 554.031 px inside a 433 px container, including with
the comment popup closed. Patch owns this single local repair; Regression's
corpus and failed-fix schemas do not apply to a first layout case.

Expected authority is this plan's full installed editor and narrow viewport
requirement. Exact route is `/editor` in the retained Base/Nova and Radix/Luma
consumers. The complete full-editor sample, editable state, context menu,
comments and automatic kit composition remain installed. DOM unit runners
cannot compute CSS grid intrinsic sizing: `e2e-required` applies. The existing
WWW browser runner executes `editor-ai-layout.spec.ts`, with
`PLATE_INSTALLED_EDITOR_PROOF=1` and the explicit consumer base URL. Its default
source route is `/blocks/editor-ai`.

The test is red at the settled 433 px assertion before any source patch. It
polls positive editor/grid width and title-fragment bounds, repeats five
1280/433 px cycles, captures a screenshot, reasserts geometry, and checks native
follow-up typing and runtime errors. The accepted repair is `grid-cols-1` on
the full block's existing grid, matching the explicit zero-minimum column in
the discussion proof. No wrapper, public API, DnD policy, or generic context-menu
sizing change is justified. Fresh installed Base/Nova and Radix/Luma builds
and five-cycle browser replays pass, including follow-up typing and zero
runtime errors. Native Chrome confirms 433 px editor and grid widths with
fully visible heading/body content. `sept8-grid-receipt.json` records installed
source and build identities. The earlier partial matrix was stopped before
source mutation. The refreshed closure matrix passes using matching complete
cached receipts for all five projects, with the runner integrity check passing;
these are reused browser results. Refreshed root/WWW checks
still fail on the same lint and `PlateBlockInsertOptions` reference issues.

## Interaction Coverage

- `first-interaction`: pass: fresh Base/Radix consumers hydrate; AI menu and
  standalone drag work without caller-mounted integrations. Native homepage
  selection and DnD first activation preserve editor behavior.
- `settled-interaction`: pass: accepted streams/comments remain editable;
  retry after early cancellation, DnD reorder/undo, and released edge-scroll
  overlays pass. The 10,000-line route accepts editing and undo.
- `route-scope`: pass: AI, DnD, discussion, homepage, huge code block, and both
  installed editor-ai styles. Desktop and effective 433-pixel narrow states are
  recorded; this does not claim native-device proof or timed keyboard latency.
- `reporter-profile`: N/A: this is an architecture adoption task without a
  reporter profile. Native Chrome provided actual drag/selection/scroller
  behavior; fresh in-app consumers supplied independent installation proof.

## Proof and repair requirements

| Claim | Existing owner / future command | Required result |
| --- | --- | --- |
| Current AI/DnD baseline | Focused commands in Verification evidence | 33 existing tests pass; current code only |
| Automatic kit lifecycle | Update the same app lifecycle suites; add minimum missing contract cases | Lifetime matrix passes with no manually mounted session/root in ordinary fixtures |
| Plate core mount behavior | `bun test ./packages/platejs/src/react/components/PlateContent.spec.tsx ./packages/platejs/src/react/components/EditorRefEffect.spec.tsx` plus the actual changed owner's tests | Exact refs, read-only, readiness, replacement and mount counts remain correct |
| Package/app types | `pnpm turbo typecheck --filter=./packages/platejs`; `pnpm --filter www typecheck` | Inferred callbacks; no optional SDK/backend imports into generic owners; no distribution drift |
| Public exports | `pnpm brl` if exported files/surfaces change; actual packed-consumer lane when exports change | Removed public mounts have no aliases; retained public subpaths work |
| Registry installation | `pnpm --filter www build:registry`; existing registry create/install runner for affected items | Standalone AI, DnD, and editor-ai artifacts include their required integration and dependencies |
| Docs | `pnpm --filter www check:docs` | English/Chinese kit and custom paths match final code, with no routine mount instructions |
| Existing native selection guard | `pnpm --filter www test:www-browser:chromium tests/browser/dnd.spec.ts` | Drag handle remains excluded from native selection |
| Cross-editor drag | `pnpm --filter plite test:plite-browser:chromium donor/examples/plate-dnd-cross-editor.test.ts` | Move/copy, bystander isolation, and native cursor behavior pass |
| Actual copied UI | Verify Plate: `/blocks/ai-demo`, `/blocks/dnd-demo`, `/blocks/discussion-proof`, editor-ai block, homepage and the changed huge-code-block route | AI submit/stream/cancel/retry and comment completion; drag/drop/scroller/selection; desktop and narrow viewport. Use Chrome for native drag and available Browser for ordinary UI |
| Doctrine | Best API repair; `.agents/rules/plate-ui.mdc`, scoped Vision, applicable teaching, Plate Next version append; `pnpm install`; `node .agents/rules/plate-next/scripts/sync-resources.mjs --check` | Durable kit ownership and hard lifetime laws agree across source and generated mirrors |
| Final scale and closure | Production probe above, focused tests, lint and `pnpm check` | Same frozen workloads/budgets and final source fingerprints; no claim based only on a prototype |

Use the actual registry-create-install runner's supported item arguments when
executing; inspect its help/source instead of inventing flags. Run package and
browser owners serially as required by their runners. If the documented local
React/install corruption signals appear, use the repository's single reinstall
procedure before re-diagnosing product code.

### Three failure scenarios

1. A second view starts a second AI stream or the first view unmount cancels a
   still-authorized sibling. Blast radius: AI edits, previews, comments, and
   shared-view integrations. Gate: controlled stream across separate Plate
   providers, first-owner detach, exactly-once chunk writes, and late completion.
2. A kit creates/replaces the wrong DnD backend, or listeners attach to the wrong
   document and survive detach. Blast radius: every copied editor, cross-editor
   drag, iframe/document boundaries, and page cleanup. Gate: shared-manager and
   standalone installs, ownerDocument/ref replacement, real drag, final zero
   retained resources.
3. Slot replacement/read-only/empty-root handling silently removes integration,
   or automatic setup introduces per-block work. Blast radius: customized kits,
   read-only exports/reviewers, and large editors. Gate: custom slots plus all
   readiness states, no-feature controls, listener/render counters, and matched
   10k full-DOM proof.

A rejected prototype is discarded as one candidate. After implementation starts,
repair or revert this task's whole failed integration packet; do not leave half
its callers on removed APIs or add a compatibility wrapper. Preserve unrelated
checkout work. A failed claimed fix follows the existing Regression interrupt.

Completion Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Complete caller and owner audit | yes | 49 routine mounts in 23 application files; advanced jobs and optional imports reconciled |
| Public cut and automatic lifetime correctness | yes | Local implementation and focused package/application proof pass |
| Adoption and teaching parity | yes | PASS on the recorded source: callers, 8 MDX pages, metadata/output, doctrine 161, mirrors, API manifest and source parity. Subsequent doctrine/compiler changes are tracked as source drift |
| Fresh consumer installation | yes | Six final builds and peer identity checks pass; functional proof checkpoint above |
| Real routes and browser correctness | yes | PASS: AI retry/comment completion, installed editors, native DnD/scroller/selection, desktop and narrow route proof |
| Runtime acceptance and production scale | yes | OPEN: all 22 timing cohorts and 11 profiling cohorts collected; timing misses and unchanged-source control failures leave acceptance inconclusive |
| Strict Plite, browser matrix, root check | yes | Strict Plite PASS (sept8-audit3-strict.log); five-project browser matrix PASS using matching complete cached receipts (sept8-audit4-matrix.log). Root/WWW FAIL on recorded formatting/lint and PlateBlockInsertOptions classification. Current-checkout closure remains open |
| Autoreview / publication | no | `next`; no publication authority |
| Source receipts and checklist reconciliation | yes | Recorded fingerprints and concurrent drift preserved; completion checker remains incomplete until current-source closure and timing acceptance pass |

Phase / pass table:

| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| 1. Prove automatic ownership | lifetime proof complete; timing open | Core and actual-kit tests, 11 preflight shapes, 22 timing cohorts and 11 profiling cohorts; same-path timing controls remain inconclusive | Resolve timing acceptance; all measurements and counters are collected |
| 2. Adopt and hard-cut | implementation complete | All 49 routine mounts removed across 23 callers; package/app types and lifecycle proof | Preserve final source identity through closure |
| 3. Installation, teaching and final proof | in progress | Recorded-source docs, registry, doctrine, six fresh builds/interactions and route proof pass; latest direct types and verifier contracts pass. Receipts reconciled | Resolve timing acceptance and final-source aggregate/browser closure |

Verification evidence:

- Baseline on September 6: 33 lifecycle/comment tests, 243 assertions across
  [lifecycle](./artifacts/2026-09-06-kit-owned-ai-and-dnd-lifetimes/baseline-lifecycle.log)
  and [comments](./artifacts/2026-09-06-kit-owned-ai-and-dnd-lifetimes/baseline-comments.log).
  These certify the original explicit-owner fixture only.
- Recorded-source focused proof: core/DnD 67 tests; DnD SSR 1; Plite
  selection/provider 89; AI command/preview 43; actual-kit lifecycle 30.
  Final retained receipts and source fingerprints must match any later runtime edit.
- Native AI retry proof covers early cancellation, one explicit restart,
  accepted content, and follow-up typing. Cross-editor Chromium proof passes
  all 3 cases with no skips. Homepage native-selection guard passes after a
  plain-HTML-controlled test coordinate repair; product selection code is unchanged.
- Six fresh install receipts include actual builds and consumer peer identities.
  Functional tests use their production servers, with controlled demo AI fallback;
  no external model-service reliability is claimed.
- [Earlier source and serving-build fingerprints](./artifacts/2026-09-06-kit-owned-ai-and-dnd-lifetimes/final-source-fingerprints.json)
  reconcile all 23 callers and zero remaining mounts. Final full-workload
  [preflight](./artifacts/2026-09-06-kit-owned-ai-and-dnd-lifetimes/final-preflight-receipt.json)
  passes all 11 shapes; its one sample per variant is correctness-only.
- Earlier recorded-source [www types](./artifacts/2026-09-06-kit-owned-ai-and-dnd-lifetimes/final-www-typecheck.log),
  [root check](./artifacts/2026-09-06-kit-owned-ai-and-dnd-lifetimes/final-root-check.log),
  [strict Plite](./artifacts/2026-09-06-kit-owned-ai-and-dnd-lifetimes/final-check-plite.log),
  and [closure browser matrix](./artifacts/2026-09-06-kit-owned-ai-and-dnd-lifetimes/final-browser-matrix.log)
  pass. The matrix explicitly records its source-matched cached non-Chromium
  lanes; those are reused receipts, not new device or browser runs.
- Earlier resumed [root check](./artifacts/2026-09-06-kit-owned-ai-and-dnd-lifetimes/resumed-root-check.log),
  [www types](./artifacts/2026-09-06-kit-owned-ai-and-dnd-lifetimes/resumed-www-types-after-build.log),
  [React suite](./artifacts/2026-09-06-kit-owned-ai-and-dnd-lifetimes/resumed-react-full.log),
  and [six installed consumers](./artifacts/2026-09-06-kit-owned-ai-and-dnd-lifetimes/resumed-install-receipt.json)
  pass. The [midrun source audit](./artifacts/2026-09-06-kit-owned-ai-and-dnd-lifetimes/resumed-midrun-source-drift.json)
  records 24 differences from the immutable timing export, including the separately
  pinned probe-metadata edit. AI/DnD source and the timing harness remain matched.
- No commit, push, PR, release, cross-project sync, or native-device claim.
- Closure command after every required gate passes:
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-06-kit-owned-ai-and-dnd-lifetimes.md`.
  Structural success alone cannot certify runtime acceptance.

Reboot status:

| Question | Answer |
| --- | --- |
| Where am I? | Local implementation and teaching applied; final acceptance in progress |
| Where am I going? | Resolve timing acceptance and the recorded root/WWW failures |
| What is the goal? | Kit-owned AI/DnD setup with no routine caller mounts |
| What is known? | Automatic lifetimes, 49-mount caller cut, six fresh installs/interactions, desktop/narrow behavior, recorded-source broad checks, matched timing/profile snapshots and source drift |
| What remains open? | Root/WWW checks and timing acceptance. Strict Plite, matching cached browser matrix, and fresh full-editor resize replays pass |

Open risks:

- Timing controls previously exceeded the frozen limit on unchanged sources.
  No regression or performance acceptance follows from those runs.
- Full final-source acceptance requires every applicable row in the obligation
  table; focused behavior and install builds alone cannot close the goal.
