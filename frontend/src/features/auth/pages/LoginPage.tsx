import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { loginFormSchema } from '../schemas/auth.schema';
import { z } from 'zod';
import { useState } from 'react';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

type LoginFormValues = z.infer<typeof loginFormSchema>;

export function LoginPage() {
  const { login, isLoggingIn, loginError } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setFormError(null);
    try {
      await login(data);
    } catch (err: any) {
      setFormError(
        err.response?.data?.message || 'Invalid email or password. Please try again.'
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--background))] px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-160 h-160 rounded-full bg-[hsl(var(--primary)/0.08)] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-160 h-160 rounded-full bg-[hsl(var(--accent)/0.08)] blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 glass rounded-2xl p-8 shadow-xl relative z-10 animate-in border border-[hsl(var(--border))]">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight gradient-text">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-[hsl(var(--text-secondary))]">
            Sign in to your Placement Portal account
          </p>
        </div>

        {/* Global Error Alerts */}
        {(formError || loginError) && (
          <div className="flex items-center gap-2 rounded-lg bg-[hsl(var(--danger)/0.1)] p-3 text-sm text-[hsl(var(--danger))] border border-[hsl(var(--danger)/0.2)]">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{formError || 'Login failed. Please check your credentials.'}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[hsl(var(--text-primary))] mb-1">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[hsl(var(--text-muted))]">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  placeholder="name@university.edu"
                  className={`block w-full rounded-lg border bg-[hsl(var(--surface))] py-2.5 pl-10 pr-3 text-sm text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all ${
                    errors.email ? 'border-[hsl(var(--danger))]' : 'border-[hsl(var(--border))]'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-[hsl(var(--danger))]">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[hsl(var(--text-primary))] mb-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[hsl(var(--text-muted))]">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  {...register('password')}
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  className={`block w-full rounded-lg border bg-[hsl(var(--surface))] py-2.5 pl-10 pr-3 text-sm text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all ${
                    errors.password ? 'border-[hsl(var(--danger))]' : 'border-[hsl(var(--border))]'
                  }`}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-[hsl(var(--danger))]">{errors.password.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[hsl(var(--primary))] transition-all disabled:opacity-50 cursor-pointer font-semibold"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-[hsl(var(--text-secondary))]">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-medium text-[hsl(var(--primary))] hover:underline transition-all">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
