# 🎓 AI Study Agent

Transform your lecture slides, PDFs, and notes into intelligent study materials using AI. This application automatically generates summaries, flashcards, and quizzes to make studying faster, more interactive, and personalized.

## ✨ Features

- 📄 **File Upload**: Support for PDF, DOCX, and TXT files
- 📝 **Smart Summaries**: AI-generated condensed explanations in simple language
- 🎴 **Flashcards**: Interactive Q&A pairs for quick revision
- 📊 **Quizzes**: Multiple-choice questions with explanations
- 🌓 **Dark/Light Mode**: Eye-friendly theme switching
- 💾 **Export**: Download generated content as PDF or TXT
- 📱 **Responsive Design**: Works seamlessly on all devices

## 🛠️ Tech Stack

### Frontend
- React.js
- Axios (API calls)
- jsPDF (PDF export)
- React Icons
- React Toastify (Notifications)

### Backend
- Node.js
- Express.js
- MongoDB (Database)
- Multer (File uploads)
- pdf-parse (PDF extraction)
- mammoth (DOCX extraction)
- Google Generative AI (Gemini API)

## 📋 Prerequisites

Before you begin, ensure you have installed:
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- A Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## 🚀 Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd ai-study-materials
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your configuration:
# - GEMINI_API_KEY=your_gemini_api_key_here
# - MONGODB_URI=mongodb://localhost:27017/ai-study-materials
# - PORT=5000
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install
```

### 4. Start MongoDB

```bash
# Make sure MongoDB is running on your system
# Windows: Start MongoDB service
# Mac/Linux: mongod
```

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

The application will open at `http://localhost:3000`

## 📖 Usage Guide

1. **Upload a File**
   - Click or drag & drop a PDF, DOCX, or TXT file (max 10MB)
   - Click "Upload & Generate"

2. **View Generated Content**
   - Navigate between tabs: Summary, Flashcards, Quiz
   - Content is generated automatically for each tab

3. **Study with Interactive Tools**
   - **Summary**: Read condensed version of your notes
   - **Flashcards**: Click to flip between questions and answers
   - **Quiz**: Select answers and submit to see your score

4. **Export Your Materials**
   - Click the download buttons to export as TXT or PDF
   - Copy content to clipboard for easy sharing

5. **Theme Toggle**
   - Click the sun/moon icon in the header to switch themes

## 📁 Project Structure

```
ai-study-materials/
├── backend/
│   ├── models/
│   │   └── Document.js
│   ├── routes/
│   │   ├── upload.js
│   │   └── generate.js
│   ├── utils/
│   │   ├── fileParser.js
│   │   └── geminiService.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js
│   │   │   ├── Header.js
│   │   │   ├── FileUpload.js
│   │   │   ├── ContentTabs.js
│   │   │   ├── SummaryView.js
│   │   │   ├── FlashcardsView.js
│   │   │   └── QuizView.js
│   │   ├── context/
│   │   │   └── ThemeContext.js
│   │   ├── utils/
│   │   │   └── exportUtils.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-study-materials
GEMINI_API_KEY=your_gemini_api_key_here
```

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to your `.env` file

## 🎨 Features in Detail

### AI-Powered Content Generation

The app uses Google's Gemini AI to:
- Analyze uploaded documents
- Extract key concepts and topics
- Generate educational content tailored for studying

### Smart File Parsing

Supports multiple file formats:
- **PDF**: Extracts text using pdf-parse
- **DOCX**: Extracts text using mammoth
- **TXT**: Direct text reading

### Responsive UI

- Modern gradient design
- Smooth animations
- Mobile-friendly interface
- Dark mode support

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Make sure MongoDB is running
# Check connection string in .env
```

### File Upload Fails
- Ensure file is under 10MB
- Check file format (PDF, DOCX, or TXT only)
- Verify backend server is running

### AI Generation Errors
- Verify Gemini API key is correct
- Check API quota/limits
- Ensure internet connection

## 🚀 Future Enhancements

- [ ] User authentication and accounts
- [ ] Save study sessions
- [ ] Collaborative study groups
- [ ] More export formats (Markdown, Anki)
- [ ] Voice-to-text for handwritten notes
- [ ] Mobile app version
- [ ] Advanced analytics and progress tracking

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Support

For support, please open an issue in the repository.

---

Built with ❤️ using React, Node.js, and Google Gemini AI
