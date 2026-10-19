# Deploy previews only for pull requests

Status: executed: PR-only previews delivered and live proof passed
Playbook: build

## Brief

### What will change?

Plate now builds relevant PR previews in GitHub Actions. Ordinary branches do not run Preview. Ellie now skips non-PR branch builds on Vercel. Production and Beta keep their existing publishing paths.

### What could go wrong?

Fork previews require an exact-commit maintainer request. Those guards passed local probes; a live fork deployment was not run. Ellie still creates a canceled record when it skips a branch build, and its builder remains Vercel.

## Teach

A PR preview is a temporary copy of the site. Plate gives the PR its own deployment URL and records the exact source commit under Preview. Production belongs to main, and Beta belongs to next.

The workflow checks for site changes before entering Preview. Relevant changes build on GitHub and upload to Vercel. An ignored update creates no deployment record. Each PR has its own cancellation and cache scope.

Ellie keeps its Vercel builder and staging release checks. Its build decision now skips ordinary GitHub branches until they have a PR. Main and next keep their current rules.

## Authority and scope

The owner approved PR-only previews, then said "ok go then sync to ellie." This extends the existing GitHub deployment lane. Preserve GitHub `PLATE_BUILD_BASIC=0`, existing paid machine sizes, the shared ignore rules and the Production/Beta publication paths.

Ellie currently builds through Vercel. Its next branch is the production target of the ellie-staging project. Its GitHub Preview environment also holds migration and cron credentials and permits next only. Do not widen that environment or enable its disabled Production release as a side effect of this sync. The optional pipeline question has no answer. Sync the PR-only policy while preserving Ellie's current Vercel builder and staging release. A canceled Vercel record is still possible for ignored branch builds.

## Main changes

- Add `.github/workflows/preview.yml` beside the proven Production/Beta workflow. Trigger it for opened, reopened and synchronize pull-request events.
- Resolve the pull request into an immutable source SHA, branch and comparison base. Apply the existing ignore script before creating a deployment record.
- Use the Preview environment for deployment-only credentials. Give GitHub the actual Preview URL and source SHA.
- Keep automatic fork events away from deployment secrets. A maintainer can request a preview from a trusted workflow with the reviewed pull-request number and exact head SHA.
- Adapt the approved policy to Ellie without granting PR builds its migration or cron authority.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Workflow owner | Keep previews separate from live publishing | Extend the live publishing workflow | combine | detail |
| Internal pull requests | Deploy automatically on PR updates | Require approval for every update | review | small |
| Fork pull requests | Require an exact-commit maintainer request | Skip fork previews | forks | small |
| Ellie build service | Keep Vercel and sync the PR-only policy | Move the full build pipeline to GitHub | migrate | big |
| Ellie staging | Preserve its release checks and credentials | Migrate staging environments first | staging | big |

## Steps

- [x] Reread the accepted behavior and current producers. Proof: `.github/workflows/deploy.yml`, `apps/www/scripts/vercel-ignore-build.mjs`, and the read-only Ellie inventory.
- [x] Blocking first steps. Proof: existing Preview metadata has no Plate secrets or variables; Ellie Preview is next-only and holds migration/cron authority.
- [x] Independent workstreams. Proof: a read-only Ellie inventory and a single Plate workflow owner have disjoint resources.
- [x] Shared mutable state. Proof: per-PR concurrency in the Preview design; credential writes and branch deliveries stay sequential.
- [x] Smallest safe decomposition. Proof: a separate `.github/workflows/preview.yml` leaves the existing live publishing workflow unchanged.
- [x] Implement Plate's PR-only Preview workflow through the delegated owner. Proof: `.github/workflows/preview.yml`.
- [x] Configure the Preview environment with only deployment credentials and project identifiers. Proof: `docs/plans/artifacts/pr-previews/preview-environment-config.json`; migration run `39312330565`.
- [x] Run syntax and focused behavior checks over relevant/ignored updates, plain pushes, stale heads and fork approval. Proof: `preview-actionlint-a1.log` and `preview-behavior-a1.log` in this run's artifact folder. GitHub API responses are fixtures; remote proof remains open.
- [x] Run writing passes and applicable reviews before delivery. Proof: deslop by lead, no-comments reviewer found no required changes; unslop and bro over plan and delivery prose. No package/public API panel trigger.
- [x] Deliver the matching workflow on main and next with required branch checks. Proof: main `32a3c8f2ee`; next `e02ad82077`; next landing passed all 20 selected steps.
- [x] Prove a real pull-request preview and ignored-update behavior from GitHub records. Proof: runs `39314095981` and `39315707387`, exact source records and zero ignored deployments.
- [x] "then sync to ellie" Adapt the selected scope, run its checks and deliver it. Proof: Ellie next `b90b31438` and `8667c4ce2`; live Vercel no-PR skip passed.
- [x] Record the final proof, limits, commits and page. Proof: the completion gates, Close and this run's immutable rendered page.

