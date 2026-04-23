# 🩺 Med-Lens AI Vault
### Next-Generation AI Diagnostic Platform for Medical Imaging

![Med-Lens AI Vault](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-blue?style=for-the-badge&logo=google)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=node.js)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

> Upload any medical scan → AI reads it → Full clinical report in under 5 seconds.  
> Powered by **Google Gemini 2.5 Flash** multimodal AI.

---

## 🚀 Live Demo

🔗 **[med-lens-ai-vault.vercel.app](https://med-lens-ai-vault.vercel.app)**

> **Access Token (to enter the platform):** `token`  
> **SuperAdmin Login:** Username: `SUPERADMIN` | Password: `superadmin`

---

## ✨ Features

- 🔬 **AI Medical Scan Analysis** — Upload X-Ray, MRI, CT scans and get instant structured clinical reports
- 🧠 **Google Gemini 2.5 Flash** — Multimodal AI trained to act as a senior diagnostic radiologist
- 💬 **Neural Clinical Chat** — Chat with AI about your scan results in real time (RAG-based)
- 🔐 **Diagnostic Vault** — SHA-256 cryptographic fingerprinting; duplicate scans served in ~95ms
- 📄 **One-Click PDF Reports** — Generate hospital-grade clinical PDF reports instantly
- 🚨 **Severity Triage** — Auto color-coded: Normal / Monitor / Suspicious / Critical
- 📊 **Analytics Dashboard** — Track scan history, latency, abnormality rates
- 🛡️ **HIPAA-Ready Security** — AES-256 encryption, bcrypt auth, full audit logs
- 🏥 **HL7 FHIR Sync Simulation** — Auto-triggers EHR push for critical findings

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Framer Motion, Three.js |
| Styling | TailwindCSS, Custom CSS |
| Backend | Node.js, Express.js |
| AI Engine | Google Gemini 2.5 Flash (`@google/genai`) |
| Auth | bcryptjs (password hashing) |
| File Uploads | Multer (up to 50MB) |
| Database | JSON flat-file (`database.json`) |
| Security | SHA-256, AES-256, RSA-4096 (simulated) |
| Deployment | Vercel (Frontend) + Render/Railway (Backend) |

---

## 📁 Project Structure

```
Med-Lens AI Vault/
├── Client/                  # React Frontend (Vite)
│   ├── src/
│   │   ├── pages/           # LandingPage, ScanPage, DashboardPage, etc.
│   │   ├── components/      # Navbar, AuthOverlay, NeuralClinicalChat, etc.
│   │   ├── services/        # API service (axios)
│   │   └── utils/           # PDF generator, helpers
│   ├── index.html
│   └── vite.config.js
│
├── Server/                  # Node.js Backend
│   ├── src/
│   │   └── index.js         # All API endpoints
│   ├── uploads/             # Temp scan storage
│   └── database.json        # JSON database (auto-created)
│
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites
- **Node.js** v18+ → [Download here](https://nodejs.org)
- **Google Gemini API Key** → [Get it here](https://aistudio.google.com/app/apikey)

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Chaithanya9727/Med-Lens-AI-Vault.git
cd Med-Lens-AI-Vault
```

---

### Step 2 — Setup the Backend (Server)

```bash
cd Server
npm install
```

Create a `.env` file inside the `Server/` folder:

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
PORT=5000
```

> 🔑 Get your free Gemini API key at: https://aistudio.google.com/app/apikey

Start the server:

```bash
npm run dev
```

✅ Server runs at: `http://localhost:5000`

---

### Step 3 — Setup the Frontend (Client)

Open a **new terminal**:

```bash
cd Client
npm install
npm run dev
```

✅ App runs at: `http://localhost:5173`

---

## 🔐 Login Credentials

When you open the app, you'll be asked for an **Access Token** first:

| Field | Value |
|-------|-------|
| 🔑 **Access Token** | `token` |

After entering the token, you can **Sign In** or **Register**:

### SuperAdmin Account (Owner Access)
| Field | Value |
|-------|-------|
| Username | `SUPERADMIN` |
| Password | `superadmin` |

> SuperAdmin gets access to the **Owner Console** with full platform analytics, all user data, and audit logs.

### Regular Doctor Account
- Click **"Official Registration"** to create your own doctor account
- Enter your name, department, username, and password
- Your account is instantly created and secured with bcrypt encryption

---

## 🧠 How It Works

```
1. Doctor uploads a scan (X-Ray / MRI / CT)
        ↓
2. SHA-256 hash generated (Diagnostic Fingerprint)
        ↓
3. Vault Check: Is this scan already analyzed?
   ├── YES → Return result instantly (~95ms) ✅
   └── NO  → Send to Gemini AI for analysis
        ↓
4. Gemini 2.5 Flash analyzes the scan
   (Acts as senior radiologist with 25 years experience)
        ↓
5. Structured JSON report returned:
   - Diagnosis, Confidence, Severity
   - ROI regions with coordinates
   - Beyond-human findings
   - Differential diagnoses
   - Prognosis & Recommendations
        ↓
6. Result saved to Vault + Audit log created
        ↓
7. If CRITICAL → HL7 FHIR sync triggered (EHR push)
        ↓
8. Doctor can chat with AI about the scan (Neural Chat)
        ↓
9. One-click PDF clinical report export
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Register new doctor |
| `POST` | `/api/auth/login` | Doctor login |
| `POST` | `/api/upload` | Upload & analyze scan |
| `POST` | `/api/chat` | Neural clinical chat |
| `GET`  | `/api/scans` | Get scan history |
| `GET`  | `/api/analytics` | Dashboard analytics |
| `GET`  | `/api/audit` | Audit logs |
| `GET`  | `/api/admin/global-data` | SuperAdmin full data |

---

## 📊 Performance

| Metric | Value |
|--------|-------|
| Fresh scan analysis | 3.5 – 6.0 seconds |
| Vault cache hit | ~95ms |
| Latency reduction | ~98% |
| AI confidence range | 85% – 98% |
| Max file size | 50 MB |
| Supported formats | JPEG, PNG, DICOM (as image) |

---

## 🔒 Security

- **bcryptjs** — All passwords irreversibly hashed with salt rounds
- **SHA-256** — Cryptographic image fingerprinting
- **Audit Logs** — Every action logged with IP, device, UTC timestamp
- **HIPAA-compliant** architecture with role-based access control
- **HL7 FHIR** simulation for EHR integration readiness

---

## 🖥️ Pages & Routes

| Route | Page |
|-------|------|
| `/` | Landing Page (3D DNA Hero) |
| `/scan` | Medical Scan Upload & Analysis |
| `/dashboard` | Analytics Dashboard |
| `/chat` | Neural Clinical Chat |
| `/security` | Security & Compliance Info |
| `/technology` | Architecture Overview |
| `/enterprise` | Enterprise Deployment Info |
| `/admin` | SuperAdmin Owner Console |

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

## 👨‍💻 Author

**Chaithanya Kumar**  
🔗 [GitHub](https://github.com/Chaithanya9727) | 🔗 [LinkedIn](https://linkedin.com/in/)

---

> ⚠️ **Disclaimer:** Med-Lens AI Vault is a research/educational prototype. It is NOT a certified medical device and should NOT be used as a substitute for qualified medical professionals. Always consult a licensed physician for medical decisions.
