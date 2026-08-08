import { useState } from 'react';
import { usePlacementData } from '../hooks/usePlacementData';
import { StatusBadge, LoadingSkeleton, EmptyState } from '@/components/common';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  GraduationCap, 
  Link2, 
  BookOpen,
  User,
  Mail,
  Phone,
  Award,
  Shield,
  ArrowUpRight,
  Check,
  AlertCircle
} from 'lucide-react';
import type { StudentProfile } from '@/types';

export function StudentsManagement() {
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);

  const { students, isLoadingStudents, verifyStudent, isVerifyingStudent } = usePlacementData({
    profileStatus: statusFilter || undefined,
  });

  const handleVerify = async (id: string, status: string) => {
    try {
      await verifyStudent({ id, status });
      setSelectedStudent(null);
    } catch (e) {
      // Error handled by mutation
    }
  };

  return (
    <div className="space-y-6 animate-in duration-300">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))]">
          Student Profile Verification
        </h2>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
          Review academic details, roll numbers, and verify student profile credentials.
        </p>
      </div>

      {/* Filter Row */}
      <div className="flex gap-2.5 p-1 border border-[hsl(var(--border))] rounded-xl bg-[hsl(var(--surface))] w-fit">
        {['PENDING', 'VERIFIED', 'REJECTED'].map((status) => (
          <button
            key={status}
            onClick={() => {
              setStatusFilter(status);
              setSelectedStudent(null);
            }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              statusFilter === status
                ? 'bg-[hsl(var(--primary))] text-white shadow-xs'
                : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--muted))]'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Student list column */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-base font-bold text-[hsl(var(--text-primary))] flex items-center gap-1.5">
            Student Roster
            <span className="text-xs font-medium text-[hsl(var(--text-secondary))] bg-[hsl(var(--muted))] px-2 py-0.5 rounded-full">
              {students.length}
            </span>
          </h3>

          {isLoadingStudents ? (
            <LoadingSkeleton count={3} height="h-20" />
          ) : students.length === 0 ? (
            <div className="border border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--surface))] p-8">
              <EmptyState
                title="No students found"
                message={`No profiles match the status: ${statusFilter}`}
                icon={<GraduationCap className="h-8 w-8 text-[hsl(var(--text-muted))]" />}
              />
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
              {students.map((student) => {
                const isSelected = selectedStudent?.id === student.id;
                
                return (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`w-full text-left p-4.5 rounded-2xl border transition-all duration-300 relative group cursor-pointer shadow-xs ${
                      isSelected
                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.04)]'
                        : 'border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:border-[hsl(var(--primary)/0.35)] hover:shadow-sm'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-[hsl(var(--primary))] rounded-r-full" />
                    )}

                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-extrabold text-sm text-[hsl(var(--text-primary))] group-hover:text-[hsl(var(--primary))] transition-colors flex items-center gap-1.5">
                          {student.user?.name}
                          <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[hsl(var(--primary))]" />
                        </h4>
                        <p className="text-[10px] uppercase tracking-wider text-[hsl(var(--text-secondary))] font-bold mt-0.5">
                          {student.rollNumber} &bull; {student.department}
                        </p>
                      </div>
                      <StatusBadge status={student.profileStatus} />
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {/* CGPA Badge */}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.12)]">
                        GPA: {student.cgpa !== null ? student.cgpa.toFixed(2) : 'N/A'}
                      </span>

                      {/* Activity Points Badge */}
                      {student.activityPoints !== null && student.activityPoints !== undefined && student.activityPoints > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-700 border border-amber-500/15">
                          <Award className="h-3 w-3" />
                          Act: {student.activityPoints.toLocaleString()}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-[hsl(var(--muted))]/60 text-[hsl(var(--text-muted))] border border-[hsl(var(--border))]/40">
                          Act: 0
                        </span>
                      )}

                      {/* PS Level Badge */}
                      {student.levelClearance && student.levelClearance !== 'None' && student.levelClearance !== 'Not Shared' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-500/10 text-indigo-700 border border-indigo-500/15">
                          <Shield className="h-3 w-3" />
                          {student.levelClearance}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-[hsl(var(--muted))]/60 text-[hsl(var(--text-muted))] border border-[hsl(var(--border))]/40">
                          {student.levelClearance || 'Not Shared'}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Detailed details view panel */}
        <div className="lg:col-span-2">
          {selectedStudent ? (
            <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs space-y-8 animate-in duration-300">
              {/* Header Hero Area */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-[hsl(var(--border))/0.6]">
                <div className="flex items-center gap-4.5">
                  {/* Large modern initials avatar with radial gradient ring */}
                  <div className="relative">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-[hsl(var(--primary))] to-indigo-500 flex items-center justify-center text-white text-xl font-black shadow-md">
                      {selectedStudent.user?.name ? selectedStudent.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'ST'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-[hsl(var(--surface))] bg-emerald-500 flex items-center justify-center">
                      <span className="block h-2 w-2 rounded-full bg-white animate-pulse" />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-2xl font-black text-[hsl(var(--text-primary))] tracking-tight">
                        {selectedStudent.user?.name}
                      </h3>
                      <StatusBadge status={selectedStudent.profileStatus} />
                    </div>
                    <div className="flex items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-[hsl(var(--text-secondary))] font-medium flex-wrap">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5 text-[hsl(var(--text-muted))]" />
                        {selectedStudent.user?.email}
                      </span>
                      <span className="text-[hsl(var(--border))]">&bull;</span>
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-[hsl(var(--text-muted))]" />
                        Roll: {selectedStudent.rollNumber}
                      </span>
                      {selectedStudent.phone && (
                        <>
                          <span className="text-[hsl(var(--border))]">&bull;</span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5 text-[hsl(var(--text-muted))]" />
                            {selectedStudent.phone}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 w-full md:w-auto">
                  <button
                    onClick={() => handleVerify(selectedStudent.id, 'REJECTED')}
                    disabled={isVerifyingStudent || selectedStudent.profileStatus === 'REJECTED'}
                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-[hsl(var(--danger))] border border-[hsl(var(--danger)/0.2)] bg-[hsl(var(--danger-light))] hover:bg-[hsl(var(--danger)/0.15)] rounded-xl transition-all cursor-pointer disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject Profile
                  </button>
                  <button
                    onClick={() => handleVerify(selectedStudent.id, 'VERIFIED')}
                    disabled={isVerifyingStudent || selectedStudent.profileStatus === 'VERIFIED'}
                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-[hsl(var(--success))] hover:bg-[hsl(var(--success)/0.9)] rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Verify Profile
                  </button>
                </div>
              </div>

              {/* Candidate Metric Dashboard Grid */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold uppercase text-[hsl(var(--text-muted))] tracking-wider">
                  Academic Performance & PS Integration
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5">
                  {/* CGPA Card */}
                  <div className="p-5 rounded-2xl border border-[hsl(var(--border))/0.6] bg-[hsl(var(--surface))] relative overflow-hidden group hover:border-[hsl(var(--primary)/0.3)] transition-colors shadow-2xs">
                    <div className="absolute top-0 right-0 h-16 w-16 bg-[hsl(var(--primary)/0.04)] rounded-bl-full flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-[hsl(var(--primary))]" />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-[hsl(var(--text-secondary))] font-bold block">
                      Cumulative GPA
                    </span>
                    <span className="text-3xl font-black text-[hsl(var(--text-primary))] block mt-2.5 tracking-tight">
                      {selectedStudent.cgpa !== null ? selectedStudent.cgpa.toFixed(2) : 'N/A'}
                    </span>
                    <span className="text-[10px] text-[hsl(var(--text-secondary))] block mt-1.5 font-semibold">
                      Major: {selectedStudent.department}
                    </span>
                  </div>

                  {/* Activity Points Card */}
                  <div className="p-5 rounded-2xl border border-[hsl(var(--border))/0.6] bg-[hsl(var(--surface))] relative overflow-hidden group hover:border-amber-500/30 transition-colors shadow-2xs">
                    <div className="absolute top-0 right-0 h-16 w-16 bg-amber-500/5 rounded-bl-full flex items-center justify-center">
                      <Award className="h-5 w-5 text-amber-500" />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-[hsl(var(--text-secondary))] font-bold block">
                      Activity Points
                    </span>
                    <span className="text-3xl font-black text-[hsl(var(--text-primary))] block mt-2.5 tracking-tight">
                      {selectedStudent.activityPoints != null ? selectedStudent.activityPoints.toLocaleString() : '0'}
                    </span>
                    <span className="mt-2 block">
                      {selectedStudent.activityPoints && selectedStudent.activityPoints > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <Check className="h-2.5 w-2.5" /> Shared with PO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                          <AlertCircle className="h-2.5 w-2.5" /> Not Shared
                        </span>
                      )}
                    </span>
                  </div>

                  {/* PS Level Card */}
                  <div className="p-5 rounded-2xl border border-[hsl(var(--border))/0.6] bg-[hsl(var(--surface))] relative overflow-hidden group hover:border-indigo-500/30 transition-colors shadow-2xs">
                    <div className="absolute top-0 right-0 h-16 w-16 bg-indigo-500/5 rounded-bl-full flex items-center justify-center">
                      <Shield className="h-5 w-5 text-indigo-500" />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-[hsl(var(--text-secondary))] font-bold block">
                      PS Clearance Level
                    </span>
                    <span className="text-3xl font-black text-[hsl(var(--text-primary))] block mt-2.5 tracking-tight">
                      {selectedStudent.levelClearance && selectedStudent.levelClearance !== 'Not Shared' ? selectedStudent.levelClearance : 'None'}
                    </span>
                    <span className="text-[10px] text-[hsl(var(--text-secondary))] block mt-1.5 font-semibold">
                      Batch Year: {selectedStudent.batch}
                    </span>
                  </div>
                </div>
              </div>

              {/* Skills Area */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase text-[hsl(var(--text-muted))] tracking-wider">
                  Configured Skills
                </h4>
                <div className="flex flex-wrap gap-2.5">
                  {selectedStudent.skills && selectedStudent.skills.length > 0 ? (
                    selectedStudent.skills.map((skill) => (
                      <div
                        key={skill.id}
                        className="px-3.5 py-2.5 rounded-xl border border-[hsl(var(--border))/0.6] bg-[hsl(var(--surface))] text-xs font-bold text-[hsl(var(--text-primary))] flex flex-col hover:border-[hsl(var(--primary)/0.3)] transition-colors shadow-3xs"
                      >
                        <span className="font-extrabold">{skill.name}</span>
                        <span className="text-[9px] uppercase tracking-wider text-[hsl(var(--primary))] font-bold mt-1">
                          {skill.level}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-[hsl(var(--text-muted))] italic">No skills listed on profile.</span>
                  )}
                </div>
              </div>

              {/* Education and Projects (Two Column Layout) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Education section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold uppercase text-[hsl(var(--text-muted))] tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="h-4.5 w-4.5 text-[hsl(var(--text-secondary))]" />
                    Education History
                  </h4>
                  {selectedStudent.educations && selectedStudent.educations.length > 0 ? (
                    <div className="space-y-3">
                      {selectedStudent.educations.map((edu) => (
                        <div
                          key={edu.id}
                          className="p-4 rounded-xl border border-[hsl(var(--border))/0.6] bg-[hsl(var(--surface))] text-xs text-[hsl(var(--text-secondary))] font-medium space-y-1.5 shadow-3xs"
                        >
                          <h5 className="font-extrabold text-[hsl(var(--text-primary))]">{edu.institution}</h5>
                          <p>{edu.degree} — {edu.field}</p>
                          <div className="flex justify-between text-[10px] text-[hsl(var(--text-secondary))] pt-2 border-t border-[hsl(var(--border))/0.4]">
                            <span>Years: {edu.startYear} - {edu.endYear}</span>
                            <span className="font-extrabold text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.06)] px-2 py-0.5 rounded-md border border-[hsl(var(--primary)/0.1)]">
                              Grade: {edu.grade}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[hsl(var(--text-muted))] italic">No education details recorded.</p>
                  )}
                </div>

                {/* Projects section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold uppercase text-[hsl(var(--text-muted))] tracking-wider flex items-center gap-1.5">
                    <BookOpen className="h-4.5 w-4.5 text-[hsl(var(--text-secondary))]" />
                    Featured Projects
                  </h4>
                  {selectedStudent.projects && selectedStudent.projects.length > 0 ? (
                    <div className="space-y-3">
                      {selectedStudent.projects.map((proj) => (
                        <div
                          key={proj.id}
                          className="p-4 rounded-xl border border-[hsl(var(--border))/0.6] bg-[hsl(var(--surface))] text-xs text-[hsl(var(--text-secondary))] font-medium flex flex-col justify-between shadow-3xs hover:border-[hsl(var(--primary)/0.25)] transition-colors"
                        >
                          <div className="space-y-1.5">
                            <h5 className="font-extrabold text-[hsl(var(--text-primary))]">{proj.title}</h5>
                            <p className="text-[11px] leading-relaxed line-clamp-3 text-[hsl(var(--text-secondary))]/80">{proj.description}</p>
                          </div>
                          {proj.repoUrl && (
                            <a
                              href={proj.repoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-[hsl(var(--primary))] hover:underline mt-3 font-extrabold self-start"
                            >
                              <Link2 className="h-3 w-3" />
                              Repository URL
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[hsl(var(--text-muted))] italic">No projects listed.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full border border-dashed border-[hsl(var(--border))] rounded-2xl flex flex-col items-center justify-center p-12 text-center text-[hsl(var(--text-muted))] min-h-[400px]">
              <ShieldAlert className="h-10 w-10 text-[hsl(var(--text-muted))] mb-2" />
              <p className="font-extrabold text-sm text-[hsl(var(--text-primary))]">No Student Selected</p>
              <p className="text-xs mt-1">Select a student from the roster to inspect details and apply validation actions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentsManagement;
