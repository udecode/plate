---
'platejs': major
---

Require React and React DOM 19.2 or newer.

Remove the tag plugins. `@platejs/tag` does not move into `platejs`, and `BaseTagPlugin`, `TagPlugin`, `MultiSelectPlugin`, `isEqualTags`, `getSelectedItems`, `useSelectedItems`, `useSelectableItems` and `useSelectEditorCombobox` have no replacement export. The `select-editor` registry item has the tag field: one `SelectEditor` component, the `tag` element plugin and its chip. The `tag` element keeps its stored shape, `{ type: 'tag', value, url? }`, so documents need no migration. To keep `tag` elements in another editor, add `TagPlugin.configure({ component: TagElement })` from the copied `tag.tsx` to its plugins.

**Migration:** Remove `@platejs/tag`, add the registry item, and replace the plugin and the field parts with `SelectEditor`:

```bash
npx shadcn@latest add @plate/select-editor
```

```tsx
import { SelectEditor } from '@/components/editor/select-editor';

<SelectEditor items={items} value={value} onValueChange={setValue} />;
```
