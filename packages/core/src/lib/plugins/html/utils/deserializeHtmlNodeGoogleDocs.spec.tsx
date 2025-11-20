/** @jsx jsxt */

import { getHtmlDocument, jsxt } from '@platejs/test-utils';

import { createPlateEditor } from '../../../../react';
import { deserializeHtml } from './deserializeHtml';

jsxt;

describe('deserializeHtml - Google Docs', () => {
  it('should create single empty paragraphs from BR tags between paragraphs', () => {
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
        <hp>
          <htext />
        </hp>
        <hp>Hello World</hp>
        <hp>
          <htext />
        </hp>
        <hp>Hello World</hp>
        <hp>
          <htext />
        </hp>
        <hp>Hello World</hp>
      </editor>
    ) as any;

    const result = deserializeHtml(editor, { element });

    expect(result).toEqual(output.children);
  });

  it('should preserve BR tags within paragraphs', () => {
    const editor = createPlateEditor({ plugins: [] });

    const html = '<p>Line 1<br />Line 2</p>';
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

    // Should have 7 elements: 4 paragraphs with content + 3 empty paragraphs from BR tags
    expect(result).toHaveLength(7);
    expect(result[0].type).toBe('p');
    expect(result[1].type).toBe('p');
    expect(result[2].type).toBe('p');
    expect(result[3].type).toBe('p');
    expect(result[4].type).toBe('p');
    expect(result[5].type).toBe('p');
    expect(result[6].type).toBe('p');

    // Check that empty paragraphs are at the right positions
    expect((result[1] as any).children[0].text).toBe('');
    expect((result[3] as any).children[0].text).toBe('');
    expect((result[5] as any).children[0].text).toBe('');
  });

  it('should preserve BR tags within paragraphs as separate text nodes', () => {
    const editor = createPlateEditor({ plugins: [] });

    const html = '<p><span>Hello</span><br /><span>World</span></p>';
    const element = getHtmlDocument(html).body;

    const result = deserializeHtml(editor, { element });

    // BR tags are converted to newline text nodes
    // Note: Text nodes are not merged during deserialization
    expect(result).toHaveLength(1);
    expect((result[0] as any).type).toBe('p');
    expect((result[0] as any).children).toHaveLength(3);
    expect((result[0] as any).children[0].text).toBe('Hello');
    expect((result[0] as any).children[1].text).toBe('\n');
    expect((result[0] as any).children[2].text).toBe('World');
  });

  it('should handle two consecutive BR tags between paragraphs', () => {
    const editor = createPlateEditor({ plugins: [] });

    const html = `
      <p>First paragraph</p>
      <br />
      <br />
      <p>Second paragraph</p>
    `;

    const element = getHtmlDocument(html).body;

    const output = (
      <editor>
        <hp>First paragraph</hp>
        <hp>
          <htext />
        </hp>
        <hp>
          <htext />
        </hp>
        <hp>Second paragraph</hp>
      </editor>
    ) as any;

    const result = deserializeHtml(editor, { element });

    expect(result).toEqual(output.children);
  });

  it('should handle three consecutive BR tags between paragraphs', () => {
    const editor = createPlateEditor({ plugins: [] });

    const html = `
      <p>First paragraph</p>
      <br />
      <br />
      <br />
      <p>Second paragraph</p>
    `;

    const element = getHtmlDocument(html).body;

    const output = (
      <editor>
        <hp>First paragraph</hp>
        <hp>
          <htext />
        </hp>
        <hp>
          <htext />
        </hp>
        <hp>
          <htext />
        </hp>
        <hp>Second paragraph</hp>
      </editor>
    ) as any;

    const result = deserializeHtml(editor, { element });

    expect(result).toEqual(output.children);
  });

  it('should handle multiple consecutive BR tags in complex Google Docs HTML', () => {
    const editor = createPlateEditor({ plugins: [] });

    const html = `
      <b style="font-weight:normal;">
        <p dir="ltr">Content 1</p>
        <br />
        <br />
        <p dir="ltr">Content 2</p>
        <br />
        <br />
        <br />
        <p dir="ltr">Content 3</p>
      </b>
    `;

    const element = getHtmlDocument(html).body;
    const result = deserializeHtml(editor, { element });

    // Should have 8 elements: 3 paragraphs with content + 5 empty paragraphs from BR tags
    expect(result).toHaveLength(8);

    // Check content paragraphs
    expect((result[0] as any).children[0].text).toBe('Content 1');
    expect((result[3] as any).children[0].text).toBe('Content 2');
    expect((result[7] as any).children[0].text).toBe('Content 3');

    // Check empty paragraphs from BR tags
    expect((result[1] as any).children[0].text).toBe('');
    expect((result[2] as any).children[0].text).toBe('');
    expect((result[4] as any).children[0].text).toBe('');
    expect((result[5] as any).children[0].text).toBe('');
    expect((result[6] as any).children[0].text).toBe('');
  });

  it('should handle three consecutive BR tags not between blocks', () => {
    const editor = createPlateEditor({ plugins: [] });

    // 3 BR tags at the start, not between blocks
    const html = `
      <br />
      <br />
      <br />
    `;

    const element = getHtmlDocument(html).body;

    const output = (
      <editor>
        <hp>
          <htext />
        </hp>
        <hp>
          <htext />
        </hp>
        <hp>
          <htext />
        </hp>
      </editor>
    ) as any;

    const result = deserializeHtml(editor, { element });

    expect(result).toEqual(output.children);
  });

  it('should handle BR tags in various contexts within a div', () => {
    const editor = createPlateEditor({ plugins: [] });

    const html = `
      <div>
        <br />
        <br />
        <br />
        <p>Content</p>
      </div>
    `;

    const element = getHtmlDocument(html).body;

    const result = deserializeHtml(editor, { element });

    // Should have 4 elements: 3 empty paragraphs from BR tags + 1 paragraph with content
    expect(result).toHaveLength(4);
    expect((result[0] as any).children[0].text).toBe('');
    expect((result[1] as any).children[0].text).toBe('');
    expect((result[2] as any).children[0].text).toBe('');
    expect((result[3] as any).children[0].text).toBe('Content');
  });
});
