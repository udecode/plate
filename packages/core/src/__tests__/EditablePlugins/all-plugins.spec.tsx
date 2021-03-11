import React, { useMemo } from 'react';
import { render } from '@testing-library/react';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
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
} from '../../../../../stories-2/config/initialValues';
import { BalloonToolbar } from '../../../../components/src/components/Toolbar/BalloonToolbar/BalloonToolbar';
import { HeadingToolbar } from '../../../../components/src/components/Toolbar/HeadingToolbar/HeadingToolbar';
import { ToolbarAlign } from '../../../../components/src/components/ToolbarAlign/ToolbarAlign';
import { ToolbarElement } from '../../../../components/src/components/ToolbarElement/ToolbarElement';
import { ToolbarImage } from '../../../../components/src/components/ToolbarImage/ToolbarImage';
import { ToolbarLink } from '../../../../components/src/components/ToolbarLink/ToolbarLink';
import { ToolbarList } from '../../../../components/src/components/ToolbarList/ToolbarList';
import { ToolbarMark } from '../../../../components/src/components/ToolbarMark/ToolbarMark';
import { ToolbarTable } from '../../../../components/src/components/ToolbarTable/ToolbarTable';
import { autoformatRulesFixtures } from '../../../../slate-plugins/src/__fixtures__/autoformat.fixtures';
import { withDeserializeHTML } from '../../../../slate-plugins/src/deserializers/deserialize-html/withDeserializeHTML';
import { AlignPlugin } from '../../../../slate-plugins/src/elements/align/AlignPlugin';
import { BasicElementPlugins } from '../../../../slate-plugins/src/elements/basic-elements/BasicElementPlugins';
import { BlockquotePlugin } from '../../../../slate-plugins/src/elements/blockquote/BlockquotePlugin';
import { CodeBlockPlugin } from '../../../../slate-plugins/src/elements/code-block/CodeBlockPlugin';
import { withCodeBlock } from '../../../../slate-plugins/src/elements/code-block/withCodeBlock';
import { HeadingPlugin } from '../../../../slate-plugins/src/elements/heading/HeadingPlugin';
import { withImageUpload } from '../../../../slate-plugins/src/elements/image/image-upload/withImageUpload';
import { ImagePlugin } from '../../../../slate-plugins/src/elements/image/ImagePlugin';
import { LinkPlugin } from '../../../../slate-plugins/src/elements/link/LinkPlugin';
import { withLink } from '../../../../slate-plugins/src/elements/link/withLink';
import { ListPlugin } from '../../../../slate-plugins/src/elements/list/ListPlugin';
import { MediaEmbedPlugin } from '../../../../slate-plugins/src/elements/media-embed/MediaEmbedPlugin';
import { MentionPlugin } from '../../../../slate-plugins/src/elements/mention/MentionPlugin';
import { ParagraphPlugin } from '../../../../slate-plugins/src/elements/paragraph/ParagraphPlugin';
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
import { CodePlugin } from '../../../../slate-plugins/src/marks/code/CodePlugin';
import { MARK_CODE } from '../../../../slate-plugins/src/marks/code/defaults';
import { HighlightPlugin } from '../../../../slate-plugins/src/marks/highlight/HighlightPlugin';
import { MARK_ITALIC } from '../../../../slate-plugins/src/marks/italic/defaults';
import { ItalicPlugin } from '../../../../slate-plugins/src/marks/italic/ItalicPlugin';
import { MARK_STRIKETHROUGH } from '../../../../slate-plugins/src/marks/strikethrough/defaults';
import { StrikethroughPlugin } from '../../../../slate-plugins/src/marks/strikethrough/StrikethroughPlugin';
import {
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
} from '../../../../slate-plugins/src/marks/subsupscript/defaults';
import { SubscriptPlugin } from '../../../../slate-plugins/src/marks/subsupscript/subscript/SubscriptPlugin';
import { SuperscriptPlugin } from '../../../../slate-plugins/src/marks/subsupscript/superscript/SuperscriptPlugin';
import { MARK_UNDERLINE } from '../../../../slate-plugins/src/marks/underline/defaults';
import { UnderlinePlugin } from '../../../../slate-plugins/src/marks/underline/UnderlinePlugin';
import { withNormalizeTypes } from '../../../../slate-plugins/src/normalizers/withNormalizeTypes';
import { withRemoveEmptyNodes } from '../../../../slate-plugins/src/normalizers/withRemoveEmptyNodes';
import { withInlineVoid } from '../../../../slate-plugins/src/plugins/withInlineVoid/withInlineVoid';
import { withNodeID } from '../../../../slate-plugins/src/plugins/withNodeID/withNodeID';
import { SearchHighlightPlugin } from '../../../../slate-plugins/src/widgets/search-highlight/SearchHighlightPlugin';
import { EditablePlugins } from '../../components/EditablePlugins';
import { SlatePlugins } from '../../components/SlatePlugins';
import { useSlatePlugins } from '../../hooks/useSlatePlugins/useSlatePlugins';
import { pipe } from '../../utils/pipe';

const plugins = [
  ...BasicElementPlugins(),
  ...BasicMarkPlugins(),
  BlockquotePlugin(),
  TodoListPlugin(),
  HeadingPlugin({ levels: 5 }),
  ImagePlugin(),
  LinkPlugin(),
  ListPlugin(),
  MentionPlugin(),
  ParagraphPlugin(),
  TablePlugin(),
  MediaEmbedPlugin(),
  CodeBlockPlugin(),
  AlignPlugin(),
  BoldPlugin(),
  CodePlugin(),
  ItalicPlugin(),
  StrikethroughPlugin(),
  HighlightPlugin(),
  UnderlinePlugin(),
  SubscriptPlugin(),
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
  withLink({}, options),
  withCodeBlock({}, options),
  withDeserializeHTML({ plugins }),
  withImageUpload({}, options),
  withAutoformat({ rules: autoformatRulesFixtures }),
  withNormalizeTypes({
    rules: [{ path: [0, 0], strictType: options.h1.type }],
  }),
  withNodeID(),
  withInlineVoid({ plugins }),
  withRemoveEmptyNodes({ type: options.a.type }),
] as const;

const Editor = () => {
  const decorate: any = [];
  const onKeyDown: any = [];

  useSlatePlugins({});

  return (
    <>
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
        editableProps={{
          placeholder: 'Enter some plain text...',
        }}
      />
    </>
  );
};

const SlatePluginsContainer = () => {
  const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

  return (
    <SlatePlugins editor={editor}>
      <Editor />
    </SlatePlugins>
  );
};

it('should render', () => {
  const { getAllByTestId } = render(<SlatePluginsContainer />);

  expect(getAllByTestId('EditablePlugins').length).toBeGreaterThan(0);
});
