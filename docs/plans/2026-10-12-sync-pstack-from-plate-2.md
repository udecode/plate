# Sync pstack from plate-2

Status: executed
Playbook: authoring-a-skill

## Brief

### What will change?

Plate now has the same 23 skill names as plate-2, with methods adapted to its
existing packages. The old parallel workflow is removed. PR 5162 is open and
ready for review.

### What could go wrong?

The fix review and audit used same-family fallbacks after Opus failed.
Routing trials checked answers rather than product actions. The source
inventory, workflow controls and full repository checks passed.

## Teach

Pstack supplies the work steps and review gates. Project skills tell an agent
how to apply those steps to Plate packages, UI, docs and proof.

Plate-2 has a smaller current workflow. Plate carried an older workflow and
uses different editor packages. This sync keeps the current methods that fit,
adapts the package instructions and removes unsupported commands.

## Scope

The user asked, "can you fully sync pstack to ../plate and open a PR.
adjust/cut things only related to plate-2, its ok if its a subset. that means
cut/move ALL the rest. same number of skills."

The correction was, "sync it from this plate-2 project instead of from
sync-pstack only". The source is the live checkout, with captured hashes in
`docs/development/pstack-source.json`. Plate's existing Vision and product
implementation stay outside this workflow migration.

## Main changes

- Match all 23 source skill names in both runtimes.
- Carry pstack helpers, rules, lifecycle, review gates and provenance.
- Adapt domain owners to actual Slate factories, packages and registry paths.
- Remove old workflow trees, live command routes and obsolete preset hooks.
- Check generation, links, locks, pins and local method dependencies in CI.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Domain methods | Keep the useful Plate subset | Carry unsupported engine methods | expand | big |
| Release delivery | Topic PRs into main, beta work into next | Direct release-branch pushes | direct | big |
| Historical evidence | Keep its provenance | Delete old plans and research | prune | small |
| Routing trial | Accept the scoped answer rehearsal (look) | Require action-level proof of future work | rerun | big |
| Consumer templates | Update their source preset | Hand-edit generated app output | generated | small |

## Steps

- [x] Use the platform skill-authoring guidance. Proof: `/Users/zbeyens/.agents/skills/writing-for-agents/SKILL.md` and `/Users/zbeyens/.agents/skills/writing-for-agents/SKILL-MECHANICS.md` read in this run.
- [x] Validate the skill: frontmatter has name and description, referenced files exist, cross-skill links resolve. Proof: `pnpm check:workflow`.
- [x] Test cases if structural. Skip if subjective. Proof: `docs/plans/artifacts/sync-pstack-plate/generation-final-a1.log`, `docs/plans/artifacts/sync-pstack-plate/workflow-controls-final-a2.log` and `docs/plans/artifacts/sync-pstack-plate/paired-routing-grades.json`; the partial answer rehearsal is accepted under the Routing trial default.
- [x] Run Opening a PR. Proof: commit `5325766cfa` and https://github.com/udecode/plate/pull/5162, read back as ready into main.
- [x] "fully sync pstack to ../plate". Proof: `docs/development/pstack-source.json`, `docs/development/pstack-sync.md` and `pnpm check:workflow`.
- [x] "cut/move ALL the rest". Proof: `docs/development/pstack-source.json`, `docs/development/pstack-sync.md` and `docs/plans/artifacts/sync-pstack-plate/additional-controls-a2.log`.
- [x] "same number of skills". Proof: `pnpm check:workflow` verifies exact 23-name equality in both runtimes.
- [x] "sync it from this plate-2 project". Proof: `docs/development/pstack-source.json` and `pnpm check:workflow` preserve source fingerprints and installed bytes.
- [x] Run writing passes and configured diff review. Proof: `09554dc34f899c4e28a24836ab91463022051640`, the decision log's two panel rounds and `docs/plans/artifacts/sync-pstack-plate/review-warnings-a1.log`. The fix review is same-family because Opus timed out.
- [x] Run the final lint and acceptance checks. Proof: final command logs and `pnpm check`.
- [x] Review the decision trail and reflect. Proof: `docs/plans/artifacts/sync-pstack-plate/trail_fallback-reply.txt`, `docs/plans/artifacts/sync-pstack-plate/reflect_final-reply.txt` and the decision log.
- [x] Keep replies in English. Proof: `docs/plans/artifacts/sync-pstack-plate/trail-transcript-final.jsonl` and the English close and PR body.

