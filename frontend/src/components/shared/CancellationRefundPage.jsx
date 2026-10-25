import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  IndianRupee,
  Loader2,
  RefreshCw,
  WalletCards,
  XCircle,
} from 'lucide-react';
import {
  cancelBooking,
  getCancellationPreview,
  getMyBookings,
  getWallet,
} from '../../services/bookingService';
import { getCancellationEligibility } from '../../utils/cancellationUtils';

const formatMoney = (paise = 0) => `₹${(Number(paise) / 100).toFixed(2)}`;

const getBookingId = (booking) => booking._id || booking.id;

const getBookingTitle = (booking) => {
  const route = booking.tripId?.routeId;
  return route?.routeName || route?.routeNumber || `${booking.boardingStop?.name || 'Origin'} to ${booking.droppingStop?.name || 'Destination'}`;
};

const getDeparture = (booking) => {
  const value = booking.tripId?.departureDate || booking.date;
  if (!value) return 'Departure time unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
};

const CancellationRefundPage = () => {
  const [bookings, setBookings] = useState([]);
  const [previews, setPreviews] = useState({});
  const [wallet, setWallet] = useState({ balancePaise: 0, transactions: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadData = useCallback(async (isRefresh = false) => {
    setError('');
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [bookingResult, walletResult] = await Promise.all([
        getMyBookings(1, 50),
        getWallet(),
      ]);
      const nextBookings = bookingResult.bookings || [];
      setBookings(nextBookings);
      setWallet(walletResult.wallet
        ? { ...walletResult.wallet, transactions: walletResult.transactions || [] }
        : { balancePaise: 0, transactions: [] });

      const previewEntries = await Promise.all(
        nextBookings
          .filter((booking) => booking.bookingStatus !== 'CANCELLED')
          .map(async (booking) => {
            const id = getBookingId(booking);
            try {
              return [id, await getCancellationPreview(id)];
            } catch {
              const fallback = getCancellationEligibility(booking);
              return [id, {
                eligible: fallback.canCancel,
                reason: fallback.message,
                refundAmountPaise: booking.refundAmountPaise || 0,
                cancellationFeePaise: booking.cancellationFeePaise || 0,
              }];
            }
          })
      );
      setPreviews(Object.fromEntries(previewEntries));
    } catch (loadError) {
      setError(loadError?.message || 'Unable to load cancellation and wallet details.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCancel = async (booking) => {
    const id = getBookingId(booking);
    const preview = previews[id];
    if (!preview?.eligible || cancellingId) return;

    const refundText = preview.refundAmountPaise > 0
      ? `${formatMoney(preview.refundAmountPaise)} will be credited to your wallet`
      : 'No refund will be credited';
    if (!window.confirm(`Cancel booking ${booking.bookingNumber || id}?\n\n${refundText}.`)) return;

    setCancellingId(id);
    setError('');
    setNotice('');
    try {
      const result = await cancelBooking(id);
      setNotice(result.message || 'Booking cancelled successfully.');
      await loadData(true);
    } catch (cancelError) {
      setError(cancelError?.message || 'Unable to cancel booking. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  const activeBookings = bookings.filter((booking) => booking.bookingStatus !== 'CANCELLED');
  const cancelledBookings = bookings.filter((booking) => booking.bookingStatus === 'CANCELLED');

  return (
    <div className="min-h-full space-y-6 pb-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-500">Refund centre</p>
          <h1 className="mt-2 text-3xl font-black font-outfit text-slate-900 dark:text-white">Cancellations & Wallet</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            Cancel eligible bookings and track refunds credited to your Ente KSRTC wallet.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadData(true)}
          disabled={loading || refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {notice && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      <section className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white shadow-xl shadow-emerald-500/20 md:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-100">
              <WalletCards size={18} />
              Available wallet balance
            </div>
            <p className="mt-3 text-4xl font-black">{formatMoney(wallet.balancePaise)}</p>
            <p className="mt-2 text-sm text-emerald-100">Refunds are stored securely for your next booking.</p>
          </div>
          <div className="rounded-2xl bg-white/15 p-4 backdrop-blur-sm">
            <IndianRupee size={42} className="text-emerald-100" />
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center py-16 text-emerald-500"><Loader2 size={30} className="animate-spin" /></div>
      ) : (
        <>
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your bookings</h2>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{activeBookings.length} active</span>
            </div>
            {activeBookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">No active bookings available for cancellation.</div>
            ) : activeBookings.map((booking) => {
              const id = getBookingId(booking);
              const preview = previews[id];
              const isCancelling = cancellingId === id;
              return (
                <article key={id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-white">{getBookingTitle(booking)}</h3>
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">{booking.bookingNumber || 'Booking'}</span>
                      </div>
                      <p className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><Clock3 size={15} /> {getDeparture(booking)}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Paid: {formatMoney((booking.farePaise || (booking.totalFare || 0) * 100))}</p>
                    </div>
                    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                      <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-800/70">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Estimated wallet refund</p>
                        <p className="mt-1 font-bold text-emerald-600 dark:text-emerald-400">{preview ? formatMoney(preview.refundAmountPaise) : 'Calculating...'}</p>
                      </div>
                      <button
                        type="button"
                        disabled={!preview?.eligible || isCancelling}
                        onClick={() => handleCancel(booking)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
                      >
                        {isCancelling ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                        {isCancelling ? 'Processing...' : 'Cancel booking'}
                      </button>
                    </div>
                  </div>
                  {preview && !preview.eligible && (
                    <p className="mt-4 flex items-start gap-2 border-t border-slate-100 pt-3 text-xs text-amber-600 dark:border-slate-800 dark:text-amber-400"><AlertCircle size={14} className="mt-0.5 shrink-0" /> {preview.reason}</p>
                  )}
                </article>
              );
            })}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Wallet activity</h2>
            {wallet.transactions.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Refund transactions will appear here after processing.</p>
            ) : (
              <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
                {wallet.transactions.map((transaction) => (
                  <div key={transaction._id || transaction.referenceId} className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{transaction.description}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{new Date(transaction.createdAt).toLocaleString()}</p>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">+{formatMoney(transaction.amountPaise)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {cancelledBookings.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent cancellations</h2>
              {cancelledBookings.slice(0, 10).map((booking) => (
                <div key={getBookingId(booking)} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{booking.bookingNumber || getBookingId(booking)}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{getBookingTitle(booking)}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold">
                    {booking.paymentStatus === 'REFUNDED' ? (
                      <><CheckCircle2 size={15} className="text-emerald-500" /><span className="text-emerald-600 dark:text-emerald-400">{formatMoney(booking.refundAmountPaise)} credited or processed</span></>
                    ) : (
                      <><Clock3 size={15} className="text-amber-500" /><span className="text-amber-600 dark:text-amber-400">Refund processing</span></>
                    )}
                  </div>
                </div>
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default CancellationRefundPage;
