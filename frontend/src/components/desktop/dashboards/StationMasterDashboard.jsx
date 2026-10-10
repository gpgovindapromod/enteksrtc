import React, { useState, useEffect } from 'react';
import { getStationMasterDashboard, getDepotStaff, getDepotFleet, updateDepotFleet, getDepotTrips, getDepotManifest, updateDepotTrip } from '../../../services/stationMasterService';
import { Users, Bus, Route, MapPin, CheckCircle, AlertTriangle, Play, X, User as UserIcon } from 'lucide-react';

const OverviewTab = ({ data }) => {
  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {data?.depot?.name ? `${data.depot.name} (${data.depot.code})` : 'Station Master Dashboard'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {data?.depot?.address || 'Loading depot info...'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">System Online</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Fleet */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600">
              <span className="material-symbols-outlined text-[24px]">directions_bus</span>
            </div>
            <span className="text-xs font-bold px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg">
              {data?.fleet?.active || 0} Active
            </span>
          </div>
          <p className="text-3xl font-bold font-outfit text-slate-900 dark:text-white">{data?.fleet?.total || 0}</p>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Total Fleet</p>
        </div>

        {/* Staff */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-[24px]">badge</span>
            </div>
          </div>
          <p className="text-3xl font-bold font-outfit text-slate-900 dark:text-white">
            {(data?.staff?.drivers || 0) + (data?.staff?.conductors || 0)}
          </p>
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1 flex gap-2">
            <span>{data?.staff?.drivers || 0} Drivers</span>
            <span>&bull;</span>
            <span>{data?.staff?.conductors || 0} Conductors</span>
          </div>
        </div>

        {/* Trips Scheduled */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600">
              <span className="material-symbols-outlined text-[24px]">schedule</span>
            </div>
          </div>
          <p className="text-3xl font-bold font-outfit text-slate-900 dark:text-white">
            {data?.trips?.scheduled || 0}
          </p>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Today's Scheduled</p>
        </div>

        {/* Trips Running/Completed */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-600">
              <span className="material-symbols-outlined text-[24px]">route</span>
            </div>
            {data?.trips?.cancelled > 0 && (
              <span className="text-xs font-bold px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg">
                {data?.trips?.cancelled} Cancelled
              </span>
            )}
          </div>
          <p className="text-3xl font-bold font-outfit text-slate-900 dark:text-white">
            {(data?.trips?.running || 0) + (data?.trips?.completed || 0)}
          </p>
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1 flex gap-2">
            <span>{data?.trips?.running || 0} Running</span>
            <span>&bull;</span>
            <span>{data?.trips?.completed || 0} Completed</span>
          </div>
        </div>

      </div>

      <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30">
        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-400 flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-[20px]">info</span>
          Station Master Quick Actions
        </h3>
        <p className="text-sm text-blue-800 dark:text-blue-300">
          Use the sidebar to manage your depot's staff, view active fleet status, and monitor scheduled trips and passenger manifests. 
          You can update maintenance statuses and reassign driver/conductor roles for your assigned depot.
        </p>
      </div>
    </div>
  );
};

const StaffTab = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    role: 'DRIVER', password: 'password123', gender: 'MALE', dob: '', employeeId: ''
  });

  const loadStaff = () => {
    setLoading(true);
    getDepotStaff().then(res => {
      if (res?.success) setStaff(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleToggleStatus = async (s) => {
    const res = await updateDepotStaff(s._id, { isActive: !s.isActive });
    if (res?.success) loadStaff();
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const res = await addDepotStaff(formData);
    if (res?.success) {
      setShowAddForm(false);
      loadStaff();
      setFormData({
        firstName: '', lastName: '', email: '', phone: '',
        role: 'DRIVER', password: 'password123', gender: 'MALE', dob: '', employeeId: ''
      });
    } else {
      alert(res?.message || 'Failed to add staff');
    }
  };

  if (loading && staff.length === 0) return <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></div>;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold font-outfit flex items-center gap-2"><Users className="text-blue-500" /> Depot Staff</h2>
        <button onClick={() => setShowAddForm(!showAddForm)} className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
          {showAddForm ? 'Cancel' : '+ Add Staff'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="mb-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl grid gap-4 grid-cols-1 md:grid-cols-2">
          <input required type="text" placeholder="First Name" className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-primary" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
          <input required type="text" placeholder="Last Name" className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-primary" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
          <input required type="email" placeholder="Email" className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-primary" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          <input required type="text" placeholder="Phone" className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-primary" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          <input required type="text" placeholder="Employee ID" className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-primary" value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} />
          <input required type="date" className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-primary" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
          <select className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-primary" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
            <option value="DRIVER">Driver</option>
            <option value="CONDUCTOR">Conductor</option>
          </select>
          <select className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-primary" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
          <button type="submit" className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors">
            Save Staff Member
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Role</th>
              <th className="p-4 font-semibold">Phone</th>
              <th className="p-4 font-semibold">Emp ID</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {staff.map(s => (
              <tr key={s._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="p-4 font-bold text-slate-900 dark:text-white">{s.firstName} {s.lastName}</td>
                <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">{s.role}</td>
                <td className="p-4 text-slate-600 dark:text-slate-300">{s.phone || 'N/A'}</td>
                <td className="p-4 text-slate-600 dark:text-slate-300 font-mono text-sm">{s.employeeId}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${s.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {s.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleToggleStatus(s)} className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${s.isActive ? 'bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400' : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-400'}`}>
                    {s.isActive ? 'Suspend' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
            {staff.length === 0 && !loading && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-500">No staff members found in this depot.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const FleetTab = () => {
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const fetchFleet = () => {
    getDepotFleet().then(res => {
      if (res?.success) setFleet(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  const handleStatusChange = async (busId, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this bus as ${newStatus}?`)) return;
    setUpdating(busId);
    try {
      const res = await updateDepotFleet(busId, { status: newStatus });
      if (res?.success) fetchFleet();
      else alert(res?.message || 'Failed to update bus status');
    } catch (err) {
      alert('An error occurred');
    }
    setUpdating(null);
  };

  if (loading) return <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></div>;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 animate-fade-in-up">
      <h2 className="text-xl font-bold font-outfit mb-6 flex items-center gap-2"><Bus className="text-emerald-500" /> Depot Fleet</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-4 font-semibold">Bus No</th>
              <th className="p-4 font-semibold">Registration</th>
              <th className="p-4 font-semibold">Type</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {fleet.map(f => (
              <tr key={f._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="p-4 font-bold text-slate-900 dark:text-white">{f.busNumber}</td>
                <td className="p-4 font-mono text-slate-600 dark:text-slate-300">{f.registrationNumber}</td>
                <td className="p-4 text-slate-600 dark:text-slate-300">{f.busType}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    f.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                    f.status === 'MAINTENANCE' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {f.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <select 
                    disabled={updating === f._id}
                    value={f.status}
                    onChange={(e) => handleStatusChange(f._id, e.target.value)}
                    className="text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 outline-none focus:border-blue-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="RETIRED">RETIRED</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TripsTab = () => {
  const [trips, setTrips] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [manifest, setManifest] = useState(null);
  const [viewingTrip, setViewingTrip] = useState(null);

  const fetchData = async () => {
    try {
      const [tripsRes, staffRes] = await Promise.all([getDepotTrips(), getDepotStaff()]);
      if (tripsRes?.success) setTrips(tripsRes.data);
      if (staffRes?.success) setStaff(staffRes.data.filter(s => s.role === 'CONDUCTOR' && s.isActive));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (tripId, newStatus) => {
    if (!window.confirm(`Mark trip as ${newStatus}?`)) return;
    const res = await updateDepotTrip(tripId, { status: newStatus });
    if (res?.success) fetchData();
    else alert(res?.message || 'Failed to update trip status');
  };

  const handleAssignConductor = async (tripId, conductorId) => {
    if (!conductorId) return;
    const res = await updateDepotTrip(tripId, { conductorId });
    if (res?.success) {
      alert('Conductor assigned successfully');
      fetchData();
    } else {
      alert(res?.message || 'Failed to assign conductor');
    }
  };

  const loadManifest = async (trip) => {
    setViewingTrip(trip);
    setManifest(null);
    const res = await getDepotManifest(trip._id);
    if (res?.success) setManifest(res.data);
  };

  if (loading) return <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></div>;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 animate-fade-in-up">
      <h2 className="text-xl font-bold font-outfit mb-6 flex items-center gap-2"><Route className="text-purple-500" /> Depot Trips</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-4 font-semibold">Route</th>
              <th className="p-4 font-semibold">Departure</th>
              <th className="p-4 font-semibold">Bus</th>
              <th className="p-4 font-semibold">Conductor</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {trips.map(t => (
              <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="p-4 font-bold text-slate-900 dark:text-white">
                  <div>{t.routeId?.routeName}</div>
                  <div className="text-xs text-slate-500">{t.routeId?.routeNumber}</div>
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">{new Date(t.departureDate).toLocaleString()}</td>
                <td className="p-4 text-slate-600 dark:text-slate-300">
                   <div className="font-bold">{t.busId?.busNumber}</div>
                   <div className="text-xs font-mono">{t.busId?.registrationNumber}</div>
                </td>
                <td className="p-4">
                  <select 
                    value={t.conductorId?._id || ''}
                    onChange={(e) => handleAssignConductor(t._id, e.target.value)}
                    disabled={['COMPLETED', 'CANCELLED'].includes(t.status)}
                    className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 outline-none focus:border-blue-500"
                  >
                    <option value="" disabled>Unassigned</option>
                    {staff.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>)}
                  </select>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    t.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    ['BOARDING', 'OPEN', 'DEPARTED'].includes(t.status) ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {t.status}
                  </span>
                </td>
                <td className="p-4 text-right flex justify-end gap-2 items-center">
                  {t.status === 'SCHEDULED' && <button onClick={() => handleUpdateStatus(t._id, 'OPEN')} className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-bold">Open</button>}
                  {t.status === 'OPEN' && <button onClick={() => handleUpdateStatus(t._id, 'BOARDING')} className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-lg font-bold">Board</button>}
                  {t.status === 'BOARDING' && <button onClick={() => handleUpdateStatus(t._id, 'DEPARTED')} className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-lg font-bold">Depart</button>}
                  {t.status === 'DEPARTED' && <button onClick={() => handleUpdateStatus(t._id, 'COMPLETED')} className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg font-bold">Complete</button>}
                  {['SCHEDULED', 'OPEN', 'BOARDING', 'DEPARTED'].includes(t.status) && (
                     <button onClick={() => handleUpdateStatus(t._id, 'CANCELLED')} className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-lg font-bold">Cancel</button>
                  )}
                  <button onClick={() => loadManifest(t)} className="text-xs text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 px-3 py-1 rounded-lg font-bold border border-purple-200 dark:border-purple-800">
                    Manifest
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewingTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <div>
                <h3 className="text-xl font-bold font-outfit text-slate-900 dark:text-white">Passenger Manifest</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{viewingTrip.routeId?.routeName} • Bus: {viewingTrip.busId?.busNumber}</p>
              </div>
              <button onClick={() => setViewingTrip(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {!manifest ? (
                <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
              ) : manifest.length === 0 ? (
                <div className="text-center p-8 text-slate-500">No passengers booked yet.</div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3 font-semibold">Seat</th>
                      <th className="p-3 font-semibold">PNR / Passenger</th>
                      <th className="p-3 font-semibold">Boarding</th>
                      <th className="p-3 font-semibold">Dropping</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                    {manifest.map(b => (
                      <tr key={b._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{b.seatNumbers.join(', ')}</td>
                        <td className="p-3">
                          <div className="font-mono text-xs text-slate-500 mb-1">{b.bookingNumber}</div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                            {b.passengerId?.fullName} <span className="text-xs font-normal text-slate-500">({b.passengerId?.age}{b.passengerId?.gender?.charAt(0)})</span>
                          </div>
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">{b.boardingPoint?.stopName}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">{b.droppingPoint?.stopName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


const StationMasterDashboard = ({ activeTab }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeTab !== 'Overview') {
        setLoading(false);
        return;
    }
    const fetchDashboard = async () => {
      try {
        const res = await getStationMasterDashboard();
        if (res?.success) {
          setData(res.data);
        } else {
          setError('Failed to load dashboard data');
        }
      } catch (err) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [activeTab]);

  if (activeTab === 'Staff') return <StaffTab />;
  if (activeTab === 'Fleet') return <FleetTab />;
  if (activeTab === 'Trips') return <TripsTab />;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-red-500 font-bold">{error}</div>
    </div>
  );

  return <OverviewTab data={data} />;
};

export default StationMasterDashboard;
