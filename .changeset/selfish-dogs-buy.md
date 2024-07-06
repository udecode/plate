---
"@udecode/plate-media": patch
---

- Explicitly prohibit `javascript:` protocol when parsing URLs in `useMediaState`.
- In the return value of `useMediaState`, rename `url` to `unsafeUrl` to indicate that it has not been sanitised.
