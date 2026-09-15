import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { RoadmapItem, RoadmapStatus } from '../../types';
import { Milestone, Plus, Calendar, Flag, ShieldCheck, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export const RoadmapModule: React.FC = () => {
  const { currentUser, role, isFounder } = useAuth();
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>(() => storageService.getRoadmap());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTargetDate, setNewTargetDate] = useState('2026-11-15');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('high');
  const [newStatus, setNewStatus] = useState<RoadmapStatus>('planned');
  const [newNotes, setNewNotes] = useState('');

  const refreshRoadmap = () => {
    setRoadmap(storageService.getRoadmap());
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.addRoadmapItem(
      {
        title: newTitle,
        description: newDesc,
        targetDate: newTargetDate,
        priority: newPriority,
        status: newStatus,
        notes: newNotes || 'Strategic milestone for company growth',
      },
      currentUser
    );
    setIsAddOpen(false);
    setNewTitle('');
    setNewDesc('');
    setNewNotes('');
    refreshRoadmap();
  };

  const handleStatusChange = (id: string, status: RoadmapStatus) => {
    storageService.updateRoadmapStatus(id, status, currentUser);
    refreshRoadmap();
  };

  const statuses: RoadmapStatus[] = ['planned', 'in_progress', 'at_risk', 'completed', 'on_hold'];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Company Strategic Roadmap</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Section 4: Founder-controlled milestones, deadlines, deliverable objectives, and risk assessments.
          </p>
        </div>

        {isFounder ? (
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm self-start"
          >
            <Plus className="w-4 h-4" /> Add Strategic Milestone
          </button>
        ) : (
          <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            View-Only Access (Employee)
          </span>
        )}
      </div>

      {/* Kanban Column View of Milestones */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statuses.map((statusKey) => {
          const itemsInStatus = roadmap.filter((r) => r.status === statusKey);
          return (
            <div key={statusKey} className="bg-slate-100/70 p-3.5 rounded-2xl border border-slate-200 flex flex-col min-h-[450px]">
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider capitalize">
                  {statusKey.replace('_', ' ')}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200">
                  {itemsInStatus.length}
                </span>
              </div>

              {/* Milestones in this column */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {itemsInStatus.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          item.priority === 'high'
                            ? 'bg-rose-100 text-rose-800'
                            : item.priority === 'medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {item.priority} Priority
                      </span>
                      <span className="text-[10px] text-slate-400">{item.targetDate}</span>
                    </div>

                    <h4 className="font-bold text-slate-900 leading-snug">{item.title}</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{item.description}</p>

                    {item.notes && (
                      <div className="text-[10px] bg-slate-50 p-2 rounded border border-slate-100 text-slate-500">
                        {item.notes}
                      </div>
                    )}

                    {/* Founder Quick Status Mover */}
                    {isFounder && (
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Move:</span>
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value as RoadmapStatus)}
                          className="px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-700 font-medium"
                        >
                          <option value="planned">Planned</option>
                          <option value="in_progress">In Progress</option>
                          <option value="at_risk">At Risk</option>
                          <option value="completed">Completed</option>
                          <option value="on_hold">On Hold</option>
                        </select>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Milestone Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Add Strategic Roadmap Milestone</h3>
            <p className="text-xs text-slate-500 mt-0.5">Visible to leadership and employees</p>

            <form onSubmit={handleAddMilestone} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Milestone Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Expand to Enterprise Multi-Region Cloud"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Objective & Scope</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="What key capability or deliverable will be achieved?"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Delivery Date</label>
                  <input
                    type="date"
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as RoadmapStatus)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 bg-white"
                >
                  <option value="planned">Planned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="at_risk">At Risk</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold cursor-pointer"
                >
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
