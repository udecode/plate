# Content linting

Page: https://claude.ai/artifact/B71keRm24vLG9bhvbiYWwc

A linter reads the text, finds problems such as a filler word or a space before a comma, highlights them, lists them and offers a fix. Plate ships `platejs/lint`. Its `BaseLintPlugin` re-checks only the text blocks an edit changes, keeps a server rule's reply only while its block matches the one it sent, and fixes only the text it checked. The copied `lint` registry item adds `LintKit` with a caret popover and F8 keys, the `lint-demo` example adds a findings panel and a labeled server stand-in, and the Linting docs page teaches both in English and Chinese. Plite keeps its raw `plite/linting` example, which a Playwright test drives. The 2026-10-13 review said Stop. The owner reopened it, the 2026-10-13 lint-plate plan built the plugin, and the 2024 POC, udecode/plate#3833, is closed. `node tooling/scripts/review-ledger.mjs show lint` prints the history.

## Public API

A Plate app installs the copied kit, which configures the headless plugin with its own rules, styling, keys and popover.

```tsx
// apps/www/src/registry/components/editor/lint.tsx
export const LintKit = [
  toReactPlugin(BaseLintPlugin).configure({
    initialState: { rules: [fillerWords, commaSpacing] },
    decorate: {
      attributes: {
        className:
          'underline decoration-wavy decoration-from-font underline-offset-4 data-[lint-severity=error]:decoration-destructive data-[lint-severity=info]:decoration-sky-500 data-[lint-severity=warning]:decoration-amber-500',
      },
    },
    shortcuts: {
      next: {
        keys: 'f8',
        handler: ({ editor }) => {
          editor.plugin(BaseLintPlugin).update.move(1);
        },
      },
      previous: {
        keys: 'shift+f8',
        handler: ({ editor }) => {
          editor.plugin(BaseLintPlugin).update.move(-1);
        },
      },
    },
    slots: { afterEditable: LintPopover },
  }),
] as const;
```

A rule reads one text block's content text and returns matches with offsets, a message and optional fixes. It gets the block, so the copied rules skip code.

```ts
// apps/www/src/registry/components/editor/lint.tsx
export const commaSpacing: LintRule = {
  id: 'style/comma-spacing',
  severity: 'error',
  check: (text, { block }) =>
    isProse(block)
      ? Array.from(text.matchAll(/ , ?/g), (match) => ({
          start: match.index,
          end: match.index + match[0].length,
          message: 'Remove the space before commas.',
          fixes: [', '],
        }))
      : [],
};
```

A server rule has the same shape with an async `check`. The plugin owns request identity, aborts and stale replies.

```ts
// apps/www/src/registry/examples/lint-demo.tsx
const terminology: LintRule = {
  id: 'server/terminology',
  severity: 'info',
  check: async (text, { block, signal }) => {
    if (block.type === PLUGINS.codeBlock) return [];

    const terms = await reviewTerminology(text, signal);

    return terms.map(({ end, fix, start }) => ({
      start,
      end,
      message: `Write "${fix}".`,
      fixes: [fix],
    }));
  },
};
```

The plugin keeps its findings out of plugin state. The store's `version` changes when the list does. The copied hooks read through `useSyncExternalStore`, so the React Compiler cannot cache the read. `useLintFindings` wakes on store changes, and `useLintFindingAt` wakes on store changes and editor commits. A row carries `id`, `ruleId`, `severity`, `message`, `text` and `fixes`, with no offsets. A rule returns `LintMatch` values, `{ start, end, message, fixes? }` with UTF-16 offsets into the text it checked, and the entrypoint exports that type so a rule written outside the kit can name it.

```tsx
// apps/www/src/registry/components/editor/lint.tsx
/** Findings in document order, read again whenever the list changes. */
export function useLintFindings() {
  const lint = useEditor().plugin(BaseLintPlugin);

  return React.useSyncExternalStore(
    lint.store.subscribe,
    lint.api.findings,
    lint.api.findings
  );
}

/** The finding under the selection focus, or null. */
export function useLintFindingAt() {
  const editor = useEditor();
  const lint = editor.plugin(BaseLintPlugin);
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      const offStore = lint.store.subscribe(onChange);
      const offCommit = editor.subscribeCommit(onChange);

      return () => {
        offStore();
        offCommit();
      };
    },
    [editor, lint]
  );

  return React.useSyncExternalStore(subscribe, lint.api.at, lint.api.at);
}
```

