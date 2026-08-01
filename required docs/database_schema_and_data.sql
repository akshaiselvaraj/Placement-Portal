-- Placement Management Portal Database Schema and Seed Data DDL Script
-- Target Database: PostgreSQL

-- =========================================================================
-- 1. DROP EXISTING TABLES AND TYPES TO ENSURE FRESH RUN (IF RUN MULTIPLE TIMES)
-- =========================================================================
DROP TABLE IF EXISTS "approval_histories" CASCADE;
DROP TABLE IF EXISTS "documents" CASCADE;
DROP TABLE IF EXISTS "system_settings" CASCADE;
DROP TABLE IF EXISTS "admin_sessions" CASCADE;
DROP TABLE IF EXISTS "admin_activity_logs" CASCADE;
DROP TABLE IF EXISTS "admin_permissions" CASCADE;
DROP TABLE IF EXISTS "admins" CASCADE;
DROP TABLE IF EXISTS "Notification" CASCADE;
DROP TABLE IF EXISTS "Portfolio" CASCADE;
DROP TABLE IF EXISTS "Certification" CASCADE;
DROP TABLE IF EXISTS "Skill" CASCADE;
DROP TABLE IF EXISTS "Project" CASCADE;
DROP TABLE IF EXISTS "Education" CASCADE;
DROP TABLE IF EXISTS "Resume" CASCADE;
DROP TABLE IF EXISTS "Interview" CASCADE;
DROP TABLE IF EXISTS "ApplicationStatusHistory" CASCADE;
DROP TABLE IF EXISTS "Application" CASCADE;
DROP TABLE IF EXISTS "PlacementDrive" CASCADE;
DROP TABLE IF EXISTS "Job" CASCADE;
DROP TABLE IF EXISTS "RecruiterProfile" CASCADE;
DROP TABLE IF EXISTS "Company" CASCADE;
DROP TABLE IF EXISTS "PlacementOfficerProfile" CASCADE;
DROP TABLE IF EXISTS "StudentProfile" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

DROP TYPE IF EXISTS "Role" CASCADE;
DROP TYPE IF EXISTS "ApplicationStatus" CASCADE;
DROP TYPE IF EXISTS "JobStatus" CASCADE;
DROP TYPE IF EXISTS "DriveStatus" CASCADE;
DROP TYPE IF EXISTS "ProfileStatus" CASCADE;
DROP TYPE IF EXISTS "InterviewStatus" CASCADE;
DROP TYPE IF EXISTS "NotificationType" CASCADE;

-- =========================================================================
-- 2. CREATE ENUM TYPES
-- =========================================================================
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PLACEMENT_OFFICER', 'RECRUITER', 'STUDENT');
CREATE TYPE "ApplicationStatus" AS ENUM ('APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEWING', 'SELECTED', 'HIRED', 'REJECTED', 'WITHDRAWN');
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'FILLED');
CREATE TYPE "DriveStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');
CREATE TYPE "ProfileStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE "InterviewStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ACTION');

-- =========================================================================
-- 3. CREATE TABLES & RELATIONSHIPS
-- =========================================================================

-- User Table
CREATE TABLE "User" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "avatar" VARCHAR(255),
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- StudentProfile Table
CREATE TABLE "StudentProfile" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID UNIQUE NOT NULL,
    "rollNumber" VARCHAR(100) UNIQUE NOT NULL,
    "department" VARCHAR(255) NOT NULL,
    "batch" VARCHAR(100) NOT NULL,
    "cgpa" DOUBLE PRECISION,
    "phone" VARCHAR(50),
    "bio" TEXT,
    "profileStatus" "ProfileStatus" NOT NULL DEFAULT 'PENDING',
    "linkedin" VARCHAR(255),
    "github" VARCHAR(255),
    "website" VARCHAR(255),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_student_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- PlacementOfficerProfile Table
