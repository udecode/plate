/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { Value } from 'platejs';

jsx;

export const codeBlockDiagramValue: Value = (
  <fragment>
    <hheading level={2}>Diagrams</hheading>
    <hp>
      A code block in a diagram language draws its picture below the source.
      Switch a block between Code and Both from its toolbar.
    </hp>
    <hcodeblock language="mermaid">
      {'graph TD\n'}
      {'  A["Start"] --> B{"Decision"}\n'}
      {'  B -->|Yes| C["Action 1"]\n'}
      {'  B -->|No| D["Action 2"]\n'}
      {'  C --> E["End"]\n'}
      {'  D --> E'}
    </hcodeblock>
    <hcodeblock language="graphviz">
      {'digraph {\n'}
      {'  rankdir=LR;\n'}
      {'  draft -> review -> published;\n'}
      {'  review -> draft [label="changes"];\n'}
      {'}'}
    </hcodeblock>
    <hcodeblock language="flowchart">
      {'st=>start: Start\n'}
      {'op=>operation: Write the source\n'}
      {'cond=>condition: Does it draw?\n'}
      {'e=>end: Done\n'}
      {'st->op->cond\n'}
      {'cond(yes)->e\n'}
      {'cond(no)->op'}
    </hcodeblock>
    <hp>
      This demo installs no PlantUML renderer, so the PlantUML block below stays
      an ordinary code block. Add one built with your own PlantUML server to
      draw it.
    </hp>
    <hcodeblock language="plantuml">
      {'@startuml\n'}
      {'Alice -> Bob: Hello\n'}
      {'Bob --> Alice: Hi\n'}
      {'@enduml'}
    </hcodeblock>
    <hp>Code blocks in other languages stay as they are:</hp>
    <hcodeblock language="typescript">
      {'const diagrams = ["mermaid", "graphviz", "flowchart"];'}
    </hcodeblock>
  </fragment>
);
