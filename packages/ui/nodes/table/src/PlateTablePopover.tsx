import React from 'react';
import { someNode, useElement, usePlateEditorRef } from '@udecode/plate-common';
import {
  DropdownMenu,
  ElementPopover,
  PopoverProps,
} from '@udecode/plate-floating';
import {
  BorderAllIcon,
  BorderBottomIcon,
  getCellTypes,
  TTableElement,
  useTableStore,
} from '@udecode/plate-table';
import {
  cssMenuItemButton,
  PlateButton,
  RemoveNodeButton,
} from '@udecode/plate-ui-button';
import { floatingRootCss } from '@udecode/plate-ui-toolbar';
import { Editor } from 'slate';
import tw from 'twin.macro';

export const PlateTablePopover = ({ children, ...props }: PopoverProps) => {
  const editor = usePlateEditorRef();
  const element = useElement<TTableElement>();

  const selectedCells = useTableStore().get.selectedCells();

  const onClickBottomBorder = () => {
    if (selectedCells) return;

    const inCell = someNode(editor, {
      match: { type: getCellTypes(editor) },
    });
    if (!inCell) return;

    let { borders } = element;

    if (!borders) {
      const xRow new Array(table).fill({})
      
      borders = {
        x: ;,
        y: [],
      };
    }

    const hideBorder = (editor, cellPath, border, newBorderStyle) => {
      const [rowIndex, cellIndex] = Path.relative(
        cellPath,
        Editor.path(editor, cellPath, { edge: 'start' })
      );

      if (border === 'top' && rowIndex > 0) {
        // Update the bottom border of the cell above
        const siblingCellPath = Path.previous(cellPath);
        Editor.setNodes(
          editor,
          { borderStyles: { bottom: newBorderStyle } },
          { at: siblingCellPath, match: (n) => n.type === 'cell' }
        );
      } else if (border === 'bottom') {
        // Update the bottom border of the current cell
        Editor.setNodes(
          editor,
          { borderStyles: { bottom: newBorderStyle } },
          { at: cellPath, match: (n) => n.type === 'cell' }
        );
      }

      if (border === 'left' && cellIndex > 0) {
        // Update the right border of the cell to the left
        const siblingCellPath = Path.previous(cellPath, { depth: 1 });
        Editor.setNodes(
          editor,
          { borderStyles: { right: newBorderStyle } },
          { at: siblingCellPath, match: (n) => n.type === 'cell' }
        );
      } else if (border === 'right') {
        // Update the right border of the current cell
        Editor.setNodes(
          editor,
          { borderStyles: { right: newBorderStyle } },
          { at: cellPath, match: (n) => n.type === 'cell' }
        );
      }
    };

    console.log(inCell);
  };

  return (
    <ElementPopover
      content={
        <div css={tw`min-w-[140px] py-1.5`}>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <PlateButton
                type="button"
                tw="justify-start w-full"
                aria-label="Borders"
              >
                <BorderAllIcon />
                <div>Borders</div>
              </PlateButton>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                css={[
                  floatingRootCss,
                  tw`min-w-[220px] px-1 py-1.5 z-20 text-neutral-900`,
                ]}
                side="right"
                align="start"
                sideOffset={8}
              >
                <div>
                  <PlateButton
                    css={cssMenuItemButton}
                    onClick={onClickBottomBorder}
                  >
                    <BorderBottomIcon />
                    <div>Bottom Border</div>
                  </PlateButton>
                </div>
                <div>
                  <PlateButton css={cssMenuItemButton}>Top Border</PlateButton>
                </div>
                <div>
                  <PlateButton css={cssMenuItemButton}>Left Border</PlateButton>
                </div>
                <div>
                  <PlateButton css={cssMenuItemButton}>
                    Right Border
                  </PlateButton>
                </div>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <div>
            <RemoveNodeButton
              element={element}
              css={[cssMenuItemButton, tw`justify-start w-40`]}
              contentEditable={false}
            >
              <div>Delete</div>
            </RemoveNodeButton>
          </div>
        </div>
      }
      css={floatingRootCss}
      {...props}
    >
      {children}
    </ElementPopover>
  );
};
