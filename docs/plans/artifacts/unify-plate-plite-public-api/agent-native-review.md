# Agent-native review

## Verdict

PASS. The final API is discoverable from durable rule owners, generated skills,
current docs, source checkers, and package-owned proof commands.

## Capability map

| User action | Agent route | Source owner | Mirror / docs | Proof | Status |
|---|---|---|---|---|---|
| Define a Plite extension | `best-api`, `plate-next`, `plate-plugin-creator` | `.agents/rules/{best-api,plate-next,plate-plugin-creator}.mdc` | generated skill mirrors; Plite docs and Vision | positional-factory adoption checker; public type contracts | pass |
| Define a Base or React Plate plugin | `plate-plugin-creator` | `.agents/rules/plate-plugin-creator.mdc` and its rule references | generated skill mirror; plugin guide/API docs | Core type contracts; Plate schema adoption checker | pass |
| Install a live extension | `plate-next` | `.agents/rules/plate-next.mdc` | generated skill mirror; Plite docs | zero `editor.extend(...)` product hits; runtime contracts | pass |
| Configure a descriptor | `plate-plugin-creator` | `.agents/rules/plate-plugin-creator.mdc` | generated skill mirror; plugin guide | terminal-configure checker and tests | pass |
| Author schema, identity, properties, and targets | `best-api`, `plate-plugin-creator` | `.agents/rules/best-api.mdc`, `.agents/rules/plate-plugin-creator/**` | Plate/Plite Vision; EN/CN docs | 4,205-file schema adoption audit; compile-only schema contracts | pass |
| Use plugin/extension portals and capability groups | `best-api`, `plate-next` | `.agents/rules/{best-api,plate-next}.mdc` | generated mirrors; API docs | public declaration builds; portal/runtime tests | pass |
| Verify browser behavior | Browser route from repo `AGENTS.md` | app routes and package browser tests | this plan's Browser pack | collaboration sync, Table, static server rendering, console/network audit | pass |
| Regenerate rule mirrors and barrels | repo `AGENTS.md` commands | `.agents/rules/**`, package exports | `.agents/skills/**`, generated barrels | `pnpm install`; pair comparison; `pnpm brl` 55/55 | pass |

## Findings

None.

## Accepted / rejected

- Accepted: source rules, generated mirrors, Vision, current docs, checkers, and
  package APIs all teach the positional `define*(name, definition)` grammar,
  descriptor `name` versus serialized `type`, `.extend` versus terminal
  `.configure`, and live `editor.install`.
- Rejected: historical rows in `.agents/rules/plate-next/versions.json` are not
  current instruction. They remain version evidence; the current version and
  generated skill own active guidance.

## Verification

- `pnpm install` regenerated skills from `.agents/rules/**`.
- Source/generated reference resources compare byte-for-byte; main skill files
  differ only by generated `name`/`metadata.skiller.source` frontmatter.
- `node tooling/scripts/check-plate-schema-adoption.mjs` passed 4,205 files.
- `node tooling/scripts/check-plate-doc-code-contracts.mjs` passed 363 docs.
- `node tooling/scripts/check-plite-docs.mjs` passed.
- `pnpm brl` passed 55/55 package tasks.
