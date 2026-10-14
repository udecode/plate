# Gitcrawl

The one home for gitcrawl install and archive commands. `issue-harvester`'s
ledgers and `maintainer`'s `issues` mode use it.

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

Rely only on commands the installed binary lists in `gitcrawl --help`; when
`gitcrawl --version` differs from the baseline above, update this reference's
commands and baseline before relying on new behavior. A changelog entry for an
unreleased command is not a workflow contract until `gitcrawl check-update
--json` and `gitcrawl --version` prove the release exists locally.

`gitcrawl` is the local archive/search/cluster tool. It does not own live PR
readiness anymore. In `0.5.0`, `gitcrawl gh ...` prints an Octopool migration
note instead of serving cached `gh` reads. Use local `gitcrawl search`,
`threads`, `sync`, `neighbors`, `clusters`, `clusters-report`, and
`cluster-detail` for archive work; use Octopool or the real GitHub CLI for
live GitHub reads:

```bash
octopool login
octopool gh api repos/<owner/repo>/issues/<number>
gh issue view <number> --repo <owner/repo> --comments --json number,title,state,url,body,comments,labels,author,closedAt
```

Only replace global `gh` with Octopool when the user asks. Never document
`gitcrawl-gh` as a current workflow unless the installed binary proves that shim
exists again.

## Archive-First Discovery

When `gitcrawl` is available and has the repository's data, use it first for
candidate discovery, duplicate attempts, related closed issues, and cluster neighbors.
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
gitcrawl threads <owner/repo> --numbers <issue-or-pr-ref> --include-closed --json
gitcrawl neighbors <owner/repo> --number <issue-or-pr-ref> --limit 20 --json
gitcrawl search <owner/repo> --query "<title, scope, or failure phrase>" --mode hybrid --limit 20 --json
gitcrawl search issues "<title, scope, or failure phrase>" -R <owner/repo> --state open --sync-if-stale 5m --json number,title,state,url,updatedAt,labels --limit 20
gitcrawl cluster-detail <owner/repo> --id <cluster-id> --member-limit 20 --body-chars 280 --json
gitcrawl cluster-detail <owner/repo> --id <cluster-id> --source run --member-limit 20 --body-chars 280 --json
gitcrawl clusters-report <owner/repo> --sort size --min-size 3 --limit 20 --member-limit 12 --body-chars 280
gitcrawl durable-clusters <owner/repo> --include-closed --json
gitcrawl sync <owner/repo> --numbers <issue-or-pr-ref> --with pr-details --json
gh issue view <issue-number> --repo <owner/repo> --comments --json number,title,state,url,body,comments,labels,author,closedAt
gh pr view <pr-number> --repo <owner/repo> --json number,title,state,url,isDraft,author,headRefName,baseRefName,files,commits,statusCheckRollup
gh pr checks <pr-number> --repo <owner/repo> --json name,state,conclusion,detailsUrl
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
comment on GitHub. Do not use them to hide unresolved issue work unless the
ledger decision already has concrete proof.

If `gitcrawl` is missing, stale, or lacks the repository's data, fall back to
the local ledger and targeted `gh` reads/searches. Treat stale
data as blocking only when the decision depends on it. Note the fallback; do not
block normal triage.

```bash
gh issue view <number> --repo <owner/repo> --comments --json number,title,state,body,comments,labels,url,closedAt
gh search issues --repo <owner/repo> --match title,body --limit 50 -- "<key phrase>"
gh search issues --repo <owner/repo> --match comments --limit 50 -- "<error or maintainer phrase>"
octopool gh api repos/<owner/repo>/issues/<number>
```

Do not assume `gitcrawl` has an API server. The current tool is a local CLI,
SQLite archive, TUI, and optional remote/cloud archive surface. Its old `gh`
shim moved to Octopool.
