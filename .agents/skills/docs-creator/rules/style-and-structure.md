# Style And Structure

## Gap Review And Page Topology

When asked whether docs have gaps, answer with a page-topology decision, not a
pile of possible pages.

Classify each gap:

| Gap                                                  | Fix                                                              |
| ---------------------------------------------------- | ---------------------------------------------------------------- |
| Missing mental model across several APIs or packages | Add a guide/system concept page.                                 |
| Missing exact options, signatures, or return values  | Improve the API/reference section.                               |
| Missing setup path for one capability                | Improve the plugin/feature page.                                 |
| Same concept split across two small pages            | Merge into the stronger page and redirect links.                 |
| A page only repeats an existing reference            | Delete or shrink it into a link from the canonical page.         |
| A behavior is source-real but hard to discover       | Add a concept guide plus cross-links from the owning references. |

Strong default: **concept page over primitive pages** when a behavior is a
pipeline. For example, do not create separate "Delete" and "Merge" pages when
the reader needs the editing lifecycle. Create one "Editing Behavior" guide with
delete and merge as headings, then link the rule/API references into it.

Keep references as references:

- `Plugin Rules` owns `plugin.rules` keys and actions.
- API pages own exact signatures and tables.
- Plugin pages own feature setup and feature-specific behavior.
- Concept guides own the mental model that crosses those pages.

When adding a concept page, update the adjacent references with one precise
cross-link. Do not copy the same explanation into every page.

## Shadcn Style Layer

The shadcn docs style is not "more words with friendlier tone." It is dense,
structured, and component-driven:

- Frontmatter owns the page title and description. The body starts fast.
- Lead prose is usually one short paragraph. Copy that density unless Plate
  needs extra disambiguation.
- One section does one job. Install, usage, examples, RTL, composition, and API
  reference are separate lanes.
- MDX components carry structure. Use `<ComponentPreview>`, `<CodeTabs>`,
  `<Steps>`, `<ComponentSource>`, `<Callout>`, `<LinkedCard>`, and `<Tabs>` when
  they express real choices or workflow, not as decoration.
- Package-manager commands stay as plain install/run fences so Plate can render
  package-manager command tabs. Reserve `<CodeTabs>` for CLI/manual choices.
- Titled code fences are the default for file edits. Use `title="..."` and
  `showLineNumbers` when a path or line context matters.
- Examples come as visible previews first, then terse explanation. Do not
  explain a visual variant for three paragraphs when the preview and one line
  do the job.
- API reference is compact: exact prop/option tables and short caveats, not a
  tutorial restart.

Plate docs can stay more explanatory where the editor runtime is genuinely
harder than a UI component, but the default should be shadcn-dense: short lead,
clear section shape, real MDX affordances, no filler.

## Voice

This is where docs usually go wrong.

- **Direct.** Use "you" when it helps, but do not pad every section with "we" or "let's".
- **Shadcn-dense.** Short paragraphs, concrete verbs, visible examples, no essay before the first working path.
- **Progressive.** One new idea per paragraph. Never land an advanced pattern before the fundamentals.
- **Why before what.** Every non-obvious choice gets a one-line reason.
- **Guide, don't just show.** One sentence of context before every code block. Code is never a substitute for prose.
- **Build progressively.** Start with the simple path, then add complexity only
  after the reader has a working model.
- **Celebrate completion.** End a section with a landing: "Done.", "That's it.", or one line on what the reader now has.
- **Real code.** Never write placeholder comments (`// your logic here`). Write what the reader would actually write.
- **Reinforce in tiers.** Concept in prose → example in code → recap in a table if it's an enum or option matrix.
- **Highlight real gotchas.** Use callouts for environment constraints,
  security warnings, explicit-not-automatic behavior, or other points readers
  will actually hit.

Shadcn-terse vs conversational: **the tension resolves cleanly.** Prose is conversational. Code blocks and API reference sections are shadcn-terse. Don't mix the two tones within a section.

Banned openings:

- "In this guide, we will explore..."
- "This comprehensive guide..."
- "This robust, powerful, seamless..."
- Any marketing adjective pile before the reader sees the problem.

## Structural Rules

### Opening (above the first `##`)

Three sentences max:

1. What the page is about and what it does for the reader.
2. If a sibling concept exists, one inline sentence distinguishing them. Plain prose — not a Callout.
3. One sentence on what the guide will walk through.

Nothing else above the first `##`. No feature brag, no marketing adjectives, no TOC cosplay.

### Ownership

- Always state where behavior lives: core runtime, feature entrypoint, kit, or app-local copied code.
- If the page says "the kit also adds X", the ownership boundary matters — surface it in a table or callout.
- For every named API, the reader should be able to tell you which package/layer owns it within 10 seconds of scanning.
- For behavior that spans packages, name each layer: input rule, plugin rule,
  transform, normalization, selection, UI component, registry kit, app-local
  copy. If a layer is not involved, do not imply it is.
- Use an ownership table when prose would blur the boundary.

### Quick path first

- The reader does the thing before hitting the appendix.
- The kit-based path is the default quick path in this repo.
- Manual/headless path comes after, labelled as such.
- When there are multiple valid starts, use a small branch selector near the
  top: cards or links that jump to exact sections like "Use the CLI" and
  "Existing Project".
- For CLI/manual install choices, prefer `<CodeTabs>` with `Command` and
  `Manual` tabs over stacked sections.
- For package-manager variants, write the canonical install/run command in a
  plain code fence and let Plate's command renderer produce the package-manager
  tabs.

### Reference last

- Exact helper signatures, option matrices, primitives → `## API Reference` at the end.
- Don't sprinkle precise type signatures across tutorial sections. It kills flow.
- API Reference = ProseMirror-style exactness. Tutorial = Slate-style narrative.

### Headings agents can find

- Use stable, predictable heading names matching the real API or concept in code.
- `### createMarkInputRule` beats "Creating a mark rule".
- `## Kit Usage` / `## Manual Usage` / `## API Reference` are stable slugs across the repo. Don't invent synonyms.
- Same lane → same heading names. Cross-page consistency matters for agent navigation.

### Page length

- If the page passes ~300 lines, add an anchor list or "On this page" jump block near the top.
- If the page passes ~600 lines, consider splitting. Ask first.

### Navigation And Routing

Adding, moving, merging, or deleting a docs page is a routing change.

- Add the MDX page in the lane folder that matches its route.
- Update `content/docs/meta.json` root `pages` when the raw page tree order
  should change.
- Update `_plate.categoryGroups` in `content/docs/meta.json` when the sidebar
  overlay should show nested grouping, labels, descriptions, or CN titles.
- Update `_plate.items` when the route needs title, label, description,
  keywords, or CN title metadata.
- Add links from the nearest owning pages, not from every vaguely related page.
- If no `.cn.mdx` page is added, know that CN docs may fall back to English.
  Record that as a caveat rather than pretending the page is translated.
- Verify the route itself, not just the source file. Pager order and sidebar
  grouping are rendered contracts.

Do not leave orphan pages: every new page needs a route, a nav decision, and at
least one useful inbound link from the owning neighborhood.

### Release Docs

`/docs/releases` is docs topology, not changeset policy.

- `/docs/releases` renders generated package release data and generated Plate UI
  changelog JSON. Do not hand-author release-page Plate UI entries; use the
  `registry-changelog` skill for source entries, generation, and verification.
- Keep the latest two major release groups on `/docs/releases`.
- Move older v49+ major groups to dedicated `/docs/releases/<major>` pages
  instead of burying them in a catch-all archive.
- Link each older major page from `/docs/releases` under `Older releases`.
- Link `v48 and earlier` from `Older releases` to `/docs/migration/v48`.
- Changesets own package-release bullets. They do not own release-page
  retention, routing, or archive shape.

## Code Example Rules

- Repo-backed examples only. If a kit does what you're teaching, cite the exact kit file.
- Include real imports. Show `platejs`, `platejs/react`, and optional
  `platejs/<feature>` paths explicitly.
- Use `// ...otherPlugins,` only when the omission is obvious.
- No placeholder comments (`// your logic here`, `// Your validation logic`).
- In Plite schema examples, never repeat derived structural membership:
  non-inline elements belong to `block`, while inline elements do not. In Plate
  examples, use `blockContent: false` for structural internals and
  `plugins.blockContent()` for normal-flow container content.
