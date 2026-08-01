import { useState } from 'react';
import { Plus, Trash2, Edit2, Award, X, ExternalLink } from 'lucide-react';
import type { Certification } from '@/types';

interface CertificationsSectionProps {
  certifications: Certification[];
  onAdd: (data: any) => Promise<any>;
  onUpdate: (id: string, data: any) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
}

export function CertificationsSection({ certifications, onAdd, onUpdate, onDelete }: CertificationsSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleViewCertificate = (url: string) => {
    if (url.startsWith('data:')) {
      const newTab = window.open();
      if (newTab) {
        newTab.document.write(
          `<iframe src="${url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
        );
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.download = 'certificate';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Form fields state
  const [name, setName] = useState('');
  const [issuer, setIssuer] = useState('');
  const [date, setDate] = useState('');
  const [url, setUrl] = useState('');
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setIssuer('');
    setDate('');
    setUrl('');
    setUploadMode('url');
    setEditingId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be under 2MB!');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenEdit = (cert: Certification) => {
    setName(cert.name);
    setIssuer(cert.issuer);
    setDate(cert.date ? new Date(cert.date).toISOString().split('T')[0] : '');
    setUrl(cert.url || '');
    
    // Detect if current url is a Base64 file string
    const isBase64 = cert.url?.startsWith('data:') || false;
    setUploadMode(isBase64 ? 'file' : 'url');
    
    setEditingId(String(cert.id));
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !issuer) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name,
        issuer,
        date: date ? new Date(date).toISOString() : null,
        url: url.trim() || null,
      };

      if (editingId) {
        await onUpdate(editingId, payload);
      } else {
        await onAdd(payload);
      }
      setIsOpen(false);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-[hsl(var(--primary))]" />
          <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Certifications</h3>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex justify-center items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Certification
        </button>
      </div>

      {/* Certifications List */}
      {certifications.length === 0 ? (
        <p className="text-sm text-[hsl(var(--text-secondary))] italic">No certifications added yet.</p>
      ) : (
        <div className="space-y-4">
          {certifications.map((cert) => (
            <div
              key={cert.id}
              className="flex justify-between items-start p-4 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)] transition-all bg-[hsl(var(--surface))] hover:shadow-xs group"
            >
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-[hsl(var(--text-primary))]">{cert.name}</h4>
                <p className="text-xs font-medium text-[hsl(var(--text-secondary))]">
                  Issued by {cert.issuer}
                </p>
                <div className="flex items-center gap-4 text-[10px] text-[hsl(var(--text-muted))] font-semibold">
                  {cert.date && (
                    <span>
                      Date: {new Date(cert.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                    </span>
                  )}
                  {cert.url && (
                    <button
                      type="button"
                      onClick={() => handleViewCertificate(cert.url)}
                      className="inline-flex items-center gap-1 text-[hsl(var(--primary))] hover:underline cursor-pointer bg-transparent border-none p-0 text-[10px] font-semibold"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Certificate
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleOpenEdit(cert)}
                  className="p-1.5 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--primary))] hover:bg-[hsl(var(--muted))] rounded-lg transition-colors cursor-pointer"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(String(cert.id))}
                  className="p-1.5 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--danger))] hover:bg-[hsl(var(--danger-light))/0.3] rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {isOpen && (
        <div className="fixed inset-0 z-999 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 shadow-xl z-10 animate-in space-y-4">
            <div className="flex justify-between items-center border-b border-[hsl(var(--border))] pb-3">
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">
                {editingId ? 'Edit Certification' : 'Add Certification'}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))] p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1">
                  Certification Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. AWS Certified Solutions Architect"
                  className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1">
                  Issuer
                </label>
                <input
                  type="text"
                  required
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  placeholder="e.g. Amazon Web Services"
                  className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1">
                    Credential Type
                  </label>
                  <select
                    value={uploadMode}
                    onChange={(e) => {
                      setUploadMode(e.target.value as any);
                      setUrl('');
                    }}
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                  >
                    <option value="url">Link URL</option>
                    <option value="file">File Upload (PDF/Image)</option>
                  </select>
                </div>
              </div>

              <div>
                {uploadMode === 'url' ? (
                  <>
                    <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1">
                      Certificate URL
                    </label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://verify.credentials.com/..."
                      className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                    />
                  </>
                ) : (
                  <>
                    <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1">
                      Upload Certificate (PDF / Image)
                    </label>
                    <div className="flex flex-col gap-2">
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="certificate-file-upload"
                      />
                      <label
                        htmlFor="certificate-file-upload"
                        className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] bg-[hsl(var(--muted))/0.2] hover:bg-[hsl(var(--muted))/0.4] rounded-xl cursor-pointer transition-all"
                      >
                        {url && url.startsWith('data:') ? (
                          <div className="text-center space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[hsl(var(--success-light))] text-[hsl(var(--success))] uppercase">
                              File Loaded Successfully
                            </span>
                            <p className="text-[10px] text-[hsl(var(--text-secondary))] italic mt-1">
                              Ready to save (Max 2MB)
                            </p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setUrl('');
                              }}
                              className="text-[10px] text-[hsl(var(--danger))] hover:underline block mx-auto mt-2"
                            >
                              Clear File
                            </button>
                          </div>
                        ) : (
                          <div className="text-center space-y-1">
                            <span className="text-xs font-bold text-[hsl(var(--primary))]">+ Choose Local File</span>
                            <p className="text-[10px] text-[hsl(var(--text-secondary))]">Supports Image or PDF up to 2MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-semibold rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] bg-[hsl(var(--surface))] hover:bg-[hsl(var(--muted))]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-bold rounded-lg text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CertificationsSection;
