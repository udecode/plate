import React, { SVGProps } from 'react';
import { DropdownMenu } from '@udecode/plate-floating';
import {
  BorderBottomIcon,
  BorderLeftIcon,
  BorderNoneIcon,
  BorderOuterIcon,
  BorderRightIcon,
  BorderTopIcon,
  useTableBordersDropdownMenuContentState,
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
  const {
    getOnSelectTableBorder,
    hasOuterBorders,
    hasBottomBorder,
    hasLeftBorder,
    hasNoBorders,
    hasRightBorder,
    hasTopBorder,
  } = useTableBordersDropdownMenuContentState();

  return (
    <DropdownMenu.Content
      css={[floatingRootCss, tw`min-w-[220px] py-1.5 text-neutral-900`]}
      side="right"
      align="start"
      sideOffset={8}
    >
      <div tw="px-1">
        <DropdownMenu.Item onSelect={getOnSelectTableBorder('bottom')}>
          <PlateButton css={cssMenuItemButton}>
            <Check checked={hasBottomBorder} />
            <BorderBottomIcon />
            <div>Bottom Border</div>
          </PlateButton>
        </DropdownMenu.Item>
        <DropdownMenu.Item onSelect={getOnSelectTableBorder('top')}>
          <PlateButton css={cssMenuItemButton}>
            <Check checked={hasTopBorder} />
            <BorderTopIcon />
            <div>Top Border</div>
          </PlateButton>
        </DropdownMenu.Item>
        <DropdownMenu.Item onSelect={getOnSelectTableBorder('left')}>
          <PlateButton css={cssMenuItemButton}>
            <Check checked={hasLeftBorder} />
            <BorderLeftIcon />
            <div>Left Border</div>
          </PlateButton>
        </DropdownMenu.Item>
        <DropdownMenu.Item onSelect={getOnSelectTableBorder('right')}>
          <PlateButton css={cssMenuItemButton}>
            <Check checked={hasRightBorder} />
            <BorderRightIcon />
            <div>Right Border</div>
          </PlateButton>
        </DropdownMenu.Item>
      </div>

      <div tw="w-full h-px bg-gray-200 my-1.5" />

      <div tw="px-1">
        <DropdownMenu.Item onSelect={getOnSelectTableBorder('none')}>
          <PlateButton css={cssMenuItemButton}>
            <Check checked={hasNoBorders} />
            <BorderNoneIcon />
            <div>No Border</div>
          </PlateButton>
        </DropdownMenu.Item>
        <DropdownMenu.Item onSelect={getOnSelectTableBorder('outer')}>
          <PlateButton css={cssMenuItemButton}>
            <Check checked={hasOuterBorders} />
            <BorderOuterIcon />
            <div>Outside Borders</div>
          </PlateButton>
        </DropdownMenu.Item>
      </div>
    </DropdownMenu.Content>
  );
};
