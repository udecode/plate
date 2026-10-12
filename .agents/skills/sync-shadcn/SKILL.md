---
description: Sync upstream shadcn docs or registry protocol into Plate with exact source ranges, preserved forks, accepted apply rows and complete baseline accounting.
argument-hint: '[status | apply | dashboard | review | parity <surface> | <range>]'
name: sync-shadcn
metadata:
  skiller:
    source: .agents/rules/sync-shadcn.mdc
---

# Sync Shadcn

Read `docs/sync/shadcn/status.json` and `decisions.md` when present, the exact
upstream local checkout and its revision, and the named Plate files. Bootstrap
missing sync state from evidence; never invent a last-applied baseline.

Planning is default. An explicit planning-only request stops at a reviewable
plan. Existing implementation authority carries through readiness. Scope a
named request to its range; an unscoped sync accounts for the complete range.

Compare base, current upstream and local files. Classify each relevant hunk as
upstream-only, local-only, equivalent, conflicting, renamed, deleted or unknown
base. Preserve Plate-owned editor content, demos, registry, API MDX, Chinese
docs, MCP, Plus hooks and analytics. Upstream owns its generic docs machinery.

`status` reports freshness, accounted range and next work without mutation.
`review` revalidates a plan against both current revisions. `dashboard` presents
unresolved structured rows through the existing board script. `apply` changes
only accepted rows after recomputing their classification. Keep target forks
and named omissions explicit; no whole-file overwrite from title similarity.

`parity` compares the real registry/install request, response, metadata and
CLI behavior source by source. Prove declared dependency and alias behavior
through an installed consumer. This checkout's authored registry metadata is
the owner; do not assume an absent dependency-derivation builder.

Record each source row, its Plate home, decision, proof and remaining gap.
Advance the synced baseline only after every row in that range is accounted
for and applicable checks pass. Partial slices retain the earlier baseline.
Run `plate-docs` for public docs, `plate-ui` for copied UI, `verify` for routes
and consumers, and `changeset` for registry release notes. CI owns registry
build output. Downstream application UI sync belongs to `sync-plate-ui`.
