import React, { useMemo, useState } from 'react';
import { render } from '@testing-library/react';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
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
  options,
  optionsResetBlockTypes,
} from '../../../../../stories/config/initialValues';
import { autoformatRulesFixtures } from '../../../../slate-plugins/src/__fixtures__/autoformat.fixtures';
import { withInlineVoid } from '../../../../slate-plugins/src/common/plugins/inline-void/withInlineVoid';
import { withNodeID } from '../../../../slate-plugins/src/common/plugins/node-id/withNodeID';
import { SlateDocument } from '../../../../slate-plugins/src/common/types/SlateDocument.types';
import { pipe } from '../../../../slate-plugins/src/common/utils/pipe';
import { BalloonToolbar } from '../../../../slate-plugins/src/components/Toolbar/BalloonToolbar/BalloonToolbar';
import { HeadingToolbar } from '../../../../slate-plugins/src/components/Toolbar/HeadingToolbar/HeadingToolbar';
import { ToolbarElement } from '../../../../slate-plugins/src/components/ToolbarElement/ToolbarElement';
import { ToolbarMark } from '../../../../slate-plugins/src/components/ToolbarMark/ToolbarMark';
import { withDeserializeHTML } from '../../../../slate-plugins/src/deserializers/deserialize-html/withDeserializeHTML';
import { AlignPlugin } from '../../../../slate-plugins/src/elements/align/AlignPlugin';
import { ToolbarAlign } from '../../../../slate-plugins/src/elements/align/components/ToolbarAlign';
import { BasicElementPlugins } from '../../../../slate-plugins/src/elements/basic-elements/BasicElementPlugins';
import { BlockquotePlugin } from '../../../../slate-plugins/src/elements/blockquote/BlockquotePlugin';
import { CodeBlockPlugin } from '../../../../slate-plugins/src/elements/code-block/CodeBlockPlugin';
import { withCodeBlock } from '../../../../slate-plugins/src/elements/code-block/withCodeBlock';
import { HeadingPlugin } from '../../../../slate-plugins/src/elements/heading/HeadingPlugin';
import { ToolbarImage } from '../../../../slate-plugins/src/elements/image/components/ToolbarImage';
import { withImageUpload } from '../../../../slate-plugins/src/elements/image/image-upload/withImageUpload';
import { ImagePlugin } from '../../../../slate-plugins/src/elements/image/ImagePlugin';
import { ToolbarLink } from '../../../../slate-plugins/src/elements/link/components/ToolbarLink';
import { LinkPlugin } from '../../../../slate-plugins/src/elements/link/LinkPlugin';
import { withLink } from '../../../../slate-plugins/src/elements/link/withLink';
import { ToolbarList } from '../../../../slate-plugins/src/elements/list/components/ToolbarList';
import { ListPlugin } from '../../../../slate-plugins/src/elements/list/ListPlugin';
import { MediaEmbedPlugin } from '../../../../slate-plugins/src/elements/media-embed/MediaEmbedPlugin';
import { MentionPlugin } from '../../../../slate-plugins/src/elements/mention/MentionPlugin';
import { ParagraphPlugin } from '../../../../slate-plugins/src/elements/paragraph/ParagraphPlugin';
import { renderElementParagraph } from '../../../../slate-plugins/src/elements/paragraph/renderElementParagraph';
import { ToolbarTable } from '../../../../slate-plugins/src/elements/table/components/ToolbarTable/ToolbarTable';
import { TablePlugin } from '../../../../slate-plugins/src/elements/table/TablePlugin';
import { withTable } from '../../../../slate-plugins/src/elements/table/withTable';
import { TodoListPlugin } from '../../../../slate-plugins/src/elements/todo-list/TodoListPlugin';
import { withAutoformat } from '../../../../slate-plugins/src/handlers/autoformat/withAutoformat';
import { ExitBreakPlugin } from '../../../../slate-plugins/src/handlers/exit-break/ExitBreakPlugin';
import { ResetBlockTypePlugin } from '../../../../slate-plugins/src/handlers/reset-block-type/ResetBlockTypePlugin';
import { SoftBreakPlugin } from '../../../../slate-plugins/src/handlers/soft-break/SoftBreakPlugin';
import { BasicMarkPlugins } from '../../../../slate-plugins/src/marks/basic-marks/BasicMarkPlugins';
import { BoldPlugin } from '../../../../slate-plugins/src/marks/bold/BoldPlugin';
import { MARK_BOLD } from '../../../../slate-plugins/src/marks/bold/defaults';
import { renderLeafBold } from '../../../../slate-plugins/src/marks/bold/renderLeafBold';
import { CodePlugin } from '../../../../slate-plugins/src/marks/code/CodePlugin';
import { MARK_CODE } from '../../../../slate-plugins/src/marks/code/defaults';
import { renderLeafCode } from '../../../../slate-plugins/src/marks/code/renderLeafCode';
import { HighlightPlugin } from '../../../../slate-plugins/src/marks/highlight/HighlightPlugin';
import { renderLeafHighlight } from '../../../../slate-plugins/src/marks/highlight/renderLeafHighlight';
import { MARK_ITALIC } from '../../../../slate-plugins/src/marks/italic/defaults';
import { ItalicPlugin } from '../../../../slate-plugins/src/marks/italic/ItalicPlugin';
import { renderLeafItalic } from '../../../../slate-plugins/src/marks/italic/renderLeafItalic';
import { MARK_STRIKETHROUGH } from '../../../../slate-plugins/src/marks/strikethrough/defaults';
import { renderLeafStrikethrough } from '../../../../slate-plugins/src/marks/strikethrough/renderLeafStrikethrough';
import { StrikethroughPlugin } from '../../../../slate-plugins/src/marks/strikethrough/StrikethroughPlugin';
import {
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
} from '../../../../slate-plugins/src/marks/subsupscript/defaults';
import { renderLeafSubscript } from '../../../../slate-plugins/src/marks/subsupscript/subscript/renderLeafSubscript';
import { SubscriptPlugin } from '../../../../slate-plugins/src/marks/subsupscript/subscript/SubscriptPlugin';
import { renderLeafSuperscript } from '../../../../slate-plugins/src/marks/subsupscript/superscript/renderLeafSuperscript';
import { SuperscriptPlugin } from '../../../../slate-plugins/src/marks/subsupscript/superscript/SuperscriptPlugin';
import { MARK_UNDERLINE } from '../../../../slate-plugins/src/marks/underline/defaults';
import { renderLeafUnderline } from '../../../../slate-plugins/src/marks/underline/renderLeafUnderline';
import { UnderlinePlugin } from '../../../../slate-plugins/src/marks/underline/UnderlinePlugin';
import { withNormalizeTypes } from '../../../../slate-plugins/src/normalizers/withNormalizeTypes';
import { withRemoveEmptyNodes } from '../../../../slate-plugins/src/normalizers/withRemoveEmptyNodes';
import { SearchHighlightPlugin } from '../../../../slate-plugins/src/widgets/search-highlight/SearchHighlightPlugin';
import { EditablePlugins } from '../../components/EditablePlugins';

