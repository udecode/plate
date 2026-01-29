'use client';

import { useEffect, useRef, useCallback } from 'react';
import './superdoc.css';
import '@harbour-enterprises/superdoc/style.css';

export default function SuperDocEditor() {
  const superdocContainerRef = useRef(null);
  const superdoc = useRef(null);
  const editor = useRef(null);
  const fileUploadRef = useRef(null);

  const onReady = () => {
    editor.current = superdoc.current.activeEditor;
    console.log('SuperDoc is ready');
  };

  const initSuperDoc = async (fileToLoad = null) => {
    const { SuperDoc } = await import('@harbour-enterprises/superdoc');
    const config = {
      selector: superdocContainerRef.current,
      modules: { 
        toolbar: { 
          selector: '#toolbar', 
          toolbarGroups: ['center'], 
        },
      },
      pagination: true,
      rulers: true,
      onReady,
      onEditorCreate: (event) => {
        console.log('Editor is created', event);
      },
    }

    if (fileToLoad) config.document = { data: fileToLoad };
    // config.document = '/sample-document.docx'; // or load with file path

    superdoc.current = new SuperDoc(config);
  };

  useEffect(() => {
    initSuperDoc();
  }, []);

  const handleImport = useCallback(async () => {
    if (!superdocContainerRef.current) return;
    fileUploadRef.current.click();
  }, []);

  const handleChange = (event) => {
    const file = event.target.files[0];
    initSuperDoc(file);
  }

  const handleExport = useCallback(async () => {
    console.debug('Exporting document', superdoc.current);
    superdoc.current.export();
  });

  return (
    <div className="example-container">
      <div id="toolbar" />
      <div className="editor-and-button">
        <div id="superdoc" ref={superdocContainerRef} />
        <div className="editor-buttons">
          <button className="custom-button" onClick={handleImport}>Import</button>
          <input className="file-upload-input" ref={fileUploadRef} onChange={handleChange} style={{display: "none"}} type="file" accept=".docx" />
          <button className="custom-button" onClick={handleExport}>Export</button>
        </div>
      </div>
    </div>
  );
}
