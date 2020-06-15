import React, { useMemo, useState } from 'react';
import {
  initialValueAutoformat,
  initialValueBasicElements,
  initialValueBasicMarks,
  initialValueEmbeds,
  initialValueExitBreak,
  initialValueForcedLayout,
  initialValueHighlight,
  initialValueImages,
  initialValueLinks,
  initialValueList,
  initialValueMentions,
  initialValuePasteHtml,
  initialValueSoftBreak,
  initialValueTables,
  nodeTypes,
} from '__fixtures__/initialValues.fixtures';
import { CodeAlt } from '@styled-icons/boxicons-regular/CodeAlt';
import { Subscript, Superscript } from '@styled-icons/foundation';
import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  FormatStrikethrough,
  FormatUnderlined,
  Image,
  Link,
  LooksOne,
  LooksTwo,
} from '@styled-icons/material';
import { render } from '@testing-library/react';
import { pipe, SlateDocument, withTransforms } from 'common';
import { withNodeID } from 'common/transforms/node-id';
import { withDeserializeHTML } from 'deserializers/deserialize-html';
import { ToolbarElement, withInlineVoid, withToggleType } from 'element';
import {
  BasicElementPlugins,
  ToolbarImage,
  ToolbarLink,
  ToolbarList,
  ToolbarTable,
  withImageUpload,
  withLink,
  withList,
  withTable,
} from 'elements';
import { ActionItemPlugin } from 'elements/action-item';
import { BlockquotePlugin } from 'elements/blockquote';
import { CodeBlockPlugin } from 'elements/code-block';
import { HeadingPlugin } from 'elements/heading';
import { ImagePlugin } from 'elements/image';
import { LinkPlugin } from 'elements/link';
import { ListPlugin } from 'elements/list';
import { MediaEmbedPlugin } from 'elements/media-embed';
import { MentionPlugin } from 'elements/mention';
import { ParagraphPlugin } from 'elements/paragraph';
import { TablePlugin } from 'elements/table';
import { withAutoformat } from 'handlers/autoformat';
import { SoftBreakPlugin } from 'handlers/soft-break';
import { ToolbarMark } from 'mark/components';
import { BasicMarkPlugins } from 'marks/basic-marks';
import { BoldPlugin, MARK_BOLD, renderLeafBold } from 'marks/bold';
import { CodePlugin, MARK_CODE, renderLeafCode } from 'marks/code';
import { HighlightPlugin, renderLeafHighlight } from 'marks/highlight';
import { ItalicPlugin, MARK_ITALIC, renderLeafItalic } from 'marks/italic';
import {
  MARK_STRIKETHROUGH,
  renderLeafStrikethrough,
  StrikethroughPlugin,
} from 'marks/strikethrough';
import {
  MARK_SUBSCRIPT,
  renderLeafSubscript,
  SubscriptPlugin,
} from 'marks/subscript';
import {
  MARK_SUPERSCRIPT,
  renderLeafSuperscript,
  SuperscriptPlugin,
} from 'marks/superscript';
import {
  MARK_UNDERLINE,
  renderLeafUnderline,
  UnderlinePlugin,
} from 'marks/underline';
import { withNormalizeTypes } from 'normalizers';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import { SearchHighlightPlugin } from 'widgets/search-highlight';
import { BalloonToolbar, EditablePlugins, HeadingToolbar } from 'components';
import { ExitBreakPlugin } from '../../../handlers/exit-break';
import { withResetBlockType } from '../../../handlers/reset-block-type';

const markOptions = { ...nodeTypes, hotkey: '' };

const plugins = [
  ...BasicElementPlugins(),
  ...BasicMarkPlugins(),
  BlockquotePlugin(nodeTypes),
  ActionItemPlugin(nodeTypes),
  HeadingPlugin(nodeTypes),
  ImagePlugin(nodeTypes),
  LinkPlugin(nodeTypes),
  ListPlugin(nodeTypes),
  MentionPlugin(nodeTypes),
  ParagraphPlugin(nodeTypes),
  TablePlugin(nodeTypes),
  MediaEmbedPlugin(nodeTypes),
  CodeBlockPlugin(nodeTypes),
  BoldPlugin(markOptions),
  BoldPlugin(),
  CodePlugin(markOptions),
  CodePlugin(),
  ItalicPlugin(markOptions),
  ItalicPlugin(),
  StrikethroughPlugin(markOptions),
  StrikethroughPlugin(),
  HighlightPlugin(markOptions),
  HighlightPlugin(),
  UnderlinePlugin(markOptions),
  UnderlinePlugin(),
  SubscriptPlugin(markOptions),
  SubscriptPlugin(),
  SuperscriptPlugin(markOptions),
  SuperscriptPlugin(),
  SearchHighlightPlugin(),
  SoftBreakPlugin(),
  ExitBreakPlugin(),
];

