import React, { useRef, useState } from 'react';
import { useDocumentContext } from '../hooks/useDocumentContext';

interface DocumentUploadProps {
  className?: string;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ className = '' }) => {
  const { addDocument } = useDocumentContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    Array.from(files).forEach(file => {
      addDocument(file);
    });
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    // Reset input to allow same file to be selected again
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
      />
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          w-full p-3 border-2 border-dashed rounded-lg transition-colors duration-200 cursor-pointer
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
        `}
        onClick={handleButtonClick}
      >
        <div className="text-center">
          <div className="text-2xl mb-2">📤</div>
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-medium">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">
            Only .docx files are supported
          </p>
        </div>
      </div>
    </div>
  );
};