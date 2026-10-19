# Build production through GitHub Actions

Status: executed: production and beta deployed; ignored-only pushes skip both branches
Playbook: build

## Brief

### What will change?

Production and beta now build through the same GitHub workflow. Both use one ignore script. Main matches beta's Next and React versions. GitHub builds with Basic mode off; Vercel production keeps Basic mode on.

### What could go wrong?

Production and beta keep different website code. Both real deployments passed their checks. The full local aggregate remains unpassed under the approved focused-proof waiver. Deployment queues can still delay uploads.

## Teach

Production and beta both build on GitHub and upload finished files to Vercel. Main keeps the v1 website; next keeps beta. The two branches use the same deployment workflow and ignore decision.

The port keeps production's v1 website routes and package layout. GitHub pulls production settings, builds with Basic mode off, uploads a staged production deployment, checks its routes and promotes that same deployment. A current-commit check prevents an older build from replacing newer code.

One repository script decides whether changed files affect the site. GitHub compares against its last successful run, while Vercel supplies its previous deployment commit. Missing history builds conservatively.

## Main changes

- Use `.github/workflows/deploy.yml` with branch-specific environment pull, build, cache keys and publishing. Main uses a staged production upload and Vercel's scoped promotion API. Next keeps its preview alias path.
- Use `apps/www/scripts/vercel-ignore-build.mjs` as the common owner for GitHub and Vercel skip decisions. Preserve source changes after a failed build, including a following Version Packages commit.
- Apply `PLATE_BUILD_BASIC` in the main configuration, build launcher and Turbo environment list. Default and 1 use 4096 MiB and Basic webpack settings. GitHub explicitly sets 0 and uses 8192 MiB with normal caching.
- Keep the Vercel production flag at 1. Reuse the approved Plate-project credential in the existing GitHub environment, restricted to main and next. No credential is retrieved, copied or recreated.
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
- [x] Skip architect and delegated implementation. skip: carried fast instruction.
- [x] Blocking first steps: verify the Plate project, production domains and existing credential. Proof: `docs/plans/artifacts/deploy-www-main/platform-final.json` and run https://github.com/udecode/plate/actions/runs/39270020107.
- [x] Independent workstreams. skip: one workflow and its production promotion have one owner.
- [x] Shared mutable state: serialize main delivery and production promotion. Source: `.github/workflows/deploy.yml`.
- [x] Smallest safe decomposition: port, focused proof, real production build, checked promotion and close. Proof: `19db88833e` and run https://github.com/udecode/plate/actions/runs/39270020107.
- [x] Implement the workflow, shared ignore list and build flag. Source: `.github/workflows/deploy.yml` and `apps/www/scripts/vercel-ignore-build.mjs`.
- [x] "try to apply the lcosest www config, upgrade next to same version etc." Source: `apps/www/package.json` and `apps/www/next.config.ts`; compatible build settings aligned.
- [x] "and rename deploy-www to deploy to both" Proof: main 19db88833e and next 3d14bbb09e; both Deploy workflow runs passed.
- [x] Verify branch decisions, missing history, failed builds, ignored files, flag modes and workflow syntax. Proof: `docs/plans/artifacts/deploy-www-main/skip-a1.log`, `docs/plans/artifacts/deploy-www-main/publish-a1.log`, `docs/plans/artifacts/deploy-www-main/flag-a2.log` and `docs/plans/artifacts/deploy-www-main/actionlint-a1.log`.
- [x] Run writing passes and focused formatting. Direct deslop, unslop and bro passes; scoped Biome proof in `docs/plans/artifacts/deploy-www-main/focused-lint-a1.log`.
- [x] Push main and prove the real GitHub build and staged production upload. Proof: https://github.com/udecode/plate/actions/runs/39270020107 at 19db88833e.
- [x] Verify production promotion, domain identity, HTTP routes and Chrome rendering. Proof: `docs/plans/artifacts/deploy-www-main/production-live-a1.log`, `docs/plans/artifacts/deploy-www-main/registry-source-live-a1.log` and `docs/plans/artifacts/deploy-www-main/main-react-source.png`; Vercel alias points to dpl_sLDRfNDitWr27QLxDtdao2TrGB9T.
- [x] Verify an ignored-only push skips both build entrypoints. Proof: runs 39272324018 and 39272609431; ignored-run-results-a1.log, vercel-ignore-live-history-a1.log and next-vercel-ignore-live-history-a1.log in the run directory.
- [x] "apply to main now. including the ignore list (for both github actions and vercel), and including the vercel flag." Proof: main 19db88833e, Vercel production PLATE_BUILD_BASIC=1, checked promotion and shared ignore script.
- [x] Finish the proof record, page and delivery. Proof: `node .agents/pstack/plan-open.mjs docs/plans/2026-10-19-deploy-www-main.md` and `node .agents/pstack/plan-page.mjs docs/plans/2026-10-19-deploy-www-main.md`; final checked docs delivery.

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
| Ignore-only live run | Main 39272324018 and next 39272609431 skip build, upload and publication; both direct Vercel-ignore replays exit 0 |
| Reviews, no-comments, trail review and reflect | skip: carried fast instruction |
| Package changeset and editor behavior tests | N/A; deployment tooling and private build configuration only |

