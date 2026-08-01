import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { registerFormSchema } from '../schemas/auth.schema';
import { z } from 'zod';
import { useState } from 'react';
import { User, Mail, Lock, Phone, Briefcase, GraduationCap, Building, Loader2, AlertCircle } from 'lucide-react';
import { DEPARTMENTS } from '@/lib/constants';

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export function RegisterPage() {
  const { register: registerUser, isRegistering, registerError } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      role: 'STUDENT',
      rollNumber: '',
      department: '',
      batch: '',
      companyName: '',
      designation: '',
      phone: '',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormValues) => {
    setFormError(null);
    try {
      // Clean up fields based on role before sending to API
      const payload: Record<string, any> = {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
      };

      if (data.role === 'STUDENT') {
        payload.rollNumber = data.rollNumber;
        payload.department = data.department;
        payload.batch = data.batch;
      } else if (data.role === 'RECRUITER') {
        payload.companyName = data.companyName;
        payload.designation = data.designation;
        payload.phone = data.phone;
      } else if (data.role === 'PLACEMENT_OFFICER') {
        payload.department = data.department;
        payload.designation = data.designation;
      }

      await registerUser(payload);
    } catch (err: any) {
      setFormError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--background))] px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-160 h-160 rounded-full bg-[hsl(var(--primary)/0.08)] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-160 h-160 rounded-full bg-[hsl(var(--accent)/0.08)] blur-[100px] pointer-events-none" />

      <div className="w-full max-w-lg space-y-8 glass rounded-2xl p-8 shadow-xl relative z-10 animate-in border border-[hsl(var(--border))]">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight gradient-text">
            Create an account
          </h2>
          <p className="mt-2 text-sm text-[hsl(var(--text-secondary))]">
            Register to join the Placement Management Portal
          </p>
        </div>

        {/* Global Error Alerts */}
        {(formError || registerError) && (
          <div className="flex items-center gap-2 rounded-lg bg-[hsl(var(--danger)/0.1)] p-3 text-sm text-[hsl(var(--danger))] border border-[hsl(var(--danger)/0.2)]">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{formError || 'Registration failed. Please check the values provided.'}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Core user details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--text-primary))] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[hsl(var(--text-muted))]">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    {...register('name')}
                    type="text"
                    placeholder="John Doe"
                    className={`block w-full rounded-lg border bg-[hsl(var(--surface))] py-2 pl-9 pr-3 text-sm text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all ${
                      errors.name ? 'border-[hsl(var(--danger))]' : 'border-[hsl(var(--border))]'
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-xs text-[hsl(var(--danger))]">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[hsl(var(--text-primary))] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[hsl(var(--text-muted))]">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="john@university.edu"
                    className={`block w-full rounded-lg border bg-[hsl(var(--surface))] py-2 pl-9 pr-3 text-sm text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all ${
                      errors.email ? 'border-[hsl(var(--danger))]' : 'border-[hsl(var(--border))]'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-[hsl(var(--danger))]">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--text-primary))] mb-1">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[hsl(var(--text-muted))]">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    {...register('password')}
                    type="password"
                    placeholder="••••••••"
                    className={`block w-full rounded-lg border bg-[hsl(var(--surface))] py-2 pl-9 pr-3 text-sm text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all ${
                      errors.password ? 'border-[hsl(var(--danger))]' : 'border-[hsl(var(--border))]'
                    }`}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-[hsl(var(--danger))]">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[hsl(var(--text-primary))] mb-1">
                  I am registering as:
                </label>
                <select
                  {...register('role')}
                  className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all"
                >
                  <option value="STUDENT">Student</option>
                  <option value="PLACEMENT_OFFICER">Placement Officer</option>
                </select>
              </div>
            </div>

            {/* CONDITIONAL SECTIONS */}

            {/* Student Fields */}
            {selectedRole === 'STUDENT' && (
              <div className="space-y-4 border-t border-[hsl(var(--border))] pt-4 animate-in">
                <h4 className="text-sm font-semibold text-[hsl(var(--primary))]">Student Profile Information</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[hsl(var(--text-primary))] mb-1">
                      Roll Number / ID
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[hsl(var(--text-muted))]">
                        <GraduationCap className="h-4 w-4" />
                      </span>
                      <input
                        {...register('rollNumber')}
                        type="text"
                        placeholder="CS22B1042"
                        className={`block w-full rounded-lg border bg-[hsl(var(--surface))] py-2 pl-9 pr-3 text-sm text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all ${
                          errors.rollNumber ? 'border-[hsl(var(--danger))]' : 'border-[hsl(var(--border))]'
                        }`}
                      />
                    </div>
                    {errors.rollNumber && (
                      <p className="mt-1 text-xs text-[hsl(var(--danger))]">{errors.rollNumber.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[hsl(var(--text-primary))] mb-1">
                      Batch (Graduation Year)
                    </label>
                    <input
                      {...register('batch')}
                      type="text"
                      placeholder="e.g. 2022 - 2026"
                      className={`block w-full rounded-lg border bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all ${
                        errors.batch ? 'border-[hsl(var(--danger))]' : 'border-[hsl(var(--border))]'
                      }`}
                    />
                    {errors.batch && (
                      <p className="mt-1 text-xs text-[hsl(var(--danger))]">{errors.batch.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--text-primary))] mb-1">
                    Department
                  </label>
                  <select
                    {...register('department')}
                    className={`block w-full rounded-lg border bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all ${
                      errors.department ? 'border-[hsl(var(--danger))]' : 'border-[hsl(var(--border))]'
                    }`}
                  >
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="mt-1 text-xs text-[hsl(var(--danger))]">{errors.department.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Recruiter Fields */}
            {selectedRole === 'RECRUITER' && (
              <div className="space-y-4 border-t border-[hsl(var(--border))] pt-4 animate-in">
                <h4 className="text-sm font-semibold text-[hsl(var(--primary))]">Recruiter Profile Information</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[hsl(var(--text-primary))] mb-1">
                      Company Name
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[hsl(var(--text-muted))]">
                        <Building className="h-4 w-4" />
                      </span>
                      <input
                        {...register('companyName')}
                        type="text"
                        placeholder="Google, Inc."
                        className={`block w-full rounded-lg border bg-[hsl(var(--surface))] py-2 pl-9 pr-3 text-sm text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all ${
                          errors.companyName ? 'border-[hsl(var(--danger))]' : 'border-[hsl(var(--border))]'
                        }`}
                      />
                    </div>
                    {errors.companyName && (
                      <p className="mt-1 text-xs text-[hsl(var(--danger))]">{errors.companyName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[hsl(var(--text-primary))] mb-1">
                      Designation
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[hsl(var(--text-muted))]">
                        <Briefcase className="h-4 w-4" />
                      </span>
                      <input
                        {...register('designation')}
                        type="text"
                        placeholder="HR Specialist"
                        className={`block w-full rounded-lg border bg-[hsl(var(--surface))] py-2 pl-9 pr-3 text-sm text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all ${
                          errors.designation ? 'border-[hsl(var(--danger))]' : 'border-[hsl(var(--border))]'
                        }`}
                      />
                    </div>
                    {errors.designation && (
                      <p className="mt-1 text-xs text-[hsl(var(--danger))]">{errors.designation.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--text-primary))] mb-1">
                    Contact Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[hsl(var(--text-muted))]">
                      <Phone className="h-4 w-4" />
                    </span>
                    <input
                      {...register('phone')}
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      className={`block w-full rounded-lg border bg-[hsl(var(--surface))] py-2 pl-9 pr-3 text-sm text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all ${
                        errors.phone ? 'border-[hsl(var(--danger))]' : 'border-[hsl(var(--border))]'
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-xs text-[hsl(var(--danger))]">{errors.phone.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Placement Officer Fields */}
            {selectedRole === 'PLACEMENT_OFFICER' && (
              <div className="space-y-4 border-t border-[hsl(var(--border))] pt-4 animate-in">
                <h4 className="text-sm font-semibold text-[hsl(var(--primary))]">Placement Officer Profile Information</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[hsl(var(--text-primary))] mb-1">
                      Department
                    </label>
                    <select
                      {...register('department')}
                      className={`block w-full rounded-lg border bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all ${
                        errors.department ? 'border-[hsl(var(--danger))]' : 'border-[hsl(var(--border))]'
                      }`}
                    >
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    {errors.department && (
                      <p className="mt-1 text-xs text-[hsl(var(--danger))]">{errors.department.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[hsl(var(--text-primary))] mb-1">
                      Designation
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[hsl(var(--text-muted))]">
                        <Briefcase className="h-4 w-4" />
                      </span>
                      <input
                        {...register('designation')}
                        type="text"
                        placeholder="Placement Head"
                        className={`block w-full rounded-lg border bg-[hsl(var(--surface))] py-2 pl-9 pr-3 text-sm text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all ${
                          errors.designation ? 'border-[hsl(var(--danger))]' : 'border-[hsl(var(--border))]'
                        }`}
                      />
                    </div>
                    {errors.designation && (
                      <p className="mt-1 text-xs text-[hsl(var(--danger))]">{errors.designation.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isRegistering}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[hsl(var(--primary))] transition-all disabled:opacity-50 cursor-pointer font-semibold"
          >
            {isRegistering ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              'Register Account'
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-[hsl(var(--text-secondary))]">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[hsl(var(--primary))] hover:underline transition-all">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
