# Correct GitHub deployment environments

Status: building: both deployments passed; proving an ignored next push
Playbook: build

## Brief

### What will change?

Production now uses main. Public beta uses next. The old shared environment is retired. Both real deployments passed. The ignored production push created no deployment record. The next ignored-push check remains.

### What could go wrong?

The full local aggregate remains unpassed under the owner's waiver. Both real deployments passed, and final environment settings were verified in Chrome. The remaining proof checks an ignored push on next.

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
- [ ] Prove ignored pushes start no deployment job and create no deployment record.
- [ ] "ok go update https://github.com/udecode/plate/settings/environments" Verify the final settings in Chrome and record delivery.

## Completion Gates

| Gate | Evidence |
| --- | --- |
| Workflow syntax and branch decisions | deploy-actionlint-a1.log, next-actionlint-a1.log and skip-a1.log in the run directory |
| Credential and environment mapping | main-deployed-a1.log, beta-deployed-a1.log and environment-retired-a1.log in the run directory |
| No deployment for ignored pushes | Awaiting GitHub deployment API proof |
| Local aggregate | skip: owner's focused-check and GitHub-proof waiver |
| Independent reviews and no-comments | skip: carried fast instruction |
| Public API, package changeset and editor tests | skip: deployment tooling only |

## Verification

Acceptance uses the actual GitHub environment settings, workflow runs and deployment API records. A local syntax check cannot prove credential access or deployment history. The full local aggregate remains unpassed under the owner's waiver.

Production [run 39277478636](https://github.com/udecode/plate/actions/runs/39277478636) passed at 3fc58766af. GitHub records deployment 7177801511 under Production with https://platejs.org. Proof: `docs/plans/artifacts/deploy-environments/main-deployed-a1.log`. The rerun of the watch command passed in `docs/plans/artifacts/deploy-environments/main-deploy-run-a2.log`.

Both environment configurations passed API readback in `docs/plans/artifacts/deploy-environments/environment-retired-a1.log`. Production permits main; Beta permits next. The existing Vercel credential and project variables are present in both. Production still holds API_TOKEN_GITHUB. The old preview-next environment is retired, and legacy deployment record 7176611625 remains readable. Preview and copilot retain their original IDs.

## Demo

1. Open [GitHub environments](https://github.com/udecode/plate/settings/environments). Production accepts main; Beta accepts next. Both have the existing deployment credential and the two Vercel project variables.

   ![Final environment settings](./artifacts/deploy-environments/environments-final.png)

2. Open [Production deployments](https://github.com/udecode/plate/deployments/Production). Deployment 7177801511 succeeded with the platejs.org link. Old Vercel failures remain in history.

## Open work

- Prove a docs-only next push creates no deployment record. owner: this chat's scheduled follow-up; stop: the ignored next push passes with zero deployment records. Tracked in this plan.
- Deliver the final proof records and closed page. owner: this chat's scheduled follow-up; stop: both branch records are delivered after the next skip check. Tracked in this plan.

## Close

Production permits main, Beta permits next, and preview-next is retired. Both environments keep the approved Vercel project credential. Production's API_TOKEN_GITHUB and the unrelated Preview and copilot environments remain.

Production run 39277478636 and Beta run 39277539428 passed. GitHub deployments 7177801511 and 7177813216 have the correct environments and public URLs. Main ignored-push run 39279888140 skipped the deployment job and created zero deployment records for e9976ae3ba. Chrome now shows the completed environment migration in environments-final.png.

Main code commit 3fc58766af and next code commit 3a94e39a85 contain the same corrected workflow. Migration commit 9d89e3709b was followed by removal of the temporary transfer workflow. Main proof commit e9976ae3ba exercised the ignored-push path. Ten of twelve steps are closed. The next skip proof and final delivery remain.

The scheduled follow-up remains active until the final proof and delivery finish. The full aggregate is unpassed under the owner's waiver. Reviews, no-comments and reflect were skipped under fast mode. No controlled speed comparison is claimed.

Beta proof: `docs/plans/artifacts/deploy-environments/beta-deployed-a1.log` and `docs/plans/artifacts/deploy-environments/beta-deploy-run-a2.log`. Main skip proof: `docs/plans/artifacts/deploy-environments/main-ignored-a1.log`.
