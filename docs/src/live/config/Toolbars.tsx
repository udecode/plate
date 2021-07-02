import 'tippy.js/animations/scale.css';
import 'tippy.js/dist/tippy.css';
import React from 'react';
import { CodeAlt } from '@styled-icons/boxicons-regular/CodeAlt';
import { CodeBlock } from '@styled-icons/boxicons-regular/CodeBlock';
import { Highlight } from '@styled-icons/boxicons-regular/Highlight';
import { Subscript } from '@styled-icons/foundation/Subscript';
import { Superscript } from '@styled-icons/foundation/Superscript';
import { BorderAll } from '@styled-icons/material/BorderAll';
import { BorderBottom } from '@styled-icons/material/BorderBottom';
import { BorderClear } from '@styled-icons/material/BorderClear';
import { BorderLeft } from '@styled-icons/material/BorderLeft';
import { BorderRight } from '@styled-icons/material/BorderRight';
import { BorderTop } from '@styled-icons/material/BorderTop';
import { FormatAlignCenter } from '@styled-icons/material/FormatAlignCenter';
import { FormatAlignJustify } from '@styled-icons/material/FormatAlignJustify';
import { FormatAlignLeft } from '@styled-icons/material/FormatAlignLeft';
import { FormatAlignRight } from '@styled-icons/material/FormatAlignRight';
import { FormatBold } from '@styled-icons/material/FormatBold';
import { FormatItalic } from '@styled-icons/material/FormatItalic';
import { FormatListBulleted } from '@styled-icons/material/FormatListBulleted';
import { FormatListNumbered } from '@styled-icons/material/FormatListNumbered';
import { FormatQuote } from '@styled-icons/material/FormatQuote';
import { FormatStrikethrough } from '@styled-icons/material/FormatStrikethrough';
import { FormatUnderlined } from '@styled-icons/material/FormatUnderlined';
import { AddLink } from '@styled-icons/material/AddLink';
import { ELEMENT_LINK } from '@udecode/slate-plugins-link';
import { Keyboard } from '@styled-icons/material/Keyboard';
import { Looks3 } from '@styled-icons/material/Looks3';
import { Looks4 } from '@styled-icons/material/Looks4';
import { Looks5 } from '@styled-icons/material/Looks5';
import { Looks6 } from '@styled-icons/material/Looks6';
import { LooksOne } from '@styled-icons/material/LooksOne';
import { LooksTwo } from '@styled-icons/material/LooksTwo';
import { TippyProps } from '@tippyjs/react';
import {
  addColumn,
  addRow,
  BalloonToolbar,
  deleteColumn,
  deleteRow,
  deleteTable,
  ELEMENT_ALIGN_CENTER,
  ELEMENT_ALIGN_JUSTIFY,
  ELEMENT_ALIGN_RIGHT,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  ELEMENT_OL,
  ELEMENT_UL,
  getSlatePluginType,
  insertTable,
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_KBD,
  MARK_STRIKETHROUGH,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
  MARK_UNDERLINE,
  ToolbarAlign,
  ToolbarElement,
  ToolbarList,
  ToolbarMark,
  ToolbarTable,
  useStoreEditorRef,
} from '@udecode/slate-plugins';
import { ELEMENT_CODE_BLOCK } from '@udecode/slate-plugins-code-block';
import { ToolbarCodeBlock } from '@udecode/slate-plugins-code-block-ui';
import { useEventEditorId } from '@udecode/slate-plugins-core';
import { MARK_HIGHLIGHT } from '@udecode/slate-plugins-highlight';
import { ToolbarLink } from './tbl';

export const ToolbarButtonsBasicElements = () => {
  const editor = useStoreEditorRef(useEventEditorId('focus'));

  return (
    <>
      <ToolbarElement
        type={getSlatePluginType(editor, ELEMENT_H1)}
        icon={<LooksOne />}
      />
      <ToolbarElement
        type={getSlatePluginType(editor, ELEMENT_H2)}
        icon={<LooksTwo />}
      />
      <ToolbarElement
        type={getSlatePluginType(editor, ELEMENT_H3)}
        icon={<Looks3 />}
      />
      <ToolbarElement
        type={getSlatePluginType(editor, ELEMENT_H4)}
        icon={<Looks4 />}
      />
      <ToolbarElement
        type={getSlatePluginType(editor, ELEMENT_H5)}
        icon={<Looks5 />}
      />
      <ToolbarElement
        type={getSlatePluginType(editor, ELEMENT_H6)}
        icon={<Looks6 />}
      />
      <ToolbarElement
        type={getSlatePluginType(editor, ELEMENT_BLOCKQUOTE)}
        icon={<FormatQuote />}
      />
      <ToolbarCodeBlock
        type={getSlatePluginType(editor, ELEMENT_CODE_BLOCK)}
        icon={<CodeBlock />}
      />
    </>
  );
};

