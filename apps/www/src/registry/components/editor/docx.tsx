'use client';

import {
  DocxExportPlugin,
  DocxImportPlugin,
  DocxPastePlugin,
} from 'platejs/docx';
import { JuicePlugin } from 'platejs/juice';

export const DocxKit = [
  JuicePlugin,
  DocxPastePlugin,
  DocxImportPlugin,
  DocxExportPlugin,
] as const;
