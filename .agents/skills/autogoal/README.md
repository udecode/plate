# Autogoal

Native goals require a direct or applicable standing user request. Long-running work preserves every applicable source-linked checklist obligation in one plan and reconciles the original checklists before closure. Short work checks its applicable requirements directly. The same file helpers support ordinary plans without creating a goal.

Use create-goal-scratchpad.mjs with --title and a project or builtin --template. Repeated/comma-separated --with selects only relevant packs; --ticket, --date, --slug, --path and --force remain supported. Existing files are preserved unless forced. Stdout prints the relative result path.

create-goal-template.mjs supports --skill/--path, --from, --print and --force. Templates resolve from the project first. init-templates.mjs is an explicit opt-in initializer; ordinary creation does not seed every template. The shared major-task template name remains for external callers, without creating a second task lifecycle.

check-complete.mjs accepts one docs/plans path. It rejects missing concrete obligations/evidence, unfinished checkboxes throughout the plan, unresolved optional legacy gate tables, and missing/incomplete/cyclic linked children. Fenced examples and comments are excluded. Phase/Reboot tables are optional. The checker cannot detect a requirement omitted from the plan; source-to-plan reconciliation and real proof remain required.
