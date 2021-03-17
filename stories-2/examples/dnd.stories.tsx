import 'tippy.js/dist/tippy.css';
import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { boolean } from '@storybook/addon-knobs';
import { CodeAlt } from '@styled-icons/boxicons-regular/CodeAlt';
import { CodeBlock } from '@styled-icons/boxicons-regular/CodeBlock';
import { Subscript, Superscript } from '@styled-icons/foundation';
import {
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
  Image,
  Link,
  Looks3,
  Looks4,
  Looks5,
  Looks6,
  LooksOne,
  LooksTwo,
  Search,
} from '@styled-icons/material';
import { DragIndicator } from '@styled-icons/material/DragIndicator';
import {
  AlignPlugin,
  BlockquotePlugin,
  BoldPlugin,
  CodeBlockPlugin,
  CodePlugin,
  EditablePlugins,
  ELEMENT_LINK,
  ELEMENT_TODO_LI,
  ExitBreakPlugin,
  HeadingPlugin,
  HighlightPlugin,
  ImagePlugin,
  ItalicPlugin,
  LinkPlugin,
  ListPlugin,
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
  MARK_UNDERLINE,
  MediaEmbedPlugin,
  MentionPlugin,
  ParagraphPlugin,
  ResetBlockTypePlugin,
  SearchHighlightPlugin,
  SlateDocument,
  SlatePlugins,
  SoftBreakPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  TablePlugin,
  TodoListPlugin,
  UnderlinePlugin,
  useDecorateSearchHighlight,
  useMention,
  useSlatePluginsActions,
  useSlatePluginsEditor,
  withAutoformat,
  withCodeBlock,
  withDeserializeHTML,
  withImageUpload,
  withInlineVoid,
  withLink,
  withList,
  withMarks,
  withNodeID,
  withNormalizeTypes,
  withTable,
  withTrailingNode,
} from '@udecode/slate-plugins';
import {
  BalloonToolbar,
  getSelectableElement,
  HeadingToolbar,
  MentionSelect,
  ToolbarAlign,
  ToolbarCodeBlock,
  ToolbarElement,
  ToolbarImage,
  ToolbarLink,
  ToolbarList,
  ToolbarMark,
  ToolbarSearchHighlight,
} from '@udecode/slate-plugins-components';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { autoformatRules } from '../config/autoformatRules';
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
  options as defaultOptions,
  optionsExitBreak,
  optionsResetBlockTypes,
  optionsSoftBreak,
} from '../config/initialValues';
import { MENTIONABLES } from '../config/mentionables';

const id = 'Examples/Drag & Drop';

export default {
  title: id,
};

const draggableComponentOptions = ([
  { ...defaultOptions.p, level: 1 },
  defaultOptions.blockquote,
  defaultOptions[ELEMENT_TODO_LI],
  defaultOptions.h1,
  defaultOptions.h2,
  defaultOptions.h3,
  defaultOptions.h4,
  defaultOptions.h5,
  defaultOptions.h6,
  defaultOptions.img,
  defaultOptions[ELEMENT_LINK],
  defaultOptions.ol,
  defaultOptions.ul,
  defaultOptions.table,
  defaultOptions.media_embed,
  defaultOptions.code_block,
] as any).map(
  ({
    type,
    level,
    component,
    ...options
  }: {
    type: string;
    level?: number;
    component: any;
  }) => [
    type,
    {
      ...options,
      // component: getSelectableElement({
      //   component,
      //   level,
      //   dragIcon: (
      //     <DragIndicator
      //       style={{
      //         width: 18,
      //         height: 18,
      //         color: 'rgba(55, 53, 47, 0.3)',
      //       }}
      //     />
      //   ),
      //   styles: {
      //     blockAndGutter: {
      //       padding: '4px 0',
      //     },
      //     blockToolbarWrapper: {
      //       height: '1.5em',
      //     },
      //   },
      // }),
      rootProps: {
        styles: {
          root: {
            margin: 0,
            lineHeight: '1.5',
          },
        },
      },
    },
  ]
);

const options = {
  ...defaultOptions,
  ...Object.fromEntries(draggableComponentOptions),
};

