# Aura-audit
# SkillProof — Implementation Plan
### *AI-Powered Skill Verification Platform via Video Assessment*
> Stack: React + Node.js + Gemini Vision API | Vibe-Code Ready

---

## 🧠 Core Concept

A candidate records a short task video → Gemini Vision analyzes real skill execution → Tamper-proof digital badge is issued → Employers verify via QR code.

**No fake certificates. No biased interviews. Just proof of actual ability.**

---

## 🎯 Priority Industries

| Priority | Industry | Example Task to Record |
|----------|----------|------------------------|
| 1 | **IT / Software** | Build a React component, write a REST API, debug a live error |
| 2 | **Healthcare** | Wound dressing, BP measurement technique |
| 3 | **Electrical / ITI** | Wiring task, circuit connection |
| 4 | **Hospitality** | Table setup, food plating |
| 5 | **Construction** | Tile laying, plastering |

---

## 🏗️ System Architecture

```
[React Frontend]
      |
      |── Candidate Portal (record/upload video + profile)
      |── Employer Portal (search candidates, verify badge via QR)
      |── Admin Dashboard (manage skill categories & rubrics)
      |
[Node.js + Express Backend]
      |
      |── /api/assess      → sends video to Gemini Vision
      |── /api/badge       → generates + stores badge (UUID)
      |── /api/verify/:id  → public QR verification endpoint
      |── /api/auth        → JWT auth for candidates & employers
      |
[Gemini 1.5 Flash Vision API]
      |── Receives video frames + skill rubric prompt
      |── Returns structured JSON assessment
      |
[MongoDB]
      |── Users, Assessments, Badges, Skills
```

---

## 📁 Folder Structure

```
skillproof/
├── client/                  # React Frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── CandidateDashboard.jsx
│   │   │   ├── RecordTask.jsx
│   │   │   ├── BadgeView.jsx
│   │   │   ├── EmployerDashboard.jsx
│   │   │   └── VerifyBadge.jsx
│   │   ├── components/
│   │   │   ├── VideoRecorder.jsx
│   │   │   ├── SkillBadge.jsx
│   │   │   ├── ScoreCard.jsx
│   │   │   └── QRDisplay.jsx
│   │   └── App.jsx
│
├── server/                  # Node.js Backend
│   ├── routes/
│   │   ├── assess.js
│   │   ├── badge.js
│   │   ├── verify.js
│   │   └── auth.js
│   ├── controllers/
│   │   ├── geminiController.js
│   │   └── badgeController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Assessment.js
│   │   └── Badge.js
│   ├── prompts/
│   │   └── skillRubrics.js   # The Gemini prompts per skill
│   └── index.js
│
└── README.md
```

---

## 🔄 Implementation Phases

### Phase 1 — Foundation (Day 1)
- [ ] Set up React app with React Router
- [ ] Set up Node.js + Express server
- [ ] Connect MongoDB (use MongoDB Atlas free tier)
- [ ] Implement JWT auth (candidate + employer roles)
- [ ] Basic landing page + login/register

### Phase 2 — Core Feature: Video Assessment (Day 1-2)
- [ ] Build `VideoRecorder.jsx` using MediaRecorder API (browser built-in)
- [ ] Upload video to backend (multipart form)
- [ ] Backend extracts frames OR sends video to Gemini Vision
- [ ] Gemini returns structured JSON score
- [ ] Display `ScoreCard.jsx` with results

### Phase 3 — Badge System (Day 2)
- [ ] Generate UUID-based badge on passing score (>70%)
- [ ] Store badge in MongoDB with: candidateId, skill, score, date, geminiReport
- [ ] Generate QR code (use `qrcode` npm package) pointing to `/verify/:badgeId`
- [ ] Build public `VerifyBadge.jsx` page (no login needed for employers)

### Phase 4 — Employer Portal (Day 2-3)
- [ ] Employer registration/login
- [ ] Search candidates by skill + minimum score
- [ ] View candidate badge + full Gemini assessment report
- [ ] QR scanner on mobile (use `react-qr-reader`)

### Phase 5 — Polish for Demo (Day 3)
- [ ] Add IT-specific skill categories with proper rubrics
- [ ] Make the demo video assessment work live on stage
- [ ] Mobile responsive UI
- [ ] Seed dummy data for employer demo

---

## 💻 IT Industry — Skill Categories & What Gemini Watches

### 1. Frontend Development
**Task:** Build a basic React component with props and state in 5 minutes (screen record)
```
Gemini evaluates:
- Component structure correctness
- Proper use of useState/useEffect
- Clean readable code style
- No console errors visible
- Responsive design awareness
```

