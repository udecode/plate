---
review_scopes:
  - media
review_basis:
  - 2026-09-21-media-object-editable-content-final-pass
work_kind: design
---

# Object elements with editable children

Status: Complete — design ready; product adoption has not started

Objective:
Design the Plite schema and editing contract for an independently meaningful,
selectable block whose ordinary children remain editable. Adopt that contract
for Plate media so empty captions cannot erase assets, caption selections do
not copy assets, and Enter cannot clone asset identity.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-09-21-object-elements-with-editable-children.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- package-api
- docs
- browser

Mode:

- deep

Completion threshold:

- The public schema shape, compiler invariants, editing semantics, migration,
  docs, release treatment, focused proof, browser proof, and ledger handoff are
  resolved enough to execute without another API decision.

Verification surface:

- Live Plite schema/compiler, emptiness, split, slice, selection, replacement,
  transaction, and DOM selection owners.
- Live Plate media schema and caption Enter command.
- Existing model and React contracts plus a disposable source-alias probe for
  open slices, paste, range deletion, and the Enter matrix.
- Planning validation through Autogoal check-complete, review-ledger checks,
  and git diff --check.
- Exact execution commands are fixed below.

Constraints:

- Planning only. This plan changes no product source.
- next may break the branch-only API; do not add compatibility aliases,
  decoders, or runtime shims.
- Keep media captions as ordinary direct children in the same document,
  history, clipboard, and collaboration model.
- Keep Plate media policy in Plate; Plite owns only neutral schema and
  operation laws.
- Do not introduce a caption wrapper, nested editor, named root, persisted
  caption field, generic object plugin, or second isContent axis.
- An object must not become a void or atom. Editable descendants remain normal
  editor content.

Boundaries:

- In scope: a public object schema role, its compiled behavior, validation,
  schema identity, generic operation semantics, deletion of
  keyboardSelectable, migration of Plate media, caption Enter redesign,
  behavior laws, public docs, changesets, and focused model/browser proof.
- Source owners: packages/plitejs/src/interfaces/schema.ts,
  packages/plitejs/src/core/schema-compiler.ts,
  packages/plitejs/src/core/public-state.ts,
  packages/plitejs/src/core/get-content-slice.ts,
  packages/plitejs/src/editor/is-empty.ts,
  packages/plitejs/src/editor/transforms/split-nodes.ts, Plite selection/DOM
  owners, and packages/platejs/src/features/media/lib/BaseMediaPlugin.ts.
- Direct Plate adoption: image, file, audio, video, and media-embed element
  descriptors plus their shared caption Enter command and public media docs.
- Collaboration boundary: no Yjs-specific model or wire change. The feature
  stays expressible as ordinary document operations; run the existing Yjs
  partition as a regression gate.
- Non-goals: a general attachment model, multiple named content regions, table
  or layout semantics, nested editors, upload lifecycle changes, a rendering
  primitive, or compatibility with old compiled schema fingerprints.

Output budget strategy:

- Reuse the recorded source census and research probes. During execution,
  inspect exact owners/importers, run focused suites first, and reserve full
  package/browser gates for slice closure.

Blocked condition:

- Execution stops only if current transaction APIs cannot express the
  one-transaction media exit without a new generic primitive, or if a focused
  model proof contradicts selection-shaped transfer. Return that slice to Best
  API with the failing case.

Plite Plan state:

- phase: prove-and-hand-off
- next: execute slice S1
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Covers the first-principles object decision and image-caption regression family. |
| Task plan and execution authority verified | yes | This turn is planning-only; implementation remains a separate Task pass. |
| Current owners read | yes | Schema, compiler, state, slices, emptiness, split, selection, media, tests, docs, and release owners were inspected. |
| Best API target resolved | yes | One object schema fact survives; keyboardSelectable, isContent, wrappers, roots, and editable voids do not. |
| Runtime scale applicability resolved | yes | One compiled boolean and existing constant/depth-local predicates change; no collection, cache, index, subscription, serialization payload, or fan-out is added. |
| Pre-acceptance Benchmark probe selected | no | Source-backed N/A: no size-sensitive algorithm or new repeated work; correctness probes are the acceptance evidence. |
| Mode and execution boundary resolved | yes | Deep design is complete; product implementation is outside this pass. |