- Use direct `root`/named-root content, omitted closed defaults,
  `schema.element.textBlock()` for ordinary editable blocks,
  validator-backed narrow `property.json()`, placement-owned
  `role: "metadata"`, app-owned schema `id`/`version`, and runtime
  `create`/`assertDocument`/`assertFragment`/`isMarkableVoid`. Plate callers
  pass plugin descriptors directly to schema APIs; only raw Plite schemas use
  `schema.handle.*`.
- In Plate examples, use plugin `name` only for capability identity. Read final
  persisted identity from an exact element portal's `plugin.schema.type` or an
  exact primary-mark portal's `plugin.schema.key`. Behavior and
  aggregate-property portals omit `schema`; normal consumers use semantic
  plugin methods or typed nodes. Never teach universal plugin `.type` / `.key`,
  consumer `schema.properties`, optional identity access, or name fallbacks.
- Ordinary application examples export one human-named readonly plugin kit,
  usually `EditorKit`, and, when needed, one human-named schema, usually
  `EditorSchema`; map them directly to the `plugins` and `schema` editor
  options. On advanced compiler pages, teach that `plate generate` discovers
  their validated runtime shapes rather than fixed export identifiers.
  Property keys and value laws remain feature-owned; persisted renames require
  a new field and an explicit migration.
- Teach persisted document upgrades as one app-owned `{ document, schema }`
  envelope plus `defineDocumentMigrations` target-version steps and exact
  generated `sourceFingerprints` for historical envelopes. Raw documents need
  an explicit `unversioned` floor. Import the builder, runner, and Plate release
  steps from `platejs/migrations`. Teach `prepareDocument` only as
  installed-plugin current-schema preparation after host migration and before
  schema fitting. Never teach migration plugins, normalizers for historical
  shapes, per-node versions, or CLI-only runtime policy.
- `showLineNumbers` + `{n-m}` highlights on snippets longer than ~15 lines.
- `title="filename.tsx"` when file context matters.

Inline code hygiene:

- CommonMark matches inline-code delimiters by backtick-run length. Literal `` ` ``` ` `` inline breaks rendering.
- To show triple backticks, rephrase ("a triple-backtick fence") or use a fenced block.

## Links

- Link the specific leaf page, not a broad hub.
- Don't link the same target three times in one section.
- If you're displacing an old page, **do not link back to it** — it reinforces the page you're killing.
- Inline links on the exact concept being referenced.
- When a page has a close sibling concept, link the sibling near the top.

## Demos and Previews

- `<ComponentPreview name="..." />` only when the demo exists in the registry.
- Never fake a demo name to balance a page.
- If the demo lands after the doc, ship the doc without the preview and add it when real.

## Agent Affordances

Agents specifically benefit from:

- **Exact names in prose.** API names, file paths, package specifiers — spelled out, not paraphrased.
- **Predictable heading slugs.** Same names for the same sections across similar pages.
- **Real imports.** Import statements complete enough to copy-paste and run.
- **No invented APIs.** If the source code does not ship it, it does not exist.
- **Tables for enums and variants.** Bullet-buried enums get missed.
- **Disambiguation on near-name siblings.** If `FooPlugin` and `FooClassicPlugin` coexist, the first sentence says which one this page is about.

## Anti-Slop Rules

Do not:

- Use changelog voice: "previously", "now supports", "has been removed", "new feature", "updated to".
- Open with generic fluff or marketing adjectives ("comprehensive", "robust", "seamless", "powerful", "first-class").
- Brag in bullet lists before the reader can do anything.
- Dump a full API catalog before the happy path.
- Blur package-owned behavior with app-local copied code.
- Flatten adjacent lanes because they smell related.
- Hide critical environment limits halfway down the page.
- Invent examples that skip required imports or dependent plugins.
- Paste giant code walls without explaining why the code matters.
- Duplicate whole doc blocks when a precise link would do.
- Keep stale routes, file paths, imports, or package names in prose.
- Write placeholder comments (`// your logic here`).
- Claim a model or behavior the runtime does not implement.
- End with a redundant "Summary" or "Recap" — the celebrate-completion line is enough.
- Ship a `<ComponentPreview>` pointing at a demo that does not exist.
- Reference a route you're about to delete or displace.

Silence in the source code is a gap, not an agreement.
