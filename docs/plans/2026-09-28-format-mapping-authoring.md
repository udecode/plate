---
review_scopes:
  - format-mappings
  - markdown
review_basis:
  - 2026-09-28-format-mappings-value-review
  - 2026-09-28-markdown-dialect-prototype-correction
work_kind: design
---

# Format mapping authoring

Status: Complete — design settled and proven by prototype; implementation awaits authorization

This is a project-owned file template under Task. Apply the project's standing
Autogoal request for long-running work unless the user opts out. Apply
`.agents/rules/task/references/workflow.md` to timing, publication and review
rows. Relevant domain and executable-validator gates remain required; mark
unrequested publication/review N/A.

Objective:
Let the Markdown runtime construct simple registered-tag nodes, convert their
owned properties and traverse their children from the bound schema, so feature
plugins declare a tag instead of hand-writing the same decode/encode pair.
Derive mark roles and simple mark wrappers from the schema the same way. Keep
real format exceptions as callbacks and keep HTML, Markdown and plain text
distinct.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-09-28-format-mapping-authoring.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- none

Mode:

- `standard`: one format (Markdown authoring) with HTML as comparator; the
  value review already settled scope and rejected the universal-codec cut.

Completion threshold:

- Binary readiness: live claims sourced, one owner per responsibility, every
  decision resolved, every public break has adoption and proof, execution
  slices are concrete, conditional gates are resolved, and `check-complete`
  passes.

Verification surface:

- Planning proof: `docs/plans/artifacts/2026-09-28-format-mapping-authoring/prototype.test.ts`
  and its `prototype.log` (parity, ownership counterexample, scale probe), run
  with `bun test --preload ./config/plite-source-aliases.ts ./docs/plans/artifacts/2026-09-28-format-mapping-authoring/prototype.test.ts`.
- Execution commands, named per slice below: `pnpm --filter platejs
  test:partition:markdown`, the Markdown-related feature specs, the `.slow`
  Markdown files, `apps/www` Markdown package-integration suites,
  `tsconfig.type-tests.json`, `check-plate-schema-adoption`, and the tracked
  Markdown benchmark.

Constraints:

- Planning-only request: stop at handoff. Execution needs the user's
  authorization.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact.
- Keep HTML, Markdown, plain text, component rendering and DOCX distinct
  (value review). No universal codec, public intermediate AST or automatic
  export of every schema type.

Boundaries:

- In scope: Markdown `tag` element mappings, Markdown mark mappings, the
  Markdown mapping compiler and codec, their public types, docs, doctrine and
  tests.
- Source owners: `packages/platejs/src/lib/plugin/MarkdownNodeMapping.ts`
  (public contract), `packages/platejs/src/markdown/lib/internal/markdownMappings.ts`
  (compiler and dispatch), `internal/markdownAttributes.ts` (codec),
  `serializer/convertTextsSerialize.ts` (mark writer), and the feature plugins
  that declare Markdown mappings.
- Non-goals: HTML mapping authoring (already runtime-owned construction and
  schema-inferred roles; it is the comparator), plain-text mappings, `node`
  mappings for standard Markdown kinds (heading, list, table, link, image,
  code, math, footnotes), grammar changes, DOCX.
- Direct Plite boundary owners: N/A. Plite's schema supplies the content model
  and property roles unchanged; no Plite API changes.

Output budget strategy:

- Read named owners first; expand by evidence; keep the inventory and
  prototype results in this plan and its artifact log.

Blocked condition:

- None. Execution authorization is the only remaining step.

Plate Plan state:

- phase: handoff
- next: execution authorization
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Value review next step: simplify schema-bound Markdown authoring, remove repeated construction and traversal, preserve explicit format semantics, prove representative cases and counterexamples first |
| Task plan and execution authority verified | yes | User's "go all" authorized this design plan; execution is not authorized |
| Current owners read | yes | Findings cite the mapping types, compiler, codec, HTML compile path and every tag mapping |
| Best API target resolved | yes | Decision brief and ledger D1–D7; call sites below |
| Runtime scale applicability resolved | yes | Decode/encode per tag node changes owner (runtime instead of callback); scale probe below |
| Pre-acceptance Benchmark probe selected | yes | Prototype scale probe: 1,600 tags, alternating order, hand-written vs derived |
| Mode and execution boundary resolved | yes | Standard mode; plan-only |