A panel reads the findings in document order and drives run, clear, select and fix. It shows the first 50 rows and the total.

```tsx
// apps/www/src/registry/examples/lint-demo.tsx
const editor = useEditor();
const lint = editor.plugin(BaseLintPlugin);
const findings = useLintFindings();
const firstFixable = findings.find((finding) => finding.fixes.length > 0);

<Button
  onClick={() => lint.api.run(localRules)}
  size="sm"
  variant="outline"
>
  Run linter
</Button>
<Button
  onClick={() => lint.api.run([...localRules, terminology])}
  size="sm"
  variant="outline"
>
  Check with server
</Button>
<Button onClick={() => lint.api.clear()} size="sm" variant="outline">
  Clear
</Button>
<Button
  disabled={!firstFixable}
  onClick={() => {
    if (firstFixable) lint.update.fix(firstFixable.id);
  }}
  size="sm"
>
  Apply first fix
</Button>
<p aria-live="polite" className="text-sm font-medium" role="status">
  {findings.length === 1 ? '1 issue' : `${findings.length} issues`}
</p>
{findings.slice(0, 50).map((finding) => (
  <li key={finding.id}>
    <button
      onClick={() => {
        lint.update.select(finding.id);
        editor.api.dom.focus();
      }}
      type="button"
    >
      <span className="font-medium">{finding.text.trim()}</span>{' '}
      <span className="text-muted-foreground">{finding.message}</span>
    </button>
  </li>
))}
```

The caret popover reads the finding under the selection and offers each fix and fix-and-next.

```tsx
// apps/www/src/registry/components/editor/lint.tsx
const editor = useEditor();
const lint = editor.plugin(BaseLintPlugin);
const finding = useLintFindingAt();

{finding.fixes.map((fix, index) => (
  <Button
    key={fix}
    onClick={() => lint.update.fix(finding.id, index)}
    size="sm"
    variant="secondary"
  >
    {fix.trim() === '' ? 'Remove' : fix}
  </Button>
))}
<Button
  onClick={() => {
    if (lint.update.fix(finding.id)) lint.update.move(1);
  }}
  size="sm"
  variant="ghost"
>
  Fix and next
</Button>
```

Plite's text-run search takes a block scope and keeps the editor's inline and content rules on a transaction's document, so a fix inside a command document reads the same text the check read. Step 1's `best-api design` picked the root form: a read view or a transaction is a third root type, `NodeTextRangeView`, and the search uses that view's own `schema.isInline` and `nodes.isContent`.

```ts
// packages/plitejs/src/interfaces/node.ts
findTextRanges: (
  root: Node | NodeTextRangeRoot | NodeTextRangeView,
  query: NodeTextRangeQuery,
  options?: NodeFindTextRangesOptions
) => readonly Range[];

export interface NodeFindTextRangesOptions {
  /**
   * Search only the node at this path and its descendants. The path must
   * exist. Ranges keep their paths from the root.
   */
  at?: Path;

// packages/platejs/src/features/lint/lib/BaseLintPlugin.ts
NodeApi.findTextRanges(
  view,
  (text) => (text.slice(start, end) === expected ? [{ end, start }] : []),
  { at: path, content: true }
)[0] ?? null;
```

The Plite example derives findings from each text node inside a decoration source, so the highlights follow every edit without stored ranges.

```tsx
// apps/www/src/app/(app)/examples/plite/_examples/linting.tsx
const lintingSource = useMemo<DecorationSource<typeof editor>>(
  () => ({
    id: 'linting',
    read: ({ entry: [node, path] }) =>
      lintMode === 'off' || !NodeApi.isText(node)
        ? []
        : collectTextLintIssues(node.text, path, lintMode === 'server').map(
            toLintDecoration
          ),
  }),
  [lintMode]
);

<EditorRoot decorations={[lintingSource]} editor={editor}>
```

The example applies a fix as one ordinary edit.

```tsx
// apps/www/src/app/(app)/examples/plite/_examples/linting.tsx
editor.update((tx) => {
  tx.text.delete({ at: fix.range });
  tx.text.insert(fixText, { at: fix.range.anchor });
});
```

## What other editors do

