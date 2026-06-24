# audit plite concept docs

Objective:
Audit Plite docs for current roots, content roots, DOM coverage boundaries,
hidden content policies, slate-layout pagination, and document persistence
beyond `editor.children`. Finish only when every docs file has a keep, update,
move, new, or unrelated-by-audit decision; required docs edits are applied;
source-backed checks pass; autoreview has no accepted docs findings; and this
goal plan passes the autogoal completion check.

Goal plan:
docs/plans/2026-05-31-audit-plite-concept-docs.md

Template:
docs/plans/templates/docs.md

Primary template:
docs/plans/templates/docs.md

Applied packs:
- autogoal
- autoreview
- docs-creator

Docs source:
- type: local Plite docs/source audit
- id / link: Plate repo root
- title: Roots, DOM coverage boundaries, hidden content, slate-layout, and
  document state docs
- acceptance criteria: per-file docs decision matrix, current-state docs voice,
  source-backed API names, link audit, stale-term audit, `bun check`,
  autoreview, and autogoal check-complete

Docs lane:
- lane: concept + API reference + library reference + walkthrough
- target docs: all `content/docs/plite/**/*.md`
- documented source owner: `Plate repo root` packages `slate`, `plite-react`,
  `plite-layout`, and site examples
- nearest sibling docs: `docs/api/nodes/editor.md`,
  `docs/libraries/slate-react/slate.md`, `docs/libraries/slate-react/hooks.md`,
  `docs/concepts/13-roots.md`, `docs/walkthroughs/06-saving-to-a-database.md`,
  and `docs/walkthroughs/07-enabling-collaborative-editing.md`
- plugin page: N/A: no Plate plugin page changed

Completion threshold:
- Every docs file in `content/docs/plite/**/*.md` is classified in the Docs File
  Matrix.
- New concepts are documented in durable homes instead of buried in examples:
  roots and document state in Concepts, DOM coverage in Plite React, pagination
  layout in slate-layout.
- Document persistence guidance clearly separates the provider-root shortcut
  from full document persistence with `editor.subscribe`.
- Example/API names match current source: `root`, `initialValue.roots`,
  `tx.roots`, `childRoots`, `slots.contentRoot`, `slots.contentBoundary`,
  `selectionPolicy`, `copyPolicy`, `findPolicy`, `createPliteLayout`,
  `usePliteLayout`, `defineStateField`, `useStateFieldValue`,
  `useSetStateField`, `state.value.get()`, `tx.setField`, and
  `tx.statePatches.replay`.
