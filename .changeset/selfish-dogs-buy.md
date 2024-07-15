---
"@udecode/plate-media": patch
---

- Require the `url` property returned from URL parsers passed to `useMediaState` to be a valid URL and have protocol `https:` or `http:`, if present.
- In the return value of `useMediaState`, rename `url` to `unsafeUrl` to indicate that it has not been sanitised.
