import { useState, useEffect } from 'react';
import { useRecruiterData } from '../hooks/useRecruiterData';
import { LoadingSkeleton } from '@/components/common';
import { Building2, Globe, MapPin, Mail, Users, Calendar, Save, CheckCircle, AlertCircle, Edit3 } from 'lucide-react';

function Field({ label, children }: { label: string; children?: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text' }: any) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={onChange}
      placeholder={placeholder}
      className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] py-2.5 px-3 text-sm text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all"
    />
  );
}

export function CompanyProfilePage() {
  const { recruiter, company, isLoadingRecruiter, isLoadingCompany, updateProfile, isUpdatingProfile, refetchCompany } = useRecruiterData();

  const [form, setForm] = useState({
    designation: '',
    phone: '',
    company: {
      name: '',
      industry: '',
      website: '',
      location: '',
      email: '',
      phone: '',
      size: '',
      foundedYear: '',
      description: '',
      address: '',
    },
  });

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (recruiter && company) {
      setForm({
        designation: recruiter.designation || '',
        phone: recruiter.phone || '',
        company: {
          name: company.name || '',
          industry: company.industry || '',
          website: company.website || '',
          location: company.location || '',
          email: company.email || '',
          phone: company.phone || '',
          size: company.size || '',
          foundedYear: company.foundedYear ? String(company.foundedYear) : '',
          description: company.description || '',
          address: company.address || '',
        },
      });
    }
  }, [recruiter, company]);

  const setCompanyField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, company: { ...prev.company, [field]: value } }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await updateProfile({
        designation: form.designation || undefined,
        phone: form.phone || undefined,
        company: {
          ...form.company,
          foundedYear: form.company.foundedYear ? parseInt(form.company.foundedYear) : undefined,
          website: form.company.website || undefined,
          email: form.company.email || undefined,
        },
      });
      await refetchCompany();
      setSuccessMsg('Company profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update company profile.');
    }
  };

  if (isLoadingRecruiter || isLoadingCompany) {
    return <LoadingSkeleton count={4} height="h-24" className="mt-8 animate-in" />;
  }

  const initials = (company?.name || 'CP').substring(0, 2).toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))]">Company Profile</h2>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Manage your organization details visible to students and candidates.
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer"
          >
            <Edit3 className="h-4 w-4" />
            Edit
          </button>
        )}
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-lg bg-[hsl(var(--success-light))] p-4 text-sm text-[hsl(var(--success))] border border-[hsl(var(--success)/0.2)]">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <p>{successMsg}</p>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-lg bg-[hsl(var(--danger-light))] p-4 text-sm text-[hsl(var(--danger))] border border-[hsl(var(--danger)/0.2)]">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs flex items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center text-[hsl(var(--primary))] font-extrabold text-2xl shrink-0 border border-[hsl(var(--primary)/0.2)]">
          {initials}
        </div>
        <div>
          <h3 className="text-xl font-bold text-[hsl(var(--text-primary))]">{form.company.name || 'Company Name'}</h3>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-0.5">
            {form.company.industry || 'Industry not set'} &bull; {form.company.location || 'Location not set'}
          </p>
          <div className="flex flex-wrap gap-3 mt-2 text-xs text-[hsl(var(--text-muted))]">
            {form.company.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{form.company.email}</span>}
            {form.company.website && <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{form.company.website}</span>}
            {form.company.size && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{form.company.size} employees</span>}
            {form.company.foundedYear && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Est. {form.company.foundedYear}</span>}
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave}>
        <div className="space-y-6 p-8 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs">
          <h4 className="text-base font-bold text-[hsl(var(--text-primary))] border-b border-[hsl(var(--border))] pb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[hsl(var(--primary))]" />
            Company Information
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Company Name *">
              <Input value={form.company.name} onChange={(e: any) => setCompanyField('name', e.target.value)} placeholder="Acme Corporation" />
            </Field>
            <Field label="Industry">
              <Input value={form.company.industry} onChange={(e: any) => setCompanyField('industry', e.target.value)} placeholder="Software Development" />
            </Field>
            <Field label="Company Email">
              <Input type="email" value={form.company.email} onChange={(e: any) => setCompanyField('email', e.target.value)} placeholder="hr@company.com" />
            </Field>
            <Field label="Company Phone">
              <Input value={form.company.phone} onChange={(e: any) => setCompanyField('phone', e.target.value)} placeholder="+91 98765 43210" />
            </Field>
            <Field label="Website URL">
              <Input value={form.company.website} onChange={(e: any) => setCompanyField('website', e.target.value)} placeholder="https://company.com" />
            </Field>
            <Field label="Location">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--text-muted))]" />
                <input
                  type="text"
                  value={form.company.location ?? ''}
                  onChange={(e) => setCompanyField('location', e.target.value)}
                  placeholder="Bangalore, India"
                  className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] py-2.5 pl-9 pr-3 text-sm text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                />
              </div>
            </Field>
            <Field label="Company Size">
              <select
                value={form.company.size ?? ''}
                onChange={(e) => setCompanyField('size', e.target.value)}
                className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] py-2.5 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] cursor-pointer"
              >
                <option value="">Select company size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1001-5000">1001-5000 employees</option>
                <option value="5000+">5000+ employees</option>
              </select>
            </Field>
            <Field label="Founded Year">
              <Input type="number" value={form.company.foundedYear} onChange={(e: any) => setCompanyField('foundedYear', e.target.value)} placeholder="2010" />
            </Field>
          </div>

          <Field label="Address">
            <Input value={form.company.address} onChange={(e: any) => setCompanyField('address', e.target.value)} placeholder="123 Tech Park, Bangalore, Karnataka 560001" />
          </Field>

          <Field label="About Company">
            <textarea
              rows={4}
              value={form.company.description ?? ''}
              onChange={(e) => setCompanyField('description', e.target.value)}
              placeholder="Brief overview of company mission, culture, and products..."
              className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3 text-sm text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] resize-none"
            />
          </Field>

          <h4 className="text-base font-bold text-[hsl(var(--text-primary))] border-b border-[hsl(var(--border))] pb-4 pt-2">Your Contact Info</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Your Designation">
              <Input value={form.designation} onChange={(e: any) => setForm({ ...form, designation: e.target.value })} placeholder="Senior HR Manager" />
            </Field>
            <Field label="Your Phone">
              <Input value={form.phone} onChange={(e: any) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
            </Field>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[hsl(var(--border))]">
            {isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="flex items-center gap-2 py-2.5 px-6 rounded-lg bg-[hsl(var(--primary))] text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
            >
              <Save className="h-4 w-4" />
              {isUpdatingProfile ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CompanyProfilePage;