- [x] "open a PR". Proof: https://github.com/udecode/plate/pull/5162.
- [x] "adjust/cut things only related to plate-2, its ok if its a subset". Proof: `docs/development/pstack-sync.md`, `docs/development/pstack-omissions.json` and unchanged product sources and Vision.

## Demo

1. Open https://github.com/udecode/plate/pull/5162 to review the complete migration into main.
2. Read `docs/development/pstack-sync.md` for the retained methods and omitted support files.

## Proof

Workflow inventory, exact generated mirrors, local link resolution, plugin
pin, helper syntax, generation idempotence, negative controls and fresh
read-only routing trials. Product runtime behavior is unchanged and is not
claimed from workflow trials. Root `pnpm check` remains the PR gate.

## Open work

- Optional Claude setup for future Opus reviews. Run `claude` from `/Users/zbeyens/git/plate` and accept the repository trust dialog. owner: Zbeyens. stop: the owner accepts trust or chooses to retain native reviews. Tracked here. The current audit uses the allowed native fallback.

## Close

Plate now has the same 23 skill names as the captured live plate-2 project.
Eight installed skill trees retain their source bytes. Fifteen local rule
owners provide the Plate adaptations. Extra old skills, discovery links,
controllers and live command routes are removed. Historical evidence remains.
Template source inputs and their upgrade cleanup are updated. No product
package, editor behavior or public API changed.

Final root checks passed after the review repairs. Workflow checks prove exact
names, generated mirrors, referenced resources, installed bytes and pins.
Repeat generation preserves bytes and links. Controls reject missing links,
stale generated text, edited installed skills and install-repaired CI drift.
Both existing template variants upgrade. The playground control also proves
that a custom project rule survives. The Beta publisher self-test uses dry
runs and fake external services. Live publication was not performed.

The initial diff review answered on Opus, Astra and Sol. The fix review answered
on Astra and Sol, with a separate native Sol reader. Opus returned no answer. Its bounded rerun and audit exited 143 after an
untrusted-workspace warning, so the fix review and audit are same-family. No critical finding remains. The audit
search and fresh-video-directory repairs passed their failing controls.

Routing rehearsals are partial answer-level evidence. They do not prove full
skill loads or product actions. This narrower proof was accepted under the
Routing trial default. The requested sync is also backed by source inventory,
byte checks, generated-output controls and diff review.

The first review packet accidentally included ignored personal settings.
The corrected packet and delivered files exclude them. This was a review
packet error, not a checkout change.

The decision-trail audit confirmed the source, control and check claims.
It requested a saved native fix-review reply and precise Opus wording. The
reply is now extracted directly from the chat transcript and cited in the
decision log. The wording above records the actual failure.

Current checklist counts are 9 done, 1 accepted partial and 2 open, totaling 12.
PR delivery and the language constraint close after their results exist. There are no skipped or blocked checklist items.

### Attention

Reviewed by gpt-6.1-sol, same-family fallback.

The evidence and availability flags are resolved. Claude repository trust
remains an optional owner setup action under Open work. The audit did not
re-review code, rerun checks or prove live publication.

### Reflection

Accepted: none. No shared helper or rule changed from this reflection.

Rejected: method preservation, saved replies and scoped trial claims already
have rules. The source correction supplied scope rather than missing external
context. These findings need no duplicate instructions.

Backlog, tracked here:

- Distinguish explicitly named ignored files from ignored descendants when freezing directories. owner: Zbeyens. stop: the owner takes or drops a shared freeze-helper change. This changes existing snapshot behavior and needs its own scope.
- Add optional session traces to smoke runs when proof needs observed skill loads. owner: Zbeyens. stop: the owner takes or drops trace capture with its storage and privacy choices. The current routing proof remains partial.
