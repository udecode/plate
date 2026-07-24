---
"@platejs/basic-nodes": major
---

Remove the Heading, Basic Blocks, and Basic Marks grouping descriptors and
package-owned preset arrays. The package exports each Base and React capability
plugin independently. Blockquotes store inline children directly, and built-in
marks are boolean text properties in compiled schemas.

**Migration:** List the package plugins your editor supports, or install the
matching app-owned Plate registry kit. Store text and inline nodes directly in
blockquote children instead of nested paragraphs.

```tsx
import { H1Plugin, H2Plugin } from '@platejs/basic-nodes/react';

const plugins = [H1Plugin, H2Plugin];
```
