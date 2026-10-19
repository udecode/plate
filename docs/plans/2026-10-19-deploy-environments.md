# Correct GitHub deployment environments

Status: building: configure the environments and prove both deployment lanes
Playbook: build

## Brief

### What will change?

Production deployments will appear under Production. Public beta deployments will appear under Beta. Ignored pushes will create no deployment record.

### What could go wrong?

Moving the existing credential could break deployment access. Real builds must prove both environments work. Old failed deployments remain in the history.

## Teach

A GitHub environment groups deployment history and deployment credentials. The previous workflow reused one environment for both branches because it held the existing credential. That put successful production deployments in the wrong history.

The corrected workflow checks changed files before entering an environment. Only a required deployment starts a job in Production or Beta. Each environment keeps the same approved Vercel project credential and accepts its own branch.

## Main changes

- Split `.github/workflows/deploy.yml` into a changes job and a deployment job on both branches. Map main to Production and next to Beta, with their public URLs.
- Copy the existing VERCEL_TOKEN through destination-key encryption inside GitHub Actions. Only encrypted output leaves the runner. Keep Production's existing API_TOKEN_GITHUB secret.
- Limit Production to main and Beta to next. Copy the two public Vercel project variables. Preserve the unrelated Preview and copilot environments.
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
- [ ] Prove a real successful deployment in Production and Beta with the correct URLs.
- [ ] Prove ignored pushes start no deployment job and create no deployment record.
- [ ] "ok go update https://github.com/udecode/plate/settings/environments" Verify the final settings in Chrome and record delivery.

## Completion Gates

| Gate | Evidence |
| --- | --- |
| Workflow syntax and branch decisions | Awaiting focused proof |
| Credential and environment mapping | Awaiting real GitHub deployment proof |
| No deployment for ignored pushes | Awaiting GitHub deployment API proof |
| Local aggregate | skip: owner's focused-check and GitHub-proof waiver |
| Independent reviews and no-comments | skip: carried fast instruction |
| Public API, package changeset and editor tests | skip: deployment tooling only |

## Verification

Acceptance uses the actual GitHub environment settings, workflow runs and deployment API records. A local syntax check cannot prove credential access or deployment history. The full local aggregate remains unpassed under the owner's waiver.
