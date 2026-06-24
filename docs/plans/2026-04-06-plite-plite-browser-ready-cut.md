---
date: 2026-04-06
topic: plite-plite-browser-ready-cut
status: complete
---

# Plite `plite-browser` Ready Cut

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/plite/master-roadmap.md).

## Goal

Continue Phase 8 by tightening `plite-browser` around the real `ready`
contract.

## Scope

- remove the legacy `waitFor*` option aliases from the Playwright surface
- keep `ready` as the maintained setup contract
- sync package/docs and roadmap language accordingly

## Evidence

- maintained browser tests already use `ready`
- the only remaining `waitFor*` option references are inside
  `packages/plite-browser/src/playwright/index.ts`
- the roadmap explicitly says not to preserve awkward `plite-browser` APIs just
  for inertia

## Progress

- removed `waitForEditable`, `waitForPlaceholderVisible`, `waitForSelector`, and
  `waitForText` from the Playwright options surface
- kept default `openExample(...)` behavior honest by defaulting to
  `ready: { editor: 'visible' }`
- updated `packages/plite-browser/README.md` to present `ready` as the only
  maintained setup contract
- synced the Phase 8 roadmap/docs stack in `plate-2`
- verification:
  - no remaining `waitFor*` option references in `/Users/zbeyens/git/plite`
  - `yarn workspace plite-browser test`
  - browser proof on port `3010`:
    `bash ./scripts/run-plite-browser-local.sh 3010 /examples/paste-html "yarn build:plite-browser:playwright && yarn exec playwright test playwright/integration/examples/paste-html.test.ts playwright/integration/examples/links.test.ts --project=chromium --workers=1"`
  - `yarn prettier --check packages/plite-browser/src/playwright/index.ts packages/plite-browser/README.md`
