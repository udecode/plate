# Build the beta website in GitHub Actions

Status: building: assigning beta through the scoped API after successful upload and route checks
Playbook: build

## Brief

### What will change?

The beta website builds on GitHub's larger runners. Changes that do not affect the website skip installation and deployment. A checked deployment updates the existing beta domain.

### What could go wrong?

The first Linux build can expose packaging or runtime differences. The current beta deployment stays available until the replacement passes its route checks. Credential setup requires the owner's approval.

## Teach

Vercel Basic now builds the website successfully with memory optimizations. Its verified cold deployment took 8 minutes 37 seconds. GitHub Actions already completes compilation, but its upload fails because the workflow uses a production-only option on a preview deployment.

GitHub Actions will build the same website and upload the finished output to Vercel. It compares changes with the last successful workflow, checks the uploaded pages and search endpoint, then updates the beta domain.

## Main changes

- Add `.github/workflows/deploy-www.yml` for trusted pushes to `next` and manual retries. The workflow is named for the website so production can adopt the same pipeline after beta passes.
- Let Vercel build install the workspace once with a frozen lockfile and run the existing monorepo build command. GitHub prepares Node, pnpm, Bun and the dependency cache first.
- Restore dependency and compilation caches without persisting pulled environment files. Save the compilation cache after any successful build, even if a later deployment step fails.
- Keep the existing ignore script and translate its reversed exit statuses into a workflow output. Compare with the last successful run, including successful skips, to retain changes from failed or cancelled deployments.
- Archive the prebuilt output with `--archive=tgz`, because the observed 25519 upload files exceed Vercel's 15000-file limit. Archiving sacrifices individual-file upload reuse.
- Upload a detached preview without the production-only `--skip-domain` option or a `next` Git branch association. Keep the source SHA and a descriptive branch label in metadata. Verify homepage, documentation, search and registry routes, then assign only `beta.platejs.org` through Vercel's team-scoped REST API if the commit is still current. The API avoids the alias CLI's unsupported personal-user lookup for the approved project credential.
- Rename the single build flag to `PLATE_BUILD_BASIC`. Default and `1` retain the passing Basic configuration. GitHub explicitly sets `0`, using the 8192 MiB heap and normal webpack caching and parallelism. Turbo preserves the flag.
- Compare observed setup, build, upload and complete deployment durations with the verified Vercel Basic run. This is an initial single-run comparison, not a controlled speedup claim.
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

The workflow's state is skipped, building, uploaded, checked, or assigned. Only a successful checked and assigned run, or a safe skip from its baseline, can become the next comparison base. The only website configuration change is the agreed build-flag rename and its explicit GitHub off setting.

## Steps

- [x] Re-read current source and retain the accepted migration target.
- [x] Skip architect and delegated implementation because the owner selected fast mode.
- [x] Blocking first steps: verify the project, domain, secrets and install contract.
- [x] Independent workstreams: n/a, one workflow and its setup have a single owner.
- [x] Shared mutable state: serialize repository delivery and beta alias changes.
- [x] Smallest safe decomposition: workflow first, live verification, then Git deployment cutover.
- [x] Implement and verify the deployment workflow.
- [x] Configure GitHub and Vercel credentials and project settings.
- [x] Land through the repository delivery helper.
- [ ] Run the build on GitHub Actions with `PLATE_BUILD_BASIC=0` and inspect the deployed beta website in Chrome.
- [ ] Compare complete deployment time and separate build from setup and upload.
- [ ] "ok lets continue github lane now, without that env enabled, and compare the speed of deployment at least. see Move Vercel builds to GitHub Actions for the wip work, we will continue here"
- [ ] Disable duplicate automatic Git deployment after the replacement passes.
- [ ] Finish writing passes, proof record and close.
- [ ] "ok go, cut any overhead so it does fast. then use @Vercel and chrome as needed for the full setup"
- [x] "why only next branch? we'll have this same CI for main branch as well.. once next is proved to work". The project token supports both branches; only the initial rollout is restricted.

## Completion Gates

The owner explicitly waived the local aggregate gate for this deployment change: "Continue with focused checks and GitHub proof." The interrupted aggregate run records a watcher startup timeout and a CLI missing-dependency watcher timeout. Both cases passed their separate control runs, which do not prove that the full aggregate is green. Focused workflow and flag checks, real GitHub compilation, upload, route checks and Chrome verification remain required.

| Gate | Evidence |
| --- | --- |
| Workflow syntax and shell checks | actionlint-a3.log; skip-baseline-a2.log covers five decision scenarios |
| Focused existing workflow contracts | workflow-contracts-a3.log; eight tests passed |
| Build flag modes | off-flag-modes-a1.log; default, 1 and 0 checked with real Next worker launch; compilation intercepted |
| Local aggregate gate | Owner waived after continue-land-a1.log recorded two watcher timeouts; stopped under that approval |
| Writing passes | deslop, unslop and bro completed; no-comments and agent reviews skip under fast |
| Scoped lint | lint-a1.log; repository lint ignores these paths; actionlint covers the workflow |
| GitHub environment and secret | preview-next restricts next; Plate-only token saved October 19, 2026 and expires October 19, 2027 |
| GitHub Actions build and deployment | pending |
| Live route and Chrome checks | pending |
| Vercel Git deployment cutover | pending |
| Delivery | 88e2550143 landed through land.mjs; live setup continues |

## Evidence