Work Checklist:

- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every scale-sensitive target has a passing executable current-owner versus
      target Benchmark receipt before its decision row locks.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Canonical state versus exact-view presentation is classified when
      applicable: N/A, no view state.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | Done: decisions D1–D7 resolved; slices and proof concrete |
| Fresh source evidence | yes | Recheck decision-changing current claims | Done 2026-09-28 against commit `a54dd033ba` |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding | Done: see Best API verdict; no open P0/P1 |
| Pre-acceptance scale proof | yes | Matched baseline/target result | Done: derived 1.02× hand-written, overlapping ranges, identical documents |
| Production scale rerun contract | yes | Exact rerun per slice | Done: tracked Markdown benchmark in S1 and S3 |
| Conditional risk and adoption | yes | Complete triggered work | Done: docs, doctrine, checker and changeset owners named in S4 |
| Verification recorded | yes | Record planning proof and execution gates | Done: Verification evidence |
| Handoff prepared | yes | Prepare concise handoff | Done: Final handoff prepared |
| P1 autoreview | no | Task gate | N/A: plan-only on `next`; Autoreview never runs on `next` |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-28-format-mapping-authoring.md` | Done |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | done | Inventory of every Markdown tag and mark mapping; HTML compile path; schema content model and property roles | Decide |
| Decide | done | D1–D7 with prototype parity, counterexample and scale probe | Hand off |
| Prove and hand off | done | `prototype.log`; this plan | User authorizes execution |

Decision brief:

- outcome: A simple Markdown tag becomes `markdown: { tag: type }`. The runtime
  builds the node, converts the owner's properties through the existing codec,
  and traverses children by the schema content model. Media adds
  `attributes: { url: 'src' }`. Mark roles come from the schema, and simple
  marks declare only their tag, value or style.
- chosen shape: an explicit per-plugin declaration with owner-scoped property
  exposure (the same ownership HTML compiles), plus callbacks for real
  exceptions.
- strongest rejected alternative: exporting every content-role schema property
  by default. It writes List's `indent`/`listType` onto `<img>` (prototype
  counterexample) and ignores metadata/ownership law.
- consequence: about 11 element mappings and 13 mark mappings lose their
  callbacks. The runtime drops its hard-coded bold/italic/strikethrough/code
  switch. `mark: true` leaves the public contract.

Call sites (real imports: `definePlugin`, `property` and `schema` from `platejs`):

```ts
// Normal path: construction, owned properties and children are derived.
formats: ({ defineFormats, schema: { type } }) =>
  defineFormats({ markdown: { tag: type } }),

// Customization: a wire alias for an owned property.
markdown: { tag: type, attributes: { url: 'src' } },

// Marks: role from the schema; no `mark` flag.
markdown: { tag: 'kbd' },                               // boolean mark
markdown: [{ tag: 'sub', value: 'sub' }, { tag: 'sup', value: 'sup' }],
markdown: { tag: 'span', style: 'color' },              // CSS-valued mark
markdown: { node: 'strong' },                           // standard container

