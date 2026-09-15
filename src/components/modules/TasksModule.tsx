import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { Task, TaskPriority, TaskStatus } from '../../types';
import {
  CheckSquare,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Filter,
  Search,
  Trash2,
  Sparkles,
  User,
  ArrowRight,
  ShieldCheck,
  X,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';

export const TasksModule: React.FC = () => {
  const { currentUser, role, isFounder, allUsers } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(() => storageService.getTasks(currentUser));
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(() => {
    const list = storageService.getTasks(currentUser);
    return list.length > 0 ? list[0] : null;
  });
  const [newUpdateText, setNewUpdateText] = useState('');
  const [newProgress, setNewProgress] = useState(selectedTask?.progress || 0);

  // Founder Create Modal States (All 7 required fields)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAssigneeId, setNewAssigneeId] = useState(
    allUsers.find((u) => u.role === 'EMPLOYEE')?.id || allUsers[0]?.id || ''
  );
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newAssignedDate, setNewAssignedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDueDate, setNewDueDate] = useState('2026-09-30');
  const [newInitialStatus, setNewInitialStatus] = useState<TaskStatus>('not_started');

  const refreshTasks = () => {
    const refreshed = storageService.getTasks(currentUser);
    setTasks(refreshed);
    if (selectedTask) {
      const updated = refreshed.find((t) => t.id === selectedTask.id);
      if (updated) {
        setSelectedTask(updated);
        setNewProgress(updated.progress);
      }
    }
  };

  // Founder: Create Task with all 7 fields
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const assignee = allUsers.find((u) => u.id === newAssigneeId);
    const created = storageService.addTask(
      {
        title: newTitle,
        description: newDesc,
        assigneeId: newAssigneeId,
        assigneeName: assignee?.name || 'Assigned Member',
        priority: newPriority,
        assignedDate: newAssignedDate,
        dueDate: newDueDate,
        status: newInitialStatus,
        progress: newInitialStatus === 'completed' ? 100 : 0,
      },
      currentUser
    );
    setIsCreateOpen(false);
    setNewTitle('');
    setNewDesc('');
    refreshTasks();
    setSelectedTask(created);
    setNewProgress(created.progress);
  };

  // Employee / Founder: Change Status (4 recommended statuses)
  const handleUpdateStatus = (task: Task, newStatus: TaskStatus) => {
    const progressVal = newStatus === 'completed' ? 100 : newStatus === 'not_started' ? 0 : task.progress;
    storageService.updateTaskStatus(
      task.id,
      newStatus,
      progressVal,
      currentUser,
      `Status changed to ${newStatus.replace('_', ' ').toUpperCase()}`
    );
    refreshTasks();
    if (selectedTask?.id === task.id) {
      setSelectedTask({ ...task, status: newStatus, progress: progressVal });
      setNewProgress(progressVal);
    }
  };

  // Employee: Dedicated Complete Task Action
  const handleCompleteTask = (task: Task) => {
    storageService.updateTaskStatus(
      task.id,
      'completed',
      100,
      currentUser,
      `Marked task as 100% completed`
    );
    refreshTasks();
    if (selectedTask?.id === task.id) {
      setSelectedTask({ ...task, status: 'completed', progress: 100 });
      setNewProgress(100);
    }
  };

  // Employee / Founder: Add comments & daily progress update
  const handleAddCommentAndUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newUpdateText.trim()) return;

    const newStatus: TaskStatus =
      newProgress === 100
        ? 'completed'
        : newProgress > 0 && selectedTask.status === 'not_started'
        ? 'in_progress'
        : selectedTask.status;

    storageService.updateTaskStatus(selectedTask.id, newStatus, newProgress, currentUser, newUpdateText);
    setNewUpdateText('');
    refreshTasks();
  };

  // Founder: Delete Task
  const handleDeleteTask = (task: Task) => {
    if (!window.confirm(`Are you sure you want to delete "${task.title}"?`)) return;
    storageService.deleteTask(task.id, currentUser);
    const refreshed = storageService.getTasks(currentUser);
    setTasks(refreshed);
    setSelectedTask(refreshed[0] || null);
  };

  // Filter Tasks
  const filteredTasks = tasks.filter((t) => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (filterAssignee !== 'all' && t.assigneeId !== filterAssignee) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description.toLowerCase().includes(q);
      const matchAssignee = t.assigneeName.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchAssignee;
    }
    return true;
  });

  const taskUpdates = selectedTask ? storageService.getTaskUpdates(selectedTask.id) : [];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-950/60 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>Module 3: Task & Work Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isFounder ? 'Company-Wide Task Matrix & Assignments' : 'My Tasks & Work Tracking'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              {isFounder
                ? 'Create, assign, and govern organization deliverables across all employees with priority, due date, and milestone tracking.'
                : 'Track your assigned deliverables, update status, record daily work progress, and collaborate via comments.'}
            </p>
          </div>

          {isFounder && (
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="px-5 py-3 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-pink-500/25 active:scale-95 shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create & Assign Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, descriptions, or assignees..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Tasks' },
            { id: 'not_started', label: 'Not Started' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'blocked', label: 'Blocked' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap text-xs ${
                filterStatus === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Founder Assignee Filter */}
        {isFounder && (
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold">Assignee:</span>
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Members</option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Grid: Left 2 Cols Tasks List, Right 1 Col Task Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 2 COLS: Task Cards */}
        <div className="lg:col-span-2 space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-400">
              <CheckSquare className="w-10 h-10 mx-auto mb-2 opacity-40 text-purple-600" />
              <p className="text-sm font-semibold">No deliverables found for this filter.</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isSelected = selectedTask?.id === task.id;
              return (
                <div
                  key={task.id}
                  onClick={() => {
                    setSelectedTask(task);
                    setNewProgress(task.progress);
                  }}
                  className={`p-5 rounded-3xl border bg-white cursor-pointer transition-all hover:shadow-md ${
                    isSelected
                      ? 'border-purple-600 ring-2 ring-purple-500/20 shadow-xs'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {/* Priority Badge */}
                        <span
                          className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                            task.priority === 'urgent'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : task.priority === 'high'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : task.priority === 'medium'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {task.priority}
                        </span>

                        {/* Status Badge (4 official statuses) */}
                        <span
                          className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                            task.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : task.status === 'blocked'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : task.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1">{task.title}</h3>
                    </div>

                    <span className="text-xs font-extrabold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-xl shrink-0">
                      {task.progress}%
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          task.status === 'completed'
                            ? 'bg-emerald-500'
                            : task.status === 'blocked'
                            ? 'bg-rose-500'
                            : 'bg-gradient-to-r from-pink-500 to-purple-600'
                        }`}
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer Metadata */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Assignee: <strong className="text-slate-800">{task.assigneeName}</strong></span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> Assigned {task.assignedDate}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Calendar className="w-3 h-3 text-purple-600" /> Due {task.dueDate}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT 1 COL: Selected Task Interactive Workspace (View, Change Status, Progress, Comments, Complete) */}
        <div className="lg:col-span-1">
          {selectedTask ? (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5 sticky top-20">
              {/* Task Title & Details */}
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-purple-600 tracking-wider">
                    Task Workspace
                  </span>
                  {isFounder && (
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(selectedTask)}
                      className="text-rose-500 hover:text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      title="Delete Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1 leading-snug">
                  {selectedTask.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {selectedTask.description}
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl">
                  <div>
                    <span className="text-slate-400 block">Assignee:</span>
                    <strong className="text-slate-800">{selectedTask.assigneeName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Due Date:</span>
                    <strong className="text-purple-700">{selectedTask.dueDate}</strong>
                  </div>
                </div>
              </div>

              {/* ACTION 1: DEDICATED COMPLETE TASK BUTTON */}
              {selectedTask.status !== 'completed' && (
                <button
                  type="button"
                  onClick={() => handleCompleteTask(selectedTask)}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Task (100%)</span>
                </button>
              )}

              {/* ACTION 2: CHANGE STATUS (4 Official Statuses) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Change Status
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedTask, 'not_started')}
                    className={`py-2 px-2.5 rounded-xl font-bold border text-center cursor-pointer transition-all ${
                      selectedTask.status === 'not_started'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Not Started
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedTask, 'in_progress')}
                    className={`py-2 px-2.5 rounded-xl font-bold border text-center cursor-pointer transition-all ${
                      selectedTask.status === 'in_progress'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedTask, 'blocked')}
                    className={`py-2 px-2.5 rounded-xl font-bold border text-center cursor-pointer transition-all ${
                      selectedTask.status === 'blocked'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Blocked
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedTask, 'completed')}
                    className={`py-2 px-2.5 rounded-xl font-bold border text-center cursor-pointer transition-all ${
                      selectedTask.status === 'completed'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Completed
                  </button>
                </div>
              </div>

              {/* ACTION 3: UPDATE PROGRESS & ADD COMMENTS */}
              <form onSubmit={handleAddCommentAndUpdate} className="border-t border-slate-100 pt-4 space-y-3">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Update Progress & Add Comments
                </label>

                {/* Progress Slider */}
                <div>
                  <div className="flex justify-between text-xs text-slate-700 mb-1">
                    <span className="font-semibold">Current Progress:</span>
                    <span className="font-bold text-purple-700">{newProgress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={newProgress}
                    onChange={(e) => setNewProgress(Number(e.target.value))}
                    className="w-full cursor-pointer accent-purple-600"
                  />
                  {/* Quick preset chips */}
                  <div className="flex items-center justify-between gap-1 mt-1 text-[10px]">
                    {[0, 25, 50, 75, 100].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setNewProgress(val)}
                        className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                          newProgress === val
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {val}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add Comment Textarea */}
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">
                    Post Work Update or Comment
                  </label>
                  <textarea
                    rows={2}
                    value={newUpdateText}
                    onChange={(e) => setNewUpdateText(e.target.value)}
                    placeholder="Describe what was accomplished or notes for the team..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  Submit Comment & Progress
                </button>
              </form>

              {/* ACTION 4: COMMENTS & ACTIVITY LOG */}
              <div className="border-t border-slate-100 pt-3">
                <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                  <span>Comments & Activity History</span>
                </h5>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {taskUpdates.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">No comments or activity logged yet.</p>
                  ) : (
                    taskUpdates.map((upd) => (
                      <div key={upd.id} className="p-3 bg-slate-50 rounded-xl text-xs border border-slate-100 space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
                          <span className="text-slate-800">{upd.authorName}</span>
                          <span>{upd.timestamp}</span>
                        </div>
                        <p className="text-slate-700 text-[11px] leading-relaxed">{upd.updateText}</p>
                        <div className="flex justify-end">
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                            {upd.progress}% progress
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 p-8 rounded-3xl border border-dashed border-slate-300 text-center text-slate-400 text-xs">
              Select any deliverable on the left to view details, update progress, change status, or add comments.
            </div>
          )}
        </div>
      </div>

      {/* FOUNDER TASK CREATION MODAL (All 7 fields: Task, Description, Employee, Priority, Assigned date, Due date, Status) */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Create & Assign New Task</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Define deliverables, set dates, and assign to team members.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="mt-5 space-y-4 text-xs">
              {/* Field 1: Task Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  1. Task Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Implement TOTP Authenticator Support"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              {/* Field 2: Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  2. Description & Acceptance Scope <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Specify requirements, deliverables, and acceptance criteria..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              {/* Field 3 & 4: Employee Assignee & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    3. Assign Employee <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newAssigneeId}
                    onChange={(e) => setNewAssigneeId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-medium bg-white focus:ring-2 focus:ring-purple-500"
                  >
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.designation})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    4. Priority <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-medium bg-white focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Field 5 & 6: Assigned Date & Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    5. Assigned Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newAssignedDate}
                    onChange={(e) => setNewAssignedDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-medium focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    6. Due Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-medium focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              {/* Field 7: Status */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  7. Initial Status <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newInitialStatus}
                  onChange={(e) => setNewInitialStatus(e.target.value as TaskStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-medium bg-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="blocked">Blocked</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl font-bold cursor-pointer shadow-md shadow-purple-500/20 active:scale-95 transition-all"
                >
                  Create & Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
