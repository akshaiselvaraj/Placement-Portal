import { useState } from 'react';
import { usePlacementData } from '../hooks/usePlacementData';
import { LoadingSkeleton, EmptyState } from '@/components/common';
import { Calendar, CheckSquare, Clock, Video, UserCheck, XCircle, Award } from 'lucide-react';

export function InterviewDesk() {
  const {
    applications,
    isLoadingApplications,
    scheduleInterview,
    isSchedulingInterview,
    publishResult,
    isPublishingResult,
  } = usePlacementData();

  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewType, setInterviewType] = useState('Technical Round');
  const [location, setLocation] = useState('');

  // Find selected application details
  const selectedApp = applications.find((a) => a.id === selectedAppId);

  // Filter candidates who are shortlisted / interviewing
  const eligibleCandidates = applications.filter(
    (app) => app.status === 'SHORTLISTED' || app.status === 'INTERVIEWING'
  );

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId || !interviewDate || !location) return;

    try {
      // Find driveId. For now, since applications have drive links or we can retrieve it,
      // let's grab application driveId, if missing, default to a placeholder UUID string
      const driveId = selectedApp?.job?.companyId || 'default-drive-id';
      
      await scheduleInterview({
        applicationId: selectedAppId,
        driveId,
        date: interviewDate,
        type: interviewType,
        location,
      });

      // Reset
      setInterviewDate('');
      setLocation('');
      setSelectedAppId(null);
    } catch (err) {}
  };

  const handlePublishResult = async (appId: string, status: 'SELECTED' | 'REJECTED') => {
    try {
      await publishResult({ applicationId: appId, status });
      if (selectedAppId === appId) {
        setSelectedAppId(null);
      }
    } catch (err) {}
  };

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))]">
          Interview & Selection Desk
        </h2>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
          Schedule interview rounds for shortlisted students and publish final placement selections.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Candidates list */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Shortlisted Candidates</h3>
          {isLoadingApplications ? (
            <LoadingSkeleton count={3} height="h-24" />
          ) : eligibleCandidates.length === 0 ? (
            <div className="border border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--surface))] p-8">
              <EmptyState
                title="No shortlisted candidates"
                message="No applicants currently require interview scheduling or results publishing."
                icon={<Award className="h-8 w-8 text-[hsl(var(--text-muted))]" />}
              />
            </div>
          ) : (
            <div className="space-y-3 max-h-125 overflow-y-auto pr-1">
              {eligibleCandidates.map((app) => (
                <button
                  key={app.id}
                  onClick={() => setSelectedAppId(app.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
                    selectedAppId === app.id
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.04)]'
                      : 'border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:border-[hsl(var(--primary)/0.3)]'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-[hsl(var(--text-primary))]">
                        {app.student?.user?.name}
                      </h4>
                      <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">
                        {app.job?.company?.name || 'Company'} — {app.job?.title}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-full bg-[hsl(var(--info-light))] text-[hsl(var(--info))]">
                      {app.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-3 text-[11px] text-[hsl(var(--text-secondary))] font-medium pt-2 border-t border-[hsl(var(--border))/0.4]">
                    <span>GPA: {app.student?.cgpa?.toFixed(2) || 'N/A'}</span>
                    <span>Roll: {app.student?.rollNumber}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Schedule & Decision Form */}
        <div className="lg:col-span-2">
          {selectedApp ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Form card */}
              <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-[hsl(var(--border))]">
                  <Calendar className="h-5 w-5 text-[hsl(var(--primary))]" />
                  <h3 className="font-bold text-sm text-[hsl(var(--text-primary))]">Schedule Interview Round</h3>
                </div>

                <form onSubmit={handleSchedule} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                      Interview Type
                    </label>
                    <select
                      value={interviewType}
                      onChange={(e) => setInterviewType(e.target.value)}
                      className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                    >
                      <option>Technical Round</option>
                      <option>HR Round</option>
                      <option>Coding Test</option>
                      <option>Managerial Round</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                      Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={interviewDate}
                      onChange={(e) => setInterviewDate(e.target.value)}
                      className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                      Location / Meeting URL
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Google Meet link or Seminar Hall"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSchedulingInterview}
                    className="w-full inline-flex justify-center items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] rounded-lg disabled:opacity-50 transition-all cursor-pointer shadow-xs"
                  >
                    <Clock className="h-4 w-4" />
                    Book Schedule
                  </button>
                </form>
              </div>

              {/* Action Decision Card */}
              <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-[hsl(var(--border))]">
                  <CheckSquare className="h-5 w-5 text-[hsl(var(--success))]" />
                  <h3 className="font-bold text-sm text-[hsl(var(--text-primary))]">Final Selection Result</h3>
                </div>

                <div className="space-y-4 text-xs font-medium text-[hsl(var(--text-secondary))]">
                  <p>
                    Review student credentials and publish selection decisions. This will instantly notify the candidate of their final hire/rejection state.
                  </p>

                  <div className="p-4 rounded-xl bg-[hsl(var(--muted))/0.3] border border-[hsl(var(--border))/0.4] space-y-2">
                    <div className="flex justify-between">
                      <span>Candidate</span>
                      <span className="font-bold text-[hsl(var(--text-primary))]">{selectedApp.student?.user?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Role</span>
                      <span className="font-bold text-[hsl(var(--text-primary))]">{selectedApp.job?.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Company</span>
                      <span className="font-bold text-[hsl(var(--text-primary))]">{selectedApp.job?.company?.name || 'Company'}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button
                      onClick={() => handlePublishResult(selectedApp.id, 'REJECTED')}
                      disabled={isPublishingResult}
                      className="flex-1 inline-flex justify-center items-center gap-1.5 py-2 px-3.5 text-xs font-bold text-[hsl(var(--danger))] border border-[hsl(var(--danger)/0.2)] bg-[hsl(var(--danger-light))] hover:bg-[hsl(var(--danger)/0.15)] rounded-lg transition-colors cursor-pointer"
                    >
                      <XCircle className="h-4 w-4" />
                      Mark Rejected
                    </button>
                    <button
                      onClick={() => handlePublishResult(selectedApp.id, 'SELECTED')}
                      disabled={isPublishingResult}
                      className="flex-1 inline-flex justify-center items-center gap-1.5 py-2 px-3.5 text-xs font-bold text-white bg-[hsl(var(--success))] hover:bg-[hsl(var(--success)/0.9)] rounded-lg transition-all cursor-pointer"
                    >
                      <UserCheck className="h-4 w-4" />
                      Mark Selected
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full border border-dashed border-[hsl(var(--border))] rounded-2xl flex flex-col items-center justify-center p-12 text-center text-[hsl(var(--text-muted))]">
              <Calendar className="h-10 w-10 text-[hsl(var(--text-muted))] mb-2" />
              <p className="font-bold text-sm">No Candidate Selected</p>
              <p className="text-xs mt-1">Select a candidate from the roster list to schedule interviews or publish hiring results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InterviewDesk;
