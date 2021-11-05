---
'@udecode/plate-mention': patch
---

breaking changes (v7):
- `getMentionOnSelectItem`:
  - is now using plugin options
  - removed `createMentionNode` in favor of plugin options
  - removed `insertSpaceAfterMention` in favor of plugin options
  
feat:
- `MentionPluginOptions` new fields: 
  - `id`
  - `insertSpaceAfterMention`
  - `createMentionNode`