| Editor | What ships | Shape | Keeping findings current |
| --- | --- | --- | --- |
| CodeMirror (`@codemirror/lint`) | A package | `linter(source)`, where the source returns diagnostics or a promise of them, each with `from`, `to`, `severity`, `message` and `actions`; `setDiagnostics` pushes outside results; commands move to the next and previous finding; a panel, gutter and tooltip | Maps stored findings through each change and reruns the source after a delay |
| ProseMirror | A website example | `lint(doc)` returns problems with fix commands, and a plugin turns them into inline and widget decorations | Recomputes on every document change |
| Tiptap | A demo under Experiments, not a published extension | A `Linter` extension runs `LinterPlugin` subclasses for bad words, punctuation and heading levels | Recomputes on every document change |
| Lexical | No lint feature found | None | None |

None of these four ships an ESLint-style rule and config engine for prose. Sources: `codemirror/lint@a73629893c436da6e39fe9813ad2e2a5f7c98601:src/lint.ts`, `prosemirror/website@a16b4ece45f135e5f001ab59d25f2d43c25974e1:example/lint/index.js`, `ueberdosis/tiptap@91c51be53c4655ef07e29ec489471524debfa0ca:demos/src/Experiments/Linter/Vue/extension/Linter.ts`, and a `git grep` of `facebook/lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988:packages/` for spellcheck, grammar and linter, which found none.

## Layer and owner

| Change | Layer | Package | Why |
| --- | --- | --- | --- |
| Block scope for `findTextRanges`, and inline and content rules on a transaction or state root (a public signature change) | Plite | `plitejs` (`packages/plitejs/src/interfaces/node.ts`), documented in `content/docs/api/node.mdx` | The text-run rules belong to Plite; faking them in Plate would hide the gap |
| `BaseLintPlugin`, `LintRule`, `LintFinding`, `LintPluginState` and `LintMatch` | Plate | `platejs/lint`, new headless entrypoint with no feature dependencies, like `platejs/find` | The owner asked to improve the plugin; Find ships its neutral engine the same way; a fix to the stale-reply or fix-safety logic reaches every app through a package update |
| `LintKit`, `LintPopover`, `useLintFindings`, `useLintFindingAt`, two example rules that skip code, severity classes, F8 and Shift+F8 | Plate registry | registry item `lint` in `apps/www/src/registry/components/editor/lint.tsx` | Rules, messages and styling are product opinion |
| Panel showing the first 50 rows, labeled server stand-in, values with a code block | Plate registry | registry example `lint-demo` | Example code only |
| Linting docs page | Docs | `content/docs/(plugins)/(functionality)/lint.mdx` and `lint.cn.mdx` | Kit first, then manual usage |

## Native behavior and proof

| Behavior | What changes | Where it is proven |
| --- | --- | --- |
| Undo after a fix | A fix runs as a new history batch, so one undo reverts it and keeps the typing before it | Chromium browser spec with real Mod+Z |
| Selection on next and previous | F8 and Shift+F8 select the next or previous finding's text, wrapping | Chromium browser spec with real keys |
| Focus after a popover fix | Focus stays in the editor, and typing continues after the fixed text | Chromium browser spec |
| Paint while typing | Local underlines follow typed text through the decoration manager's native-input mapping, re-read within 250 ms | Chromium browser spec types key by key into a flagged word |
| Typing inside a server finding | The plugin refreshes that block's paint at once, so the underline never covers text the server did not see | Chromium browser spec checks the paint right after each key |
| IME composition | No change; the plugin writes nothing during composition | unproven: no IME device in this run |
| Suggesting mode | A fix inside a command document lands as that document's edit | Headless spec with a registered command document |
| Demo layout by width | The demo follows its own width: the panel sits under the editor below 56rem and beside it above, and nothing scrolls sideways | Chromium browser spec at 375 px; a hand drive in the Claude desktop browser at 375, 925, 1024 and 1280 px in light mode, and at 1280 and 375 px in dark mode |

## Main changes