Work Checklist:

- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API, docs, tests, exports, and behavior claims cite live source.
- [x] Reusable public call shape has a Best API verdict.
- [x] The hard-cut counterfactual was applied to every public noun and layer.
- [x] Runtime scale was classified from current owners.
- [x] Every decision has owner, adoption, proof, risk, and verdict.
- [x] Canonical content and view presentation remain one document.
- [x] Public breaks have complete adoption and deletion answers.
- [x] Execution slices and focused proof are concrete.
- [x] Browser, docs, behavior-law, release, doctrine, and ledger work are
      assigned.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every execution-shaping decision | Public shape, invariants, laws, adoption, proof, and release treatment are fixed below. |
| Fresh source evidence | yes | Recheck decision-changing claims on current next | Source census and disposable probes ran on 2026-09-21. |
| Best API review | yes | Resolve all material call-shape findings | object is the only new public fact; keyboardSelectable is deleted and no isContent or builder is added. |
| Pre-acceptance scale proof | no | Record source-backed N/A | No scale-sensitive owner changes; see Scale contract. |
| Production scale rerun contract | no | Record source-backed N/A | No performance claim or scale-sensitive path is accepted. |
| Conditional risk and adoption | yes | Assign browser, docs, behavior, release, and collaboration work | Slices S2–S5 and the proof matrix name each owner and gate. |
| Verification recorded | yes | Record planning proof and exact execution gates | See Verification evidence and Proof matrix. |
| Handoff prepared | yes | State ownership, breaks, proof, risks, and order | See Final handoff prepared. |
| P1 autoreview | no | Apply only for explicit review/PR closeout and never on next | N/A: design pass on next; semantic review is already recorded. |
| Goal plan complete | yes | Run Autogoal plan checker | Recorded in Verification evidence. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Prior review, external research, live census, and executable probes reconciled. | Decide |
| Decide | complete | Public contract and operation matrix are settled. | Prove and hand off |
| Prove and hand off | complete | Slices, commands, behavior laws, release work, and ledger binding are concrete. | Execute S1 |

Decision brief:

- outcome: Introduce a strict block-level object schema role for independently
  meaningful owners with editable children, then migrate all five Plate media
  elements.
- chosen shape: schema.element.textBlock({ object: true }), public compiled
  behavior object: boolean, state.schema.isObject(element), and
  state.schema.getElementBehavior(element).object.
- strongest rejected alternative: keep current flags and patch image emptiness,
  slicing, and Enter independently. That repairs symptoms but leaves each
  generic operation to rediscover the same domain fact and permits future owner
  deletion or duplication.
- consequence: keyboardSelectable disappears from schema input, compiled
  behavior, and public state. Object identity controls semantic emptiness,
  owner selection, split boundaries, and selection-shaped transfer while
  remaining distinct from atom, void, read-only, and rendering.

Public contract:

    const image = schema.element.textBlock({
      object: true,
      type: 'img',
    });

    state.schema.isObject(imageNode);
    state.schema.getElementBehavior(imageNode).object;

- Add object?: boolean to SchemaElementInput and SchemaTextBlockOptions. Compile
  it to a required public object: boolean.
- Keep schema.element.textBlock(...). An object() builder would create a second
  constructor grammar for one orthogonal role.
- Add state.schema.isObject(element). Do not add an editor/plugin namespace;
  this is schema truth.
- Delete keyboardSelectable from public inputs, compiled behavior, public
  queries, docs, tests, and callers. Internally, owner selection derives from
  selectable && (object || atom).
- Do not add isContent. For the current job, independent semantic content is
  exactly the object role; another axis admits contradictions without a second
  consumer.

Compiler invariants:

- object: true is valid only for a block element that is non-void, non-atom,
  selectable, and structurally isolating.
- The compiler derives isolating: true for an object.
- Reject explicit inline: true, void: true, atom: true, selectable: false, or
  isolating: false with object: true.