## Performance and interaction coverage

Source-and-host-readiness applies to the remote production build and checked deployment. The product smoke, Plate/Slate decomposition, owner microbench, mount matrix, trusted editing, example breadth and stress lanes are N/A because this ports deployment tooling, not editor runtime behavior. First and settled editing interactions are N/A. Route scope is home, installation docs, search and registry. The reporter profile is GitHub Ubuntu and the live production site in Chrome. Any elapsed time reported is a single operational observation, not a repeatable speedup claim.

## Verification

- Production [run 39270020107](https://github.com/udecode/plate/actions/runs/39270020107) passed at 19db88833e. The real build used Next 16.3.2 and an 8192 MiB heap. It completed 52 tasks and generated 867 pages. Build time was 8m57s; upload took 1m08s; staged route checks took 20s; publication took 6s. These are single-run observations, not a controlled speed comparison.
- Beta [run 39270089314](https://github.com/udecode/plate/actions/runs/39270089314) passed at 3d14bbb09e after the rename. It built in 3m29s, uploaded in 50s and passed route checks and alias assignment. Chrome rendered the equation preview and Manual installation source. Production Chrome rendered the React installation page, its editor preview and its Code source viewer. HTTP checks parsed actual headings and nonempty search, registry and highlighted-source responses.
- The shared ignore decision, both publication branches, stale-head refusal and default/1/0 flag modes passed focused probes. API responses in those local probes were fixtures, and compilation was intercepted for the heap probe. The real GitHub deployments prove the remote build and API path. The local aggregate remains unpassed under the owner's approved focused-proof waiver. Reviews and no-comments were skipped under fast mode.

## Demo

1. Open the [React installation guide](https://platejs.org/docs/installation/react). The editor preview renders. Select Code to see the generated source files from the promoted deployment.

   ![Production editor preview](./artifacts/deploy-www-main/main-react-preview.png)
   ![Production generated source](./artifacts/deploy-www-main/main-react-source.png)

2. Open the [Math component](https://beta.platejs.org/docs/components/math). The equation preview renders. Select Manual to see the generated installation source.

   ![Beta equation preview](./artifacts/deploy-www-main/beta-renamed-chrome.png)
   ![Beta installation source](./artifacts/deploy-www-main/beta-renamed-manual.png)

## Close

Production and beta use Deploy in deploy.yml. Main aligns Next and third-parties at 16.3.2 and React and React DOM at 19.2.8. The compatible build configuration is ported, while v1 routing and static-rendering contracts remain intact. Generated async docs and per-port caches are ignored locally.

Main commit 19db88833e, chore(www): build production with GitHub Actions, passed the real production build and checked promotion. Next commit 3d14bbb09e, chore(www): rename the deployment workflow on next, passed the beta build and alias checks. Both use the same ignore script. Vercel production has Basic mode 1, and GitHub explicitly uses 0. The paid machine configuration did not change.

The production alias points to dpl_sLDRfNDitWr27QLxDtdao2TrGB9T. Beta points to dpl_AvGEzAKx7DD1nDxLB7nyES1c6WcW. The www redirect, beta branch mapping and pro branch mapping remain as inspected. The aggregate is unpassed, as the owner's waiver allows; no aggregate-green claim is made. Ignored-only runs 39272324018 on main and 39272609431 on next skipped installation, build, upload and publication. Direct Vercel-ignore replays returned 0 for those same ranges. Vercel returned no deployments for either ignored commit, and both live aliases retained their verified deployment IDs.


The follow-up proof commits are a5c30c247b on main, docs(www): record production deployment proof, and 2f23fe08ca on next, docs(www): record the renamed beta deployment workflow. All three explicit asks are complete. The local aggregate remains unpassed under the owner's waiver. No editor-interaction coverage or controlled deployment speedup is claimed. The final docs-only record changes no served application bytes.

All 16 plan steps are closed. Independent reviews, no-comments, trail review and reflect were skipped under fast mode. There is no remaining work in this rollout.
