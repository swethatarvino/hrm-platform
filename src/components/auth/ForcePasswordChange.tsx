import React, { useState } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ForcePasswordChange: React.FC = () => {
  const { currentUser, changePassword, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (newPassword.length < 6) return setError('New password must be at least 6 characters.');
    if (newPassword !== confirmation) return setError('New password and confirmation do not match.');
    setSaving(true);
    const result = changePassword(currentUser.id, currentPassword, newPassword);
    setSaving(false);
    if (!result.success) setError(result.error || 'Unable to change password.');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-900">
      <div className="bg-white rounded-3xl shadow-2xl p-7 w-full max-w-md">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black">Change your temporary password</h1>
        <p className="text-sm text-slate-500 mt-2">For security, set a new password before entering your employee dashboard.</p>
        {error && <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">{error}</div>}
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-semibold">Temporary password<input className="mt-1 w-full border rounded-xl p-3" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></label>
          <label className="block text-sm font-semibold">New password<input className="mt-1 w-full border rounded-xl p-3" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /></label>
          <label className="block text-sm font-semibold">Confirm new password<input className="mt-1 w-full border rounded-xl p-3" type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required /></label>
          <button disabled={saving} className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2"><Lock className="w-4 h-4" />{saving ? 'Updating...' : 'Update password'}</button>
        </form>
        <button type="button" onClick={logout} className="w-full mt-3 py-2 text-sm text-slate-500 hover:text-slate-900">Sign out</button>
      </div>
    </div>
  );
};
