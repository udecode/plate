import React from 'react';
import {
  Code,
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  FormatUnderlined,
  LooksOne,
  LooksTwo,
} from '@material-ui/icons';
import { BlockButton, MarkButton } from 'slate-plugins';
import { StyledToolbar } from 'slate-plugins/common/components/Toolbar';
// onDOMBeforeInput: onDOMBeforeInputFormat,
//   renderElement: renderElementFormat,
//   renderLeaf: renderLeafFormat,
//   onKeyDown: onKeyDownFormat,
export const Toolbar = () => (
  <StyledToolbar height={18}>
    <MarkButton format="bold" icon={<FormatBold />} />
    <MarkButton format="italic" icon={<FormatItalic />} />
    <MarkButton format="underline" icon={<FormatUnderlined />} />
    <MarkButton format="code" icon={<Code />} />
    <BlockButton format="heading-one" icon={<LooksOne />} />
    <BlockButton format="heading-two" icon={<LooksTwo />} />
    <BlockButton format="block-quote" icon={<FormatQuote />} />
    <BlockButton format="numbered-list" icon={<FormatListNumbered />} />
    <BlockButton format="bulleted-list" icon={<FormatListBulleted />} />
  </StyledToolbar>
);
