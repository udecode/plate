import React from 'react';
import { useElement } from '@udecode/plate-common';
import {
  DropdownMenu,
  ElementPopover,
  PopoverProps,
} from '@udecode/plate-floating';
import { PlateButton, RemoveNodeButton } from '@udecode/plate-ui-button';
import { floatingButtonCss, floatingRootCss } from '@udecode/plate-ui-toolbar';
import tw from 'twin.macro';

export const PlateTablePopover = ({ children, ...props }: PopoverProps) => {
  const element = useElement();

  const [bookmarksChecked, setBookmarksChecked] = React.useState(true);
  const [urlsChecked, setUrlsChecked] = React.useState(false);
  const [person, setPerson] = React.useState('pedro');

  return (
    <ElementPopover
      content={
        <div css={tw`min-w-[140px]`}>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                tw="rounded-full w-[35px] h-[35px] inline-flex items-center justify-center text-blue-500 bg-white shadow-[0_2px_10px] shadow-sm outline-none hover:bg-blue-300 focus:shadow-[0_0_0_2px] focus:shadow-sm"
                aria-label="Customise options"
              >
                -
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                tw="min-w-[220px] bg-white rounded-md p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] fill-[opacity,transform]"
                sideOffset={5}
              >
                <DropdownMenu.Item
                  className="group"
                  tw="text-[13px] leading-none text-blue-500 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none [data-highlighted]:bg-blue-900 [data-highlighted]:text-blue-100"
                >
                  New Tab{' '}
                  <div
                    className="group"
                    tw="ml-auto pl-[20px] text-blue-900 group-[data-highlighted]:text-white"
                  >
                    ⌘+T
                  </div>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="group"
                  tw="text-[13px] leading-none text-blue-500 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none [data-highlighted]:bg-blue-900 [data-highlighted]:text-blue-100"
                >
                  New Window{' '}
                  <div
                    className="group"
                    tw="ml-auto pl-[20px] text-blue-900 group-[data-highlighted]:text-white"
                  >
                    ⌘+N
                  </div>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="group"
                  tw="text-[13px] leading-none text-blue-500 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none [data-highlighted]:bg-blue-900 [data-highlighted]:text-blue-100"
                  disabled
                >
                  New Private Window{' '}
                  <div
                    className="group"
                    tw="ml-auto pl-[20px] text-blue-900 group-[data-highlighted]:text-white"
                  >
                    ⇧+⌘+N
                  </div>
                </DropdownMenu.Item>
                <DropdownMenu.Sub>
                  <DropdownMenu.SubTrigger
                    className="group"
                    tw="text-[13px] leading-none text-blue-500 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none [data-state=open]:bg-blue-400 [data-state=open]:text-blue-500 [data-highlighted]:bg-blue-900 [data-highlighted]:text-blue-100 [data-highlighted]:[data-state=open]:bg-blue-900 [data-highlighted]:[data-state=open]:text-blue-100"
                  >
                    More Tools
                    <div
                      className="group"
                      tw="ml-auto pl-[20px] text-blue-900 group-[data-highlighted]:text-white"
                    >
                      c
                    </div>
                  </DropdownMenu.SubTrigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.SubContent
                      tw="min-w-[220px] bg-white rounded-md p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform]"
                      sideOffset={2}
                      alignOffset={-5}
                    >
                      <DropdownMenu.Item
                        className="group"
                        tw="text-[13px] leading-none text-blue-500 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none [data-highlighted]:bg-blue-900 [data-highlighted]:text-blue-100"
                      >
                        Save Page As…{' '}
                        <div
                          className="group"
                          tw="ml-auto pl-[20px] text-blue-900 group-[data-highlighted]:text-white"
                        >
                          ⌘+S
                        </div>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item tw="text-[13px] leading-none text-blue-500 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none [data-highlighted]:bg-blue-900 [data-highlighted]:text-blue-100">
                        Create Shortcut…
                      </DropdownMenu.Item>
                      <DropdownMenu.Item tw="text-[13px] leading-none text-blue-500 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none [data-highlighted]:bg-blue-900 [data-highlighted]:text-blue-100">
                        Name Window…
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator tw="h-[1px] bg-blue-600 m-[5px]" />
                      <DropdownMenu.Item tw="text-[13px] leading-none text-blue-500 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none [data-highlighted]:bg-blue-900 [data-highlighted]:text-blue-100">
                        Developer Tools
                      </DropdownMenu.Item>
                    </DropdownMenu.SubContent>
                  </DropdownMenu.Portal>
                </DropdownMenu.Sub>

                <DropdownMenu.Separator tw="h-[1px] bg-blue-600 m-[5px]" />

                <DropdownMenu.CheckboxItem
                  className="group"
                  tw="text-[13px] leading-none text-blue-500 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none [data-highlighted]:bg-blue-900 [data-highlighted]:text-blue-100"
                  checked={bookmarksChecked}
                  onCheckedChange={setBookmarksChecked}
                >
                  <DropdownMenu.ItemIndicator tw="absolute left-0 w-[25px] inline-flex items-center justify-center">
                    v
                  </DropdownMenu.ItemIndicator>
                  Show Bookmarks{' '}
                  <div
                    className="group"
                    tw="ml-auto pl-[20px] text-blue-900 group-[data-highlighted]:text-white"
                  >
                    ⌘+B
                  </div>
                </DropdownMenu.CheckboxItem>
                <DropdownMenu.CheckboxItem
                  tw="text-[13px] leading-none text-blue-500 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none [data-highlighted]:bg-blue-900 [data-highlighted]:text-blue-100"
                  checked={urlsChecked}
                  onCheckedChange={setUrlsChecked}
                >
                  <DropdownMenu.ItemIndicator tw="absolute left-0 w-[25px] inline-flex items-center justify-center">
                    v
                  </DropdownMenu.ItemIndicator>
                  Show Full URLs
                </DropdownMenu.CheckboxItem>

                <DropdownMenu.Separator tw="h-[1px] bg-blue-600 m-[5px]" />

                <DropdownMenu.Label tw="pl-[25px] text-xs leading-[25px] text-blue-900">
                  People
                </DropdownMenu.Label>
                <DropdownMenu.RadioGroup
                  value={person}
                  onValueChange={setPerson}
                >
                  <DropdownMenu.RadioItem
                    tw="text-[13px] leading-none text-blue-500 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none [data-highlighted]:bg-blue-900 [data-highlighted]:text-blue-100"
                    value="pedro"
                  >
                    <DropdownMenu.ItemIndicator tw="absolute left-0 w-[25px] inline-flex items-center justify-center">
                      .
                    </DropdownMenu.ItemIndicator>
                    Pedro Duarte
                  </DropdownMenu.RadioItem>
                  <DropdownMenu.RadioItem
                    tw="text-[13px] leading-none text-blue-500 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none [data-highlighted]:bg-blue-900 [data-highlighted]:text-blue-100"
                    value="colm"
                  >
                    <DropdownMenu.ItemIndicator tw="absolute left-0 w-[25px] inline-flex items-center justify-center">
                      .
                    </DropdownMenu.ItemIndicator>
                    Colm Tuite
                  </DropdownMenu.RadioItem>
                </DropdownMenu.RadioGroup>

                <DropdownMenu.Arrow tw="fill-white" />
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
          <div>
            <RemoveNodeButton
              element={element}
              css={[floatingButtonCss, tw`w-40`]}
              contentEditable={false}
            >
              <div>Delete</div>
            </RemoveNodeButton>
          </div>
          <div>
            <PlateButton>Bottom Border</PlateButton>
          </div>
          <div>
            <PlateButton>Top Border</PlateButton>
          </div>
          <div>
            <PlateButton>Left Border</PlateButton>
          </div>
          <div>
            <PlateButton>Right Border</PlateButton>
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
