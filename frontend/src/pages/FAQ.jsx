import React, { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import './FAQ.css';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'What file formats are supported?',
      answer: 'We support PDF, DOCX, TXT, and image files (JPEG, PNG, GIF, WEBP). Files must be under 10MB in size.'
    },
    {
      question: 'How accurate are the generated summaries?',
      answer: 'Our AI uses advanced natural language processing to extract key information. While results are highly accurate, we recommend reviewing generated content for important materials.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, your documents are processed securely and privately. We do not store your files permanently and all processing is done securely.'
    },
    {
      question: 'Can I export my study materials?',
      answer: 'Yes! You can export summaries, flashcards, and quizzes as PDF or TXT files for offline studying.'
    },
    {
      question: 'How long does it take to generate materials?',
      answer: 'Most documents are processed in seconds. Larger or more complex documents may take up to a minute.'
    },
    {
      question: 'Is there a limit on how many documents I can process?',
      answer: 'Currently, there are no strict limits. However, we recommend processing documents one at a time for the best experience.'
    },
    {
      question: 'Can I use this for commercial purposes?',
      answer: 'The platform is designed for educational use. Please review our terms of service for commercial usage guidelines.'
    },
    {
      question: 'Do I need to create an account?',
      answer: 'No account is required to use the basic features. Simply upload your document and start generating study materials.'
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      <div className="page-header">
        <div className="container">
          <h1>Frequently Asked Questions</h1>
          <p>Everything you need to know about AI Study Agent</p>
        </div>
      </div>

      <div className="container">
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className={`faq-item ${openIndex === index ? 'open' : ''}`}>
              <button
                className="faq-question"
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
              >
                <span>{faq.question}</span>
                <FiChevronDown className="faq-icon" />
              </button>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;

