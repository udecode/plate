import React from 'react';
import {
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE,
} from '@udecode/plate-basic-marks';
import { usePlateReadOnly } from '@udecode/plate-common';
import { MARK_BG_COLOR, MARK_COLOR } from '@udecode/plate-font';
import { KEY_LIST_STYLE_TYPE, ListStyleType } from '@udecode/plate-indent-list';
import { ELEMENT_OL, ELEMENT_UL } from '@udecode/plate-list';
import { ELEMENT_IMAGE } from '@udecode/plate-media';
import { ColorDropdownMenu } from './color-dropdown-menu/color-dropdown-menu';
import { EmojiDropdownMenu } from './emoji-dropdown-menu/emoji-dropdown-menu';
import { AlignDropdownMenu } from './align-dropdown-menu';
import { CommentToolbarButton } from './comment-toolbar-button';
import { IndentListToolbarButton } from './indent-list-toolbar-button';
import { IndentToolbarButton } from './indent-toolbar-button';
import { InsertDropdownMenu } from './insert-dropdown-menu';
import { LineHeightDropdownMenu } from './line-height-dropdown-menu';
import { LinkToolbarButton } from './link-toolbar-button';
import { ListToolbarButton } from './list-toolbar-button';
import { MarkToolbarButton } from './mark-toolbar-button';
import { MediaToolbarButton } from './media-toolbar-button';
import { ModeDropdownMenu } from './mode-dropdown-menu';
import { MoreDropdownMenu } from './more-dropdown-menu';
import { OutdentToolbarButton } from './outdent-toolbar-button';
import { TableDropdownMenu } from './table-dropdown-menu';
import { TurnIntoDropdownMenu } from './turn-into-dropdown-menu';

import { settingsStore } from '@/components/context/settings-store';
import { Icons, iconVariants } from '@/components/icons';
import { SettingsToggle } from '@/components/settings-toggle';
import { ToolbarSeparator } from '@/components/ui/toolbar';
import { ValueId } from '@/config/setting-values';
import { isEnabled } from '@/plate/demo/is-enabled';

export function FixedToolbarButtons({ id }: { id?: ValueId }) {
  const readOnly = usePlateReadOnly();
  const indentList = settingsStore.use.checkedId(KEY_LIST_STYLE_TYPE);

  return (
    <>
      <div className="flex gap-1">
        {!readOnly && (
          <>
            <InsertDropdownMenu />

            <TurnIntoDropdownMenu />

            <ToolbarSeparator />

            <MarkToolbarButton tooltip="Bold (⌘+B)" nodeType={MARK_BOLD}>
              <Icons.bold />
            </MarkToolbarButton>
            <MarkToolbarButton tooltip="Italic (⌘+I)" nodeType={MARK_ITALIC}>
              <Icons.italic />
            </MarkToolbarButton>
            <MarkToolbarButton
              tooltip="Underline (⌘+U)"
              nodeType={MARK_UNDERLINE}
            >
              <Icons.underline />
            </MarkToolbarButton>
            <MarkToolbarButton
              tooltip="Strikethrough (⌘+⇧+M)"
              nodeType={MARK_STRIKETHROUGH}
            >
              <Icons.strikethrough />
            </MarkToolbarButton>
            <MarkToolbarButton tooltip="Code (⌘+E)" nodeType={MARK_CODE}>
              <Icons.code />
            </MarkToolbarButton>

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
                  <Icons.bg className={iconVariants({ variant: 'toolbar' })} />
                </ColorDropdownMenu>
              </>
            )}

            <ToolbarSeparator />

            {isEnabled('align', id) && <AlignDropdownMenu />}

            {isEnabled('lineheight', id) && <LineHeightDropdownMenu />}

            {isEnabled('liststyletype', id) && indentList && (
              <>
                <IndentListToolbarButton nodeType={ListStyleType.Disc} />
                <IndentListToolbarButton nodeType={ListStyleType.Decimal} />
              </>
            )}

            {isEnabled('list', id) && !indentList && (
              <>
                <ListToolbarButton nodeType={ELEMENT_UL} />
                <ListToolbarButton nodeType={ELEMENT_OL} />
              </>
            )}

            {isEnabled('indent', id) ||
              isEnabled('list', id) ||
              (isEnabled('liststyletype', id) && (
                <>
                  <OutdentToolbarButton />
                  <IndentToolbarButton />
                </>
              ))}

            <ToolbarSeparator />

            {isEnabled('link', id) && <LinkToolbarButton />}

            {isEnabled('media', id) && (
              <MediaToolbarButton nodeType={ELEMENT_IMAGE} />
            )}

            {isEnabled('table', id) && <TableDropdownMenu />}

            {isEnabled('emoji', id) && <EmojiDropdownMenu />}

            <MoreDropdownMenu />
          </>
        )}
      </div>

      <div className="flex gap-1">
        {isEnabled('comment', id) && <CommentToolbarButton />}
        <ModeDropdownMenu />

        {!id && <SettingsToggle />}
      </div>
    </>
  );
}