- Each commit re-checks only the text blocks it changed. A memo keyed by the immutable block object holds each block's matches, so paint, list, popover and fix share one result per block version.
- A block's findings sort by offset. A finding's id is its block key, a group number, its rule and its occurrence number. The group number is new each time a block's findings change and is never reused. A block keeps its ids only when its findings keep the same text, message, severity and fixes in order, and each one lies in text the edit did not touch. The edited span is what lies between the old and new content text's common prefix and common suffix, with the suffix capped at the shorter length minus the prefix. A finding before the span keeps its offsets, and one after it shifts by the edit's length. Any other edit gets a new group number. Identity follows text and position. When one transaction replaces a word with the same word at the same position, the id stays, and a fix acts on the word the user sees there. A kept block carries its row objects forward, so the list and `api.at()` share references.
- A finding row carries no offsets. `select`, `move` and `fix` resolve the id's current range from the per-block memo.
- The plugin re-checks blocks in its `on.commit` handler, which runs before `editor.subscribeCommit` listeners, so a hook reads the updated memo. `api.at()` reads only the focus block's memo and returns its row object, the same reference until the block, the selection or the version changes; it never rebuilds the list.
- Findings stay out of plugin state, and `selectors` stay pure. The store's `version` moves when a block's findings change, a block holding findings is removed, or a commit changes structure or root order. `api.findings()` rebuilds the ordered list at most once per version, walking every text block, nested ones included. `api.at()` returns the finding under the selection focus.
- A server reply counts only while its block matches the one sent, its type, marks and inline elements included. Each block and rule has at most one request in flight, and each rule at most four, the rest queued in document order. A block edit lets the request finish, drops its result and sends the latest text ahead of the queue. Re-sends use at most three of the four slots, so a long run keeps moving while blocks change. The queue reads current block paths when it sends. Removing the block, `clear` or `run` aborts it. No timer, debounce or throttle. Each client checks its own document, so a collaborator's edit re-checks that block on every client.
- When an edit drops a block's accepted server findings, the plugin refreshes that block's paint at once through `decorate.observe`. Local findings follow the decoration manager's deferred re-read during native typing, as every decoration source does. `observe` also refreshes after an accepted reply, `run` and `clear`.
- A fix declares `txLocate(false)` and runs as a new history batch, unless the caller's update already set a history tag. It resolves the id's block in the document the update edits, and writes only while that id is still current.
- The Plite linting example owns the whole lint loop: findings derived per text node in a decoration source, the list read through `useEditorState`, and the fix as one `editor.update`. Its findings store their inputs, the lint mode, never ranges, so an edit cannot leave a highlight on the wrong text.

## Open work

- Rerun `lint-locality` on a machine whose start load is under a quarter of its cores, five times, against the same frozen lines. A conclusive L7 miss there sends the findings-list design back to architect, as step 4 says. owner: zbeyens. stop: a quiet-machine run, or the next change to `BaseLintPlugin`'s commit handler or list rebuild.
- Run `apps/www/tests/browser/lint.spec.ts` on Firefox on a machine where Playwright's Firefox starts. owner: zbeyens. stop: CI or another machine runs it, or the next change to the lint kit.
- Measure LintKit's keystroke-to-paint time in a browser on a 2,000-block document with the panel mounted. owner: zbeyens. stop: a lint performance report, or an app that lints documents over 1,000 blocks.
- Let `F8` and the popover reach a finding that overlaps an earlier one; today they reach the first, as the Keyboard behavior section says. Tracked here. owner: zbeyens. stop: a registry rule that emits overlapping findings, or a user report.
- In the copied kit, capitalize the next word when the filler fix cuts a sentence's first word, and close the popover on Escape until the caret leaves that finding. Tracked here. owner: zbeyens. stop: the next change to the lint popover, or a user report.
- Add a void element and an empty document to `BaseLintPlugin.spec.ts`'s findings cases. Today the walk's void branch and the empty case rest on the diff panel's branch-by-branch reading, not a test. Tracked here. owner: zbeyens. stop: the next change to `findings()`.
- Read whether an update already chose a history policy from Plite instead of `BaseLintPlugin`'s copy of its three history tags, which `satisfies EditorCanonicalUpdateTag[]` ties to Plite only for renames. Tracked here. owner: zbeyens. stop: Plite adds a history tag or exports a policy query.
- Rerun `bun test ./packages/platejs/src/features/lint/lib/BaseLintPlugin.spec.ts` once the unfinished rewrite of `packages/plitejs/src/authored/tree/record.ts` settles. Today that rewrite throws inside the suggestion-mode case, which passed at the frozen commit. Tracked here. owner: zbeyens. stop: before lint is committed.
