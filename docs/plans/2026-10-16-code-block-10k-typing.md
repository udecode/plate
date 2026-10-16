# Keep fast typing in big code blocks when suggestions are installed

Status: done, waiting on the owner's commit
Page: https://claude.ai/artifact/9BRq6x6y4Y5VnpEgEbedDv
Playbook: bug-fix

## Brief

### What will change?

Typing in a 10,000-line code block is fast again when suggestions are on. Each key used to take about 16 seconds of browser work, so the browser test timed out. Now a key takes about half a second on a busy machine, the same as with suggestions off, and the test passes in about 21 seconds. Text without a suggestion gets the fast path back.

### What could go wrong?

Typing inside a suggestion in a huge code block is still slow. Plugins that check a condition before coloring text lose the fast path on the text they color, and plugins that color from the text itself lose it everywhere. Custom suggestion plugins that color other text have to opt back out. Code blocks with suggestions also get back an old caret bug from the fast path. Clicking right of a code line puts the caret three characters early.

## Teach

A plugin can add HTML attributes to the nodes it cares about. It names one node property, and Plate hands it that property's value. It can also pass a function that builds the attributes. Suggestions use this to color text that someone proposed.

Plate can't tell what such a function might paint, so it assumes it could paint any text. That turns off the fast typing path for every text in the editor, even text with no suggestion. A highlighted 10,000-line code block is about 60,000 small pieces, and each key re-renders every piece twice.

The fix lets a plugin say it only paints text that has its property. Suggestions say so. Text without a suggestion keeps the fast path, and suggested text renders exactly as before.

## Public API

A text injection can declare that it only paints text holding its node key.

```ts before
// packages/platejs/src/features/suggestion/BaseSuggestionPlugin.ts
  inject: {
    nodeProps: {
      nodeKey: 'authored',
      transformProps: ({ editor, element, nodeValue, text }) => {
```

```ts after
// packages/platejs/src/features/suggestion/BaseSuggestionPlugin.ts
  inject: {
    nodeProps: {
      nodeKey: 'authored',
      textScope: 'nodeKey',
      transformProps: ({ editor, element, nodeValue, text }) => {
```

The new field and its doc, beside the other injection fields.

```ts before
// packages/platejs/src/lib/plugin/PluginDefinition.ts
  /** List of supported node values. */
  validNodeValues?: readonly unknown[];
};
```

```ts after
// packages/platejs/src/lib/plugin/PluginDefinition.ts
  /**
   * Text this injection runs on. `'nodeKey'` runs it, `query` and transforms
   * included, only on text whose node key value is not null or undefined, and
   * on every text when no node key resolves. `'all'` runs it on every text and
   * overrides an inherited `'nodeKey'`. Elements are unaffected.
   *
   * @default 'all'
   */
  textScope?: 'all' | 'nodeKey';
  /** List of supported node values. */
  validNodeValues?: readonly unknown[];
};
```

## Main changes

- One helper in `pluginInjectNodeProps.ts` owns the text rule. A text injection that has a `query`, a transform, or the `text` content key as its node key can change text as it is typed, because `renderText` passes the text with its content. Such an injection applies to text where it can produce output. With `textScope: 'nodeKey'` and a key other than `text`, that is text whose key value is not null or undefined. Any other injection keyed on `text` applies to every text, so it now refuses the fast path even without a `query` or transform. Without the scope, an injection with a transform applies to every text, as today. One with only a `query` applies only to text holding its node key, because `pluginInjectNodeProps` already returns nothing for the rest.
- `pluginInjectNodeProps` uses that helper to return early, before matching, `query` or plugin context, for text a scoped injection does not apply to. Elements keep today's behavior.
- `pipeRenderLeaf` and `pipeRenderText` replace their wildcard transform checks with the same helper, so text that no injection applies to keeps DOM text sync and retained text flow. The plugin cache keeps its lists of names.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| How a plugin says which text it paints | A new opt-in field; only suggestions use it (look) | The node key it already names decides it for every plugin | infer from key | big |
| Blocks | Unchanged; only text follows the new field | Blocks follow it too | blocks too | small |
| Plugins that check a condition before painting | Count them as able to change the text they paint | Leave them as today | ignore query | small |
| What counts as having the property | Any value but null or undefined | Only values that look true | truthy only | detail |
| The plain wrapper around unmarked text | Left as it is; the fix does not need it | Decide it per text too | plain leaf too | detail |
| The 10,000-line browser test | Kept unchanged, with the same time limit and keys | Loosen its limit | loosen test | detail |
| A new test for colors on suggested text | Not added, because an existing test already fails when split suggested text loses its colors | Add the planned test anyway | keep mounted case | detail |
| The generated API reference list | Left without the new field for the task that fixes its generator, which already fails before it reaches this change (look) | Fix the generator here | fix manifest here | small |
| The caret bug this change brings back to code blocks with suggestions | Left to its own task, because every editor without suggestions has it today (look) | Fix it in this change | fix caret here | small |

