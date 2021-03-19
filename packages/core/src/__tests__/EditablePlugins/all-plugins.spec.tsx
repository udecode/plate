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
} from '../../../../../stories/config/initialValues';
import { optionsResetBlockTypePlugin } from '../../../../../stories/config/pluginOptions';
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
import { withDeserializeHTML } from '../../../../slate-plugins/src/deserializers/deserialize-html/useDeserializeHTMLPlugin';
import { useAlignPlugin } from '../../../../slate-plugins/src/elements/align/useAlignPlugin';
import { useBasicElementPlugins } from '../../../../slate-plugins/src/elements/basic-elements/useBasicElementPlugins';
import { useBlockquotePlugin } from '../../../../slate-plugins/src/elements/blockquote/useBlockquotePlugin';
import { useCodeBlockPlugin } from '../../../../slate-plugins/src/elements/code-block/useCodeBlockPlugin';
import { withCodeBlock } from '../../../../slate-plugins/src/elements/code-block/withCodeBlock';
import { useHeadingPlugin } from '../../../../slate-plugins/src/elements/heading/useHeadingPlugin';
import { useImagePlugin } from '../../../../slate-plugins/src/elements/image/useImagePlugin';
import { withImageUpload } from '../../../../slate-plugins/src/elements/image/withImageUpload';
import { useLinkPlugin } from '../../../../slate-plugins/src/elements/link/useLinkPlugin';
import { withLink } from '../../../../slate-plugins/src/elements/link/withLink';
import { useListPlugin } from '../../../../slate-plugins/src/elements/list/useListPlugin';
import { useMediaEmbedPlugin } from '../../../../slate-plugins/src/elements/media-embed/useMediaEmbedPlugin';
import { useMentionPlugin } from '../../../../slate-plugins/src/elements/mention/useMentionPlugin';
import { useParagraphPlugin } from '../../../../slate-plugins/src/elements/paragraph/useParagraphPlugin';
import { useTablePlugin } from '../../../../slate-plugins/src/elements/table/useTablePlugin';
import { withTable } from '../../../../slate-plugins/src/elements/table/withTable';
import { useTodoListPlugin } from '../../../../slate-plugins/src/elements/todo-list/useTodoListPlugin';
import { useBasicMarkPlugins } from '../../../../slate-plugins/src/marks/basic-marks/useBasicMarkPlugins';
import { MARK_BOLD } from '../../../../slate-plugins/src/marks/bold/defaults';
import { useBoldPlugin } from '../../../../slate-plugins/src/marks/bold/useBoldPlugin';
import { MARK_CODE } from '../../../../slate-plugins/src/marks/code/defaults';
import { useCodePlugin } from '../../../../slate-plugins/src/marks/code/useCodePlugin';
import { useHighlightPlugin } from '../../../../slate-plugins/src/marks/highlight/useHighlightPlugin';
import { MARK_ITALIC } from '../../../../slate-plugins/src/marks/italic/defaults';
import { useItalicPlugin } from '../../../../slate-plugins/src/marks/italic/useItalicPlugin';
import { MARK_STRIKETHROUGH } from '../../../../slate-plugins/src/marks/strikethrough/defaults';
import { useStrikethroughPlugin } from '../../../../slate-plugins/src/marks/strikethrough/useStrikethroughPlugin';
import {
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
} from '../../../../slate-plugins/src/marks/subsupscript/defaults';
import { useSubscriptPlugin } from '../../../../slate-plugins/src/marks/subsupscript/subscript/useSubscriptPlugin';
import { useSuperscriptPlugin } from '../../../../slate-plugins/src/marks/subsupscript/superscript/useSuperscriptPlugin';
import { MARK_UNDERLINE } from '../../../../slate-plugins/src/marks/underline/defaults';
import { useUnderlinePlugin } from '../../../../slate-plugins/src/marks/underline/useUnderlinePlugin';
import { withAutoformat } from '../../../../slate-plugins/src/plugins/autoformat/useAutoformatPlugin';
import { useExitBreakPlugin } from '../../../../slate-plugins/src/plugins/exit-break/useExitBreakPlugin';
import { useResetBlockTypePlugin } from '../../../../slate-plugins/src/plugins/reset-block-type/useResetBlockTypePlugin';
import { useSoftBreakPlugin } from '../../../../slate-plugins/src/plugins/soft-break/useSoftBreakPlugin';
import { withNodeId } from '../../../../slate-plugins/src/plugins/useNodeIdPlugin';
import { withNormalizeTypes } from '../../../../slate-plugins/src/plugins/useNormalizeTypesPlugin';
import { withRemoveEmptyNodes } from '../../../../slate-plugins/src/plugins/useRemoveEmptyNodesPlugin';
import { useSearchHighlightPlugin } from '../../../../slate-plugins/src/widgets/search-highlight/useSearchHighlightPlugin';
import { EditablePlugins } from '../../components/EditablePlugins';
import { SlatePlugins } from '../../components/SlatePlugins';
import { useSlatePlugins } from '../../hooks/useSlatePlugins/useSlatePlugins';
import { withInlineVoid } from '../../plugins/inline-void/withInlineVoid';
import { pipe } from '../../utils/pipe';

const plugins = [
  ...useBasicElementPlugins(),
  ...useBasicMarkPlugins(),
  useBlockquotePlugin(),
  useTodoListPlugin(),
  useHeadingPlugin({ levels: 5 }),
  useImagePlugin(),
  useLinkPlugin(),
  useListPlugin(),
  useMentionPlugin(),
  useParagraphPlugin(),
  useTablePlugin(),
  useMediaEmbedPlugin(),
  useCodeBlockPlugin(),
  useAlignPlugin(),
  useBoldPlugin(),
  useCodePlugin(),
  useItalicPlugin(),
  useStrikethroughPlugin(),
  useHighlightPlugin(),
  useUnderlinePlugin(),
  useSubscriptPlugin(),
  useSuperscriptPlugin(),
  useSearchHighlightPlugin(),
  useResetBlockTypePlugin(optionsResetBlockTypePlugin),
  useSoftBreakPlugin(),
  useExitBreakPlugin(),
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

const withOverrides = [
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
  withNodeId(),
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
  const editor = useMemo(() => pipe(createEditor(), ...withOverrides), []);

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
