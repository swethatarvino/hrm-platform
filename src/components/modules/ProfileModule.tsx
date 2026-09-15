import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import {
  User,
  Shield,
  CheckCircle,
  Lock,
  Camera,
  Upload,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  HeartHandshake,
  Briefcase,
  Sparkles,
  RefreshCw,
  Calendar,
  UserCheck2,
  BadgeCheck,
  Building,
} from 'lucide-react';

export const ProfileModule: React.FC = () => {
  const { currentUser, role, isFounder, updateAvatar, updateUserProfile, changePassword } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'employment'>('profile');

  const [profile, setProfile] = useState(() => storageService.getProfile(currentUser.id) || {
    userId: currentUser.id,
    employeeId: 'EMP-1002',
    name: currentUser.name,
    email: currentUser.email,
    personalEmail: currentUser.personalEmail || '',
    phone: '+1 (555) 432-8921',
    address: '742 Evergreen Terrace, Seattle, WA',
    emergencyContact: { name: 'Claire Miller', relationship: 'Spouse', phone: '+1 (555) 887-1234' },
    photo: currentUser.avatarUrl,
  });

  const employmentDetails = storageService.getEmploymentDetails(currentUser.id, currentUser);

  // Form Fields
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(profile.phone || '');
  const [address, setAddress] = useState(profile.address || '');
  const [department, setDepartment] = useState(currentUser.department || 'Engineering');
  const [designation, setDesignation] = useState(currentUser.designation || 'Team Member');
  const [emergencyName, setEmergencyName] = useState(profile.emergencyContact?.name || '');
  const [emergencyRelationship, setEmergencyRelationship] = useState(profile.emergencyContact?.relationship || '');
  const [emergencyPhone, setEmergencyPhone] = useState(profile.emergencyContact?.phone || '');
  
  const [avatarPreview, setAvatarPreview] = useState<string>(currentUser.avatarUrl || profile.photo);
  const [isSaved, setIsSaved] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Password Management Fields
  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);
    if (newPass.length < 6) {
      setPassError('New password must be at least 6 characters.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassError('New password and confirm password do not match.');
      return;
    }
    setIsChangingPass(true);
    setTimeout(() => {
      const res = changePassword(currentUser.id, curPass, newPass);
      setIsChangingPass(false);
      if (!res.success) {
        setPassError(res.error || 'Failed to update password.');
      } else {
        setPassSuccess('Password updated successfully!');
        setCurPass('');
        setNewPass('');
        setConfirmPass('');
        setTimeout(() => setPassSuccess(null), 3500);
      }
    }, 300);
  };

  // Handle local image file upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds 5MB limit. Please choose a smaller photo.');
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAvatarPreview(dataUrl);
      updateAvatar(dataUrl);
      storageService.updateProfile(currentUser.id, { photo: dataUrl }, currentUser.name);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    };
    reader.readAsDataURL(file);
  };

  // Preset avatar selector
  const presetAvatars = [
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  ];

  const handleSelectPreset = (url: string) => {
    setAvatarPreview(url);
    updateAvatar(url);
    storageService.updateProfile(currentUser.id, { photo: url }, currentUser.name);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Handle Save Full Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = storageService.updateProfile(
      currentUser.id,
      {
        name,
        phone,
        address,
        photo: avatarPreview,
        emergencyContact: {
          name: emergencyName,
          relationship: emergencyRelationship,
          phone: emergencyPhone,
        },
      },
      currentUser.name
    );

    setProfile(updated);
    updateUserProfile({
      name,
      department,
      designation,
      avatarUrl: avatarPreview,
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-pink-500/20 via-purple-600/20 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>Personal Identity & Profile Setup</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {name || currentUser.name}'s Profile
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Complete your employment details, contact records, and upload your profile picture. Changes update immediately across all team workspaces.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold ${
              isFounder
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20'
                : 'bg-indigo-900/80 border border-indigo-700 text-indigo-200'
            }`}>
              <Briefcase className="w-3.5 h-3.5" />
              <span>{isFounder ? 'Admin / Managing Director' : 'Employee Workspace'}</span>
            </span>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="relative z-10 flex items-center gap-2 mt-4 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setActiveSubTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'profile'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>My Profile & Photo</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('employment')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'employment'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            <BadgeCheck className="w-3.5 h-3.5" />
            <span>Employment Details</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'profile' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Photo Uploader & Avatar Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 text-center space-y-6">
            <div className="relative inline-block mx-auto group">
            <div className="relative w-32 h-32 rounded-full ring-4 ring-purple-500/20 p-1 bg-gradient-to-br from-pink-500 to-purple-600 mx-auto">
              <img
                src={avatarPreview || currentUser.avatarUrl}
                alt={name}
                className="w-full h-full rounded-full object-cover bg-white"
              />
            </div>

            {/* Photo Upload Trigger Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 right-1 p-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30 hover:scale-110 active:scale-95 transition-all cursor-pointer"
              title="Upload new profile photo"
            >
              <Camera className="w-4 h-4" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>

          <div>
            <h3 className="text-lg font-extrabold text-slate-900">{name}</h3>
            <p className="text-xs font-bold text-purple-600 mt-0.5">{designation}</p>
            <p className="text-xs text-slate-500">{department}</p>
          </div>

          {/* Quick Photo Upload & Presets */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-purple-600" />
                <span>Upload From Device</span>
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-purple-600 hover:text-purple-700 font-bold cursor-pointer underline"
              >
                Browse File
              </button>
            </div>

            {uploadError && (
              <p className="text-[11px] text-rose-600 font-medium">{uploadError}</p>
            )}

            <div className="pt-2 border-t border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 block mb-2">Or Choose a Preset:</span>
              <div className="flex items-center justify-center gap-2">
                {presetAvatars.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(url)}
                    className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-purple-500 transition-all cursor-pointer shrink-0"
                  >
                    <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Employment Metadata */}
          <div className="space-y-2.5 text-xs text-left pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Employee ID</span>
              <span className="font-mono font-bold text-slate-800">{profile.employeeId}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Account Role</span>
              <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-[11px]">
                {role}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Status</span>
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Right Columns: Complete Profile Setup Form OR Fixed Verified View */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  {isFounder ? (
                    <span>Executive Profile Details</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-purple-600" />
                      <span>Official Employee Record (Fixed / Verified)</span>
                    </>
                  )}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isFounder
                    ? 'Managing Director profile controls and organizational records.'
                    : 'Your official employment and contact records are fixed and verified by HR/Founder. Contact HR to request record modifications.'}
                </p>
              </div>
              {isSaved && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold animate-in fade-in">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Profile Saved!</span>
                </div>
              )}
            </div>

            {!isFounder ? (
              /* READ-ONLY / FIXED PROFILE VIEW FOR EMPLOYEE */
              <div className="mt-6 space-y-5">
                <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/80 text-xs text-purple-900 flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-purple-950">Fixed & Verified Employment Record</span>
                    <span>To comply with organizational governance, employee records cannot be self-edited. Contact Managing Director <strong>Shwetha</strong> or HR for amendments.</span>
                  </div>
                </div>

                {/* Section 1: Basic Identity (Read-only) */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>Personal & Contact Details</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Full Legal Name</span>
                      <span className="font-bold text-slate-800 text-sm mt-0.5 block">{name || currentUser.name}</span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Corporate Office Email</span>
                      <span className="font-mono text-purple-700 font-bold text-xs mt-0.5 block">{currentUser.email}</span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Personal Recovery Email</span>
                      <span className="font-mono text-slate-800 font-semibold text-xs mt-0.5 block">
                        {profile.personalEmail || currentUser.personalEmail || 'Not registered'}
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Direct Phone</span>
                      <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{phone || '+1 (555) 432-8921'}</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Residential Address</span>
                    <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{address || '742 Evergreen Terrace, Seattle, WA'}</span>
                  </div>
                </div>

                {/* Section 2: Department & Role */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                    <span>Department & Assigned Role</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Department</span>
                      <span className="font-bold text-slate-800 text-xs mt-0.5 block">{department}</span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Job Designation</span>
                      <span className="font-bold text-purple-700 text-xs mt-0.5 block">{designation}</span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Emergency Contact (Read-only) */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <HeartHandshake className="w-3.5 h-3.5 text-pink-600" />
                    <span>Emergency Contact</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Name</span>
                      <span className="font-bold text-slate-800 text-xs mt-0.5 block">{emergencyName || 'Claire Miller'}</span>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Relationship</span>
                      <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{emergencyRelationship || 'Spouse'}</span>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Contact Phone</span>
                      <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{emergencyPhone || '+1 (555) 887-1234'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* EDITABLE FORM FOR FOUNDER / ADMIN */
              <form onSubmit={handleSaveProfile} className="mt-6 space-y-5">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>Personal Information</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your Full Name"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Company Email</label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          value={currentUser.email}
                          disabled
                          className="w-full text-xs pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Direct Phone Number</label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full text-xs pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Residential Address</label>
                      <div className="relative">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Street, City, Country"
                          className="w-full text-xs pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                    <span>Work & Role Information</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 font-medium bg-white"
                      >
                        <option value="Executive Leadership">Executive Leadership</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Design">Design</option>
                        <option value="Operations & Finance">Operations & Finance</option>
                        <option value="People & Culture">People & Culture</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Job Designation</label>
                      <input
                        type="text"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        placeholder="e.g. Managing Director"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <HeartHandshake className="w-3.5 h-3.5 text-pink-600" />
                    <span>Emergency Contact Details</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Contact Name</label>
                      <input
                        type="text"
                        value={emergencyName}
                        onChange={(e) => setEmergencyName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Relationship</label>
                      <input
                        type="text"
                        value={emergencyRelationship}
                        onChange={(e) => setEmergencyRelationship(e.target.value)}
                        placeholder="e.g. Spouse, Parent"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Phone</label>
                      <input
                        type="text"
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    All updates are encrypted and stored safely.
                  </span>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Save Executive Profile</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* DEDICATED CHANGE PASSWORD CARD FOR EMPLOYEE & ADMIN */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-pink-600" />
                  <span>Security & Password Management</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your account password securely. New password will be salted and hashed with SHA-256.
                </p>
              </div>
              {passSuccess && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold animate-in fade-in">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{passSuccess}</span>
                </div>
              )}
            </div>

            {passError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <span>{passError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={curPass}
                    onChange={(e) => setCurPass(e.target.value)}
                    placeholder="Current password"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">New Password (min. 6 chars)</label>
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="New password"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isChangingPass || !curPass || !newPass || newPass !== confirmPass}
                  className="px-6 py-2.5 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isChangingPass ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Organization Protected Data Card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl border border-slate-800 p-6 text-white shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-pink-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Organization Protected Information (Audited & Locked)
                </h4>
              </div>
              <span className="text-[10px] bg-purple-500/20 border border-purple-500/40 text-purple-300 px-2.5 py-0.5 rounded-full font-bold">
                Director Managed
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/60">
                <span className="text-[11px] text-slate-400 block">Reporting Manager</span>
                <span className="font-semibold text-white mt-0.5 block">
                  {isFounder ? 'Self (Managing Director)' : 'Shwetha (Admin & Managing Director)'}
                </span>
              </div>

              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/60">
                <span className="text-[11px] text-slate-400 block">Compensation Tier</span>
                <span className="font-semibold text-white mt-0.5 block">
                  {employmentDetails?.compensation || '$135,000 / annum (Protected)'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              Protected records are accessible only to Admin (Shwetha) and audited with timestamps.
            </p>
          </div>
        </div>
      </div>
      ) : (
        /* TAB 2: EMPLOYMENT DETAILS (Module 2 Specification) */
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BadgeCheck className="w-5 h-5 text-purple-600" />
                  <span>Official Employment Record</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified organizational details as recorded in company registry.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {employmentDetails?.employmentStatus || 'Full-Time'}
              </span>
            </div>

            {/* Employment Grid */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Employee ID */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Employee ID
                </span>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="font-mono text-base font-extrabold text-slate-900">
                    {employmentDetails?.employeeId || profile.employeeId}
                  </span>
                  <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">
                    Official
                  </span>
                </div>
              </div>

              {/* Joining Date */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Joining Date
                </span>
                <div className="mt-1.5 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-slate-900 text-sm">
                    {employmentDetails?.joiningDate || '2024-03-15'}
                  </span>
                </div>
              </div>

              {/* Reporting Person */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Reporting Person
                </span>
                <div className="mt-1.5 flex items-center gap-2">
                  <UserCheck2 className="w-4 h-4 text-pink-600" />
                  <span className="font-bold text-slate-900 text-sm">
                    {employmentDetails?.reportingPerson || 'Shwetha (Managing Director)'}
                  </span>
                </div>
              </div>

              {/* Employment Status */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Employment Status
                </span>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-bold text-emerald-800 text-sm">
                    {employmentDetails?.employmentStatus || 'Full-Time'}
                  </span>
                </div>
              </div>

              {/* Designation */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Official Designation
                </span>
                <div className="mt-1.5 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-slate-900 text-sm">
                    {employmentDetails?.designation || designation}
                  </span>
                </div>
              </div>

              {/* Department */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Department
                </span>
                <div className="mt-1.5 flex items-center gap-2">
                  <Building className="w-4 h-4 text-slate-600" />
                  <span className="font-bold text-slate-900 text-sm">
                    {employmentDetails?.department || department}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Protected Financial & Audit Info Card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl border border-slate-800 p-6 sm:p-8 text-white shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-pink-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Protected Management Record (Director Governed)
                </h4>
              </div>
              <span className="text-[10px] bg-purple-500/20 border border-purple-500/40 text-purple-300 px-2.5 py-0.5 rounded-full font-bold">
                Audited & Encrypted
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/60">
                <span className="text-[11px] text-slate-400 block">Compensation Package</span>
                <span className="font-semibold text-white mt-0.5 block">
                  {employmentDetails?.compensation || '$135,000 / annum (Protected)'}
                </span>
              </div>

              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/60">
                <span className="text-[11px] text-slate-400 block">Masked Direct Deposit</span>
                <span className="font-mono text-white mt-0.5 block">
                  {employmentDetails?.bankAccountMasked || '•••• •••• •••• 6421'}
                </span>
              </div>

              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/60">
                <span className="text-[11px] text-slate-400 block">Last Review Date</span>
                <span className="font-semibold text-white mt-0.5 block">
                  {employmentDetails?.lastReviewDate || '2026-06-30'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-4 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <span>
                These fields are maintained by Managing Director <strong>Shwetha</strong>. Unauthorized tampering is strictly prohibited and logged to the enterprise security ledger.
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
