# Correct GitHub deployment environments

Status: executed
Playbook: build

## Brief

### What will change?

Production now tracks main at platejs.org. Beta tracks next at beta.platejs.org. Both deployments passed, and docs-only pushes on both branches created no deployment records. The old shared environment is retired.

### What could go wrong?

The full local aggregate remains waived. The next proof update passed the required affected checks. Historical failures remain visible. Machine sizes and the GitHub build flag are unchanged.

## Teach

A GitHub environment groups deployment history and deployment credentials. The previous workflow reused one environment for both branches because it held the existing credential. That put successful production deployments in the wrong history.

The corrected workflow checks changed files before entering an environment. Only a required deployment starts a job in Production or Beta. Each environment keeps the same approved Vercel project credential and accepts its own branch.

## Main changes

- Split `.github/workflows/deploy.yml` into a changes job and a deployment job on both branches. Map main to Production and next to Beta, with their public URLs.
- Copy the existing VERCEL_TOKEN through destination-key encryption inside GitHub Actions. Only encrypted output leaves the runner. Keep Production's existing API_TOKEN_GITHUB secret.
- Limit Production to main and Beta to next. Copy the two public Vercel project variables. Preserve the unrelated Preview and copilot environments. Retire preview-next after credential transfer.
- Remove the temporary migration workflow after the two destination credentials exist. Retain historical deployment records.

## Authority and boundaries

The owner approved Production for main and Beta for next, then said "ok go update" the repository's environment settings. This continues the authorized main and beta deployment rollout. The earlier fast instruction and "Continue with focused checks and GitHub proof" still govern this correction. No paid machine change or new Vercel credential is needed.

The data shape is a branch decision followed by an environment-bound deployment job. A false build decision prevents the deployment job from starting. This removes the source of false deployment records.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Credential transfer | Reuse the approved project credential | Create a new credential | separate | detail |
| Legacy history | Keep old deployment history | Delete historical records | history | small |
| Proof | Continue focused checks and real GitHub builds | Retry the aggregate | aggregate | detail |

## Steps

- [x] Reread the accepted target and reproduce the wrong environment mapping. Source: `.github/workflows/deploy.yml` at `659c292560` and GitHub deployment `7176611625`.
- [x] Skip architect and delegated implementation. skip: accepted mapping and carried fast instruction.
- [x] Blocking first steps. Source: verified destination public-key support and existing environment metadata in `docs/plans/artifacts/deploy-environments/environments-before.json`.
- [x] Independent workstreams. skip: sequential credential transfer and workflow delivery share the deployment setup.
- [x] Shared mutable state. Source: per-branch concurrency in `.github/workflows/deploy.yml`; settings writes remain sequential.
- [x] Smallest safe decomposition. Source: `.github/workflows/migrate-deploy-environments.yml` and `.github/workflows/deploy.yml`.
- [x] Configure Production and Beta with branch restrictions and project variables. Proof: GitHub environment API readback on 2026-10-19; `docs/plans/artifacts/deploy-environments/target-public-keys.json`.
- [x] Transfer the existing credential encrypted and remove the temporary transfer workflow. Proof: https://github.com/udecode/plate/actions/runs/39277273271; encrypted values accepted by both destination secret APIs.
- [x] Update both branch workflows and run focused checks and writing passes. Proof: `docs/plans/artifacts/deploy-environments/deploy-actionlint-a1.log` and `docs/plans/artifacts/deploy-environments/skip-a1.log`; direct deslop, unslop and bro.
- [x] Prove a real successful deployment in Production and Beta with the correct URLs. Proof: `docs/plans/artifacts/deploy-environments/main-deployed-a1.log` and `docs/plans/artifacts/deploy-environments/beta-deployed-a1.log`.
- [x] Prove ignored pushes start no deployment job and create no deployment record. Proof: `docs/plans/artifacts/deploy-environments/main-ignored-a1.log` and `docs/plans/artifacts/deploy-environments/next-ignored-a1.log`.
- [x] "ok go update https://github.com/udecode/plate/settings/environments" Verify the final settings in Chrome and record delivery. Proof: `docs/plans/artifacts/deploy-environments/environments-final.png`; workflow commits `3fc58766af` on main and `3a94e39a85` on next.

## Completion Gates

| Gate | Evidence |
| --- | --- |
| Workflow syntax and branch decisions | deploy-actionlint-a1.log, next-actionlint-a1.log and skip-a1.log in the run directory |
| Credential and environment mapping | main-deployed-a1.log, beta-deployed-a1.log and environment-retired-a1.log in the run directory |
| No deployment for ignored pushes | main-ignored-a1.log and next-ignored-a1.log in the run directory |
| Required next documentation landing check | next-proof-land-a1.log; all 20 selected affected steps passed |
| Local aggregate | skip: owner's focused-check and GitHub-proof waiver |
| Independent reviews and no-comments | skip: carried fast instruction |
| Public API, package changeset and editor tests | skip: deployment tooling only |

