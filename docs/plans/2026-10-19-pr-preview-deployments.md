# Deploy previews only for pull requests

Status: building: proving Plate Preview and finishing branch delivery
Playbook: build

## Brief

### What will change?

Plate will deploy a Preview when a pull request opens, reopens or receives new commits. Ordinary branch pushes will not build previews. Production and Beta keep their existing push deployments. The same policy will be applied to Ellie.

### What could go wrong?

Preview code must not receive unrelated credentials. Fork previews need approval of the exact commit. Ellie has a separate staging project and an existing environment with migration credentials, so its setup needs a scoped adaptation.

## Teach

A preview is a temporary copy of the site for one pull request. Its deployment history and URL belong in Preview. Production belongs to main, and Beta belongs to next.

The new workflow checks whether the pull request changes the site before it enters Preview. Relevant changes build on GitHub and upload to Vercel. An ignored change creates no deployment record. Each pull request gets its own cancellation and cache scope.

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
- [ ] Prove a real pull-request preview and ignored-update behavior from GitHub records.
- [x] "then sync to ellie" Adapt the selected scope, run its checks and deliver it. Proof: Ellie next `b90b31438` and `8667c4ce2`; live Vercel no-PR skip passed.
- [ ] Record the final proof, limits, commits and page.

## Completion Gates

| Gate | Evidence |
| --- | --- |
| Workflow syntax | actionlint 1.7.12 passes on Preview |
| PR event and ignore decisions | 23 final workflow behavior cases pass, including an exact-SHA mutation control |
| Credential boundary and source identity | Preview credential readback; fixture-backed source guards pass; live deployment pending |
| Local landing checks | next pnpm check --affected passes all 20 selected steps; main syntax/behavior/diff proof passes |
| Real GitHub preview and ignored records | PR 5220 run 39314095981 passed at e0b3a73c2c, Preview deployment 7183387716, exact source and hosted routes verified; docs-only update pending |
| Ellie sync | policy and proof delivered to next; local checks and live no-PR skip passed; full build pipeline remains on Vercel |
| Product/public API/editor proof | skip: deployment tooling only |

## Verification

Use the real workflow syntax checker and event probes before delivery. The probes must execute the actual changed decision code. A mocked GitHub API boundary does not prove remote credentials or deployment status. Final acceptance also needs a successful real Preview at the expected SHA and URL, plus an ignored PR update with zero deployment records.

## Open work

- Finish Plate's Preview implementation and proof. owner: this chat; stop: the matching workflows are delivered and real Preview/ignore proof passes. Tracked in this plan.
- Finish Ellie's PR-only policy records. owner: this chat; stop: final checks and source readback are recorded. Policy landed on next at b90b31438 with typecheck, deployment-env, plans and log gates passing. Tracked in Ellie's deployment-policy plan.

## Live Preview checkpoint

PR 5220 at `e0b3a73c2c68b5c5166019f9e2927753d1ef0673` passed run `39314095981`. GitHub deployment `7183387716` is Preview, transient and non-production. Its URL is https://plate-o8hz5o208-udecode.vercel.app. Vercel deployment `dpl_HTNv7mzC2VenaJ4gtJhgTSZSD4tY` is READY at the same source, with no production aliases. The next commit updates only this deployment record and exercises the ignored-PR path.
