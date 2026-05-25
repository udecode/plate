---
date: 2026-04-03
problem_type: logic_error
component: documentation
root_cause: logic_error
title: BR line-break placeholders are already bridge-compatible
tags:
  - slate-dom-v2
  - zero-width
  - br
  - selection
  - renderer
severity: medium
---

# BR line-break placeholders are already bridge-compatible

## What happened

The next sentinel-strategy question sounded bigger than it actually was:

- do zero-width sentinels stay at all?
- can some cases move to `<br>`?

The honest first thing to prove was not “delete FEFF everywhere.”

It was:

- does the `slate-dom-v2` bridge already tolerate `<br>`-style line-break
  placeholders?

## What the proof showed

Yes.

For line-break placeholders, the bridge already works with a zero-width wrapper
that contains `<br>` instead of depending on a sentinel text child.

That is because the bridge logic is marker-shaped, not FEFF-shaped:

- path lookup climbs from the child DOM node to a bound ancestor
- DOM-point resolution descends to the first leaf node under the bound node
- zero-width offset normalization keys off the zero-width marker, not the
  sentinel character itself

## What this means

The larger strategy seam is **not** “can the bridge tolerate `<br>`?”

It can.

The real remaining seam is:

- which DOM node the renderer binds for each zero-width case
- which cases still need FEFF-like sentinel text because of IME/native selection
  pressure

That is a renderer and input-method policy question, not a DOM bridge tolerance
question.

## Reusable rule

Before trying to replace zero-width sentinels globally:

- prove whether the bridge already tolerates the alternative DOM shape
- if it does, move the decision upward to renderer and IME policy

Do not waste time “teaching the bridge `<br>`” if the bridge already speaks it.
