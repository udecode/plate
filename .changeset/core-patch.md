---
'@udecode/plate-core': patch
---

- HTML deserializer:
  - parent attributes does not override child leaf attributes anymore. For example, if a span has fontSize style = 16px, and its child span has fontSize style = 18px, it's now deserializing to 18px instead of 16px. 
- Inject props:
  - does not inject props when node value = `inject.props.defaultNodeValue` anymore.
