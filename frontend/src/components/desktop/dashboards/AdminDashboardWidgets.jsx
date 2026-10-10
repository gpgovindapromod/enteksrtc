import React, { useState, useEffect, useRef, useCallback, Suspense, lazy, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Users, Bus, TrendingUp, Calendar, CreditCard, ChevronRight, MapPin, Building2, UserCircle, Search, Filter, X } from 'lucide-react';
import { getAdminBookings, getAdminActivity, getAdminFleet, getAdminUsers, addAdminFleet, editAdminFleet, deleteAdminFleet, addAdminUser, editAdminUser, deleteAdminUser, toggleUserStatus, addAdminStation, editAdminStation, deleteAdminStation, toggleStationStatus } from '../../../services/adminService';

// Lazy load the charts component
const AdminCharts = lazy(() => import('./AdminCharts'));
const AdminRevenueTab = lazy(() => import('./AdminRevenueTab'));

const AdminDashboardWidgets = ({ data, loading, activeTab, filters, setFilters }) => {
  const [fleetData, setFleetData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [isFetchingSubTab, setIsFetchingSubTab] = useState(false);

  // Modals state
  const [showBusModal, setShowBusModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDepot, setSelectedDepot] = useState('ALL');
  const [showStationModal, setShowStationModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingBus, setEditingBus] = useState(null);
  const [editingStation, setEditingStation] = useState(null);
  const [selectedRole, setSelectedRole] = useState('ALL');
  
  const [busForm, setBusForm] = useState({ busNumber: '', registrationNumber: '', busType: 'Standard', capacity: 40, depotId: '' });
  const [userForm, setUserForm] = useState({ firstName: '', lastName: '', email: '', phone: '', role: 'USER', password: '', depotId: '' });
  const [stationForm, setStationForm] = useState({ depotCode: '', depotName: '', address: '', city: '', district: '', pincode: '', phone: '', email: '', totalPlatforms: 1 });
  
  const [localStations, setLocalStations] = useState([]);
  const [expandedStation, setExpandedStation] = useState(null);
  const [expandedBus, setExpandedBus] = useState(null);

  useEffect(() => {
    if (data?.stationsData) {
      setLocalStations(data.stationsData);
    }
  }, [data?.stationsData]);

  // Infinite Scroll State for Bookings
  const [bookings, setBookings] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  
  const observer = useRef();
  
  const fetchBookings = useCallback(async (cursor = null) => {
    setIsLoadingBookings(true);
    try {
      const res = await getAdminBookings({ ...filters, cursor });
      if (res?.success) {
        setBookings(prev => cursor ? [...prev, ...res.data] : res.data);
        setNextCursor(res.nextCursor);
        setHasMore(res.hasMore);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingBookings(false);
    }
  }, [filters]);
  const lastBookingElementRef = useCallback(node => {
    if (isLoadingBookings) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchBookings(nextCursor);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoadingBookings, hasMore, nextCursor, fetchBookings]);

  const groupedBookings = useMemo(() => {
    const groups = {};
    bookings?.forEach(booking => {
      const station = booking.tripId?.routeId?.sourceStop?.stopName || 'Unknown Station';
      const bus = booking.tripId?.busId?.busNumber || 'Unknown Bus';
      
      if (!groups[station]) groups[station] = {};
      if (!groups[station][bus]) groups[station][bus] = [];
      
      groups[station][bus].push(booking);
    });
    return groups;
  }, [bookings]);

  // Infinite Scroll State for Activity
  const [activities, setActivities] = useState([]);
  const [activityCursor, setActivityCursor] = useState(null);
  const [hasMoreActivity, setHasMoreActivity] = useState(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);
  
  const activityObserver = useRef();
  
  const fetchActivity = useCallback(async (cursor = null) => {
    setIsLoadingActivity(true);
    try {
      const res = await getAdminActivity({ ...filters, cursor });
      if (res?.success) {
        setActivities(prev => cursor ? [...prev, ...res.data] : res.data);
        setActivityCursor(res.nextCursor);
        setHasMoreActivity(res.hasMore);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingActivity(false);
    }
  }, [filters]);
  const lastActivityElementRef = useCallback(node => {
    if (isLoadingActivity) return;
    if (activityObserver.current) activityObserver.current.disconnect();
    activityObserver.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMoreActivity) {
        fetchActivity(activityCursor);
      }
    });
    if (node) activityObserver.current.observe(node);
  }, [isLoadingActivity, hasMoreActivity, activityCursor, fetchActivity]);

  // Debounce search input
  const [searchInput, setSearchInput] = useState(filters?.search || '');
  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters?.search !== searchInput) {
        setFilters(prev => ({ ...prev, search: searchInput }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, setFilters, filters?.search]);

  // Reset cursors and re-fetch when filters change
  useEffect(() => {
    if (activeTab === 'Overview' || activeTab === 'Bookings') {
      fetchBookings(null);
      fetchActivity(null);
    }
  }, [filters, activeTab, fetchBookings, fetchActivity]);

  useEffect(() => {
    const fetchTabData = async () => {
      setIsFetchingSubTab(true);
      try {
        if (activeTab === 'Fleet') {
          const res = await getAdminFleet();
          if (res?.success) setFleetData(res.data);
        } else if (activeTab === 'Users') {
          const res = await getAdminUsers();
          if (res?.success) setUsersData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsFetchingSubTab(false);
      }
    };
    fetchTabData();
  }, [activeTab]);

  const openAddBusModal = () => {
    setEditingBus(null);
    setBusForm({ busNumber: '', registrationNumber: '', busType: 'Standard', capacity: 40, depotId: '' });
    setShowBusModal(true);
  };

  const openEditBusModal = (bus) => {
    setEditingBus(bus._id);
    setBusForm({ 
      busNumber: bus.busNumber, 
      registrationNumber: bus.registrationNumber, 
      busType: bus.busType, 
      capacity: bus.capacity, 
      depotId: bus.depotId?._id || bus.depotId 
    });
    setShowBusModal(true);
  };

  const handleAddOrEditBus = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingBus) {
        const res = await editAdminFleet(editingBus, busForm);
        if (res?.success) {
          setFleetData(prev => prev.map(b => b._id === editingBus ? res.data : b));
          setShowBusModal(false);
        }
      } else {
        const res = await addAdminFleet(busForm);
        if (res?.success) {
          setFleetData(prev => [res.data, ...prev]);
          setShowBusModal(false);
        }
      }
    } catch (err) {
      alert(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBus = async (busId) => {
    if (!window.confirm("Are you sure you want to delete this bus?")) return;
    try {
      const res = await deleteAdminFleet(busId);
      if (res?.success) {
        setFleetData(prev => prev.filter(b => b._id !== busId));
      }
    } catch (err) {
      alert(err.message || 'An error occurred while deleting the bus.');
    }
  };

  const openAddUserModal = () => {
    setEditingUser(null);
    setUserForm({ firstName: '', lastName: '', email: '', phone: '', role: 'USER', password: '', depotId: '' });
    setShowUserModal(true);
  };

  const openEditUserModal = (user) => {
    setEditingUser(user._id);
    setUserForm({ 
      firstName: user.firstName || user.fullName?.split(' ')[0] || '', 
      lastName: user.lastName || user.fullName?.split(' ').slice(1).join(' ') || '', 
      email: user.email, 
      phone: user.phone, 
      role: user.role, 
      password: '',
      depotId: user.depotId?._id || user.depotId || ''
    });
    setShowUserModal(true);
  };

  const handleAddOrEditUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingUser) {
        const res = await editAdminUser(editingUser, userForm);
        if (res?.success) {
          setUsersData(prev => prev.map(u => u._id === editingUser ? res.data : u));
          setShowUserModal(false);
        }
      } else {
        const res = await addAdminUser(userForm);
        if (res?.success) {
          setUsersData(prev => [res.data, ...prev]);
          setShowUserModal(false);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await deleteAdminUser(userId);
      if (res?.success) {
        setUsersData(prev => prev.filter(u => u._id !== userId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      const res = await toggleUserStatus(userId);
      if (res?.success) {
        setUsersData(prev => prev.map(u => u._id === userId ? { ...u, isActive: res.data.isActive } : u));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openAddStationModal = () => {
    setEditingStation(null);
    setStationForm({ depotCode: '', depotName: '', address: '', city: '', district: '', pincode: '', phone: '', email: '', totalPlatforms: 1 });
    setShowStationModal(true);
  };

  const openEditStationModal = (station) => {
    setEditingStation(station._id);
    setStationForm({ 
      depotCode: station.depotCode, 
      depotName: station.depotName, 
      address: station.address, 
      city: station.city, 
      district: station.district, 
      pincode: station.pincode, 
      phone: station.phone, 
      email: station.email, 
      totalPlatforms: station.totalPlatforms 
    });
    setShowStationModal(true);
  };

  const handleAddOrEditStation = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingStation) {
        const res = await editAdminStation(editingStation, stationForm);
        if (res?.success) {
          setLocalStations(prev => prev.map(s => s._id === editingStation ? res.data : s));
          setShowStationModal(false);
        }
      } else {
        const res = await addAdminStation(stationForm);
        if (res?.success) {
          setLocalStations(prev => [res.data, ...prev]);
          setShowStationModal(false);
        }
      }
    } catch (err) {
      alert(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStation = async (stationId) => {
    if (!window.confirm("Are you sure you want to delete this station?")) return;
    try {
      const res = await deleteAdminStation(stationId);
      if (res?.success) {
        setLocalStations(prev => prev.filter(s => s._id !== stationId));
      }
    } catch (err) {
      alert(err.message || 'An error occurred while deleting the station.');
    }
  };

  const handleToggleStationStatus = async (stationId) => {
    try {
      const res = await toggleStationStatus(stationId);
      if (res?.success) {
        setLocalStations(prev => prev.map(s => s._id === stationId ? { ...s, isActive: res.data.isActive } : s));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({ ...prev, [name]: type === 'checkbox' ? (checked ? 'true' : '') : value }));
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-[#1a7a40] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Loading Dashboard Metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Show Filter Toolbar for Overview, Revenue, Bookings, Activity */}
      {['Overview', 'Revenue', 'Bookings'].includes(activeTab) && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 w-full md:w-auto relative">
            <Search className="absolute left-3 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search bookings..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a40]/50"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
              <input
                type="checkbox"
                id="isUpcoming"
                name="isUpcoming"
                checked={filters?.isUpcoming === 'true'}
                onChange={handleFilterChange}
                className="w-4 h-4 text-[#1a7a40] rounded border-slate-300 focus:ring-[#1a7a40]"
              />
              <label htmlFor="isUpcoming" className="text-sm font-medium text-slate-700 dark:text-slate-300">Upcoming</label>
            </div>
            
            <select
              name="busId"
              value={filters?.busId || ''}
              onChange={handleFilterChange}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none max-w-[150px]"
            >
              <option value="">All Buses</option>
              {data?.activeBusesList?.map(bus => (
                <option key={bus._id} value={bus._id}>{bus.busNumber}</option>
              ))}
            </select>

            <input 
              type="date" 
              name="startDate"
              value={filters?.startDate || ''}
              onChange={handleFilterChange}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none"
            />
            <span className="text-slate-400 text-sm">to</span>
            <input 
              type="date" 
              name="endDate"
              value={filters?.endDate || ''}
              onChange={handleFilterChange}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none"
            />
            <select 
              name="bookingStatus" 
              value={filters?.bookingStatus || ''} 
              onChange={handleFilterChange}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PENDING">Pending</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <button 
              onClick={() => setFilters({ startDate: '', endDate: '', bookingStatus: '', paymentStatus: '', search: '', busId: '', isUpcoming: '' })}
              className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Overview & Revenue: Top Stats Grid */}
      {['Overview', 'Revenue'].includes(activeTab) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-[#1a7a40]">
                <TrendingUp size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold font-outfit text-slate-900 dark:text-white">₹{data?.totalRevenue?.toLocaleString() || 0}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Realized Revenue</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500">
                <Users size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold font-outfit text-slate-900 dark:text-white">
              {data?.totalUsers?.toLocaleString() || 0} 
              <span className="text-sm font-normal text-slate-500 ml-2">({data?.totalPassengers || 0} Pax)</span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Total Users</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
                <Bus size={24} />
              </div>
              <span className="w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm animate-pulse"></span>
            </div>
            <p className="text-3xl font-bold font-outfit text-slate-900 dark:text-white">{data?.activeBuses || 0} / {data?.totalBuses || 0}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Active / Total Fleet</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                <CreditCard size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold font-outfit text-slate-900 dark:text-white">{data?.totalBookings || 0}</p>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1 flex gap-2">
              <span className="text-[#1a7a40]">{data?.bookingStatusBreakdown?.CONFIRMED || 0} C</span>
              <span className="text-red-500">{data?.bookingStatusBreakdown?.CANCELLED || 0} X</span>
            </div>
          </div>
        </div>
      )}

      {/* Overview Tab: Charts */}
      {activeTab === 'Overview' && (
        <Suspense fallback={
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm text-center animate-pulse h-[350px] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-[#1a7a40] border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          <AdminCharts filters={filters} />
        </Suspense>
      )}

      {/* Overview Tab: Bookings and Activity Tables */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold font-outfit">{filters?.isUpcoming === 'true' ? 'Upcoming Bookings' : 'Recent Bookings'} & Reservations</h3>
            </div>
            <div className="p-4">
              {Object.keys(groupedBookings).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(groupedBookings).map(([station, buses]) => (
                    <div key={station} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                      <button 
                        onClick={() => {
                          setExpandedStation(expandedStation === station ? null : station);
                          setExpandedBus(null);
                        }}
                        className="w-full flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Building2 size={20} className="text-[#1a7a40]" />
                          <span className="font-bold text-slate-900 dark:text-white">{station}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs bg-[#1a7a40]/10 text-[#1a7a40] px-3 py-1 rounded-full font-bold">{Object.keys(buses).length} Buses</span>
                          <ChevronRight size={20} className={`text-slate-400 transition-transform ${expandedStation === station ? 'rotate-90' : ''}`} />
                        </div>
                      </button>
                      
                      {expandedStation === station && (
                        <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-4 space-y-4">
                          {Object.entries(buses).map(([bus, busBookings]) => (
                            <div key={bus} className="border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm">
                              <button 
                                onClick={() => setExpandedBus(expandedBus === bus ? null : bus)}
                                className="w-full flex justify-between items-center p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <Bus size={18} className="text-orange-500" />
                                  <span className="font-bold text-slate-800 dark:text-slate-200">{bus}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="text-xs bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full font-bold">{busBookings.length} Passengers</span>
                                  <ChevronRight size={18} className={`text-slate-400 transition-transform ${expandedBus === bus ? 'rotate-90' : ''}`} />
                                </div>
                              </button>
                              
                              {expandedBus === bus && (
                                <div className="overflow-x-auto border-t border-slate-100 dark:border-slate-800">
                                  <table className="w-full text-left border-collapse">
                                    <thead>
                                      <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                                        <th className="p-3 font-bold">Booking ID</th>
                                        <th className="p-3 font-bold">Passenger</th>
                                        <th className="p-3 font-bold">Destination</th>
                                        <th className="p-3 font-bold">Status</th>
                                        <th className="p-3 font-bold text-right">Fare</th>
                                      </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                      {busBookings.map(booking => (
                                        <tr key={booking._id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                          <td className="p-3 font-mono font-medium text-slate-900 dark:text-white text-xs">{booking.bookingNumber}</td>
                                          <td className="p-3">
                                            <p className="font-bold text-slate-900 dark:text-white text-xs">{booking.passengerId?.fullName || 'Guest'}</p>
                                            <p className="text-[10px] text-slate-500">{booking.passengerId?.phone || 'N/A'}</p>
                                          </td>
                                          <td className="p-3 font-medium text-slate-900 dark:text-white text-xs">
                                            {booking.tripId?.routeId?.destinationStop?.stopName || 'Unknown'}
                                          </td>
                                          <td className="p-3">
                                            <span className={`text-[10px] font-bold uppercase tracking-widest ${booking.bookingStatus === 'CONFIRMED' ? 'text-[#1a7a40]' : booking.bookingStatus === 'CANCELLED' ? 'text-red-500' : 'text-orange-500'}`}>
                                              {booking.bookingStatus}
                                            </span>
                                          </td>
                                          <td className="p-3 font-bold text-[#1a7a40] text-right text-xs">
                                            ₹{booking.totalFare}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isLoadingBookings && (
                    <div className="p-8 text-center">
                      <div className="w-8 h-8 border-4 border-[#1a7a40] border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-xs text-slate-500 mt-2">Loading more bookings...</p>
                    </div>
                  )}
                  {hasMore && !isLoadingBookings && (
                    <div ref={lastBookingElementRef} className="h-10 flex items-center justify-center text-xs text-slate-400">Scroll for more</div>
                  )}
                </div>
              ) : !isLoadingBookings ? (
                <div className="p-8 text-center text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                  No bookings found matching filters.
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-4 border-[#1a7a40] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-slate-500 mt-2">Loading...</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold font-outfit">Operational Activity</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <th className="p-4 font-bold">Action</th>
                    <th className="p-4 font-bold">Module</th>
                    <th className="p-4 font-bold">Actor</th>
                    <th className="p-4 font-bold">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {activities?.length > 0 ? (
                    activities.map((activity, idx) => {
                      const isLastElement = activities.length === idx + 1;
                      return (
                        <tr 
                          key={activity._id} 
                          ref={isLastElement ? lastActivityElementRef : null}
                          className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="p-4">
                            <p className="font-bold text-slate-900 dark:text-white uppercase text-xs">{activity.action}</p>
                            <p className="text-xs text-slate-500 mt-1">{activity.description || 'N/A'}</p>
                          </td>
                          <td className="p-4 font-medium text-indigo-500 uppercase tracking-widest text-[10px]">
                            {activity.module}
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-slate-900 dark:text-white">{activity.userId?.fullName || 'System'}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">{activity.userId?.role || 'N/A'}</p>
                          </td>
                          <td className="p-4 text-slate-600 dark:text-slate-300">
                            {activity.createdAt ? new Date(activity.createdAt).toLocaleString() : 'N/A'}
                          </td>
                        </tr>
                      );
                    })
                  ) : !isLoadingActivity ? (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-slate-500">No activity logs found.</td>
                    </tr>
                  ) : null}
                  {isLoadingActivity && (
                    <tr>
                      <td colSpan="4" className="p-8 text-center">
                        <div className="w-8 h-8 border-4 border-[#1a7a40] border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-xs text-slate-500 mt-2">Loading activity...</p>
                      </td>
                    </tr>
                  )}
                  {!hasMoreActivity && activities.length > 0 && (
                    <tr>
                      <td colSpan="4" className="p-4 text-center text-xs text-slate-400">End of records</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Stations Tab */}
      {activeTab === 'Stations' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden p-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                <Building2 size={20} />
              </div>
              <h3 className="text-xl font-bold font-outfit">Station Management</h3>
            </div>
            <button onClick={() => setShowStationModal(true)} className="px-4 py-2 bg-[#1a7a40] text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/20 whitespace-nowrap">Add New Station</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {localStations?.map((station) => (
              <div key={station._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                    <Building2 size={24} />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${station.isActive ? 'bg-[#1a7a40]/10 text-[#1a7a40]' : 'bg-red-500/10 text-red-500'}`}>
                    {station.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <h3 className="text-xl font-bold font-outfit text-slate-900 dark:text-white mb-2">{station.depotName}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{station.city}, {station.district}</p>
                
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Depot Code</span>
                    <span className="font-bold">{station.depotCode}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Platforms</span>
                    <span className="font-bold">{station.totalPlatforms || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Station Master</span>
                    <span className={`font-bold ${station.stationMasterId ? 'text-blue-500' : 'text-slate-400'}`}>
                      {station.stationMasterId ? 'Assigned' : 'Unassigned'}
                    </span>
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                  <button onClick={() => openEditStationModal(station)} className="text-blue-500 hover:text-blue-700 text-sm font-medium">Edit</button>
                  <button onClick={() => handleDeleteStation(station._id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                  <button 
                    onClick={() => handleToggleStationStatus(station._id)}
                    className={`${station.isActive ? 'text-orange-500 hover:text-orange-700' : 'text-green-500 hover:text-green-700'} text-sm font-medium`}
                  >
                    {station.isActive ? 'Suspend' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
            {(!localStations || localStations.length === 0) && (
               <div className="col-span-full p-8 text-center text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl">
                  No stations found.
               </div>
            )}
          </div>
        </div>
      )}

      {/* Fleet Tab */}
      {activeTab === 'Fleet' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 shrink-0">
                <Bus size={20} />
              </div>
              <h3 className="text-xl font-bold font-outfit">Fleet Management</h3>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <select 
                value={selectedDepot} 
                onChange={(e) => setSelectedDepot(e.target.value)}
                className="w-full md:w-auto p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a7a40]"
              >
                <option value="ALL">All Depots</option>
                {data?.stationsData?.map(depot => (
                  <option key={depot._id} value={depot._id}>{depot.depotName}</option>
                ))}
              </select>
              <button onClick={openAddBusModal} className="px-4 py-2 bg-[#1a7a40] text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/20 whitespace-nowrap">Add New Bus</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4 font-bold">Bus Info</th>
                  <th className="p-4 font-bold">Depot</th>
                  <th className="p-4 font-bold">Registration</th>
                  <th className="p-4 font-bold">Type & Capacity</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {isFetchingSubTab ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center">
                      <div className="w-8 h-8 border-4 border-[#1a7a40] border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-xs text-slate-500 mt-2">Loading fleet data...</p>
                    </td>
                  </tr>
                ) : fleetData?.length > 0 ? (
                  (() => {
                    const displayedFleet = selectedDepot === 'ALL' 
                      ? fleetData 
                      : fleetData.filter(bus => {
                          const depotId = bus.depotId?._id || bus.depotId;
                          return depotId?.toString() === selectedDepot?.toString();
                        });
                    
                    if (displayedFleet.length === 0) {
                      return (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-slate-500">No buses found for this depot.</td>
                        </tr>
                      );
                    }
                    
                    return displayedFleet.map((bus) => (
                      <tr key={bus._id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-slate-900 dark:text-white">{bus.busNumber}</p>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300">
                          {bus.depotId?.depotName || 'Unassigned'}
                        </td>
                        <td className="p-4 font-mono text-slate-600 dark:text-slate-300">{bus.registrationNumber}</td>
                        <td className="p-4">
                          <p className="font-medium text-slate-900 dark:text-white">{bus.busType || 'Standard'}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">{bus.capacity} Seats</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                            bus.status === 'ACTIVE' ? 'bg-[#1a7a40]/10 text-[#1a7a40]' : 
                            bus.status === 'MAINTENANCE' ? 'bg-orange-500/10 text-orange-500' : 'bg-red-500/10 text-red-500'
                          }`}>
                            {bus.status || 'UNKNOWN'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button onClick={() => openEditBusModal(bus)} className="text-blue-500 hover:text-blue-700 text-sm font-medium mr-3">Edit</button>
                          <button onClick={() => handleDeleteBus(bus._id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                        </td>
                      </tr>
                    ));
                  })()
                ) : (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500">No buses found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'Users' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500">
                <Users size={20} />
              </div>
              <h3 className="text-xl font-bold font-outfit">User Management</h3>
            </div>
            <button onClick={openAddUserModal} className="px-4 py-2 bg-[#1a7a40] text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/20">Invite User</button>
          </div>
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex gap-2 overflow-x-auto">
            {['ALL', 'USER', 'STATION_MASTER', 'CONDUCTOR', 'DRIVER'].map(role => (
              <button 
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedRole === role 
                    ? 'bg-[#1a7a40] text-white shadow-md shadow-emerald-500/20' 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {role === 'ALL' ? 'All Roles' : role.replace('_', ' ')}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4 font-bold">Name & Email</th>
                  <th className="p-4 font-bold">Phone</th>
                  <th className="p-4 font-bold">Role</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {isFetchingSubTab ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center">
                      <div className="w-8 h-8 border-4 border-[#1a7a40] border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-xs text-slate-500 mt-2">Loading users data...</p>
                    </td>
                  </tr>
                ) : usersData?.length > 0 ? (
                  (() => {
                    const displayedUsers = selectedRole === 'ALL' ? usersData : usersData.filter(u => u.role === selectedRole);
                    if (displayedUsers.length === 0) {
                      return (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-slate-500">No users found for this role.</td>
                        </tr>
                      );
                    }
                    return displayedUsers.map((user) => (
                      <tr key={user._id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                              <UserCircle size={18} />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{user.fullName || user.name || (user.firstName ? `${user.firstName} ${user.lastName || ''}` : '') || user.email}</p>
                              {(user.fullName || user.name || user.firstName) && <p className="text-xs text-slate-500">{user.email}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300 font-mono text-xs">{user.phone || 'N/A'}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                            user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                            user.role === 'STATION_MASTER' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            user.role === 'CONDUCTOR' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${user.isActive ? 'bg-[#1a7a40]/10 text-[#1a7a40]' : 'bg-red-500/10 text-red-500'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button onClick={() => openEditUserModal(user)} className="text-blue-500 hover:text-blue-700 text-sm font-medium mr-3">Edit</button>
                          <button onClick={() => handleDeleteUser(user._id)} className="text-red-500 hover:text-red-700 text-sm font-medium mr-3">Delete</button>
                          <button onClick={() => handleToggleUserStatus(user._id)} className={`${user.isActive ? 'text-orange-500 hover:text-orange-700' : 'text-green-500 hover:text-green-700'} text-sm font-medium`}>
                            {user.isActive ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ));
                  })()
                ) : (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === 'Revenue' && (
        <Suspense fallback={<div className="p-8 text-center"><div className="w-8 h-8 border-4 border-[#1a7a40] border-t-transparent rounded-full animate-spin mx-auto"></div></div>}>
          <AdminRevenueTab filters={filters} />
        </Suspense>
      )}
      {showBusModal && createPortal(
        <div className="fixed inset-0 bg-black/50 z-[9999] flex justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-md relative my-auto">
            <button onClick={() => setShowBusModal(false)} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-red-500 z-10">
              <X size={20} />
            </button>
            <div className="p-6">
              <h3 className="text-xl font-bold font-outfit mb-6">{editingBus ? 'Edit Bus' : 'Add New Bus'}</h3>
              <form onSubmit={handleAddOrEditBus} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bus Number</label>
                  <input type="text" required value={busForm.busNumber} onChange={e => setBusForm({...busForm, busNumber: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a7a40]" placeholder="e.g. KS-101" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Registration</label>
                  <input type="text" required value={busForm.registrationNumber} onChange={e => setBusForm({...busForm, registrationNumber: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a7a40]" placeholder="e.g. KL-15-A-1234" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                    <select value={busForm.busType} onChange={e => setBusForm({...busForm, busType: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a7a40]">
                      <option value="Standard">Standard</option>
                      <option value="AC Sleeper">AC Sleeper</option>
                      <option value="Non-AC Sleeper">Non-AC Sleeper</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Capacity</label>
                    <input type="number" required min="10" max="100" value={busForm.capacity} onChange={e => setBusForm({...busForm, capacity: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a7a40]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assigned Depot</label>
                  <select required value={busForm.depotId} onChange={e => setBusForm({...busForm, depotId: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a7a40]">
                    <option value="" disabled>Select a Depot</option>
                    {data?.stationsData?.map(depot => (
                      <option key={depot._id} value={depot._id}>{depot.depotName}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-[#1a7a40] hover:bg-[#0ea5e9] text-white font-bold rounded-xl shadow-lg mt-4 transition-colors">
                  {isSubmitting ? (editingBus ? 'Saving...' : 'Adding...') : (editingBus ? 'Save Changes' : 'Save Bus')}
                </button>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showUserModal && createPortal(
        <div className="fixed inset-0 bg-black/50 z-[9999] flex justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-md relative my-auto">
            <button onClick={() => setShowUserModal(false)} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-red-500 z-10">
              <X size={20} />
            </button>
            <div className="p-6">
              <h3 className="text-xl font-bold font-outfit mb-6">{editingUser ? 'Edit User' : 'Invite User'}</h3>
              <form onSubmit={handleAddOrEditUser} className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                    <input type="text" required value={userForm.firstName} onChange={e => setUserForm({...userForm, firstName: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a7a40]" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                    <input type="text" required value={userForm.lastName} onChange={e => setUserForm({...userForm, lastName: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a7a40]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input type="email" required value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a7a40]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                  <input type="tel" required value={userForm.phone} onChange={e => setUserForm({...userForm, phone: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a7a40]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                  <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a7a40]">
                    <option value="USER">User (Passenger)</option>
                    <option value="STATION_MASTER">Station Master</option>
                    <option value="CONDUCTOR">Conductor</option>
                    <option value="DRIVER">Driver</option>
                    {!editingUser && <option value="ADMIN">Admin</option>}
                  </select>
                </div>
                {['STATION_MASTER', 'DRIVER', 'CONDUCTOR'].includes(userForm.role) && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assigned Depot</label>
                    <select required={userForm.role === 'STATION_MASTER'} value={userForm.depotId} onChange={e => setUserForm({...userForm, depotId: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a7a40]">
                      <option value="">-- Select Depot --</option>
                      {localStations.map(station => (
                        <option key={station._id} value={station._id}>
                          {station.depotName} ({station.depotCode})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Temporary Password</label>
                    <input type="password" required value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a7a40]" />
                  </div>
                )}
                <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-[#1a7a40] hover:bg-[#0ea5e9] text-white font-bold rounded-xl shadow-lg mt-4 transition-colors">
                  {isSubmitting ? (editingUser ? 'Saving...' : 'Inviting...') : (editingUser ? 'Save Changes' : 'Invite User')}
                </button>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showStationModal && createPortal(
        <div className="fixed inset-0 bg-black/50 z-[9999] flex justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-lg relative my-auto">
            <button onClick={() => setShowStationModal(false)} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-red-500 z-10">
              <X size={20} />
            </button>
            <div className="p-6">
              <h3 className="text-xl font-bold font-outfit mb-6">{editingStation ? 'Edit Station' : 'Add New Station'}</h3>
              <form onSubmit={handleAddOrEditStation} className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Depot Code</label>
                    <input type="text" required value={stationForm.depotCode} onChange={e => setStationForm({...stationForm, depotCode: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a7a40] uppercase" placeholder="e.g. TVM" />
                  </div>
                  <div className="flex-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Depot Name</label>
                    <input type="text" required value={stationForm.depotName} onChange={e => setStationForm({...stationForm, depotName: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a7a40]" placeholder="e.g. Trivandrum Central" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
                  <input type="text" required value={stationForm.address} onChange={e => setStationForm({...stationForm, address: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a7a40]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">City</label>
                    <input type="text" required value={stationForm.city} onChange={e => setStationForm({...stationForm, city: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a7a40]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">District</label>
                    <input type="text" required value={stationForm.district} onChange={e => setStationForm({...stationForm, district: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a7a40]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pincode</label>
                    <input type="text" required value={stationForm.pincode} onChange={e => setStationForm({...stationForm, pincode: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a7a40]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Platforms</label>
                    <input type="number" min="1" required value={stationForm.totalPlatforms} onChange={e => setStationForm({...stationForm, totalPlatforms: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a7a40]" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                    <input type="tel" required value={stationForm.phone} onChange={e => setStationForm({...stationForm, phone: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a7a40]" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                    <input type="email" required value={stationForm.email} onChange={e => setStationForm({...stationForm, email: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a7a40]" />
                  </div>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-[#1a7a40] hover:bg-[#0ea5e9] text-white font-bold rounded-xl shadow-lg mt-4 transition-colors">
                  {isSubmitting ? (editingStation ? 'Saving...' : 'Adding...') : (editingStation ? 'Save Changes' : 'Save Station')}
                </button>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminDashboardWidgets;
