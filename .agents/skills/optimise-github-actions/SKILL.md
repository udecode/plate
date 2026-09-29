---
name: optimise-github-actions
description: Optimise GitHub Actions for cost and speed. Reads the billed minutes and wall-clock time of every workflow and job from the GitHub API, finds the waste, and changes the workflows without dropping the checks that matter. Typical waste is main re-running suites the pull request already passed, path filters that match every PR, small matrix jobs, missing caches, draft pushes, Docker builds, Windows and macOS multipliers, hung jobs and bots. Use this whenever the user says CI is slow or expensive, is over their Actions quota or paying overage, wants to "reduce GitHub Actions minutes", "speed up CI" or "make CI cheaper", asks "why is our CI so expensive", or wants a CI audit. Use it even if they only point at one slow job or one workflow file.
---

# Optimise GitHub Actions

Billed time and wall-clock time are different numbers, and most CI waste lives between them. A 5-way matrix that finishes in 2 minutes bills 10 or more. A 5-second job bills a whole minute. A merge to main can re-run every suite the pull request already passed. So measure first, then cut the biggest items, and keep the checks that guard what you ship.

Speed and cost usually move together, but not always. Caches and removing duplicate work help both. Splitting a long job into parallel shards makes CI faster and more expensive, because each shard pays setup again. Merging small jobs does the reverse. Ask which one the user cares about, or say which way each change goes.

## 1. Measure

Run the script in this skill's folder:

```bash
node <skill-dir>/scripts/measure.mjs OWNER/REPO --days 14 --out jobs.json
```

It needs `gh` with read access and nothing more. It prints:

- total billed minutes, a monthly estimate, the minutes lost to rounding, and cancelled and failed minutes
- one table by workflow and event, and one by job with the share of runs each job ran in
- median and p90 wall-clock time of successful runs
- how many runs each PR branch starts

`jobs.json` keeps the raw rows for follow-up questions. A busy repo takes a few minutes. On a public repository standard runners are free, so treat the numbers as runner time and work on speed.

To see where time goes inside a job, print the step timings of one typical run:

```bash
gh api repos/OWNER/REPO/actions/runs/RUN_ID/jobs --paginate \
  -q '.jobs[] | .name, (.steps[] | select(.started_at) | "  \((.completed_at|fromdate)-(.started_at|fromdate))s \(.name)")'
```

The org plan sets the included minutes and whether merge queue is available. Check it with `gh api orgs/ORG -q .plan.name`.

## 2. Learn what each job protects

Read these before you propose anything.

- Each workflow's triggers, `concurrency`, path filters and `needs:` graph. The longest `needs:` chain is the critical path, and only a shorter critical path makes CI faster.
- Required status checks. Run `gh api repos/OWNER/REPO/rulesets`, read each ruleset by id, and run `gh api repos/OWNER/REPO/branches/main/protection`. If you rename or remove a required check, every merge blocks.
- Whether "require branches to be up to date" is on. The API calls it `strict`. It decides how much a run on main still catches after a merge.
- Tests that parse the workflow files. Find them with `grep -rln "workflows/" --include='*.test.*' .`. Many repos assert the CI layout in unit tests, and those tests fail on the first change.
- What deploys use, such as image tags, release artifacts or a "CI passed" status. CI must still build and check everything a deploy relies on.

## 3. Find the waste

Rank by the numbers from step 1. Each pattern below says how to spot it and how to fix it.

**Main re-runs the pull request's suites.** The same jobs show up under `push` and `pull_request`. If every merge comes from a PR that already passed, keep a fast check and the build and publish steps on push, and drop the heavy suites. Tell the user what they give up. With `strict` off, a merge result nobody tested can break main, and the next PR will show it.

**Path filters that match almost every PR.** A job that ran in 80 to 100% of PR runs has a filter that filters nothing. Replay the filter over real PR file lists from `gh api repos/OWNER/REPO/pulls/N/files` and count which pattern matches most often. The usual causes are a manifest or lockfile that every PR touches for a version bump, a broad `src/**` in a narrow job's rule, and the workflow file itself. To spot a version-only bump, compare the file at the merge base and at the head with the `version` fields removed. Let docs-only changes skip CI with `paths-ignore`.

