import * as Y from 'yjs';

import * as withTCursorsModule from './withTCursors';
import * as withTYHistoryModule from './withTYHistory';
import * as withTYjsModule from './withTYjs';
import { withPlateYjs } from './withPlateYjs';

const createContext = (options: Partial<Record<string, any>> = {}) => {
  const editor = {
    api: {
      debug: {
        error: mock(() => {}),
      },
    },
  };

  return {
    editor,
    getOptions: () => ({
      awareness: { id: 'awareness-1' },
      cursors: null,
      localOrigin: undefined,
      positionStorageOrigin: undefined,
      sharedType: null,
      ydoc: new Y.Doc({ guid: 'doc-1' }),
      ...options,
    }),
  };
};

describe('withPlateYjs', () => {
  afterEach(() => {
    mock.restore();
  });

  it('uses the provided shared type and applies history last', () => {
    const calls: string[] = [];
    const sharedType = new Y.XmlText();
    const withTYjsSpy = spyOn(withTYjsModule, 'withTYjs').mockImplementation(((
      editor: any,
      currentSharedType: Y.XmlText,
      currentOptions: any
    ) => {
      calls.push('withTYjs');

      expect(currentSharedType).toBe(sharedType);
      expect(currentOptions).toEqual({
        autoConnect: false,
        localOrigin: 'local-origin',
        positionStorageOrigin: 'position-origin',
      });

      return { ...editor, fromYjs: true } as any;
    }) as any);
    const withTYHistorySpy = spyOn(
      withTYHistoryModule,
      'withTYHistory'
    ).mockImplementation(((editor: any) => {
      calls.push('withTYHistory');

      expect((editor as any).fromYjs).toBe(true);

      return { ...editor, fromHistory: true } as any;
    }) as any);
    const context = createContext({
      localOrigin: 'local-origin',
      positionStorageOrigin: 'position-origin',
      sharedType,
    });

    const result = withPlateYjs(context as any);

    expect(withTYjsSpy).toHaveBeenCalledTimes(1);
    expect(withTYHistorySpy).toHaveBeenCalledTimes(1);
    expect(calls).toEqual(['withTYjs', 'withTYHistory']);
    expect((result as any).fromHistory).toBe(true);
  });

  it('falls back to ydoc content and wires cursors with autoSend disabled', () => {
    const calls: string[] = [];
    const awareness = { id: 'awareness-1' };
    const ydoc = new Y.Doc({ guid: 'doc-1' });
    const expectedSharedType = ydoc.get('content', Y.XmlText) as Y.XmlText;
    const withTYjsSpy = spyOn(withTYjsModule, 'withTYjs').mockImplementation(((
      editor: any,
      currentSharedType: Y.XmlText
    ) => {
      calls.push('withTYjs');
      expect(currentSharedType).toBe(expectedSharedType);

      return { ...editor, fromYjs: true } as any;
    }) as any);
    const withTCursorsSpy = spyOn(
      withTCursorsModule,
      'withTCursors'
    ).mockImplementation(((
      editor: any,
      currentAwareness: any,
      cursorOptions: any
    ) => {
      calls.push('withTCursors');

      expect(currentAwareness).toBe(awareness);
      expect(cursorOptions).toEqual({
        autoSend: false,
        dataField: 'cursorData',
      });

      return { ...editor, fromCursors: true } as any;
    }) as any);
    const withTYHistorySpy = spyOn(
      withTYHistoryModule,
      'withTYHistory'
    ).mockImplementation(((editor: any) => {
      calls.push('withTYHistory');
      expect((editor as any).fromCursors).toBe(true);

      return editor as any;
    }) as any);

    withPlateYjs(
      createContext({
        awareness,
        cursors: {
          autoSend: false,
          dataField: 'cursorData',
        },
        ydoc,
      }) as any
    );

    expect(withTYjsSpy).toHaveBeenCalledTimes(1);
    expect(withTCursorsSpy).toHaveBeenCalledTimes(1);
    expect(withTYHistorySpy).toHaveBeenCalledTimes(1);
    expect(calls).toEqual(['withTYjs', 'withTCursors', 'withTYHistory']);
  });

  it('skips cursor wiring when cursors are disabled', () => {
    const withTYjsSpy = spyOn(withTYjsModule, 'withTYjs').mockImplementation(
      ((editor: any) => editor) as any
    );
    const withTCursorsSpy = spyOn(
      withTCursorsModule,
      'withTCursors'
    ).mockImplementation(((editor: any) => editor) as any);
    const withTYHistorySpy = spyOn(
      withTYHistoryModule,
      'withTYHistory'
    ).mockImplementation(((editor: any) => editor) as any);

    withPlateYjs(createContext({ cursors: null }) as any);

    expect(withTYjsSpy).toHaveBeenCalledTimes(1);
    expect(withTCursorsSpy).not.toHaveBeenCalled();
    expect(withTYHistorySpy).toHaveBeenCalledTimes(1);
  });

  it('logs a debug error instead of wiring cursors when awareness is missing', () => {
    const withTYjsSpy = spyOn(withTYjsModule, 'withTYjs').mockImplementation(
      ((editor: any) => editor) as any
    );
    const withTCursorsSpy = spyOn(
      withTCursorsModule,
      'withTCursors'
    ).mockImplementation(((editor: any) => editor) as any);
    const withTYHistorySpy = spyOn(
      withTYHistoryModule,
      'withTYHistory'
    ).mockImplementation(((editor: any) => editor) as any);
    const context = createContext({
      awareness: null,
      cursors: {},
    });

    withPlateYjs(context as any);

    expect(withTYjsSpy).toHaveBeenCalledTimes(1);
    expect(withTCursorsSpy).not.toHaveBeenCalled();
    expect(withTYHistorySpy).toHaveBeenCalledTimes(1);
    expect(context.editor.api.debug.error).toHaveBeenCalledWith(
      'Yjs plugin: Internal shared awareness (awareness) is missing but cursors are enabled.'
    );
  });
});
