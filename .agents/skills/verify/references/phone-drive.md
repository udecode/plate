# Phone drive

An agent tests a page by hand on the Android emulator or the iPhone simulator through one drive session per phone. A device case still proves each bug it finds there.

## Session

- `node tooling/device/device.mjs boot android` or `boot ios` starts the pinned emulator or the plate_ios_27 simulator. Simulator.app stays closed.
- `node tooling/device/device.mjs drive <android|ios> start --www <port> --dir <run-dir>` starts the session against a running www server, such as `www-drive` on 3519. The session loads the drive code when it starts, so restart it after changing that code.
- `drive <platform> stop` ends it. A session started outside a sandbox serves an agent inside one, such as Codex CLI's `workspace-write` with network access.

## Commands

Run each as `node tooling/device/device.mjs drive <platform> <command> [args]`. Each prints one JSON result with `ok`, `result`, `error`, `errors`, which lists the page and console errors since the last command, and `shot`, the screenshot after the command. Coordinates are screenshot pixels.

| Command | What it does |
| --- | --- |
| `open <path or url>` | Opens a www path or a full URL and picks editor 1. |
| `editor <n>` | Picks the page's n-th editor in document order, read-only ones included; `read` says how many there are. |
| `look` | Lists what can be touched: page controls, editors and the phone's own controls, such as the suggestion bar, the Paste and Copy menus and the browser bar, each with a ref like `@12`, a role, a name and a box. Refs last until the next `look`. |
| `touch @<ref>` or `touch <x> <y>` | Taps; `--double` double-taps and `--hold <ms>` long-presses. |
| `drag <x1> <y1> <x2> <y2> [holdMs]` | Drags one finger, optionally after a hold. |
| `scroll <dy> [<x> <y> or @<ref>]` | Scrolls the box under the point, or the page, by dy CSS pixels. |
| `tap-at <path> <offset>` and `press-at <path> <offset> [ms]` | Tap or long-press the editor's text at a model point, such as `tap-at 0,0 4`. |
| `tap <text> [--end]` | Taps the start, or the end, of the first matching text on the page. |
| `tap-button <name> [--bar keyboard or fixed]` and `tap-menu <name>` | Tap a page button or menu item by its accessible name. |
| `type <text>`, `key <label>` and `use <en or ja or ko or zh>` | Type lowercase letters on the soft keyboard, tap one key, where `backspace`, `enter` and `space` are named, and switch its language. |
| `tap-strip <word>` | Taps a word in the suggestion bar, which on Android includes Gboard's clipboard chip. |
| `clipboard <text>` | Puts text on the phone's clipboard. |
| `hardware-key <key>` | Presses one letter or digit, or `escape`, `tab`, `enter`, `backspace`, `delete`, `home`, `end` or an arrow, joined by `+` to `ctrl`, `cmd`, `alt` or `shift`. Its `pageKeys` lists the keydown keys the page saw. |
| `read` | The editor's `value` with marks, `selection`, blocks, focus, whether the keyboard shows and how many editors there are. |
| `eval <expression>` | Runs page script and returns its value. A change made this way is not a user's input, so use it only to read. |
| `back`, `focus`, `viewport`, `shot`, `record <start or stop>` | Browser Back on Android, the focused element, the viewport, a fresh screenshot, and a screen recording into the run folder. |

Work in a loop: `look`, decide, `touch` a ref or act, then read the screenshot and `read`.

## Limits

- Portrait only, no pinch and no Back on the iPhone.
- The iPhone refuses `hardware-key` for Backspace, Delete, Enter, Escape, Home and End, which never reach the page; `key` taps the soft keyboard's delete and return.
- iOS takes Command+Z for its own record of soft keyboard typing, even from earlier pages, until that record is empty, and `pageKeys` stays empty meanwhile. Press `hardware-key cmd+z` until `pageKeys` shows the z, and type with `hardware-key` letters before an undo you rely on. On Android, `pageKeys` may show `Unidentified` for the letter of a key combination.
- `type` and `key` know only Gboard's letter layout, so a symbol on Android takes `touch` on the symbols key and then on the symbol. Gboard capitalizes the first letter typed at the start of a block or cell.
- `tap <text>` searches the whole page, not the editor `editor` picked. `tap-at` and `read`'s value and focus need a Plite or Plate editor; on another editor, such as slatejs.org, read with `eval`.
- `--bar` names Plate's keyboard and fixed toolbars only. The phone's own menus, such as Paste, take `look` and `touch @<ref>`, not `tap-menu`. A name that never appears fails after 30 seconds.
- On Android, `scroll` moves the page and scroll boxes but not the smaller view Gboard leaves over the page; when the page cannot scroll further, `drag` moves that view.
- After a page crash, `open` on the same page does not recover it; `eval "location.reload(), 1"` does.
