# Feature-owned decoration styling

Objective:
Implement feature-owned transient decoration styling through one optional Plate decorate.attributes field, adopt Comments, Find and Yjs, and prove the final contract.

Goal plan:
docs/plans/2026-09-08-feature-decoration-styling.md

Template:
docs/plans/templates/plate-plan.md with performance-observability obligations scoped to the attribute-lowering design probe.

Mode:
standard; local implementation authorized by the user's “ok go”. No publication, checkout changes, or scheduling.

Completion threshold:
All three implementation slices are delivered and their affected contract, appearance, performance, documentation and generated-output checks pass. Broader verification results are retained with complete denominators and matched controls; unchanged native-input failures and uncovered IME/clipboard behavior are explicit limits, not green gates.

Verification surface:
Plate decoration types, configuration/stage composition, shared live/static lowering, Comments/Find/Yjs copied integration, generic Editor styles, existing rendering tests and a disposable attribute-lowering probe.

Constraints:
Preserve the current checkout and source owners; change only the accepted implementation, adoption, teaching and proof owners. No commit, push, PR or public messages. Inferred callback types, source lifetime, exact-view context, static output and native text behavior are mandatory gates.

Boundaries:
The accepted adoption ledger defines implementation scope. Preserve data-only Plite decorations, source observation/locality, exact-view context, event delegation and custom Yjs caret components. Custom inline React markup is a separately scoped capability; no new renderer, store, cache, theme package or plugin is needed here.

Blocked condition:
A required external capability unavailable after concrete attempts can block its proof claim. In-scope implementation and verification failures remain work to resolve.

Plate Plan state:
- status: done
- phase: local implementation and evidence reconciliation complete
- next: no remaining implementation within this styling scope; broader native-input and test-typing limits are listed below
- handoff: docs/plans/artifacts/feature-decoration-styling/execution-report.md

Execution checklist:
- [x] Slice 1: inferred Base/React inputs, safe attributes, composition and required reader.
- [x] Slice 1: canonical merge and shared live/static lowering, exact view, observer lifetime, errors and identity.
- [x] Slice 1: production lowering rerun against the frozen cost contract, preserving planning receipts.
- [x] Slice 2: capture baseline appearance; adopt Comments live/static, Find and Yjs and remove skin coupling.
- [x] Slice 2: package and copied consumer proof, real desktop/narrow routes, independent static and native input; broader red cases and missing IME/clipboard coverage are retained in the execution report.
- [x] Slice 3: current public docs, affected source doctrine, smallest Vision owner and appended doctrine version.
- [x] Slice 3: registry/barrel/rule generation, source-first types, lint and source mirror checks.
- [x] Reconcile every adoption/proof row and original owner checklist; verify receipts and complete this same goal locally.

Work Checklist:
- [x] Read Poteto principles and applicable planning/prototype methods; use the local Task/Plate Plan adapter and sequential investigation.
- [x] Capture the user's ownership correction, planning-only authority, one goal, and source/proof obligations.
- [x] Inspect current semantic source, copied presentation and shared lowering owners.
- [x] Compare existing read wrapping, one decoration field and a separate rendering field; choose the smallest useful target.
- [x] Prove configuration composition and attribute output with a disposable source-backed probe.
- [x] Freeze normal/large/stress/pathological cohorts, budgets and noise rules before cost measurement; record source identities and deterministic work.
- [x] Enumerate copied consumer, public type/docs, doctrine and generated-output adoption.
- [x] Define concrete execution slices, native/live/static checks and final production cost rerun.
- [x] Reconcile applicable original skill/template checklists and prepare a self-contained handoff.

Method obligations:
- Best API and Plate Plan own public shape and adoption. Existing Plite ranges/attributes and Plate source lowering remain the first reuse candidates. No backward-compatibility path is required for a new optional field.
- Benchmark pre-acceptance probe is embedded in this goal. Its claim is attribute-lowering cost and output only; full browser/native proof belongs to implementation.
- Laziness Protocol rejects a second presentation owner or subscription. Build the Lever produces the disposable rerunnable comparison.
- Architect alternatives are examined sequentially under the user's tool mapping; no independent agent/model review is claimed. Grounding uses the preceding source review and current source. The selected design was implemented after the user authorized execution; rejected prototypes remain evidence rather than product code.
- Task/Autogoal and the repository template own lifecycle. Upstream multi-PR scheduling, branch, spawn, review and publication recipes are inapplicable. No Autoreview on next.
- Best API doctrine repair must ship with implementation: repair affected source rules, smallest Vision owner, append Plate Next doctrine version, regenerate mirrors. Execution repaired those source owners, appended doctrine version 172 and regenerated mirrors.

