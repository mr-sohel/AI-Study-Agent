import React from 'react';
import { Link } from 'react-router-dom';
import './Docs.css';

const Docs = () => {
  const steps = [
    {
      number: 1,
      title: 'Upload Your Document',
      description: 'Start by uploading your study material. You can drag and drop files, click to browse, or paste text directly.',
      icon: '📤',
      details: [
        'Drag and drop files into the upload area',
        'Click to browse and select files from your device',
        'Paste text directly into the text input field',
        'We support PDF, Word documents, text files, and images',
        'Your file should be smaller than 10MB'
      ]
    },
    {
      number: 2,
      title: 'AI Processing',
      description: 'Our AI reads your content and finds the important information. This happens automatically and usually takes just a few seconds.',
      icon: '🤖',
      details: [
        'The AI reads through your document',
        'It finds the main ideas and important points',
        'It organizes everything in a clear way',
        'This usually takes just a few seconds'
      ]
    },
    {
      number: 3,
      title: 'Generate Study Materials',
      description: 'Choose what you want to create. You can make summaries, flashcards, or quizzes - or all three!',
      icon: '📚',
      details: [
        'Summaries: Short versions of your document with key points',
        'Flashcards: Questions and answers to help you memorize',
        'Quizzes: Multiple-choice questions to test your knowledge',
        'You can create one, two, or all three types'
      ]
    },
    {
      number: 4,
      title: 'Study & Export',
      description: 'Use your materials to study, and download them to use offline whenever you need.',
      icon: '💾',
      details: [
        'Read summaries, flip through flashcards, or take quizzes',
        'Download everything as PDF or text files',
        'Use your materials offline on any device',
        'Share your study materials with friends or classmates'
      ]
    }
  ];

  return (
    <div className="docs-page">
      <div className="page-header">
        <div className="container">
          <h1>Documentation</h1>
          <p>Everything you need to know about using AI Study Agent</p>
        </div>
      </div>

      <div className="container">
        <div className="docs-intro">
          <p className="intro-text">
            Welcome! This guide will help you get started with AI Study Agent. 
            We'll show you how to turn your documents into study materials in just a few simple steps.
          </p>
        </div>

        <div className="steps-timeline">
          <h2 className="section-heading">Quick Start Guide</h2>
          {steps.map((step, index) => (
            <div key={index} className="step-timeline-item">
              <div className="step-content">
                <div className="step-icon">{step.icon}</div>
                <div className="step-number">{step.number}</div>
                <h3>{step.title}</h3>
                <p className="step-description">{step.description}</p>
                <ul className="step-details">
                  {step.details.map((detail, i) => (
                    <li key={i}>{detail}</li>
                  ))}
                </ul>
              </div>
              {index < steps.length - 1 && <div className="step-connector"></div>}
            </div>
          ))}
        </div>

        <div className="docs-content">
          <section className="docs-section">
            <h2>Best Practices</h2>
            <p>Follow these simple tips to get the best results:</p>
            <ul className="best-practices">
              <li>
                <strong>Use clear documents:</strong> Documents that are well-organized and easy to read will give you better results
              </li>
              <li>
                <strong>Check image quality:</strong> If you're uploading scanned documents, make sure the text is clear and easy to read
              </li>
              <li>
                <strong>Break up long documents:</strong> Very long documents work better when you split them into smaller parts
              </li>
              <li>
                <strong>Always review what's created:</strong> Check the summaries, flashcards, and quizzes to make sure everything looks correct
              </li>
              <li>
                <strong>Use text input for quick tasks:</strong> The text box is great for short notes or quick questions
              </li>
              <li>
                <strong>Save your work:</strong> Download your materials regularly so you don't lose anything
              </li>
            </ul>
          </section>

          <section className="docs-section">
            <h2>Troubleshooting</h2>
            <p>Having problems? Here are some common issues and how to fix them:</p>
            
            <div className="troubleshoot-item">
              <h3>Problems Uploading Files</h3>
              <p>If you can't upload your file, try these solutions:</p>
              <ul>
                <li>Make sure your file is smaller than 10MB</li>
                <li>Check that your file is a PDF, Word document, text file, or image</li>
                <li>Try refreshing the page and uploading again</li>
                <li>If it still doesn't work, try using a different web browser</li>
                <li>Check that you have a good internet connection</li>
                <li>Make sure your file isn't password-protected or corrupted</li>
              </ul>
            </div>

            <div className="troubleshoot-item">
              <h3>Problems Creating Study Materials</h3>
              <p>If the AI can't create your study materials, try these fixes:</p>
              <ul>
                <li>Make sure your document has text that can be read (not just images without text)</li>
                <li>For scanned documents, try using a clearer scan or the original file</li>
                <li>Check that your document isn't password-protected</li>
                <li>Try starting with a smaller document to test if everything works</li>
                <li>Make sure your content is in a language we support</li>
                <li>If something went wrong, wait a moment and try again</li>
              </ul>
            </div>

            <div className="troubleshoot-item">
              <h3>Other Problems</h3>
              <p>For other issues, try these steps:</p>
              <ul>
                <li>Clear your browser's cache and cookies</li>
                <li>Turn off browser extensions that might be causing problems</li>
                <li>Try using a different device or web browser</li>
                <li>Make sure JavaScript is enabled in your browser</li>
                <li>Use a modern, up-to-date web browser</li>
              </ul>
            </div>
          </section>
        </div>

        <div className="page-cta">
          <h2>Ready to Get Started?</h2>
          <p>Transform your study materials in seconds</p>
          <Link to="/app" className="cta-button primary large">
            Start Creating Study Materials
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Docs;