CREATE TABLE "PlacementOfficerProfile" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID UNIQUE NOT NULL,
    "department" VARCHAR(255) NOT NULL,
    "designation" VARCHAR(255),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_officer_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Company Table
CREATE TABLE "Company" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) UNIQUE NOT NULL,
    "logo" VARCHAR(255),
    "website" VARCHAR(255),
    "industry" VARCHAR(255),
    "description" TEXT,
    "location" VARCHAR(255),
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "size" VARCHAR(100),
    "foundedYear" INTEGER,
    "address" TEXT,
    "recruiterName" VARCHAR(255),
    "recruiterEmail" VARCHAR(255),
    "recruiterPhone" VARCHAR(50),
    "hrContact" VARCHAR(255),
    "averagePackage" DOUBLE PRECISION DEFAULT 0.0,
    "highestPackage" DOUBLE PRECISION DEFAULT 0.0,
    "previousVisitDate" TIMESTAMP,
    "studentsHired" INTEGER DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RecruiterProfile Table
CREATE TABLE "RecruiterProfile" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID UNIQUE NOT NULL,
    "companyId" UUID NOT NULL,
    "designation" VARCHAR(255),
    "phone" VARCHAR(50),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_recruiter_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_recruiter_company" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE
);

-- Job Table
CREATE TABLE "Job" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "companyId" UUID NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "workMode" VARCHAR(100) DEFAULT 'On-site',
    "employmentType" VARCHAR(100) DEFAULT 'Full-time',
    "salaryMin" DOUBLE PRECISION,
    "salaryMax" DOUBLE PRECISION,
    "deadline" TIMESTAMP NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'DRAFT',
    "eligibility" TEXT,
    "requirements" TEXT,
    "requiredSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferredSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "minCgpa" DOUBLE PRECISION,
    "eligibleDepartments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "eligibleGradYears" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "requiredExperience" DOUBLE PRECISION DEFAULT 0.0,
    "openings" INTEGER DEFAULT 1,
    "postedBy" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_job_company" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE
);

-- PlacementDrive Table
CREATE TABLE "PlacementDrive" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "companyId" UUID NOT NULL,
    "status" "DriveStatus" NOT NULL DEFAULT 'UPCOMING',
    "eligibilityCriteria" TEXT,
    "startDate" TIMESTAMP NOT NULL,
    "endDate" TIMESTAMP,
    "jobRole" VARCHAR(255),
    "package" DOUBLE PRECISION DEFAULT 0.0,
    "location" VARCHAR(255),
    "employmentType" VARCHAR(100) DEFAULT 'Full-time',
    "registrationDeadline" TIMESTAMP,
    "departmentsEligible" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "minCgpa" DOUBLE PRECISION DEFAULT 0.0,
    "maxBacklogs" INTEGER DEFAULT 0,
    "requiredSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "batchYear" INTEGER,
    "openings" INTEGER DEFAULT 1,
    "bondDetails" TEXT,
    "requiredDocuments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_drive_company" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE
);

-- Application Table
CREATE TABLE "Application" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "studentId" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'APPLIED',
    "atsScore" DOUBLE PRECISION,
    "atsBreakdown" JSONB,
    "hiredAt" TIMESTAMP,
    "joiningDate" TIMESTAMP,
    "offerStatus" VARCHAR(50) DEFAULT 'PENDING',
    "appliedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ctc" DOUBLE PRECISION DEFAULT 0.0,
    "baseSalary" DOUBLE PRECISION DEFAULT 0.0,
    "bonus" DOUBLE PRECISION DEFAULT 0.0,
    "stocks" DOUBLE PRECISION DEFAULT 0.0,
    "benefits" TEXT,
    "offerLetter" VARCHAR(255),
    "joiningStatus" VARCHAR(50) DEFAULT 'PENDING',
    CONSTRAINT "fk_app_student" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_app_job" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE,
    CONSTRAINT "uq_student_job" UNIQUE ("studentId", "jobId")
);

