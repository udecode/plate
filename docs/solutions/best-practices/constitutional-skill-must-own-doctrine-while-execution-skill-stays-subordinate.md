---
title: Constitutional skill must own doctrine while execution skill stays subordinate
date: 2026-04-13
category: best-practices
module: tooling
problem_type: best_practice
component: documentation
symptoms:
  - A practical authoring skill started absorbing architecture doctrine and API law.
  - A new doctrine skill risked becoming a decorative second source of truth instead of the source of truth.
  - Reviewers could understand the split philosophically but could not enforce it in real lanes.
root_cause: inadequate_documentation
resolution_type: code_change
severity: medium
tags: [skills, doctrine, governance, api-design, architecture, plate]
---

# Constitutional skill must own doctrine while execution skill stays subordinate

## Problem

When a repo needs both architecture doctrine and practical implementation
guidance, it is tempting to put both into one authoring skill.

That fails in two common ways:

- the execution skill becomes a kitchen sink
- a second doctrine skill gets created but drifts because nothing actually
  routes work through it

## Symptoms

- The “practical” skill starts containing architecture law, public API shape,
  precedence rules, and anti-pattern catalogs.
- The “doctrine” skill reads well but lacks routing, ownership, and update
  enforcement, so people ignore it.
- Review lanes cannot answer simple binary questions like:
  - who owns this decision?
  - should this route upward first?
  - what counts as doctrine reaffirmation?

## What Didn't Work

- Keeping doctrine and execution mechanics in one skill.
- Splitting the skills without a hard routing rule.
- Relying on readers to “just know” when to consult the doctrine skill.
- Verifying only section presence instead of behavior-level routing and
  ownership.

## Solution

Use a constitutional source-of-truth skill for reusable API and architecture
decisions, and keep the execution skill explicitly subordinate.

The constitutional skill should own:

- reusable architecture doctrine
- public API shape decisions
- runtime/service-boundary patterns
- ownership/layering law
- performance/scalability law
- anti-patterns

The execution skill should own:

- implementation mechanics
- file placement
- wrapper patterns
- typing details
- execution flow

Then make the split enforceable:

- ambiguous cases route upward to the constitutional skill first
- reusable API/refactor lanes must include either:
  - `updated`
  - or `reaffirmed: <section>`
- the execution skill must not restate long-form doctrine
- a routing matrix and ownership table must exist in the constitutional skill

## Why This Works

The split becomes governable instead of aspirational.

- The doctrine stays in one place.
- The execution companion stays usable.
- Reviewers can reject drift with binary checks.
- Future architecture work has a clear place to update or reaffirm.

## Prevention

- If a new skill is meant to own doctrine, make it the constitutional source of
  truth explicitly.
- If a companion skill exists, add a hard routing gate and a short owner map.
- Do not let the execution companion restate long-form doctrine “for
  convenience.”
- Verify the split with routing scenarios, ownership checks, and explicit
  reaffirmation evidence, not just section existence.