## Steps

- [x] Red tests first. Proof: on the base bytes, `packages/platejs/src/react/utils/pipeRenderLeaf.spec.tsx` case "keeps native text paths for text without a suggestion" fails because the leaf pipe refuses DOM text sync for text with no marks, and a new `packages/platejs/src/internal/plugin/pluginInjectNodeProps.spec.ts` case fails because a scoped transform still runs on text without its key.
  Closed by `docs/plans/artifacts/2026-10-16-code-block-10k-typing/red-pipeRenderLeaf-a1.log` on the base bytes, and by `docs/plans/artifacts/2026-10-16-code-block-10k-typing/mutate/gate-no-scope-a1.log` and `docs/plans/artifacts/2026-10-16-code-block-10k-typing/mutate/suggestion-unscoped-a1.log`, which remove the gate's scope check and the suggestion opt-in from the final code.
- [x] Build the shared rule, its three readers and the suggestion opt-in. Proof: the new cases pass; the existing wildcard cases in `pipeRenderLeaf.spec.tsx`, the forced-default and query cases in `pluginInjectNodeProps.spec.ts`, and `resolvePlugins.spec.tsx`, `SuggestionPlugin.spec.tsx` and `BaseSuggestionPlugin.spec.ts` pass unchanged.
  Closed by `docs/plans/artifacts/2026-10-16-code-block-10k-typing/specs-4f880fc570-a1.log`, 420 tests across those folders, and `docs/plans/artifacts/2026-10-16-code-block-10k-typing/typecheck-4f880fc570-a1.log`, both on the checkout's newer commit. Both spec files only add cases.
- [x] Pin the edges the panel named. Proof: in the two spec files above, a scoped transform keyed on `text` still refuses DOM text sync for every text; a `query` injection keyed on a mark refuses it for text holding the mark and allows it for text without; and an element still gets a scoped injection's output.
  Closed by `docs/plans/artifacts/2026-10-16-code-block-10k-typing/mutate/scope-on-text-key-a1.log`, `docs/plans/artifacts/2026-10-16-code-block-10k-typing/mutate/text-key-not-all-a1.log`, `docs/plans/artifacts/2026-10-16-code-block-10k-typing/mutate/query-no-reach-a1.log` and `docs/plans/artifacts/2026-10-16-code-block-10k-typing/mutate/matcher-always-active-a1.log`, each failing its own case, with `docs/plans/artifacts/2026-10-16-code-block-10k-typing/mutate/control-1-a1.log` and `docs/plans/artifacts/2026-10-16-code-block-10k-typing/mutate/control-2-a1.log` passing. The element case is in the gate spec.
- [x] Pin suggested-text paint. Proof: a mounted case in `packages/platejs/src/react/features/suggestion/SuggestionPlugin.spec.tsx` with a decoration that splits a suggested text into several leaves asserts the authored change, kind, author, card and color attributes on the text and on every leaf, none on unsuggested text, and the new card on every leaf after a review decision that writes no node in that block.
  skip: cut, because it passed on the matcher mutant and the existing case "paints struck text under a custom mark at leaf placement" already fails on the gate mutant. The saved case is in the run directory, and the Defaults word "keep mounted case" brings it back.
- [x] Repair the public API through `best-api repair`: the field's JSDoc, the injection entry in `content/docs/api/core/plate-plugin.mdx` and its Chinese twin, the guide line in `content/docs/(guides)/plugin.mdx` and its twin, the per-node line in `docs/vision/plate.md`, a regenerated `apps/www/src/generated/api-reference-manifest.json`, and a `platejs` patch changeset.
  Closed without the manifest under the Defaults word "fix manifest here", because `docs/plans/artifacts/2026-10-16-code-block-10k-typing/api-reference-a1.log` shows the generator failing on base. The docs build and parity pass in `docs/plans/artifacts/2026-10-16-code-block-10k-typing/docs-source-4f880fc570-a1.log`, and the registry output is fresh in `docs/plans/artifacts/2026-10-16-code-block-10k-typing/registry-check-4f880fc570-a1.log`.