-- ApplicationStatusHistory Table
CREATE TABLE "ApplicationStatusHistory" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "applicationId" UUID NOT NULL,
    "fromStatus" "ApplicationStatus",
    "toStatus" "ApplicationStatus" NOT NULL,
    "changedBy" VARCHAR(255),
    "notes" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_history_app" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE
);

-- Interview Table
CREATE TABLE "Interview" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "applicationId" UUID NOT NULL,
    "driveId" UUID,
    "date" TIMESTAMP NOT NULL,
    "time" VARCHAR(50),
    "duration" INTEGER DEFAULT 45,
    "interviewer" VARCHAR(255),
    "meetingLink" VARCHAR(255),
    "roundType" VARCHAR(100) DEFAULT 'Technical',
    "location" VARCHAR(255),
    "status" "InterviewStatus" NOT NULL DEFAULT 'SCHEDULED',
    "result" VARCHAR(50) DEFAULT 'PENDING',
    "attendance" VARCHAR(50) DEFAULT 'PENDING',
    "instructions" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_interview_app" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_interview_drive" FOREIGN KEY ("driveId") REFERENCES "PlacementDrive"("id") ON SET NULL
);

-- Resume Table
CREATE TABLE "Resume" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "studentId" UUID NOT NULL,
    "templateId" VARCHAR(100) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "data" JSONB NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_resume_student" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE
);

-- Education Table
CREATE TABLE "Education" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "studentId" UUID NOT NULL,
    "institution" VARCHAR(255) NOT NULL,
    "degree" VARCHAR(255) NOT NULL,
    "field" VARCHAR(255) NOT NULL,
    "startYear" INTEGER NOT NULL,
    "endYear" INTEGER,
    "grade" VARCHAR(50),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_edu_student" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE
);

-- Project Table
CREATE TABLE "Project" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "studentId" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "techStack" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "liveUrl" VARCHAR(255),
    "repoUrl" VARCHAR(255),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_proj_student" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE
);

-- Skill Table
CREATE TABLE "Skill" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "studentId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "level" VARCHAR(50),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_skill_student" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE,
    CONSTRAINT "uq_student_skill" UNIQUE ("studentId", "name")
);

-- Certification Table
CREATE TABLE "Certification" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "studentId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "issuer" VARCHAR(255) NOT NULL,
    "date" TIMESTAMP,
    "url" VARCHAR(255),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_cert_student" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE
);

-- Portfolio Table
CREATE TABLE "Portfolio" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "studentId" UUID NOT NULL,
    "themeId" VARCHAR(100) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "data" JSONB NOT NULL,
    "slug" VARCHAR(255) UNIQUE NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT FALSE,
    "isApproved" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_portfolio_student" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE
);

-- Notification Table
CREATE TABLE "Notification" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'INFO',
    "isRead" BOOLEAN NOT NULL DEFAULT FALSE,
    "link" VARCHAR(255),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_notif_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Admins Table
CREATE TABLE "admins" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID UNIQUE NOT NULL,
    "employeeId" VARCHAR(100) UNIQUE NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "department" VARCHAR(255) NOT NULL,
    "designation" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "role" VARCHAR(50) NOT NULL DEFAULT 'ADMIN',
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "permissionLevel" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_admin_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- AdminPermission Table
CREATE TABLE "admin_permissions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "adminId" UUID NOT NULL,
    "permission" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_permission_admin" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE CASCADE,
    CONSTRAINT "uq_admin_permission" UNIQUE ("adminId", "permission")
);

-- AdminActivityLog Table
CREATE TABLE "admin_activity_logs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "adminId" UUID NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "details" TEXT,
    "ipAddress" VARCHAR(50),
    "userAgent" VARCHAR(255),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_log_admin" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE CASCADE
);

