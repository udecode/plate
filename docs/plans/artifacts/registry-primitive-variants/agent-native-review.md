# Agent-native review

## Verdict

PASS

## Capability map

| User action | Agent route | Source owner | Mirror or doc | Proof | Status |
| --- | --- | --- | --- | --- | --- |
| Sync current shadcn registry behavior | `sync-shadcn` | `.agents/rules/sync-shadcn.mdc` | `.agents/skills/sync-shadcn/SKILL.md`, `.claude/skills/sync-shadcn/SKILL.md` | `pnpm install`; source/mirror search and byte comparison | pass |
| Design provider-complete public registry APIs | `best-api` | `.agents/rules/best-api.mdc` | `.agents/skills/best-api/SKILL.md`, `.claude/skills/best-api/SKILL.md` | `pnpm install`; source/mirror search and byte comparison | pass |
| Maintain Plate registry component variants | `plate-ui` | `.agents/rules/plate-ui.mdc` | `.agents/skills/plate-ui/SKILL.md`, `.claude/skills/plate-ui/SKILL.md` | `pnpm install`; source/mirror search and byte comparison | pass |
| Audit shadcn source parity | `shadcn-parity` | `.agents/rules/shadcn-parity.mdc` | `.agents/skills/shadcn-parity/SKILL.md`, `.claude/skills/shadcn-parity/SKILL.md` | `pnpm install`; source/mirror search and byte comparison | pass |
| Verify provider completeness | `sync-shadcn` and `plate-ui` proof commands | registry source, tests, and build scripts | registry audit and goal-plan artifacts | exhaustive route test, registry build, isolated consumer installs, Browser proof | pass |

## Findings

No P0-P3 agent-native gap remains.

## Accepted and rejected

- Accepted: Base-first, provider-complete guidance lives in the four existing owners.
- Rejected: a new wrapper skill. The action is already discoverable and owned.
- Rejected: direct edits to generated skill mirrors. `pnpm install` regenerated both agent targets from source rules.

## Verification

- `pnpm install` regenerated skills successfully.
- Base-first and provider-complete guidance exists in every source owner and generated mirror.
- `.agents` and `.claude` mirrors match byte for byte for the four affected skills.

## Needs attention

None.
