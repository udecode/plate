---
review_scopes: [native, authored]
verdict: pursue
review_basis: [2026-10-24-native-unread-press-selection, 2026-10-26-settle-repair-identity]
work_kind: implementation
review_commit: 238d4c3f0844e1db7148ca0e09979f14bd139633
review_inputs: [VISION.md, docs/vision/common.md, docs/plans/topics/authored.md, docs/plans/topics/native.md, docs/plans/2026-10-12-keys-proposed-lines.md, docs/plans/2026-10-19-next-check-green.md, packages/plitejs/src/react/editable/mutation-controller.ts, packages/plitejs/src/react/editable/composition-state.ts, packages/plitejs/src/core/editor-commands.ts, packages/plitejs/src/core/command-frame.ts, packages/plitejs/src/authored/tree/record.ts, packages/plitejs/test/react/kernel-authority-audit-contract.ts, apps/www/tests/browser/authored-review.spec.ts]
review_upstreams: ['../prosemirror-suggest-changes@653fba70ba29ef6ea6af3ad8d60244a58df7281b', '../y-prosemirror@9200946f0ea455c681a7496c364ee998a9f064f7', '../prosemirror-view@ca4c78e9b56f1b164c0b3758b59d8748f11b7534']
---

# Land composed text where typed text lands

Status: superseded: the composition commit plan carries its build after the third diff panel
Playbook: plan

**Pursue.** A word composed with an input method on desktop skips the insert-text command. Firefox and Safari write it where the browser composed it (`mutation-controller.ts:913-924`), and Chrome's compositionend fallback does the same (`composition-state.ts:658-674`). Inside another author's crossed-out text the word splits their deletion, and no insert-text handler, such as an input rule or Copilot, sees it. Android already commits through the command, and typed letters inside crossed-out text land after it. The strongest cut deletes both raw writes and commits every composition through the command, so composed text lands where typed text lands and the bridge leaves the authority audit. Teaching the command a stored landing inside struck text instead adds a concept that only composition would use and keeps the platforms apart.

## Brief

### What will change?

On desktop, a word confirmed with an input method lands where a typed letter would. It goes after someone else's crossed-out text instead of splitting it. At the end of a link it joins the link, as a typed letter does.

### What could go wrong?

While you compose, the word shows where the input method draws it, then moves when you confirm. Plugins that react to typing, such as input rules and Copilot, now also see confirmed words.

## Teach

Under review, commands decide where text goes. When you type inside another author's crossed-out letters, the insert-text command puts your letters after them, so their proposal stays whole. Plate's plugins that react to typing, such as input rules, tables and Copilot, run inside that command too.

On desktop, a word composed with an input method skipped the command. Firefox and Safari wrote it where the browser composed it, and so did Chrome's fallback, so the word split the crossed-out text and no plugin saw it. Android already ran the command.

Now every composed word goes through the command when you confirm it. It lands where a typed letter would, and those plugins see it. While you compose, the word still shows where the input method draws it, so it can move when you confirm.

## Public API

No public call changes. The desktop composition commit moves from a raw write to the command Android already runs.

```ts before
// packages/plitejs/src/react/editable/mutation-controller.ts
if (
  inputType === 'insertFromComposition' &&
  !inputController?.state.isReplayingAndroidCommand
) {
  tx.text.insert(data, marks !== undefined ? {} : { at: target });
  return;
}
```

```ts after
// packages/plitejs/src/react/editable/mutation-controller.ts
tx.command(editorCommands.insertText, {
  ...(collapsed && marks !== undefined
    ? {}
    : { options: { at: target } }),
  text: data,
});
```

## What other editors do

A Codex reader read prosemirror-suggest-changes, y-prosemirror and prosemirror-view from source and ran none of them. The one suggestion editor that rules on insertion inside a deletion moves it to the deletion's end, with no exemption for composition found.

| Delta | Editor | Text inserted inside a pending deletion | Composition |
| --- | --- | --- | --- |
| added | prosemirror-suggest-changes | Moves the insertion to the end of the deletion (`replaceStep.ts:266`) | No composition exemption found, so composed text moves too (inferred) |
| added | y-prosemirror | Splits the deletion at a position the caller supplies (`suggestions.test.js:918`) | No composition branch; the test inserts with `insertText`, not an input method |
| added | ProseMirror | No suggestion mode in core | Moves the DOM caret at compositionstart, before the input method draws, wrapping it in mark nodes and in Firefox moving it inside a marked node (`input.ts:457-493`) |
| added | Lexical, Slate, Tiptap | No suggestion mode in their open-source cores; not read for this question | Not read |

## Layer and owner

| Delta | Responsibility | Decision |
| --- | --- | --- |
| added | Desktop composition commit | Plite React's input runtime (`plitejs/react`) dispatches `editorCommands.insertText` for Firefox and Safari's `insertFromComposition` and for Chrome's compositionend fallback, as the Android replay does. The command's frame and recorder decide where the text lands under review, and its interceptors see the word |