const initialValue = [
  ...initialValueForcedLayout,
  ...initialValueBasicMarks,
  ...initialValueHighlight,
  ...initialValueBasicElements,
  ...initialValueList,
  ...initialValueTables,
  ...initialValueLinks,
  ...initialValueMentions,
  ...initialValueImages,
  ...initialValueEmbeds,
  ...initialValueAutoformat,
  ...initialValueSoftBreak,
  ...initialValueExitBreak,
  ...initialValuePasteHtml,
];

const withPlugins = [
  withReact,
  withHistory,
  withTable(nodeTypes),
  withLink(),
  withDeserializeHTML({ plugins }),
  withImageUpload(),
  withToggleType({ defaultType: nodeTypes.typeP }),
  withResetBlockType({
    types: [nodeTypes.typeActionItem, nodeTypes.typeBlockquote],
    defaultType: nodeTypes.typeP,
  }),
  withList(nodeTypes),
  withAutoformat(nodeTypes),
  withTransforms(),
  withNormalizeTypes({
    rules: [{ path: [0, 0], strictType: nodeTypes.typeH1 }],
  }),
  withNodeID(),
  withInlineVoid({ plugins }),
] as const;

const Editor = () => {
  const decorate: any = [];
  const onKeyDown: any = [];

  const [value, setValue] = useState(initialValue);

  const editor = useMemo(() => pipe(createEditor(), ...withPlugins), [
    withPlugins,
  ]);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(newValue) => {
        setValue(newValue as SlateDocument);
      }}
    >
      <HeadingToolbar>
        <ToolbarElement type={nodeTypes.typeH1} icon={<LooksOne />} />
        <ToolbarElement type={nodeTypes.typeH2} icon={<LooksTwo />} />
        <ToolbarMark type={MARK_BOLD} icon={<FormatBold />} />
        <ToolbarMark type={MARK_ITALIC} icon={<FormatItalic />} />
        <ToolbarMark type={MARK_UNDERLINE} icon={<FormatUnderlined />} />
        <ToolbarMark type={MARK_STRIKETHROUGH} icon={<FormatStrikethrough />} />
        <ToolbarMark type={MARK_CODE} icon={<CodeAlt />} />
        <ToolbarMark
          type={MARK_SUPERSCRIPT}
          clear={MARK_SUBSCRIPT}
          icon={<Superscript />}
        />
        <ToolbarMark
          type={MARK_SUBSCRIPT}
          clear={MARK_SUPERSCRIPT}
          icon={<Subscript />}
        />
        <ToolbarLink {...nodeTypes} icon={<Link />} />
        <ToolbarList {...nodeTypes} icon={<FormatListBulleted />} />
        <ToolbarList {...nodeTypes} icon={<FormatListNumbered />} />
        <ToolbarElement
          type={nodeTypes.typeBlockquote}
          icon={<FormatQuote />}
        />
        <ToolbarImage {...nodeTypes} icon={<Image />} />
        <ToolbarTable transform={jest.fn()} icon={null} />
      </HeadingToolbar>
      <BalloonToolbar>
        <ToolbarMark reversed type={MARK_BOLD} icon={<FormatBold />} />
        <ToolbarMark reversed type={MARK_ITALIC} icon={<FormatItalic />} />
        <ToolbarMark
          reversed
          type={MARK_UNDERLINE}
          icon={<FormatUnderlined />}
        />
      </BalloonToolbar>
      <EditablePlugins
        plugins={plugins}
        decorate={decorate}
        onKeyDown={onKeyDown}
        renderLeaf={[
          renderLeafHighlight(),
          renderLeafBold(),
          renderLeafCode(),
          renderLeafItalic(),
          renderLeafStrikethrough(),
          renderLeafSubscript(),
          renderLeafSuperscript(),
          renderLeafUnderline(),
        ]}
        placeholder="Enter some plain text..."
      />
    </Slate>
  );
};

it('should render', () => {
  const { getAllByTestId } = render(<Editor />);

  expect(getAllByTestId('EditablePlugins').length).toBeGreaterThan(0);
});
