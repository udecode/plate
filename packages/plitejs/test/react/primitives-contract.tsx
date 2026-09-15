import { render } from '@testing-library/react';
import React from 'react';

import {
  createEditor,
  EditorRoot,
  EditorElement,
  EditorLeaf,
  EditorPlaceholder,
  EditorText,
} from '../../src/react';
import { EditableText } from '../../src/react/components/editable-text';
import { PliteSpacer } from '../../src/react/components/plite-spacer';
import { TextString } from '../../src/react/components/text-string';
import { ZeroWidthString } from '../../src/react/components/zero-width-string';

describe('plite-react primitives contract', () => {
  test('ZeroWidthString renders line-break placeholders without FEFF by default', () => {
    const rendered = render(<ZeroWidthString isLineBreak />);

    const zeroWidth = rendered.container.querySelector(
      '[data-editor-zero-width="n"]'
    );

    expect(zeroWidth).toBeTruthy();
    expect(zeroWidth?.querySelector('br')?.nodeName).toBe('BR');
    expect(zeroWidth?.textContent).toBe('');
  });

  test('ZeroWidthString retains FEFF for non-linebreak placeholders', () => {
    const rendered = render(<ZeroWidthString length={4} />);

    const zeroWidth = rendered.container.querySelector(
      '[data-editor-zero-width="z"]'
    );

    expect(zeroWidth?.getAttribute('data-editor-length')).toBe('4');
    expect(zeroWidth?.querySelector('br')).toBeNull();
    expect(zeroWidth?.textContent).toBe('\uFEFF');
  });

  test('TextString renders from React state when text changes', () => {
    const rendered = render(<TextString text="alpha" />);
    const textElement = rendered.container.querySelector(
      '[data-editor-string]'
    );

    expect(textElement?.textContent).toBe('alpha');

    rendered.rerender(<TextString text="beta" />);

    expect(textElement?.textContent).toBe('beta');
  });

  test('EditableText preserves leaf DOM identity when text length changes', () => {
    const editor = createEditor();
    const rendered = render(
      <EditorRoot editor={editor}>
        <EditableText text="alpha" />
      </EditorRoot>
    );
    const leaf = rendered.container.querySelector('[data-editor-leaf="true"]');
    const text = rendered.container.querySelector('[data-editor-string]');

    rendered.rerender(
      <EditorRoot editor={editor}>
        <EditableText text="Zalpha" />
      </EditorRoot>
    );

    expect(rendered.container.querySelector('[data-editor-leaf="true"]')).toBe(
      leaf
    );
    expect(rendered.container.querySelector('[data-editor-string]')).toBe(text);
    expect(text?.textContent).toBe('Zalpha');
  });

  test('PliteText and PliteLeaf own the text-node shape', () => {
    const ref = React.createRef<HTMLSpanElement>();
    const rendered = render(
      <EditorText ref={ref}>
        <EditorLeaf>
          <TextString text="alpha" />
        </EditorLeaf>
      </EditorText>
    );

    const textNode = rendered.container.querySelector(
      '[data-editor-node="text"]'
    );
    const leaf = rendered.container.querySelector('[data-editor-leaf="true"]');

    expect(textNode).toBe(ref.current);
    expect(leaf).toBeTruthy();
    expect(textNode?.textContent).toBe('alpha');
  });

  test('PlitePlaceholder supports non-void intrinsic tags through as', () => {
    const rendered = render(
      <EditorPlaceholder as="label" style={{ opacity: '0.5' }}>
        <span>placeholder</span>
      </EditorPlaceholder>
    );

    const placeholder = rendered.container.querySelector('label');

    expect(placeholder?.getAttribute('aria-hidden')).toBe('true');
    expect(placeholder?.getAttribute('data-editor-placeholder')).toBe('true');
  });

  test('PlitePlaceholder defaults to an inline-safe span', () => {
    const rendered = render(<EditorPlaceholder>placeholder</EditorPlaceholder>);
    const placeholder = rendered.container.querySelector(
      '[data-editor-placeholder="true"]'
    );

    expect(placeholder?.tagName).toBe('SPAN');
  });

  test('EditableText passes only structural defaults to placeholder renderers', () => {
    const editor = createEditor();
    const rendered = render(
      <EditorRoot editor={editor}>
        <EditableText
          placeholder="Type something"
          renderPlaceholder={({ attributes, children }) => (
            <div {...attributes}>
              <p>{children}</p>
              <pre>custom placeholder</pre>
            </div>
          )}
          text=""
          zeroWidth={{ isLineBreak: true }}
        />
      </EditorRoot>
    );

    const placeholder = rendered.container.querySelector(
      '[data-editor-placeholder="true"]'
    ) as HTMLElement | null;

    expect(placeholder).toBeTruthy();
    expect(placeholder?.style.position).toBe('absolute');
    expect(placeholder?.style.pointerEvents).toBe('none');
    expect(placeholder?.style.width).toBe('100%');
    expect(placeholder?.style.userSelect).toBe('none');
    expect(placeholder?.style.opacity).toBe('');
    expect(placeholder?.style.textDecoration).toBe('');
  });

  test('PliteElement and PliteSpacer own the element and spacer shape', () => {
    const rendered = render(
      <EditorElement isVoid style={{ position: 'relative' }}>
        <span contentEditable={false}>void</span>
        <PliteSpacer>
          <EditorText>
            <EditorLeaf>
              <ZeroWidthString length={4} />
            </EditorLeaf>
          </EditorText>
        </PliteSpacer>
      </EditorElement>
    );

    const element = rendered.container.querySelector(
      '[data-editor-node="element"]'
    );
    const spacer = rendered.container.querySelector('[data-editor-spacer]');

    expect(element?.getAttribute('data-editor-void')).toBe('true');
    expect(spacer).toHaveStyle({ caretColor: 'transparent' });
    expect(spacer?.textContent).toBe('\uFEFF');
  });
});
