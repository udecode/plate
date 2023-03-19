import React, { SVGProps } from 'react';
import { focusEditor, usePlateEditorState } from '@udecode/plate-common';
import { DropdownMenu } from '@udecode/plate-floating';
import {
  BorderBottomIcon,
  BorderLeftIcon,
  BorderRightIcon,
  BorderTopIcon,
  isTableBorderHidden,
  setBorderSize,
  useTableStore,
} from '@udecode/plate-table';
import { cssMenuItemButton, PlateButton } from '@udecode/plate-ui-button';
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

const Check = ({ checked }: { checked?: boolean }) =>
  checked ? <CheckIcon tw="block" /> : <div tw="w-4 h-4" />;

export const PlateTableBordersDropdownMenuContent = () => {
  const editor = usePlateEditorState();
  const selectedCells = useTableStore().get.selectedCells();

  const hiddenBottomBorder = isTableBorderHidden(editor, 'bottom');
  const hiddenTopBorder = isTableBorderHidden(editor, 'top');
  const hiddenLeftBorder = isTableBorderHidden(editor, 'left');
  const hiddenRightBorder = isTableBorderHidden(editor, 'right');

  const getOnSelectBorder = (
    border: 'bottom' | 'top' | 'left' | 'right'
  ) => () => {
    if (selectedCells) return;

    const size = isTableBorderHidden(editor, border) ? 1 : 0;

    setBorderSize(editor, size, { border });

    setTimeout(() => {
      focusEditor(editor);
    }, 50);
  };

  return (
    <DropdownMenu.Content
      css={[
        floatingRootCss,
        tw`min-w-[220px] px-1 py-1.5 z-20 text-neutral-900`,
      ]}
      side="right"
      align="start"
      sideOffset={8}
    >
      <DropdownMenu.Item onSelect={getOnSelectBorder('bottom')}>
        <PlateButton css={cssMenuItemButton}>
          <Check checked={!hiddenBottomBorder} />
          <BorderBottomIcon />
          <div>Bottom Border</div>
        </PlateButton>
      </DropdownMenu.Item>
      <DropdownMenu.Item onSelect={getOnSelectBorder('top')}>
        <PlateButton css={cssMenuItemButton}>
          <Check checked={!hiddenTopBorder} />
          <BorderTopIcon />
          <div>Top Border</div>
        </PlateButton>
      </DropdownMenu.Item>
      <DropdownMenu.Item onSelect={getOnSelectBorder('left')}>
        <PlateButton css={cssMenuItemButton}>
          <Check checked={!hiddenLeftBorder} />
          <BorderLeftIcon />
          <div>Left Border</div>
        </PlateButton>
      </DropdownMenu.Item>
      <DropdownMenu.Item onSelect={getOnSelectBorder('right')}>
        <PlateButton css={cssMenuItemButton}>
          <Check checked={!hiddenRightBorder} />
          <BorderRightIcon />
          <div>Right Border</div>
        </PlateButton>
      </DropdownMenu.Item>
      <DropdownMenu.Item onSelect={getOnSelectBorder('right')}>
        <PlateButton css={cssMenuItemButton}>
          <Check checked={!hiddenRightBorder} />
          <BorderRightIcon />
          <div>Right Border</div>
        </PlateButton>
      </DropdownMenu.Item>
    </DropdownMenu.Content>
  );
};
