/** @jsxRuntime classic */
/** @jsx jsx */
import { ELEMENT_HR, TDescendant } from '@udecode/plate';
import { jsx } from '@udecode/plate-test-utils';
import * as faker from 'faker';
import { initialDataExcalidraw } from './initialDataExcalidraw';
import { createList, getNodesWithRandomId } from './utils';

jsx;

const align: any = (
  <fragment>
    <hh1 align="right">Alignment</hh1>
    <hp align="right">
      This block text is aligned to the right. {faker.lorem.paragraph()}
    </hp>
    <hh2 align="center">Center</hh2>
    <hp align="justify">
      This block text is justified. {faker.lorem.paragraph()}
    </hp>
  </fragment>
);

const indent: any = (
  <fragment>
    <hh1>Changing block indentation</hh1>
    <hp indent={1}>
      Use the toolbar buttons to control the indentation of specific blocks. You
      can use these tools to highlight an important piece of information,
      communicate a hierarchy or just give your content some room.
    </hp>
    <hp indent={2}>
      For instance, this paragraph looks like it belongs to the previous one.
    </hp>
  </fragment>
);

const empty: any = (
  <fragment>
    <hp>
      <htext />
    </hp>
  </fragment>
);

const placeholder: any = (
  <fragment>
    <hh1>
      <htext />
    </hh1>
    <hp>
      <htext />
    </hp>
  </fragment>
);

const horizontalRule: any = (
  <fragment>
    <hp>This is a paragraph.</hp>
    <element type={ELEMENT_HR}>
      <htext />
    </element>
    <hp>And this is another paragraph.</hp>
    <element type={ELEMENT_HR}>
      <htext />
    </element>
    <hp>But between those paragraphs are horizontal rules.</hp>
  </fragment>
);

const mediaEmbed: any = (
  <fragment>
    <hh2>🎥 Media Embed</hh2>
    <hp>
      In addition to simple image nodes, you can actually create complex
      embedded nodes. For example, this one contains an input element that lets
      you change the video being rendered!
    </hp>
    <hmediaembed url="https://player.vimeo.com/video/26689853">
      <htext />
    </hmediaembed>
    <hp>
      Try it out! This editor is built to handle Vimeo embeds, but you could
      handle any type.
    </hp>
  </fragment>
);

const excalidraw: any = (
  <fragment>
    <hh2>🎨 Excalidraw</hh2>
    <hp>Embed Excalidraw within your Slate document!</hp>
    <hexcalidraw {...initialDataExcalidraw}>
      <htext />
    </hexcalidraw>
    <hp>Try it out!</hp>
  </fragment>
);

const forcedLayout: any = (
  <fragment>
    <hh1>
      <htext />
    </hh1>
    <hp>
      This example shows how to enforce your layout with domain-specific
      constraints. This document will always have a title block at the top and a
      trailing paragraph. Try deleting them and see what happens!
    </hp>
    <hp>
      Slate editors can edit complex, nested data structures. And for the most
      part this is great. But in certain cases inconsistencies in the data
      structure can be introduced—most often when allowing a user to paste
      arbitrary richtext content.
    </hp>
    <hp>
      "Normalizing" is how you can ensure that your editor's content is always
      of a certain shape. It's similar to "validating", except instead of just
      determining whether the content is valid or invalid, its job is to fix the
      content to make it valid again.
    </hp>
  </fragment>
);

const balloonToolbar: any = (
  <fragment>
    <hp>
      This example shows how you can make a hovering menu appear above your
      content, which you can use to make text <htext bold>bold</htext>,{' '}
      <htext italic>italic</htext>, or anything else you might want to do!
    </hp>
    <hp>
      Try it out yourself! Just{' '}
      <htext bold>select any piece of text and the menu will appear</htext>.
    </hp>
    <hp>
      You can enable and customize the tooltip on each toolbar button. Check
      Tippy.js documentation for more info!
    </hp>
  </fragment>
);

