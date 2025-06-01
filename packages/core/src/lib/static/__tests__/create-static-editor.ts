import { KEYS, type Value } from '@udecode/plate';

import { withProps } from '@udecode/cn';
import { BaseTextAlignPlugin } from '@udecode/plate-basic-styles';
import {
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseStrikethroughPlugin,
} from '@udecode/plate-basic-nodes';
import { BaseItalicPlugin } from '@udecode/plate-basic-nodes';
import {
  BaseSubscriptPlugin,
  BaseSuperscriptPlugin,
  BaseUnderlinePlugin,
} from '@udecode/plate-basic-nodes';
import { BaseCodeBlockPlugin } from '@udecode/plate-code-block';
import { BaseCommentPlugin } from '@udecode/plate-comments';
import { BaseDatePlugin } from '@udecode/plate-date';
import {
  BaseFontBackgroundColorPlugin,
  BaseFontColorPlugin,
  BaseFontSizePlugin,
} from '@udecode/plate-basic-styles';
import { BaseTocPlugin } from '@udecode/plate-toc';
import { BaseHighlightPlugin } from '@udecode/plate-basic-nodes';
import {
  BaseHorizontalRulePlugin,
  BaseHeadingPlugin,
  BaseBlockquotePlugin,
} from '@udecode/plate-basic-nodes';
import { BaseIndentPlugin } from '@udecode/plate-indent';
import { BaseListPlugin } from '@udecode/plate-list';
import { BaseKbdPlugin } from '@udecode/plate-basic-nodes';
import { BaseColumnItemPlugin, BaseColumnPlugin } from '@udecode/plate-layout';
import { BaseLineHeightPlugin } from '@udecode/plate-basic-styles';
import { BaseLinkPlugin } from '@udecode/plate-link';
import {
  BaseEquationPlugin,
  BaseInlineEquationPlugin,
} from '@udecode/plate-math';
import {
  BaseAudioPlugin,
  BaseFilePlugin,
  BaseImagePlugin,
  BaseMediaEmbedPlugin,
  BaseVideoPlugin,
} from '@udecode/plate-media';
import { BaseMentionPlugin } from '@udecode/plate-mention';
import {
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '@udecode/plate-table';
import { BaseTogglePlugin } from '@udecode/plate-toggle';
import { BlockquoteElementStatic } from 'www/src/registry/ui/blockquote-node-static';
import {
  CodeBlockElementStatic,
  CodeLineElementStatic,
  CodeSyntaxLeafStatic,
} from 'www/src/registry/ui/code-block-node-static';
import { CodeLeafStatic } from 'www/src/registry/ui/code-node-static';
import {
  ColumnElementStatic,
  ColumnGroupElementStatic,
} from 'www/src/registry/ui/column-node-static';
import { CommentLeafStatic } from 'www/src/registry/ui/comment-node-static';
import { DateElementStatic } from 'www/src/registry/ui/date-node-static';
import {
  EquationElementStatic,
  InlineEquationElementStatic,
} from 'www/src/registry/ui/equation-node-static';
import {
  H1ElementStatic,
  H2ElementStatic,
  H3ElementStatic,
} from 'www/src/registry/ui/heading-node-static';
import { HrElementStatic } from 'www/src/registry/ui/hr-node-static';
import { ImageElementStatic } from 'www/src/registry/ui/media-image-node-static';
import { KbdLeafStatic } from 'www/src/registry/ui/kbd-node-static';
import { LinkElementStatic } from 'www/src/registry/ui/link-node-static';
import { AudioElementStatic } from 'www/src/registry/ui/media-audio-node-static';
import { FileElementStatic } from 'www/src/registry/ui/media-file-node-static';
import { VideoElementStatic } from 'www/src/registry/ui/media-video-node-static';
import { MentionElementStatic } from 'www/src/registry/ui/mention-node-static';
import { ParagraphElementStatic } from 'www/src/registry/ui/paragraph-node-static';
import {
  TableElementStatic,
  TableRowElementStatic,
  TableCellElementStatic,
  TableCellHeaderElementStatic,
} from 'www/src/registry/ui/table-node-static';
import { TocElementStatic } from 'www/src/registry/ui/toc-node-static';
import { ToggleElementStatic } from 'www/src/registry/ui/toggle-node-static';
import { BaseEditorKit } from 'www/src/registry/components/editor/editor-base-kit';

import { BaseParagraphPlugin, SlateLeaf } from '../..';
import { createSlateEditor, CreateSlateEditorOptions } from '../../editor';

export const createStaticEditor = (
  value: Value,
  options?: Partial<CreateSlateEditorOptions>
) => {
  return createSlateEditor({
    ...options,
    plugins: BaseEditorKit,
    value,
  });
};
