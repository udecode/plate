# audit react package ownership

Objective:
Audit all current Plate package React hooks against terminal-consumer/shadcn
ownership; done when every row has keep/move/inline/delete proof.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-08-16-audit-react-package-ownership.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- none

Major source:
- type: user-requested current-tree architecture audit
- id / link: current task plus the completed 53-hook migration plan
- title: package React ownership after the registry-controller migration
- decision to make: whether the current package/registry split is genuinely
  shadcn-like or still exposes renderer prop/event-handler hooks from packages
- decision criteria: terminal-consumer ownership, open-code readability,
  independent headless value, cross-surface reuse, and complete current-source
  coverage

Major lane:
- lane: architecture and public API audit
- output type: ranked P0-P3 audit plus complete hook manifest and target shapes
- implementation expected: no; read-only audit until the user accepts a cut
- affected packages / surfaces: `packages/*/src/react`, package barrels,
  `apps/www/src/registry/ui`, registry kits, and local shadcn-family references
- dominant risk: mistaking a package wrapper, test, or multiple subcomponents
  for independent reuse and leaving copied UI policy in npm

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A; none requested
- semantics: N/A
- initial confidence score: N/A; exhaustive manifest is the metric
- improvement loop: classify every discovered package hook, then pressure-test
  survivors against local shadcn-family source
- final score / loop closure: all rows reviewed with zero unexplained survivor

Completion threshold:
- Enumerate every live named `use*` declaration under Plate package React roots
  and trace every production terminal consumer.
- Classify every row as public package, package-private, registry-local, inline,
  or delete, with concrete independent-owner evidence for every survivor.
- Inspect the named local shadcn-family sources and state the single winning
  component/hook/store/provider topology with representative before/after API.
