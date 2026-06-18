# slate-layout

Page layout helpers for Slate editors.

`slate-layout` derives page geometry, line fragments, and page mount plans from
Slate documents. Use it for pagination experiments, print-like surfaces, and
page virtualization that keeps Slate as the document model.

```tsx
import { createSlateLayout } from '@platejs/slate-layout'

const layout = createSlateLayout(editor, () => ({
  page: {
    margins: 72,
    preset: 'letter',
  },
}))
```

For React page surfaces, use `slate-layout/react`.

```tsx
import { PagedEditable, useSlateLayout } from '@platejs/slate-layout/react'
```

`createSlateLayout` can also run outside React for previews, tests, and export
planning. Treat static output as derived geometry, not an authoritative
PDF/print/collaboration layout source, unless your product supplies the
measurement engine and proof for that target.

Keep production claims tied to explicit product proof for browser geometry,
export, tables, images, collaboration, and selection behavior.
