# **Placement Management Portal (PMP)**

## **A Centralized Platform for Campus Placement Management**

---

# Abstract

The Placement Management Portal (PMP) is a centralized web-based application designed to simplify and digitize the campus recruitment process within educational institutions. Traditional placement management relies heavily on manual record maintenance, eligibility verification, resume collection, and communication, leading to delays and administrative overhead. PMP eliminates these challenges by providing a unified platform where students can maintain verified profiles, generate professional resumes, build online portfolios, evaluate resumes through an ATS checker, and apply for placement opportunities.

The system also enables Placement Officers to manage student verification, create placement drives, automate eligibility filtering, schedule interviews, monitor applications, and analyze placement statistics through interactive dashboards. Administrators manage users, system configurations, and platform monitoring. Built using React (Vite), TypeScript, Node.js, Express.js, Prisma ORM, and PostgreSQL, the portal offers a secure, scalable, and efficient solution for modern campus placement management.

---

# 1. Introduction

Campus placement plays a vital role in connecting educational institutions with employment opportunities for students. In many colleges, placement activities are still managed manually through spreadsheets, emails, and physical documentation. This approach often results in inefficient data management, communication delays, duplicate records, and time-consuming eligibility verification.

Students frequently update resumes for different companies, maintain project details separately, and lack a centralized professional portfolio. Placement Officers spend significant time verifying student information, filtering eligible candidates, and generating placement reports.

The Placement Management Portal addresses these challenges by providing an integrated digital platform that automates placement operations while improving transparency, efficiency, and data accuracy.

---

# 2. Problem Statement

The conventional campus placement process faces several challenges:

* Student academic and personal records are stored across multiple platforms, making verification difficult.
* Manual eligibility verification based on CGPA, department, graduation year, and backlog criteria consumes considerable time.
* Students repeatedly prepare resumes for different job opportunities without centralized version management.
* Students lack professional online portfolios for showcasing projects and technical skills.
* Resume quality is difficult to evaluate before applications are submitted.
* Placement Officers manually track applications, interview schedules, and selection status.
* Generating placement statistics and reports requires significant manual effort.

These limitations reduce the overall efficiency of campus placement management.

---

# 3. Proposed Solution

The Placement Management Portal provides a centralized platform for Students, Placement Officers, and Administrators.

The system digitizes the complete placement workflow by allowing students to maintain verified profiles, generate resumes, create public portfolios, evaluate resumes using an ATS checker, and apply for placement drives. Placement Officers manage placement drives, verify student profiles, automate eligibility checking, schedule interviews, and monitor placement statistics. Administrators oversee platform operations, user management, and system settings.

Companies communicate placement requirements directly with the Placement Officer, who creates and manages placement drives within the portal.

---

# 4. Objectives

The primary objectives of the project are:

* Digitize the campus placement process.
* Maintain centralized student profiles.
* Simplify resume creation and version management.
* Generate customizable online portfolios.
* Evaluate resumes using a rule-based ATS checker.
* Automate eligibility verification.
* Streamline application management.
* Schedule interviews efficiently.
* Provide placement analytics and reporting.
* Improve transparency between students and placement officers.

---

# 5. Functional Modules

## 5.1 Student Module

The Student Module enables students to:

* Register and log in securely.
* Complete and update their profile.
* Add academic information.
* Add technical skills.
* Manage projects.
* Add certifications.
* Build multiple resumes.
* Generate PDF resumes.
* Create public portfolios.
* Evaluate resumes using the ATS checker.
* Apply for eligible placement drives.
* Track application status.
* Receive placement notifications.

---

## 5.2 Placement Officer Module

Placement Officers can:

* Verify student profiles.
* Manage placement drives.
* Create job opportunities.
* Configure eligibility criteria.
* Review applications.
* Schedule interviews.
* Update application status.
* Send notifications.
* Monitor placement analytics.
* Generate placement reports.

---

## 5.3 Administrator Module

Administrators manage:

* User accounts.
* Placement Officers.
* Student accounts.
* System settings.
* Activity logs.
* Dashboard analytics.
* Platform monitoring.
* Role management.

---

# 6. System Architecture

The Placement Management Portal follows a three-tier client-server architecture.

### Presentation Layer

The frontend is developed using React.js with Vite and TypeScript. Tailwind CSS and shadcn/ui provide responsive and accessible user interfaces, while Zustand manages application state.

### Business Logic Layer

Node.js and Express.js implement RESTful APIs that handle authentication, authorization, placement workflows, resume generation, ATS evaluation, and reporting.

### Data Layer

Prisma ORM provides database abstraction and manages communication with PostgreSQL while ensuring efficient and secure data operations.