Decision trail:
- Canonical checkpoint log: `docs/plans/artifacts/feature-decoration-styling/decisions.tsv`. Evidence pointers and claims were checked against this task's actual source/probe actions; no independent review is claimed.
- 2026-09-08: Prior source review established that inline markup is restricted but CSS attributes and Yjs custom carets already work. The immediate job is feature styling ownership and configuration ergonomics.
- 2026-09-08: Candidate is one optional decorate.attributes input lowered after semantic read. Object and callback forms must serve actual Comments/Find and Yjs jobs; configuration must preserve read/observe.
- 2026-09-09: The disposable probe passed composition/correctness and all 16 frozen cost packets. Selected one optional decorate.attributes field. Production implementation, visual parity and public type inference remain execution work.

Decision brief:
- Outcome: installing a copied feature supplies its decoration styling. Editor and EditorStatic do not contain Comments or Find selectors.
- Chosen shape: `decorate: { read, observe?, attributes? }` in Plate. `attributes` accepts a safe attribute object or a pure callback receiving the inferred plugin context, current entry and decoration. It contributes attributes after the semantic read.
- Maximum justified cut: remove Comments/Find selectors from generic editor skins and the copied Yjs read-wrapper plumbing. Retain the single existing decoration source and shared lowerer. Add no public renderer, theme map, source manager, cache, subscription or plugin.
- Separate capability: custom inline React markup remains a real Plite rendering limitation. It has no required consumer in this styling task and is excluded. Yjs caret JSX and Widget geometry already support custom caret/label UI.

Public call sites (implemented and typechecked):

```tsx
import { BaseFindPlugin } from 'platejs/find';

const FindPlugin = BaseFindPlugin.configure({
  decorate: {
    attributes: {
      className:
        'rounded-[2px] bg-yellow-200 text-inherit data-find-active:bg-orange-400! data-find-active:ring-1 data-find-active:ring-orange-600',
    },
  },
});
```

The actual copied FindKit supplies this configuration together with its existing FindBar slot. The example isolates the public configuration job; it does not introduce another exported Find descriptor or plugin array.

```tsx
import { YjsPlugin as YjsPluginBase } from 'platejs/yjs/react';

export const YjsPlugin = YjsPluginBase.extend({
  decorate: {
    attributes: ({ decoration, read }) => {
      const clientId = Number(decoration.key);
      const cursor = read.remoteCursor(clientId);
      return {
        style: {
          backgroundColor: `${cursorColor(clientId, cursor?.data)}33`,
        },
      };
    },
  },
  slots: { afterEditable: RemoteCursorOverlay },
});
```

Here `cursorColor` and `RemoteCursorOverlay` are existing declarations in the copied remote-cursor file. The inherited plugin read portal supplies remoteCursor. The callback must not scan all cursors or introduce a cache; source observation already invalidates affected ranges on metadata changes.

