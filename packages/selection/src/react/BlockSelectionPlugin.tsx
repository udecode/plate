import type { CSSProperties } from 'react';
import React from 'react';
import ReactDOM from 'react-dom';

import {
  type PluginConfig,
  type QueryNodeOptions,
  type TElement,
  type TNodeEntry,
  bindFirst,
  getNodeEntries,
} from '@udecode/plate-common';
import {
  findNode,
  getEndPoint,
  getNextNode,
  getPreviousNode,
  isHotkey,
  removeNodes,
} from '@udecode/plate-common';
import { createTPlatePlugin } from '@udecode/plate-common/react';
import {
  type EditableSiblingComponent,
  focusEditor,
  isEditorReadOnly,
  useEditorPlugin,
  useEditorRef,
} from '@udecode/plate-common/react';

import type { ChangedElements, PartialSelectionOptions } from '../internal';

import { getAllSelectableDomNode, getSelectedDomNode } from '../lib';
import { extractSelectableIds } from '../lib/extractSelectableIds';
import { BlockMenuPlugin } from './BlockMenuPlugin';
import { BlockSelectable } from './components/BlockSelectable';
import { useSelectionArea } from './hooks/useSelectionArea';
import { onKeyDownSelection } from './onKeyDownSelection';
import { duplicateBlockSelectionNodes } from './transforms/duplicateBlockSelectionNodes';
import { insertBlocksAndSelect } from './transforms/insertBlocksAndSelect';
import { removeBlockSelectionNodes } from './transforms/removeBlockSelectionNodes';
import { selectBlockSelectionNodes } from './transforms/selectBlockSelectionNodes';
import {
  setBlockSelectionIndent,
  setBlockSelectionNodes,
  setBlockSelectionTexts,
} from './transforms/setBlockSelectionNodes';
import {
  copySelectedBlocks,
  onChangeBlockSelection,
  pasteSelectedBlocks,
  selectInsertedBlocks,
} from './utils';

export type BlockSelectionConfig = PluginConfig<
  'blockSelection',
  {
    areaOptions?: PartialSelectionOptions;
    editorPaddingRight?: CSSProperties['width'];
    enableContextMenu?: boolean;
    isSelecting?: boolean;
    isSelectionAreaVisible?: boolean;
    query?: QueryNodeOptions;
    rightSelectionAreaClassName?: string;
    selectedIds?: Set<string>;
    onKeyDownSelecting?: (e: KeyboardEvent) => void;
  } & BlockSelectionSelectors,
  {
    blockSelection: BlockSelectionApi;
  }
>;

export type BlockSelectionSelectors = {
  isSelected?: (id?: string) => boolean;
  isSelectingSome?: () => boolean;
};

export type BlockSelectionApi = {
  addSelectedRow: (
    id: string,
    options?: { aboveHtmlNode?: HTMLDivElement; clear?: boolean }
  ) => void;
  setSelectedIds: (
    options: Partial<ChangedElements> & { ids?: string[] }
  ) => void;
  getNodes: () => TNodeEntry[];
  resetSelectedIds: () => void;
  selectedAll: () => void;
  unselect: () => void;
};

export const BlockSelectionAfterEditable: EditableSiblingComponent = () => {
  const editor = useEditorRef();
  const { api, getOption, getOptions, useOption } =
    useEditorPlugin<BlockSelectionConfig>({ key: 'blockSelection' });
  const isSelecting = useOption('isSelecting');
  const selectedIds = useOption('selectedIds');

  useSelectionArea();

  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);

    return () => {
      setIsMounted(false);
    };
  }, []);

  React.useEffect(() => {
    if (isSelecting && inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    } else if (inputRef.current) {
      inputRef.current.blur();
    }
  }, [isSelecting]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const isReadonly = isEditorReadOnly(editor);
      getOptions().onKeyDownSelecting?.(e.nativeEvent);

      // selecting commands
      if (!getOptions().isSelecting) return;
      if (isHotkey('escape')(e)) {
        api.blockSelection.unselect();
      }
      if (isHotkey('mod+z')(e)) {
        editor.undo();
        selectInsertedBlocks(editor);
      }
      if (isHotkey('mod+shift+z')(e)) {
        editor.redo();
        selectInsertedBlocks(editor);
      }
      // selecting some commands
      if (!getOption('isSelectingSome')) return;
      if (isHotkey('enter')(e)) {
        // get the first block in the selection
        const entry = findNode(editor, {
          at: [],
          match: (n) => selectedIds!.has(n.id),
        });

        if (entry) {
          const [, path] = entry;

          // focus the end of that block
          focusEditor(editor, getEndPoint(editor, path));
          e.preventDefault();
        }
      }
      if (isHotkey(['backspace', 'delete'])(e) && !isReadonly) {
        removeNodes(editor, {
          at: [],
          match: (n) => selectedIds!.has(n.id),
        });
      }
      // TODO: skip toggle child
      if (isHotkey('up')(e)) {
        const firstId = [...selectedIds!][0];
        const node = findNode(editor, {
          at: [],
          match: (n) => n.id === firstId,
        });
        const prev = getPreviousNode(editor, {
          at: node?.[1],
        });

        const prevId = prev?.[0].id;
        api.blockSelection.addSelectedRow(prevId);
      }
      if (isHotkey('down')(e)) {
        const lastId = [...selectedIds!].pop();
        const node = findNode(editor, {
          at: [],
          match: (n) => n.id === lastId,
        });
        const next = getNextNode(editor, {
          at: node?.[1],
        });
        const nextId = next?.[0].id;
        api.blockSelection.addSelectedRow(nextId);
      }
    },
    [editor, selectedIds, api, getOptions, getOption]
  );

  const handleCopy = React.useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();

      if (getOption('isSelectingSome')) {
        copySelectedBlocks(editor);
      }
    },
    [editor, getOption]
  );

  const handleCut = React.useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();

      if (getOption('isSelectingSome')) {
        copySelectedBlocks(editor);

        if (!isEditorReadOnly(editor)) {
          removeNodes(editor, {
            at: [],
            match: (n) => selectedIds!.has(n.id),
          });

          focusEditor(editor);
        }
      }
    },
    [editor, selectedIds, getOption]
  );

  const handlePaste = React.useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();

      if (!isEditorReadOnly(editor)) {
        pasteSelectedBlocks(editor, e.nativeEvent);
      }
    },
    [editor]
  );

  if (!isMounted || typeof window === 'undefined') {
    return null;
  }

  return ReactDOM.createPortal(
    <input
      ref={inputRef}
      // eslint-disable-next-line tailwindcss/no-custom-classname
      className="slate-shadow-input"
      style={{
        left: '-300px',
        opacity: 0,
        position: 'fixed',
        top: '-300px',
        zIndex: 999,
      }}
      onCopy={handleCopy}
      onCut={handleCut}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
    />,
    document.body
  );
};

