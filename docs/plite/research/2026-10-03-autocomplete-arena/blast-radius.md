# Blast radius of the occurrence-host plan

An Opus subagent ran `pstack:blast-radius` read-only at `fe0e9599a6` on the round-1 plan and wrote what follows in the first person. Its probe is committed beside it as `probe-stamp.ts`, which the lead reran. Two limits apply. The probe's `DataTransfer` row passes through a clipboard stub that inserts nothing, so its "no commit" comes from the fixture; the real path tags such a commit `paste`. Its replacement row inserts at a collapsed caret, so it is not a real autocorrect replacement. The plan supersedes the Before-you-merge step: the probe reads `readTypedInsertion`, which Phase 1 replaces, so Phase 1's own Plite tests check the fix.

The fact this change's safety rests on is half false, and I proved that by running the real input path. Each Editable does get its own origin. But a string paste, yank, drop or autocorrect insert gets exactly the same stamp as a typed character, so the stamp alone cannot tell typing from paste.

All citations are at `fe0e9599a6`. The probed Plite files match that commit exactly (`git diff --quiet fe0e9599a6 -- packages/plitejs` returned 0). No repository files were touched.

## What it does
Typed-text detection moves from Plate's tag checks (`combobox.internal.ts:13-37`) to a Plite report keyed on `history.native-grouping-input`. That annotation holds only `{ origin, composition? }` (`input-history.ts:10-18`), with no inputType. Withholding the IME-confirm keys and changing focus also change Plite behavior for every Plate handler, not just the combobox.

## The one fact: "a stamped commit is typing from that mount"
I ran `probe-stamp.ts` in my scratchpad: it calls `applyModelOwnedBeforeInputMutation` with two input controllers. Results:

| Input | Stamp | Tags | Built owner opens? |
|---|---|---|---|
| insertText `@` (control) | origin A (not B) | `dom-text-input, semantic-command` | yes |
| insertFromPaste, string data | origin A | same | yes |
| insertFromYank | origin A | same | yes |
| insertReplacementText | origin A | same | yes |
| insertFromDrop, string data | origin A | same | yes |
| insertFromPaste with a DataTransfer | no commit, no stamp | – | no |
| insertText, no controller | none | `dom-text-input` | yes |

- **The mount half holds.** Each controller gets a fresh origin (`input-state.ts:534`).
- **The typing half fails.** Every string-data inputType goes through `applyModelOwnedTextInput`, which stamps the controller's origin no matter what the inputType is (`model-input-strategy.ts:372-422`, `mutation-controller.ts:1124-1145`).
- **`runPaste` adds no tag.** It only watches DataTransfer insertion (`editable-dom-runtime.ts:1157-1165`).
- **Today's owner already has this hole.** It opens on yank, replacement or a string paste that contains a trigger.

**The fix:** the report has to record inputType where the stamp is made.

## Risks, worst first
1. **The stamp is not a typing signal.** Shown above, run to completion. The plan's Phase 1 exit needs a paste/yank/replacement/drop case per inputType. It also needs to decide what to do with insertReplacementText: iOS autocorrect re-inserts text the user typed.
2. **Android loses the inputType.**
   - Pending diffs flush as `'insertText'` whatever the original type was (`android-input-manager.ts:318`).
   - Plite's own comment at `android-input-manager.ts:1011` says pastes from the Android clipboard arrive as `insertText`.
   - So Android keyboard-clipboard paste cannot be told apart from typing. Only a long-press menu paste, which carries a DataTransfer, is distinguishable. Likely on Android; cost is a popup opening on paste.
3. **Some typing paths don't stamp the mount's origin, so they would never open a popup:**
   - the `input`-event fallback, which inserts with no annotation (`model-input-strategy.ts:178-240`);
   - `applyModelOwnedTextInput` called without a controller: the `dispatchCommand` / `applyEditableCommand` branches (`mutation-controller.ts:1201-1204, 1245-1252`) and the content-root path, whose controller can be undefined (`keyboard-input-strategy.ts:783-788`);
   - a composition with no controller gets a brand-new origin that matches no mount (`composition-state.ts:676-684`);
   - external text uses its own entry origin (`external-text-runtime.ts:281, 850`).
