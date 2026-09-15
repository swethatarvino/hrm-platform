import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import {
  WorkHour,
  WorkHourRecordingMethod,
  WorkHourStatus,
  ActiveClockSession,
  isFounder as checkIsFounder,
} from '../../types';
import {
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Play,
  Square,
  Sparkles,
  ShieldCheck,
  User,
  Users,
  Search,
  Filter,
  ArrowRight,
  Settings2,
  Check,
  X,
  Briefcase,
  FileText,
  TrendingUp,
  History,
  Timer,
} from 'lucide-react';

export const WorkHoursModule: React.FC = () => {
  const { currentUser, isFounder, allUsers } = useAuth();

  // Active Policy State
  const [recordingMethod, setRecordingMethod] = useState<WorkHourRecordingMethod>(() =>
    storageService.getWorkHourMethod()
  );

  // Clock-in / Real-time session state
  const [activeSession, setActiveSession] = useState<ActiveClockSession | null>(() =>
    storageService.getActiveClockSession(currentUser.id)
  );
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [sessionNotes, setSessionNotes] = useState('');

  // History / Submissions state
  const [workHoursList, setWorkHoursList] = useState<WorkHour[]>(() =>
    isFounder ? storageService.getAllWorkHoursAdmin(currentUser) : storageService.getWorkHours(currentUser.id)
  );

  // Manual & Timesheet entry form states
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualCheckIn, setManualCheckIn] = useState('09:00 AM');
  const [manualCheckOut, setManualCheckOut] = useState('05:30 PM');
  const [manualTotalHours, setManualTotalHours] = useState('8.5');
  const [manualNotes, setManualNotes] = useState('');
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);

  // Founder filters
  const [filterEmployeeId, setFilterEmployeeId] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Live digital clock ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const refreshList = () => {
    if (isFounder) {
      setWorkHoursList(storageService.getAllWorkHoursAdmin(currentUser));
    } else {
      setWorkHoursList(storageService.getWorkHours(currentUser.id));
    }
    setActiveSession(storageService.getActiveClockSession(currentUser.id));
  };

  // Change recording method (Founder only)
  const handleMethodChange = (newMethod: WorkHourRecordingMethod) => {
    try {
      storageService.setWorkHourMethod(newMethod, currentUser);
      setRecordingMethod(newMethod);
    } catch (err: any) {
      alert(err.message || 'Failed to update policy');
    }
  };

  // Real-time Clock In
  const handleClockIn = () => {
    const session = storageService.clockIn(currentUser.id, currentUser, sessionNotes);
    setActiveSession(session);
    setSessionNotes('');
    refreshList();
  };

  // Real-time Clock Out
  const handleClockOut = () => {
    storageService.clockOut(currentUser.id, currentUser, sessionNotes);
    setActiveSession(null);
    setSessionNotes('');
    refreshList();
    setFormSuccessMessage('Work hours clocked out and submitted successfully!');
    setTimeout(() => setFormSuccessMessage(null), 3000);
  };

  // Manual or Timesheet Entry Submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hoursNum = parseFloat(manualTotalHours);
    if (isNaN(hoursNum) || hoursNum <= 0) {
      alert('Please enter a valid number of hours.');
      return;
    }

    storageService.logWorkHours(
      {
        employeeId: currentUser.id,
        employeeName: currentUser.name,
        date: manualDate,
        clockIn: recordingMethod === 'timesheet' ? undefined : manualCheckIn,
        clockOut: recordingMethod === 'timesheet' ? undefined : manualCheckOut,
        totalHours: hoursNum,
        status: isFounder ? 'approved' : 'pending',
        recordingMethod,
        notes: manualNotes,
      },
      currentUser
    );

    setManualNotes('');
    setFormSuccessMessage('Work hours logged and submitted for approval!');
    setTimeout(() => setFormSuccessMessage(null), 3000);
    refreshList();
  };

  // Founder Approval Actions
  const handleApprove = (id: string) => {
    storageService.updateWorkHourStatus(id, 'approved', currentUser);
    refreshList();
  };

  const handleReject = (id: string) => {
    storageService.updateWorkHourStatus(id, 'rejected', currentUser);
    refreshList();
  };

  // Calculate elapsed time for active session
  const getElapsedTimeString = () => {
    if (!activeSession) return '00:00:00';
    const start = new Date(activeSession.clockInTime);
    const diffMs = Math.max(0, currentTime.getTime() - start.getTime());
    const totalSecs = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  };

  // Filtered list for display
  const filteredList = workHoursList.filter((item) => {
    if (isFounder && filterEmployeeId !== 'all' && item.employeeId !== filterEmployeeId) return false;
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (item.employeeName || '').toLowerCase().includes(q);
      const matchNotes = (item.notes || '').toLowerCase().includes(q);
      const matchDate = item.date.includes(q);
      return matchName || matchNotes || matchDate;
    }
    return true;
  });

  // Calculate Employee Metrics
  const myTotalHours = workHoursList
    .filter((w: WorkHour) => w.employeeId === currentUser.id)
    .reduce((sum: number, w: WorkHour) => sum + w.totalHours, 0);

  const myApprovedHours = workHoursList
    .filter((w: WorkHour) => w.employeeId === currentUser.id && w.status === 'approved')
    .reduce((sum: number, w: WorkHour) => sum + w.totalHours, 0);

  const myPendingCount = workHoursList.filter(
    (w: WorkHour) => w.employeeId === currentUser.id && w.status === 'pending'
  ).length;

  // Calculate Company Metrics (Founder)
  const allEntries: WorkHour[] = isFounder ? storageService.getAllWorkHoursAdmin(currentUser) : [];
  const companyTotalHours = allEntries.reduce((sum: number, w: WorkHour) => sum + w.totalHours, 0);
  const companyPendingApprovals = allEntries.filter((w: WorkHour) => w.status === 'pending').length;
  const companyApprovedHours = allEntries
    .filter((w: WorkHour) => w.status === 'approved')
    .reduce((sum: number, w: WorkHour) => sum + w.totalHours, 0);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-950/60 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>Module 4: Work Hours & Attendance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isFounder ? 'Company Work Hours & Attendance Oversight' : 'My Work Hours & Attendance Tracker'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              {isFounder
                ? 'Review company-wide timesheets, verify check-in/check-out timestamps, approve pending work hours, and configure company recording policies.'
                : 'Track your daily working hours, record check-in and check-out times, submit notes, and review your historical attendance approvals.'}
            </p>
          </div>

          {/* Configurable Recording Method Switcher (Specification Mandate) */}
          <div className="bg-slate-900/90 border border-indigo-800/60 rounded-2xl p-3 shrink-0 flex flex-col gap-2 min-w-[240px]">
            <div className="flex items-center justify-between text-[11px] text-pink-300 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5 text-pink-400" />
                <span>Recording Policy</span>
              </span>
              {isFounder && <span className="text-[10px] text-slate-400 font-mono">Founder Switch</span>}
            </div>

            {isFounder ? (
              <select
                value={recordingMethod}
                onChange={(e) => handleMethodChange(e.target.value as WorkHourRecordingMethod)}
                className="w-full text-xs font-bold bg-slate-950 text-white border border-purple-500/40 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="clock_in_out">⏱️ Check-In / Check-Out (Real-Time)</option>
                <option value="manual">📝 Manual Time Entry (Hours & Times)</option>
                <option value="timesheet">📊 Daily Timesheet (Total Duration)</option>
              </select>
            ) : (
              <div className="text-xs font-extrabold text-white bg-indigo-950/60 px-3 py-1.5 rounded-xl border border-indigo-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>
                  {recordingMethod === 'clock_in_out' && 'Real-Time Check-In / Out'}
                  {recordingMethod === 'manual' && 'Manual Time Entry'}
                  {recordingMethod === 'timesheet' && 'Daily Timesheet Duration'}
                </span>
              </div>
            )}
            <span className="text-[10px] text-slate-400">
              {isFounder
                ? 'Configurable per product owner specification.'
                : 'Active organization logging policy.'}
            </span>
          </div>
        </div>
      </div>

      {/* Success Alert Banner */}
      {formSuccessMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{formSuccessMessage}</span>
        </div>
      )}

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {isFounder ? (
          <>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Company Total</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-600" />
                <span>{companyTotalHours.toFixed(1)} hrs</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Approved Hours</span>
              <div className="text-2xl font-extrabold text-emerald-700 mt-1 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{companyApprovedHours.toFixed(1)} hrs</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pending Approval</span>
              <div className="text-2xl font-extrabold text-amber-600 mt-1 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <span>{companyPendingApprovals} logs</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Staff</span>
              <div className="text-2xl font-extrabold text-indigo-700 mt-1 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>{allUsers.length} staff</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">My Total Hours</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
                <Timer className="w-5 h-5 text-purple-600" />
                <span>{myTotalHours.toFixed(1)} hrs</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Approved Hours</span>
              <div className="text-2xl font-extrabold text-emerald-700 mt-1 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{myApprovedHours.toFixed(1)} hrs</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pending Approvals</span>
              <div className="text-2xl font-extrabold text-amber-600 mt-1 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <span>{myPendingCount} logs</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Daily Avg.</span>
              <div className="text-2xl font-extrabold text-indigo-700 mt-1 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <span>
                  {workHoursList.length > 0 ? (myTotalHours / workHoursList.length).toFixed(1) : '8.0'} hrs
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Employee Recording Action Card (Adapts to Active Configured Method) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {recordingMethod === 'clock_in_out' && 'Live Real-Time Clock-In / Clock-Out'}
                {recordingMethod === 'manual' && 'Log Work Date & Hours (Manual)'}
                {recordingMethod === 'timesheet' && 'Daily Timesheet Duration Submission'}
              </h2>
              <p className="text-xs text-slate-500">
                {recordingMethod === 'clock_in_out' && 'Record your exact check-in and check-out timestamps in real time.'}
                {recordingMethod === 'manual' && 'Enter your work date, start time, end time, and notes.'}
                {recordingMethod === 'timesheet' && 'Record total hours worked for the day with deliverables.'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="font-mono text-xs font-extrabold text-slate-900 block">
              {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="font-mono text-sm font-black text-purple-700">
              {currentTime.toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* MODE A: REAL-TIME CLOCK IN / CLOCK OUT */}
        {recordingMethod === 'clock_in_out' && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-purple-50/40 border border-slate-200/80">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    activeSession ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'
                  }`}
                />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Status: {activeSession ? 'Working Session in Progress' : 'Not Clocked In'}
                </span>
              </div>
              {activeSession ? (
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-purple-800 font-mono tracking-tight">
                    {getElapsedTimeString()}
                  </div>
                  <p className="text-xs text-slate-500">
                    Clocked in at:{' '}
                    <strong>
                      {new Date(activeSession.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </strong>
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Click the button below to start tracking your working hours for today.
                </p>
              )}
            </div>

            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Optional work notes / task details..."
                className="w-full sm:w-64 text-xs px-3 py-2.5 rounded-xl border border-slate-300 text-slate-800 bg-white"
              />

              {activeSession ? (
                <button
                  type="button"
                  onClick={handleClockOut}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-rose-500/20 active:scale-95 transition-all"
                >
                  <Square className="w-4 h-4" />
                  <span>Clock Out & Submit</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleClockIn}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  <Play className="w-4 h-4" />
                  <span>Clock In Now</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* MODE B: MANUAL TIME ENTRY (Dates & Start/End) */}
        {recordingMethod === 'manual' && (
          <form onSubmit={handleManualSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Work Date *</label>
                <input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-white font-medium"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Check-In Time *</label>
                <input
                  type="text"
                  value={manualCheckIn}
                  onChange={(e) => setManualCheckIn(e.target.value)}
                  placeholder="09:00 AM"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-white font-medium"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Check-Out Time *</label>
                <input
                  type="text"
                  value={manualCheckOut}
                  onChange={(e) => setManualCheckOut(e.target.value)}
                  placeholder="05:30 PM"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-white font-medium"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Total Hours *</label>
                <input
                  type="number"
                  step="0.25"
                  value={manualTotalHours}
                  onChange={(e) => setManualTotalHours(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-white font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Work Deliverables & Notes</label>
              <input
                type="text"
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                placeholder="Summary of work completed, sprint tasks addressed, meetings attended..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-white"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-purple-500/20 active:scale-95"
              >
                <span>Submit Hours for Approval</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* MODE C: DAILY TIMESHEET DURATION */}
        {recordingMethod === 'timesheet' && (
          <form onSubmit={handleManualSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Work Date *</label>
                <input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-white font-medium"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Total Hours Worked *</label>
                <input
                  type="number"
                  step="0.5"
                  value={manualTotalHours}
                  onChange={(e) => setManualTotalHours(e.target.value)}
                  placeholder="8.0"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-white font-bold"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Work Summary / Category</label>
                <input
                  type="text"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="e.g. Feature Implementation, Bug Fixes"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-purple-500/20 active:scale-95"
              >
                <span>Save Timesheet Entry</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* History & Review Table Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-purple-600" />
            <h2 className="text-base font-extrabold text-slate-900">
              {isFounder ? 'Company-Wide Work Hours Ledger' : 'My Historical Attendance & Hours'}
            </h2>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes or dates..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-slate-800"
              />
            </div>

            {/* Founder Employee Selector */}
            {isFounder && (
              <select
                value={filterEmployeeId}
                onChange={(e) => setFilterEmployeeId(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
              >
                <option value="all">All Employees</option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            )}

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                {isFounder && <th className="py-3 px-3">Employee</th>}
                <th className="py-3 px-3">Work Date</th>
                <th className="py-3 px-3">Check-In</th>
                <th className="py-3 px-3">Check-Out</th>
                <th className="py-3 px-3">Total Hours</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Notes & Deliverables</th>
                {isFounder && <th className="py-3 px-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={isFounder ? 8 : 6} className="text-center py-8 text-slate-400 font-medium">
                    No work hours records match the current filter.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Employee Name (Founder view) */}
                    {isFounder && (
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {item.employeeName || item.employeeId}
                      </td>
                    )}

                    {/* Work Date */}
                    <td className="py-3 px-3 font-mono font-medium">
                      {item.date}
                    </td>

                    {/* Check In */}
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {item.clockIn || '—'}
                    </td>

                    {/* Check Out */}
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {item.clockOut || '—'}
                    </td>

                    {/* Total Hours */}
                    <td className="py-3 px-3">
                      <span className="font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                        {item.totalHours.toFixed(2)}h
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          item.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.status === 'rejected'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {item.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                        {item.status === 'rejected' && <XCircle className="w-3 h-3" />}
                        {item.status === 'pending' && <AlertCircle className="w-3 h-3" />}
                        <span>{item.status}</span>
                      </span>
                    </td>

                    {/* Notes */}
                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                      {item.notes || '—'}
                    </td>

                    {/* Founder Actions: Approve / Reject */}
                    {isFounder && (
                      <td className="py-3 px-3 text-right">
                        {item.status === 'pending' ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleApprove(item.id)}
                              title="Approve work hours"
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-pointer transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(item.id)}
                              title="Reject work hours"
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">
                            {item.approvedBy ? `Reviewed` : '—'}
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
