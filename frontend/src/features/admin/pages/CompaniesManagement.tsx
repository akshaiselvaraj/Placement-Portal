import { useState } from 'react';
import { useAdminData } from '../hooks/useAdminData';
import { LoadingSkeleton, EmptyState } from '@/components/common';
import { Building, Plus, X, Globe, MapPin, ExternalLink, Briefcase } from 'lucide-react';
import { useForm } from 'react-hook-form';

export function CompaniesManagement() {
  const { companies, isLoadingCompanies, createCompany, isCreatingCompany } = useAdminData();
  const [showModal, setShowModal] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    try {
      await createCompany(data);
      reset();
      setShowModal(false);
    } catch (e) {}
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))]">
            Company Management
          </h2>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Register new corporate entities and review active corporate associations.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] rounded-lg transition-all cursor-pointer shadow-xs"
        >
          <Plus className="h-4 w-4" />
          Add Company
        </button>
      </div>

      {/* Companies List */}
      {isLoadingCompanies ? (
        <LoadingSkeleton count={3} height="h-40" />
      ) : companies.length === 0 ? (
        <div className="border border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--surface))] py-12">
          <EmptyState
            title="No companies registered"
            message="Click the button above to register your first corporate partner."
            icon={<Building className="h-8 w-8 text-[hsl(var(--text-muted))]" />}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <div
              key={company.id}
              className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs flex flex-col justify-between hover:border-[hsl(var(--primary)/0.2)] transition-all space-y-5"
            >
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[hsl(var(--primary)/0.08)] flex items-center justify-center shrink-0 text-[hsl(var(--primary))] font-bold text-sm">
                    {company.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[hsl(var(--text-primary))]">
                      {company.name}
                    </h4>
                    <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">
                      {company.industry || 'Tech Industry'}
                    </p>
                  </div>
                </div>

                {company.description && (
                  <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed line-clamp-3">
                    {company.description}
                  </p>
                )}

                <div className="space-y-2 pt-3 border-t border-[hsl(var(--border))/0.6] text-xs text-[hsl(var(--text-secondary))] font-medium">
                  {company.location && (
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[hsl(var(--text-muted))]" />
                      {company.location}
                    </p>
                  )}
                  {company.website && (
                    <p className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-[hsl(var(--text-muted))]" />
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[hsl(var(--primary))] hover:underline flex items-center gap-1 font-bold"
                      >
                        Visit Website
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </p>
                  )}
                </div>
              </div>

              {/* Recruiter info */}
              <div className="pt-3 border-t border-[hsl(var(--border))/0.6] flex justify-between items-center text-xs">
                <span className="text-[hsl(var(--text-secondary))] flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5 text-[hsl(var(--text-muted))]" />
                  Active Jobs:
                </span>
                <span className="font-bold text-[hsl(var(--text-primary))] bg-[hsl(var(--muted))] px-2 py-0.5 rounded-full">
                  {company.jobs?.length || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[hsl(var(--surface))] rounded-2xl border border-[hsl(var(--border))] max-w-lg w-full p-6 shadow-xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                reset();
                setShowModal(false);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 pb-4 border-b border-[hsl(var(--border))]">
              <Building className="h-5 w-5 text-[hsl(var(--primary))]" />
              <h3 className="font-bold text-base text-[hsl(var(--text-primary))]">Register Partner Company</h3>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                  Company Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google India"
                  {...register('name', { required: 'Company name is required' })}
                  className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                />
                {errors.name && (
                  <span className="text-[10px] text-[hsl(var(--danger))] mt-1 font-bold block">
                    {errors.name.message as string}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                    Website URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    {...register('website')}
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                    Industry
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Technology"
                    {...register('industry')}
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                  Location / Headquarters
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bangalore, India"
                  {...register('location')}
                  className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide a brief summary of the company..."
                  {...register('description')}
                  className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-[hsl(var(--border))]">
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setShowModal(false);
                  }}
                  className="py-2 px-4 text-xs font-bold rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-primary))] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCompany}
                  className="py-2 px-4 text-xs font-bold rounded-lg bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-white disabled:opacity-50 transition-all cursor-pointer shadow-xs"
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

export default CompaniesManagement;
