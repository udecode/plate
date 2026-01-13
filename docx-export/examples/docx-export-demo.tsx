'use client';

import {
  type DocxExportOrientation,
  DocxExportPlugin,
  exportEditorToDocx,
} from '@platejs/docx-export';
import { FileTextIcon } from 'lucide-react';
import { createPlateEditor, Plate } from 'platejs/react';
import type React from 'react';
import { useMemo, useState } from 'react';

// Example editor value with various formatting
const demoValue = [
  {
    type: 'h1',
    children: [{ text: 'Document Title' }],
  },
  {
    type: 'p',
    children: [
      { text: 'This is a ' },
      { text: 'bold', bold: true },
      { text: ' and ' },
      { text: 'italic', italic: true },
      { text: ' text example.' },
    ],
  },
  {
    type: 'h2',
    children: [{ text: 'Features' }],
  },
  {
    type: 'ul',
    children: [
      {
        type: 'li',
        children: [{ text: 'Export to DOCX format' }],
      },
      {
        type: 'li',
        children: [{ text: 'Supports rich text formatting' }],
      },
      {
        type: 'li',
        children: [{ text: 'Works entirely in the browser' }],
      },
    ],
  },
  {
    type: 'blockquote',
    children: [
      {
        type: 'p',
        children: [
          {
            text: 'This is a blockquote that will be styled in the exported document.',
          },
        ],
      },
    ],
  },
  {
    type: 'p',
    children: [
      { text: 'Visit ' },
      {
        type: 'a',
        url: 'https://platejs.org',
        children: [{ text: 'Plate.js' }],
      },
      { text: ' for more information.' },
    ],
  },
];

export default function DocxExportDemo() {
  const editor = useMemo(
    () =>
      createPlateEditor({
        plugins: [DocxExportPlugin],
        value: demoValue,
      }),
    []
  );

  return (
    <div className="relative">
      <Plate editor={editor}>
        <ExportDialog className="absolute top-4 right-4 z-10" />

        <div className="rounded-lg border bg-background p-4">
          {/* Your editor component here */}
          <div className="prose min-h-[300px] max-w-none">
            {/* Editor content would be rendered here */}
          </div>
        </div>
      </Plate>
    </div>
  );
}

interface ExportDialogProps {
  className?: string;
}

export function ExportDialog({ className }: ExportDialogProps) {
  const [orientation, setOrientation] =
    useState<DocxExportOrientation>('portrait');
  const [filename, setFilename] = useState('document');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Get the editor value from the Plate context
      // In a real app, you'd use: const editor = useEditorRef();
      await exportEditorToDocx(demoValue, filename, {
        orientation,
      });
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2 rounded-lg border bg-background p-4 shadow-lg">
        <FileTextIcon className="size-5 text-muted-foreground" />

        <input
          type="text"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          placeholder="Filename"
          className="w-32 rounded border px-2 py-1 text-sm"
        />

        <select
          value={orientation}
          onChange={(e) =>
            setOrientation(e.target.value as DocxExportOrientation)
          }
          className="rounded border px-2 py-1 text-sm"
        >
          <option value="portrait">Portrait</option>
          <option value="landscape">Landscape</option>
        </select>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isExporting ? 'Exporting...' : 'Export DOCX'}
        </button>
      </div>
    </div>
  );
}

/**
 * Simple example using the standalone function
 */
export function SimpleExportExample() {
  const handleExport = async () => {
    const value = [
      { type: 'h1', children: [{ text: 'Hello World' }] },
      { type: 'p', children: [{ text: 'This is a simple document.' }] },
    ];

    await exportEditorToDocx(value, 'hello-world', {
      orientation: 'portrait',
    });
  };

  return (
    <button
      onClick={handleExport}
      className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
    >
      Export Simple Document
    </button>
  );
}

/**
 * Example using the plugin API
 */
export function PluginApiExample() {
  const editor = useMemo(
    () =>
      createPlateEditor({
        plugins: [DocxExportPlugin],
        value: demoValue,
      }),
    []
  );

  const handleExport = async () => {
    // Using the plugin API
    const blob = await editor.api.docxExport.exportToBlob({
      orientation: 'portrait',
    });

    // Download the blob
    editor.api.docxExport.download(blob, 'my-document');
  };

  const handleExportAndDownload = async () => {
    // Using the transform for combined export + download
    await editor.tf.docxExport.exportAndDownload('my-document', {
      orientation: 'landscape',
    });
  };

  return (
    <Plate editor={editor}>
      <div className="flex gap-2">
        <button
          onClick={handleExport}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Export (API)
        </button>
        <button
          onClick={handleExportAndDownload}
          className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Export & Download (Transform)
        </button>
      </div>
    </Plate>
  );
}
