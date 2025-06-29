---
"@platejs/core": patch
"@platejs/markdown": patch
---

feat(markdown): support dynamic plugin keys in markdown serialization

- Add `getPluginKey` and `getPluginKeys` exports to core
- Allow markdown serializer/deserializer to use custom plugin keys from editor configuration