// Extensions
import { History } from './history/index.js';
import { Color } from './color/index.js';
import { FontFamily } from './font-family/index.js';
import { FontSize } from './font-size/index.js';
import { TextAlign } from './text-align/index.js';
import { TextIndent } from './text-indent/index.js';
import { LineHeight } from './line-height/index.js';
import { FormatCommands } from './format-commands/index.js';
import { DropCursor } from './dropcursor/index.js';
import { Gapcursor } from './gapcursor/index.js';
import { Collaboration } from './collaboration/index.js';
import { CollaborationCursor } from './collaboration-cursor/index.js';
import { AiPlugin, AiMark, AiAnimationMark, AiLoaderNode } from './ai/index.js';
import { SlashMenu } from './slash-menu';

// Nodes extensions
import { Document } from './document/index.js';
import { Text } from './text/index.js';
import { RunItem } from './run-item/index.js';
import { BulletList } from './bullet-list/index.js';
import { OrderedList } from './ordered-list/index.js';
import { ListItem } from './list-item/index.js';
import { Paragraph } from './paragraph/index.js';
import { Heading } from './heading/index.js';
import { CommentRangeStart, CommentRangeEnd, CommentReference } from './comment/index.js';
import { TabNode } from './tab/index.js';
import { LineBreak, HardBreak } from './line-break/index.js';
import { Table } from './table/index.js';
import { TableHeader } from './table-header/index.js';
import { TableRow } from './table-row/index.js';
import { TableCell } from './table-cell/index.js';
import { FieldAnnotation, fieldAnnotationHelpers } from './field-annotation/index.js';
import { Image } from './image/index.js';
import { BookmarkStart } from './bookmarks/index.js';
import { Mention } from './mention/index.js';
import { PageNumber, TotalPageCount } from './page-number/index.js';
import { ShapeContainer } from './shape-container/index.js';
import { ShapeTextbox } from './shape-textbox/index.js';
import { ContentBlock } from './content-block/index.js';
import { StructuredContent, DocumentSection } from './structured-content/index.js';
import { BlockNode } from './block-node/index.js';

// Marks extensions
import { TextStyle } from './text-style/text-style.js';
import { Bold } from './bold/index.js';
import { Italic } from './italic/index.js';
import { Underline } from './underline/index.js';
import { Highlight } from './highlight/index.js';
import { Strike } from './strike/index.js';
import { Link } from './link/index.js';
import { TrackInsert, TrackDelete, TrackFormat } from './track-changes/index.js';
import { CommentsMark } from './comment/index.js';
import { TextTransform } from './text-transform/index.js';

// Plugins
import { CommentsPlugin } from './comment/index.js';
import { Placeholder } from './placeholder/index.js';
import { PopoverPlugin } from './popover-plugin/index.js';
import { TrackChanges } from './track-changes/index.js';
import { Pagination } from './pagination/index.js';
import { LinkedStyles } from './linked-styles/linked-styles.js';
import { Search } from './search/index.js';
import { NodeResizer } from './noderesizer/index.js';
import { CustomSelection } from './custom-selection/index.js';

// Helpers
import { trackChangesHelpers } from './track-changes/index.js';

const getRichTextExtensions = () => {
  return [
    Bold,
    BulletList,
    Color,
    Document,
    FontFamily,
    FontSize,
    History,
    Heading,
    Italic,
    ListItem,
    LineHeight,
    Link,
    OrderedList,
    Paragraph,
    Strike,
    Text,
    TextAlign,
    TextIndent,
    TextStyle,
    Underline,
    Placeholder,
    PopoverPlugin,
    Mention,
    Highlight,
    FormatCommands,
    Table,
    TableRow,
    TableCell,
    TableHeader,
    FieldAnnotation,
    DropCursor,
    TrackInsert,
    TrackDelete,
    TrackFormat,
    AiPlugin,
    Image,
    NodeResizer,
    CustomSelection,
  ];
};

const getStarterExtensions = () => {
  return [
    Bold,
    BlockNode,
    BulletList,
    Color,
    CommentRangeStart,
    CommentRangeEnd,
    CommentReference,
    Document,
    FontFamily,
    FontSize,
    History,
    Heading,
    Italic,
    ListItem,
    LineHeight,
    Link,
    OrderedList,
    Paragraph,
    LineBreak,
    HardBreak,
    RunItem,
    SlashMenu,
    Strike,
    TabNode,
    Text,
    TextAlign,
    TextIndent,
    TextStyle,
    Underline,
    FormatCommands,
    CommentsPlugin,
    Gapcursor,
    Table,
    TableRow,
    TableCell,
    TableHeader,
    FieldAnnotation,
    DropCursor,
    Image,
    BookmarkStart,
    Mention,
    Collaboration,
    CollaborationCursor,
    TrackChanges,
    TrackInsert,
    TrackDelete,
    TrackFormat,
    CommentsMark,
    Pagination,
    Highlight,
    LinkedStyles,
    AiPlugin,
    AiMark,
    AiAnimationMark,
    AiLoaderNode,
    PageNumber,
    TotalPageCount,
    ShapeContainer,
    ShapeTextbox,
    ContentBlock,
    Search,
    StructuredContent,
    DocumentSection,
    NodeResizer,
    CustomSelection,
    TextTransform,
  ];
};

export {
  History,
  Heading,
  Document,
  Text,
  RunItem,
  BulletList,
  OrderedList,
  ListItem,
  Paragraph,
  CommentRangeStart,
  CommentRangeEnd,
  CommentReference,
  TabNode,
  LineBreak,
  HardBreak,
  Bold,
  Italic,
  Underline,
  Highlight,
  Strike,
  Color,
  FontFamily,
  FontSize,
  TextAlign,
  TextIndent,
  TextStyle,
  LineHeight,
  FormatCommands,
  CommentsPlugin,
  Gapcursor,
  Table,
  TableRow,
  TableCell,
  TableHeader,
  Placeholder,
  DropCursor,
  BlockNode,
  FieldAnnotation,
  fieldAnnotationHelpers,
  Image,
  BookmarkStart,
  PopoverPlugin,
  Mention,
  Collaboration,
  CollaborationCursor,
  TrackChanges,
  TrackInsert,
  TrackDelete,
  TrackFormat,
  CommentsMark,
  trackChangesHelpers,
  getStarterExtensions,
  getRichTextExtensions,
  AiMark,
  AiAnimationMark,
  AiLoaderNode,
  AiPlugin,
  Search,
  StructuredContent,
  DocumentSection,
  NodeResizer,
  CustomSelection,
  TextTransform,
};
