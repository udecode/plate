import { render } from '@testing-library/react';
import React from 'react';
import {
  EditableElement,
  SlateElement,
  SlateLeaf,
  SlatePlaceholder,
  SlateText,
} from '../src';
import { EditableText } from '../src/components/editable-text';
import { SlateSpacer } from '../src/components/slate-spacer';
import { TextString } from '../src/components/text-string';
import { ZeroWidthString } from '../src/components/zero-width-string';

describe('slate-react primitives contract', () => {
  test('ZeroWidthString renders line-break placeholders without FEFF by default', () => {
    const rendered = render(<ZeroWidthString isLineBreak />);

    const zeroWidth = rendered.container.querySelector(
      '[data-slate-zero-width="n"]'
    );

    expect(zeroWidth).toBeTruthy();
    expect(zeroWidth?.querySelector('br')?.nodeName).toBe('BR');
    expect(zeroWidth?.textContent).toBe('');
  });

  test('ZeroWidthString retains FEFF for non-linebreak placeholders', () => {
    const rendered = render(<ZeroWidthString length={4} />);

    const zeroWidth = rendered.container.querySelector(
      '[data-slate-zero-width="z"]'
    );

    expect(zeroWidth?.getAttribute('data-slate-length')).toBe('4');
    expect(zeroWidth?.querySelector('br')).toBeNull();
    expect(zeroWidth?.textContent).toBe('\uFEFF');
  });

  test('TextString renders from React state when text changes', () => {
    const rendered = render(<TextString text="alpha" />);
    const textElement = rendered.container.querySelector('[data-slate-string]');

    expect(textElement?.textContent).toBe('alpha');

    rendered.rerender(<TextString text="beta" />);

    expect(textElement?.textContent).toBe('beta');
  });

  test('SlateText and SlateLeaf own the text-node shape', () => {
    const ref = React.createRef<HTMLSpanElement>();
    const rendered = render(
      <SlateText ref={ref}>
        <SlateLeaf>
          <TextString text="alpha" />
        </SlateLeaf>
      </SlateText>
    );

    const textNode = rendered.container.querySelector(
      '[data-slate-node="text"]'
    );
    const leaf = rendered.container.querySelector('[data-slate-leaf="true"]');

    expect(textNode).toBe(ref.current);
    expect(leaf).toBeTruthy();
    expect(textNode?.textContent).toBe('alpha');
  });

  test('SlatePlaceholder supports non-void intrinsic tags through as', () => {
    const rendered = render(
      <SlatePlaceholder as={'label'} style={{ opacity: '0.5' }}>
        <span>placeholder</span>
      </SlatePlaceholder>
    );

    const placeholder = rendered.container.querySelector('label');

    expect(placeholder?.getAttribute('aria-hidden')).toBe('true');
    expect(placeholder?.getAttribute('data-slate-placeholder')).toBe('true');
  });

  test('SlatePlaceholder defaults to an inline-safe span', () => {
    const rendered = render(<SlatePlaceholder>placeholder</SlatePlaceholder>);
    const placeholder = rendered.container.querySelector(
      '[data-slate-placeholder="true"]'
    );

    expect(placeholder?.tagName).toBe('SPAN');
  });

  test('EditableText passes overlay defaults to custom placeholder renderers', () => {
    const rendered = render(
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
    );

    const placeholder = rendered.container.querySelector(
      '[data-slate-placeholder="true"]'
    ) as HTMLElement | null;

    expect(placeholder).toBeTruthy();
    expect(placeholder?.style.position).toBe('absolute');
    expect(placeholder?.style.pointerEvents).toBe('none');
    expect(placeholder?.style.width).toBe('100%');
    expect(placeholder?.style.opacity).toBe('0.333');
    expect(placeholder?.style.userSelect).toBe('none');
  });

  test('SlateElement and SlateSpacer own the element and spacer shape', () => {
    const rendered = render(
      <SlateElement isVoid style={{ position: 'relative' }}>
        <span contentEditable={false}>void</span>
        <SlateSpacer>
          <SlateText>
            <SlateLeaf>
              <ZeroWidthString length={4} />
            </SlateLeaf>
          </SlateText>
        </SlateSpacer>
      </SlateElement>
    );

    const element = rendered.container.querySelector(
      '[data-slate-node="element"]'
    );
    const spacer = rendered.container.querySelector('[data-slate-spacer]');

    expect(element?.getAttribute('data-slate-void')).toBe('true');
    expect(spacer?.textContent).toBe('\uFEFF');
  });

  test('EditableElement exposes the minimal public wrapper shape', () => {
    const rendered = render(
      <EditableElement as="section" id="editable-element">
        child
      </EditableElement>
    );

    expect(rendered.container.querySelector('#editable-element')).toBeTruthy();
  });
});
