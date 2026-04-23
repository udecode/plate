---
title: Markdown editor reference audits must treat silence as a gap
date: 2026-04-02
category: best-practices
module: editor-behavior
problem_type: best_practice
component: documentation
symptoms:
  - Draft editing specs get locked from intuition instead of explicit reference evidence.
  - Typora and Milkdown appear to agree until destructive keys or inline affinity are examined closely.
  - Major-release behavior changes risk being justified by docs that never actually describe the edge case.
root_cause: inadequate_documentation
resolution_type: documentation_update
severity: medium
tags: [editor-behavior, markdown, typora, milkdown, specs, affinity]
---

# Markdown editor reference audits must treat silence as a gap

## Problem

When we audit markdown editor behavior against reference editors, it is tempting
to over-lock the spec from vibes. That breaks down fast in the exact places that
matter most for a major release: destructive keys, container exit rules, and
inline affinity.

## Symptoms

- Draft rules look “standard” until you ask which reference actually proves
  them.
- Typora gives strong documentation for input flows, but is thin on
  `Backspace@start`, nested empty-exit rules, and multi-block selection.
- Milkdown gives strong executable tests for input and transforms, but is still
  thin on destructive-key semantics and some reverse-navigation cases.
- Inline behavior around links and marks looks compatible at a glance, then
  diverges once you compare Typora’s source expansion with Milkdown’s inclusive
  mark behavior.

## What Didn't Work

- Treating generic menu commands as proof of every collapsed-selection key case.
- Treating missing docs as implicit agreement with the draft rule.
- Treating Milkdown’s equivalent commands as proof of the same key binding.
- Pretending inline affinity is a tiny bug instead of a profile-level behavior
  choice.

## Solution

Use a hard evidence ladder during reference audits:

1. Explicit reference docs or executable tests.
2. Compatible but indirect evidence.
3. Honest gap.

Then encode the result directly in the audit:

- `agree`
- `partial`
- `gap`
- `tension`
- `diverge`

This keeps the spec honest. It also makes the next move obvious:

- lock only the rules with real support
- revise rules where the references push against the draft
- leave silent areas open until we add direct tests or manual repro notes
- move clear reference divergences into profile-owned policy

That is exactly what the first Plate audit produced in
[markdown-editing-reference-audit.md](../../markdown-editing-reference-audit.md):

- safe lock set for paragraph split, heading exit, list split/outdent, quote
  continuation, math edit ownership, and table `Tab`
- immediate revision pressure for paragraph `Tab`, quote `Tab`, code-block
  indentation keys, and inline affinity
- explicit gaps for destructive keys, empty-container exits, and expanded
  structural selections

## Why This Works

The references are asymmetric:

- Typora is strongest on documented markdown-first editing intent.
- Milkdown is strongest on executable behavior in local tests.

Those strengths overlap on some rules and leave holes on others. Treating silent
areas as gaps preserves that asymmetry instead of flattening it into fake
certainty. That makes the spec safer to lock, easier to test, and much less
likely to bake folklore into core behavior.

## Prevention

- During editor behavior audits, require every spec rule to carry one of:
  `agree`, `partial`, `gap`, `tension`, or `diverge`.
- Do not mark a rule `locked` just because it feels standard.
- When Typora and Milkdown diverge on inline behavior, route the rule into a
  behavior profile or affinity policy instead of forcing one global default.
- Keep destructive keys, container exits, and expanded selections in the first
  TDD batch. Those are the easiest places to invent standards that are not
  actually documented.

## Related Issues

- [markdown-editing-spec.md](../../markdown-editing-spec.md)
- [markdown-editing-reference-audit.md](../../markdown-editing-reference-audit.md)
