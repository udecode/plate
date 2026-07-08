import * as copyToClipboardModule from 'copy-to-clipboard';
import type { NodeEntry } from '@platejs/plite';
import type { TIdElement } from '@platejs/utils';

import { copySelectedBlocks } from './copySelectedBlocks';

type DataTransferMock = DataTransfer & {
  getData: AnyTestMock;
  setData: AnyTestMock;
};

type CopyOptions = {
  onCopy?: (dataTransfer: DataTransfer) => void;
};

const createDataTransfer = (): DataTransferMock =>
  ({
    getData: mock((type: string) => {
      if (type === 'text/plain') return 'mock plain text';
      if (type === 'text/html') return '<p>mock html</p>';

      return '';
    }),
    setData: mock(),
  }) as DataTransferMock;

const createCopyEditor = (entries: NodeEntry<TIdElement>[]) => {
  const selectedIds = new Set(entries.map(([node]) => node.id as string));
  const writeSelection = mock((data: DataTransfer) => {
    data.setData('text/plain', 'mock plain text');
    data.setData('text/html', '<p>mock html</p>');
  });
  const selection = {
    clear: mock(),
    set: mock(),
  };

  return {
    api: {
      blockSelection: {
        getNodes: () => entries,
      },
      clipboard: { writeSelection },
    },
    getPlugin: () => ({ node: { type: 'p' } }),
    plugin: () => ({
      api: {
        blockSelection: {
          getNodes: () => entries,
        },
      },
      getOptions: () => ({ selectedIds }),
      setOption: mock(),
    }),
    read: {
      nodes: {
        get: (path: number[]) =>
          entries.find(
            ([, entryPath]) => entryPath.join('.') === path.join('.')
          ),
        isEmpty: (node: TIdElement) =>
          node.children.every(
            (child) =>
              'text' in child &&
              typeof child.text === 'string' &&
              child.text.length === 0
          ),
      },
      points: {
        after: () => ({ offset: 0, path: [0, 0] }),
        end: (path: number[]) => ({ offset: 0, path: [...path, 0] }),
        start: (path: number[]) => ({ offset: 0, path: [...path, 0] }),
      },
      selection: () => ({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      }),
    },
    setOption: mock(),
    update: {
      selection,
      withoutNormalizing: (fn: (context: { tx: unknown }) => void) =>
        fn({
          tx: {
            selection,
          },
        }),
    },
  } as any;
};

describe('copySelectedBlocks', () => {
  let copyToClipboardSpy: AnyTestMock;
  let copyToClipboardMock: ReturnType<typeof mock>;

  beforeEach(() => {
    copyToClipboardMock = mock();
    copyToClipboardSpy = spyOn(
      copyToClipboardModule,
      'default'
    ).mockImplementation(
      copyToClipboardMock as unknown as (
        text: string,
        options?: CopyOptions
      ) => boolean
    );
  });

  afterEach(() => {
    copyToClipboardSpy.mockRestore();
  });

  it('copies selected blocks and writes placeholder HTML for empty blocks', () => {
    const editor = createCopyEditor([
      [
        {
          id: 'block1',
          children: [{ text: 'First block' }],
          type: 'p',
        },
        [0],
      ],
      [
        {
          id: 'block2',
          children: [{ text: '' }],
          type: 'p',
        },
        [1],
      ],
      [
        {
          id: 'block3',
          children: [{ text: '   ' }],
          type: 'p',
        },
        [2],
      ],
      [
        {
          id: 'block4',
          children: [{ text: 'Last block' }],
          type: 'p',
        },
        [3],
      ],
    ]);
    const dataTransfer = createDataTransfer();
    copyToClipboardMock.mockImplementation(
      (_text: string, options?: CopyOptions) => {
        options?.onCopy?.(dataTransfer);

        return true;
      }
    );

    expect(copySelectedBlocks(editor)).toBe(true);
    expect(editor.api.clipboard.writeSelection).toHaveBeenCalledTimes(3);
    expect(dataTransfer.setData).toHaveBeenCalledWith(
      'text/plain',
      expect.any(String)
    );

    const htmlCall = dataTransfer.setData.mock.calls
      .filter((call) => call[0] === 'text/html')
      .at(-1);
    expect(htmlCall).toBeDefined();
    expect(htmlCall![1]).toContain('<p></p>');
    expect((htmlCall![1].match(/<div>/g) || []).length).toBe(4);
    expect(dataTransfer.setData).toHaveBeenCalledWith(
      'application/x-slate-fragment',
      expect.any(String)
    );
  });

  it('copies selected blocks with content', () => {
    const editor = createCopyEditor([
      [
        {
          id: 'block1',
          children: [{ text: 'First block' }],
          type: 'p',
        },
        [0],
      ],
      [
        {
          id: 'block2',
          children: [{ text: 'Second block' }],
          type: 'p',
        },
        [1],
      ],
    ]);
    const dataTransfer = createDataTransfer();
    copyToClipboardMock.mockImplementation(
      (_text: string, options?: CopyOptions) => {
        options?.onCopy?.(dataTransfer);

        return true;
      }
    );

    expect(copySelectedBlocks(editor)).toBe(true);
    expect(editor.api.clipboard.writeSelection).toHaveBeenCalledTimes(2);
    expect(dataTransfer.setData).toHaveBeenCalledWith(
      'text/plain',
      expect.any(String)
    );
    expect(dataTransfer.setData).toHaveBeenCalledWith(
      'text/html',
      expect.any(String)
    );
    expect(dataTransfer.setData).toHaveBeenCalledWith(
      'application/x-slate-fragment',
      expect.any(String)
    );
  });

  it('writes to provided clipboard data without starting a synthetic copy', () => {
    const editor = createCopyEditor([
      [
        {
          id: 'block1',
          children: [{ text: 'First block' }],
          type: 'p',
        },
        [0],
      ],
      [
        {
          id: 'block2',
          children: [{ text: 'Second block' }],
          type: 'p',
        },
        [1],
      ],
    ]);
    const dataTransfer = createDataTransfer();

    expect(copySelectedBlocks(editor, dataTransfer)).toBe(true);
    expect(copyToClipboardMock).not.toHaveBeenCalled();
    expect(editor.api.clipboard.writeSelection).toHaveBeenCalledTimes(2);
    expect(dataTransfer.setData).toHaveBeenCalledWith(
      'text/plain',
      expect.any(String)
    );
    expect(dataTransfer.setData).toHaveBeenCalledWith(
      'text/html',
      expect.any(String)
    );
    expect(dataTransfer.setData).toHaveBeenCalledWith(
      'application/x-slate-fragment',
      expect.any(String)
    );
  });
});
