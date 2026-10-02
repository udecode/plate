# Ordinary-text autocomplete prototype

PROTOTYPE, throwaway. It answers the question from review
`2026-10-01-autocomplete-representation-audit`: can a mention query live as
ordinary editor text, matched from the caret, instead of a native input inside
a void node, and still hold the autocomplete hard laws on Plite?

## Run

From the repository root:

```sh
bun --preload ./config/plite-source-aliases.ts docs/research/probes/2026-10-01-autocomplete-ordinary-text/run.prototype.ts
```

Add `--tui` to drive it by hand. The IME check is `ime.prototype.spec.txt`;
copy it to `apps/plite/tests/plite-browser/` as a `.test.ts` file and run
`pnpm --filter plite test:plite-browser:chromium <that file>`.

## Model

`query.prototype.ts` recomputes the match from the caret on every read: the
text before the caret in the current leaf, back to a trigger that follows the
block start or whitespace. The only stored state is the trigger point the user
dismissed with Escape, held as one Plite anchor. Completion re-reads the live
match, refuses a stale one, and replaces trigger and query in one
`new-batch` update.

## Answer

All ten headless checks pass on a real Plite editor with real anchors, views
and history (`run.result.txt`):

- A trigger after whitespace opens with its query; one inside a word does not.
- Escape closes the popup, typing on keeps it closed, and deleting the trigger
  ends the suppression.
- A remote insert before the trigger keeps the query and shifts its range, and
  a dismissal survives a later remote insert.
- Completion is one undo step, and undo restores the typed `@jo`. The current
  native-input model restores an empty input node instead
  (`packages/platejs/src/features/combobox/lib/BaseComboboxPlugin.spec.ts`
  compares the post-undo value with the value captured right after the trigger),
  so its typed query is lost.
- A failing completion callback rolls back the deletion too.
- A completion whose query a remote edit changed is refused without edits.
- Moving the selection to another root view ends the match and leaves literal
  text.

The browser check (`ime.result.txt`, Chromium with CDP's synthetic IME, not a
physical OS IME) shows the one real cost. While composing, the DOM reads
`Hi @sすず` but the model stays `Hi @s` until commit. A query read from the
model therefore pauses during composition and catches up on commit. Today's
native input filters live while composing.

## Verdict for the design

Ordinary text holds every tested law with far less machinery. It needs no input
schemas, author stamp, cancel API, focus transfer, autofocus gating or
passive-renderer rules, and it fixes the lost-query undo and the orphaned input
node. Keep IME parity by giving the mounted view a read of its active
composition text, because Plite's DOM input runtime already owns that text
during its composition epoch. Accepting commit-time filtering for IME users is
the alternative, and it is a product call.

Not covered here: physical OS and mobile IME, a query split across marked
leaves, multi-word queries (`Admiral Dodd` needs a space policy), two DOM views
of one root, and the popup's own Enter guard during composition.

Delete this folder once the adoption plan has absorbed the answer.
