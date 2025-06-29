---
"@platejs/markdown": minor
---

Added support for dynamic plugin keys in markdown serialization and deserialization

- **Serializer**: Now uses custom plugin keys from editor configuration when serializing nodes
- **Deserializer**: Now uses custom plugin keys from editor configuration when deserializing markdown
- **`rebuildRules`**: New internal function that dynamically maps rules based on editor's plugin configuration