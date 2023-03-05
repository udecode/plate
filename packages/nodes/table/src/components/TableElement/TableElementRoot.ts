import {
  collapseSelection,
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
  PlateRenderElementProps,
  useElementProps,
  usePlateEditorRef,
  Value,
} from '@udecode/plate-core';
import { useTableStore } from '../../stores/tableStore';
import { TTableElement } from '../../types';
import { useSelectedCells } from './useSelectedCells';

export type TableElementRootProps = PlateRenderElementProps<
  Value,
  TTableElement
> &
  HTMLPropsAs<'table'>;

export const useTableElementRootProps = (
  props: TableElementRootProps
): HTMLPropsAs<'table'> => {
  const editor = usePlateEditorRef();
  const selectedCells = useTableStore().get.selectedCells();

  useSelectedCells();

  return {
    onMouseDown: () => {
      // until cell dnd is supported, we collapse the selection on mouse down
      if (selectedCells) {
        collapseSelection(editor);
      }
    },
    ...useElementProps(props),
  };
};

export const TableElementRoot = createComponentAs<TableElementRootProps>(
  (props) => {
    const htmlProps = useTableElementRootProps(props);

    return createElementAs('table', htmlProps);
  }
);