export const BlockSelectionPlugin = createTPlatePlugin<BlockSelectionConfig>({
  key: 'blockSelection',
  options: {
    areaOptions: {
      behaviour: {
        scrolling: {
          speedDivider: 5,
          startScrollMargins: { x: 20, y: 0 },
        },
        startThreshold: 5,
      },
      features: {
        singleTap: {
          allow: false,
        },
      },
    },
    enableContextMenu: false,
    isSelecting: false,
    isSelectionAreaVisible: false,
    query: {
      maxLevel: 1,
    },
    selectedIds: new Set(),
  },
  plugins: [BlockMenuPlugin],
  render: {
    aboveNodes:
      () =>
      ({ children, element }) =>
        BlockSelectable({
          children,
          options: {
            element,
          },
        }),
    afterEditable: BlockSelectionAfterEditable,
  },
  handlers: {
    onChange: onChangeBlockSelection,
    onKeyDown: onKeyDownSelection,
  },
})
  .extendOptions(({ getOptions }) => ({
    isSelected: (id?: string) => !!id && getOptions().selectedIds!.has(id),
    isSelectingSome: () => getOptions().selectedIds!.size > 0,
  }))
  .extendApi<Partial<BlockSelectionApi>>(
    ({ editor, getOption, getOptions, setOption }) => ({
      getNodes: () => {
        const selectedIds = getOption('selectedIds');

        return [
          ...getNodeEntries<TElement>(editor, {
            at: [],
            match: (n) => selectedIds?.has(n.id),
          }),
        ];
      },
      resetSelectedIds: () => {
        setOption('selectedIds', new Set());
      },
      setSelectedIds: ({ added, ids, removed }) => {
        if (ids) {
          setOption('selectedIds', new Set(ids));
        }
        if (added || removed) {
          const { selectedIds: prev } = getOptions();
          const next = new Set(prev);

          if (added) {
            extractSelectableIds(added).forEach((id) => next.add(id));
          }
          if (removed) {
            extractSelectableIds(removed).forEach((id) => next.delete(id));
          }

          setOption('selectedIds', next);
        }

        setOption('isSelecting', true);
      },
      unselect: () => {
        setOption('selectedIds', new Set());
        setOption('isSelecting', false);
      },
    })
  )
  .extendApi<Partial<BlockSelectionApi>>(({ api, getOptions, setOption }) => ({
    addSelectedRow: (id, options = {}) => {
      const { aboveHtmlNode, clear = true } = options;

      const element = aboveHtmlNode ?? getSelectedDomNode(id);

      if (!element) return;
      if (!getOptions().selectedIds!.has(id) && clear) {
        setOption('selectedIds', new Set());
      }

      api.blockSelection.setSelectedIds({
        added: [element],
        removed: [],
      });
    },

    selectedAll: () => {
      const all = getAllSelectableDomNode();
      setOption('selectedIds', new Set());

      api.blockSelection.setSelectedIds({
        added: Array.from(all),
        removed: [],
      });
    },
  }))
  .extendTransforms(({ editor }) => ({
    duplicate: bindFirst(duplicateBlockSelectionNodes, editor),
    insertBlocksAndSelect: bindFirst(insertBlocksAndSelect, editor),
    removeNodes: bindFirst(removeBlockSelectionNodes, editor),
    select: bindFirst(selectBlockSelectionNodes, editor),
    setIndent: bindFirst(setBlockSelectionIndent, editor),
    setNodes: bindFirst(setBlockSelectionNodes, editor),
    setTexts: bindFirst(setBlockSelectionTexts, editor),
  }));
