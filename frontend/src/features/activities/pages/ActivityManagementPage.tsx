import React, { useState, useEffect } from 'react';
import { useActivities, useActivityDetails } from '../hooks/useActivities';
import { type ActivityOtpType } from '../services/activity.service';
import {
  Calendar, MapPin, Award, Users, Clock, ShieldAlert,
  Plus, X, Copy, Eye, EyeOff, RefreshCw, ClipboardList, Search, Info, ArrowUpRight
} from 'lucide-react';
import { LoadingSkeleton, EmptyState } from '@/components/common';
import { io } from 'socket.io-client';

export function ActivityManagementPage() {
  const { activitiesQuery, analyticsQuery, createActivity, cancelActivity } = useActivities();

  // Dialog / Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('HACKATHON');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [points, setPoints] = useState(0);
  const [maxParticipants, setMaxParticipants] = useState<number | ''>('');
  const [venue, setVenue] = useState('');
  const [instructions, setInstructions] = useState('');
  const [gracePeriodMinutes, setGracePeriodMinutes] = useState(0);
  const [formError, setFormError] = useState('');

  // Socket listener for real-time counts
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL || window.location.origin;
    const socket = io(socketUrl);

    socket.on('activity_created', () => {
      activitiesQuery.refetch();
      analyticsQuery.refetch();
    });

    socket.on('activity_updated', () => {
      activitiesQuery.refetch();
    });

    socket.on('activity_cancelled', () => {
      activitiesQuery.refetch();
      analyticsQuery.refetch();
    });

    socket.on('student_joined', () => {
      activitiesQuery.refetch();
      analyticsQuery.refetch();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim() || !description.trim() || !startTime || !endTime) {
      setFormError('Please fill in all required fields.');
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      setFormError('End time must be strictly after start time.');
      return;
    }

    try {
      await createActivity({
        title,
        description,
        category,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        points,
        maxParticipants: maxParticipants ? Number(maxParticipants) : null,
        venue: venue.trim() || null,
        instructions: instructions.trim() || null,
        gracePeriodMinutes: Number(gracePeriodMinutes),
      });

      // Reset
      setIsCreateOpen(false);
      setTitle('');
      setDescription('');
      setCategory('HACKATHON');
      setStartTime('');
      setEndTime('');
      setPoints(0);
      setMaxParticipants('');
      setVenue('');
      setInstructions('');
      setGracePeriodMinutes(0);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create activity.');
    }
  };

  const filteredActivities = (activitiesQuery.data || []).filter((act) => {
    const matchesSearch = act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (act.venue || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || act.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || act.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[hsl(var(--text-primary))]">
            Activity Management
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))]">
            Create activities, manage participants, and monitor OTP verification lifecycles.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-white rounded-xl font-semibold text-sm hover:opacity-90 shadow-md transition-opacity cursor-pointer self-start md:self-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          Create Activity
        </button>
      </div>

      {/* Analytics widgets */}
      {analyticsQuery.isLoading ? (
        <LoadingSkeleton count={4} height="h-24" />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
            <span className="text-[10px] uppercase font-bold text-[hsl(var(--text-muted))]">Live Activities</span>
            <div className="text-2xl font-black mt-1 text-emerald-600 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {analyticsQuery.data?.live}
            </div>
          </div>
          <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
            <span className="text-[10px] uppercase font-bold text-[hsl(var(--text-muted))]">Upcoming Activities</span>
            <div className="text-2xl font-black mt-1 text-amber-600">{analyticsQuery.data?.upcoming}</div>
          </div>
          <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
            <span className="text-[10px] uppercase font-bold text-[hsl(var(--text-muted))]">Total Participants</span>
            <div className="text-2xl font-black mt-1 text-[hsl(var(--primary))]">{analyticsQuery.data?.totalParticipants}</div>
          </div>
          <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
            <span className="text-[10px] uppercase font-bold text-[hsl(var(--text-muted))]">Completion Rate</span>
            <div className="text-2xl font-black mt-1 text-purple-600">{analyticsQuery.data?.completionRate}%</div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-xl p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--text-muted))]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search activities by title, venue..."
            className="w-full pl-9 pr-3 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg text-xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="LIVE">Live</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg text-xs"
          >
            <option value="ALL">All Categories</option>
            <option value="HACKATHON">Hackathon</option>
            <option value="WORKSHOP">Workshop</option>
            <option value="SEMINAR">Seminar</option>
            <option value="GUEST_LECTURE">Guest Lecture</option>
            <option value="MOCK_INTERVIEW">Mock Interview</option>
            <option value="TECHNICAL_CONTEST">Technical Contest</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Activity Grid */}
      {activitiesQuery.isLoading ? (
        <LoadingSkeleton count={6} height="h-36" />
      ) : filteredActivities.length === 0 ? (
        <EmptyState title="No activities found" message="Try adjusting your filters or create a new activity." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((act) => {
            const startDate = new Date(act.startTime).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short' });
            const startStr = new Date(act.startTime).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
            const endStr = new Date(act.endTime).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
            
            return (
              <div key={act.id} className="bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] uppercase tracking-wider">
                      {act.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      act.status === 'LIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      act.status === 'SCHEDULED' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      act.status === 'CANCELLED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      'bg-slate-50 text-slate-700 border border-slate-200'
                    }`}>
                      {act.status === 'LIVE' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                      {act.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-[hsl(var(--text-primary))] line-clamp-1">{act.title}</h3>
                    <p className="text-xs text-[hsl(var(--text-secondary))] line-clamp-2 mt-1">{act.description}</p>
                  </div>

                  <div className="space-y-1.5 pt-2 text-xs text-[hsl(var(--text-secondary))] border-t border-[hsl(var(--border)/0.5)]">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{startDate} • {startStr} - {endStr}</span>
                    </div>
                    {act.venue && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{act.venue}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <div className="flex items-center gap-1.5 text-purple-600">
                        <Award className="h-3.5 w-3.5" />
                        <span>{act.points} pts</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[hsl(var(--text-muted))]">
                        <Users className="h-3.5 w-3.5" />
                        <span>{act._count?.participants || 0} {act.maxParticipants ? `/ ${act.maxParticipants}` : ''} registered</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-[hsl(var(--border))]">
                  <button
                    onClick={() => setSelectedActivityId(act.id)}
                    className="flex-1 py-1.5 bg-[hsl(var(--background))] hover:bg-[hsl(var(--border)/0.3)] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    View Details
                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                  {act.status === 'SCHEDULED' && (
                    <button
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to cancel this activity?')) {
                          await cancelActivity(act.id);
                        }
                      }}
                      className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE ACTIVITY MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-[hsl(var(--border))]">
              <h2 className="font-extrabold text-base text-[hsl(var(--text-primary))] flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[hsl(var(--primary))]" />
                Create Placement Activity
              </h2>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 hover:bg-[hsl(var(--muted))] rounded-lg">
                <X className="h-4.5 w-4.5 text-[hsl(var(--text-muted))]" />
              </button>
            </div>
            
            <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg text-xs flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  {formError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[hsl(var(--text-muted))] uppercase">Activity Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. One-Day DSA Hackathon"
                  className="w-full px-3 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[hsl(var(--text-muted))] uppercase">Description *</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize the agenda and timeline of this activity..."
                  rows={3}
                  className="w-full px-3 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[hsl(var(--text-muted))] uppercase">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg text-sm"
                  >
                    <option value="HACKATHON">Hackathon</option>
                    <option value="WORKSHOP">Workshop</option>
                    <option value="SEMINAR">Seminar</option>
                    <option value="GUEST_LECTURE">Guest Lecture</option>
                    <option value="MOCK_INTERVIEW">Mock Interview</option>
                    <option value="TECHNICAL_CONTEST">Technical Contest</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[hsl(var(--text-muted))] uppercase">Points *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[hsl(var(--text-muted))] uppercase">Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[hsl(var(--text-muted))] uppercase">End Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-[hsl(var(--text-muted))] uppercase">Venue</label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g. SF Seminar Hall I"
                    className="w-full px-3 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[hsl(var(--text-muted))] uppercase">Grace Period (min)</label>
                  <input
                    type="number"
                    min={0}
                    value={gracePeriodMinutes}
                    onChange={(e) => setGracePeriodMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className="text-[11px] font-bold text-[hsl(var(--text-muted))] uppercase">Max Participants (optional)</label>
                  <input
                    type="number"
                    min={1}
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Leave empty for unlimited"
                    className="w-full px-3 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[hsl(var(--text-muted))] uppercase">Instructions (optional)</label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Dress code, prerequisites..."
                  rows={2}
                  className="w-full px-3 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg text-sm resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-[hsl(var(--border))]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] rounded-lg text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[hsl(var(--primary))] text-white rounded-lg text-xs font-bold hover:opacity-95 shadow-md cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW ACTIVITY DETAILS MODAL */}
      {selectedActivityId && (
        <ActivityDetailsModal id={selectedActivityId} onClose={() => setSelectedActivityId(null)} />
      )}
    </div>
  );
}

function ActivityDetailsModal({ id, onClose }: { id: string; onClose: () => void }) {
  const { detailsQuery, participantsQuery, auditLogsQuery, regenerateOtp, isRegeneratingOtp } = useActivityDetails(id);
  const [activeTab, setActiveTab] = useState<'participants' | 'audit' | 'otps'>('participants');

  // Search/Filters for participants table
  const [partSearch, setPartSearch] = useState('');
  const [partStatus, setPartStatus] = useState('ALL');

  // OTP visibility state
  const [showOtp, setShowOtp] = useState<Record<string, boolean>>({});

  const activity = detailsQuery.data;

  // Real-time socket logic inside details dialog
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL || window.location.origin;
    const socket = io(socketUrl);

    socket.emit('join_activity', id);

    socket.on('student_joined', () => {
      participantsQuery.refetch();
      auditLogsQuery.refetch();
    });

    socket.on('student_started', () => {
      participantsQuery.refetch();
      auditLogsQuery.refetch();
    });

    socket.on('student_completed', () => {
      participantsQuery.refetch();
      auditLogsQuery.refetch();
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  if (detailsQuery.isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
        <div className="bg-[hsl(var(--surface))] p-8 rounded-2xl">Loading Details...</div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
        <div className="bg-[hsl(var(--surface))] p-8 rounded-2xl text-center">
          <p>Activity not found.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-[hsl(var(--primary))] text-white rounded">Close</button>
        </div>
      </div>
    );
  }

  const toggleOtp = (type: string) => {
    setShowOtp(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('OTP copied to clipboard!');
  };

  const filteredParticipants = (participantsQuery.data || []).filter((p) => {
    const matchesSearch = p.student.user.name.toLowerCase().includes(partSearch.toLowerCase()) ||
      p.student.rollNumber.toLowerCase().includes(partSearch.toLowerCase()) ||
      p.student.department.toLowerCase().includes(partSearch.toLowerCase());
    
    const matchesStatus = partStatus === 'ALL' || p.status === partStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex justify-between items-center p-5 border-b border-[hsl(var(--border))]">
          <div>
            <h2 className="font-extrabold text-base text-[hsl(var(--text-primary))]">{activity.title}</h2>
            <span className="text-xs text-[hsl(var(--text-secondary))]">{activity.category} • {activity.venue || 'No venue'}</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[hsl(var(--muted))] rounded-lg">
            <X className="h-4.5 w-4.5 text-[hsl(var(--text-muted))]" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-xs font-bold uppercase tracking-wider text-[hsl(var(--text-muted))]">
          <button
            onClick={() => setActiveTab('participants')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'participants' ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]' : 'border-transparent hover:text-[hsl(var(--text-primary))]'
            }`}
          >
            <Users className="h-4 w-4" /> Participants
          </button>
          <button
            onClick={() => setActiveTab('otps')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'otps' ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]' : 'border-transparent hover:text-[hsl(var(--text-primary))]'
            }`}
          >
            <Clock className="h-4 w-4" /> OTP Control
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'audit' ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]' : 'border-transparent hover:text-[hsl(var(--text-primary))]'
            }`}
          >
            <ClipboardList className="h-4 w-4" /> Audit Trails
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* PARTICIPANTS TAB */}
          {activeTab === 'participants' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--text-muted))]" />
                  <input
                    type="text"
                    value={partSearch}
                    onChange={(e) => setPartSearch(e.target.value)}
                    placeholder="Search participants by name, roll..."
                    className="w-full pl-9 pr-3 py-1.5 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg text-xs"
                  />
                </div>
                <select
                  value={partStatus}
                  onChange={(e) => setPartStatus(e.target.value)}
                  className="px-3 py-1.5 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg text-xs w-full sm:w-auto"
                >
                  <option value="ALL">All States</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="STARTED">Started</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              {participantsQuery.isLoading ? (
                <LoadingSkeleton count={3} height="h-10" />
              ) : filteredParticipants.length === 0 ? (
                <EmptyState title="No registered participants yet" message="Invite students by sharing the ADD PARTICIPANT OTP." />
              ) : (
                <div className="border border-[hsl(var(--border))] rounded-xl overflow-hidden bg-[hsl(var(--background))]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[hsl(var(--muted))] font-bold text-[hsl(var(--text-muted))] uppercase border-b border-[hsl(var(--border))] text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3">Student</th>
                        <th className="p-3">Department</th>
                        <th className="p-3">Timeline</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[hsl(var(--border))]">
                      {filteredParticipants.map((p) => (
                        <tr key={p.id} className="hover:bg-[hsl(var(--surface))]">
                          <td className="p-3">
                            <div className="font-bold text-[hsl(var(--text-primary))]">{p.student.user.name}</div>
                            <div className="text-[10px] text-[hsl(var(--text-secondary))]">{p.student.rollNumber}</div>
                          </td>
                          <td className="p-3">{p.student.department}</td>
                          <td className="p-3 space-y-0.5 text-[10px] text-[hsl(var(--text-secondary))]">
                            <div>Joined: {new Date(p.assignedAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}</div>
                            {p.startedAt && (
                              <div>Started: {new Date(p.startedAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}</div>
                            )}
                            {p.completedAt && (
                              <div>Ended: {new Date(p.completedAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}</div>
                            )}
                          </td>
                          <td className="p-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                              p.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              p.status === 'STARTED' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="p-3 text-right font-bold text-purple-600">{p.pointsAwarded}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* OTP CONTROL TAB */}
          {activeTab === 'otps' && (
            <div className="space-y-6">
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex gap-2.5">
                <Info className="h-5 w-5 text-amber-600 shrink-0" />
                <div>
                  <p className="font-extrabold mb-0.5">OTP Security Policy</p>
                  <p>Keep these OTPs protected. Only share them with participants when appropriate. Regenerating an OTP immediately voids any active session credentials.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(['ADD_PARTICIPANT', 'START_ACTIVITY', 'END_ACTIVITY'] as ActivityOtpType[]).map((type) => {
                  const otpObj = activity.otps?.find((o) => o.type === type);
                  const isVisible = showOtp[type] || false;
                  
                  return (
                    <div key={type} className="border border-[hsl(var(--border))] rounded-xl p-4 bg-[hsl(var(--background))] flex flex-col justify-between h-44">
                      <div>
                        <span className="text-[10px] font-extrabold text-[hsl(var(--text-muted))] uppercase tracking-wider block">
                          {type.replace('_', ' ')}
                        </span>
                        <div className="text-xl font-mono font-black text-[hsl(var(--text-primary))] mt-4 flex items-center justify-between tracking-widest bg-[hsl(var(--surface))] p-3 border border-[hsl(var(--border))] rounded-lg">
                          <span>{isVisible ? (otpObj?.otp || '------') : '******'}</span>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => toggleOtp(type)}
                              className="p-1 hover:bg-[hsl(var(--muted))] rounded text-[hsl(var(--text-secondary))]"
                            >
                              {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                            {otpObj && (
                              <button
                                onClick={() => copyToClipboard(otpObj.otp)}
                                className="p-1 hover:bg-[hsl(var(--muted))] rounded text-[hsl(var(--text-secondary))]"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-[hsl(var(--border))]">
                        <span className="text-[9px] text-[hsl(var(--text-muted))] font-semibold">
                          Expiry: {otpObj ? new Date(otpObj.expiresAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                        </span>
                        <button
                          onClick={() => regenerateOtp(type)}
                          disabled={isRegeneratingOtp}
                          className="text-[10px] font-extrabold text-[hsl(var(--primary))] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw className="h-3 w-3 animate-hover" />
                          Regenerate
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AUDIT LOGS TAB */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              {auditLogsQuery.isLoading ? (
                <LoadingSkeleton count={3} height="h-12" />
              ) : !auditLogsQuery.data || auditLogsQuery.data.length === 0 ? (
                <EmptyState title="No logs found" message="Activity logging will populate as students and officers perform actions." />
              ) : (
                <div className="space-y-2.5">
                  {auditLogsQuery.data.map((log) => (
                    <div key={log.id} className="p-3 border border-[hsl(var(--border))] rounded-xl bg-[hsl(var(--background))] flex items-start gap-3 hover:bg-[hsl(var(--surface)/0.5)] transition-colors">
                      <div className="p-2 rounded-lg bg-[hsl(var(--muted))] text-[hsl(var(--text-muted))]">
                        <ClipboardList className="h-4 w-4" />
                      </div>
                      <div className="flex-1 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-[hsl(var(--text-primary))]">{log.action.replace(/_/g, ' ')}</span>
                          <span className="text-[10px] text-[hsl(var(--text-secondary))]">
                            {new Date(log.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                          </span>
                        </div>
                        <p className="text-[hsl(var(--text-secondary))] mt-0.5">
                          Actor: <strong>{log.actorRole}</strong> (ID: {log.actorId.substring(0,8)})
                        </p>
                        {log.metadata && (
                          <pre className="text-[10px] text-[hsl(var(--text-muted))] bg-[hsl(var(--surface))] p-2 rounded-lg mt-1 overflow-x-auto max-w-full border border-[hsl(var(--border))/0.5]">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
