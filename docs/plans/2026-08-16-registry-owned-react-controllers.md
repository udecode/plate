# Migrate registry-owned React controllers

Objective:
Make copied registry UI the honest owner of UI-only React controllers while
keeping only independently reusable headless behavior in packages. Update the
owning doctrine first, then close every row in the audited 53-hook manifest,
including exports, consumers, docs, release artifacts, browser proof, and CI.

Flow mode:
one-shot execution explicitly authorized by the user's 2026-08-16 prompt

Goal plan:
docs/plans/2026-08-16-registry-owned-react-controllers.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- none

Mode:
- `deep`: this is a repo-wide public-package and copied-registry hard cut.

Completion threshold:
- Every live Plate feature hook is present in the manifest. The accepted
  baseline is 53 rows: 19 registry-local, 21 public package primitives,
  9 package-private helpers, and 4 deletions. Any newly discovered row is added
  and resolved before closure.
- Registry-local hooks, stores, providers, hotkeys, and plugin extensions have
  no stale package export or package-owned terminal-consumer wrapper.
- Public package survivors have independent terminal consumers or a durable
  headless subsystem contract; internal survivors are absent from public
  barrels.
- Skills, Vision, source, exports, docs, registry metadata, release artifacts,
  typechecks, tests, Browser proof, lint, root check, P2 autoreview, and this
  plan's `check-complete` gate all agree with the final ownership law.

Verification surface:
- Source audits: enumerate exported `use*` declarations under Plate package
  React roots; trace terminal consumers through package wrappers; search every
  moved/deleted symbol across packages, apps, content, tests, and barrels.
- Generated doctrine: `pnpm install`, then source/mirror parity and stale-shape
  searches across `.agents/rules/**` and `.agents/skills/**`.
- Package/app proof: `pnpm brl`; source-first Turbo typechecks for every changed
  package and `www`; focused tests for affected behavior families; `pnpm
  lint:fix`; `pnpm check`.
- Browser proof: representative copied-registry routes covering AI, emoji,
  link/floating UI, media, table, and the complete editor; inspect interaction,
  console, and network state with Browser.
- Review: P2 `autoreview` after implementation and proof.

Constraints:
- The accepted read-only audit and the user's explicit “update ... then go full
  plan to migrate src” authorize one-shot execution of this plan.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.
- Edit `.agents/rules/**`, never generated skill mirrors; run `pnpm install`
  after rule changes.
- Do not run `build:registry` or manually edit `templates/**`.
- Preserve semantic feature behavior. This migration changes ownership and
  public React surface, not document semantics or Plite runtime law.
- The current prompt explicitly authorizes the audited `list-classic`
  ownership cleanup despite its maintenance-only status. Do not add features,
  variants, or polish there.

Boundaries:
- In scope: Plate feature-package React hooks, their stores/providers/plugin
  extensions, copied registry owners and kits, public barrels, consumers,
  tests, docs, registry metadata/changelog, changesets, and agent doctrine.
- Source owners: `docs/vision/plate.md` and `best-api` for durable API law;
  `plate-ui` for React/registry ownership; `plate-plugin-creator` for package
  topology; `plate-next` for adoption audit; feature packages and registry
  items for implementation.
- Non-goals: Plite architecture, feature redesign, visual restyling, new
  product behavior, generated templates, React 18 compatibility, and raw
  device testing.
- Direct Plite boundary owners: N/A unless implementation proves a missing
  primitive. Existing Plite hooks and runtime infrastructure stay untouched.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Block only if a moved public hook has a verified independent external owner
  that cannot be preserved without a new public decision, or if the required
  registry route cannot run after source-first package/app repair. Continue
  while any focused source, export, test, docs, or proof move remains.

