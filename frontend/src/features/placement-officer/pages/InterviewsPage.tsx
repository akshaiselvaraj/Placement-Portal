import { useState, useMemo } from 'react';
import { usePlacementData } from '../hooks/usePlacementData';
import { LoadingSkeleton, EmptyState } from '@/components/common';
import { toast } from '@/store';
import {
  UserCheck,
  Calendar as CalendarIcon,
  List,
  Plus,
  Search,
  User,
  Clock,
  MapPin,
  Video,
  MessageSquare,
  Edit,
  X,
} from 'lucide-react';

export interface InterviewSlot {
  id: string;
  studentName: string;
  rollNumber: string;
  companyName: string;
  roundName: string;
  interviewerName: string;
  date: string;
  time: string;
  mode: 'ONLINE' | 'OFFLINE';
  venueOrLink: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  feedback?: string;
}

const INITIAL_INTERVIEWS: InterviewSlot[] = [
  {
    id: 'int-1',
    studentName: 'Rakshana S.',
    rollNumber: '2022CSE045',
    companyName: 'Google India',
    roundName: 'Round 2: System Design & Coding',
    interviewerName: 'Sundar Pitchai (Sr. Tech Lead)',
    date: '2026-08-05',
    time: '10:00 AM - 11:00 AM',
    mode: 'ONLINE',
    venueOrLink: 'https://meet.google.com/abc-xyz-123',
    status: 'SCHEDULED',
    feedback: 'Strong performance in DS/Algo round.',
  },
  {
    id: 'int-2',
    studentName: 'Akshai V.',
    rollNumber: '2022CSE012',
    companyName: 'Microsoft',
    roundName: 'Round 1: Technical & DSA',
    interviewerName: 'Ananya Sharma (Engineering Mgr)',
    date: '2026-08-05',
    time: '02:00 PM - 03:00 PM',
    mode: 'OFFLINE',
    venueOrLink: 'Placement Block C - Interview Room 2',
    status: 'SCHEDULED',
  },
  {
    id: 'int-3',
    studentName: 'Divya M.',
    rollNumber: '2022IT089',
    companyName: 'Amazon',
    roundName: 'Round 3: Leadership Principles & HR',
    interviewerName: 'Rajesh Kumar (HR Director)',
    date: '2026-08-02',
    time: '11:30 AM - 12:15 PM',
    mode: 'ONLINE',
    venueOrLink: 'https://chime.aws/789101',
    status: 'COMPLETED',
    feedback: 'Excellent communication skills. Recommended for offer.',
  },
  {
    id: 'int-4',
    studentName: 'Karthik R.',
    rollNumber: '2022ECE034',
    companyName: 'TCS Digital',
    roundName: 'Round 1: Aptitude & Technical',
    interviewerName: 'Vikram Sethi (Team Lead)',
    date: '2026-08-08',
    time: '04:00 PM - 05:00 PM',
    mode: 'OFFLINE',
    venueOrLink: 'Computer Center Lab 4',
    status: 'SCHEDULED',
  },
];

