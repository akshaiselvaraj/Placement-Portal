# Software Requirements Specification (SRS)
## Project: Placement Management Portal

---

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for the **Placement Management Portal (PMP)**. It provides a complete description of the system's functions, interfaces, user roles, requirements, and constraints. It is intended for project developers, college administrators, placement officers, recruiters, and student applicants.

### 1.2 Document Conventions
- Standard IEEE 830-1998 templates are followed.
- Priorities for requirements are defined as:
  - **M (Mandatory):** Core features essential for launch.
  - **S (Should Have):** Recommended features that enhance workflow.
  - **C (Could Have):** Nice-to-have features for future iterations.

### 1.3 Intended Audience and Reading Suggestions
- **Developers & Designers:** Refer to Section 2 (Product Perspective) and Section 3 (System Features) for structural implementation guidelines.
- **Placement Officers & Admins:** Refer to Section 3.4 and 3.5 for dashboard capabilities and administrative rules.
- **QA Engineers:** Refer to Section 3 (System Features) and Section 5 (Non-Functional Requirements) to write test cases.

### 1.4 Product Scope
The Placement Management Portal is a web-based, role-restricted college placement coordinator application. It centralizes student resume building, dynamic public portfolios, company job listings, placement drive coordination, eligibility screening, application tracking, interview scheduling, real-time notification alerts, and performance metrics dashboards. 

