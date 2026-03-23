---
title: Selection shouldTrigger must scan every configured trigger
category: test-failures
date: 2026-03-17
tags:
  - selection
  - input
  - mouse
  - regression
---

# Selection shouldTrigger must scan every configured trigger

## Problem

`shouldTrigger` could reject a valid mouse interaction when the matching trigger was not the first item in the configured trigger list.

That made multi-trigger setups brittle. A later trigger with the right button or modifiers never got a chance to match.

## Root Cause

The loop returned from the first trigger branch even when that trigger did not match the event.

The intended contract is "run if any configured trigger matches". The implementation behaved like "only the first trigger matters unless it happens to be an object branch that falls through".

## Solution

Keep iterating until one trigger matches, then return `true`. If none match, return `false`.

This is the fixed shape:

```ts
for (const trigger of triggers) {
  if (typeof trigger === 'number') {
    if (event.button === trigger) {
      return true;
    }

    continue;
  }

  if (typeof trigger === 'object') {
    const reqButtonIsPressed = trigger.button === event.button;

    const allReqModifiersArePressed = trigger.modifiers.every((modifier) => {
      switch (modifier) {
        case 'alt':
          return event.altKey;
        case 'ctrl':
          return event.ctrlKey || event.metaKey;
        case 'shift':
          return event.shiftKey;
        default:
          return false;
      }
    });

    if (reqButtonIsPressed && allReqModifiersArePressed) {
      return true;
    }
  }
}

return false;
```

## Prevention

- Add a direct helper spec for mixed trigger lists before relying on bigger `SelectionArea` coverage.
- When a helper claims `any(...)` semantics, write at least one test where the successful case is not first in the list.
- For numeric `startThreshold` in `SelectionArea`, remember the threshold is inclusive and uses the combined client-coordinate delta.
