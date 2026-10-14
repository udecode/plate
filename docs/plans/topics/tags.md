# Tags and form-value editors

Page: https://claude.ai/artifact/DFg9Xs7f1UTQB8YfZgxmLE

Which selected values and editing rules should a tag field persist, and can its duplicate selection stores disappear? The tag field is a one-line editor whose chips are inline void `tag` elements, so the user can move the caret between chips, delete them with Backspace, copy and paste them, and drag one before another. Plate publishes no tag plugin. The copied `select-editor` item ships `tag.tsx`, whose `TagPlugin` stores each chip's `value` and optional `url` and renders the chip, and `select-editor.tsx`, whose `SelectTagPlugin` adds the duplicate, whitespace, search cleanup and backward-delete rules and whose `SelectEditor` is the whole form field. The document is the field's only value, and its text is the only search. The field reports chip changes from each commit and writes a controlled value back whenever it differs from the chips. The field spec `apps/www/src/registry/components/editor/select-editor.spec.tsx`, the browser spec `apps/www/tests/browser/select-editor.spec.ts`, the two `select-editor` regressions in `apps/www/tests/browser/runtime-read-regressions.spec.ts` and the scale probe `apps/www/scripts/run-select-editor-scale-probe.mts` prove today's behavior. The scope's review and plan history prints with `node tooling/scripts/review-ledger.mjs show tags`.

## Public API

A form renders one field component instead of four nested parts. The field keeps its own menu, so the read-only switch only hides it, and the form's ref, blur and error props reach the editable.

```tsx
// apps/www/src/registry/examples/select-editor-demo.tsx
<SelectEditor
  ref={field.ref}
  aria-describedby={fieldState.error ? errorId : undefined}
  aria-invalid={fieldState.invalid}
  aria-label="Labels"
  items={LABELS}
  placeholder={readOnly ? 'Empty' : 'Select labels...'}
  readOnly={readOnly}
  value={field.value}
  onBlur={field.onBlur}
  onValueChange={readOnly ? undefined : field.onChange}
/>
```

The demo's form schema keeps each chip's link.

```ts
// apps/www/src/registry/examples/select-editor-demo.tsx
z.object({
  url: z.string().optional(),
  value: z.string(),
})
```

The chip file defines the tag element, and the field's `SelectTagPlugin` extends it with the duplicate, whitespace, search cleanup and backward-delete rules, instead of importing Plate's plugin.

```tsx
// apps/www/src/registry/components/editor/tag.tsx
export const TagPlugin = definePlugin('tag', {
  schema: {
    element: {
      properties: {
        url: property.string(),
        value: property.string({ required: true }),
      },
      void: 'inline',
    },
  },
});

// apps/www/src/registry/components/editor/select-editor.tsx
plugins: [SelectTagPlugin.configure({ component: TagElement })],
```

The field reports chip changes from the editor's commit, and puts the form's value back whenever the chips and the form disagree, with no timer and no React copy. It compares against the form's value with duplicates removed, so a refused change is written back once and never reported. A form value that repeats a label shows it once, and the form gets the shorter list with the next change made in the field.

```tsx
// apps/www/src/registry/components/editor/select-editor.tsx
const chips = useEditorSelector(
  (current) => current.plugin(SelectTagPlugin).read.items(),
  { equalityFn: (previous, next) => !!previous && sameItems(previous, next) }
);

React.useLayoutEffect(() => {
  if (value === undefined) return;

  const tags = editor.plugin(SelectTagPlugin);
  const items = dedupeByTagKey(value);

  if (sameItems(tags.read.items(), items)) return;

  tags.update({ history: 'skip', tags: RECEIVE }).replaceItems(items);
}, [chips, editor, value]);

onValueChange={({ commit }) => {
  if (commit.tags.includes(RECEIVE)) return;

  const items = projectItems(commit.after.children, TagPlugin.name);

  if (
    !sameItems(
      projectItems(commit.before.children, TagPlugin.name),
      items
    )
  ) {
    onValueChange?.(items);
  }
}}
```

Read back, a chip keeps its link.

```ts
// apps/www/src/registry/components/editor/select-editor.tsx
const toItem = (node: { url?: string; value: string }): SelectItem => ({
  ...(node.url === undefined ? {} : { url: node.url }),
  value: node.value,
});
```

## Main changes

| Owner | Job |
| --- | --- |
| `apps/www/src/registry/components/editor/select-editor.tsx` | The form field and its tag rules: the document is the only value, the form's value is written in whenever it differs from the chips, chip changes are reported from each commit, one duplicate rule, search cleanup inside the transaction and after a caret move, its own option list, menu keys and ARIA, editor props passed through, and the blocked undo |
| `apps/www/src/registry/components/editor/tag.tsx` | The `tag` element plugin and the chip, which in read-only mode links its `url` only when link's `getLinkHref` accepts it, inside a non-editable wrapper. Web and relative addresses go through Next's link with `[` and `]` escaped in the path; other schemes render a plain anchor |

## What other editors do

No editor we read ships a tag field whose value is a list of chips bound to a form. Each ships a mention chip at most, and only Tiptap and CKEditor 5 put it in a package. None prevents duplicate chips or offers a helper that lists them; apps walk the document. A Codex seat read each source on 2026-10-12 at the commits below, and the lead spot-checked its citations.

