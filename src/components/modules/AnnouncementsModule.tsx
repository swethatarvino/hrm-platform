import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { Announcement } from '../../types';
import { Megaphone, Plus, CheckCircle2, ShieldCheck, Clock, User } from 'lucide-react';

export const AnnouncementsModule: React.FC = () => {
  const { currentUser, role, isFounder } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    storageService.getAnnouncements()
  );
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newPriority, setNewPriority] = useState<'normal' | 'important' | 'urgent'>('important');

  const refreshAnnouncements = () => {
    setAnnouncements(storageService.getAnnouncements());
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.publishAnnouncement(
      {
        title: newTitle,
        content: newContent,
        authorName: `${currentUser.name} (Founder)`,
        priority: newPriority,
      },
      currentUser
    );
    setIsPublishOpen(false);
    setNewTitle('');
    setNewContent('');
    refreshAnnouncements();
  };

  const handleAcknowledge = (annId: string) => {
    storageService.acknowledgeAnnouncement(annId, currentUser.id, currentUser.name);
    refreshAnnouncements();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Official Company Announcements</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Section 3 & 4: Executive broadcasts and mandatory policy updates with receipt acknowledgements.
          </p>
        </div>

        {isFounder && (
          <button
            onClick={() => setIsPublishOpen(true)}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm self-start"
          >
            <Plus className="w-4 h-4" /> Broadcast Announcement
          </button>
        )}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((ann) => {
          const isAcknowledged = ann.acknowledgedUserIds.includes(currentUser.id);
          return (
            <div
              key={ann.id}
              className={`p-6 rounded-2xl border bg-white shadow-xs transition-all ${
                ann.priority === 'urgent'
                  ? 'border-rose-200 ring-1 ring-rose-500/10'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-xl ${
                      ann.priority === 'urgent'
                        ? 'bg-rose-100 text-rose-700'
                        : ann.priority === 'important'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        ann.priority === 'urgent'
                          ? 'bg-rose-100 text-rose-800'
                          : ann.priority === 'important'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {ann.priority} Priority
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{ann.title}</h3>
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{ann.publishTime}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-700 mt-3 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                {ann.content}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-slate-500 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Published by <strong>{ann.authorName}</strong></span>
                  {isFounder && (
                    <span className="text-[11px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded ml-2">
                      {ann.acknowledgedUserIds.length} Acknowledgement(s)
                    </span>
                  )}
                </div>

                {isAcknowledged ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Confirmed & Acknowledged
                  </span>
                ) : (
                  <button
                    onClick={() => handleAcknowledge(ann.id)}
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
                  >
                    Click to Confirm & Acknowledge
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Publish Announcement Modal (Founder Only) */}
      {isPublishOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Broadcast Company Announcement</h3>
            <p className="text-xs text-slate-500 mt-0.5">This notice will appear in all employee dashboards</p>

            <form onSubmit={handlePublish} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Announcement Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Q3 Town Hall Meeting & Financial Results"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Priority Level</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 bg-white"
                >
                  <option value="normal">Normal</option>
                  <option value="important">Important</option>
                  <option value="urgent">Urgent (Mandatory)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notice Content / Instructions</label>
                <textarea
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Write message to the team..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPublishOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold cursor-pointer shadow-xs"
                >
                  Publish to Everyone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
