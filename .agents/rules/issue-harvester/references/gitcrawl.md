# Gitcrawl

The one home for gitcrawl install, update and archive commands. The Slate
claims mode and the issue ledgers both use it.

## Install And CLI Baseline

Use the Homebrew tap install unless the user explicitly asks for a source build:

```bash
brew install openclaw/tap/gitcrawl
gitcrawl --version
gitcrawl check-update --json
gitcrawl doctor --json
gitcrawl status --json
```

If Homebrew reports that `gitcrawl` is shadowed by an older local build, fix the
PATH entry or call the brewed binary directly. The normal brewed path is:

```bash
/opt/homebrew/bin/gitcrawl
```

Current stable release baseline: `0.5.0`. Stable control probes:

```bash
gitcrawl check-update --json
gitcrawl metadata --json
gitcrawl status --json
gitcrawl doctor --json
```

Use `status --json` for fast archive inventory and `doctor --json` when token,
config, DB health, model, or sync freshness matter. `metadata --json` is the
crawlkit control manifest for launchers/automation.

`gitcrawl` is the local archive/search/cluster tool. It does not own live PR
readiness anymore. In `0.5.0`, `gitcrawl gh ...` prints an Octopool migration
note instead of serving cached `gh` reads. Use local `gitcrawl search`,
`threads`, `sync`, `neighbors`, `clusters`, `clusters-report`, and
`cluster-detail` for archive work; use Octopool or the real GitHub CLI for
live GitHub reads:

```bash
octopool login
octopool gh api repos/ianstormtaylor/slate/issues/<number>
gh issue view <number> --repo ianstormtaylor/slate --comments --json number,title,state,url,body,comments,labels,author,closedAt
```

Only replace global `gh` with Octopool when the user asks. Never document
`gitcrawl-gh` as a current workflow unless the installed binary proves that shim
exists again.

## `<update>` Mode

When the argument is exactly `<update>`, run a gitcrawl tooling refresh
instead of issue triage. Do not process issues, edit ledgers, or update PR
claims in this mode.

Update flow:

1. Update the Homebrew tap metadata and installed binary:

   ```bash
   brew update
   brew upgrade openclaw/tap/gitcrawl || brew install openclaw/tap/gitcrawl
   gitcrawl --version
   gitcrawl check-update --json
   gitcrawl doctor --json
   gitcrawl status --json
   ```

2. If `gitcrawl` is shadowed by an older local source-build symlink, either
   retarget that symlink to `/opt/homebrew/bin/gitcrawl` when it is clearly
   agent-owned, or record the shadowing caveat and call `/opt/homebrew/bin/gitcrawl`
   directly.
3. Inspect the updated API surface from the installed binary:

   ```bash
   gitcrawl --help
   gitcrawl help sync
   gitcrawl help search
   gitcrawl help clusters-report
   gitcrawl help remote
   gitcrawl help cloud
   gitcrawl metadata --json
   gitcrawl status --json
   gitcrawl doctor --json
   gitcrawl gh issue view 1 -R ianstormtaylor/slate --json number
   gitcrawl search issues "composition" -R ianstormtaylor/slate --state open --json number,title,state,url --limit 2
   ```

4. If `../gitcrawl` exists, scan the fresh repo docs and skill for new command
   shapes before editing this rule:

   ```bash
   git -C ../gitcrawl pull --ff-only
   sed -n '1,220p' ../gitcrawl/docs/installation.md
   sed -n '1,260p' ../gitcrawl/docs/commands.md
   sed -n '1,260p' ../gitcrawl/docs/gh-shim.md
   sed -n '1,260p' ../gitcrawl/.agents/skills/gitcrawl/SKILL.md
   sed -n '1,220p' ../gitcrawl/CHANGELOG.md
   ```

5. Update this reference for new or changed gitcrawl install,
   command, JSON, sync, search, cluster, remote/cloud, TUI, or gh-migration
   behavior. Also update the stable baseline version above when the brewed
   version changes.

