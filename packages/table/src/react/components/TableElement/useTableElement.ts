import React from 'react';

import { collapseSelection } from '@udecode/plate-common';
import { useEditorRef, useElement } from '@udecode/plate-common/react';

import { type TTableElement, computeCellIndices } from '../../../lib';
import { TablePlugin } from '../../TablePlugin';
import { useTableStore } from '../../stores';
import { useSelectedCells } from './useSelectedCells';
import { useTableColSizes } from './useTableColSizes';
import { useTableRowSizes } from './useTableRowSizes';

export interface TableElementState {
  colSizes: number[];
  containerRef: React.RefObject<HTMLDivElement>;
  element: TTableElement;
  isSelectingCell: boolean;
  marginLeft: number;
  minColumnWidth: number;
}

export const useTableElementState = ({
  transformColSizes,
}: {
  /** Transform node column sizes */
  transformColSizes?: (colSizes: number[]) => number[];
} = {}): TableElementState => {
  const editor = useEditorRef();

  const { disableMarginLeft, enableMerging, minColumnWidth } =
    editor.getOptions(TablePlugin);

  const element = useElement<TTableElement>(TablePlugin.key);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const selectedCells = useTableStore().get.selectedCells();
  const marginLeftOverride = useTableStore().get.marginLeftOverride();

  const [isMounted, setIsMounted] = React.useState(false);

  const marginLeft = disableMarginLeft
    ? 0
    : (marginLeftOverride ?? element.marginLeft ?? 0);

  let colSizes = useTableColSizes(element);
  const rowSizes = useTableRowSizes(element);

  React.useEffect(() => {
    if (enableMerging) {
      computeCellIndices(editor, element);
    }
  }, [editor, element, enableMerging]);

  if (transformColSizes) {
    colSizes = transformColSizes(colSizes);
  }
  // add a last col to fill the remaining space
  if (!colSizes.includes(0)) {
    colSizes.push('100%' as any);
  }

  // apply row sizes
  React.useEffect(() => {
    if (!isMounted || !containerRef.current) return;

    const trs = containerRef.current.querySelectorAll('tr');
    trs.forEach((tr, index) => {
      tr.style.height = rowSizes[index] === 0 ? 'auto' : `${rowSizes[index]}px`;
    });
  }, [rowSizes, isMounted]);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  return {
    colSizes,
    containerRef,
    element,
    isSelectingCell: !!selectedCells,
    marginLeft,
    minColumnWidth: minColumnWidth!,
  };
};

export const useTableElement = () => {
  const editor = useEditorRef();
  const selectedCells = useTableStore().get.selectedCells();

  useSelectedCells();

  return {
    colGroupProps: {
      contentEditable: false,
      style: { width: '100%' },
    },
    props: {
      onMouseDown: () => {
        // until cell dnd is supported, we collapse the selection on mouse down
        if (selectedCells) {
          collapseSelection(editor);
        }
      },
    },
  };
};
