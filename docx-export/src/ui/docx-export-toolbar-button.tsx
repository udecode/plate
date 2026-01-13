/**
 * DOCX Export Toolbar Button Component
 *
 * A dropdown toolbar button for exporting Plate.js editor content to DOCX format.
 * Provides options for portrait and landscape orientation.
 *
 * ## Usage
 *
 * Add this button to your editor's toolbar:
 *
 * ```tsx
 * import { DocxExportToolbarButton } from '@platejs/docx-export';
 *
 * function EditorToolbar() {
 *   return (
 *     <Toolbar>
 *       <DocxExportToolbarButton defaultFilename="my-document" />
 *     </Toolbar>
 *   );
 * }
 * ```
 *
 * ## Required Dependencies
 *
 * This component requires the following shadcn/ui components:
 * - dropdown-menu
 * - toolbar (with tooltip)
 *
 * And the following additional dependencies:
 * - lucide-react (for FileTextIcon)
 * - sonner (for toast notifications)
 *
 * ## Customization
 *
 * The component uses data-testid attributes for testing:
 * - `docx-export-button` - The main button
 * - `docx-export-menu` - The dropdown menu
 * - `docx-export-portrait` - Portrait option
 * - `docx-export-landscape` - Landscape option
 *
 * @packageDocumentation
 */

'use client';

import { FileTextIcon } from 'lucide-react';
import type { PlateEditor } from 'platejs/react';
import { useEditorRef } from 'platejs/react';
import * as React from 'react';
import { toast } from 'sonner';

import type {
  DocxExportApiMethods,
  DocxExportOperationOptions,
  DocxExportTransformMethods,
} from '../docx-export-plugin';

// =============================================================================
// Types
// =============================================================================

/**
 * Editor API type with DOCX export methods.
 */
interface EditorApiWithDocxExport {
  docxExport: DocxExportApiMethods;
}

/**
 * Editor transforms type with DOCX export methods.
 */
interface EditorTfWithDocxExport {
  docxExport: DocxExportTransformMethods;
}

/**
 * Editor type with DOCX export API and transforms.
 * Used for type-safe access to the plugin's methods.
 */
type EditorWithDocxExport = PlateEditor & {
  api: PlateEditor['api'] & EditorApiWithDocxExport;
  tf: PlateEditor['tf'] & EditorTfWithDocxExport;
};

/**
 * Type guard to check if editor has DOCX export plugin.
 */
function hasDocxExport(editor: PlateEditor): editor is EditorWithDocxExport {
  return (
    'docxExport' in editor.api &&
    typeof (editor.api as EditorApiWithDocxExport).docxExport?.exportToBlob ===
      'function'
  );
}

/**
 * Props for the DocxExportToolbarButton component.
 */
export interface DocxExportToolbarButtonProps {
  /**
   * Default filename for the exported document (without .docx extension).
   * @default 'document'
   */
  defaultFilename?: string;

  /**
   * Additional export options passed to the export function.
   * Orientation is controlled by the dropdown selection.
   */
  exportOptions?: Omit<DocxExportOperationOptions, 'orientation'>;

  /**
   * Callback fired when export starts.
   */
  onExportStart?: () => void;

  /**
   * Callback fired when export completes successfully.
   * @param blob - The generated DOCX blob
   */
  onExportSuccess?: (blob: Blob) => void;

  /**
   * Callback fired when export fails.
   * @param error - The error that occurred
   */
  onExportError?: (error: Error) => void;
}

// =============================================================================
// Component (Self-contained version with inline UI)
// =============================================================================

/**
 * A toolbar button with dropdown for exporting editor content to DOCX.
 *
 * This is a self-contained version that includes basic dropdown styling.
 * For production use, integrate with your shadcn/ui components.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <DocxExportToolbarButton />
 *
 * // With custom filename
 * <DocxExportToolbarButton defaultFilename="my-report" />
 *
 * // With callbacks
 * <DocxExportToolbarButton
 *   onExportStart={() => console.log('Starting export...')}
 *   onExportSuccess={(blob) => console.log('Exported!', blob.size)}
 *   onExportError={(error) => console.error('Failed:', error)}
 * />
 * ```
 */