-- AdminSession Table
CREATE TABLE "admin_sessions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "adminId" UUID NOT NULL,
    "token" VARCHAR(255) UNIQUE NOT NULL,
    "ipAddress" VARCHAR(50),
    "userAgent" VARCHAR(255),
    "expiresAt" TIMESTAMP NOT NULL,
    "lastActive" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_session_admin" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE CASCADE
);

-- SystemSetting Table
CREATE TABLE "system_settings" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "key" VARCHAR(255) UNIQUE NOT NULL,
    "value" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL DEFAULT 'string',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Document Table
CREATE TABLE "documents" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "studentId" UUID NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "url" VARCHAR(255) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_doc_student" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE
);

-- ApprovalHistory Table
CREATE TABLE "approval_histories" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "documentId" UUID,
    "approvedBy" VARCHAR(255) NOT NULL,
    "approvedOn" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(50) NOT NULL,
    "comments" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "fk_history_doc" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE
);

-- =========================================================================
-- 4. CREATE DATABASE INDEXES FOR PERFORMANCE
-- =========================================================================
CREATE INDEX "idx_user_email" ON "User"("email");
CREATE INDEX "idx_student_roll" ON "StudentProfile"("rollNumber");
CREATE INDEX "idx_company_name" ON "Company"("name");
CREATE INDEX "idx_job_company" ON "Job"("companyId");
CREATE INDEX "idx_drive_company" ON "PlacementDrive"("companyId");
CREATE INDEX "idx_app_student" ON "Application"("studentId");
CREATE INDEX "idx_app_job" ON "Application"("jobId");
CREATE INDEX "idx_interview_app" ON "Interview"("applicationId");
CREATE INDEX "idx_portfolio_slug" ON "Portfolio"("slug");
CREATE INDEX "idx_doc_student" ON "documents"("studentId");

-- =========================================================================
-- 5. SEED DATA (MOCK POPULATION)
-- =========================================================================

-- Note: All passwords are set to a mock bcrypt hash representing 'Password123'
-- Hash: $2b$10$wN9a.5h0Uf2K8W7Vv03YaeYnI1L4K9b6t7r8d9f10g11h12i13j14 (equivalent placeholder hash)

-- Seed User Records
INSERT INTO "User" ("id", "email", "password", "role", "name", "isActive") VALUES
('1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a1a', 'alex.johnson@example.com', '$2b$10$wN9a.5h0Uf2K8W7Vv03YaeYnI1L4K9b6t7r8d9f10g11h12i13j14', 'STUDENT', 'Alex Johnson', TRUE),
('2b2b2b2b-2b2b-2b2b-2b2b-2b2b2b2b2b2b', 'priya.sharma@example.com', '$2b$10$wN9a.5h0Uf2K8W7Vv03YaeYnI1L4K9b6t7r8d9f10g11h12i13j14', 'STUDENT', 'Priya Sharma', TRUE),
('3c3c3c3c-3c3c-3c3c-3c3c-3c3c3c3c3c3c', 'robert.po@university.edu', '$2b$10$wN9a.5h0Uf2K8W7Vv03YaeYnI1L4K9b6t7r8d9f10g11h12i13j14', 'PLACEMENT_OFFICER', 'Robert Vance', TRUE),
('4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d4d', 'admin@university.edu', '$2b$10$wN9a.5h0Uf2K8W7Vv03YaeYnI1L4K9b6t7r8d9f10g11h12i13j14', 'ADMIN', 'Chief Admin', TRUE);

-- Seed Student Profiles
INSERT INTO "StudentProfile" ("id", "userId", "rollNumber", "department", "batch", "cgpa", "phone", "bio", "profileStatus", "linkedin", "github", "website") VALUES
('a1111111-1111-1111-1111-111111111111', '1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a1a', '2023CS01', 'Computer Science and Engineering', '2022-2026', 8.92, '9876543210', 'Enthusiastic full-stack developer with a passion for building scalable web applications.', 'PENDING', 'https://linkedin.com/in/alex-johnson-dev', 'https://github.com/alexjohnson', 'https://alexjohnson.dev'),
('a2222222-2222-2222-2222-222222222222', '2b2b2b2b-2b2b-2b2b-2b2b-2b2b2b2b2b2b', '2023IT12', 'Information Technology', '2022-2026', 9.45, '9812345678', 'Machine learning practitioner specializing in NLP and predictive analytics.', 'VERIFIED', 'https://linkedin.com/in/priyasharma', 'https://github.com/priyasharma', 'https://priyasharma.ai');