const plugins = [
  ...BasicElementPlugins(),
  ...BasicMarkPlugins(),
  BlockquotePlugin(options),
  TodoListPlugin(options),
  HeadingPlugin({ ...options, levels: 5 }),
  ImagePlugin(options),
  LinkPlugin(options),
  ListPlugin(options),
  MentionPlugin(options),
  ParagraphPlugin(options),
  TablePlugin(options),
  MediaEmbedPlugin(options),
  CodeBlockPlugin(options),
  AlignPlugin(options),
  BoldPlugin(options),
  BoldPlugin(),
  CodePlugin(options),
  CodePlugin(),
  ItalicPlugin(options),
  ItalicPlugin(),
  StrikethroughPlugin(options),
  StrikethroughPlugin(),
  HighlightPlugin({ ...options, highlight: { hotkey: '' } }),
  HighlightPlugin(),
  UnderlinePlugin(options),
  UnderlinePlugin(),
  SubscriptPlugin(options),
  SubscriptPlugin(),
  SuperscriptPlugin(options),
  SuperscriptPlugin(),
  SearchHighlightPlugin(),
  ResetBlockTypePlugin(optionsResetBlockTypes),
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
  withTable(options),
  withLink(),
  withCodeBlock(options),
  withDeserializeHTML({ plugins }),
  withImageUpload(),
  withAutoformat({ rules: autoformatRulesFixtures }),
  withNormalizeTypes({
    rules: [{ path: [0, 0], strictType: options.h1.type }],
  }),
  withNodeID(),
  withInlineVoid({ plugins }),
  withRemoveEmptyNodes({ type: options.link.type }),
] as const;

const Editor = () => {
  const decorate: any = [];
  const onKeyDown: any = [];

  const [value, setValue] = useState(initialValue);

  const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(newValue) => {
        setValue(newValue as SlateDocument);
      }}
    >
      <HeadingToolbar>
        <ToolbarElement type={options.h1.type} icon={null} />
        <ToolbarElement type={options.h2.type} icon={null} />
        <ToolbarMark type={MARK_BOLD} icon={null} />
        <ToolbarMark type={MARK_ITALIC} icon={null} />
        <ToolbarMark type={MARK_UNDERLINE} icon={null} />
        <ToolbarMark type={MARK_STRIKETHROUGH} icon={null} />
        <ToolbarMark type={MARK_CODE} icon={null} />
        <ToolbarMark
          type={MARK_SUPERSCRIPT}
          clear={MARK_SUBSCRIPT}
          icon={null}
        />
        <ToolbarMark
          type={MARK_SUBSCRIPT}
          clear={MARK_SUPERSCRIPT}
          icon={null}
        />
        <ToolbarLink {...options} icon={null} />
        <ToolbarList {...options} icon={null} />
        <ToolbarList {...options} icon={null} />
        <ToolbarElement type={options.blockquote.type} icon={null} />
        <ToolbarImage {...options} icon={null} />
        <ToolbarTable transform={jest.fn()} icon={null} />
        <ToolbarAlign icon={null} />
        <ToolbarAlign type={options.align_center.type} icon={null} />
        <ToolbarAlign type={options.align_right.type} icon={null} />
        <ToolbarAlign type={options.align_justify.type} icon={null} />
      </HeadingToolbar>
      <BalloonToolbar>
        <ToolbarMark reversed type={MARK_BOLD} icon={null} />
        <ToolbarMark reversed type={MARK_ITALIC} icon={null} />
        <ToolbarMark reversed type={MARK_UNDERLINE} icon={null} />
      </BalloonToolbar>
      <EditablePlugins
        data-testid="EditablePlugins"
        plugins={plugins}
        decorate={decorate}
        onKeyDown={onKeyDown}
        renderElement={[renderElementParagraph()]}
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
