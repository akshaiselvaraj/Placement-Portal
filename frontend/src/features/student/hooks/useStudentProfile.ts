import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '../services/student.service';
import { toast } from '@/store';

export function useStudentProfile() {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['student-profile'],
    queryFn: studentService.getProfile,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['student-profile'] });
    queryClient.invalidateQueries({ queryKey: ['me'] }); // Some user endpoints might return nested updates
  };

  const updateProfileMutation = useMutation({
    mutationFn: studentService.updateProfile,
    onSuccess: () => {
      toast.success('Profile updated successfully');
      invalidate();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    },
  });

  // --- Education Mutations ---
  const addEducationMutation = useMutation({
    mutationFn: studentService.addEducation,
    onSuccess: () => {
      toast.success('Education record added successfully');
      invalidate();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to add education');
    },
  });

  const updateEducationMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      studentService.updateEducation(id, data),
    onSuccess: () => {
      toast.success('Education record updated successfully');
      invalidate();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update education');
    },
  });

  const deleteEducationMutation = useMutation({
    mutationFn: studentService.deleteEducation,
    onSuccess: () => {
      toast.success('Education record deleted successfully');
      invalidate();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete education');
    },
  });

  // --- Projects Mutations ---
  const addProjectMutation = useMutation({
    mutationFn: studentService.addProject,
    onSuccess: () => {
      toast.success('Project added successfully');
      invalidate();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to add project');
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      studentService.updateProject(id, data),
    onSuccess: () => {
      toast.success('Project updated successfully');
      invalidate();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update project');
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: studentService.deleteProject,
    onSuccess: () => {
      toast.success('Project deleted successfully');
      invalidate();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete project');
    },
  });

  // --- Skills Mutations ---
  const addSkillMutation = useMutation({
    mutationFn: studentService.addSkill,
    onSuccess: () => {
      toast.success('Skill added successfully');
      invalidate();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to add skill');
    },
  });

  const deleteSkillMutation = useMutation({
    mutationFn: studentService.deleteSkill,
    onSuccess: () => {
      toast.success('Skill deleted successfully');
      invalidate();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete skill');
    },
  });

  // --- Certifications Mutations ---
  const addCertificationMutation = useMutation({
    mutationFn: studentService.addCertification,
    onSuccess: () => {
      toast.success('Certification added successfully');
      invalidate();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to add certification');
    },
  });

  const updateCertificationMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      studentService.updateCertification(id, data),
    onSuccess: () => {
      toast.success('Certification updated successfully');
      invalidate();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update certification');
    },
  });

  const deleteCertificationMutation = useMutation({
    mutationFn: studentService.deleteCertification,
    onSuccess: () => {
      toast.success('Certification deleted successfully');
      invalidate();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete certification');
    },
  });

  const reapplyProfileMutation = useMutation({
    mutationFn: studentService.reapplyProfile,
    onSuccess: () => {
      toast.success('Profile resubmitted for verification');
      invalidate();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to resubmit profile');
    },
  });

  return {
    student: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    error: profileQuery.error,
    refetch: profileQuery.refetch,

    // Profile updates
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    reapplyProfile: reapplyProfileMutation.mutateAsync,
    isReapplyingProfile: reapplyProfileMutation.isPending,

    // Education CRUD
    addEducation: addEducationMutation.mutateAsync,
    isAddingEducation: addEducationMutation.isPending,
    updateEducation: updateEducationMutation.mutateAsync,
    isUpdatingEducation: updateEducationMutation.isPending,
    deleteEducation: deleteEducationMutation.mutateAsync,
    isDeletingEducation: deleteEducationMutation.isPending,

    // Project CRUD
    addProject: addProjectMutation.mutateAsync,
    isAddingProject: addProjectMutation.isPending,
    updateProject: updateProjectMutation.mutateAsync,
    isUpdatingProject: updateProjectMutation.isPending,
    deleteProject: deleteProjectMutation.mutateAsync,
    isDeletingProject: deleteProjectMutation.isPending,

    // Skill CRUD
    addSkill: addSkillMutation.mutateAsync,
    isAddingSkill: addSkillMutation.isPending,
    deleteSkill: deleteSkillMutation.mutateAsync,
    isDeletingSkill: deleteSkillMutation.isPending,

    // Certification CRUD
    addCertification: addCertificationMutation.mutateAsync,
    isAddingCertification: addCertificationMutation.isPending,
    updateCertification: updateCertificationMutation.mutateAsync,
    isUpdatingCertification: updateCertificationMutation.isPending,
    deleteCertification: deleteCertificationMutation.mutateAsync,
    isDeletingCertification: deleteCertificationMutation.isPending,
  };
}
export default useStudentProfile;