export function InterviewsPage() {
  const { isLoadingApplications } = usePlacementData();
  const [interviews, setInterviews] = useState<InterviewSlot[]>(INITIAL_INTERVIEWS);

  // View Mode: 'LIST' or 'CALENDAR'
  const [viewMode, setViewMode] = useState<'LIST' | 'CALENDAR'>('LIST');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals & Drawers State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState<InterviewSlot | null>(null);
  const [feedbackInterview, setFeedbackInterview] = useState<InterviewSlot | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    studentName: '',
    rollNumber: '',
    companyName: '',
    roundName: 'Round 1: Technical',
    interviewerName: '',
    date: '',
    time: '10:00 AM - 11:00 AM',
    mode: 'ONLINE' as 'ONLINE' | 'OFFLINE',
    venueOrLink: '',
  });

  // Derived Company Options
  const uniqueCompanies = useMemo(() => {
    return Array.from(new Set(interviews.map((i) => i.companyName)));
  }, [interviews]);

  // Filtered Interviews
  const filteredInterviews = useMemo(() => {
    return interviews.filter((item) => {
      const matchesSearch =
        item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.interviewerName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCompany = companyFilter === 'ALL' || item.companyName === companyFilter;
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

      return matchesSearch && matchesCompany && matchesStatus;
    });
  }, [interviews, searchQuery, companyFilter, statusFilter]);

  // Grouped by Company for List View
  const groupedByCompany = useMemo(() => {
    const map: Record<string, InterviewSlot[]> = {};
    filteredInterviews.forEach((item) => {
      if (!map[item.companyName]) {
        map[item.companyName] = [];
      }
      map[item.companyName].push(item);
    });
    return map;
  }, [filteredInterviews]);

  // Handlers
  const handleOpenScheduleModal = () => {
    setFormData({
      studentName: '',
      rollNumber: '',
      companyName: '',
      roundName: 'Round 1: Technical',
      interviewerName: '',
      date: '',
      time: '10:00 AM - 11:00 AM',
      mode: 'ONLINE',
      venueOrLink: '',
    });
    setEditingInterview(null);
    setIsScheduleModalOpen(true);
  };

  const handleOpenReschedule = (interview: InterviewSlot) => {
    setEditingInterview(interview);
    setFormData({
      studentName: interview.studentName,
      rollNumber: interview.rollNumber,
      companyName: interview.companyName,
      roundName: interview.roundName,
      interviewerName: interview.interviewerName,
      date: interview.date,
      time: interview.time,
      mode: interview.mode,
      venueOrLink: interview.venueOrLink,
    });
    setIsScheduleModalOpen(true);
  };

  const handleSaveInterview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentName || !formData.companyName || !formData.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingInterview) {
      setInterviews((prev) =>
        prev.map((item) =>
          item.id === editingInterview.id
            ? {
                ...item,
                studentName: formData.studentName,
                rollNumber: formData.rollNumber || item.rollNumber,
                companyName: formData.companyName,
                roundName: formData.roundName,
                interviewerName: formData.interviewerName,
                date: formData.date,
                time: formData.time,
                mode: formData.mode,
                venueOrLink: formData.venueOrLink,
              }
            : item
        )
      );
      toast.success('Interview rescheduled successfully!');
    } else {
      const newSlot: InterviewSlot = {
        id: `int-${Date.now()}`,
        studentName: formData.studentName,
        rollNumber: formData.rollNumber || '2022CSE099',
        companyName: formData.companyName,
        roundName: formData.roundName,
        interviewerName: formData.interviewerName || 'Assigned Interviewer',
        date: formData.date,
        time: formData.time,
        mode: formData.mode,
        venueOrLink: formData.venueOrLink || (formData.mode === 'ONLINE' ? 'https://meet.google.com/new' : 'Lab 1'),
        status: 'SCHEDULED',
      };
      setInterviews((prev) => [newSlot, ...prev]);
      toast.success('Interview scheduled successfully!');
    }

    setIsScheduleModalOpen(false);
  };

  const handleToggleCompleted = (id: string) => {
    setInterviews((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: i.status === 'COMPLETED' ? 'SCHEDULED' : 'COMPLETED' } : i))
    );
    toast.success('Interview status updated!');
  };

  const handleSaveFeedback = () => {
    if (!feedbackInterview) return;
    setInterviews((prev) =>
      prev.map((i) => (i.id === feedbackInterview.id ? { ...i, feedback: feedbackText } : i))
    );
    toast.success('Interview feedback recorded!');
    setFeedbackInterview(null);
    setFeedbackText('');
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-[hsl(var(--border))] bg-gradient-to-r from-[hsl(var(--surface))] via-[hsl(var(--surface))] to-[hsl(var(--primary)/0.04)] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="h-7 w-7 text-[hsl(var(--primary))]" />
            <h1 className="text-2xl font-black text-[hsl(var(--text-primary))] tracking-tight">
              Interview Scheduler & Management
            </h1>
          </div>
          <p className="text-xs text-[hsl(var(--text-secondary))] mt-1">
            Schedule interview rounds, assign interviewers, manage online meeting links, and record round feedback.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="p-1 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] flex items-center gap-1 text-xs font-bold">
            <button
              onClick={() => setViewMode('LIST')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'LIST'
                  ? 'bg-[hsl(var(--surface))] text-[hsl(var(--primary))] shadow-xs font-extrabold'
                  : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              List View
            </button>
            <button
              onClick={() => setViewMode('CALENDAR')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'CALENDAR'
                  ? 'bg-[hsl(var(--surface))] text-[hsl(var(--primary))] shadow-xs font-extrabold'
                  : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
              }`}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              Calendar View
            </button>
          </div>

          <button
            onClick={handleOpenScheduleModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            Schedule Interview
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[hsl(var(--text-muted))]" />
          <input
            type="text"
            placeholder="Search by student, roll number, interviewer, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
          />
        </div>

        <select
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
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
          className="px-3 py-2 text-xs rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
        >
          <option value="ALL">All Statuses</option>
          <option value="SCHEDULED">SCHEDULED</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      {/* Main Content Area */}
      {viewMode === 'LIST' ? (
        /* LIST VIEW GROUPED BY COMPANY */
        isLoadingApplications ? (
          <LoadingSkeleton count={3} height="h-48" />
        ) : Object.keys(groupedByCompany).length === 0 ? (
          <div className="border border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--surface))] py-12">
            <EmptyState
              title="No interview slots found"
              message="Click 'Schedule Interview' above to create a new slot."
              icon={<UserCheck className="h-8 w-8 text-[hsl(var(--text-muted))]" />}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByCompany).map(([company, slots]) => (
              <div
                key={company}
                className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 shadow-xs space-y-4"
              >
                {/* Company Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border))]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] font-black text-sm flex items-center justify-center border border-[hsl(var(--primary)/0.2)]">
                      {company.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-[hsl(var(--text-primary))]">{company}</h3>
                      <p className="text-xs text-[hsl(var(--text-secondary))]">{slots.length} Scheduled Rounds</p>
                    </div>
                  </div>
                </div>

                {/* Interview Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {slots.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs space-y-3 hover:border-[hsl(var(--primary)/0.3)] transition-all relative"
                    >
                      {/* Top bar */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-sm text-[hsl(var(--text-primary))]">{item.studentName}</h4>
                          <p className="text-[11px] text-[hsl(var(--text-secondary))] font-mono">{item.rollNumber}</p>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            item.status === 'COMPLETED'
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                              : item.status === 'CANCELLED'
                              ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                              : 'bg-sky-500/10 text-sky-600 border-sky-500/20'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      {/* Round & Interviewer */}
                      <div className="p-2.5 rounded-lg bg-[hsl(var(--muted)/0.4)] border border-[hsl(var(--border)/0.5)] space-y-1 text-xs">
                        <p className="font-bold text-[hsl(var(--primary))]">{item.roundName}</p>
                        <p className="text-[11px] text-[hsl(var(--text-secondary))] flex items-center gap-1">
                          <User className="h-3 w-3 text-[hsl(var(--text-muted))]" />
                          Interviewer: <span className="font-semibold">{item.interviewerName}</span>
                        </p>
                      </div>

                      {/* Time & Venue */}
                      <div className="space-y-1.5 text-xs text-[hsl(var(--text-secondary))]">
                        <div className="flex items-center gap-2 font-medium">
                          <Clock className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
                          <span>
                            {item.date} • {item.time}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 font-medium">
                          {item.mode === 'ONLINE' ? (
                            <Video className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <MapPin className="h-3.5 w-3.5 text-amber-500" />
                          )}
                          <span className="truncate">{item.venueOrLink}</span>
                        </div>
                      </div>

                      {/* Feedback snippet */}
                      {item.feedback && (
                        <div className="p-2 rounded-md bg-amber-500/05 border border-amber-500/20 text-[11px] text-[hsl(var(--text-secondary))] italic flex items-start gap-1.5">
                          <MessageSquare className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{item.feedback}</span>
                        </div>
                      )}

                      {/* Card Actions */}
                      <div className="pt-2 border-t border-[hsl(var(--border))] flex items-center justify-between text-xs">
                        <button
                          onClick={() => {
                            setFeedbackInterview(item);
                            setFeedbackText(item.feedback || '');
                          }}
                          className="text-[hsl(var(--primary))] font-bold hover:underline inline-flex items-center gap-1"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          Feedback
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenReschedule(item)}
                            className="p-1.5 rounded-md border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
                            title="Reschedule"
                          >
                            <Edit className="h-3.5 w-3.5 text-[hsl(var(--text-muted))]" />
                          </button>
                          <button
                            onClick={() => handleToggleCompleted(item.id)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                              item.status === 'COMPLETED'
                                ? 'bg-slate-500/10 text-slate-600'
                                : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                            }`}
                          >
                            {item.status === 'COMPLETED' ? 'Mark Scheduled' : 'Mark Complete'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* CALENDAR VIEW GRID */
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[hsl(var(--border))]">
            <h3 className="font-extrabold text-base text-[hsl(var(--text-primary))] flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-[hsl(var(--primary))]" />
              August 2026 Interview Schedule Grid
            </h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Completed
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-sky-600">
                <span className="h-2 w-2 rounded-full bg-sky-500" /> Scheduled
              </span>
            </div>
          </div>

          {/* Monthly Days Grid */}
          <div className="grid grid-cols-7 gap-3 text-center text-xs font-bold text-[hsl(var(--text-muted))] uppercase">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
          </div>

          <div className="grid grid-cols-7 gap-3">
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1;
              const dateStr = `2026-08-${day < 10 ? '0' + day : day}`;
              const dayInterviews = filteredInterviews.filter((item) => item.date === dateStr);

              return (
                <div
                  key={day}
                  className={`min-h-[100px] p-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] space-y-1.5 ${
                    dayInterviews.length > 0 ? 'ring-1 ring-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.02)]' : ''
                  }`}
                >
                  <div className="text-right text-[11px] font-bold text-[hsl(var(--text-muted))]">{day}</div>
                  {dayInterviews.map((slot) => (
                    <div
                      key={slot.id}
                      onClick={() => handleOpenReschedule(slot)}
                      className="p-1.5 rounded-lg text-[10px] font-bold bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.2)] truncate cursor-pointer hover:scale-102 transition-transform"
                      title={`${slot.studentName} (${slot.companyName})`}
                    >
                      <p className="truncate font-extrabold">{slot.companyName}</p>
                      <p className="truncate text-[9px] text-[hsl(var(--text-secondary))]">{slot.studentName}</p>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Schedule / Reschedule Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[hsl(var(--surface))] rounded-2xl border border-[hsl(var(--border))] max-w-lg w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsScheduleModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-muted))]"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 pb-4 border-b border-[hsl(var(--border))]">
              <CalendarIcon className="h-5 w-5 text-[hsl(var(--primary))]" />
              <h3 className="font-bold text-base text-[hsl(var(--text-primary))]">
                {editingInterview ? 'Reschedule Interview Round' : 'Schedule Interview Round'}
              </h3>
            </div>

            <form onSubmit={handleSaveInterview} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rakshana S."
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google India"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1">
                    Interview Round
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Round 2: Tech & System Design"
                    value={formData.roundName}
                    onChange={(e) => setFormData({ ...formData, roundName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1">
                    Interviewer Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sundar Pitchai"
                    value={formData.interviewerName}
                    onChange={(e) => setFormData({ ...formData, interviewerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1">
                    Interview Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1">
                    Time Slot
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM - 11:00 AM"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1">Mode</label>
                  <select
                    value={formData.mode}
                    onChange={(e) => setFormData({ ...formData, mode: e.target.value as 'ONLINE' | 'OFFLINE' })}
                    className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none"
                  >
                    <option value="ONLINE">ONLINE (Virtual Meeting)</option>
                    <option value="OFFLINE">OFFLINE (In-person Campus)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1">
                    {formData.mode === 'ONLINE' ? 'Meeting Link' : 'Campus Venue Room'}
                  </label>
                  <input
                    type="text"
                    placeholder={
                      formData.mode === 'ONLINE' ? 'https://meet.google.com/xyz' : 'Placement Room 3, Block B'
                    }
                    value={formData.venueOrLink}
                    onChange={(e) => setFormData({ ...formData, venueOrLink: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[hsl(var(--border))]">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white font-bold cursor-pointer shadow-xs"
                >
                  {editingInterview ? 'Save Changes' : 'Confirm Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Drawer / Modal */}
      {feedbackInterview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[hsl(var(--surface))] rounded-2xl border border-[hsl(var(--border))] max-w-md w-full p-6 shadow-xl relative">
            <button
              onClick={() => setFeedbackInterview(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[hsl(var(--muted))]"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 pb-4 border-b border-[hsl(var(--border))]">
              <MessageSquare className="h-5 w-5 text-amber-500" />
              <h3 className="font-bold text-base text-[hsl(var(--text-primary))]">Interview Round Feedback</h3>
            </div>

            <div className="space-y-4 mt-4 text-xs">
              <div className="p-3 rounded-xl bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border))]">
                <p className="font-bold text-[hsl(var(--text-primary))]">{feedbackInterview.studentName}</p>
                <p className="text-[11px] text-[hsl(var(--text-secondary))]">
                  {feedbackInterview.companyName} • {feedbackInterview.roundName}
                </p>
              </div>

              <div>
                <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1">
                  Interviewer Feedback Notes
                </label>
                <textarea
                  rows={4}
                  placeholder="Record strengths, weak areas, coding problem feedback, recommendation..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[hsl(var(--border))]">
                <button
                  type="button"
                  onClick={() => setFeedbackInterview(null)}
                  className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveFeedback}
                  className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white font-bold cursor-pointer shadow-xs"
                >
                  Save Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InterviewsPage;