- Verification records fresh link audit, stale-term audit, `bun check`, and
  autoreview.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-31-audit-plite-concept-docs.md`
  passes from `/Users/zbeyens/git/plate-2`.

Verification surface:
- `/Users/zbeyens/git/plate-2/Plate repo root`: markdown link audit over
  `docs/**/*.md`.
- `/Users/zbeyens/git/plate-2/Plate repo root`: stale term/API audit with `rg`
  for removed policy names, wrong layout/content-root examples, stale
  document-value examples, raw state patch export, and public docs callback
  names banned by the contract.
- `/Users/zbeyens/git/plate-2/Plate repo root`: `bun check`.
- `/Users/zbeyens/git/plate-2/Plate repo root`: docs-focused `autoreview`.
- `/Users/zbeyens/git/plate-2`: autogoal `check-complete`.

Constraints:
- Current-state docs only. No migration/changelog voice.
- Keep examples copy-pasteable and source-backed.
- No fake APIs, fake routes, fake package imports, or placeholder claims.
- Do not broaden into unrelated behavior changes.
- Do not use full browser/integration sweeps for docs-only markdown unless a
  rendered route changes behavior.

Boundaries:
- Source of truth: `Plate repo root` source packages, examples, and docs tree.
- Allowed edit scope: docs in `Plate repo root` plus this root goal plan.
- Browser surface: N/A: docs-only markdown edits; existing dev route unchanged.
- Tracker sync: N/A: no issue tracker update requested.
- Non-goals: do not change hidden-content runtime behavior, policy semantics,
  document-state runtime behavior, or public example controls in this docs pass.

Blocked condition:
Block only if a documented public API cannot be verified in `Plate repo root`
source or the required verification command fails for a docs-caused reason.

Docs state:
- task_type: docs
- task_complexity: medium
- current_phase: complete
- current_phase_status: complete
- next_phase: done
- goal_status: complete

Current verdict:
- verdict: docs IA updated
- confidence: high
- next owner: docs
- reason: roots, DOM coverage, layout, and document state are real public
  surfaces and now have durable docs homes with source-backed examples

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| `docs-creator` loaded | yes | Read `.agents/skills/docs-creator/SKILL.md`; applied current-state docs voice. |
| Active goal checked or created | yes | Active autogoal objective covers per-file docs decisions, source checks, and autoreview. |
| Docs lane selected | yes | Concept, API reference, library reference, and walkthrough lanes selected. |
| Target docs read | yes | Audited all `content/docs/plite/**/*.md` files through the file matrix. |
| Nearest sibling docs read | yes | Used existing Editor, Plite React, hooks, roots, saving, and collaboration docs as siblings. |
| Docs style doctrine read | yes | Followed docs-creator style: fast path first, exact APIs, no changelog language. |
| Documented source code read | yes | Verified public surface in `slate`, `plite-react`, `plite-layout`, and examples. |
| Ownership map drafted | yes | Roots and document state in `slate`, DOM/content roots in `plite-react`, pagination in `plite-layout`. |
| Plugin-page rules decision | yes | N/A: no plugin page changed. |
| Browser/render proof decision | yes | N/A: markdown docs and nav only; no runtime route behavior changed. |
| PR/tracker expectation decision | yes | N/A: user requested local docs audit, not PR/tracker sync. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] Docs lane is classified as concept, API reference, library reference, and
      walkthrough.
- [x] Target docs and nearest sibling docs were read before writing.
- [x] Docs style doctrine in `docs-creator` was read before writing.
- [x] Documented behavior and API names were verified against current source.
- [x] Ownership map records core runtime, slate-react, slate-layout, site example,
      and docs ownership.
- [x] Fastest success path appears before deeper mechanics or API reference in
      new docs.
- [x] Opening sections are short and avoid generic filler.
- [x] Named APIs, options, components, imports, routes, and package specifiers are
      exact and current.
- [x] Provider-root `onChange` examples are not presented as full-document
      persistence.
- [x] Full document persistence uses `editor.subscribe` and
      `state.value.get()`.
- [x] Persistent state fields and collaboration state patches document
      allowlists, history skipping, and remote replay metadata.
- [x] Comments docs keep bodies, permissions, resolved state, and audit events
      outside the Plite document.
- [x] API reference docs use exact contracts and avoid tutorial filler.
- [x] Spec/law docs record owner map, evidence, and explicit gaps through the
      proof map.
- [x] Links target real leaf pages and no stale concept lives only in examples.
- [x] Anti-slop audit passed: no changelog voice, fake APIs, placeholder
      comments, unresolved TODOs, dead anchors, or redundant summary section.
- [x] Workspace authority recorded: proof commands name the cwd/tool that owns
      changed docs.
- [x] Autoreview selected and run for non-trivial docs IA.

Docs File Matrix:
| File | Decision | Source-backed reason |
|------|----------|----------------------|
| `docs/Introduction.md` | keep | Overview has no root, hidden-content, layout, or document-state claim to update. |
| `docs/Summary.md` | update | Nav needs the document state concept and current Plite React/Layout docs homes. |
| `docs/api/locations/README.md` | keep | Location index does not own root resolution details. |
| `docs/api/locations/location.md` | keep | Location union remains valid; rooted point details live on Point and Range. |
| `docs/api/locations/path-ref.md` | keep | Path refs are not persistent document state. |
| `docs/api/locations/path.md` | keep | Path semantics do not change for root-aware persistence docs. |
| `docs/api/locations/point-entry.md` | keep | Entry tuple doc has no root or persistence contract. |
| `docs/api/locations/point-ref.md` | keep | Point refs stay transient and do not own document persistence. |
| `docs/api/locations/point.md` | update | Points can carry `root`; omitted roots resolve through the active view or main fallback. |
| `docs/api/locations/range-ref.md` | keep | Range refs remain transient selection helpers. |
| `docs/api/locations/range.md` | update | Ranges need same-root resolution through rooted points. |
| `docs/api/locations/span.md` | keep | Span doc does not own root, content root, or persistence behavior. |
| `docs/api/nodes/README.md` | keep | Node index has no document-state API claim. |
| `docs/api/nodes/editor.md` | update | Editor API needs `initialValue.roots`, root reads, `tx.roots`, state field, and state patch docs. |
| `docs/api/nodes/element.md` | keep | Element shape remains model-level and does not own child root linking examples. |
| `docs/api/nodes/node-entry.md` | keep | Node entry tuple doc has no persistence or root policy. |
| `docs/api/nodes/node.md` | keep | Node traversal docs remain valid without document-state changes. |
| `docs/api/nodes/text.md` | keep | Text docs do not own multi-root persistence. |
| `docs/api/operations/README.md` | keep | Operations index does not need separate state persistence content. |
| `docs/api/operations/operation.md` | update | Rooted node, text, selection, and fragment operations need active-root fallback language. |
| `docs/api/transforms.md` | keep | Transform docs already teach update-scoped writes and do not own document persistence. |
| `docs/concepts/01-interfaces.md` | keep | Interface overview has no stale persistence surface. |
| `docs/concepts/02-nodes.md` | keep | Node basics remain correct; child-root ownership lives in Roots. |
| `docs/concepts/03-locations.md` | keep | Concept page remains a high-level location intro; API pages own exact root fallback. |
| `docs/concepts/04-transforms.md` | keep | Transform concept stays current for update-scoped writes. |
| `docs/concepts/05-operations.md` | keep | Operation basics stay high-level; rooted operation contract lives in API docs. |
| `docs/concepts/06-commands.md` | keep | Command docs do not own persistence or hidden DOM policy. |
| `docs/concepts/07-editor.md` | update | Editor concept must distinguish provider root children from full `state.value.get()`. |
| `docs/concepts/08-plugins.md` | update | Plugin-owned `contentRoot` behavior links into Roots instead of being example-only. |
| `docs/concepts/09-rendering.md` | keep | Rendering basics still correctly point users to Plite React. |
| `docs/concepts/10-serializing.md` | keep | Serialization remains node-focused; full document persistence lives in Document State. |
| `docs/concepts/11-normalizing.md` | keep | Normalization docs do not own roots or persisted state fields. |
| `docs/concepts/12-typescript.md` | keep | TypeScript docs have no stale document-state guidance. |
| `docs/concepts/13-roots.md` | update | Roots concept owns multi-root, content-root, synced-root, and root-aware copy/paste responsibilities. |
| `docs/concepts/14-document-state.md` | new | Full persisted document state needs a durable concept home beyond `editor.children`. |
| `docs/general/changelog.md` | unrelated-by-audit | Historical changelog is excluded from current-state docs checks. |
| `docs/general/contributing.md` | keep | Contributor commands mention tests only and do not teach user-facing state APIs. |
| `docs/general/docs-proof-map.md` | update | Proof map needs rows for roots, content roots, DOM coverage, slate-layout, and document state. |
| `docs/general/faq.md` | keep | FAQ has no current root, hidden-content, layout, or persistence claim. |
| `docs/general/resources.md` | keep | Resource links do not own API guidance. |
| `docs/libraries/slate-history/README.md` | keep | History docs stay separate from persisted document state. |
| `docs/libraries/slate-history/history.md` | keep | History stack docs do not own state field persistence. |
| `docs/libraries/slate-hyperscript.md` | keep | Hyperscript docs do not own runtime roots or persistence. |
| `docs/libraries/slate-layout/README.md` | update | Layout docs own page layout, provider-owned boxes, page virtualization, and Pretext limits. |
| `docs/libraries/slate-react/README.md` | update | Plite React index needs leaf links for DOM coverage and state-related hooks. |
| `docs/libraries/slate-react/annotations.md` | update | Annotation docs must keep comment bodies and permissions outside the Plite document. |
| `docs/libraries/slate-react/dom-coverage-boundaries.md` | update | Hidden content policies need a dedicated Plite React page with current option names. |
| `docs/libraries/slate-react/editable.md` | update | Editable stays the fast entry point and links out for DOM coverage and roots. |
| `docs/libraries/slate-react/event-handling.md` | keep | Event handling does not own persistent state or content-root docs. |
| `docs/libraries/slate-react/experimental-virtualized-rendering.md` | update | Virtual rendering docs point to slate-layout and DOM coverage boundaries. |
| `docs/libraries/slate-react/hooks.md` | update | Hooks docs need `useStateFieldValue` and `useSetStateField`. |
| `docs/libraries/slate-react/react-editor.md` | keep | ReactEditor helpers do not own persistence beyond provider root. |
| `docs/libraries/slate-react/slate.md` | update | `Plite` docs teach the provider-root `onChange` shortcut and point full persistence to `editor.subscribe`. |
| `docs/plans/2026-04-26-embeds-void-arrow-navigation-regression.md` | unrelated-by-audit | Existing historical plan is not public API reference. |
| `docs/walkthroughs/01-installing-slate.md` | keep | Install guide does not own root or persistence behavior. |
| `docs/walkthroughs/02-adding-event-handlers.md` | keep | Event walkthrough does not own persisted state. |
| `docs/walkthroughs/03-defining-custom-elements.md` | keep | Custom elements guide does not own child-root persistence. |
| `docs/walkthroughs/04-applying-custom-formatting.md` | keep | Formatting guide remains block/mark focused. |
| `docs/walkthroughs/05-executing-commands.md` | keep | Commands guide stays update-scoped and does not own full document saves. |
| `docs/walkthroughs/06-saving-to-a-database.md` | update | Saving guide now distinguishes single-root children saves from full `EditorDocumentValue`. |
| `docs/walkthroughs/07-enabling-collaborative-editing.md` | update | Collaboration guide needs filtered state patches, remote replay metadata, and shared field allowlists. |
| `docs/walkthroughs/09-performance.md` | update | Performance guide points pagination users at page-level virtualization in slate-layout. |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run link audit, stale-term audit, `bun check`, autoreview, and autogoal check. | Link audit passed, stale-term audit passed, `bun check` passed, and final Codex autoreview is clean. |
| Docs lane shape satisfied | yes | Check concept, API, library, and walkthrough docs against docs-creator. | New docs split concept, package reference, API reference, and walkthrough guidance instead of dumping everything into one page. |
| Source-backed claim audit | yes | Verify every named API, option, component, import, route, and package specifier against source. | Source audit covered `root`, roots state, `tx.roots`, content roots, content boundaries, policies, layout hooks, and state fields. |
| Ownership map verified | yes | Confirm package and layer ownership claims against source. | Core roots and document state in `slate`, DOM/content roots in `plite-react`, pagination layout in `plite-layout`. |
| MDX/content parser | no | Markdown-only docs; no MDX contentlayer route build required for `Plate repo root`. | N/A: docs are plain markdown, link audit covers local refs. |
| Links/routes/previews verified | yes | Check leaf links and anchors. | Markdown link audit checked 62 markdown files and passed. |
| Plugin page specifics | no | No plugin page changed. | N/A: no plugin docs page changed. |
| Browser/render surface changed | no | Record explicit waiver. | N/A: no runtime/browser surface changed. |
| Package/API behavior changed | no | Record changeset decision. | N/A: docs-only change; formatter touched one code line without behavior change. |
| Agent rules or skills changed | no | Record sync decision. | N/A: no skill/rule source changed. |
| Autoreview for non-trivial docs changes | yes | Run `.agents/skills/autoreview` local mode. | Final Codex autoreview clean: no accepted/actionable findings. |
| Final lint | yes | Run fast repo gate. | `bun check` passed in `Plate repo root`. |
| Goal plan complete | yes | Run autogoal `check-complete`. | This plan is ready for the final mechanical check. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read source/docs siblings and selected docs lanes. | done |
| Writing | complete | Added Document State and updated persistence, hooks, roots, Plite React, collaboration, and proof-map docs. | done |
| Verification | complete | Link audit, stale-term audit, `bun check`, and final Codex autoreview passed. | done |
| PR / tracker sync | complete | N/A: not requested. | done |
| Closeout | complete | This plan records per-file decisions and final gates. | autogoal check |

Findings:
- Document persistence was under-documented: `<Plite onChange>` only covers the
  provider root, while full document saves require `editor.subscribe` and
  `state.value.get()`.
- State fields needed explicit persistence, history, collaboration, and replay
  guidance so comments, page settings, and shared metadata do not get mixed into
  `editor.children`.
- Collaboration docs needed an adapter-owned allowlist for exported and inbound
  `statePatches`.
- Comments needed a clear boundary: store comment/thread/annotation ids in Plite
  only when needed; keep bodies, permissions, resolved state, and audit events
  in the app store.
- DOM coverage, roots, and layout docs from the earlier pass remain valid and
  now connect to document-state guidance.

Decisions and tradeoffs:
- Keep `Plite` docs on the public `onChange` path and remove specialized
  callback names from public docs because `public-surface-contract.ts` bans them.
- Use `editor.subscribe` for services and persistence instead of React render
  callbacks.
- Recommend creating a new editor for arbitrary saved document replacement;
  in-place replacement must reconcile roots and every registered persistent
  state field.
- Put durable model language in Concepts, exact API contracts in API docs, and
  package usage in library docs.
- Record untouched docs as explicit keep or unrelated-by-audit rows rather than
  editing every file for noise.

Implementation notes:
- Added `docs/concepts/14-document-state.md`.
- Updated `docs/walkthroughs/06-saving-to-a-database.md` for single-root versus
  full-document persistence, state field persistence, root reconciliation, and
  comments ownership.
- Updated `docs/walkthroughs/07-enabling-collaborative-editing.md` for shared
  state patch allowlists, remote replay metadata, and remote-origin rebroadcast
  guards.
- Updated `docs/libraries/slate-react/slate.md`, `hooks.md`, `annotations.md`,
  `docs/api/nodes/editor.md`, `docs/concepts/07-editor.md`,
  `docs/concepts/13-roots.md`, `docs/api/locations/point.md`,
  `docs/api/operations/operation.md`, and `docs/general/docs-proof-map.md`.
- Removed public docs references to `onValueChange` and `onSelectionChange`.
- A formatter-only line wrap landed in
  `packages/plite-react/src/editable/input-router.ts`; no runtime behavior was
  intentionally changed.

Review fixes:
- Autoreview caught earlier layout docs that used non-current layout helper
  names; those were fixed before this document-state pass.
- Autoreview caught content-root wording that implied content lived in
  `childRoots`; docs now say `childRoots[slot]` stores a root key and content
  lives in `state.value.get().roots[rootKey]`.
- Autoreview caught a `PagedEditable` example without the required Plite
  provider; docs now wrap the example in `<Plite editor={editor}>`.
- Autoreview caught public `Plite` docs listing `onValueChange` and
  `onSelectionChange`; docs now teach only `onChange` and `editor.subscribe`.
- Final Codex autoreview reported no accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial docs plan was template-only | 1 | Replace with concrete per-file matrix and evidence | Resolved in this file. |
| Autoreview found layout/content-root docs issues | 2 | Fix examples, content-root ownership language, accessibility caveat, operation lifecycle docs, and provider example | Resolved before the document-state closeout. |
| Autoreview found banned public `Plite` callback names | 1 | Remove specialized callbacks from public docs instead of broadening the public surface | Resolved and clean autoreview reran. |

Verification evidence:
- `/Users/zbeyens/git/plate-2/Plate repo root`: markdown link audit checked 62
  markdown files and passed.
- `/Users/zbeyens/git/plate-2/Plate repo root`: stale-term audit for
  `include-model`, `summary-only`, `model-backed`,
  `not-native-until-mounted`, old boundary names, stale `state.value.get()` as
  array examples, raw `commit.statePatches` export,
  `Editor.getCollabStatePatches`, and public `onValueChange` /
  `onSelectionChange` docs returned no matches.
- `/Users/zbeyens/git/plate-2/Plate repo root`: `bun check` passed: lint,
  package/site/root typecheck, Bun unit tests with 1172 pass and 95 skip,
  slate-layout with 37 pass, and slate-react Vitest with 55 files and 566
  tests passed.
- `/Users/zbeyens/git/plate-2/Plate repo root`: docs-focused Codex autoreview
  first pass found one accepted issue in `docs/libraries/slate-react/slate.md`;
  the public callback docs were removed.
- `/Users/zbeyens/git/plate-2/Plate repo root`: final docs-focused Codex
  autoreview reported no accepted/actionable findings and marked the patch
  correct with confidence 0.78.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: no tracker sync requested.
- Confidence line: high after source audit, per-file matrix, link audit,
  stale-term audit, `bun check`, and autoreview.
- Docs lane: concept + API reference + library reference + walkthrough.
- Source-backed claims: roots, content roots, DOM coverage policies, layout
  APIs, full document persistence, state fields, comments ownership, and
  collaboration state patches verified against `Plate repo root`.
- Content build / parser: N/A for markdown-only docs; link audit and
  `bun check` cover this repo shape.
- Links / demos / previews: markdown links checked across 62 docs files.
- Browser check: N/A: no rendered app behavior changed.
- Outcome: docs IA now has durable homes for new concepts and a per-file audit.
- Caveat: no public website deployment proof was requested.
- Verified: link audit, stale-term audit, `bun check`, autoreview, autogoal
  check.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A for docs-only markdown work.
- Caveats: no behavior changes; docs describe current public surface only.

Timeline:
- 2026-05-31T06:50:41Z Docs goal plan created.
- 2026-05-31T07:07:34Z Placeholder plan replaced with concrete roots, DOM
  coverage, and layout audit matrix.
- 2026-05-31T12:12:00Z Document-state docs audit matrix, review fixes, and
  fresh verification evidence recorded.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final autogoal closeout. |
| Where am I going? | Run check-complete, close the goal, and report the concise result. |
| What is the goal? | Ensure Plite docs have correct homes for roots, DOM coverage boundaries, hidden content policies, layout pagination, and persistence beyond `editor.children`. |
| What have I learned? | Provider-root `onChange` is only the single-root shortcut; full persistence belongs to `editor.subscribe` plus `state.value.get()`, with state fields and collaboration patches handled explicitly. |
| What have I done? | Added Document State, updated persistence/collaboration/API/reference docs, verified all docs files in the matrix, fixed autoreview findings, and recorded fresh proof. |

Open risks:
- Public docs site rendering was not separately opened because the changed files
  are markdown docs and no runtime browser surface changed.
