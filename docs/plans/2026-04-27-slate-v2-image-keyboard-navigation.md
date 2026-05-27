# Slate v2 Image Keyboard Navigation

## Status

Done.

## Goal

Fix `/examples/images` keyboard navigation around image void nodes so cursor
movement before, onto, and after images matches legacy behavior.

## Scope

- Code repo: `/Users/zbeyens/git/slate-v2`.
- Plan repo: `/Users/zbeyens/git/plate-2`.
- Primary route: `/examples/images`.
- Primary behavior: keyboard navigation around image void nodes must preserve
  model selection and DOM selection consistently.
- Follow-up behavior: selected image voids must not show the hidden Slate text
  child as visible space above image content.

## Findings

- User report: keyboard navigation around images is broken on
  `/examples/images`.
- Related solution docs point at void/selectable navigation, real void spacer
  structure, and DOM-selection import before model-owned navigation.
- Browser-visible selection bugs must be reproduced with
  `dev-browser --connect http://127.0.0.1:9222`, not inferred from static
  rendering.
- `dev-browser` repro on `/examples/images`:
  - Plain `ArrowRight` from `[0,0]@113` enters the first image at `[1,0]@0`
    and visibly selects it; next `ArrowRight` exits to `[2,0]@0`.
  - Plain reverse `ArrowLeft` from `[2,0]@0` enters `[1,0]@0` and then exits
    to `[0,0]@113`.
  - `ArrowDown` from `[0,0]@113` moves the DOM selection into `[1,0]@0`
    while the Slate model selection stays at `[0,0]@113`; the image is not
    visibly selected.
  - `Shift+ArrowRight` from `[0,0]@113` lets the DOM expand to the image
    wrapper while the model remains collapsed; a second `Shift+ArrowRight`
    moves model focus to `[1,0]@0` while DOM focus is on the following
    paragraph wrapper. This is a DOM/model selection split.
- Fix in `/Users/zbeyens/git/slate-v2`:
  - `Shift+ArrowLeft` / `Shift+ArrowRight` are now classified as model-owned
    horizontal movement and executed through `editor.move({ edge: 'focus' })`.
  - Native `ArrowUp` / `ArrowDown` schedules a post-keydown DOM-selection
    import so void spacer selections are imported after Chrome settles the
    final native selection.
  - `/examples/images` now has focused browser rows for horizontal movement,
    vertical movement into an image, and Shift-extension into an image.
- Follow-up browser repro:
  - Selecting the first image exposes a raw `[1,0]` text child before the image
    content.
  - The raw child renders a zero-width `<br>` with about one line of layout,
    so the visible image content starts roughly `22px` below the void node top.
  - This is the same class as the prior embeds spacer regression: the Slate
    child belongs in `VoidElement` / `SlateSpacer`, not direct app layout.
- Follow-up fix:
  - `/examples/images` now renders the image UI through `VoidElement` with the
    Slate child in `spacer`.
  - `/examples/paste-html` now does the same for pasted image voids.
  - `editable-voids` was intentionally left on its custom wrapper after a
    browser row proved `VoidElement` breaks that example's focus restoration;
    it is not the same image-style visual gap.

## Plan

1. Reproduce the broken keyboard path in the real browser.
2. Inspect the image example model and existing browser coverage.
3. Decide whether the owner is core positions/void traversal, slate-react
   keydown handling, or image rendering.
4. Add focused regression coverage for the failing path.
5. Fix the shared owner and verify with browser, targeted tests, typecheck,
   lint, and completion.
6. Add a visual spacer regression row for selected images.
7. Migrate image-style custom void rendering through the shared void primitive.

## Verification

- `dev-browser --connect http://127.0.0.1:9222` verified on
  `/examples/images`:
  - `ArrowDown` from before the first image: model `[1,0]@0`, DOM `[1,0]@0`,
    image selected.
  - `Shift+ArrowRight` from before the first image: model anchor
    `[0,0]@113`, focus `[1,0]@0`; DOM anchor/focus match.
  - `ArrowRight` enters the first image and the next `ArrowRight` exits to the
    following paragraph.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/images.test.ts --project=chromium`
  passed.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/richtext.test.ts --project=chromium --grep "ArrowDown then ArrowRight|browser line extension|movement commands|core command metadata|kernel policies"`
  passed.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/inlines.test.ts --project=chromium --grep "arrow keys skip"`
  passed.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/inlines.test.ts playwright/integration/examples/editable-voids.test.ts --project=chromium --grep "move-selection|selectionchange noise|nested editor"`
  passed.
- `bun --filter slate-react typecheck` passed.
- `bun typecheck:root` passed.
- `bun lint:fix` passed and fixed one file.
- Extracted learning:
  `docs/solutions/ui-bugs/2026-04-27-slate-react-void-keyboard-navigation-needs-post-native-sync-and-shift-model-ownership.md`.
- Follow-up visual spacer verification:
  - RED:
    `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/images.test.ts --project=chromium --grep "image void spacer"`
    failed with `contentOffset` `22.390625`.
  - GREEN:
    `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/images.test.ts --project=chromium`
    passed.
  - `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/paste-html.test.ts playwright/integration/examples/editable-voids.test.ts --project=chromium`
    passed.
  - `dev-browser --connect http://127.0.0.1:9222` verified on
    `/examples/images`: selected image model selection `[1,0]@0`, content
    offset `0`, spacer position `absolute`, spacer height `0px`.
  - `bun typecheck:root` passed after lint.
  - `bun --filter slate-react typecheck` passed.
  - `bun lint:fix` passed and fixed one file.
  - Updated existing learning:
    `docs/solutions/logic-errors/2026-04-26-slate-react-custom-voids-must-render-children-through-spacer.md`.
