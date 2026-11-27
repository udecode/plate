---
description: Triage udecode/plate and udecode/plate-private issues/discussions, record triage state, check triage status, run fix domains, and record beta retests. Use for /triage, issue URLs, or `triage fix`/`retest`/`status`.
argument-hint: '[[plate-private]#<N> | label:<label> | status | fix [[plate-private]#<N> | <domain> | next] | retest [plate-private]#<N>]'
name: triage
metadata:
  skiller:
    source: .agents/rules/triage.mdc
---

# Triage

Handle $ARGUMENTS.

The argument is the request after the word `triage`, so `/triage fix next` is `triage fix next` and `/triage` alone is `triage`. Run the Triage playbook, `.agents/playbooks/triage.md`, in full. Its Entry points table maps the request to its scope and its end. Load `pstack:poteto-mode` first, follow the steps of the pstack playbook the Triage playbook `extends` with its deltas applied, and run `check-playbooks.mjs` as `AGENTS.md`'s How work runs says, because this entry skips poteto-mode's routing.
