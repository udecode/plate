import { BaseAlignKit } from './align-static';
import { BaseBasicBlocksKit } from './basic-blocks-static';
import { BaseBasicMarksKit } from './basic-marks-static';
import { BaseCalloutKit } from './callout-static';
import { BaseCodeBlockKit } from './code-block-static';
import { BaseColumnKit } from './column-static';
import { BaseCommentKit } from './comment-static';
import { BaseDateKit } from './date-static';
import { BaseDetailsKit } from './details-static';
import { BaseFontKit } from './font-static';
import { BaseFootnoteKit } from './footnote-static';
import { BaseLineHeightKit } from './line-height-static';
import { BaseLinkKit } from './link-static';
import { BaseListKit } from './list-static';
import { MarkdownKit } from './markdown';
import { BaseMathKit } from './math-static';
import { BaseMediaKit } from './media-static';
import { BaseMentionKit } from './mention-static';
import { BaseSuggestionKit } from './suggestion-static';
import { BaseTableKit } from './table-static';
import { BaseTocKit } from './toc-static';

export const BaseEditorKit = [
  ...BaseBasicBlocksKit,
  ...BaseCodeBlockKit,
  ...BaseTableKit,
  ...BaseDetailsKit,
  ...BaseTocKit,
  ...BaseMediaKit,
  ...BaseCalloutKit,
  ...BaseColumnKit,
  ...BaseMathKit,
  ...BaseDateKit,
  ...BaseLinkKit,
  ...BaseMentionKit,
  ...BaseFootnoteKit,
  ...BaseBasicMarksKit,
  ...BaseFontKit,
  ...BaseListKit,
  ...BaseAlignKit,
  ...BaseLineHeightKit,
  ...BaseCommentKit,
  ...BaseSuggestionKit,
  ...MarkdownKit,
] as const;
