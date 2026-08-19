/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const codeDrawingInitialData = {
  code: `graph TD
    A["Start"] --> B{"Decision"}
    B -->|Yes| C["Action 1"]
    B -->|No| D["Action 2"]
    C --> E["End"]
    D --> E`,
  language: 'mermaid',
  view: 'split',
} as const;

export const codeDrawingValue = (
  <fragment>
    <hheading level={2}>Code Drawing</hheading>
    <hp>
      Create diagrams from code using PlantUML, Graphviz, Flowchart, or Mermaid.
      Edit the code inline and see the preview update in real-time.
    </hp>
    <hcodedrawing {...codeDrawingInitialData}>
      <htext />
    </hcodedrawing>
  </fragment>
);