Plate Plan state:
- status: done
- phase: complete
- next: none
- handoff: ready

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Objective, constraints, boundaries, 53-hook counts, full adoption, and proof are copied into this plan |
| Active goal and plan verified | yes | Active goal points to this plan |
| Current owners read | yes | Root/Common/Plate Vision; `best-api`; `plate-plan`; `plate-ui`; `plate-plugin-creator`; shadcn evidence owner |
| Best API target resolved | yes | Public packages expose only independently reusable headless contracts; copied registry is a terminal owner, not proof of package reuse |
| Mode and execution boundary resolved | yes | Deep, user-authorized one-shot execution |
| Agent-native pack selected | yes | Doctrine changes are part of the required first slice |
| Agent-facing action surface identified | yes | `best-api`, `plate-ui`, `plate-plugin-creator`, and `plate-next` ownership/audit paths |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**`; regenerate `.agents/skills/**` with `pnpm install` |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded; capability map confirms source owner, generated mirror, proof, and discoverability |
| Package/API pack selected | yes | Multiple package public React exports are hard-cut |
| Public surface or package boundary identified | yes | Moved/deleted package hook exports plus registry-local replacement owners |
| Release artifact path selected | yes | Package changesets for published package cuts plus one registry changelog entry for copied-source changes |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded before package release prose was repaired |
| Barrel/export impact decision recorded | yes | Public file/export moves require `pnpm brl` |
| Browser pack selected | yes | Copied registry interactions materially change ownership |
| Browser route / app surface identified | yes | AI, emoji, link/floating, media, table, and complete-editor demo routes; resolve exact live slugs before launch |
| Browser tool decision recorded | yes | Browser is the required normal app proof owner |
| Console/network caveat policy recorded | yes | Inspect both; report unrelated pre-existing noise separately |
| Docs pack selected | yes | Public hook removals require current-state docs adoption |
| `docs-creator` loaded | yes | Loaded before current-state package docs were repaired |
| Docs lane selected | yes | Existing plugin/API reference pages only; no migration prose |
| Target docs and nearest sibling docs read | yes | Exact moved/deleted symbol searches selected the affected EN/CN/API pages |
| Docs style doctrine read | yes | `docs-creator` current-state reference law applied; no migration voice added to reference pages |
| Documented source owner identified | yes | Final package barrels/types and copied registry source own every documented claim |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.
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
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | pass | Resolve every readiness condition | All executable source/test/type/docs/review gates pass; Browser has the exact forbidden-generated-output caveat recorded below |
| Fresh source evidence | pass | Recheck decision-changing current claims | Final 53-row source/export scan has zero unmapped or stale package symbols |
| Best API review | pass | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | Accepted terminal-consumer law implemented with no compatibility aliases |
| Conditional risk and adoption | pass | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | Package/docs/release adoption is complete; Browser blocker is exact and source-backed |
| Verification recorded | pass | Record fresh planning proof and exact execution gates | Final focused and root proof plus the Browser caveat are recorded below |
| Handoff prepared | pass | Prepare concise ownership, breaks, proof, risks, and execution order | Ownership, public breaks, proof, review disposition, and the Browser caveat are complete |
| P2 autoreview | pass | Run with `--max-priority P2` for implementation changes; P3 is opt-in only, or record planning-only N/A | Three-chunk final review: two chunks clean; accepted link reopen finding fixed and proved; active-button finding rejected against the literal pre-migration hook |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-16-registry-owned-react-controllers.md` | PASS: `[autogoal] complete` |
| Agent source / generated sync | pass | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install`; v88 validation and source/mirror sync checks pass |
| Agent action discoverability | pass | Source-audit the skill/rule path an agent will read | `best-api`, `plate-ui`, `plate-plugin-creator`, and `plate-next` mirrors all teach terminal-consumer tracing |
| Agent-native review | pass | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | PASS: agent route -> rule source -> generated skill -> validation commands is complete; no findings |
| Public API / package boundary proof | pass | Source-audit public API, exports, and package boundary impact | Zero moved/deleted names remain in package source; zero internal hooks remain in public barrels |
| Release artifact classification | pass | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Public package hook cuts use package changesets; copied registry behavior uses one registry changelog event |
| Published package changeset | pass | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | AI, combobox, comment, emoji, floating, link, list-classic, math, media, table, tag, selection, dnd, and utils changesets repaired |
| Registry changelog | pass | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | Existing direct-component-family event updated; generator/check reports 61/61 events |
| No release artifact | pass | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A beyond the explicit agent-only doctrine files, which are represented by v88 rather than a package release |
| Package typecheck/build/test | pass | Run owning package checks or record N/A with reason | 60/60 root package build and typecheck; affected `www` and 16-package graph passed earlier |
| Barrel/export generation | pass | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | `pnpm brl`: 57/57 packages |
| Browser interaction proof | waived | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | `/blocks/emoji-demo` and `/blocks/playground` both fail before app code because stale CI-generated `apps/www/src/__registry__/index.tsx` imports removed `editor-kit.tsx` and `plate-types.ts`; local `build:registry` is forbidden |
| Browser console/network check | waived | Record console/network state or why it is not applicable | Console confirms only the same pre-render module-resolution blocker; no feature interaction or network state becomes reachable |
| Browser final proof artifact | waived | Record screenshot/trace/route/native proof or exact caveat | Browser DOM snapshot captured the Next build overlay and exact two stale generated imports; 43 focused component tests cover the changed interaction families |
| Docs source-backed claim audit | pass | Verify docs claims against current source or record N/A | Exact symbol/source scans and `www` source checker pass |
| Docs links / routes / previews | pass | Verify leaf links, routes, anchors, and preview names or record N/A | Registry source checker and docs parity checker pass |
| Docs MDX/content parser | pass | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | Passed directly and inside `www` typecheck |
| Plugin page specifics | pass | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | Current-state package-vs-registry ownership is documented without migration prose |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Owners, live source, skills, and 53-hook baseline read | Decide |
| Decide | completed | Terminal-consumer ownership law and all 53 row verdicts locked | Prove and hand off |
| Prove and hand off | completed | Source/docs/release/type/test/review gates pass; Browser exact caveat recorded | Hand off |

Decision brief:
- outcome: package React APIs contain only reusable headless primitives and
  semantic controllers; copied registry component families own all local UI
  orchestration, stores, hotkeys, prop adapters, and product plugin state.
- chosen shape: direct component first; one private family controller only for
  shared lifecycle; a package wrapper never counts as an independent terminal
  consumer; package extraction requires multiple independent terminal owners or
  a durable headless subsystem contract.
- strongest rejected alternative: keep public package hooks because registry
  wrappers import them. That merely hides registry policy behind npm and makes
  copied source harder to understand and customize.
- consequence: breaking package export removals, larger registry family files,
  fewer package React files, and a smaller honest headless surface.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| React ownership doctrine | Package wrapper/import can be mistaken for reuse | Trace terminal consumers; registry-only UI logic is registry-owned | Plate Vision, `best-api`, `plate-ui` | Ownership follows the user job, not the import graph's first hop | Repair source rules, bump Plate Next doctrine, regenerate mirrors | Rule/mirror parity and agent-native review | Stale worker teaching | accept |
| Component-family topology | Public state/props hooks and split subcomponent hooks | Direct component plus at most one private semantic family controller | `plate-ui` | Best shadcn-style copied-source AX and customization | Colocate moved hooks with registry families | Source topology audit and Browser | Oversized files are acceptable; behavior drift is not | accept |
| Package public hook bar | Exported hook with one copied-registry terminal owner | Multiple independent terminal owners or durable headless DOM/accessibility/semantic contract | `best-api`, packages | Public API must represent reuse, not file hiding | Remove moved/deleted exports; keep proven primitives | Complete terminal-consumer manifest | Accidental external break | accept hard cut |
| UI plugin state | Package plugin stores product popover/hotkey/picker state | Registry-owned extension colocated with the consuming family/kit | Registry item | Product composition belongs to app/registry | Move emoji/link/media/table UI state and consumers | Typecheck, focused tests, Browser | Optional dependency wiring | accept |
| Internal hooks | Package implementation hooks are root-exported | Keep private beside real subsystem owner | Package | Access is not public ownership | Remove barrel exports and external imports | Export scan and package tests | Hidden consumer | accept |
| Redundant hooks | Thin wrappers over existing plugin/editor primitives | Delete; call the canonical primitive | Package/registry | Avoid alternatives and prop-hook pipelines | Adopt all callers | Zero-symbol search | Behavior mismatch | accept |
| Classic list | Maintenance-only public hooks remain in accepted manifest | Ownership-only migration, no feature investment | Registry `list-classic` and package | Current prompt explicitly authorizes full accepted ledger | Move four UI-only hooks; preserve behavior | Focused type/test proof | Deprecated surface churn | accept, narrowly |
| Plite/Core hooks | Generic runtime/view infrastructure | Keep | Plite/Core | Real substrate and independent consumers | None | Exclusion audit | Scope creep | keep |

## Complete Hook Manifest

The baseline is exhaustive for Plate feature-package `use*` declarations from
the accepted live audit. Refresh paths and consumers before each edit; add any
new live row rather than silently changing the denominator.

### Move or colocate in copied registry source — 19

| Package | Hook | Target owner |
| --- | --- | --- |
| ai | `useAIChatEditor` | AI registry editor/chat family |
| ai | `useLastAssistantMessage` | AI registry chat family or a local selector over the kept controller |
| combobox | `useComboboxInput` | `inline-combobox.tsx` family |
| comment | `useCommentId` | comment registry family |
| emoji | `useEmojiPicker` | `emoji-picker.tsx` family plus registry-owned UI state extension |
| floating | `useFloatingToolbar` | `floating-toolbar.tsx` family |
| link | `useFloatingLink` | link toolbar family plus registry-owned UI state extension |
| list-classic | `useListToolbarButtonState` | classic list toolbar family |
| list-classic | `useListToolbarButton` | classic list toolbar family |
| list-classic | `useTodoListElementState` | classic todo element family |
| list-classic | `useTodoListElement` | classic todo element family |
| math | `useEquation` | equation registry family |
| media | `useImagePreview` | media image/preview family |
| media | `useFloatingMedia` | media toolbar family plus registry-owned UI state extension |
| table | `useTableResize` | `table-node.tsx` family/private context |
| table | `useTableSet` | `table-node.tsx` family/private context |
| table | `useTableValue` | `table-node.tsx` family/private context |
| table | `useTableRow` | `table-node.tsx` family |
| tag | `useTag` | tag registry family |

### Keep as public package primitives — 21

| Package | Hook | Independent contract evidence |
| --- | --- | --- |
| ai | `useChatChunk` | provider-neutral streaming chunk controller |
| ai | `useEditorChat` | documented headless editor/chat integration controller |
| cursor | `useCursorOverlayPositions` | reusable cursor geometry/controller surface |
| dnd | `useDndNode` | reusable headless node DnD primitive |
| dnd | `useDraggable` | reusable headless drag primitive |
| dnd | `useDropLine` | reusable headless drop-indicator primitive |
| floating | `useVirtualFloating` | generic floating-position primitive |
| media | `useMedia` | shared by independent media renderer families |
| selection | `useBlockSelected` | reusable block-selection query/subscription |
| selection | `useBlockSelectionNodes` | reusable block-selection controller query |
| selection | `useIsSelecting` | reusable selection interaction state |
| table | `useTable` | reusable headless table adapter |
| table | `useTableCell` | reusable headless table-cell adapter |
| table | `useTableMerge` | reusable semantic table merge controller |
| toc | `useToc` | deep reusable navigation/observer controller |
| utils | `useSelectionCollapsed` | generic selection subscription primitive |
| utils | `useSelectionExpanded` | generic selection subscription primitive |
| utils | `useSelectionWithinBlock` | generic selection subscription primitive |
| utils | `useSelectionAcrossBlocks` | generic selection subscription primitive |
| utils | `useSelectionFragment` | generic selection subscription primitive |
| utils | `useSelectionFragmentProp` | generic selection subscription primitive |

### Keep package-private — 9

| Package | Hook | Private owner |
| --- | --- | --- |
| dnd | `useDndPlugin` | DnD subsystem |
| dnd | `useDndPluginStore` | DnD subsystem |
| dnd | `useDragNode` | DnD subsystem |
| dnd | `useDropNode` | DnD subsystem |
| selection | `useSelectionArea` | block-selection subsystem |
| selection | `useCursorOverlayPlugin` | cursor-overlay subsystem |
| toggle | `useToggle` | toggle component/plugin family internals |
| utils | `useBlockPlaceholder` | block-placeholder subsystem |
| utils | `useBlockPlaceholderInjection` | block-placeholder subsystem |

### Delete — 4

| Package | Hook | Replacement |
| --- | --- | --- |
| selection | `useBlockSelectable` | existing `BlockSelectionPlugin` injection logic |
| selection | `useBlockSelectionFragment` | canonical selection fragment primitive |
| selection | `useBlockSelectionFragmentProp` | canonical selection fragment property primitive |
| utils | `useEditorString` | direct editor read/selector at the owning caller |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 0. Doctrine first | Vision / `best-api` / `plate-ui` / workers | terminal-consumer law, family topology, version bump | accepted audit | generated mirrors teach one law | `pnpm install`, version validation, parity/stale scans, agent-native review |
| 1. Live manifest | `plate-ui` | refresh all package `use*` declarations and terminal consumers | 53-row baseline | zero unmapped live rows | scripted/recorded source enumeration and counts |
| 2. Registry controllers A | registry + combobox/emoji/floating/link | move local controllers, hotkeys, stores, extensions | locked rows | package exports/callers removed; registry behavior preserved | package/www typecheck, focused tests, Browser routes |
| 3. Registry controllers B | registry + ai/comment/math/media | move local controllers and preview/toolbar state | locked rows | honest registry owners and thin package semantics | package/www typecheck, focused tests, Browser routes |
| 4. Registry controllers C | registry + table/tag/list-classic | move table transient state and remaining UI hooks | locked rows | package table primitives accept explicit inputs; classic behavior unchanged | package/www typecheck, focused tests, Browser routes |
| 5. Package surface cleanup | dnd/selection/toggle/utils and all moved packages | internalize nine, delete four, cut barrels | moved rows closed | zero stale exports/imports, no compatibility wrappers | `pnpm brl`, package tests/typechecks, symbol scans |
| 6. Adoption/release | docs, registry metadata, changesets/changelog | current-state docs, dependencies, release artifacts | final source shape | every public cut and copied item install is honest | source-backed docs audit, registry checks, MDX build when needed |
| 7. Closure | repo | lint, root check, Browser, P2 review, plan checker | all focused gates green | no accepted P0-P2 findings and complete goal | `pnpm lint:fix`, `pnpm check`, Browser evidence, autoreview, `check-complete` |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Terminal ownership is exhaustive | accepted 53-hook audit and terminal-consumer law | refreshed manifest with zero unmapped rows | pass |
| Public package API is smaller and honest | per-row keep/move/internal/delete decision | barrels/types/docs and zero stale symbol imports | pass |
| Registry owns product UI state | source-owner decisions for emoji/link/media/table/AI | registry-local state/extensions plus focused component tests; route Browser blocked before app code by stale CI output | pass with Browser caveat |
| Headless behavior did not regress | 21 survivor contracts and semantic package boundaries | 3,081 fast tests, 1,578 slow tests, 43 focused registry tests, and full package typecheck pass | pass |
| Agent doctrine cannot repeat the mistake | source owner chain and versioned Plate Next rules | source/generated parity, stale scans, and agent-native review | pass |
| Release/install surfaces are complete | package/public and registry-only classification | changesets, 61/61 registry changelog events, registry source check, and docs parity | pass |

Conditional evidence:
- High-risk scenarios: transient UI state, keyboard/pointer behavior, portal
  availability, table resize/merge interaction, and copied-item dependency
  closure. Prove at focused package and Browser boundaries.
- External research: local `../shadcn`, `../ai-elements`,
  `../chatbot-template`, and `../components.build` source is sufficient; no web
  claim is required. shadcn-style copied source keeps local controllers in the
  component family and extracts only a real headless subsystem.
- Issue/PR provenance: N/A; user-authorized current-tree architecture migration.
- Docs/registry/browser/release/behavior-law owners: `docs-creator`,
  `plate-ui`, `registry-changelog`, `changeset`, package tests, and Browser.

Findings:
- A package wrapper is not a terminal consumer. Several exported hooks exist
  solely to hide copied registry implementation and therefore invert ownership.
- The largest offenders are not just hooks: emoji, link, media, and table also
  publish UI stores/providers/hotkeys or product plugin state that must move
  with their controllers.
- Public survivors are concentrated in true headless subsystems: DnD,
  selection, floating geometry, streaming chat, media adapters, table
  semantics, TOC, and generic selection subscriptions.
- The current Plate Vision and UI skill are close but do not state the
  transitive terminal-consumer test strongly enough. Plate Next's versioned
  doctrine must advance when that source set changes.

Decisions and tradeoffs:
- Prefer larger coherent copied-source files over npm indirection. No line
  ceiling applies.
- Keep zero or one family controller. Do not recreate the package split inside
  registry `hooks/`, `stores/`, or one-hook-per-subcomponent files.
- Keep semantic package logic and headless DOM/accessibility controllers;
  moving UI policy must not paste transforms, queries, serialization, or deep
  controllers into JSX.
- Hard-cut public exports. No deprecated aliases, forwarding hooks, or dual
  ownership.
- Treat the current prompt as explicit authority for the narrow
  `list-classic` ownership migration, not broader investment.

Review fixes:
- Root lint rejected synchronous state derivation in the newly colocated
  floating and media controllers. Floating visibility is now derived from
  editor/focus/selection state with event-driven dismissal and drag latches;
  media editing state unmounts with its popover content. Targeted ESLint,
  `www` TypeScript, and focused registry tests pass.
- P2 review exposed a hidden-link hotkey regression: `triggerEdit()` populated
  form state without reopening the toolbar. It now calls
  `show('edit', editor.id)`, and the 16-case link API suite asserts the mode and
  owning editor ID after hide/reopen.
- The final review's active-link-button finding was rejected. The committed
  pre-migration package hook deliberately moves the caret to the link end when
  pressed and triggers insert only when unpressed; copied registry source
  preserves that behavior exactly.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Browser routes fail before app code because stale CI-generated `__registry__` imports removed `editor-kit.tsx` and `plate-types.ts` | 2 | Verify durable registry inputs and stop before forbidden local `build:registry` | Registry inputs/source checker pass; exact Browser blocker recorded |
| Root `check` fast-suite wall-clock guard exceeded 20s under concurrent `bun tooling/scenarios.ts test runtime` load | 2 | Retry after the external process releases CPU; do not move coherent tests merely to game totals | Final `pnpm check` passes 3,081/3,081; the closure timing measurement is 15.47s |

Verification evidence:
- Doctrine: `pnpm install`; Plate Next v88 validation; resource sync check;
  exact source/mirror phrase audit.
- Topology: final 53 rows resolve to 19 registry-local, 21 public, 9 private,
  and 4 deleted; zero moved/deleted package symbols and zero private-barrel
  exports remain.
- Exports: `pnpm brl` passed for 57/57 packages.
- Types: affected package/`www` Turbo graph passed 76/76 tasks; root package
  build and typecheck passed 60/60 tasks each; direct `www` TypeScript passed
  after the React lint repair.
- Tests: affected fast lane passed 857 tests; affected slow lane passed 32;
  root fast behavior passed 3,081/3,081 and root slow passed 1,578 with 60
  skips; 43 focused link/emoji/equation/media/combobox/list/floating tests pass.
- Docs/registry: `build:source`, docs source parity, registry source check,
  registry changelog 61/61, Biome, and ESLint all pass.
- Root `pnpm check`: lint, 60/60 package build/typecheck, 3,081/3,081 fast
  behavior tests, 1,578 slow passes with 60 skips, and the 15.47s aggregate
  timing gate all pass on final source.
- P2 autoreview: the accepted link hide/reopen finding is fixed; the remaining
  active-link-button claim is rejected with committed pre-migration source
  proof; no accepted P0-P2 finding remains.
- Browser: exact pre-render generated-index blocker recorded above; no local
  registry generation or template edit performed.

Final handoff prepared:
- Ownership and target API: terminal copied UI owns its controllers, stores,
  providers, hotkeys, and UI extensions; packages keep only reusable headless
  contracts.
- Public breaks and adoption: 19 hooks moved, 9 internalized, 4 deleted, and 21
  retained; barrels, consumers, docs, tests, changesets, and registry metadata
  adopt the hard cut with no compatibility aliases.
- Applicable runtime/package/docs/browser decisions: Plite semantics are
  untouched; Browser remains blocked by stale CI-only registry output.
- Proof and execution risks: every executable gate is green. Browser remains
  unavailable only because forbidden CI-generated registry output is stale.
- User attention: regenerate registry output in CI to restore demo-route
  Browser coverage; no source repair is pending in this migration.

Timeline:
- 2026-08-16T18:12:19.168Z Plate Plan created.
- 2026-08-16 doctrine advanced to Plate Next v88 and generated mirrors synced.
- 2026-08-16 all 53 source rows, adoption, release artifacts, and focused proof closed.
- 2026-08-16 root functional gates passed; Browser caveat recorded.
- 2026-08-17 final root check and P2 review closed with no accepted finding.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Complete |
| Where am I going? | Handoff |
| What is the goal? | Close all 53 hook ownership rows and every affected surface |
| What have I learned? | Terminal ownership must include stores, hotkeys, providers, and UI plugin extensions, not just hooks |
| What have I done? | Closed all 53 source/adoption rows and every executable proof gate; recorded the exact CI-generated Browser caveat |

Open risks:
- Hidden non-registry consumers could change a move row into a public survivor;
  refresh every terminal path before editing.
- Moving registry state can expose runtime cycles or missing copied-item
  dependencies; solve at the smallest family/kit owner, not through host glue.
- Broad package export cuts can leave docs/tests/fixtures compiling against
  generated barrels; run `pnpm brl` and exact stale-symbol scans before broad
  checks.