4. **TablePlugin relies on keyCode 229 reaching its handler.** `on.keyDown` collapses a multi-cell selection when `event.which === 229` (`TablePlugin.tsx:583-590`). Its specs (`TablePlugin.onKeyDown.spec.tsx:477, 517`; ran: 2 pass) call `pipeHandler` directly, so they stay green while the runtime behavior dies. It needs a replacement, such as collapsing on compositionstart. High cost for CJK users with a cell selection.
5. **Where the filter goes matters.** The user handler has one call site (`keyboard-input-strategy.ts:700`). Android's `handleKeyDown` runs first at :685 and carries the SwiftKey placeholder fix (`android-input-manager.ts:1273-1290`). Android soft keyboards send 229 for most keys, so the filter must sit between :685 and :700 and must not return early.
6. **Package graph cycle.** react-core is `privateDirectory('react', ['core','dom','history','static'])` (`entrypoint-dag.mjs:402-407`), and `combobox/react` depends on react-core (`:122-124, :207-216`). A `PlateContent.tsx` that builds a host from `react/features/combobox`, as the plan's Layer table says, closes a cycle that `tooling/oxlint/entrypoint-dag-plugin.mjs` enforces. The host and the `combobox` field type have to live in react-core/core, which grows every Plate React bundle (`platejs-entrypoint-sizes.json`). Read from the code, not run.
7. **There are two focus stores, and neither is exact.** `api.react.isFocused` reads `IS_FOCUSED` (`dom-editor.ts:1707`); `read.view.isFocused` reads view state (`editor-runtime-view.ts:178`, `public-state.ts:4491`). Today:
   - a window blur keeps the flag true on purpose (`selection-reconciler.ts:193-199`);
   - focus moving into a nested Editable leaves the outer one true (`:219-233`), which is why the owner checks `[data-editor]` (`comboboxOwner.internal.ts:222-229`);
   - a new view copies its source's focus (`editor-runtime-view.ts:1293`);
   - mounted Editables share their view's state (`:110`), so no per-view flag can tell two Editables over one view apart. That is the case the plan's mount-origin graft is about, and the host's "another Editable's focus ends the occurrence" rule needs a per-mount flag.
8. **Build and record breaks.**
   - The API reference generator throws on any listed name that no longer exists (`build-api-reference.mts:228-240`). That hits `api-reference.config.json:887, 890, 894, 898, 972, 1065, 1096`.
   - Six pending changesets announce names this change deletes: `combobox-command-runtime.md:11, 14`, `emoji-v54-runtime.md:9`, `footnote-v54-runtime.md:7`, `mention-v54-runtime.md:7`, `slash-command-plite-plugin.md:7`, and `plite-react-settle-input.md`.
   - `.agents/rules/plate-next/versions.json:2964-2965` is version history, which must not be edited; add a new version instead.
9. **Two state types can't simply disappear.** `MentionPluginState` keeps `insertSpaceAfterMention` (`BaseMentionPlugin.ts:26-28`, read at `:154`). `EmojiPluginState` keeps `createEmojiNode` (`BaseEmojiPlugin.ts:13-20`, read at `:35`). They shrink, not vanish.
10. **A second trigger system stays.** AIChatPlugin has its own `trigger: string[] | RegExp | string` plus `triggerQuery` (`AIChatPlugin.ts:134-137, 1467-1492`), documented at `ai.mdx:320-322` and `ai.cn.mdx:363-365`. Copilot's `triggerQuery` is a different option (`CopilotPlugin.tsx:68, 162, 437-449`) and must survive any search-and-replace.

## Q1: consumers of the removed names
**Caught by the type checker:**
- `combobox.ts:3-21`; `combobox.internal.ts:11, 98, 112, 134, 169, 216`
- the four base plugins: emoji `:8, 13, 23`, footnote `:20, 119, 123`, mention `:13, 26, 45`, slash `:2, 6, 10`
- `useCombobox.ts:3, 20-29, 69`; `comboboxOwner.internal.ts:11, 436`
- `inline-combobox.tsx:19-21, 34, 81, 118, 255`; `mention.tsx:188`; `slash.tsx:405`
- `slash.spec.tsx:38-40`; `useCombobox.spec.tsx:77-92, 325`; `footnote.slow.tsx:914`
- `type-tests/combobox-input-contracts.ts:6-38`
- `ReactApi.settleInput`: `with-react.ts:49-60`, `use-plite-runtime.tsx:137`

**Fail only at runtime or build:**
- The kits still type-check with `afterEditable`, because the slot itself survives: mention `:190`, slash `:416`, emoji `:77`, footnote `:465`.
- Stale copied popups pass an object where `useCombobox` expects an occurrence. JS consumers misbehave silently.
- Any runtime write to trigger state stops working. None found in the repo.
- The generated outputs: `apps/www/public/r/*.json`, 14 `__registry__/overlays/*/inline-combobox.json` files, and `api-reference-manifest.json` (19 hits).
- New field and slot registration: `mergePlugins.ts:44-54`, `resolvePlugins.ts:235, 898, 964`, `PlatePlugin.ts:173-183, 453`, `PlateContent.tsx:285-354`, `BasePlugin.ts:1332`, `definePlugin.ts:127`.

