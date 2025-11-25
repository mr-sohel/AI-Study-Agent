# 🎓 AI Study Agent

Transform your lecture slides, PDFs, notes, and text into intelligent study materials using AI. This application automatically generates summaries, flashcards, and quizzes to make studying faster, more interactive, and personalized.

## ✨ Features

- 📄 **File Upload**: Support for PDF, DOCX, TXT, and image files (JPEG, PNG, GIF, WEBP)
- 📝 **Paste Text**: Copy and paste your study material directly into the app
- 📝 **Smart Summaries**: AI-generated condensed explanations in simple language
- 🎴 **Flashcards**: Interactive Q&A pairs for quick revision
- 📊 **Quizzes**: Multiple-choice questions with explanations
- 🌓 **Dark/Light Mode**: Eye-friendly theme switching
- 💾 **Export**: Download generated content as PDF or TXT
- 📱 **Responsive Design**: Works seamlessly on all devices

## 🛠️ Tech Stack

### Frontend
- React.js (Vite)
- Axios (API calls)
- jsPDF (PDF export)
- React Icons
- React Toastify (Notifications)
- React Router (Navigation)

### Backend
- Node.js
- Express.js
- MongoDB (Database)
- Multer (File uploads)
- pdf-parse (PDF extraction)
- mammoth (DOCX extraction)
- Google Generative AI (Gemini API)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

