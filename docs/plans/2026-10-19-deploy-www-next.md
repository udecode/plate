# Build the beta website in GitHub Actions

Status: executed: beta builds and deploys through GitHub Actions
Playbook: build

## Brief

### What will change?

Beta now builds on GitHub with Basic optimizations off. The checked website is live on the existing beta domain. Changes that do not affect the website skip installation and deployment.

### What could go wrong?

The local aggregate timed out and was waived. Focused checks and two real deployments passed. Timing varies with caches and Vercel queues. Production keeps its existing deployment path.

## Teach

Vercel Basic builds the website successfully with memory optimizations. GitHub Actions also compiles the website with those optimizations off. The migration moves compilation to GitHub and keeps Vercel serving the finished website.

GitHub compares changes with the last successful workflow, checks the uploaded pages and search endpoint, then updates the beta domain. A failed build leaves beta on its previous deployment. The first successful deployment and a cached follow-up establish the initial timing.

A prebuilt upload still waits when Vercel's deployment queue is full. The cached follow-up encountered a production build in that queue. Faster compilation alone does not establish faster deployment.

## Demo

1. Open https://beta.platejs.org/docs/components/math. The equation preview loads. Select Manual to see the highlighted math.tsx installation source. These captures check deployment rendering, not the full editor behavior.

   ![after](artifacts/deploy-www-next/beta-warm-chrome-preview.png)
   ![after](artifacts/deploy-www-next/beta-warm-chrome-manual-final.png)

2. Open https://github.com/udecode/plate/actions/workflows/deploy-www.yml. The website deployment runs on relevant pushes to next. Use Run workflow on next for a manual retry.

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
| Local proof | Focused checks and GitHub proof | Retry the local aggregate | aggregate | detail |

## Scope

Execution authority: the owner's "ok go" authorizes the workflow, GitHub and Vercel setup, and beta deployment. The owner's "cut any overhead so it does fast" selects fast mode. Production deployment and changes to other branch domains are outside scope.

The owner clarified that the same CI must serve `main` after `next` is proven. The token is scoped to the Plate project, not a branch. The initial GitHub environment remains restricted to `next`; production uses its own environment when enabled.

The workflow's state is skipped, building, uploaded, checked, or assigned. Only a successful checked and assigned run, or a safe skip from its baseline, can become the next comparison base. Build mode and Git triggering change. Website routes and package APIs retain their existing behavior.

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
- [x] "Continue with focused checks and GitHub proof". The owner waived the timed-out local aggregate for this deployment change.
- [x] Run the build on GitHub Actions with `PLATE_BUILD_BASIC=0` and inspect the deployed beta website in Chrome.
- [x] Compare complete deployment time and separate build from setup and upload.
- [x] "ok lets continue github lane now, without that env enabled, and compare the speed of deployment at least. see Move Vercel builds to GitHub Actions for the wip work, we will continue here"
- [x] Disable duplicate automatic Git deployment after the replacement passes.
- [x] Finish writing passes, proof record and close.
- [x] "ok go, cut any overhead so it does fast. then use @Vercel and chrome as needed for the full setup"
- [x] "why only next branch? we'll have this same CI for main branch as well.. once next is proved to work". The project token supports both branches; only the initial rollout is restricted.

## Completion Gates

The owner explicitly waived the local aggregate gate for this deployment change: "Continue with focused checks and GitHub proof." The interrupted aggregate run records a watcher startup timeout and a CLI missing-dependency watcher timeout. Both cases passed their separate control runs, which do not prove that the full aggregate is green. Focused workflow and flag checks, real GitHub compilation, upload, route checks and Chrome verification remain required.

