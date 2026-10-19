# Media object arrow navigation observation

2026-09-22, headless Chromium via the installed `@playwright/test` and `@platejs/test/playwright` harness. The running Next 16.3.2 dev server at `http://localhost:3000` had its process working directory at `/Users/zbeyens/git/plate-2/apps/www`. Route: `/blocks/editor-ai`. The editor was ready with the text `Images with captions provide context.`. Model selections were read from the root's `__pliteBrowserHandle.getModelSelection()` after keyboard input. No product source was changed for this probe.

The image was at root path `[18]`, with caption text at `[18,0]`; the preceding paragraph ended at `[17,4]@25`.

| Starting selection and action | Observed model selection |
| --- | --- |
| Text `[17,4]@25`, `ArrowRight` | Text `[18,0]@0` (skipped media owner) |
| Text `[18,0]@0`, `ArrowRight` | Text `[18,0]@1` |
| Text `[18,0]@1`, `ArrowLeft` | Text `[18,0]@0` |
| Click image asset | NodeSelection `[[18]]` |
| NodeSelection `[[18]]`, `ArrowRight` | NodeSelection `[[18]]` (no traversal) |
| NodeSelection `[[18]]`, `ArrowDown` | Text `[18,0]@0` |
| Text `[18,0]@0`, `ArrowUp` | Text `[17,4]@24` (not the documented NodeSelection) |

The caption-start `ArrowUp` result was reproduced both after an explicit DOM text selection at `[18,0]@0` and after `ArrowDown` from the clicked owner. Its exact interception cause has not been isolated. This is one Chromium route and one image fixture, not a cross-browser or five-media proof. The deployed [media docs](https://platejs.org/docs/media) describe void media nodes and a separate `CaptionPlugin`; they do not document this branch's direct-child object model or horizontal keyboard sequence.
