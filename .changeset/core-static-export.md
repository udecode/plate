---
"@platejs/core": major
---

Added `/static` export path for React-free static rendering functionality. Static rendering components and utilities are now available via `@platejs/core/static` import.

**New Features:**
- Moved static rendering functionality from `lib/static` to root `static` directory
- Added dedicated `/static` export path in package.json
- Enables React-free usage of static rendering features

**Migration**
To migrate, update your imports from `'@platejs/core'` to `'@platejs/core/static'` for all static rendering features listed below.
If you are importing from `platejs` (not `@platejs/core`), change your imports to `platejs/static`.

Core Rendering:
- `pipeRenderElementStatic` - Pipeline for rendering elements statically
- `pluginRenderElementStatic` - Plugin-based element rendering
- `pipeRenderLeafStatic` - Pipeline for rendering leaf nodes statically
- `pluginRenderLeafStatic` - Plugin-based leaf rendering
- `pipeRenderTextStatic` - Pipeline for rendering text nodes statically
- `pluginRenderTextStatic` - Plugin-based text rendering
- `serializeHtml` - Serialize editor content to HTML string

Components:
- `PlateStatic` - Main static editor component
- `SlateElement` - Static element component
- `SlateText` - Static text component
- `SlateLeaf` - Static leaf component
- `ElementStatic` - Memoized element component
- `LeafStatic` - Memoized leaf component

Editor Creation:
- `createStaticEditor` - Create static editor instance
- `withStatic` - Static editor wrapper

Plugins:
- `ViewPlugin` - View plugin for static rendering
- `getStaticPlugins` - Get all static plugins

Utilities:
- `createStaticString` - Create static string element
- `getNodeDataAttributes` - Get data attributes for nodes
- `getPluginDataAttributes` - Get data attributes for plugins
- `getRenderNodeStaticProps` - Get render props for nodes
- `getSelectedDomBlocks` - Get selected DOM blocks (deprecated)
- `getSelectedDomFragment` - Get selected DOM fragment
- `getSelectedDomNode` - Get selected DOM node
- `isSelectOutside` - Check if selection is outside editor
- `pipeDecorate` - Pipeline for decorations
- `stripHtmlClassNames` - Remove HTML class names
- `stripSlateDataAttributes` - Remove Slate data attributes

Deserialization:
- `isSlateVoid` - Check if element is void
- `isSlateElement` - Check if element is Slate element
- `isSlateText` - Check if element is Slate text
- `isSlateString` - Check if element is Slate string
- `isSlateLeaf` - Check if element is Slate leaf
- `isSlateEditor` - Check if element is Slate editor
- `isSlateNode` - Check if element is Slate node
- `isSlatePluginElement` - Check if element is plugin element
- `isSlatePluginNode` - Check if element is plugin node
- `getSlateElements` - Get all Slate elements
- `getEditorDOMFromHtmlString` - Convert HTML string to DOM

Types:
- `PlateStaticProps` - Props for PlateStatic component
- `SerializeHtmlOptions` - Options for serializeHtml
- `BoxStaticProps` - Props for static box component
- `SlateRenderElementProps` - Props for element rendering
- `SlateRenderLeafProps` - Props for leaf rendering
- `SlateRenderNodeProps` - Props for node rendering
- `SlateRenderTextProps` - Props for text rendering
- `SlateElementProps` - Props for SlateElement
- `SlateTextProps` - Props for SlateText
- `SlateLeafProps` - Props for SlateLeaf
- `SlateHTMLProps` - HTML props for static components
- `StyledSlateElementProps` - Styled element props
- `StyledSlateTextProps` - Styled text props
- `StyledSlateLeafProps` - Styled leaf props
- `SlateRenderElement` - Render element function type
- `SlateRenderLeaf` - Render leaf function type
- `SlateRenderText` - Render text function type

