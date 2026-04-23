# Deferred Integration Red Suite

This folder is for future-contract integration tests that are intentionally red.

Use it when:

- the protocol doc names an interaction class we still do not implement
- the expected future behavior is clear enough to write down now
- mixing the red spec into the normal green suite would be stupid

Do not use it for:

- vague ideas
- duplicate green tests
- package-local unit seams

Rules:

- keep specs under domain folders like `clipboard`, `ime`, `mouse-selection`,
  and `platform-shortcuts`
- use `*.deferred.spec.ts[x]`
- reference the future protocol lane or spec ID in the title or file
- keep the assertions public-interface focused
- do not import app-registry fluff if a smaller seam exists

Normal `pnpm test` and `pnpm test:slow` ignore this folder.

Run it explicitly with:

```bash
pnpm test:deferred
```

That command expects the suite to stay red. If everything suddenly passes, the
runner fails so the specs get promoted instead of rotting here.
