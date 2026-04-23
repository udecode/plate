---
title: Slate v2 doc stack should separate live replacement truth from historical phase docs
date: 2026-04-07
category: docs/solutions/documentation-gaps
module: slate-v2 docs
problem_type: documentation_gap
component: documentation
symptoms:
  - "Too many Slate v2 docs looked equally primary."
  - "Overview, synthesis, roadmap, and phase docs all restated current truth."
  - "Readers had no clear canonical path for the actual replacement verdict."
root_cause: inadequate_documentation
resolution_type: docs_cleanup
severity: medium
tags:
  - slate-v2
  - docs
  - roadmap
  - replacement-candidate
  - information-architecture
---

# Slate v2 doc stack should separate live replacement truth from historical phase docs

## Problem

The `docs/slate-v2` stack grew by accretion.

That left too many docs trying to do the same job:

- front-door overview
- roadmap ownership
- architectural synthesis
- phase history
- release verdict

The result was not missing documentation.
It was competing documentation.

## Solution

Split the stack into two explicit classes:

1. **Live replacement-truth docs**
   - release readiness
   - family ledger
   - blocker list
   - evidence scoreboard
   - replacement-candidate guide in the repo
2. **Historical / reference docs**
   - engine north star
   - synthesis
   - cohesive program plan
   - frozen package roadmap
   - old phase artifacts

Then make the front-door overview point to the live set first and label the
historical docs as reference-only.

## Why This Works

The hard part was not writing more summary prose.

The hard part was deciding which docs are allowed to own the current truth.

Once the canonical set is small and explicit, the rest of the stack can stay
useful without pretending to be the front door.

## Reusable Rule

For large architecture / migration doc stacks:

- keep one small canonical live set for the current verdict
- label older phase, roadmap, and synthesis docs as historical/reference
- never let historical execution logs compete with the current replacement
  claim
