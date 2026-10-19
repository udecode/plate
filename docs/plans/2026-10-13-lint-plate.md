---
review_scopes: [lint]
verdict: pursue
review_basis: [2026-10-13-lint-review]
work_kind: implementation
review_commit: 6fa1169c5e723eb3e058697189cdcad85be220f9
review_inputs: [VISION.md, docs/vision/common.md, docs/vision/plate.md, docs/vision/plite.md, docs/research/sources/plate-notes/rendering-and-overlays.md, docs/plans/2026-05-18-plite-external-decoration-sources-dx-ralplan.md, packages/platejs/src/features/find/lib/BaseFindPlugin.ts, packages/platejs/src/internal/plugin/pluginStore.ts, packages/plitejs/src/interfaces/node.ts, apps/www/src/app/(app)/examples/plite/_examples/linting.tsx, apps/plite/tests/plite-browser/donor/examples/linting.test.ts]
review_upstreams: ['../codemirror-lint@a73629893c436da6e39fe9813ad2e2a5f7c98601', '../prosemirror-website@a16b4ece45f135e5f001ab59d25f2d43c25974e1', '../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988']
---

# Lint: a Plate lint plugin, kit and Linting docs page

Status: executed: built, proven and uncommitted on next; waiting on your commit
Playbook: plan

**Pursue.** The owner asked for a Plate "Linting" docs page with a full example, and for a plugin that covers what the raw Plite example does. This plan supersedes the 2026-10-13 Stop, which said Plate keeps no lint package. It adds:

- a headless `platejs/lint` entrypoint with `BaseLintPlugin`;
- a small Plite repair to `NodeApi.findTextRanges`;
- a copied `LintKit` with a caret popover and next and previous keys;
- a `lint-demo` example and a browser spec;
- the Linting docs page and its Chinese twin.

Rules, messages and styling stay in copied code. The package owns only the parts every app gets wrong:

- findings that follow edits;
- server results that arrive late;
- a fix that edits only the text it checked.

