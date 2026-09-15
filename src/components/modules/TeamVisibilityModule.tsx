import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { authService } from '../../services/authService';
import { User, isFounder, EmploymentDetails, EmployeeProfile, DispatchedEmail } from '../../types';
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  HeartHandshake,
  Briefcase,
  Calendar,
  UserCheck2,
  ShieldCheck,
  X,
  CheckCircle,
  Sparkles,
  Building,
  Eye,
  BadgeCheck,
  Lock,
  Edit3,
  UserPlus,
  Key,
  Copy,
  Check,
  AlertCircle,
  Trash2,
  DollarSign,
  ShieldAlert,
  Camera,
  Upload,
  Image,
  Maximize2,
  Minimize2,
  Send,
  Inbox,
} from 'lucide-react';
import { UnauthorizedPage } from '../auth/UnauthorizedPage';
import { ConfirmDialog } from '../ui/ConfirmDialog';

export const TeamVisibilityModule: React.FC = () => {
  const { allUsers, currentUser, isSuperAdmin, createEmployee, resendWelcomeEmail, removeEmployee, refreshUsersList } = useAuth();

  if (!isFounder(currentUser.role)) {
    return <UnauthorizedPage moduleName="Employee Directory & Employment Information" />;
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [inspectEmployee, setInspectEmployee] = useState<User | null>(null);

  // Complete Employee Editing States (Founder Executive Control)
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPersonalEmail, setEditPersonalEmail] = useState('');
  const [editDepartment, setEditDepartment] = useState('Engineering');
  const [editDesignation, setEditDesignation] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editEmergencyName, setEditEmergencyName] = useState('');
  const [editEmergencyRel, setEditEmergencyRel] = useState('');
  const [editEmergencyPhone, setEditEmergencyPhone] = useState('');
  const [editJoiningDate, setEditJoiningDate] = useState('');
  const [editReportingPerson, setEditReportingPerson] = useState('');
  const [editStatus, setEditStatus] = useState<string>('Full-Time');
  const [editCompensation, setEditCompensation] = useState<string>('');
  const [showPresetAvatars, setShowPresetAvatars] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [isOutboxOpen, setIsOutboxOpen] = useState(false);

  // Employee Removal states
  const [employeeToDelete, setEmployeeToDelete] = useState<User | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Add Employee modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPersonalEmail, setNewPersonalEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDepartment, setNewDepartment] = useState('Engineering');
  const [newDesignation, setNewDesignation] = useState('Software Engineer');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newEmergencyName, setNewEmergencyName] = useState('');
  const [newEmergencyRel, setNewEmergencyRel] = useState('');
  const [newEmergencyPhone, setNewEmergencyPhone] = useState('');
  const [newJoiningDate, setNewJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [newReportingPerson, setNewReportingPerson] = useState('Shwetha (Managing Director)');
  const [newStatus, setNewStatus] = useState<'Full-Time' | 'Probation' | 'Contract' | 'Part-Time'>('Full-Time');
  const [addError, setAddError] = useState<string | null>(null);
  const [createdSuccess, setCreatedSuccess] = useState<{
    user: User;
    tempPassword: string;
    employeeId: string;
    personalEmail?: string;
    dispatchedEmail?: DispatchedEmail;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [isCreatingEmployee, setIsCreatingEmployee] = useState(false);
  const [isResendingWelcome, setIsResendingWelcome] = useState(false);

  const departments = ['All', 'Executive Leadership', 'Engineering', 'Design', 'Operations & Finance', 'People & Culture'];
  const departmentOptions = ['Engineering', 'Design', 'Operations & Finance', 'People & Culture', 'Executive Leadership'];
  const employmentStatuses = ['All', 'Full-Time', 'Probation', 'Contract', 'Part-Time'];

  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
  ];

  // Open modal and load existing employee, profile, and employment records
  const handleOpenInspect = (emp: User) => {
    setInspectEmployee(emp);
    const profile = storageService.getProfile(emp.id);
    const empDetails = storageService.getEmploymentDetails(emp.id, currentUser);

    setEditName(emp.name);
    setEditEmail(emp.email);
    setEditPersonalEmail(profile?.personalEmail || emp.personalEmail || '');
    setEditDepartment(emp.department);
    setEditDesignation(emp.designation);
    setEditAvatarUrl(emp.avatarUrl);

    setEditPhone(profile?.phone || '');
    setEditAddress(profile?.address || '');
    setEditEmergencyName(profile?.emergencyContact?.name || '');
    setEditEmergencyRel(profile?.emergencyContact?.relationship || '');
    setEditEmergencyPhone(profile?.emergencyContact?.phone || '');

    setEditJoiningDate(empDetails?.joiningDate || '2024-03-15');
    setEditReportingPerson(empDetails?.reportingPerson || 'Shwetha (Managing Director)');
    setEditStatus(empDetails?.employmentStatus || 'Full-Time');
    setEditCompensation(empDetails?.compensation || '$135,000 / annum');

    setShowPresetAvatars(false);
    setPhotoUploadError(null);
    setIsSaved(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoUploadError('Please select an image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoUploadError('Image size exceeds 5MB limit.');
      return;
    }

    setPhotoUploadError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setEditAvatarUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAllEmployeeChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectEmployee) return;

    // 1. Update Core User credentials / identity in authService
    const updatedUser = authService.updateUserRecord(currentUser, inspectEmployee.id, {
      name: editName.trim(),
      email: editEmail.trim(),
      personalEmail: editPersonalEmail.trim(),
      department: editDepartment,
      designation: editDesignation.trim(),
      avatarUrl: editAvatarUrl,
    });

    // 2. Update Personal & Emergency Profile in storageService
    storageService.updateProfile(
      inspectEmployee.id,
      {
        name: editName.trim(),
        email: editEmail.trim(),
        personalEmail: editPersonalEmail.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim(),
        photo: editAvatarUrl,
        emergencyContact: {
          name: editEmergencyName.trim(),
          relationship: editEmergencyRel.trim(),
          phone: editEmergencyPhone.trim(),
        },
      },
      currentUser.name
    );

    // 3. Update Official Employment & Compensation in storageService
    storageService.updateEmploymentDetails(
      inspectEmployee.id,
      {
        joiningDate: editJoiningDate,
        designation: editDesignation.trim(),
        department: editDepartment,
        reportingPerson: editReportingPerson.trim(),
        employmentStatus: editStatus as any,
        compensation: editCompensation.trim() || '$135,000 / annum',
      },
      currentUser
    );

    // 4. Update local state and global list
    setInspectEmployee(updatedUser);
    refreshUsersList();

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleConfirmRemove = async () => {
    if (!employeeToDelete) return;
    setIsRemoving(true);
    const res = removeEmployee(employeeToDelete.id);
    setIsRemoving(false);
    if (res.success) {
      setActionFeedback(`Employee ${employeeToDelete.name} has been successfully removed from the organization.`);
      if (inspectEmployee?.id === employeeToDelete.id) {
        setInspectEmployee(null);
      }
      setEmployeeToDelete(null);
      setTimeout(() => setActionFeedback(null), 4000);
    } else {
      alert(res.error || 'Failed to remove employee');
    }
  };

  const handleAddEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setIsCreatingEmployee(true);

    const res = await createEmployee({
      name: newName,
      personalEmail: newPersonalEmail,
      email: newEmail,
      password: newPassword,
      department: newDepartment,
      designation: newDesignation,
      phone: newPhone,
      address: newAddress,
      emergencyContactName: newEmergencyName,
      emergencyContactRelationship: newEmergencyRel,
      emergencyContactPhone: newEmergencyPhone,
      joiningDate: newJoiningDate,
      reportingPerson: newReportingPerson,
      employmentStatus: newStatus,
    });
    setIsCreatingEmployee(false);

    if (res.success && res.user) {
      setCreatedSuccess({
        user: res.user,
        tempPassword: res.tempPassword || newPassword,
        employeeId: res.employeeId || 'EMP-XXXX',
        personalEmail: newPersonalEmail || res.user.personalEmail,
        dispatchedEmail: res.dispatchedEmail,
      });
      // Reset inputs
      setNewName('');
      setNewPersonalEmail('');
      setNewEmail('');
      setNewPassword('');
      setNewPhone('');
      setNewAddress('');
      setNewEmergencyName('');
      setNewEmergencyRel('');
      setNewEmergencyPhone('');
    } else {
      setAddError(res.error || 'Failed to create employee account.');
    }
  };

  const handleResendWelcome = async () => {
    if (!createdSuccess) return;
    setIsResendingWelcome(true);
    const result = await resendWelcomeEmail(createdSuccess.user.id);
    setIsResendingWelcome(false);
    if (!result.success) setAddError(result.error || 'Failed to resend welcome email.');
    else setActionFeedback(`Welcome email resent to ${createdSuccess.personalEmail || createdSuccess.user.personalEmail}.`);
  };

  const copyCredentials = () => {
    if (!createdSuccess) return;
    const text = `HRM Portal Credentials:\nEmail: ${createdSuccess.user.email}\nPassword: ${createdSuccess.tempPassword}\nEmployee ID: ${createdSuccess.employeeId}\nRole: Employee`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter employees
  const filteredEmployees = allUsers.filter((emp) => {
    const profile = storageService.getProfile(emp.id);
    const empDetails = storageService.getEmploymentDetails(emp.id, currentUser);

    if (selectedDepartment !== 'All' && emp.department !== selectedDepartment) return false;
    if (selectedStatus !== 'All' && empDetails?.employmentStatus !== selectedStatus) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = emp.name.toLowerCase().includes(q);
      const matchEmail = emp.email.toLowerCase().includes(q);
      const matchId = (profile?.employeeId || '').toLowerCase().includes(q);
      const matchDesignation = emp.designation.toLowerCase().includes(q);
      const matchDept = emp.department.toLowerCase().includes(q);
      return matchName || matchEmail || matchId || matchDesignation || matchDept;
    }
    return true;
  });

  const inspectedProfile = inspectEmployee ? storageService.getProfile(inspectEmployee.id) : null;
  const inspectedEmployment = inspectEmployee ? storageService.getEmploymentDetails(inspectEmployee.id, currentUser) : null;

  return (
    <div className="workspace-page space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-950/60 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>{isSuperAdmin ? 'SuperAdmin Organisation Controls' : 'Founder & Admin Controls'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Employee Directory & Team Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Admin oversight across all staff members. Create new employee accounts, assign login credentials, inspect verified employment information, and update statuses.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsOutboxOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-indigo-900/80 hover:bg-indigo-900 text-purple-200 border border-purple-500/30 cursor-pointer transition-all shadow-xs"
              title="Inspect corporate emails dispatched to personal email addresses"
            >
              <Inbox className="w-3.5 h-3.5 text-pink-400" />
              <span>Email Outbox ({storageService.getDispatchedEmails().length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(true);
                setCreatedSuccess(null);
                setAddError(null);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500 via-fuchsia-600 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg shadow-pink-500/25 cursor-pointer transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New Employee</span>
            </button>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-800/80 text-pink-300 border border-pink-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isSuperAdmin ? 'SuperAdmin: Admininnovis' : 'Admin: Shwetha'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Action Feedback Alert */}
      {actionFeedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Staff</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span>{allUsers.length}</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Status</span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span>{allUsers.filter((u) => u.status === 'active').length}</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Full-Time</span>
          <div className="text-2xl font-extrabold text-indigo-700 mt-1 flex items-center gap-2">
            <BadgeCheck className="w-5 h-5 text-indigo-600" />
            <span>
              {allUsers.filter((u) => storageService.getEmploymentDetails(u.id, currentUser)?.employmentStatus === 'Full-Time').length}
            </span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">On Probation</span>
          <div className="text-2xl font-extrabold text-amber-700 mt-1 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-600" />
            <span>
              {allUsers.filter((u) => storageService.getEmploymentDetails(u.id, currentUser)?.employmentStatus === 'Probation').length}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Strip */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        {/* Search Input */}
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employees by name, email, employee ID, designation..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
          />
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-bold">Department:</span>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-purple-500"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Employment Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-bold">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-purple-500"
          >
            {employmentStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Add Button */}
        <button
          type="button"
          onClick={() => {
            setIsAddModalOpen(true);
            setCreatedSuccess(null);
            setAddError(null);
          }}
          className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold border border-purple-200 flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5 text-purple-600" />
          <span>New Employee</span>
        </button>
      </div>

      {/* Employee Workspace: Side-by-Side Master-Detail OR 3-Column Directory Grid */}
      {inspectEmployee ? (
        /* SIDE-BY-SIDE MASTER-DETAIL WORKSPACE */
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Left Column: Master Directory List (Hidden in Full Screen Mode) */}
            {!isFullScreen && (
              <div className="w-full lg:w-4/12 space-y-3 shrink-0">
                {/* Master Column Controls */}
                <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">
                      Team Directory
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                      {filteredEmployees.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInspectEmployee(null)}
                    className="text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Return to 3-column card grid view"
                  >
                    <Users className="w-3.5 h-3.5 text-purple-600" />
                    <span>Grid View</span>
                  </button>
                </div>

                {/* Master Scrollable List */}
                <div className="space-y-2.5 max-h-[820px] overflow-y-auto pr-1">
                  {filteredEmployees.map((emp) => {
                    const isSelected = inspectEmployee.id === emp.id;
                    const profile = storageService.getProfile(emp.id);
                    const empDetails = storageService.getEmploymentDetails(emp.id, currentUser);
                    return (
                      <div
                        key={emp.id}
                        onClick={() => handleOpenInspect(emp)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-purple-50/90 border-purple-600 ring-2 ring-purple-500/20 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-purple-200 hover:bg-slate-50 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative shrink-0">
                            <img
                              src={emp.avatarUrl}
                              alt={emp.name}
                              className="w-11 h-11 rounded-xl object-cover ring-2 ring-purple-500/20"
                            />
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-1 ring-white"></span>
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                              <span>{emp.name}</span>
                              {emp.role === 'FOUNDER_DIRECTOR' && (
                                <span className="px-1.5 py-0.2 rounded text-[8px] font-extrabold bg-pink-100 text-pink-700">
                                  Admin
                                </span>
                              )}
                              {emp.role === 'SUPERADMIN' && (
                                <span className="px-1.5 py-0.2 rounded text-[8px] font-extrabold bg-amber-100 text-amber-700">
                                  SuperAdmin
                                </span>
                              )}
                            </h4>
                            <p className="text-[11px] text-purple-700 font-semibold truncate">{emp.designation}</p>
                            <p className="text-[10px] text-slate-400 font-mono truncate">{profile?.employeeId || emp.email}</p>
                          </div>
                        </div>

                        <div className="shrink-0 flex flex-col items-end gap-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                              empDetails?.employmentStatus === 'Full-Time'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : empDetails?.employmentStatus === 'Probation'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {empDetails?.employmentStatus || 'Full-Time'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Right Column: Detailed Record Workspace */}
            <div className={`w-full ${isFullScreen ? 'lg:w-full' : 'lg:w-8/12'} bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 relative transition-all`}>
              {/* Workspace Header Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-purple-100 text-purple-800 font-mono">
                    {inspectedProfile?.employeeId || 'ID Pending'}
                  </span>
                  <span className="text-slate-300 font-bold">•</span>
                  <span className="text-xs font-bold text-slate-700">
                    Employee Profile & Employment Workspace
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFullScreen(!isFullScreen)}
                    className="px-3 py-1.5 rounded-xl text-slate-600 hover:text-purple-700 hover:bg-purple-50 border border-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title={isFullScreen ? 'Return to Side-by-Side layout' : 'Expand to Full-Width view'}
                  >
                    {isFullScreen ? (
                      <>
                        <Minimize2 className="w-3.5 h-3.5 text-purple-600" />
                        <span>Side-by-Side View</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-3.5 h-3.5 text-purple-600" />
                        <span>Full-Screen Workspace</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setInspectEmployee(null)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                    title="Close and return to card grid"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Profile Header Card with Photo Upload */}
              <div className="pb-6 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="relative group shrink-0">
                    <img
                      src={editAvatarUrl || inspectEmployee.avatarUrl}
                      alt={editName || inspectEmployee.name}
                      className="w-20 h-20 rounded-2xl object-cover ring-2 ring-purple-500/40 shadow-md"
                    />
                    {/* Camera Upload Overlay */}
                    <label
                      title="Upload New Photo"
                      className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white cursor-pointer shadow-md transition-transform hover:scale-105 active:scale-95"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex-1 min-w-[200px]">
                        <label className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">
                          Full Employee Name
                        </label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Employee Name"
                          className="text-base sm:text-lg font-extrabold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 focus:bg-white focus:border-purple-500 focus:outline-none w-full font-sans"
                          required
                        />
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-purple-100 text-purple-800 shrink-0 mt-3 font-mono">
                        {inspectedProfile?.employeeId || 'ID Pending'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">
                          Role Title / Designation
                        </label>
                        <input
                          type="text"
                          value={editDesignation}
                          onChange={(e) => setEditDesignation(e.target.value)}
                          placeholder="Role / Title"
                          className="text-xs font-bold text-purple-700 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:bg-white focus:border-purple-500 focus:outline-none w-full"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">
                          Department
                        </label>
                        <select
                          value={editDepartment}
                          onChange={(e) => setEditDepartment(e.target.value)}
                          className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:bg-white focus:border-purple-500 focus:outline-none w-full"
                        >
                          {departmentOptions.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preset Avatar Selector Toggle */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPresetAvatars(!showPresetAvatars)}
                    className="text-[11px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Image className="w-3.5 h-3.5" />
                    <span>{showPresetAvatars ? 'Hide Preset Photos' : 'Choose from Preset Avatars'}</span>
                  </button>
                  {photoUploadError && (
                    <span className="text-[10px] text-rose-600 font-bold">{photoUploadError}</span>
                  )}
                </div>

                {showPresetAvatars && (
                  <div className="mt-2 p-2.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-2.5 overflow-x-auto animate-in fade-in duration-150">
                    <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Presets:</span>
                    {presetAvatars.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt="Preset Avatar"
                        onClick={() => setEditAvatarUrl(url)}
                        className={`w-9 h-9 rounded-xl object-cover cursor-pointer border-2 transition-transform hover:scale-110 shrink-0 ${
                          editAvatarUrl === url ? 'border-pink-500 ring-2 ring-pink-500/40' : 'border-transparent'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Saved Alert */}
              {isSaved && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>All employee records, personal email, employment details, compensation, and profile photo updated successfully in database!</span>
                </div>
              )}

              {/* Comprehensive Edit Form */}
              <form onSubmit={handleSaveAllEmployeeChanges} className="space-y-6 text-xs">
                {/* Part 1: Contact & Personal Details */}
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <UserCheck2 className="w-4 h-4 text-purple-600" />
                    <span>Contact & Personal Details</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Corporate Email */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                      <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">
                        Corporate Office Email *
                      </label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full text-xs p-2 rounded-xl border border-slate-300 font-mono font-semibold text-slate-900 bg-white focus:outline-none focus:border-purple-500"
                        required
                      />
                    </div>

                    {/* Personal Email */}
                    <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-200">
                      <label className="text-[10px] text-purple-700 font-bold uppercase block mb-1 flex items-center justify-between">
                        <span>Personal Email Address *</span>
                        <span className="text-[9px] bg-purple-200 text-purple-800 px-1.5 py-0.2 rounded font-semibold">
                          Password Recovery
                        </span>
                      </label>
                      <input
                        type="email"
                        value={editPersonalEmail}
                        onChange={(e) => setEditPersonalEmail(e.target.value)}
                        placeholder="e.g. employee.personal@gmail.com"
                        className="w-full text-xs p-2 rounded-xl border border-purple-300 font-mono font-semibold text-purple-950 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                      <span className="text-[10px] text-purple-600/80 mt-1 block">
                        Credentials and self-service password reset codes are dispatched to this personal address.
                      </span>
                    </div>

                    {/* Phone Number */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                      <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full text-xs p-2 rounded-xl border border-slate-300 font-semibold text-slate-900 bg-white"
                      />
                    </div>

                    {/* Physical Address */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                      <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">
                        Physical Address
                      </label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        placeholder="e.g. 742 Evergreen Terrace, Seattle, WA"
                        className="w-full text-xs p-2 rounded-xl border border-slate-300 font-semibold text-slate-900 bg-white"
                      />
                    </div>

                    {/* Emergency Contact */}
                    <div className="col-span-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">
                        Emergency Contact Information
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <input
                          type="text"
                          value={editEmergencyName}
                          onChange={(e) => setEditEmergencyName(e.target.value)}
                          placeholder="Contact Name"
                          className="text-xs p-2 rounded-xl border border-slate-300 font-medium text-slate-900 bg-white"
                        />
                        <input
                          type="text"
                          value={editEmergencyRel}
                          onChange={(e) => setEditEmergencyRel(e.target.value)}
                          placeholder="Relationship (e.g. Spouse)"
                          className="text-xs p-2 rounded-xl border border-slate-300 font-medium text-slate-900 bg-white"
                        />
                        <input
                          type="tel"
                          value={editEmergencyPhone}
                          onChange={(e) => setEditEmergencyPhone(e.target.value)}
                          placeholder="Emergency Phone"
                          className="text-xs p-2 rounded-xl border border-slate-300 font-medium text-slate-900 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Part 2: Employment Information & Founder Governance */}
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                    <span>Employment Information (Founder Management)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Joining Date */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                      <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">
                        Joining Date
                      </label>
                      <input
                        type="date"
                        value={editJoiningDate}
                        onChange={(e) => setEditJoiningDate(e.target.value)}
                        className="w-full text-xs p-2 rounded-xl border border-slate-300 font-semibold text-slate-900 bg-white"
                        required
                      />
                    </div>

                    {/* Reporting Person */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                      <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">
                        Reporting Person
                      </label>
                      <input
                        type="text"
                        value={editReportingPerson}
                        onChange={(e) => setEditReportingPerson(e.target.value)}
                        className="w-full text-xs p-2 rounded-xl border border-slate-300 font-semibold text-slate-900 bg-white"
                        required
                      />
                    </div>

                    {/* Employment Status Selector */}
                    <div className="col-span-full sm:col-span-1 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                      <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">
                        Employment Status
                      </label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="w-full text-xs p-2 rounded-xl border border-slate-300 font-semibold text-slate-900 bg-white"
                      >
                        <option value="Full-Time">Full-Time</option>
                        <option value="Probation">Probation</option>
                        <option value="Contract">Contract</option>
                        <option value="Part-Time">Part-Time</option>
                      </select>
                    </div>

                    {/* Compensation Component */}
                    <div className="col-span-full p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-900/60 shadow-inner space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded-lg bg-pink-500/20 text-pink-300">
                            <DollarSign className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-white block">
                              Annual Compensation Package
                            </label>
                            <span className="text-[10px] text-pink-300/90 font-medium block">
                              Confidential • Hidden from peer employees
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Founder Unlocked</span>
                        </span>
                      </div>

                      <div className="pt-1">
                        <input
                          type="text"
                          value={editCompensation}
                          onChange={(e) => setEditCompensation(e.target.value)}
                          placeholder="e.g. $135,000 / annum (or ₹24,00,000 / year)"
                          className="w-full text-xs font-mono font-bold px-3 py-2.5 rounded-xl border border-indigo-700/60 bg-slate-950/80 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          As Founder/Director, you have executive authority to edit and save this employee's salary and compensation.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  {inspectEmployee.role !== 'FOUNDER_DIRECTOR' && inspectEmployee.role !== 'SUPERADMIN' ? (
                    <button
                      type="button"
                      onClick={() => setEmployeeToDelete(inspectEmployee)}
                      className="px-3.5 py-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Employee</span>
                    </button>
                  ) : (
                    <div></div>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setInspectEmployee(null)}
                      className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 font-bold cursor-pointer"
                    >
                      Close Workspace
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save All Employee Changes</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* STANDARD 3-COLUMN DIRECTORY GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEmployees.length === 0 ? (
            <div className="col-span-full bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-400">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-40 text-purple-600" />
              <p className="text-sm font-semibold">No team members match the active filters.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDepartment('All');
                  setSelectedStatus('All');
                }}
                className="mt-3 px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            filteredEmployees.map((emp) => {
              const profile = storageService.getProfile(emp.id);
              const empDetails = storageService.getEmploymentDetails(emp.id, currentUser);
              const isSelected = false; // In this branch, inspectEmployee is null (grid view)

              return (
                <div
                  key={emp.id}
                  className={`bg-white rounded-3xl border p-5 transition-all flex flex-col justify-between space-y-4 hover:shadow-md ${
                    isSelected ? 'border-purple-600 ring-2 ring-purple-500/20' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={emp.avatarUrl}
                            alt={emp.name}
                            className="w-13 h-13 rounded-2xl object-cover ring-2 ring-purple-500/20 shadow-xs"
                          />
                          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                            <span>{emp.name}</span>
                            {emp.role === 'FOUNDER_DIRECTOR' && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-pink-100 text-pink-700">
                                Admin
                              </span>
                            )}
                          </h3>
                          <p className="text-xs text-purple-700 font-semibold">{emp.designation}</p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {profile?.employeeId || 'ID Pending'}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          empDetails?.employmentStatus === 'Full-Time'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : empDetails?.employmentStatus === 'Probation'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {empDetails?.employmentStatus || 'Full-Time'}
                      </span>
                    </div>

                    {/* Details pill stack */}
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium truncate">{emp.department}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono text-[11px] truncate">{emp.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium">{profile?.phone || 'Contact not set'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Inspect & Remove */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenInspect(emp)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-slate-700 hover:text-purple-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Record</span>
                    </button>

                    {emp.role !== 'FOUNDER_DIRECTOR' && emp.role !== 'SUPERADMIN' && (
                      <button
                        type="button"
                        onClick={() => setEmployeeToDelete(emp)}
                        title={`Remove ${emp.name} from organization`}
                        className="p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-400 hover:text-rose-600 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* MODAL 1: ADD NEW EMPLOYEE MODAL (Admin Only) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 text-slate-900 shadow-2xl border border-slate-200 relative my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Close Button */}
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setCreatedSuccess(null);
                setAddError(null);
              }}
              className="absolute right-5 top-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {createdSuccess ? (
              /* Success Card with Credentials */
              <div className="text-center py-4 space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle className="w-9 h-9" />
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">Employee Account Created!</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    The new employee account has been created with role hard-locked to <strong>EMPLOYEE</strong>. Passwords have been salted and cryptographically hashed with SHA-256.
                  </p>
                </div>

                {/* Credentials Card */}
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 text-left text-xs space-y-3 shadow-lg border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <span className="text-pink-300 font-bold uppercase tracking-wider text-[10px]">
                      Official Credentials & Account Provisioning
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                      Role: EMPLOYEE
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-sans">Full Name:</span>
                      <span className="font-bold text-white">{createdSuccess.user.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-sans">Employee ID:</span>
                      <span className="font-bold text-pink-300">{createdSuccess.employeeId}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-sans">Corporate Office Email:</span>
                      <span className="font-bold text-purple-200">{createdSuccess.user.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-sans">Personal Recipient Email:</span>
                      <span className="font-bold text-emerald-300">{createdSuccess.personalEmail || createdSuccess.user.personalEmail}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block text-[10px] font-sans">Initial Temporary Password:</span>
                      <span className="font-bold text-emerald-300 bg-slate-800 px-2 py-0.5 rounded">
                        {createdSuccess.tempPassword}
                      </span>
                    </div>
                  </div>

                  {/* Automated Dispatch Feedback Banner */}
                  <div className={`p-3 ${createdSuccess.dispatchedEmail?.status === 'DELIVERED' ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200' : 'bg-amber-950/70 border-amber-500/40 text-amber-200'} border rounded-xl text-xs flex items-start gap-2.5`}>
                    <Send className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className={`block ${createdSuccess.dispatchedEmail?.status === 'DELIVERED' ? 'text-emerald-300' : 'text-amber-300'}`}>
                        {createdSuccess.dispatchedEmail?.status === 'DELIVERED' ? 'Welcome Email Sent' : 'Welcome Email Queued'}
                      </strong>
                      <span className="text-[11px] leading-relaxed block mt-0.5">
                        {createdSuccess.dispatchedEmail?.status === 'DELIVERED' ? 'Credentials were sent' : 'SMTP delivery is queued; verify SMTP_HOST, SMTP_USER, SMTP_PASS, and SMTP_FROM in .env, then resend'} to <strong className="font-mono text-white">{createdSuccess.personalEmail || createdSuccess.user.personalEmail}</strong>.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={copyCredentials}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Credentials Copied!' : 'Copy Credentials'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResendWelcome}
                    disabled={isResendingWelcome}
                    title="Resend the welcome email"
                    className="p-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCreatedSuccess(null);
                      setIsAddModalOpen(false);
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-purple-500/20"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Add Employee Form */
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-extrabold">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                      Add New Employee & Provision Account
                    </h3>
                    <p className="text-xs text-slate-500">
                      Founder Shwetha provisions the profile. Welcome credentials will be sent to the employee's personal email.
                    </p>
                  </div>
                </div>

                {addError && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{addError}</span>
                  </div>
                )}

                <form onSubmit={handleAddEmployeeSubmit} className="space-y-4 text-xs">
                  {/* Account & Credentials Section */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <span className="text-[11px] font-extrabold text-purple-800 uppercase tracking-wider block">
                      1. Account & Login Credentials
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Full Legal Name *</label>
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="e.g. Anil Kumar"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-white font-medium"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Original Personal Email Address *
                        </label>
                        <input
                          type="email"
                          value={newPersonalEmail}
                          onChange={(e) => setNewPersonalEmail(e.target.value)}
                          placeholder="e.g. anil.kumar.personal@gmail.com"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-white font-medium"
                          required
                        />
                        <span className="text-[10px] text-purple-700 font-semibold mt-0.5 block">
                          Credentials & recovery codes will be dispatched to this inbox.
                        </span>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Corporate Office Email (Optional / Auto-generated)
                        </label>
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder={
                            newName
                              ? `${newName.toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.')}@apextech.io`
                              : 'e.g. anil.kumar@apextech.io'
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-white font-medium"
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          Leave blank to auto-generate from employee name.
                        </span>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Initial Password (Optional)
                        </label>
                        <div className="relative">
                          <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Leave blank to generate securely"
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-white font-mono"
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Leave blank to generate a random temporary password. Any entered password is stored with a unique cryptographic salt.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Employment Details Section */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <span className="text-[11px] font-extrabold text-purple-800 uppercase tracking-wider block">
                      2. Designation & Department
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Department *</label>
                        <select
                          value={newDepartment}
                          onChange={(e) => setNewDepartment(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-white font-medium"
                        >
                          {departmentOptions.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Designation / Role Title *</label>
                        <input
                          type="text"
                          value={newDesignation}
                          onChange={(e) => setNewDesignation(e.target.value)}
                          placeholder="e.g. Frontend Engineer"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-white font-medium"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Employment Status</label>
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-white font-medium"
                        >
                          <option value="Full-Time">Full-Time</option>
                          <option value="Probation">Probation</option>
                          <option value="Contract">Contract</option>
                          <option value="Part-Time">Part-Time</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Joining Date</label>
                        <input
                          type="date"
                          value={newJoiningDate}
                          onChange={(e) => setNewJoiningDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-white font-medium"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block font-bold text-slate-700 mb-1">Reporting Person</label>
                        <input
                          type="text"
                          value={newReportingPerson}
                          onChange={(e) => setNewReportingPerson(e.target.value)}
                          placeholder="Shwetha (Managing Director)"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-white font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact & Personal Information */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <span className="text-[11px] font-extrabold text-purple-800 uppercase tracking-wider block">
                      3. Contact & Emergency Details (Optional)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-white font-medium"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Address</label>
                        <input
                          type="text"
                          value={newAddress}
                          onChange={(e) => setNewAddress(e.target.value)}
                          placeholder="City, State"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-white font-medium"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Emergency Contact Name</label>
                        <input
                          type="text"
                          value={newEmergencyName}
                          onChange={(e) => setNewEmergencyName(e.target.value)}
                          placeholder="Contact person name"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-white font-medium"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Emergency Phone</label>
                        <input
                          type="tel"
                          value={newEmergencyPhone}
                          onChange={(e) => setNewEmergencyPhone(e.target.value)}
                          placeholder="+1 (555) 999-9999"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-white font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2.5 text-xs text-slate-600 hover:text-slate-900 font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingEmployee}
                      className="px-6 py-2.5 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-500/25 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>{isCreatingEmployee ? 'Creating & Sending...' : 'Create Employee Account'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: DISPATCHED EMAIL OUTBOX VIEWER */}
      {isOutboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 text-slate-900 shadow-2xl border border-slate-200 relative my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Close Button */}
            <button
              onClick={() => setIsOutboxOpen(false)}
              className="absolute right-5 top-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center shadow-md shadow-purple-500/20 shrink-0">
                <Inbox className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Corporate Dispatched Email Outbox
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated emails dispatched to personal email addresses for credentials provisioning and self-service password resets
                </p>
              </div>
            </div>

            {/* Metric counters */}
            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Dispatched</span>
                <span className="text-lg font-black text-slate-800">
                  {storageService.getDispatchedEmails().length}
                </span>
              </div>
              <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-600 block">Welcome Credentials</span>
                <span className="text-lg font-black text-emerald-700">
                  {storageService.getDispatchedEmails().filter(e => e.type === 'WELCOME_CREDENTIALS').length}
                </span>
              </div>
              <div className="bg-purple-50/70 p-3 rounded-2xl border border-purple-200 text-center">
                <span className="text-[10px] uppercase font-bold text-purple-600 block">Password Resets</span>
                <span className="text-lg font-black text-purple-700">
                  {storageService.getDispatchedEmails().filter(e => e.type === 'PASSWORD_RESET').length}
                </span>
              </div>
            </div>

            {/* Email List */}
            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
              {storageService.getDispatchedEmails().length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <Mail className="w-10 h-10 mx-auto mb-2 opacity-30 text-purple-600" />
                  <p className="text-sm font-semibold">No dispatched emails recorded yet.</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Emails are automatically recorded here when new employees are provisioned or password resets are requested.
                  </p>
                </div>
              ) : (
                storageService
                  .getDispatchedEmails()
                  .slice()
                  .reverse()
                  .map((email) => (
                    <div
                      key={email.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 transition-all hover:bg-slate-50/80"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              email.type === 'WELCOME_CREDENTIALS'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-purple-100 text-purple-800 border border-purple-200'
                            }`}
                          >
                            {email.type === 'WELCOME_CREDENTIALS' ? 'Credentials Email' : 'Password Reset'}
                          </span>
                          <span className="text-xs font-bold text-slate-800 font-mono">
                            To: {email.personalEmail}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">({email.recipientName})</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(email.dispatchedAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-200">
                        {email.subject}
                      </div>

                      <div className="bg-slate-900 text-slate-200 rounded-xl p-3.5 text-xs font-mono whitespace-pre-wrap leading-relaxed shadow-inner">
                        {email.body}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Status: Delivered (Simulated SMTP Outbox)</span>
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">ID: {email.id}</span>
                      </div>
                    </div>
                  ))
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsOutboxOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
              >
                Close Outbox
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM REMOVE EMPLOYEE DIALOG */}
      <ConfirmDialog
        isOpen={!!employeeToDelete}
        onClose={() => setEmployeeToDelete(null)}
        onConfirm={handleConfirmRemove}
        title="Remove Employee from Organization"
        description={`Are you sure you want to remove ${employeeToDelete?.name} (${storageService.getProfile(employeeToDelete?.id || '')?.employeeId || 'ID Pending'})? This will revoke their platform credentials, disable their account, and purge their active directory profile.`}
        confirmLabel={isRemoving ? 'Removing...' : 'Yes, Remove Employee'}
        cancelLabel="Cancel"
        variant="destructive"
        isLoading={isRemoving}
      />
    </div>
  );
};