-- Seed Placement Officer Profile
INSERT INTO "PlacementOfficerProfile" ("id", "userId", "department", "designation") VALUES
('b1111111-1111-1111-1111-111111111111', '3c3c3c3c-3c3c-3c3c-3c3c-3c3c3c3c3c3c', 'All Departments', 'Head of Placements');

-- Seed Admin Profile
INSERT INTO "admins" ("id", "userId", "employeeId", "firstName", "lastName", "department", "designation", "role", "status", "permissionLevel") VALUES
('c1111111-1111-1111-1111-111111111111', '4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d4d', 'EMP404', 'Chief', 'Admin', 'Information Technology', 'Administrator', 'SUPER_ADMIN', 'ACTIVE', 3);

-- Seed Companies
INSERT INTO "Company" ("id", "name", "logo", "website", "industry", "description", "location", "email", "phone", "size", "foundedYear", "address", "recruiterName", "recruiterEmail", "recruiterPhone", "hrContact", "averagePackage", "highestPackage", "studentsHired") VALUES
('d1111111-1111-1111-1111-111111111111', 'Google', 'https://rgmfsmjhrupnckzwbpex.supabase.co/storage/v1/object/public/placement-portal/companies/google.png', 'https://careers.google.com', 'Technology & Internet', 'A global technology leader focused on improving the ways people connect with information.', 'Bangalore, India', 'recruiting-india@google.com', '+91-80-67218000', '10,000+ employees', 1998, 'Google Signature Towers, Gurgaon, India', 'Elena Rostova', 'elena.rostova@google.com', '9888877777', 'Amit Sharma', 30.5, 45.0, 5),
('d2222222-2222-2222-2222-222222222222', 'Amazon', 'https://rgmfsmjhrupnckzwbpex.supabase.co/storage/v1/object/public/placement-portal/companies/amazon.png', 'https://amazon.jobs', 'Technology & e-Commerce', 'Global e-commerce and cloud computing giant.', 'Hyderabad, India', 'careers-india@amazon.com', '+91-40-40004000', '10,000+ employees', 1994, 'Amazon Development Centre, Nanakramguda, Hyderabad, India', 'Sarah Jenkins', 'sarah-jenkins@amazon.com', '9777766666', 'Rohan Verma', 22.0, 35.5, 8);

-- Seed Jobs
INSERT INTO "Job" ("id", "title", "description", "companyId", "type", "location", "workMode", "employmentType", "salaryMin", "salaryMax", "deadline", "status", "eligibility", "requirements", "requiredSkills", "preferredSkills", "minCgpa", "eligibleDepartments", "eligibleGradYears", "requiredExperience", "openings", "postedBy") VALUES
('e1111111-1111-1111-1111-111111111111', 'Software Engineer (Backend)', 'Responsible for building robust server side components and API integration.', 'd1111111-1111-1111-1111-111111111111', 'Full-time', 'Bangalore, India', 'On-site', 'Full-time', 20.0, 35.0, '2026-09-30 23:59:59', 'OPEN', 'CGPA >= 8.0, Computer Science/IT', 'Good understanding of Node.js/Java, databases, and DSA.', ARRAY['Node.js', 'PostgreSQL', 'TypeScript'], ARRAY['Docker', 'Redis'], 8.0, ARRAY['Computer Science and Engineering', 'Information Technology'], ARRAY[2026], 0, 3, 'Robert Vance'),
('e2222222-2222-2222-2222-222222222222', 'Systems Analyst', 'Evaluating system architectures and identifying optimizations.', 'd2222222-2222-2222-2222-222222222222', 'Full-time', 'Hyderabad, India', 'Hybrid', 'Full-time', 15.0, 25.0, '2026-08-30 23:59:59', 'OPEN', 'CGPA >= 7.5', 'Strong debugging skills and understanding of operations.', ARRAY['Python', 'SQL', 'Linux'], ARRAY['AWS', 'Bash'], 7.5, ARRAY['Computer Science and Engineering', 'Information Technology', 'Electronics'], ARRAY[2026], 0, 5, 'Robert Vance');

