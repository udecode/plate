/** @jsx jsxt */

import { getHtmlDocument, jsxt } from '@platejs/test-utils';

import { createPlateEditor } from '../../../../react';
import { deserializeHtml } from './deserializeHtml';

jsxt;

describe('deserializeHtml - Google Docs', () => {
  it('should not create extra paragraphs from BR tags between paragraphs', () => {
    const editor = createPlateEditor({ plugins: [] });

    // HTML structure from Google Docs with BR tags between paragraphs
    const html = `
      <p>Hello world</p>
      <br />
      <p>Hello World</p>
      <br />
      <p>Hello World</p>
      <br />
      <p>Hello World</p>
    `;

    const element = getHtmlDocument(html).body;

    const output = (
      <editor>
        <hp>Hello world</hp>
        <hp>Hello World</hp>
        <hp>Hello World</hp>
        <hp>Hello World</hp>
      </editor>
    ) as any;

    const result = deserializeHtml(editor, { element });
    
    expect(result).toEqual(output.children);
  });

  it('should preserve BR tags within paragraphs', () => {
    const editor = createPlateEditor({ plugins: [] });

    const html = `<p>Line 1<br />Line 2</p>`;
    const element = getHtmlDocument(html).body;

    const output = (
      <editor>
        <hp>Line 1{'\n'}Line 2</hp>
      </editor>
    ) as any;

    const result = deserializeHtml(editor, { element });
    
    expect(result).toEqual(output.children);
  });

  it('should handle complex Google Docs HTML', () => {
    const editor = createPlateEditor({ plugins: [] });

    // Actual HTML structure from the issue
    const html = `
      <b style="font-weight:normal;" id="docs-internal-guid-0753e24d-7fff-d209-84cc-3361f30177bf">
        <p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;">
          <span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Hello world</span>
        </p>
        <br />
        <p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;">
          <span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Hello World</span>
        </p>
        <br />
        <p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;">
          <span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Hello World</span>
        </p>
        <br />
        <p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;">
          <span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Hello World</span>
        </p>
      </b>
      <br class="Apple-interchange-newline">
    `;

    const element = getHtmlDocument(html).body;
    const result = deserializeHtml(editor, { element });

    // Should have exactly 4 paragraphs, not 8
    expect(result).toHaveLength(4);
    expect(result[0].type).toBe('p');
    expect(result[1].type).toBe('p');
    expect(result[2].type).toBe('p');
    expect(result[3].type).toBe('p');
  });

  it('should not skip BR tags between inline elements', () => {
    const editor = createPlateEditor({ plugins: [] });

    const html = `<span>Hello</span><br /><span>World</span>`;
    const element = getHtmlDocument(html).body;

    const output = (
      <editor>
        <hp>Hello{'\n'}World</hp>
      </editor>
    ) as any;

    const result = deserializeHtml(editor, { element });
    
    expect(result).toEqual(output.children);
  });
});