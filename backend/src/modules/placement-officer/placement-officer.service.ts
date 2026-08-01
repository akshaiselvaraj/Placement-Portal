import prisma from '../../config/database';
import { ApiError } from '../../utils/api-error';

export class PlacementOfficerService {
  // ==========================================
  // 1. PLACEMENT DRIVE MANAGEMENT
  // ==========================================
  static async getDrives(filters: { search?: string; status?: string; batchYear?: string }) {
    const where: any = {};
    if (filters.status) {
      where.status = filters.status;
    } else {
      where.status = { not: 'DELETED' };
    }
    if (filters.batchYear) {
      where.batchYear = parseInt(filters.batchYear, 10);
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { jobRole: { contains: filters.search, mode: 'insensitive' } },
        { company: { name: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    const drives = await prisma.placementDrive.findMany({
      where,
      include: {
        company: true,
        interviews: true,
        _count: {
          select: { interviews: true },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    return drives;
  }

  static async getDriveById(id: string) {
    const drive = await prisma.placementDrive.findUnique({
      where: { id },
      include: {
        company: true,
        interviews: {
          include: {
            application: {
              include: {
                student: {
                  include: { user: true },
                },
              },
            },
          },
        },
      },
    });
    if (!drive) throw ApiError.notFound('Placement Drive not found');
    return drive;
  }

  static async createDrive(data: any) {
    return await prisma.placementDrive.create({
      data: {
        title: data.title,
        description: data.description,
        companyId: data.companyId,
        status: data.status || 'UPCOMING',
        eligibilityCriteria: data.eligibilityCriteria,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        jobRole: data.jobRole,
        package: parseFloat(data.package || 0),
        location: data.location,
        employmentType: data.employmentType || 'Full-time',
        registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : null,
        departmentsEligible: data.departmentsEligible || [],
        minCgpa: parseFloat(data.minCgpa || 0),
        maxBacklogs: parseInt(data.maxBacklogs || 0, 10),
        requiredSkills: data.requiredSkills || [],
        batchYear: data.batchYear ? parseInt(data.batchYear, 10) : null,
        openings: data.openings ? parseInt(data.openings, 10) : 1,
        bondDetails: data.bondDetails,
        requiredDocuments: data.requiredDocuments || [],
      },
    });
  }

  static async updateDrive(id: string, data: any) {
    const drive = await prisma.placementDrive.findUnique({ where: { id } });
    if (!drive) throw ApiError.notFound('Placement Drive not found');

    const updateData: any = { ...data };
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    if (data.registrationDeadline) updateData.registrationDeadline = new Date(data.registrationDeadline);
    if (data.package) updateData.package = parseFloat(data.package);
    if (data.minCgpa) updateData.minCgpa = parseFloat(data.minCgpa);
    if (data.maxBacklogs) updateData.maxBacklogs = parseInt(data.maxBacklogs, 10);
    if (data.batchYear) updateData.batchYear = parseInt(data.batchYear, 10);
    if (data.openings) updateData.openings = parseInt(data.openings, 10);

    return await prisma.placementDrive.update({
      where: { id },
      data: updateData,
    });
  }

  static async deleteDrive(id: string) {
    return await prisma.placementDrive.delete({ where: { id } });
  }

  static async duplicateDrive(id: string) {
    const source = await this.getDriveById(id);
    return await prisma.placementDrive.create({
      data: {
        title: `${source.title} (Copy)`,
        description: source.description,
        companyId: source.companyId,
        status: 'UPCOMING',
        eligibilityCriteria: source.eligibilityCriteria,
        startDate: new Date(),
        jobRole: source.jobRole,
        package: source.package,
        location: source.location,
        employmentType: source.employmentType,
        departmentsEligible: source.departmentsEligible,
        minCgpa: source.minCgpa,
        maxBacklogs: source.maxBacklogs,
        requiredSkills: source.requiredSkills,
        batchYear: source.batchYear,
        openings: source.openings,
        bondDetails: source.bondDetails,
        requiredDocuments: source.requiredDocuments,
      },
    });
  }

  static async bulkArchiveDrives(ids: string[]) {
    return await prisma.placementDrive.updateMany({
      where: { id: { in: ids } },
      data: { status: 'COMPLETED' },
    });
  }

  static async bulkDeleteDrives(ids: string[]) {
    return await prisma.placementDrive.deleteMany({
      where: { id: { in: ids } },
    });
  }

  static async getDriveStats() {
    const total = await prisma.placementDrive.count();
    const active = await prisma.placementDrive.count({ where: { status: 'ONGOING' } });
    const upcoming = await prisma.placementDrive.count({ where: { status: 'UPCOMING' } });
    const completed = await prisma.placementDrive.count({ where: { status: 'COMPLETED' } });
    const cancelled = await prisma.placementDrive.count({ where: { status: 'CANCELLED' } });
    return { total, active, upcoming, completed, cancelled };
  }

  // ==========================================
  // 2. COMPANY MANAGEMENT
  // ==========================================
  static async getCompanies(search?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } },
      ];
    }
    return await prisma.company.findMany({
      where,
      include: {
        recruiterProfiles: {
          include: { user: true },
        },
        jobs: true,
        placementDrives: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  static async createCompany(data: any) {
    return await prisma.company.create({
      data: {
        name: data.name,
        logo: data.logo || null,
        website: data.website || null,
        industry: data.industry || null,
        description: data.description || null,
        location: data.location || null,
        email: data.email || null,
        phone: data.phone || null,
        size: data.size || null,
        foundedYear: data.foundedYear ? parseInt(data.foundedYear, 10) : null,
        address: data.address || null,
        recruiterName: data.recruiterName || null,
        recruiterEmail: data.recruiterEmail || null,
        recruiterPhone: data.recruiterPhone || null,
        hrContact: data.hrContact || null,
        averagePackage: parseFloat(data.averagePackage || 0),
        highestPackage: parseFloat(data.highestPackage || 0),
        notes: data.notes || null,
      },
    });
  }

  static async updateCompany(id: string, data: any) {
    const updateData: any = { ...data };
    if (data.foundedYear) updateData.foundedYear = parseInt(data.foundedYear, 10);
    if (data.averagePackage) updateData.averagePackage = parseFloat(data.averagePackage);
    if (data.highestPackage) updateData.highestPackage = parseFloat(data.highestPackage);

    return await prisma.company.update({
      where: { id },
      data: updateData,
    });
  }

  static async deleteCompany(id: string) {
    return await prisma.company.delete({ where: { id } });
  }

  // ==========================================
  // 3. RECRUITER MANAGEMENT
  // ==========================================
  static async getRecruiters() {
    return await prisma.recruiterProfile.findMany({
      include: {
        user: true,
        company: true,
      },
    });
  }

  // ==========================================
  // 4. ELIGIBILITY ENGINE
  // ==========================================
  static async evaluateEligibility(driveId: string) {
    const drive = await prisma.placementDrive.findUnique({
      where: { id: driveId },
    });
    if (!drive) throw ApiError.notFound('Placement Drive not found');

    const students = await prisma.studentProfile.findMany({
      include: {
        user: true,
        skills: true,
        resumes: true,
        portfolios: true,
      },
    });

    const eligible: any[] = [];
    const notEligible: any[] = [];

    students.forEach((student) => {
      const reasons: string[] = [];

      // 1. CGPA
      if (drive.minCgpa && (!student.cgpa || student.cgpa < drive.minCgpa)) {
        reasons.push(`CGPA is ${student.cgpa || 0}, below requirement of ${drive.minCgpa}`);
      }

      // 2. Department
      if (drive.departmentsEligible.length > 0 && !drive.departmentsEligible.includes(student.department)) {
        reasons.push(`Department is ${student.department}, which is not eligible`);
      }

      // 3. Batch Year
      if (drive.batchYear && student.batch !== String(drive.batchYear)) {
        // Simple string batch matching
        if (!student.batch.includes(String(drive.batchYear))) {
          reasons.push(`Batch Year is ${student.batch}, expected ${drive.batchYear}`);
        }
      }

      // 4. Verified Profile
      if (student.profileStatus !== 'VERIFIED') {
        reasons.push(`Student profile status is ${student.profileStatus}, needs to be VERIFIED`);
      }

      // 5. Resume Approved
      const hasApprovedResume = student.resumes.some((r) => r.isApproved);
      if (!hasApprovedResume) {
        reasons.push('Resume is not approved by coordinator');
      }

      const info = {
        id: student.id,
        rollNumber: student.rollNumber,
        name: student.user.name,
        email: student.user.email,
        cgpa: student.cgpa,
        department: student.department,
        batch: student.batch,
      };

      if (reasons.length === 0) {
        eligible.push(info);
      } else {
        notEligible.push({ ...info, reasons });
      }
    });

    return { eligible, notEligible };
  }

  // ==========================================
  // 5. STUDENT APPLICATION MANAGEMENT
  // ==========================================
  static async bulkUpdateApplications(ids: string[], status: any) {
    return await prisma.application.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });
  }

  // ==========================================
  // 6. INTERVIEW MANAGEMENT (CALENDAR & SCHEDULING)
  // ==========================================
  static async getInterviews() {
    return await prisma.interview.findMany({
      include: {
        application: {
          include: {
            student: {
              include: { user: true },
            },
            job: {
              include: { company: true },
            },
          },
        },
        drive: {
          include: { company: true },
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  static async scheduleInterview(data: any) {
    const application = await prisma.application.findUnique({
      where: { id: data.applicationId },
      include: { student: true, job: { include: { company: true } } },
    });
    if (!application) throw ApiError.notFound('Application not found');

    const interview = await prisma.interview.create({
      data: {
        applicationId: data.applicationId,
        driveId: data.driveId || null,
        date: new Date(data.date),
        time: data.time || null,
        duration: data.duration ? parseInt(data.duration, 10) : 45,
        interviewer: data.interviewer || 'Placement Officer',
        meetingLink: data.meetingLink || null,
        roundType: data.roundType || 'Technical',
        location: data.location || null,
        instructions: data.instructions || null,
        status: 'SCHEDULED',
      },
    });

    // Notify student
    await prisma.notification.create({
      data: {
        userId: application.student.userId,
        title: 'New Interview Scheduled',
        message: `Your "${data.roundType}" interview for ${application.job.company.name} is scheduled on ${new Date(data.date).toLocaleString()}.`,
        type: 'ACTION',
        link: '/student/dashboard',
      },
    });

    return interview;
  }

  static async updateInterview(id: string, data: any) {
    const updated = await prisma.interview.update({
      where: { id },
      data,
    });

    return updated;
  }

  // ==========================================
  // 7. RESULT MANAGEMENT (OFFERS & CTC)
  // ==========================================
  static async getResults() {
    return await prisma.application.findMany({
      where: {
        status: { in: ['SELECTED', 'HIRED'] },
      },
      include: {
        student: {
          include: { user: true },
        },
        job: {
          include: { company: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  static async updateOfferResult(id: string, data: any) {
    const app = await prisma.application.findUnique({ where: { id } });
    if (!app) throw ApiError.notFound('Application not found');

    const updateData: any = {};
    if (data.offerStatus) updateData.offerStatus = data.offerStatus;
    if (data.joiningStatus) updateData.joiningStatus = data.joiningStatus;
    if (data.ctc) updateData.ctc = parseFloat(data.ctc);
    if (data.baseSalary) updateData.baseSalary = parseFloat(data.baseSalary);
    if (data.bonus) updateData.bonus = parseFloat(data.bonus);
    if (data.stocks) updateData.stocks = parseFloat(data.stocks);
    if (data.benefits) updateData.benefits = data.benefits;
    if (data.offerLetter) updateData.offerLetter = data.offerLetter;

    return await prisma.application.update({
      where: { id },
      data: updateData,
    });
  }

  static async bulkPublishResults(ids: string[]) {
    return await prisma.application.updateMany({
      where: { id: { in: ids } },
      data: { status: 'HIRED' },
    });
  }

  // ==========================================
  // 8. DOCUMENT CENTER & VERIFICATION
  // ==========================================
  static async getDocuments() {
    return await prisma.document.findMany({
      include: {
        student: {
          include: { user: true },
        },
        approvalHistories: {
          orderBy: { approvedOn: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async uploadDocument(studentId: string, data: any) {
    return await prisma.document.create({
      data: {
        studentId,
        type: data.type,
        title: data.title,
        url: data.url,
        status: 'PENDING',
        version: 1,
      },
    });
  }

  static async approveDocument(id: string, approvalData: { approvedBy: string; status: string; comments?: string }) {
    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) throw ApiError.notFound('Document not found');

    const updated = await prisma.document.update({
      where: { id },
      data: { status: approvalData.status },
    });

    await prisma.approvalHistory.create({
      data: {
        documentId: id,
        approvedBy: approvalData.approvedBy,
        status: approvalData.status,
        comments: approvalData.comments || null,
        version: doc.version,
      },
    });

    return updated;
  }

  // ==========================================
  // Baseline overrides from old module (to avoid compiler errors)
  // ==========================================
  static async getStudents(filters: any) {
    const { department, batch, profileStatus, cgpaMin } = filters;
    const where: any = {};
    if (department) where.department = department;
    if (batch) where.batch = batch;
    if (profileStatus) where.profileStatus = profileStatus;
    if (cgpaMin) {
      const minVal = parseFloat(cgpaMin);
      if (!isNaN(minVal)) where.cgpa = { gte: minVal };
    }
    return await prisma.studentProfile.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        educations: true,
        projects: true,
        skills: true,
        certifications: true,
        documents: true,
      },
      orderBy: { rollNumber: 'asc' },
    });
  }

  static async verifyStudent(studentId: string, data: any) {
    const student = await prisma.studentProfile.findUnique({ where: { id: studentId } });
    if (!student) throw ApiError.notFound('Student profile not found');

    const updated = await prisma.studentProfile.update({
      where: { id: studentId },
      data: { profileStatus: data.status },
    });

    await prisma.notification.create({
      data: {
        userId: student.userId,
        title: `Profile Verification: ${data.status}`,
        message: data.status === 'VERIFIED'
          ? 'Your profile verification is successful. You are now eligible to apply for jobs.'
          : 'Your profile verification has been rejected. Please review your credentials.',
        type: data.status === 'VERIFIED' ? 'SUCCESS' : 'WARNING',
        link: '/student/profile',
      },
    });

    return updated;
  }

  static async getResumes() {
    return await prisma.resume.findMany({
      include: { student: { include: { user: { select: { name: true, email: true } } } } },
      orderBy: { isApproved: 'asc' },
    });
  }

  static async approveResume(resumeId: string, data: any) {
    const resume = await prisma.resume.findUnique({ where: { id: resumeId }, include: { student: true } });
    if (!resume) throw ApiError.notFound('Resume not found');

    const updated = await prisma.resume.update({ where: { id: resumeId }, data: { isApproved: data.isApproved } });

    await prisma.notification.create({
      data: {
        userId: resume.student.userId,
        title: `Resume ${data.isApproved ? 'Approved' : 'Rejected'}`,
        message: `Your resume template submission has been ${data.isApproved ? 'approved' : 'rejected'}.`,
        type: data.isApproved ? 'SUCCESS' : 'WARNING',
        link: '/student/profile',
      },
    });

    return updated;
  }

  static async getPortfolios() {
    return await prisma.portfolio.findMany({
      include: { student: { include: { user: { select: { name: true, email: true } } } } },
      orderBy: { isApproved: 'asc' },
    });
  }

  static async approvePortfolio(portfolioId: string, data: any) {
    const portfolio = await prisma.portfolio.findUnique({ where: { id: portfolioId }, include: { student: true } });
    if (!portfolio) throw ApiError.notFound('Portfolio not found');

    const updated = await prisma.portfolio.update({ where: { id: portfolioId }, data: { isApproved: data.isApproved } });

    await prisma.notification.create({
      data: {
        userId: portfolio.student.userId,
        title: `Portfolio ${data.isApproved ? 'Approved' : 'Rejected'}`,
        message: `Your custom portfolio page has been ${data.isApproved ? 'approved' : 'rejected'}.`,
        type: data.isApproved ? 'SUCCESS' : 'WARNING',
        link: '/student/profile',
      },
    });

    return updated;
  }

  static async getApplications() {
    return await prisma.application.findMany({
      include: {
        job: { include: { company: { select: { name: true } } } },
        student: { include: { user: { select: { name: true, email: true } } } },
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  static async publishResult(data: any) {
    const application = await prisma.application.findUnique({
      where: { id: data.applicationId },
      include: { job: true, student: true },
    });
    if (!application) throw ApiError.notFound('Application not found');

    const updatedApp = await prisma.application.update({
      where: { id: data.applicationId },
      data: { status: data.status },
    });

    await prisma.notification.create({
      data: {
        userId: application.student.userId,
        title: data.status === 'SELECTED' ? '🎉 Congratulations! Offer Received' : 'Application Status Update',
        message: data.status === 'SELECTED'
          ? `You have been selected for the position of "${application.job.title}"!`
          : `We regret to inform you that your application for "${application.job.title}" was not selected.`,
        type: data.status === 'SELECTED' ? 'SUCCESS' : 'WARNING',
        link: '/student/dashboard',
      },
    });

    return updatedApp;
  }
}
export default PlacementOfficerService;
