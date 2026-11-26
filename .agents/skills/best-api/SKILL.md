---
description: Design, review or repair a Plate or Plite public call shape with the Plate API lens.
argument-hint: '[design|review|repair] <API surface | diff | plan | correction>'
name: best-api
metadata:
  skiller:
    source: .agents/rules/best-api.mdc
---

# Best API

Handle $ARGUMENTS.

Own the public call-site decision. This is a taste and decision skill, not an implementation engine: it picks or judges a public call shape and leaves adoption to the Plan playbook. Read and cite `VISION.md` and `docs/vision/**` instead of restating them. Whether a direction earns any work at all belongs to `verdict` via the Verdict playbook.

## Modes

Infer the mode when omitted; do not invent modes owned by another skill.

- `design`: pick the smallest materially justified API for a new or redesigned surface and return one call-shape decision. When continuing into an API plan, the Plan playbook runs `pstack:architect` under the `api-plan` reviews row.
- `review`: judge a current or proposed API, diff, or plan, recommend the stronger target, and rank findings on `.agents/playbooks/references/architecture.md#priority` (P0 to P3), which Babysit's P0/P1 gate consumes.
- `repair`: update the rule's single owner, then fix every example, recipe, check, and doc teaching the rejected shape. See [Repair](#repair).

Record `design` or `review` verdicts in the active plan when one exists and return them in the reply per `.agents/pstack/rules/pages.md`.

## Inputs

Read only what can change the decision:

1. `VISION.md`, `docs/vision/common.md`, and the matching Plate or Plite vision file.
2. Prior art first (per `docs/vision/common.md` Redesign from First Principles): existing Plite components, Plate APIs, and reference editors; source-level editor comparisons consume `research audit` evidence.
3. Public types, exports, docs, representative call sites, and owning implementation for the target API.
4. Existing plans and compatibility constraints, only after the ideal target is clear on its own.

## Decide in two passes

### 1. The ideal target

Apply Redesign from First Principles and the Taste order in `docs/vision/common.md`.

Show concrete call sites with real public imports before naming abstractions: the normal path, one customization path, and an advanced path only when a real job needs it. If the normal path needs explanation before it reads naturally, the API is not done. Resolve each public noun's real import owner (root, feature entrypoint, registry, or app); a short call site with the wrong owner is still wrong.

**Hard-cut gate.** Treat every touched noun, namespace, plugin, abstraction, owner, layer, and package as a deletion candidate:

1. Test deleting it and routing its jobs through an existing canonical owner.
2. Test merging or inlining it if deletion leaves only private mechanics.
3. Look one owner above: check whether it is only an input adapter, view, query, policy, or payload of an existing authority.
4. Keep it only when a hard correctness, security, serialized-data, native-behavior, or runtime law requires the boundary, the user requires it, or source proves an independent current user job.
5. Select the largest deletion cone that keeps those laws and jobs. Name the surviving authority and any private adapter that earns its keep.

Call count, code size, tests, docs, compatibility, migration cost, and accepted plans never prove independent ownership; they only affect adoption order. A review that renames, moves, or wraps something that can disappear is incomplete. For harsh honest feedback, lead with the strongest materially justified cut even if it invalidates the current plan.

### 2. Reality check

Inspect current ownership, runtime truth, adoption, inference, and breaking cost while keeping the ideal target visible. Prefer a staged hard cut over a permanent hybrid. Never downgrade the target because existing code holds a registry, profile, lifecycle, builder, alias, or accepted plan.

Implementation difficulty gets no vote. If a compiler limit, declaration emit, compatibility constraint, or deadline blocks the ideal call site, keep the ideal recommendation, trace the blocker to its owning generic, layer, or package contract, and name the durable repair there. Reject casts, annotations, aliases, wrappers, markers, carriers, or parallel APIs built only to dodge that repair. Mark any temporary containment as debt with a deletion proof, never as the chosen API.

A target that adds, retains, or alters hot runtime work stays provisional until Benchmark's pre-acceptance probe passes. Call syntax settles without the probe only when live source proves competing shapes share one runtime law and retain no extra runtime machinery (or type-only/zero-runtime work records source-backed N/A).

### Bounded exhaustiveness

When a design or review touches colocation, inlining, helper survival, file topology, or "the full list", build the Audit manifest in `.agents/playbooks/references/architecture.md#audit` for the full bounded owner before recommending cleanup.

## Review questions

- Does the call site say directly what the user means, with honest import paths?
- Can an owner noun drop from a scoped API, nesting flatten into a domain verb, and inference remove a type, cast, helper, or duplicated contract?
- Is a basic call paying for an advanced option? Search examples and docs for repeated placeholder required options (such as identical IDs in every demo).
- Were invariant, parameter, substitutable capability, and app policy separated before proposing a plugin?
- Does the API stay coherent after three plausible future additions, and can an agent find the canonical path from types, JSDoc, and one example?
- What is the largest justified deletion cone, and which survivor has hard-law or independent-job proof?
- Am I picking a workaround because the durable owner repair is harder?
- When a guard's input widens, do unchanged existing and third-party guards still decide safely (fail closed rather than ignoring a new optional field)? Prefer a shape they already read or an opt-in.
- Do exported types match runtime acceptance exactly (no hidden runtime options behind narrower types, no required types the runtime treats as optional)?

Never preserve a weaker proposal because it is more elaborate, generic, observable, or already documented.

## Output

Lead with one recommendation, not a menu (for harsh honest feedback, open with the largest materially justified cut).

`design` and `review` return: verdict and deletion cone; ideal call sites with exact public imports; current source and caller evidence; why this model is simplest and truthful; rejected alternatives with retention proof per surviving concept; ownership by layer and preserved laws; pre-acceptance scale receipt or zero-runtime N/A; breaking/adoption impact; verification run; and next owner. `review` assigns P0 to P3 priority to each finding.

## Repair

Run `repair` whenever the user makes a reusable API correction, an accepted design sets or rejects a public API principle, or a change removes, renames, or reinterprets a reusable public API (report instead of editing in read-only requests). On a second occurrence of the same API mistake, run `/pstack:correct` first so a type, lint, or check blocks it before doctrine prose changes.

1. Verify the correction against live source and the rule's current owner. If it names a missing API or contradicts settled law, stop and run `verdict` on it.
2. Edit the rule's single owner: `docs/plans/topics/<scope>.md` for one scope, or `VISION.md` / `docs/vision/**` for multi-scope principles.
3. Sweep every teaching artifact with `node tooling/scripts/teaching-sweep.mjs <API name> [...]` (never a hand-written grep). It splits ASCII names into words, lists Chinese twins of English docs hits, and groups hits into live, generated, release notes, and history. Skip history (decision logs, review records, package changelogs, finished/superseded/cancelled plans). Fix live hits, regenerate generated outputs (or record failing base generators in plan Close), fix unshipped release notes, and read surrounding English and Chinese prose for paraphrases. Update only skills teaching or enforcing the changed contract, and link the Vision owner instead of duplicating doctrine.
4. Run `pnpm run prepare` and verify mirrors per `AGENTS.md`.
5. Forward-test the changed contract on a real API without seeding the answer.

Never call an API migration done while a skill still teaches the rejected shape. Never turn product-specific calls into universal rules, and put generic workflow rules in `AGENTS.md` or ustack, not here.

## Stop

Stop once one target wins and remaining questions are implementation or proof work; route those to the Plan playbook or owning package. Do not implement product API changes unless explicitly asked with the execution owner loaded.
