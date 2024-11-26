'use client';

import React from 'react';

import { withRef } from '@udecode/cn';
import { toDOMNode, useEditorRef } from '@udecode/plate-common/react';
import { ArrowDownToLineIcon } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useOpenState,
} from './dropdown-menu';
import {
  ToolbarSplitButton,
  ToolbarSplitButtonPrimary,
  ToolbarSplitButtonSecondary,
} from './toolbar';

export const ExportToolbarButton = withRef<typeof ToolbarSplitButton>(
  ({ children, ...props }, ref) => {
    const editor = useEditorRef();
    const openState = useOpenState();

    const getCanvas = async () => {
      const { default: html2canvas } = await import('html2canvas');

      const style = document.createElement('style');
      document.head.append(style);
      style.sheet?.insertRule(
        'body > div:last-child img { display: inline-block !important; }'
      );

      const canvas = await html2canvas(toDOMNode(editor, editor)!);
      style.remove();

      return canvas;
    };

    const downloadFile = (href: string, filename: string) => {
      const element = document.createElement('a');
      element.setAttribute('href', href);
      element.setAttribute('download', filename);
      element.style.display = 'none';
      document.body.append(element);
      element.click();
      element.remove();
    };

    const exportToPdf = async () => {
      const canvas = await getCanvas();

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

      downloadFile(pdfBase64, 'plate.pdf');
    };

    const exportToImage = async () => {
      const canvas = await getCanvas();
      downloadFile(canvas.toDataURL('image/png'), 'plate.png');
    };

    return (
      <ToolbarSplitButton
        ref={ref}
        onClick={exportToPdf}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            openState.onOpenChange(true);
          }
        }}
        pressed={openState.open}
        tooltip="Export"
        {...props}
      >
        <ToolbarSplitButtonPrimary>
          <ArrowDownToLineIcon className="size-4" />
        </ToolbarSplitButtonPrimary>

        <DropdownMenu {...openState} modal={false}>
          <DropdownMenuTrigger asChild>
            <ToolbarSplitButtonSecondary />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            onClick={(e) => e.stopPropagation()}
            align="start"
            alignOffset={-32}
          >
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={exportToPdf}>
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={exportToImage}>
                Export via Image
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ToolbarSplitButton>
    );
  }
);