### 2. Backend / API Development
**Task:** Write a REST API endpoint with Express (screen record)
```
Gemini evaluates:
- Correct HTTP methods used
- Error handling present
- Clean route structure
- Proper status codes returned
- No hardcoded secrets visible
```

### 3. Debugging
**Task:** Fix a broken piece of code shown on screen within 3 minutes
```
Gemini evaluates:
- Speed of identifying root cause
- Correct fix applied
- Explanation verbalized while debugging
- Console usage efficiency
```

### 4. Database Querying (SQL/NoSQL)
**Task:** Write queries on a visible schema (screen record)
```
Gemini evaluates:
- Query correctness
- Use of indexes/optimization awareness
- Joins/aggregations handled correctly
```

### 5. DevOps Basics
**Task:** Write a Dockerfile or deploy to a platform (screen record)
```
Gemini evaluates:
- Correct base image selection
- Environment variable handling
- Port exposure correct
- Multi-stage build awareness
```

---

## 🤖 Gemini Prompt System (The Secret Sauce)

### Master Rubric Prompt (in `skillRubrics.js`)

```javascript
const getAssessmentPrompt = (skillName, industry) => `
You are an expert ${industry} skill assessor with 15 years of experience.

Watch this video carefully. The candidate is demonstrating: ${skillName}

Evaluate the candidate on these dimensions and return ONLY valid JSON:

{
  "overallScore": <0-100>,
  "passed": <true if score >= 70>,
  "skillLevel": "<Beginner | Intermediate | Advanced | Expert>",
  "dimensions": {
    "technicalAccuracy": { "score": <0-100>, "observation": "<what you saw>" },
    "efficiency": { "score": <0-100>, "observation": "<what you saw>" },
    "bestPractices": { "score": <0-100>, "observation": "<what you saw>" },
    "problemSolving": { "score": <0-100>, "observation": "<what you saw>" }
  },
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<area 1>", "<area 2>"],
  "employerSummary": "<2 sentence plain English summary for a hiring manager>",
  "verifiedSkills": ["<specific skill tag>", "<specific skill tag>"]
}

Be strict. Be honest. A false positive hurts real employers.
Return ONLY the JSON object. No markdown. No explanation.
`;
```

---

## 🛠️ Key NPM Packages

### Backend
```bash
npm install express mongoose jsonwebtoken bcryptjs multer 
npm install @google/generative-ai qrcode uuid cors dotenv
```

### Frontend
```bash
npm install react-router-dom axios react-qr-reader
npm install qrcode.react lucide-react
```

---

## 🌐 Environment Variables (.env)

```
GEMINI_API_KEY=your_gemini_api_key_here
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_here
PORT=5000
CLIENT_URL=http://localhost:3000
```

---

---

## ✅ Implemented Features

### Core Assessment System
- ✅ **Video-based Skill Assessment** - Gemini Vision API analyzes real-time task execution
- ✅ **Adaptive Assessment Engine** - Adjusts difficulty based on candidate performance
- ✅ **Digital Badge System** - UUID-based tamper-proof badges with QR verification
- ✅ **Comprehensive Rubrics** - Industry-specific evaluation criteria for IT, Healthcare, and more

### Gamification & Engagement
- ✅ **Puzzle-Based Assessment** - Interactive coding and logic puzzles with instant feedback
- ✅ **Task Submission System** - Project-based evaluation with file uploads
- ✅ **Leaderboard** - Real-time ranking by skill, score, and category
- ✅ **Arena Mode** - Competitive skill battles between candidates (real-time multiplayer)
- ✅ **Badge Collections** - Track and showcase earned badges

### Recruitment Tools
- ✅ **CV Analysis** - AI-powered CV screening using Gemini
- ✅ **Candidate Search** - Filter by skill, score, competency level
- ✅ **Employer Dashboard** - View verified assessments and candidate reports
- ✅ **Skill Verification** - Public QR code badge verification
- ✅ **Analytics Dashboard** - Employer insights on candidate quality

### Additional Features
- ✅ **Multi-industry Support** - IT, Healthcare, Electrical, Hospitality, Construction
- ✅ **JWT Authentication** - Role-based access (Candidate, Employer, Admin)
- ✅ **Assessment History** - Full audit trail of all assessments
- ✅ **Skill Tags** - Verified skill categorization from AI analysis
- ✅ **Performance Metrics** - Dimension-based scoring (accuracy, efficiency, best practices)

---

## 🚀 Upcoming Features

### AI & Machine Learning
- [ ] **Proctoring System** - AI-powered cheating detection via webcam monitoring
- [ ] **Skill Recommendations** - ML-based learning path suggestions
- [ ] **Resume Enhancement** - Auto-generate optimized resumes from verified skills
- [ ] **Interview Coaching** - AI feedback for interview preparation

