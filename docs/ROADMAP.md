## Roadmap

Here is the roadmap to have a complete rich-text editor.

### Elements

- [ ] BasicElements – Enables support for basic elements.
  - [x] Blockquote – Enables support for inserting block quote, useful
        for quotations and passages.
  - [x] CodeBlock – Enables support for inserting pre-formatted code
        blocks.
    - [ ] Code highlighter – use [Prism](https://prismjs.com/).
  - [x] Heading – Enables support for inserting headings with
        configurable heading levels (from 1 to 6).
- [ ] HorizontalLine – Enables support for inserting dividers, useful
      for separating and grouping document sections.
- [x] Image – Enables support for inserting, editing and deleting
      images.
  - [ ] ImageCaption – Allows for adding captions to images to give
        additional context.
  - [ ] ImageResize – Allows for resizing images using handles.
  - [ ] ImageStyle – Allows for using configurable styles to display the
        images, for example, as a full width image or side image.
  - [ ] ImageToolbar – Allows for using a contextual toolbar for images.
        It appears when an image is selected and can be configured to
        contain buttons for features such as the text alternative or
        image styles.
  - [ ] ImageUpload – Allows for pasting images from clipboard, dragging
        and dropping images, selecting them through a file system
        dialog.
    - [x] Pasting images from clipboard
    - [ ] Drag and drop
    - [ ] File system dialog
    - [ ] Balloon to insert
- [ ] Link – Enables support for inserting, editing and deleting
      hyperlinks.
  - [x] Insert links from clipboard
  - [x] Override links from clipboard
  - [ ] [Link balloon](https://github.com/zbeyens/slate-plugins-next/issues/103)
- [x] List – Enables support for inserting bulleted, numbered and to-do
      lists.
  - [x] TodoList – Enables support for inserting a list of interactive
        checkboxes with labels. It supports all features of regular
        lists so you can nest a to-do list together with bulleted and
        numbered lists in any combination.
    - [ ] Reuse ActionItem in a list format
- [x] MediaEmbed – Enables support for inserting embeddable media such
      as YouTube or Vimeo videos, Instagram posts and tweets or Google
      Maps.
  - [ ] MediaEmbedToolbar – Implements an optional toolbar for media
        embed that shows up when the media element is selected.
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
- [ ] PageBreak – Enables support for inserting a page break so you can
      structure your content better for printing.
- [x] Table – Enables support for inserting, editing and deleting
      tables.
  - [ ] TableCellProperties – Allows for styling individual table cells.
  - [ ] TableProperties – Allows for styling entire tables.
  - [ ] TableToolbar – Creates configurable toolbars showing up when the
        table element is selected.
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
  - [ ] FontBackgroundColor – Enables support for setting the font
        background color with a configurable color palette panel.
  - [ ] FontColor – Enables support for setting the font color with a
        configurable color palette panel.
  - [ ] FontSize – Enables support for setting the font size.
  - [ ] FontFamily – Enables support for setting the font family.
- [ ] Highlight – Enables support for setting highlights, useful when
      reviewing content or highlighting it for future reference.
  - [x] Highlight leaf
  - [ ] Insert highlight
  - [ ] Remove highlight
  - [ ] Configurable color palette panel


### Deserializers

- [x] DeserializerHtml – Enables support for deserializing content from
      HTML format to Slate format.
- [x] DeserializerMarkdown – Enables support for deserializing content
      from Markdown format to Slate format.
- [ ] DeserializerOffice – Enables support for deserializing content
      from Microsoft Office or Google Docs format to Slate format.

### Normalizers & Handlers

- [ ] Autoformat – Enables support for a set of predefined
      autoformatting actions.
  - [x] ElementAutoFormat – Enables support for autoformatting text to
        insert elements.
    - [ ] rename `withShortcuts` to `withBlockAutoformat`
    - [ ] Code block: start a line with ```
  - [x] MarkAutoFormat – Enables support for autoformatting text to set
        marks.
    - [ ] Strikethrough – Type `~~text~~`
    - [ ] Remove the special characters when inline formatting. E.g.
          `**text**` would be replaced by `text` in bold
  - [ ] Combine `withBlockAutoformat` with MarkdownPreviewPlugin
- [x] NormalizeTypes – Enables support for defining type rules for
      specific locations in the document. For example, it can help to
      ensure that there will always be a single title field at the
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

### Queries

- [ ] WordCount – Provides the number of words and characters written in
      the editor.

### Transforms

- [ ] Alignment – Enables support for text alignment, useful to align
      your content to left, right and center or to justify it.
- [ ] Emoji – Enables support for inserting emojis via a dropdown.
- [ ] Indent – Enables support for indenting block elements including
      lists.
  - [ ] IndentBlock – Enables support for indenting block elements
        excluding lists.
- [ ] RemoveFormat – Enables support for removing all the marks in the
      selection.
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
  - [ ] SpecialCharacterLatin – Adds the Latin category and signs to the
        special characters feature.
  - [ ] SpecialCharacterMath – Adds the mathematical category and signs
        to the special characters feature.
  - [ ] SpecialCharacterText – Adds the text category and signs to the
        special characters feature.


### Widgets

- [ ] [Autosave](https://github.com/zbeyens/slate-plugins-next/issues/88)
      – Enables support for saving the editor value in a storage when
      needed, for example, when the user changed the content.
- [ ] Comments – Enables support for commenting element and text nodes.
  - [ ] Text comments
  - [ ] Element comments
- [ ] RTCEditing – Enables support for real-time collaboration. It
      allows for editing the same document by multiple users at the same
      time. It also shows the selection of other users in real time and
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

