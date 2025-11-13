<div align="center">
  <img src="./zypher-app/public/Images/ZypherLogo-white.png" alt="Zypher Logo" width="300"/>
  
  
  **CI/CD Pipeline Security Scanner**
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.5.6-black?style=flat&logo=next.js)](https://nextjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.115.13-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![Python](https://img.shields.io/badge/python-3.12-blue?style=flat&logo=python)](https://www.python.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-8.16.3-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/)
  [![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
  
  *Detect vulnerabilities, enforce best practices, and secure your CI/CD pipelines*
</div>

---

## 📖 Overview

**Zypher** is a comprehensive CI/CD pipeline security scanner developed as a 3rd-year project at UCSC. It provides analysis of YAML-based configuration files (GitHub Actions, GitLab CI, Jenkins, etc.) to:

- 🔍 **Detect Security Vulnerabilities** - Identify hardcoded secrets, insecure permissions, and misconfigurations
- ✅ **Enforce Best Practices** - Ensure your pipelines follow industry standards
- 📊 **Generate Actionable Reports** - Export detailed PDF reports with remediation guidance
- 🎯 **Custom Rule Engine** - Create and deploy custom security rules tailored to your needs
- 🤖 **Pattern Scanning** - Detect sensitive patterns and security anti-patterns

---

## ✨ Features

### 🛡️ Security Scanning
- **Vulnerability Detection**: Scan for hardcoded credentials, insecure dependencies, and permission issues
- **Best Practice Enforcement**: Validate against CI/CD security guidelines
- **Pattern Recognition**: Identify sensitive data patterns and security anti-patterns
- **Custom Rules**: Develop, test, and deploy organization-specific security rules

### 📈 Analytics & Reporting
- **Real-time Dashboard**: Monitor scan results, trends, and security metrics
- **PDF Report Generation**: Export comprehensive security reports with findings and recommendations
- **User Analytics**: Track user activity, scan history, and role-based metrics
- **Visual Insights**: Interactive charts showing vulnerabilities, severity distribution, and trends

### 👥 Role-Based Access Control
- **Admin**: Manage users, view analytics, oversee system operations
- **User**: Submit scans, view results, export reports
- **Rule Developer**: Create and test custom security rules
- **Rule Maintainer**: Review, approve, and deploy custom rules
- **Educator**: Access educational resources and training materials

### 🚀 Multiple Scan Options
- **Repository URL Scan**: Directly scan GitHub/GitLab repositories
- **File Upload**: Upload configuration files for analysis
- **Config File Upload**: Scan with custom rule configurations

---

## 🏗️ Architecture

```
zypher/
├── zypher-app/          # Next.js Frontend Application
│   ├── src/
│   │   ├── app/         # App Router pages and layouts
│   │   ├── components/  # Reusable React components
│   │   ├── models/      # MongoDB models
│   │   └── utils/       # Utility functions
│   ├── public/          # Static assets
│   └── package.json
│
└── zypher-scan-api/     # FastAPI Backend Scanner
    ├── api/
    │   ├── main.py      # FastAPI application entry
    │   ├── routes/      # API route handlers
    │   ├── scanner/     # Vulnerability scanning engine
    │   ├── bp_scanner/  # Best practices scanner
    │   └── vuln_scanner/# Vulnerability rule engine
    └── requirements.txt
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)
- **MongoDB** (v6 or higher)
- **Git**

### Installation

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/anupasiriwardana/zypher.git
cd zypher
```

#### 2️⃣ Set Up Frontend (Next.js)

```bash
cd zypher-app
npm install
```

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

#### 3️⃣ Set Up Backend (FastAPI)

```bash
cd ../zypher-scan-api
```

**Windows (PowerShell):**
```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**macOS/Linux:**
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
cd api
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

---

## 📚 Usage

### Running a Scan

1. **Sign Up / Log In** to your Zypher account
2. Navigate to **Start a Scan**
3. Choose your scan method:
   - **Paste Repository URL**: Enter your GitHub/GitLab repo URL
   - **Upload Config Files**: Upload YAML configuration files
4. Click **Start Scan** and wait for results
5. View detailed findings with severity levels
6. Export PDF reports for documentation

### Creating Custom Rules

1. Log in as a **Rule Developer**
2. Go to **Development Workspace**
3. Write your custom rule using the rule template
4. Test against sample configurations
5. Submit for review by Rule Maintainers

### Admin Analytics

1. Log in as an **Admin**
2. Access the **Analytics Dashboard**
3. View metrics:
   - Total users and role distribution
   - New signups over time
   - Scan activity trends
   - Custom rule requests

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Authentication**: NextAuth.js
- **Charts**: Recharts
- **PDF Generation**: pdfmake
- **Code Editor**: Monaco Editor
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI
- **Database**: MongoDB (with Mongoose/PyMongo)
- **YAML Parsing**: PyYAML
- **Async HTTP**: httpx
- **Validation**: Pydantic

### DevOps
- **Package Manager**: npm, pip
- **Version Control**: Git
- **Linting**: ESLint
- **Environment**: Node.js, Python

---

## 📂 Project Structure

### Frontend (`zypher-app/`)

```
src/
├── app/
│   ├── (auth)/              # Authentication pages
│   ├── (dashboard)/         # Dashboard layouts & pages
│   │   ├── (admin)/        # Admin pages
│   │   ├── (user)/         # User pages
│   │   ├── (rule-developer)/
│   │   └── (rule-maintainer)/
│   ├── api/                # API routes
│   └── globals.css         # Global styles
├── components/             # Reusable components
├── models/                 # Database models
└── utils/                  # Helper functions
```

### Backend (`zypher-scan-api/`)

```
api/
├── main.py                 # FastAPI app entry
├── routes/                 # API endpoints
│   ├── bp_scan.py         # Best practices scan
│   ├── vuln_scan.py       # Vulnerability scan
│   └── bp_scan_individual_file.py
├── scanner/               # Scanning engine
├── bp_scanner/            # Best practices rules
├── vuln_scanner/          # Vulnerability rules
├── models/                # Data models
└── schema/                # Pydantic schemas
```

---


## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Zypher** is developed by students at the University of Colombo School of Computing (UCSC) as a 3rd-year project.

- **Project Lead**: Anupa Siriwardana
- **Contributors**: [View all contributors](https://github.com/anupasiriwardana/zypher/graphs/contributors)

---

## 🙏 Acknowledgments

- University of Colombo School of Computing (UCSC)
- Open-source community for amazing tools and libraries
- All contributors and testers

---

## 📧 Contact

- **GitHub**: [@anupasiriwardana](https://github.com/anupasiriwardana)
- **Repository**: [zypher](https://github.com/anupasiriwardana/zypher)
- **Issues**: [Report a bug](https://github.com/anupasiriwardana/zypher/issues)

---

<div align="center">
  
  **⭐ Star this repository if you find it helpful!**
  
  Made with ❤️ by the Zypher Team
  
</div>
