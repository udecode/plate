# Plate skill redesign

Implement the strongest cohesive skill set for Plate and Plite. Preserve full
pstack methods and project-specific reasoning, procedures, examples, scripts,
templates, proof, and release safeguards. Remove competing orchestration and
rename-only entrypoints. Source edits and installation stay in this checkout.

Baseline: 48 local rules, 65 installed skills, branch `next` in `plate-2`.
The complete pre-change source, mirrors, templates and locks are retained in
[the baseline archive](artifacts/2026-09-05-plate-skills/baseline.tar.gz).

## Work

- [x] Frame. Inventory sources and freeze the complete baseline.
- [x] Fan out. Read every skill and its supporting method; audit domain,
  maintenance, and engineering ownership as separate slices.
- [x] Aggregate. Score coherent architecture alternatives, choose the strongest,
  and account for every existing skill and all upstream pstack skills.
- [x] Implement the selected design in owned sources. Install named shared
  skills from Dotai; regenerate both agent mirrors with `pnpm install`.
- [x] Verify preservation, routing, source/mirror parity and realistic task
  behavior. Correct observed defects and publish a local developer guide.
- [x] Report the final set, evidence, limits and remaining optional work.

## Selection rubric

Scores are engineering judgments, not measured productivity or model quality.
Score each option out of five on each criterion, then apply these weights:

| Criterion | Weight | Concrete question |
| --- | ---: | --- |
| Preservation | 30% | Can every useful existing and upstream method still be found and followed? |
| Ownership | 25% | Does each lifecycle and technical law have one authoritative owner? |
| Discovery | 20% | Can developers start ordinary work with one clear entrypoint? |
| Proof and authority | 15% | Do exact-case, package, browser and release claims retain their actual gates? |
| Maintenance | 10% | Are generic skills reused, local forks explicit and generated output reproducible? |

## Boundaries

Task owns ordinary engineering delivery; the audit will determine which local
workers and modes it needs. Poteto supplies full engineering methods. A plan is
a file; native goals, publication, messages, scheduling and other checkouts
require their actual authorization. No application repair is implied by a
workflow audit. Preserve protected package/vendor skills. Do not transplant
Ellie's clinical, Atlas, tracker, runtime or testing policies into Plate.

Shared source: `../dotai/skills`. Upstream reference:
`../plugins/pstack` at `93b00b89ef425a9c1bac0d0b317dfc49c930ac99`.
Adapt runtime/tool assumptions without shortening the upstream methods.

## Evidence

The artifact directory holds the frozen baseline, full owner accounting,
architecture scores, installation receipts and verification results. Record
actual behavioral observations separately from structural preservation checks.

Selected: one Task lifecycle, full pstack methods and distinct Plate/Plite
technical owners, scoring 97/100 under the rubric above. The implemented set
has 39 local skills and 57 shared/vendor skills. Ten local entrypoints were
absorbed or removed; Verify Plate was added. Sync Shadcn retains its full
method across six mode/policy references.

Read the [full scored audit](../development/agent-skill-audit.md),
[developer guide](../development/agent-skills.md) and
[verification index](artifacts/2026-09-05-plate-skills/verification/README.md).
Shared Autogoal needed a tested source repair to preserve project gate tables;
only Plate-2 received its named refresh. Protected vendors and existing
package attestations remain unchanged.

Complete. The corrected CLI recipe was replayed successfully; both trial
packets retain their original evidence after cleanup. No required local work
remains. Publication remains outside this request.
