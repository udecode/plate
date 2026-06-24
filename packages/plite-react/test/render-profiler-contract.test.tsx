import { render } from '@testing-library/react';
import React from 'react';
import { PliteElement, PliteLeaf, PliteText } from '../src';
import { PliteSpacer } from '../src/components/plite-spacer';
import { TextString } from '../src/components/text-string';
import { ZeroWidthString } from '../src/components/zero-width-string';
import {
  createPliteReactRenderCounter,
  recordPliteReactRender,
  type PliteReactRenderProfiler,
} from '../src/render-profiler';

declare global {
  var __PLITE_REACT_RENDER_PROFILER__: PliteReactRenderProfiler | undefined;
}

describe('plite-react render profiler contract', () => {
  afterEach(() => {
    globalThis.__PLITE_REACT_RENDER_PROFILER__ = undefined;
  });

  test('does nothing unless a profiler is installed', () => {
    expect(() => {
      recordPliteReactRender({ kind: 'element' });
      render(
        <PliteElement>
          <PliteText>
            <PliteLeaf>
              <TextString text="alpha" />
            </PliteLeaf>
          </PliteText>
        </PliteElement>
      );
    }).not.toThrow();
  });

  test('records primitive render counts while installed', () => {
    const counter = createPliteReactRenderCounter();
    globalThis.__PLITE_REACT_RENDER_PROFILER__ = counter.profiler;

    const rendered = render(
      <PliteElement id="outer">
        <PliteText>
          <PliteLeaf>
            <TextString text="alpha" />
          </PliteLeaf>
        </PliteText>
        <PliteSpacer>
          <ZeroWidthString length={2} />
        </PliteSpacer>
      </PliteElement>
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
      <PliteElement id="outer">
        <PliteText>
          <PliteLeaf>
            <TextString text="beta" />
          </PliteLeaf>
        </PliteText>
      </PliteElement>
    );

    const rerenderSnapshot = counter.snapshot();

    expect(rerenderSnapshot.byKind.element).toBeGreaterThan(
      initialSnapshot.byKind.element ?? 0
    );
    expect(rerenderSnapshot.byKind.text).toBe(2);
    expect(rerenderSnapshot.byKind.leaf).toBe(2);
  });
});
