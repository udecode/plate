import React from 'react';
import { useElement } from '@udecode/plate-common';
import {
  DropdownMenu,
  ElementPopover,
  PopoverProps,
} from '@udecode/plate-floating';
import { BorderAllIcon, BorderBottomIcon } from '@udecode/plate-table';
import { PlateButton, RemoveNodeButton } from '@udecode/plate-ui-button';
import { floatingRootCss } from '@udecode/plate-ui-toolbar';
import tw from 'twin.macro';

export const PlateTablePopover = ({ children, ...props }: PopoverProps) => {
  const element = useElement();

  const [bookmarksChecked, setBookmarksChecked] = React.useState(true);
  const [urlsChecked, setUrlsChecked] = React.useState(false);

  return (
    <ElementPopover
      content={
        <div css={tw`min-w-[140px] py-1.5`}>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <PlateButton
                type="button"
                tw="mx-1 justify-start w-[calc(100%-8px)]"
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
                  tw`min-w-[220px] py-1.5 z-20 text-neutral-900`,
                ]}
                side="right"
                align="start"
                sideOffset={8}
              >
                <div>
                  <PlateButton
                    type="button"
                    tw="mx-1 justify-start w-[calc(100%-8px)]"
                  >
                    <BorderBottomIcon />
                    <div>Bottom Border</div>
                  </PlateButton>
                </div>
                <div>
                  <PlateButton
                    type="button"
                    tw="mx-1 justify-start w-[calc(100%-8px)]"
                  >
                    Top Border
                  </PlateButton>
                </div>
                <div>
                  <PlateButton
                    type="button"
                    tw="mx-1 justify-start w-[calc(100%-8px)]"
                  >
                    Left Border
                  </PlateButton>
                </div>
                <div>
                  <PlateButton
                    type="button"
                    tw="mx-1 justify-start w-[calc(100%-8px)]"
                  >
                    Right Border
                  </PlateButton>
                </div>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <div>
            <RemoveNodeButton
              element={element}
              css={[tw`mx-1 justify-start w-40`]}
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
