# Build production through GitHub Actions

Status: verifying: production and beta passed; checking an ignored-only push
Playbook: build

## Brief

### What will change?

Production and beta now build through the same GitHub workflow. Both use one ignore script. Main matches beta's Next and React versions. GitHub builds with Basic mode off; Vercel production keeps Basic mode on.

### What could go wrong?

Production and beta keep different website code. Both real deployments passed their checks. The full local aggregate remains unpassed under the approved focused-proof waiver. Deployment queues can still delay uploads.

## Teach

Beta already builds on GitHub and uploads finished files to Vercel. Production still builds directly on Vercel and lacks the ignore script and build flag.

The port keeps production's v1 website routes and package layout. GitHub pulls production settings, builds with Basic mode off, uploads a staged production deployment, checks its routes and promotes that same deployment. A current-commit check prevents an older build from replacing newer code.

One repository script decides whether changed files affect the site. GitHub compares against its last successful run, while Vercel supplies its previous deployment commit. Missing history builds conservatively.

## Main changes

- Port `.github/workflows/deploy.yml` with branch-specific environment pull, build, cache keys and publishing. Main uses a staged production upload and Vercel's scoped promotion API. Next keeps its preview alias path.
- Add `apps/www/scripts/vercel-ignore-build.mjs` as the common owner for GitHub and Vercel skip decisions. Preserve source changes after a failed build, including a following Version Packages commit.
- Add `PLATE_BUILD_BASIC` to the existing main configuration, build launcher and Turbo environment list. Default and 1 use 4096 MiB and Basic webpack settings. GitHub explicitly sets 0 and uses 8192 MiB with normal caching.
- Set the Vercel production flag to 1. Reuse the approved Plate-project credential in the existing GitHub environment, restricted to main and next. No credential is retrieved, copied or recreated.
- Disable duplicate Vercel Git builds and use a frozen install. The production domain changes only after the GitHub deployment checks pass.

The compatible configuration port separates synchronous, asynchronous and development docs output, aligns the React compiler and workspace root, and preserves v1 redirects. Cache Components, instant-navigation validation and partial prefetching stay off because v1 route owners explicitly use force-static and revalidation settings. Enabling those runtime features requires route adoption, beyond matching deployment configuration.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Credential reuse | Keep the approved project credential | Create another production credential | separate | detail |
| Review method | Continue the requested fast rollout | Independent review | full | detail |
| Local proof | Focused checks and GitHub proof | Retry the aggregate | aggregate | detail |

## Authority and boundaries

The owner's "apply to main now" explicitly authorizes the main push, production deployment and required setup. The earlier fast instruction and "Continue with focused checks and GitHub proof" carry into this rollout continuation. The owner subsequently requested the closest compatible www configuration and matching Next version. Next and its matching companion package move to 16.3.2; React and React DOM move to 19.2.8. TypeScript stays at 6.0.2 because a repository-wide major compiler migration is separate from the website build. No package API, registry component or paid machine change is authorized.

The beta plan anticipated a separate production environment. The existing project credential is available only inside preview-next and cannot be copied through GitHub's read API. This rollout reuses that environment with explicit main and next branch policies. The secret still targets the same Plate project. The job's production mode is chosen from the trusted branch, not the GitHub environment's name.

Main uses its own topic branch and the main checkout's existing delivery rules. Its older agent tooling has no land.mjs; the explicit main-push request permits a normal checked push from the isolated topic branch. Next application code remains outside this port. Both branches rename their workflow to deploy.yml.

## Steps

- [x] Read the accepted beta workflow and main's actual website and build owners. Source: 0c659f6164 and main intake 5cbd9fd102.
- [x] Skip architect and delegated implementation under the carried fast instruction.
- [x] Blocking first steps: verify the Plate project, production domains and existing credential. Vercel and GitHub metadata inspected.
- [x] Independent workstreams: N/A; one workflow and its production promotion have one owner.
- [x] Shared mutable state: serialize main delivery and production promotion.
- [x] Smallest safe decomposition: port, focused proof, real production build, checked promotion and close.
- [x] Implement the workflow, shared ignore list and build flag. Source: .github/workflows/deploy.yml and apps/www/scripts.
- [x] "try to apply the lcosest www config, upgrade next to same version etc." Source: apps/www/package.json and apps/www/next.config.ts; compatible build settings aligned.
- [x] "and rename deploy-www to deploy to both" Proof: main 19db88833e and next 3d14bbb09e; both Deploy workflow runs passed.
- [x] Verify branch decisions, missing history, failed builds, ignored files, flag modes and workflow syntax. Proof: skip-a1.log, publish-a1.log, flag-a2.log and actionlint-a1.log in the run directory.
- [x] Run writing passes and focused formatting. Direct deslop, unslop and bro passes; scoped Biome check.
- [x] Push main and prove the real GitHub build and staged production upload. Proof: https://github.com/udecode/plate/actions/runs/39270020107 at 19db88833e.
- [x] Verify production promotion, domain identity, HTTP routes and Chrome rendering. Proof: production-live-a1.log, registry-source-live-a1.log and main-react-source.png in the run directory; Vercel alias points to dpl_sLDRfNDitWr27QLxDtdao2TrGB9T.
- [ ] Verify an ignored-only push skips both build entrypoints.
- [x] "apply to main now. including the ignore list (for both github actions and vercel), and including the vercel flag." Proof: main 19db88833e, Vercel production PLATE_BUILD_BASIC=1, checked promotion and shared ignore script.
- [ ] Finish the proof record, page and delivery.

