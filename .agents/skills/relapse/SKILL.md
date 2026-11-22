---
description: Find the review scopes whose fixes keep coming back, and card a redesign verdict for each one. It blames the product lines each fix changed, and counts per scope the fixes that rework an earlier fix since the scope's newest verdict or the landing of the plan that verdict pursued. Use for /relapse, the weekly look at last week's fixes, "which fixes keep coming back", or "what architecture would obviate these fixes".
argument-hint: '[<YYYY-MM-DD>]'
name: relapse
metadata:
  skiller:
    source: .agents/rules/relapse.mdc
---

# Relapse

Handle $ARGUMENTS.

Run one step of the relapse pass in the Verdict playbook, `.agents/playbooks/verdict.md`, as its Relapse pass section says. A date argument counts as of that day. Load `pstack:poteto-mode` first, follow the steps of the pstack playbook the Verdict playbook `extends` with its deltas applied, and run `check-playbooks.mjs` as `AGENTS.md`'s How work runs says, because this entry skips poteto-mode's routing.
