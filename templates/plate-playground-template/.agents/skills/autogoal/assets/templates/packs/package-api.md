# package-api pack

Use this pack when work touches public app/API shape, route contracts, package boundaries, exports, release artifacts, or package-level type/build behavior.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Package/API pack selected | pending | pending |
| Public surface or package/API boundary identified | pending | pending |
| Compatibility or hard-cut decision recorded | pending | pending |
| Runtime scale applicability resolved | pending | If the public boundary changes repeated/hot work or introduces a runtime layer, also apply `performance-observability`; otherwise record a source-backed N/A |

Work Checklist:
- [ ] Package/API pack: public contract, boundary, export, and release impact are recorded.
- [ ] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [ ] Package/API pack: app/package/API-owned typecheck/build/test proof is recorded or marked N/A.
- [ ] Package/API pack: a scale-sensitive runtime contract composes the
      performance pack before target acceptance; type-only and zero-runtime
      changes record the exact N/A reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Public app/API or package boundary proof | pending | Source-audit public contract, exports, and boundary impact | pending |
| Runtime scale contract | pending | Close the materialized performance pack for scale-sensitive runtime work, including pre-acceptance probe and production rerun, or record a source-backed zero-runtime N/A | pending |
| Release artifact classification | pending | Record whether this is public, internal-only, docs-only, agent-only, test-only, or no user-visible delta | pending |
| App/package/API checks | pending | Run owning checks or record N/A with reason | pending |
