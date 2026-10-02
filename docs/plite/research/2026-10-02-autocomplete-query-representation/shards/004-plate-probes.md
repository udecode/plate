# Shard 004: Plate probes, old input element against ordinary text

Throwaway probes, removed after the run. Each observes one behavior on the real
registry kits. The new design is the working tree on `next` (HEAD `cf15725603`
plus uncommitted autocomplete work), served at `localhost:3297`. The old design is
HEAD `cf15725603` itself, served at `localhost:3298` by another session's
detached worktree; that worktree adds only untracked DnD benchmark files.

## Input rules inside an open query (jsdom, new design)

`ParagraphPlugin`, `BaseCodeBlockPlugin`, `AutoformatKit`, `BasicMarksKit`,
`MentionKit` and `EmojiKit`, typing with synthetic `beforeinput` events.

| Typed | Text after typing | Popup |
| --- | --- | --- |
| `@(c)` | `@©` | open |
| `@a->b` | `@a→b` | open |
| `@1/2` | `@½` | open |
| `@x~2~` | `@x₂~` | open |
| `@x^2^` | `@x²^` | open |
| `@a==b==` | `@a≡b≡` | open |
| `@o'b` | `@o'b` | open |
| `@john_doe_x`, `@a*b*`, `:face_with_` | unchanged | open |

Text substitutions rewrite query text. Mark rules do not fire inside it. The
old native input never ran either. The plan's line "Input rules and AI Space
keep their current behavior on query text" was wrong, because input rules
never saw query text in the old design.

## Suggestion mode (jsdom, new design)

`BaseSuggestionPlugin` in suggesting mode with `userId: 'alice'`. Typing `@Aa`
and clicking `Aayla Secura` leaves one pending change holding the mention. The
accepted value stays `Hi `, and no struck-through `@Aa` remains in the
rendered DOM.

## Tap during composition (Playwright Chromium)

Route `/blocks/mention-demo`. Caret at `[0,0]` offset 0, type `@`, send CDP
`Input.imeSetComposition` with `biggs`, then tap (mobile) or click (desktop)
the `Biggs Darklighter` option.

| Design | Profile | After `@` | While composing | After activation |
| --- | --- | --- | --- | --- |
| old | desktop | focus moves to `INPUT[role=combobox]`, 50 options | preedit in the input, 1 option | mention inserted, focus back on the editor |
| new | desktop | focus stays on the editor, 50 options | model `@Mention`, DOM preview `@biggs`, 1 option | mention inserted at `[0,2]` offset 0 |
| old | Pixel 5 | no popup, 0 options, model `@Mention` | model `@biggsMention`, caret offset 11 | nothing to tap |
| new | Pixel 5 | popup, 50 options | model `@biggsMention`, caret offset 11, 1 option | refused, focus on `BODY`, text stays `@biggsMention` |

Under Pixel 5 emulation, both designs commit preedit into the model early and
put the caret at offset 11 instead of 6. So the caret fault is in Plite's
Android input path at HEAD, before any combobox involvement. The old design
never opens its popup under that profile, because its trigger depends on an
insert-text override that the emulated input path skips (inferred from the
missing popup, not traced). Emulation is not a device: CDP composition on
desktop Chromium with an Android user agent is not Gboard. These rows show only
that the emulated profile gives no evidence for the input element.

## Accessibility tree with the mention popup open (Playwright Chromium, desktop)

Route `/blocks/mention-demo`, type `@b`, press ArrowDown. The rows below are
the focused element's node from CDP `Accessibility.getPartialAXTree`.

| Design | Idle | Popup open |
| --- | --- | --- |
| old | `textbox`, richtext, multiline | `combobox`, plaintext, `expanded: true`, `hasPopup: listbox`, `autocomplete: list`, `controls` the listbox, `activedescendant` the active option |
| new | `textbox`, richtext, multiline | `textbox`, richtext, multiline, `autocomplete: list`, `controls` the listbox, `activedescendant` the active option |

In both designs the listbox and its options are exposed the same way, and both
pages hold one empty polite live region. The new design does not expose a
combobox role, an expanded state or a popup flag. This is what the platform
accessibility API receives in Chromium. It is not a screen reader run: what
VoiceOver, NVDA or JAWS announce for either tree is unobserved.

Plate's 2024 rationale for the input element, per the source-control
investigator: Joe Anderson on udecode/plate#3168, 2024-05-03, "Switching to a
void isn't a decision I took lightly, but I found it was the only way to get
assistive technologies to consistently recognise that the cursor is inside a
combobox." The v33 design it replaced exposed no ARIA at all, so that
comparison did not include a contenteditable carrying `aria-activedescendant`.
That last point is inferred from the v33 source the investigator read.

## Repair candidates in the accessibility tree (Playwright Chromium, new design)

Same route and keys. With the popup open, the probe set attributes on the
editor root by hand and read the focused node again.

| Root attributes while open | Exposed node |
| --- | --- |
| shipped: `aria-autocomplete`, `aria-controls`, `aria-activedescendant` | `textbox`, richtext, multiline, autocomplete, controls, activedescendant |
| plus `aria-haspopup="listbox"` | the same, plus `hasPopup: listbox` |
| plus `role="combobox"`, `aria-expanded="true"`, `aria-haspopup="listbox"` | `combobox`, richtext, `expanded: true`, `hasPopup: listbox`, controls, activedescendant; the paragraph content stays exposed |

The last row exposes the same combobox state as the old input element while
focus and IME stay in the editor. axe-core 4.11.2 role tables, read locally
from `../editor-benchmarks/node_modules/axe-core`, allow
`aria-activedescendant` and `aria-autocomplete` on `textbox`, treat
`aria-controls` and `aria-haspopup` as global, and allow `aria-expanded` only
where the role takes it: `combobox` requires it and `textbox` does not allow it.
How screen readers react to a root whose role changes while focused is
unobserved; this is a platform-API result only.
