# Feature coverage pass

Use this complete method for product coverage, scoped to the selected inventory.
An instruction audit does not start a product sweep.

0. **Locate the target.** Find the verification skill to maintain: the project-local skill whose body has launch/drive sections and a feature map (usually `.agents/skills/verify-*/`). Several candidates → ask which one; none → stop and point at `/create-verification-skill` instead of inventing a target.

1. **Index hygiene.** Read the feature map README and glob its sibling files. Fix missing, extra, duplicate, or dead entries. Preserve a typed or generated inventory when it is already canonical; reconcile its generated view with the source owner.

2. **Source inspection.** Inspect every selected feature. Use bounded read-only subagents for independent groups when useful and supported; otherwise inspect sequentially. Each inspection explains "how does this user-facing feature work?" from source, flags likely doc drift with citations, and returns one concise live-verification recipe. Delegated source readers never drive the app or edit files. Return shape: feature summary / source entry points / likely drift or none / one recipe.

   For reference-product parity, migration fidelity, or a contradicted journey-completion claim, follow [journey coverage](journey-coverage.md). Discover retained capabilities from the complete reference journey and source contracts before accepting the existing inventory as complete. Carry its source-to-target proof mapping into reconciliation and the live pass; component receipts cannot close a missing journey.

   For features backed by an external provider, also follow [interface coverage](interface-coverage.md). Compare the accepted outcome, provider contract, actual callers and observed external result independently. A legacy implementation can omit a supported operation; a local save can omit the promised provider write.

   For OpenAPI 3, run `node scripts/check-interface-coverage.mjs --spec <openapi.json> --coverage <coverage.json> --tag '<exact API tag>' --require-reviewed` from this skill directory. The reference defines the register and the separate `--require-covered` product-proof check.

3. **Reconcile.** Every selected feature has a source-backed disposition. Merge overlapping recipes into as few app states as practical. Spot-check cited drift; don't re-prove clean claims. Sweep recent churn for user-facing surfaces missing from the map — require a concrete source path before calling one missing.

4. **Live pass.** Required even when source looks clean. The coordinator owns all driving; follow the verification skill's own launch model — one long-lived instance driven serially for servers and UIs, or a fresh isolated session per drive for short-lived CLIs (the skill's Launch section decides, not this one). Exercise every feature at least once, and hold three invariants the whole pass, whatever the failure: (1) never drive an instance you haven't health-checked since it last did something surprising — doctor before first drive, doctor on each fresh session where sessions are the unit, doctor again after any failed drive, and where doctor can't see the failure (a wedged UI state on a healthy process), reset to a known state or relaunch rather than hoping; (2) evidence captured so far survives every cleanup, checked at its named location, not assumed; (3) nothing a drive started outlives that drive's usefulness — failed-iteration residue is cleaned whether the session is stuck, exited, or shared (for a shared instance, clean the residue, not the instance). A doctor failure caused by skill drift is drift: fix it under edit scope and retry once — restart whatever the fix invalidated, nothing more — before calling the pass `blocked`. A feature that can't be reached is `verified-unreachable` only with the concrete prerequisite (auth, entitlement, OS, external state) and the route attempted; if the map omits that prerequisite, that's drift. Any harness fix from triage gets re-driven live before it ships. Final teardown happens after the last drive of the run — including those re-proofs — so nothing outlives the run (evidence stays, per the skill).

5. **Triage.** Wrong or missing user-POV description → doc drift, fix it. Working behavior the harness can't drive → harness gap, fix it; a harness fix follows the same helpers rule as generation (scripts executable, invocation documented in the skill body). App behavior that's actually broken → product gap; record it for the user, keep it out of this PR.

6. **Ship or stop.** For changed: re-read every changed source and reprove its behavior; create one PR only if publication is authorized, otherwise report the verified local corrections. For clean or blocked: no PR, report the outcome and the coverage honestly.

