import { useState } from 'react';
import { usePlacementData } from '../hooks/usePlacementData';
import { StatusBadge, LoadingSkeleton, EmptyState } from '@/components/common';
import { ShieldAlert, ShieldCheck, CheckCircle2, XCircle, GraduationCap, Link2, BookOpen } from 'lucide-react';
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
    <div className="space-y-6 animate-in">
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
            <div className="space-y-3 max-h-125 overflow-y-auto pr-1">
              {students.map((student) => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
                    selectedStudent?.id === student.id
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.04)]'
                      : 'border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:border-[hsl(var(--primary)/0.3)]'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-[hsl(var(--text-primary))]">
                        {student.user?.name}
                      </h4>
                      <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">{student.rollNumber}</p>
                    </div>
                    <StatusBadge status={student.profileStatus} />
                  </div>
                  <div className="flex gap-4 mt-3 text-xs text-[hsl(var(--text-secondary))] font-medium">
                    <span>{student.department}</span>
                    <span>CGPA: {student.cgpa !== null ? student.cgpa.toFixed(2) : 'N/A'}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detailed details view panel */}
        <div className="lg:col-span-2">
          {selectedStudent ? (
            <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs space-y-6 animate-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-[hsl(var(--border))]">
                <div>
                  <h3 className="text-xl font-bold text-[hsl(var(--text-primary))]">
                    {selectedStudent.user?.name}
                  </h3>
                  <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">
                    {selectedStudent.user?.email} • Roll: {selectedStudent.rollNumber}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleVerify(selectedStudent.id, 'REJECTED')}
                    disabled={isVerifyingStudent || selectedStudent.profileStatus === 'REJECTED'}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[hsl(var(--danger))] border border-[hsl(var(--danger)/0.2)] bg-[hsl(var(--danger-light))] hover:bg-[hsl(var(--danger)/0.15)] rounded-lg transition-colors cursor-pointer"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject Profile
                  </button>
                  <button
                    onClick={() => handleVerify(selectedStudent.id, 'VERIFIED')}
                    disabled={isVerifyingStudent || selectedStudent.profileStatus === 'VERIFIED'}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[hsl(var(--success))] hover:bg-[hsl(var(--success)/0.9)] rounded-lg transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Verify Profile
                  </button>
                </div>
              </div>

              {/* Sub sections details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-bold uppercase text-[hsl(var(--text-muted))] tracking-wider mb-2">
                    Academic Summary
                  </h4>
                  <div className="space-y-2 text-xs text-[hsl(var(--text-secondary))] font-semibold bg-[hsl(var(--muted))/0.3] p-4 rounded-xl border border-[hsl(var(--border))/0.5]">
                    <div className="flex justify-between">
                      <span>Department</span>
                      <span className="text-[hsl(var(--text-primary))]">{selectedStudent.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Graduation Batch</span>
                      <span className="text-[hsl(var(--text-primary))]">{selectedStudent.batch}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current CGPA</span>
                      <span className="text-[hsl(var(--text-primary))] font-bold">
                        {selectedStudent.cgpa !== null ? selectedStudent.cgpa.toFixed(2) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phone Contact</span>
                      <span className="text-[hsl(var(--text-primary))]">{selectedStudent.phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase text-[hsl(var(--text-muted))] tracking-wider mb-2">
                    Skills List
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudent.skills && selectedStudent.skills.length > 0 ? (
                      selectedStudent.skills.map((skill) => (
                        <div
                          key={skill.id}
                          className="px-2.5 py-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))/0.5] text-xs font-bold text-[hsl(var(--text-primary))] flex flex-col items-center"
                        >
                          <span>{skill.name}</span>
                          <span className="text-[9px] uppercase tracking-wider text-[hsl(var(--text-muted))] mt-0.5">
                            {skill.level}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-[hsl(var(--text-muted))]">No skills configured.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Education section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-[hsl(var(--text-muted))] tracking-wider flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  Education History
                </h4>
                {selectedStudent.educations && selectedStudent.educations.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedStudent.educations.map((edu) => (
                      <div
                        key={edu.id}
                        className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))/0.1] text-xs text-[hsl(var(--text-secondary))] font-medium space-y-1"
                      >
                        <h5 className="font-bold text-[hsl(var(--text-primary))]">{edu.institution}</h5>
                        <p>{edu.degree} — {edu.field}</p>
                        <div className="flex justify-between text-[11px] text-[hsl(var(--text-muted))] pt-1 border-t border-[hsl(var(--border))/0.4]">
                          <span>Years: {edu.startYear} - {edu.endYear}</span>
                          <span className="font-bold text-[hsl(var(--primary))]">Grade: {edu.grade}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[hsl(var(--text-muted))]">No education history recorded.</p>
                )}
              </div>

              {/* Projects section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-[hsl(var(--text-muted))] tracking-wider flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  Showcased Projects
                </h4>
                {selectedStudent.projects && selectedStudent.projects.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedStudent.projects.map((proj) => (
                      <div
                        key={proj.id}
                        className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))/0.1] text-xs text-[hsl(var(--text-secondary))] font-medium flex flex-col justify-between"
                      >
                        <div className="space-y-1.5">
                          <h5 className="font-bold text-[hsl(var(--text-primary))]">{proj.title}</h5>
                          <p className="text-[11px] leading-relaxed line-clamp-2">{proj.description}</p>
                        </div>
                        {proj.repoUrl && (
                          <a
                            href={proj.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-[hsl(var(--primary))] hover:underline mt-2 font-bold"
                          >
                            <Link2 className="h-3 w-3" />
                            Repository URL
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[hsl(var(--text-muted))]">No projects uploaded.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full border border-dashed border-[hsl(var(--border))] rounded-2xl flex flex-col items-center justify-center p-12 text-center text-[hsl(var(--text-muted))]">
              <ShieldAlert className="h-10 w-10 text-[hsl(var(--text-muted))] mb-2" />
              <p className="font-bold text-sm">No Student Selected</p>
              <p className="text-xs mt-1">Select a student from the roster to inspect details and apply validation actions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentsManagement;
