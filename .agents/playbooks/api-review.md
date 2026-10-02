---
extends: investigation
when: Use it for "next", "what's next", "review <scope>", "again" after a verdict, or `best-api-review`.
---

# API review

The first two stops of the v2 loop pick the next ledger item and judge it. `best-api-review` holds the method and records the verdict; this playbook orders the work and says where to stop.

- **Before** "Route through the **how** skill": pick the item. For "next", or `best-api-review` with no target, run `node tooling/scripts/review-ledger.mjs next` and `node tooling/scripts/review-ledger.mjs status`. Answer with the unit, why it is open, its prior-work summary and the release counts, then stop. An unreviewed scope needs a review. A `pursue-unbound` scope has an execution or a completed plan that no ledger outcome binds, so read them first. Reconcile real adoption through `draft-execution` and `record`, and plan what is still missing. A `pursue-not-adopted` scope has no recorded work toward its verdict and needs a plan. `next` skips deferred scopes, which wait on the evidence their verdict names; `status` still counts them. To take a different item, name its scope. When the reviewed scope is not the one `next` returned, say so in the reply and in the record's `trigger`, and name any open scope it `dependsOn`.
- **Replace** "Produce the `how`-shaped output": for a named scope, run `best-api-review` on it. Lead the reply with the verdict and the current and proposed normal call site side by side, then the strongest reason, the lanes considered and the proof limits. Write, `validate` and `record` the review as that skill says before the reply, reconcile the decision page, then stop. A refused or blocked record follows that skill's Never leave a record pending.
- **Replace** "Apply the **unslop** skill to the reply": write the reply clean as drafted, with no separate pass, per `AGENTS.md`'s Writing passes rule. The review record and decision page get one `unslop` pass.
- A Pursue verdict, one that recommends a change, runs the Panel review on its record, the path `review-ledger.mjs record` prints (`docs/research/review-records/<id>.json`), before the reply; Stop and Defer verdicts skip it. A finding that changes the verdict runs "again", and its new record gets another round only after a round with an applied critical finding.
- After the verdict, the user's reply picks the next step. "again" runs `best-api-review` once more on the same scope and challenges the strongest alternative afresh; its record reaffirms or supersedes the last one. "interrogate" runs `pstack:interrogate` on the verdict's target with the configured seats. "plan" opens the Plan playbook. "next" starts over at the first stop.
