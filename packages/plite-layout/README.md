# plite-layout

Page layout helpers for Plite editors.

`plite-layout` derives page geometry, line fragments, and page mount plans from
Plite documents. Use it for pagination experiments, print-like surfaces, and
page virtualization that keeps Plite as the document model.

```tsx
import { createPliteLayout } from '@platejs/plite-layout'

const layout = createPliteLayout(editor, () => ({
  page: {
    margins: 72,
    preset: 'letter',
  },
}))
```

For React page surfaces, use `plite-layout/react`.

```tsx
import { PagedEditable, usePliteLayout } from '@platejs/plite-layout/react'
```

`createPliteLayout` can also run outside React for previews, tests, and export
planning. Treat static output as derived geometry, not an authoritative
PDF/print/collaboration layout source, unless your product supplies the
measurement engine and proof for that target.

Keep production claims tied to explicit product proof for browser geometry,
export, tables, images, collaboration, and selection behavior.
