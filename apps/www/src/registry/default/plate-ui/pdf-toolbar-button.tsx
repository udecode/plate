'use client';

import React from 'react';

import { withRef } from '@udecode/cn';
import { useEditorRef } from '@udecode/plate-core/react';
import { toDOMNode } from '@udecode/slate-react';

import { ToolbarButton } from './toolbar';

export const PdfToolbarButton = withRef<typeof ToolbarButton>(
  ({ children, ...rest }, ref) => {
    const editor = useEditorRef();

    return (
      <ToolbarButton
        ref={ref}
        {...rest}
        onClick={async () => {
          const { default: html2canvas } = await import('html2canvas');

          const canvas = await html2canvas(toDOMNode(editor, editor)!, {
            onclone(document, element) {
              console.log(document, element, 'fj');
            },
          });

          const PDFLib = await import('pdf-lib');
          const pdfDoc = await PDFLib.PDFDocument.create();
          const page = pdfDoc.addPage([canvas.width, canvas.height]);
          const imageEmbed = await pdfDoc.embedPng(canvas.toDataURL('PNG'));

          page.drawImage(imageEmbed, {
            height: canvas.height,
            width: canvas.width,
            x: 0,
            y: 0,
          });
          const pdfBase64 = await pdfDoc.saveAsBase64({ dataUri: true });

          const element = document.createElement('a');
          element.setAttribute('href', pdfBase64);
          element.setAttribute('download', 'plate.pdf');
          element.style.display = 'none';
          document.body.append(element);
          element.click();
          element.remove();
        }}
      >
        {children}
      </ToolbarButton>
    );
  }
);
