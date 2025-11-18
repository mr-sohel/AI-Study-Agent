import React, { useState } from 'react';
import Header from './Header';
import FileUpload from './FileUpload';
import ContentTabs from './ContentTabs';
import './Dashboard.css';

const Dashboard = () => {
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
    <div className="dashboard">
      <Header />
      <div className="dashboard-container">
        <div className="dashboard-content">
          {!documentId ? (
            <div className="upload-section fade-in">
              <div className="welcome-text">
                <h1>Transform Your Study Materials with AI</h1>
                <p>Upload your documents or paste text to generate summaries, flashcards, and quizzes instantly.</p>
              </div>

              <FileUpload onUploadSuccess={handleUploadSuccess} />

              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">📝</div>
                  <h3>Smart Summaries</h3>
                  <p>Get concise, well-structured summaries</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🎴</div>
                  <h3>Flashcards</h3>
                  <p>AI-generated Q&A pairs for quick revision</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">📊</div>
                  <h3>Interactive Quizzes</h3>
                  <p>Test your knowledge with multiple-choice questions</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="content-section fade-in">
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
    </div>
  );
};

export default Dashboard;


