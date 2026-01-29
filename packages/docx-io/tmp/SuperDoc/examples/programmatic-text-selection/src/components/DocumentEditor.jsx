import { SuperDoc } from '@harbour-enterprises/superdoc';
import '@harbour-enterprises/superdoc/style.css';
import { useEffect, useRef } from 'react';

const DocumentEditor = ({ 
  initialData = null,
  readOnly = false,
  onEditorReady 
}) => {
  const editorRef = useRef(null);

  useEffect(() => {
    const config = {
      selector: '#superdoc',
      toolbar: '#superdoc-toolbar',
      documentMode: readOnly ? 'viewing' : 'editing',
      pagination: true,
      rulers: true,
      onReady: () => {
        if (onEditorReady) {
          onEditorReady(editor);
        }
      },
      onEditorCreate: (event) => {
        console.log('Editor is created', event);
      },
      onEditorDestroy: () => {
        console.log('Editor is destroyed');
      }
    }

    if (initialData) config.document = initialData;
    // config.document = './sample.docx'; // or use path to file

    const editor = new SuperDoc(config);

    editorRef.current = editor;

    // Cleanup on unmount
    return () => {
      if (editorRef.current) {
        editorRef.current = null;
      }
    };
  }, [initialData, readOnly, onEditorReady]);

  return (
    <div className="document-editor">
      <div id="superdoc-toolbar" className="toolbar" />
      <div id="superdoc" className="superdoc-container" />
      <style jsx>{`
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
        .superdoc-container {
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