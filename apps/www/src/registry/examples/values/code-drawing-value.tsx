/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

import type { CodeDrawingData } from '@platejs/code-drawing';

export const codeDrawingInitialData: { data: CodeDrawingData } = {
  data: {
    drawingType: 'Mermaid',
    drawingMode: 'Both',
    code: `graph TD
    A["Start"] --> B{"Decision"}
    B -->|Yes| C["Action 1"]
    B -->|No| D["Action 2"]
    C --> E["End"]
    D --> E`,
  },
};

export const codeDrawingValue = (
  <fragment>
    <hh2>Code Drawing</hh2>
    <hp>
      Create diagrams from code using PlantUML, Graphviz, Flowchart, or Mermaid.
      Edit the code inline and see the preview update in real-time.
    </hp>
    <hcodedrawing {...codeDrawingInitialData}>
      <htext />
    </hcodedrawing>
  </fragment>
);