1. **Node.js** (v14 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version` and `npm --version`

2. **MongoDB** (v4.4 or higher) OR **MongoDB Atlas Account**
   - **Option A - Local MongoDB**: Download from [mongodb.com](https://www.mongodb.com/try/download/community)
   - **Option B - MongoDB Atlas** (Cloud - Recommended): Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

3. **Git** (for cloning the repository)
   - Download from [git-scm.com](https://git-scm.com/)

4. **Google Gemini API Key**
   - Get your free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## 🚀 Installation & Setup

### Step 1: Clone the Repository

Open your terminal (Command Prompt on Windows, Terminal on Mac/Linux) and run:

```bash
git clone <repository-url>
cd Smart-Study-main
```

**Windows Users**: You can also use Git Bash or PowerShell.

### Step 2: Install Node.js Dependencies

#### Option A: Install All Dependencies at Once (Recommended)

From the project root directory:

```bash
npm run install-all
```

This will install dependencies for both backend and frontend.

#### Option B: Install Separately

**Backend:**
```bash
cd backend
npm install
cd ..
```

**Frontend:**
```bash
cd frontend
npm install
cd ..
```

### Step 3: Set Up MongoDB

#### Option A: MongoDB Atlas (Cloud - Recommended for Beginners)

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Sign up for a free account
3. Create a new cluster (choose **M0 FREE** tier)
4. Create a database user:
   - Go to **Database Access** → **Add New Database User**
   - Choose a username and password (save the password!)
   - Set privileges to **"Read and write to any database"**
5. Whitelist your IP address:
   - Go to **Network Access** → **Add IP Address**
   - Click **"Allow Access from Anywhere"** (for development) or **"Add Current IP Address"**
6. Get your connection string:
   - Go to **Database** → Click **"Connect"** on your cluster
   - Choose **"Connect your application"**
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
   - Replace `<password>` with your actual password
   - Optionally add a database name: `mongodb+srv://username:password@cluster.mongodb.net/smart-study`

#### Option B: Local MongoDB

**Windows:**
1. Download MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. MongoDB will start automatically as a Windows service
4. Verify it's running: Open Services (Win+R → `services.msc`) and look for "MongoDB"

**macOS:**
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Verify it's running
mongod --version
```

**Linux (Ubuntu/Debian):**
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update and install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify it's running
sudo systemctl status mongod
```

### Step 4: Configure Environment Variables

1. **Create `.env` file in the `backend` directory:**

   **Windows (Command Prompt):**
   ```cmd
   cd backend
   type nul > .env
   ```

   **Windows (PowerShell):**
   ```powershell
   cd backend
   New-Item -Path .env -ItemType File
   ```

   **macOS/Linux:**
   ```bash
   cd backend
   touch .env
   ```

2. **Open the `.env` file** in any text editor and add the following:

   ```env
   # MongoDB Connection String
   # For MongoDB Atlas (Cloud):
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-study?retryWrites=true&w=majority
   
   # For Local MongoDB:
   # MONGODB_URI=mongodb://localhost:27017/smart-study
   
   # Gemini API Key (Required)
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # Server Port (Optional - defaults to 5000)
   PORT=5000
   ```

3. **Get your Gemini API Key:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Click **"Create API Key"**
   - Copy the key and paste it in your `.env` file

4. **Replace the placeholders:**
   - Replace `your_gemini_api_key_here` with your actual Gemini API key
   - Replace `username` and `password` in `MONGODB_URI` with your MongoDB credentials
   - Make sure there are **no spaces** around the `=` sign
   - Don't include quotes around the values

### Step 5: Run the Application

You have two options to run the application:

#### Option A: Run Both Servers Together (Recommended)

From the project root directory:

```bash
npm run dev
```

This will start both the backend and frontend servers simultaneously.

#### Option B: Run Servers Separately

**Terminal 1 - Backend Server:**

**Windows (Command Prompt):**
```cmd
cd backend
npm run dev
```

**Windows (PowerShell):**
```powershell
cd backend
npm run dev
```

**macOS/Linux:**
```bash
cd backend
npm run dev
```

You should see:
```
✅ Environment variables loaded
✅ MongoDB connected successfully
🚀 Server running on port 5000
```

**Terminal 2 - Frontend Server:**

**Windows (Command Prompt):**
```cmd
cd frontend
npm run dev
```

**Windows (PowerShell):**
```powershell
cd frontend
npm run dev
```

**macOS/Linux:**
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v6.x.x ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Step 6: Access the Application

Open your web browser and navigate to:
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

## 📖 Usage Guide

### 1. Upload a File

- Click on the **"Upload File"** tab
- Drag & drop a file or click to browse
- Supported formats: PDF, DOCX, TXT, Images (JPEG, PNG, GIF, WEBP)
- Maximum file size: 10MB
- Click **"Upload & Generate"**

### 2. Paste Text

- Click on the **"Paste Text"** tab
- Type or paste your study material (minimum 20 characters)
- Click **"Upload & Generate"**

### 3. Generate Study Materials

After uploading, you'll see three tabs:

- **📝 Summary**: Click to generate a concise summary of your material
- **🎴 Flashcards**: Click to generate interactive Q&A flashcards
- **📊 Quiz**: Click to generate multiple-choice questions

### 4. Study with Interactive Tools

- **Summary**: Read the AI-generated condensed version
- **Flashcards**: Click cards to flip between questions and answers
- **Quiz**: Select answers and submit to see your score with explanations

### 5. Export Your Materials

- Click the **TXT** or **PDF** buttons to download your generated content
- Use the **Copy** button to copy content to clipboard

### 6. Theme Toggle

- Click the sun/moon icon in the header to switch between light and dark themes

## 📁 Project Structure

```
Smart-Study-main/
├── api/                          # Vercel serverless functions
│   ├── generate/
│   │   ├── flashcards/
│   │   ├── quiz/
│   │   └── summary/
│   └── upload/
│       ├── index.js
│       └── text.js
├── backend/                      # Backend server
│   ├── models/                  # MongoDB models
│   │   └── Document.js
│   ├── routes/                  # API routes
│   │   ├── upload.js
│   │   └── generate.js
│   ├── utils/                   # Utility functions
│   │   ├── fileParser.js
│   │   └── geminiService.js
│   ├── server.js                # Express server
│   ├── package.json
│   └── .env                      # Environment variables (create this)
├── frontend/                     # React frontend
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── FileUpload.jsx
│   │   │   ├── ContentTabs.jsx
│   │   │   ├── SummaryView.jsx
│   │   │   ├── FlashcardsView.jsx
│   │   │   └── QuizView.jsx
│   │   ├── pages/               # Page components
│   │   ├── context/             # React context
│   │   ├── utils/               # Utility functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── package.json                  # Root package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

The `.env` file in the `backend` directory should contain:

```env
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

### API Configuration

The frontend automatically detects the API URL:
- **Development**: Uses `http://localhost:5000` (or `VITE_API_URL` if set)
- **Production**: Uses relative paths or `VITE_API_URL` environment variable

To set a custom API URL, create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://your-api-url.com
```

## 🐛 Troubleshooting

### MongoDB Connection Issues

**Problem**: "MongoDB connection error" or "MONGODB_URI environment variable is not set"

**Solutions**:
1. **Check your `.env` file:**
   - Make sure it's in the `backend` directory
   - Verify the file is named exactly `.env` (not `.env.txt`)
   - Check for typos in variable names

2. **For MongoDB Atlas:**
   - Verify your IP address is whitelisted in Network Access
   - Check that your username and password are correct
   - Ensure the connection string format is correct

3. **For Local MongoDB:**
   - **Windows**: Check if MongoDB service is running in Services
   - **macOS**: Run `brew services list` to check MongoDB status
   - **Linux**: Run `sudo systemctl status mongod`

### Backend Server Won't Start

**Problem**: Port 5000 is already in use

**Solutions**:
1. Change the port in `backend/.env`:
   ```env
   PORT=5001
   ```
2. Or stop the process using port 5000:
   - **Windows**: `netstat -ano | findstr :5000` then `taskkill /PID <pid> /F`
   - **macOS/Linux**: `lsof -ti:5000 | xargs kill`

### Frontend Build Errors

**Problem**: Module not found or dependency errors

**Solutions**:
1. Delete `node_modules` and reinstall:
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```
   **Windows**: Use `rmdir /s /q node_modules` instead of `rm -rf`

2. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

### File Upload Fails

**Problem**: "Failed to upload file" error

**Solutions**:
1. Check file size (must be under 10MB)
2. Verify file format is supported (PDF, DOCX, TXT, or images)
3. Ensure backend server is running
4. Check browser console for detailed error messages

### AI Generation Errors

**Problem**: "Failed to generate summary/flashcards/quiz"

**Solutions**:
1. Verify Gemini API key is correct in `.env`
2. Check API quota/limits at [Google AI Studio](https://makersuite.google.com/app/apikey)
3. Ensure internet connection is stable
4. Check backend console for detailed error messages

### CORS Errors

**Problem**: "CORS policy" errors in browser console

**Solutions**:
1. Ensure backend server is running
2. Check that frontend is using the correct API URL
3. Verify CORS is enabled in `backend/server.js`

## 🚀 Deployment

### Deploying to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Set environment variables in Vercel dashboard:
   - `MONGODB_URI`
   - `GEMINI_API_KEY`
4. Deploy!

See `DEPLOYMENT_CHECKLIST.md` for detailed deployment instructions.

## 📝 Available Scripts

### Root Directory

- `npm run install-all` - Install all dependencies (backend + frontend)
- `npm run dev` - Run both backend and frontend simultaneously
- `npm run backend` - Run only the backend server
- `npm run frontend` - Run only the frontend server

### Backend Directory

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Frontend Directory

- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🎨 Features in Detail

### AI-Powered Content Generation

The app uses Google's Gemini AI to:
- Analyze uploaded documents and text
- Extract key concepts and topics
- Generate educational content tailored for studying
- Support mathematical formulas with LaTeX rendering

### Smart File Parsing

Supports multiple file formats:
- **PDF**: Extracts text using pdf-parse (handles scanned PDFs with Gemini)
- **DOCX**: Extracts text using mammoth
- **TXT**: Direct text reading
- **Images**: JPEG, PNG, GIF, WEBP (processed with Gemini Vision)

### Responsive UI

- Modern gradient design
- Smooth animations and transitions
- Mobile-friendly interface
- Dark mode support
- Accessible design

## 🔒 Security Notes

- Never commit your `.env` file to version control
- Keep your API keys secure
- Use environment variables for all sensitive data
- The `.env` file is already in `.gitignore`

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 📧 Support

For support, please open an issue in the repository.

## 🙏 Acknowledgments

- Google Gemini AI for powerful content generation
- MongoDB for database solutions
- React and Vite communities
- All contributors and users

---

**Built with ❤️ using React, Node.js, and Google Gemini AI**

For detailed deployment instructions, see [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
