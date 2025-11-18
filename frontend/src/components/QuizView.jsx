import React, { useState } from 'react';
import axios from 'axios';
import { FiDownload, FiCheckCircle, FiXCircle, FiRefreshCw, FiCheck, FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { exportToText, exportToPDF } from '../utils/exportUtils';
import API_BASE_URL from '../utils/api';
import './ContentView.css';

const QuizView = ({ documentId, content, onContentGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const generateQuiz = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/generate/quiz/${documentId}`);
      onContentGenerated(response.data.quiz);
      toast.success('Quiz generated successfully!');
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast.error('Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const generateMoreQuestions = async () => {
    setLoadingMore(true);
    try {
      // Force regeneration by adding a query parameter
      const response = await axios.post(`${API_BASE_URL}/api/generate/quiz/${documentId}?more=true`);
      const newQuestions = response.data.quiz;
      
      // Append new questions to existing ones
      const combinedQuestions = [...content, ...newQuestions];
      onContentGenerated(combinedQuestions);
      
      // Reset quiz state for new questions
      setSelectedAnswers({});
      setShowResults(false);
      setScore(0);
      
      toast.success(`Added ${newQuestions.length} more questions! Total: ${combinedQuestions.length}`);
    } catch (error) {
      console.error('Error generating more questions:', error);
      toast.error('Failed to generate more questions');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    if (!showResults) {
      setSelectedAnswers({
        ...selectedAnswers,
        [questionIndex]: answerIndex
      });
    }
  };

  const handleSubmit = () => {
    if (Object.keys(selectedAnswers).length === 0) {
      toast.warning('Please answer at least one question before submitting.');
      return;
    }

    let correctCount = 0;
    content.forEach((question, index) => {
      if (selectedAnswers[index] !== undefined && selectedAnswers[index] === question.correctAnswer) {
        correctCount++;
      }
    });
    
    setScore(correctCount);
    setShowResults(true);
    
    const percentage = Math.round((correctCount / content.length) * 100);
    toast.success(`Quiz submitted! You scored ${correctCount} out of ${content.length} (${percentage}%)`);
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
    toast.info('Quiz reset. You can try again!');
  };

  const handleExportText = () => {
    const text = content.map((q, i) => 
      `Question ${i + 1}: ${q.question}\n${q.options.map((opt, j) => `${String.fromCharCode(65 + j)}. ${opt}`).join('\n')}\nCorrect Answer: ${String.fromCharCode(65 + q.correctAnswer)}. ${q.options[q.correctAnswer]}\nExplanation: ${q.explanation}\n\n`
    ).join('');
    exportToText(text, 'quiz.txt');
    toast.success('Exported as text file!');
  };

  const handleExportPDF = () => {
    const text = content.map((q, i) => 
      `Question ${i + 1}: ${q.question}\n${q.options.map((opt, j) => `${String.fromCharCode(65 + j)}. ${opt}`).join('\n')}\nCorrect Answer: ${String.fromCharCode(65 + q.correctAnswer)}. ${q.options[q.correctAnswer]}\nExplanation: ${q.explanation}\n\n`
    ).join('');
    exportToPDF('Quiz', text, 'quiz.pdf');
    toast.success('Exported as PDF!');
  };

  const getAnsweredCount = () => {
    return Object.keys(selectedAnswers).length;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Generating your quiz with AI...</p>
      </div>
    );
  }

  if (!content || content.length === 0) {
    return (
      <div className="empty-state">
        <p>No quiz generated yet.</p>
        <button className="generate-btn" onClick={generateQuiz}>
          Generate Quiz (10 Questions)
        </button>
      </div>
    );
  }

  const answeredCount = getAnsweredCount();
  const allAnswered = answeredCount === content.length;

  return (
    <div className="content-view">
      <div className="content-header">
        <h2>📊 Quiz ({content.length} Questions)</h2>
        <div className="action-buttons">
          <button 
            className="action-btn generate-more-btn" 
            onClick={generateMoreQuestions}
            disabled={loadingMore}
          >
            <FiPlus size={18} />
            <span>{loadingMore ? 'Generating...' : 'Generate More'}</span>
          </button>
          {showResults && (
            <button className="action-btn reset-btn" onClick={handleReset}>
              <FiRefreshCw size={18} />
              <span>Retry Quiz</span>
            </button>
          )}
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

      {!showResults && (
        <div className="quiz-progress">
          <p>Progress: {answeredCount} of {content.length} questions answered</p>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(answeredCount / content.length) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {showResults && (
        <div className="quiz-results">
          <div className="score-display">
            <h3>Your Score</h3>
            <div className="score-number">
              {score} / {content.length}
            </div>
            <div className="score-percentage">
              {Math.round((score / content.length) * 100)}%
            </div>
            <div className="score-message">
              {score === content.length && '🎉 Perfect Score! Excellent work!'}
              {score >= content.length * 0.8 && score < content.length && '👍 Great job! You did very well!'}
              {score >= content.length * 0.6 && score < content.length * 0.8 && '✅ Good effort! Keep studying!'}
              {score < content.length * 0.6 && '📚 Keep practicing! You can do better!'}
            </div>
          </div>
        </div>
      )}

      <div className="quiz-container">
        {content.map((question, qIndex) => {
          const selectedAnswer = selectedAnswers[qIndex];
          const isCorrect = selectedAnswer !== undefined && selectedAnswer === question.correctAnswer;
          const isIncorrect = selectedAnswer !== undefined && selectedAnswer !== question.correctAnswer;

          return (
            <div key={qIndex} className={`quiz-question ${showResults ? 'results-shown' : ''}`}>
              <div className="question-header">
                <span className="question-number">Question {qIndex + 1} of {content.length}</span>
                {showResults && isCorrect && (
                  <span className="question-status correct-status">
                    <FiCheckCircle size={20} />
                    Correct
                  </span>
                )}
                {showResults && isIncorrect && (
                  <span className="question-status incorrect-status">
                    <FiXCircle size={20} />
                    Incorrect
                  </span>
                )}
                {showResults && selectedAnswer === undefined && (
                  <span className="question-status unanswered-status">
                    Not Answered
                  </span>
                )}
              </div>
              
              <h4>{question.question}</h4>
              
              <div className="quiz-options">
                {question.options.map((option, oIndex) => {
                  const isSelected = selectedAnswer === oIndex;
                  const isCorrectAnswer = question.correctAnswer === oIndex;
                  const showAsCorrect = showResults && isCorrectAnswer;
                  const showAsIncorrect = showResults && isSelected && !isCorrectAnswer;

                  return (
                    <button
                      key={oIndex}
                      type="button"
                      className={`option-button ${isSelected ? 'selected' : ''} ${showAsCorrect ? 'correct' : ''} ${showAsIncorrect ? 'incorrect' : ''} ${showResults && isCorrectAnswer ? 'show-correct' : ''}`}
                      onClick={() => handleAnswerSelect(qIndex, oIndex)}
                      disabled={showResults}
                    >
                      <div className="option-label">
                        {String.fromCharCode(65 + oIndex)}
                      </div>
                      <div className="option-text">{option}</div>
                      {showResults && isCorrectAnswer && (
                        <FiCheck className="correct-check" size={20} />
                      )}
                    </button>
                  );
                })}
              </div>

              {showResults && question.explanation && (
                <div className="quiz-explanation">
                  <strong>Explanation:</strong> {question.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!showResults && (
        <div className="quiz-submit-section">
          <button 
            className={`submit-quiz-btn ${allAnswered ? 'ready' : ''}`}
            onClick={handleSubmit}
          >
            {allAnswered ? (
              <>
                <FiCheck size={20} />
                Submit Quiz ({answeredCount}/{content.length} answered)
              </>
            ) : (
              <>
                Submit Quiz ({answeredCount}/{content.length} answered)
              </>
            )}
          </button>
          {!allAnswered && (
            <p className="submit-note">
              You can submit with {answeredCount} answered question{answeredCount !== 1 ? 's' : ''}, or answer all {content.length} questions first.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizView;
