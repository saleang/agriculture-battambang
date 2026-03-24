import { FormEventHandler, useEffect, useRef, useState, useCallback } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
  CheckCircle, XCircle, Loader2, Eye, EyeOff,
  ChevronRight, ChevronLeft, User, Store, MapPin, Lock, Leaf,
  AlertCircle, Info, X,
} from 'lucide-react';
import axios from 'axios';

/* ═══════════════════════════════════════════════════════════════
   SONNER-STYLE TOAST SYSTEM
═══════════════════════════════════════════════════════════════ */
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

let toastListeners: ((toasts: Toast[]) => void)[] = [];
let toastQueue: Toast[] = [];

const toastStore = {
  subscribe: (fn: (t: Toast[]) => void) => {
    toastListeners.push(fn);
    return () => { toastListeners = toastListeners.filter(l => l !== fn); };
  },
  emit: () => toastListeners.forEach(fn => fn([...toastQueue])),
  add: (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    toastQueue = [{ ...toast, id }, ...toastQueue].slice(0, 5);
    toastStore.emit();
    setTimeout(() => toastStore.remove(id), toast.duration ?? 4000);
  },
  remove: (id: string) => {
    toastQueue = toastQueue.filter(t => t.id !== id);
    toastStore.emit();
  },
};

export const toast = {
  success: (title: string, message?: string) => toastStore.add({ type: 'success', title, message }),
  error:   (title: string, message?: string) => toastStore.add({ type: 'error',   title, message }),
  info:    (title: string, message?: string) => toastStore.add({ type: 'info',     title, message }),
  warning: (title: string, message?: string) => toastStore.add({ type: 'warning', title, message }),
};

