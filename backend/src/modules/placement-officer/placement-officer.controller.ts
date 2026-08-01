import { Request, Response } from 'express';
import { PlacementOfficerService } from './placement-officer.service';
import { ApiResponse } from '../../utils/api-response';
import { asyncHandler } from '../../utils/async-handler';

export class PlacementOfficerController {
  // Placement Drives
  static getDrives = asyncHandler(async (req: Request, res: Response) => {
    const drives = await PlacementOfficerService.getDrives(req.query);
    return ApiResponse.success(res, drives, 'Placement drives retrieved successfully');
  });

  static getDriveById = asyncHandler(async (req: Request, res: Response) => {
    const drive = await PlacementOfficerService.getDriveById(req.params.id as string);
    return ApiResponse.success(res, drive, 'Placement drive details retrieved');
  });

  static createDrive = asyncHandler(async (req: Request, res: Response) => {
    const drive = await PlacementOfficerService.createDrive(req.body);
    return ApiResponse.success(res, drive, 'Placement drive created successfully');
  });

  static updateDrive = asyncHandler(async (req: Request, res: Response) => {
    const drive = await PlacementOfficerService.updateDrive(req.params.id as string, req.body);
    return ApiResponse.success(res, drive, 'Placement drive updated successfully');
  });

  static deleteDrive = asyncHandler(async (req: Request, res: Response) => {
    await PlacementOfficerService.deleteDrive(req.params.id as string);
    return ApiResponse.success(res, null, 'Placement drive deleted successfully');
  });

  static duplicateDrive = asyncHandler(async (req: Request, res: Response) => {
    const duplicated = await PlacementOfficerService.duplicateDrive(req.params.id as string);
    return ApiResponse.success(res, duplicated, 'Placement drive duplicated successfully');
  });

  static bulkArchiveDrives = asyncHandler(async (req: Request, res: Response) => {
    const { ids } = req.body;
    await PlacementOfficerService.bulkArchiveDrives(ids);
    return ApiResponse.success(res, null, 'Selected drives archived successfully');
  });

  static bulkDeleteDrives = asyncHandler(async (req: Request, res: Response) => {
    const { ids } = req.body;
    await PlacementOfficerService.bulkDeleteDrives(ids);
    return ApiResponse.success(res, null, 'Selected drives deleted successfully');
  });

