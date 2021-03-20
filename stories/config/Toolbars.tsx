import 'tippy.js/animations/scale.css';
import 'tippy.js/dist/tippy.css';
import React from 'react';
import { CodeAlt } from '@styled-icons/boxicons-regular/CodeAlt';
import { CodeBlock } from '@styled-icons/boxicons-regular/CodeBlock';
import { Subscript, Superscript } from '@styled-icons/foundation';
import {
  BorderAll,
  BorderBottom,
  BorderClear,
  BorderLeft,
  BorderRight,
  BorderTop,
  FormatAlignCenter,
  FormatAlignJustify,
  FormatAlignLeft,
  FormatAlignRight,
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  FormatStrikethrough,
  FormatUnderlined,
  Keyboard,
  Looks3,
  Looks4,
  Looks5,
  Looks6,
  LooksOne,
  LooksTwo,
} from '@styled-icons/material';
import { TippyProps } from '@tippyjs/react';
import {
  addColumn,
  addRow,
  deleteColumn,
  deleteRow,
  deleteTable,
  ELEMENT_ALIGN_CENTER,
  ELEMENT_ALIGN_JUSTIFY,
  ELEMENT_ALIGN_RIGHT,
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
  insertTable,
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_KBD,
  MARK_STRIKETHROUGH,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
  MARK_UNDERLINE,
  useEditorPluginType,
} from '@udecode/slate-plugins';
import {
  BalloonToolbar,
  ToolbarAlign,
  ToolbarCodeBlock,
  ToolbarElement,
  ToolbarList,
  ToolbarMark,
  ToolbarTable,
} from '@udecode/slate-plugins-components';

export const ToolbarButtonsBasicElements = () => (
  <>
    <ToolbarElement
      type={useEditorPluginType(ELEMENT_H1)}
      icon={<LooksOne />}
    />
    <ToolbarElement
      type={useEditorPluginType(ELEMENT_H2)}
      icon={<LooksTwo />}
    />
    <ToolbarElement type={useEditorPluginType(ELEMENT_H3)} icon={<Looks3 />} />
    <ToolbarElement type={useEditorPluginType(ELEMENT_H4)} icon={<Looks4 />} />
    <ToolbarElement type={useEditorPluginType(ELEMENT_H5)} icon={<Looks5 />} />
    <ToolbarElement type={useEditorPluginType(ELEMENT_H6)} icon={<Looks6 />} />
    <ToolbarElement
      type={useEditorPluginType(ELEMENT_BLOCKQUOTE)}
      icon={<FormatQuote />}
    />
    <ToolbarCodeBlock
      type={useEditorPluginType(ELEMENT_CODE_BLOCK)}
      icon={<CodeBlock />}
    />
  </>
);

export const ToolbarButtonsList = () => (
  <>
    <ToolbarList
      type={useEditorPluginType(ELEMENT_UL)}
      icon={<FormatListBulleted />}
    />
    <ToolbarList
      type={useEditorPluginType(ELEMENT_OL)}
      icon={<FormatListNumbered />}
    />
  </>
);

export const ToolbarButtonsAlign = () => (
  <>
    <ToolbarAlign icon={<FormatAlignLeft />} />
    <ToolbarAlign
      type={useEditorPluginType(ELEMENT_ALIGN_CENTER)}
      icon={<FormatAlignCenter />}
    />
    <ToolbarAlign
      type={useEditorPluginType(ELEMENT_ALIGN_RIGHT)}
      icon={<FormatAlignRight />}
    />
    <ToolbarAlign
      type={useEditorPluginType(ELEMENT_ALIGN_JUSTIFY)}
      icon={<FormatAlignJustify />}
    />
  </>
);

export const ToolbarButtonsBasicMarks = () => {
  return (
    <>
      <ToolbarMark
        type={useEditorPluginType(MARK_BOLD)}
        icon={<FormatBold />}
      />
      <ToolbarMark
        type={useEditorPluginType(MARK_ITALIC)}
        icon={<FormatItalic />}
      />
      <ToolbarMark
        type={useEditorPluginType(MARK_UNDERLINE)}
        icon={<FormatUnderlined />}
      />
      <ToolbarMark
        type={useEditorPluginType(MARK_STRIKETHROUGH)}
        icon={<FormatStrikethrough />}
      />
      <ToolbarMark type={useEditorPluginType(MARK_CODE)} icon={<CodeAlt />} />
      <ToolbarMark type={useEditorPluginType(MARK_KBD)} icon={<Keyboard />} />
      <ToolbarMark
        type={useEditorPluginType(MARK_SUPERSCRIPT)}
        clear={useEditorPluginType(MARK_SUBSCRIPT)}
        icon={<Superscript />}
      />
      <ToolbarMark
        type={useEditorPluginType(MARK_SUBSCRIPT)}
        clear={useEditorPluginType(MARK_SUPERSCRIPT)}
        icon={<Subscript />}
      />
    </>
  );
};

export const ToolbarButtonsTable = () => (
  <>
    <ToolbarMark type={useEditorPluginType(MARK_BOLD)} icon={<FormatBold />} />
    <ToolbarTable icon={<BorderAll />} transform={insertTable} />
    <ToolbarTable icon={<BorderClear />} transform={deleteTable} />
    <ToolbarTable icon={<BorderBottom />} transform={addRow} />
    <ToolbarTable icon={<BorderTop />} transform={deleteRow} />
    <ToolbarTable icon={<BorderLeft />} transform={addColumn} />
    <ToolbarTable icon={<BorderRight />} transform={deleteColumn} />
  </>
);

export const BallonToolbarMarks = () => {
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
        type={useEditorPluginType(MARK_BOLD)}
        icon={<FormatBold />}
        tooltip={{ content: 'Bold (⌘B)', ...tooltip }}
      />
      <ToolbarMark
        type={useEditorPluginType(MARK_ITALIC)}
        icon={<FormatItalic />}
        tooltip={{ content: 'Italic (⌘I)', ...tooltip }}
      />
      <ToolbarMark
        type={useEditorPluginType(MARK_UNDERLINE)}
        icon={<FormatUnderlined />}
        tooltip={{ content: 'Underline (⌘U)', ...tooltip }}
      />
    </BalloonToolbar>
  );
};
