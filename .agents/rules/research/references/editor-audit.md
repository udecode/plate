# Editor audit

Source-level architecture comparison between live Plite/Plate and 1+ editor repos. Derive inventory from source, account for every mechanism, stop at a decision-ready audit (never implement code or open a PR). Judge on the 6 qualitative dimensions in `.agents/rules/research/scripts/validate-concept-matrix.mjs` (no aggregate numeric scores; missing evidence = open gate; stronger base never erases a losing architecture's stronger submechanism).

## Modes (`audit` default, `sync`)

### `audit`

Accept local paths or `owner/repo` (`../repo`; clone only if missing). Resolve target (named surface, or explicit `full`), references + revisions, local owners (Plite, Plate, or both), and output (chat for narrow mechanisms unless durable artifact requested).

Standalone `full`, `all`, `exhaustive`, or multi-repo audits follow [Strict Source-to-Contract Matrix](#strict-source-to-contract-matrix):

- One plan in `docs/plans/` (or reuse supervising plan as one evidence packet) summarizes decisions and links dossiers; never mirror decisions across ledgers.
- One coverage manifest + strict concept matrix per reference under `docs/editor-audits/<audit-id>/`.
- Clean reference checkout; capture `git rev-parse HEAD` before reading and before completion (if moved, audit intervening diff before writing cursor).
- Pre-matrix union manifest: atomic ref concepts in scope, relevant Plite/Plate mechanisms/lifecycle/proof/debt (even without ref equivalent), and prior `P0-P3` candidates touching target.
- Initial durable audit runs full `research harvest` + applicable `issue-harvester --refresh-only` (or records unrun lane `null`/stale with exact reason; never mark unrun lanes current).

### `sync`

`sync <audit-id|artifact-path>` updates named audits; `sync all` or bare `sync` updates all registered audits. Per reference:

1. Read registry fields (`source`, `localPath`, cursors, `artifact`, `branch`, `upstream`).
2. Refuse uncommitted changes; never reset, stash, switch branches, or discard.
3. Require matching branch/upstream, then `git pull --ff-only` without switching (detached head, mismatched/missing upstream, non-ff, or non-ancestor `auditedCommit` require explicit full re-audit or user correction).
4. If `HEAD === auditedCommit`, mark architecture `current` (tests `current` only if `testHarvestCommit === HEAD`, else step 6) and refresh issues; else inspect `git diff --name-status <auditedCommit>..HEAD` + changed declarations/exports/tests/metadata/commits.
5. Re-audit directly changed concepts + affected dependents (consumers, contracts, serialization, proof, deletion).
6. Run `research harvest <repo> --since <testHarvestCommit>` (or full if `null`) and, for GitHub refs, `issue-harvester <owner/repo> --state all --refresh-only` (or log skip reason).
7. Update affected rows, rankings, shapes, routes, counts, dispositions, local-only concepts, prior `P0-P3` candidates; rerun full strict matrix validation.
8. Advance each cursor (`auditedCommit`, `testHarvestCommit`, `issueHarvestCheckedAt`) only after its owning proof passes.

Shared repo across audits: pull once, compute each `<auditedCommit>..HEAD`, never collapse cursors, continue independent audits on failure. Audits lacking a passing current strict matrix (or missing `conceptManifest`/`conceptMatrix`/`conceptMatrixValidatedAt`) are `legacy-incomplete`: `sync` may refresh provenance/test/issue lanes, never repeat/strengthen a global superiority claim until every manifest concept has an exact ungrouped row and every prior candidate is reconciled.

Status table (`current` requires successful fetch; else `unknown`): `| Audit | Repository | Audited commit | Current head | Architecture | Matrix | Tests | Issues | Overall |`.

## Audit Registry (`docs/editor-audits/index.json`)

Create on first durable audit (never empty), schema `1`, full immutable SHAs, per-target cursors, `repoKey` from normalized remote URL (local-only: canonical-path key, `"source": null`). Update registry and artifacts together at final checkpoint.

```json
{"version":1,"audits":[{"id":"id","artifactVersion":1,"target":"surface|full","artifact":"docs/plans/...","references":[{"repoKey":"host/owner/repo","source":"url|null","localPath":"../repo","branch":"main","upstream":"origin/main","auditedCommit":"sha","auditedAt":"ISO","conceptManifest":"docs/editor-audits/<id>/source-manifest.json","conceptMatrix":"docs/editor-audits/<id>/concept-matrix.md","conceptMatrixValidatedAt":"ISO|null","testHarvestCommit":"sha|null","issueHarvestCheckedAt":"ISO|null","issueLedger":"docs/editor-issue-harvester/...|null"}]}]}
```

## Source Authority and Atomic Concept Inventory

Map each reference's source/tests/types/exports and live Plite/Plate owners/callers/tests/proof before reading prior plans, dossiers, or `P0-P3` candidates (official docs only when checkout cannot settle a contract). Then run `node tooling/scripts/review-ledger.mjs lookup <scope-or-feature>` and reconcile every prior durable audit candidate touching target.

Atomic concept: one independently judgeable invariant/semantic rule; data/identity model; public API/extension point; internal algorithm/mapping/correction/composition; config/compilation/precedence/caching/lifecycle; transaction/selection/history/collab/codec/DOM/React/rendering/persistence/failure-isolation job; or ownership/perf/proof obligation. Trivial wrappers/barrels/fixtures enter the coverage manifest without independent rows unless owning semantics, lifecycle, perf, or a public contract. Split rows needing different bases/adaptations/debt/verdicts; IDs must be exact and ungrouped.

Manifest schema (`validate-concept-matrix.mjs`): origins `reference`, `Plite`, `Plate`, `Plite/Plate`, `shared`; `priorCandidates` required (may be empty); each concept once. Coverage manifest (`| Source unit | Relevant declarations | Concept IDs | Exclusion |`) maps every relevant unit across representation, semantics, runtime, consumers, integrations, proof, deletion (exhaustive = 0 unexplained units; state gaps).

## Comparison and Material Candidate Gate

Judge against local constraints: JSON-native data, structural typing, multi-root docs, Plate extensibility, collab, React, DOM/input, browser behavior, persistence, transactional reconfiguration. Never infer superiority from cleaner code on a narrower surface or reuse canned six-cell prose.

Second pass over ref wins below feature row (feature-local declarations, compilation, precedence, caching, failure isolation, lifecycle, proof topology): show local owner graph + deletion cone, decide `adapt`/`reject`/`defer` independently.

Audit suspicious local shapes: wrong owner / leaked internals / Plate glue hiding missing substrate; derivable caller inputs or mis-split/unified concepts; permissive/implicit/order-dependent/non-transactional config; soundness under large docs/collab/history/serialization/reconfiguration; max local deletion cone (even without donor: namespace/plugin/abstraction/helper/bridge/loop/layer/package/test removed via canonical owner); ref submechanism wins inside local-base wins; portable harvested tests; matching prior candidates.

Rank accepted changes `P0-P3` per `.agents/playbooks/references/architecture.md#priority` (rejected ref wins cite constraint + evidence). Every `P0-P3` candidate states: (1) current + proposed public call shapes (realistic TS with public imports, no pseudocode); (2) current + proposed internal representation/owner; (3) material value + job improved; (4) what is hidden/deleted/merged/moved; (5) Plite/Plate adoption impact + dependency order; (6) correctness, type, property/fuzz, browser, benchmark proof; (7) primary planning owner (`best-api` or Plan playbook) + dependent owner if cross-layer.

## Output, Verification, and Closure

Lead with: (1) strongest materially justified local hard cut + surviving authority; (2) kept local mechanisms with hard-law/independent-job evidence; (3) ranked material changes; (4) rejected ref machinery + why; (5) unresolved gates. Keep refs distinct, link dossiers from matrix rows, lead matrix conclusions with exact counts + IDs across all columns, then accepted shapes, invariants, ownership/adoption/deletion impact, dependency-ordered packets + skill routing, keep/reject/defer decisions, coverage counts.

```bash
test -z "$(git -C <repo> status --porcelain)" && git -C <repo> rev-parse HEAD && git -C <repo> branch --show-current
git -C <repo> rev-parse --abbrev-ref --symbolic-full-name '@{upstream}'
git -C <repo> merge-base --is-ancestor <audited-commit> HEAD && git -C <repo> diff --name-status --find-renames <audited-commit>..HEAD
node -e "JSON.parse(require('node:fs').readFileSync('docs/editor-audits/index.json', 'utf8'))" && test -f <audit-artifact>
node .agents/rules/research/scripts/validate-concept-matrix.mjs --manifest <coverage-manifest.json> --ledger <concept-matrix.md>
```

Run focused checks for changed rows + test/issue harvester checks; record counts (source units, concepts, exclusions, material candidates, unresolved rows). Closure: passing validator, all units mapped/excluded, all prior `P0-P3` candidates and harvested invariants disposed, complete dossiers, verified SHAs, no unresolved rows except evidence-backed defers, expected/reviewed/excluded counts in plan. Standalone = planning-only; delegating Plan playbook continues into layer planning.

## Strict Source-to-Contract Matrix

Required for every `full`/`all`/`exhaustive` audit and before any overall Plite/Plate superiority claim.

- **Mappings** (Reference, Plite, Plate): `exact` (complete contract), `partial` (`covers`, `missing`, `proof` explicit), `absent` (scan found no owner), `not-applicable` (other layer):
  ```text
  exact — public=`a.ts:1`; owner=`o.ts:2`; consumers=`u.ts:3`; lifecycle=`l.ts:4`; proof=`o.test.ts:5` — ok
  partial — covers=`o.ts:2`; missing=[gap](docs/plans/a.md#g); proof=`o.test.ts:5` — gap
  absent — [scan](docs/plans/a.md#s) none
  not-applicable — `docs/vision/o.md:1` other layer
  ```
- **6 dimensions & Classification:** `Correctness`, `API/types`, `Data/collab`, `Ownership/lifecycle`, `Runtime/perf`, `Proof/host`. Values: `reference stronger`, `Plite stronger`, `Plate stronger`, `Plite/Plate stack stronger`, `equivalent`, `different tradeoff`, `insufficient evidence` (+ `not-applicable` on dimensions), each with mechanism reason + citation.
- **Preferred base:** `reference`, `Plite`, `Plate`, `Plite/Plate stack`, `tie`, `different tradeoff`, `insufficient evidence`; agrees with `Classification` and has `exact`/`partial` mapping.
- **Pressure dispositions** (independent, cited; hybrids like local base + `adapt` + `material` debt -> `rearchitect`, `P1` expected): `Reference adaptation` / `Proof adaptation` = `adapt`, `keep-local`, `reject`, `defer`, `not-applicable` (`not-applicable` legal only when Reference mapping is `absent`/`not-applicable`; `Proof adaptation` reconciles `research harvest` invariants/proof topology, never "tests current"); `Local debt` = `material`, `non-material`, `none`, `insufficient evidence`.
- **Prior candidates:** reuse only on matching source/dep identity; never replace fresh comparison with prior verdicts. Reconcile every manifest candidate once (`<br>` between multiples; never downgrade/omit/rename):
  ```text
  `A3` reaffirm — [A3](docs/plans/p.md#a3) same debt
  `A4` supersede — [ev](docs/plans/a.md#a4) narrows to proof
  `A5` reject — [ev](docs/plans/a.md#a5) premise gone
  none — [s](docs/plans/a.md#s) no P0-P3 dossier
  ```
- **Canonical 20-column header** (fill every cell with the checkable forms above; hybrids like `Plite` base + `adapt` ref/proof + `material` debt -> `rearchitect` / `P1` are expected):
  ```markdown
  | ID | Concept | Origin | Reference mapping | Plite mapping | Plate mapping | Correctness | API/types | Data/collab | Ownership/lifecycle | Runtime/perf | Proof/host | Classification | Preferred base | Reference adaptation | Local debt | Proof adaptation | Prior candidates | Verdict | Priority |
  | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
  ```
- **Material coherence:** `Verdict` = `keep`, `steal`, `rearchitect`, `hard-cut`, `move`, `reject`, `defer` (+ reason); `Priority` = `P0`, `P1`, `P2`, `P3`, `` `—` ``. Any `adapt` (ref/proof) or `material` debt -> material verdict (`steal`, `rearchitect`, `hard-cut`, `move`) + `P0-P3`; material verdict -> `P0-P3`; non-material -> `` `—` `` (never hide value under `keep`); `insufficient evidence` debt -> `defer`; `reference stronger` -> `adapt` or evidence-backed `defer`; local winners still note ref advantage and materiality.
- **Claim gate:** global superiority claim requires (1) validator passes on full symmetric manifest; (2) all 20 columns complete; (3) every `insufficient evidence` row resolved or excluded from named scope; (4) exact counts + IDs for origins, classifications, preferred bases, adaptations, debt, prior candidates, verdicts, priorities; (5) named constraints + exceptions. Cross-reference claims require each matrix to pass independently. "Every Plite/Plate feature is superior" requires every row to prefer `Plite`, `Plate`, or `Plite/Plate stack` (one ref win/tie/tradeoff/unknown disproves it; adapted submechanisms and local debt stay material).
