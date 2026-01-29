import { useRef, useState } from 'react';
import { TextSelection } from 'prosemirror-state';
import DocumentEditor from './components/DocumentEditor';

function App() {
  const [documentFile, setDocumentFile] = useState(null);
  const [showLengthInput, setShowLengthInput] = useState(true);
  const selectionMethodRef = useRef('length');
  const selectionLengthRef = useRef(10);
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setDocumentFile(file);
    }
  };

  const handleEditorReady = (editor) => {
    console.log('SuperDoc editor is ready', editor);
    editorRef.current = editor;
  };

  const getCurrentSelection = () => {
    const { view } = editorRef.current.activeEditor;
    return view.state.selection;
  };

  const getLengthBasedPositions = () => {
    const selection = getCurrentSelection();
    const { view } = editorRef.current.activeEditor;
    const currentPos = selection.from;
    const selectionLength = selectionLengthRef.current;
    const docLength = view.state.doc.content.size;
    
    return {
      from: currentPos,
      to: Math.min(currentPos + selectionLength, docLength)
    };
  };

  const getLineBasedPositions = () => {
    const selection = getCurrentSelection();
    const { $from } = selection;
    return {
      from: $from.start(),
      to: $from.end()
    };
  };

  const applySelection = (from, to) => {
    const activeEditor = editorRef.current.activeEditor;
    const { view } = activeEditor;

    const newSelection = TextSelection.create(view.state.doc, from, to);
    const tr = view.state.tr.setSelection(newSelection);
    const state = view.state.apply(tr);
    view.updateState(state);

    activeEditor.commands.setUnderline();
  };

  const handleSelection = (getPositions) => {
    const { from, to } = getPositions();
    applySelection(from, to);
  };

  const handleLengthSelection = () => handleSelection(getLengthBasedPositions);
  const handleLineSelection = () => handleSelection(getLineBasedPositions);

  const handleSelectionClick = () => {
    if (selectionMethodRef.current === 'length') {
      handleLengthSelection();
    } else {
      handleLineSelection();
    }
  };

  return (
    <div className="app">
      <header>
        <h1>SuperDoc Example</h1>
        <button onClick={() => fileInputRef.current?.click()}>
          Load Document
        </button>
        <div className="selection-controls">
          <div className="selection-group">
            <label htmlFor="selectionMethod">Selection method:</label>
            <select 
              id="selectionMethod"
              defaultValue={selectionMethodRef.current} 
              onChange={(e) => {
                selectionMethodRef.current = e.target.value;
                setShowLengthInput(e.target.value === 'length');
              }}
            >
              <option value="length">By Length</option>
              <option value="line">By Line</option>
            </select>

            {/* hide input when not needed */}
            {showLengthInput && (
              <>
                <label htmlFor="selectionLength">Characters:</label>
                <input
                  id="selectionLength"
                  type="number"
                  defaultValue={selectionLengthRef.current}
                  onChange={(e) => selectionLengthRef.current = Number(e.target.value)}
                  min="1"
                  max="1000"
                />
              </>
            )}
            
            <button onClick={handleSelectionClick}>
              Select and underline
            </button>
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          accept=".docx, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </header>

      <main>
        <DocumentEditor
          initialData={documentFile}
          onEditorReady={handleEditorReady}
        />
      </main>

      <style jsx>{`
        .app {
          height: 100vh;
          display: flex;
          flex-direction: column;
        }
        header {
          padding: 1rem;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        header button {
          padding: 0.5rem 1rem;
          background: #1355ff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        header button:hover {
          background: #0044ff;
        }
        .selection-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .selection-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: #fafafa;
        }
        .selection-group > label:first-child {
          font-weight: bold;
          font-size: 0.9rem;
          color: #333;
        }
        .selection-controls label {
          font-size: 0.9rem;
        }
        .selection-controls input[type="number"] {
          width: 80px;
          padding: 0.3rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .selection-controls select {
          padding: 0.3rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          background: white;
        }
        main {
          flex: 1;
          min-height: 0;
        }
      `}</style>
    </div>
  );
}

export default App;