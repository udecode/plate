# Fixed toolbar scrollport layout

This is a project-owned file template under Task. Apply the project's standing Autogoal request for long-running work unless the user opts out. Apply `.agents/rules/task/references/workflow.md` to timing, publication and review rows. Relevant domain and executable-validator gates remain required; mark unrequested publication/review N/A.

Objective:
Replace the fixed toolbar's measured scroll-padding workaround with a copied UI layout in which the toolbar and editor scrollport are separate siblings, while preserving the registered `EditorContainer` DOM/ref contract, shared toolbars, bounded demos, and AI review-menu scrolling.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-09-16-fixed-toolbar-scrollport-layout.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- Best API call-shape and hard-cut review for `EditorFrame`, `EditorContainer`, `FixedToolbar`, and plugin-slot ownership.
- Verify Plate implementation-review and browser-proof requirements for layout, geometry, shared-editor availability, and generated registry consumers.

Mode:

- `standard`: the owner is resolved, but adoption crosses copied UI, examples, docs, generated registry output, install consumers, and browser geometry.

Completion threshold:

- Binary readiness: live claims sourced, one owner per responsibility, every decision resolved, every public break has adoption and proof, execution slices are concrete, conditional gates are resolved, and `check-complete` passes.

Verification surface:

- Planning: live-source census of `EditorContainer`, `variant="demo"`, `FixedToolbarPlugin.configure`, `beforeEditable`, manual/shared toolbars, docs, registry metadata, and existing AI browser proof; review-ledger reconciliation; Autogoal plan validation.
- Execution: focused Bun DOM tests; deletion/source searches; `pnpm --filter www build:registry`; `pnpm --filter www check:docs`; `pnpm --filter www test:create-install editor-basic editor-ai`; focused www lint/type checks; serial Chromium for exact AI and shared-toolbar cases; native Chrome replay of the reported AI route and final scroll position.

Constraints:

- Execution was authorized after plan review and completed in this checkout.
- No compatibility alias for `EditorContainer variant="demo"`, hidden wrapper that retargets its DOM props/ref, or runtime shim for the removed toolbar-padding protocol.
- Keep package `platejs` slot and scroll-element contracts unchanged. This is copied Plate UI composition, not a Plite obstruction API.
- Preserve unrelated dirty-checkout work and existing AI temporary-draft behavior.
- Generate registry files through `pnpm --filter www build:registry`; never edit them by hand.

Boundaries:

- In scope: `EditorFrame` and `EditorContainer` copied UI contracts; fixed-toolbar presentation and plugin placement; every bounded/custom fixed-toolbar composition; old demo-height adoption; manual/shared toolbar examples; English/Chinese teaching; generated registry output; installed `editor-basic`/`editor-ai` consumers; DOM and browser proof.
- Source owners: `apps/www/src/registry/components/editor/editor.tsx`, `fixed-toolbar.tsx` and focused specs; `plugins.ts`; affected blocks/examples and discussion proof; toolbar and installation docs; registry metadata/generated output; `apps/www/tests/browser/ai-session.spec.ts` plus a shared-toolbar browser owner.
- Non-goals: editor state, AI draft/session policy, floating toolbar behavior, comment/select input layouts, generic slot semantics, toolbar buttons, Plite scrolling, package exports, and the independent duplicated `Editor` content `demo` style.
- Direct Plite boundary owners: read-only evidence. `packages/plitejs/src/react/components/editable.tsx` keeps explicit CSS scroll-padding support; `packages/platejs/src/react/components/PlateContainer.tsx` keeps the actual scroll-element registration and sibling slots.

Output budget strategy:

- Use the 62-render-site/50-file census and 29-file old-demo census as adoption denominators. Inspect materially different categories in full and use bounded searches for repetitive examples and generated output.

Blocked condition:

- Block only if `beforeContainer` cannot compose inside a copied frame, or a current consumer requires `EditorContainer` DOM props/ref on an outer non-scrolling panel. Live source shows neither: the slot is beside the registered main container, while callers place ARIA, height, border, overflow, and scroll semantics on that main container.

Plate Plan state:

- status: complete
- phase: acceptance
- next: none
- handoff: complete

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | User requested a design plan separating fixed-toolbar layout from the editor scrollport after rejecting measured geometry. |
| Task plan and execution authority verified | yes | This turn is planning-only; product edits are excluded. |
| Current owners read | yes | Copied editor/fixed-toolbar sources/specs, package slots, 62 render sites, 29 old-demo files, overrides, shared/manual examples, docs, registry metadata, and AI proof inspected. |
| Best API target resolved | yes | Keep the semantic scroll primitive; add one higher composition, `EditorFrame`; use existing sibling slots; delete measurement. |
| Runtime scale applicability resolved | yes | Source-backed zero-runtime N/A: remove subscription, effect, `ResizeObserver`, geometry reads, and style writes; add static DOM/CSS only. |
| Pre-acceptance Benchmark probe selected | N/A | No retained repeated runtime work or performance claim; browser assertions own correctness geometry. |
| Mode and execution boundary resolved | yes | Standard plan; stop after validated handoff. |

Work Checklist:

- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one Best API verdict before target lock.
- [x] Scale-sensitive target gate is source-backed zero-runtime N/A because runtime measurement is deleted and only static layout remains.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Plite React keeps neutral mechanics; copied Plate UI owns frame activation, height, placement, and styling.
- [x] Public breaks and bridge deletion have complete adoption answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and handoff are resolved.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve all readiness conditions | Target, breaks, adoption denominator, slices, proof, risks, and non-goals are fixed below. |
| Fresh source evidence | yes | Recheck decision-changing claims | Copied/package owners and every current render site were re-read before target lock. |
| Best API review | yes | Resolve P0/P1 call-shape findings | `EditorFrame` separates composition without retargeting `EditorContainer`; effect extraction, internal wrapping, duplicated wrappers, and package obstruction APIs are rejected. |
| Pre-acceptance scale proof | N/A | No runtime benchmark | Replacement adds no loop, subscription, cache, timer, observer, or measurement. |
| Production scale rerun contract | N/A | No benchmark rerun | Browser correctness covers bounded geometry; no latency/throughput claim. |
| Conditional risk and adoption | yes | Complete docs, registry, install, browser, and shared-toolbar work | Slices 2-5 own it. |
| Verification recorded | yes | Record plan and execution gates | Proof matrix and evidence below. |
| Handoff prepared | yes | Prepare ownership, breaks, proof, risks, order | Final handoff below. |
| P1 autoreview | N/A | Never run Autoreview on `next` | Verify Plate's source review remains mandatory during execution. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-16-fixed-toolbar-scrollport-layout.md` | Passed on the settled plan. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Owners, contracts, callers, docs, registry, tests, and prior decision read; denominators counted. | Decide |
| Decide | complete | Best API hard cut selects `EditorFrame` plus `beforeContainer`; breaks and non-goals resolved. | Prove and hand off |
| Prove and hand off | complete | Slices, proof predicates, risks, decision update, and handoff prepared. | Execute |
| Execute | complete | `EditorFrame`, static toolbar placement, complete caller migration, docs, generated registry, installed consumers, and AI owned-scroll follow behavior implemented. | Verify |
| Verify | complete | Focused DOM tests, docs/registry checks, Base/Radix installs, fresh Chromium cases, and native Chrome geometry all passed. | Close |

Decision brief:

- outcome: the default fixed toolbar becomes a non-scrolling sibling above the registered editor scrollport, so caret and AI visibility require no height synchronization.
- chosen shape: plain copied `EditorFrame` wraps `FixedToolbar`/`beforeContainer` output and `EditorContainer`; the frame owns the column and height, the container remains the scroll element, and the toolbar is context-free presentation.
- strongest rejected alternative: turn `EditorContainer` into an outer wrapper. That silently moves `className`, `style`, ARIA/role, event handlers, and refs away from the registered scroll element.
- consequence: remove the docs-only container `demo` height contract and migrate bounded heights to `EditorFrame` in one hard cut.

Target call shape:

```tsx
<EditorRoot editor={editor}>
  <EditorFrame className="h-[650px]">
    <EditorContainer>
      <Editor />
    </EditorContainer>
  </EditorFrame>
</EditorRoot>
```

