import React, { useMemo, useState } from 'react';
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
  LooksOne,
  LooksTwo,
} from '@styled-icons/material';
import { render } from '@testing-library/react';
import { withDeserializeHtml } from 'deserializers/deserialize-html';
import {
  ToolbarBlock,
  withBlock,
  withBreakEmptyReset,
  withDeleteStartReset,
  withVoid,
} from 'element';
import {
  ToolbarCode,
  ToolbarImage,
  ToolbarLink,
  ToolbarList,
  withImage,
  withLink,
  withList,
  withMention,
  withTable,
} from 'elements';
import { ActionItemPlugin } from 'elements/action-item';
import { BlockquotePlugin } from 'elements/blockquote';
import { CodePlugin } from 'elements/code';
import { HeadingPlugin } from 'elements/heading';
import { ImagePlugin } from 'elements/image';
import { LinkPlugin } from 'elements/link';
import { ListPlugin } from 'elements/list';
import { MentionPlugin } from 'elements/mention';
import { ParagraphPlugin } from 'elements/paragraph';
import { TablePlugin } from 'elements/table';
import { VideoPlugin } from 'elements/video';
import { ToolbarMark } from 'mark/components';
import { BoldPlugin, MARK_BOLD } from 'marks/bold';
import { HighlightPlugin, renderLeafHighlight } from 'marks/highlight';
import { InlineCodePlugin, MARK_CODE } from 'marks/inline-code';
import { ItalicPlugin, MARK_ITALIC } from 'marks/italic';
import { MARK_STRIKETHROUGH, StrikethroughPlugin } from 'marks/strikethrough';
import { MARK_SUBSCRIPT, SubscriptPlugin } from 'marks/subscript';
import { MARK_SUPERSCRIPT, SuperscriptPlugin } from 'marks/superscript';
import { MARK_UNDERLINE, UnderlinePlugin } from 'marks/underline';
import { withShortcuts } from 'md-shortcuts';
import { withNodeID, withTransforms } from 'node';
import { SearchHighlightPlugin } from 'search-highlight';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import { SoftBreakPlugin } from 'soft-break';
import { EditablePlugins, HeadingToolbar, HoveringToolbar } from 'components';
import {
  initialValueActionItem,
  initialValueElements,
  initialValueEmbeds,
  initialValueImages,
  initialValueMarks,
  initialValueMentions,
  initialValueVoids,
  nodeTypes,
} from '../../../../../../stories/config/initialValues';

const plugins = [
  BlockquotePlugin(nodeTypes),
  ActionItemPlugin(nodeTypes),
  HeadingPlugin(nodeTypes),
  ImagePlugin(nodeTypes),
  LinkPlugin(nodeTypes),
  ListPlugin(nodeTypes),
  MentionPlugin(nodeTypes),
  ParagraphPlugin(nodeTypes),
  TablePlugin(nodeTypes),
  VideoPlugin(nodeTypes),
  CodePlugin(nodeTypes),
  BoldPlugin(nodeTypes),
  InlineCodePlugin(nodeTypes),
  ItalicPlugin(nodeTypes),
  StrikethroughPlugin(nodeTypes),
  SearchHighlightPlugin(nodeTypes),
  HighlightPlugin(nodeTypes),
  UnderlinePlugin(nodeTypes),
  SubscriptPlugin(nodeTypes),
  SuperscriptPlugin(nodeTypes),
  SoftBreakPlugin(),
];

const initialValue = [
  ...initialValueMarks,
  ...initialValueElements,
  ...initialValueActionItem,
  ...initialValueEmbeds,
  ...initialValueMentions,
  ...initialValueImages,
  ...initialValueVoids,
];

const resetOptions = {
  ...nodeTypes,
  types: [nodeTypes.typeActionItem, nodeTypes.typeBlockquote],
};

const Editor = () => {
  const decorate: any = [];
  const onKeyDown: any = [];

  const [value, setValue] = useState(initialValue);

  const editor = useMemo(
    () =>
      withVoid([nodeTypes.typeVideo])(
        withShortcuts(nodeTypes)(
          withList(nodeTypes)(
            withBreakEmptyReset(resetOptions)(
              withDeleteStartReset(resetOptions)(
                withBlock(nodeTypes)(
                  withMention(nodeTypes)(
                    withImage(nodeTypes)(
                      withDeserializeHtml(plugins)(
                        withLink(nodeTypes)(
                          withTable(nodeTypes)(
                            withNodeID()(
                              withTransforms()(
                                withHistory(withReact(createEditor()))
                              )
                            )
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
          )
        )
      ),
    []
  );

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(newValue) => {
        setValue(newValue);
      }}
    >
      <HeadingToolbar>
        <ToolbarBlock type={nodeTypes.typeH1} icon={<LooksOne />} />
        <ToolbarBlock type={nodeTypes.typeH2} icon={<LooksTwo />} />
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
        <ToolbarBlock type={nodeTypes.typeBlockquote} icon={<FormatQuote />} />
        <ToolbarCode {...nodeTypes} icon={<CodeBlock />} />
        <ToolbarImage {...nodeTypes} icon={<Image />} />
      </HeadingToolbar>
      <HoveringToolbar>
        <ToolbarMark reversed type={MARK_BOLD} icon={<FormatBold />} />
        <ToolbarMark reversed type={MARK_ITALIC} icon={<FormatItalic />} />
        <ToolbarMark
          reversed
          type={MARK_UNDERLINE}
          icon={<FormatUnderlined />}
        />
      </HoveringToolbar>
      <EditablePlugins
        plugins={plugins}
        decorate={decorate}
        onKeyDown={onKeyDown}
        renderLeaf={[renderLeafHighlight()]}
        placeholder="Enter some plain text..."
      />
    </Slate>
  );
};

it('should render', () => {
  const { getAllByTestId } = render(<Editor />);

  expect(getAllByTestId('EditablePlugins').length).toBeGreaterThan(0);
});
