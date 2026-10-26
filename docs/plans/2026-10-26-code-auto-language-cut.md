# Code: cut Auto language detection

Status: executed: Auto is gone from the syntax reader, its type and both pickers
Topic: code
Playbook: build

**Code blocks lose the Auto language. The owner asked for the cut on 2026-10-26 because Auto is slow, unless a faster async way exists, and none fits.** Auto made the syntax reader run every registered grammar over the whole block on each edit. With the copied kit's 192 grammars that took 11.6 to 17.1 s per pass over 1,000 lines in Bun, and it guessed CSS for TypeScript ([review](2026-10-26-code-highlights-techniques.md)). A worker would move that work off the main thread but leave the block uncolored until it returns, a delayed repair that `VISION.md` forbids. Guessing once when someone picks Auto and saving the result is a new feature, not a faster Auto.

## Brief

### What will change?

Code blocks no longer offer Auto, so typing in a long block never runs every grammar again. A block saved as Auto shows plain text until someone picks its language, which the browser check saw.

### What could go wrong?

Documents saved with Auto lose their colors, and in development they log a missing-language warning each time their text changes. An app whose default language is Auto, or that creates Auto blocks itself, has to pick a real language. The starter templates still offer Auto until the CI template sync runs, and no check ran in a production build.

## Teach

When a code block's language is Auto, the syntax reader asks Lowlight to guess. Lowlight runs every grammar it has over the whole block and keeps the best score, and the reader does this on every edit.

A background worker could do the guessing off the main thread, but the block would show no colors, or old ones, until the worker answered. `VISION.md` forbids hiding latency behind a delayed repair like that. Guessing once when someone picks Auto, then saving the guess as the block's language, would be fast, but it is a different feature, and its guess was wrong on our own demo.

So the cut removes Auto. The reader now treats "auto" like any language Lowlight does not know.

## Public API

The highlighter type the syntax plugin accepts drops its detection method, so any object with `highlight`, `listLanguages` and `registered` fits.

```ts before
// packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts
export type CodeHighlightLowlight = {
  highlight(
    language: string,
    value: string,
    options?: Readonly<{ prefix?: string | null }> | null
  ): HighlightResult;
  highlightAuto(
    value: string,
    options?: Readonly<{
      prefix?: string | null;
      subset?: readonly string[] | null;
    }> | null
  ): HighlightResult;
  listLanguages(): string[];
  registered(aliasOrName: string): boolean;
};
```

```ts after
// packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts
export type CodeHighlightLowlight = {
  highlight(
    language: string,
    value: string,
    options?: Readonly<{ prefix?: string | null }> | null
  ): HighlightResult;
  listLanguages(): string[];
  registered(aliasOrName: string): boolean;
};
```

## Main changes

- The syntax reader no longer calls Lowlight's `highlightAuto`. A block whose language is `auto`, set on the block or through `defaultLanguage`, takes the unregistered-language path, which keeps its text, paints no syntax and, in development, warns once per text change.
- Both copied language pickers drop the Auto entry, so new blocks cannot choose it.

## Layer and owner

| Delta | Alternative | Why it lost |
| --- | --- | --- |
| added | Auto language detection, live or in a worker | Ran every registered grammar over the whole block on each edit, 11.6 to 17.1 s per 1,000-line pass with 192 grammars in Bun, and guessed CSS for TypeScript. A worker would leave the block uncolored until it answered. Cut on 2026-10-26 at the owner's word. Reopen as a guess-once feature that saves the language, if users ask for it. |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Auto language detection | Cut it | Guess once when someone picks Auto and save that language | detect once | big |
| Blocks already saved as Auto | Show plain text with the usual missing-language warning | Treat them as plain text with no warning | silent auto | small |
| Who writes the code | This session, because the cut only deletes lines | A code delegate in its own worktree | delegate | detail |

## Steps