// Escape path for real format differences (date, image): today's callbacks.
markdown: { tag: type, decode: (context) => …, encode: (context) => … },
```

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D1 Element tag construction and traversal | Every tag mapping hand-writes `{ ...readTagAttributes().properties, children: decode(...), type }` and the mirror `encode` (toc, column, columnGroup, callout, summary, details, codeDrawing, audio, file, video, mediaEmbed) | `markdown: { tag: type }` with no callbacks. The compiler resolves the content model once per type: void writes no children; text-capable content unwraps one paragraph, refuses block content and writes one paragraph (none when empty); block containers decode and encode flow | `markdownMappings.ts` compiler | The schema already owns content kind; the runtime already owns construction for HTML | Delete the callbacks of the 11 mappings; details' paragraph-wrapped summary unwrap is deleted only if the grammar's block lift covers it (S2 check) | Prototype 11/13 fixtures identical; the 2 differences are the empty text block writing `<callout icon="x" />` instead of `<callout icon="x"></callout>`, which reads back identically | Output change for empty text blocks; accepted and documented | Adopt |
| D2 Property exposure | Callbacks spread every node property (`encodeAttributes(rest)`); column filters `id` by hand | Owner-scoped by default: the mapping owner's own schema-contributed element properties, through the existing codec. Metadata-role and foreign-owned properties are never written or read | Codec plus compiler, using the owner's model binding as HTML's `compileProperties` does | HTML already scopes encodable properties to the owner binding; a role-only default writes foreign List topology | Delete column's `getMarkdownAttributes`; `reportOmittedProperties` keeps reporting unclaimed content properties | Prototype counterexample: `image` content-role properties include `checked, indent, listRestart, listStart, listStyle, listType` | An owned property that must stay private would be exported; no current case, so no allowlist yet | Adopt |
| D3 Wire aliases | Four media mappings rebuild `url` from `attributes.src` and write `src: url` | `attributes: { url: 'src' }`, owned property → attribute name, both directions, typed against owned keys | Public mapping type + codec | Only format difference in four copies | Audio, file, video, mediaEmbed; image's custom callbacks may use the same map for `src`/`height` | Prototype media case 3/3 identical | None beyond typing | Adopt |
| D4 Real exceptions stay callbacks | Date, image, and all `node` mappings use callbacks | Unchanged: date (value normalization, legacy text child), image (native `![]()` vs `<img>` vs `<figure>`), standard-kind `node` mappings | Feature plugins | Behavior not derivable from the schema | None | Existing specs | None | Retain |
| D5 Mark role from the schema | `mark: true` flag; `wrap` for tag marks; runtime switch writes bold/italic/strikethrough/code | No `mark` flag: a mapping whose owner contributes a text property is a mark mapping. `{ tag }` derives `decode → true` and the `<tag>` wrapper; enum marks list `{ tag, value }` entries and write the entry matching the value; `{ node: 'strong' \| 'emphasis' \| 'delete' \| 'inlineCode' }` derives the standard container. `wrap` stays the escape path | Public type, compiler, `convertTextsSerialize.ts` | HTML infers role from the contribution; the runtime should not hard-code feature keys | 13 mark mappings become declarations; delete `basicMarkdownMarks` key handling while keeping the container nesting order (inline code innermost) | Existing mark round-trip specs, markdownMappings dispatch tests, type contracts | Mark nesting order regressions; covered by existing serializer specs | Adopt |
| D6 CSS-valued marks | Five style plugins parse `style` with `getMarkdownStyleValue` and hand-write the `<span style>` wrapper | `{ tag: 'span', style: 'color' }`: decode reads that CSS property, the wrapper writes it. The writer still emits one span per mark | Public type + compiler | Same job five times; ProseMirror style rules precedent | Five style plugins | Existing style-mark specs and the composing-marks dispatch test | Merging marks into one span is not adopted | Adopt |
| D7 HTML and plain text | HTML builds nodes from returned properties with a content token and infers role; plain text is one-way | Unchanged; HTML is the comparator, not a target | HTML plugin, plain-text mappings | Value review: distinct semantics; Plate-specific elements have no semantic HTML mappings | None | N/A | None | Retain |

Best API verdict:

- Normal path reads without explanation: `markdown: { tag: type }`.
- Public nouns: `attributes` (wire names for owned properties), `value` (enum
  mark per tag) and `style` (CSS property for a mark). All three live on the
  existing `MarkdownNodeMapping` contract in `platejs`; no new namespace,
  plugin or helper.
- Hard-cut gate:
  - Deleting the declaration entirely (auto-export every type) was rejected
    by the value review.
  - Deleting `tag: type` would lose the image `img` case and the checker's
    uniform identity law.
  - `mark: true` is deleted.
  - Per-mapping property allowlists are not added: the owner's schema already
    declares its properties, and no current property needs hiding.
- Type laws: `attributes` keys and `value` infer from the owner definition (as
  HTML's owned property map does); callback parameters keep inference.
- No open P0/P1.

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| S1 Derived element tags | Markdown compiler + codec | D1, D2, D3: derive construction/traversal/properties for callback-less `tag` mappings; owner-scoped codec; `attributes` aliases; migrate toc, column, columnGroup, callout, summary, details, codeDrawing, audio, file, video, mediaEmbed | Execution authorized | 11 mappings are declarations; column's metadata filter deleted | Markdown partition, feature specs, `.slow` Markdown, `apps/www` Markdown suites; one test that a foreign List property and metadata `id` are not written; tracked Markdown benchmark rerun |
| S2 Details check | Details plugin | Verify the grammar lifts a paragraph-wrapped `<summary>`; delete details' unwrap if so | S1 | Details is `{ tag: type }` or keeps a documented reason | Details specs and the `details` fixture in `.slow` |
| S3 Derived marks | Markdown compiler + mark writer | D5, D6: delete `mark`, derive boolean/enum/style/standard-container marks, remove the runtime's key switch | S1 | 13 mark mappings are declarations; `basicMarkdownMarks` gone | Mark and style specs, dispatch tests, type contracts (positive + negative for `value`/`attributes`), tracked Markdown benchmark rerun |
| S4 Contract, docs, doctrine | Best API repair, Plate Docs, Plate Next | Public types and JSDoc, `markdown.mdx`/`.cn.mdx` mapping section, plugin-creator and best-api rules, new Plate Next doctrine version, schema-adoption checker (`mark` field), changeset | S3 | Docs and rules teach declarations first, callbacks as escape | `check:docs`, doctrine `validate`, checker tests, Skiller apply |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Derived tags match hand-written wire output | `prototype.log`: callout 3/5, column 3/3, toc 2/2, media 3/3; the 2 callout differences are the accepted empty-text-block form | Existing feature and Markdown suites after migration | done (planning) |
| Owner-scoped exposure is required | `prototype.log` IMAGE line: content-role properties include List topology | New test: foreign List property and metadata `id` are not written | done (planning) |
| No runtime cost | `prototype.log` SCALE line: derived 184.6 ms vs hand 180.8 ms, ratio 1.02, overlapping ranges, 1,600 tags | Tracked Markdown benchmark rerun in S1 and S3 | done (planning) |
| Marks derive from the schema | HTML infers rule role from the contribution (`BasePlugin.ts` `HtmlSelfRule`); ProseMirror and Milkdown precedents | Mark specs and type contracts | done (planning) |

Scale contract:

- applicability and source evidence: per-node Markdown decode/encode for tag
  and mark nodes moves from feature callbacks to the compiler.
- user operation, current owner, proposed owner: parse and serialize of
  documents with registered tags; feature callback → Markdown compiler.
- independent scale variables and normal/large/stress/pathological cohorts:
  tag count per document; the tracked Markdown benchmark's legacy
  normal/large/stress cohorts and B4 inline/nested tag doubling.
- frozen absolute/relative budget and noise rule: the tracked benchmark's
  frozen contract (B1 ≤ 1.10×, B2 ≤ 1.25×, B3 ≤ 1.5×, B4 ≤ 2.5× doubling,
  10% band inconclusive).
- current baseline command/artifact and source identity: prototype hand-written
  mappings on commit `a54dd033ba`.
- target command/artifact or disposable prototype and source identity:
  `prototype.test.ts` derived mappings, same commit.
- deterministic work indicators plus timing result: identical documents and
  diagnostics per fixture; timing ratio 1.02 with overlapping ranges.
- correctness/native guard: fixture parity plus the tracked benchmark's
  correctness guards.
- final production-path rerun owner and exact command: Task in S1 and S3, per
  the tracked receipt's `commands` (baseline, candidate, compare) in
  `benchmarks/editor/benchmarks/results/plate-markdown-dialect-latest.json`.

Conditional evidence:

- High-risk scenarios: mark nesting order when the key switch is removed (S3).
  Existing serializer specs cover bold/italic/code nesting and the inline-code
  innermost rule.
- External research: done. Local clones of tiptap, prosemirror-markdown,
  prosemirror-model, lexical, milkdown and portabletext; summarized in
  Findings.
- Issue/PR provenance: N/A; no public issue drives this design.
- Docs/registry/browser/release/behavior-law owners: Plate Docs and Plate Next
  in S4. The registry is unaffected because no registry item declares Markdown
  mappings. Browser proof is N/A because no interaction changes. The
  changeset is in S4.
- Performance pack, pre-acceptance receipt, and final rerun: prototype scale
  probe (pre-acceptance); tracked benchmark rerun (S1, S3).

Findings:

- Inventory (commit `a54dd033ba`), by what each Markdown `tag` mapping does:
  - Pure construction with properties: toc, column, columnGroup, codeDrawing.
  - Text-block rule: callout and summary unwrap one paragraph and refuse block
    content.
  - Flow content: details.
  - Text-block caption plus `url` ↔ `src`: audio, file, video, mediaEmbed,
    four identical copies.
  - Real exceptions: date (normalization, legacy text child) and image
    (representation choice, `naturalHeight` ↔ `height`).
- The schema view exposes what derivation needs:
  - `content.allowsText` and allowed element types per type.
  - `behavior.void`.
  - Property roles.
- HTML compiles each mapping's owned properties from its model binding
  (`HtmlPlugin.ts` `compileProperties`). HTML reports unencoded content
  properties (`reportUnsupportedProperties`). Its rule role is inferred from
  the schema contribution.
- Prior art, from the local clones:
  - ProseMirror: the runtime builds nodes and walks children (`from_dom.ts`
    563–599), and a rule's role comes from where it sits (289–303).
  - Milkdown: role is inferred from the schema, but the `src`/`url` rename
    needs a full runner (`image.ts` 49–67).
  - Tiptap: its allowlist filters only on write, and a node with no renderer
    exports as an empty string (`MarkdownManager.ts` 904–907).
  - Plate's structured diagnostics are stronger than all three; nothing here
    is evidence that Plate is the best editor.

Decisions and tradeoffs:

- Owner-scoped exposure over an explicit allowlist: the owner's schema already
  lists its properties. An allowlist restates them in every mapping until a
  private owned property exists; add narrowing then.
- Empty text blocks write self-closing tags: simpler output, identical read.
- One span per style mark stays: merging spans is a separate writer change
  with no current request.

Review fixes:

- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Replacing a plugin's Markdown mapping through `.extend()` | 1 | Pair hand-written and derived mappings on identical minimal schemas | Parity prototype |
| Reading `structure.void` for void elements | 1 | Use `behavior.void` | Fixed in prototype |

Verification evidence:

- `bun test --preload ./config/plite-source-aliases.ts ./docs/plans/artifacts/2026-09-28-format-mapping-authoring/prototype.test.ts`:
  6 pass; parity, counterexample and scale lines in `prototype.log`.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-28-format-mapping-authoring.md`: complete.

