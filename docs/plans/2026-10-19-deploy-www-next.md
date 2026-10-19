# Build the beta website in GitHub Actions

Status: blocked: waiting for credential approval before live deployment
Playbook: build

## Brief

### What will change?

The beta website builds on GitHub's larger runners. Changes that do not affect the website skip installation and deployment. A checked deployment updates the existing beta domain.

### What could go wrong?

The first Linux build can expose packaging or runtime differences. The current beta deployment stays available until the replacement passes its route checks. Credential setup requires the owner's approval.

## Teach

Vercel currently builds the website when the beta branch changes. The latest deployment ran out of memory with a four-gigabyte JavaScript heap limit.

GitHub Actions will build the same website and upload the finished output to Vercel. It compares changes with the last successful workflow, checks the uploaded pages and search endpoint, then updates the beta domain.

## Main changes

- Add `.github/workflows/deploy-www.yml` for trusted pushes to `next` and manual retries. The workflow is named for the website so production can adopt the same pipeline after beta passes.
- Reuse the existing frozen workspace install and Vercel-owned monorepo build command.
- Restore dependency and compilation caches without persisting pulled environment files.
- Keep the existing ignore script and translate its reversed exit statuses into a workflow output. Compare with the last successful run, including successful skips, to retain changes from failed or cancelled deployments.
- Upload with `--skip-domain`, verify homepage, documentation, search and registry routes, then assign only `beta.platejs.org` if the commit is still current.
- Configure the `preview-next` GitHub environment, restrict it to `next`, and store project identifiers as variables. Store the Vercel token only as a secret.
- Disable automatic Vercel Git deployments for `next` after the first successful Actions deployment. Preserve `main`.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Deployment timing | Deploy relevant pushes | Deploy hourly | hourly | small |
| Migration order | Prove the replacement before switching | Switch immediately | switch | small |
| Review method | Fast with direct verification | Independent review | full | detail |

## Scope

Execution authority: the owner's "ok go" authorizes the workflow, GitHub and Vercel setup, and beta deployment. The owner's "cut any overhead so it does fast" selects fast mode. Production deployment and changes to other branch domains are outside scope.

The owner clarified that the same CI must serve `main` after `next` is proven. The token is scoped to the Plate project, not a branch. The initial GitHub environment remains restricted to `next`; production uses its own environment when enabled.

The workflow's state is skipped, building, uploaded, checked, or assigned. Only a successful checked and assigned run, or a safe skip from its baseline, can become the next comparison base. No website source or public API changes are planned.

## Steps

- [x] Re-read current source and retain the accepted migration target.
- [x] Skip architect and delegated implementation because the owner selected fast mode.
- [x] Blocking first steps: verify the project, domain, secrets and install contract.
- [x] Independent workstreams: n/a, one workflow and its setup have a single owner.
- [x] Shared mutable state: serialize repository delivery and beta alias changes.
- [x] Smallest safe decomposition: workflow first, live verification, then Git deployment cutover.
- [x] Implement and verify the deployment workflow.
- [ ] Configure GitHub and Vercel credentials and project settings.
- [ ] Land through the repository delivery helper.
- [ ] Run the build on GitHub Actions and inspect the deployed beta website in Chrome.
- [ ] Disable duplicate automatic Git deployment after the replacement passes.
- [ ] Finish writing passes, proof record and close.
- [ ] "ok go, cut any overhead so it does fast. then use @Vercel and chrome as needed for the full setup"
- [x] "why only next branch? we'll have this same CI for main branch as well.. once next is proved to work". The project token supports both branches; only the initial rollout is restricted.

## Completion Gates

| Gate | Evidence |
| --- | --- |
| Workflow syntax and shell checks | actionlint-a2.log; skip-baseline-a2.log covers five decision scenarios |
| Focused existing workflow contracts | workflow-contracts-a2.log; seven tests passed |
| Writing passes | deslop, unslop and bro completed; no-comments and agent reviews skip under fast |
| Scoped lint | lint-a1.log; repository lint ignores these paths; actionlint covers the workflow |
| GitHub environment and secret | pending |
| GitHub Actions build and deployment | pending |
| Live route and Chrome checks | pending |
| Vercel Git deployment cutover | pending |
| Delivery | pending |

## Open questions

### Deployment token

May GitHub deploy Plate with a new project token?

Why it needs you: The repository requires separate approval before a credential grant.

- The token covers only the Plate project and expires October 19, 2027.
- The first deployment environment accepts only the beta branch.

- **Create token** (recommended): Create and store the project token in GitHub. Cost: Project access for one year.
- **Configure yourself**: You supply the token directly in GitHub. Cost: You handle the credential.

Why I pick it: Project scope keeps the token useful for beta and later production deployments.

Attention: look

## Evidence

- Vercel project `plate`, team `udecode`, project ID `prj_Itzm0mKIfc7VxZaktQCoWUZmkOiF`, organization ID `team_fVPtHPCspsy3Lyix3mdstrvj`.
- Vercel maps `beta.platejs.org` to `next`; `next.platejs.org` maps to `pro` and is outside this change.
- GitHub currently sets `SKIP_NEXT_CI=true`. The new deployment job has its own trigger and does not change that setting.
- GitHub has no existing Vercel repository secret. Credential values are excluded from the plan, logs and caches.
- The current build contract is `pnpm -w build:www:ci`, with package build concurrency limited to two. The JavaScript heap stays at 4096 MiB.

## Verification

- Workflow syntax passed actionlint 1.7.7. Five local decision scenarios passed, including a failed site deployment followed by documentation changes. The API response was supplied by a fixture and still needs live proof.
- All seven existing workflow contracts passed. Repository lint ignores the workflow and plan paths; this is not a source-lint coverage claim.
- The first live GitHub Actions run and Chrome checks remain pending. No Mac website build is planned.

## Open work

- Credential approval: owner is the user; stop when the authorized Vercel token is stored in the GitHub deployment environment.
- Live deployment and beta cutover: owner is this run; stop after GitHub builds, route checks, Chrome verification and duplicate Git deployment removal pass.

## Close

This is a partial setup. The workflow, next-only GitHub environment and project variables are configured. Seven existing contracts, workflow validation and five skip-decision scenarios passed. Lint ignores the changed paths. No website build ran on the Mac.

The requested token has not been created or transferred. GitHub deployment, live Chrome verification and Vercel Git deployment cutover remain open. Production is a later adoption of the same pipeline after beta is proven. Agent reviews, no-comments, decision-trail review and reflect were skipped under the owner's fast instruction.

The user's implementation request remains open until the live setup passes. The branch-scope question is answered. No unrelated changes were included.
