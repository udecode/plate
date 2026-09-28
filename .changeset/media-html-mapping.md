---
'platejs': minor
---

- `VideoPlugin` and `AudioPlugin` serialize to HTML as `<figure class="editor-video">` and `<figure class="editor-audio">` with native controls and a `<figcaption>` caption, and decode those figures plus bare `<video>` and `<audio>` elements, reading `src` or the first `<source>`.
