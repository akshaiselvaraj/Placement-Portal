import React, { useState, useEffect } from 'react';
import { useActivities, useActivityDetails } from '../hooks/useActivities';
import {
  Calendar, MapPin, Award, CheckCircle, Search,
  Play, Check, Key, ArrowRight, ShieldAlert, X, Plus
} from 'lucide-react';
import { LoadingSkeleton, EmptyState } from '@/components/common';
import { io } from 'socket.io-client';

export function StudentActivitiesPage() {
  const { activitiesQuery, myActivitiesQuery } = useActivities();

  // Search/Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

  // Socket listener to update list in real time
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL || window.location.origin;
    const socket = io(socketUrl);

    socket.on('activity_created', () => {
      activitiesQuery.refetch();
    });

    socket.on('activity_cancelled', () => {
      activitiesQuery.refetch();
      myActivitiesQuery.refetch();
      if (selectedActivityId) {
        // If current viewing is cancelled
        activitiesQuery.refetch();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const registeredMap = new Map<string, string>(); // activityId -> status
  if (myActivitiesQuery.data) {
    myActivitiesQuery.data.forEach((p) => {
      registeredMap.set(p.activityId, p.status);
    });
  }

  const filteredActivities = (activitiesQuery.data || []).filter((act) => {
    const matchesSearch = act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (act.venue || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || act.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-[hsl(var(--text-primary))]">
          Placement Activities
        </h1>
        <p className="text-sm text-[hsl(var(--text-secondary))]">
          View assigned and live events, input verification OTPs, and track your activity points.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-xl p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--text-muted))]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search activities by title, description, venue..."
            className="w-full pl-9 pr-3 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg text-xs w-full md:w-auto"
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

      {/* Activities Grid */}
      {activitiesQuery.isLoading || myActivitiesQuery.isLoading ? (
        <LoadingSkeleton count={6} height="h-36" />
      ) : filteredActivities.length === 0 ? (
        <EmptyState title="No activities available" message="Check back later for newly scheduled placement activities." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((act) => {
            const status = registeredMap.get(act.id) || 'NOT_ASSIGNED';
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
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      status === 'STARTED' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      status === 'ASSIGNED' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                      'bg-slate-50 text-slate-700 border border-slate-200'
                    }`}>
                      {status === 'NOT_ASSIGNED' ? 'Open' : status.replace('_', ' ')}
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
                    <div className="flex items-center gap-2 text-purple-600 font-bold">
                      <Award className="h-3.5 w-3.5" />
                      <span>{act.points} Activity Points</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedActivityId(act.id)}
                  className={`mt-5 w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border ${
                    status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    status === 'STARTED' ? 'bg-amber-500 hover:bg-amber-600 text-white border-transparent shadow-xs' :
                    status === 'ASSIGNED' ? 'bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))/0.9] text-white border-transparent shadow-xs' :
                    'bg-[hsl(var(--background))] hover:bg-[hsl(var(--border)/0.3)] text-[hsl(var(--text-primary))] border-[hsl(var(--border))]'
                  }`}
                >
                  {status === 'COMPLETED' && <Check className="h-3.5 w-3.5" />}
                  {status === 'COMPLETED' ? '✓ Completed' : 'Enter Verification Panel'}
                  {status !== 'COMPLETED' && <ArrowRight className="h-3.5 w-3.5" />}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* VERIFICATION MODAL / DRAWER */}
      {selectedActivityId && (
        <OtpVerificationModal
          id={selectedActivityId}
          onClose={() => {
            setSelectedActivityId(null);
            myActivitiesQuery.refetch();
          }}
          registeredMap={registeredMap}
        />
      )}
    </div>
  );
}

function OtpVerificationModal({
  id,
  onClose,
  registeredMap
}: {
  id: string;
  onClose: () => void;
  registeredMap: Map<string, string>;
}) {
  const { detailsQuery, joinActivity, startActivity, endActivity, isJoining, isStarting, isEnding } = useActivityDetails(id);
  const [otp, setOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Socket update logic
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL || window.location.origin;
    const socket = io(socketUrl);

    socket.emit('join_activity', id);

    socket.on('activity_cancelled', () => {
      alert('This activity has been cancelled by the administrator.');
      onClose();
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  const activity = detailsQuery.data;
  const status = registeredMap.get(id) || 'NOT_ASSIGNED';

  if (detailsQuery.isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
        <div className="bg-[hsl(var(--surface))] p-8 rounded-2xl">Loading verification panel...</div>
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

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setErrorMsg('OTP must be exactly 6 numeric digits.');
      return;
    }

    try {
      if (status === 'NOT_ASSIGNED') {
        await joinActivity(otp);
        setSuccessMsg('Successfully joined the activity! Your status is now ASSIGNED.');
      } else if (status === 'ASSIGNED') {
        await startActivity(otp);
        setSuccessMsg('Activity started! Status updated to STARTED.');
      } else if (status === 'STARTED') {
        await endActivity(otp);
        setSuccessMsg('Activity completed successfully! configured points are credited.');
      }
      setOtp('');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Verification failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-5 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]">
          <div>
            <h3 className="font-extrabold text-sm text-[hsl(var(--text-primary))]">OTP Verification</h3>
            <span className="text-[10px] font-bold text-[hsl(var(--text-secondary))]">{activity.title}</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[hsl(var(--muted))] rounded-lg">
            <X className="h-4.5 w-4.5 text-[hsl(var(--text-muted))]" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Messages */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-lg text-xs flex items-center gap-2">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-rose-500" />
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle className="h-4.5 w-4.5 shrink-0 text-emerald-500" />
              {successMsg}
            </div>
          )}

          {/* Activity State specific render */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl">
              <div className="p-3 rounded-lg bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] shrink-0">
                {status === 'NOT_ASSIGNED' && <Plus className="h-5 w-5" />}
                {status === 'ASSIGNED' && <Play className="h-5 w-5" />}
                {status === 'STARTED' && <Key className="h-5 w-5" />}
                {status === 'COMPLETED' && <Check className="h-5 w-5" />}
              </div>
              <div>
                <span className="text-[9px] font-extrabold text-[hsl(var(--text-muted))] uppercase">Your Current State</span>
                <h4 className="font-extrabold text-xs text-[hsl(var(--text-primary))] mt-0.5">
                  {status === 'NOT_ASSIGNED' && 'Register Participant'}
                  {status === 'ASSIGNED' && 'Start Verification'}
                  {status === 'STARTED' && 'End / Checkout Verification'}
                  {status === 'COMPLETED' && 'Activity Completed'}
                </h4>
                <p className="text-[10px] text-[hsl(var(--text-secondary))] mt-0.5">
                  {status === 'NOT_ASSIGNED' && 'Enter the ADD PARTICIPANT OTP provided by the host.'}
                  {status === 'ASSIGNED' && 'Enter the START OTP to verify your presence at the beginning.'}
                  {status === 'STARTED' && 'Enter the END OTP to checkout and claim activity points.'}
                  {status === 'COMPLETED' && `Successfully completed! ${activity.points} points awarded.`}
                </p>
              </div>
            </div>

            {status !== 'COMPLETED' ? (
              <form onSubmit={handleOtpVerify} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[hsl(var(--text-muted))] uppercase tracking-wider block">
                    {status === 'NOT_ASSIGNED' && 'Add Participant OTP'}
                    {status === 'ASSIGNED' && 'Start Activity OTP'}
                    {status === 'STARTED' && 'End Activity OTP'}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit numeric OTP"
                    className="w-full text-center tracking-widest font-mono font-black text-base px-3 py-3 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isJoining || isStarting || isEnding}
                  className="w-full py-2.5 bg-[hsl(var(--primary))] text-white rounded-xl text-xs font-bold hover:opacity-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {(isJoining || isStarting || isEnding) ? 'Verifying...' : 'Verify & Continue'}
                </button>
              </form>
            ) : (
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:opacity-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Close Panel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