`FixedToolbarPlugin` supplies the toolbar through `slots.beforeContainer`, making it and `EditorContainer` siblings inside `EditorFrame`. Manual toolbars use the same frame. A controller-level shared toolbar remains outside editor frames and may render before selection.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Outer layout | No named owner; selected consumers copy grid/overflow wrappers | Export plain `EditorFrame` from the existing `editor` registry item; full-height, min-height-zero flex column; caller class owns explicit height | Copied `editor.tsx` | Toolbar+scrollport is a higher composition with an independent job | Wrap bounded/plugin/manual compositions; move default/custom heights to frame | DOM/source contract and browser geometry | Indefinite parent height can produce content flow; docs must show explicit bounded height | adopt |
| Scroll primitive | Registered scroll element also owns accidental `h-full`/`demo` panel height | Keep DOM props/ref/ARIA/events on package container; default becomes shrinking `flex-1 min-h-0`; remove container `demo` | Copied `editor.tsx` over package container | Preserves semantic/runtime identity | Migrate all 29 old-demo files; preserve direct comment/select and intentional no-toolbar scrollports | Census, DOM contract, installed consumers | Missed caller changes height/outer scrolling | hard break |
| Fixed toolbar runtime | Editor lookup, scroll lookup, measure, observer, inline padding write/restore | Pure `Toolbar` wrapper with presentation, `shrink-0`, ref/props forwarding | Copied `fixed-toolbar.tsx` | Placement owns obstruction | Delete all runtime coupling and mechanism test | Render before editor selection; deleted-symbol search | Editor-dependent child buttons still need their own context guard | cut |
| Plugin placement | `beforeEditable` puts toolbar inside scrollport | `beforeContainer` puts it beside the package main container inside frame | Default plugin and three configured overrides | Existing slot expresses required topology | Change default, Docx, and two discussion overrides | Source search and browser DOM geometry | Slot change without frame increases bounded total height | adopt with frame |
| Bounded sizing | Heights, grid rows, and overflow policy on scroll element | Height on frame; delete toolbar grid workarounds; leave true no-toolbar scrollports direct | Blocks/examples/proof pages | One layout owner | Classify all 62 sites; migrate old demo and four known workarounds | Zero stale usages; viewport checks | Over-migrating comment/select changes input semantics | adopt by category |
| Manual toolbar | Installation examples have unowned siblings | Frame wraps manual toolbar and container; explicit height only for bounded scrolling | Installation examples/docs | Teaches same law | Update source and EN/CN snippets together | Docs parity/render/install | Code highlights can drift | adopt |
| Shared toolbar | May exist with no selected editor; toolbar itself currently throws | Remains outside frames; only editor-dependent children branch on `useOptionalEditor` | Multiple-editors demo and context-free toolbar | Independent supported job | Keep topology, strengthen proof | Startup/focus/runtime-error browser assertions | Auto-selection may hide null startup | preserve/prove |
| Neutral overlay escape | Plite consumes authored CSS scroll padding | Keep unchanged for deliberate overlays | Plite editable | Valid neutral mechanism | None | No package diff | Accidental package edits broaden scope | preserve |
| Teaching/distribution | Docs teach `beforeEditable`; registry carries old source | Teach `beforeContainer` inside `EditorFrame`; rebuild/install | Docs/registry | Copied API is learned here | EN/CN, generation, two installed blocks | Docs/build/source/create-install | Generated green can hide missing dependency | adopt |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Structural owners | Copied editor/fixed-toolbar | Add `EditorFrame`; retain container scroll identity with shrinking default; remove container `demo`; move plugin slot; delete geometry/editor coupling; replace mechanism spec with context-free/ref behavior | Accepted target | No observer/effect/style mutation; target compiles | Focused Bun specs and deleted-symbol searches |
| 2. Complete adoption | Blocks/examples/discussion proof | Classify 62 sites; migrate 29 old-demo files; move bounded heights; remove four toolbar grid workarounds; update three configured overrides; preserve direct comment/select/standalone scrollports | Slice 1 API | No stale container demo, toolbar `beforeEditable`, or toolbar grid workaround; bounded plugin toolbar has frame | Census, focused types/lint, material source review |
| 3. Teach/distribute | Docs/registry | Update manual/plugin and EN/CN installation snippets; rebuild registry; verify item graph; install `editor-basic` and `editor-ai` | Settled source | Source docs, generated artifacts, and installed consumers agree | `check:docs`, `build:registry`, source check, `test:create-install` |
| 4. User geometry | Playwright/native Chrome | Strengthen full Markdown case for explicit frame/toolbar/scrollport topology, endpoint/menu bounds, model immutability, and outer-page stability; add shared-toolbar startup/retargeting; exercise top/bottom caret and narrow overflow | Fresh served source | Exact AI and shared composition pass | Serial Chromium plus native Chrome at 1010x890 and narrow width |
| 5. Acceptance | Verify Plate | Review final diff and different consumers before final replay; reject reintroduced compensation; run final checks and reconcile decision/adoption state | Slices 1-4 | Ownership accepted and required proof green | Review note, source census, test/browser receipts, ledger check |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Container remains real scroll element | Package composes container and scroll refs on its main `div`; callers place DOM semantics there | DOM/browser asserts overflow element and toolbar sibling | verified |
| Toolbar needs no editor/geometry lifetime | Shared/manual consumers contradict universal selected-scrollport assumption | Render before selection with real ref; zero editor/observer/padding dependencies | verified |
| Plugin layout is separate | `beforeContainer` is outside main container; `beforeEditable` is inside content | Toolbar and scrollport sibling/non-overlap assertion | verified |
| Bounded height is stable | Old height is on scrollport, so slot-only move grows panel | Frame bound remains requested; scrollport gets remaining height | verified |
| AI tail/menu remain visible | Existing exact docs test checks endpoint/menu and source model | Strengthened case plus native Chrome proves endpoint/menu bounds and stable outer scroll | verified |
| Shared toolbar supports null selection | Demo uses `useOptionalEditor` under `EditorController` | Open route before focus, focus each editor, assert no runtime errors | verified |
| Copied consumers receive API | `editor` registry item supplies source to both blocks | Registry build/source check and disposable Base/Radix installs | verified |
| Docs teach one owner | Current toolbar/install snippets teach old placement | EN/CN parity and rendered route inspection | verified |