- Accept explicit redundant isolating: true, though examples omit it.
- Reject object: true with explicit slice.preserveContext. Descendant text
  transfer must remain open; whole-owner transfer uses NodeSelection.
- readOnly stays independent. A read-only object has the same identity and
  transfer laws while mutation commands remain unavailable.
- object, the deleted field, and derived behavior participate in schema
  contracts, fingerprints, deltas, snapshots, restore checks, and public type
  tests.

Operation laws:

| Situation | Required behavior |
| --- | --- |
| Empty descendants | isEmpty returns false for void, atom, or object elements. An empty-caption asset is content. |
| Empty-block replacement | Generic replaceEmpty never replaces an object. Remove duplicated !isAtom guards from Plite and Plate insertion predicates after canonical emptiness lands; keep readOnly guards. |
| Generic Enter/split | An object is a hard stop. Generic split cannot clone it and does no default split while the caret is inside it. A feature may claim Enter before fallback. |
| Merge/delete fitting | Derived isolation continues to protect the owner boundary during merge, delete, and fitting. |
| Body/chrome click | Non-editable object chrome selects the owner with NodeSelection. |
| Child click | Editable child text receives TextSelection. |
| Keyboard traversal | From an object owner, ArrowDown may enter the first editable child; ArrowUp at the first child position may return to owner. Atom remains owner-only because descendants are not traversable. |
| Owner mutation | Backspace/Delete removes a selected owner; printable input may replace it through the existing NodeSelection path; undo restores it. |
| Owner clipboard | Copy/cut of NodeSelection transfers the closed object and all children. |
| Inner child clipboard | TextSelection inside object children transfers open child content and cannot recreate the owner. |
| Cross-boundary endpoint | A range beginning or ending inside an object stays open there and cannot smuggle a closed owner. Open path metadata is allowed; insertion must not recreate it. |
| Fully covered object | A broader range wholly containing an object transfers the owner as complete content. |
| Paste into child | Multi-block open content keeps one object: first incoming block joins the caption; remaining blocks become siblings after it. |
| Cross-boundary deletion | Delete preserves a partially selected object, deletes selected descendant/outside content, and keeps the outside suffix. |
| Explicit node APIs | Whole-node duplicate and delete remain valid. |

Slice correction:

- Remove isolating as a generic getOpenDepth barrier. Isolation governs
  structural fitting and merge/delete boundaries; it does not imply closed
  clipboard context.
- Keep void and explicit slice.preserveContext as context barriers.
- Use selection shape to decide owner transfer: NodeSelection closes over the
  object; inner or boundary TextSelection remains open.

Plate media Enter:

- Delete the current next() → generic split → property scrub /
  tx.blocks.reset algorithm. It creates a transient cloned media owner and a
  cross-boundary selection can commit that duplicate.
- Claim Enter only for a collapsed caret inside one of five media object types
  or for an expanded text selection whose start, after one deletion, resolves
  inside that object. Media NodeSelection is a no-op.
- Execute one transaction:
  1. Delete an expanded selection once through the transaction fragment owner.
  2. Resolve the surviving collapsed caret.
  3. If it is inside media, capture the open suffix from caret to child-content
     end.
  4. Delete that suffix from media children.
  5. Create the schema-default root/parent block and insert it immediately
     after media with empty replacement disabled.
  6. Fit the open suffix into that block and select its start.
  7. If deletion leaves the caret outside media, delegate original Enter
     behavior instead of fabricating an exit.
- Never duplicate, reset, or type-convert the asset owner. Use ordinary
  operations so history and collaboration observe one atomic command.

Media Enter acceptance matrix:

| Selection before Enter | Result |
| --- | --- |
| Caption start | One media with empty caption, followed by a paragraph containing the whole former caption. |
| Caption middle | One media with prefix, followed by a paragraph with suffix. |
| Caption end | One unchanged media, followed by an empty paragraph. |
| Expanded within caption | Delete once; keep left remainder in media and move right remainder to following paragraph. |
| Caption into following paragraph | Keep one media with unselected caption prefix, delete selected text, insert an empty exit paragraph after media, and preserve the outside suffix. |
| Same expanded cases backward | Same document and caret as forward selection. |
| Media NodeSelection | No-op. |

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Schema noun | Coordinated isolating + keyboardSelectable | Strict object: true role | Plite schema/compiler | One fact owns independent content with editable descendants | Input, behavior, query, validation, identity | Compiler, contract, type, public API tests | Contradictory combinations | accept |
| Builder | textBlock only | textBlock({ object: true }) | Plite schema DSL | Object is a role, not a second kind | No new builder | Inference/type tests | API noun growth | accept |
| Keyboard selection | Public keyboardSelectable | Private selectable && (object || atom) | Plite selection | Removes interaction-policy leakage | Delete field/query; migrate five media | Renamed React object-selection suite | Atom/object confusion | accept |
| Emptiness | Void-only exclusion plus caller atom guards | Void, atom, and object are never empty | Plite isEmpty | Central invariant prevents caller drift | Remove redundant atom checks | Empty replacement contracts | Wider replacement changes | accept |
| Structural boundary | Explicit isolation on media | Object derives isolation | Compiler/transforms | Owner boundary is schema law | Migrate descriptors | Merge/delete/split tests | Over-restriction | accept |
| Slice openness | Isolation closes inner ranges | Isolation removed from open-depth barrier | Plite slices | Inner text must not transfer owner | Update algorithm/contracts | Partial/full/cross/paste tests | Other isolating blocks | accept with census |
| Generic split | Void-only stop | Object also stops split | Plite split | Generic code cannot clone identity | Add object query | Split/Enter tests | Feature needs custom exit | accept |
| Media exit | Split then clean/reset clone | Atomic open-suffix move | Plate media | Fixes every selection shape | Shared command for five media | Model matrix + Chromium | Missing transaction primitive | accept |
| Content model | Direct caption children | Keep direct children | Plite/Plate | One document owns editing | No migration | Child editing tests | Future multi-region job | accept |
| Collaboration | Generic operations | Generic operations | Plite/Yjs | No new state/protocol | Run existing partition | Yjs tests | Ordering | accept |
| Docs | Flags teach behavior incompletely | Object role + selection-shaped transfer | Plite/Plate docs | One truthful concept | Guides/API/media docs | Docs checks | Stale generated docs | accept |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| S1 — schema contract | Plite schema/compiler | Add object, validation, public query, identity; delete keyboardSelectable | Governing review + plan | Types compile; invalid combinations fail; identity and contracts include final shape | Focused schema/compiler/API/type tests |
| S2 — generic laws | Plite core/editor/DOM/React | Emptiness, split stop, selection derivation, slice openness, replacement, clipboard | S1 green | Owner cannot be erased/cloned; transfer matrix green | Core, DOM, React, slice, clipboard, insertion, split partitions |
| S3 — Plate adoption | Plate media | Mark five descriptors; replace Enter with suffix move; remove reset path | S1–S2 green | Full matrix passes for all media types with one owner | BaseMediaPluginContracts + typecheck |
| S4 — browser/law | www/browser + behavior docs | Real body/caption/delete/undo/Enter assertions; parity/spec rows | S3 green | Five serial Chromium runs and Plite browser matrix pass | Focused spec + browser matrix |
| S5 — docs/doctrine/release | Plite/Plate docs | Public refs, media docs, Plite vision, Plate Next version, changesets | S1–S4 stable | Docs, generated output, doctrine, release gates pass | docs/registry/type/release checks |
| S6 — closure | Task + review ledger | Broad gates, execution record, decision reconciliation, plan close | S1–S5 complete | Source-bound verified execution with explicit limits | aggregate, ledger, diff, plan checks |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Empty-caption media is meaningful | isEmpty excludes only void; probe shows replaceEmpty removes image | Object/atom/void emptiness and replacement tests | specified |
| Object differs from atom | Atom probe closes caption positions | Compiler rejection and object-versus-atom selection tests | specified |
| Inner caption copy excludes image | Isolation probe changes closed owner to open text | Partial, full, boundary, fully covered, round-trip slice tests | specified |
| Multi-block paste keeps one owner | Probe produced one image and sibling remainder | Exact clipboard tree/selection contract | specified |
| Boundary delete preserves owner | Probe retained image prefix and outside suffix | Forward/backward delete contracts | specified |
| Generic Enter cannot clone object | Split currently stops only at void | Object split-stop test independent of media | specified |
| Media Enter covers all selection shapes | Probe exposed duplicate image across boundary | Five types × start/middle/end/inside/cross/direction matrix | specified |
| Browser owner selection works | Existing suite covers owner/caption transitions | Object selection suite + Chromium body/native selection/Delete/undo/type/Enter/error assertions | specified |
| Schema identity detects break | Compiler owns fingerprint/delta/restore | Contract and restore mismatch tests | specified |
| Collaboration needs no protocol | Target uses ordinary operations | Existing Yjs partition | specified |
| Docs/release match | Current docs teach old flags | Docs, generated output, doctrine, changeset gates | specified |