Architecture Flow:

Presentation Layer (React + TypeScript)

↓

REST API Layer (Express.js)

↓

Business Logic Layer

↓

Prisma ORM

↓

PostgreSQL Database

---

# 7. Database Design

The database consists of interconnected entities supporting the placement workflow.

Major entities include:

* User
* Student Profile
* Education
* Skill
* Project
* Certification
* Resume
* Portfolio
* Placement Drive
* Job
* Application
* Interview
* Notification
* Admin Activity Log
* System Settings

Relationships:

* One User owns one Student Profile.
* One Student Profile contains multiple Education records.
* One Student Profile contains multiple Skills.
* One Student Profile contains multiple Projects.
* One Student Profile contains multiple Certifications.
* One Student Profile contains multiple Resume versions.
* One Placement Drive contains multiple Jobs.
* One Student can submit multiple Applications.
* Each Application belongs to one Job.
* Interviews are linked with Applications.

---

# 8. Technology Stack

| Layer            | Technology           |
| ---------------- | -------------------- |
| Frontend         | React.js + Vite      |
| Language         | TypeScript           |
| Styling          | Tailwind CSS         |
| UI Components    | shadcn/ui            |
| Backend          | Node.js + Express.js |
| ORM              | Prisma ORM           |
| Database         | PostgreSQL           |
| Authentication   | JWT                  |
| Validation       | Zod                  |
| State Management | Zustand              |
| PDF Generation   | html2pdf.js          |

---

# 9. Implementation Details

## Frontend

The frontend follows a modular feature-based architecture.

Features include:

* Responsive user interface
* Resume Builder
* Portfolio Builder
* Dashboard analytics
* ATS Checker
* Placement Drive Management
* Student Profile Management

State management is implemented using Zustand to reduce unnecessary component rendering.

---

## Backend

The backend exposes RESTful APIs responsible for:

* Authentication
* Authorization
* Student Management
* Resume Management
* Portfolio Management
* Placement Drive Management
* Application Processing
* ATS Evaluation
* Notification Management
* Analytics Generation

Request validation is performed using Zod before database operations.

---

# 10. ATS Resume Checker

The Placement Management Portal includes a rule-based ATS (Applicant Tracking System) Resume Checker.

Unlike AI-powered resume evaluators, the implemented ATS checker follows predefined evaluation criteria.

The checker evaluates:

* Resume completeness
* Contact information
* Education section
* Technical skills
* Projects
* Certifications
* Resume formatting
* Keyword coverage
* Missing sections

Based on these rules, the system generates an ATS score along with practical suggestions to improve the resume before job applications.

---

# 11. Security Features

The application incorporates multiple security mechanisms.

* JWT Authentication
* Password hashing
* Role-Based Access Control
* Protected API endpoints
* Input validation using Zod
* Secure database access through Prisma ORM

These measures ensure that only authorized users can access protected resources.

---

# 12. Placement Workflow

The placement workflow consists of the following stages:

Student Registration

↓

Profile Completion

↓

Placement Officer Verification

↓

Placement Drive Creation

↓

Eligibility Verification

↓

Student Application

↓

ATS Resume Evaluation

↓

Interview Scheduling

↓

Selection Process

↓

Placement Analytics Updated

---

# 13. Results

The Placement Management Portal successfully automates major placement activities.

Key achievements include:

* Centralized management of student records.
* Automated eligibility verification.
* Faster placement drive management.
* Resume generation and version management.
* Public portfolio generation.
* Rule-based ATS resume evaluation.
* Simplified application tracking.
* Real-time placement notifications.
* Interactive placement analytics.
* Comprehensive reporting for placement officers.

The system significantly reduces manual administrative work while improving transparency and operational efficiency.

---

# 14. Future Enhancements

Potential future improvements include:

* Resume import using OCR.
* Online aptitude and coding assessments.
* Email integration for placement notifications.
* Calendar synchronization.
* Alumni placement tracking.
* Advanced reporting dashboards.
* Mobile application support.
* Multi-college deployment.

---

# 15. Conclusion

The Placement Management Portal provides a secure, scalable, and user-friendly solution for managing campus placements digitally. By centralizing student information, automating eligibility verification, integrating resume and portfolio management, implementing a rule-based ATS checker, and delivering comprehensive placement analytics, the system streamlines the entire placement lifecycle.

The modular architecture, secure authentication mechanisms, and efficient database design make the platform suitable for deployment across educational institutions. The project demonstrates how modern web technologies can effectively replace manual placement management processes, improving productivity, transparency, and decision-making for students, placement officers, and administrators.