Scale contract:

- applicability and source evidence: N/A. Current toolbar has one editor lookup, scroll read, layout effect, measure, `ResizeObserver`, and style protocol per mount; target deletes all and adds static DOM/CSS.
- user operation, current owner, proposed owner: mount/resize/selection scrolling moves from toolbar JavaScript compensation to browser layout in `EditorFrame`/`EditorContainer`.
- cohorts/budget/baseline/target timing: N/A; no retained runtime loop and no speed claim.
- deterministic work indicator: zero toolbar-owned observers, effects, geometry reads, and scroll-padding writes.
- correctness/native guard: Chromium and Chrome geometry, caret, scroll, shared-toolbar, and runtime-error assertions.
- final production-path owner/command: `pnpm --filter www test:www-browser:chromium tests/browser/ai-session.spec.ts --workers=1`, or its verified focused `-g` form, against fresh managed source; native Chrome then replays `/docs/components/ai-menu`.

Conditional evidence:

- High-risk scenarios: full Markdown at 1010x890; narrow horizontally overflowing toolbar; first/last-block caret; shared toolbar before focus and after three editor switches; 180/280/360/420/500/650px frames; read-only suppression; page-flow manual toolbar; unframed comment/select.
- External research: N/A. Repository slot/ref contracts and actual callers determine this ownership.
- Issue/PR provenance: N/A. Current local reporter sequence; no publication requested.
- Docs/registry/browser/release/behavior-law: docs, registry, install, and browser apply in slices 3-4. Release/changeset is N/A because no package API changes.
- Performance receipt/rerun: N/A by source-backed runtime deletion; deterministic zero-mechanism plus correctness proof applies.

Findings:

- Package `EditorContainer` is the canonical registered scroll element. `beforeContainer`/`afterContainer` are outside its main `div`; `beforeEditable` is inside it.
- The dirty effect assumes a selected editor always exists, its registered scroll element contains this toolbar, and toolbar height obstructs it. Shared/manual consumers disprove all three.
- Turning registry `EditorContainer` into a frame would break or obscure `className`, style, ARIA, events, and ref ownership. `EditorFrame` earns one noun for the distinct outer composition.
- Adoption is broad: 62 render sites in 50 files, 29 old-demo files, four toolbar grid workarounds, and three configured fixed-toolbar overrides.
- Existing fixed-toolbar coverage proves the mechanism. The existing AI browser case observes the user invariant and should be strengthened.
- `Editor`'s duplicate content `demo` style is independent and excluded.

Decisions and tradeoffs:

- `EditorFrame` is a plain DOM component in the existing `editor` item, with ordinary `div` props and `className`; no `variant="demo"`. Explicit frame height stays at the call site.
- `EditorContainer` keeps scroll ownership. Its default copied style becomes a shrinking flex child; `comment` and `select` keep specialized direct-container jobs.
- `FixedToolbar` is a static `shrink-0` frame row. Retaining `sticky` caused it to overlap the scrollport when the containing docs page scrolled, so callers that deliberately want a page-level sticky overlay must opt into that positioning. It reads no editor state; buttons own their hooks.
- Inline AI preview follow-scroll targets the registered editor scroll element directly. A preview-scoped `ResizeObserver` handles late media/layout growth without scrolling the outer page; the toolbar itself owns no observer, effect, measurement, or style mutation.
- Delete container `demo` instead of aliasing it. Move panel heights to frame; allow reviewed no-toolbar standalone scrollports to keep direct height.
- Existing `beforeContainer` is sufficient; do not add `wrapContainer`, obstruction registry, CSS-variable protocol, or Plite API.

