---
'platejs': major
---

Require React and React DOM 19.2 or newer.

Remove the code drawing plugin. A diagram is a code block in a diagram language, such as `mermaid`, and the copied `code-block-diagram` registry item draws it with the renderer items your app installs. PlantUML draws only through a server your app configures.

**Migration:** Remove `@platejs/code-drawing` and its plugins. `migrateV54` turns each saved `code_drawing` element into a code block. Its `data.code` becomes the text, and a drawing with no saved code keeps its own text. Its lowercased `data.drawingType` becomes the `language`, or `mermaid` when missing. An app whose own schema declares a `code_drawing` element keeps it. To draw the pictures, add the diagram items and wrap your code block component:

```bash
npx shadcn@latest add @plate/code-block-diagram @plate/code-block-diagram-mermaid
```

```tsx
import {
  CodeBlockElement,
  createCodeBlockPlugin,
} from '@/components/editor/code-block';
import { withDiagrams } from '@/components/editor/code-block-diagram';
import { mermaidRenderer } from '@/components/editor/code-block-diagram-mermaid';

const diagramCodeBlockPlugin = createCodeBlockPlugin(
  withDiagrams(CodeBlockElement, { renderers: [mermaidRenderer] })
);
```
