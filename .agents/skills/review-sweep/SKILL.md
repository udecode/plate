---
description: Mine review comments for broader diff-wide fixes instead of handling each line in isolation
name: review-sweep
metadata:
  skiller:
    source: .agents/rules/review-sweep.mdc
---

# Review Pattern Mining

Use this when handling PR review feedback and you want to reduce repeated follow-up review on the same branch.

## Goal

Treat each review comment as a chance to infer a broader rule, then apply that rule across the rest of the current diff where it clearly fits.

## Core Rules

- Extract the underlying rule, not just the literal line edit.
- Fix the same pattern everywhere in the current diff when the rule is objective and low-ambiguity.
- Do not cargo-cult a reviewer suggestion across unrelated code.
- If the feedback is architectural or taste-heavy, decide once and either:
  - refactor intentionally across the relevant seam, or
  - prepare a concise pushback draft with reasoning.
- Prefer one coherent follow-up refactor over many tiny copy-paste fixes.
- Keep the blast radius proportional to confidence.
- If a suggested sweep depends on another PR or pending upstream change, call that out explicitly instead of guessing.

## Good Sweep Targets

- Safety rules:
  - input validation
  - index or key guards
  - dangerous property filtering
  - null or undefined handling
- Repeated docs issues:
  - incomplete explanations
  - drift between API docs and concept docs
  - missing tradeoff or usage guidance
- Repeated code-shape issues:
  - redundant casts
  - awkward conditionals
  - repeated helper patterns
  - duplicated comments or missing comments at the same seam
- Repeated test issues:
  - brittle setup
  - over-specific selectors
  - restored assertions that should exist in similar tests

## Bad Sweep Targets

- Naming preferences without a strong readability win
- Broad architecture changes without repo evidence
- Subjective style choices that only weakly generalize
- Changes that widen public API just to satisfy local convenience
- Anything you cannot explain in one sentence

## Workflow

1. Read the review comment and classify it:
   - safety
   - docs clarity
   - code-shape cleanup
   - test robustness
   - architecture or taste
2. Write down the inferred rule in one sentence.
3. Search the rest of the current diff for the same pattern.
4. Split findings into:
   - clear applies
   - maybe applies
   - does not apply
5. Apply only the clear set automatically.
6. For the maybe set, make one explicit decision with reasoning.
7. Verify the changed seam directly.
8. In your handoff, separate:
   - the original comment you handled
   - the additional diff-wide fixes you inferred from it

## Output Rule

When summarizing the work, make it obvious that you did not just answer the comment literally. Say what broader rule you inferred and where else in the diff you applied it.
