# package-api pack

Use this pack when work touches public app/API shape, route contracts, package boundaries, exports, release artifacts, or package-level type/build behavior.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Package/API pack selected | pending | pending |
| Public surface or package/API boundary identified | pending | pending |
| Compatibility or hard-cut decision recorded | pending | pending |

Work Checklist:
- [ ] Package/API pack: public contract, boundary, export, and release impact are recorded.
- [ ] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [ ] Package/API pack: app/package/API-owned typecheck/build/test proof is recorded or marked N/A.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Public app/API or package boundary proof | pending | Source-audit public contract, exports, and boundary impact | pending |
| Release artifact classification | pending | Record whether this is public, internal-only, docs-only, agent-only, test-only, or no user-visible delta | pending |
| App/package/API checks | pending | Run owning checks or record N/A with reason | pending |