Contract:
- The resolved `Decorate<C>` still requires `read`. Constructors cannot create a decoration capability from attributes alone.
- Configuration and later author stages may patch attributes on an existing decoration capability without repeating read/observe. Model that distinction in the Base and React input types; do not relax the resolved type or add callback parameter annotations/casts to consumers.
- `attributes` is a safe object or `(context: BasePluginContext<C> & { entry: NodeEntry; decoration: PliteDecoration }) => PliteDecorationAttributes`. `null` clears inherited presentation using the existing nullable configuration convention. Callback arguments are inferred.
- The semantic reader determines membership, ordering, keys and ranges. Presentation cannot add/remove decorations or modify their ranges through its return value. Keep the data-only Plite shape unchanged.
- Lower presentation once per returned decoration in the existing source read. Empty reads perform no presentation calls; an absent/null field preserves the reader/result identity and bypasses mapping.
- Merge classes by concatenation and styles shallowly; later presentation fields win other attributes. Preserve untouched semantic identity attributes. Follow the existing mergePlateRenderedAttributes behavior, including undefined handling, rather than installing a Tailwind merger in the package. Terminal configuration of the presentation object follows existing nested configuration precedence.
- Reuse the pure merge algorithm. If sharing the current helper requires it, move only that pure function out of react/internal/rendered-attributes.tsx into a neutral private owner; React hooks/providers stay in their current file. Do not import React into static decoration lowering to reuse a utility.
- The callback is synchronous and hook-free, with no additional observation. Changing external input requires the owning source's existing observation contract. Callback exceptions propagate through the same source-read error path; do not swallow failures or silently remove paint.
- Both Plate and PlateStatic continue using getPlateDecorationSources. Preserve the exact editor/view context supplied to read; never capture the wrong Editable at presentation configuration time. Static rendering performs no observe subscription.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Feature paint configuration | Generic skin selectors or manual read-wrapper | Optional decorate.attributes object/callback | Plate plugin input and shared lowerer | Hides semantic read/observer plumbing for a real existing styling job | Base/React input types and three copied families | Runtime composition probe; inferred type cases during execution | Wrong patch shape could erase read/observe | rearchitect |
| Generic editor skin | Comments and Find selectors mixed with editor mechanics | Only general editor and neutral Plite DOM presentation | Copied Editor/EditorStatic | Feature installation owns its presentation | Remove only Comments/Find selectors after adoption | Real isolated feature routes and static overlap rows | Removing styles before callers configure them | cut |
| Yjs presentation | Copied wrapper calls semantic read then maps output | Pure attributes callback plus existing caret slot | Copied remote-cursor-overlay | Same feature owner and no manual observer preservation | Replace wrapper; retain cursorColor and RemoteCursorOverlay | Metadata/reconnect/unmount and caret geometry cases | Accidentally losing observer or slot | cut |
| Inline React components | Attribute-only Plite rendering | No change in this task | Plite React | CSS job is already representable; carets have Widget geometry | Separate future plan only with a concrete markup consumer | Current source review | Expanding scope into native text rendering | keep |
| Code syntax and Markdown preview | Styling is already in copied feature source | Retain current local ownership | Copied code-block and preview example | No shared Editor dependency or read-wrapper friction to solve | No conversion for API uniformity alone | Named-leaf inventory reconciliation | Unnecessary semantic/style churn | keep |

Rejected alternatives:
- Keep all selectors in Editor: lowest mutation cost but preserves the feature coupling the user identified.
- Move each feature to a hand-written decorate.read wrapper: works today, but authors repeat range mapping and observer preservation for a styling-only job. Retain read as the semantic output API, not the normal styling customization recipe.
- Reuse render.attributes for decorations: that contract receives document node/mark props. Overloading it would mix document rendering and transient range rendering.
- Add render.decorationAttributes or render.decoration.attributes: introduces another cross-namespace rendering stage for the same source responsibility. One field under decorate is smaller and discoverable beside read/observe.
- Restore leaf components or build a theme/styling registry: neither is needed for safe CSS attributes, and both add a second owner.

Adoption ledger:
| Owner | Exact adoption |
| --- | --- |
| `packages/platejs/src/lib/plugin/BasePlugin.ts` | Extend resolved and erased decoration contracts; update PartialBasePlugin and capability-aware author/configuration inputs. |
| `packages/platejs/src/lib/plugin/defineBasePlugin.ts`, `basePluginCompiler.internal.ts`; `packages/platejs/src/react/plugin/PlatePlugin.ts`, `definePlatePlugin.ts` | Carry inferred decoration presentation through Base/React constructors, extension stages, configure and normalized definitions. Change only relevant input paths; keep one resolved contract. |
| `packages/platejs/src/internal/plugin/getPlateDecorationSources.ts` | Apply the optional attributes at existing read lowering; preserve observer forwarding and supplied view context. |
| `packages/platejs/src/internal/plugin/resolvePlugin.ts`, `internal/utils/mergePlugins.ts` | Existing merge/reapply behavior passed the probe. Keep runtime composition unless execution exposes a concrete missing case; add focused contract coverage. |
| `apps/www/src/registry/components/editor/find.tsx` | Put complete ordinary/active match classes on FindKit's existing configured descriptor. |
| `apps/www/src/registry/components/editor/comment.tsx` | Export the live comment decoration attribute preset beside copied Comments UI; configure it at current factory call sites. No new factory/kit solely to forward options. |
| `apps/www/src/registry/components/editor/comment-static.ts` (new pure copied static item) | Export a static attribute preset without client hooks/React imports. Its independent job is static comment range presentation; preserve current static normal/overlap styles without adding live hover/active behavior. Wire registry metadata/dependencies for the new static item. |
| `apps/www/src/registry/examples/discussion-demo.tsx`, `registry/blocks/editor-ai/components/editor/plate-editor.tsx` | Configure the live comment attributes together with each existing slots/shortcut configuration. |
| `apps/www/src/app/(blocks)/blocks/discussion-proof/discussion-proof.tsx` | Apply live attributes to interactive and read-only Plate instances, static attributes to the independent static snapshot. Preserve separate editor/anchor owners. |
| Copied Comments/Discussion and chat lifecycle tests | Preserve production-equivalent descriptor configuration where visual output matters. Keep bare package tests headless. |
| `apps/www/src/registry/components/editor/remote-cursor-overlay.tsx` | Replace read wrapping with attributes callback; keep shared color resolver, keyed cursor lookup and afterEditable slot. |
| `apps/www/src/registry/components/editor/editor.tsx`, `editor-static.tsx` | Delete Comments/Find selectors after consumer adoption. Keep inactive-selection/drop-cursor and other generic editor styles. |
| `content/docs/(guides)/plugin.mdx`, `content/docs/api/core/plate-plugin.mdx`, plugin Find/Comments/Yjs pages and their existing `.cn.mdx` mirrors | Teach current attributes configuration, ownership, inference and read/observe responsibilities; remove the statement that Editor owns Find styling. Update generated API examples through their generator. |
| `.agents/rules/best-api.mdc`, `plate-ui.mdc`, `plate-plugin-creator.mdc`, `plate-plan.mdc`; `docs/vision/plate.md` | Repair the normal copied styling recipe and feature colocation law. Preserve Plite's data-only contract in docs/vision/plite.md; change no raw Plite API doctrine. Append the next Plate Next doctrine version using its current source/version helper, retaining historical entries and package attestations. |
| Registry/barrels/docs generation | Regenerate registry output on next; run pnpm brl when file/export changes trigger it; pnpm install regenerates rule mirrors. Do not edit generated SKILL.md, registry JSON, API metadata or templates manually. |