const image: any = (
  <fragment>
    <hh2>📷 Image</hh2>
    <hp>
      In addition to nodes that contain editable text, you can also create other
      types of nodes, like images or videos.
    </hp>
    <himg url="https://source.unsplash.com/kFrdX5IeQzI" width="75%">
      <htext />
    </himg>
    <hp>
      This example shows images in action. It features two ways to add images.
      You can either add an image via the toolbar icon above, or if you want in
      on a little secret, copy an image URL to your keyboard and paste it
      anywhere in the editor! Additionally, you can customize the toolbar button
      to load an url asynchronously, for example showing a file picker and
      uploading a file to Amazon S3. You can also add a caption and resize the
      image.
    </hp>
  </fragment>
);

const link: any = (
  <fragment>
    <hh2>🔗 Link</hh2>
    <hp>
      In addition to block nodes, you can create inline nodes, like{' '}
      <ha url="https://en.wikipedia.org/wiki/Hypertext">hyperlinks</ha>!
    </hp>
    <hp>
      This example shows hyperlinks in action. It features two ways to add
      links. You can either add a link via the toolbar icon above, or if you
      want in on a little secret, copy a URL to your keyboard and paste it while
      a range of text is selected.
    </hp>
  </fragment>
);

const previewMd: any = (
  <fragment>
    <hh1>👀 Preview Markdown</hh1>
    <hp>
      Slate is flexible enough to add **decorations** that can format text based
      on its content. For example, this editor has **Markdown** preview
      decorations on it, to make it _dead_ simple to make an editor with
      built-in `Markdown` previewing.
    </hp>
    <hp>- List.</hp>
    <hp> Blockquote.</hp>
    <hp>---</hp>
    <hp>## Try it out!</hp>
    <hp>Try it out for yourself!</hp>
  </fragment>
);

