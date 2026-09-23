import { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  ArrowRight,
  ShieldCheck,
  Mail,
  Lock,
  LogOut,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import type { Page } from '../App';

interface LoginPageProps {
  onNavigate: (page: Page) => void;
}

function formatAuthError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = String((error as { code: string }).code);
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Invalid email address or password.';
      case 'auth/email-already-in-use':
        return 'An account with this email address already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many unsuccessful attempts. Please try again later.';
      default:
        return 'Authentication failed. Please check your credentials.';
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected authentication error occurred.';
}

export default function LoginPage({ onNavigate }: LoginPageProps) {
  const { user, signIn, signUp, signOut, loading: isAuthLoading } = useAuth();
  
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup State
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // Form handling state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await signIn(loginEmail.trim(), loginPassword);
      onNavigate('home');
    } catch (err) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await signUp(signupEmail.trim(), signupPassword);
      onNavigate('home');
    } catch (err) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await signOut();
    } catch (err) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-32 pb-24">
      <div className="container mx-auto px-6">
        <div className="max-w-[1000px] mx-auto bg-white rounded-[48px] shadow-[0_30px_80px_rgba(0,0,0,0.04)] border border-[#F1F5F9] overflow-hidden flex flex-col md:flex-row">
          
          {/* LEFT SIDE - BRANDING */}
          <div className="w-full md:w-[45%] bg-[#1E2329] p-12 text-white relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-kb-tertiary opacity-10 blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-kb-primary opacity-10 blur-[100px]" />
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 border border-white/10 backdrop-blur-md">
                <ShieldCheck size={32} className="text-kb-tertiary" />
              </div>
              <h1 className="text-[36px] font-bold mb-6 font-['Outfit'] leading-tight text-white">
                Customer Account <br /> Portal
              </h1>
              <p className="text-white/90 font-['DM_Sans'] leading-relaxed">
                Log in to access your orders, saved equipment list, and submit authenticated requests.
              </p>
            </div>

            <div className="relative z-10 pt-12 border-t border-white/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#1E2329] overflow-hidden">
                      <img src={`/images/redesign/team-${i}.png`} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <p className="text-[13px] text-white/80 font-['DM_Sans']">Joined by 500+ <br /> Industry Leaders</p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - FORM OR LOGGED-IN CARD */}
          <div className="w-full md:w-[55%] p-12 lg:p-20 flex flex-col justify-center">
            {isAuthLoading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-kb-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm font-medium text-[#64748B]">Verifying session...</p>
              </div>
            ) : user ? (
              /* ALREADY AUTHENTICATED STATE */
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 bg-[#F0FDF4] border border-[#DCFCE7] rounded-full flex items-center justify-center mx-auto text-kb-primary">
                  <UserCheck size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-['Outfit'] text-[#111827]">
                    Signed In
                  </h2>
                  <p className="text-sm text-[#64748B] mt-1 font-['DM_Sans']">
                    Authenticated as <span className="font-semibold text-[#111827]">{user.email}</span>
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-xs text-[#DC2626] flex items-center gap-2 text-left">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="pt-4 space-y-3">
                  <Button 
                    onClick={() => onNavigate('home')}
                    size="lg"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    Return to Storefront <ArrowRight size={18} />
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleSignOut}
                    disabled={isSubmitting}
                    size="lg"
                    className="w-full text-[#DC2626] hover:bg-[#FEF2F2] hover:text-[#DC2626] border-[#FCA5A5] flex items-center justify-center gap-2"
                  >
                    <LogOut size={18} />
                    {isSubmitting ? 'Signing out...' : 'Sign Out'}
                  </Button>
                </div>
              </div>
            ) : (
              /* AUTHENTICATION FORM (LOGIN / SIGNUP) */
              <>
                {/* TABS */}
                <div className="flex gap-8 mb-8 border-b border-[#F1F5F9]">
                  <Button 
                    variant="ghost"
                    onClick={() => { setActiveTab('login'); setErrorMessage(null); }}
                    className={`h-auto pb-4 px-0 rounded-none bg-transparent hover:bg-transparent text-[14px] font-bold uppercase tracking-widest transition-all relative font-['Outfit'] ${activeTab === 'login' ? 'text-[#111827]' : 'text-[#94A3B8] hover:text-[#111827]'}`}
                  >
                    Login
                    {activeTab === 'login' && <div className="absolute bottom-0 inset-x-0 h-1 bg-kb-tertiary rounded-full" />}
                  </Button>
                  <Button 
                    variant="ghost"
                    onClick={() => { setActiveTab('signup'); setErrorMessage(null); }}
                    className={`h-auto pb-4 px-0 rounded-none bg-transparent hover:bg-transparent text-[14px] font-bold uppercase tracking-widest transition-all relative font-['Outfit'] ${activeTab === 'signup' ? 'text-[#111827]' : 'text-[#94A3B8] hover:text-[#111827]'}`}
                  >
                    Sign Up
                    {activeTab === 'signup' && <div className="absolute bottom-0 inset-x-0 h-1 bg-kb-primary rounded-full" />}
                  </Button>
                </div>

                {errorMessage && (
                  <div className="mb-6 p-3.5 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-xs text-[#DC2626] flex items-center gap-2 font-['DM_Sans']">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {activeTab === 'login' ? (
                  <form onSubmit={handleLoginSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-widest font-['Outfit']">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
                        <input 
                          type="email" 
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="customer@kitchenbots.in" 
                          className="w-full h-[56px] pl-12 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-[15px] focus:outline-none focus:border-kb-tertiary focus:bg-white transition-all font-['DM_Sans']"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-widest font-['Outfit']">
                          Password
                        </label>
                        <Button 
                          type="button"
                          variant="link"
                          onClick={() => onNavigate('forgot-password')}
                          className="text-[12px] h-auto p-0 text-kb-tertiary hover:text-[#D18509] font-bold uppercase tracking-widest"
                        >
                          Forgot?
                        </Button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
                        <input 
                          type={showLoginPass ? 'text' : 'password'} 
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••" 
                          className="w-full h-[56px] pl-12 pr-12 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-[15px] focus:outline-none focus:border-kb-tertiary focus:bg-white transition-all font-['DM_Sans']"
                        />
                        <Button 
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setShowLoginPass(!showLoginPass)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#111827] hover:bg-[#F1F5F9]"
                        >
                          {showLoginPass ? <EyeOff size={18} /> : <Eye size={18} />}
                        </Button>
                      </div>
                    </div>

                    <Button 
                      type="submit"
                      disabled={isSubmitting}
                      size="lg"
                      className="w-full mt-4 shadow-xl shadow-black/10 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? 'Signing in...' : 'Sign In'} <ArrowRight size={20} />
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleSignupSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-widest font-['Outfit']">
                        Full Name
                      </label>
                      <input 
                        type="text" 
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="Vijay Sharma" 
                        className="w-full h-[56px] px-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-[15px] focus:outline-none focus:border-kb-primary focus:bg-white transition-all font-['DM_Sans']"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-widest font-['Outfit']">
                        Email Address
                      </label>
                      <input 
                        type="email" 
                        required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="name@company.com" 
                        className="w-full h-[56px] px-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-[15px] focus:outline-none focus:border-kb-primary focus:bg-white transition-all font-['DM_Sans']"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-widest font-['Outfit']">
                        Create Password
                      </label>
                      <input 
                        type="password" 
                        required
                        minLength={6}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="••••••••" 
                        className="w-full h-[56px] px-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-[15px] focus:outline-none focus:border-kb-primary focus:bg-white transition-all font-['DM_Sans']"
                      />
                    </div>

                    <Button 
                      type="submit"
                      disabled={isSubmitting}
                      variant="secondary"
                      size="lg"
                      className="w-full mt-4 shadow-xl shadow-kb-primary flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? 'Creating account...' : 'Create Account'} <ArrowRight size={20} />
                    </Button>
                    
                    <p className="text-[12px] text-[#94A3B8] text-center font-['DM_Sans'] pt-2">
                      By joining, you agree to our <span className="text-[#111827] font-bold hover:underline cursor-pointer">Terms of Service</span>.
                    </p>
                  </form>
                )}
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