const initialValue: any[] = [
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

const setNodeId = (nodes: any[]) => {
  let _id = 10000;
  nodes.forEach((node) => {
    const children = node.children as any[];
    children?.forEach((block) => {
      block.id = _id;
      _id++;
    });
  });
};

setNodeId(initialValue);

export const Example = () => {
  const plugins: any[] = [];

  if (boolean('ParagraphPlugin', true)) plugins.push(ParagraphPlugin());
  if (boolean('BlockquotePlugin', true)) plugins.push(BlockquotePlugin());
  if (boolean('TodoListPlugin', true)) plugins.push(TodoListPlugin());
  if (boolean('HeadingPlugin', true)) plugins.push(HeadingPlugin());
  if (boolean('ImagePlugin', true)) plugins.push(ImagePlugin());
  if (boolean('LinkPlugin', true)) plugins.push(LinkPlugin());
  if (boolean('ListPlugin', true)) plugins.push(ListPlugin());
  if (boolean('MentionPlugin', true)) plugins.push(MentionPlugin());
  if (boolean('TablePlugin', true)) plugins.push(TablePlugin());
  if (boolean('MediaEmbedPlugin', true)) plugins.push(MediaEmbedPlugin());
  if (boolean('CodeBlockPlugin', true)) plugins.push(CodeBlockPlugin());
  if (boolean('AlignPlugin', true)) plugins.push(AlignPlugin());
  if (boolean('BoldPlugin', true)) plugins.push(BoldPlugin());
  if (boolean('CodePlugin', true)) plugins.push(CodePlugin());
  if (boolean('ItalicPlugin', true)) plugins.push(ItalicPlugin());
  if (boolean('HighlightPlugin', true)) plugins.push(HighlightPlugin());
  if (boolean('SearchHighlightPlugin', true))
    plugins.push(SearchHighlightPlugin());
  if (boolean('UnderlinePlugin', true)) plugins.push(UnderlinePlugin());
  if (boolean('StrikethroughPlugin', true)) plugins.push(StrikethroughPlugin());
  if (boolean('SubscriptPlugin', true)) plugins.push(SubscriptPlugin());
  if (boolean('SuperscriptPlugin', true)) plugins.push(SuperscriptPlugin());
  if (boolean('ResetBlockTypePlugin', true))
    plugins.push(ResetBlockTypePlugin(optionsResetBlockTypes));
  if (boolean('SoftBreakPlugin', true))
    plugins.push(SoftBreakPlugin(optionsSoftBreak));
  if (boolean('ExitBreakPlugin', true))
    plugins.push(ExitBreakPlugin(optionsExitBreak));

  const withOverrides = [
    withReact,
    withHistory,
    withTable(options),
    withLink({}, options),
    withList({}, options),
    withCodeBlock({}, options),
    withDeserializeHTML({ plugins }),
    withMarks(),
    withImageUpload({}, options),
    withAutoformat({ rules: autoformatRules }),
    withNodeID(),
    withNormalizeTypes({
      rules: [{ path: [0, 0], strictType: options.h1.type }],
    }),
    withTrailingNode({ type: options.p.type, level: 1 }),
    withInlineVoid({ plugins }),
  ] as const;

  const createReactEditor = () => () => {
    const decorate: any = [];
    const onKeyDown: any = [];

    const { setValue } = useSlatePluginsActions(id);
    const editor = useSlatePluginsEditor(id);

    const [search, setSearchHighlight] = useState('');

    if (boolean('decorateSearchHighlight', true))
      decorate.push(useDecorateSearchHighlight({ search }));

    const {
      index,
      search: mentionSearch,
      target,
      values,
      onChangeMention,
      onKeyDownMention,
    } = useMention(MENTIONABLES, {
      maxSuggestions: 10,
    });

    if (boolean('onKeyDownMentions', true)) onKeyDown.push(onKeyDownMention);

    return (
      <DndProvider backend={HTML5Backend}>
        <SlatePlugins
          id={id}
          initialValue={initialValue}
          withOverrides={withOverrides}
          onChange={(newValue) => {
            setValue(newValue as SlateDocument);

            onChangeMention(editor);
          }}
        >
          <ToolbarSearchHighlight
            icon={Search}
            setSearch={setSearchHighlight}
          />
          <HeadingToolbar styles={{ root: { flexWrap: 'wrap' } }}>
            {/* Elements */}
            <ToolbarElement type={options.h1.type} icon={<LooksOne />} />
            <ToolbarElement type={options.h2.type} icon={<LooksTwo />} />
            <ToolbarElement type={options.h3.type} icon={<Looks3 />} />
            <ToolbarElement type={options.h4.type} icon={<Looks4 />} />
            <ToolbarElement type={options.h5.type} icon={<Looks5 />} />
            <ToolbarElement type={options.h6.type} icon={<Looks6 />} />
            <ToolbarList
              {...options}
              typeList={options.ul.type}
              icon={<FormatListBulleted />}
            />
            <ToolbarList
              {...options}
              typeList={options.ol.type}
              icon={<FormatListNumbered />}
            />
            <ToolbarElement
              type={options.blockquote.type}
              icon={<FormatQuote />}
            />
            <ToolbarCodeBlock
              type={options.code_block.type}
              icon={<CodeBlock />}
              options={options}
            />

            {/* Marks */}
            <ToolbarMark type={MARK_BOLD} icon={<FormatBold />} />
            <ToolbarMark type={MARK_ITALIC} icon={<FormatItalic />} />
            <ToolbarMark type={MARK_UNDERLINE} icon={<FormatUnderlined />} />
            <ToolbarMark
              type={MARK_STRIKETHROUGH}
              icon={<FormatStrikethrough />}
            />
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

            <ToolbarAlign icon={<FormatAlignLeft />} />
            <ToolbarAlign
              type={options.align_center.type}
              icon={<FormatAlignCenter />}
            />
            <ToolbarAlign
              type={options.align_right.type}
              icon={<FormatAlignRight />}
            />
            <ToolbarAlign
              type={options.align_justify.type}
              icon={<FormatAlignJustify />}
            />
            <ToolbarLink {...options} icon={<Link />} />
            <ToolbarImage {...options} icon={<Image />} />
          </HeadingToolbar>
          <BalloonToolbar arrow>
            <ToolbarMark
              reversed
              type={MARK_BOLD}
              icon={<FormatBold />}
              tooltip={{ content: 'Bold (⌘B)' }}
            />
            <ToolbarMark
              reversed
              type={MARK_ITALIC}
              icon={<FormatItalic />}
              tooltip={{ content: 'Italic (⌘I)' }}
            />
            <ToolbarMark
              reversed
              type={MARK_UNDERLINE}
              icon={<FormatUnderlined />}
              tooltip={{ content: 'Underline (⌘U)' }}
            />
          </BalloonToolbar>
          <MentionSelect at={target} valueIndex={index} options={values} />
          <EditablePlugins
            plugins={plugins}
            decorate={decorate}
            decorateDeps={[search]}
            renderLeafDeps={[search]}
            onKeyDown={onKeyDown}
            onKeyDownDeps={[index, mentionSearch, target]}
            editableProps={{
              placeholder: 'Enter some plain text...',
              readOnly: boolean('readOnly', false),
              style: {
                padding: 20,
              },
            }}
          />
        </SlatePlugins>
      </DndProvider>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
