---
description: Sync upstream shadcn docs into Plate with full source inventory, fork-aware planning, review, dashboards, accepted apply and exact baseline accounting.
name: sync-shadcn
metadata:
  skiller:
    source: .agents/rules/sync-shadcn.mdc
---

# Sync Shadcn

Handle $ARGUMENTS. Apply [the Plate workflow](../task/references/workflow.md)
and read the complete [sync policy](./references/policy.md), then the selected
mode below. Task owns lifecycle and existing authority; this skill owns
upstream range accounting, Plate forks, slice decisions and sync state.

Plate's docs app is a forked product. Upstream owns the Fumadocs/shadcn docs
architecture; Plate owns editor content, demos, registry, API MDX, CN docs,
MCP, Plate Plus hooks, GA and intentional forks. Keep that ownership explicit.

## Modes

| Request | Complete method |
| --- | --- |
| No command, a range or a named surface | [Planning and implementation handoff](./references/planning.md) |
| `status` | [Incremental status and discovery](./references/status.md) |
| `apply` | [Accepted slice application](./references/apply.md) |
| `dashboard` | [Review board](./references/dashboard.md) |
| `review` | [Re-audit the current plan](./references/review.md) |

Named scope constrains the inventory. An unscoped sync inventories the whole
tracked range. Read `docs/sync/shadcn/status.json` and `decisions.md` before
classifying current source. Record exact upstream SHAs and every relevant row.

Planning is the default. Explicit planning-only work stops at the reviewable
plan. Already-authorized implementation continues when readiness is resolved;
do not ask for a second invocation. The full policy defines the narrow
micro-overlap rule; it never overrides an explicit read-only request.

Apply and revalidate only accepted rows. Preserve source-owned forks and real
route proof. Advance `lastSyncedCommit` only after complete range accounting
and applicable verification. A partial slice cannot claim the whole range.

All procedures, examples, inventory shapes, commands and prompts live in the
linked mode references. Read them in full when selected. Do not replace them
with the entrypoint summary or create a parallel sync ledger.
