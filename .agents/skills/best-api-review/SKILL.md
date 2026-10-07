---
description: Reconcile earlier reviews, then judge whether a Plate or Plite API or architecture direction earns further work before detailed design or implementation, and write the verdict into the review page's front matter.
argument-hint: '[next | audit <scope> | <proposal, path or plan>]'
name: best-api-review
metadata:
  skiller:
    source: .agents/rules/best-api-review.mdc
---

# Best API Review

Handle $ARGUMENTS.

Run the API review playbook, `.agents/playbooks/api-review.md`, in full: it picks the item, reconciles earlier reviews, compares the design space with the `best-api` lens, gives one Stop, Pursue or Defer verdict from its Verdicts section and writes it into the review page's front matter.
