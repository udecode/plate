# Persisted identity proposal: normalized prior input

Provenance:

- Captured input: `/Users/zbeyens/.codex/attachments/39ce7e30-26d3-409c-a999-40fc367ca1be/pasted-text.txt`
- Original SHA-256: `181ed3f840783c6d7bfe0c525d8c39af125214aa55df37a2089bc8ac7849991f`
- Original logical line count: `268` (the final line has no trailing newline)
- Captured: `2026-08-01`
- Mapping rule: every `Original lines` range below is inclusive and refers to the immutable input identified by the SHA above. Claims are normalized, not silently widened; later disposition is recorded separately from the claim.

| Candidate ID | Original lines | Normalized prior claim | Current disposition | Disposition rationale |
|---|---:|---|---|---|
| `ATT-AST-SEMANTIC-LOWER-CAMEL` | 5-8 | Every first-party persisted AST identity is semantic lower camel case and normally equals its plugin name; descriptor `name` and persisted `type` remain distinct, and only AST owners have `type`. | reaffirm | Retain the identity split and semantic persisted vocabulary. |
| `ATT-MIGRATION-PLUGIN-INSUFFICIENT` | 9-9, 240-249 | An initialization migration plugin alone cannot safely migrate persisted history or live collaboration state. | reaffirm | Retain the limitation; persistence migration belongs to the host boundary. |
| `ATT-NODES-SEMANTIC-CATALOG` | 13-47 | `NODES` should expose semantic first-party persisted identities rather than HTML tags or snake-case storage spellings. | reaffirm | Retain the semantic catalog, including persisted `h1` through `h6`: Plate's per-level installation, configuration, components, rules, shortcuts, and injection targeting are real public granularity. |
| `ATT-KEYS-SPREAD-NODES` | 49-56 | `KEYS` should mechanically spread all `NODES` values, then add behavior-only plugin names. | reject | Mechanical spreading hides the ontology split and couples the two catalogs unnecessarily. |
| `ATT-DELETE-ABBREVIATED-NODES` | 59-73 | Delete abbreviated/tag-shaped node identities and overlapping identity catalogs, including `p`, `a`, `img`, `hr`, table/list abbreviations, `NODES.heading`, and `STYLE_KEYS`. | reaffirm | Retain semantic persisted identities and delete a generic heading group disguised as one persisted identity; the six real heading identities remain. |
| `ATT-KEEP-NODES-NAME` | 75-75 | Keep the public `NODES` name and define it as the canonical persisted AST vocabulary. | reaffirm | Renaming the catalog buys less than the ecosystem churn it causes. |
| `ATT-AST-TYPE-EXPLICIT` | 79-88, 103-103 | AST-owning plugins explicitly declare their persisted `type`; do not infer AST ownership from schema, components, or rendering. | reaffirm | One explicit persisted identity is clearer than another factory or inference heuristic. |
| `ATT-BEHAVIOR-NO-TYPE` | 90-101 | Behavior-only plugins do not expose a fake persisted `type`. | reaffirm | Runtime capability identity is not document identity. |
| `ATT-NO-DERIVED-TYPE-FACTORY` | 103-103 | Reject a special `defineNodePlugin`-style factory whose job is to infer `type`. | reaffirm | Keep one descriptor grammar and explicit AST identity. |
| `ATT-EXACT-PORTAL-TYPE` | 105-113 | Exact descriptor portals expose exact `type` only for AST-owning plugins and reject it for behavior-only plugins. | reaffirm | Exact portals should preserve exact descriptor capability. |
| `ATT-DYNAMIC-PORTAL-OPTIONAL-TYPE` | 115-115 | Dynamic string portals expose `type?: string` because the runtime name may resolve to a behavior-only plugin. | reaffirm | Erased lookup cannot promise AST ownership. |
| `ATT-NAME-TYPE-SEPARATE-CONFIGURABLE` | 117-139 | Descriptor `name` owns installation and API namespace; persisted `type` owns AST storage and may be configured independently. | reaffirm | Equality is a first-party convention, not ontology. |
| `ATT-PACKAGE-TARGET-DESCRIPTORS` | 141-151 | Package-owned relationships target concrete plugin descriptors. | reaffirm | Concrete descriptors preserve dependency ownership and exact typing. |
| `ATT-REGISTRY-TARGET-STRINGS` | 153-161 | Copied registry code should always target plugin names as strings to remain package-independent. | supersede | Use a descriptor when the copied item already declares that package dependency; use a string only for genuinely dynamic or deliberately decoupled peers. |
| `ATT-PERSISTED-VALUES-NODES` | 163-172 | Persisted registry values use `NODES`, not plugin identity constants. | reaffirm | Persisted values should name document identity explicitly. |
| `ATT-INJECT-RENDER-ONLY` | 174-184 | `inject` owns render/DOM projection, not schema identity. | reaffirm | Schema and persistence identity belong to the installed AST owner. |
| `ATT-TARGET-RESOLVES-CONFIGURED-TYPE` | 184-184 | Core resolves each installed target plugin's configured `type`; callers do not pass duplicate plugin and AST strings. | reaffirm | One installed descriptor is the truthful identity owner. |
| `ATT-EXACT-BUILTIN-MAP` | 186-218 | A hard migration uses an explicit built-in old-to-semantic identity map. | reaffirm | Retain explicit first-party mappings, including the persisted `h1` through `h6` exception; never replace them with generic case conversion. |
| `ATT-NO-GENERIC-CASE-MIGRATION` | 220-220 | Never apply a generic snake-case-to-camel-case migration to custom identities. | reaffirm | Generic case conversion can corrupt user schemas. |
| `ATT-MIGRATION-PLUGIN-API` | 222-238 | Ship a Plate initialization plugin that migrates documents before schema fitting. | supersede | The durable owner is a pure host persistence migration, not an editor plugin. |
| `ATT-MIGRATE-ALL-ROOTS-BEFORE-FIT` | 240-242 | Migrate primary and named roots before schema fitting. | reaffirm | Every persisted root must enter the editor in one final vocabulary. |
| `ATT-MIGRATE-TYPES-MARKS-PROPERTIES` | 243-243 | Migrate element types and persisted mark/property keys. | reaffirm | All persisted identity classes need the same version boundary. |
| `ATT-MIGRATION-CONFLICT-FAILS` | 244-244 | Fail migration when old and new persisted properties conflict. | reaffirm | Silent precedence would lose data. |
| `ATT-PRESERVE-UNKNOWN-CUSTOM` | 245-245 | Preserve unknown custom identities during the first-party migration. | reaffirm | The built-in migration must not rewrite user vocabulary. |
| `ATT-FINAL-VOCABULARY-ONLY` | 246-246 | Migration output contains only the final vocabulary. | reaffirm | Downstream schema fitting should not support two first-party representations. |
| `ATT-NO-ALIASES-DUAL-SCHEMA` | 247-247 | Provide no runtime aliases or dual-schema acceptance. | reaffirm | Compatibility belongs at the persistence boundary, not the live editor model. |
| `ATT-HISTORY-MIGRATE-OR-INVALIDATE` | 249-249 | Persisted history payloads require migration or invalidation. | reaffirm | Initialization-time document migration cannot repair historical operations. |
| `ATT-YJS-OFFLINE-NEW-ROOM` | 249-249 | Yjs documents require offline migration into a new schema-versioned room before clients connect. | reaffirm | Collaborative state needs one coordinated persisted representation. |
| `ATT-MIXED-CLIENTS-NOT-INIT-SOLVABLE` | 249-249 | Mixed old/new collaborative clients cannot be made safe by an initialization plugin. | reaffirm | Client protocol/version coordination is a host deployment concern. |
| `ATT-HYBRID-REGISTRY-DECOUPLING` | 251-266 | Combine object-first runtime identity with centralized string catalogs for copied registry source. | reaffirm | Keep both strengths, with descriptor targeting whenever a concrete dependency is already owned. |

This normalization is prior-input evidence only. It does not make any current audit artifact its own authority, and its dispositions remain subject to the current source-backed matrix.