Final handoff prepared:

- Ownership and target API: Markdown compiler owns construction, owned
  property conversion and traversal. Features declare `{ tag }`, `attributes`,
  `value`, `style` or `node`, with callbacks for exceptions.
- Public breaks and adoption:
  - `mark` is removed.
  - Callback-less `tag` and mark declarations are added.
  - All in-repo mappings migrate in S1–S3, with no aliases.
- Applicable runtime/package/docs/browser decisions: runtime and package in
  S1–S3; docs and doctrine in S4; browser N/A.
- Scale applicability, design receipt, and production rerun contract:
  prototype scale probe; tracked benchmark rerun in S1 and S3.
- Proof and execution risks: mark nesting order (S3); empty text-block output
  change (documented).
- Execution order and user attention: S1 → S2 → S3 → S4. Execution needs
  authorization. The artifact folder is gitignored and needs `git add -f` at
  commit.

Timeline:

- 2026-09-28 Plate Plan created.
- 2026-09-28 Inventory, prior art, parity prototype, counterexample and scale
  probe complete; decisions D1–D7 settled; handoff prepared.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Handoff |
| Where am I going? | Execution after authorization |
| What is the goal? | Declarative Markdown tag and mark mappings derived from the schema |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:

- Mark nesting order when the runtime key switch is removed (S3).
- A future owned property that must not reach Markdown needs a narrowing
  option then.
