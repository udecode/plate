# Editor audit


Handle $ARGUMENTS.

Own source-level architecture comparison between live Plite/Plate and one or
more editor repositories. Derive the inventory from source, account for every
relevant mechanism, and stop after a decision-ready audit. Do not implement
product code.

```text
selected local editor source trees
  + relevant live Plite/Plate mechanisms and debt
  -> symmetric atomic concept map
  -> strict source-to-contract matrix
  -> preferred bases + reference/proof adaptations + local debt
  -> material current/proposed change dossiers
  -> best-api and layer-plan routing
```

`research` discovers repositories and leads, the harvesters own test and issue
evidence, `best-api` decides call shapes and `plate-architecture` plans adoption.

## Value Rule

The target is the smallest truthful architecture that produces material present
value under Plite/Plate's correctness, typing, performance, collaboration,
serialization, React, DOM, browser and ownership laws. A change has material
value only when current evidence shows it fixes a correctness, ownership,
typing, performance, composition or DX/AX problem, removes meaningful
machinery, unlocks a current declared requirement, or replaces several costs
with one simpler owner. Reference sophistication, popularity, novelty and
completeness are not value.

Judge every concept on the fixed qualitative dimensions in
`.agents/rules/research/references/editor-audit-matrix.md`. Do not use aggregate
numeric scores. Use evidence-backed classifications, priorities, and explicit
reasons. Missing evidence is an open gate. A stronger base architecture does
not erase a stronger submechanism inside the losing architecture.

## Modes

Infer `audit` when omitted.

### `audit`

Accept one or many local repository paths. For `owner/repo`, inspect `../repo`
first and clone there only when missing, following root `AGENTS.md`.

Resolve:

- target: the named surface, or `full` only when explicitly requested;
- references: every supplied repository and its current local revision;
- local owners: Plite substrate, Plate product layer, or both;
- output: a narrow answer or exhaustive planning-only artifact.

For standalone `full`, `all`, `exhaustive`, or multiple-repository work, read
`.agents/rules/research/references/editor-audit-matrix.md` and use one plan under
`docs/plans/` as the durable audit artifact. Reuse a supervising plan and record
the comparison as one evidence packet. Write
one coverage manifest and strict concept matrix per reference under
`docs/plans/artifacts/<slug>/`. Each matrix is that reference's complete
comparison ledger; the plan summarizes decisions and links material dossiers.
Do not mirror the same decisions across several ledgers.

Before matrix work, inventory both sides:

- every atomic reference concept in scope;
- every relevant Plite/Plate public mechanism, lifecycle rule, proof topology,
  and material debt even when the reference has no equivalent;
- every prior P0-P3 candidate touching the target, recorded in the manifest
  before its current disposition is judged.

The manifest is the union, not a donor-only checklist. An overall Plite/Plate
win never permits skipping local-only machinery or reference submechanisms.

Before reading a durable reference audit, require a clean reference checkout
and capture `git rev-parse HEAD`. Verify the same `HEAD` again before recording
completion. If it moved, audit the intervening diff before writing the commit
cursor. A commit hash cannot truthfully describe uncommitted reference source.

For each initial durable audit, run the full `research harvest` inventory
and the applicable `issue-harvester --refresh-only` pass, or record that lane as
`null` and stale with an exact reason. Never initialize an unrun lane as
current. Reconcile every portable harvested invariant in `Proof adaptation` as
`adapt`, `keep-local`, `reject`, `defer`, or `not-applicable`; freshness counts
alone are not architecture extraction.

For a narrow named mechanism, answer in chat unless the user asks for a durable
artifact.

### `sync`

`sync` updates an existing audit from its last verified source commits.

- `sync <audit-id|artifact-path>` updates named audits.
- `sync all`, or bare `sync`, updates every registered audit.

For each reference:

1. Read the registered source, local path, audited commit, audit artifact, test
   harvest cursor, issue refresh cursor, branch, and upstream.
2. Refuse to pull over uncommitted reference-repository changes. Do not reset,
   stash, switch branches, or discard them.
3. Require the checked-out branch and upstream to match the registry, then fetch
   and fast-forward with `git pull --ff-only`. Do not switch branches.
   Detached heads, missing/mismatched upstreams, non-fast-forward histories, or
   an audited commit that is no longer an ancestor require an explicit full
   re-audit or user correction.
