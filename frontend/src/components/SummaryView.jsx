import React, { useState } from 'react';
import axios from 'axios';
import { FiDownload, FiCopy, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { exportToText, exportToPDF } from '../utils/exportUtils';
import API_BASE_URL from '../utils/api';
import './ContentView.css';

const SummaryView = ({ documentId, content, onContentGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateSummary = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/generate/summary/${documentId}`);
      onContentGenerated(response.data.summary);
      toast.success('Summary generated successfully!');
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportText = () => {
    exportToText(content, 'summary.txt');
    toast.success('Exported as text file!');
  };

  const handleExportPDF = () => {
    exportToPDF('Summary', content, 'summary.pdf');
    toast.success('Exported as PDF!');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Generating your summary with AI...</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="empty-state">
        <p>No summary generated yet.</p>
        <button className="generate-btn" onClick={generateSummary}>
          Generate Summary
        </button>
      </div>
    );
  }

  // Smart text formatting with LaTeX support and beautiful styling
  const formatText = (text) => {
    const lines = text.split('\n');
    const formatted = [];
    let inList = false;
    let listItems = [];
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      if (!trimmed) {
        // Close any open list before adding blank line
        if (inList && listItems.length > 0) {
          formatted.push(
            <ul key={`list-${index}`} className="summary-list">
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        formatted.push(<div key={`space-${index}`} className="summary-spacer" />);
        return;
      }
      
      // Detect LaTeX block math ($$...$$)
      const blockMathMatch = trimmed.match(/^\$\$(.+?)\$\$$/);
      if (blockMathMatch) {
        if (inList) {
          formatted.push(
            <ul key={`list-${index}`} className="summary-list">
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        try {
          formatted.push(
            <div key={index} className="summary-math-block">
              <BlockMath math={blockMathMatch[1]} />
            </div>
          );
        } catch (e) {
          formatted.push(
            <div key={index} className="summary-math-block summary-error">
              {trimmed}
            </div>
          );
        }
        return;
      }
      
      // Detect headings (lines starting with #, ##, ###)
      if (trimmed.startsWith('###')) {
        if (inList) {
          formatted.push(
            <ul key={`list-${index}`} className="summary-list">
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        formatted.push(
          <h3 key={index} className="summary-heading-3">
            {formatInlineContent(trimmed.replace(/^###\s*/, ''), index)}
          </h3>
        );
      } else if (trimmed.startsWith('##')) {
        if (inList) {
          formatted.push(
            <ul key={`list-${index}`} className="summary-list">
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        formatted.push(
          <h2 key={index} className="summary-heading-2">
            {formatInlineContent(trimmed.replace(/^##\s*/, ''), index)}
          </h2>
        );
      } else if (trimmed.startsWith('#')) {
        if (inList) {
          formatted.push(
            <ul key={`list-${index}`} className="summary-list">
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        formatted.push(
          <h1 key={index} className="summary-heading-1">
            {formatInlineContent(trimmed.replace(/^#\s*/, ''), index)}
          </h1>
        );
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
        // Bullet points
        inList = true;
        const content = trimmed.replace(/^[-•*]\s*/, '');
        listItems.push(
          <li key={index} className="summary-list-item">
            {formatInlineContent(content, index)}
          </li>
        );
      } else if (/^\d+\.\s/.test(trimmed)) {
        // Numbered list
        inList = true;
        const content = trimmed.replace(/^\d+\.\s*/, '');
        listItems.push(
          <li key={index} className="summary-list-item numbered">
            {formatInlineContent(content, index)}
          </li>
        );
      } else {
        // Regular paragraph
        if (inList) {
          formatted.push(
            <ul key={`list-${index}`} className="summary-list">
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        
        formatted.push(
          <p key={index} className="summary-paragraph">
            {formatInlineContent(trimmed, index)}
          </p>
        );
      }
    });
    
    // Close any remaining list
    if (inList && listItems.length > 0) {
      formatted.push(
        <ul key={`list-final`} className="summary-list">
          {listItems}
        </ul>
      );
    }
    
    return formatted;
  };
  
  // Format inline content with LaTeX, bold, italic, and colors
  const formatInlineContent = (text, baseKey) => {
    const parts = [];
    let keyIndex = 0;
    let lastIndex = 0;
    const matches = [];
    
    // Find LaTeX inline math ($...$)
    const inlineMathRegex = /\$([^$]+?)\$/g;
    let match;
    while ((match = inlineMathRegex.exec(text)) !== null) {
      matches.push({ 
        type: 'math', 
        start: match.index, 
        end: match.index + match[0].length, 
        content: match[1] 
      });
    }
    
    // Find bold text (**text**)
    const boldRegex = /\*\*([^*]+?)\*\*/g;
    while ((match = boldRegex.exec(text)) !== null) {
      // Check if it's not part of a math expression
      const isInMath = matches.some(m => m.type === 'math' && match.index >= m.start && match.index < m.end);
      if (!isInMath) {
        matches.push({ 
          type: 'bold', 
          start: match.index, 
          end: match.index + match[0].length, 
          content: match[1] 
        });
      }
    }
    
    // Find italic text (*text*) - but not **text** (which is bold)
    // We need to find single * that are not part of double *
    const italicRegex = /\*([^*\n]+?)\*/g;
    while ((match = italicRegex.exec(text)) !== null) {
      const isInMath = matches.some(m => m.type === 'math' && match.index >= m.start && match.index < m.end);
      const isInBold = matches.some(m => m.type === 'bold' && match.index >= m.start && match.index < m.end);
      
      // Check if this is actually part of a bold (**text**) - look before and after
      const beforeChar = text[match.index - 1] || '';
      const afterEnd = match.index + match[0].length;
      const afterChar = text[afterEnd] || '';
      const isBoldMarker = (beforeChar === '*' || afterChar === '*');
      
      if (!isInMath && !isInBold && !isBoldMarker) {
        matches.push({ 
          type: 'italic', 
          start: match.index, 
          end: match.index + match[0].length, 
          content: match[1] 
        });
      }
    }
    
    // Sort matches by position
    matches.sort((a, b) => a.start - b.start);
    
    // Build formatted parts
    matches.forEach((match) => {
      // Add text before this match
      if (match.start > lastIndex) {
        const beforeText = text.substring(lastIndex, match.start);
        parts.push(<span key={`${baseKey}-text-${keyIndex++}`}>{beforeText}</span>);
      }
      
      // Add the formatted match
      if (match.type === 'math') {
        try {
          parts.push(
            <InlineMath 
              key={`${baseKey}-math-${keyIndex++}`} 
              math={match.content}
              className="summary-math-inline"
            />
          );
        } catch (e) {
          parts.push(<span key={`${baseKey}-math-${keyIndex++}`} className="summary-error">${match.content}$</span>);
        }
      } else if (match.type === 'bold') {
        parts.push(
          <span key={`${baseKey}-bold-${keyIndex++}`} className="summary-bold">
            {formatInlineContent(match.content, `${baseKey}-bold-${keyIndex}`)}
          </span>
        );
      } else if (match.type === 'italic') {
        parts.push(
          <span key={`${baseKey}-italic-${keyIndex++}`} className="summary-italic">
            {formatInlineContent(match.content, `${baseKey}-italic-${keyIndex}`)}
          </span>
        );
      }
      
      lastIndex = match.end;
    });
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(<span key={`${baseKey}-text-${keyIndex++}`}>{text.substring(lastIndex)}</span>);
    }
    
    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="content-view">
      <div className="content-header">
        <h2>📝 Summary</h2>
        <div className="action-buttons">
          <button className="action-btn" onClick={handleCopy}>
            {copied ? <FiCheck size={18} /> : <FiCopy size={18} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
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
      <div className="content-body">
        <div className="summary-text">
          {formatText(content)}
        </div>
      </div>
    </div>
  );
};

export default SummaryView;


