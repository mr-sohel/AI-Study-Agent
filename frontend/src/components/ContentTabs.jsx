import React, { useState } from 'react';
import { FiFileText, FiLayers, FiHelpCircle } from 'react-icons/fi';
import SummaryView from './SummaryView';
import FlashcardsView from './FlashcardsView';
import QuizView from './QuizView';
import './ContentTabs.css';

const ContentTabs = ({ documentId, generatedContent, onContentGenerated }) => {
  const [activeTab, setActiveTab] = useState('summary');

  const tabs = [
    { id: 'summary', label: 'Summary', icon: FiFileText },
    { id: 'flashcards', label: 'Flashcards', icon: FiLayers },
    { id: 'quiz', label: 'Quiz', icon: FiHelpCircle },
  ];

  return (
    <div className="content-tabs">
      <div className="tabs-header">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={20} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="tab-content">
        {activeTab === 'summary' && (
          <SummaryView
            documentId={documentId}
            content={generatedContent.summary}
            onContentGenerated={(content) => onContentGenerated('summary', content)}
          />
        )}
        {activeTab === 'flashcards' && (
          <FlashcardsView
            documentId={documentId}
            content={generatedContent.flashcards}
            onContentGenerated={(content) => onContentGenerated('flashcards', content)}
          />
        )}
        {activeTab === 'quiz' && (
          <QuizView
            documentId={documentId}
            content={generatedContent.quiz}
            onContentGenerated={(content) => onContentGenerated('quiz', content)}
          />
        )}
      </div>
    </div>
  );
};

export default ContentTabs;