| Gate | Evidence |
| --- | --- |
| Workflow syntax and shell checks | alias-api-land-a1.log; actionlint and five skip scenarios pass on the scoped API workflow |
| Focused existing workflow contracts | workflow-contracts-a3.log; eight tests passed |
| Build flag modes | off-flag-modes-a1.log; default, 1 and 0 checked with real Next worker launch; compilation intercepted |
| Local aggregate gate | Owner waived after continue-land-a1.log recorded two watcher timeouts; stopped under that approval |
| Writing passes | deslop, unslop and bro completed; no-comments and agent reviews skip under fast |
| Scoped lint | lint-a1.log; repository lint ignores these paths; actionlint covers the workflow |
| GitHub environment and secret | preview-next restricts next; Plate-only token saved October 19, 2026 and expires October 19, 2027 |
| GitHub Actions build and deployment | Runs 39262418650 and 39263852444 passed; cold-comparison-a1.log and warm-comparison-a1.log record successful deployments and matching website inputs |
| Live route and Chrome checks | beta-warm-headings-a1.log, beta-warm-chrome-loaded.txt and beta-warm-chrome-manual-final.png; loaded equation preview and Manual source checked after the cached deployment |
| Vercel Git deployment cutover | delivery-identity-a1.log; 3cbae5248c disables next and preserves main; cutover-deployments.json contains only the detached GitHub preview for that SHA |
| Delivery | 88e2550143, 625dd005ce, 93696f4c5f, 904b78cf1a and 3cbae5248c landed through land.mjs; this documentation commit closes the record |
| Package API, changeset and editor playtest | N/A; this changes the deployment workflow and private website build configuration |

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

The requested result is an observed end-to-end deployment duration with correctness checks. Record runner hardware, Node, source SHA, build mode, cache messages, real compilation and page counts, deployment READY state and beta alias identity. A failed or skipped run is excluded. Compare the website, packages, content, tooling, lockfile and build inputs across SHAs. Workflow and plan changes can differ. Vercel configuration must match after removing the Git-trigger setting.

Record one cold and one cached GitHub run. Report push-to-beta time separately from job cleanup and cache saving. The Basic comparison separates queue time from build-to-ready time. These observations do not establish a repeatable causal speedup or choose the hosting provider.

Benchmark lanes: source-and-host-readiness applies to the remote build and deployment. Current-vs-main-product-smoke, plate-vs-plite-decomposition, owner-microbench-and-trace, product-mount-matrix, trusted-editing-matrix, plite-vs-pinned-slate, example-breadth and large-and-stress are N/A because this compares deployment pipelines, not editor runtime performance. Interaction coverage is N/A for first and settled editing interactions; route-scope is the uploaded homepage, installation docs, search and registry, plus Chrome inspection; reporter-profile is GitHub Ubuntu and Vercel Basic builds, with Chrome for route proof.

## Verification

