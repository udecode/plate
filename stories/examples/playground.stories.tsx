import 'tippy.js/dist/tippy.css';
import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { CodeAlt } from '@styled-icons/boxicons-regular/CodeAlt';
import { CodeBlock } from '@styled-icons/boxicons-regular/CodeBlock';
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
  Looks3,
  Looks4,
  Looks5,
  Looks6,
  LooksOne,
  LooksTwo,
  Search,
} from '@styled-icons/material';
import { createEditor, Node } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  ActionItemPlugin,
  BalloonToolbar,
  BlockquotePlugin,
  BoldPlugin,
  CodeBlockPlugin,
  CodePlugin,
  decorateSearchHighlight,
  EditablePlugins,
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
  MentionPlugin,
  MentionSelect,
  ParagraphPlugin,
  pipe,
  SearchHighlightPlugin,
  SlateDocument,
  SoftBreakPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  TablePlugin,
  ToolbarElement,
  ToolbarImage,
  ToolbarLink,
  ToolbarList,
  ToolbarMark,
  ToolbarSearchHighlight,
  UnderlinePlugin,
  useMention,
  withAutoformat,
  withDeserializeHTML,
  withImageUpload,
  withInlineVoid,
  withLink,
  withList,
  withNormalizeTypes,
  withResetBlockType,
  withTable,
  withToggleType,
  withTrailingNode,
  withTransforms,
} from '../../packages/slate-plugins/src';
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
  nodeTypes,
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

export const Plugins = () => {
  const plugins: any[] = [];

  if (boolean('ParagraphPlugin', true))
    plugins.push(ParagraphPlugin(nodeTypes));
  if (boolean('BlockquotePlugin', true))
    plugins.push(BlockquotePlugin(nodeTypes));
  if (boolean('ActionItemPlugin', true))
    plugins.push(ActionItemPlugin(nodeTypes));
  if (boolean('HeadingPlugin', true)) plugins.push(HeadingPlugin(nodeTypes));
  if (boolean('ImagePlugin', true)) plugins.push(ImagePlugin(nodeTypes));
  if (boolean('LinkPlugin', true)) plugins.push(LinkPlugin(nodeTypes));
  if (boolean('ListPlugin', true)) plugins.push(ListPlugin(nodeTypes));
  if (boolean('MentionPlugin', true)) plugins.push(MentionPlugin(nodeTypes));
  if (boolean('TablePlugin', true)) plugins.push(TablePlugin(nodeTypes));
  if (boolean('MediaEmbedPlugin', true))
    plugins.push(MediaEmbedPlugin(nodeTypes));
  if (boolean('CodeBlockPlugin', true))
    plugins.push(CodeBlockPlugin(nodeTypes));
  if (boolean('BoldPlugin', true)) plugins.push(BoldPlugin(nodeTypes));
  if (boolean('CodePlugin', true)) plugins.push(CodePlugin(nodeTypes));
  if (boolean('ItalicPlugin', true)) plugins.push(ItalicPlugin(nodeTypes));
  if (boolean('HighlightPlugin', true))
    plugins.push(HighlightPlugin(nodeTypes));
  if (boolean('SearchHighlightPlugin', true))
    plugins.push(SearchHighlightPlugin(nodeTypes));
  if (boolean('UnderlinePlugin', true))
    plugins.push(UnderlinePlugin(nodeTypes));
  if (boolean('StrikethroughPlugin', true))
    plugins.push(StrikethroughPlugin(nodeTypes));
  if (boolean('SubscriptPlugin', true))
    plugins.push(SubscriptPlugin(nodeTypes));
  if (boolean('SuperscriptPlugin', true))
    plugins.push(SuperscriptPlugin(nodeTypes));
  if (boolean('SoftBreakPlugin', true))
    plugins.push(
      SoftBreakPlugin({
        rules: [
          { hotkey: 'shift+enter' },
          {
            hotkey: 'enter',
            query: {
              allow: [
                nodeTypes.typeCodeBlock,
                nodeTypes.typeBlockquote,
                nodeTypes.typeTd,
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
    withTable(nodeTypes),
    withLink(),
    withDeserializeHTML({ plugins }),
    withImageUpload(),
    withToggleType({ defaultType: nodeTypes.typeP }),
    withResetBlockType({
      types: [
        nodeTypes.typeActionItem,
        nodeTypes.typeBlockquote,
        nodeTypes.typeCodeBlock,
      ],
      defaultType: nodeTypes.typeP,
    }),
    withList(nodeTypes),
    withAutoformat(nodeTypes),
    withTransforms(),
    withNormalizeTypes({
      rules: [{ path: [0, 0], strictType: nodeTypes.typeH1 }],
    }),
    withTrailingNode({ type: nodeTypes.typeP, level: 1 }),
    withInlineVoid({ plugins }),
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
        <HeadingToolbar>
          <ToolbarElement type={nodeTypes.typeH1} icon={<LooksOne />} />
          <ToolbarElement type={nodeTypes.typeH2} icon={<LooksTwo />} />
          <ToolbarElement type={nodeTypes.typeH3} icon={<Looks3 />} />
          <ToolbarElement type={nodeTypes.typeH4} icon={<Looks4 />} />
          <ToolbarElement type={nodeTypes.typeH5} icon={<Looks5 />} />
          <ToolbarElement type={nodeTypes.typeH6} icon={<Looks6 />} />
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
          <ToolbarLink {...nodeTypes} icon={<Link />} />
          <ToolbarList
            {...nodeTypes}
            typeList={nodeTypes.typeUl}
            icon={<FormatListBulleted />}
          />
          <ToolbarList
            {...nodeTypes}
            typeList={nodeTypes.typeOl}
            icon={<FormatListNumbered />}
          />
          <ToolbarElement
            type={nodeTypes.typeBlockquote}
            icon={<FormatQuote />}
          />
          <ToolbarElement type={nodeTypes.typeCodeBlock} icon={<CodeBlock />} />
          <ToolbarImage {...nodeTypes} icon={<Image />} />
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
          placeholder="Enter some plain text..."
        />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
