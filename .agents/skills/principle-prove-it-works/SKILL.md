---
name: principle-prove-it-works
description: "Choose direct evidence when a completion claim relies on proxies, a self-report or an uncertain verifier."
---

# Prove It Works

Verify every task output by checking the real thing directly. Do not infer from proxies, self-reports, or "it compiles."

**Why:** Unverified work has unknown correctness. Indirect verification (file mtimes, output freshness, agent self-reports, cached screenshots) feels cheaper than direct observation. Acting on a wrong inference costs far more than checking the source.

**Pattern:** After completing any task, ask: "how do I prove this actually works?"

Check the real thing, not a proxy:
- Check process liveness directly, not indirectly through derived state
- Read the actual value, not a cached or derived representation
- When verification fails, suspect the observation method before suspecting the system

Code and features:
1. Build it (necessary but not sufficient)
2. Run it and exercise the actual feature path
3. Check the full chain: does data flow from input to output?
4. For integrations, test the full communication path end-to-end

Delegation: trust artifacts, not self-reports.
When verifying delegated work, inspect the actual output artifact (git diff, file contents, runtime behavior), not the delegate's summary. Agents report what they intended, not always what happened.

## Script the check when you can

Use an existing deterministic check when it proves the requested behavior. Write a new script only when it supplies otherwise missing evidence; direct runtime or artifact inspection can be sufficient. Keep the actual result visible and rerunnable where useful. A script comparing the old and new compiled output catches what a glance misses.

Keep the artifact visible for the human. Commit only when authorized and useful for later review; a separate **show-me-your-work** trail is conditional on its own trigger. Most work just needs it visible, not committed.