## Completion Gates

| Gate | Evidence |
| --- | --- |
| Workflow syntax | actionlint 1.7.12 passes on Preview |
| PR event and ignore decisions | 23 final workflow behavior cases pass, including an exact-SHA mutation control |
| Credential boundary and source identity | Preview has only the deployment token plus public project variables; local source guards and real exact-source Preview pass |
| Local landing checks | next pnpm check --affected passes all 20 selected steps; main syntax/behavior/diff proof passes |
| Real GitHub preview and ignored records | run 39314095981 passed with Preview deployment 7183387716 at e0b3a73c2c; ignored run 39315707387 at e0d31d9e05 has skipped deploy and zero records |
| Ellie sync | policy and proof delivered to next; local checks and live no-PR skip passed; full build pipeline remains on Vercel |
| Product/public API/editor proof | skip: deployment tooling only |

## Demo

1. Open https://plate-o8hz5o208-udecode.vercel.app. This is the successful PR Preview at e0b3a73c2c. The site, installation docs, search API and registry route passed hosted checks.
2. Open https://github.com/udecode/plate/actions/runs/39314095981. The Preview job succeeded and records the actual URL. Its build log confirms the basic-machine optimization flag was off.
3. Open https://github.com/udecode/plate/actions/runs/39315707387. The docs-only PR update passed its change check, skipped deployment and created no deployment record.
4. Open https://vercel.com/informedmedical/ellie-staging/24u6JiFYvinX8rYEsdPqtxvmf19m. The no-PR branch logs show the skip before app installation or build.

## Verification

- Plate passed 23 actual-workflow local cases, including an exact-SHA mutation control and the failed-site-then-docs case. The next landing passed all 20 selected affected checks. The action release labels match their pinned upstream commits.
- Real PR run 39314095981 passed at e0b3a73c2c68b5c5166019f9e2927753d1ef0673. GitHub Preview deployment 7183387716 and Vercel READY deployment dpl_HTNv7mzC2VenaJ4gtJhgTSZSD4tY agree on source and URL. The log confirms PLATE_BUILD_BASIC=0. Ignored PR run 39315707387 at e0d31d9e05654122438844c5ca56a9c8b5524268 skipped deployment and has zero records. The ordinary branch Preview push-run query returned zero.
- Ellie passed 11 actual-script local cases, an old-source control and required typecheck/deployment checks. A live no-PR push at a80973af17e40028e92f7d9987934b633d8f5485 was canceled by its ignore command before app installation/build. Local fixtures cover allowed PR/main/next/manual decisions; no live Ellie PR build or live Plate fork deployment was run.

## Close

Ellie keeps its Vercel builder and staging release environment. The word migrate selects a separate full GitHub pipeline migration. Plate keeps previews separate from live publication; combine selects a combined workflow. Internal PR updates deploy automatically; review selects per-update approval. Fork previews use an exact-commit maintainer request; forks selects skipping forks. These are the Defaults above.

The Plate implementation landed on main as 32a3c8f2eec796db8b88977d07c4cc5d13204ca3 and next as e02ad82077cfe1f9535580979f022891c34005a5. The temporary credential setup commit was 754a89ae541d19cbc0b5c7a1394e7e55a7686fd0; its workflow was removed in the implementation commit. The input-description proof commit is e0b3a73c2c68b5c5166019f9e2927753d1ef0673, followed by ignored documentation commit e0d31d9e05654122438844c5ca56a9c8b5524268. Final documentation commit identities are recorded by this run's delivery logs.

Ellie's code landed on next as b90b31438c222879054a5be46efaf1ee454e5d43, followed by proof documentation 8667c4ce2b2a14087af869c7751724282d5d194c. Its empty no-PR verification commit stayed off next, and its owned temporary remote branch was deleted after evidence capture.

The proof is scoped to the two real Plate PR runs, one real Ellie ordinary-branch refusal and the local cases listed above. Fixture-backed guards do not certify live fork permissions. Vercel's ignored-build mechanism still creates a canceled record for Ellie. No paid machine size, application code, Production/Beta domain, migration credential or database workflow was changed. GitHub keeps PLATE_BUILD_BASIC=0.

All 13 plan steps are closed. No required panel row applies to this deployment-tooling diff. No runtime/editor/registry-source change requires product hand drive or a package API review. The accepted focused-check waiver remains available, but next passed its full affected gate. Evidence lives in this run's artifact folder; Ellie's proof is also copied under its ellie subfolder.