- [x] Verify on the reporter's surface: the unchanged 10,000-line case passes on the www dev server, mount and typing both, and the timing probe shows mount and per-key script time near the no-injection variant under the same host load. If mount still misses the 20 s readiness wait, the pivot is the plain outer leaf per text.
  Closed by `docs/plans/artifacts/2026-10-16-code-block-10k-typing/final-spec-10k-4f880fc570-a1.log` to `docs/plans/artifacts/2026-10-16-code-block-10k-typing/final-spec-10k-4f880fc570-a5.log`, 5 of 5 in 20.6 to 22.5 s on the checkout's newer commit, and by `docs/plans/artifacts/2026-10-16-code-block-10k-typing/probe-final-10k-a3.log` against `docs/plans/artifacts/2026-10-16-code-block-10k-typing/probe-noinject-10k-a2.log` at load 9 to 11.
- [x] Suggested text still paints in the browser: the authored-attribute cases of `apps/www/tests/browser/suggestion.spec.ts` and the typing case "records each key and keeps the caret where it was typed" in `apps/www/tests/browser/suggestion-page.spec.ts` pass on the final bytes, compared against the same cases at base.
  Closed by `docs/plans/artifacts/2026-10-16-code-block-10k-typing/suggestion-browser-4f880fc570-a1.log`, 62 of 62 on the checkout's newer commit, which holds the fixes of t_e22bf6be and t_3489f812. Without them, two cases fail the same way at the old base in `docs/plans/artifacts/2026-10-16-code-block-10k-typing/head-suggestion-2cases-a1.log`.
- [x] Move the timing probe out of `apps/www/tests/browser/` into the run directory before landing.
  Closed by `docs/plans/artifacts/2026-10-16-code-block-10k-typing/cb10k-probe.spec.ts`.
- [x] Hand drive the docs pages, the huge demo and the suggestion demo on the final bytes.
  Closed by `docs/plans/artifacts/2026-10-16-code-block-10k-typing/hand-drive-check-a3.log`, six cells covered on the checkout's newer commit.

## Open work

- `apps/www/src/generated/api-reference-manifest.json` does not list `textScope` yet. Its generator fails on base before reading this change, because `EditorDirectCommandDispatch`, exported since `83f6e5dde0`, has no entry in `apps/www/api-reference.config.json`. Suggested task `t_54844d26` owns that check, and its next regeneration picks up the field. owner: zbeyens. stop: `pnpm --filter www api-reference` passes and the manifest lists `textScope`.

- Typing inside a suggestion in a huge highlighted code block stays slow. Plite decides retained text flow per block, so one suggested text turns it off for the whole block, and each suggested leaf still builds the plugin context. Suggested task `t_7f07d1f3` measures it. owner: zbeyens. stop: that task's suggesting-mode timing run shows whether it needs its own fix.
- Per-key script time on the fix was 0.39 to 0.53 s on this loaded host, against about 0.27 s implied by the September pass. Suggested task `t_7f07d1f3` measures it. owner: zbeyens. stop: that task's quiet-host run shows whether a second cost remains.
- A click in the blank space right of a code line puts the caret before the line's last three characters once retained text flow is on. HEAD has the same bug in every editor without a text transform injection, and this change turns retained text flow back on for editors with suggestions. Suggested task `t_a191a44d` owns it. owner: zbeyens. stop: that task lands a fix or is dropped.

## Close

Reversals and deviations come first.

- The run cut step 4's mounted paint test. It still passed with the fast-path check broken, and the existing case "paints struck text under a custom mark at leaf placement" already fails when the scope check drops paint on leaves. The Defaults word "keep mounted case" brings it back.
- Diff panel round 1 made the `text` content key reach every text only through a transform. Round 2 showed that `renderText` paints from the text content, so a query on that key goes stale too. The run reverted the round 1 fix, as the panel rule says for a second critical finding on one mechanism, and narrowed the claim. Every injection keyed on `text` now turns the fast path off, even one with no query or transform. The changeset says so.
- The run first restored the regenerated www registry output, then kept it after round 1 showed that `build:registry --check` reads it.
- Step 5 closed without a regenerated API manifest, under the Defaults word "fix manifest here".
- The first ten final runs of the 10,000-line case ran before the round 2 revert, so five more ran on the final bytes.
- The ledger listed the regenerated registry paths only after the run had written them.
- The checkout moved from `83f6e5dde0` to `4f880fc570` during the run, and that commit regenerated the same registry files. The run moved its worktree to the new commit, regenerated the registry output there and reran every check, proof and drive below on that base.