Exact execution commands:

    bun test ./packages/plitejs/test/schema-definition.test.ts ./packages/plitejs/test/schema-compiler.test.ts ./packages/plitejs/test/slice-public-api-contract.test.ts

    cd packages/plitejs
    bun run test:react test/react/object-selection.test.tsx

    cd ../..
    pnpm --filter plitejs test:partition:core
    pnpm --filter plitejs test:partition:dom
    pnpm --filter plitejs test:partition:react
    pnpm --filter plitejs test:partition:yjs
    pnpm --filter plitejs typecheck
    pnpm --filter platejs test:partition:media
    pnpm --filter platejs typecheck:partition:media
    pnpm --filter www test:www-browser:chromium -- media-caption.spec.ts
    pnpm --filter www test:www-browser:chromium -- media-caption.spec.ts
    pnpm --filter www test:www-browser:chromium -- media-caption.spec.ts
    pnpm --filter www test:www-browser:chromium -- media-caption.spec.ts
    pnpm --filter www test:www-browser:chromium -- media-caption.spec.ts
    pnpm check:plite:browser-matrix
    pnpm --filter www build:registry
    pnpm --filter www check:docs
    pnpm --filter www typecheck
    pnpm install
    node .agents/rules/plate-next/scripts/version.mjs validate
    node .agents/rules/plate-next/scripts/version.mjs status
    pnpm check:plite
    pnpm plite:release:packages
    node tooling/scripts/review-ledger.mjs render
    node tooling/scripts/review-ledger.mjs check
    git diff --check
    node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-21-object-elements-with-editable-children.md

- Run five Chromium invocations serially with retries disabled by the owning
  runner/config and record each receipt.
- If registry source does not change, build:registry remains the freshness gate
  required on next; include generated output only when its owner changes.
- Run pnpm brl only if implementation adds/removes exported files or changes
  package exports.

Scale contract:

- applicability: N/A. One compiled boolean and constant/depth-local predicates
  change; no document-size loop, index, cache, subscription, payload, or remote
  call is added.
- operation owners remain schema compile, selection targeting, emptiness,
  split, and slice depth.
- scale cohorts, budget, baseline, candidate benchmark, and production rerun:
  N/A because no performance claim or scale-sensitive path is accepted.
- deterministic work remains current node/path depth.
- correctness/native guard is the model matrix plus real Chromium caption flow.

Conditional evidence:

- High-risk cases: forward/backward expanded selection, object-boundary ranges,
  fully covered objects, multi-block paste, NodeSelection, read-only, undo, and
  all five media types.
- External research: source-recorded ProseMirror, WordGard, Lexical, and
  external editor comparison in
  docs/plite/research/2026-09-21-media-object-editable-content/README.md.
- Issue/PR provenance: N/A; user-directed regression/API design.
- Browser is required for DOM-visible selection and focus.
- Benchmark is N/A for the source-backed scale reasons above.
- Docs, release, and behavior law are required in S4–S5.
- Registry changelog is N/A unless execution changes copied registry source or
  an install surface. Package changes use package changesets.

