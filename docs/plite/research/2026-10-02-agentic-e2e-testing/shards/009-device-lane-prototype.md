# Shard 009: device lane prototype, key map, composition and bypass

Three questions could change the device lane's design, so a throwaway
prototype settled them on 2026-10-02 before the plan. It ran on the local AVD
`Pixel_9_API_36_Play` (Chrome 146, Gboard) against a static page holding one
`<textarea>` and one bare `contenteditable`, served from the session scratchpad
through `adb reverse`. Playwright attached over `adb forward
localabstract:chrome_devtools_remote` and `connectOverCDP`. No repository
file changed.

## Can the key map come from the accessibility tree?

Yes, with the multi-window dump. `adb shell uiautomator dump` lists only
Chrome's window. `adb shell uiautomator dump --windows` lists 153 Gboard nodes,
and every letter key has a `content-desc` and bounds, such as `Q` at
`[5,1678][112,1832]`. Centers from those bounds typed `hello` correctly. The
dump attaches UiAutomation, so the lane should calibrate once and cache the
map instead of dumping during a measured run.

## Does English Gboard compose in a plain field?

No. Typing `hello` into the plain `<textarea>` produced, per letter, a
`keydown` with key `Unidentified`, then `beforeinput` and `input` with
`insertText`, and no composition event. Shard 004 saw the same against Plite.
The behavior belongs to Gboard on this Chrome build, not to Plite, so a
composition case needs a composing keyboard such as Korean, Japanese or
Pinyin (shard 005).

## Can the page tell a real keyboard touch from a bypass?

Yes, from the events alone.

| Input | `keydown` | `beforeinput` |
| --- | --- | --- |
| Real touch on a Gboard key | key `Unidentified`, one per letter | `insertText`, one letter |
| `adb shell input text "xy"` | key `x`, then key `y` | `insertText`, one letter each |
| CDP `Input.insertText` with `zz` | none | `insertText` with `zz` |

So the witness rule "every soft-keyboard character arrives after a `keydown`
with key `Unidentified`, or inside a composition" rejects both bypasses. The
device lane's bypass test should replay these two inputs and expect the
witness to fail.

## Limits

One run of each step on one emulator build. A physical phone, another Gboard
version or another keyboard may send different events, which is what the
lane's per-keyboard calibration records.
