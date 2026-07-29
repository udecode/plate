# Plate Next all-package P1/P2 closure

## Verdict

Closed all 98 P1/P2 rows from `audit-report.md`.

- 94 findings required source, test, adoption, documentation, release, or
  checker repairs.
- 4 constructor-stage findings were disproved by the final dependency graph:
  AI-01, AI-02, INDENT-02, and LAYOUT-01.
- The audit's 3 P0 and 19 P3 rows were outside this packet and are not claimed.

## Exact ledger

| Package | Closed IDs | Disposition |
| --- | --- | --- |
| ai | AI-01, AI-02 | Verified staged owners: AI Chat's first stage publishes one lexical API/read/update family consumed by later stages; Copilot's API stage consumes the constructor update group. |
| ai | AI-03, AI-04, AI-05, AI-06, AI-07 | Fixed. |
| basic-nodes | BASIC-01, BASIC-02 | Fixed. |
| callout | CALL-01 | Fixed. |
| code-block | CODE-01, CODE-02, CODE-03, CODE-04, CODE-05 | Fixed. |
| comment | COMMENT-01 | Fixed. |
| core | CORE-04, CORE-05, CORE-06, CORE-07, CORE-08, CORE-09, CORE-10, CORE-11, CORE-12, CORE-13, CORE-14, CORE-15, CORE-16 | Fixed. |
| dnd | DND-01, DND-02, DND-03, DND-04, DND-05, DND-06 | Fixed. |
| docx-io | DOCXIO-01 | Fixed. |
| emoji | EMOJI-01 | Fixed. |
| footnote | FOOT-01, FOOT-02, FOOT-03 | Fixed. |
| indent | INDENT-01 | Fixed. |
| indent | INDENT-02 | Verified staged owner: the codec needs the contextual codec builder and schema-owned store; its shortcuts resolve constructor updates. |
| layout | LAYOUT-01 | Verified staged owner: the shortcut resolves the constructor-owned `selectAll` update. Moving it into the constructor would erase the dependency order the stage exists to express. |
| link | LINK-01, LINK-02, LINK-03, LINK-05, LINK-06, LINK-07 | Fixed. |
| list | LIST-01, LIST-02 | Fixed. |
| list-classic | LISTC-01, LISTC-02, LISTC-03 | Fixed. |
| markdown | MD-01, MD-02, MD-06 | Fixed. |
| math | MATH-01 | Fixed. |
| media | MEDIA-01, MEDIA-02, MEDIA-03, MEDIA-04, MEDIA-05 | Fixed. |
| selection | SEL-01, SEL-02, SEL-03, SEL-04, SEL-05, SEL-06, SEL-07, SEL-08, SEL-09, SEL-10, SEL-11, SEL-12, SEL-13, SEL-14 | Fixed. |
| suggestion | SUG-01, SUG-02, SUG-03, SUG-04 | Fixed. |
| tabbable | TAB-01, TAB-02 | Fixed. |
| table | TABLE-01, TABLE-02, TABLE-03, TABLE-07 | Fixed. |
| tag | TAG-01, TAG-02, TAG-03 | Fixed. |
| toc | TOC-01 | Fixed. |
| toggle | TOGGLE-01, TOGGLE-02, TOGGLE-03 | Fixed. |
| utils | UTIL-01 | Fixed. |
| yjs | YJS-01, YJS-02, YJS-03 | Fixed. |

Ledger total: 98/98.

## Adoption and release closure

- Source, tests, package callers, registry/app callers, EN/CN docs, barrels,
  changesets, and the schema-adoption checker use the final APIs.
- `editor.api.markdown.{serialize,deserialize,deserializeInline}` remains the
  sole Markdown root API.
- Table commands stay flat and table selection export preserves projected row
  and cell children.
- Deleted Core `isType` callers compare configured types at their owner.
- Core input-rule factories retain their exact editor type while normalized
  heterogeneous rule storage uses `unknown`, not `any`.
- Registry Link insertion calls the plugin-owned floating-link API directly and
  is covered by its editor transform regression.
- Plate Next doctrine is v20. The v20 fingerprint includes the aligned Plate
  Plugin Creator extension wording and the generated skills match their rule
  sources.
- Package attestations remain at v17. v18-v20 include P0/P3 doctrine not owned
  by this packet, so marking packages current would be a false claim.

## Proof

- `pnpm turbo --filter './packages/**' typecheck --only`: 57/57 packages,
  including Core declaration contracts.
- `pnpm --filter www typecheck`: docs-source parity, registry-source audit,
  application TypeScript, and package-integration TypeScript.
- `bun run test`: 3,002 fast tests plus 133 routed supplemental tests; zero
  failures.
- `bun test apps/www/src/registry/components/editor/transforms.spec.ts`: 12/12.
- `bun test tooling/scripts/check-plate-schema-adoption.test.mjs`: 28/28.
- `node tooling/scripts/check-plate-schema-adoption.mjs`: 4,056 source and
  documentation files audited.
- `pnpm brl`: 55/55 tasks.
- `node .agents/rules/plate-next/scripts/version.mjs validate`: v20 registry
  valid, 42 active and 1 retired package.
- Browser: `/docs/api/core` returned 200 and rendered without the deleted
  `isType` section.
- Scoped Biome and `git diff --check`: clean.

## Superseded packet

`docs/plans/2026-07-28-plate-next-feature-plugins-audit-fixes.md` is retained as
historical execution context. Its v18 attestation gates are superseded by this
aggregate closure and are not backfilled with false completion claims.
