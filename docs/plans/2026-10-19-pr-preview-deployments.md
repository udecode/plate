# Deploy previews only for pull requests

Status: building: implementing Plate; confirming Ellie sync scope
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

Ellie currently builds through Vercel. Its next branch is the production target of the ellie-staging project. Its GitHub Preview environment also holds migration and cron credentials and permits next only. Do not widen that environment or enable its disabled Production release as a side effect of this sync. The owner has been asked whether the sync includes moving Ellie builds to GitHub.

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
| Ellie staging | Preserve its release checks and credentials | Migrate staging environments first | staging | big |

## Steps

- [x] Reread the accepted behavior and current producers. Proof: `.github/workflows/deploy.yml`, `apps/www/scripts/vercel-ignore-build.mjs`, and the read-only Ellie inventory.
- [x] Blocking first steps. Proof: existing Preview metadata has no Plate secrets or variables; Ellie Preview is next-only and holds migration/cron authority.
- [x] Independent workstreams. Proof: a read-only Ellie inventory and a single Plate workflow owner have disjoint resources.
- [x] Shared mutable state. Proof: per-PR concurrency in the Preview design; credential writes and branch deliveries stay sequential.
- [x] Smallest safe decomposition. Proof: a separate `.github/workflows/preview.yml` leaves the existing live publishing workflow unchanged.
- [ ] Implement Plate's PR-only Preview workflow through the delegated owner.
- [ ] Configure the Preview environment with only deployment credentials and project identifiers.
- [ ] Run syntax and focused behavior checks over relevant/ignored updates, plain pushes, stale heads and fork approval.
- [ ] Run writing passes and applicable reviews before delivery.
- [ ] Deliver the matching workflow on main and next with required branch checks.
- [ ] Prove a real pull-request preview and ignored-update behavior from GitHub records.
- [ ] "then sync to ellie" Adapt the selected scope, run its checks and deliver it.
- [ ] Record the final proof, limits, commits and page.

## Completion Gates

| Gate | Evidence |
| --- | --- |
| Workflow syntax | pending |
| PR event and ignore decisions | pending |
| Credential boundary and source identity | pending |
| Local landing checks | pending |
| Real GitHub preview and ignored records | pending |
| Ellie sync | pending |
| Product/public API/editor proof | skip: deployment tooling only |

## Verification

Use the real workflow syntax checker and event probes before delivery. The probes must execute the actual changed decision code. A mocked GitHub API boundary does not prove remote credentials or deployment status. Final acceptance also needs a successful real Preview at the expected SHA and URL, plus an ignored PR update with zero deployment records.

## Open work

- Finish Plate's Preview implementation and proof. owner: this chat; stop: the matching workflows are delivered and real Preview/ignore proof passes. Tracked in this plan.
- Confirm Ellie's sync scope, preserve its staging release and complete the approved adaptation. owner: this chat; stop: the selected changes are delivered with scoped proof. Tracked in this plan.
