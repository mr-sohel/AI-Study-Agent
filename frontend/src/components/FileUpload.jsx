import React, { useState, useRef } from 'react';
import axios from 'axios';
import { FiUpload, FiFile, FiType, FiImage } from 'react-icons/fi';
import { toast } from 'react-toastify';
import API_BASE_URL from '../utils/api';
import './FileUpload.css';
import './ContentView.css';

const FileUpload = ({ onUploadSuccess }) => {
  const [activeTab, setActiveTab] = useState('file'); // 'file' or 'text'
  const [file, setFile] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [uploading, setUploading] = useState(false);
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

        // Call onUploadSuccess to show ContentTabs (same as file upload)
        if (onUploadSuccess && documentId) {
          onUploadSuccess(documentId, 'Text Document');
        }
        
        // Clear text input after successful upload
        setTextInput('');
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(error.response?.data?.error || 'Failed to upload text');
      } finally {
        setUploading(false);
      }
    }
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

      {(file || (activeTab === 'text' && textInput.trim())) && (
        <button
          className="upload-btn"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <div className="loading"></div>
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <FiUpload size={20} />
              <span>Upload & Generate</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default FileUpload;


