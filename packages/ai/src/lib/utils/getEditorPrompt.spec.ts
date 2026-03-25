import * as selectionModule from '@platejs/selection';

import { getEditorPrompt } from './getEditorPrompt';

describe('getEditorPrompt', () => {
  it('returns plain string prompts unchanged', () => {
    const isSelectingSpy = spyOn(
      selectionModule,
      'isSelecting'
    ).mockReturnValue(false);
    const editor = {
      getOption: mock(() => false),
    } as any;

    expect(getEditorPrompt(editor, { prompt: 'Refine this block' })).toBe(
      'Refine this block'
    );

    isSelectingSpy.mockRestore();
  });

  it('passes editor selection state into function prompts', () => {
    const isSelectingSpy = spyOn(
      selectionModule,
      'isSelecting'
    ).mockReturnValue(true);
    const editor = {
      getOption: mock(() => true),
    } as any;
    let received: unknown;
    const prompt = ({
      isBlockSelecting,
      isSelecting,
    }: {
      isBlockSelecting: boolean;
      isSelecting: boolean;
    }) => {
      received = { editor, isBlockSelecting, isSelecting };

      return `block:${isBlockSelecting};selection:${isSelecting}`;
    };

    expect(getEditorPrompt(editor, { prompt })).toBe(
      'block:true;selection:true'
    );
    expect(received).toEqual({
      editor,
      isBlockSelecting: true,
      isSelecting: true,
    });

    isSelectingSpy.mockRestore();
  });

  it('prefers blockSelecting over selecting over default in config prompts', () => {
    const isSelectingSpy = spyOn(
      selectionModule,
      'isSelecting'
    ).mockReturnValue(true);
    const editor = {
      getOption: mock(() => true),
    } as any;

    expect(
      getEditorPrompt(editor, {
        prompt: {
          blockSelecting: 'block prompt',
          default: 'default prompt',
          selecting: 'selection prompt',
        },
      })
    ).toBe('block prompt');

    isSelectingSpy.mockRestore();
  });

  it('falls back to default when a matching branch is missing', () => {
    const isSelectingSpy = spyOn(
      selectionModule,
      'isSelecting'
    ).mockReturnValue(true);
    const editor = {
      getOption: mock(() => false),
    } as any;

    expect(
      getEditorPrompt(editor, {
        prompt: {
          default: 'default prompt',
        },
      })
    ).toBe('default prompt');

    isSelectingSpy.mockRestore();
  });
});
