import React from 'react';
import { Link } from 'react-router-dom';
import './Features.css';

const Features = () => {
  const features = [
    {
      icon: '📝',
      title: 'Smart Summaries',
      description: 'Get concise, well-structured summaries of your study materials. Our AI extracts key points and organizes them in an easy-to-read format.',
      details: [
        'Automatic key point extraction',
        'Hierarchical organization',
        'Multiple format support',
        'Export to PDF or TXT'
      ]
    },
    {
      icon: '🎴',
      title: 'Flashcards',
      description: 'AI-generated Q&A pairs for quick and effective revision. Perfect for memorizing important concepts and facts.',
      details: [
        'Interactive flip cards',
        'Question-answer pairs',
        'Easy navigation',
        'Export functionality'
      ]
    },
    {
      icon: '📊',
      title: 'Interactive Quizzes',
      description: 'Test your knowledge with AI-created multiple-choice questions. Get instant feedback and explanations.',
      details: [
        'Multiple-choice questions',
        'Instant scoring',
        'Detailed explanations',
        'Progress tracking'
      ]
    },
    {
      icon: '📄',
      title: 'Multiple File Formats',
      description: 'Support for PDF, DOCX, TXT, and image files. Upload any document type and let AI do the work.',
      details: [
        'PDF documents',
        'Word documents (DOCX)',
        'Text files',
        'Image files (JPEG, PNG, GIF, WEBP)'
      ]
    },
    {
      icon: '💾',
      title: 'Export & Download',
      description: 'Download your generated study materials in multiple formats for offline studying.',
      details: [
        'PDF export',
        'TXT export',
        'Offline access',
        'Easy sharing'
      ]
    },
    {
      icon: '🌓',
      title: 'Dark Mode',
      description: 'Comfortable viewing in any lighting condition with our built-in dark mode support.',
      details: [
        'Light and dark themes',
        'Automatic preference saving',
        'Eye-friendly colors',
        'Smooth transitions'
      ]
    }
  ];

  return (
    <div className="features-page">
      <div className="page-header">
        <div className="container">
          <h1>Features</h1>
          <p>Everything you need to transform your study materials</p>
        </div>
      </div>

      <div className="container">
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card-detailed">
              <div className="feature-icon-large">{feature.icon}</div>
              <h2>{feature.title}</h2>
              <p className="feature-description">{feature.description}</p>
              <ul className="feature-details">
                {feature.details.map((detail, i) => (
                  <li key={i}>{detail}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="page-cta">
          <Link to="/app" className="cta-button primary large">
            Try It Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Features;