- Produce a ranked P0-P3 cut list without changing package or registry source.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-16-audit-react-package-ownership.md`
  passes.

Verification surface:
- Source manifest of `packages/*/src/react/**/*.{ts,tsx}` declarations, barrels,
  and production consumers, excluding tests/docs as ownership evidence.
- Exact local-source reads from `../shadcn`, `@shadcn/helpers`,
  `../ai-elements`, `../chatbot-template`, and `../components.build`.
- Cross-check against `plate-ui`, `best-api`, the completed 53-hook migration
  plan, and a final source count with no unclassified row.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Do not execute implementation unless this major goal explicitly includes it.
- Do not edit `packages/**` or `apps/www/src/registry/**` in this audit.
- Do not count exports, wrappers, tests, docs, or family subcomponents as
  independent terminal consumers.

Boundaries:
- Source of truth: current Plate checkout, Plate Vision, `plate-ui`, `best-api`,
  and named local shadcn-family clones.
- Allowed edit scope: this goal plan only.
- External sources: local clones only; no web needed unless a named source is
  missing.
- Browser surface: N/A; analytical ownership audit with no UI change.
- Tracker sync: N/A; no tracker source.
- Non-goals: implementation, compatibility design, visual styling, React
  behavior changes, classic-surface investment, and registry generation.

Output budget strategy:
- Count and list filenames before reading bodies; constrain searches to package
  React roots and named local repositories; exclude tests, generated output,
  `node_modules`, builds, templates, and archives from consumer counts; keep
  full row accounting in this plan rather than streaming raw matches.

Blocked condition:
- Block only if a named local reference repository is absent and its pattern is
  decision-critical, or current source cannot distinguish a hook's terminal
  owner after tracing every import path.

Major state:
- task_type: major
- task_complexity: major
- current_phase: verification
- current_phase_status: complete
- next_phase: final response
- goal_status: complete after the completion checker passes

Current verdict:
- verdict: incomplete; twelve of forty-six feature-package hook declarations
  should cease existing at the package layer, one further public helper should
  become private, and thirty-four declarations belong to durable package
  subsystems
- confidence: 0.94 after current-source and local-reference pressure passes
- next owner: `plate-ui` for ownership and `best-api` for public survivors
- reason: the prior migration correctly moved Emoji, combobox, floating-link,
  and similar product controllers, but left three copied-UI controllers, six
  redundant selector aliases, one unused Yjs alias, one block-selection alias,
  and one Table capability selector in packages

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-16-audit-react-package-ownership.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Named sources, full package-hook coverage, opinionated-state ownership, colocation, handler-returning hooks, and read-only boundary recorded |
| Timed checkpoint parsed | no | N/A: no duration requested |
| `major-task` loaded | yes | Read before source exploration |
| Active goal checked or created | yes | Goal points to this plan |
| Source of truth read before analysis | yes | `shadcn`, `plate-ui`, `best-api`, owner-first memory, and the completed migration plan read |
| Major lane selected | yes | Architecture and public API audit |
| Decision criteria stated | yes | Terminal ownership, independent headless value, open-code readability, cross-surface reuse, and exhaustive coverage |
| Existing repo patterns / prior decisions checked | yes | Plate Next v88 terminal-consumer law and completed 53-hook plan |
| Helper stack selected | yes | `shadcn`, `plate-ui`, `best-api`, `major-task`, `autogoal`; no extra panel |
| External research decision recorded | yes | Named local clones only; web N/A unless missing |
| Implementation expectation recorded | yes | Analytical only; no package/registry source changes |
| Workspace authority selected | yes | `/Users/zbeyens/git/plate-2` plus named sibling clones |
| Branch / PR expectation decided | no | N/A: analytical audit, no PR requested |
| Output budget strategy recorded | yes | Counts and filenames first; scoped source reads; no generated/test ownership inflation |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Major source records source type, id/link, title, decision type, expected
      outcome, decision criteria, likely files/packages/surfaces, browser
      surface, and highest-leverage owner.
- [x] Current state is mapped before proposing a new architecture, migration,
      benchmark, or plan.
- [x] Existing repo patterns, prior decisions, and nearby implementation
      constraints are recorded before external research.
- [x] External docs or source are used only where repo evidence does not settle
      the question, or N/A reason is recorded.
- [x] Options, recommendation, tradeoffs, blast radius, and rejection reasons
      are recorded.
- [x] Facts, inference, and recommendation are separated.
- [x] Review or pressure lenses are selected and completed, or marked N/A with
      reason.
- [x] If implementation happens, touched-surface packs cover docs, browser,
      package/API, or agent-native surfaces as needed. N/A: this is read-only.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Accepted/actionable review findings are fixed or explicitly rejected with
      evidence. N/A: findings are recommendations; implementation is outside
      the authorized read-only boundary.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | complete | Run the repo audit, benchmark, review, prototype, or artifact check named in this plan | 46/46 feature-package declarations classified; zero missing rows |
| Current-state source audit | complete | Map current owner, boundaries, constraints, and affected surfaces | manifest and terminal-consumer evidence below |
| Decision criteria closure | complete | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | survivor challenge below |
| Options / tradeoffs / rejection record | complete | Record viable options, chosen recommendation, and why alternatives lose | decisions below |
| Review / pressure pass | complete | Run selected reviewer/lens or record N/A with reason | `best-api` shortest-surface challenge plus five local shadcn-family repositories |
| Review findings closure | complete | Fix or explicitly reject accepted/actionable findings and record closure proof | read-only audit; twelve accepted implementation findings handed off |
| External-source audit | complete | Cite official/local clone/external sources when used, or record N/A | local commit cursors and measured topology below |
| Implementation gates | complete | If code changed, close primary-template and touched-surface gates; otherwise N/A | N/A: no package or registry source changed |
| Final handoff contract | complete | Record recommendation, evidence, caveats, residual risk, and next owner | recorded below |
| Final lint | complete | Run `pnpm lint:fix` or scoped equivalent when files changed | N/A: analytical Markdown plan only |
| Output budget discipline | complete | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | manifests written under `/tmp`; shell reads capped |
| Timed checkpoint | complete | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-16-audit-react-package-ownership.md` | initial run correctly found the two open phase rows; rows closed for final rerun |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | governing skills, completed plan, and prior decision read | current-state map |
| Current-state map | completed | 231 total package hooks; 46 feature hooks; complete consumer trace | options |
| Options and recommendation | completed | strict registry-local vs durable-headless law applied | review |
| Review / pressure pass | completed | local shadcn-family source and shortest-surface survivor challenge | implementation decision |
| Implementation or plan artifact | completed | read-only decision artifact in this plan | verification |
| Verification | completed | 46 unique rows, zero missing from the decision artifact; completion checker rerun is the final command | closeout |
| Closeout | completed | self-contained recommendation and implementation priorities recorded | final response |

Findings:
- **Measured current state.** The current checkout has 231 named `use*`
  declarations under package source. Core, Plite React, Plite DOM/layout,
  Udecode, and low-level Utils substrate account for 185. The feature-package
  ownership audit therefore contains 46 declarations across AI, Cursor, DnD,
  Floating, Media, Selection, Table, TOC, Toggle, Utils, and Yjs.
- **Local reference evidence.** At cursors `shadcn@d4fc45b1fbab`,
  `ai-elements@0c1f5e8c7527`, `chatbot-template@8d3939449dbc`, and
  `components.build@ba7274504373`, `@shadcn/helpers` contains zero React-hook
  declarations. AI Elements contains 24 hook declarations in 17 component
  files and zero standalone `use-*` files. The copied shadcn registry has four
  standalone hook files, all copies of the generic `use-mobile` primitive.
  Shadcn's npm React package is the opposite case: its seven standalone hook
  files belong to the reusable MessageScroller and Questionnaire controller
  systems. Chatbot Template's only custom hook is component-local.
  Components.build has twelve declarations; its only three standalone hook
  files are app/docs hooks (`use-mobile`, Geist chat, and Geist sidebar), while
  its copied AI Elements hooks remain in their component files.
- **Already correct.** Emoji picker state, combobox input behavior, floating
  link behavior, and their stores/hotkeys live in copied registry component
  files. Their npm packages retain only editor semantics or generic primitives.
- **Remaining drift.** `useMedia`, `useToc`, and `useEditorChat` each terminate
  in one copied registry family and return or coordinate that family's UI
  state, callbacks, events, scrolling, labels, or rendering decisions.
  `useTableMerge`, `useIsSelecting`, the four `useSelection*` booleans,
  `useSelectionFragment`, `useBlockSelectionNodes`, and
  `useYjsProviderRevision` duplicate a shorter primitive/read surface or have
  no production consumer.
- **Handler rule.** Returning handlers, refs, or prop fragments is evidence to
  inspect, not an automatic rejection. It is valid when the hook itself is the
  reusable headless subsystem: DnD connectors, Floating UI geometry, cursor
  overlay geometry, Table DOM synchronization, or Yjs external-store/overlay
  integration. It is invalid when the output merely saves one copied renderer
  from spelling its own callbacks or presentation state.

Complete feature-hook manifest:

| Package | Hook declarations | Verdict | Evidence / target |
|---|---|---|---|
| AI | `useChatChunk` | keep public | Stateful stream-delta integration; cannot be replaced by one selector and accepts semantic callbacks. |
| AI | `useEditorChat` | move registry-local | Only `ai-menu.tsx`; copied-menu anchor/open callback policy. |
| Cursor | `useCursorOverlayPositions` | keep public | Package component plus copied registry component; reusable DOM geometry/cache/observer subsystem. |
| DnD | `useDndPluginStore`, `useDndPlugin` | keep package-private | Package store/plugin lifecycle owners. |
| DnD | `useDomDragNode`, `useInertDragNode`, `useDragNode`, `useDomDropNode`, `useInertDropNode`, `useDropNode` | keep package-private | React-DnD/browser adapter internals used by the public controller; remove unnecessary `export` from `useDragNode`/`useDropNode`. |
| DnD | `useDndNode`, `useDraggable`, `useDropLine` | keep public | Reused by five independent registry renderer families; owns cross-editor/native-file DnD and connector lifecycle. |
| Floating | `useVirtualFloating` | keep public | Reused by floating-toolbar and link-toolbar; generic Floating UI virtual geometry. |
| Media | `useMedia` | move registry-local | Only copied Media renderers; mixed prop bag of focus, selection, read-only, alignment, provider flags, and URL. Keep parsing/editor semantics in package. |
| Selection | `useSelectionArea` | keep package-private | Real DOM selection-area controller colocated with package `BlockSelection`. |
| Selection | `useBlockSelected` | keep public | Reused by BlockSelection and Table families; canonical element/key-aware store selector. |
| Selection | `useBlockSelectionNodes` | delete | Zero production consumers; duplicates `BlockSelectionPlugin.read.getNodes` plus generic subscription. |
| Selection | `useIsSelecting` | inline registry-local | Only AI menu; one boolean OR over existing selectors. |
| Selection | `useCursorOverlayPlugin` | keep package-private | Mount lifecycle for the package-owned cursor integration. |
| Table | `useTable` | keep public | Required Table DOM selection/caret synchronization and column geometry, not product styling. |
| Table | `useTableCell` | keep public | Required reactive table-cell geometry, spans, borders, and selection semantics. |
| Table | `useTableMerge` | replace then delete | Promote `canMerge`/`canSplit` to `TablePlugin.read`; registry uses the generic selector. One Table family does not justify a public React alias. |
| TOC | `useToc` | move registry-local | Only `toc-node.tsx`; owns IntersectionObserver, click events, scrolling, active-row, and flash presentation policy. Keep `TocPlugin.read.headings`. |
| Toggle | `useToggle` | keep package-private | Hook lifecycle required by the package plugin; deliberately outside the descriptor file. |
| Utils | `useBlockPlaceholder`, `useBlockPlaceholderInjection` | keep package-private | Package component/plugin render lifecycle, not consumer API. |
| Utils | `useSelectionCollapsed`, `useSelectionExpanded`, `useSelectionWithinBlock`, `useSelectionAcrossBlocks` | delete | Zero production consumers and one-line aliases over `editor.read.selection.*`. |
| Utils | `useSelectionFragment` | delete | Zero production consumers; generic `useEditorSelector` plus `editor.read.fragment` is clearer. |
| Utils | `useSelectionFragmentProp` | keep public | Reused by Align, LineHeight, and TurnInto families; owns structural-container unwrapping and fragment property reduction. |
| Yjs | `useIsomorphicLayoutEffect`, `useYjsRevision`, `useYjsAwarenessValue`, `useYjsProviderValue`, `useYjsAwarenessRevision` | keep package-private | External-store/effect implementation for the public Yjs family; stop exporting `useYjsAwarenessRevision`. |
| Yjs | `useYjsProviderRevision` | delete | Public zero-consumer revision alias; no semantic consumer job. |
| Yjs | `useYjsProviderStatus`, `useYjsProviderSynced`, `useYjsRemoteCursor`, `useYjsRemoteCursors`, `useYjsRemoteCursorDecorationSource`, `useYjsRemoteCursorOverlayPositions` | keep public | Durable provider/presence/decorations/DOM-overlay integration; semantic outputs rather than copied renderer policy. |

Survivor challenge:

| Public survivor | Why a generic selector or local hook loses |
|---|---|
| AI chunk, cursor, floating, DnD, Yjs | Owns temporal effects, external subscriptions, browser observers, geometry, or connector lifecycle. |
| Table and TableCell | Own Table correctness across editor state and DOM, including selection/caret synchronization and computed geometry. |
| BlockSelected | Resolves optional explicit keys or the current element context and is shared across independent families. |
| SelectionFragmentProp | Owns structural unwrapping plus reduction and has three independent modern terminal families. |

Ranked implementation cut:

| Priority | Rows | Reason |
|---|---|---|
| P0 | `useMedia`, `useToc`, `useEditorChat` | Published package UI policy contradicts copied-source ownership and hides the code consumers are expected to customize. |
| P1 | `useTableMerge` | The semantic capability belongs on `TablePlugin.read`; React reactivity comes from the generic selector. |
| P1 | `useIsSelecting`, `useSelectionCollapsed`, `useSelectionExpanded`, `useSelectionWithinBlock`, `useSelectionAcrossBlocks`, `useSelectionFragment`, `useBlockSelectionNodes`, `useYjsProviderRevision` | One-line, zero-consumer, or shorter-owner aliases create public alternatives without adding behavior. |
| P1 | `useYjsAwarenessRevision` | Keep the implementation but make it private; consumers should subscribe to semantic cursor/provider values. |
| P2 | `useDragNode`, `useDropNode` export modifiers | They are intentionally absent from the curated package barrel; remove file-local export noise while preserving the private implementation. |

Decisions and tradeoffs:
- Choose terminal ownership: product/opinionated React behavior lives beside the
  copied component, even when npm already has a convenient hook.
- Keep package hooks only for substantial reusable headless systems. A hook's
  React nature or returned event handler does not itself decide ownership.
- Reject “all hooks in registry.” It would duplicate Table, DnD, cursor,
  floating, and Yjs correctness in copied source and make custom renderers
  reimplement difficult browser integration.
- Reject “all editor-aware hooks in packages.” It turns npm into a second UI
  framework and hides the exact code shadcn users are supposed to own.
- Do not split component-local hooks into `hooks/`. Colocate a private hook in
  the component file; extract one sibling controller file only when the family
  is genuinely large and shares one lifecycle.

Implementation notes:
- None yet.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `/tmp/plate-all-package-hooks.json`: deterministic 231-declaration manifest.
- `/tmp/plate-feature-hook-consumers.json` plus bounded current-source `rg`:
  46/46 feature declarations traced; zero unclassified rows.
- Local source counts: helpers 0 hooks; AI Elements 24 hooks and 0 standalone
  hook files; shadcn registry 4 standalone generic hook files; shadcn React 7
  standalone subsystem hook files.
- No package or registry source was changed; package tests, Browser, docs,
  barrels, and release artifacts are N/A for this audit.

Final handoff contract:
- Recommendation: implement the twelve-row P0/P1 cut above; keep the 34 durable
  public/private subsystem rows.
- Confidence: 0.94.
- Evidence: complete current-source manifest, production consumer trace, five
  local shadcn-family source owners, and survivor challenge.
- Tests / commands: read-only source/count audit; no runtime claim.
- Browser proof: N/A until implementation.
- PR / tracker: N/A; none requested.
- Caveats: public cuts require changesets, barrel/API/docs migration, affected
  package tests, `www` typecheck, and browser proof when implemented.
- Next owner: `plate-ui` executes registry moves; `best-api` owns the Table read
  replacement and public cuts; `plate-plugin-creator` applies package changes.

Timeline:
- 2026-08-16T23:32:03.914Z Major-task goal plan created.
- 2026-08-17: Enumerated 231 package hooks, classified all 46 feature rows,
  inspected five local shadcn-family owners, and completed the survivor
  challenge.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Classify every feature-package React hook against terminal ownership |
| What have I learned? | Three copied-UI controllers and nine alias/visibility rows remain wrong |
| What have I done? | Classified all 46 rows and pressure-tested public survivors |

Open risks:
- The next implementation must preserve semantic behavior while moving UI
  controllers; especially TOC scrolling/flash, Media parser overrides, and AI
  menu anchor selection.
