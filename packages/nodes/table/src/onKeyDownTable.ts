import {
  getAboveNode,
  Hotkeys,
  KeyboardHandlerReturnType,
  PlateEditor,
  PluginOptions,
  select,
  TElement,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-core';
import isHotkey from 'is-hotkey';
import {
  getNextTableCell,
  getPreviousTableCell,
  getTableCellEntry,
} from './queries/index';
import { moveSelectionFromCell } from './transforms/index';
import { keyShiftEdges } from './constants';

export const onKeyDownTable = <
  P = PluginOptions,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E,
  { type }: WithPlatePlugin<P, V, E>
): KeyboardHandlerReturnType => (e) => {
  const setEditorLastKeyDown = (hotkey: string) => {
    if (isHotkey(hotkey, e)) {
      editor.lastKeyDown = hotkey;
    }
  };

  const keys = ['up', 'down', 'left', 'right'];

  // set last key down to editor so we can override apply set_selection
  keys.forEach((key) => {
    setEditorLastKeyDown(key);
  });

  const isKeyDown = {
    'shift+up': isHotkey('shift+up', e),
    'shift+down': isHotkey('shift+down', e),
    'shift+left': isHotkey('shift+left', e),
    'shift+right': isHotkey('shift+right', e),
  };

  Object.keys(isKeyDown).forEach((key) => {
    if (isKeyDown[key]) {
      // if many cells are selected
      if (
        moveSelectionFromCell(editor, {
          reverse: key === 'shift+up',
          edge: keyShiftEdges[key],
        })
      ) {
        e.preventDefault();
        e.stopPropagation();
      } else {
        setEditorLastKeyDown(key);
      }
    }
  });

  // if (isHotkey('down', e) || isShiftDown) {
  //   editor.lastKeyDown = e.key;
  // if (
  //   moveSelectionFromCell(editor, {
  //     edge: isShiftDown ? 'bottom' : undefined,
  //   })
  // ) {
  //   e.preventDefault();
  //   e.stopPropagation();
  // }
  // }

  // if (isHotkey('shift+left', e)) {
  //   if (moveSelectionFromCell(editor, { edge: 'left' })) {
  //     e.preventDefault();
  //     e.stopPropagation();
  //   }
  // }
  //
  // if (isHotkey('shift+right', e)) {
  //   if (moveSelectionFromCell(editor, { edge: 'right' })) {
  //     e.preventDefault();
  //     e.stopPropagation();
  //   }
  // }

  const isTab = Hotkeys.isTab(editor, e);
  const isUntab = Hotkeys.isUntab(editor, e);
  if (isTab || isUntab) {
    const res = getTableCellEntry(editor, {});
    if (!res) return;
    const { tableRow, tableCell } = res;
    const [, tableCellPath] = tableCell;

    if (isUntab) {
      // move left with shift+tab
      const previousCell = getPreviousTableCell(
        editor,
        tableCell,
        tableCellPath,
        tableRow
      );
      if (previousCell) {
        const [, previousCellPath] = previousCell;
        select(editor, previousCellPath);
        e.preventDefault();
        e.stopPropagation();
      }
    } else if (isTab) {
      // move right with tab
      const nextCell = getNextTableCell(
        editor,
        tableCell,
        tableCellPath,
        tableRow
      );
      if (nextCell) {
        const [, nextCellPath] = nextCell;
        select(editor, nextCellPath);
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }

  if (isHotkey('mod+a', e)) {
    const res = getAboveNode<TElement>(editor, { match: { type } });
    if (!res) return;

    const [, tablePath] = res;

    // select the whole table
    select(editor, tablePath);

    e.preventDefault();
    e.stopPropagation();
  }
};