Scope denominator:
- Three feature families adopt the optional field: Comments, Find and Yjs.
- The prior complete removed-leaf inventory is reconciled: Comments live/static and SearchHighlightLeaf are the three relevant removals; CodeSyntaxLeaf/live-static-DOCX (three) and PreviewLeaf (one) already have feature-local paint and stay in place. The ten retained leaf names remain outside this change.
- Generic Plite inactive-selection/drop-cursor styles remain in the editor skin because their owner is the exact Editable lifecycle, not an optional Plate feature.
- Comments is not added to the default BaseEditorKit: it requires an explicit anchor source. Static styling is configured only where Comments is installed.

Execution slices:
| Slice | Owner | Entry | Work and exit | Focused proof |
| --- | --- | --- | --- | --- |
| 1. Add and prove the field | Plate Plugin Creator with Best API | User authorizes execution; reread changed owners and capture current route/style baseline | Add typed object/callback/null input and shared lowering; preserve existing source lifetime, context and absent-field identity. Add the exact public-shape and merge/error cases. | Base and Plate constructor/extend/configure inference, no-read rejection, terminal precedence, semantic identity preservation, absent/empty/error paths, one observer, independent editor/view context, live/static output. Rerun frozen probe through implemented lowering. |
| 2. Adopt copied features and remove skin coupling | Plate UI | Slice 1 package contracts pass | Configure Comments live/static, Find and Yjs; remove global Comments/Find selectors and Yjs wrapper; keep all current UI behavior, slot composition and optional feature installation. | Isolated feature imports, color overrides, overlap/hover/active rules, Find navigation, independent static output, Yjs metadata/reconnect/carets, comment channel lifecycle. |
| 3. Prove and teach the final contract | Verify Plate, Technical Writing, Best API repair | Slice 2 real route checks pass | Update current docs/source doctrine, version and regenerate; verify final source and browser behavior, then reconcile every adoption row. | Owned package tests/typechecks, final probe, desktop/narrow real routes, registry/docs checks, source-mirror parity and complete plan receipts. No commit/push/PR without separate authority. |

