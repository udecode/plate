/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';
import type { Value } from 'platejs';

jsx;

export const tocValue: Value = (
  <fragment>
    <hheading level={1}>
      <htext>Table of Contents</htext>
    </hheading>
    <hp>
      <htext>
        The Table of Contents (TOC) feature allows you to create an
        automatically updated overview of your document's structure.
      </htext>
    </hp>
    <hp>How to use the Table of Contents:</hp>
    <hp indent={1} listType="bulleted">
      <htext>Type "/toc" and press Enter to create the TOC.</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>
        The TOC updates automatically when you modify headings in the document.
      </htext>
    </hp>
    <htoc>
      <htext />
    </htoc>
    <hheading level={2}>Example Content</hheading>
    <hp>
      <htext>
        This is an example of content that would be reflected in the Table of
        Contents.
      </htext>
    </hp>
    <hheading level={3}>Subsection</hheading>
    <hp>
      <htext>
        Adding or modifying headings in your document will automatically update
        the TOC.
      </htext>
    </hp>
    <hheading level={2}>Benefits of Using TOC</hheading>
    <hp>
      <htext>
        A Table of Contents improves document navigation and provides a quick
        overview of your content structure.
      </htext>
    </hp>
  </fragment>
);

export const tocPlaygroundValue: Value = (
  <fragment>
    <htoc>
      <htext />
    </htoc>
    <hp>
      <htext>
        Click on any heading in the table of contents to smoothly scroll to that
        section.
      </htext>
    </hp>
  </fragment>
);
