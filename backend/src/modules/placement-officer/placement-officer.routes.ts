import { Router } from 'express';
import { PlacementOfficerController } from './placement-officer.controller';
import { authenticate, authorize } from '../../middleware';

const router = Router();

// Apply global Placement Officer role guard to all routes in this sub-module
router.use(authenticate);
router.use(authorize('PLACEMENT_OFFICER'));

// 1. Placement Drive Management
router.get('/drives', PlacementOfficerController.getDrives);
router.get('/drives/stats', PlacementOfficerController.getDriveStats);
router.get('/drives/:id', PlacementOfficerController.getDriveById);
router.post('/drives', PlacementOfficerController.createDrive);
router.put('/drives/:id', PlacementOfficerController.updateDrive);
router.delete('/drives/:id', PlacementOfficerController.deleteDrive);
router.post('/drives/:id/duplicate', PlacementOfficerController.duplicateDrive);
router.post('/drives/bulk-archive', PlacementOfficerController.bulkArchiveDrives);
router.post('/drives/bulk-delete', PlacementOfficerController.bulkDeleteDrives);
router.get('/drives/:id/eligibility', PlacementOfficerController.evaluateEligibility);

// 2. Company Management
router.get('/companies', PlacementOfficerController.getCompanies);
router.post('/companies', PlacementOfficerController.createCompany);
router.put('/companies/:id', PlacementOfficerController.updateCompany);
router.delete('/companies/:id', PlacementOfficerController.deleteCompany);

// 3. Recruiter Management
router.get('/recruiters', PlacementOfficerController.getRecruiters);

// 4. Student Application Management
router.post('/applications/bulk-update', PlacementOfficerController.bulkUpdateApplications);

// 5. Interview Management
router.get('/interviews', PlacementOfficerController.getInterviews);
router.post('/interviews', PlacementOfficerController.scheduleInterview);
router.put('/interviews/:id', PlacementOfficerController.updateInterview);

// 6. Result Management
router.get('/results', PlacementOfficerController.getResults);
router.post('/results', PlacementOfficerController.publishResult);
router.put('/results/:id', PlacementOfficerController.updateOfferResult);
router.post('/results/bulk-publish', PlacementOfficerController.bulkPublishResults);

// 7. Document Center & Approvals
router.get('/documents', PlacementOfficerController.getDocuments);
router.put('/documents/:id/approve', PlacementOfficerController.approveDocument);

// Baseline verification compatibility endpoints
router.get('/students', PlacementOfficerController.getStudents);
router.put('/students/:id/verify', PlacementOfficerController.verifyStudent);
router.get('/resumes', PlacementOfficerController.getResumes);
router.put('/resumes/:id/approve', PlacementOfficerController.approveResume);
router.get('/portfolios', PlacementOfficerController.getPortfolios);
router.put('/portfolios/:id/approve', PlacementOfficerController.approvePortfolio);
router.get('/applications', PlacementOfficerController.getApplications);

export default router;