What landed, as a patch in the checkout's working tree for the owner to commit:

- A new `inject.nodeProps.textScope` field takes `'all'` or `'nodeKey'` and has its JSDoc. `BaseSuggestionPlugin` sets `'nodeKey'`.
- One helper in `pluginInjectNodeProps.ts` decides which text an injection reaches. The node-props gate and both render pipes use it, so text no injection reaches keeps DOM text sync and retained text flow.
- The tests add one gate case and four pipe cases, and one pipe case runs for three variants.
- The change updates the API page, the plugin guide, their Chinese twins and the Vision line, adds a `platejs` patch changeset and keeps the regenerated www registry output.

Proof and its limits:

- Cause. At base each key took 16.2 to 16.8 s of script and mount took 22.4 s, and the profile put 12.8 of 17.3 s in React render under the leaf pipe and the node-props gate. Commenting out only the suggestion injection cut a key to 0.68 to 0.81 s. `422564e6f6` moved suggestions onto the text injection path. At a clean base the unchanged case first fails its 20 s readiness wait, because mount takes 22.4 s of script. With only that wait raised to 60 s, it fails in `keyboard.type` at line 79 with the 120 s test timeout, as the card reported.
- Fix. On `4f880fc570` the unchanged 10,000-line case passes 5 of 5 in 20.6 to 22.5 s against its 120 s budget, in Chromium against the www dev server serving package source, at host load 10 to 19. The probe there measures mount script at 0.86 s and 0.42 to 0.56 s of script per key. On the old base at load 9 to 11 the probe measured mount script at 0.87 s and 0.42 to 0.52 s of script per key, against 0.86 s and 0.40 to 0.53 s with the suggestion injection removed.
- Units. 420 platejs tests pass, each of six mutations fails its own case, the three typecheck partitions pass, and the lint fix changes nothing.
- Browser. Both suggestion specs pass 62 of 62 on `4f880fc570`, which holds the fixes of t_e22bf6be and t_3489f812. Without them, two cases fail the same way at the old base.
- Hand drive. Six cells are covered. A typed suggestion paints on its text and leaf, its card count updates at once, and typing in the huge demo lands in the model and the DOM.
- Limits. Every run used Chromium and a dev server, not a production build, on a loaded host. Typing inside a suggestion in a huge block was not measured. The API manifest still lacks `textScope`. The platejs build and the manifest generator failed on code this change does not touch, which t_dc44fa5c and t_54844d26 own; that they fail at base is inferred from their errors, since no clean-base build ran.

The plan has 9 steps. 7 are done, 1 is done on an accepted narrower proof, 1 is skipped, and none is partial, blocked or open. The plan panel ran 2 rounds and the diff panel 3.

Open work keeps 4 items with owners and stops: the manifest under t_54844d26, the two measurements under t_7f07d1f3, and the click caret under t_a191a44d.

### Attention

reviewed by gpt-6.1-sol @xhigh

1. The fix brings back a caret bug on the reporter's route. A click right of a code line lands three characters early. HEAD has it in every editor without suggestions. It is left to t_a191a44d, and the Defaults word "fix caret here" pulls it into this change.
2. The typing timeout at a clean base was only inferred, because the clean run stopped at its readiness wait. A rerun with only that wait raised now fails in `keyboard.type` at line 79, as reported.
3. Besides the registry output, the timing probe, the temporary A/B edit, the plan and the decision log were written before the ledger named them. The log records each late declaration.
4. Rows 19 to 22 and 27 cite logs saved without a command line or exit status. A partial row marks them, and the `mutate.mjs` runs and the runs on `4f880fc570` replace them.
5. The manifest blockers' base attribution rests on their error text, not on a clean-base build, and the Limits line says so.
6. The checkout held earlier copies of seven run files. Landing adds the final ones under `-final` names.
7. The Codex coding rule landed at 21:45Z, after the build was verified at 21:22Z, so the build ran under the older rules.
