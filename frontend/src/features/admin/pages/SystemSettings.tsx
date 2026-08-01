import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types';
import { toast } from '@/store';
import {
  Shield,
  GraduationCap,
  Globe,
  Loader2,
  Save,
} from 'lucide-react';

interface SystemSettingsData {
  portalName: string;
  supportEmail: string;
  supportPhone: string;
  minCgpa: string;
  maxBacklogs: string;
  autoApproveResumes: boolean;
  autoApprovePortfolios: boolean;
  allowMultipleOffers: boolean;
  maintenanceMode: boolean;
  allowStudentRegistrations: boolean;
}

export function SystemSettings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'general' | 'placement' | 'system'>('general');

  // Form State
  const [settings, setSettings] = useState<SystemSettingsData>({
    portalName: 'Placement Management Portal',
    supportEmail: 'support@university.edu',
    supportPhone: '+1 (555) 019-2834',
    minCgpa: '6.0',
    maxBacklogs: '0',
    autoApproveResumes: false,
    autoApprovePortfolios: false,
    allowMultipleOffers: true,
    maintenanceMode: false,
    allowStudentRegistrations: true,
  });

  // Query Settings
  const { data, isLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Record<string, string>>>('/admin/settings');
      return res.data.data;
    },
  });

  useEffect(() => {
    if (data) {
      setSettings({
        portalName: data.portalName || 'Placement Management Portal',
        supportEmail: data.supportEmail || 'support@university.edu',
        supportPhone: data.supportPhone || '+1 (555) 019-2834',
        minCgpa: data.minCgpa || '6.0',
        maxBacklogs: data.maxBacklogs || '0',
        autoApproveResumes: data.autoApproveResumes === 'true',
        autoApprovePortfolios: data.autoApprovePortfolios === 'true',
        allowMultipleOffers: data.allowMultipleOffers === 'true',
        maintenanceMode: data.maintenanceMode === 'true',
        allowStudentRegistrations: data.allowStudentRegistrations !== 'false',
      });
    }
  }, [data]);

  // Mutation
  const saveMutation = useMutation({
    mutationFn: async (payload: Record<string, string>) => {
      const res = await api.put<ApiResponse<Record<string, string>>>('/admin/settings', payload);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('System settings saved successfully');
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    },
  });

  const handleChange = (key: keyof SystemSettingsData, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, string> = {
      portalName: settings.portalName,
      supportEmail: settings.supportEmail,
      supportPhone: settings.supportPhone,
      minCgpa: settings.minCgpa,
      maxBacklogs: settings.maxBacklogs,
      autoApproveResumes: String(settings.autoApproveResumes),
      autoApprovePortfolios: String(settings.autoApprovePortfolios),
      allowMultipleOffers: String(settings.allowMultipleOffers),
      maintenanceMode: String(settings.maintenanceMode),
      allowStudentRegistrations: String(settings.allowStudentRegistrations),
    };
    saveMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
        <p className="text-sm text-[hsl(var(--text-secondary))]">Loading system configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in duration-300">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))]">
          System Settings
        </h2>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
          Configure portal configurations, academic placement settings, and control platform maintenance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Navigation Sidebar */}
        <div className="flex lg:flex-col gap-1.5 p-1.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] overflow-x-auto shrink-0 shadow-xs">
          <button
            onClick={() => setActiveTab('general')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'general'
                ? 'bg-[hsl(var(--primary))] text-white'
                : 'hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
            }`}
          >
            <Globe className="h-4 w-4" />
            General Settings
          </button>
          <button
            onClick={() => setActiveTab('placement')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'placement'
                ? 'bg-[hsl(var(--primary))] text-white'
                : 'hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            Placement Rules
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'system'
                ? 'bg-[hsl(var(--primary))] text-white'
                : 'hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
            }`}
          >
            <Shield className="h-4 w-4" />
            System Status
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
          <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs space-y-6">
            {/* Tab: General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))] flex items-center gap-2 border-b border-[hsl(var(--border))]/60 pb-2">
                  <Globe className="h-5 w-5 text-[hsl(var(--primary))]" />
                  General & Branding Configurations
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                      Portal Brand Name
                    </label>
                    <input
                      type="text"
                      required
                      value={settings.portalName}
                      onChange={(e) => handleChange('portalName', e.target.value)}
                      className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                        Portal Support Email
                      </label>
                      <input
                        type="email"
                        required
                        value={settings.supportEmail}
                        onChange={(e) => handleChange('supportEmail', e.target.value)}
                        className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                        Portal Contact Phone
                      </label>
                      <input
                        type="text"
                        required
                        value={settings.supportPhone}
                        onChange={(e) => handleChange('supportPhone', e.target.value)}
                        className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Placement Rules */}
            {activeTab === 'placement' && (
              <div className="space-y-5">
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))] flex items-center gap-2 border-b border-[hsl(var(--border))]/60 pb-2">
                  <GraduationCap className="h-5 w-5 text-[hsl(var(--primary))]" />
                  Academic & Recruitment Policies
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                      Minimum CGPA Requirement
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={settings.minCgpa}
                      onChange={(e) => handleChange('minCgpa', e.target.value)}
                      className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                      Maximum Allowed Backlogs
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={settings.maxBacklogs}
                      onChange={(e) => handleChange('maxBacklogs', e.target.value)}
                      className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                    />
                  </div>
                </div>

                <div className="space-y-3.5 pt-3 border-t border-[hsl(var(--border))]/50">
                  <h4 className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase">Automation Rules</h4>
                  
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))/0.1] cursor-pointer">
                      <div>
                        <h6 className="text-xs font-bold text-[hsl(var(--text-primary))]">Auto-Approve Resumes</h6>
                        <p className="text-[10px] text-[hsl(var(--text-secondary))] mt-0.5">Students can apply instantly without manual coordinator approval</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.autoApproveResumes}
                        onChange={(e) => handleChange('autoApproveResumes', e.target.checked)}
                        className="rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-0"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))/0.1] cursor-pointer">
                      <div>
                        <h6 className="text-xs font-bold text-[hsl(var(--text-primary))]">Auto-Approve Portfolios</h6>
                        <p className="text-[10px] text-[hsl(var(--text-secondary))] mt-0.5">Publish student portfolios immediately upon generation</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.autoApprovePortfolios}
                        onChange={(e) => handleChange('autoApprovePortfolios', e.target.checked)}
                        className="rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-0"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))/0.1] cursor-pointer">
                      <div>
                        <h6 className="text-xs font-bold text-[hsl(var(--text-primary))]">Allow Multiple Offers</h6>
                        <p className="text-[10px] text-[hsl(var(--text-secondary))] mt-0.5">Students can hold multiple job offers concurrently</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.allowMultipleOffers}
                        onChange={(e) => handleChange('allowMultipleOffers', e.target.checked)}
                        className="rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-0"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: System Status */}
            {activeTab === 'system' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))] flex items-center gap-2 border-b border-[hsl(var(--border))]/60 pb-2">
                  <Shield className="h-5 w-5 text-[hsl(var(--primary))]" />
                  System Availability & Security Control
                </h3>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))/0.1] cursor-pointer">
                    <div>
                      <h6 className="text-xs font-bold text-[hsl(var(--text-primary))]">Allow Student Registrations</h6>
                      <p className="text-[10px] text-[hsl(var(--text-secondary))] mt-0.5">Control whether new student accounts can sign up</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.allowStudentRegistrations}
                      onChange={(e) => handleChange('allowStudentRegistrations', e.target.checked)}
                      className="rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-0"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-lg border border-[hsl(var(--danger)/0.15)] bg-[hsl(var(--danger-light))]/10 cursor-pointer">
                    <div>
                      <h6 className="text-xs font-bold text-[hsl(var(--danger))]">Platform Maintenance Mode</h6>
                      <p className="text-[10px] text-[hsl(var(--text-secondary))] mt-0.5">Restricts access to system administrators only during updates</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                      className="rounded border-[hsl(var(--danger))] text-[hsl(var(--danger))] focus:ring-0"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="py-2.5 px-5 text-xs font-bold rounded-lg bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-white disabled:opacity-50 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saveMutation.isPending ? 'Saving Settings...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SystemSettings;