- [x] 1. Run blast radius on the removed surface. Proof: the consumer census and a probe of a stored `auto` block after the cut.
- [x] 2. Delete the reader's `auto` branch, the type's `highlightAuto`, the Auto test and its spy, the benchmark script's `highlightAuto` wrapper, and both picker entries. Proof: the code-block spec passes and `git grep` finds no live `highlightAuto`.
- [x] 3. Regenerate the registry output and the API reference, and add a changeset and a registry changelog entry. Proof: the regenerated `code-block` and `code-block-static` registry files list no Auto, and `pnpm --filter www api-reference:check` and the registry changelog check pass.
- [x] 4. Run the writing passes, the type-aware lint and a panel on the diff. Proof: the panel's rows in the decision log.
- [x] 5. Drive the native code block's language picker in the browser. Proof: the picker lists Plain Text first and no Auto.
- [x] 6. Run `best-api repair` and check the code-block docs page. Proof: no skill, Vision file or docs page teaches Auto.

## Completion Gates

| Gate | Evidence |
| --- | --- |
| Blast radius before deleting | verified: only the reader branch, the type member, the spec, the benchmark wrapper and the two pickers read Auto; a saved `auto` block keeps its text and gets 0 decorations and one warning on real Lowlight |
| Panel on the diff (reviews row `push`, deletes behavior) | 1 round, 3 seats, no critical finding; 2 warnings and 6 nits applied, 1 nit deferred, 2 dismissed |
| Code-quality and bug review | skip: the panel the `push` row owes covers both lenses |
| Type-aware lint before the panel | 0 warnings and 0 errors on the five product files, and again on the benchmark script after the panel's fix |
| `pnpm check` steps the edits reach | `land.mjs` runs `pnpm check --affected`; the code-block spec, `api-reference:check`, the registry changelog check, `removed-api-teaching` and `knowledge` passed before it |
| Registry output (`build:registry`) | regenerated; `code-block` and `code-block-static` list no Auto |
| Barrels (`pnpm brl`) | skip: no export or exported folder changes |
| Changeset | a `platejs` major, because Auto shipped in 54.0.0-beta.1, and a registry changelog entry for both pickers |
| `best-api repair` | the code subject records the cut, and a research note that still taught `highlightAuto` is fixed; the teaching sweep's other live hits name highlight-mark autoformat or highlight.js internals in an old probe, not Auto |
| `plate-docs` on affected pages | skip: no docs page mentions Auto |
| Hand drive | 73 cells covered, 10 at desktop width and 63 load cells; the picker shows 88 languages, Plain Text first, and a block set to `auto` shows plain text with the label "auto" |
| Playtest scope | none: no scenario catalog covers these files |
| Scale rerun | skip: the cut removes work and adds no scale-sensitive path |

## Close

**Auto is cut.** The syntax reader, its highlighter type and both copied pickers no longer handle Auto. A block saved as Auto keeps its text and shows it uncolored. No faster async way fits. A worker repaints late, and guessing once on pick is a different feature that guessed wrong on our own demo.

Three things differ from the plan. Step 3's proof named a `build:registry --check` that does not exist, so it now names the generated files and the two checks that ran. The comment pass deleted 13 narration comments in the code-block spec, beyond the ask. After the panel, the benchmark script's highlight wrapper lost its `kind` field, which only told Auto calls apart.

The panel's warnings changed the release notes. The changeset now covers apps whose `defaultLanguage` is `auto`, and it says the warning shows only in development, because the debug plugin logs nothing in production. A research note that still described the reader calling `highlightAuto` is fixed, and the plan cites `VISION.md`'s rule against delayed repair instead of a paint rule the seats could not find.

The code-block spec passes 65 tests. A probe on real Lowlight with its common grammars gives a saved `auto` block 0 decorations, unchanged text and one warning, while a TypeScript control gets 6. In the browser on the native demo, the picker lists 88 languages with Plain Text first and no Auto. Switching the first code block from JavaScript to `auto` kept its text, showed the label "auto", painted no syntax spans and logged one warning, while the Python block below kept 47 spans. The hand drive covered all 73 cells.

The proof stops short in three places. No check ran in production mode, the static renderer's "auto" label is read from source rather than driven, and `templates/**` still lists Auto until the CI template sync runs.

## Open work

- `templates/**` still lists Auto until the CI template sync runs, because templates are CI output. owner: the template sync. stop: the next "sync registry and templates" commit.