## Native behavior and proof

| Delta | Behavior | What changes | Proof surface |
| --- | --- | --- | --- |
| added | A composition confirmed inside another author's crossed-out text | Lands after the crossed-out run instead of splitting it, in Editing and Suggesting, and the crossed-out text keeps no copy of the word | `apps/www/tests/browser/authored-review.spec.ts`. Chromium drives a CDP composition and checks the rendered line. Firefox and WebKit send synthetic composition events, which draw no preedit, so they prove the model only. Real input methods are unproven |
| added | A composition confirmed at the end of a link | Lands where a typed letter at the same caret lands. The word joins the link, as EDIT-AFF-LINK-001 says, and the caret ends after the link, where the link plugin's exit puts a typed letter's caret. `docs/editor-behavior/current-evidence.md:144` records that in the model a typed letter at a link's end lands outside it, owner: zbeyens | `apps/www/tests/browser/homepage-ime.spec.ts` compares a composed word at the end of the homepage's React link with a typed one, Chromium through CDP and Firefox and WebKit through synthetic events |
| added | A composition an insert handler takes without editing, such as the AI chat trigger | Runs that handler once instead of again through the fallback | `packages/plitejs/test/react/composition-state-contract.test.ts` through `applyEditableCompositionEnd` and the queued final input |
| added | Any other desktop composition | Same text, marks and caret as before | the Plite and www composition browser cases in three engines, matched against the review commit; the plitejs React lane |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where a composed word lands inside crossed-out text | After it, as typed letters land, on every platform (look) | Where the browser composed it, splitting the crossed-out text, through a new stored-landing instruction the command passes to the recorder | compose in place | small |
| The Suggestions and Authored Changes docs, which still say typing splits a pending deletion | Fix them in this change to say typed and composed text lands after it (safe) | Leave them for a docs pass | keep docs | detail |

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Desktop composition commit | Raw `tx.text.insert` at the browser's target in `mutation-controller.ts` and `composition-state.ts`; the audit names one as a bridge | `editorCommands.insertText` at the browser's target, as Android | Plite React input runtime | Input paths dispatch commands (`docs/plans/topics/authored.md:415`); typed text inside crossed-out letters lands after them | Internal; no caller changes | The authored-review IME case and the link-end case in three engines, the consumed-composition contract case, the composition browser cases, the React lane, the audit contract | Composed text moves after the crossed-out run at commit; typing plugins see composed words | cut |

## Steps

### Before the design

- [x] Run the authored-review IME case as it stands at the review commit in Chromium, Firefox and WebKit. Proof: all six runs pass with the split.
- [x] Probe: route both raw writes through the command, flip the case's expectation, and run it in the three engines. Proof: all six runs pass with the word after the crossed-out run.

### Build

- [ ] Commit every desktop composition through `editorCommands.insertText`, drop the bridge from the authority audit and add `composition-state.ts` to its owners, flip the browser case, and fix the Suggestions and Authored Changes docs in English and Chinese. Proof: the flipped case and the audit fail at the review commit and pass after; every composition browser case of Plite and www gives the same result as at the review commit in three engines; the plitejs React lane.

- [x] Settle the first diff panel. Restore struck text that still holds the browser's copy of the word, let a collapsed composition insert at the selection so link exit and affinity apply, and count a composition a handler took without editing as committed. Proof: the rendered-line assertion, the link-end case and the consumed-composition case each fail before their fix and pass after, and the composition suites match the review commit. The second panel reverted the link-end fix, because EDIT-AFF-LINK-001 extends a link at its end.

- [x] Settle the second diff panel. Keep the browser's target for every composition, so a word at a link's end lands where a typed letter lands. Remove the browser's copy of the word from every text node of a text host, a decorated leaf's split nodes included, and find each host's leaf by its node key. Proof: the link-end case, which compares a composed word with a typed one, the decorated-leaf case and the key-lookup case each fail on the second panel's reviewed tree or with their fix alone reverted, and pass after.

- [x] Settle the third diff panel. A typed and a composed letter still land apart at a bold link's end, a fallback whose handler took the word without editing loses its guard against the late final input, and the cleanup deletes text in hosts the composition never touched or picks the wrong letters when they repeat. The composition dispatch and the cleanup had each used their one replacement, so the code returns to the review commit and both go back to planning in [the composition commit plan](2026-10-26-native-ime-composition-commit.md), which carries this plan's unticked steps. Proof: the bold-link parity case, the late-final-input case and the three cleanup probes fail on the third panel's reviewed tree.

### Close

- [ ] Final proof on the last bytes: the flipped case five warm runs per engine, a hand drive on the suggestion docs page, and the diff panel. Proof: the logs and `hand-drive.mjs check`.
- [ ] Fold the landing rule into the authored and native subject files. Proof: the render.

## Completion gates