- GitHub cold run [39262418650](https://github.com/udecode/plate/actions/runs/39262418650) and cached run [39263852444](https://github.com/udecode/plate/actions/runs/39263852444) both passed with `PLATE_BUILD_BASIC=0`. Both compiled all 1448 pages, uploaded the archive, checked routes and assigned beta. The cached run restored about 254 MB of compilation cache from the cold run. Turbo still ran all five tasks with zero task-cache hits. cold-comparison-a1.log and warm-comparison-a1.log check job success and matching website inputs across the different workflow commits.
- The final deployment is `dpl_BmZP9HkMRXh1utCHC8R6T631rMwX` at `3cbae5248c`. Vercel reported READY and beta points to that deployment. delivery-identity-a1.log checks the metadata, alias and Git-trigger settings. The cutover SHA has only the detached GitHub preview, with no native next build. beta-warm-headings-a1.log checks actual headings on home, React docs and Math docs, plus 33 search results and one registry file. Chrome separately loaded the equation demo and selected Manual to inspect highlighted math.tsx source. The two Demo images and beta-warm-chrome-manual-final.txt retain that proof. This is a deployment smoke check, not full editor coverage.
- Eight existing workflow contracts, actionlint 1.7.7, five skip scenarios and all three build-flag modes passed. The flag probe launched real Next parent and worker processes but intercepted compilation; the real Linux builds prove off-mode compilation. The local aggregate did not pass. The owner explicitly waived it after two watcher timeouts. Separate passing watcher controls do not establish that the aggregate is green or that its failures were pre-existing. No full website compilation ran on the Mac.

| Observed stage | GitHub cold | GitHub cached |
| --- | --- | --- |
| GitHub queue | 4s | 5s |
| Setup | 46s | 1m03s |
| Build | 5m31s | 3m48s |
| Upload and Vercel processing | 49s | 4m06s |
| Route checks and beta assignment | 24s | 24s |
| Workflow creation to beta | 7m34s | 9m26s |
| Workflow creation to job finish | 7m46s | 9m38s |

The cached upload includes 3m16.097s in Vercel's queue behind an unrelated main production build. Vercel then processed the prebuilt deployment in 29.724s. warm-delivery.json retains the READY timestamps. Production was inspected only and left alone.

The matching website inputs on Vercel Basic took 7m30.102s from build start to READY, plus 6m48.832s waiting behind an earlier production build. Its total was 14m18.934s. A second nearby Basic observation took 7m31.112s with almost no queue. The source, hardware, flag and queue conditions are recorded above and in vercel-comparison.json. GitHub's cold total was roughly equal to Basic's active deployment time. The cached compilation was shorter, but its full deployment was delayed by Vercel's shared queue. These single observations do not establish a repeatable provider speedup.

The earlier failed uploads and alias lookup remain reproduction evidence in the decision log and GitHub logs. They are excluded from successful deployment timings. bad-route-control-a1.log proves the HTTP probe rejects the wrong streamed Math route; the actual route is `/docs/components/math`.

## Open work

- Production adoption and hourly scheduling remain deferred by the owner's rollout scope. Owner: the owner; stop: an explicit request to enable either. The current workflow deploys only next.

## Close

The owner approved focused checks and GitHub proof in place of the timed-out local aggregate. That aggregate remains unpassed. Archiving was necessary for the observed 25519 output files and sacrifices individual-file upload reuse. The project token's scope and expiry stayed as approved. Agent review, no-comments, decision-trail review and reflect were skipped under fast mode.

Beta now builds and deploys through GitHub Actions with Basic mode off. Both cold and cached deployments passed. Vercel's next Git builds are disabled, main remains enabled and the beta domain points at the checked GitHub deployment. The required homepage, docs, search, registry and Chrome smoke checks passed. Source comparison confirms matching website and build inputs for the timing comparison. No production deployment, unrelated source fix or specification upgrade was made by this run.

This continuation landed these changes through land.mjs:

| Commit | Change |
| --- | --- |
| 625dd005ce | fix(www): finish the GitHub preview deployment path |
| 93696f4c5f | fix(www): archive prebuilt deployments above the file limit |
| 904b78cf1a | fix(www): assign beta with the scoped deployment API |
| 3cbae5248c | chore(www): switch next deployments to GitHub Actions |
| This final documentation commit | docs(www): record GitHub deployment proof and timings |

The original workflow commit 88e2550143 predates this continuation. The transferred implementation, off-mode request, timing comparison, full beta setup and branch-scope question are complete. Production and hourly scheduling remain outside this rollout. The cold build and both complete deployment timings are observations; the comparison does not prove a repeatable speed advantage.


## Deploy workflow rename

The owner requested deploy on both branches. Commit 3d14bbb09e renamed the workflow to .github/workflows/deploy.yml and its visible name to Deploy. The same file supports trusted main and next branches, with separate caches and branch-specific Vercel settings and publication. The shared ignore script now skips Version Packages only when it is the sole undeployed commit.

[Run 39270089314](https://github.com/udecode/plate/actions/runs/39270089314) passed the actual beta build and publication after the rename. Its deployment is dpl_AvGEzAKx7DD1nDxLB7nyES1c6WcW. HTTP checks passed, and Chrome rendered the equation preview and Manual installation source. The main migration's record is docs/plans/2026-10-19-deploy-www-main.md on main. The earlier aggregate waiver and fast review limits still apply.
