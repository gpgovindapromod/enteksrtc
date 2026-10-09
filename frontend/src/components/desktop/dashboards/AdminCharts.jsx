import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { AlertCircle, TrendingUp, Map, Bus, Calendar } from 'lucide-react';
import { getAdminAnalytics } from '../../../services/adminService';

const COLORS = ['#1a7a40', '#f97316', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'];

const AdminCharts = ({ filters }) => {
  const [data, setData] = useState({
    revenueTrends: [],
    bookingStats: [],
    popularRoutes: [],
    fleetUtilization: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getAdminAnalytics({
          startDate: filters.startDate,
          endDate: filters.endDate
        });
        if (res?.success) {
          setData(res.data);
        } else {
          setError(res?.message || 'Failed to load analytics data.');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [filters.startDate, filters.endDate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#1a7a40] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Generating Analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 p-6 rounded-3xl flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
        <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-1">Failed to Load Analytics</h3>
        <p className="text-red-600/80 dark:text-red-400/80">{error}</p>
      </div>
    );
  }

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {/* Top Row: Revenue Trends & Booking Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Trends */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-xl font-bold font-outfit">Revenue Trends</h3>
          </div>
          {data.revenueTrends?.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenueTrends} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1a7a40" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#1a7a40" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} tickMargin={10} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={formatCurrency} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Area type="monotone" dataKey="net" name="Net Revenue" stroke="#1a7a40" strokeWidth={3} fillOpacity={1} fill="url(#colorNet)" />
                  <Area type="monotone" dataKey="gross" name="Gross" stroke="#3b82f6" strokeWidth={2} fillOpacity={0} />
                  <Area type="monotone" dataKey="refunds" name="Refunds" stroke="#ef4444" strokeWidth={2} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400">No revenue data for selected period</div>
          )}
        </div>

        {/* Booking Status Distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500">
              <Calendar size={20} />
            </div>
            <h3 className="text-xl font-bold font-outfit">Booking Status</h3>
          </div>
          {data.bookingStats?.length > 0 ? (
            <div className="h-[300px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.bookingStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.bookingStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        entry.name === 'CONFIRMED' ? '#1a7a40' : 
                        entry.name === 'CANCELLED' ? '#ef4444' : 
                        entry.name === 'PENDING' ? '#f59e0b' : COLORS[index % COLORS.length]
                      } />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div className="h-[300px] flex items-center justify-center text-slate-400">No booking data</div>
          )}
        </div>
      </div>

      {/* Bottom Row: Popular Routes & Fleet Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Popular Routes */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
              <Map size={20} />
            </div>
            <h3 className="text-xl font-bold font-outfit">Popular Routes</h3>
          </div>
          {data.popularRoutes?.length > 0 ? (
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.popularRoutes} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis 
                    type="category" 
                    dataKey="routeName" 
                    width={180} 
                    tickFormatter={(val) => val.length > 25 ? val.substring(0, 25) + '...' : val}
                    tick={{ fill: '#64748b', fontSize: 11 }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                    cursor={{fill: 'rgba(51, 65, 85, 0.1)'}}
                  />
                  <Legend />
                  <Bar dataKey="bookings" name="Bookings" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-slate-400">No route data for selected period</div>
          )}
        </div>

        {/* Fleet Utilization */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500">
              <Bus size={20} />
            </div>
            <h3 className="text-xl font-bold font-outfit">Depot Utilization (Trips)</h3>
          </div>
          {data.fleetUtilization?.length > 0 ? (
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.fleetUtilization} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="depot" tick={{ fill: '#64748b', fontSize: 12 }} tickMargin={10} axisLine={false} tickLine={false} angle={-45} textAnchor="end" height={90} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                    cursor={{fill: 'rgba(51, 65, 85, 0.1)'}}
                  />
                  <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '20px' }} />
                  <Bar dataKey="trips" name="Total Trips" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="activeBuses" name="Active Buses" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-slate-400">No utilization data available</div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminCharts;
