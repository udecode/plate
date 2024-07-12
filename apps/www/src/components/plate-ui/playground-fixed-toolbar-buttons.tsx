import React from 'react';

import type { ValueId } from '@/config/customizer-plugins';

import {
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE,
} from '@udecode/plate-basic-marks';
import { useEditorReadOnly } from '@udecode/plate-common';
import { MARK_BG_COLOR, MARK_COLOR } from '@udecode/plate-font';
import { KEY_LIST_STYLE_TYPE, ListStyleType } from '@udecode/plate-indent-list';
import { ELEMENT_OL, ELEMENT_UL } from '@udecode/plate-list';
import { ELEMENT_IMAGE } from '@udecode/plate-media';

import { settingsStore } from '@/components/context/settings-store';
import { Icons, iconVariants } from '@/components/icons';
import { isEnabled } from '@/plate/demo/is-enabled';
import { AlignDropdownMenu } from '@/registry/default/plate-ui/align-dropdown-menu';
import { ColorDropdownMenu } from '@/registry/default/plate-ui/color-dropdown-menu';
import { CommentToolbarButton } from '@/registry/default/plate-ui/comment-toolbar-button';
import { EmojiDropdownMenu } from '@/registry/default/plate-ui/emoji-dropdown-menu';
import { IndentListToolbarButton } from '@/registry/default/plate-ui/indent-list-toolbar-button';
import { IndentTodoToolbarButton } from '@/registry/default/plate-ui/indent-todo-toolbar-button';
import { IndentToolbarButton } from '@/registry/default/plate-ui/indent-toolbar-button';
import { LineHeightDropdownMenu } from '@/registry/default/plate-ui/line-height-dropdown-menu';
import { LinkToolbarButton } from '@/registry/default/plate-ui/link-toolbar-button';
import { ListToolbarButton } from '@/registry/default/plate-ui/list-toolbar-button';
import { MarkToolbarButton } from '@/registry/default/plate-ui/mark-toolbar-button';
import { MediaToolbarButton } from '@/registry/default/plate-ui/media-toolbar-button';
import { OutdentToolbarButton } from '@/registry/default/plate-ui/outdent-toolbar-button';
import { TableDropdownMenu } from '@/registry/default/plate-ui/table-dropdown-menu';
import { ToggleToolbarButton } from '@/registry/default/plate-ui/toggle-toolbar-button';
import { ToolbarGroup } from '@/registry/default/plate-ui/toolbar';

import { PlaygroundInsertDropdownMenu } from './playground-insert-dropdown-menu';
import { PlaygroundModeDropdownMenu } from './playground-mode-dropdown-menu';
import { PlaygroundMoreDropdownMenu } from './playground-more-dropdown-menu';
import { PlaygroundTurnIntoDropdownMenu } from './playground-turn-into-dropdown-menu';

export function PlaygroundFixedToolbarButtons({ id }: { id?: ValueId }) {
  const readOnly = useEditorReadOnly();
  const indentList = settingsStore.use.checkedId(KEY_LIST_STYLE_TYPE);

  return (
    <div className="w-full">
      <div
        className="flex"
        style={{
          // Conceal the first separator on each line using overflow
          transform: 'translateX(calc(-1px))',
        }}
      >
        {!readOnly && (
          <>
            <ToolbarGroup noSeparator>
              <PlaygroundInsertDropdownMenu />
              {isEnabled('basicnodes', id) && (
                <PlaygroundTurnIntoDropdownMenu />
              )}
            </ToolbarGroup>

            <ToolbarGroup>
              <MarkToolbarButton nodeType={MARK_BOLD} tooltip="Bold (⌘+B)">
                <Icons.bold />
              </MarkToolbarButton>
              <MarkToolbarButton nodeType={MARK_ITALIC} tooltip="Italic (⌘+I)">
                <Icons.italic />
              </MarkToolbarButton>
              <MarkToolbarButton
                nodeType={MARK_UNDERLINE}
                tooltip="Underline (⌘+U)"
              >
                <Icons.underline />
              </MarkToolbarButton>

              {isEnabled('basicnodes', id) && (
                <>
                  <MarkToolbarButton
                    nodeType={MARK_STRIKETHROUGH}
                    tooltip="Strikethrough (⌘+⇧+M)"
                  >
                    <Icons.strikethrough />
                  </MarkToolbarButton>
                  <MarkToolbarButton nodeType={MARK_CODE} tooltip="Code (⌘+E)">
                    <Icons.code />
                  </MarkToolbarButton>
                </>
              )}

              {isEnabled('font', id) && (
                <>
                  <ColorDropdownMenu nodeType={MARK_COLOR} tooltip="Text Color">
                    <Icons.color
                      className={iconVariants({ variant: 'toolbar' })}
                    />
                  </ColorDropdownMenu>
                  <ColorDropdownMenu
                    nodeType={MARK_BG_COLOR}
                    tooltip="Highlight Color"
                  >
                    <Icons.bg
                      className={iconVariants({ variant: 'toolbar' })}
                    />
                  </ColorDropdownMenu>
                </>
              )}
            </ToolbarGroup>

            <ToolbarGroup>
              {isEnabled('align', id) && <AlignDropdownMenu />}

              {isEnabled('lineheight', id) && <LineHeightDropdownMenu />}

              {isEnabled('indentlist', id) && indentList && (
                <>
                  <IndentListToolbarButton nodeType={ListStyleType.Disc} />
                  <IndentListToolbarButton nodeType={ListStyleType.Decimal} />
                  <IndentTodoToolbarButton />
                </>
              )}

              {isEnabled('list', id) && !indentList && (
                <>
                  <ListToolbarButton nodeType={ELEMENT_UL} />
                  <ListToolbarButton nodeType={ELEMENT_OL} />
                </>
              )}

              {(isEnabled('indent', id) ||
                isEnabled('list', id) ||
                isEnabled('indentlist', id)) && (
                <>
                  <OutdentToolbarButton />
                  <IndentToolbarButton />
                </>
              )}
            </ToolbarGroup>

            <ToolbarGroup>
              {isEnabled('link', id) && <LinkToolbarButton />}

              {isEnabled('toggle', id) && <ToggleToolbarButton />}

              {isEnabled('media', id) && (
                <MediaToolbarButton nodeType={ELEMENT_IMAGE} />
              )}

              {isEnabled('table', id) && <TableDropdownMenu />}

              {isEnabled('emoji', id) && <EmojiDropdownMenu />}

              <PlaygroundMoreDropdownMenu />
            </ToolbarGroup>
          </>
        )}

        <div className="grow" />

        <ToolbarGroup noSeparator>
          {isEnabled('comment', id) && <CommentToolbarButton />}
          <PlaygroundModeDropdownMenu />
        </ToolbarGroup>
      </div>
    </div>
  );
}
