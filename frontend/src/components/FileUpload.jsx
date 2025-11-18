import React, { useState, useRef } from 'react';
import axios from 'axios';
import { FiUpload, FiFile, FiType, FiImage, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import API_BASE_URL from '../utils/api';
import './FileUpload.css';
import './ContentView.css';

const FileUpload = ({ onUploadSuccess, onTextSummaryGenerated }) => {
  const [activeTab, setActiveTab] = useState('file'); // 'file' or 'text'
  const [file, setFile] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [textSummary, setTextSummary] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Please upload a PDF, DOCX, TXT, or image file (JPEG, PNG, GIF, WEBP)');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (activeTab === 'file') {
      if (!file) {
        toast.error('Please select a file first');
        return;
      }

      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        toast.success('File uploaded successfully!');
        onUploadSuccess(response.data.documentId, file.name);
        setFile(null);
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(error.response?.data?.error || 'Failed to upload file');
      } finally {
        setUploading(false);
      }
    } else {
      // Text input mode
      if (!textInput.trim()) {
        toast.error('Please enter some text');
        return;
      }

      if (textInput.trim().length < 20) {
        toast.error('Please enter at least 20 characters of text');
        return;
      }

      setUploading(true);
      try {
        // Upload text
        const uploadResponse = await axios.post(`${API_BASE_URL}/api/upload/text`, {
          text: textInput.trim()
        });

        toast.success('Text uploaded successfully!');
        const documentId = uploadResponse.data.documentId;

        // Automatically generate summary
        setGeneratingSummary(true);
        try {
          const summaryResponse = await axios.post(`${API_BASE_URL}/api/generate/summary/${documentId}`);
          const summary = summaryResponse.data.summary;
          setTextSummary(summary);
          
          // Call callback if provided
          if (onTextSummaryGenerated) {
            onTextSummaryGenerated(summary, documentId);
          }
          
          toast.success('Answer generated successfully!');
        } catch (summaryError) {
          console.error('Summary generation error:', summaryError);
          toast.error(summaryError.response?.data?.error || 'Failed to generate answer');
        } finally {
          setGeneratingSummary(false);
        }

        // Don't call onUploadSuccess for text input - we show summary inline
        // onUploadSuccess(documentId, 'Text Document');
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(error.response?.data?.error || 'Failed to upload text');
      } finally {
        setUploading(false);
      }
    }
  };

  // Smart text formatting with LaTeX support and beautiful styling
  const formatText = (text) => {
    const lines = text.split('\n');
    const formatted = [];
    let inList = false;
    let listItems = [];
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      if (!trimmed) {
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
        inList = true;
        const content = trimmed.replace(/^[-•*]\s*/, '');
        listItems.push(
          <li key={index} className="summary-list-item">
            {formatInlineContent(content, index)}
          </li>
        );
      } else if (/^\d+\.\s/.test(trimmed)) {
        inList = true;
        const content = trimmed.replace(/^\d+\.\s*/, '');
        listItems.push(
          <li key={index} className="summary-list-item numbered">
            {formatInlineContent(content, index)}
          </li>
        );
      } else {
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
    
    if (inList && listItems.length > 0) {
      formatted.push(
        <ul key={`list-final`} className="summary-list">
          {listItems}
        </ul>
      );
    }
    
    return formatted;
  };
  
  const formatInlineContent = (text, baseKey) => {
    const parts = [];
    let keyIndex = 0;
    let lastIndex = 0;
    const matches = [];
    
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
    
    const boldRegex = /\*\*([^*]+?)\*\*/g;
    while ((match = boldRegex.exec(text)) !== null) {
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
    
    const italicRegex = /\*([^*\n]+?)\*/g;
    while ((match = italicRegex.exec(text)) !== null) {
      const isInMath = matches.some(m => m.type === 'math' && match.index >= m.start && match.index < m.end);
      const isInBold = matches.some(m => m.type === 'bold' && match.index >= m.start && match.index < m.end);
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
    
    matches.sort((a, b) => a.start - b.start);
    
    matches.forEach((match) => {
      if (match.start > lastIndex) {
        const beforeText = text.substring(lastIndex, match.start);
        parts.push(<span key={`${baseKey}-text-${keyIndex++}`}>{beforeText}</span>);
      }
      
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
    
    if (lastIndex < text.length) {
      parts.push(<span key={`${baseKey}-text-${keyIndex++}`}>{text.substring(lastIndex)}</span>);
    }
    
    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="file-upload-container">
      <div className="upload-tabs">
        <button
          className={`tab-btn ${activeTab === 'file' ? 'active' : ''}`}
          onClick={() => setActiveTab('file')}
        >
          <FiUpload size={20} />
          <span>Upload File</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`}
          onClick={() => setActiveTab('text')}
        >
          <FiType size={20} />
          <span>Paste Text</span>
        </button>
      </div>

      {activeTab === 'file' ? (
        <>
          <div
            className={`upload-area ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp"
              style={{ display: 'none' }}
            />
            
            <div className="upload-icon">
              <FiUpload size={48} />
            </div>
            
            <h3>Drag & Drop your file here</h3>
            <p>or click to browse</p>
            <p className="file-types">Supported: PDF, DOCX, TXT, Images (JPEG, PNG, GIF, WEBP) - Max 10MB</p>
          </div>

          {file && (
            <div className="selected-file">
              {file.type.startsWith('image/') ? (
                <FiImage size={24} />
              ) : (
                <FiFile size={24} />
              )}
              <span className="file-name">{file.name}</span>
              <span className="file-size">
                ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </span>
              <button
                className="remove-file"
                onClick={() => setFile(null)}
              >
                ×
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-input-area">
          <textarea
            className="text-input"
            placeholder="Ask a question or type your prompt here... (Minimum 20 characters)"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            rows={12}
          />
          <div className="text-input-footer">
            <span className="char-count">{textInput.length} characters</span>
          </div>
        </div>
      )}

      {(file || (activeTab === 'text' && textInput.trim())) && !textSummary && (
        <button
          className="upload-btn"
          onClick={handleUpload}
          disabled={uploading || generatingSummary}
        >
          {(uploading || generatingSummary) ? (
            <>
              <div className="loading"></div>
              <span>{uploading ? 'Uploading...' : 'Generating Summary...'}</span>
            </>
          ) : (
            <>
              <FiUpload size={20} />
              <span>{activeTab === 'text' ? 'Get Answer' : 'Upload & Generate'}</span>
            </>
          )}
        </button>
      )}

      {/* Display summary inline for text input */}
      {activeTab === 'text' && textSummary && (
        <div className="text-summary-container">
          <div className="text-summary-header">
            <h3>💬 AI Response</h3>
            <button
              className="close-summary-btn"
              onClick={() => {
                setTextSummary(null);
                setTextInput('');
              }}
            >
              <FiX size={20} />
            </button>
          </div>
          <div className="text-summary-content">
            {formatText(textSummary)}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;


