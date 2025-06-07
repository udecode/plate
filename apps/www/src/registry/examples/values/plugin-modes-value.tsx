/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const pluginModesValue: any = (
  <fragment>
    <hh2>Plugin Modes</hh2>
    <hp>
      Plugin modes control how blocks respond to Enter and Backspace. Try the
      examples below:
    </hp>

    <hh3>Break Modes</hh3>

    <hp>
      <htext bold>Blockquote with line breaks:</htext> Press Enter for line
      breaks, Enter on empty lines to reset to paragraph.
    </hp>
    <hblockquote>
      This blockquote uses lineBreak mode. Try pressing Enter here to add line
      breaks instead of splitting blocks.
    </hblockquote>
    <hblockquote>
      <text />
    </hblockquote>

    <hp>
      <htext bold>Code block with smart exits:</htext> Enter in empty lines
      exits the block.
    </hp>
    <hcodeblock>
      <hcodeline>console.info('Hello world');</hcodeline>
      <hcodeline>
        <text />
      </hcodeline>
    </hcodeblock>

    <hh3>Delete Modes</hh3>

    <hp>
      <htext bold>Headings with reset:</htext> Press Backspace at the start to
      convert to paragraph.
    </hp>
    <hh1>Try Backspace at the start of this heading</hh1>
    <hh2>Or this one</hh2>

    <hp>
      <htext bold>List items:</htext> Backspace at start removes list
      formatting.
    </hp>
    <hp indent={1} listStyleType="disc">
      First list item - try Backspace at start
    </hp>
    <hp indent={1} listStyleType="disc">
      Second list item
    </hp>
    <hp indent={2} listStyleType="circle">
      Nested item - Backspace removes one level
    </hp>

    <hh3>Merge Modes</hh3>

    <hp>
      <htext bold>Empty paragraphs:</htext> These will be removed when merging
      with following blocks.
    </hp>
    <hp>
      <text />
    </hp>
    <hh2>Try Backspace at start - empty paragraph above gets removed</hh2>

    <hp>
      <htext bold>Blockquotes preserve empty blocks:</htext> Empty paragraphs
      before blockquotes are kept.
    </hp>
    <hp>
      <text />
    </hp>
    <hblockquote>Try Backspace here - empty paragraph is preserved</hblockquote>

    <hh3>Match Modes</hh3>

    <hp>
      <htext bold>Conditional list behavior:</htext> These paragraphs have list
      styling but only apply list modes when they have the listStyleType
      property.
    </hp>
    <hp indent={1} listStyleType="disc">
      This has list styling - Enter/Backspace use list modes
    </hp>
    <hp indent={1}>
      This is indented but no listStyleType - uses paragraph modes
    </hp>

    <hp>
      <htext bold>Code blocks with emptiness detection:</htext> Special modes
      only apply when truly empty.
    </hp>
    <hcodeblock>
      <hcodeline>// This code block has content</hcodeline>
      <hcodeline>console.info('test');</hcodeline>
    </hcodeblock>
    <hcodeblock>
      <hcodeline>
        <text />
      </hcodeline>
    </hcodeblock>

    <hh3>Combined Examples</hh3>

    <hp>
      <htext bold>Complex nested structure:</htext> Try different key
      combinations in this table.
    </hp>
    <htable>
      <htr>
        <htd>
          <hblockquote>
            Blockquote in table cell. Try Enter for line breaks.
          </hblockquote>
        </htd>
        <htd>
          <hcodeblock>
            <hcodeline>function example() {'{'}</hcodeline>
            <hcodeline> return 'Press Enter on empty line';</hcodeline>
            <hcodeline>{'}'}</hcodeline>
            <hcodeline>
              <text />
            </hcodeline>
          </hcodeblock>
        </htd>
      </htr>
      <htr>
        <htd>
          <hp indent={1} listStyleType="disc">
            List item in cell
          </hp>
          <hp indent={1} listStyleType="disc">
            Another item
          </hp>
        </htd>
        <htd>
          <hh3>Heading in cell</hh3>
          <hp>Regular paragraph</hp>
        </htd>
      </htr>
    </htable>

    <hp>
      <htext bold>Experiment:</htext> Try these interactions to see plugin modes
      in action:
    </hp>
    <hp indent={1} listStyleType="disc">
      Press Enter at different positions in blockquotes
    </hp>
    <hp indent={1} listStyleType="disc">
      Use Backspace at the start of headings and list items
    </hp>
    <hp indent={1} listStyleType="disc">
      Try Enter in empty vs non-empty code lines
    </hp>
    <hp indent={1} listStyleType="disc">
      Notice how empty paragraphs behave with different following blocks
    </hp>
  </fragment>
);