function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [exiting, setExiting] = useState<Set<string>>(new Set());

  useEffect(() => toastStore.subscribe(setToasts), []);

  const dismiss = (id: string) => {
    setExiting(prev => new Set(prev).add(id));
    setTimeout(() => {
      toastStore.remove(id);
      setExiting(prev => { const s = new Set(prev); s.delete(id); return s; });
    }, 350);
  };

  const cfg: Record<ToastType, { bg: string; border: string; icon: React.ReactNode; bar: string }> = {
    success: {
      bg: 'bg-white',
      border: 'border-emerald-200',
      icon: <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
      bar: 'bg-emerald-500',
    },
    error: {
      bg: 'bg-white',
      border: 'border-red-200',
      icon: <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />,
      bar: 'bg-red-500',
    },
    warning: {
      bg: 'bg-white',
      border: 'border-amber-200',
      icon: <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
      bar: 'bg-amber-400',
    },
    info: {
      bg: 'bg-white',
      border: 'border-blue-200',
      icon: <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />,
      bar: 'bg-blue-500',
    },
  };

  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 min-w-[300px] max-w-[360px]">
      {toasts.map((t, i) => {
        const c = cfg[t.type];
        const isOut = exiting.has(t.id);
        return (
          <div
            key={t.id}
            style={{
              transform: isOut ? 'translateX(110%) scale(0.95)' : `translateY(${i * 2}px) scale(${1 - i * 0.02})`,
              opacity: isOut ? 0 : 1 - i * 0.08,
              transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transitionProperty: 'transform, opacity',
              zIndex: 9999 - i,
              fontFamily: "'Khmer OS Siemreap', sans-serif",
            }}
            className={`relative overflow-hidden rounded-xl shadow-lg border ${c.bg} ${c.border} cursor-pointer group`}
            onClick={() => dismiss(t.id)}
          >
            {/* progress bar */}
            <div
              className={`absolute bottom-0 left-0 h-0.5 ${c.bar} rounded-full`}
              style={{
                width: '100%',
                animation: `toastProgress ${t.duration ?? 4000}ms linear forwards`,
              }}
            />
            <div className="px-4 py-3 flex items-start gap-3">
              {c.icon}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 leading-snug">{t.title}</p>
                {t.message && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{t.message}</p>}
              </div>
              <button
                onClick={e => { e.stopPropagation(); dismiss(t.id); }}
                className="flex-shrink-0 p-0.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
      <style>{`
        @keyframes toastProgress {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   API HELPERS
═══════════════════════════════════════════════════════════════ */
const checkEmailAvailability = async (email: string): Promise<boolean | null> => {
  try {
    const resp = await axios.get('/check-email', { params: { email } });
    return resp?.data?.available ?? null;
  } catch { return null; }
};

const checkPhoneAvailability = async (phone: string): Promise<boolean | null> => {
  try {
    const resp = await axios.get('/check-phone', { params: { phone } });
    return resp?.data?.available ?? null;
  } catch { return null; }
};

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
interface Location {
  province_id?: number;
  district_id?: number;
  commune_id?: number;
  village_id?: number;
  name_en: string;
  name_km: string;
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function Register() {
  const [currentStep, setCurrentStep] = useState(1);

  const { data, setData, post, processing, errors, reset } = useForm({
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'customer' as 'customer' | 'seller',
    phone: '',
    farm_name: '',
    province_id: '',
    district_id: '',
    commune_id: '',
    village_id: '',
    description: '',
  });

  const [isSeller, setIsSeller]       = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle'|'checking'|'valid'|'invalid'|'taken'>('idle');
  const [phoneStatus, setPhoneStatus] = useState<'idle'|'checking'|'valid'|'invalid'|'taken'>('idle');
  const [showPassword, setShowPassword] = useState(false);

  const [provinces, setProvinces] = useState<Location[]>([]);
  const [districts, setDistricts] = useState<Location[]>([]);
  const [communes,  setCommunes]  = useState<Location[]>([]);
  const [villages,  setVillages]  = useState<Location[]>([]);

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => () => reset('password', 'password_confirmation'), []);

  /* provinces */
  useEffect(() => {
    if (!isSeller) return;
    axios.get('/api/provinces').then(r => setProvinces(r.data)).catch(console.error);
  }, [isSeller]);

  /* districts */
  useEffect(() => {
    setData(prev => ({ ...prev, district_id: '', commune_id: '', village_id: '' }));
    setDistricts([]); setCommunes([]); setVillages([]);
    if (!data.province_id) return;
    axios.get(`/api/districts/${data.province_id}`).then(r => setDistricts(r.data)).catch(console.error);
  }, [data.province_id]);

  /* communes */
  useEffect(() => {
    setData(prev => ({ ...prev, commune_id: '', village_id: '' }));
    setCommunes([]); setVillages([]);
    if (!data.district_id) return;
    axios.get(`/api/communes/${data.district_id}`).then(r => setCommunes(r.data)).catch(console.error);
  }, [data.district_id]);

  /* villages */
  useEffect(() => {
    setData(prev => ({ ...prev, village_id: '' }));
    setVillages([]);
    if (!data.commune_id) return;
    axios.get(`/api/villages/${data.commune_id}`).then(r => setVillages(r.data)).catch(console.error);
  }, [data.commune_id]);

  /* email check */
  useEffect(() => {
    if (!data.email) { setEmailStatus('idle'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) { setEmailStatus('invalid'); return; }
    setEmailStatus('checking');
    const t = setTimeout(async () => {
      const ok = await checkEmailAvailability(data.email);
      if (ok === false) toast.error('អ៊ីមែលមានហើយ', 'អ៊ីមែលនេះត្រូវបានប្រើប្រាស់រួចហើយ');
      setEmailStatus(ok ? 'valid' : 'taken');
    }, 800);
    return () => clearTimeout(t);
  }, [data.email]);

  /* phone check */
  useEffect(() => {
    if (!data.phone) { setPhoneStatus('idle'); return; }
    if (!/^[0-9]{9,10}$/.test(data.phone)) { setPhoneStatus('invalid'); return; }
    setPhoneStatus('checking');
    const t = setTimeout(async () => {
      const ok = await checkPhoneAvailability(data.phone);
      if (ok === false) toast.error('លេខទូរស័ព្ទមានហើយ', 'លេខទូរស័ព្ទនេះត្រូវបានប្រើប្រាស់រួចហើយ');
      setPhoneStatus(ok ? 'valid' : 'taken');
    }, 800);
    return () => clearTimeout(t);
  }, [data.phone]);

  /* role */
  const handleRoleChange = (role: 'customer' | 'seller') => {
    setData('role', role);
    setIsSeller(role === 'seller');
    setCurrentStep(1);
    toast.info(
      role === 'seller' ? 'ប្រភេទ: អាជីវករ' : 'ប្រភេទ: អតិថិជន',
      role === 'seller' ? 'អ្នកអាចបំពេញព័ត៌មានហាង/កសិដ្ឋាន' : 'ចូលរួមជាអ្នកទិញផលិតផល',
    );
  };

  /* validation */
  const isStep1Valid = () => {
    const base = data.username.trim().length >= 3 && emailStatus === 'valid' && phoneStatus === 'valid';
    return isSeller ? base && data.farm_name.trim().length > 0 : base;
  };
  const isStep2Valid = () => !isSeller || (!!data.province_id && !!data.district_id);
  const isStep3Valid = () => {
    const pw = data.password;
    return pw.length >= 8 && /[a-z]/.test(pw) && /[A-Z]/.test(pw) &&
      /[\d!@#$%^&*(),.?":{}|<>\s]/.test(pw) && pw === data.password_confirmation;
  };

  /* navigation */
  const handleNext = () => {
    if (currentStep === 1 && isStep1Valid()) {
      setCurrentStep(isSeller ? 2 : 3);
      toast.success('ព័ត៌មានត្រឹមត្រូវ!', isSeller ? 'បំពេញព័ត៌មានទីតាំងបន្ត' : 'ជំហានចុងក្រោយ — កំណត់ពាក្យសម្ងាត់');
    } else if (currentStep === 2 && isStep2Valid()) {
      setCurrentStep(3);
      toast.success('ទីតាំងបានកត់ត្រា!', 'ជំហានចុងក្រោយ — កំណត់ពាក្យសម្ងាត់');
    } else {
      toast.warning('ព័ត៌មានមិនពេញលេញ', 'សូមបំពេញព័ត៌មានទាំងអស់ឱ្យបានត្រឹមត្រូវ');
    }
  };
  const handlePrev = () => {
    if (currentStep === 3) setCurrentStep(isSeller ? 2 : 1);
    else if (currentStep === 2) setCurrentStep(1);
  };

  /* submit */
  const submit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!isStep1Valid() || !isStep3Valid() || (isSeller && !isStep2Valid())) {
      toast.error('ការចុះឈ្មោះបរាជ័យ', 'សូមពិនិត្យព័ត៌មានទាំងអស់ម្ដងទៀត');
      return;
    }
    post('/register', {
      onError: (errs) => {
        console.error('❌', errs);
        toast.error('ការចុះឈ្មោះបរាជ័យ', 'មានបញ្ហាក្នុងការចុះឈ្មោះ — សូមព្យាយាមម្ដងទៀត');
      },
      onSuccess: () => {
        toast.success('ចុះឈ្មោះបានជោគជ័យ! 🎉', 'សូមស្វាគមន៍មកកាន់កសិផលបាត់ដំបង');
      },
    });
  };

  /* display helpers */
  const isOnLastStep     = currentStep === 3;
  const visibleSteps     = isSeller ? [1, 2, 3] : [1, 3];
  const getVisualNum     = (step: number) => isSeller ? step : (step === 3 ? 2 : 1);
  const displayStep      = getVisualNum(currentStep);
  const totalDisplaySteps = isSeller ? 3 : 2;

  /* shared classes */
  const inputCls  = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white";
  const selectCls = `${inputCls} disabled:opacity-50 disabled:cursor-not-allowed`;

  const ValidationIndicator = ({ status }: { status: string }) => {
    if (status === 'checking') return <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />;
    if (status === 'valid')    return <CheckCircle className="w-4 h-4 text-emerald-600" />;
    if (status === 'taken' || status === 'invalid') return <XCircle className="w-4 h-4 text-red-500" />;
    return null;
  };

  /* ─── RENDER ─── */
  return (
    <>
      <Head title="ចុះឈ្មោះគណនី - កសិផលបាត់ដំបង" />
      <ToastContainer />

      {/* Google Fonts — Moul + Khmer OS Siemreap */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Moul&family=Khmer&display=swap');

        /* Khmer OS Siemreap via Google Fonts CDN (subset available as 'Khmer') */
        :root {
          --font-heading: 'Moul', serif;
          --font-body:    'Khmer', sans-serif;
        }

        .font-heading { font-family: var(--font-heading) !important; }
        .font-body    { font-family: var(--font-body) !important; }

        /* Apply body font globally within our container */
        .km-root * { font-family: var(--font-body); }
        .km-root .font-heading,
        .km-root h1,
        .km-root h2 { font-family: var(--font-heading); }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.28s ease-out; }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .animate-slideInRight { animation: slideInRight 0.28s ease-out; }

        .scrollbar-thin::-webkit-scrollbar       { width: 3px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 99px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #9ca3af; }

        /* Moul renders large — tighten it up */
        .font-heading { letter-spacing: 0.01em; line-height: 1.3; }
      `}</style>

      <div className="km-root min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-3 sm:p-6">
        <div
          className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row"
          style={{ maxHeight: '95vh' }}
        >

          {/* ══════════════ LEFT — Form ══════════════ */}
          <div className="w-full lg:w-[62%] flex flex-col min-h-0">
            <div className="p-5 sm:p-7 flex flex-col h-full min-h-0">

              {/* Top bar */}
              <div className="flex-shrink-0 flex items-start justify-between mb-5">
                <div>
                  <h1 className="font-heading text-lg text-gray-900">ចុះឈ្មោះគណនី</h1>
                  <div className="mt-1.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      isSeller ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {isSeller ? <Store className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      {isSeller ? 'អាជីវករ (អ្នកលក់)' : 'អតិថិជន (អ្នកទិញ)'}
                    </span>
                  </div>
                </div>
                <Link
                  href="/login"
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-all"
                >
                  មានគណនីរួច?
                </Link>
              </div>

              {/* Progress stepper */}
              <div className="flex-shrink-0 mb-6">
                <div className="relative flex items-start">
                  <div
                    className="absolute top-4 h-0.5 bg-gray-200 rounded-full"
                    style={{ left: '16px', right: '16px' }}
                  >
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{
                        width: currentStep === 1 ? '0%'
                          : isSeller ? (currentStep === 2 ? '50%' : '100%')
                          : '100%',
                      }}
                    />
                  </div>
                  {visibleSteps.map((step, idx) => {
                    const done   = currentStep > step;
                    const active = currentStep === step;
                    const vNum   = getVisualNum(step);
                    const labels: Record<number,string> = { 1:'ព័ត៌មាន', 2:'ទីតាំង', 3:'សុវត្ថិភាព' };
                    return (
                      <div key={step} className={`relative z-10 flex flex-col items-center ${
                        idx === 0 ? 'mr-auto' : idx === visibleSteps.length - 1 ? 'ml-auto' : 'mx-auto'
                      }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-semibold text-xs transition-all duration-300 ${
                          done   ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' :
                          active ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg scale-110' :
                                   'bg-white border-gray-300 text-gray-400'
                        }`}>
                          {done ? <CheckCircle className="w-4 h-4" /> : vNum}
                        </div>
                        <span className={`text-[10px] mt-1.5 whitespace-nowrap transition-colors ${
                          active ? 'text-emerald-700 font-semibold' : done ? 'text-emerald-500' : 'text-gray-400'
                        }`}>
                          {labels[step]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* FORM */}
              <form ref={formRef} onSubmit={submit} className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin">

                  {/* ── STEP 1 ── */}
                  {currentStep === 1 && (
                    <div className="space-y-5 animate-fadeIn">
                      {/* Role */}
                      <div>
                        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">ប្រភេទគណនី</p>
                        <div className="grid grid-cols-2 gap-3">
                          {([
                            { role: 'customer' as const, Icon: User,  label: 'អតិថិជន', sub: 'ទិញផលិតផលស្រស់ៗ' },
                            { role: 'seller'   as const, Icon: Store, label: 'អាជីវករ', sub: 'លក់ផលិតផលតាមអនឡាញ' },
                          ]).map(({ role, Icon, label, sub }) => (
                            <button
                              key={role}
                              type="button"
                              onClick={() => handleRoleChange(role)}
                              className={`p-4 border-2 rounded-xl text-center transition-all duration-200 group ${
                                data.role === role
                                  ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                                  : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex flex-col items-center gap-2">
                                <div className={`p-2 rounded-lg transition-colors ${
                                  data.role === role ? 'bg-emerald-100' : 'bg-gray-100 group-hover:bg-emerald-50'
                                }`}>
                                  <Icon className={`w-5 h-5 ${data.role === role ? 'text-emerald-600' : 'text-gray-500'}`} />
                                </div>
                                <span className={`font-semibold text-sm ${data.role === role ? 'text-emerald-700' : 'text-gray-700'}`}>{label}</span>
                                <p className="text-[11px] text-gray-500">{sub}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Username */}
                        <div>
                          <label htmlFor="username" className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                            ឈ្មោះអ្នកប្រើប្រាស់
                          </label>
                          <input
                            id="username" name="username" type="text"
                            value={data.username}
                            onChange={e => setData('username', e.target.value)}
                            className={`${inputCls} ${errors.username ? 'border-red-300' : ''}`}
                            placeholder="បំពេញឈ្មោះ"
                          />
                          {data.username.length > 0 && data.username.trim().length < 3 && (
                            <p className="text-red-500 text-[11px] mt-1">ត្រូវការយ៉ាងតិច 3 តួអក្សរ</p>
                          )}
                          {errors.username && <p className="text-red-500 text-[11px] mt-1">{errors.username}</p>}
                        </div>

                        {/* Email */}
                        <div>
                          <label htmlFor="email" className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                            អ៊ីមែល
                          </label>
                          <div className="relative">
                            <input
                              id="email" name="email" type="email"
                              value={data.email}
                              onChange={e => setData('email', e.target.value)}
                              className={`${inputCls} pr-9 ${
                                emailStatus === 'taken' || emailStatus === 'invalid' ? 'border-red-300' :
                                emailStatus === 'valid' ? 'border-emerald-300' : ''
                              }`}
                              placeholder="your@email.com"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2">
                              <ValidationIndicator status={emailStatus} />
                            </span>
                          </div>
                          {emailStatus === 'invalid' && data.email.length > 0 &&
                            <p className="text-red-500 text-[11px] mt-1">អ៊ីមែលមិនត្រឹមត្រូវ</p>}
                          {errors.email && <p className="text-red-500 text-[11px] mt-1">{errors.email}</p>}
                        </div>

                        {/* Phone */}
                        <div>
                          <label htmlFor="phone" className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                            លេខទូរស័ព្ទ
                          </label>
                          <div className="relative">
                            <input
                              id="phone" name="phone" type="tel"
                              value={data.phone}
                              onChange={e => {
                                const v = e.target.value.replace(/\D/g, '');
                                if (v.length <= 10) setData('phone', v);
                              }}
                              className={`${inputCls} pr-9 ${
                                phoneStatus === 'taken' || phoneStatus === 'invalid' ? 'border-red-300' :
                                phoneStatus === 'valid' ? 'border-emerald-300' : ''
                              }`}
                              placeholder="0XX XXX XXXX"
                              maxLength={10}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2">
                              <ValidationIndicator status={phoneStatus} />
                            </span>
                          </div>
                          {phoneStatus === 'invalid' && data.phone.length > 0 &&
                            <p className="text-red-500 text-[11px] mt-1">លេខទូរស័ព្ទត្រូវមាន 9-10 ខ្ទង់</p>}
                          {errors.phone && <p className="text-red-500 text-[11px] mt-1">{errors.phone}</p>}
                        </div>

                        {/* Farm name */}
                        {isSeller && (
                          <div>
                            <label htmlFor="farm_name" className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                              ឈ្មោះហាង / កសិដ្ឋាន
                            </label>
                            <input
                              id="farm_name" name="farm_name" type="text"
                              value={data.farm_name}
                              onChange={e => setData('farm_name', e.target.value)}
                              className={`${inputCls} ${errors.farm_name ? 'border-red-300' : ''}`}
                              placeholder="ឈ្មោះហាង / កសិដ្ឋានរបស់អ្នក"
                            />
                            {errors.farm_name && <p className="text-red-500 text-[11px] mt-1">{errors.farm_name}</p>}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── STEP 2 — Location ── */}
                  {currentStep === 2 && isSeller && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <h2 className="font-heading text-sm text-gray-800">ព័ត៌មានទីតាំង</h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                            ខេត្ត <span className="text-red-400 normal-case">*</span>
                          </label>
                          <select value={data.province_id} onChange={e => setData('province_id', e.target.value)} className={selectCls}>
                            <option value="">-- ជ្រើសរើសខេត្ត --</option>
                            {provinces.map(p => <option key={p.province_id} value={p.province_id}>{p.name_km}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                            ស្រុក / ក្រុង <span className="text-red-400 normal-case">*</span>
                          </label>
                          <select value={data.district_id} onChange={e => setData('district_id', e.target.value)} disabled={!data.province_id} className={selectCls}>
                            <option value="">-- ជ្រើសរើស --</option>
                            {districts.map(d => <option key={d.district_id} value={d.district_id}>{d.name_km}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                            ឃុំ / សង្កាត់ <span className="text-gray-400 normal-case text-[10px]">(ស្រេចចិត្ត)</span>
                          </label>
                          <select value={data.commune_id} onChange={e => setData('commune_id', e.target.value)} disabled={!data.district_id} className={selectCls}>
                            <option value="">-- ជ្រើសរើស --</option>
                            {communes.map(c => <option key={c.commune_id} value={c.commune_id}>{c.name_km}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                            ភូមិ <span className="text-gray-400 normal-case text-[10px]">(ស្រេចចិត្ត)</span>
                          </label>
                          <select value={data.village_id} onChange={e => setData('village_id', e.target.value)} disabled={!data.commune_id} className={selectCls}>
                            <option value="">-- ជ្រើសរើស --</option>
                            {villages.map(v => <option key={v.village_id} value={v.village_id}>{v.name_km}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                          ពិពណ៌នា <span className="text-gray-400 normal-case text-[10px]">(ស្រេចចិត្ត)</span>
                        </label>
                        <textarea
                          value={data.description}
                          onChange={e => setData('description', e.target.value)}
                          placeholder="ពិពណ៌នាអំពីហាង / កសិដ្ឋានរបស់អ្នក"
                          className={`${inputCls} resize-none`}
                          rows={3}
                        />
                      </div>
                    </div>
                  )}

                  {/* ── STEP 3 — Password ── */}
                  {currentStep === 3 && (
                    <div className="space-y-5 animate-fadeIn">
                      <div className="flex items-center gap-2 mb-1">
                        <Lock className="w-4 h-4 text-emerald-600" />
                        <h2 className="font-heading text-sm text-gray-800">ការកំណត់សុវត្ថិភាព</h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Password */}
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                            ពាក្យសម្ងាត់
                          </label>
                          <div className="relative">
                            <input
                              id="password" name="password"
                              type={showPassword ? 'text' : 'password'}
                              value={data.password}
                              onChange={e => setData('password', e.target.value)}
                              className={inputCls}
                              placeholder="••••••••"
                              autoComplete="new-password"
                            />
                            <button type="button" onClick={() => setShowPassword(p => !p)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
                            {[
                              { ok: data.password.length >= 8,                           txt: 'យ៉ាងតិច 8 តួអក្សរ' },
                              { ok: /[a-z]/.test(data.password),                         txt: 'អក្សរតូច' },
                              { ok: /[A-Z]/.test(data.password),                         txt: 'អក្សរធំ' },
                              { ok: /[\d!@#$%^&*(),.?":{}|<>\s]/.test(data.password),    txt: 'តួលេខ / សញ្ញា' },
                            ].map(({ ok, txt }) => (
                              <div key={txt} className="flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${ok ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                                <span className={`text-[11px] transition-colors ${ok ? 'text-emerald-700' : 'text-gray-500'}`}>{txt}</span>
                              </div>
                            ))}
                          </div>
                          {errors.password && <p className="text-red-500 text-[11px] mt-1">{errors.password}</p>}
                        </div>

                        {/* Confirm + summary */}
                        <div className="flex flex-col gap-3">
                          <div>
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                              បញ្ជាក់ពាក្យសម្ងាត់
                            </label>
                            <input
                              id="password_confirmation" name="password_confirmation"
                              type={showPassword ? 'text' : 'password'}
                              value={data.password_confirmation}
                              onChange={e => setData('password_confirmation', e.target.value)}
                              className={`${inputCls} ${
                                data.password_confirmation
                                  ? data.password === data.password_confirmation
                                    ? 'border-emerald-300 bg-emerald-50/40'
                                    : 'border-red-300'
                                  : ''
                              }`}
                              placeholder="••••••••"
                              autoComplete="new-password"
                            />
                            {data.password_confirmation && data.password !== data.password_confirmation && (
                              <p className="text-red-500 text-[11px] mt-1.5 flex items-center gap-1">
                                <XCircle className="w-3 h-3" /> ពាក្យសម្ងាត់មិនត្រូវគ្នា
                              </p>
                            )}
                            {data.password_confirmation && data.password === data.password_confirmation && (
                              <p className="text-emerald-600 text-[11px] mt-1.5 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> ពាក្យសម្ងាត់ត្រូវគ្នា
                              </p>
                            )}
                          </div>

                          {/* Summary */}
                          <div className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                            <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest mb-2">
                              📋 សង្ខេបការចុះឈ្មោះ
                            </p>
                            <div className="space-y-1.5">
                              {[
                                { icon: '👤', val: data.username  || '—' },
                                { icon: '📧', val: data.email     || '—' },
                                { icon: '📞', val: data.phone     || '—' },
                                ...(isSeller ? [{ icon: '🏪', val: data.farm_name || '—' }] : []),
                              ].map(({ icon, val }) => (
                                <div key={icon} className="flex items-center gap-2">
                                  <span className="text-sm leading-none">{icon}</span>
                                  <span className="text-xs text-gray-700 truncate">{val}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer nav */}
                <div className="flex-shrink-0 pt-4 mt-4 border-t border-gray-100 flex justify-between items-center">
                  <div>
                    {currentStep > 1 && (
                      <button type="button" onClick={handlePrev}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
                        <ChevronLeft className="w-4 h-4" />
                        ត្រឡប់ក្រោយ
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      ជំហាន {displayStep}/{totalDisplaySteps}
                    </span>
                    {!isOnLastStep ? (
                      <button
                        type="button" onClick={handleNext}
                        disabled={(currentStep === 1 && !isStep1Valid()) || (currentStep === 2 && !isStep2Valid())}
                        className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 active:scale-95 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
                      >
                        បន្តទៅមុខ <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={processing || !isStep3Valid() || !isStep1Valid() || (isSeller && !isStep2Valid())}
                        className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 active:scale-95 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm whitespace-nowrap"
                      >
                        {processing
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> កំពុងចុះឈ្មោះ...</>
                          : <><CheckCircle className="w-4 h-4" /> បញ្ចប់ការចុះឈ្មោះ</>
                        }
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* ══════════════ RIGHT — Benefits ══════════════ */}
          <div className="hidden lg:flex lg:w-[38%] bg-gradient-to-b from-emerald-600 via-emerald-700 to-green-800 text-white p-7 flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/5 rounded-full pointer-events-none" />
            <div className="absolute top-32 -left-10 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
            <div className="absolute bottom-20 right-8 w-24 h-24 bg-white/5 rounded-full pointer-events-none" />

            <div className="relative">
              <div className="mb-8">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="bg-white/20 p-1.5 rounded-lg">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <h2 className="font-heading text-base text-white">កសិផលបាត់ដំបង</h2>
                </div>
                <p className="text-white/70 text-sm leading-relaxed">
                  ផ្សារអនឡាញសម្រាប់ផលិតផលស្រស់ៗពីកសិករប្រចាំខេត្ត
                </p>
              </div>

              <div className="space-y-5">
                {[
                  { Icon: Leaf,       title: 'ធម្មជាតិ 100%',         sub: 'ផលិតផលស្រស់ · គ្មានសារធាតុគីមី' },
                  { Icon: Store,      title: 'ទិញផ្ទាល់ពីកសិករ',      sub: 'គ្មានឈ្មួញកណ្ដាល · តម្លៃសមរម្យ' },
                  { Icon: TruckIcon,  title: 'ដឹកជញ្ជូនរហ័ស',         sub: 'ដល់ផ្ទះក្នុងខេត្ត' },
                  { Icon: ShieldIcon, title: 'ការទូទាត់មានសុវត្ថិភាព', sub: 'ប្រព័ន្ធទូទាត់ទំនើប' },
                ].map(({ Icon, title, sub }) => (
                  <div key={title} className="flex items-start gap-3">
                    <div className="bg-white/15 p-2 rounded-lg flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{title}</h4>
                      <p className="text-white/60 text-xs mt-0.5">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative bg-white/10 p-4 rounded-xl border border-white/20 mt-6">
              <p className="text-xs text-white/80 leading-relaxed">
                <span className="font-semibold text-white">💡 ចំណាំ៖</span>{' '}
                អ្នកអាចចូលគណនីបានដោយប្រើ
                <span className="font-semibold"> អ៊ីមែល</span> ឬ
                <span className="font-semibold"> លេខទូរស័ព្ទ</span>
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

/* ── Inline SVG icons ── */
const TruckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
  </svg>
);

const ShieldIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);