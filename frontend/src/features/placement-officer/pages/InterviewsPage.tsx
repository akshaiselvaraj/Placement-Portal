import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { placementService } from '../services/placement.service';
import { LoadingSkeleton, EmptyState } from '@/components/common';
import { toast } from '@/store';
import {
  UserCheck,
  Calendar as CalendarIcon,
  Plus,
  Search,
  Clock,
  MapPin,
  Video,
  X,
  Edit,
} from 'lucide-react';
import type { Interview } from '@/types';

export function InterviewsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals & Drawers
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    applicationId: '',
    driveId: '',
    date: '',
    time: '10:00 AM',
    duration: '45',
    interviewer: '',
    meetingLink: '',
    roundType: 'Technical',
    location: '',
    instructions: '',
    status: 'SCHEDULED',
    attendance: 'PENDING',
    result: 'PENDING',
  });

  // Queries
  const { data: interviews = [], isLoading } = useQuery({
    queryKey: ['placement-interviews'],
    queryFn: () => placementService.getInterviews(),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['placement-applications-list'],
    queryFn: () => placementService.getApplications(),
  });

  const { data: drives = [] } = useQuery({
    queryKey: ['placement-drives-list'],
    queryFn: () => placementService.getDrives(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: placementService.scheduleInterview,
    onSuccess: () => {
      toast.success('Interview scheduled successfully & student notified');
      queryClient.invalidateQueries({ queryKey: ['placement-interviews'] });
      setIsScheduleModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => placementService.updateInterview(id, data),
    onSuccess: () => {
      toast.success('Interview updated successfully');
      queryClient.invalidateQueries({ queryKey: ['placement-interviews'] });
      setIsScheduleModalOpen(false);
      setEditingInterview(null);
    },
  });

  const uniqueCompanies = useMemo(() => {
    return Array.from(new Set(interviews.map((i) => i.drive?.company?.name).filter(Boolean)));
  }, [interviews]);

  const filteredInterviews = useMemo(() => {
    return interviews.filter((item) => {
      const studentName = item.application?.student?.user?.name || '';
      const companyName = item.drive?.company?.name || item.application?.job?.company?.name || '';
      const interviewer = item.interviewer || '';

      const matchesSearch =
        studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        interviewer.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCompany = companyFilter === 'ALL' || companyName === companyFilter;
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

      return matchesSearch && matchesCompany && matchesStatus;
    });
  }, [interviews, searchQuery, companyFilter, statusFilter]);

  const handleOpenScheduleModal = () => {
    setFormData({
      applicationId: applications[0]?.id || '',
      driveId: drives[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      duration: '45',
      interviewer: '',
      meetingLink: '',
      roundType: 'Technical',
      location: '',
      instructions: '',
      status: 'SCHEDULED',
      attendance: 'PENDING',
      result: 'PENDING',
    });
    setEditingInterview(null);
    setIsScheduleModalOpen(true);
  };

  const handleOpenEdit = (item: Interview) => {
    setEditingInterview(item);
    setFormData({
      applicationId: item.applicationId,
      driveId: item.driveId || '',
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
      time: item.time || '10:00 AM',
      duration: String(item.duration || 45),
      interviewer: item.interviewer || '',
      meetingLink: item.meetingLink || '',
      roundType: item.roundType || 'Technical',
      location: item.location || '',
      instructions: item.instructions || '',
      status: item.status,
      attendance: item.attendance || 'PENDING',
      result: item.result || 'PENDING',
    });
    setIsScheduleModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingInterview) {
      updateMutation.mutate({ id: editingInterview.id, data: formData });
    } else {
      createMutation.mutate({
        applicationId: formData.applicationId,
        driveId: formData.driveId,
        date: formData.date,
        type: formData.roundType,
        location: formData.location || formData.meetingLink || 'On-campus',
      });
    }
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-[hsl(var(--border))] bg-gradient-to-r from-[hsl(var(--surface))] via-[hsl(var(--surface))] to-[hsl(var(--primary)/0.04)] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="h-7 w-7 text-[hsl(var(--primary))]" />
            <h1 className="text-2xl font-black text-[hsl(var(--text-primary))] tracking-tight">
              Interview Scheduler Desk
            </h1>
          </div>
          <p className="text-xs text-[hsl(var(--text-secondary))] mt-1">
            Track student interview rounds, mark attendance, record evaluation feedback, and qualified candidates.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleOpenScheduleModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] rounded-lg transition-all cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Schedule Interview
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="w-full md:w-80 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[hsl(var(--text-muted))]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student, company, interviewer..."
            className="pl-9 pr-4 py-2 block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
          />
        </div>

        <div className="flex flex-wrap gap-2.5 items-center justify-end">
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-xs text-[hsl(var(--text-primary))] focus:outline-none"
          >
            <option value="ALL">All Companies</option>
            {uniqueCompanies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-xs text-[hsl(var(--text-primary))] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Main Grid View */}
      {isLoading ? (
        <LoadingSkeleton count={3} height="h-20" />
      ) : filteredInterviews.length === 0 ? (
        <EmptyState
          title="No interviews scheduled"
          message="Schedule candidate rounds by choosing applications."
          icon={<CalendarIcon className="h-8 w-8 text-[hsl(var(--text-muted))]" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInterviews.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:border-[hsl(var(--primary)/0.2)] transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-[hsl(var(--text-primary))]">
                      {item.application?.student?.user?.name || 'Candidate'}
                    </h4>
                    <p className="text-[10px] text-[hsl(var(--text-secondary))]">{item.application?.student?.rollNumber}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                    item.status === 'COMPLETED'
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                      : item.status === 'CANCELLED'
                      ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                      : 'bg-sky-500/10 text-sky-600 border-sky-500/20'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="pt-2 border-t border-[hsl(var(--border))/0.6] space-y-1.5 text-xs text-[hsl(var(--text-secondary))] font-medium">
                  <p className="font-semibold text-[hsl(var(--text-primary))]">
                    {item.drive?.company?.name || item.application?.job?.company?.name} &bull; {item.roundType}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-[hsl(var(--text-muted))]" />
                    {new Date(item.date).toLocaleDateString()} at {item.time} ({item.duration}m)
                  </p>
                  <p className="flex items-center gap-1.5">
                    {item.meetingLink ? (
                      <>
                        <Video className="h-4 w-4 text-[hsl(var(--text-muted))]" />
                        <a href={item.meetingLink} target="_blank" rel="noreferrer" className="text-[hsl(var(--primary))] hover:underline">
                          Online Video Link
                        </a>
                      </>
                    ) : (
                      <>
                        <MapPin className="h-4 w-4 text-[hsl(var(--text-muted))]" />
                        {item.location || 'On-campus'}
                      </>
                    )}
                  </p>
                  <p className="text-[10px] text-[hsl(var(--text-muted))] italic">
                    Interviewer: {item.interviewer}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[hsl(var(--border))/0.6] flex justify-between items-center text-xs">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  item.result === 'QUALIFIED'
                    ? 'bg-emerald-100 text-emerald-700'
                    : item.result === 'REJECTED'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  Result: {item.result}
                </span>

                <button
                  onClick={() => handleOpenEdit(item)}
                  className="inline-flex items-center gap-1 text-[hsl(var(--primary))] font-bold hover:underline cursor-pointer"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Update Round
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule / Reschedule Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[hsl(var(--surface))] rounded-2xl border border-[hsl(var(--border))] max-w-md w-full p-6 shadow-xl relative max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <button onClick={() => setIsScheduleModalOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-muted))]">
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-bold text-base text-[hsl(var(--text-primary))] pb-3 border-b border-[hsl(var(--border))]">
              {editingInterview ? 'Update Scheduled Round' : 'Schedule New Round'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 mt-4 text-xs">
              {!editingInterview && (
                <div>
                  <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">Candidate Application</label>
                  <select
                    value={formData.applicationId}
                    onChange={(e) => setFormData((p) => ({ ...p, applicationId: e.target.value }))}
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none"
                  >
                    {applications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.student?.user?.name} - {app.job?.company?.name} ({app.job?.title})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">Associated Drive (Optional)</label>
                <select
                  value={formData.driveId}
                  onChange={(e) => setFormData((p) => ({ ...p, driveId: e.target.value }))}
                  className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none"
                >
                  <option value="">No Associated Drive</option>
                  {drives.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">Time</label>
                  <input
                    type="text"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData((p) => ({ ...p, time: e.target.value }))}
                    placeholder="e.g. 10:00 AM"
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData((p) => ({ ...p, duration: e.target.value }))}
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">Round Type</label>
                  <select
                    value={formData.roundType}
                    onChange={(e) => setFormData((p) => ({ ...p, roundType: e.target.value }))}
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Coding">Coding</option>
                    <option value="Managerial">Managerial</option>
                    <option value="HR">HR</option>
                    <option value="Final">Final</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">Interviewer Name</label>
                <input
                  type="text"
                  value={formData.interviewer}
                  onChange={(e) => setFormData((p) => ({ ...p, interviewer: e.target.value }))}
                  placeholder="e.g. Vikram (Team Lead)"
                  className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">Meeting Link</label>
                  <input
                    type="text"
                    value={formData.meetingLink}
                    onChange={(e) => setFormData((p) => ({ ...p, meetingLink: e.target.value }))}
                    placeholder="https://meet.google.com/..."
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">Location (Offline)</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                    placeholder="Computer Center Lab 2"
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none"
                  />
                </div>
              </div>

              {editingInterview && (
                <div className="grid grid-cols-3 gap-3 p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))/0.2]">
                  <div>
                    <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                      className="w-full bg-transparent border-0 font-bold focus:ring-0 p-0 text-xs text-[hsl(var(--text-primary))]"
                    >
                      <option value="SCHEDULED">SCHEDULED</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1">Attendance</label>
                    <select
                      value={formData.attendance}
                      onChange={(e) => setFormData((p) => ({ ...p, attendance: e.target.value }))}
                      className="w-full bg-transparent border-0 font-bold focus:ring-0 p-0 text-xs text-[hsl(var(--text-primary))]"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PRESENT">PRESENT</option>
                      <option value="ABSENT">ABSENT</option>
                      <option value="LATE">LATE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1">Result</label>
                    <select
                      value={formData.result}
                      onChange={(e) => setFormData((p) => ({ ...p, result: e.target.value }))}
                      className="w-full bg-transparent border-0 font-bold focus:ring-0 p-0 text-xs text-[hsl(var(--text-primary))]"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="QUALIFIED">QUALIFIED</option>
                      <option value="REJECTED">REJECTED</option>
                      <option value="HOLD">HOLD</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-3 border-t border-[hsl(var(--border))]">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="py-2 px-4 font-bold rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-primary))] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="py-2 px-4 font-bold rounded-lg bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-white cursor-pointer shadow-xs disabled:opacity-50"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default InterviewsPage;
