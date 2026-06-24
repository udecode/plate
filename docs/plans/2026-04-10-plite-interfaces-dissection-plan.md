---
date: 2026-04-10
topic: plite-interfaces-dissection
status: completed
source_repos:
  - /Users/zbeyens/git/plite
  - /Users/zbeyens/git/plate-2
---

# Plite `interfaces.ts` Dissection Plan

## Goal

Stop treating
[interfaces.ts](/Users/zbeyens/git/plite/packages/plite/src/interfaces.ts)
as the secret real owner of the public namespace surface.

## Done

- [path.ts](/Users/zbeyens/git/plite/packages/plite/src/interfaces/path.ts)
- [point.ts](/Users/zbeyens/git/plite/packages/plite/src/interfaces/point.ts)
- [range.ts](/Users/zbeyens/git/plite/packages/plite/src/interfaces/range.ts)
- [location.ts](/Users/zbeyens/git/plite/packages/plite/src/interfaces/location.ts)
- [path-ref.ts](/Users/zbeyens/git/plite/packages/plite/src/interfaces/path-ref.ts)
- [point-ref.ts](/Users/zbeyens/git/plite/packages/plite/src/interfaces/point-ref.ts)
- [range-ref.ts](/Users/zbeyens/git/plite/packages/plite/src/interfaces/range-ref.ts)
- [text.ts](/Users/zbeyens/git/plite/packages/plite/src/interfaces/text.ts)
- [element.ts](/Users/zbeyens/git/plite/packages/plite/src/interfaces/element.ts)
- [operation.ts](/Users/zbeyens/git/plite/packages/plite/src/interfaces/operation.ts)
- [scrubber.ts](/Users/zbeyens/git/plite/packages/plite/src/interfaces/scrubber.ts)

## Remaining

- none inside the `interfaces` lane
- the next heavy topology lane is now
  [/Users/zbeyens/git/plite/packages/plite/src/editor](/Users/zbeyens/git/plite/packages/plite/src/editor)

## Rule

- public namespace paths should be real owners
- `interfaces.ts` can stay as an explicit export surface, but not as the hidden
  home of the namespace logic
- do not resurrect dead type shards just to reduce line count

## Verification

Green in this turn:

```sh
yarn exec tsc --noEmit --skipLibCheck --target es2022 --module esnext --moduleResolution bundler packages/plite/src/interfaces.ts packages/plite/src/interfaces/path.ts packages/plite/src/interfaces/point.ts packages/plite/src/interfaces/range.ts packages/plite/src/interfaces/location.ts packages/plite/src/interfaces/path-ref.ts packages/plite/src/interfaces/point-ref.ts packages/plite/src/interfaces/range-ref.ts packages/plite/src/interfaces/text.ts packages/plite/src/interfaces/element.ts packages/plite/src/interfaces/operation.ts packages/plite/src/interfaces/scrubber.ts packages/plite/src/interfaces/index.ts packages/plite/src/editor.ts packages/plite/src/index.ts packages/plite/src/range-ref-transform.ts packages/plite/src/create-editor.ts packages/plite/src/core.ts
```
