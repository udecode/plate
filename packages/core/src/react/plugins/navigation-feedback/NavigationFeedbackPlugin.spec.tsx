import React from 'react';

import { act, render } from '@testing-library/react';

import { Plate } from '../../components/Plate';
import { PlateContent } from '../../components/PlateContent';
import { createPlateEditor } from '../../editor';
import { NavigationFeedbackPlugin } from './NavigationFeedbackPlugin';

const flushMicrotasks = async (count = 3) => {
  for (let index = 0; index < count; index += 1) {
    await Promise.resolve();
  }
};

describe('NavigationFeedbackPlugin', () => {
  afterEach(() => {
    mock.restore();
  });

  it('updates navigation highlight attributes without a selection change', async () => {
    const editor = createPlateEditor({
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    } as any);
    const initialSelection = editor.selection;

    const { getByText } = render(
      <Plate editor={editor}>
        <PlateContent />
      </Plate>
    );

    const getHighlightedElement = () =>
      getByText('one').closest('[data-slate-node="element"]') as HTMLElement;

    expect(
      getHighlightedElement().getAttribute('data-nav-highlight')
    ).toBeNull();

    await act(async () => {
      await Promise.resolve();
    });

    expect(typeof editor.api.redecorate).toBe('function');

    act(() => {
      editor.tf.navigation.flashTarget({
        target: {
          path: [0],
          type: 'node',
        },
      });
    });

    expect(editor.selection).toEqual(initialSelection);

    await act(async () => {
      await flushMicrotasks();
    });
    expect(getHighlightedElement().getAttribute('data-nav-highlight')).toBe(
      'navigated'
    );
    expect(getHighlightedElement().getAttribute('data-nav-pulse')).toBe('1');

    act(() => {
      editor.tf.navigation.clear();
    });
    expect(editor.api.navigation.activeTarget()).toBeNull();

    await act(async () => {
      await flushMicrotasks();
    });
    expect(
      getHighlightedElement().getAttribute('data-nav-highlight')
    ).toBeNull();
  });

  it('uses the top-level navigationFeedback option on createPlateEditor', () => {
    const editor = createPlateEditor({
      navigationFeedback: { duration: 1200 },
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    } as any);

    expect(editor.getOption(NavigationFeedbackPlugin, 'duration')).toBe(1200);
  });
});
