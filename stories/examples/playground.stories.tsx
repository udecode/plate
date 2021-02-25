import 'tippy.js/dist/tippy.css';
import React, { useMemo, useState } from 'react';
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
import {
  AlignPlugin,
  BalloonToolbar,
  BlockquotePlugin,
  BoldPlugin,
  CodeBlockPlugin,
  CodePlugin,
  decorateSearchHighlight,
  EditablePlugins,
  ELEMENT_IMAGE,
  ExitBreakPlugin,
  HeadingPlugin,
  HeadingToolbar,
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
  MentionNodeData,
  MentionPlugin,
  MentionSelect,
  ParagraphPlugin,
  pipe,
  ResetBlockTypePlugin,
  SearchHighlightPlugin,
  SlateDocument,
  SoftBreakPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  TablePlugin,
  TodoListPlugin,
  ToolbarAlign,
  ToolbarCodeBlock,
  ToolbarElement,
  ToolbarImage,
  ToolbarLink,
  ToolbarList,
  ToolbarMark,
  ToolbarSearchHighlight,
  UnderlinePlugin,
  useMention,
  withAutoformat,
  withCodeBlock,
  withDeserializeHTML,
  withImageUpload,
  withInlineVoid,
  withLink,
  withList,
  withMarks,
  withNormalizeTypes,
  withSelectOnBackspace,
  withTable,
  withTrailingNode,
} from '@udecode/slate-plugins';
import { createEditor, Node } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import { autoformatRules } from '../config/autoformatRules';
import {
  headingTypes,
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
} from '../config/initialValues';
import { MENTIONABLES } from '../config/mentionables';

export default {
  title: 'Examples/Playground',
};

const initialValue: Node[] = [
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

const renderLabel = (mentionable: MentionNodeData) => {
  const entry = MENTIONABLES.find((m) => m.value === mentionable.value);
  if (!entry) return 'unknown option';
  return `${entry.name} - ${entry.email}`;
};

export const Plugins = () => {
  const plugins: any[] = [];

  if (boolean('ParagraphPlugin', true)) plugins.push(ParagraphPlugin(options));
  if (boolean('BlockquotePlugin', true))
    plugins.push(BlockquotePlugin(options));
  if (boolean('TodoListPlugin', true)) plugins.push(TodoListPlugin(options));
  if (boolean('HeadingPlugin', true)) plugins.push(HeadingPlugin(options));
  if (boolean('ImagePlugin', true)) plugins.push(ImagePlugin(options));
  if (boolean('LinkPlugin', true)) plugins.push(LinkPlugin(options));
  if (boolean('ListPlugin', true)) plugins.push(ListPlugin(options));
  if (boolean('MentionPlugin', true))
    plugins.push(
      MentionPlugin({
        mention: {
          ...options.mention,
          rootProps: {
            onClick: (mentionable: MentionNodeData) =>
              console.info(`Hello, I'm ${mentionable.value}`),
            prefix: '@',
            renderLabel,
          },
        },
      })
    );
  if (boolean('TablePlugin', true)) plugins.push(TablePlugin(options));
  if (boolean('MediaEmbedPlugin', true))
    plugins.push(MediaEmbedPlugin(options));
  if (boolean('CodeBlockPlugin', true)) plugins.push(CodeBlockPlugin(options));
  if (boolean('AlignPlugin', true)) plugins.push(AlignPlugin(options));
  if (boolean('BoldPlugin', true)) plugins.push(BoldPlugin(options));
  if (boolean('CodePlugin', true)) plugins.push(CodePlugin(options));
  if (boolean('ItalicPlugin', true)) plugins.push(ItalicPlugin(options));
  if (boolean('HighlightPlugin', true)) plugins.push(HighlightPlugin(options));
  if (boolean('SearchHighlightPlugin', true))
    plugins.push(SearchHighlightPlugin(options));
  if (boolean('UnderlinePlugin', true)) plugins.push(UnderlinePlugin(options));
  if (boolean('StrikethroughPlugin', true))
    plugins.push(StrikethroughPlugin(options));
  if (boolean('SubscriptPlugin', true)) plugins.push(SubscriptPlugin(options));
  if (boolean('SuperscriptPlugin', true))
    plugins.push(SuperscriptPlugin(options));
  if (boolean('ResetBlockTypePlugin', true))
    plugins.push(ResetBlockTypePlugin(optionsResetBlockTypes));
  if (boolean('SoftBreakPlugin', true))
    plugins.push(
      SoftBreakPlugin({
        rules: [
          { hotkey: 'shift+enter' },
          {
            hotkey: 'enter',
            query: {
              allow: [
                options.code_block.type,
                options.blockquote.type,
                options.td.type,
              ],
            },
          },
        ],
      })
    );
  if (boolean('ExitBreakPlugin', true))
    plugins.push(
      ExitBreakPlugin({
        rules: [
          {
            hotkey: 'mod+enter',
          },
          {
            hotkey: 'mod+shift+enter',
            before: true,
          },
          {
            hotkey: 'enter',
            query: {
              start: true,
              end: true,
              allow: headingTypes,
            },
          },
        ],
      })
    );

  const withPlugins = [
    withReact,
    withHistory,
    withTable(options),
    withLink(),
    withList(options),
    withCodeBlock(options),
    withDeserializeHTML({ plugins }),
    withMarks(),
    withImageUpload(),
    withAutoformat({ rules: autoformatRules }),
    withNormalizeTypes({
      rules: [{ path: [0, 0], strictType: options.h1.type }],
    }),
    withTrailingNode({ type: options.p.type, level: 1 }),
    withInlineVoid({ plugins }),
    withSelectOnBackspace({ allow: [ELEMENT_IMAGE] }),
  ] as const;

  const createReactEditor = () => () => {
    const decorate: any = [];
    const onKeyDown: any = [];

    const [value, setValue] = useState(initialValue);

    const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

    const [search, setSearchHighlight] = useState('');

    if (boolean('decorateSearchHighlight', true))
      decorate.push(decorateSearchHighlight({ search }));

    const {
      index,
      search: mentionSearch,
      target,
      values,
      onChangeMention,
      onKeyDownMention,
    } = useMention(MENTIONABLES, {
      maxSuggestions: 10,
      trigger: '@',
      insertSpaceAfterMention: false,
      mentionableFilter: (s: string) => (mentionable: MentionNodeData) =>
        mentionable.email.toLowerCase().includes(s.toLowerCase()) ||
        mentionable.name.toLowerCase().includes(s.toLowerCase()),
      mentionableSearchPattern: '\\S*',
    });

    if (boolean('onKeyDownMentions', true)) onKeyDown.push(onKeyDownMention);

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => {
          setValue(newValue as SlateDocument);

          onChangeMention(editor);
        }}
      >
        <ToolbarSearchHighlight icon={Search} setSearch={setSearchHighlight} />
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
        <MentionSelect
          at={target}
          valueIndex={index}
          options={values}
          renderLabel={renderLabel}
        />
        <EditablePlugins
          plugins={plugins}
          decorate={decorate}
          decorateDeps={[search]}
          renderLeafDeps={[search]}
          onKeyDown={onKeyDown}
          onKeyDownDeps={[index, mentionSearch, target]}
          placeholder="Enter some plain text..."
        />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
