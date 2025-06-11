/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';
import { KEYS } from 'platejs';

jsx;

export const basicBlocksValue: any = (
  <fragment>
    <hh1>Heading 1</hh1>
    <hp>
      This is a top-level heading, typically used for main titles and major
      section headers.
    </hp>
    <hh2>Heading 2</hh2>
    <hp>
      Secondary headings help organize content into clear sections and
      subsections.
    </hp>
    <hh3>Heading 3</hh3>
    <hp>
      Third-level headings provide further content structure and hierarchy.
    </hp>
    <hblockquote>
      "Blockquotes are perfect for highlighting important information, quotes
      from external sources, or emphasizing key points in your content."
    </hblockquote>
    <hp>
      Use headings to create a clear document structure that helps readers
      navigate your content effectively. Combine them with blockquotes to
      emphasize important information.
    </hp>
    <element type={KEYS.hr}>
      <htext />
    </element>
    <hp>
      Horizontal rules help visually separate different sections of your
      content, creating clear breaks between topics or ideas.
    </hp>
  </fragment>
);
