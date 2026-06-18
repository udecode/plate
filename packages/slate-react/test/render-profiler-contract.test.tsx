import { render } from '@testing-library/react';
import React from 'react';
import { SlateElement, SlateLeaf, SlateText } from '../src';
import { SlateSpacer } from '../src/components/slate-spacer';
import { TextString } from '../src/components/text-string';
import { ZeroWidthString } from '../src/components/zero-width-string';
import {
  createSlateReactRenderCounter,
  recordSlateReactRender,
  type SlateReactRenderProfiler,
} from '../src/render-profiler';

declare global {
  var __SLATE_REACT_RENDER_PROFILER__: SlateReactRenderProfiler | undefined;
}

describe('slate-react render profiler contract', () => {
  afterEach(() => {
    globalThis.__SLATE_REACT_RENDER_PROFILER__ = undefined;
  });

  test('does nothing unless a profiler is installed', () => {
    expect(() => {
      recordSlateReactRender({ kind: 'element' });
      render(
        <SlateElement>
          <SlateText>
            <SlateLeaf>
              <TextString text="alpha" />
            </SlateLeaf>
          </SlateText>
        </SlateElement>
      );
    }).not.toThrow();
  });

  test('records primitive render counts while installed', () => {
    const counter = createSlateReactRenderCounter();
    globalThis.__SLATE_REACT_RENDER_PROFILER__ = counter.profiler;

    const rendered = render(
      <SlateElement id="outer">
        <SlateText>
          <SlateLeaf>
            <TextString text="alpha" />
          </SlateLeaf>
        </SlateText>
        <SlateSpacer>
          <ZeroWidthString length={2} />
        </SlateSpacer>
      </SlateElement>
    );

    const initialSnapshot = counter.snapshot();

    expect(initialSnapshot.byKind.element).toBeGreaterThanOrEqual(1);
    expect(initialSnapshot.byKind).toMatchObject({
      leaf: 1,
      spacer: 1,
      text: 1,
    });
    expect(initialSnapshot.byKey['element:outer']).toBeGreaterThanOrEqual(1);

    rendered.rerender(
      <SlateElement id="outer">
        <SlateText>
          <SlateLeaf>
            <TextString text="beta" />
          </SlateLeaf>
        </SlateText>
      </SlateElement>
    );

    const rerenderSnapshot = counter.snapshot();

    expect(rerenderSnapshot.byKind.element).toBeGreaterThan(
      initialSnapshot.byKind.element ?? 0
    );
    expect(rerenderSnapshot.byKind.text).toBe(2);
    expect(rerenderSnapshot.byKind.leaf).toBe(2);
  });
});
