## Roadmap

Here is our roadmap to have a complete rich-text editor.

### Editors

- [x] Classic Editor – Editor with a toolbar placed at a specific
      position on the page.
- [ ] Inline Editor – Editor with a floating toolbar that appears when
      the editable text is focused.
- [ ] Balloon Block Editor – Editor with a balloon toolbar for the marks
      and inline elements, and a block toolbar for the block elements.
- [x] Balloon Editor – Editor with a balloon toolbar appearing when
      selecting.

### Elements

- [x] Common configuration
  - [x] `typeX` – Type of the element node where `X` represents the
        element.
  - [x] `component` – React component to render the element.
- [x] [Alignment](https://github.com/udecode/plate/issues/104)
      – Enables support for text alignment, useful to align your content
      to left, right and center it.
- [x] BasicElements – Enables support for basic elements.
  - [x] Blockquote – Enables support for block quotes, useful for
        quotations and passages.
  - [x] CodeBlock – Enables support for pre-formatted code blocks.
    - [ ] Code highlighter – use [Prism](https://prismjs.com/).
  - [x] Heading – Enables support for headings with configurable levels
        (from 1 to 6).
  - [x] Paragraph – Enables support for paragraphs.
- [ ] Emoji – Enables support for inserting emoji characters by typing
      identifiers based on Unicode Short Names preceded by a colon (`:`)
      and selecting the suggestion.
  - [ ] Insert via a dropdown
- [ ] HorizontalLine – Enables support for dividers, useful for
      separating and grouping document sections.
- [x] Image – Enables support for images.
  - [ ] ImageCaption – Allows for adding captions to images to give
        additional context.
  - [ ] ImageResize – Allows for resizing images using handles.
  - [ ] ImageStyle – Allows for using configurable styles to display the
        images, for example, as a full width image or side image.
  - [ ] ImageToolbar – Allows for using a contextual toolbar for images.
        It appears when an image is selected and can be configured to
        contain buttons for features such as the text alternative or
        image styles.
  - [x] ImageUpload – Allows for pasting images from clipboard, dragging
        and dropping images, selecting them through a file system
        dialog.
    - [x] Pasting images from clipboard.
    - [ ] Drag and drop.
    - [ ] File system dialog.
    - [ ] Balloon to insert.
- [ ] Indent – Enables support for indenting block elements including
      lists.
  - [ ] IndentBlock – Enables support for indenting block elements
        excluding lists.
- [x] Link – Enables support for hyperlinks.
  - [x] Insert/update links from text.
  - [x] Insert/update links from clipboard.
  - [ ] [Balloon](https://github.com/udecode/plate/issues/103)
        to edit and delete.
  - [ ] Hotkey
- [x] List – Enables support for bulleted, numbered and to-do lists.
  - [ ] TodoList – Enables support for lists of interactive checkboxes
        with labels. It supports all features of regular lists so you
        can nest a to-do list together with bulleted and numbered lists
        in any combination.
    - [ ] Supports all features of regular lists by reusing ActionItem.
- [x] MediaEmbed – Enables support for embeddable media such as YouTube
      or Vimeo videos, Instagram posts and tweets or Google Maps.
  - [x] MediaEmbedToolbar – Provides an optional toolbar for media embed
        that shows up when the media element is selected.
  - [x] Insert videos
  - [ ] Balloon to insert, edit, delete
  - [ ] Paste the media URL to insert the element
  - [x] YouTube
  - [x] Vimeo
  - [ ] Spotify
  - [ ] Instagram
  - [ ] Twitter
  - [ ] Google Maps
- [x] Mention – Enables support for autocompleting @mentions and #tags.
      When typing a configurable marker, such as @ or #, a select
      component appears with autocompleted suggestions.
  - [x] Configurable marker
  - [x] Configurable style for `MentionSelect`
  - [ ] Configurable component for `MentionSelect` items
  - [ ] Configurable `onClick`
  - [ ] Configurable direction (top or bottom)
- [ ] PageBreak – Enables support for page breaks so you can structure
      your content better for printing.
- [x] Table – Enables support for tables.
  - [ ] TableCellProperties – Allows for styling individual table cells.
  - [ ] TableProperties – Allows for styling entire tables.
  - [ ] [TableToolbar](https://github.com/udecode/plate/issues/69) – Provides a configurable toolbar showing up when
        the table element is selected.
  - [x] Insert table
  - [x] Add/delete rows and columns

### Marks

- [x] BasicMarks – Enables support for basic text formatting.
  - [x] Bold – Enables support for bold formatting.
  - [x] Code – Enables support for inline code formatting.
  - [x] Italic – Enables support for italic formatting.
  - [x] Strikethrough – Enables support for strikethrough formatting.
  - [x] Subscript – Enables support for subscript formatting.
  - [x] Superscript – Enables support for superscript formatting.
  - [x] Underline – Enables support for underline formatting.
- [ ] Font – Enables support for font formatting.
  - [ ] FontBackgroundColor – Enables support for font background colors
        with a configurable color palette panel.
  - [ ] FontColor – Enables support for font colors with a configurable
        color palette panel.
  - [ ] FontSize – Enables support for font sizes.
  - [ ] FontFamily – Enables support for font families.
- [x] Highlight – Enables support for highlights, useful when reviewing
      content or highlighting it for future reference.
  - [ ] Insert highlight
  - [ ] Remove highlight
  - [ ] Configurable color palette panel
- [ ] RemoveMark – Enables support for removing all the marks in the
      selection.

### Deserializers

- [x] DeserializeHtml – Enables support for deserializing content from
      HTML format to Slate format.
- [x] DeserializeMarkdown – Enables support for deserializing content
      from Markdown format to Slate format.
- [ ] DeserializeOffice – Enables support for deserializing content from
      Microsoft Office or Google Docs format to Slate format.

### Serializers

- [x] [SerializeHtml](https://github.com/udecode/plate/issues/61)
      – Enables support for serializing content from Slate format to
      HTML format.
- [ ] [SerializeMarkdown](https://github.com/udecode/plate/issues/149)
      – Enables support for serializing content from Slate format to
      Markdown format.
- [ ] SerializeOffice – Enables support for serializing content from
      Slate format to Microsoft Office or Google Docs format.


### Normalizers

- [x] NormalizeTypes – Enables support for defining type rules for
      specific locations in the document. For example, it can help to
      ensure that there will always be a single title property at the
      beginning of the document.
- [ ] RestrictedEditing – Enables support for defining which parts of a
      document can be editable for users with more restricted editing
      rights. It allows you to edit only within the created restricted
      area.
- [ ] Snippets – Enables support for autocorrection. It automatically
      turns predefined snippets into their typographically improved
      forms. For example, (tm) becomes ™ and 1/2 becomes ½.
- [x] TrailingNode – Enables support for inserting a trailing node of a
      configurable type when the type of the last node is not matching
      at a configurable depth.

### Handlers

- [x] Autoformat – Enables support for autoformatting actions.
  - [x] Block formatting.
    - [x] Configurable markup to trigger the autoformatting.
    - [x] Configurable character to trigger the autoformatting.
    - [x] Configurable option to enable autoformatting in the middle of a block by inserting a block instead of updating.
  - [x] Inline formatting.
    - [x] Configurable option to enable inline formatting.
- [x] SoftBreak – Enables support for inserting soft breaks.

### Decorators

- [x] Preview – Enables support for previewing.

### Toolbar

- [x] BalloonToolbar – Provides a toolbar, pointing at a particular
      element or range.
- [ ] BlockToolbar – Provides an additional configurable toolbar on the
      left-hand side of the content area (the gutter). The toolbar is
      represented by a button with an icon. It is positioned next to the
      block element (e.g. a paragraph) where the anchor is, following
      the caret as the user edits the content and navigates the
      document.
- [x] HeadingToolbar – Provides a heading toolbar.
- [x] Toolbar – Provides a toolbar.
- [ ] ToolbarMenu – Provides a toolbar button that opens a menu of other toolbar buttons.

### Utilities

- [x] NodeID – Enables support for inserting nodes with an id key.

### Widgets

- [x] SearchHighlight – Enables support for highlighting searching text.
- [ ] SpecialCharacter – Enables support for inserting special
      characters via a dropdown. Add plugins like special characters
      essentials or special characters currency to fill it with some
      signs.
  - [ ] SpecialCharacterEssential – Adds a basic set with the most
        popular signs to the special characters feature.
  - [ ] SpecialCharacterArrow – Adds the arrows category and signs to
        the special characters feature.
  - [ ] SpecialCharacterCurrency – Adds the currency category and signs
        to the special characters feature.
  - [ ] SpecialCharacterLa - [] SpecialCharacter – Enables support for
        inserting special characters via a dropdown. Add plugins like
        special characters essentials or special characters currency to
        fill it with some signs.
  - [ ] SpecialCharacterEssential – Adds a basic set with the most
        popular signs to the special characters feature.
  - [ ] SpecialCharacterArrow – Adds the arrows category and signs to
        the special characters feature.
  - [ ] SpecialCharacterCurrency – Adds the currency category and signs
        to the special characters feature.
  - [ ] SpecialCharacterLatin – Adds the Latin category and signs to the
        special characters feature.
  - [ ] SpecialCharacterMath – Adds the mathematical category and signs
        to the special characters feature.
  - [ ] SpecialCharacterText – Adds the text category and signs to the
        special characters feature.tin – Adds the Latin category and
        signs to the special characters feature.
  - [ ] SpecialCharacterMath – Adds the mathematical category and signs
        to the special characters feature.
  - [ ] SpecialCharacterText – Adds the text category and signs to the
        special characters feature.
- [ ] WordCount – Provides the number of words and characters written in
      the editor.

### Storage

- [ ] [Autosave](https://github.com/udecode/plate/issues/88)
      – Enables support for saving the editor value in a storage when
      needed, for example, when the user changed the content.

### Collaboration

- [ ] Comments – Enables support for commenting element and text nodes.
  - [ ] Text comments
  - [ ] Element comments
- [ ] RTC – Enables support for real-time collaboration. It allows for
      editing the same document by multiple users at the same time. It
      also shows the selection of other users in real time and
      automatically solves all conflicts.
  - [ ] RTCPresenceList – Enables support for displaying all users that
        are currently connected to the edited document in real-time
        collaboration. The users are displayed as a row of avatars.
  - [ ] RTCComments – Enables support for commenting element and text
        nodes, replying to comments, and creating discussion threads
        with multiple users in real-time collaboration.
  - [ ] RTCTrackChanges – Enables support for making content suggestions
        with multiple users in real-time collaboration.
- [ ] TrackChanges – Enables the track changes mode (aka “suggestion
      mode”). In this mode, changes are marked in the content and shown
      as suggestions that can be accepted or discarded by the users.