## Verification

Acceptance uses the actual GitHub environment settings, workflow runs and deployment API records. A local syntax check cannot prove credential access or deployment history. The full local aggregate remains unpassed under the owner's waiver.

The actual deployment runs and GitHub deployment-status API agree:

| Branch | Source | Successful run | Environment | URL | Deployment |
| --- | --- | --- | --- | --- | --- |
| main | 3fc58766af | [39277478636](https://github.com/udecode/plate/actions/runs/39277478636) | Production | https://platejs.org | 7177801511 |
| next | 3a94e39a85 | [39277539428](https://github.com/udecode/plate/actions/runs/39277539428) | Beta | https://beta.platejs.org | 7177813216 |

Proof: `docs/plans/artifacts/deploy-environments/main-deployed-a1.log` and `docs/plans/artifacts/deploy-environments/beta-deployed-a1.log`. The completed watch commands also passed in main-deploy-run-a2.log and beta-deploy-run-a2.log. Earlier watch attempts hit HTTP 502 while the runs were still active. Those monitoring errors were separate from the successful deployment results.

The two docs-only push samples passed with a successful changes job, a skipped deployment job and zero deployment records for the exact SHA:

| Branch | Ignored push | Successful run | Deployment records |
| --- | --- | --- | --- |
| main | e9976ae3baf44b2c47e3acef6b92c97130f668d1 | [39279888140](https://github.com/udecode/plate/actions/runs/39279888140) | 0 |
| next | b54221655ac2e3c624b103c9d98f76e85911fc34 | [39284934650](https://github.com/udecode/plate/actions/runs/39284934650) | 0 |

Proof: `docs/plans/artifacts/deploy-environments/main-ignored-a1.log` and `docs/plans/artifacts/deploy-environments/next-ignored-a1.log`. The local decision probe covered seven scenarios using the actual decision block and ignore script. Its GitHub base lookup was a fixture. The two remote samples prove the real job guard and deployment-record behavior.

Both environment configurations passed API readback in `docs/plans/artifacts/deploy-environments/environment-retired-a1.log`. Production permits main; Beta permits next. The existing Vercel credential and project variables are present in both. Production still holds API_TOKEN_GITHUB. The old preview-next environment is retired, and legacy deployment record 7176611625 remains readable. Preview and copilot retain their original IDs.

The next proof update landed as b54221655a after all 20 selected steps of `pnpm check --affected` passed. That check skipped the unaffected app build and runtime test lanes. Proof: `docs/plans/artifacts/deploy-environments/next-proof-land-a1.log`. This does not claim a full aggregate pass.

The final documentation commits and pushed-ref readback are recorded in the [delivery receipt](./artifacts/deploy-environments/delivery-proof.json). Those documentation changes preserve the workflow bytes used by the deployment and ignored-push proofs.

## Demo

1. Open [GitHub environments](https://github.com/udecode/plate/settings/environments). Production accepts main; Beta accepts next. Both have the existing deployment credential and the two Vercel project variables.

   ![Final environment settings](./artifacts/deploy-environments/environments-final.png)

2. Open [Production deployments](https://github.com/udecode/plate/deployments/Production). Deployment 7177801511 succeeded with the platejs.org link. Old Vercel failures remain in history.

3. Open [Beta deployments](https://github.com/udecode/plate/deployments/Beta). Deployment 7177813216 succeeded with the beta.platejs.org link. The ignored runs above add no deployment entries.

## Close

The owner's focused-check waiver and fast instruction remain in effect. The Defaults table records the alternatives. Production permits main, Beta permits next, and preview-next is retired. Both environments keep the approved Vercel project credential. Production's API_TOKEN_GITHUB and the unrelated Preview and copilot environments remain.

Production run 39277478636 and Beta run 39277539428 passed. GitHub deployments 7177801511 and 7177813216 have the correct environments and public URLs. Main ignored-push run 39279888140 at e9976ae3ba and next ignored-push run 39284934650 at b54221655a each skipped the deployment job and created zero deployment records. Chrome shows the completed environment migration in environments-final.png.

This run's workflow and proof commits are:

- 9d89e3709b, chore(deploy): migrate environment credentials securely, on main. The temporary transfer workflow was removed afterward.
- 3fc58766af, fix(deploy): track production and beta separately, on main.
- 3a94e39a85, fix(deploy): track production and beta separately, on next.
- e9976ae3ba, docs(deploy): record the production environment proof, on main.
- b54221655a, docs(deploy): record separate environment deployments, on next.

The same corrected workflow is on both branches. The delivery receipt names the final records commits and their remote readback. The twelve plan steps consist of ten completed steps and two skipped steps. None remain partial, blocked or open.

The full aggregate is unpassed under the owner's waiver. Reviews, no-comments and reflect were skipped under fast mode. GitHub retains `PLATE_BUILD_BASIC=0`, and no application code or paid build resources changed in this correction. No controlled speed comparison is claimed.