Source findings:

- Schema input currently exposes atom, isolating, keyboardSelectable, slice,
  void, and related behavior; textBlock is the only relevant builder.
- Compiler defaults keyboardSelectable to selectable && atom. Only image, file,
  audio, video, and media embed explicitly set it in production.
- Those five descriptors also set isolating: true. Isolation has independent
  consumers, so isolation remains public.
- isEmpty excludes only void; insertion callers separately guard atom and
  read-only state. This lets empty-caption images look replaceable.
- getOpenDepth treats isolation, void, and slice.preserveContext as equivalent
  barriers. The probe proves isolation closes inner caption selection around
  the image owner.
- Generic split stops only at void, allowing editable non-void media to clone.
- Existing React selection tests cover body click, caption text, ArrowUp/Down,
  Backspace/Delete, owner copy/cut, printable replacement, and undo through
  keyboardSelectable.
- Media Enter delegates to generic Enter, then scrubs properties and resets the
  right block. Package proof covers only a middle-caption case.
- Fresh source probes show:
  - open multi-block paste keeps one image, joins first content into caption,
    and inserts remaining content as a sibling;
  - boundary deletion keeps image prefix and outside suffix;
  - start/middle/end and inside-caption Enter produce plausible trees;
  - caption-to-following-paragraph expanded Enter commits two images.
- No new package, plugin, registry item, storage model, or collaboration adapter
  is required.

Decisions and tradeoffs:

- Object earns a public noun because emptiness, owner selection, splitting, and
  transfer need the same fact. Four local patches would encode a hidden type.
- The role is strict and block-only. Inline, selectable-false, atom, and
  preserved-context objects have no current consumer.
- Derived isolation protects structural ownership, while slice openness is
  separate. Reusing isolation for clipboard closure is the demonstrated leak.
- Atom remains because it answers whether descendants participate in traversal.
- Direct children remain because one caption does not earn a second region or
  editor lifecycle.
- Plate owns Enter because exiting a caption into a paragraph is media policy.
  Plite supplies only boundaries and neutral operations.

API and adoption inventory:

- Public Plite: schema input/options, compiled behavior, state schema query,
  generated declarations/reference.
- Public break: delete keyboardSelectable and its query. It is branch-only
  relative to main; migrate all current callers together.
- Production adopters: image, file, audio, video, media embed.
- Tests/oracles:
  packages/plitejs/test/react/keyboard-selectable-selection.test.tsx,
  packages/plitejs/test/dom/clipboard-boundary.ts,
  packages/plitejs/test/schema-contract.ts, schema compiler/definition, slice
  public API contracts, and Plate media contracts.
- Public docs: content/docs/api/editor-api.mdx,
  content/docs/(guides)/schema.mdx,
  content/docs/(guides)/selection.mdx,
  content/docs/(guides)/editing-behavior.mdx,
  content/docs/(plugins)/(elements)/media.mdx and its Chinese counterpart.
- Plite references:
  docs/plite/reference/public-docs/api/nodes/editor.mdx,
  docs/plite/reference/public-docs/concepts/08-plugins.mdx, and
  docs/plite/reference/public-docs/concepts/16-selection-and-dom.mdx.
- Behavior law: docs/editor-behavior/editor-protocol-matrix.md,
  docs/editor-behavior/markdown-parity-matrix.md, and
  docs/editor-behavior/markdown-editing-spec.md.
- Durable law: update only docs/vision/plite.md with object versus atom/void
  and selection-shaped transfer.
- Doctrine: audit Best API/Plite Plan teaching, append the next immutable Plate
  Next doctrine version, update its visible version, run pnpm install, and run
  validate/status. Do not forge package attestations or run unrelated syncs.
- Changesets: update existing major entries
  .changeset/plite-canonical-architecture.md,
  .changeset/plite-react-read-only-provider.md, and
  .changeset/media-v54-runtime.md with final behavior. Public docs contain no
  migration-history prose.
