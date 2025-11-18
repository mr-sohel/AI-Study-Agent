import React, { useState } from 'react';
import axios from 'axios';
import { FiDownload, FiChevronLeft, FiChevronRight, FiRotateCw, FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { exportToText, exportToPDF } from '../utils/exportUtils';
import API_BASE_URL from '../utils/api';
import './ContentView.css';

const FlashcardsView = ({ documentId, content, onContentGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const generateFlashcards = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/generate/flashcards/${documentId}`);
      onContentGenerated(response.data.flashcards);
      toast.success('Flashcards generated successfully!');
    } catch (error) {
      console.error('Error generating flashcards:', error);
      toast.error('Failed to generate flashcards');
    } finally {
      setLoading(false);
    }
  };

  const generateMoreFlashcards = async () => {
    setLoadingMore(true);
    try {
      // Force regeneration by adding a query parameter
      const response = await axios.post(`${API_BASE_URL}/api/generate/flashcards/${documentId}?more=true`);
      const newFlashcards = response.data.flashcards;
      
      // Append new flashcards to existing ones
      const combinedFlashcards = [...content, ...newFlashcards];
      onContentGenerated(combinedFlashcards);
      
      // Move to the first new card
      setCurrentCard(content.length);
      setFlipped(false);
      
      toast.success(`Added ${newFlashcards.length} more flashcards! Total: ${combinedFlashcards.length}`);
    } catch (error) {
      console.error('Error generating more flashcards:', error);
      toast.error('Failed to generate more flashcards');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleNext = () => {
    if (currentCard < content.length - 1) {
      setCurrentCard(currentCard + 1);
      setFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setFlipped(false);
    }
  };

  const handleExportText = () => {
    const text = content.map((card, i) => 
      `Card ${i + 1}:\nQ: ${card.question}\nA: ${card.answer}\n\n`
    ).join('');
    exportToText(text, 'flashcards.txt');
    toast.success('Exported as text file!');
  };

  const handleExportPDF = () => {
    const text = content.map((card, i) => 
      `Card ${i + 1}:\nQ: ${card.question}\nA: ${card.answer}\n\n`
    ).join('');
    exportToPDF('Flashcards', text, 'flashcards.pdf');
    toast.success('Exported as PDF!');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Generating your flashcards with AI...</p>
      </div>
    );
  }

  if (!content || content.length === 0) {
    return (
      <div className="empty-state">
        <p>No flashcards generated yet.</p>
        <button className="generate-btn" onClick={generateFlashcards}>
          Generate Flashcards
        </button>
      </div>
    );
  }

  return (
    <div className="content-view">
      <div className="content-header">
        <h2>🎴 Flashcards ({content.length})</h2>
        <div className="action-buttons">
          <button 
            className="action-btn generate-more-btn" 
            onClick={generateMoreFlashcards}
            disabled={loadingMore}
          >
            <FiPlus size={18} />
            <span>{loadingMore ? 'Generating...' : 'Generate More'}</span>
          </button>
          <button className="action-btn" onClick={handleExportText}>
            <FiDownload size={18} />
            <span>TXT</span>
          </button>
          <button className="action-btn" onClick={handleExportPDF}>
            <FiDownload size={18} />
            <span>PDF</span>
          </button>
        </div>
      </div>
      <div className="flashcard-container">
        <div 
          className={`flashcard ${flipped ? 'flipped' : ''}`}
          onClick={() => setFlipped(!flipped)}
        >
          <div className="flashcard-front">
            <div className="card-label">Question</div>
            <div className="card-content">{content[currentCard].question}</div>
            <div className="flip-hint">Click to flip</div>
          </div>
          <div className="flashcard-back">
            <div className="card-label">Answer</div>
            <div className="card-content">{content[currentCard].answer}</div>
            <div className="flip-hint">Click to flip back</div>
          </div>
        </div>
        
        <div className="flashcard-controls">
          <button 
            className="control-btn"
            onClick={handlePrevious}
            disabled={currentCard === 0}
          >
            <FiChevronLeft size={24} />
          </button>
          
          <div className="card-counter">
            {currentCard + 1} / {content.length}
          </div>
          
          <button 
            className="control-btn"
            onClick={handleNext}
            disabled={currentCard === content.length - 1}
          >
            <FiChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardsView;