### Social & Networking
- [ ] **Skill Marketplace** - Connect candidates with projects/internships
- [ ] **Peer Mentoring** - Connect experienced professionals with learners
- [ ] **Skill Communities** - Interest-based groups and forums
- [ ] **Social Sharing** - LinkedIn integration for badge sharing

### Advanced Analytics
- [ ] **Predictive Analytics** - Forecast candidate success rates
- [ ] **Heat Maps** - Identify trending vs. rare skills
- [ ] **Industry Reports** - Market insights on skill demand
- [ ] **Team Analytics** - Track team skill composition

### Compliance & Enterprise
- [ ] **ISO 27001 Compliance** - Enterprise-grade security
- [ ] **SSO Integration** - SAML/OAuth for enterprise login
- [ ] **Bulk Assessment** - Certify teams/cohorts at scale
- [ ] **Custom Rubrics** - Enterprise-defined assessment criteria

---

# 🎯 VIBE CODING PROMPTS
### *Paste these directly into Cursor / Windsurf / GitHub Copilot Chat*

---

## PROMPT 1 — Project Scaffold

```
Create a full-stack project called "SkillProof" with:
- React frontend (Vite) in a /client folder
- Node.js + Express backend in a /server folder
- MongoDB with Mongoose
- JWT authentication with two roles: "candidate" and "employer"
- CORS configured between localhost:3000 and localhost:5000
- .env file support with dotenv
- Basic folder structure:
  server/routes/, server/controllers/, server/models/, server/prompts/
  client/src/pages/, client/src/components/

Create User model with: name, email, password (hashed), role, createdAt
Create register and login endpoints with JWT response
Create a protected middleware to verify JWT on private routes
```

---

## PROMPT 2 — Video Recorder Component

```
Create a React component called VideoRecorder.jsx that:
- Uses the browser's MediaRecorder API to record from the user's webcam + screen (for IT skills, prefer screen + audio)
- Shows a live preview of the recording
- Has a Start Recording / Stop Recording button
- Countdown timer visible during recording (max 5 minutes)
- After stopping, shows the recorded video for review
- Has a "Submit for Assessment" button that uploads the video as multipart/form-data to POST /api/assess
- Shows a loading spinner with message "Gemini is evaluating your skill..." during upload
- On success, navigates to /results/:assessmentId
- Use clean modern UI with Tailwind CSS
```

---

## PROMPT 3 — Gemini Vision Assessment Endpoint

```
Create a Node.js Express route POST /api/assess that:
- Accepts a multipart video file upload using multer (store in /uploads)
- Accepts skillName and industry as body fields
- Reads the skill rubric prompt from server/prompts/skillRubrics.js
- Sends the video file to Google Gemini 1.5 Flash using @google/generative-ai SDK
  (use GoogleGenerativeAI, model: gemini-1.5-flash, with fileManager to upload video first)
- Parses the JSON response from Gemini
- Saves the assessment to MongoDB Assessment model:
  { candidateId, skillName, industry, score, passed, dimensions, strengths, improvements, employerSummary, verifiedSkills, videoPath, createdAt }
- If passed (score >= 70), automatically calls the badge generation function
- Returns the full assessment object + badgeId if generated
- Use try/catch with proper error messages
```

---

## PROMPT 4 — Badge Generation & QR Code

```
Create a badge system in Node.js:

1. Badge model in MongoDB:
{ badgeId (UUID), candidateId, candidateName, skillName, industry, score, skillLevel, verifiedSkills, issuedAt, geminiSummary }

2. POST /api/badge/:assessmentId endpoint:
- Fetches the assessment
- Creates a badge with UUID as badgeId
- Returns the badge data

3. GET /api/verify/:badgeId endpoint (PUBLIC - no auth required):
- Returns full badge data for employer verification
- This is what the QR code points to

4. In React, create BadgeView.jsx:
- Shows a beautiful digital badge card with:
  - Candidate name
  - Skill name + level (Beginner/Intermediate/Advanced/Expert)
  - Score with circular progress indicator
  - List of verified skill tags
  - Issue date
  - QR code (use qrcode.react) pointing to /verify/:badgeId
  - "Download Badge" button that saves as PNG
- Use a professional design with deep blue and gold color scheme
```

---

## PROMPT 5 — IT Skill Rubrics