**Many small jobs.** Every job pays for checkout, toolchain and dependency install, often 30 to 60 seconds, and then rounds up to a whole minute. If rounding adds more than about 10%, the jobs are too small. Merge matrix legs whose work takes about as long as their setup into one job with sequential steps, and put `if: ${{ !cancelled() }}` on each step so every case still reports when one fails. Keep long legs parallel. Move one-step jobs into a neighbour job that already checks out the code.

**Slow dependency installs.** Compare the install step with the rest of the job in the step timings. Turn on the setup action's cache, for example `cache: npm` in `actions/setup-node` or `cache: pip` in `actions/setup-python`, or use `actions/cache` keyed on the lockfile. Install only the packages the job uses. Keep `fetch-depth: 1`, the default, unless the job reads git history.

**Every push to a PR runs everything.** Many runs per branch and many cancelled minutes mean thrown-away work. Key `concurrency` per PR and set `cancel-in-progress: true`. Skip the heavy suites on drafts with `if: ... && !github.event.pull_request.draft`, and add `ready_for_review` to the `pull_request` types so they run when the PR is ready. This saves nothing if the team never opens drafts, so check before you promise it.

**Hung jobs.** A job with no `timeout-minutes` can run for 6 hours. Look for jobs whose longest run is far above their average, and set a timeout a little above their normal p90.

**Docker image builds.** Watch for long build steps and a long `Post Set up Docker Buildx` step, which is the cache export. Install dependencies before `COPY . .`. Avoid `cache-to: mode=max` across many scopes, because the repo's 10 GB cache then evicts itself. Look for PR builds that repeat what main builds anyway. A good trade is to build images on PRs only when the Dockerfile, a lockfile or a file the Dockerfile copies by name changes, and to test the exact image main publishes before you tag it for release. Then nothing ships untested.

**Windows and macOS runners.** Windows bills 2 times the Linux rate and macOS 10 times. Run them only for platform-specific code, and don't run them again on main.

**Bots and schedules.** Copilot code review and Dependabot run under the `dynamic` event, and cron workflows under `schedule`. Both use the same minutes. Check the cron frequency and how often people re-request reviews.

**Self-hosted runners.** Jobs on an existing self-hosted group leave the bill. Before you move any job, the person who runs those machines has to confirm capacity, architecture (arm64 or x64) and access to package registries. Suggest the move, and wait for that answer.

**Merge queue.** It runs the full suite once per merge instead of once per PR push, which is often the biggest single saving. Private repositories need GitHub Enterprise Cloud for it, so check the plan first.

## 4. Estimate before you edit

Replay each change over the measured data. Multiply removed jobs by their billed minutes, compare filter selection rates before and after, add up the setup that merging saves, and compare the critical path before and after. Show a table with the change, minutes saved, time saved and risk, and let the user pick. Keep the estimates low. Mark a saving that depends on how the team works, such as drafts, as unmeasured.

## 5. Change the workflows safely

- Keep each change small. Add a comment in the workflow that says why, so the next person doesn't undo it.
- Update the tests that assert the workflow layout. Add a test only for behaviour that can break, like the version-only filter or drafts skipping heavy suites. Don't add tests that repeat the YAML.
- Lint with `actionlint`, downloading a release binary if it's missing, and run the repo's CI tests locally.
- Push and watch the PR. A workflow change usually starts every job, so its first run costs the most.

## Report

Start with the numbers, then the plan.

```markdown
## Where the minutes and time go (last N days)
Total billed, monthly estimate, included minutes if known, median and p90 run time.
| Area | Minutes | Share |    (by workflow and event)
| Job | Share |                (top 5 jobs)

## Why
Numbered causes, each tied to a number from the data.

## Changes
| # | Change | Saves (min) | Saves (time) | Risk |

## Not done
What you skipped and why, such as required check names, runner capacity nobody confirmed, or plan limits.
```
