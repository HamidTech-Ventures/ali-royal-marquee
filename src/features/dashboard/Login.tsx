import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@codepispor.com');
  const [password, setPassword] = useState('ADMIN#2026');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // For development, testing Auth
      if (email === 'admin@codepispor.com' && password === 'ADMIN#2026') {
        const response = await api.post('/auth/login', { email, password });
        login(response.data.accessToken, response.data.user);
        navigate('/app/dashboard', { replace: true });
      } else {
        const response = await api.post('/auth/login', { email, password });
        login(response.data.accessToken, response.data.user);
        navigate('/app/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="w-full min-h-screen bg-background flex flex-col justify-center items-center">
      <div className="flex flex-col w-full relative">
        <div className="w-full h-screen sm:min-h-[920px] sm:h-auto flex items-center justify-center p-0 sm:p-6 lg:p-12 relative overflow-hidden bg-surface">
          {/* Mobile Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center sm:hidden z-0"
            style={{ backgroundImage: "url('/mobile-bg.png')" }}
          ></div>

          {/* Ambient architectural subtle illumination */}
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-secondary/10 blur-3xl pointer-events-none hidden sm:block"></div>
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-primary-container/15 blur-3xl pointer-events-none hidden sm:block"></div>

          {/* Main Panoramic Canvas Split */}
          <div className="w-full h-full sm:h-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 bg-transparent sm:bg-surface-container-lowest sm:rounded-xl sm:shadow-xl overflow-hidden relative">
            {/* Left Cinematic Showcase Panel (7 cols) - Hidden on mobile so form is visible without scroll */}
            <div className="hidden lg:flex lg:col-span-7 relative min-h-[480px] lg:min-h-[780px] flex-col justify-between p-8 sm:p-12 overflow-hidden">
              {/* Photography Background using exact placeholder */}
              <div
                className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-1000 scale-105"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC_TdoY9T0dZlptCZ0KTVidmSQGNY8qvT6HaBSfHL_RprHqhlozQIitYLAONGuaFHvT4FQv2K2GJQEiQ6P3N_Gyw7dA483P_mQJfnPhslSZCk94xzKW0BALnP_vlASZ36IXmVqiYvfB9TN71LhI_l_nW1dOEUeqMxpwHEVoaKSmg1sSve1G_4voM_Em3xrMUpnp8OqB3o1GmeFpekO-VDN94_QnVO0ThaA4QUYBv_fBqPtuZ6wQ-2hO1g')",
                }}
              ></div>
              {/* Layered Cinematic Scrim: Vignette, Burgundy Richness & Legibility Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-tertiary via-primary/75 to-tertiary/60 mix-blend-multiply pointer-events-none"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-tertiary/90 via-tertiary/50 to-transparent pointer-events-none"></div>

              {/* Top Header Showcase Meta */}
              <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-surface-container-lowest/15 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse"></span>
                  <span className="font-label-sm text-label-sm text-secondary-fixed uppercase tracking-wider">
                    Operational Fleet Online
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-lowest/10 backdrop-blur-md">
                  <span className="material-symbols-outlined text-secondary-fixed text-sm">stars</span>
                  <span className="font-label-sm text-label-sm text-on-primary tracking-widest uppercase">
                    Est. 2011
                  </span>
                </div>
              </div>

              {/* Center Atmospheric Badge & Value Prop */}
              <div className="relative z-10 my-auto py-8">
                <div className="max-w-lg space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-secondary/30 backdrop-blur-md text-secondary-fixed text-label-sm font-label-sm uppercase tracking-widest">
                    <span className="material-symbols-outlined text-xs">domain</span>
                    Islamabad Premier Destination
                  </div>
                  <h2 className="font-headline-lg text-headline-lg text-on-primary leading-tight font-bold">
                    Where Royal Grandeur Meets Operational Precision.
                  </h2>
                  <p className="font-body-md text-body-md text-surface-container-high/90 max-w-md">
                    Centralized venue logistics, banquet management, floral layout orchestration, and high-frequency real-time accounting for capital events.
                  </p>
                </div>
                {/* Quick Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-surface-container-lowest/20">
                  <div>
                    <p className="font-display-mobile text-display-mobile text-secondary-fixed font-semibold">
                      1,200+
                    </p>
                    <p className="font-label-sm text-label-sm uppercase text-surface-container-high/80 tracking-wider">
                      Luxury Galas Hosted
                    </p>
                  </div>
                  <div>
                    <p className="font-display-mobile text-display-mobile text-on-primary font-semibold">
                      3,500
                    </p>
                    <p className="font-label-sm text-label-sm uppercase text-surface-container-high/80 tracking-wider">
                      Concurrent Capacity
                    </p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="font-display-mobile text-display-mobile text-secondary-fixed-dim font-semibold">
                      100%
                    </p>
                    <p className="font-label-sm text-label-sm uppercase text-surface-container-high/80 tracking-wider">
                      Audit Compliance
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Quote & Heritage Validation */}
              <div className="relative z-10 pt-4 border-t border-surface-container-lowest/15 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary-fixed backdrop-blur-sm">
                  <span className="material-symbols-outlined text-lg">format_quote</span>
                </div>
                <div>
                  <p className="font-body-sm text-body-sm text-surface-bright/90 italic">
                    "Excellence is not an act, but our unyielding custom for every single bride, groom, and dignitary."
                  </p>
                  <p className="font-label-sm text-label-sm uppercase text-secondary-fixed tracking-wider mt-0.5">
                    Office of the General Manager • Ali Royal Hospitality
                  </p>
                </div>
              </div>
            </div>

            {/* Right Executive Authentication Card (5 cols) */}
            <div className="lg:col-span-5 bg-surface-container-lowest/80 sm:bg-surface-container-lowest backdrop-blur-xl sm:backdrop-blur-none p-6 sm:p-10 lg:p-12 flex flex-col justify-center sm:justify-between relative z-20 h-full sm:h-auto overflow-y-auto">
              {/* Header Section with Official Crest */}
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-surface-container">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-lg bg-primary-container flex items-center justify-center text-secondary-container shadow-md">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4zm0 4.5l2.5 4.5h-5L12 6.5zm-3 8.5c0-.83.67-1.5 1.5-1.5h3c.83 0 1.5.67 1.5 1.5v2H9v-2z"></path>
                      </svg>
                    </div>
                    <div>
                      <h1 className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface">
                        ALI ROYAL
                      </h1>
                      <p className="font-label-sm text-label-sm tracking-[0.25em] font-semibold text-secondary uppercase">
                        Marquee Management System
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2 py-1 rounded text-label-sm font-label-sm bg-surface-container text-on-surface-variant">
                    v4.8 Elite
                  </span>
                </div>

                {/* Welcome Explanatory Copy */}
                <div className="mt-6 mb-6">
                  <div className="flex items-center gap-2">
                    <h2 className="font-title-md text-title-md font-bold text-on-surface">
                      Executive Staff Portal
                    </h2>
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Sign in with your verified credentials to access banquet operations, bookings, floor allocations, and financial ledgers.
                  </p>
                </div>

                {/* Role Selector Tabs - Removed as per request, kept only GM/Admin conceptually */}
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-full py-2 px-4 rounded bg-surface-container-lowest text-primary font-bold shadow-sm border border-surface-container">
                    GM / Admin Portal
                  </div>
                </div>

                {/* Authentication Form */}
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {/* Email / Staff ID Field */}
                  <div className="space-y-1.5">
                    <label
                      className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant"
                      htmlFor="workEmail"
                    >
                      Staff ID or Work Email
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-lg pointer-events-none">
                        alternate_email
                      </span>
                      <input
                        className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low rounded font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary-container transition-all"
                        id="workEmail"
                        placeholder="admin@aliroyalmarquee.com"
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant"
                        htmlFor="staffPass"
                      >
                        Security Passkey
                      </label>
                    </div>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-lg pointer-events-none">
                        lock_open
                      </span>
                      <input
                        className="w-full pl-10 pr-11 py-2.5 bg-surface-container-low rounded font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary-container transition-all"
                        id="staffPass"
                        placeholder="••••••••••••"
                        required
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        aria-label="Toggle password visibility"
                        className="absolute right-3 text-on-surface-variant hover:text-on-surface transition-colors p-1"
                        onClick={() => setShowPassword(!showPassword)}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-lg">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Remember & Terminal Persistence */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        defaultChecked
                        className="w-4 h-4 rounded text-primary focus:ring-secondary bg-surface-container"
                        type="checkbox"
                      />
                      <span className="font-body-sm text-body-sm text-on-surface">
                        Trust this station for 12 hours
                      </span>
                    </label>
                    <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-secondary font-medium">
                      <span className="material-symbols-outlined text-xs">shield</span> Hardware Bound
                    </span>
                  </div>

                  <div className="pt-2">
                    {error && <div className="text-error text-label-sm mb-2">{error}</div>}
                    <button
                      className="w-full py-3 px-6 rounded bg-primary text-on-primary font-title-sm text-title-sm flex items-center justify-center gap-2 shadow-md hover:bg-primary-container active:scale-[0.99] transition-all duration-150 group"
                      disabled={isLoading}
                      type="submit"
                    >
                      {!isLoading && (
                        <>
                          <span>Sign In to Executive Portal</span>
                          <span className="material-symbols-outlined text-secondary-fixed transition-transform duration-200 group-hover:translate-x-1">
                            arrow_forward
                          </span>
                        </>
                      )}
                      {isLoading && (
                        <>
                          <span className="material-symbols-outlined animate-spin text-secondary-fixed text-sm">
                            sync
                          </span>
                          <span>Authenticating Staff Credentials...</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Security Status Pill */}
                <div className="mt-4 py-2 px-3 rounded bg-surface-container flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-sm">
                      verified_user
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface">
                      256-bit TLS Encrypted Session
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Auth Node 01
                  </span>
                </div>
              </div>

              {/* Venue Node Footer & Support Desk */}
              <div className="mt-8 pt-6 border-t border-surface-container space-y-3">
                <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    <span className="font-semibold text-on-surface truncate">
                      Grand Ballroom &amp; Crystal Pavilion
                    </span>
                    <span className="text-on-surface-variant/80">• Islamabad</span>
                  </div>
                  <span className="shrink-0 text-secondary font-medium uppercase">Active Node</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-on-surface-variant font-body-sm text-body-sm text-[11px]">
                  <span>Ali Royal Hospitality Group © 2024.</span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">call</span>
                    VIP Desk: +92 325 1486878
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
