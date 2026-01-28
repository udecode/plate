import { Toaster } from 'react-hot-toast';
import { usePanelState } from './hooks/usePanelState';
import { LeftPanel, RightPanel, CenterPanel } from './components';
import { DocumentProvider } from './contexts/DocumentContext';
import { CommentFilterProvider } from './contexts/CommentFilterContext';

function App() {
  const { 
    leftPanel, 
    rightPanel, 
    toggleLeftPanel, 
    toggleRightPanel 
  } = usePanelState();

  return (
    <DocumentProvider>
      <CommentFilterProvider>
        <div className="min-h-screen bg-gray-100 flex overflow-hidden">
          <LeftPanel 
            state={leftPanel}
            onToggle={toggleLeftPanel}
          />
          
          <CenterPanel />
          
          <RightPanel 
            state={rightPanel}
            onToggle={toggleRightPanel}
          />
        </div>
        
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </CommentFilterProvider>
    </DocumentProvider>
  );
}

export default App
