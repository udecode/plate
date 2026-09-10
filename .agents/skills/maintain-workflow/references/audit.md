# Full workflow and model audits

Use this reference for an explicit broad audit. Ordinary maintenance stays scoped to the changed behavior.

## Establish evidence

Inventory the complete requested set: owned rules, skills, shared/vendor installs, generators, references, helpers, templates, and runtime model/tool mappings. Follow the source chain instead of treating generated mirrors as independent owners. Read each in-scope method fully, loading large sets in manageable batches.

Fetch the upstream revision and official model guidance relevant to the request. Record source URLs, revision/date, and any unavailable content. Keep preserved source, intentional runtime adaptations, and project-specific requirements distinguishable. Do not silently treat a pinned copy as current upstream.

For a model migration, compare advice against the actual runtime and current user instructions. The [GPT-6 Astra guidance](https://developers.openai.com/api/docs/guides/latest-model?model=gpt-6-astra), read September 5, 2026, highlights skill/instruction conflicts, unnecessary clarification, verbosity, and excessive testing as migration concerns. Refresh the requested model's official guidance when auditing; this example is not a permanent model selection or a prompt to copy wholesale.

## Choose the structure

Evaluate each skill as keep, reuse upstream, adapt, merge, split, or remove. Explain the surviving owner and the behavior preserved by each cut. A full upstream method can be the best choice even when it is long.

Trace representative requests through their actual loaded owners:

- A small edit: identify the minimum required instructions, actions, and proof.
- A feature or bug: verify the method reaches the real implementation and verification owners.
- A long autonomous task: verify who owns continuation, state, publication, and stopping.
- A verification-only request: confirm diagnosis does not silently become unauthorized repair.
- A workflow change: confirm shared-source maintenance stays within the task's destination scope.

Compare competing instructions, repeated steps, unconditional loads, and unnecessary gates. Count bytes or tokens only as supporting measurements with an explicit method; they do not establish elapsed time or quality. A split helps only if the relevant caller actually stops loading the unused material.

If the user asks for scores, name the criteria and score against evidence: intent preservation, upstream fidelity, ownership clarity, runtime feasibility, and required work. Do not call a proposal the winner based on a self-assigned total alone.

## Execute and check

Apply the selected design directly when implementation is authorized. Migrate callers before deleting owners. Preserve full domain mechanics and useful upstream recovery paths; do not retain competing instructions merely to avoid a large deletion.

Run affected validators and helper checks, then walk realistic requests through the resulting rules. Use observed regressions to refine the design. Keep model behavior inferred from instructions distinct from behavior demonstrated by a real invocation. Report unavailable independent/live proof without manufacturing a panel or adding another review gate.

Document the final owners, source provenance, meaningful remaining limits, and suggested downstream changes in the existing audit artifact. Avoid parallel plans that disagree about the final design.