-- Seed Placement Drives
INSERT INTO "PlacementDrive" ("id", "title", "description", "companyId", "status", "startDate", "endDate", "jobRole", "package", "location", "departmentsEligible", "minCgpa", "batchYear", "openings") VALUES
('f1111111-1111-1111-1111-111111111111', 'Google Apex Recruitment 2026', 'Exclusive campus drive for Core Software Engineers.', 'd1111111-1111-1111-1111-111111111111', 'ONGOING', '2026-08-10 09:00:00', '2026-08-25 18:00:00', 'Software Engineer (Backend)', 30.5, 'Bangalore, India', ARRAY['Computer Science and Engineering', 'Information Technology'], 8.0, 2026, 3),
('f2222222-2222-2222-2222-222222222222', 'Amazon Future Analyst Drive', 'Mass recruitment drive for analysis roles.', 'd2222222-2222-2222-2222-222222222222', 'UPCOMING', '2026-09-01 09:00:00', '2026-09-15 18:00:00', 'Systems Analyst', 22.0, 'Hyderabad, India', ARRAY['Computer Science and Engineering', 'Information Technology', 'Electronics'], 7.5, 2026, 5);

-- Seed Resumes for Priya (Since she is verified)
INSERT INTO "Resume" ("id", "studentId", "templateId", "title", "data", "isApproved") VALUES
('r1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', 'modern-tech', 'Priya ML Resume', '{"summary": "Machine Learning Engineer focusing on NLP.", "education": [{"school": "NIT", "cgpa": "9.45"}]}', TRUE);

-- Seed Application for Priya to Google
INSERT INTO "Application" ("id", "studentId", "jobId", "status", "atsScore", "offerStatus", "ctc") VALUES
('g1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', 'e1111111-1111-1111-1111-111111111111', 'SHORTLISTED', 88.5, 'PENDING', 30.5);

-- Seed Interview for Priya
INSERT INTO "Interview" ("id", "applicationId", "driveId", "date", "time", "duration", "interviewer", "meetingLink", "roundType", "status") VALUES
('h1111111-1111-1111-1111-111111111111', 'g1111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', '2026-08-04 10:00:00', '10:00 AM', 60, 'Elena Rostova', 'https://meet.google.com/abc-defg-hij', 'Technical Interview Round 1', 'SCHEDULED');

-- Seed Notifications
INSERT INTO "Notification" ("id", "userId", "title", "message", "type", "isRead") VALUES
('n1111111-1111-1111-1111-111111111111', '2b2b2b2b-2b2b-2b2b-2b2b-2b2b2b2b2b2b', 'Profile Verified', 'Your student profile has been verified successfully.', 'SUCCESS', FALSE),
('n2222222-2222-2222-2222-222222222222', '2b2b2b2b-2b2b-2b2b-2b2b-2b2b2b2b2b2b', 'Interview Scheduled', 'Interview scheduled for Software Engineer (Backend) on Aug 4.', 'INFO', TRUE);

-- Seed System Settings
INSERT INTO "system_settings" ("id", "key", "value", "type") VALUES
(gen_random_uuid(), 'allow_registration', 'true', 'boolean'),
(gen_random_uuid(), 'academic_year', '2026', 'string'),
(gen_random_uuid(), 'maintenance_mode', 'false', 'boolean');
