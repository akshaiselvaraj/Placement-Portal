import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { placementService } from '../services/placement.service';
import { LoadingSkeleton, EmptyState } from '@/components/common';
import { toast } from '@/store';
import {
  Building2,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  Globe,
  Mail,
  User,
  Layers,
} from 'lucide-react';
import type { Company } from '@/types';

export function CompaniesPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  // Modals / Drawer state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [viewingHistoryCompany, setViewingHistoryCompany] = useState<Company | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    website: '',
    location: '',
    address: '',
    recruiterName: '',
    recruiterEmail: '',
    recruiterPhone: '',
    hrContact: '',
    averagePackage: '0',
    highestPackage: '0',
    notes: '',
  });

  // Queries
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['placement-companies'],
    queryFn: () => placementService.getCompanies({ search: searchQuery || undefined }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: placementService.createCompany,
    onSuccess: () => {
      toast.success('Company registered successfully');
      queryClient.invalidateQueries({ queryKey: ['placement-companies'] });
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => placementService.updateCompany(id, data),
    onSuccess: () => {
      toast.success('Company details updated successfully');
      queryClient.invalidateQueries({ queryKey: ['placement-companies'] });
      setIsModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: placementService.deleteCompany,
    onSuccess: () => {
      toast.success('Company records removed successfully');
      queryClient.invalidateQueries({ queryKey: ['placement-companies'] });
    },
  });

  const handleOpenCreateModal = () => {
    setFormData({
      name: '',
      industry: '',
      website: '',
      location: '',
      address: '',
      recruiterName: '',
      recruiterEmail: '',
      recruiterPhone: '',
      hrContact: '',
      averagePackage: '0',
      highestPackage: '0',
      notes: '',
    });
    setEditingCompany(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (comp: Company) => {
    setEditingCompany(comp);
    setFormData({
      name: comp.name,
      industry: comp.industry || '',
      website: comp.website || '',
      location: comp.location || '',
      address: comp.address || '',
      recruiterName: comp.recruiterName || '',
      recruiterEmail: comp.recruiterEmail || '',
      recruiterPhone: comp.recruiterPhone || '',
      hrContact: comp.hrContact || '',
      averagePackage: String(comp.averagePackage || 0),
      highestPackage: String(comp.highestPackage || 0),
      notes: comp.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCompany) {
      updateMutation.mutate({ id: editingCompany.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-[hsl(var(--border))] bg-gradient-to-r from-[hsl(var(--surface))] via-[hsl(var(--surface))] to-[hsl(var(--primary)/0.04)] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-7 w-7 text-[hsl(var(--primary))]" />
            <h1 className="text-2xl font-black text-[hsl(var(--text-primary))] tracking-tight">
              Corporate Affiliations Desk
            </h1>
          </div>
          <p className="text-xs text-[hsl(var(--text-secondary))] mt-1">
            Register and manage hiring partners, recruiter point-of-contacts, package offerings, and drive logs.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] rounded-lg transition-all cursor-pointer shadow-xs"
        >
          <Plus className="h-4 w-4" />
          Add Company
        </button>
      </div>

      {/* Control ribbon */}
      <div className="p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex gap-4 items-center justify-between shadow-xs">
        <div className="w-full md:w-80 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[hsl(var(--text-muted))]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company by name, sector..."
            className="pl-9 pr-4 py-2 block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
          />
        </div>
      </div>

      {/* Companies List Grid */}
      {isLoading ? (
        <LoadingSkeleton count={3} height="h-32" />
      ) : companies.length === 0 ? (
        <EmptyState
          title="No companies registered"
          message="Begin by onboarding corporate placement partners."
          icon={<Building2 className="h-8 w-8 text-[hsl(var(--text-muted))]" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((comp) => (
            <div
              key={comp.id}
              className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:border-[hsl(var(--primary)/0.2)] transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[hsl(var(--primary)/0.08)] flex items-center justify-center font-bold text-sm text-[hsl(var(--primary))] shrink-0">
                      {comp.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[hsl(var(--text-primary))]">{comp.name}</h4>
                      <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">{comp.industry || 'Tech Solutions'}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[hsl(var(--border))/0.6] space-y-2 text-xs text-[hsl(var(--text-secondary))] font-medium">
                  {comp.website && (
                    <p className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-[hsl(var(--text-muted))]" />
                      <a href={comp.website} target="_blank" rel="noreferrer" className="hover:underline text-[hsl(var(--primary))]">
                        {comp.website}
                      </a>
                    </p>
                  )}
                  {comp.recruiterName && (
                    <p className="flex items-center gap-2 text-[hsl(var(--text-primary))]">
                      <User className="h-4 w-4 text-[hsl(var(--text-muted))]" />
                      Recruiter: {comp.recruiterName}
                    </p>
                  )}
                  {comp.recruiterEmail && (
                    <p className="flex items-center gap-2 pl-6">
                      <Mail className="h-3.5 w-3.5 text-[hsl(var(--text-muted))]" />
                      {comp.recruiterEmail}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-[hsl(var(--border))/0.4]">
                    <div>
                      <span className="text-[10px] text-[hsl(var(--text-muted))] block uppercase">Avg CTC</span>
                      <span className="font-bold text-[hsl(var(--text-primary))]">{comp.averagePackage || 0} LPA</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[hsl(var(--text-muted))] block uppercase">Max CTC</span>
                      <span className="font-bold text-[hsl(var(--text-primary))]">{comp.highestPackage || 0} LPA</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[hsl(var(--border))/0.6] flex justify-between items-center text-xs">
                <button
                  onClick={() => setViewingHistoryCompany(comp)}
                  className="text-[hsl(var(--primary))] font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Layers className="h-3.5 w-3.5" />
                  Hiring History Notes
                </button>

                <div className="flex gap-2">
                  <button onClick={() => handleOpenEditModal(comp)} className="text-[hsl(var(--text-muted))] hover:text-[hsl(var(--primary))]" title="Edit">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => deleteMutation.mutate(comp.id)} className="text-[hsl(var(--danger))] hover:text-red-700" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hiring History Modal */}
      {viewingHistoryCompany && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[hsl(var(--surface))] rounded-2xl border border-[hsl(var(--border))] max-w-md w-full p-6 shadow-xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setViewingHistoryCompany(null)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-muted))]">
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-[hsl(var(--text-primary))] flex items-center gap-2 mb-2">
              <Layers className="h-5 w-5 text-[hsl(var(--primary))]" />
              Hiring History & Notes
            </h3>
            <p className="text-xs text-[hsl(var(--text-secondary))] font-semibold">{viewingHistoryCompany.name}</p>

            <div className="mt-4 p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))/0.2] text-xs text-[hsl(var(--text-secondary))] leading-relaxed min-h-32">
              {viewingHistoryCompany.notes || 'No historical hiring notes are registered for this company.'}
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Company Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[hsl(var(--surface))] rounded-2xl border border-[hsl(var(--border))] max-w-xl w-full p-6 shadow-xl relative max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-muted))]">
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-bold text-base text-[hsl(var(--text-primary))] pb-3 border-b border-[hsl(var(--border))]">
              {editingCompany ? 'Edit Partner Company' : 'Register Corporate Partner'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">Company Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">Industry Sector</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData((p) => ({ ...p, industry: e.target.value }))}
                    placeholder="e.g. Finance, software development"
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">Corporate Website</label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData((p) => ({ ...p, website: e.target.value }))}
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">Primary Office Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-[hsl(var(--border))/0.4]">
                <div>
                  <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">Recruiter Name</label>
                  <input
                    type="text"
                    value={formData.recruiterName}
                    onChange={(e) => setFormData((p) => ({ ...p, recruiterName: e.target.value }))}
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">Recruiter Email</label>
                  <input
                    type="email"
                    value={formData.recruiterEmail}
                    onChange={(e) => setFormData((p) => ({ ...p, recruiterEmail: e.target.value }))}
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">Recruiter Phone</label>
                  <input
                    type="text"
                    value={formData.recruiterPhone}
                    onChange={(e) => setFormData((p) => ({ ...p, recruiterPhone: e.target.value }))}
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">Average Package (LPA)</label>
                  <input
                    type="number"
                    value={formData.averagePackage}
                    onChange={(e) => setFormData((p) => ({ ...p, averagePackage: e.target.value }))}
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">Highest Package (LPA)</label>
                  <input
                    type="number"
                    value={formData.highestPackage}
                    onChange={(e) => setFormData((p) => ({ ...p, highestPackage: e.target.value }))}
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">Internal Recruitment Notes / History</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Record campus interactions, hiring history logs, special criteria..."
                  className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-[hsl(var(--border))]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-4 font-bold rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-primary))] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="py-2 px-4 font-bold rounded-lg bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-white cursor-pointer shadow-xs disabled:opacity-50"
                >
                  Save Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompaniesPage;