| Editor | Where the chip lives | What it stores | Reads the list back | Duplicates and query cleanup | Form field of chips |
| --- | --- | --- | --- | --- | --- |
| Tiptap `91c51be5` | `extension-mention`, an inline atom node | `id`, `label`, trigger character | Generic `findChildren` | Package replaces the query and adds a space; no duplicate check | None found |
| Lexical `dd5c41b1` | Playground mention text node; `lexical-hashtag` is a text node | `mentionName` and text fields | Generic `$nodesOfType` | Playground replaces the query; no duplicate check | None found |
| CKEditor 5 `14e73cc3` | `ckeditor5-mention`, an attribute on text, not an atom | `id`, `uid`, `_text`, app data | None | Package replaces the query and adds a space; repeated ids allowed | None found |
| BlockNote `1e26f1c5` | Example only, built on the package's inline atom factory | `user` | None; apps walk `editor.document` | Package menu clears the query; no duplicate check | None found |

## Layer and owner

Every owner moves into the copied `select-editor` registry item, which ships `select-editor.tsx` and `tag.tsx`. Both import only `platejs` and `platejs/react`, which every copied editor item already imports, so the entrypoint graph gains no edge.

| Change | Layer | Package | Why |
| --- | --- | --- | --- |
| The `tag` element schema | Plate copied UI | registry item `select-editor`, file `tag.tsx` | Only copied UI uses it (`docs/vision/plate.md:1229-1233`), and a retained item is recounted by its terminal consumers (`:1235-1238`) |
| Duplicate, whitespace, search cleanup and backward-delete rules | Plate copied UI | registry item `select-editor` | Product policy lives in copied source (`VISION.md:90`) |
| The value, search, active option, menu keys and ARIA | Plate copied UI | registry item `select-editor` | Copied controls own the active option (`docs/vision/plate.md:495`) |
| The chip's read-only DOM | Plate copied UI | registry item `select-editor`, file `tag.tsx` | Plite reverts editable DOM changes outside a `contenteditable="false"` element |
| The chip's link | Plate copied UI | registry item `select-editor`, file `tag.tsx` | It asks link's public `getLinkHref` with an installed link plugin's schemes (`docs/vision/plate.md` stored-URL law); Next's link keeps the base path and in-app navigation |
| `./tag` and `./tag/react` | Plate | `platejs`, removed | No consumer outside copied UI |

`docs/vision/plate.md:1220-1225` keeps domain invariants with their feature owner even with one consumer, when the package holds a contract independent of the renderer. The tag schema has none in this repository: no serializer, transform or headless reader uses it, and its duplicate and cleanup rules are the field's product policy. A document that holds `tag` elements gets its owner from the copied `TagPlugin`.

## Open work

- Two richtext browser cases fail on next whether or not the onFocus fix is in: keeps selected bold as the active mark after deleting its text, and keeps empty paragraph styling after the selection leaves and returns; `docs/plans/2026-10-12-plite-onfocus.decisions.tsv` has the runs. owner: zbeyens. stop: both pass on next.
- Two paths can still miss a real focus: the outside-press settle window skips the editor's own focus note, and a focus on the editor root while a nested editable holds the selection skips `onFocus` and the note. I did not reproduce either as a user bug. owner: zbeyens. stop: each is reproduced and fixed or judged intended, or 2026-11-30.
- The tags plan's reflect backlog item 4 would teach `onFocusCapture` for copied voids, which the onFocus fix makes unnecessary. owner: zbeyens. stop: the owner takes item 4 without that part, or drops it.
- Plite drops a dragged inline void as a copy, so dropping a chip after another chip does nothing; the suggested session "Make Plite move dragged inline voids" has the brief. owner: zbeyens. stop: dropping a chip after another moves it, or 2026-11-30.
- The test harness sends named-key shortcuts such as Escape and Ctrl or Cmd+Enter without a keyCode, so the field's browser spec presses them through Playwright's keyboard; the suggested session "Give harness named-key shortcuts a keyCode" has the brief. owner: zbeyens. stop: `editor.press('Escape')` closes the menu in that spec, or 2026-11-30.
- The chip's stored `url` has no floor validator, which `docs/vision/plate.md:731` asks for. It needs admission at the field's initial value, write-back and pick, a report or inert keep for each refused form url, and a migration note for documents loaded with `TagPlugin` elsewhere. owner: zbeyens. stop: a plan for the chip floor lands, or 2026-11-30.
- No committed test renders chips through Next's App Router link, whose development check throws on a bracketed path segment, including an IPv6 host such as `[::1]` in a string `href`. The probe `docs/plans/artifacts/2026-10-12-link-href/probes/app-router-brackets.spec.tsx` covers it, but its module mocks are process-wide in Bun. owner: zbeyens. stop: a Bun-safe App Router render setup in `apps/www`, or 2026-11-30.
- The `select-editor` registry item depends on `next` through `tag.tsx`. owner: zbeyens. stop: the owner says plain link, or 2026-11-30.
- A web chip url with a user and password loses them in Next's formatter. owner: zbeyens. stop: a report of a credentialed chip link, or 2026-11-30.
- `pnpm --filter www api-reference:check` fails at `5fc246c291` itself, because the committed API reference manifest predates the list entrypoint changes. owner: zbeyens. stop: the check passes at the head of `next`.
