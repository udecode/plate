# Phone drive

An agent tests a page by hand on the Android emulator or the iPhone simulator through one drive session per phone. A device case still proves each bug it finds there.

## Session

- `node tooling/device/device.mjs boot android [--count <n>]` starts one or more read-only instances of the pinned emulator from its clean snapshot on even ports starting at 5554. `node tooling/device/device.mjs install ios --count <n>` creates numbered clones (`plate_ios_27_2` and up) of `plate_ios_27`, and `boot ios [--count <n>] [--erase]` boots them without opening Simulator.app. By default `boot ios` keeps each simulator's cached system assets and only rewrites the keyboard and locale plists, so iOS does not re-download MobileAssets on every boot; pass `--erase` only when you need a factory wipe.
- `node tooling/device/device.mjs stop android` and `stop ios` shut down every running lane emulator or lane simulator without touching other emulators or simulators such as `iPhone 17` or Sweep simulators.
- `node tooling/device/device.mjs drive <android|ios> start --www <port> --dir <run-dir>` leases the first booted device that has no live drive session or live lock, prints its `serial`, and starts the session against a running www server, such as `www-drive` on 3519. The session loads the drive code when it starts, so restart it after changing that code.
- `drive <platform> stop [--serial <serial>]` ends the session and releases the device. Killing a session process frees its device and stale lock on the next `drive start`. When two or more sessions run on one platform, pass `--serial <serial>` on every drive command. A session started outside a sandbox serves an agent inside one, such as Codex CLI's `workspace-write` with network access.
- Playwright device tests in `apps/plite/playwright.device.config.ts` run one `device` project with one worker per booted serial, splitting cases and repeats across all booted phones instead of repeating every case on every phone. Set `PLATE_DEVICE_SERIALS` to pin specific serials.
- Memory budget for choosing `--count` on a 64 GB Apple silicon Mac: one Android emulator uses about 5.8 to 7.4 GB of available memory, or about 11.7 GB for two active instances with qemu RSS 3.2 to 4.9 GB each; one iPhone simulator with its XCUITest runner uses about 6.5 to 7.3 GB of available memory, or about 14.6 GB for two active instances; each drive session adds about 0.1 GB.

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
