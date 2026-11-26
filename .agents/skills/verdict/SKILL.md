---
description: Judge any doc, draft, issue, PR, idea, or Plate/Plite review scope id (Stop/Pursue/Defer) with pushback, outcomes, and open-question chips. Also handles `/loop verdict <scope>`, `explore <scope or idea>` (rounds until `lock`), `audit`, and `audit restart`.
argument-hint: '[<doc, draft, issue, PR or idea> | <scope id> | explore <scope or idea> | audit | audit restart | audit <scope or group id>]'
name: verdict
metadata:
  skiller:
    source: .agents/rules/verdict.mdc
---

# Verdict

Handle $ARGUMENTS.

Run the Verdict playbook, `.agents/playbooks/verdict.md`, in full: its Paths section picks intake, the deep path or Explore from the argument, or one step of its Audit pass for a bare `audit` or `audit restart`, Explore restates the owner's goal and stops before any research, then runs one round for each answer from the owner until `lock`, intake gives each item of the input one outcome and offers a chip for each open one, and the deep path reconciles earlier reviews, compares the design space with the `best-api` lens, ranks a named scope's next steps by comparing the scope with other editors and writes one Stop, Pursue or Defer into the review page's front matter. Load `pstack:poteto-mode` first, follow the steps of the pstack playbook the Verdict playbook `extends` with its deltas applied, and run `check-playbooks.mjs` as `AGENTS.md`'s How work runs says, because this entry skips poteto-mode's routing. Its Sessions section titles the session with the input or scope first and leaves later work to chips.
