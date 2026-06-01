# Sync Shadcn

This directory tracks Plate's sync point against upstream `shadcn-ui/ui`
docs in `../shadcn/apps/v4`.

- `status.json` records the current upstream commit baseline.
- `decisions.md` records durable keep/fork/exclude policy for Plate docs.
- `runs/` stores range-specific audits, inventories, patches, and plans.

Use `.agents/skills/sync-shadcn/SKILL.md` before pulling newer upstream
shadcn docs changes into `apps/www`.

The baseline only moves after every upstream change in a range is accounted for
as adopted, smart-merged, intentionally forked, or explicitly excluded.
