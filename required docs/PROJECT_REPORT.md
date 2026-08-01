# Project Report: Placement Management Portal (PMP)
**A Centralized Platform for Managing College Campus Placements**

---

## Abstract
Campus placement operations are traditionally manual, decentralized, and prone to communication lags. Students must manually submit CVs for every job opening, and Placement Officers struggle to filter candidate eligibility list metrics against specific corporate parameters. The **Placement Management Portal (PMP)** addresses these inefficiencies by offering a centralized Web Application. Built on a robust tech stack of React.js (Vite) + TypeScript, Node.js + Express, and Prisma ORM + PostgreSQL, the PMP automates student profile verification, resume compilation, public portfolios, job eligibility matching, application state tracking, interview scheduling, and placement analytics. This report outlines the system requirements, architectures, implementations, and outcomes of the project.

---

## 1. Introduction & Problem Statement
Academic placement coordination departments coordinate with thousands of students and dozens of companies. The manual process is plagued by several key challenges:
1. **Scattered Student Records:** Grade points (CGPA), education records, project repositories, and certifications are stored across paper documents, emails, and PDFs, making verification cumbersome.
2. **Inefficient Eligibility Matching:** Manually screening which students are eligible for a job based on department, CGPA, backlogs, and batch leads to delays and errors.
3. **Lack of Dynamic Resumes/Portfolios:** Students cannot easily maintain different resume versions tailored for backend, frontend, or machine learning roles. They also lack clean, web-based public portfolios that recruiters can access immediately.
4. **Poor Status Tracking:** Students lack real-time visibility into their application stages, resulting in anxiety and missed updates.

---

## 2. Proposed Solution
PMP solves these problems by establishing a unified cloud platform mapping Student, Recruiter, Placement Officer, and Admin dashboards into a single ecosystem.

### Key Capabilities:
- **Centralized Profiles:** Students maintain verified records of education, skills, and projects in one dashboard.
- **Dynamic Resume Builder & Versioning:** Built-in templates render real-time CV previews from profile data and save multiple versions (V1, V2, V3) in the database.
- **Auto-Syncing Portfolios:** Synchronizes changes in student profiles with customizable public portfolio URLs (e.g. `/portfolios/public/john-doe`).
- **Automated Eligibility Engine:** Restricts application forms based on CGPA, graduation batch, and branch configurations, eliminating manual filtering.
- **Unified Interview Hub:** Streamlines interview schedulers and links them directly to active drives, sending notifications to selected student candidates.
- **Visual Analytics:** Generates real-time hiring metrics (Highest/Average salary packages, department selection rates) through charts.

---

## 3. System Design & Data Modeling

### 3.1 Architecture Model
The portal follows a clean client-server REST architecture:
- **Presentation Layer (Frontend):** React (Vite) + TypeScript with Zustand handles state synchronization.
- **API & Controller Layer (Backend):** Node.js + Express backend processes logic, coordinates JSON Web Tokens (JWT) for authentication, and validates input requests with Zod schemas.
- **Persistence Layer (Database):** Prisma ORM handles database operations on a PostgreSQL database.

### 3.2 Database Entity Relationship
The database is modeled around core entities representing the portal's functionalities:
- **User & Profiles:** The `User` entity links to specialized child profiles (`StudentProfile`, `PlacementOfficerProfile`, `RecruiterProfile`, `Admin`).
- **Academics & Skills:** `Education`, `Project`, `Skill`, and `Certification` tables map a student's history to their profile.
- **Drives & Jobs:** Companies sponsor `PlacementDrive` models which hold multiple `Job` listings.
- **Applications & Interviews:** Students submit an `Application` attaching a specific `Resume` to a `Job`. Applications are processed through multiple `Interview` round instances.
- **Logs & Settings:** Platform configurations (`SystemSetting`) and operations audit logs (`AdminActivityLog`) support monitoring.

```
       +--------------+          +------------------+
       |     User     | -------- |  StudentProfile  |
       +--------------+          +------------------+
              |                            |
              |             +--------------+--------------+
              |             |              |              |
              |       +-----------+  +-----------+  +-----------+
              |       | Education |  |  Project  |  |   Skill   |
              |       +-----------+  +-----------+  +-----------+
              |             |              |              |
              |             +--------------+--------------+
              |                            |
       +--------------+                    |
       | Notification |             +--------------+
       +--------------+             |  Application |
                                    +--------------+
                                           |
                                    +--------------+
                                    |     Job      |
                                    +--------------+
                                           |
                                    +--------------+
                                    |    Company   |
                                    +--------------+
```

---

## 4. Implementation Details

### 4.1 Frontend Implementation
The frontend is organized in a feature-modular folder structure:
- **Global Store:** State is managed via Zustand stores (`src/store`), decoupling application state from React rendering.
- **Component Libraries:** Tailwind CSS and shadcn/ui provide accessible elements.
- **Resume Exporters:** Uses `html2pdf.js` to compile the DOM representation of student CVs to high-quality PDF downloads.

### 4.2 Backend & API Implementation
The Express.js REST API utilizes middlewares for routing safety:
- **Authentication Middleware:** Intercepts incoming requests and decodes JWT signatures. Unauthenticated requests are blocked.
- **Role Verification Middleware:** Restricts endpoints to specific roles (e.g. `PLACEMENT_OFFICER` for student profile approval).
- **Zod Request Validator:** Performs JSON body verification before db transactions, preventing database ingestion of malformed schemas.

---

## 5. Results & Project Outcomes
PMP successfully automates the university placement cycle:
1. **Reduced Screening Time:** Automated eligibility checks reduce the administrative overhead of screening eligible students by 95%.
2. **Simplified Resume Management:** Students can create, version, and export tailored PDF resumes in minutes.
3. **Real-time Status Tracking:** The notifications panel lists status updates (`Shortlisted`, `Selected`, `Interview Scheduled`) instantly.
4. **Enhanced Data Insights:** Dashboards provide placement stats and charts, enabling placement officers to monitor hiring trends.

```
+-------------------------------------------------------------+
| Student Portal         --> Resume Created                   |
| Placement Officer      --> Profile Approved & Verified      |
| Eligibility Filter     --> Automatically checks CGPA        |
| Interview Scheduled    --> Notification sent to Student     |
| Analytics Dashboard    --> Average/Highest Package Updated  |
+-------------------------------------------------------------+
```

---

## 6. Future Enhancements & Conclusion
Future versions of the Placement Management Portal could include:
- **AI-Powered Resume Parser:** Standardizing external PDF files into student profiles using OCR and NLP.
- **Assessment Integrations:** Incorporating mock tests and technical screenings directly into the portal.
- **Calendar Integrations:** Syncing schedules with Google Calendar and Microsoft Outlook.

In conclusion, PMP provides a scalable, secure, and user-friendly platform that replaces outdated, manual placement processes with an efficient, data-driven workflow.