Review fixes:

- Refined the prior anonymous-wrapper sketch to named `EditorFrame` after the caller audit proved internal `EditorContainer` wrapping would retarget public DOM/ref/ARIA props. The noun owns an independent composition and replaces repeated wrappers.
- Expanded adoption from four reviewed consumers to the full census, old demo users, overrides, bilingual docs, generated output, and installed consumers.
- Added shared-toolbar and exact AI geometry proof so mechanism-only tests cannot close the user invariant.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Broad `rg` output truncated | 1 | Split owner/caller/docs/slot inventories and emit compact opening tags | Resolved with bounded denominators. |
| Searched `apps/www/content` | 1 | Resolve docs root with global MDX search | Resolved at `content/docs`. |

Verification evidence:

- Read copied editor/fixed-toolbar owners/specs; package container/content slots, slot types/cache, scroll hooks, and Plite padding consumption.
- Enumerated current container openings, old demo uses, toolbar overrides, grid workarounds, manual examples, and shared toolbar.
- Read registry metadata, EN/CN docs, multiple-editor test, and exact AI scroll Playwright case.
- Reconciled with `docs/research/decisions/fixed-toolbar-scroll-ownership.md` and review scope.
- Plan validator passed; `node tooling/scripts/review-ledger.mjs check` also passed after regenerating `docs/research/reviews.md`.
- Focused DOM tests passed separately: fixed toolbar 1/1, editor 3/3, and multiple editors 1/1 with 41 assertions. The two editor specs remain separate because Bun's module mocks leak across files when batched.
- `pnpm --filter www check:docs`, registry source checking, `pnpm --filter www build:registry`, and disposable Base/Nova plus Radix/Luma builds for `editor-basic` and `editor-ai` passed.
- Fresh source Chromium passed the exact Markdown endpoint/menu/outer-scroll case, MDX responsiveness, five wide/narrow layout cycles, and shared-toolbar startup/editor switching. Native Chrome measured stable outer scroll `502 → 502` with separate toolbar, bounded scrollport, visible endpoint/menu, and a scrollable inner container.
- Broad `www` typecheck reaches TypeScript and reports only the pre-existing unresolved `recordPliteBrowserRuntimeErrors` and `createPliteBrowserEditorHarness` names in `tests/browser/comment.spec.ts`; no changed-file type error remains.

Final handoff completed:

- Ownership/API: `EditorFrame` owns panel layout/height; `EditorContainer` owns scroll DOM; `FixedToolbar` owns presentation; `beforeContainer` owns plugin placement.
- Break/adoption: remove container `demo`; migrate 29 files and classify 62 sites; update slots, manual examples, bilingual docs, generated registry, and installed consumers; no bridge.
- Runtime/package/docs/browser: no package/Plite API change; copied UI/docs/registry/browser apply; comment/select and neutral CSS padding stay.
- Scale: source-backed zero-runtime N/A; final deterministic requirement is zero toolbar observer/effect/style work plus browser correctness.
- Risks: bounded-height misses, null-selection hiding, narrow toolbar height, outer-page scroll, and stale generated/served artifacts are covered.
- Order: structural owner, complete migration, regenerate/install, Verify Plate source review, then final serial Playwright/native Chrome. No user decision remains.

Timeline:

- 2026-09-16T21:59:51.200Z Plate Plan created.
- 2026-09-17 ownership, census, API alternatives, scale applicability, adoption, and proof contract completed.
- 2026-09-17 Autogoal plan validation and review-ledger render/check passed.
- 2026-09-17 execution, cold-source browser replay, native Chrome replay, generated registry, and installed-consumer proof completed.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Implementation and focused verification complete. |
| Where am I going? | No fixed-toolbar-scroll work remains. |
| What is the goal? | Separate fixed-toolbar layout from editor scrollport and delete geometry compensation. |
| What have I learned? | `EditorContainer` must remain the scroll primitive; copied `EditorFrame` is the smallest honest outer owner. |
| What have I done? | Implemented the frame/scrollport ownership cut, migrated consumers and teaching, regenerated distribution, and replayed the reported interaction. |

Open risks:

- No fixed-toolbar-owned design or proof gap remains. The broad `www` typecheck still has the two unrelated comment-spec helper-name errors recorded above; no release, commit, or publication is claimed.
