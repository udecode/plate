---
description: Review or sync a live Plate package, file or API path against the published Slate-based framework and repair accepted findings.
argument-hint: '[sync [package] | <package, file or API path>]'
name: plate-next
metadata:
  skiller:
    source: .agents/rules/plate-next.mdc
---

# Plate Next

Read `VISION.md`, then run the Refactoring playbook's package review method in
`.agents/playbooks/refactoring.md`. The name is the shared entrypoint; this
checkout's actual packages and public contracts define the target.

For review, inventory the bounded package, its exports, callers, tests and
docs. Report defects without editing. For `sync`, repair accepted defects in
the actual owner, migrate affected callers and prove the result through
`verify`. A package cleanup must deliver concrete user, API or docs value.

Use `best-api` for a public shape decision, `plate-plugins` for package/plugin
implementation, `plate-ui` for React or registry choices and `plate-docs` for
public teaching. Regenerate barrels and skills where applicable.
