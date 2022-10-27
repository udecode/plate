---
"@udecode/plate-link": patch
---

- feat:`LinkPlugin` new option `forceSubmit?: boolean`. When true and inserting a link, `enter` key should submit even when url is invalid
- fix: when inserting a link, `enter` key should now submit even another key is pressed
- fix: hotkey to trigger floating link (`cmd+k` by default) should prevent default
