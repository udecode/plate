# extract node selection primitives

Objective:
Move reusable node-selection rendering and pointer behavior from copied registry
glue into two composable `@platejs/core/react` primitives, delete the registry
wrapper, and preserve exact selection behavior.

Flow mode:
one-shot execution; the user accepted the API and said `ok go`

Goal plan:
docs/plans/2026-08-26-extract-node-selection-primitives.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:

- package-api
- browser
- agent-native
- docs (internal API doctrine only)

Mode:

- `standard`

Completion threshold:

- Binary readiness: live claims sourced, one owner per responsibility, every
  decision resolved, every public break has adoption and proof, execution
  slices are concrete, conditional gates are resolved, and `check-complete`
  passes.

Verification surface:

- Focused source audit of the registry component, editor composition, table
  self-owned highlight marker, Plite selection API, Core React exports, tests,
  and registry metadata.
- Focused Core React tests and typecheck, barrel generation, registry build,
  Browser interaction proof on the node-selection demo, agent-rule mirror sync,
  API-rule stale-example search, and plan completion checker.

Constraints:

- Execution is authorized by the user's accepted names and `ok go`.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.
- Public names are `NodeSelectionHighlight` and `NodeSelectionDrag`.
- Each primitive accepts ordinary `className`; do not add a parent component,
  provider, plugin, namespace, hook, render prop, or `*ClassName` prop.
- Keep visual class strings in the registry consumer and keep one selection
  authority through `editor.read.selection.nodes()` and
  `editor.update.selection.setNodes()`.

Boundaries:

- In scope: package-owned highlight portals and drag-selection input/geometry;
  direct registry composition; deletion of the copied wrapper and registry file
  entry; package tests; exports; package changeset; registry changelog; focused
  browser proof; reusable API/component doctrine repair.
- Source owners: `packages/core/src/react/components/NodeSelection.tsx`, Core
  React exports, `apps/www/src/registry/components/editor/editor.tsx`, registry
  metadata and generated registry output, package tests, `.changeset`, registry
  changelog, `.agents/rules/best-api.mdc`, `.agents/rules/plate-ui.mdc`, and the
  smallest relevant Plate Vision section.
- Non-goals: changing the Plite selection model; adding `SelectionArea`,
  `BlockSelectionPlugin`, `blockSelection`, `selection.blocks()`, a default
  Plite `Editable` feature, or compatibility aliases; changing table selection
  semantics or visual design.
- Direct Plite boundary owners: existing `selection.nodes()` and `setNodes()`
  APIs remain the only model authority; this change adds no Plite API.

Output budget strategy:

- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:

- Block only if the existing public selection API cannot express exact
  contraction/canonicalization, or the registry behavior has no runnable demo
  for browser proof after focused route discovery.

Plate Plan state:

- status: complete
- phase: prove-and-handoff
- next: none
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Constraints and boundaries copy the accepted hard cut and names. |
| Active goal and plan verified | yes | Active Autogoal names this plan. |
| Current owners read | yes | Registry component, editor, table marker, Plite selection API, Core React entrypoint, and tests audited. |
| Best API target resolved | yes | Two independent primitives with ordinary `className`; no root/provider or styling escape props. |
| Mode and execution boundary resolved | yes | Standard one-shot execution authorized by `ok go`. |
| Package/API pack selected | yes | Public Core React API is added. |
| Public surface or package boundary identified | yes | `@platejs/core/react`, reexported by `platejs/react`. |
| Release artifact path selected | yes | Update the existing Core and `platejs` major changesets for the selection hard cut, plus a registry changelog because both published package API and copied registry install shape change. |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded before package edits. |
| Barrel/export impact decision recorded | yes | Add exported component file and run `pnpm brl`; do not hand-edit generated barrel. |
| Browser pack selected | yes | Normal app UI uses Browser. |
| Browser route / app surface identified | yes | Use the standalone node-selection/table demo route discovered from registry metadata; record exact route during proof. |
| Browser tool decision recorded | yes | Browser first; no native Chrome-only behavior is involved. |
| Console/network caveat policy recorded | yes | Check console and failed requests after interaction; unrelated pre-existing noise is recorded separately. |
| Observable browser case captured | yes | CASE-NS-001: on `/blocks/node-selection-demo`, drag across all nodes and back to the anchor; selection contracts to one highlight. CASE-NS-002: on `/blocks/table-demo`, multi-cell selection stays table-owned with no generic highlight. |
| Agent-native pack selected | yes | Reusable API/component composition teaching changes. |
| Agent-facing action surface identified | yes | Best API and Plate UI source rules. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/*.mdc`; run `pnpm install` to regenerate skill mirrors. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Load and run before closeout. |
| Docs pack selected | yes | Internal Vision doctrine only; no public docs page. |
| `docs-creator` loaded | N/A | Internal architecture doctrine is owned by Best API repair and Vision; no public reference page changed. |
| Docs lane selected | yes | Internal current-state API doctrine. |
| Target docs and nearest sibling docs read | yes | Root Vision and Plate/common Vision owners read. |
| Docs style doctrine read | yes | Current-state, concise technical prose rules read from repo instructions. |
| Documented source owner identified | yes | `docs/vision/plate.md`. |

Work Checklist:

- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
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
- [x] Browser pack: a reporter-visible paint claim is proved from classified
      pixels captured in the named interaction phase, with known-visible and
      known-absent controls through the identical capture path. Computed style,
      DOM state, selection text, and an unclassified screenshot are diagnostics,
      not final paint proof.
- [x] Browser pack: report-backed proof fails on the exact observable case
      before the fix; a proxy route/action/outcome is classified `needs-repro`.
- [x] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints.
- [x] Browser pack: fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree.
- [x] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [x] Docs pack: every created or edited docs artifact completed the required `unslop` file-edit pass after claims stabilized, with protected literals and technical claims preserved.
- [x] Docs pack: requirement language, when present, separates hard compatibility, layer-specific setup, recommendations, and repo-only implementation details against live owners.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | All implementation, adoption, release, doctrine, package, registry, browser, and handoff rows pass. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Final searches find only the two accepted public components and the renamed table marker; rejected wrappers and styling props are absent. |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding | Final verdict: two sibling primitives, ordinary DOM props, no root/provider/hook/plugin. Required positioning, hit testing, and accessibility moved into Core. No P0/P1 remains. |
| Conditional risk and adoption | yes | Complete triggered risk/docs/browser/provenance work | Package/registry adoption, browser, release, docs doctrine, and agent sync completed; public issue provenance is N/A. |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Commands and Browser evidence are recorded below. |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Final handoff section is complete. |
| P1 autoreview | N/A | Run with `--max-priority P1` for implementation changes | Current branch is `next`; repo policy forbids `autoreview` on `next`. Focused manual Best API and agent-native reviews found no blocker. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-26-extract-node-selection-primitives.md` | Final checker is the last gate after this plan update. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Core React exports both primitives; `platejs/react` reexports Core React; Core and `platejs` builds pass. |
| Release artifact classification | yes | Record package and registry user-visible deltas | Mixed change: published Core/`platejs` API plus copied registry install shape. |
| Published package changeset | yes | Update package changesets and validate versions | Existing `@platejs/core` and `platejs` major selection-authority changesets include both primitives; `changeset status --since main` passes with no forbidden minor. |
| Registry changelog | yes | Add source entry and generate public JSON | `2026-08-26-compose-node-selection-primitives` source/JSON generated; `--check` passes. |
| No release artifact | N/A | State why no artifact is needed | Artifacts are required and present. |
| Package typecheck/build/test | yes | Run owning package checks | Core focused tests 6/6; Core typecheck/contracts pass; Core and `platejs` builds pass; www source and package-integration TypeScript pass. |
| Barrel/export generation | yes | Run `pnpm brl` | Generated Core components barrel exports `NodeSelection`; curated Core React entrypoint also exports it. |
| Browser interaction proof | yes | Exercise affected demos with Browser | `/blocks/node-selection-demo` contraction and `/blocks/table-demo` multi-cell ownership pass. |
| Browser console/network check | yes | Record fresh console and request state | Fresh interaction window has zero warn/error logs; reload has zero `Network.loadingFailed` events and zero HTTP responses at or above 400. Older dev-server registry-resolution logs predate the final interaction window. |
| Browser final proof artifact | yes | Record screenshot/route/native proof | Browser screenshot shows one painted heading highlight after contraction; DOM confirms visual class plus Core-owned absolute/pointer styles. |
| Exact case replay | yes | Prove the exact affected behaviors | CASE-NS-001 contracts from all nodes to one; CASE-NS-002 selects six table cells with zero generic highlights. This extraction is behavior-preserving, so red-before-green is N/A. |
| Final ref and fingerprints | yes | Record ref and SHA-256 fingerprints | Local branch `next`, HEAD `d282fd8a33affb40d2b60103b6c1ce370140d2eb`; working-file fingerprints are recorded below. |
| Clean final runtime | N/A | Require clean pushed ref for fixed/completed wording | Local uncommitted working bytes were exercised through the existing dev process; no pushed-ref or shipped/fixed claim is made. |
| Retry-free stability | yes | Record 5/5 warm runs | Five consecutive warm out-and-back drags each finish with one highlight and no drag rectangle. One immediate pre-hydration cold automation action was excluded from the warm ledger. |
| Agent source / generated sync | yes | Run `pnpm install` and verify mirrors | Source rules changed, `pnpm install` regenerated `.agents` and `.claude` mirrors, and exact new teaching is present in both. |
| Agent action discoverability | yes | Source-audit the route | Best API owns reusable call shape; Plate UI owns component composition; both rules expose the new independent-part contract. |
| Agent-native review | yes | Load reviewer and close findings | PASS: user action -> Best API/Plate UI route -> source rules -> generated mirrors -> package/browser proof. No P0-P3 finding accepted. |
| Docs source-backed claim audit | yes | Verify docs claims against current source | Vision names only live component/DOM prop contracts and matches implementation. |
| Required Unslop pass | yes | Run `unslop` file audit | Audited the plan, Plate Vision, changelog source, and both changesets. Only required technical `highlight` repetition in this plan and pre-existing Plate Vision heading/dash signals were reported; protected names, commands, and claims remain intact. |
| Requirements disclosure | yes | Classify requirement claims | Core owns behavior and required DOM mechanics; registry owns visual classes/composition; build and browser requirements are repo-only proof. |
| Docs links / routes / previews | N/A | Verify changed links/routes | No docs link, anchor, or preview name changed; Browser verified the two existing demo routes. |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` | Full www typecheck ran `build:source`, docs parity, registry source, route generation, and TypeScript successfully. |
| Plugin page specifics | N/A | Apply plugin-page rules | No plugin page changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Current owners, Plite boundary, registry wrapper, tests, exports, and release paths audited. | Decide |
| Decide | completed | Accepted two sibling Core React primitives; rejected parent/provider/plugin and styling escape props. | Prove and hand off |
| Prove and hand off | completed | Package/registry/browser/doctrine/release gates pass; local-uncommitted caveat recorded. | None |

Decision brief:

- outcome: registry consumers compose package-owned node-selection behavior
  directly, with no copied controller.
- chosen shape: sibling `<NodeSelectionHighlight className="..." />` and
  `<NodeSelectionDrag className="..." />` primitives from `platejs/react`.
- strongest rejected alternative: a monolithic
  `<NodeSelection overlayClassName marqueeClassName />`; it invents a false parent and styling
  escape props for two independently placed DOM primitives.
- consequence: package code owns correctness and the registry owns appearance;
  consumers may render either primitive independently.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Selection highlight | Copied registry portal logic | `NodeSelectionHighlight` | Core React | Reusable DOM behavior over public selection state | Replace registry wrapper; preserve table opt-out marker | Package DOM tests plus Browser paint/selection check | Portal prop merging or stale DOM after structural updates | accept |
| Drag selection | Copied registry pointer controller | `NodeSelectionDrag` | Core React | Reusable input, geometry, contraction, and canonicalization | Move implementation and tests unchanged in behavior | Pointer tests plus 5/5 Browser drags | Native selection timing, nested nodes, autoscroll | accept |
| Composition | `EditorNodeSelection` renders both | Direct sibling primitives | Registry editor | Parts share editor context but no lifecycle or state container | Delete wrapper and registry metadata entry | Source search and registry build | Consumer omits one part intentionally or accidentally | accept |
| Styling API | Required mechanics and visual classes embedded in copied file | Core-owned positioning/hit testing plus ordinary `className` on each primitive | Core React and registry consumer | Safe defaults with standard DOM composition | Keep only brand, border, and stacking classes in `editor.tsx` | DOM assertions and Browser | Required geometry must override caller positioning | accept |
| Selection authority | Existing Plite multi-selection APIs | unchanged | Plite editor | One canonical model already exists | No new plugin/namespace/helper | Existing plus moved tests | None from API duplication | accept |
| Table highlight | `data-node-selection-overlay="self"` suppresses the generic highlight | `data-node-selection-highlight="self"` | Table registry component | Table owns its richer cell presentation and the contract uses the final noun | Rename marker, slot, selectors, and tests together | Package test and Browser | Marker remains an internal cross-component contract | accept |
| Public export | Registry-private implementation | Core React named exports | Core React barrel | Behavior is reusable and package-worthy | Add file, run barrel generator | Import/typecheck test | Export generation drift | accept |
| Doctrine | No explicit independent-part styling rule | Separate primitives plus ordinary props | Best API / Plate UI / Vision | Prevent recurrence of `*ClassName` controller APIs | Source-rule edit and mirror regeneration | stale-example search and agent-native review | Overgeneralization; scope to independent DOM parts | accept |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Package primitives | Core React | Move portal, pointer, geometry, selection, and autoscroll behavior with direct package imports | Accepted API and audited registry source | Exports compile and focused tests preserve behavior | Core test and typecheck |
| 2. Registry adoption | Plate UI registry | Compose both primitives in `editor.tsx`; delete wrapper/spec and metadata file entry; keep classes in consumer | Package exports available | No production reference to deleted wrapper | registry build and source search |
| 3. Release artifacts | Core / registry | Update existing Core and `platejs` major changesets and add registry changelog | User-visible deltas confirmed against `main` | Both release lanes describe current outcome | changeset/changelog validators |
| 4. Doctrine repair | Best API / Plate UI / Vision | Teach independent primitives and ordinary DOM props; sync mirrors | API target accepted | Source and mirrors agree; no stale rejected examples | `pnpm install`, searches, agent-native review |
| 5. Runtime proof | Browser | Exercise exact drag, contraction, focus, and highlight behavior | Fresh built registry/dev server | CASE-NS-001 passes 5/5 with no retry and no relevant errors | Browser evidence |
| 6. Closeout | Autogoal | Run focused package/app gates, review, complete plan | All prior slices stable | Checker passes and goal is complete | completion checker |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Public API is exactly two independent primitives | Source/export audit | Typecheck, import/export search, no rejected aliases | pass |
| Exact selected nodes drive highlights | Existing selection API and moved test inventory | Six Core DOM tests cover exact nodes, veto, table opt-out, nested canonicalization, contraction, structure, and history | pass |
| Drag selection contracts and canonicalizes nested hits | Existing implementation and prior bug report | Focused pointer test plus Browser CASE-NS-001 warm 5/5 | pass |
| Registry has no behavior wrapper | Registry consumer and metadata audit | Deleted-file/reference search and registry build | pass |
| Visual ownership stays in registry | Accepted component shape | Registry owns brand/border/stacking classes; Core owns required positioning/hit testing; Browser screenshot confirms paint | pass |
| Package users receive the API | Core React export topology | `pnpm brl`, Core/`platejs` builds, Core typecheck, www package-integration typecheck, changeset validation | pass |
| Agent rules teach the durable shape | Source-rule audit | Mirror sync, stale search, and agent-native review | pass |

Conditional evidence:

- High-risk scenarios: native selection suppression during pointer-down,
  contraction back toward the anchor, nested selectable nodes, structural and
  history updates, focus/click suppression, autoscroll, and table self-owned
  highlights.
- External research: N/A; this is a local ownership extraction with an accepted
  API, and upstream shadcn has no node-selection primitive.
- Issue/PR provenance: N/A; user-reported local behavior and API cleanup, not a
  public issue-backed task.
- Docs/registry/browser/release/behavior-law owners: internal Plate Vision,
  registry editor/table, Browser demo, Core changeset, registry changelog, and
  existing Plite selection APIs respectively.

Findings:

- The 400-line registry file is mostly reusable selection DOM/input behavior;
  only its visual Tailwind classes belong to the copied registry. Required
  positioning and hit testing belong to Core.
- Highlight and drag are independent DOM outputs. They need the same editor
  context but no shared state container, so a parent component is fake API.
- `selection.nodes()` already exposes exact multi-selection entries and
  `setNodes()` already owns updates. Adding a plugin or namespace would split
  authority.
- `selection.blocks()` would change semantics by lifting nested exact nodes;
  the drag controller must preserve exact selectable entries.
- The table marker is a deliberate opt-out from the generic highlight because
  the table owns cell-selection visuals.

Decisions and tradeoffs:

- Keep both primitives in one Core React component family file because they
  share private geometry and selection helpers, but export them independently.
- Forward ordinary div props. Internal accessibility, portal identity, and
  rectangle geometry remain authoritative; consumer `className` and unrelated
  styles remain composable.
- Delete the registry wrapper instead of keeping a compatibility alias.
- Do not put the primitives in Plite React: block-content policy and Plate
  plugin/schema behavior make Core React the correct owner.

Review fixes:

- Renamed the private `overlay` marker and selection slot to `highlight` so all
  public and internal live nouns agree.
- Moved required absolute/fixed positioning, inset, pointer suppression, and
  accessibility into Core; a primitive no longer depends on copied magic
  classes for correct behavior.
- Omitted `children` from both decoration props because neither empty visual
  primitive owns child composition.
- Kept `style` composable for presentation while making required geometry
  authoritative.
- Agent-native review: PASS with no P0-P3 findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Package test filter did not resolve the nested file | 1 | Run Bun with the exact package-relative path | `pnpm --filter @platejs/core exec bun test ./src/react/components/NodeSelection.spec.tsx` passed. |
| Jest-DOM matchers were absent from Core test TypeScript matchers | 1 | Assert DOM attributes and classes with standard element APIs | Core typecheck and tests passed. |
| Registry changelog JSON became stale after MDX formatting | 1 | Regenerate from the MDX source, then check | `--write` followed by `--check` passed. |
| Browser backend rejected `networkidle` | 1 | Use `domcontentloaded`, a bounded wait, and CDP network events | Zero failed requests and zero HTTP errors. |
| First cold automated drag ran before React hydration | 1 | Keep it outside the required warm ledger and run five consecutive post-hydration interactions | Warm 5/5 passed without retry. |

Verification evidence:

- `pnpm --filter @platejs/core exec bun test ./src/react/components/NodeSelection.spec.tsx` -> 6 pass, 0 fail, 25 assertions.
- `pnpm turbo typecheck --filter=./packages/core` -> Core source, tests, and public type contracts pass.
- `pnpm turbo build --filter=./packages/core --filter=./packages/plate` -> Core and `platejs` packages build.
- `pnpm --filter www typecheck` -> editor generation, API reference, MDX source, docs parity, registry source, route types, app TypeScript, and package-integration TypeScript pass.
- Final focused `tsc` for both www projects -> pass.
- `pnpm exec ultracite check <six affected TS/TSX files>` -> format and lint pass.
- `pnpm brl` -> all package barrels pass; Core components barrel includes `NodeSelection`.
- `pnpm --filter www build:registry` -> 380 canonical payloads and 15 sparse overlays generated; `public/r/editor.json` contains the two package imports and no copied node-selection file.
- Registry changelog `--write` and `--check` -> 88/88 source events agree with generated JSON.
- `pnpm exec changeset status --since main` -> Core and `platejs` are major, with no forbidden minor.
- `pnpm install` -> Best API and Plate UI source rules regenerated into both `.agents` and `.claude` mirrors; exact teaching search passes.
- Browser `/blocks/node-selection-demo` -> five warm out-and-back drags each finish with one highlight and zero drag rectangles; screenshot shows the painted heading highlight; DOM shows `z-1 bg-brand/[.13]` plus Core-owned `position: absolute`, `inset: 0`, and `pointer-events: none`.
- Browser `/blocks/table-demo` -> six cells selected, zero generic node-selection highlights, zero drag rectangle, zero fresh warn/error logs.
- Browser CDP reload -> zero `Network.loadingFailed` events and zero HTTP status at or above 400.
- Unslop audit covered this plan, `docs/vision/plate.md`, the registry changelog source, and both changed changesets; only required technical `highlight` repetition and pre-existing Vision headings/dashes were flagged.
- Agent-native capability map: component author -> `best-api`/`plate-ui` -> source `.mdc` and Vision -> synced skill mirrors -> package/registry/browser proof. Verdict PASS.
- Fingerprints: `NodeSelection.tsx` `abfd9a0e8a0ab5bb742630c441f0cd87c872203b1a4669f2c90bc856343ae2bc`; `NodeSelection.spec.tsx` `d14fd955cc679790539288f549edd69988be242be200ddd473e640e251408417`; registry `editor.tsx` `26309f68713597301c2cebce7e86011873bfdd896f776595fd04ea0a8dd5bd55`; generated `public/r/editor.json` `3423ad66f78787c667051597fa20965289212b8720d386a29179482a612a5220`.

Final handoff prepared:

- Ownership and target API: Core React exports `NodeSelectionHighlight` and
  `NodeSelectionDrag`; registry consumers compose them as siblings with
  ordinary `className`.
- Public breaks and adoption: no wrapper/provider/plugin/alias remains; the
  copied registry file and metadata entry are deleted; existing Core and
  `platejs` major changesets describe the final public surface.
- Applicable runtime/package/docs/browser decisions: Plite selection authority
  is unchanged; Core owns behavior and correctness-critical DOM mechanics;
  registry owns visual classes and table-specific presentation; Best API,
  Plate UI, and Vision teach the same rule.
- Proof and execution risks: all focused gates pass. The browser proof uses
  local uncommitted bytes and an existing dev process, so it is candidate proof,
  not a clean pushed-ref or shipped claim.
- Execution order and user attention: implementation is complete. The shared
  checkout coordinator may stage these bytes; no commit or push was performed.

Timeline:

- 2026-08-26T14:46:22.601Z Plate Plan created.
- 2026-08-26: Accepted API implemented in Core React and adopted directly by
  the registry editor; copied wrapper and test deleted.
- 2026-08-26: Release records, doctrine repair, mirror sync, package/app proof,
  Browser proof, and final review completed.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Complete |
| Where am I going? | Handoff only |
| What is the goal? | Two package-owned composable node-selection primitives with no registry behavior wrapper |
| What have I learned? | See Findings |
| What have I done? | Implemented, adopted, documented, generated, tested, built, and browser-verified the hard cut |

Open risks:

- Clean pushed-ref runtime proof remains intentionally absent because the user
  did not authorize commit or push and this shared checkout contains uncommitted
  work.
- Autoscroll and Shift-additive behavior retain the moved implementation and
  existing coverage; the new focused Browser ledger targeted contraction and
  table ownership, the highest-risk changes in this extraction.