4. If `HEAD` equals the audited commit, mark architecture current. Mark tests
   current only when `testHarvestCommit` also equals `HEAD`; otherwise resume
   the test lane from its own cursor or run a full harvest when it is `null`.
   Still refresh issues because `sync` explicitly requests current issue state.
5. Otherwise inspect
   `git diff --name-status <audited-commit>..HEAD`, changed declarations,
   exports, tests, package metadata, and relevant commit messages.
6. Re-audit every directly changed concept plus its affected dependencies,
   consumers, public contracts, serialization, proof, and deletion
   consequences. The git diff selects candidates; it is not permission to
   ignore unchanged dependents whose meaning changed.
7. Run `research harvest <repo> --since <test-harvest-commit>` for added,
   modified, renamed, and deleted test evidence. If that cursor is `null`, run
   the full harvester.
8. For GitHub-backed references, run
   `issue-harvester <owner/repo> --state all --refresh-only`. This refreshes
   compact issue state and adds changed/new rows without processing the entire
   unchecked queue. Record an exact skip reason for sources without a supported
   issue provider.
9. Update affected audit rows, rejected decisions, rankings, shapes, routes,
   coverage counts, proof dispositions, local-only concepts, and prior-candidate
   dispositions. Rerun strict matrix validation over every concept, not only
   the changed rows. Never silently remove or downgrade an earlier P0-P3
   candidate; `reaffirm`, `supersede`, or `reject` it with current evidence.
10. Advance each cursor only after its owning proof succeeds. A failed or
    interrupted architecture pass never advances `auditedCommit`; a failed test
    or issue pass remains visibly stale through its independent cursor.

When several audits share one repository, pull once and compute each audit's
own `<auditedCommit>..HEAD` range. Never collapse different target audits into
one cursor. Continue independent audits after one fails and report the failed
cursor without advancing it.

An audit without a passing current strict matrix is `legacy-incomplete`. Its sync may
refresh provenance and independent test/issue lanes, but it may not repeat or
strengthen a global superiority claim until every manifest concept has an exact
ungrouped matrix row and every prior candidate is reconciled.

Finish with a status table:

| Audit | Repository | Audited commit | Current head | Architecture | Matrix | Tests | Issues | Overall |
| ----- | ---------- | -------------- | ------------ | ------------ | ------ | ----- | ------ | ------- |

`current` means verified against the fetched local head. Without a successful
fetch, remote freshness is `unknown`, not current.

## Audit Registry

Create `docs/editor-audits/index.json` on the first durable audit. Do not create
an empty registry before a real audit exists.

Use schema version `1`:

```json
{
  "version": 1,
  "audits": [
    {
      "id": "stable-audit-id",
      "artifactVersion": 1,
      "target": "named-surface-or-full",
      "artifact": "docs/plans/...",
      "references": [
        {
          "repoKey": "host/owner/repo",
          "source": "https://host/owner/repo.git",
          "localPath": "../repo",
          "branch": "main",
          "upstream": "origin/main",
          "auditedCommit": "full-commit-sha",
          "auditedAt": "ISO-8601",
          "conceptManifest": "docs/plans/artifacts/.../source-manifest.json",
          "conceptMatrix": "docs/plans/artifacts/.../concept-matrix.md",
          "conceptMatrixValidatedAt": "ISO-8601 or null",
          "testHarvestCommit": "full-commit-sha or null",
          "issueHarvestCheckedAt": "ISO-8601 or null",
          "issueLedger": "docs/editor-issue-harvester/... or null"
        }
      ]
    }
  ]
}
```

Use full immutable commit hashes. A target-specific audit owns its own
reference cursors even when another audit uses the same repository. Derive
`repoKey` from the normalized remote URL; for a local-only repository, use a
stable canonical-path key and record `source` as `null`.

The registry is compact resume state, not the concept ledger. A reference
missing `conceptManifest`, `conceptMatrix`, or a validation timestamp is
`legacy-incomplete`. Its linked matrix owns complete 1:1 evidence; the artifact
owns conclusions and material dossiers. Update registry and artifacts together
at the final successful checkpoint; never write a newer commit merely because
a pull succeeded.

## Source Authority

Current source is authoritative; earlier plans, comparison tables, docs and
completion reports are leads. Map every reference repository's source, tests,
public types and export graph, and the live Plite and Plate owners, callers,
tests and proof surfaces, before reading local plans, audit dossiers or prior
P0-P3 candidates. Do not substitute web summaries for local source; use
official docs only when the checkout cannot settle a public contract.

