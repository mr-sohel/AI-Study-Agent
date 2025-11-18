import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';
import ContentTabs from '../components/ContentTabs';
import './AppPage.css';

const AppPage = () => {
  const [documentId, setDocumentId] = useState(null);
  const [fileName, setFileName] = useState('');
  const [generatedContent, setGeneratedContent] = useState({
    summary: null,
    flashcards: null,
    quiz: null
  });

  const handleUploadSuccess = (docId, name) => {
    setDocumentId(docId);
    setFileName(name);
    setGeneratedContent({
      summary: null,
      flashcards: null,
      quiz: null
    });
  };

  const handleContentGenerated = (type, content) => {
    setGeneratedContent(prev => ({
      ...prev,
      [type]: content
    }));
  };

  return (
    <div className="app-page">
      <div className="app-container">
        {!documentId ? (
          <div className="app-upload-section">
            <div className="app-welcome">
              <h1>Start Creating Study Materials</h1>
              <p>Upload your document or paste text to get started</p>
            </div>
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          </div>
        ) : (
          <div className="app-content-section">
            <div className="document-info">
              <h2>📄 {fileName}</h2>
              <button 
                className="new-document-btn"
                onClick={() => {
                  setDocumentId(null);
                  setFileName('');
                }}
              >
                Upload New Document
              </button>
            </div>
            <ContentTabs
              documentId={documentId}
              generatedContent={generatedContent}
              onContentGenerated={handleContentGenerated}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AppPage;

