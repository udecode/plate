---
description: Reconcile earlier reviews, then judge whether a Plate or Plite API or architecture direction earns further work before detailed design or implementation, and write the verdict into the review page's front matter.
argument-hint: '[next | audit <scope> | <proposal, path or plan>]'
name: verdict
metadata:
  skiller:
    source: .agents/rules/verdict.mdc
---

# Verdict

Handle $ARGUMENTS.

Run the Verdict playbook, `.agents/playbooks/verdict.md`, in full: it picks the item, reconciles earlier reviews, compares the design space with the `best-api` lens, gives one Stop, Pursue or Defer verdict from its Verdicts section and writes it into the review page's front matter. Load `pstack:poteto-mode` first, follow the steps of the pstack playbook the Verdict playbook `extends` with its deltas applied, and run `check-playbooks.mjs` as `AGENTS.md`'s How work runs says, because this entry skips poteto-mode's routing. Its One item per session section titles the session with the ledger item first, and starts any item after this session's verdict in a new session.