| Gate | Evidence |
| --- | --- |
| `plate-docs` on the Suggestions and Authored Changes pages | pending |
| `pnpm check` steps the edits reach | pending |
| Hand drive | pending |
| Playtest scope | pending |
| `pstack:thermos` | skip: the reviews list's `push` row owes a panel on this diff |
| `oxlint --type-aware` on the task's files | pending |
| Changeset | pending |
| Panel on the diff | pending |
| `review-ledger.mjs check` | pending |

## Evidence

### Requirements

- IME users get the insert-text handlers typing gets: input rules, tables, Copilot and the AI chat trigger. That is the card's ask.
- Input paths dispatch commands, and commands decide on the proposed projection (`docs/plans/topics/authored.md:401-415`).
- Typing and pasting inside crossed-out letters land after them (`docs/plans/2026-10-12-keys-proposed-lines.md:152`). That plan kept IME writing at the caret as a `look` default, and this plan reverses it.
- One composition is one undo step (`docs/editor-behavior/markdown-editing-spec.md:3671`), and a composition finishes under the intent it started with (`docs/plans/topics/authored.md:425`).
- The browser owns the DOM while composing. Plite writes the model at commit and removes composed DOM text it does not manage (`packages/plitejs/src/react/editable/composition-state.ts:597-600`).

### Lanes

- Keep both raw writes. Composed text skips every insert-text handler, Chromium, Firefox and Safari split the crossed-out text, and Android lands after it. The audit keeps a bridge with no deletion trigger.
- Teach the command a stored landing. The command passes the browser's stored target to the recorder, which keeps an interior point for composition and the edge for typing. The recorder already receives the stored selection (`command-frame.ts:985`) but chooses only edges (`record.ts:1384`), so this adds one concept for one caller, and Android would need it too.
- Commit through the command (picked, the strongest deletion). Deletes both raw writes and the bridge entry and adds nothing. The one cost is a word that moves at commit.
- On 2026-10-19 the next-check-green run routed only Firefox and WebKit's commit through the command and kept the split expectation, so the case failed there and the bridge stayed (`docs/plans/2026-10-19-next-check-green.md:117`). This plan routes Chrome's fallback too and changes the expectation.

### Prior reviews

- [2026-10-24-native-unread-press-selection](2026-10-24-native-unread-press-selection.md): this review retains it, because it judged when a click's caret reaches Plite, and this plan changes only how a confirmed composition is written.
- [2026-10-26-settle-repair-identity](2026-10-26-settle-repair-identity.md): this review retains it, because it judged how settle stores a decided block, and composed text now reaches the recorder through the same command typed text uses.

### Dependents

- `ai`, `layout`: `packages/platejs/src/ai/react/AIChatPlugin.ts` and `packages/platejs/src/ai/react/CopilotPlugin.tsx`, unaffected beyond their insert-text handlers now seeing composed words. The chat trigger fires when a composition commits the trigger text, and Copilot takes a composed word that matches its suggestion as it takes typed letters.
- `table`: `packages/platejs/src/features/table/lib/BaseTablePlugin.ts`, unaffected beyond its insert-text handler now collapsing a cell selection before a composed word, as before a typed letter.
- `basic`, `editing`, `plate-api`: `packages/platejs/src/features/link/lib/BaseLinkPlugin.ts`, `packages/platejs/src/lib/plugins/affinity/AffinityPlugin.ts` and `packages/platejs/src/lib/plugins/input-rules/InputRulesPlugin.ts`, unaffected. Their handlers see a composed word with the browser's target pinned, as they see a typed letter, so a word at a link's end joins the link and leaves the caret after it, as a typed letter does. Input rules match a trigger equal to the inserted text, so a composed word fires one only when the input method commits that exact trigger.
- `suggestions`, `comments`, `react`, `ui`: `apps/www/src/registry/components/editor/suggestion.tsx`, unaffected beyond a composed word inside struck text now rendering after the struck run, as a typed letter does. `apps/www/tests/browser/authored-review.spec.ts` changes one expectation.
- `accessibility`, `clipboard`, `code`, `compiler`, `distribution`, `documents`, `exports`, `html`, `media`, `mentions`, `pagination`, `persistence`, `proof`, `runtime`, `search` and `uploads`: unaffected, because they import Plite's public React or internal entries for rendering, commands or plugin wiring, and no export they import changes.
- Android: unaffected, since `android-composition.ts:735` already replays through the command.
- The kernel authority audit loses its one composition bridge and audits `composition-state.ts` (`packages/plitejs/test/react/kernel-authority-audit-contract.ts:1132`).

Model: claude-opus-5-5 (Claude Code), effort xhigh.

## Open work

- Draw the preedit where the word will land. While you compose inside crossed-out text, the browser still draws the word inside it, and the word moves when you confirm. ProseMirror moves the DOM caret at compositionstart (`input.ts:457-493`), so Plite could move it to where the insert-text command will land. That needs a way to ask where the command lands without running it, and a Chromium probe that the input method keeps a caret moved at compositionstart. Owner: the next native composition run. Stop: none, the jump is in the brief.
