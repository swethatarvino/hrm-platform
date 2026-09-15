import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { Task, WorkHour, EmployeeDocument, Announcement, Message } from '../../types';
import {
  CheckSquare,
  Clock,
  FolderLock,
  Megaphone,
  MessageSquare,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Calendar,
  User,
} from 'lucide-react';

interface EmployeeDashboardProps {
  onNavigate: (tabId: string) => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workHours, setWorkHours] = useState<WorkHour[]>([]);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    setTasks(storageService.getTasks(currentUser));
    setWorkHours(storageService.getWorkHours(currentUser.id));
    setDocuments(storageService.getDocuments(currentUser));
    setAnnouncements(storageService.getAnnouncements());
    setMessages(storageService.getMessages().filter((m) => m.recipientId === currentUser.id));
  }, [currentUser]);

  const activeTasks = tasks.filter((t) => t.status !== 'completed');
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const unreadAnnouncements = announcements.filter(
    (a) => !a.acknowledgedUserIds.includes(currentUser.id)
  );
  const unreadMessages = messages.filter((m) => !m.read);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Employee Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">Welcome back, {currentUser.name}!</h1>
          <p className="text-xs text-slate-300 mt-1">
            {currentUser.designation} • {currentUser.department}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('tasks')}
            className="px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-pink-500/25"
          >
            <CheckSquare className="w-4 h-4" /> My Tasks
          </button>
          <button
            onClick={() => onNavigate('profile')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <User className="w-4 h-4" /> My Profile & Photo
          </button>
        </div>
      </div>

      {/* 5-Widget Grid Matching Section 7 Requirements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Widget 1: My Tasks */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <CheckSquare className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">My Tasks</h3>
            </div>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="text-lg font-bold text-slate-900">{activeTasks.length}</div>
                <div className="text-[11px] text-slate-500 font-medium">In Progress / Pending</div>
              </div>
              <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                <div className="text-lg font-bold text-emerald-700">{completedTasks.length}</div>
                <div className="text-[11px] text-emerald-600 font-medium">Completed</div>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              {activeTasks.slice(0, 2).map((t) => (
                <div key={t.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <div className="font-semibold text-slate-800 line-clamp-1">{t.title}</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>Due: {t.dueDate}</span>
                    <span className="font-bold text-brand-600">{t.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Widget 2: Work Hours */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Work Hours</h3>
            </div>
            <button
              onClick={() => onNavigate('hours')}
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              History <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 block">Today's Log</span>
                <span className="text-base font-bold text-slate-900">
                  {workHours[0]?.totalHours ? `${workHours[0].totalHours} hrs logged` : 'Not clocked out yet'}
                </span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-100 text-emerald-700">
                Approved
              </span>
            </div>

            <div className="text-xs text-slate-500 space-y-1">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Recent Date</span>
                <span className="font-semibold text-slate-700">{workHours[0]?.date || 'Today'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Weekly Total</span>
                <span className="font-semibold text-slate-700">
                  {workHours.reduce((acc, h) => acc + h.totalHours, 0).toFixed(1)} hrs
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Widget 3: Documents */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                <FolderLock className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Document Center</h3>
            </div>
            <button
              onClick={() => onNavigate('documents')}
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              Files <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {documents.slice(0, 3).map((doc) => (
              <div
                key={doc.id}
                className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
              >
                <div className="truncate pr-2">
                  <div className="font-medium text-slate-800 truncate">{doc.name}</div>
                  <div className="text-[10px] text-slate-500">{doc.category} • {doc.fileSize}</div>
                </div>
                <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                  Secure
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Widget 4: Announcements */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all md:col-span-2 lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <Megaphone className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Official Announcements
              </h3>
            </div>
            {unreadAnnouncements.length > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-amber-100 text-amber-800">
                {unreadAnnouncements.length} Unacknowledged
              </span>
            )}
          </div>

          <div className="mt-4 space-y-3">
            {announcements.slice(0, 2).map((ann) => {
              const isAcknowledged = ann.acknowledgedUserIds.includes(currentUser.id);
              return (
                <div
                  key={ann.id}
                  className={`p-3.5 rounded-xl border text-xs transition-all ${
                    isAcknowledged ? 'bg-slate-50/60 border-slate-200' : 'bg-amber-50/40 border-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{ann.title}</span>
                    <span className="text-[10px] text-slate-500">{ann.publishTime}</span>
                  </div>
                  <p className="text-slate-600 mt-1.5 leading-relaxed">{ann.content}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">By {ann.authorName}</span>
                    {isAcknowledged ? (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Acknowledged
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          storageService.acknowledgeAnnouncement(ann.id, currentUser.id, currentUser.name);
                          setAnnouncements(storageService.getAnnouncements());
                        }}
                        className="px-2.5 py-1 rounded bg-amber-600 text-white font-bold hover:bg-amber-700 cursor-pointer transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Widget 5: Messages */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Messenger</h3>
            </div>
            <button
              onClick={() => onNavigate('messenger')}
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              Open Chat <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="font-semibold text-slate-800">1-on-1 Internal Chat</div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Direct encrypted conversation with Managing Director Sarah Jenkins.
              </p>
              <div className="mt-2 text-[11px] text-brand-600 font-semibold">
                {unreadMessages.length > 0 ? `${unreadMessages.length} unread messages` : 'Up to date'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