Proof matrix:
| Claim | Execution proof and owning command |
| --- | --- |
| Public API inference and safe attributes | Use `packages/platejs/type-tests/decoration-attributes-contracts.ts` for Base and React compile-only contracts; run `pnpm --filter platejs typecheck:entrypoint:root`, `typecheck:entrypoint:react`, `typecheck:entrypoint:static`. Exercise object, callback, null, configured inherited stages, existing source and constructor-without-read rejection. |
| One shared read path and correct source lifetime | Focused lowering/resolvePlugin contracts, `pnpm --filter platejs test:partition:core`, `test:partition:react-core`, `test:entrypoint:static`; include callbacks that throw, ordered overlaps, and two editors/views with different context. |
| Feature behavior | `pnpm --filter platejs test:partition:comments-react`, `test:partition:find`, `test:partition:yjs-react`; relevant copied component specs through the existing www test setup. |
| Comments appearance and native input | Existing `apps/www/tests/browser/comment.spec.ts`; actual Browser `/blocks/discussion-demo` and `/blocks/discussion-proof`. Ordinary, hover, active, nested overlaps, read-only reviewer, independent static snapshot; type through an overlap and exercise undo/redo. The existing files do not cover IME or clipboard copying; those planned assumptions were incorrect and those claims remain unverified. The report retains exact native-input failures and old-styling controls. |
| Find and Yjs | `pnpm --filter www test:www-browser:chromium tests/browser/transient-editor-geometry.spec.ts`; actual Browser `/blocks/find-demo` and `/blocks/collaboration-demo`. Find inactive/active/next/previous/clear; remote selection color/name update, collapse, reconnect, unmount, exact-view caret. |
| Static and narrow output | Static preset preserves ordinary/overlap appearance without active/hover UI or observers. Repeat affected routes at narrow viewport and inspect console after final generation. Viewport proof is not raw mobile-device proof. |
| Zero generic-skin feature coupling | Source scan has zero data-comment/data-find selectors in Editor/EditorStatic; feature-only installation still paints in a minimally styled host. Do not write a removal-assertion test. |
| Output and teaching | Root AGENTS generation/lint rules, `pnpm --filter www build:registry`, applicable source/API/docs checks; source-owned rule mirror/version verification. Use source-first typechecks and the existing failure policy. |

Scale contract and planning evidence:
- Frozen contract: `docs/plans/artifacts/feature-decoration-styling/probe-contract.json`; executable: `probe.ts`; receipt: `probe-result.json`.
- Command: `bun docs/plans/artifacts/feature-decoration-styling/probe.ts`.
- Source identities include actual lowerer, resolver, merge utility, public contract and copied Yjs source, plus probe/contract hashes. Runtime/machine versions and all raw samples are recorded.
- Normal/large/stress/overlap cohorts exercise 100/10,000 entries, 2/4/32 sources, 2/4/8/128 ranges per entry, full enumeration and one-entry refresh. Each comparison uses 5 warmups and 30 alternating paired samples; cold timing is reported once. All 16 packets pass the predeclared thresholds.
- Deterministic work: same source reads, range count/order/identity fields; one attribute merge and replacement decoration per returned range when enabled; no added observation, subscription, cache or DOM work. No-field and empty paths preserve result identity. The probe invokes one changed entry directly; it does not independently prove the existing manager's refresh scheduling.
- Selected results: large static full enumeration adds about 18.27 ms for 160,000 returned ranges; stress static full enumeration adds about 299.35 ms for 2.56 million returned ranges. Dynamic stress p95 is 375.36 ms versus 365.42 ms for the current-style wrapper control. Targeted adapter refresh p95 stays at or below 0.10 ms in these cohorts. These are attribute-lowering timings, not editor interaction latency.
- The attribute field is optional and the unstyled path bypasses mapping. No speedup or zero-overhead claim is made. Production acceptance must retain the frozen per-range/dynamic/refresh budgets and validate actual rendering on the affected routes.
- Final rerun: adapt the disposable probe's target selection to the implemented getPlateDecorationSources path while retaining the frozen baseline/contract and samples; run the same command and record a new production-source receipt. Do not overwrite the planning receipt. The final target must include real callback context lookup and the production merge helper.
- Full product/browser performance, DOM mapping, native selection and visual parity are execution gates. No production detector is added for a synchronous optional attribute projection; existing deterministic source/renderer tests and browser performance owners cover regression detection without user content telemetry.

Risk and rollback answers:
- A shallow or mistyped patch can drop read/observe. Preserve the resolved required-reader contract, require constructor/extension/configuration tests and assert one observer/cleanup through metadata changes.
- Moving classes can change specificity, overlap depth, active precedence or static hover behavior. Capture current behavior first, keep live/static presets explicit, and verify computed styles on original ordered nested decoration spans. Introduce no new DOM wrappers.
- Additional mapping can defeat retained output locality or duplicate view work. Preserve absent-field identity, unchanged semantic references and source scheduling; assert calls per returned range and rerun final rendering/performance tests. No cache is accepted merely to hide a failed measurement.
- A callback can read the wrong editor view or scan all peers. Forward the supplied view context and use the existing keyed read.remoteCursor lookup; test multiple editors and metadata refresh.
- If a gate fails during implementation, keep the local change unaccepted and fix its owning layer. Do not ship both global selectors and plugin styles as permanent fallback. Reverting this optional field requires reverting its copied configuration before removing the field; it does not require data migration.