Independent mapping prevents an old proposal from dictating the answer. It
does not permit erasing the proposal. After mapping, search every prior durable
audit touching the target and reconcile each candidate as `reaffirm`,
`supersede`, or `reject` with current source evidence.

## Atomic Concept Inventory

Derive a symmetric inventory from source. Do not begin from a generic editor
checklist, a favored reference API, or only the reference repository.

An atomic concept is one independently judgeable:

- invariant or semantic rule;
- data representation or identity model;
- public API or extension point;
- internal algorithm, mapping, fitting, correction, or composition rule;
- configuration, compilation, precedence, caching, or lifecycle rule;
- transaction, selection, history, collaboration, codec, DOM, React, rendering,
  persistence, or failure-isolation responsibility;
- ownership boundary, performance characteristic, or proof obligation.

One concept may span many files or repositories. One file may contain many
concepts. Trivial forwarding helpers, barrels, fixtures, and mechanical wrappers
must appear in the coverage manifest, but they do not earn independent decision
rows unless they own semantics, lifecycle, performance, or a public contract.
If one row would need different preferred bases, reference adaptations, local
debt dispositions, proof adaptations, or verdicts, split it in the manifest.
Matrix IDs must be exact and ungrouped.

Use the manifest schema in `references/editor-audit-matrix.md`. Allowed origins are
`reference`, `Plite`, `Plate`, `Plite/Plate`, and `shared`. `priorCandidates`
is required and may be empty. Each concept appears exactly once even when
several source units contribute evidence.

Build a coverage manifest for each repository:

| Source unit | Relevant declarations | Concept IDs | Exclusion |
| ----------- | --------------------: | ----------- | --------- |

Map every relevant package, module, file, public export, top-level declaration,
and meaningful private mechanism to concept IDs or an exact exclusion. Follow
the target's complete dependency graph through representation, semantics,
runtime, consumers, integrations, proof, and deletion consequences.

Exhaustive means zero unexplained relevant units. If the manifest cannot close,
state the exact gap instead of calling the audit exhaustive.

## Comparison

For every atomic concept, record independent evidence from each supplied
reference and from current Plite/Plate. Follow
`.agents/rules/research/references/editor-audit-matrix.md`: one row per exact
manifest ID, separate `exact`, `partial`, `absent`, or `not-applicable`
mappings for the reference, Plite, and Plate, and the same six qualitative
dimensions for every concept.

The reference's Mapping contract, Qualitative comparison, Base and extraction
decisions and Prior candidates sections define each row's mappings (`exact` is
a proved contract match, not a nearby owner), comparison classification,
preferred base, reference adaptation, local debt, proof adaptation,
prior-candidate dispositions and local verdict. Every mapping and dimension
cites an exact source symbol or durable evidence link.

Do not infer superiority from cleaner-looking code with a narrower product
surface. Test whether the mechanism survives applicable local constraints such
as JSON-native data, structural typing, multi-root documents, Plate
extensibility, collaboration, React, DOM/input, browser behavior, persistence,
and transactional reconfiguration.

Do not reuse canned qualitative profiles across distinct concepts. Each of the
six cells must explain that concept's actual mechanism with source evidence.
Replacing a concept name inside generic winner prose is not analysis.

Preferred base answers “what architecture should remain underneath?” The
adaptation and debt fields answer “what should still change inside that base?”
A local base can win while a reference ownership rule, compiler step, failure
boundary, or proof invariant is still worth adapting.

Run a second pass over every reference win below the feature row. A donor may
lose the overall capability comparison while still having a better reusable
architecture pattern: feature-local declarations, compilation, precedence,
caching, failure isolation, lifecycle, or proof topology. For each such
pattern, show the current local owner graph and its deletion cone, then record
`adapt`, `reject`, or `defer` independently. A 1:1 feature score is incomplete
if it never asks whether the donor removes a central registry or reverses an
ownership dependency.

A global superiority claim follows the reference's Claim gate.

For each suspicious local shape, answer:

- Is this the correct owner, or does public API expose an internal detail?
- Can the owner derive caller inputs, and are concepts wrongly split or unified?
- Is configuration permissive, implicit, order-dependent, or non-transactional?
- Does the shape optimize implementation convenience over caller DX/AX or hide
  missing substrate functionality in Plate glue?
- Does it remain sound for large documents, collaboration, history,
  serialization, and reconfiguration?
- What existing API, helper, loop, bridge, or test disappears under the right
  owner?