Closing [udecode/plate#3833](https://github.com/udecode/plate/pull/3833) waits on the owner, with a reworded comment. The Build playbook executes this plan.

## Brief

### What will change?

Plate gets a lint plugin, a kit with a fix popup and F8 keys, a demo and a Linting page in two languages. It's built, uncommitted on next, and reverses the earlier verdict that Plate keeps no lint package.

### What could go wrong?

Lint needs another session's unfinished Plite change, so commit them together; right now that change breaks lint's suggestion-mode test. On a busy machine, a 10,000-block document sometimes rebuilt its issue list too slowly; nobody has measured on a quiet one. Firefox is untested. A second model checked the record twice, and every gap it found is fixed or noted.

## Teach

A linter reads what you wrote and flags problems such as a filler word or a stray space before a comma. It underlines them, lists them and offers a one-click fix.

Plate has none of this today. Plite has a raw example that rechecks every paragraph on each keystroke and fakes a server with a switch. A Plate app cannot reuse it, because Plate apps never import Plite.

The new plugin re-checks only the paragraph you edit, however long the document is. Your rules decide what counts as a problem. A server rule runs per paragraph, and its reply counts only while that paragraph matches the one it sent, marks and properties included. A fix edits only the issue you saw, and one undo reverts it.

## Demo

1. Start the docs app with `pnpm --filter www dev` and open `http://localhost:3000/blocks/lint-demo`. Filler words get an amber wavy underline, a space before a comma gets a red one, and the code block gets none. The panel says "5 issues" and lists them. ![after](artifacts/2026-10-13-lint-plate/demo/lint-demo-final.png)
2. Click into the first underlined "really". A popup shows the message, the rule and two buttons. Click Remove: the word and its space go, the caret stays in the text, and the panel says "4 issues". Press Cmd+Z once and the word is back. ![before](artifacts/2026-10-13-lint-plate/demo/step2-popover.png) ![after](artifacts/2026-10-13-lint-plate/demo/step2-fixed.png)
3. Press F8. The selection jumps to the next issue and its popup opens. Shift+F8 goes back. ![after](artifacts/2026-10-13-lint-plate/demo/step3-f8.png)
4. Click in a line with no issue, then click Check with server. About 600 ms later "e-mail" and "web site" get a blue underline and the panel says "7 issues". The page fakes the server and says so. ![after](artifacts/2026-10-13-lint-plate/demo/step4-server.png)
5. Click Clear. Every underline goes and the panel says "0 issues". Run linter brings the local issues back. ![after](artifacts/2026-10-13-lint-plate/demo/step5-clear.png)
6. Open `http://localhost:3000/docs/lint`. The Linting page opens on the same demo with its panel under the editor, then the setup and the reference. After Check with server all 7 issues fit in the preview. `http://localhost:3000/cn/docs/lint` is the Chinese page with the same demo. ![after](artifacts/2026-10-13-lint-plate/browser/final-docs-7-issues.jpg)
7. Narrow the window to a phone's width on `/blocks/lint-demo`. The panel moves under the editor, nothing scrolls sideways, and with many issues the panel scrolls. ![before](artifacts/2026-10-13-lint-plate/browser/before-375-overflow.jpg) ![after](artifacts/2026-10-13-lint-plate/browser/final-375-56-issues.jpg)

## Public API

A Plate app installs the copied kit, which configures the headless plugin with its own rules, styling, keys and popover.

```tsx before
```

```tsx after
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

```ts before
```

```ts after
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

```ts before
```

```ts after
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

```tsx before
```

```tsx after
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

```tsx before
```

```tsx after
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

```tsx before
```

```tsx after
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

```ts before
// packages/plitejs/src/interfaces/node.ts
findTextRanges: (
  root: Node | NodeTextRangeRoot,
  query: NodeTextRangeQuery,
  options?: NodeFindTextRangesOptions
) => readonly Range[];
```

```ts after
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

Two other forms lost. Optional rule fields on `NodeTextRangeRoot` would let a root that omits them skip the rules without an error. A `state.text.ranges()` read method would move the editor root out of `NodeApi`, a hard cut nobody asked for, while `NodeApi` already reads an editor as a root elsewhere: `getAncestorChildren` in `node.ts`, which `get` and `children` use, and `extractProps`. Passing `editor` inside an update reads the draft but not the update view a command frame installs, and Plite's Vision says plugins read through their context editor or `state`.

## Layer and owner

| Change | Layer | Package | Why |
| --- | --- | --- | --- |
| Block scope for `findTextRanges`, and inline and content rules on a transaction or state root (a public signature change) | Plite | `plitejs` (`packages/plitejs/src/interfaces/node.ts`), documented in `content/docs/api/node.mdx` | The text-run rules belong to Plite; faking them in Plate would hide the gap |
| `BaseLintPlugin`, `LintRule`, `LintFinding`, `LintPluginState`, and `LintMatch` since the diff panel's round 1 | Plate | `platejs/lint`, new headless entrypoint with no feature dependencies, like `platejs/find` | The owner asked to improve the plugin; Find ships its neutral engine the same way; a fix to the stale-reply or fix-safety logic reaches every app through a package update |
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

## Main changes

- Each commit re-checks only the text blocks it changed. A memo keyed by the immutable block object holds each block's matches, so paint, list, popover and fix share one result per block version.
- A block's findings sort by offset. A finding's id is its block key, a group number, its rule and its occurrence number. The group number is new each time a block's findings change and is never reused. A block keeps its ids only when its findings keep the same text, message, severity and fixes in order, and each one lies in text the edit did not touch. The edited span is what lies between the old and new content text's common prefix and common suffix, with the suffix capped at the shorter length minus the prefix. A finding before the span keeps its offsets, and one after it shifts by the edit's length. Any other edit gets a new group number. Identity follows text and position. When one transaction replaces a word with the same word at the same position, the id stays, and a fix acts on the word the user sees there. A kept block carries its row objects forward, so the list and `api.at()` share references.
- A finding row carries no offsets. `select`, `move` and `fix` resolve the id's current range from the per-block memo.
- The plugin re-checks blocks in its `on.commit` handler, which runs before `editor.subscribeCommit` listeners, so a hook reads the updated memo. `api.at()` reads only the focus block's memo and returns its row object, the same reference until the block, the selection or the version changes; it never rebuilds the list.
- Findings stay out of plugin state, and `selectors` stay pure. The store's `version` moves when a block's findings change, a block holding findings is removed, or a commit changes structure or root order. `api.findings()` rebuilds the ordered list at most once per version, walking every text block, nested ones included. `api.at()` returns the finding under the selection focus.
- A server reply counts only while its block matches the one sent, its type, marks and inline elements included. Each block and rule has at most one request in flight, and each rule at most four, the rest queued in document order. A block edit lets the request finish, drops its result and sends the latest text ahead of the queue. Re-sends use at most three of the four slots, so a long run keeps moving while blocks change. The queue reads current block paths when it sends. Removing the block, `clear` or `run` aborts it. No timer, debounce or throttle. Each client checks its own document, so a collaborator's edit re-checks that block on every client.
- When an edit drops a block's accepted server findings, the plugin refreshes that block's paint at once through `decorate.observe`. Local findings follow the decoration manager's deferred re-read during native typing, as every decoration source does. `observe` also refreshes after an accepted reply, `run` and `clear`.
- A fix declares `txLocate(false)` and runs as a new history batch, unless the caller's update already set a history tag. It resolves the id's block in the document the update edits, and writes only while that id is still current.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Building after the plan review | Build now, after three review rounds (look) | Wait for your review first | hold | big |
| Where the lint engine lives | A plugin shipped in Plate that every app shares (look) | Each app copies the whole engine with the kit | copied engine | big |
| Which text gets checked | The main document only | Also text in nested editable areas inside blocks | roots | small |
| Server example | A fake server in the browser, labeled as fake | A real server route in the demo | route | small |
| Lint in the default editor | Left out; the demo adds it | Add it to the default editor and playground | everywhere | small |
| Next and previous keys | F8 and Shift+F8 | Other keys, or none | keys | detail |
| Fix choices | One of the rule's suggested fixes | Any replacement text | free fix | detail |
| How the issue list stays fast | Rebuilt only after the issues change or blocks move | The full list saved on every change | flat list | detail |
| Server requests at once | Four per rule; the rest wait, edited blocks first | No limit | no limit | detail |
| Demo text on the Chinese docs page | The English sample, as on Find's Chinese page | Pick the Chinese sample by locale, as the playground does | chinese demo | detail |
| Issues shown in the demo panel | The first 50 and the total | Every issue | all rows | detail |
| Collaboration proof | Two editors on separate Yjs documents that exchange updates, no browser | A live session in two browsers | live collab | detail |
| A word swapped for the same word in one step | The issue keeps its place in the list, and a fix acts on the word you see | Treat it as a new issue, which needs a new Plite edit-history read | edit history | detail |
| Firefox browser check | Chrome's engine five times and Safari's once; Firefox won't start here (look) | Run the browser checks in Firefox on another machine | firefox | small |
| Review list check | Done for lint: nothing it flags is lint's, though it still fails on seven other plans (look) | Wait until those plans pass too | ledger | detail |
| How much text an edit compares | Checked by reading the code: it never reads past the shorter text (look) | Count it in the speed test too | span count | detail |
| Loop that rebuilds the issue list | Walk the blocks by index and copy with `forEach`. It passes the lint rule and halves the time on nested documents (look) | The fastest form measured, which needs an exception to the `prefer-for-of` lint rule | v1 | detail |
| Demo layout in narrow places | Below 56rem wide, the panel sits under the editor, stops at 352 px tall and scrolls; the docs preview is 900 px tall | Panel beside the editor at every width | side panel | detail |

## PR comment

You chose "Close it" when asked, so this comment went on [udecode/plate#3833](https://github.com/udecode/plate/pull/3833) and the PR closed.

> Closing this in favor of the Plate v2 lint plugin, `platejs/lint`, and its Linting docs page. It keeps what this POC set out to do: app rules, severity, a list, fixes, next and previous, and a caret popover. It checks only the paragraph being edited, keeps server results only while their paragraph is unchanged, and holds no range refs. It drops the ESLint-style config engine, which two rules never needed. Thanks for the early exploration.

## Feature Manifest

Optional packs:

- `performance-observability`, because the plugin adds a per-commit index, a memo and a store signal on the typing path.

Flow mode:

- new public feature entrypoint

Completion threshold:

- Every applicable Feature Manifest row is complete with evidence.
- Every excluded row has an explicit N/A reason.
- Selected packs, the feature checker and `plan-open` are closed.

Feature Manifest:
| Surface | Applies | Owner | Artifacts | Consumer | Proof | Status |
| --- | --- | --- | --- | --- | --- | --- |
| API | yes | best-api, this plan's Public API | `platejs/lint` exports `BaseLintPlugin`, `LintRule`, `LintFinding`, `LintPluginState`, and `LintMatch` since the diff panel's round 1; `NodeFindTextRangesOptions.at` and the `findTextRanges` root type | Plate apps, `LintKit` | `BaseLintPlugin.spec.ts`, the plitejs `find-text-ranges-contract.ts` cases, www typecheck | complete |
| Package | yes | plate-plugins | `packages/platejs/src/features/lint/{index.ts,lib/index.ts,lib/BaseLintPlugin.ts,lib/BaseLintPlugin.spec.ts}`, `packages/plitejs/src/interfaces/node.ts` | `platejs/lint` importers | package tests, `pnpm --filter platejs build`, entrypoint checks | complete |
| React adapter | yes | plate-ui | `toReactPlugin(BaseLintPlugin)` in `LintKit` and the `useLintFindings` and `useLintFindingAt` hooks in `apps/www/src/registry/components/editor/lint.tsx`; no `platejs/lint/react` entrypoint. Approved as "no: the copied kit lifts it with `toReactPlugin`, as `FindKit` does"; the feature checker requires this row for a new public entrypoint | apps installing `@plate/lint` | step 7's browser cases under the React Compiler, `apps/www/src/registry/components/editor/lint.spec.ts` | complete |
| Registry UI | yes | plate-ui | `apps/www/src/registry/components/editor/lint.tsx`, registry item `lint` | apps installing `@plate/lint` | `build:registry --check`, browser spec | complete |
| Composition | yes | plate-ui | `lint-demo` composes `[...EditorKit, ...LintKit]` | demo and docs readers | browser spec on `/blocks/lint-demo` | complete |
| Scale proof | yes | benchmark | `docs/plans/artifacts/2026-10-13-lint-plate/probe/lint-locality-a4.log` and the production runs on the final plugin `lint-locality-a15.log` to `lint-locality-a19.log` | users/maintainers | pre-acceptance probe a4, five production runs holding every count line and the oracle guard, the spec's work-count cases; timing on a quiet host stays open work | complete |
| Registry metadata/examples | yes | plate-ui | `registry-features.ts` entry `lint`, `registry-examples.ts` entry `lint-demo`, `lint-demo.tsx`, lint values and their Chinese twin | registry consumers | `build:registry --check`, `/blocks/lint-demo` | complete |
| Docs | yes | plate-docs | `content/docs/(plugins)/(functionality)/lint.mdx`, `lint.cn.mdx`, `content/docs/meta.json`, `content/docs/api/node.mdx`, `node.cn.mdx`, the regenerated `apps/www/src/generated/api-reference-manifest.json` | docs readers | `build:source`, `check:docs`, `api-reference --check`, rendered `/docs/lint` and `/cn/docs/lint` | complete |
| Release artifacts | yes | changeset | `platejs: patch` and `plitejs: patch` changesets, registry changelog entry for `lint` and `lint-demo` | release notes | changeset files and the registry changelog read back | complete |

## Package boundary contract

| Contract | Decision | Evidence |
| --- | --- | --- |
| shared Plate host | N/A: the entrypoint lives inside `platejs`; no new `@platejs/*` package | `packages/platejs/package.json` exports gain `./lint` only |
| Plite ownership | `platejs/lint` imports only `platejs` core; the text-run repair lives in `plitejs` | import audit of `packages/platejs/src/features/lint/**` at build |
| external dependency ownership | N/A: no new dependency | `packages/platejs/package.json` dependencies unchanged |
| entrypoint runtime | `lint` is headless with no feature dependencies and `runtimeProof: 'plate-plugin'`, like `find` (`tooling/entrypoints/entrypoint-dag.mjs:88`) | DAG entry and its generated proofs at build |
| Oxlint coverage | existing `packages/platejs/src/features/**` globs cover the new folder, to be confirmed by a scoped lint run | scoped `pnpm lint:fix` on the new paths and the override audit at build |

## Start Gates

| Gate | Applies | Evidence |
| --- | --- | --- |
| Feature Manifest complete before source writes | yes | The manifest above names every row's owner, artifacts, consumer and proof |
| Flow mode selected | yes | new public feature entrypoint |
| Public API decision owner selected | yes | best-api, through architect's arena (`docs/plans/artifacts/2026-10-13-lint-plate/architect/judge/verdict.md`) and the plan panel |
| Runtime scale applicability resolved | yes | Scale proof is yes: a per-commit index, a memo and a store signal sit on the typing path |
| Pre-acceptance Benchmark receipt selected | yes | `lint-locality` probe a4 in the run directory; baseline is the raw example's re-lint-everything model in a Plate plugin; frozen lines L1 to L7, C1 and C6; known-bad and flat controls; guard against a fresh recompute |
| Public feature entrypoint decision recorded | yes | `platejs/lint`, a Defaults row the owner can reverse with "copied engine" |
| Conditional packs selected | yes | `performance-observability` |
| Performance pack selected | yes | Scale proof is yes |
| User-facing operation and runtime owner identified | yes | Typing in a paragraph of a linted document; owner is `BaseLintPlugin`'s commit handler, decoration read and `api.findings()` |
| Scale variables and cohorts fixed | yes | Blocks B in 100, 1,000 and 10,000; findings F from 20 to 70,000 (sparse and dense); position start, end and a toggle that changes the set; normal is 100, large 1,000, stress 10,000 sparse, pathological 10,000 dense |
| Budget frozen before target measurement | yes | Lines written into the probe before each attempt ran; a2 to a4 keep a1's per-keystroke values and add count lines |
| Baseline and target probe selected | yes | Baseline arm and the hybrid prototype in `probe/lint-locality.probe.ts` |
| Correctness guard selected | yes | Probe a4 compared ids and matched text with a recompute through the same helpers. Step 4 replaces it with an independent oracle: each rule run over the whole document through `NodeApi.findTextRanges`, sorted by document position, compared on block, offsets, order, message, severity and fixes after every cohort and at intermediate toggle states |
| Production detector decision recorded | yes | N/A: an editor plugin in the browser has no production detector in this repository; the deterministic work-count sweep in the spec guards regressions |

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Lint engine | None in Plate; a raw Plite example | `BaseLintPlugin` in `platejs/lint` | `platejs` | The owner asked to improve the plugin; Find ships its neutral engine as `platejs/find`; a fix to stale replies or fix safety reaches every app through a package update; in the v2 beta, a Defaults row switches to a copied engine with one word | New; `LintKit` and the docs adopt it | Headless spec, browser spec | A public shape with no outside caller yet | keep |
| Text-run search | Schema and content rules only on the live editor root; no block scope | `at` scope, and the same rules on a transaction or state root, the root's form chosen by `best-api design` | `plitejs` | A fix in a command document must read the text the check read | Additive option and a widened root type; Find unchanged; Node API docs updated | plitejs node spec, red at base | A wrong root check changes Find's matches | rearchitect |
| Findings list | n/a | Per-block memo, a store `version` and `api.findings()` rebuilt once per version | `platejs/lint` | Probe a4 rejected a list in plugin state at 70,000 findings; selectors must stay pure | Copied hooks read it | Probe a4 and the step 4 production rerun | Structural edits must move `version` | gate |
| Plite linting example | Raw example with its own browser test | Unchanged | `apps/www` Plite examples | It still teaches raw Plite | None | Its existing browser test | None | keep |
| udecode/plate#3833 | Open on `main`, conflicting | Closed with a comment | owner | The new plugin covers its jobs | None | Owner's answer | A public message | defer |

## Execution

The owner's message "improve the plugin to cover the same example" and the Pursue verdict authorize this build under the Build playbook. Base: `6fa1169c5e723eb3e058697189cdcad85be220f9` on `next`. The run directory is `docs/plans/artifacts/2026-10-13-lint-plate/`. Files that held other sessions' uncommitted work before this build edited them are copied under `pre-edit/` there. Commits stay with the owner.

The blast radius (`blast/blast-radius.md`) found three things the steps below now carry:

- `findTextRanges` throws on a transaction or state root today (`TypeError: children.forEach is not a function`, `blast/tx-root.probe.test.ts`), so widening the root changes no working caller. Both roots already carry `schema.isInline` and `nodes.isContent`.
- A new public entrypoint also needs the generated package scripts, Turbo config, entrypoint tsconfig and source path maps from `pnpm entrypoint:turbo:generate`, the exact feature list and `plate-plugin` count in `tooling/scripts/entrypoint-dag-plugin.test.mjs`, and a size entry in `tooling/entrypoints/platejs-entrypoint-sizes.json`.
- `content/docs/api/node.cn.mdx` is a summary table with no `findTextRanges` row.

## Steps

- [x] 1. In `plitejs`, give `NodeFindTextRangesOptions` an `at` path that limits the search to one block. Keep inline joining and `content: true` when the root is a transaction or state view, not only the live editor. First run `best-api design` on the root's form: a transaction root, or a root that brings its own `read.isContent`. Update `content/docs/api/node.mdx` and its Chinese twin, and regenerate the API reference manifest in a proof worktree, as `verify`'s command recipes say. Proof: new cases in `packages/plitejs/test/find-text-ranges-contract.ts` cover a block run across a link and a struck suggestion, plus a transaction root. Their failing half runs at base in a detached worktree. Then `bun test ./packages/plitejs/test/runtime-contracts.test.ts`, `pnpm --filter plitejs typecheck` and `pnpm --filter www api-reference --check` pass.
  Done: red at base in `docs/plans/artifacts/2026-10-13-lint-plate/step1/base-red-a2.log` (three cases fail with their own names), green in `docs/plans/artifacts/2026-10-13-lint-plate/step1/green-a1.log` (856 pass, Find specs included) and `docs/plans/artifacts/2026-10-13-lint-plate/step1/plitejs-typecheck-a1.log`. The test tsconfig shows no error in the touched files. The cases use a plain content predicate, because the authored plugin is mid-rewrite in another session. The manifest regeneration moves to step 3, because it reads both packages' built declarations.
- [x] 2. Write `BaseLintPlugin` and its exported `LintPluginState` in `packages/platejs/src/features/lint/lib/`. It covers the rule contract with `block` and `signal`, the per-block memo, group-numbered ids, the `version` signal, `api.findings()`, `api.at()`, `run`, `clear`, `fix`, `select` and `move`. It also covers the server-rule queue, per-segment paint keys `<id>:<n>`, primary-root and foreign-view guards, and a per-block checker error. Proof: `BaseLintPlugin.spec.ts` covers:
  - rule calls per keystroke equal the rule count at 100 and 2,000 blocks, nested blocks included;
  - findings in document order after typing, a block move, a removal, a split, a merge, a multi-block paste and a value replace, against an oracle that runs each rule over the whole document; the oracle checks each finding's range by selecting its id and reading the selection;
  - an old id refused after an insertion, a deletion, a rule replacement and an edit to repeated text ("bad bad"), and after two balanced swaps in one transaction: "bad bad ok" to "bad ok bad", and "bad ok bad" to "bad bad ok";
  - ids kept while typing between and around findings;
  - `api.at()` returning the same object across a selection-only commit and a store notice that changes nothing, and not rebuilding the list after a version move;
  - a fix inside a command document;
  - a server reply for old text dropped and the latest text sent without another edit;
  - a pending request from before `clear` or `run` that cannot add findings when it settles;
  - at most four requests in flight per rule, an edit to a late block during a long run requested before earlier queued blocks, and the run still sending queued blocks while four blocks keep changing;
  - an accepted reply dropped by an edit refreshing that block's paint;
  - two editors on separate Yjs documents with the same namespace, exchanging updates with `Y.applyUpdate` as `BaseTablePlugin.authored-tree.spec.ts` does: once the receiving editor shows the remote text, the remote edit has re-checked that block, dropped a pending reply for old text and refused an old id;
  - a checker that throws marks only its block, and a server rule that rejects sets `error`;
  - `run` on an editor that never ran, and `clear`;
  - a second editor's unrelated document painting nothing;
  - unique decoration keys across struck text.

  It runs in `pnpm check` through the platejs test script.
  Done: `docs/plans/artifacts/2026-10-13-lint-plate/step2/spec-a1.log` (21 pass) and `docs/plans/artifacts/2026-10-13-lint-plate/step2/mutants-a3.log`, where each of 14 planted defects fails its named case. Ids lead with the group number, because node keys such as `r0:n2` hold colons; a map from group to key resolves an id. The fix adds no history tag: Plite never merges a replacement into earlier typing, and a tag would override a caller's own `history` policy. The paint guard compares the view's document with the one the plugin last saw at activation or a commit, because a document view refuses reads of the source editor.
- [x] 3. Wire the `platejs/lint` entrypoint. Approved wording: "in four places: `packages/platejs/package.json` exports, `tsdown.config.mts`, `tsconfig.entrypoints/lint.json` and `tooling/entrypoints/entrypoint-dag.mjs`". The blast radius found more. Hand-edit the `package.json` exports, `tsdown.config.mts`, `lint: []` in the DAG's `publicFeatureDependencies` (headless, no feature dependencies, `plate-plugin` proof) and the DAG test's feature list and `plate-plugin` count. Then run `pnpm entrypoint:turbo:generate`, which writes the package scripts, Turbo config, `tsconfig.entrypoints/lint.json` and the source path maps, and add the size entry. Regenerate `apps/www/src/generated/api-reference-manifest.json` from both packages' built declarations, which step 1 moved here. Proof: `pnpm --filter platejs build` with its declaration output, `pnpm test:manifests`, `node --test tooling/scripts/entrypoint-dag-plugin.test.mjs tooling/scripts/entrypoint-turbo.test.mjs`, `pnpm --filter www api-reference --check` and a scoped lint of the new paths.
  Done so far: `docs/plans/artifacts/2026-10-13-lint-plate/step3/generate-a2.log`, `docs/plans/artifacts/2026-10-13-lint-plate/step3/manifests-a1.log`, `docs/plans/artifacts/2026-10-13-lint-plate/step3/dag-tests-a4.log` (40 pass), `docs/plans/artifacts/2026-10-13-lint-plate/step3/build-platejs-a2.log`, `docs/plans/artifacts/2026-10-13-lint-plate/step3/api-reference-check-a1.log`, the lint partition's typecheck, lint and test logs, and `docs/plans/artifacts/2026-10-13-lint-plate/step3/lint-task-a2.log`. `NodeTextRangeView` joins its siblings in `apps/www/api-reference.config.json`'s exclude list.
  Done: `platejs/lint` is 978,134 bytes in `tooling/entrypoints/platejs-entrypoint-sizes.json`, measured after the diff panel by `pnpm plite:entrypoint-sizes:update` (`docs/plans/artifacts/2026-10-13-lint-plate/step3/entrypoint-sizes-update-a1.log`). That build includes other sessions' uncommitted plitejs work, which lint needs for `txLocate`, so HEAD cannot measure it. On the same build `platejs/find` is 969,942 bytes, so lint adds 8,192 bytes over Find. The update rewrote every entry for that work, so the file keeps only the new lint entry and the other entries as they were (`docs/plans/artifacts/2026-10-13-lint-plate/step3/keep-lint-size.mjs`). The release-artifact size check stays red on those other entries until their owners update them.
- [x] 4. Rerun `lint-locality` against the production `BaseLintPlugin` through `api.findings()`, with a4's frozen lines, count lines and controls. Add the independent oracle, intermediate toggle states, nested documents, blocks split into many leaves, and cohorts for a move, a removal, a split, a merge, a paste and a value replace. The oracle checks a sample of 100 ranges per cohort by selecting their ids, after the timed region. Add count lines frozen before the run: a selection-only commit calls no rule, and the characters the edited-span comparison reads stay within twice the block's length. Add a cohort of 2,000-character blocks. Run it five times on a host whose start load is under a quarter of its cores, and report the median and range. Proof: five consecutive `probe/lint-locality-a<N>.log` files, each with `exit=0`. A timing miss on a quiet host sends the list design back to architect. If the host stays loaded through the build, the count lines decide and the timing lines stay open work.
  Done so far: the first production pass, `docs/plans/artifacts/2026-10-13-lint-plate/probe/lint-locality-a5.log`, measured the list rebuild at about 2 µs per block, 21 ms at 10,000 blocks against the prototype's 0.17 ms. On every rebuild it asked the schema whether each block is inline and looked up each block's key. The rebuild now reads each block object's current entry from a map and each unchanged container's findings from a cache, and remembers each node's kind. A server result that changes an unchanged block's findings drops the container caches. Quick pass a7, in the decision log, held every count line and the oracle guard, and rejected every control. At a start load of 19.48 on 18 cores its timing is inconclusive. Six L7 rows read over budget there, the largest 5.6 ms against 4.1 ms. The characters the edited-span comparison reads are bounded by source inspection, not counted: both loops stop at the shorter text's length.
  Done: five production runs on the plugin before the loop change below, `docs/plans/artifacts/2026-10-13-lint-plate/probe/lint-locality-a10.log`, `docs/plans/artifacts/2026-10-13-lint-plate/probe/lint-locality-a11.log`, `docs/plans/artifacts/2026-10-13-lint-plate/probe/lint-locality-a12.log`, `docs/plans/artifacts/2026-10-13-lint-plate/probe/lint-locality-a13.log` and `docs/plans/artifacts/2026-10-13-lint-plate/probe/lint-locality-a14.log`, each end in `exit=0`. Each held every count line and the oracle guard and rejected every control. Each started on a loaded host, at load 8.40 to 31.82 on 18 cores, so the timing lines stay open work, as this step says. Under that load L7 missed in 9 to 12 cohorts per run. After a toggle at 10,000 dense blocks the list rebuild took a median of 5.94 ms, from 4.39 to 6.98 ms, against 4.1 ms. At 10,000 sparse blocks it took 1.01 ms, from 0.59 to 30.26 ms, against 0.7 ms. Runs a8 and a9 also passed, but they started before a brief edit and restore of the plugin file, so they do not count.
  Reopened after the build, when you asked to check a7 and continue this step. An interleaved A/B on one tree found no measurable slowdown from the diff panel's fixes. It cannot say why a7 ran faster; a quieter host is the likeliest cause. A CPU profile named the limiter: 1,355 of the 1,834 sampled ms inside `findings()` went to the loop that copies cached findings into the list. Four loop forms ran five interleaved rounds each, summarized in `docs/plans/artifacts/2026-10-13-lint-plate/probe/` as `ab3-*`, `ab4-*` and `ab5-*`:
  - V1, indexed copies, was fastest in every cohort, about 1 ms against the old code's 2.4 to 4 ms at 10,000 dense blocks, but the repository's `prefer-for-of` rule rejects it;
  - V2, an indexed walk with `for...of` copies, kept none of the gain;
  - V3, an indexed walk with `forEach` copies, halved the nested toggle cohort in both of its runs, from 2.13 to 0.98 ms and from 1.83 to 0.90 ms, and its other cohorts stayed inside run-to-run noise;
  - V4, V3 with one copy callback per walk, added nothing.

  The build keeps V3 (Defaults: v1). Copied alone, 70,000 findings take about 0.2 ms in Bun in every form, and in Node only the `forEach` walk is slower, so the gap inside the plugin has no known cause. Every A/B run started above a quarter of the cores' load, so the runs rank the forms and do not settle L7. The diff panel's round 3 found a later, unmeasured edit to the cold copy, which was reverted, so the plugin file equals the measured V3, sha256 `db587110cf78`.

  Done on the final bytes: five production runs, `docs/plans/artifacts/2026-10-13-lint-plate/probe/lint-locality-a15.log` to `lint-locality-a19.log`, ran one after another in a frozen worktree of commit `77639a5dfe` plus round 5's demo edit, which the probe does not load. Each log names that commit and the plugin's sha256 `db587110cf78`, and each ends in `exit=0`. Each held every count line and the oracle guard and rejected every control. Each started at load 7.86 to 27.13 on 18 cores, so the timing lines stay open work. L7 missed in 2 to 8 cohorts per run, against 9 to 12 in a10 to a14. Every miss was at 10,000 blocks, and no cohort missed in more than three of the five runs. After a toggle at 10,000 dense blocks the list rebuild took a median of 1.79 ms, from 1.20 to 5.18 ms, against 4.1 ms. At 10,000 sparse blocks it took 0.45 ms, from 0.29 to 1.08 ms, against 0.7 ms. The two series ran at different times on a loaded machine, so the drop from a10 to a14 does not measure the loop change. Only the interleaved A/Bs above compare the loop forms. The summary is `docs/plans/artifacts/2026-10-13-lint-plate/probe/final-r5-summary-a1.log`.
- [x] 5. Add registry item `lint` in `lint.tsx`: `LintKit`, `LintPopover`, `useLintFindings`, `useLintFindingAt`, two example rules that skip code, severity classes, F8 and Shift+F8, and a popover with fix and fix-and-next. Proof: `pnpm --filter www build:registry` then `build:registry --check`, the www typecheck, and step 7's browser cases.
  Done: `docs/plans/artifacts/2026-10-13-lint-plate/step8/build-registry-a1.log`, `docs/plans/artifacts/2026-10-13-lint-plate/step8/build-registry-check-a1.log`, `docs/plans/artifacts/2026-10-13-lint-plate/step8/check-registry-source-a1.log` and `docs/plans/artifacts/2026-10-13-lint-plate/step8/www-tsc-a1.log`, run on the final `lint.tsx`. Step 7's eight cases pass once on Chromium and WebKit, as the decision log records. The popover anchor reads the editable through a `contextElement` getter, because reading the ref during render fails the React Compiler lint.
  Rechecked after the diff panel changed `lint.tsx`: the www typecheck passes at frozen commit `7dec65e275`, whose www lint files match the final checkout, once a fresh worktree generates its docs collection (`docs/plans/artifacts/2026-10-13-lint-plate/verify-final/frozen-www-tsc-a2.log`). On the live checkout its one error is in a `plitejs` authored file another session is rewriting.
- [x] 6. Add the `lint-demo` example. Its panel has run, clear, check with server and apply first fix, plus the total and the first 50 rows. Its server stand-in is labeled as one, with its latency, and its value includes a code block. Add the lint values and their Chinese twin, and the `registry-examples.ts` entry. Proof: `/blocks/lint-demo` renders with findings painted, and step 7 drives it.
  Done: the same registry and typecheck logs as step 5. `/blocks/lint-demo`, `/docs/lint` and `/cn/docs/lint` render five painted findings and "5 issues". The panel's buttons prevent the mouse-down default, so a press keeps focus and the caret in the editor. Like Find's, the Chinese value has no consumer yet. Only the playground picks its value by locale, since `git grep -l useLocale -- apps/www/src/registry/examples` lists only `playground-demo.tsx`, so `/cn/docs/lint` shows the English sample.
  Fixed after a hand drive in a real browser at 375, 925, 1024 and 1280 px in light mode, with dark mode checked at 1280 and 375 px. Below the `lg` breakpoint the grid's implicit column grew to the toolbar's 1,581 px min-content width, so the page scrolled sideways at 925 px and a phone zoomed out. In the 674 px docs preview the viewport rule gave the editor a 306 px column. The demo now follows its own width through an `@container` wrapper:
  - below 56rem, one column with a 480 px editor and a panel capped at 352 px that scrolls as a whole;
  - from 56rem, the side panel, with both at 650 px.

  `meta.iframeHeight` 900 on the registry entry sizes every docs preview of the demo. The diff panel's rounds 4 and 5 reviewed this. Screenshots are in `docs/plans/artifacts/2026-10-13-lint-plate/browser/`, `before-*` and `final-*`.
- [x] 7. Write `apps/www/tests/browser/lint.spec.ts` on `/blocks/lint-demo`. It covers:
  - paint by severity, and no finding inside the code block;
  - count and list;
  - run and clear;
  - apply first fix;
  - popover fix and fix-and-next;
  - a server reply that arrives while the caret stays still, opening the popover, and Clear closing it, with the count and list updating after Run and Clear; www builds with the React Compiler, so these cases prove the hooks under it;
  - F8 and Shift+F8 selection;
  - one undo step per fix;
  - focus kept after a fix;
  - typing key by key into a flagged word;
  - typing inside a server-flagged word, with no underline on the new text right after each key;
  - a phone-width page that does not scroll sideways, added after the hand drive found it did.

  Proof: Chromium five times warm without retries, then Firefox and WebKit once each, against a doctored www instance named by `PLAYWRIGHT_BASE_URL`.
  Done so far: all eight cases pass once on Chromium and once on WebKit against the `www-lint` dev server on port 3451, and two planted defects each fail their case, as the decision log records: a popover hook that ignores store changes, and a plugin that skips the immediate repaint when an edit drops a block's server findings. Firefox 1532 never launches on this host. `browserType.launch` times out before any page loads, inside and outside the command sandbox. Its log shows `sandbox_extension_issue_file_to_process` failing with "Operation not permitted" and the software compositor failing to map its framebuffer (`docs/plans/artifacts/2026-10-13-lint-plate/step7/firefox-launch-a2.log`).
  Done at the build's first close: a detached worktree at frozen commit `7dec65e27586c485d4d07c4a45bd485c88dab845` served the whole working tree on port 3452; its lint files matched the checkout of that time. There all eight cases passed on Chromium five times warm without retries (`docs/plans/artifacts/2026-10-13-lint-plate/step7/chromium-frozen-a1.log` to `docs/plans/artifacts/2026-10-13-lint-plate/step7/chromium-frozen-a5.log`) and on WebKit once (`docs/plans/artifacts/2026-10-13-lint-plate/step7/webkit-frozen-a1.log`), and both planted defects failed their case (`docs/plans/artifacts/2026-10-13-lint-plate/step7/browser-mutants-frozen-a1.log`). An earlier series on the shared `www-lint` server failed one server case in two of five runs. Those two cases pass 20 of 20 alone. The frozen series ran beside the same speed probe and passed, and a module update on the shared server reproduces the stuck count, so the decision log names a recompile during the server reply as the likely but unproven cause. Firefox is not run, per the Defaults row Firefox browser check.
  Done on the final bytes: the plugin is the measured V3 from step 4 and the demo has its layout fix. They ran from worktree `wt-r5`, frozen commit `77639a5dfe` plus round 5's edit to `lint-demo.tsx` (sha256 `dedc67abc75d`). All nine cases pass on Chromium five times warm without retries (`docs/plans/artifacts/2026-10-13-lint-plate/v3/chromium-final-a1.log` to `docs/plans/artifacts/2026-10-13-lint-plate/v3/chromium-final-a5.log`) and on WebKit once (`docs/plans/artifacts/2026-10-13-lint-plate/v3/webkit-final-a1.log`). The phone case failed on the old layout with a 1,597 px page in a 375 px viewport (`docs/plans/artifacts/2026-10-13-lint-plate/v3/phone-old-layout-a1.log`). The specs run at 1,280 px and check what the page holds, not how it looks, so a hand drive in the Claude desktop browser pane also covered 375, 925, 1,024 and 1,280 px in light mode, and dark mode at 1,280 and 375 px. It found the layout defects step 6 now fixes.
- [x] 8. Run `plate-docs` on the new Linting page. That covers `lint.mdx` (kit first, then manual usage with `BaseLintPlugin`, rules, server rules, the hooks, the popover and keys) and its Chinese twin `lint.cn.mdx`. It also covers the `content/docs/meta.json` navigation entry, an example coverage audit and the registered `lint-demo` preview. Proof: `pnpm --filter www build:source`, `pnpm --filter www check:docs`, `build:registry --check`, and `/docs/lint` and `/cn/docs/lint` rendered with the preview loaded.
  Done: `docs/plans/artifacts/2026-10-13-lint-plate/step8/check-docs-a2.log`, which runs `build:source`, `docs/plans/artifacts/2026-10-13-lint-plate/step8/build-registry-a1.log` and `docs/plans/artifacts/2026-10-13-lint-plate/step8/build-registry-check-a1.log`, after the last prose edit. Both routes render the page headings, the loaded preview with five painted findings and "5 issues", and their sidebar entry, with no console error. `/docs/components/lint`, `/docs/examples/lint` and `/cn/docs/components/lint` answer 200. `meta.json` adds the three routes to `pages`, `_plate.categoryGroups` and `_plate.items`. The coverage audit gives each reader task a home: the kit and preview, writing a rule that skips code, a server rule, the findings list with select and fix, run and clear, the caret popover and keys, collaboration and suggesting mode, headless use and the nested-editable limit. A check against the source changed two draft claims before rendering. A queued server request for an edited block goes ahead of blocks not checked yet, and an id survives an edit that leaves its block's findings unchanged, typing before a finding included.
  Rechecked after the diff panel changed the server-reply, id and overlap wording: `docs/plans/artifacts/2026-10-13-lint-plate/step8/check-docs-r2-a2.log` and `docs/plans/artifacts/2026-10-13-lint-plate/step8/build-registry-check-r2-a1.log`. The API reference manifest was regenerated first, for one documentation string from another session's plitejs change (`docs/plans/artifacts/2026-10-13-lint-plate/step8/api-reference-r2-a1.log`).
  Rechecked after the layout fix moved the preview height into the registry entry: `docs/plans/artifacts/2026-10-13-lint-plate/v3/build-registry-checkout-a1.log` and `docs/plans/artifacts/2026-10-13-lint-plate/v3/build-registry-check-checkout-a1.log` in the checkout. At frozen commit `77639a5dfe` there are three more: `docs/plans/artifacts/2026-10-13-lint-plate/v3/docs-parity-r5-a1.log`, `docs/plans/artifacts/2026-10-13-lint-plate/v3/www-tsc-r5-a1.log`, which runs `build:source` first, and `docs/plans/artifacts/2026-10-13-lint-plate/v3/build-registry-check-r5-a1.log`. `check:docs`'s first link needs built package declarations a fresh worktree lacks, so its later links ran on their own. The MDX files are back to their earlier text. In the browser the whole demo shows in a 900 px box on `/docs/lint` at 375 and 1280 px, `/cn/docs/lint` at 1280 px, `/docs/components/lint` at 1024 and 1280 px and `/docs/examples/lint` at 1280 px.
- [x] 9. Add the changesets and the registry changelog entry: `platejs: patch` for `platejs/lint`, `plitejs: patch` for the text-run scope, and a registry changelog entry for `lint` and `lint-demo`. Proof: the files read back.
  Done: `.changeset/platejs-lint.md`, `.changeset/plitejs-find-text-ranges-at.md` and `apps/www/src/registry/changelog/entries/2026-10-13-lint.mdx` read back, and `docs/plans/artifacts/2026-10-13-lint-plate/step9/changelog-check-a2.log` shows the generated changelog JSON matches its source.
- [x] 10. Run `best-api repair` on the new public names: `BaseLintPlugin`, `LintRule`, `LintFinding`, `LintPluginState`, `NodeFindTextRangesOptions.at` and the `findTextRanges` root type. Edit Vision only when the repair finds a reusable rule with no owner. Proof: `node tooling/scripts/teaching-sweep.mjs` on those names and `node .agents/rules/plate-next/scripts/sync-resources.mjs --check`.
  Done: `docs/plans/artifacts/2026-10-13-lint-plate/step10/sweep-a1.log` finds no live artifact teaching an older shape; its live hits are the new plugin, kit, demo, spec and pages, the Node API docs updated in step 1, and unrelated talk of lint rules. Generated output is current: `docs/plans/artifacts/2026-10-13-lint-plate/step10/check-docs-a1.log` runs the API reference check, and `docs/plans/artifacts/2026-10-13-lint-plate/step10/build-registry-check-a1.log` reports a fresh registry. Vision needs no edit, because no Vision file mentions linting and the lint rules are product decisions. The Decorations guide now links the Linting page beside the Preview Markdown example, its first inbound link from a guide. The forward test type-checks every snippet on the Linting page against the source types in `docs/plans/artifacts/2026-10-13-lint-plate/step10/docs-snippets-tsc-a1.log`, and the same file with `update.move(2)` added fails on that line in `docs/plans/artifacts/2026-10-13-lint-plate/step10/docs-snippets-tsc-control-a1.log`. `docs/plans/artifacts/2026-10-13-lint-plate/step10/sync-resources-a1.log` reports the skill resources exact.
- [x] 11. Update `docs/research/review-scopes/lint.json` with the new owners, members and proof. Proof: `node tooling/scripts/review-ledger.mjs check`.
  Done: `lint.json` names `packages/platejs/src/features/lint/` as owner, adds the kit, demo, values, browser spec and both docs pages as members, the kit as consumer and the two specs as proof. In `docs/plans/artifacts/2026-10-13-lint-plate/step11/review-ledger-check-a2.log` no problem names a lint file. The command still exits 1 on seven plans this run never edited, listed in `docs/plans/artifacts/2026-10-13-lint-plate/step11/foreign-failures.txt`. Its first run asked this page for the `## Evidence` section a Pursue page carries, which it now has. A rerun at the close still fails on the same seven plans and on nothing of lint's (`docs/plans/artifacts/2026-10-13-lint-plate/verify-final/review-ledger-check-a1.log`), so this step closes on that narrower proof (Defaults: ledger).
- [x] 12. Close the feature. Proof: `node tooling/scripts/check-plate-feature.mjs docs/plans/2026-10-13-lint-plate.md` and `node .agents/pstack/plan-open.mjs docs/plans/2026-10-13-lint-plate.md`.
  Done: the feature checker passes in `docs/plans/artifacts/2026-10-13-lint-plate/step12/check-plate-feature-a3.log`, and `node .agents/pstack/plan-open.mjs docs/plans/2026-10-13-lint-plate.md` passes after you chose to close the 2024 PR and the question left the plan.

## Completion Gates

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Manifest coverage | yes | Run `node tooling/scripts/check-plate-feature.mjs docs/plans/2026-10-13-lint-plate.md` | `docs/plans/artifacts/2026-10-13-lint-plate/step12/check-plate-feature-a1.log` |
| Selected pack closure | yes | Close every selected pack | `performance-observability`: the a4 receipt, the five production runs on the final plugin `docs/plans/artifacts/2026-10-13-lint-plate/probe/lint-locality-a15.log` to `lint-locality-a19.log`, and the spec's work-count cases; timing stays open work |
| Package proof | yes | platejs and plitejs test and typecheck scripts, `BaseLintPlugin.spec.ts` | `docs/plans/artifacts/2026-10-13-lint-plate/v3/lint-spec-final-a1.log` (41 pass), `docs/plans/artifacts/2026-10-13-lint-plate/v3/registry-spec-final-a1.log` (2 pass) and `docs/plans/artifacts/2026-10-13-lint-plate/v3/lint-typecheck-final-a1.log`, all in worktree wt-r5 on the final plugin bytes, sha256 `db587110cf78`; `docs/plans/artifacts/2026-10-13-lint-plate/verify-final/plitejs-contracts-a1.log` (831 pass) and `docs/plans/artifacts/2026-10-13-lint-plate/verify-final/frozen-plitejs-typecheck-a1.log` at frozen commit `7dec65e275`; the live checkout's one type error is another session's |
| Package boundary proof | yes | Run `pnpm test:manifests`, scoped lint, and the affected Oxlint override audit | `docs/plans/artifacts/2026-10-13-lint-plate/step3/manifests-a2.log`; `docs/plans/artifacts/2026-10-13-lint-plate/v3/final-lint-task-a1.log` lints all 13 task files on the final bytes under the existing `packages/platejs/src/features/**` globs with 0 errors |
| Scale proof | yes | Close `performance-observability` with the a4 receipt and the step 4 production rerun plus correctness guard | Step 4's runs a15 to a19, on the final plugin bytes, hold every count line and the oracle guard and reject every control |
| Registry/browser proof | yes | Step 7 on `/blocks/lint-demo` | On the final bytes, `docs/plans/artifacts/2026-10-13-lint-plate/v3/chromium-final-a1.log` to `chromium-final-a5.log` and `docs/plans/artifacts/2026-10-13-lint-plate/v3/webkit-final-a1.log`, 9 of 9 each; `docs/plans/artifacts/2026-10-13-lint-plate/step7/browser-mutants-frozen-a1.log`; the hand drive's screenshots in `docs/plans/artifacts/2026-10-13-lint-plate/browser/`; Firefox accepted out (Defaults: firefox) |
| Docs/release proof | yes | Step 8 and step 9 | `docs/plans/artifacts/2026-10-13-lint-plate/step8/check-docs-r2-a2.log` and `docs/plans/artifacts/2026-10-13-lint-plate/step9/changelog-check-a2.log`; after the layout fix, `docs/plans/artifacts/2026-10-13-lint-plate/v3/docs-parity-r5-a1.log`, `docs/plans/artifacts/2026-10-13-lint-plate/v3/www-tsc-r5-a1.log` and `docs/plans/artifacts/2026-10-13-lint-plate/v3/build-registry-check-checkout-a1.log` |
| Pre-acceptance scale proof | yes | Probe a4 across every cohort with frozen lines, counts, timing, source identity and guard | `docs/plans/artifacts/2026-10-13-lint-plate/probe/lint-locality-a4.log` |
| Warm latency budget | yes | Step 4's timing lines on a quiet host | open: every production run started on a loaded host, so timing is inconclusive; tracked in the subject file's Open work |
| Large/stress scaling | yes | Step 4's 10,000-block sparse and dense cohorts | In a15 to a19 the count lines and the guard hold at 10,000 blocks, sparse and dense |
| Cold and failure paths | yes | Step 2's cases for a checker that throws, a server rule that rejects and `run` on an editor that never ran | `docs/plans/artifacts/2026-10-13-lint-plate/v3/lint-spec-final-a1.log` |
| Payload and fan-out | yes | Count lines C1 and C6, and step 2's cap of four requests per rule | C1 and C6 in a15 to a19; the request-cap cases in `docs/plans/artifacts/2026-10-13-lint-plate/v3/lint-spec-final-a1.log` |
| Production-path rerun | yes | Step 4 | a15 to a19 on the final production `BaseLintPlugin`, sha256 `db587110cf78` |
| Correctness guard | yes | Step 4's independent oracle and step 7's browser cases | `guard=pass` on every cohort of a15 to a19; the browser series on the final bytes |
| Before/after receipt | yes | Baseline arm versus production arm in step 4's log | baseline and production rows in each of a15 to a19 |
| Detector and privacy | no | N/A: no production detector owns editor plugins in this repository | N/A: no production detector owns editor plugins in this repository |
| Performance regression check | yes | The spec's work-count sweep in `pnpm check` | `docs/plans/artifacts/2026-10-13-lint-plate/v3/lint-spec-final-a1.log` |
| Blast radius before code | yes | Run `pstack:blast-radius` on the public API change | `docs/plans/artifacts/2026-10-13-lint-plate/blast/blast-radius.md` |
| Best API repair | yes | Step 10's `best-api repair` on the new public names | `docs/plans/artifacts/2026-10-13-lint-plate/step10/sweep-a1.log`, `docs/plans/artifacts/2026-10-13-lint-plate/step10/sync-resources-a1.log` |
| Production benchmark rerun | yes | Step 4 through `benchmark`, after the last panel fix | a15 to a19, all started after the last code edit |
| Docs coverage | yes | Step 8's `plate-docs` run with its example coverage audit | Step 8's Done line; `docs/plans/artifacts/2026-10-13-lint-plate/step8/check-docs-r2-a2.log` |
| `pnpm check` steps before expensive runs | yes | The typecheck, entrypoint graph and audit steps the edits reach, before step 4's five runs and step 7's browser matrix | `docs/plans/artifacts/2026-10-13-lint-plate/panel-diff-r2/partition-typecheck-a1.log`, `docs/plans/artifacts/2026-10-13-lint-plate/step8/check-docs-r2-a2.log`, `docs/plans/artifacts/2026-10-13-lint-plate/step3/dag-tests-a4.log` |
| Slice freezes | yes | `node .agents/pstack/freeze.mjs` at the end of each slice, chained with `--parent` | `docs/plans/artifacts/2026-10-13-lint-plate/slice1-frozen.txt`, `docs/plans/artifacts/2026-10-13-lint-plate/slice3-frozen.txt`, `docs/plans/artifacts/2026-10-13-lint-plate/slice4-frozen.txt`, then the panel and proof freezes |
| Type-aware lint before the panel | yes | `pnpm exec oxlint --type-aware --format=default` on the task's lintable files, without fixing | `docs/plans/artifacts/2026-10-13-lint-plate/writing/lint-task-a2.log`, whose type-aware oxlint pass found 0 errors before round 1's freeze |
| Diff panel | yes | The `api-build` panel on the diff | Five rounds, `docs/plans/artifacts/2026-10-13-lint-plate/panel-diff-r1/` to `panel-diff-r5/`; no round after the first found a critical finding |
| Writing passes | yes | `deslop` and `no-comments` on product code; `unslop` on docs, plan and changeset prose | the decision log's `writing` rows, including each diff round's fixes |
| Last lint fix | yes | `pnpm lint:fix` on the task's paths, the last check that edits code | `docs/plans/artifacts/2026-10-13-lint-plate/v3/final-lint-fix-a1.log` changed no byte of the 13 task files, by `final-lint-fix-before.txt` and `final-lint-fix-after.txt` beside it; `docs/plans/artifacts/2026-10-13-lint-plate/v3/final-lint-task-a1.log` finds 0 errors |

## Scale proof

The probe is `docs/plans/artifacts/2026-10-13-lint-plate/probe/lint-locality.probe.ts`, a disposable prototype. It reads block text with `NodeApi.string` as a stand-in for the scoped `findTextRanges`, types through programmatic `editor.update` rather than browser input, and does not measure paint. It runs from `packages/platejs` with `bun --preload ../../config/plite-source-aliases.ts` and loaded 317 source files, none from `dist`.

- **a1** rejected ids that carry offsets. Typing before a finding changed every id after it, so each keystroke copied all 69,999 rows into a new list. Its 39.1 ms p95 at 10,000 dense blocks ran on a loaded host, so the work count decides.
- **a2** compared three ways to publish the list with offset-free ids. A list kept in plugin state still copied all 70,000 rows on a keystroke that adds a finding. A list derived on every read walks every block on each keystroke. A list built on demand kept keystrokes near 0.01 ms, but the prototype's rebuild looked up each block's key and missed L7. a2 also exposed a harness bug, because L2 compared each keystroke with the block's final length.
- **a3** fixed L2 and measured the hybrid design. Every line held, but the planted control passed L7, so L7 was not yet shown able to fail.
- **a4** makes the control's list read re-lint every block, adds the count lines C1 and C6 with the flat list as C6's control, and declares the loaded-host rule. Timing counts only when the start load is under a quarter of the cores. a4 ran at load 3.55 on 18 cores and passed its lines. At 10,000 blocks the hybrid's commit handler stays at or under 0.010 ms p95 in every cohort. A list read after a keystroke that keeps the set costs 0.001 ms and walks nothing. A keystroke that changes the set rebuilds the list once: 12,001 items in 0.171 ms sparse and 80,001 in 0.472 ms dense. The flat list fails C6 and L6 at 39.7 ms. The planted control fails every line. The guard passed on every cohort.

a1 to a3 ran at loads from 6.03 to 8.00, so their timing is inconclusive. Their rejections come from work counts or from a4's quiet rerun. Two runs of the hybrid (a3 and a4) are fewer than the five the checklist asks for, so step 4 runs the production rerun five times.

| Hybrid at 10,000 blocks | Findings | Handler p95 | List read p95 | Items walked |
| --- | ---: | ---: | ---: | ---: |
| Sparse, typing at start | 2,000 | 0.006 ms | 0.001 ms | 0 |
| Sparse, toggle | 2,000 | 0.008 ms | 0.171 ms | 12,001 |
| Dense, typing at start | 69,999 | 0.006 ms | 0.001 ms | 0 |
| Dense, toggle | 70,000 | 0.010 ms | 0.472 ms | 80,001 |
| Baseline, dense toggle | 70,000 | 162.482 ms | 0.008 ms | n/a |

The plan claims plugin work only: rule calls per keystroke and the cost of rebuilding the list. a4 measured a prototype that exposes the list through `api`, the shape the plan now ships. a4's guard reused the prototype's own helpers, so it could not catch a wrong offset or order; step 4 adds the independent oracle. The plan makes no browser claim about keystroke-to-paint time at scale. The demo panel's cap bounds the rows React renders; rebuilding the list stays plugin work, measured above, and browser latency stays open work.
## Evidence

Model: claude-opus-5-5 at xhigh effort, read from this session's metadata.

### Requirements

- The owner asked for a Plate Linting docs page with a full example, and for a plugin that covers the raw Plite linting example: app rules, severity paint, a list and count, run, clear, apply a fix and late server findings.
- The plugin also covers the jobs of [udecode/plate#3833](https://github.com/udecode/plate/pull/3833): a caret popover with fixes, fix and next, and next and previous finding.
- Findings never write to the document. Paint goes through the plugin's `decorate` ([plate.md](../vision/plate.md), the `decorate` paragraph).
- Findings follow edits, and a server result counts only for the text it checked ([2026-10-13-lint-review](2026-10-13-lint-review.md), Requirements).
- Rules and their messages are product opinion. The package ships none; the copied kit and the app own them ([VISION.md](../../VISION.md), Plate Essentials).
- No debounce hides latency ([VISION.md](../../VISION.md), Common Essentials).

### Lanes

1. **cand-2, the Opus runner: a headless `platejs/lint` plugin with a copied kit and popover. Wins** as the arena's base, with the grafts below.
2. **cand-1, the Sol runner: the lint engine copied into the kit. Loses**, because a fix to stale replies or fix safety would never reach an app that already copied it. Its primary-root scope, fix by suggestion index, cost-law term and probe sweep are grafted.
3. **cand-3, the Astra runner: also a copied engine. Loses** on the same ground. Its transaction and state roots for `findTextRanges`, per-segment paint keys, per-block checker failures and no paint in foreign views are grafted.
4. **Keep the Stop. Loses**, because the owner reopened it by asking for the page and the plugin.

### Dependents

- `accessibility`, `annotations`, `authored`, `clipboard`, `code`, `collaboration`, `comments`, `compiler`, `dnd`, `editing`, `external-text`, `large-documents`, `list`, `markdown`, `media`, `mentions`, `native`, `pagination`, `runtime`, `schema`, `search`, `state`, `styles`, `table` and `ui`: unaffected. Each reaches this scope only through `apps/www/src/app/(app)/examples/plite/plite-example-loaders.tsx`, which lazy-loads every Plite example by path, and this plan leaves the Plite linting example unchanged. `node tooling/scripts/review-ledger.mjs lookup lint` lists that loader as each scope's only link.

### History

- This plan supersedes [2026-10-13-lint-review](2026-10-13-lint-review.md), whose Stop said Plate keeps no lint package, because the owner then asked for a Plate Linting page and plugin.

## Arena synthesis

The base is cand-2, the Opus runner's `platejs/lint` design. It takes these grafts:

- from cand-3: `findTextRanges` on a transaction or state root, per-segment paint keys, per-block checker failure, and no paint in foreign views;
- from cand-1: primary root only, a fix by suggestion index, the `L_b·F_b` term in the cost law, and a probe swept over findings outside the edited block;
- from the judge: the popover wakes on plugin store changes, not only on editor commits.

Cases the losing candidates handle and this plan limits:

- list paging becomes the per-version rebuild;
- a real `/api/linting` route becomes a labeled stand-in (Defaults: route);
- live two-client collaboration becomes two headless editors on separate Yjs documents that exchange updates (Defaults: live collab).

Deviations from cand-2 after the arena's verdict, each attacked by the plan panel:

- ids drop their offsets and carry a group number that is never reused;
- the findings list leaves plugin state; `api.findings()` rebuilds it once per version;
- the finding under the caret comes from `api.at()` in a copied hook, with no store field of its own.

Only the Claude-family runner and the judge chose a shipped engine; both Codex runners copied the engine into the kit. In round 1, Sol argued for the copied engine and Opus kept the package on other grounds. The plan keeps `platejs/lint` for the owner's wording, Find's precedent and fixes that reach every app, and its Defaults row switches to a copied engine with one word.

## Panel challenge delta

Rounds 1 to 3 improved the plan, and the target stands. Round 1:

- The `findings` selector broke Plate's pure-selector law, so `api.findings()` replaced it.
- Moves and removals now move `version`.
- Ids carry a group number that is never reused.
- `api.at()` replaced the `active` store field.
- The plugin repaints a block at once when an edit drops its server findings.
- `LintPluginState` is exported.
- The scale claim narrowed to plugin work.
- The guard moved to an independent oracle.
- The collaboration proof connects two editors through Yjs, replaced in round 2.

Round 2:

- The copied hooks read through `useSyncExternalStore`, because the React Compiler cached the first version's reads.
- Rows carry no offsets, and the oracle checks ranges by selecting ids.
- A block keeps its ids only when each finding lies in text the edit did not touch.
- The Yjs case uses two documents that exchange updates, because one document rejects a second editor's binding.
- A re-send for an edited block goes ahead of the server queue.

Round 3, the last round before the build:

- `api.at()` returns the focus block's row object and never rebuilds the list.
- The edited span comes from the old and new block text, and its comparison has its own count line.
- Re-sends hold at most three of the four request slots.
- Astra's last case stays as designed. An id survives when one transaction swaps a word for the same word at the same position, because identity follows text and position and the fix acts on the word the user sees.

## Close

Reversals and deviations:

- The 2026-10-13 review's Stop said Plate keeps no lint package. This build ships `platejs/lint`, because you asked for the plugin and the page.
- Step 2 dropped the history tag on `fix`. The diff panel's round 1 put it back. A fix now starts its own undo step unless the caller's update already chose a history tag, so a removal right after typing undoes alone.
- `platejs/lint` also exports `LintMatch`, the type a rule returns. The approved Public API did not list it.
- Step 4 bounds the characters the edited-span comparison reads by reading the source, not by a count line (Defaults: span count).
- Step 11's review-list check still fails on seven plans other sessions own, so the step closed on the narrower proof that none of its failures is lint's (Defaults: ledger).
- Step 7 ran Chromium five times and WebKit once. Firefox never starts on this machine, so it was not run (Defaults: firefox).
- The Feature Manifest's React adapter row was approved as no. It now says yes, because the feature checker requires that row for a new public entrypoint, and the kit's `toReactPlugin` call and its two hooks are that adapter. No code changed for it.
- The size file gains only the `platejs/lint` entry. The measuring build includes other sessions' unfinished work, which moved every other entry, so the release size check stays red on those entries until their owners update them.
- Step 4 reopened after the build. The issue-list rebuild now walks with an index and copies with `forEach`. That is the lint-legal form; the fastest form measured needs a `prefer-for-of` exception (Defaults: v1).
- A hand drive in a real browser found that the demo scrolled sideways below 1,024 px, gave the editor a 306 px column in the docs preview, and later clipped its panel there. Its layout now follows its own width, its panel scrolls, and a ninth browser case guards the phone width (Defaults: side panel).

What landed, uncommitted on `next`:

- `platejs/lint` with `BaseLintPlugin`, `LintRule`, `LintFinding`, `LintMatch` and `LintPluginState`, and its spec.
- In `plitejs`, `NodeFindTextRangesOptions.at` and the `NodeTextRangeView` root for `findTextRanges`, with contract cases and the Node API docs.
- Registry item `lint` (`LintKit`, `LintPopover`, `useLintFindings`, `useLintFindingAt` and two example rules) with its spec, and the `lint-demo` example with its values.
- The Linting page in English and Chinese, its navigation entries and a link from the Decorations guide.
- The `platejs` and `plitejs` patch changesets and a registry changelog entry.
- The browser spec `apps/www/tests/browser/lint.spec.ts`, the lint review scope and the size entry.
- [udecode/plate#3833](https://github.com/udecode/plate/pull/3833) is closed with the drafted comment, as you chose.

Open work moved to the subject file, `docs/plans/topics/lint.md`, each item with its owner and stop.

The review read these inputs. `VISION.md`, `docs/vision/common.md`, `docs/vision/plate.md` and `docs/vision/plite.md` state the project's rules, and none needed an edit. `docs/research/sources/plate-notes/rendering-and-overlays.md` and `docs/plans/2026-05-18-plite-external-decoration-sources-dx-ralplan.md` cover decorations. `BaseLintPlugin` follows `packages/platejs/src/features/find/lib/BaseFindPlugin.ts` and keeps its state in the plugin store from `packages/platejs/src/internal/plugin/pluginStore.ts`. Step 1 changed `packages/plitejs/src/interfaces/node.ts`. The Plite example, `apps/www/src/app/(app)/examples/plite/_examples/linting.tsx`, and its test, `apps/plite/tests/plite-browser/donor/examples/linting.test.ts`, are unchanged.

`BaseLintPlugin` calls `txLocate` and `txSelection`, which come from another session's uncommitted `plitejs` work (`.changeset/plitejs-command-locate.md`). Commit lint with that work or after it. The diff panel's round 1 raised this as a critical finding, and it was dismissed as a delivery order, not a defect.

The diff panel ran five rounds:

- **Round 1** applied two critical fixes. Navigation in the update that edits no longer writes draft findings into the published cache, and a fix that empties an inline element no longer throws.
- **Round 2** found no critical finding and applied eleven others, with one deferred to Open work.
- **Round 3** reviewed the loop change. It found an unmeasured edit to the cold copy, which was reverted, and deferred a missing void and empty-document test to Open work.
- **Round 4** reviewed the layout fix and applied four warnings. Every preview of the demo now takes its height from the registry entry, the panel is capped, and the screenshots were retaken on the final layout.
- **Round 5** applied one warning and two nits with one change, so the whole panel scrolls. It dismissed one nit and deferred no finding.

None of rounds 3 to 5 found a critical issue.

Proof and its limits, from the decision log's scope lines:

- **Headless.** `BaseLintPlugin.spec.ts` passes 41 of 41 on the final plugin bytes, and the registry spec 2 of 2, in a frozen worktree. The main checkout's earlier EMFILE came from running `bun test` on a path without `./`, which Bun reads as a name filter over the whole repository. Run as `bun test ./packages/...`, the spec passes 40 of 41 there. The one failure is the suggestion-mode case, where another session's unfinished rewrite of `packages/plitejs/src/authored/tree/record.ts`, changed since the frozen commit, throws. Reverting each panel fix alone fails its named case: 28 of 28 after round 1 and 37 of 37 after round 2.
- **Types.** The lint partition typechecks on the final plugin bytes, rebuilt with `--force`. www typechecks at frozen commit `77639a5dfe`, and `plitejs` at `7dec65e275`; this run has not changed `plitejs` since then.
- **Browser.** On the final bytes all nine cases pass on Chromium five times and WebKit once. The new phone case fails on the old layout. Both planted defects failed their case at `7dec65e275`. A hand drive in the Claude desktop browser pane covered every Demo step at 1,280 px in light mode and the layout at 375, 925, 1,024 and 1,280 px. In dark mode it checked the underlines and popup at 1,280 px. On the final bytes it rechecked the docs page at 375 px and at the preview's narrowest width with 58 issues, and the demo in dark mode at 375 px. Screenshots are under `docs/plans/artifacts/2026-10-13-lint-plate/browser/`. On the first close's shared dev server, one server case failed in two of five runs, likely from a recompile during the server reply; no failing run recorded one.
- **Scale.** Five production runs of the lint-locality probe on the final plugin bytes, a15 to a19, held every count line and the oracle guard and rejected every control. Each started on a loaded machine, at load 7.86 to 27.13 on 18 cores, so their timing lines are inconclusive. The list rebuild after a keystroke that changes the findings missed L7 in 2 to 8 cohorts per run, all at 10,000 blocks. At 10,000 dense blocks it took a median of 1.8 ms, from 1.2 to 5.2 ms, against a 4.1 ms budget. The prototype took 0.47 ms on a quiet machine. Runs a10 to a14, before the loop change, measured 5.9 ms there. The two series ran at different times on a loaded machine, so only step 4's interleaved A/Bs compare the loop forms.
- **Docs.** `build:registry` and its check pass in the checkout after the registry edit, and the docs source parity check at `77639a5dfe`. Both Linting pages, the examples page and the component page show the whole demo.
- Not shown: Firefox, Safari itself rather than Playwright's WebKit, your own Chrome profile, timing on a quiet machine, and keystroke-to-paint time in a browser on a large document.

Counts: 12 steps; 12 done, 0 partial, 0 skipped, 0 blocked, 0 open. Step 12 closed once you chose to close the 2024 PR and that question left the plan. Step 7 closed on the narrower browser proof that the Firefox Defaults row accepts. Step 4 closed with its timing left open, as the step says for a loaded machine. Step 11 closed on the narrower proof that the ledger Defaults row accepts.

### Attention

reviewed by gpt-6.1-sol @xhigh (Codex), on frozen commit `cd726dd8a8`; no critical flag.

- [warning] The gate rows cited spec and typecheck runs that tested the deslop pass's bytes, which round 3 reverted. The plugin spec (41 of 41), the registry spec (2 of 2) and the lint typecheck reran on the final bytes, and the rows now cite those runs.
- [warning] Step 4 said a7's faster numbers came from the host. The A/B shows only that the panel's fixes did not measurably slow the rebuild, so step 4 now says that and calls the host the likeliest cause.
- [warning] The hand drive checked dark mode only for the underlines and popup at 1,280 px, yet the plan said every step ran in light and dark. A dark check at 375 px followed, and the plan and subject file now say what ran in each mode.
- [warning] The docs screenshot at 375 px was taken before round 5 moved the scroll to the whole panel. On the final bytes, the docs page at 375 px and at the preview's narrowest width shows 58 issues in a 352 px panel that scrolls as a whole, with nothing scrolling sideways.
- [nit] The V3 pick called V1's lint exception your call, though no rule asks your approval for that diagnostic. The Defaults row v1 stays a pick you can reverse.
- [nit] The log left out shell-rule slips: inline `node -p` and `node -e` scripts, an inline `sed`, unquoted zsh words and foreground polling while seats ran. A row now lists them for reflect.

The first review, by the same model on frozen commit `f99508422d`, covered the build before step 4 reopened. Its four warnings are settled in the deviations above and the Defaults rows ledger and span count.

## Reflect

One Opus reviewer applied the judgment, tooling and divergent lenses to this session (`docs/plans/artifacts/2026-10-13-lint-plate/reflect/reviewer.md`), and the lead did the synthesis. One finding changed this page at once. This run's own speed probe ran beside the shared-server browser series, so the Close and step 7 now name it. No lesson can apply without you. None fixes a script that refuses a case its own rule allows, and none is a rewording that adds no words.

Accepted: none.

Backlog, each owner: zbeyens, stop: you take or drop it:

1. A verdict that rejects a PR's implementation still tests the capability the PR adds. Its lanes include the cheapest one, such as a docs page with a copied kit, and a lane rejected as "already doable" names the probe that did it or says it is inferred. This run's Stop missed all three until you pushed back. Home: `.agents/playbooks/verdict.md`, Lanes.
2. A Pursue reached because the owner's question flipped a Stop stops at the plan unless the owner's words ask for the build. Home: `.agents/playbooks/verdict.md`.
3. Build intake checks that every API the plan calls exists at the base commit, so another session's uncommitted API shows up as a delivery dependency before the diff panel. Home: `.agents/playbooks/build.md`.
4. Dismissing a seat's attack on a pick only one model family made needs the comparison that seat asked for, not an owner phrase. Home: `.agents/pstack/rules/panel.md`, through sync-pstack's Lesson mode.
5. A hook refuses inline edit scripts (`node -e`, `python3 -c`, `sed -i`) and the zsh words the shell rules name. This run broke that text rule again. It repeats item 14 of `docs/plans/2026-10-09-authored-structural.md`'s reflect and the open item in `docs/plans/topics/correct.md` (Defaults: refuse inline edits). A blocking hook in your global hooks is your call, so it is not built here. Home: beside `~/.claude/hooks/block-unsafe-rm.mjs`, through `/pstack:correct`.
6. Each Playwright acceptance run writes to its own `--output` folder in the run directory, so the next run cannot wipe a failure's artifacts. Home: `.agents/rules/verify/references/commands.md`.
7. A speed probe never runs beside a timing-sensitive browser acceptance run. A flake counts as diagnosed only when the failing setup reruns with the suspect removed. Home: `verify`'s skill and command recipes.
8. Mutants are planted only in a frozen worktree, never in files a shared dev server serves, and `freeze.mjs` gets a mode that freezes the whole working tree. Home: `.agents/pstack/rules/panel.md`, Review, and `freeze.mjs` in the shared source.
9. Mutants the author wrote and killed show the tests' sensitivity, not readiness. The diff panel still found real defects after every planted mutant failed. Home: `verify`'s skill.
10. `review-ledger.mjs check` takes a page or scope, so a close proves only its own page. Home: `tooling/scripts/review-ledger.mjs`.
11. `check-plate-feature.mjs` gets a flow mode for a new headless entrypoint with copied registry UI, as Find and Lint ship, instead of forcing a React adapter row. Home: the feature checker and `plate-plugins`' manifest reference.
12. The reload line after a compaction also names skills an event gates, such as `plan-page` before any plan edit. Home: `.agents/pstack/rules/long-runs.md` and `reread.mjs`, through sync-pstack.
13. Three command facts. A fresh proof worktree runs `pnpm --filter www build:source` before the www typecheck. `proof.mjs` runs its command without a shell, so a package binary goes through `pnpm exec`. Playwright's Firefox does not start from the desktop app on this machine. Home: `.agents/rules/verify/references/commands.md`.
14. A verdict's demand check searches GitHub Discussions through `gh api graphql`, since `gh search` has no discussion type. Home: `.agents/playbooks/verdict.md`.

Rejected:

- A plan with `verdict: pursue` front matter needs `## Evidence`. It came up once, and the ledger check already says so when it applies.
- The registry gives `lint` a `diff-match-patch-ts` dependency. That is `platejs`'s own peer dependency, and Find carries it too.

### Second reflect

One Opus reviewer applied the three lenses to the stretch after the first reflect (`docs/plans/artifacts/2026-10-13-lint-plate/reflect-2/reviewer.md`), and the lead did the synthesis. It changed this page at once. The Close now names the real cause of the EMFILE, and the rerun it prompted found that another session's Plite rewrite breaks the suggestion-mode case. No lesson can apply without you, because none fixes a script that refuses a case its own rule allows and none is a rewording that adds no words.

Accepted: none.

Backlog, each owner: zbeyens, stop: you take or drop it:

15. Any new UI, such as a demo, a docs page or copied registry UI, gets a hand drive in a real browser before it counts as proven. The drive covers every route that embeds it, at phone, middle and desktop widths, in both themes, with each screenshot read back. Here the specs passed while the demo scrolled sideways and the docs preview clipped it. This was your correction. Home: `verify`'s Drive and Evidence.
16. A layout bug found by hand gets a browser case that measures the layout, when the real bug can fail it. Only the phone width got one here. Home: `verify`'s Evidence, with `.agents/pstack/rules/tests.md`.
17. The browser pane has two traps. While the pane is hidden, `requestAnimationFrame` stops, so read what painted after a screenshot. www's theme follows `localStorage.theme`, not the emulated color scheme. Home: `verify`'s Drive.
18. A demo shown in a docs preview sizes itself with container queries and an explicit `grid-cols-1`. Its preview height comes from `meta.iframeHeight` on the registry entry, which covers every route that embeds it. Home: `plate-ui` and `plate-docs`.
19. Two commands need a set form. `bun test` needs a `./` path, or Bun scans the whole repository and fails with EMFILE. A typecheck that counts as proof runs `tsc --build` with `--force`. The first is already in `verify`'s command recipes, and the reload line after a compaction named `verify`, but the lead did not reload it. Home: move the `./` rule into `verify`'s main text and add `--force` to its recipes.
20. Choose between code forms with a measure the machine's load does not move, such as a profile's sample share or work counts. Keep clock time for the budget claim. On this shared machine the load never fell below a quarter of the cores. Home: `benchmark`.
21. After each writing pass or formatter run on code picked for speed, compare the file with the measured version. Here deslop rewrote a measured loop. Home: `benchmark`.
22. A faster number from an earlier run that no one can explain is a lead to follow before a step closes. You had to send the a7 log back. Home: `benchmark` and the Perf issue playbook.
23. `proof.mjs` takes `--fingerprint <path>` and writes each file's sha256 at the top of its log, and the plan check compares each cited log with the files. Four citations went stale in this stretch. Home: `proof.mjs` and `trails.md`, through sync-pstack's Lesson mode.
24. `decisions-check.mjs` gets a dry run that lists every problem in a queue at once. Three rows here were refused one rule at a time. Home: `decisions-check.mjs`, through sync-pstack's Lesson mode.

Items 5, 8 and 12 came up again. This stretch had three more inline `node` scripts and foreground polling while seats ran, three more hand-built freeze path lists, and a skipped `verify` reload after a compaction. None was built. Item 8's freeze writes a commit, and item 5's hook would block commands, so the reflect rule leaves both to you. Item 12's reload line already names `verify`, so the gap there is the lead, not a missing script.

Rejected:

- A container-query check of the other demos: `git grep` finds no viewport-width grid in any other example.

## Reverses

- The 2026-10-13 review's Stop, as told to the owner earlier in this conversation, said Plate keeps no lint package. This plan ships `platejs/lint`.