- Persistence: named app schemas need a schema-version boundary. Document JSON
  is unchanged; add no compatibility decoder.

Review fixes:

- Rejected narrow clean-reset because it cannot express emptiness, transfer, or
  owner selection.
- Separated atom after traversal proof showed it closes caption positions.
- Separated isolation from slice closure after proof showed it smuggles owner.
- Removed isContent, object builder, wrappers, roots, and generic plugin because
  none has an independent current job.
- Replaced split-then-clean after the final probe exposed committed duplicate
  image on cross-boundary Enter.
- Tightened compiler validation instead of publishing contradictions.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| One patch tried to delete and add this path together | 1 | Separate delete and add edits | Resolved; product source unaffected. |
| First add patch used unescaped Markdown delimiters inside a JS template | 1 | Use delimiter-free plan text | Resolved; product source unaffected. |
| Final command audit found nonexistent Plite test:core, test:dom, and test:yjs aliases | 1 | Use the package's test:partition:* scripts and Plate media partition scripts | Resolved before handoff. |

Verification evidence:

- Reconciled
  docs/research/review-records/2026-09-21-media-object-editable-content-final-pass.json,
  docs/research/decisions/media-object-content.md, and recorded research/probes.
- Read current schema/compiler, state, slice, emptiness, split, selection,
  media, docs, tests, release, and doctrine owners.
- Ran a disposable source-alias probe for multi-block paste, boundary
  export/delete, and Enter shapes. The critical result is duplicate image on
  caption-to-following-paragraph Enter.
- The three source probes pass 5/5 and are summarized in
  docs/plans/artifacts/2026-09-21-object-elements-editable-children-proof.json.
- Final plan and diff validator receipts appear in Timeline. The immutable
  execution record is written after the final plan fingerprint is fixed.

Final handoff prepared:

- Ownership: S1–S3 assign Plite schema/operations and Plate media policy without
  a new package or plugin.
- Public break: add object; delete keyboardSelectable; enumerate all five
  callers, contracts, docs, identity, and changesets.
- Browser/docs/provenance: browser and docs required; issue/PR provenance and
  performance benchmark are source-backed N/A.
- Main proof risk: changing isolation's slice role can affect non-media
  isolating elements, so S2 requires a full census and broad slice partition.
- Main implementation risk: transaction APIs may not cleanly compose an open
  suffix move. Prove composition before adding any public helper; return to
  Best API if a primitive is truly needed.
- Order: schema → generic operations → Plate media → browser/law →
  docs/doctrine/release → ledger closure.

Timeline:

- 2026-09-21T19:44:34.753Z Plite Plan created.
- 2026-09-21 Source owners, production descriptor census, docs, tests, and
  release surfaces mapped.
- 2026-09-21 External research and executable model probes reconciled.
- 2026-09-21 Public contract, compiler invariants, operation matrix, Plate
  transaction, slices, and proof commands resolved.
- 2026-09-21 Source probes passed 5/5 with 14 assertions. Autogoal
  check-complete and scoped git diff --check passed after the final edit.
  Package manifests confirmed every named partition, docs, browser, doctrine,
  and release command; the source-bound design execution record follows this
  plan fingerprint.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Design complete; no product adoption started. |
| Where am I going? | Execute S1 through S6 in order. |
| What is the goal? | Make editable-child owners explicit and impossible to erase or clone accidentally. |
| What have I learned? | Isolation is structural, atom is non-traversal, object is owner identity, and transfer follows selection shape. |
| What have I done? | Resolved API, compiler laws, operations, media Enter, adoption, and proof. |

Open risks:

- Removing isolation from open-depth may expose callers relying on accidental
  clipboard closure. S2 must census each and use explicit preserveContext only
  where the content model requires it.
- Media suffix movement may expose a missing private composition helper. Do not
  promote a public API without a separately proven reusable job.
- Browser selection geometry can diverge around non-editable chrome. Five
  serial Chromium runs are a hard acceptance gate.
- Named persisted schemas compiled with the old behavior fingerprint need an
  app version boundary even though document JSON is unchanged.
