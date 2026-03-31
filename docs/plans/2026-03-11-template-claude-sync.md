# Template `.claude` Sync

## Goal

Sync the stale template `.claude` directories with the current root `.claude` layout and content.

Targets:

- `templates/plate-template/.claude`
- `templates/plate-playground-template/.claude`

## Checklist

- [completed] Audit root `.claude` vs template `.claude`
- [completed] Sync relevant root `.claude` files into both templates
- [completed] Remove stale template-only `.claude/rules` layout
- [completed] Verify the templates match root `.claude` except intentionally excluded local plan logs

## Findings

- Template `.claude` still uses the old `rules/` layout.
- Root `.claude/AGENTS.md` references files the template `.claude` does not currently contain, including `.claude/commands/*` and `docs/solutions/style.md`.
- Both templates are stale in the same way.
- Root `.claude/settings.local.json` contains only media toggles, no secrets.

## Sync policy

- Mirror root `.claude` into both templates.
- Exclude `docs/plans/` from templates because those are repo-local execution logs, not template config.

## Result

- Synced both `templates/plate-template/.claude` and `templates/plate-playground-template/.claude`.
- Removed stale `rules/` layout from both templates.
- Added missing root-level `.claude` files the template `AGENTS.md` depends on, including `commands/`, `docs/solutions/style.md`, `settings.local.json`, and the current `skills/` tree.