  static getDriveStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await PlacementOfficerService.getDriveStats();
    return ApiResponse.success(res, stats, 'Placement drive stats retrieved');
  });

  // Companies Management
  static getCompanies = asyncHandler(async (req: Request, res: Response) => {
    const companies = await PlacementOfficerService.getCompanies(req.query.search as string);
    return ApiResponse.success(res, companies, 'Companies list retrieved successfully');
  });

  static createCompany = asyncHandler(async (req: Request, res: Response) => {
    const company = await PlacementOfficerService.createCompany(req.body);
    return ApiResponse.success(res, company, 'Company registered successfully');
  });

  static updateCompany = asyncHandler(async (req: Request, res: Response) => {
    const company = await PlacementOfficerService.updateCompany(req.params.id as string, req.body);
    return ApiResponse.success(res, company, 'Company details updated successfully');
  });

  static deleteCompany = asyncHandler(async (req: Request, res: Response) => {
    await PlacementOfficerService.deleteCompany(req.params.id as string);
    return ApiResponse.success(res, null, 'Company deleted successfully');
  });

  // Recruiters
  static getRecruiters = asyncHandler(async (req: Request, res: Response) => {
    const recruiters = await PlacementOfficerService.getRecruiters();
    return ApiResponse.success(res, recruiters, 'Recruiters list retrieved successfully');
  });

  // Eligibility Engine
  static evaluateEligibility = asyncHandler(async (req: Request, res: Response) => {
    const result = await PlacementOfficerService.evaluateEligibility(req.params.id as string);
    return ApiResponse.success(res, result, 'Student eligibility evaluation complete');
  });

  // Student Applications
  static bulkUpdateApplications = asyncHandler(async (req: Request, res: Response) => {
    const { ids, status } = req.body;
    await PlacementOfficerService.bulkUpdateApplications(ids, status);
    return ApiResponse.success(res, null, 'Applications updated successfully');
  });

  // Interview Management
  static getInterviews = asyncHandler(async (req: Request, res: Response) => {
    const interviews = await PlacementOfficerService.getInterviews();
    return ApiResponse.success(res, interviews, 'Interviews list retrieved successfully');
  });

  static updateInterview = asyncHandler(async (req: Request, res: Response) => {
    const updated = await PlacementOfficerService.updateInterview(req.params.id as string, req.body);
    return ApiResponse.success(res, updated, 'Interview details updated successfully');
  });

  // Result Management
  static getResults = asyncHandler(async (req: Request, res: Response) => {
    const results = await PlacementOfficerService.getResults();
    return ApiResponse.success(res, results, 'Placement selections list retrieved');
  });

  static updateOfferResult = asyncHandler(async (req: Request, res: Response) => {
    const updated = await PlacementOfficerService.updateOfferResult(req.params.id as string, req.body);
    return ApiResponse.success(res, updated, 'Offer updates saved successfully');
  });

  static bulkPublishResults = asyncHandler(async (req: Request, res: Response) => {
    const { ids } = req.body;
    await PlacementOfficerService.bulkPublishResults(ids);
    return ApiResponse.success(res, null, 'Offer results published successfully');
  });

  // Document Center
  static getDocuments = asyncHandler(async (req: Request, res: Response) => {
    const docs = await PlacementOfficerService.getDocuments();
    return ApiResponse.success(res, docs, 'Documents retrieved successfully');
  });

  static approveDocument = asyncHandler(async (req: Request, res: Response) => {
    const updated = await PlacementOfficerService.approveDocument(req.params.id as string, {
      approvedBy: req.user!.name,
      status: req.body.status,
      comments: req.body.comments,
    });
    return ApiResponse.success(res, updated, 'Document verified successfully');
  });

  // Base methods from previous versions (for backward compatibility)
  static getStudents = asyncHandler(async (req: Request, res: Response) => {
    const students = await PlacementOfficerService.getStudents(req.query);
    return ApiResponse.success(res, students, 'Students retrieved successfully');
  });

  static verifyStudent = asyncHandler(async (req: Request, res: Response) => {
    const updated = await PlacementOfficerService.verifyStudent(req.params.id as string, req.body);
    return ApiResponse.success(res, updated, 'Student profile status updated successfully');
  });

  static getResumes = asyncHandler(async (req: Request, res: Response) => {
    const resumes = await PlacementOfficerService.getResumes();
    return ApiResponse.success(res, resumes, 'Resumes retrieved successfully');
  });

  static approveResume = asyncHandler(async (req: Request, res: Response) => {
    const updated = await PlacementOfficerService.approveResume(req.params.id as string, req.body);
    return ApiResponse.success(res, updated, 'Resume approval status updated successfully');
  });

  static getPortfolios = asyncHandler(async (req: Request, res: Response) => {
    const portfolios = await PlacementOfficerService.getPortfolios();
    return ApiResponse.success(res, portfolios, 'Portfolios retrieved successfully');
  });

  static approvePortfolio = asyncHandler(async (req: Request, res: Response) => {
    const updated = await PlacementOfficerService.approvePortfolio(req.params.id as string, req.body);
    return ApiResponse.success(res, updated, 'Portfolio approval status updated successfully');
  });

  static getApplications = asyncHandler(async (req: Request, res: Response) => {
    const applications = await PlacementOfficerService.getApplications();
    return ApiResponse.success(res, applications, 'Applications retrieved successfully');
  });

  static scheduleInterview = asyncHandler(async (req: Request, res: Response) => {
    const interview = await PlacementOfficerService.scheduleInterview(req.body);
    return ApiResponse.success(res, interview, 'Interview scheduled successfully');
  });

  static publishResult = asyncHandler(async (req: Request, res: Response) => {
    const result = await PlacementOfficerService.publishResult(req.body);
    return ApiResponse.success(res, result, 'Selection result published successfully');
  });
}
export default PlacementOfficerController;