- What is the maximum local deletion cone even when no reference editor models
  it? Test removing the namespace, plugin, abstraction, layer, or package and
  routing its real jobs through the nearest canonical owner. The donor and the
  named audit surface are evidence, not scope limits.
- What does the reference do better inside this concept even if Plite/Plate is
  the preferred base?
- Which harvested reference tests encode portable behavior or proof topology,
  and what is each disposition?
- Which prior candidate already named this pressure, and is it reaffirmed,
  superseded, or rejected?

## Material Candidate Gate

Rank every accepted change `P0`-`P3` with `best-api`'s priority meaning, under
the reference's Material coherence rules. A reference win rejected after local
constraints names the constraint and evidence.

Every `P0`-`P3` candidate must include:

1. Exact current and proposed public call shapes when public.
2. Exact current and proposed internal representation and owner.
3. Material value and the current job it improves.
4. What becomes hidden, deleted, merged, or moved.
5. Plite/Plate adoption impact and dependency ordering.
6. Required correctness, type, property/fuzz, browser, and benchmark proof.
7. Primary planning owner: `best-api` or `plate-architecture`.
8. Dependent planning owner when the change crosses layers.

Use realistic TypeScript with public imports. Do not present pseudocode as a
final public proposal.

Apply `best-api` to every unresolved public shape. Do not reproduce its taste
rubric here. If architecture evidence changes reusable API doctrine, run
`best-api repair` before finalizing the candidate.

## Output

Lead with:

1. strongest materially justified local hard cut and its surviving authority;
2. local mechanisms that have hard-law or independent-current-job evidence to
   keep;
3. materially valuable changes ranked by priority and architectural value;
4. rejected reference machinery and why;
5. unresolved evidence gates.

Use the canonical strict concept matrix from
`.agents/rules/research/references/editor-audit-matrix.md`. Keep each reference's
evidence and classification distinct. Do not group IDs or average conflicting
architectures into one score. Put material value, shapes, deletion, owners,
adoption, and proof in dossiers linked from the applicable matrix rows.

Lead every matrix conclusion with exact counts and IDs for origins,
classifications, preferred bases, reference adaptations, local debt, proof
adaptations, prior-candidate dispositions, verdicts, and priorities. Counts
without the IDs are not traceable.

Then provide ideal accepted shapes, internal invariants, ownership changes,
adoption/deletion impact, a dependency-ordered packet list, per-packet skill
routing, explicit keep/reject/defer decisions, and coverage closure counts.

The packet list is a planning handoff, not an implementation plan. After
standalone user acceptance, or when a primary supervisor completes its own
required target challenge, invoke the named layer plan privately for each
packet or coherent packet group. The supervisor may finish planning without
execution authority; only product/source implementation requires it.
Cross-layer work has one primary plan owner and one explicit dependent owner;
never duplicate the same plan in both or return a worker-invocation chore to
the user.

## Verification

Use `.agents/rules/research/scripts/validate-concept-matrix.mjs` for strict
matrix closure.

For every reference, record and run the equivalent of:

```bash
test -z "$(git -C <repo> status --porcelain)"
git -C <repo> rev-parse HEAD
git -C <repo> branch --show-current
git -C <repo> rev-parse --abbrev-ref --symbolic-full-name '@{upstream}'
git -C <repo> merge-base --is-ancestor <audited-commit> HEAD
git -C <repo> diff --name-status --find-renames <audited-commit>..HEAD
```

Validate registry syntax and artifact links:

```bash
node -e "JSON.parse(require('node:fs').readFileSync('docs/editor-audits/index.json', 'utf8'))"
test -f <audit-artifact>
node .agents/rules/research/scripts/validate-concept-matrix.mjs \
  --manifest <coverage-manifest.json> \
  --ledger <concept-matrix.md>
```

Also run the focused verification required by every changed audit row and the
owning test/issue harvester checks. Record exact counts for source units,
concepts, exclusions, material candidates, and unresolved rows.

## Closure

The audit is complete when the validator passes, every relevant source unit is
mapped or excluded, every prior P0-P3 candidate and harvested portable
invariant has a disposition, every material candidate has concrete shapes,
deletion, adoption, dependencies, proof and planning owners, repository
provenance and full verified commits are recorded, no row stays unresolved
except evidence-backed defers, and the plan records expected, reviewed and
excluded counts.

Standalone mode returns the planning-only audit. A delegating `plate-architecture`
run receives the evidence and packet list and continues into layer planning.
Editor Audit never implements or opens a PR.
