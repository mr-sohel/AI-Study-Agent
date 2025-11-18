import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-headline">Transform Your Study Materials with AI</h1>
          <p className="hero-description">
            Instantly generate summaries, flashcards, and quizzes from your documents using advanced AI technology.
          </p>
          <div className="hero-cta">
            <Link to="/app" className="cta-button primary">
              Get Started
            </Link>
            <Link to="/docs" className="cta-button secondary">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="audience-section">
        <div className="container">
          <h2 className="section-title">Who It's For</h2>
          <div className="audience-grid">
            <div className="audience-card">
              <div className="audience-icon">👨‍🎓</div>
              <h3>Students</h3>
              <p>Turn lecture notes and textbooks into study-ready materials</p>
            </div>
            <div className="audience-card">
              <div className="audience-icon">👩‍🏫</div>
              <h3>Teachers</h3>
              <p>Create quizzes and study materials for your classes quickly</p>
            </div>
            <div className="audience-card">
              <div className="audience-icon">📚</div>
              <h3>Researchers</h3>
              <p>Summarize papers and extract key insights efficiently</p>
            </div>
            <div className="audience-card">
              <div className="audience-icon">💼</div>
              <h3>Professionals</h3>
              <p>Convert training materials into digestible learning content</p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="benefits-section">
        <div className="container">
          <h2 className="section-title">Why Choose AI Study Agent?</h2>
          <div className="benefits-list">
            <div className="benefit-item">
              <div className="benefit-icon">⚡</div>
              <div className="benefit-content">
                <h3>Lightning Fast</h3>
                <p>Generate study materials in seconds, not hours</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">🎯</div>
              <div className="benefit-content">
                <h3>AI-Powered</h3>
                <p>Advanced AI adapts to your content and learning style</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">📱</div>
              <div className="benefit-content">
                <h3>Accessible Anywhere</h3>
                <p>Study materials available on any device, anytime</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">💾</div>
              <div className="benefit-content">
                <h3>Export & Save</h3>
                <p>Download as PDF or TXT for offline studying</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-grid">
            <div className="step-item">
              <div className="step-number">1</div>
              <h3>Upload Your Document</h3>
              <p>Drag & drop or select your PDF, DOCX, TXT, or image file</p>
            </div>
            <div className="step-item">
              <div className="step-number">2</div>
              <h3>AI Processing</h3>
              <p>Our AI analyzes your content and extracts key concepts</p>
            </div>
            <div className="step-item">
              <div className="step-number">3</div>
              <h3>Get Study Materials</h3>
              <p>Receive summaries, flashcards, and quizzes instantly</p>
            </div>
          </div>
          <div className="how-it-works-cta">
            <Link to="/docs" className="link-button">
              Learn More →
            </Link>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Core Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3>Smart Summaries</h3>
              <p>Get concise, well-structured summaries of your study materials</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎴</div>
              <h3>Flashcards</h3>
              <p>AI-generated Q&A pairs for quick and effective revision</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Interactive Quizzes</h3>
              <p>Test your knowledge with AI-created multiple-choice questions</p>
            </div>
          </div>
          <div className="features-cta">
            <Link to="/features" className="link-button">
              View All Features →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Transform Your Study Materials?</h2>
          <p>Start generating AI-powered study materials in seconds</p>
          <Link to="/app" className="cta-button primary large">
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;