If a new gitcrawl release documents commands that are only on `main` and not in
the brewed binary, record them as optional future probes instead of making the
Slate claims workflow depend on them. An unreleased changelog entry is not a
workflow contract until `gitcrawl check-update --json` and `gitcrawl --version`
prove the release exists locally.

## Archive-First Discovery

When `gitcrawl` is available and has Slate data, use it first for candidate
discovery, duplicate attempts, related closed issues, and cluster neighbors.
Treat it as candidate generation only.

Start with local readiness and freshness:

```bash
gitcrawl status --json
gitcrawl doctor --json
```

A missing GitHub token blocks `sync` and live shim fallthroughs;
it does not block read-only archive inspection when the local database already
has the needed rows.

Useful shapes:

```bash
gitcrawl threads ianstormtaylor/slate --numbers <issue-or-pr-ref> --include-closed --json
gitcrawl neighbors ianstormtaylor/slate --number <issue-or-pr-ref> --limit 20 --json
gitcrawl search ianstormtaylor/slate --query "<title, scope, or failure phrase>" --mode hybrid --limit 20 --json
gitcrawl search issues "<title, scope, or failure phrase>" -R ianstormtaylor/slate --state open --sync-if-stale 5m --json number,title,state,url,updatedAt,labels --limit 20
gitcrawl cluster-detail ianstormtaylor/slate --id <cluster-id> --member-limit 20 --body-chars 280 --json
gitcrawl cluster-detail ianstormtaylor/slate --id <cluster-id> --source run --member-limit 20 --body-chars 280 --json
gitcrawl clusters-report ianstormtaylor/slate --sort size --min-size 3 --limit 20 --member-limit 12 --body-chars 280
gitcrawl durable-clusters ianstormtaylor/slate --include-closed --json
gitcrawl sync ianstormtaylor/slate --numbers <issue-or-pr-ref> --with pr-details --json
gh issue view <issue-number> --repo ianstormtaylor/slate --comments --json number,title,state,url,body,comments,labels,author,closedAt
gh pr view <pr-number> --repo ianstormtaylor/slate --json number,title,state,url,isDraft,author,headRefName,baseRefName,files,commits,statusCheckRollup
gh pr checks <pr-number> --repo ianstormtaylor/slate --json name,state,conclusion,detailsUrl
```

Use `sync --numbers` for exact row hydration before a duplicate, stale, or
closure decision that depends on comments, PR detail, or fresh state. Use
`search issues ... --sync-if-stale <duration>` for ad-hoc candidate discovery
where a bounded staleness window is enough.

Thread references can be bare numbers, `#123`, `issues/123`, `pull/123`,
`owner/repo#123`, or full GitHub issue/PR URLs. Prefer full URLs when moving
evidence between repos or docs because they carry their own scope.

`gitcrawl gh` is not the PR triage path in the `0.5.0` workflow. It moved to
Octopool and prints a migration note. Use local `gitcrawl` for archive
provenance and real `gh` or `octopool gh` for PR readiness, current comments,
checks, and final live-state decisions.

Local governance commands (`close-thread`, `close-cluster`,
`exclude-cluster-member`, `include-cluster-member`, `set-cluster-canonical`) are
allowed only for local gitcrawl maintainer state. They never close, label, or
comment on GitHub. Do not use them to hide unresolved Slate issue work unless
the ledger decision already has concrete proof.

If `gitcrawl` is missing, stale, or lacks Slate data, fall back to the local
ledger, `docs/plite-issues/**`, and targeted `gh` reads/searches. Treat stale
data as blocking only when the decision depends on it. Note the fallback; do not
block normal triage.

```bash
gh issue view <number> --repo ianstormtaylor/slate --comments --json number,title,state,body,comments,labels,url,closedAt
gh search issues --repo ianstormtaylor/slate --match title,body --limit 50 -- "<key phrase>"
gh search issues --repo ianstormtaylor/slate --match comments --limit 50 -- "<error or maintainer phrase>"
octopool gh api repos/ianstormtaylor/slate/issues/<number>
```

Do not assume `gitcrawl` has an API server. The current tool is a local CLI,
SQLite archive, TUI, and optional remote/cloud archive surface. Its old `gh`
shim moved to Octopool.
