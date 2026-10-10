import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IndianRupee, RefreshCcw, TrendingUp, AlertCircle, FileText, Download } from 'lucide-react';
import { getAdminRevenue, processAdminRefund } from '../../../services/adminService';

const AdminRevenueTab = ({ filters }) => {
  const [revenueData, setRevenueData] = useState([]);
  const [summary, setSummary] = useState({ grossRevenue: 0, netRevenue: 0, totalRefunds: 0, totalPaymentsCount: 0, refundsCount: 0 });
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState(null);
  const [processingRefund, setProcessingRefund] = useState(null);

  const observer = useRef();
  
  const fetchRevenue = useCallback(async (currentCursor = null) => {
    setLoading(true);
    try {
      const res = await getAdminRevenue({ ...filters, cursor: currentCursor });
      if (res?.success) {
        setRevenueData(prev => currentCursor ? [...prev, ...res.data] : res.data);
        setCursor(res.nextCursor);
        setHasMore(res.hasMore);
        if (res.summary) setSummary(res.summary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);
  const lastElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchRevenue(cursor);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, cursor, fetchRevenue]);

  // Re-fetch when filters change
  useEffect(() => {
    setRevenueData([]);
    setCursor(null);
    setHasMore(true);
    fetchRevenue(null);
  }, [filters.startDate, filters.endDate, filters.paymentStatus, filters.search, fetchRevenue]);

  const handleRefund = async (paymentId) => {
    if (!window.confirm("Are you sure you want to process a full refund for this payment?")) return;
    
    setProcessingRefund(paymentId);
    try {
      const res = await processAdminRefund(paymentId);
      if (res?.success) {
        alert("Refund processed successfully.");
        // Re-fetch to update summary and status
        setRevenueData([]);
        fetchRevenue(null);
      } else if (res?.message) {
        alert(res.message);
      }
    } catch (err) {
      alert(err.message || 'An error occurred while processing refund.');
    } finally {
      setProcessingRefund(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500">
              <TrendingUp size={20} />
            </div>
            <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gross Payments</h4>
          </div>
          <p className="text-3xl font-bold font-outfit text-slate-900 dark:text-white">{formatCurrency(summary.grossRevenue)}</p>
          <p className="text-sm text-slate-500 mt-1">{summary.totalPaymentsCount} successful txns</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
              <RefreshCcw size={20} />
            </div>
            <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Refunds</h4>
          </div>
          <p className="text-3xl font-bold font-outfit text-slate-900 dark:text-white">{formatCurrency(summary.totalRefunds)}</p>
          <p className="text-sm text-slate-500 mt-1">{summary.refundsCount} processed refunds</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm bg-gradient-to-br from-[#1a7a40]/5 to-transparent">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#1a7a40]/10 rounded-xl flex items-center justify-center text-[#1a7a40]">
              <IndianRupee size={20} />
            </div>
            <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Net Revenue</h4>
          </div>
          <p className="text-3xl font-bold font-outfit text-[#1a7a40]">{formatCurrency(summary.netRevenue)}</p>
          <p className="text-sm text-slate-500 mt-1">Realized income</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
              <FileText size={20} />
            </div>
            <h3 className="text-xl font-bold font-outfit">Transaction History</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="p-4 font-bold">Transaction / Booking</th>
                <th className="p-4 font-bold">Passenger</th>
                <th className="p-4 font-bold">Amount</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {revenueData?.length > 0 ? (
                revenueData.map((payment, idx) => {
                  const isLast = revenueData.length === idx + 1;
                  const isSuccess = payment.paymentStatus === 'SUCCESS';
                  const isRefunded = payment.refundStatus === 'PROCESSED';
                  return (
                    <tr 
                      key={payment._id} 
                      ref={isLast ? lastElementRef : null}
                      className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="p-4">
                        <p className="font-mono text-slate-900 dark:text-white font-medium">{payment.transactionId || 'N/A'}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Booking: <span className="text-blue-500">{payment.bookingId?.bookingNumber || 'Unknown'}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">{new Date(payment.createdAt).toLocaleString()}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900 dark:text-white">{payment.bookingId?.passengerId?.fullName || 'N/A'}</p>
                        <p className="text-xs text-slate-500">{payment.bookingId?.passengerId?.phone || 'N/A'}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900 dark:text-white">{formatCurrency(payment.amount)}</p>
                        {isRefunded && (
                          <p className="text-[10px] text-orange-500 font-bold uppercase mt-1">Refunded: {formatCurrency(payment.refundAmount)}</p>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          isSuccess ? 'bg-[#1a7a40]/10 text-[#1a7a40]' : 
                          payment.paymentStatus === 'FAILED' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'
                        }`}>
                          {payment.paymentStatus}
                        </span>
                        {isRefunded && (
                          <span className="ml-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-orange-500/10 text-orange-500">
                            REFUND PROCESSED
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {isSuccess && !isRefunded && (
                          <button 
                            onClick={() => handleRefund(payment._id)} 
                            disabled={processingRefund === payment._id}
                            className="text-orange-500 hover:text-orange-700 text-sm font-medium border border-orange-500/30 px-3 py-1 rounded-lg hover:bg-orange-500/10 transition-colors disabled:opacity-50"
                          >
                            {processingRefund === payment._id ? 'Processing...' : 'Issue Refund'}
                          </button>
                        )}
                        {isRefunded && (
                          <span className="text-slate-400 text-xs font-medium">No Actions</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : !loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle size={40} className="text-slate-300 mb-3" />
                      <p>No transactions found for the selected filters.</p>
                    </div>
                  </td>
                </tr>
              ) : null}
              {loading && (
                <tr>
                  <td colSpan="5" className="p-8 text-center">
                    <div className="w-8 h-8 border-4 border-[#1a7a40] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-xs text-slate-500 mt-2">Loading transactions...</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminRevenueTab;