export function DocxExportToolbarButton({
  defaultFilename = 'document',
  exportOptions = {},
  onExportStart,
  onExportSuccess,
  onExportError,
}: DocxExportToolbarButtonProps) {
  const editor = useEditorRef();
  const [isExporting, setIsExporting] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleExport = async (orientation: 'landscape' | 'portrait') => {
    // Check if plugin is available using type guard
    if (!hasDocxExport(editor)) {
      const error = new Error(
        'DocxExportPlugin is not registered. Add DocxExportPlugin to your editor plugins.'
      );
      console.error('DOCX export error:', error);
      toast.error('DOCX export plugin not configured');
      onExportError?.(error);

      return;
    }

    try {
      setIsExporting(true);
      setIsOpen(false);
      onExportStart?.();

      // Use the plugin API for export (type-safe after guard)
      const blob = await editor.api.docxExport.exportToBlob({
        ...exportOptions,
        orientation,
      });
      editor.api.docxExport.download(blob, defaultFilename);

      toast.success('Document exported successfully');
      onExportSuccess?.(blob);
    } catch (error) {
      console.error('DOCX export error:', error);
      toast.error('Failed to export document');
      onExportError?.(
        error instanceof Error ? error : new Error(String(error))
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        ref={buttonRef}
        data-testid="docx-export-button"
        disabled={isExporting}
        onClick={() => setIsOpen(!isOpen)}
        title="Export to Word"
        type="button"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px',
          border: 'none',
          borderRadius: '4px',
          background: 'transparent',
          cursor: isExporting ? 'not-allowed' : 'pointer',
          opacity: isExporting ? 0.5 : 1,
        }}
      >
        <FileTextIcon style={{ width: '16px', height: '16px' }} />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          data-testid="docx-export-menu"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '4px',
            padding: '4px 0',
            backgroundColor: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 50,
            minWidth: '120px',
          }}
        >
          <button
            data-testid="docx-export-portrait"
            disabled={isExporting}
            onClick={() => handleExport('portrait')}
            type="button"
            style={{
              display: 'block',
              width: '100%',
              padding: '8px 12px',
              border: 'none',
              background: 'transparent',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f5f5f5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Portrait
          </button>
          <button
            data-testid="docx-export-landscape"
            disabled={isExporting}
            onClick={() => handleExport('landscape')}
            type="button"
            style={{
              display: 'block',
              width: '100%',
              padding: '8px 12px',
              border: 'none',
              background: 'transparent',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f5f5f5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Landscape
          </button>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// shadcn/ui Integration Example
// =============================================================================

/**
 * Example implementation using shadcn/ui components and the plugin API.
 *
 * To use this in your project, copy this code and ensure you have:
 * 1. DocxExportPlugin registered in your editor
 * 2. Required shadcn/ui components installed (dropdown-menu, toolbar)
 *
 * ```tsx
 * 'use client';
 *
 * import * as React from 'react';
 * import { FileTextIcon } from 'lucide-react';
 * import { useEditorRef } from 'platejs/react';
 * import { toast } from 'sonner';
 *
 * import {
 *   DropdownMenu,
 *   DropdownMenuContent,
 *   DropdownMenuItem,
 *   DropdownMenuTrigger,
 * } from '@/components/ui/dropdown-menu';
 * import { ToolbarButton } from '@/components/ui/toolbar';
 *
 * export function DocxExportToolbarButton({
 *   defaultFilename = 'document',
 * }) {
 *   const editor = useEditorRef();
 *   const [isExporting, setIsExporting] = React.useState(false);
 *
 *   const handleExport = async (orientation: 'landscape' | 'portrait') => {
 *     if (!editor.api.docxExport) {
 *       toast.error('DOCX export plugin not configured');
 *       return;
 *     }
 *
 *     try {
 *       setIsExporting(true);
 *       // Use the typed plugin API
 *       await editor.tf.docxExport.exportAndDownload(defaultFilename, {
 *         orientation,
 *       });
 *       toast.success('Document exported successfully');
 *     } catch (error) {
 *       console.error('DOCX export error:', error);
 *       toast.error('Failed to export document');
 *     } finally {
 *       setIsExporting(false);
 *     }
 *   };
 *
 *   return (
 *     <DropdownMenu>
 *       <DropdownMenuTrigger asChild>
 *         <ToolbarButton
 *           data-testid="docx-export-button"
 *           disabled={isExporting}
 *           tooltip="Export to Word"
 *         >
 *           <FileTextIcon className="size-4" />
 *         </ToolbarButton>
 *       </DropdownMenuTrigger>
 *       <DropdownMenuContent data-testid="docx-export-menu" align="start">
 *         <DropdownMenuItem
 *           data-testid="docx-export-portrait"
 *           disabled={isExporting}
 *           onSelect={() => handleExport('portrait')}
 *         >
 *           Portrait
 *         </DropdownMenuItem>
 *         <DropdownMenuItem
 *           data-testid="docx-export-landscape"
 *           disabled={isExporting}
 *           onSelect={() => handleExport('landscape')}
 *         >
 *           Landscape
 *         </DropdownMenuItem>
 *       </DropdownMenuContent>
 *     </DropdownMenu>
 *   );
 * }
 * ```
 */

export default DocxExportToolbarButton;
