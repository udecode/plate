---
review_scopes: [lint]
verdict: stop
review_basis: []
review_commit: 6fa1169c5e723eb3e058697189cdcad85be220f9
review_inputs: [VISION.md, docs/vision/common.md, docs/vision/plate.md, docs/vision/plite.md, docs/research/sources/plate-notes/rendering-and-overlays.md, docs/plans/2026-05-18-plite-external-decoration-sources-dx-ralplan.md, docs/research/review-scopes/search.json]
review_upstreams: ['../codemirror-lint@a73629893c436da6e39fe9813ad2e2a5f7c98601', '../prosemirror-website@a16b4ece45f135e5f001ab59d25f2d43c25974e1', '../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988']
---

# Lint: close the 2024 lint plugin pull request

Status: superseded: by 2026-10-13-lint-plate, after the owner asked for a Plate docs page and plugin
Topic: lint
Playbook: verdict

**Stop. Close [udecode/plate#3833](https://github.com/udecode/plate/pull/3833) without porting it.** Plate v2 already has every piece a linter needs. A plugin's `decorate` paints findings derived from the current text, `on.commit` reruns a check, a store holds the count, and an `update` command applies a fix. Find (`BaseFindPlugin`, 152 lines) is a working plugin built that way, and the Plite linting example shows the whole lint loop with a browser test. The pull request adds an ESLint-style config engine, with rule plugins, severities, per-block targets and merged parser options, that its two rules never need. Its core also leaks. Every `onChange` reruns every rule over every block and creates a range ref per match that it never releases. No Plate issue asks for linting, spellcheck or grammar checks. Among the reference editors only CodeMirror ships a lint package, and it takes a diagnostics source, not a rule engine. This scope is new, added for this review because no ledger scope asked the question. `node tooling/scripts/review-ledger.mjs next` returns `basic`, and lint depends on no open scope.

## Teach

A linter reads the text, finds problems such as a filler word or a stray space before a comma, highlights them, lists them and offers a one-click fix.

In Plate today that is a small plugin, not a package. The plugin looks at each piece of text as the editor paints it and returns the problem spots with a style, so the highlights always match the current text. A list beside the editor reads the same findings, and a fix is one normal edit. Find already works this way for search matches.

The 2024 pull request built a small ESLint inside the editor, with its own rule packs, error levels and config merging. Its two rules never needed that. It also redid every check on each keystroke and never let go of the old results. So it closes, and Plate keeps no lint package.

## Public API

Today a lint check is app code in a decoration source. The pull request proposed a lint plugin driven by ESLint-style configs instead. The verdict keeps the before.

```tsx before
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

```tsx after
// apps/www/src/registry/default/example/lint-demo.tsx at udecode/plate#3833 head 5aae41523796c278f7da9ef67de05ce8f17ac16d
const { api, editor } = useEditorPlugin(ExperimentalLintPlugin);

api.lint.run([
  {
    ...replaceLintPlugin.configs.all,
    targets: [{ id: editor.children[0].id as string }],
  },
  { settings: { replace: { replaceMap: emojiMap } } },
]);
```

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| A lint package for Plate | None; apps write a small plugin | Plan a Plate lint plugin anyway | plan | big |
| Further lint work | Hold | Review again, or have other models challenge it | again, interrogate | small |
| Where the question lives | A new lint ledger topic | Fold it into search | search | detail |

## Evidence

Model: claude-opus-5-5 at xhigh effort, read from this session's metadata.

### Requirements

- The user job is to flag problems in the text, such as style, spelling, grammar, server or AI findings, show them in place and in a list, move between them and apply a fix.
- Findings never write to the document. Inline paint goes through the owning plugin's `decorate`, and Annotation owns durable logical ranges ([plate.md](../vision/plate.md), the `decorate` and Comments paragraphs; [plite.md](../vision/plite.md), transient ownership).
- Findings follow edits. A finding derived from the text recomputes from the current text. A finding computed elsewhere recomputes, is marked stale, or anchors through Annotation ([2026-05-18 plan](2026-05-18-plite-external-decoration-sources-dx-ralplan.md), Accepted correction; [rendering-and-overlays](../research/sources/plate-notes/rendering-and-overlays.md), line 71).
- Decorations never add fields to `props.leaf` or activate a leaf renderer ([plate.md](../vision/plate.md), rendered leaf props).
- Packages ship semantically neutral defaults. Rules and their messages are product opinion and belong in the app or copied registry source ([VISION.md](../../VISION.md), Plate Essentials).
- Latency is never hidden behind debounce ([VISION.md](../../VISION.md), Common Essentials).
- The owner wants a verdict that lets them close [udecode/plate#3833](https://github.com/udecode/plate/pull/3833).

### Lanes

1. **Port the pull request as a Plate lint package. Loses.** This review read the diff from `gh pr diff 3833` at head `5aae41523796c278f7da9ef67de05ce8f17ac16d` and saved it in the run directory. `ExperimentalLintPlugin` runs `api.lint.run(configs)` from `handlers.onChange`, and `runLint` walks every top-level block for every resolved rule on every change. `experimental_parseNode` calls `createRangeRef` for each match, and the diff contains no `unref`, so each keystroke adds range refs that every later operation must transform. `decorateLint` returns all decorations from the editor entry only, so any change repaints every leaf, and it marks them `lint: true` for `LintLeaf` to read, which v2 forbids. The config engine (`resolveLintConfigs`, severities 0 to 2, `targets`, merged `parserOptions`) serves two rules, `case/capitalize-sentence` and `replace/text`, which a function per rule would carry. The fixers move focus and clear active state through `setTimeout`. The pull request also adds Plate 48 helpers to `@udecode/slate-utils` and `@udecode/plate-floating`, which v2 replaced. GitHub reports it `CONFLICTING` against `main`.
2. **A thin Plate lint plugin on CodeMirror's model. Loses for now; the strongest addition.** The shape would be a plugin configured with a source that returns findings, synchronously or as a promise, plus paint, next and previous commands, a fix command and copied UI. Every piece is already one call on an existing owner, as Find shows: `decorate` with `observe`, `on.commit`, a store, `update` commands and `txSelection`. The one new law it would own is keeping asynchronous results correct across edits. That law has no requester, and the 2026-05-18 plan already names its three answers. A package now would freeze a finding shape and a scheduling delay with zero callers. It reopens when a real consumer, such as a Plate spellcheck, grammar or AI proofreading feature, or two apps, needs one shared source contract.
3. **Keep the current design. Wins.** Plate ships no lint surface; apps write a small plugin, and the Plite example teaches the loop.
4. **Strongest deletion: also delete the Plite linting example. Loses.** Search highlighting already shows a decoration source, but the rendering-and-overlays note records that only the linting example and its browser test show the whole loop: derived findings, a list read through `useEditorState`, and a fix. Predicted benefit of the cut: one example and one test fewer, with no runtime effect. That does not pay for losing the only proof of the pattern.

**Proof limits.** No runtime probe ran, because the verdict changes no code. Claims about the pull request come from its diff, not a running build; it targets the v48 API and conflicts with `main`. The demand check is `gh search issues` on `udecode/plate` for spellcheck, grammar, languagetool, linter, proofread and spelling, read on 2026-10-13. Its 6 hits, 5 distinct issues, were all unrelated, and it does not cover discussions or Discord. The Lexical row is a `git grep` of its `packages/` for spellcheck, grammar and linter, so "no lint feature" is inferred.

### Dependents

- `accessibility`, `annotations`, `authored`, `clipboard`, `code`, `collaboration`, `comments`, `compiler`, `dnd`, `editing`, `external-text`, `large-documents`, `list`, `markdown`, `media`, `mentions`, `native`, `pagination`, `runtime`, `schema`, `search`, `state`, `styles`, `table` and `ui`: unaffected. Each reaches this scope only through `apps/www/src/app/(app)/examples/plite/plite-example-loaders.tsx`, which lazy-loads every Plite example by path, and a Stop changes no file.

### History

- No earlier review of lint exists; this is the scope's first.
- [2026-05-18-plite-external-decoration-sources-dx-ralplan](2026-05-18-plite-external-decoration-sources-dx-ralplan.md): retained. Its correction, that lint findings are derived and never stored as ranges, still holds, and the current example follows it.
- The 2026-10-04 search audit lists the linting example as a search member: retained, unaffected. Its Defer is about Find, not lint.
- External checkouts read: `../codemirror-lint` at `a73629893c436da6e39fe9813ad2e2a5f7c98601`, `../prosemirror-website` at `a16b4ece45f135e5f001ab59d25f2d43c25974e1`, `../tiptap` at `91c51be53c4655ef07e29ec489471524debfa0ca` and `../lexical` at `dd5c41b13193efa9ab1574234d8593d2c9e4f988`. This run cloned the first two.
- `BaseFindPlugin.ts` was read in the working tree, where another session has an uncommitted edit that wraps `select` in `txSelection`; the `decorate` code this page quotes matches `HEAD`.

## Close

**Stop. Close [udecode/plate#3833](https://github.com/udecode/plate/pull/3833) without porting it.** Plate v2 needs no lint package. A small plugin already paints findings from the current text, reruns its check after each change and applies a fix as one edit, the way Find works. The pull request adds an ESLint-style config engine its two rules never use. It also leaks, because each keystroke creates a range ref per match and never releases any. No Plate issue asks for linting, and of the four reference editors read, only CodeMirror ships a lint package, built on a findings source rather than a rule engine.

What landed: this review page, the new `lint` ledger scope and its subject file. No code changed. The proof is the source read and the checks the plan file's Evidence names. A shared lint plugin comes back up when a Plate spellcheck, grammar or AI proofreading feature, or two apps, need one finding source. Counts: one item reviewed, one verdict, Stop.

The comment I would post when closing the pull request:

> Closing this one. Plate v2 covers the lint job without a dedicated package. A plugin's `decorate` paints findings derived from the current text, `on.commit` reruns the check, and an `update` command applies a fix. The Find plugin is built that way. This POC targets the v48 API on `main`, now conflicts, and its ESLint-style config engine is more machinery than its two rules need. If a spellcheck, grammar or AI proofreading feature lands in Plate, it can start from that plugin shape.

## Open work

- Closing [udecode/plate#3833](https://github.com/udecode/plate/pull/3833) moved to [2026-10-13-lint-plate](2026-10-13-lint-plate.md), which supersedes this Stop. owner: zbeyens. stop: that plan closes.
