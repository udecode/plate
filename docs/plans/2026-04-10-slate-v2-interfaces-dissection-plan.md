---
date: 2026-04-10
topic: slate-v2-interfaces-dissection
status: completed
source_repos:
  - /Users/zbeyens/git/slate-v2
  - /Users/zbeyens/git/plate-2
---

# Slate v2 `interfaces.ts` Dissection Plan

## Goal

Stop treating
[interfaces.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces.ts)
as the secret real owner of the public namespace surface.

## Done

- [path.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/path.ts)
- [point.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/point.ts)
- [range.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/range.ts)
- [location.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/location.ts)
- [path-ref.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/path-ref.ts)
- [point-ref.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/point-ref.ts)
- [range-ref.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/range-ref.ts)
- [text.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/text.ts)
- [element.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/element.ts)
- [operation.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/operation.ts)
- [scrubber.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/scrubber.ts)

## Remaining

- none inside the `interfaces` lane
- the next heavy topology lane is now
  [/Users/zbeyens/git/slate-v2/packages/slate/src/editor](/Users/zbeyens/git/slate-v2/packages/slate/src/editor)

## Rule

- public namespace paths should be real owners
- `interfaces.ts` can stay as an explicit export surface, but not as the hidden
  home of the namespace logic
- do not resurrect dead type shards just to reduce line count

## Verification

Green in this turn:

```sh
yarn exec tsc --noEmit --skipLibCheck --target es2022 --module esnext --moduleResolution bundler packages/slate/src/interfaces.ts packages/slate/src/interfaces/path.ts packages/slate/src/interfaces/point.ts packages/slate/src/interfaces/range.ts packages/slate/src/interfaces/location.ts packages/slate/src/interfaces/path-ref.ts packages/slate/src/interfaces/point-ref.ts packages/slate/src/interfaces/range-ref.ts packages/slate/src/interfaces/text.ts packages/slate/src/interfaces/element.ts packages/slate/src/interfaces/operation.ts packages/slate/src/interfaces/scrubber.ts packages/slate/src/interfaces/index.ts packages/slate/src/editor.ts packages/slate/src/index.ts packages/slate/src/range-ref-transform.ts packages/slate/src/create-editor.ts packages/slate/src/core.ts
```