export const ToolbarButtonsList = () => {
  const editor = useStoreEditorRef(useEventEditorId('focus'));

  return (
    <>
      <ToolbarList
        type={getSlatePluginType(editor, ELEMENT_UL)}
        icon={<FormatListBulleted />}
      />
      <ToolbarList
        type={getSlatePluginType(editor, ELEMENT_OL)}
        icon={<FormatListNumbered />}
      />
    </>
  );
};

export const ToolbarButtonsAlign = () => {
  const editor = useStoreEditorRef(useEventEditorId('focus'));

  return (
    <>
      <ToolbarAlign icon={<FormatAlignLeft />} />
      <ToolbarAlign
        type={getSlatePluginType(editor, ELEMENT_ALIGN_CENTER)}
        icon={<FormatAlignCenter />}
      />
      <ToolbarAlign
        type={getSlatePluginType(editor, ELEMENT_ALIGN_RIGHT)}
        icon={<FormatAlignRight />}
      />
      <ToolbarAlign
        type={getSlatePluginType(editor, ELEMENT_ALIGN_JUSTIFY)}
        icon={<FormatAlignJustify />}
      />
    </>
  );
};

export const ToolbarButtonsBasicMarks = () => {
  const editor = useStoreEditorRef(useEventEditorId('focus'));

  return (
    <>
      <ToolbarMark
        type={getSlatePluginType(editor, MARK_BOLD)}
        icon={<FormatBold />}
      />
      <ToolbarMark
        type={getSlatePluginType(editor, MARK_ITALIC)}
        icon={<FormatItalic />}
      />
      <ToolbarMark
        type={getSlatePluginType(editor, MARK_UNDERLINE)}
        icon={<FormatUnderlined />}
      />
      <ToolbarMark
        type={getSlatePluginType(editor, MARK_STRIKETHROUGH)}
        icon={<FormatStrikethrough />}
      />
      <ToolbarMark
        type={getSlatePluginType(editor, MARK_CODE)}
        icon={<CodeAlt />}
      />
      <ToolbarMark
        type={getSlatePluginType(editor, MARK_SUPERSCRIPT)}
        clear={getSlatePluginType(editor, MARK_SUBSCRIPT)}
        icon={<Superscript />}
      />
      <ToolbarMark
        type={getSlatePluginType(editor, MARK_SUBSCRIPT)}
        clear={getSlatePluginType(editor, MARK_SUPERSCRIPT)}
        icon={<Subscript />}
      />
    </>
  );
};

export const ToolbarKbd = () => {
  const editor = useStoreEditorRef(useEventEditorId('focus'));

  return (
    <ToolbarMark
      type={getSlatePluginType(editor, MARK_KBD)}
      icon={<Keyboard />}
    />
  );
};

export const ToolbarHighlight = () => {
  const editor = useStoreEditorRef(useEventEditorId('focus'));

  return (
    <ToolbarMark
      type={getSlatePluginType(editor, MARK_HIGHLIGHT)}
      icon={<Highlight />}
    />
  );
};

export const ToolbarButtonsTable = () => (
  <>
    <ToolbarTable icon={<BorderAll />} transform={insertTable} />
    <ToolbarTable icon={<BorderClear />} transform={deleteTable} />
    <ToolbarTable icon={<BorderBottom />} transform={addRow} />
    <ToolbarTable icon={<BorderTop />} transform={deleteRow} />
    <ToolbarTable icon={<BorderLeft />} transform={addColumn} />
    <ToolbarTable icon={<BorderRight />} transform={deleteColumn} />
  </>
);

export const BallonToolbarMarks = () => {
  const editor = useStoreEditorRef(useEventEditorId('focus'));

  const arrow = false;
  const theme = 'dark';
  const direction = 'top';
  const hiddenDelay = 0;
  const tooltip: TippyProps = {
    arrow: true,
    delay: 0,
    duration: [200, 0],
    hideOnClick: false,
    offset: [0, 17],
    placement: 'top',
  };

  return (
    <BalloonToolbar
      direction={direction}
      hiddenDelay={hiddenDelay}
      theme={theme}
      arrow={arrow}
    >
      <ToolbarMark
        type={getSlatePluginType(editor, MARK_BOLD)}
        icon={<FormatBold />}
        tooltip={{ content: 'Bold (⌘B)', ...tooltip }}
      />
      <ToolbarMark
        type={getSlatePluginType(editor, MARK_ITALIC)}
        icon={<FormatItalic />}
        tooltip={{ content: 'Italic (⌘I)', ...tooltip }}
      />
      <ToolbarMark
        type={getSlatePluginType(editor, MARK_UNDERLINE)}
        icon={<FormatUnderlined />}
        tooltip={{ content: 'Underline (⌘U)', ...tooltip }}
      />
      <ToolbarLink
        icon={<AddLink/>}
        tooltip={{ content: 'Link (⌘L)', ...tooltip }}
      />
    </BalloonToolbar>
  );
};
