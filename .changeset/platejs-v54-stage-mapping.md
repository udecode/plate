---
'platejs': patch
---

- Contract saved comment ranges inward across degraded or removed unsafe media in `migrateV54` instead of expanding over synthesized alt text or file names.
- Preserve `NodeSelection` paths across `migrateV54` input-literal expansions, unsafe URL cleanup, and code-block flattening, and compute `mappedSelection` lazily when a migration step supplies its own `mapSelection`.
