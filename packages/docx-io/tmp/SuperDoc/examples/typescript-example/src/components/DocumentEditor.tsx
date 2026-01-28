import { SuperDoc, Config } from '@harbour-enterprises/superdoc';
import { Editor } from '@harbour-enterprises/superdoc/super-editor'

import '@harbour-enterprises/superdoc/style.css';
import { useEffect, useRef } from 'react';

interface Props {
  initialData: File | null,
  readOnly?: boolean,
}

const DocumentEditor = ({
  initialData = null,
  readOnly = false,
}: Props) => {
  const editorRef = useRef<SuperDoc>(null);
  useEffect(() => {
    const config: Config = {
      selector: '#superdoc',
      toolbar: '#superdoc-toolbar',
      document: initialData, // URL, File or document config
      documentMode: readOnly ? 'viewing' : 'editing',
      pagination: true,
      rulers: true,
      onReady: (event) => {
        console.log('SuperDoc is ready', event);
      },
      onEditorCreate: (event) => {
        console.log('Editor is created', event);
      },
    };
  
    const editor = new SuperDoc(config);
    editorRef.current = editor;

    // Cleanup on unmount
    return () => {
      if (editorRef.current) {
        editorRef.current = null;
      }
    };
  }, [initialData, readOnly]);

  return (
    <div className="document-editor">
      <div id="superdoc-toolbar" className="toolbar" />
      <div id="superdoc" className="editor" />
      <style>{`
        .document-editor {
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
        }
        .toolbar {
          flex: 0 0 auto;
          border-bottom: 1px solid #eee;
        }
        .editor {
          display: flex;
          justify-content: center;
          flex: 1 1 auto;
          overflow: auto;
        }
      `}</style>
    </div>
  );
};

export default DocumentEditor;