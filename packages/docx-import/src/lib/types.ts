import type { TNode } from 'platejs';

/** Comment extracted from DOCX file */
export type DocxComment = {
  /** Comment ID from the DOCX file */
  id: string;
  /** Comment text content */
  text: string;
};

/** Result of importing a DOCX file */
export type ImportDocxResult = {
  /** Deserialized editor nodes */
  nodes: TNode[];
  /** Comments extracted from the DOCX file (not yet applied to editor) */
  comments: DocxComment[];
  /** Warnings from mammoth conversion */
  warnings: string[];
};

/** Options for importing a DOCX file */
export type ImportDocxOptions = {
  /** RTF data for image extraction (optional) */
  rtf?: string;
};

/** Result of importing HTML */
export type ImportHtmlResult = {
  /** Deserialized editor nodes */
  nodes: TNode[];
};

/** Result of importing Markdown */
export type ImportMarkdownResult = {
  /** Deserialized editor nodes */
  nodes: TNode[];
};
