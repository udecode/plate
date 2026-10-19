/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { Value } from 'platejs';

jsx;

export const basicBlocksValue: Value = (
  <fragment>
    <hheading level={1}>Heading 1</hheading>
    <hp>
      This is a top-level heading, typically used for main titles and major
      section headers.
    </hp>
    <hheading level={2}>Heading 2</hheading>
    <hp>
      Secondary headings help organize content into clear sections and
      subsections.
    </hp>
    <hheading level={3}>Heading 3</hheading>
    <hp>
      Third-level headings provide further content structure and hierarchy.
    </hp>
    <hblockquote>
      <hp>
        Blockquotes can group multiple paragraphs, quoted lists, and replies in
        one container.
      </hp>
      <hp>
        Use nested blockquotes when you need to keep the quote hierarchy
        explicit.
      </hp>
      <hblockquote>
        <hp>Nested blockquotes keep reply chains readable.</hp>
      </hblockquote>
    </hblockquote>
    <hp>
      Use headings to create a clear document structure that helps readers
      navigate your content effectively. Combine them with blockquotes to
      emphasize important information.
    </hp>
    <element type="horizontalRule">
      <htext />
    </element>
    <hp>
      Horizontal rules help visually separate different sections of your
      content, creating clear breaks between topics or ideas.
    </hp>
  </fragment>
);