## Completion Gates

| Gate | Evidence |
| --- | --- |
| Implementation ownership | Shared ignore script; branch-specific production staging and promotion |
| Local workflow and skip checks | actionlint-a1.log, skip-a1.log and publish-a1.log; API responses are fixtures |
| Build flag modes | flag-a2.log; real Next parent and worker heaps, compilation intercepted |
| Scoped formatting and syntax | focused-lint-a1.log and syntax-a1.log; ESLint ignores this config |
| Full local aggregate | Owner-approved focused checks and real GitHub proof; no aggregate-green claim |
| GitHub production build and upload | Run 39270020107 passed; 8192 MiB heap, 52 tasks and 867 static pages |
| Promotion and live production proof | Same production deployment promoted; HTTP and Chrome rendering checks passed |
| Ignore-only live run | pending |
| Reviews, no-comments, trail review and reflect | skip: carried fast instruction |
| Package changeset and editor behavior tests | N/A; deployment tooling and private build configuration only |

## Performance and interaction coverage

Source-and-host-readiness applies to the remote production build and checked deployment. The product smoke, Plate/Slate decomposition, owner microbench, mount matrix, trusted editing, example breadth and stress lanes are N/A because this ports deployment tooling, not editor runtime behavior. First and settled editing interactions are N/A. Route scope is home, installation docs, search and registry. The reporter profile is GitHub Ubuntu and the live production site in Chrome. Any elapsed time reported is a single operational observation, not a repeatable speedup claim.

## Verification

- Production [run 39270020107](https://github.com/udecode/plate/actions/runs/39270020107) passed at 19db88833e. The real build used Next 16.3.2 and an 8192 MiB heap. It completed 52 tasks and generated 867 pages. Build time was 8m57s; upload took 1m08s; staged route checks took 20s; publication took 6s. These are single-run observations, not a controlled speed comparison.
- Beta [run 39270089314](https://github.com/udecode/plate/actions/runs/39270089314) passed at 3d14bbb09e after the rename. It built in 3m29s, uploaded in 50s and passed route checks and alias assignment. Chrome rendered the equation preview and Manual installation source. Production Chrome rendered the React installation page, its editor preview and its Code source viewer. HTTP checks parsed actual headings and nonempty search, registry and highlighted-source responses.
- The shared ignore decision, both publication branches, stale-head refusal and default/1/0 flag modes passed focused probes. API responses in those local probes were fixtures, and compilation was intercepted for the heap probe. The real GitHub deployments prove the remote build and API path. The local aggregate remains unpassed under the owner's approved focused-proof waiver. Reviews and no-comments were skipped under fast mode.

## Demo

### Production docs

Open the [React installation guide](https://platejs.org/docs/installation/react). Its editor preview and generated Code files load from the promoted deployment.

![Production editor preview](./artifacts/deploy-www-main/main-react-preview.png)
![Production generated source](./artifacts/deploy-www-main/main-react-source.png)

### Beta docs

Open the [Math component](https://beta.platejs.org/docs/components/math). The equation preview renders, and Manual shows the generated installation source.

![Beta equation preview](./artifacts/deploy-www-main/beta-renamed-chrome.png)
![Beta installation source](./artifacts/deploy-www-main/beta-renamed-manual.png)

## Open work

- Production migration proof. Owner: this run; tracked in this plan; stop: staged build, route checks, promotion, live browser proof and ignore-only skip pass.

## Close

Production and beta use Deploy in deploy.yml. Main aligns Next and third-parties at 16.3.2 and React and React DOM at 19.2.8. The compatible build configuration is ported, while v1 routing and static-rendering contracts remain intact. Generated async docs and per-port caches are ignored locally.

Main commit 19db88833e, chore(www): build production with GitHub Actions, passed the real production build and checked promotion. Next commit 3d14bbb09e, chore(www): rename the deployment workflow on next, passed the beta build and alias checks. Both use the same ignore script. Vercel production has Basic mode 1, and GitHub explicitly uses 0. The paid machine configuration did not change.

The production alias points to dpl_sLDRfNDitWr27QLxDtdao2TrGB9T. Beta points to dpl_AvGEzAKx7DD1nDxLB7nyES1c6WcW. The www redirect, beta branch mapping and pro branch mapping remain as inspected. The aggregate is unpassed, as the owner's waiver allows; no aggregate-green claim is made. Final ignored-only push proof remains in progress.
