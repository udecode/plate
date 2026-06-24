# Deploy Next To Vercel

Objective:
Deploy the current `next` checkout to Vercel and keep fixing concrete blockers until the latest `next` deployment for the `plate` project is `READY`.

Completion threshold:
The task is complete when the deploy-equivalent `apps/www` production build passes locally, the necessary source fixes are committed and pushed to `origin/next`, the latest Vercel deployment for `next` reaches `READY`, and this plan passes `autogoal` completion.

Verification surface:
- `bun test packages/core/src/react/editor/createPlateRuntimeEditor.spec.ts --test-name-pattern "root .* overrides"`
- `pnpm turbo typecheck --filter=./packages/core`
- `pnpm turbo build --filter=./apps/www`
- Vercel deployment status for team `udecode`, project `plate`, branch `next`
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-23-deploy-next-to-vercel.md`

Constraints:
- Work directly on the current `next` checkout.
- Do not create a PR.
- Fix deploy blockers at source owner boundaries, not generated output.
- Restore local `apps/www/public/r/**` registry build churn before committing.
- Keep the known Turbopack NFT warning as a caveat unless it becomes a deploy error.

Boundaries:
- Source of truth: current checkout plus Vercel deployment logs/status for `origin/next`.
- Allowed edit scope: source files needed for the Vercel build, focused tests, and this autogoal plan.
- Browser surface: deployed docs/app build; local production build is the first gate, Vercel `READY` is the final gate.
- Tracker sync: N/A, user asked for deploy only.
- Non-goals: no PR, no broad Plate migration cleanup, no registry-output commit.

Blocked condition:
Only block if Vercel auth/project access fails, Vercel returns a non-source infrastructure failure that cannot be repaired locally, or repeated deploy failures point at a decision outside this deploy lane.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | User asked to deploy `next` using Vercel and fix failures until deploy succeeds. |
| Timed checkpoint parsed | no | No duration requested. |
| Active goal created | yes | Active goal created for Vercel deployment readiness. |
| Source owner read | yes | Read `withPlate.ts`, `createPlateRuntimeEditor.ts`, `table-node.tsx`, and focused tests. |
| Browser tool decision | yes | Vercel deployment status is the final browser/deploy proof; local Next production build is the pre-push gate. |
| PR expectation decision | yes | No PR; direct push to `next`. |
| Output budget strategy recorded | yes | Command output capped; large status/diff output summarized in chat and plan. |

Work Checklist:
- [x] Captured the explicit deploy requirement and final `READY` stop condition.
- [x] Reproduced the existing failing Vercel class locally with `pnpm turbo build --filter=./apps/www`.
- [x] Fixed source files required by the app production build instead of generated registry JSON.
- [x] Added focused runtime coverage for `runtime: 'plite'` root `override.enabled`.
- [x] Ran focused unit proof and core typecheck.
- [x] Ran the deploy-equivalent `apps/www` production build to completion.
- [x] Restored generated registry build output before staging.
- [x] Recorded remaining caveats and Vercel proof path.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Named verification threshold | yes | Focused test, core typecheck, and `apps/www` production build passed locally. |
| Bug reproduced before fix | yes | Local app build failed on `/blocks/editor-ai` static table assumptions and `/blocks/playground` unsupported runtime `override`. |
| Targeted behavior verification | yes | Focused runtime override test passed. |
| TypeScript or typed config changed | yes | `pnpm turbo typecheck --filter=./packages/core` passed. |
| Package exports or file layout changed | no | No export/barrel layout change in this deploy patch. |
| Package manifests or install graph changed | no | No manifest or lockfile edit. |
| Browser surface changed | yes | `pnpm turbo build --filter=./apps/www` generated all 1,045 static pages; Vercel status remains final proof. |
| CI-controlled output changed | yes | `apps/www/public/r/**` build churn restored before commit. |
| Package behavior or public API changed | yes | Runtime `createPlateEditor({ runtime: 'plite', override })` support repaired as existing Plate API compatibility; no changeset for deploy fix. |
| High-risk mini gate | yes | Runtime option acceptance changed; risk is accidental acceptance of unsupported root APIs. Guard still rejects `api`, `editor`, `extendEditor`, `normalizeInitialValue`, `priority`, and `skipInitialization`. |
| Autoreview for non-trivial implementation | no | Deploy emergency path; focused tests and Vercel proof are required. |
| PR create or update | no | Direct push to `next`; no PR requested. |
| Final lint | no | No lint-only churn; focused typecheck and build are the deploy gates. |
| Goal plan complete | yes | This file records final local evidence and will be checked before closeout. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read Vercel failure and local source owners | implementation |
| Implementation | complete | Patched runtime option plumbing, table static preview guards, and focused test | verification |
| Verification | complete | Focused test, core typecheck, and app production build passed | push |
| Push / deploy | complete | Commit `5315571196b7b57064f58191512bcbf50403bc44` pushed to `origin/next`; Vercel deployment `dpl_4G797KVCxfzRQ3vH2zHgVCFKuHpf` reached `READY` | closeout |
| Closeout | complete | Deployed URL and branch alias returned HTTP 200 for `/docs/plite` | final response |

Findings:
- Vercel failed because the pushed `next` commit did not include source files required by the Plite/Plate runtime migration.
- Local app build then exposed two static-render blockers: table preview code assumed `colSizes` existed, and runtime `createPlateEditor` rejected the existing root `override` option used by `/blocks/playground`.

Decisions and tradeoffs:
- Keep registry JSON out of the commit path because `apps/www` regenerates it during build.
- Support root `override` on the Plite runtime route because the runtime resolver already owns plugin/component/enabled overrides; the unsupported guard was stale.
- Keep unsupported root API mutations rejected to avoid pretending full legacy root mutation parity exists.

Implementation notes:
- `TableElement` and `useTableResizeController` normalize missing `useTableColSizes()` to `[]`.
- `createPlateEditor({ runtime: 'plite' })` now accepts `override` and merges root `components` in the same order as legacy Plate.
- Added a focused test for runtime root enabled overrides.

Review fixes:
- Restored local generated registry output from `apps/www/public/r/**` before staging.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Remote Vercel deploy missing source files | 1 | Commit current source checkout instead of relying on local files | In progress |
| Local app build `/blocks/editor-ai` `.length` / `.map` crash | 2 | Normalize missing table column sizes | Resolved by local app build |
| Local app build `/blocks/playground` unsupported `override` | 1 | Route root `override` through runtime plugin list | Resolved by local app build |

Verification evidence:
- `bun test packages/core/src/react/editor/createPlateRuntimeEditor.spec.ts --test-name-pattern "root .* overrides"`: 2 pass, 0 fail.
- `pnpm turbo typecheck --filter=./packages/core`: passed.
- `pnpm turbo build --filter=./apps/www`: passed; 59 tasks successful; 1,045 static pages generated.
- `git push origin next`: pushed commit `5315571196b7b57064f58191512bcbf50403bc44`.
- Vercel deployment `dpl_4G797KVCxfzRQ3vH2zHgVCFKuHpf`: `READY`.
- `curl -I https://plate-o42jxd090-udecode.vercel.app/docs/plite`: HTTP 200.
- `curl -I https://plate-git-next-udecode.vercel.app/docs/plite`: HTTP 200.
- Known warning: Turbopack NFT trace warning from `apps/www/next.config.ts` through `rehype-utils.ts` to `api/registry-source/[name]/route.ts`; not a build failure.

Reboot status:
Complete. Current thread can hand off the deployed `next` URL and proof.

Open risks:
- `pnpm --filter www typecheck` was not the deploy gate and has broader Plate runtime migration debt; do not claim it passed.
- Vercel may expose an environment-only failure after push; fetch logs and patch source if that happens.

Final handoff contract:
- Include deployed URL/status, commit hash, changed-list summary, commands run, remaining caveats, and Vercel proof.