### 1.5 References
1. Prisma Schema: [schema.prisma](file:///c:/project/softwarehack/Placement-Portal/backend/prisma/schema.prisma)
2. Architecture Blueprint: [architecture_and_design.md](file:///c:/project/softwarehack/Placement-Portal/architecture_and_design.md)
3. React Client Codebase: [frontend/src](file:///c:/project/softwarehack/Placement-Portal/frontend/src)

---

## 2. Overall Description

### 2.1 Product Perspective
The PMP is structured as a decentralized Client-Server architecture utilizing a modern technology stack:
- **Frontend:** Single Page Application (SPA) built using React.js (Vite) + TypeScript, styled via Tailwind CSS and shadcn/ui.
- **Backend:** Node.js + Express.js API server using Prisma ORM to interact with a PostgreSQL relational database.
- **Database:** Supabase hosting PostgreSQL instance with schema definitions.

### 2.2 Product Functions
- **Role-based Authentication:** Secure JWT registration and login for Student, Recruiter, Placement Officer, and Admin profiles.
- **Student Profile Management:** Comprehensive data entry for CGPA, educational milestones, technical projects, certifications, and skills.
- **Resume Builder with Versioning:** Allows students to select templates, populate JSON resumes, request officer approvals, and maintain multiple versions (V1, V2, V3) of their CV.
- **Public Portfolio Generator:** Automatically generates a public web profile for each student linked to their verified credentials, accessible by external recruiters via clean slug URLs.
- **Job & Placement Drive Coordination:** Creation of corporate profiles, scheduling placement drives, publishing job posts with eligibility criteria.
- **Automated Eligibility Filtering:** Locks job access to students based on CGPA thresholds, eligible departments, backlogs, and graduation years.
- **Interview Schedulers:** Allows Placement Officers to schedule rounds, output dates, durations, and Google Meet or physical interview locations.
- **Platform Analytics:** Real-time dashboards visualizing placement ratios, department distributions, and package metrics (highest, average, median).

### 2.3 User Classes and Characteristics
1. **Students:** Tech-literate, require intuitive interfaces to edit CVs, search job openings, apply, and monitor interview schedules.
2. **Placement Officers (POs):** Manage corporate drives, verify student credentials, publish job requirements, schedule interviews, and export reports.
3. **Recruiters (Optional Portal Viewers):** Browse candidate details, download resumes, view public portfolios, and shortlist applicants.
4. **Admins:** Power users with complete control over user activation states, system configurations, audit trails, and global site parameters.

### 2.4 Operating Environment
- **Server:** Node.js 18+ runtime on any standard Cloud instance (e.g. Linux VM/Render).
- **Database:** PostgreSQL 14+ engine.
- **Client (Frontend):** Modern web browsers (Google Chrome 100+, Safari 15+, Firefox 98+, Microsoft Edge). Responsive layout support for mobile, tablet, and desktop monitors.

### 2.5 Design and Implementation Constraints
- **Security:** All passwords stored in database must be hashed using bcrypt (10 rounds).
- **Communication:** Front-to-Back queries must be performed via Axios using JSON payloads, protected by JWT bearer tokens in the authorization headers.
- **Data Integrity:** Cascading deletes enforced on child records (profiles, resumes, portfolios) if parent user account is removed.

---

## 3. System Features (Functional Requirements)

### 3.1 Authentication & Authorization Module
- **SRS-FR-01 (M):** Users must register and log in specifying email, password, role, and name.
- **SRS-FR-02 (M):** System must issue a stateless JSON Web Token (JWT) expiring in 24 hours upon successful login.
- **SRS-FR-03 (M):** Role-based authorization middlewares must restrict backend routes based on user credentials (`STUDENT`, `PLACEMENT_OFFICER`, `RECRUITER`, `ADMIN`).

### 3.2 Student Profile & Verification Workflow
- **SRS-FR-04 (M):** Students must complete their profiles including educational milestones, projects (with git repositories and live links), and skills.
- **SRS-FR-05 (M):** Students must upload documents (e.g., academic transcripts, certificates).
- **SRS-FR-06 (M):** Placement Officers must review profiles and mark them as `PENDING`, `VERIFIED`, or `REJECTED`. 

### 3.3 Resume Versioning & Public Portfolio Builder
- **SRS-FR-07 (S):** Verified students can create multiple resumes (V1, V2, V3) from preloaded templates (Modern, Classic, Minimal).
- **SRS-FR-08 (S):** Resumes are saved in the database as dynamic JSON documents.
- **SRS-FR-09 (M):** The system must generate a public portfolio page mapped to a custom slug (e.g. `/portfolios/public/john-doe`).

### 3.4 Job Eligibility & Application Engine
- **SRS-FR-10 (M):** Placement Officers must post jobs with parameters: CGPA requirement, eligible departments, graduation batch, location, and salary ranges.
- **SRS-FR-11 (M):** The system must automatically hide jobs from students who do not meet eligibility thresholds.
- **SRS-FR-12 (M):** Students must apply for eligible jobs by attaching a specific resume version.

### 3.5 Placement Officer Dashboard & Interview Scheduling
- **SRS-FR-13 (M):** Officers must coordinate placement drives and link multiple job listings to a drive.
- **SRS-FR-14 (M):** Officers must schedule multiple interview rounds (Technical, HR, etc.) with location, duration, and meet links.
- **SRS-FR-15 (M):** Officers must declare placement selection outcomes (`Shortlisted`, `Selected`, `Rejected`, `Hired`).

### 3.6 Notifications & Platform Analytics
- **SRS-FR-16 (S):** Real-time notifications must trigger for critical events (profile approval, job postings, interview scheduling, selection result).
- **SRS-FR-17 (S):** Dashboards must plot hiring metrics, highest/average packages, and student placement rates using dynamic charts.

---

## 4. External Interface Requirements

### 4.1 User Interfaces
The system must provide consistent dashboards matching the wireframe schemas:
- **Student Console:** Highlights verification status, eligible drives, active applications, and interview cards.
- **Placement Officer Console:** Houses verification lists, drive configurations, job board controllers, and analytical charts.
- **Admin Console:** Manages user permissions, audit trails, and system switches.

### 4.2 Software Interfaces
- **Database Driver:** Prisma client libraries matching `schema.prisma`.
- **API Clients:** Axios wrapper handling token synchronization.
- **Libraries:** html2pdf.js for exporting student resumes directly to local files.

---

## 5. Non-Functional Requirements

### 5.1 Security Requirements
- **Data Protection:** SSL/TLS encryption for all HTTP network communication.
- **Password Security:** Salted bcrypt password hashes.
- **Role Isolation:** Block access to `/api/admin/*` and `/api/placement/*` endpoints for any non-admin/officer tokens.

### 5.2 Performance Requirements
- **Latency:** Database search operations must complete in less than 500ms under standard loads.
- **Indexing:** Indexes on frequently queried foreign keys (e.g. `userId`, `studentId`, `jobId`, `slug`) to speed up join operations.

### 5.3 Reliability & Availability
- **Uptime:** The web system target availability is 99.5%.
- **Robustness:** Global Express middleware handles errors gracefullly, preventing runtime server crashes by responding with standardized HTTP error models.
