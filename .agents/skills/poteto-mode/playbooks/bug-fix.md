Read [Codex playbook execution](../references/codex-playbooks.md) for the tool, lifecycle, and proof mapping before executing this recipe. Preserve the steps below; record any unavailable capability or inapplicable step explicitly.

### Bug fix

**You own this task and its proof.** Investigate and implement directly, or delegate a bounded independent question when permitted and useful.

Be scientific. Every shipped line traces to runtime evidence. Belt-and-suspenders that "might help" is a hypothesis, not a fix; it does not ship. When evidence refutes a hypothesis, revert what it motivated. The smallest change the evidence justifies ships, nothing more. Same discipline for Perf, where the evidence is the trace.

1. Reproduce it yourself on the matching surface via the control skill (Non-negotiables). Don't hand the repro to the user. A debug or instrumentation protocol that says to ask the user does not override this; you drive the instrumented runtime. Ask the user only with a stated, specific reason the control surface cannot reach the target, and only after driving it as far as it goes. Won't reproduce directly, force it: synthesize the trigger, tighten conditions, or instrument until it fires. A bug you can't reproduce, you can't prove fixed.
2. Binary-search the cause. Form the candidate hypotheses, then rule them out until one survives. Use `how` where the subsystem or owner is unclear and **why** when regression history can distinguish hypotheses. Each pass, take the split that cuts the most remaining problem space, get runtime evidence, eliminate. When program state is unclear, add instrumentation or logging and read it as the code runs. Don't guess. Continue a stubborn hunt through the current task's supported execution method. Confirm the surviving *mechanism* with runtime evidence before exploring designs; a design grounded on a plausible-but-unconfirmed cause can be unanimously wrong while the real cause sits one subsystem over.
3. Plan the fix. Use `architect` only while consequential choices about public contract, ownership, lifetime, or data model remain unresolved. Implement the bounded fix or delegate it when permitted and useful, using your configured available bug-fix model (default `inherit-parent`); inspect the actual diff.
4. Verify on the same surface; the original repro now passes. "Inconclusive" or wrong-surface is not a pass; flag it. Unit tests show branch behavior, not bug absence.
5. Preserve failing-then-passing reproduction evidence. Follow the project's testing policy; use **tdd** when a valuable, cheap local regression test fits. The **sequence-verifiable-units** principle skill keeps the reproduction and fix independently checkable. Commits require actual authority and follow the user's staging/history policy; evidence does not require a failing commit in history.
6. Run **Opening a PR** only when publication is authorized; otherwise finish the local handoff.

When both `how` and `why` have independent unanswered questions, they may run in parallel if delegation is permitted. Otherwise apply the relevant method locally.

**Reply:** what was broken, root cause, fix, how you verified. Paste failing-then-passing repro output verbatim.
