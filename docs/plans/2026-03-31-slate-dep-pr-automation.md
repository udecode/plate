# Slate dependency PR automation

## Goal

Auto-sync Slate package updates to `main` with one reusable changeset, without pulling in a full dependency bot rollout.

## Scope

- add one scheduled GitHub Actions workflow
- update only `slate`, `slate-dom`, `slate-react`, `slate-hyperscript`
- push matching manifest + lockfile changes directly to `main`
- keep one reusable `.changeset/slate.md`

## Findings

- No existing `dependabot.yml` or Renovate config in repo.
- Existing release workflow skips on commit messages containing `[skip release]`.
- Direct Slate pins live in:
  - `packages/core/package.json`
  - `packages/slate/package.json`
  - `packages/test-utils/package.json`
  - `apps/www/package.json`
- Dependabot grouping is awkward for the exact requested one-sync-across-manifests shape.
- `package.json` `deps:check` / `deps:update` point at `config/ncurc.yml`, but actual repo config lives at `tooling/config/.ncurc.yml`.
- Release prep already auto-generates dependent package changesets from one manual changeset, so one stable `.changeset/slate.md` is enough.

## Plan

1. Add a scheduled workflow dedicated to Slate dependency bumps.
2. Use `npm-check-updates` with a narrow filter so only Slate packages move.
3. Install once to refresh lockfiles.
4. Create or refresh `.changeset/slate.md` only when dependency files changed.
5. Commit and push to `main` with `[skip release]`.
6. Verify workflow YAML parses and the command shape is sane.

## Progress

- 2026-03-31: Repo + docs research done. Chose custom workflow over Dependabot.
- 2026-03-31: Added `.github/workflows/slate-deps-pr.yml` with Brussels-8am scheduling + manual dispatch.
- 2026-03-31: Verified workflow YAML parses with Ruby `YAML.load_file`.
- 2026-03-31: Verified the exact `npm-check-updates` filter/flags with `--jsonUpgraded`; it targets `apps/www`, `packages/core`, `packages/slate`, and `packages/test-utils`.
- 2026-03-31: Switched from PR creation to direct push on `main` with one stable `.changeset/slate.md`.
- 2026-03-31: Added a short workflow learning doc under `docs/solutions/workflow-issues/`.
