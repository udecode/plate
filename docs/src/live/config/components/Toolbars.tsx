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
import { FormatIndentDecrease } from '@styled-icons/material/FormatIndentDecrease';
import { FormatIndentIncrease } from '@styled-icons/material/FormatIndentIncrease';
import { FormatItalic } from '@styled-icons/material/FormatItalic';
import { FormatListBulleted } from '@styled-icons/material/FormatListBulleted';
import { FormatListNumbered } from '@styled-icons/material/FormatListNumbered';
import { FormatQuote } from '@styled-icons/material/FormatQuote';
import { FormatStrikethrough } from '@styled-icons/material/FormatStrikethrough';
import { FormatUnderlined } from '@styled-icons/material/FormatUnderlined';
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
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  ELEMENT_OL,
  ELEMENT_UL,
  getPlatePluginType,
  getPreventDefaultHandler,
  indent,
  insertTable,
  MARK_BOLD,
  MARK_CODE,
  MARK_HIGHLIGHT,
  MARK_ITALIC,
  MARK_KBD,
  MARK_STRIKETHROUGH,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
  MARK_UNDERLINE,
  outdent,
  ToolbarAlign,
  ToolbarButton,
  ToolbarCodeBlock,
  ToolbarElement,
  ToolbarList,
  ToolbarMark,
  ToolbarTable,
  useEventEditorId,
  useStoreEditorRef,
} from '@udecode/plate';

export const ToolbarButtonsBasicElements = () => {
  const editor = useStoreEditorRef(useEventEditorId('focus'));

  return (
    <>
      <ToolbarElement
        type={getPlatePluginType(editor, ELEMENT_H1)}
        icon={<LooksOne />}
      />
      <ToolbarElement
        type={getPlatePluginType(editor, ELEMENT_H2)}
        icon={<LooksTwo />}
      />
      <ToolbarElement
        type={getPlatePluginType(editor, ELEMENT_H3)}
        icon={<Looks3 />}
      />
      <ToolbarElement
        type={getPlatePluginType(editor, ELEMENT_H4)}
        icon={<Looks4 />}
      />
      <ToolbarElement
        type={getPlatePluginType(editor, ELEMENT_H5)}
        icon={<Looks5 />}
      />
      <ToolbarElement
        type={getPlatePluginType(editor, ELEMENT_H6)}
        icon={<Looks6 />}
      />
      <ToolbarElement
        type={getPlatePluginType(editor, ELEMENT_BLOCKQUOTE)}
        icon={<FormatQuote />}
      />
      <ToolbarCodeBlock
        type={getPlatePluginType(editor, ELEMENT_CODE_BLOCK)}
        icon={<CodeBlock />}
      />
    </>
  );
};

export const ToolbarButtonsIndent = () => {
  const editor = useStoreEditorRef(useEventEditorId('focus'));

  return (
    <>
      <ToolbarButton
        onMouseDown={editor && getPreventDefaultHandler(outdent, editor)}
        icon={<FormatIndentDecrease />}
      />
      <ToolbarButton
        onMouseDown={editor && getPreventDefaultHandler(indent, editor)}
        icon={<FormatIndentIncrease />}
      />
    </>
  );
};

export const ToolbarButtonsList = () => {
  const editor = useStoreEditorRef(useEventEditorId('focus'));

  return (
    <>
      <ToolbarList
        type={getPlatePluginType(editor, ELEMENT_UL)}
        icon={<FormatListBulleted />}
      />
      <ToolbarList
        type={getPlatePluginType(editor, ELEMENT_OL)}
        icon={<FormatListNumbered />}
      />
    </>
  );
};

export const ToolbarButtonsAlign = () => {
  return (
    <>
      <ToolbarAlign align="left" icon={<FormatAlignLeft />} />
      <ToolbarAlign align="center" icon={<FormatAlignCenter />} />
      <ToolbarAlign align="right" icon={<FormatAlignRight />} />
      <ToolbarAlign align="justify" icon={<FormatAlignJustify />} />
    </>
  );
};

export const ToolbarButtonsBasicMarks = () => {
  const editor = useStoreEditorRef(useEventEditorId('focus'));

  return (
    <>
      <ToolbarMark
        type={getPlatePluginType(editor, MARK_BOLD)}
        icon={<FormatBold />}
      />
      <ToolbarMark
        type={getPlatePluginType(editor, MARK_ITALIC)}
        icon={<FormatItalic />}
      />
      <ToolbarMark
        type={getPlatePluginType(editor, MARK_UNDERLINE)}
        icon={<FormatUnderlined />}
      />
      <ToolbarMark
        type={getPlatePluginType(editor, MARK_STRIKETHROUGH)}
        icon={<FormatStrikethrough />}
      />
      <ToolbarMark
        type={getPlatePluginType(editor, MARK_CODE)}
        icon={<CodeAlt />}
      />
      <ToolbarMark
        type={getPlatePluginType(editor, MARK_SUPERSCRIPT)}
        clear={getPlatePluginType(editor, MARK_SUBSCRIPT)}
        icon={<Superscript />}
      />
      <ToolbarMark
        type={getPlatePluginType(editor, MARK_SUBSCRIPT)}
        clear={getPlatePluginType(editor, MARK_SUPERSCRIPT)}
        icon={<Subscript />}
      />
    </>
  );
};

export const ToolbarKbd = () => {
  const editor = useStoreEditorRef(useEventEditorId('focus'));

  return (
    <ToolbarMark
      type={getPlatePluginType(editor, MARK_KBD)}
      icon={<Keyboard />}
    />
  );
};

export const ToolbarHighlight = () => {
  const editor = useStoreEditorRef(useEventEditorId('focus'));

  return (
    <ToolbarMark
      type={getPlatePluginType(editor, MARK_HIGHLIGHT)}
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
      popperOptions={{
        placement: 'top',
      }}
      theme={theme}
      arrow={arrow}
    >
      <ToolbarMark
        type={getPlatePluginType(editor, MARK_BOLD)}
        icon={<FormatBold />}
        tooltip={{ content: 'Bold (⌘B)', ...tooltip }}
      />
      <ToolbarMark
        type={getPlatePluginType(editor, MARK_ITALIC)}
        icon={<FormatItalic />}
        tooltip={{ content: 'Italic (⌘I)', ...tooltip }}
      />
      <ToolbarMark
        type={getPlatePluginType(editor, MARK_UNDERLINE)}
        icon={<FormatUnderlined />}
        tooltip={{ content: 'Underline (⌘U)', ...tooltip }}
      />
    </BalloonToolbar>
  );
};
