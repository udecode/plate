# Release Lane Maintenance

Objective:
TODO: Write the short release-lanes objective under 240 characters.

Goal plan:
TODO: Fill generated plan path.

Template:
docs/plans/templates/release-lanes.md

Primary template:
docs/plans/templates/release-lanes.md

Applied packs:
- none

Completion threshold:
- Requested release lane mode is complete: status, sync, promote, verify, or full.
- `main`/`latest` and `next`/`beta` state is read back from GitHub and npm.
- Direct `main -> next` sync is complete when needed, with known release metadata
  conflicts repaired automatically and beta changesets created for synced
  packages, then versioned before the sync commit is pushed.
- `.changeset/pre.json` exists only on `next`, uses beta pre mode when beta is
  expected to continue, and is restored in the same unskipped sync commit when
  the sync creates beta changesets.
- Release workflows passed or a blocker is recorded with run URLs and logs.
- `node .agents/skills/autogoal/scripts/check-complete.mjs <this plan>` passes.

Verification surface:
- `git fetch origin main next`
- `node tooling/scripts/release-branch-prs.mjs sync-main-to-next --dry-run`
- `node tooling/scripts/release-branch-prs.mjs sync-main-to-next --push` when sync applies
- `node tooling/scripts/release-branch-prs.mjs verify-main-to-next-sync`
- `gh run list`, `gh run watch`, and `gh run view --log` for release/promote workflows
- `npm view platejs dist-tags --json`
- `npm view platejs@latest version`
- `npm view platejs@beta version`

Constraints:
- Do not publish manually with `npm publish`.
- Do not commit `.changeset/pre.json` to `main`.
- Do not push a direct `next` sync commit with beta changesets unless beta pre
  mode is present in that same commit.
- Do not leave generated beta changeset files waiting for a Version Packages PR
  in the direct sync lane; version them before pushing.
- Do not trigger `release.yml` from a direct sync commit that has no versioned
  beta package changes to publish.
- Do not run a real direct sync from a dirty checkout.
- Do not squash or rebase `next -> main` promotion PRs.
- Do not create routine `main -> next` sync PRs.
- Stop for source conflicts outside known release metadata.

Boundaries:
- Allowed branches: `main`, `next`, promote PR from `next -> main`.
- Allowed release files: package manifests, changelogs, `.changeset/pre.json`,
  generated beta sync changesets, release workflow/scripts.
- Non-goals: feature code changes, package source edits unrelated to release
  lane repair, manual npm publication.

Output budget strategy:
- Keep workflow logs capped to failing sections or grep excerpts.
- Record URLs for long logs instead of pasting full logs.

Blocked condition:
- Missing auth, rejected protected branch mutation, real source conflict,
  failed release workflow after one repair attempt, or npm/GitHub release state
  mismatch.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | pending | pending |
| Active goal checked or created | pending | pending |
| Requested mode classified | pending | status / sync / promote / verify / full |
| Remote state fetched | pending | `git fetch origin main next` result |
| Release auth available | pending | `gh auth status` and npm read capability, or N/A for dry status |
| Current lane state read | pending | main SHA, next SHA, pre mode, npm dist-tags |

Work Checklist:
- [ ] Explicit user requirements copied into this plan.
- [ ] Current `main`, `next`, npm, GitHub release, and workflow state recorded.
- [ ] Promotion PR reviewed or marked N/A.
- [ ] Stable release workflow watched or marked N/A.
- [ ] Direct `main -> next` sync dry run completed or marked N/A.
- [ ] Clean checkout verified by the direct sync script before any real push, or
      N/A because only dry-run/status was requested.
- [ ] Direct sync pushed to `next` when needed or blocker recorded.
- [ ] Known release metadata conflicts auto-resolved by script or N/A.
- [ ] Beta changesets created for packages changed by synced `main` commits or N/A.
- [ ] Generated beta sync changesets versioned before push, or N/A because no
      package changes were synced.
- [ ] Direct sync commit message triggers release only when versioned beta
      package changes exist; otherwise it includes `[skip release]`.
- [ ] Beta pre mode exists on `next` in the sync commit, or standalone re-entry
      is N/A because no beta publication is pending.
- [ ] Beta release workflow watched when beta publication is expected.
- [ ] npm `latest` and `beta` read back.
- [ ] Stale `sync/main-to-next` PRs closed after direct sync, or N/A.
- [ ] Release-lane review completed: no wrong tag, wrong branch, missing pre
      state, unmerged source conflict, or unpublished expected package remains.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Direct sync needed | pending | Compare `origin/next..origin/main` | pending |
| Direct sync result | pending | Run direct sync or record no-op | pending |
| Sync merge verification | pending | Run `verify-main-to-next-sync` on merge commit | pending |
| Beta pre mode | pending | Read `.changeset/pre.json` on `next` | pending |
| Latest release state | pending | Read GitHub release and npm `latest` | pending |
| Beta release state | pending | Read release workflow and npm `beta` | pending |
| Stale sync PR cleanup | pending | Close stale sync PRs or record N/A | pending |
| Autoreview | pending | Review release-lane result and close accepted findings | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs <this plan>` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| State read | pending | | Decide sync/promote/verify |
| Promote stable | pending | | Sync main to next |
| Direct sync | pending | | Re-enter beta |
| Beta release | pending | | Verify npm/GitHub |
| Cleanup and closeout | pending | | Final handoff |

Findings:
- None yet.

Timeline:
- TODO: Record each command, run URL, push SHA, and release readback.

Decisions and tradeoffs:
- Direct sync is the default because routine release metadata conflicts are
  deterministic machinery, not human review material.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- Pending.

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
|-------------|-------------------|-------------------|---------------|------------|
| TODO | TODO | TODO | TODO | TODO |

Open risks:
- Pending.
