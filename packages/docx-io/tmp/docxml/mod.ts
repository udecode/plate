// Top-level API
export { Docx as default } from './lib/Docx.ts';

// Classes
export { type AnyComponent as DocxmlComponent } from './lib/classes/src/Component.ts';

// Content components
export {
	Comment,
	type CommentChild,
	type CommentProps,
} from './lib/components/comments/src/Comment.ts';
export {
	CommentRangeEnd,
	type CommentRangeEndChild,
	type CommentRangeEndProps,
} from './lib/components/comments/src/CommentRangeEnd.ts';
export {
	CommentRangeStart,
	type CommentRangeStartChild,
	type CommentRangeStartProps,
} from './lib/components/comments/src/CommentRangeStart.ts';
export {
	BookmarkRangeEnd,
	type BookmarkRangeEndChild,
	type BookmarkRangeEndProps,
} from './lib/components/document/src/BookmarkRangeEnd.ts';
export {
	BookmarkRangeStart,
	type BookmarkRangeStartChild,
	type BookmarkRangeStartProps,
} from './lib/components/document/src/BookmarkRangeStart.ts';
export {
	Break,
	type BreakChild,
	type BreakProps,
} from './lib/components/document/src/Break.ts';
export {
	Cell,
	type CellChild,
	type CellProps,
} from './lib/components/document/src/Cell.ts';
export {
	Field,
	type FieldChild,
	type FieldProps,
} from './lib/components/document/src/Field.ts';

export {
	FieldDefinition,
	FieldNames,
	type FieldDefinitionChild,
	type FieldDefinitionProps,
} from './lib/components/document/src/FieldDefinition.ts';
export {
	FieldRangeEnd,
	type FieldRangeEndChild,
	type FieldRangeEndProps,
} from './lib/components/document/src/FieldRangeEnd.ts';
export {
	FieldRangeInstruction,
	type FieldRangeInstructionChild,
	type FieldRangeInstructionProps,
} from './lib/components/document/src/FieldRangeInstruction.ts';
export {
	FieldRangeSeparator,
	type FieldRangeSeparatorChild,
	type FieldRangeSeparatorProps,
} from './lib/components/document/src/FieldRangeSeparator.ts';
export {
	FieldRangeStart,
	type FieldRangeStartChild,
	type FieldRangeStartProps,
} from './lib/components/document/src/FieldRangeStart.ts';
export {
	FootnoteReference,
	type FootnoteProps,
	type FootnoteReferenceProps,
} from './lib/components/document/src/FootnoteReference.ts';
export {
	Hyperlink,
	type HyperlinkChild,
	type HyperlinkProps,
} from './lib/components/document/src/Hyperlink.ts';
export {
	Image,
	type ImageChild,
	type ImageProps,
} from './lib/components/document/src/Image.ts';
export {
	NonBreakingHyphen,
	type NonBreakingHyphenChild,
	type NonBreakingHyphenProps,
} from './lib/components/document/src/NonBreakingHyphen.ts';
export {
	Paragraph,
	type ParagraphChild,
	type ParagraphProps,
} from './lib/components/document/src/Paragraph.ts';
export {
	Row,
	type RowChild,
	type RowProps,
} from './lib/components/document/src/Row.ts';
export {
	Section,
	type SectionChild,
	type SectionProps,
} from './lib/components/document/src/Section.ts';
export {
	Symbol,
	type SymbolChild,
	type SymbolProps,
} from './lib/components/document/src/Symbol.ts';
export {
	Tab,
	type TabChild,
	type TabProps,
} from './lib/components/document/src/Tab.ts';
export {
	Table,
	type TableChild,
	type TableProps,
} from './lib/components/document/src/Table.ts';
export {
	Text,
	type TextChild,
	type TextProps,
} from './lib/components/document/src/Text.ts';
export {
	WatermarkText,
	type WatermarkTextChild,
	type WatermarkTextProps,
} from './lib/components/document/src/WatermarkText.ts';
export {
	DeletedText,
	type DeletedTextChild,
	type DeletedTextProps,
} from './lib/components/track-changes/src/DeletedText.ts';
export {
	Deletion,
	type DeletionChild,
	type DeletionProps,
} from './lib/components/track-changes/src/Deletion.ts';
export {
	Insertion,
	type InsertionChild,
	type InsertionProps,
} from './lib/components/track-changes/src/Insertion.ts';
export {
	MoveFrom,
	type MoveFromChild,
	type MoveFromProps,
} from './lib/components/track-changes/src/MoveFrom.ts';
export {
	MoveFromRangeEnd,
	type MoveFromRangeEndChild,
	type MoveFromRangeEndProps,
} from './lib/components/track-changes/src/MoveFromRangeEnd.ts';
export {
	MoveFromRangeStart,
	type MoveFromRangeStartChild,
	type MoveFromRangeStartProps,
} from './lib/components/track-changes/src/MoveFromRangeStart.ts';
export {
	MoveTo,
	type MoveToChild,
	type MoveToProps,
} from './lib/components/track-changes/src/MoveTo.ts';
export {
	MoveToRangeEnd,
	type MoveRangeEndChild,
	type MoveToRangeEndProps,
} from './lib/components/track-changes/src/MoveToRangeEnd.ts';
export {
	MoveToRangeStart,
	type MoveToRangeStartChild,
	type MoveToRangeStartProps,
} from './lib/components/track-changes/src/MoveToRangeStart.ts';
export { FileMime } from './lib/enums.ts';

// Shared properties
export {
	type Border,
	type LineBorderType,
} from './lib/properties/src/shared-properties.ts';

// Utility functions
export { RelationshipType } from './lib/enums.ts';
export { hex, int, type Id } from './lib/utilities/src/id.ts';
export { jsx } from './lib/utilities/src/jsx.ts';
export {
	cm,
	emu,
	hpt,
	inch,
	opt,
	pt,
	twip,
	type Length,
} from './lib/utilities/src/length.ts';

// Archive component types
export { type CommentsXml } from './lib/files/src/CommentsXml.ts';
export { type ContentTypesXml } from './lib/files/src/ContentTypesXml.ts';
export {
	CustomPropertyType,
	type CustomPropertiesXml,
} from './lib/files/src/CustomPropertiesXml.ts';
export {
	type DocumentChild,
	type DocumentXml,
} from './lib/files/src/DocumentXml.ts';
export { type FootnotesXml } from './lib/files/src/FootnotesXml.ts';
export {
	type FooterXml,
	type HeaderFooterChild,
	type HeaderXml,
} from './lib/files/src/HeaderFooterXml.ts';
export { type NumberingXml } from './lib/files/src/NumberingXml.ts';
export { type RelationshipsXml } from './lib/files/src/RelationshipsXml.ts';
export { type SettingsXml } from './lib/files/src/SettingsXml.ts';
export { type StylesXml } from './lib/files/src/StylesXml.ts';
export { type ChangeInformation } from './lib/utilities/src/changes.ts';
