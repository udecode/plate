---
description: Say what to do from any input, such as a doc, draft, issue, PR or idea, with pushback, an outcome per item and a chip for each open question, or judge one Plate or Plite review scope by its exact id with a Stop, Pursue or Defer written into its review page's front matter.
argument-hint: '[<doc, draft, issue, PR or idea> | <scope id> | audit <scope or group id>]'
name: verdict
metadata:
  skiller:
    source: .agents/rules/verdict.mdc
---

# Verdict

Handle $ARGUMENTS.

Run the Verdict playbook, `.agents/playbooks/verdict.md`, in full: its Paths section picks intake or the deep path from the argument, intake gives each item of the input one outcome and offers a chip for each open one, and the deep path reconciles earlier reviews, compares the design space with the `best-api` lens and writes one Stop, Pursue or Defer into the review page's front matter. Load `pstack:poteto-mode` first, follow the steps of the pstack playbook the Verdict playbook `extends` with its deltas applied, and run `check-playbooks.mjs` as `AGENTS.md`'s How work runs says, because this entry skips poteto-mode's routing. Its Sessions section titles the session with the input or scope first and leaves later work to chips.
