---
extends: multi-phase-plan
when: Use it for a Pursue verdict, which continues into it, for "plan", `plan <goal>`, "design plan", or an architecture or API adoption plan.
---

# plan

- **Before** "Settle open questions by prototype before you write": read `VISION.md` and the architecture reference. For a public API plan, compare targets through `pstack:architect` and review the finished plan (reviews: api-plan).
- **Replace** "Copy the skeleton below into the plan file and fill every placeholder": use `plan-page` and write a bounded plan with outcome, scope, decisions, ordered steps and each step's proof. Load `verify` before choosing proof and `benchmark` for runtime cost. Name all package, UI, docs and release adoption owners.
- **Replace** "Run `node skills/poteto-mode/scripts/check-plan.mjs <plan.md>`": check readiness and render with the project plan helpers. No unresolved required proof may count as passed.
- **Replace** "Write under `/technical-writing` in full, then `/unslop`": use technical-writing as a reference and run one unslop pass on the plan.
- **In** "Hand back. Post the plan path": a plan-only request ends at its rendered page. An authorized build continues through the Build playbook.