const autoformat: any = (
  <fragment>
    <hh1>🏃‍♀️ Autoformat</hh1>
    <hp>
      The editor gives you full control over the logic you can add. For example,
      it's fairly common to want to add markdown-like shortcuts to editors.
    </hp>
    <hp>While typing, try these (mark rules):</hp>
    <hul>
      <hli>
        <hlic>
          Type <htext code>**</htext> or <htext code>__</htext> on either side
          of your text to add **bold* mark.
        </hlic>
      </hli>
      <hli>
        <hlic>
          Type <htext code>*</htext> or <htext code>_</htext> on either side of
          your text to add *italic mark.
        </hlic>
      </hli>
      <hli>
        <hlic>
          Type <htext code>`</htext> on either side of your text to add `inline
          code mark.
        </hlic>
      </hli>
      <hli>
        <hlic>
          Type <htext code>~~</htext> on either side of your text to add
          ~~strikethrough~ mark.
        </hlic>
      </hli>
      <hli>
        <hlic>
          Note that nothing happens when there is a character before, try
          on:*bold
        </hlic>
      </hli>
      <hli>
        <hlic>
          We even support smart quotes, try typing{' '}
          <htext code>"hello" 'world'</htext>.
        </hlic>
      </hli>
    </hul>
    <hp>
      At the beginning of any new block or existing block, try these (block
      rules):
    </hp>
    <hul>
      <hli>
        <hlic>
          Type <htext code>*</htext>, <htext code>-</htext> or{' '}
          <htext code>+</htext> followed by <htext code>space</htext> to create
          a bulleted list.
        </hlic>
      </hli>
      <hli>
        <hlic>
          Type <htext code>1.</htext> or <htext code>1)</htext> followed by{' '}
          <htext code>space</htext> to create a numbered list.
        </hlic>
      </hli>
      <hli>
        <hlic>
          Type <htext code>&gt;</htext> followed by <htext code>space</htext> to
          create a block quote.
        </hlic>
      </hli>
      <hli>
        <hlic>
          Type <htext code>```</htext> to create a code block.
        </hlic>
      </hli>
      <hli>
        <hlic>
          Type <htext code>---</htext> to create a horizontal rule.
        </hlic>
      </hli>
      <hli>
        <hlic>
          Type <htext code>#</htext> followed by <htext code>space</htext> to
          create an H1 heading.
        </hlic>
      </hli>
      <hli>
        <hlic>
          Type <htext code>##</htext> followed by <htext code>space</htext> to
          create an H2 sub-heading.
        </hlic>
      </hli>
      <hli>
        <hlic>
          Type <htext code>###</htext> followed by <htext code>space</htext> to
          create an H3 sub-heading.
        </hlic>
      </hli>
      <hli>
        <hlic>
          Type <htext code>####</htext> followed by <htext code>space</htext> to
          create an H4 sub-heading.
        </hlic>
      </hli>
      <hli>
        <hlic>
          Type <htext code>#####</htext> followed by <htext code>space</htext>{' '}
          to create an H5 sub-heading.
        </hlic>
      </hli>
      <hli>
        <hlic>
          Type <htext code>######</htext> followed by <htext code>space</htext>{' '}
          to create an H6 sub-heading.
        </hlic>
      </hli>
    </hul>
  </fragment>
);

const mentions: any = (
  <fragment>
    <hh2>💬 Mention</hh2>
    <hp>
      This example shows how you might implement a simple @-mentions feature
      that lets users autocomplete mentioning a user by their username. Which,
      in this case means Star Wars characters. The mentions are rendered as void
      inline elements inside the document.
    </hp>
    <hp>
      Try mentioning characters, like{' '}
      <hmention value="R2-D2">
        <htext />
      </hmention>{' '}
      or{' '}
      <hmention value="Mace Windu">
        <htext />
      </hmention>
      !
    </hp>
  </fragment>
);

const pasteHtml: any = (
  <fragment>
    <hh1>🍪 Deserialize HTML</hh1>
    <hp>
      By default, pasting content into a Slate editor will use the clipboard's{' '}
      <htext code>'text/plain'</htext> data. That's okay for some use cases, but
      sometimes you want users to be able to paste in content and have it
      maintain its formatting. To do this, your editor needs to handle{' '}
      <htext code>'text/html'</htext> data.
    </hp>
    <hp>This is an example of doing exactly that!</hp>
    <hp>
      Try it out for yourself! Copy and paste some rendered HTML rich text
      content (not the source code) from another site into this editor and it's
      formatting should be preserved.
    </hp>
  </fragment>
);

const pasteMd: any = (
  <fragment>
    <hh1>🍩 Deserialize Markdown</hh1>
    <hp>
      By default, pasting content into a Slate editor will use the clipboard's{' '}
      <htext code>'text/plain'</htext> data. That's okay for some use cases, but
      sometimes you want users to be able to paste in content and have it
      maintain its formatting. To do this, your editor needs to handle{' '}
      <htext code>'text/html'</htext> data.
    </hp>
    <hp>This is an example of doing exactly that!</hp>
    <hp>
      Try it out for yourself! Copy and paste Markdown content from{' '}
      <ha url="https://markdown-it.github.io/">
        https://markdown-it.github.io/
      </ha>
    </hp>
  </fragment>
);

const pasteAst: any = (
  <fragment>
    <hh2>✍️ Slate AST</hh2>
    <hul>
      <hli>
        <hlic>Bulleted list</hlic>
        <hul>
          <hli>
            <hlic>support</hlic>
            <hul>
              <hli>
                <hlic>a</hlic>
              </hli>
            </hul>
          </hli>
          <hli>
            <hlic>nesting</hlic>
            <hul>
              <hli>
                <hlic>b</hlic>
              </hli>
            </hul>
          </hli>
        </hul>
      </hli>
      <hli>
        <hlic>c</hlic>
      </hli>
    </hul>
    <hp>
      This example shows how you can handle copy/paste by handling slate ast
      trees.
    </hp>
  </fragment>
);

const plainText: any = (
  <fragment>
    <hp>
      This is editable plain text with react and history plugins, just like a
      textarea!
    </hp>
  </fragment>
);

const pasteCSV: any = (
  <fragment>
    <hp>
      This example shows how pasting from csv can get parsed into a table. Grab
      a CSV source and paste it below.
    </hp>
  </fragment>
);

const basicMarks: any = (
  <fragment>
    <hh1>💅 Marks</hh1>
    <hh2>💧 Basic Marks</hh2>
    <hp>
      The basic marks consist of text formatting such as bold, italic,
      underline, strikethrough, subscript, superscript, and code.
    </hp>
    <hp>
      You can customize the type, the component and the hotkey for each of
      these.
    </hp>
    <hp>
      <htext bold>This text is bold.</htext>
    </hp>
    <hp>
      <htext italic>This text is italic.</htext>
    </hp>
    <hp>
      <htext underline>This text is underlined.</htext>
    </hp>
    <hp>
      <htext bold italic underline>
        This text is bold, italic and underlined.
      </htext>
    </hp>
    <hp>
      <htext strikethrough>This is a strikethrough text.</htext>
    </hp>
    <hp>
      <htext code>This is an inline code.</htext>
    </hp>
  </fragment>
);

const font: any = (
  <fragment>
    <hp>
      <htext color="white" backgroundColor="black" fontSize="30px">
        This text has white color, black background and a custom font size.
      </htext>
    </hp>
    <hp>
      <htext color="grey" backgroundColor="green">
        This text has a custom color used for text and background.
      </htext>
    </hp>
    <hp>
      This text has <htext backgroundColor="#dc3735"> </htext>
      <htext color="white" backgroundColor="#df4538">
        m
      </htext>
      <htext color="white" backgroundColor="#e2533a">
        u
      </htext>
      <htext color="white" backgroundColor="#e6603d">
        l
      </htext>
      <htext color="white" backgroundColor="#e96f40">
        t
      </htext>
      <htext color="white" backgroundColor="#ec7d43">
        i
      </htext>
      <htext color="white" backgroundColor="#ef8a45">
        p
      </htext>
      <htext color="white" backgroundColor="#f29948">
        l
      </htext>
      <htext color="white" backgroundColor="#f5a74b">
        e
      </htext>
      <htext backgroundColor="#f9b44e"> </htext>
      <htext color="#ff0000">f</htext>
      <htext color="#ff3333">o</htext>
      <htext color="#ff6666">n</htext>
      <htext color="#ff9999">t</htext>
      <htext> </htext>
      <htext color="#ffcccc">c</htext>
      <htext color="#ffcccc">o</htext>
      <htext color="#ccffcc">l</htext>
      <htext color="#99ff99">o</htext>
      <htext color="#66ff66">r</htext>
      <htext color="#33ff33">s</htext>
      and <htext backgroundColor="#a58ce1">font</htext>{' '}
      <htext backgroundColor="#99cc62">background</htext>{' '}
      <htext backgroundColor="#e45260">colors</htext>.
    </hp>
    <hp>
      <htext bold italic underline color="#f92672">
        This text is bold, italic, underlined and colored.
      </htext>
    </hp>
  </fragment>
);

const kbd: any = (
  <fragment>
    <hp>
      Press <htext kbd>⌘+B</htext> to mark selected text bold or{' '}
      <htext kbd>⌘+I</htext> to mark it italic.
    </hp>
  </fragment>
);

const marks = [...basicMarks, ...kbd];

const highlight: any = (
  <fragment>
    <hh2>🌈 Highlight</hh2>
    <hp>
      The Highlight plugin enables support for{' '}
      <htext highlight>highlights</htext> , useful when reviewing content or
      highlighting it for future reference.
    </hp>
  </fragment>
);

const basicElements: any = (
  <fragment>
    <hh1>🧱 Elements</hh1>
    <hh2>🔥 Basic Elements</hh2>
    <hp>These are the most common elements, known as blocks:</hp>
    <hh1>Heading 1</hh1>
    <hh2>Heading 2</hh2>
    <hh3>Heading 3</hh3>
    <hh4>Heading 4</hh4>
    <hh5>Heading 5</hh5>
    <hh6>Heading 6</hh6>
    <hblockquote>Blockquote</hblockquote>
    <hcodeblock lang="javascript">
      <hcodeline>const a = 'Hello';</hcodeline>
      <hcodeline>const b = 'World';</hcodeline>
    </hcodeblock>
  </fragment>
);

const list: any = (
  <fragment>
    <hh2>✍️ List</hh2>
    <hp>
      <htext />
    </hp>
    <hul>
      <hli>
        <hlic>Bulleted list</hlic>
        <hul>
          <hli>
            <hlic>support</hlic>
            <hul>
              <hli>
                <hlic>a</hlic>
              </hli>
            </hul>
          </hli>
          <hli>
            <hlic>nesting</hlic>
            <hul>
              <hli>
                <hlic>b</hlic>
              </hli>
            </hul>
          </hli>
        </hul>
      </hli>
      <hli>
        <hlic>c</hlic>
      </hli>
    </hul>
    <hol>
      <hli>
        <hlic>Numbered list'</hlic>
      </hli>
    </hol>
    <hp>
      With Slate you can build complex block types that have their own embedded
      content and behaviors, like rendering checkboxes inside check list items!
    </hp>
    <htodoli checked>Slide to the left.</htodoli>
    <htodoli checked>Slide to the right.</htodoli>
    <htodoli>Criss-cross.</htodoli>
    <htodoli checked>Criss-cross.</htodoli>
    <htodoli>Cha cha real smooth…</htodoli>
    <htodoli>Let's go to work!</htodoli>
    <hp>Try it out for yourself!</hp>
  </fragment>
);

const findReplace: any = (
  <fragment>
    <hp>
      This is editable text that you can search. As you search, it looks for
      matching strings of text, and adds <htext bold>decorations</htext> to them
      in realtime.
    </hp>
    <hp>Try it out for yourself by typing in the search box above!</hp>
  </fragment>
);

const createTable = (): any => (
  <fragment>
    <htable>
      <htr>
        <htd>
          <hp>
            <htext />
          </hp>
        </htd>
        <htd>
          <hp>
            <htext bold>Human</htext>
          </hp>
        </htd>
        <htd>
          <hp>
            <htext bold>Dog</htext>
          </hp>
        </htd>
        <htd>
          <hp>
            <htext bold>Cat</htext>
          </hp>
        </htd>
      </htr>
      <htr>
        <htd>
          <hp>
            <htext bold># of Feet</htext>
          </hp>
        </htd>
        <htd>
          <hp>2</hp>
        </htd>
        <htd>
          <hp>4</hp>
        </htd>
        <htd>
          <hp>4</hp>
        </htd>
      </htr>
      <htr>
        <htd>
          <hp>
            <htext bold># of Lives</htext>
          </hp>
        </htd>
        <htd>
          <hp>1</hp>
        </htd>
        <htd>
          <hp>1</hp>
        </htd>
        <htd>
          <hp>9</hp>
        </htd>
      </htr>
    </htable>
  </fragment>
);

const createSpanningTable = (): any => (
  <fragment>
    <htable>
      <htr>
        <hth attributes={{ colspan: '2' }}>
          <hp>
            <htext bold>Heading</htext>
          </hp>
        </hth>
      </htr>
      <htr>
        <htd>
          <hp>
            <htext bold>Cell 1</htext>
          </hp>
        </htd>
        <htd>
          <hp>Cell 2</hp>
        </htd>
      </htr>
    </htable>
  </fragment>
);

const table: any = (
  <fragment>
    <hh2>🏓 Table</hh2>
    <hp>
      Since the editor is based on a recursive tree model, similar to an HTML
      document, you can create complex nested structures, like tables:
    </hp>
    {createTable()}
    <hp>
      This table is just a basic example of rendering a table, and it doesn't
      have fancy functionality. But you could augment it to add support for
      navigating with arrow keys, displaying table headers, adding column and
      rows, or even formulas if you wanted to get really crazy!
    </hp>
    {createSpanningTable()}
    <hp>
      This table is an example of rendering a table spanning multiple columns.
    </hp>
  </fragment>
);

const softBreak: any = (
  <fragment>
    <hh1>🍦 Soft Break ⇧⏎</hh1>
    <hp>You can define a set of rules with:</hp>
    {createList([
      'hotkey – e.g. press ⇧⏎ anywhere to insert a soft break 👇',
      'query – filter the block types where the rule applies, e.g. pressing ⏎ will insert a soft break only inside block quotes and code blocks.',
    ])}
    <hblockquote>Try here ⏎</hblockquote>
    <hcodeblock>
      <hcodeline>And ⏎ here.</hcodeline>
    </hcodeblock>
  </fragment>
);

const singleLine: any = (
  <fragment>
    <hp>You cannot type or paste text with multiple lines.</hp>
  </fragment>
);

const exitBreak: any = (
  <fragment>
    <hh1>⏎ Exit Break ⏎</hh1>
    <hp>You can define a set of rules with:</hp>
    {createList([
      'hotkey – e.g. press ⌘⏎ to exit to the next block 👇',
      'query – Filter the block types where the rule applies.',
      'level – Path level where the exit is.',
      'before – If true, exit to the previous block. e.g. press ⇧⌘⏎ to exit before the selected block 👆',
    ])}
    <hblockquote>Try here ⌘⏎</hblockquote>
    <hcodeblock>
      <hcodeline>And in the middle ⌘⏎ of the block.</hcodeline>
    </hcodeblock>
    <hp>It also works for nested blocks:</hp>
    {createTable()}
  </fragment>
);

const editableVoids: any = (
  <fragment>
    <hp>
      In addition to nodes that contain editable text, you can insert void
      nodes, which can also contain editable elements, inputs, or an entire
      other Slate editor.
    </hp>
    <element type="editable-void">
      <htext />
    </element>
    <hp>
      <htext />
    </hp>
  </fragment>
);

const iframe: any = (
  <fragment>
    <hp>
      In this example, the document gets rendered into a controlled{' '}
      <htext code>iframe</htext>. This is <htext italic>particularly</htext>{' '}
      useful, when you need to separate the styles for your editor contents from
      the ones addressing your UI.
    </hp>
    <hp>
      This also the only reliable method to preview any{' '}
      <htext bold>media queries</htext> in your CSS.
    </hp>
  </fragment>
);

const HEADINGS = 100;
const PARAGRAPHS = 7;

const createHugeDocument = () => {
  const hugeDocument: TDescendant[] = [];

  for (let h = 0; h < HEADINGS; h++) {
    hugeDocument.push(<hh1>{faker.lorem.sentence()}</hh1>);

    for (let p = 0; p < PARAGRAPHS; p++) {
      hugeDocument.push(<hp>{faker.lorem.paragraph()}</hp>);
    }
  }

  return hugeDocument;
};

const basicNodes = [...basicElements, ...basicMarks];

const playground: any = getNodesWithRandomId([
  ...forcedLayout,
  ...basicMarks,
  ...font,
  ...highlight,
  ...basicElements,
  ...horizontalRule,
  ...align,
  ...indent,
  ...list,
  ...table,
  ...link,
  ...mentions,
  ...image,
  ...mediaEmbed,
  ...excalidraw,
  ...autoformat,
  ...softBreak,
  ...exitBreak,
  ...pasteHtml,
  ...pasteMd,
  ...pasteCSV,
  ...pasteAst,
]);

export const VALUES: Record<string, any> = {
  autoformat,
  balloonToolbar,
  basicElements,
  basicMarks,
  basicNodes,
  createHugeDocument,
  createSpanningTable,
  createTable,
  editableVoids,
  empty,
  excalidraw,
  exitBreak,
  findReplace,
  font,
  forcedLayout,
  highlight,
  horizontalRule,
  iframe,
  image,
  indent,
  kbd,
  link,
  list,
  marks,
  mediaEmbed,
  mentions,
  pasteAst,
  pasteCSV,
  pasteHtml,
  pasteMd,
  placeholder,
  plainText,
  playground,
  previewMd,
  singleLine,
  softBreak,
  table,
  align,
};