Completion gates:
| Gate | Execution result |
| --- | --- |
| Live owners / one responsibility per owner | Complete: one existing source lowerer, one shared pure merge, feature-owned copied presets; Plite unchanged. |
| Best API alternatives / public shape | Complete: one optional object/callback/null field, inferred Base/React inputs, required semantic reader and no second renderer or observer. |
| Scale-sensitive target | Complete: final production lowerer passes 16/16 frozen packets, with all source hashes matching. Cost and claim limits are recorded in the execution report. |
| Public adoption | Complete: Comments live/static, Find and Yjs plus current callers, docs and generated registry output. Generic skins have zero feature selectors. |
| Package and source proof | Complete for affected contracts: 958 tests across runtime owner runs, public type contracts, root/react/static and www source types pass. The 52-case profile overlaps those tests. |
| Real-route styling and static output | Complete: original colors and nested/active behavior retained; independent static output paints without observation; custom Yjs caret/label survives. Desktop and narrow results are recorded. |
| Broader native and test-typing checks | Limited: browser run 19/32 pass, 11 fail, 2 skip. Nine affected failures reproduce with the old styling; two Link failures are outside scope. Broad test typing retains 66 diagnostics; the old overload control has the same 66. No full native-history, IME or clipboard certification. |
| Teaching / source generation | Complete: English/Chinese docs, API metadata, source rules, Plate Vision, doctrine 172, mirrors, registry and barrels. Source/registry/docs checks and scoped lint pass. |
| Review authority | Self-check and Best API semantic review only; Autoreview N/A on next. No independent-agent review claimed. |
| Plan checker | Final checker verifies reconciliation only; it does not turn the documented red broader checks into passing behavior. |

Final handoff:
- Implemented the optional Plate decorate.attributes object/callback/null field with inferred context and shared live/static lowering.
- Adopted Comments, Find and Yjs, including a pure copied static Comments preset. Removed their generic editor styling and the Yjs read-wrapper plumbing; retained the custom caret component.
- The source, copied consumers, current docs, source doctrine, version and generated output are complete locally. The user authorized implementation with “ok go”; no commit, push, PR or publication occurred.
- Evidence: docs/plans/artifacts/feature-decoration-styling/execution-report.md and its execution-receipt.json enumerate results, source hashes, command routing gaps and unchanged broader failures.
- All in-scope source defects found during execution were corrected, including the static proof snapshot's subscription dependency, the shared merge helper's existing placeholder input and the proof page's prerender boundary. The broader input/history and unrelated test-typing owners were not expanded into this styling task.

Verification evidence:
- Public type contracts and affected runtime owner partitions pass. Copied Yjs proof covers color metadata, range changes, collapse, disconnect/reconnect and cleanup; the real browser separately proves caret geometry.
- The initial complete 32-row browser result, nine-row old-style control, five passing focused rows and final eight-row proof-page rerun are preserved. The final rerun has six passes and the same touch-fixture and out-of-scope Link failures.
- Interactive readback covered discussion-demo, discussion-proof, find-demo and collaboration-demo. Measured widths, computed colors, independent static spans, no overflow and the final fresh console check are recorded without treating viewport proof as a raw device test.
- The production probe passed 16/16 packets after the final helper type correction; every recorded hash was compared with the final files. Planning and rejected production receipts remain intact; no budget was relaxed.
- Registry generation/check, docs/API checks, root/react/static and www source-first types, doctrine/mirror checks, focused timings, scoped lint and whitespace checks passed. No build-artifact, hosted, release or all-suite-green claim is made.

Open risks:
- Nine broader browser failures reproduce when the new lowering is disabled and the old generic styles are restored. They remain failures. The two unrelated Link failures have no matched control in this task, and two main-baseline comparisons lack their separate host.
- Existing selected browser files do not provide the planned IME or clipboard proof. Complete native-input parity remains unverified; this local completion covers the optional styling field and its adoption.
- Whole-package test typing has 66 diagnostics outside the focused affected contracts. Removing the new extension overload restriction leaves the same diagnostics; this is a bounded control, not a clean-checkout certification of every error.
- Static attribute projection adds bounded per-range work. The recorded source-lowering comparisons do not predict end-to-end editor latency or promise zero overhead.
