import React, { SVGProps } from 'react';
import { useElement, usePlateEditorRef } from '@udecode/plate-common';
import {
  DropdownMenu,
  ElementPopover,
  PopoverProps,
} from '@udecode/plate-floating';
import {
  BorderAllIcon,
  BorderBottomIcon,
  setBorderSize,
  TTableElement,
  useTableStore,
} from '@udecode/plate-table';
import {
  cssMenuItemButton,
  PlateButton,
  RemoveNodeButton,
} from '@udecode/plate-ui-button';
import { floatingRootCss } from '@udecode/plate-ui-toolbar';
import tw from 'twin.macro';

const CheckIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    focusable="false"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path fill="none" d="M0 0h24v24H0z" />
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
);

export const PlateTablePopover = ({ children, ...props }: PopoverProps) => {
  const editor = usePlateEditorRef();
  const element = useElement<TTableElement>();

  const selectedCells = useTableStore().get.selectedCells();

  const getOnSelectBottomBorder = (
    border: 'bottom' | 'top' | 'left' | 'right'
  ) => () => {
    if (selectedCells) return;

    setBorderSize(editor, 0, { border });
    // setTimeout(() => {
    //   focusEditor(editor);
    // }, 50);
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
                <DropdownMenu.Item onSelect={getOnSelectBottomBorder('bottom')}>
                  <PlateButton css={cssMenuItemButton}>
                    <CheckIcon tw="block" />
                    <BorderBottomIcon />
                    <div>Bottom Border</div>
                  </PlateButton>
                </DropdownMenu.Item>
                <DropdownMenu.Item onSelect={getOnSelectBottomBorder('top')}>
                  <PlateButton css={cssMenuItemButton}>Top Border</PlateButton>
                </DropdownMenu.Item>
                <DropdownMenu.Item onSelect={getOnSelectBottomBorder('left')}>
                  <PlateButton css={cssMenuItemButton}>Left Border</PlateButton>
                </DropdownMenu.Item>
                <DropdownMenu.Item onSelect={getOnSelectBottomBorder('right')}>
                  <PlateButton css={cssMenuItemButton}>
                    Right Border
                  </PlateButton>
                </DropdownMenu.Item>
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