- Vercel project `plate`, team `udecode`, project ID `prj_Itzm0mKIfc7VxZaktQCoWUZmkOiF`, organization ID `team_fVPtHPCspsy3Lyix3mdstrvj`.
- Vercel maps `beta.platejs.org` to `next`; `next.platejs.org` maps to `pro` and is outside this change.
- GitHub currently sets `SKIP_NEXT_CI=true`. The new deployment job has its own trigger and does not change that setting.
- The owner approved creation and storage of the project-scoped `plate-github-actions` token. The token is stored only as the `VERCEL_TOKEN` secret in the GitHub environment. It expires October 19, 2027. Credential values are excluded from the plan, logs and caches.
- The build contract is `pnpm -w build:www:ci`, with package build concurrency limited to two. Commit `40010f7279` restored the passing Basic mode. This continuation renames its flag and explicitly disables Basic mode on GitHub.
- Baseline: Vercel Basic deployment `dpl_2n4jVxGHSpjrBvVqKJ9hbvyHnwTx`, commit `40010f7279`, 2 cores and 8 GB, 4096 MiB heap, zero Turbo cache hits, 1448 generated pages. Created-to-ready time is 516541 ms. Source and cache differences will be reported with the GitHub measurement.
- GitHub run `39245512247` built successfully in 5m34s, then failed at `--skip-domain`. This is reproduction evidence only, not a successful deployment timing.
- Run `39257786293` was cancelled by the newer push `964da9efab`; it is excluded from deployment timing.
- Run `39258464222` at `964da9efab` compiled with `PLATE_BUILD_BASIC=0`, 4 CPUs, about 16 GB RAM, Node 22.23.3 and an 8192 MiB Next heap. All 1448 static pages completed. The build step took 425 seconds; Turbo took 6m41.192s, webpack 4.6m and static generation 66s with three workers. Upload then refused 25519 files against the 15000-file limit. This is a successful compilation, not a successful deployment timing.
- Vercel Basic at `625dd005ce` reached READY in 451112 ms, including 873 ms before build. The matching `964da9efab` preview waited 408832 ms behind a production build before starting. Production was inspected only and left alone.
- Continued in this chat from the original idle worktree `codex/deploy-www-next`. Four pending original-task files were preserved while fast-forwarding to current `origin/next`. Existing credential approval and fast mode persist. Production and hourly scheduling remain deferred.
- The first authenticated run reached compilation, then a newer push cancelled it. Its log exposed a second dependency install. The final workflow removes the first install and makes Vercel's existing install command frozen. The replacement also pins current Node 24 action versions to remove the old actions' runtime deprecation warning.

## Measurement scope

The requested result is an observed end-to-end deployment duration with correctness checks. Record runner hardware, Node, source SHA, build mode, cache messages, real compilation and page counts, deployment READY state and beta alias identity. A failed or skipped run is excluded. One successful run per configuration is a ballpark comparison; it does not establish a repeatable causal speedup or choose the hosting provider.

Benchmark lanes: source-and-host-readiness applies to the remote build and deployment. Current-vs-main-product-smoke, plate-vs-plite-decomposition, owner-microbench-and-trace, product-mount-matrix, trusted-editing-matrix, plite-vs-pinned-slate, example-breadth and large-and-stress are N/A because this compares deployment pipelines, not editor runtime performance. Interaction coverage is N/A for first and settled editing interactions; route-scope is the uploaded homepage, installation docs, search and registry, plus Chrome inspection; reporter-profile is GitHub Ubuntu and Vercel Basic builds, with Chrome for route proof.

## Verification

Run `39260214358` completed the off-mode build in 480 seconds and archived upload in 63 seconds. Its homepage, React docs, search and registry workflow checks passed. Vercel deployment `dpl_DB4Ln5DaLMPWGV77hW6NdnDr2Ano` reached READY as a detached preview with no aliases. The final CLI alias step failed with "User not found"; beta still pointed at the Vercel-built preview. This is not a successful complete deployment timing.

The extra HTTP probe now requires real h1 headings and uses the canonical `/docs/components/math` route. Its earlier `/docs/math` body-only check was too weak. `bad-route-control-a1.log` proves the corrected probe rejects that streamed 404, and `vercel-basic-headings-a1.log` and `github-preview-headings-a1.log` show three real page headings, 33 search results and a registry file. The Basic math manual source and equation preview were inspected in Chrome.


- Workflow syntax passed actionlint 1.7.7. Five local decision scenarios passed, including a failed site deployment followed by documentation changes. The API response was supplied by a fixture and still needs live proof.
- All seven existing workflow contracts passed. Repository lint ignores the workflow and plan paths; this is not a source-lint coverage claim.
- The first live GitHub Actions run and Chrome checks remain pending. No Mac website build is planned.

## Open work

- Live deployment and beta cutover: owner is this run; stop after GitHub builds, route checks, Chrome verification and duplicate Git deployment removal pass.

## Close

This is a partial setup. The workflow, next-only GitHub environment and project variables are configured. Seven existing contracts, workflow validation and five skip-decision scenarios passed. Lint ignores the changed paths. No website build ran on the Mac.

The owner approved the requested token, and it is stored in GitHub. GitHub deployment, live Chrome verification and Vercel Git deployment cutover remain open. Production is a later adoption of the same pipeline after beta is proven. Agent reviews, no-comments, decision-trail review and reflect were skipped under the owner's fast instruction.

The user's implementation request remains open until the live setup passes. The branch-scope question is answered. No unrelated changes were included.
