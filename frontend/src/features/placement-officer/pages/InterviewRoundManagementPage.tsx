import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interviewService, type OfficerStudentRoundItem } from '@/services/interview.service';
import { LoadingSkeleton, EmptyState } from '@/components/common';
import { toast } from '@/store';
import {
  ShieldCheck,
  Search,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  User,
  Building2,
  AlertTriangle,
  X,
} from 'lucide-react';

export function InterviewRoundManagementPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRoundItem, setSelectedRoundItem] = useState<OfficerStudentRoundItem | null>(null);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [expiryDays, setExpiryDays] = useState<string>('');

  // Fetch Interview Rounds data
  const { data: roundItems = [], isLoading } = useQuery({
    queryKey: ['placement-interview-rounds', searchQuery, statusFilter],
    queryFn: () => interviewService.getPlacementOfficerRounds({ search: searchQuery, status: statusFilter }),
  });

  // Unlock Mutation
  const unlockMutation = useMutation({
    mutationFn: ({ studentRoundId, expiresAt }: { studentRoundId: string; expiresAt?: string }) =>
      interviewService.unlockStudentRound(studentRoundId, expiresAt),
    onSuccess: () => {
      toast.success('Question submission access unlocked for student!');
      queryClient.invalidateQueries({ queryKey: ['placement-interview-rounds'] });
      setIsUnlockModalOpen(false);
      setSelectedRoundItem(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to unlock round access');
    },
  });

  // Revoke Mutation
  const revokeMutation = useMutation({
    mutationFn: (studentRoundId: string) => interviewService.revokeStudentRound(studentRoundId),
    onSuccess: () => {
      toast.success('Round access revoked successfully');
      queryClient.invalidateQueries({ queryKey: ['placement-interview-rounds'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to revoke access');
    },
  });

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ studentRoundId, status }: { studentRoundId: string; status: string }) =>
      interviewService.updateStudentRoundStatus(studentRoundId, status),
    onSuccess: () => {
      toast.success('Student round status updated!');
      queryClient.invalidateQueries({ queryKey: ['placement-interview-rounds'] });
    },
  });

  const handleOpenUnlockModal = (item: OfficerStudentRoundItem) => {
    setSelectedRoundItem(item);
    setExpiryDays('');
    setIsUnlockModalOpen(true);
  };

  const handleConfirmUnlock = () => {
    if (!selectedRoundItem) return;
    let expiresAt: string | undefined = undefined;
    if (expiryDays && !isNaN(parseInt(expiryDays))) {
      const d = new Date();
      d.setDate(d.getDate() + parseInt(expiryDays));
      expiresAt = d.toISOString();
    }
    unlockMutation.mutate({ studentRoundId: selectedRoundItem.studentRoundId, expiresAt });
  };

  const filteredItems = roundItems.filter((item) => {
    if (statusFilter === 'UNLOCKED') return item.isUnlocked;
    if (statusFilter === 'LOCKED') return !item.isUnlocked;
    if (statusFilter === 'COMPLETED') return item.roundStatus === 'COMPLETED' || item.roundStatus === 'PASSED';
    return true;
  });

  if (isLoading) {
    return <LoadingSkeleton count={3} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-primary" />
            Interview Round Management & Access Control
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track student interview completion and authorize question submission access for verified candidates.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-card border border-border p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student, roll no, company, role..."
            className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="ALL">All Access States</option>
            <option value="UNLOCKED">Access Unlocked</option>
            <option value="LOCKED">Access Locked</option>
            <option value="COMPLETED">Round Completed</option>
          </select>
        </div>
      </div>

      {/* Round Management Table */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No interview round records found"
          description="Student interview rounds will appear here automatically when candidates apply and progress through company placement drives."
        />
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-foreground">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase font-semibold text-muted-foreground">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Company & Job Role</th>
                  <th className="p-4">Interview Round</th>
                  <th className="p-4">Round Status</th>
                  <th className="p-4">Question Access</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredItems.map((item) => (
                  <tr key={item.studentRoundId} className="hover:bg-muted/20 transition-colors">
                    {/* Student Info */}
                    <td className="p-4">
                      <div className="font-semibold text-foreground">{item.student.name}</div>
                      <div className="text-xs text-muted-foreground">{item.student.rollNumber} • {item.student.department}</div>
                    </td>

                    {/* Company & Role */}
                    <td className="p-4">
                      <div className="font-semibold text-foreground">{item.company.name}</div>
                      <div className="text-xs text-muted-foreground">{item.jobRole}</div>
                    </td>

                    {/* Round */}
                    <td className="p-4">
                      <span className="font-medium text-foreground">{item.round.name}</span>
                      <div className="text-xs text-muted-foreground">Sequence Order: {item.round.order}</div>
                    </td>

                    {/* Round Status Dropdown */}
                    <td className="p-4">
                      <select
                        value={item.roundStatus}
                        onChange={(e) =>
                          updateStatusMutation.mutate({
                            studentRoundId: item.studentRoundId,
                            status: e.target.value,
                          })
                        }
                        className="py-1 px-2 text-xs font-semibold rounded bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="NOT_STARTED">NOT_STARTED</option>
                        <option value="SCHEDULED">SCHEDULED</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="PASSED">PASSED</option>
                        <option value="FAILED">FAILED</option>
                      </select>
                    </td>

                    {/* Access Status Badge */}
                    <td className="p-4">
                      {item.isUnlocked ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <Unlock className="h-3 w-3" /> UNLOCKED
                          </span>
                          {item.grantedBy && (
                            <div className="text-[10px] text-muted-foreground">By: {item.grantedBy}</div>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                          <Lock className="h-3 w-3" /> LOCKED
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      {item.isUnlocked ? (
                        <button
                          onClick={() => revokeMutation.mutate(item.studentRoundId)}
                          disabled={revokeMutation.isPending}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
                        >
                          Revoke Access
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenUnlockModal(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                        >
                          <Unlock className="h-3.5 w-3.5" /> Unlock Access
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Unlock Confirmation Modal */}
      {isUnlockModalOpen && selectedRoundItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Unlock className="h-5 w-5 text-primary" /> Confirm Access Unlock
              </h2>
              <button onClick={() => setIsUnlockModalOpen(false)} className="p-1 rounded text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-foreground">
              <div className="bg-muted/40 p-3.5 rounded-lg space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student:</span>
                  <span className="font-bold">{selectedRoundItem.student.name} ({selectedRoundItem.student.rollNumber})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Company:</span>
                  <span className="font-semibold">{selectedRoundItem.company.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role:</span>
                  <span className="font-semibold">{selectedRoundItem.jobRole}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Round:</span>
                  <span className="font-semibold text-primary">{selectedRoundItem.round.name}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Allow this student to submit interview questions for this round? This will immediately enable question contribution in their Attended Companies module.
              </p>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Optional Expiry (in days, leave empty for no expiry):
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(e.target.value)}
                  placeholder="e.g. 7"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <button
                onClick={() => setIsUnlockModalOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg border border-border text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUnlock}
                disabled={unlockMutation.isPending}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm disabled:opacity-50"
              >
                <Unlock className="h-3.5 w-3.5" />
                {unlockMutation.isPending ? 'Unlocking...' : 'Unlock Access'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