**Docs:**
- `combobox.mdx` and `combobox.cn.mdx` `:53-57, 139-150, 174-210, 241`
- `mention.mdx:70, 89-107, 192-195`, `mention.cn.mdx:66-92, 118-130`
- `slash-command(.cn).mdx:65-98, 129-141`
- `emoji.mdx:76, 100-109` and `emoji.cn.mdx:64-89, 125-145`; the Chinese emoji page already covers more than the English one
- `footnote.mdx:91-94, 203-215`
- `.agents/rules/plate-ui.mdc:532`; `docs/editor-behavior/current-evidence.md:27` is a link only; nothing in `docs/vision`
- Templates (CI output): `templates/plate-playground-template/.../slash-kit.tsx`, `ui/inline-combobox.tsx`

## Q2: who reads focus
- **`useEditorFocused`** (`useEditor.ts:57` ← `plate-context.tsx:96, 128`) is read by `floating-toolbar.tsx:124`, `footnote.tsx:91`, `mention.tsx:33`, `tag.tsx:32`, `horizontal-rule.tsx:20`, `media-*.tsx`, `BlockPlaceholderPlugin.tsx:127` and the tabbable demo. With nested-view exactness, outer toolbars and selection rings drop. If window blur also flips the flag, they flicker on every tab switch.
- **Copilot** auto-trigger checks focus at `CopilotPlugin.tsx:614-622`. The plan says Copilot's behavior must not change, so it needs a two-view case.
- **Link toolbar** reads it at `link.tsx:215`.
- **Plite internals:** DOM selection export (`selection-reconciler.ts:1049`), Android selection reapply (`:1375`), `runtime-root-engine.ts:207`, the native-history fallback (`model-input-strategy.ts:260`), and raw Plite's `useFocused` (`use-runtime-focus-state.ts:18-21`). Keep the window-blur stickiness, or :1049 stops exporting the selection when the user comes back to the tab.

## Q3: who sees keyCode 229 or WebKit's confirming Enter
- **Today:** while Plite is composing, the key stops at `:692-698`. Otherwise it reaches `onKeyDown` at `:700`.
- **Plate's shortcut table** has no composition check (`dispatchPlateShortcut.internal.ts`). Bindings an IME-confirm key can hit: Escape (`CopilotPlugin.tsx:574`, `copilot.tsx:90`, `link.tsx:203`, `ai.tsx:98`), Tab (`CopilotPlugin.tsx:569`, `TablePlugin.tsx:403-411`, indent, code block) and mod+enter (`exit-break.tsx:8-9`). All of these get better.
- **The one handler that relies on 229** is TablePlugin (Risk 4).
- **Native listeners still see 229:** `find.tsx:79-93` (guards itself), `NodeSelection.tsx:570-584` and `TabbableEffects.internal.tsx:254`. Scope "every onKeyDown handler" to the Editable's prop.
- **Copied popups with their own input fields** are unaffected: `select-command.tsx:405-408`, `link.tsx:339, 370`, `ai-menu.tsx:744`.

## Q4: which paths stamp
| Path | inputType | Stamps? |
|---|---|---|
| DOM repair (`dom-repair-queue.ts:302, 620`) | insertText only (guard at `:362`) | yes |
| Composition (`composition-state.ts:686, 1037`) | composition | yes |
| Model-owned beforeinput and keydown (`mutation-controller.ts:1124-1270`, plus `:300` and `:698` on a fragment editor) | insertText, plus string-data paste/yank/drop/replacement | yes, for all of them (Risk 1) |
| External text (`external-text-runtime.ts:850`) | intents `input` and `composition` only | yes, with its own entry origin |
| Android diff flush (`android-input-manager.ts:318`) | always `'insertText'` | yes, inputType lost (Risk 2) |
| DataTransfer insert (`mutation-controller.ts:1060-1070`) | – | never |

Typing paths that don't stamp are in Risk 3. Android keyboard-clipboard paste cannot be distinguished from typing.

## Cleared
- No first-party plugin uses a RegExp combobox trigger (only `AIChatPlugin.ts:1471`).
- No `combobox` field name collision in `packages/*/src`.
- No settleInput callers outside Plite apart from the owner.
- The projected-editing capture path ends at the same single gate.

## Before you merge
- Rerun `probe-stamp.ts` (in the scratchpad `blast` folder) with `bun --preload ./config/plite-source-aliases.ts <path>` from the repo root. Rows 2–5 must stop reporting typed text.
- Add a runtime test that sends keyCode 229 through `applyEditableKeyDown` with a multi-cell table selection, rather than going through `pipeHandler`.
- Add a two-Editables-over-one-view focus test before calling the flag exact.