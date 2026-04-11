import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Head, router, usePage } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';
import { Package, CreditCard, AlertTriangle, X, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/pages/header';
import { Footer } from '@/pages/customer/footer-customer';

interface User {
    user_id: number;
    username: string;
    email: string;
    phone?: string;
    address?: string;
}

interface OrderItem {
  item_id: number; product_id: number; product_name: string;
  product_image: string | null; unit: string; quantity: number; price_per_unit: number;
}
interface Order {
  order_id: number; order_number: string; user_id: number;
  status: 'confirmed' | 'processing' | 'completed' | 'cancelled';
  recipient_name: string; recipient_phone: string; shipping_address: string;
  total_amount: number; payment_method: 'KHQR' | 'manual(cash)';
  payment_status: 'unpaid' | 'paid'; paid_at: string | null;
  customer_notes: string | null; cancelled_at: string | null;
  cancelled_by: 'customer' | 'seller' | 'system' | null;
  cancellation_reason: string | null; created_at: string; updated_at: string;
  items?: OrderItem[];
}
interface PaginatedOrders {
  data: Order[]; current_page: number; last_page: number; per_page: number; total: number;
}

const CustomerOrderList: React.FC = () => {
  const page = usePage<any>();
  const user = page.props.auth?.user ?? null;
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const [modalOpen,      setModalOpen]      = useState(false);
  const [modalPhase,     setModalPhase]     = useState<'polling'|'success'>('polling');
  const [modalMerchant,  setModalMerchant]  = useState('');
  const [modalAmount,    setModalAmount]    = useState(0);
  const [modalQrString,  setModalQrString]  = useState('');
  const [modalCountdown, setModalCountdown] = useState(0);
  const [modalMsg,       setModalMsg]       = useState('');

  const $ = useRef({
    orderId: 0, running: false, netErrors: 0,
    pollTimer: null as ReturnType<typeof setInterval> | null,
    cdTimer:   null as ReturnType<typeof setInterval> | null,
  });

  useEffect(() => { fetchOrders(); return () => killAll(); }, []);

  const killAll = () => {
    $.current.running = false;
    if ($.current.pollTimer) { clearInterval($.current.pollTimer); $.current.pollTimer = null; }
    if ($.current.cdTimer)   { clearInterval($.current.cdTimer);   $.current.cdTimer   = null; }
  };

  const closeModal = () => {
    killAll();
    $.current.orderId = 0; $.current.netErrors = 0;
    setModalOpen(false); setModalPhase('polling'); setModalCountdown(0); setModalMsg('');
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get<PaginatedOrders | Order[]>('/customer/orders');
      const data = 'data' in res.data ? res.data.data : res.data;
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) { console.error('fetchOrders:', e); }
    finally { setLoading(false); }
  };

  const pollTick = async () => {
    if (!$.current.running) return;
    const orderId = $.current.orderId;
    if (!orderId) return;

    try {
      const res = await axios.post(`/customer/orders/${orderId}/khqr/verify`, {},
        { validateStatus: () => true, timeout: 90000 }); // give backend up to 90s

      if (!$.current.running) return;

      const status: string = res.data?.status ?? '';
      const msg: string    = res.data?.message ?? '';

      console.log('[KHQR]', { orderId, http: res.status, status, msg });

      if (res.status === 401 || res.status === 403) { killAll(); return; }

      // successful HTTP call resets error counter
      $.current.netErrors = 0;

      if (status === 'paid') {
        killAll(); setModalPhase('success'); setModalMsg('');
        setTimeout(() => {
          closeModal();
          toast.success('✅ ការទូទាត់ជោគជ័យ! សូមអរគុណសម្រាប់ការបញ្ជាទិញរបស់អ្នក។');
          fetchOrders();
        }, 2000);
      } else if (status === 'expired') {
        closeModal(); toast.error('⏱️ QR កូដបានផុតកំណត់។ សូមបង្កើតថ្មី។');
      } else if (status === 'error') {
        setModalMsg(msg || 'មានបញ្ហាក្នុងការផ្ទៀងផ្ទាត់');
      } else {
        setModalMsg('');
      }

    } catch (netErr: any) {
      if (!$.current.running) return;
      const isTimeout = netErr.code === 'ECONNABORTED' || netErr.message?.includes('timeout');
      if (!isTimeout) {
        $.current.netErrors += 1;
      }
      console.warn('[KHQR] net error #' + $.current.netErrors, netErr?.message);

      if ($.current.netErrors >= 10) {
        closeModal(); toast.error('❌ មិនអាចភ្ជាប់បណ្តាញ។ សូមព្យាយាមម្តងទៀត។');
      } else {
        setModalMsg(`ការភ្ជាប់មានបញ្ហា (${$.current.netErrors}/10) កំពុងព្យាយាម...`);
      }
    }
  };

  const handleGenerateKHQR = async (order: Order) => {
    try {
      const res = await axios.post(`/customer/orders/${order.order_id}/khqr/generate`);
      if (!res.data.success) {
        toast.error(res.data.message || 'មានបញ្ហាក្នុងការបង្កើត QR កូដ');
        return;
      }

      const { qr_string, amount, server_time, duration, merchant_name } = res.data;
      const clientServerTimeDiff = Math.floor(Date.now() / 1000) - server_time;

      killAll();
      $.current.orderId = order.order_id; $.current.netErrors = 0; $.current.running = true;

      setModalMerchant(merchant_name); setModalAmount(amount); setModalQrString(qr_string);
      setModalPhase('polling'); setModalMsg(''); setModalOpen(true);

      const cdTick = () => {
        const clientNow = Math.floor(Date.now() / 1000);
        const elapsedOnClient = clientNow - server_time - clientServerTimeDiff;
        const rem = Math.max(0, duration - elapsedOnClient - 15); // 15-second safety buffer
        setModalCountdown(rem);
        if (rem <= 0) { closeModal(); toast.error('⏱️ QR កូដបានផុតកំណត់ សូមបង្កើតថ្មី'); }
      };
      cdTick(); $.current.cdTimer = setInterval(cdTick, 1000);

      pollTick(); $.current.pollTimer = setInterval(pollTick, 5000);

    } catch (err: any) {
      toast.error(err.response?.data?.message || 'មិនអាចបង្កើត QR កូដបានទេ');
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelTarget) return;
    try {
      await axios.post(`/customer/orders/${cancelTarget.order_id}/cancel`, {
        reason: cancelReason.trim() || 'មិនមានហេតុផលបញ្ជាក់',
      });
      toast.success('✅ បានលុបចោលការបញ្ជាទិញជោគជ័យ');
      setCancelTarget(null); setCancelReason(''); fetchOrders();
    } catch (err: any) {
      toast.error('❌ ' + (err.response?.data?.message || 'មិនអាចលុបចោលការបញ្ជាទិញបានទេ'));
    }
  };

  const fmt$ = (n: number) => Math.floor(n).toLocaleString('km-KH') + ' ៛';
  const fmtDate = (s: string) => new Date(s).toLocaleString('km-KH', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });

  const statusBadge = (s: Order['status']) => {
    const cls = { confirmed:'bg-blue-100 text-blue-800 border-blue-300', processing:'bg-yellow-100 text-yellow-800 border-yellow-300', completed:'bg-green-100 text-green-800 border-green-300', cancelled:'bg-red-100 text-red-800 border-red-300' }[s];
    const lbl = { confirmed:'បានបញ្ជាក់', processing:'កំពុងដំណើរការ', completed:'បានបញ្ចប់', cancelled:'បានលុបចោល' }[s];
    return <span className={`px-3 py-1 rounded-full text-xs font-medium border ${cls}`}>{lbl}</span>;
  };
  const payBadge = (ps: Order['payment_status'], pm: Order['payment_method']) => {
    if (ps === 'paid') return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">✅ បានទូទាត់</span>;
    if (pm === 'KHQR') return <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-300">💳 KHQR - មិនទាន់ទូទាត់</span>;
    return <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-300">💵 សាច់ប្រាក់ - មិនទាន់ទូទាត់</span>;
  };

  const cdMins = Math.floor(modalCountdown / 60);
  const cdSecs = (modalCountdown % 60).toString().padStart(2, '0');
  const nearExpiry = modalCountdown > 0 && modalCountdown <= 60;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto mb-4" />
        <p className="text-gray-600">កំពុងផ្ទុកការបញ្ជាទិញ...</p>
      </div>
    </div>
  );

  return (
    <>
      <Head title="ការបញ្ជាទិញរបស់ខ្ញុំ" />
      <Header
        cartCount={0}
        wishlistCount={0}
        searchQuery=""
        onSearchChange={() => {}}
        isAuthenticated={!!user}
        userName={user?.username ?? ''}
      />
      <div className="container mx-auto mt-50 px-4 py-8 max-w-5xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 font-moul text-gray-800">ការបញ្ជាទិញរបស់ខ្ញុំ</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <Package size={64} className="mx-auto text-gray-300 mb-6" />
            <h2 className="text-xl font-semibold text-gray-700 mb-3">អ្នកមិនទាន់មានការបញ្ជាទិញនៅឡើយទេ</h2>
            <p className="text-gray-600 mb-6">នៅពេលអ្នកធ្វើការបញ្ជាទិញ វានឹងបង្ហាញនៅទីនេះ</p>
            <button onClick={() => router.visit('/')} className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition">
              បន្តទិញទំនិញ
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.order_id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-bold text-lg text-gray-800">#{order.order_number}</h3>
                      {statusBadge(order.status)}
                      {payBadge(order.payment_status, order.payment_method)}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{fmtDate(order.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">សរុប</p>
                    <p className="text-xl font-bold text-green-700">{fmt$(order.total_amount)}</p>
                  </div>
                </div>
                <div className="px-6 py-5">
                  {order.items?.map(item => (
                    <div key={item.item_id} className="flex gap-4 mb-4 pb-4 border-b last:border-b-0 last:mb-0">
                      <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        <img src={item.product_image || '/images/placeholder-product.jpg'} alt={item.product_name}
                          className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).src = '/images/placeholder-product.jpg'; }} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{item.product_name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{item.quantity} {item.unit} × {fmt$(item.price_per_unit)}</p>
                      </div>
                      <div className="text-right font-medium text-gray-800">{fmt$(item.quantity * item.price_per_unit)}</div>
                    </div>
                  ))}
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-gray-600">
                    វិធីសាស្ត្រទូទាត់: <span className="font-medium text-gray-800 ml-1">
                      {order.payment_method === 'KHQR' ? '💳 KHQR / ផ្ទេរប្រាក់' : '💵 សាច់ប្រាក់ពេលទទួល'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {(order.status === 'confirmed' || order.status === 'processing') && (
                      <button onClick={() => { setCancelTarget(order); setCancelReason(''); }}
                        className="px-5 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition">
                        ❌ លុបចោលការបញ្ជាទិញ
                      </button>
                    )}
                    {order.status === 'completed' && order.payment_status === 'unpaid' && order.payment_method === 'KHQR' && (
                      <button onClick={() => handleGenerateKHQR(order)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium">
                        <CreditCard size={18} /> 💳 ទូទាត់ជាមួយ KHQR
                      </button>
                    )}
                    {order.status === 'completed' && order.payment_status === 'unpaid' && order.payment_method === 'manual(cash)' && (
                      <div className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg">⏳ រង់ចាំទូទាត់សាច់ប្រាក់ពេលទទួល</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {cancelTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-5">
              <AlertTriangle className="text-red-600 mt-1 flex-shrink-0" size={28} />
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">តើអ្នកប្រាកដជាចង់លុបចោលការបញ្ជាទិញនេះមែនទេ?</h3>
                <p className="text-gray-600">#{cancelTarget.order_number} — {fmt$(cancelTarget.total_amount)}</p>
              </div>
            </div>
            <textarea className="w-full border border-gray-300 rounded-lg p-3 mb-6 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-red-200"
              placeholder="សូមបញ្ជាក់ហេតុផល (មិនចាំបាច់)" value={cancelReason}
              onChange={e => setCancelReason(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={() => setCancelTarget(null)} className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                បោះបង់
              </button>
              <button onClick={handleCancelOrder} className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                បាទ/ចាស លុបចោល
              </button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="w-[280px] rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-[#D0021B] px-5 pt-4 pb-3 relative flex items-center gap-2.5">
              {modalPhase !== 'success' && (
                <button onClick={closeModal} className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors" aria-label="Close">
                  <X size={18} />
                </button>
              )}

              <span className="text-white font-extrabold text-xl tracking-widest">KHQR</span>
            </div>
            <div className="bg-white px-5 py-4">
              <div className="text-center mb-3">
                <p className="text-gray-500 text-sm font-medium truncate">{modalMerchant}</p>
                <p className="text-gray-900 font-bold text-2xl mt-0.5 tabular-nums">
                  {modalAmount.toLocaleString()} KHR
                </p>
              </div>
              <div className="border-t border-dashed border-gray-300 my-3" />
              <div className="flex justify-center py-1">
                {modalPhase === 'success' ? (
                  <div className="flex flex-col items-center gap-2 py-8">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle size={52} className="text-green-500" />
                    </div>
                    <p className="text-green-700 font-bold text-base mt-2">ការទូទាត់ជោគជ័យ!</p>
                    <p className="text-gray-400 text-xs">កំពុងបិទ...</p>
                  </div>
                ) : (
                  <div className="relative inline-block">
                    <QRCodeSVG value={modalQrString} size={200} level="H" includeMargin={false} />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-12 h-12 flex items-center justify-center bg-white rounded-md shadow-md p-1">
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNfSKZQysxnHmvSncjDN9ImDloJ3pO590Rjw&s"
                             alt="KHQR" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {modalPhase !== 'success' && (
                <div className="mt-3 text-center space-y-1.5">
                  <p className={`text-sm font-semibold tabular-nums ${nearExpiry ? 'text-red-600' : 'text-gray-400'}`}>
                    {modalCountdown > 0 ? `⏱ ${cdMins}:${cdSecs}` : 'ផុតកំណត់'}
                  </p>
                  {!modalMsg && (
                    <div className="flex items-center justify-center gap-1.5 text-gray-400 text-xs">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}}/>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'160ms'}}/>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'320ms'}}/>
                      <span className="ml-1">កំពុងផ្ទៀងផ្ទាត់...</span>
                    </div>
                  )}
                  {modalMsg && <p className="text-xs text-amber-600 px-2 leading-snug">⚠️ {modalMsg}</p>}
                </div>
              )}
            </div>
            <div className="bg-[#D0021B] h-1.5" />
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default CustomerOrderList;
