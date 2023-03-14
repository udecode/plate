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
                tw="min-w-[220px] bg-white rounded-md p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] fill-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade"
                sideOffset={5}
              >
                <DropdownMenu.Item tw="group text-[13px] leading-none text-blue-500 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1">
                  New Tab{' '}
                  <div tw="ml-auto pl-[20px] text-mauve11 group-data-[highlighted]:text-white group-data-[disabled]:text-mauve8">
                    ⌘+T
                  </div>
                </DropdownMenu.Item>
                <DropdownMenu.Item tw="group text-[13px] leading-none text-blue-500 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1">
                  New Window{' '}
                  <div tw="ml-auto pl-[20px] text-mauve11 group-data-[highlighted]:text-white group-data-[disabled]:text-mauve8">
                    ⌘+N
                  </div>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  tw="group text-[13px] leading-none text-blue-500 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1"
                  disabled
                >
                  New Private Window{' '}
                  <div tw="ml-auto pl-[20px] text-mauve11 group-data-[highlighted]:text-white group-data-[disabled]:text-mauve8">
                    ⇧+⌘+N
                  </div>
                </DropdownMenu.Item>
                <DropdownMenu.Sub>
                  <DropdownMenu.SubTrigger tw="group text-[13px] leading-none text-blue-500 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[state=open]:bg-violet4 data-[state=open]:text-blue-500 data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1 data-[highlighted]:data-[state=open]:bg-violet9 data-[highlighted]:data-[state=open]:text-violet1">
                    More Tools
                    <div tw="ml-auto pl-[20px] text-mauve11 group-data-[highlighted]:text-white group-data-[disabled]:text-mauve8">
                      c
                    </div>
                  </DropdownMenu.SubTrigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.SubContent
                      tw="min-w-[220px] bg-white rounded-md p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade"
                      sideOffset={2}
                      alignOffset={-5}
                    >
                      <DropdownMenu.Item tw="group text-[13px] leading-none text-blue-500 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1">
                        Save Page As…{' '}
                        <div tw="ml-auto pl-[20px] text-mauve11 group-data-[highlighted]:text-white group-data-[disabled]:text-mauve8">
                          ⌘+S
                        </div>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item tw="text-[13px] leading-none text-blue-500 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1">
                        Create Shortcut…
                      </DropdownMenu.Item>
                      <DropdownMenu.Item tw="text-[13px] leading-none text-blue-500 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1">
                        Name Window…
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator tw="h-[1px] bg-violet6 m-[5px]" />
                      <DropdownMenu.Item tw="text-[13px] leading-none text-blue-500 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1">
                        Developer Tools
                      </DropdownMenu.Item>
                    </DropdownMenu.SubContent>
                  </DropdownMenu.Portal>
                </DropdownMenu.Sub>

                <DropdownMenu.Separator tw="h-[1px] bg-violet6 m-[5px]" />

                <DropdownMenu.CheckboxItem
                  tw="group text-[13px] leading-none text-blue-500 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1"
                  checked={bookmarksChecked}
                  onCheckedChange={setBookmarksChecked}
                >
                  <DropdownMenu.ItemIndicator tw="absolute left-0 w-[25px] inline-flex items-center justify-center">
                    v
                  </DropdownMenu.ItemIndicator>
                  Show Bookmarks{' '}
                  <div tw="ml-auto pl-[20px] text-mauve11 group-data-[highlighted]:text-white group-data-[disabled]:text-mauve8">
                    ⌘+B
                  </div>
                </DropdownMenu.CheckboxItem>
                <DropdownMenu.CheckboxItem
                  tw="text-[13px] leading-none text-blue-500 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1"
                  checked={urlsChecked}
                  onCheckedChange={setUrlsChecked}
                >
                  <DropdownMenu.ItemIndicator tw="absolute left-0 w-[25px] inline-flex items-center justify-center">
                    v
                  </DropdownMenu.ItemIndicator>
                  Show Full URLs
                </DropdownMenu.CheckboxItem>

                <DropdownMenu.Separator tw="h-[1px] bg-violet6 m-[5px]" />

                <DropdownMenu.Label tw="pl-[25px] text-xs leading-[25px] text-mauve11">
                  People
                </DropdownMenu.Label>
                <DropdownMenu.RadioGroup
                  value={person}
                  onValueChange={setPerson}
                >
                  <DropdownMenu.RadioItem
                    tw="text-[13px] leading-none text-blue-500 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1"
                    value="pedro"
                  >
                    <DropdownMenu.ItemIndicator tw="absolute left-0 w-[25px] inline-flex items-center justify-center">
                      .
                    </DropdownMenu.ItemIndicator>
                    Pedro Duarte
                  </DropdownMenu.RadioItem>
                  <DropdownMenu.RadioItem
                    tw="text-[13px] leading-none text-blue-500 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1"
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