```
Create server/prompts/skillRubrics.js with a function getAssessmentPrompt(skillName, industry) that returns a detailed Gemini prompt.

Include specific rubric dimensions for these IT skills:
1. "React Frontend Development" - evaluate: component structure, hooks usage, code cleanliness, no errors
2. "Node.js API Development" - evaluate: route structure, error handling, status codes, security basics
3. "JavaScript Debugging" - evaluate: root cause identification speed, fix correctness, console usage
4. "SQL Database Querying" - evaluate: query correctness, joins, optimization awareness
5. "Python Scripting" - evaluate: syntax correctness, use of functions, efficiency, libraries
6. "DevOps / Docker" - evaluate: Dockerfile correctness, environment variables, port config

The prompt must instruct Gemini to return ONLY a JSON object with:
overallScore (0-100), passed (bool, true if >=70), skillLevel, dimensions (object with score+observation per dimension), strengths (array), improvements (array), employerSummary (string), verifiedSkills (array of tags)

Make Gemini strict and honest - no inflation of scores.
```

---

## PROMPT 6 — Employer Dashboard

```
Create an Employer Dashboard in React (EmployerDashboard.jsx) that:
- Protected route (requires employer JWT)
- Shows a search bar to filter candidates by: skill name, minimum score, skill level
- Fetches GET /api/candidates?skill=&minScore=&level= from backend
- Displays candidate cards showing: name, skill, score badge, top 3 verified skill tags, "View Full Report" button
- Clicking "View Full Report" opens a modal with:
  - Full Gemini assessment breakdown (dimensions with scores)
  - Strengths and improvement areas
  - The QR badge
  - "Contact Candidate" button (shows email)
- Also add a QR Scanner tab using react-qr-reader that:
  - Activates camera
  - Scans a SkillProof badge QR code
  - Fetches and displays the verification result instantly

Also create backend GET /api/candidates endpoint that queries MongoDB for passed assessments with filters.
```

---

## PROMPT 7 — Landing Page (Demo Killer)

```
Create a stunning landing page (Home.jsx) for SkillProof with Tailwind CSS:

Hero section:
- Headline: "Your Skills. Proven. Not Claimed."
- Subheadline: "Record a 5-minute task. Get AI-verified. Get hired."
- Two CTA buttons: "I'm a Candidate" → /register?role=candidate, "I'm an Employer" → /register?role=employer

How It Works section (3 steps with icons):
1. Record yourself doing a real task
2. Gemini AI evaluates your actual skill
3. Get a verified digital badge employers trust

Industries section showing cards for: IT, Healthcare, Electrical, Hospitality, Construction

Stats bar: "4.7 Cr ITI graduates unverified" | "78% employers hire wrong" | "SkillProof changes this"

Footer with tagline: "Your hands are your resume."

Dark professional theme. Smooth scroll animations. No generic stock photo placeholders.
```

---

## PROMPT 8 — Final Integration & Demo Polish

```
Do a full integration pass on the SkillProof app:

1. Make sure React Router routes are all connected:
   / → Home
   /register → Register (with role param)
   /login → Login  
   /dashboard → CandidateDashboard (protected)
   /record → RecordTask (protected, candidate only)
   /results/:assessmentId → ScoreCard results page
   /badge/:badgeId → BadgeView
   /employer → EmployerDashboard (protected, employer only)
   /verify/:badgeId → VerifyBadge (public)

2. Add a Navbar that shows different links based on role

3. Add toast notifications (use react-hot-toast) for:
   - Successful assessment submission
   - Badge generated
   - Login/register success/error

4. Seed the database with 5 dummy candidate badges for IT skills so the employer demo works immediately

5. Add a prominent demo mode banner on the landing page: 
   "Live Demo: Upload any screen recording and watch Gemini assess it in real time"

Make sure everything is mobile responsive.
```

---

## 🚀 Demo Day Checklist

- [ ] Pre-record a 3-min screen recording of yourself building a React component
- [ ] Have it ready to upload live on stage
- [ ] Pre-seed 5 employer accounts + 10 candidate badges
- [ ] Have QR scanner open on your phone
- [ ] Rehearse the 90-second pitch: Problem → Solution → Live Demo → Impact

---

## 📊 Judging Criteria Fit

| Criteria | SkillProof Score |
|----------|-----------------|
| Innovation | ✅ No existing solution uses Vision AI for skill verification |
| Feasibility | ✅ 100% buildable with your exact stack |
| Social Impact | ✅ 4.7 crore unverified workers |
| Scalability | ✅ Add any industry by writing a new rubric prompt |
| Business Model | ✅ Freemium: candidates free, employers pay per hire |
| Demo Quality | ✅ Live AI assessment on stage = unforgettable |

---

*Built for: Hackathon | Stack: React + Node.js + Gemini Vision API | Theme: AI + Computer Vision / AI in Education & Skill Development*
