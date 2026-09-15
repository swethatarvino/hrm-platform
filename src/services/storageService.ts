import {
  Task,
  TaskUpdate,
  WorkHour,
  WorkHourRecordingMethod,
  WorkHourStatus,
  ActiveClockSession,
  EmployeeDocument,
  Announcement,
  Message,
  RoadmapItem,
  FinanceTransaction,
  BalanceSheetEntry,
  AuditLog,
  User,
  EmployeeProfile,
  EmploymentDetails,
  DispatchedEmail,
  PasswordResetToken,
  isFounder,
  isEmployee
} from '../types';
import { AuthorizationError, authService } from './authService';
import {
  initialTasks,
  initialTaskUpdates,
  initialWorkHours,
  initialDocuments,
  initialAnnouncements,
  initialMessages,
  initialRoadmapItems,
  initialFinanceTransactions,
  initialGrowthMetrics,
  initialBalanceSheet,
  initialAuditLogs,
  initialUsers,
  initialProfiles,
  initialEmploymentDetails,
} from './mockData';
import { defaultOrganizationConfig, OrganizationConfig } from '../config/organization.config';

class StorageService {
  private get<T>(key: string, defaultVal: T): T {
    try {
      const item = localStorage.getItem(`hrm_${key}`);
      return item ? JSON.parse(item) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  private set<T>(key: string, val: T): void {
    try {
      localStorage.setItem(`hrm_${key}`, JSON.stringify(val));
    } catch (e) {
      console.error(`Failed to save hrm_${key} to localStorage`, e);
    }
  }

  // --- Organization Config (White-label) ---
  getOrgConfig(): OrganizationConfig {
    const config = this.get<OrganizationConfig>('org_config', defaultOrganizationConfig);
    if (config.currencyCode !== 'INR' || config.currencySymbol !== '₹') {
      const inrConfig = { ...config, currencySymbol: '₹', currencyCode: 'INR' };
      this.set('org_config', inrConfig);
      return inrConfig;
    }
    return config;
  }

  saveOrgConfig(config: OrganizationConfig): void {
    this.set('org_config', config);
    this.recordAudit('System / Admin', 'UPDATE_ORG_CONFIG', 'OrganizationConfig', 'root', `Updated company branding to "${config.name}"`);
  }

  // --- Users & Profiles ---
  getUsers(): User[] {
    return authService.getAllUsers();
  }

  getProfile(userId: string): EmployeeProfile | undefined {
    const profiles = this.get<Record<string, EmployeeProfile>>('profiles', initialProfiles);
    if (profiles[userId]) return profiles[userId];

    // Fallback: look up in authService users
    const user = authService.getAllUsers().find((u) => u.id === userId);
    if (user) {
      return {
        userId: user.id,
        employeeId: 'EMP-' + (user.id.includes('_') ? user.id.split('_')[1] : '1000'),
        name: user.name,
        email: user.email,
        personalEmail: user.personalEmail || '',
        phone: '',
        address: '',
        emergencyContact: { name: '', relationship: '', phone: '' },
        photo: user.avatarUrl,
      };
    }
    return undefined;
  }

  // --- Dispatched Emails ---
  getDispatchedEmails(): DispatchedEmail[] {
    return authService.getDispatchedEmails();
  }

  dispatchEmail(data: Omit<DispatchedEmail, 'id' | 'dispatchedAt' | 'status'>): DispatchedEmail {
    const email = authService.dispatchEmail(data);
    this.recordAudit('System / Mailer', 'DISPATCH_EMAIL', 'DispatchedEmail', email.id, `Dispatched ${data.type} to ${data.personalEmail}`);
    return email;
  }

  updateProfile(userId: string, updates: Partial<EmployeeProfile>, actorName: string): EmployeeProfile {
    const profiles = this.get<Record<string, EmployeeProfile>>('profiles', initialProfiles);
    const existing = profiles[userId] || {
      userId,
      employeeId: 'EMP-' + Math.floor(1000 + Math.random() * 9000),
      name: actorName,
      email: '',
      phone: '',
      address: '',
      emergencyContact: { name: '', relationship: '', phone: '' },
      photo: '',
    };
    const updated = { ...existing, ...updates };
    profiles[userId] = updated;
    this.set('profiles', profiles);

    if (updates.photo) {
      authService.updateUserPhoto(userId, updates.photo);
    }

    this.recordAudit(actorName, 'UPDATE_PROFILE', 'EmployeeProfile', userId, `Updated personal profile & contact details`);
    return updated;
  }

  getEmploymentDetails(targetUserId: string, requestingUser: User): EmploymentDetails | null {
    // Backend RBAC: Employee can ONLY view their own record. Founder/Director can view any employee.
    if (!isFounder(requestingUser.role) && requestingUser.id !== targetUserId) {
      this.recordAudit(
        requestingUser.name,
        'SECURITY_VIOLATION',
        'EmploymentDetails',
        targetUserId,
        `Unauthorized access attempt: ${requestingUser.name} (${requestingUser.role}) tried to access employee record ${targetUserId}`
      );
      throw new AuthorizationError(
        `Access Denied (403): You do not have permission to view private records for employee ID "${targetUserId}".`,
        403,
        'EMPLOYEE_RECORD_ISOLATION'
      );
    }
    const allDetails = this.get<Record<string, EmploymentDetails>>('employment', initialEmploymentDetails);
    if (!allDetails[targetUserId]) {
      const profile = this.getProfile(targetUserId);
      allDetails[targetUserId] = {
        employeeId: profile?.employeeId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        joiningDate: new Date().toISOString().split('T')[0],
        designation: requestingUser.designation || 'Team Member',
        department: requestingUser.department || 'Engineering',
        reportingPerson: 'Shwetha (Managing Director)',
        employmentStatus: 'Full-Time',
        compensation: '₹1,10,000 / month (Standard Tier)',
        bankAccountMasked: '•••• •••• •••• 1234',
        taxIdentifier: 'SSN-•••-••-5678',
        lastReviewDate: new Date().toISOString().split('T')[0],
      };
      this.set('employment', allDetails);
    }
    return allDetails[targetUserId] || null;
  }

  updateEmploymentDetails(
    targetUserId: string,
    updates: Partial<EmploymentDetails>,
    actor: User
  ): EmploymentDetails {
    if (!isFounder(actor.role)) {
      this.recordAudit(
        actor.name,
        'SECURITY_VIOLATION',
        'EmploymentDetails',
        targetUserId,
        `Unauthorized access attempt: ${actor.name} (${actor.role}) tried to update employment record ${targetUserId}`
      );
      throw new AuthorizationError(
        'Access Denied (403): Only Founder / Director can update employment details.',
        403,
        'INSUFFICIENT_ROLE_PERMISSIONS'
      );
    }
    const allDetails = this.get<Record<string, EmploymentDetails>>('employment', initialEmploymentDetails);
    const existing = allDetails[targetUserId] || {
      employeeId: 'EMP-1002',
      joiningDate: new Date().toISOString().split('T')[0],
      designation: 'Team Member',
      department: 'Engineering',
      reportingPerson: 'Shwetha (Managing Director)',
      employmentStatus: 'Full-Time' as const,
    };
    const updated = { ...existing, ...updates };
    allDetails[targetUserId] = updated;
    this.set('employment', allDetails);
    this.recordAudit(actor.name, 'UPDATE_EMPLOYMENT', 'EmploymentDetails', targetUserId, `Updated employment details for ${targetUserId}`);
    return updated;
  }

  deleteEmployeeRecords(targetUserId: string, actor: User): boolean {
    if (!isFounder(actor.role)) {
      this.recordAudit(
        actor.name,
        'SECURITY_VIOLATION',
        'EmployeeRecord',
        targetUserId,
        `Unauthorized removal attempt: ${actor.name} (${actor.role}) tried to delete employee ${targetUserId}`
      );
      throw new AuthorizationError(
        'Access Denied (403): Only Founder / Director can remove employee records.',
        403,
        'INSUFFICIENT_ROLE_PERMISSIONS'
      );
    }

    const profiles = this.get<Record<string, EmployeeProfile>>('profiles', initialProfiles);
    if (profiles[targetUserId]) {
      delete profiles[targetUserId];
      this.set('profiles', profiles);
    }

    const allDetails = this.get<Record<string, EmploymentDetails>>('employment', initialEmploymentDetails);
    if (allDetails[targetUserId]) {
      delete allDetails[targetUserId];
      this.set('employment', allDetails);
    }

    this.recordAudit(
      actor.name,
      'REMOVE_EMPLOYEE',
      'EmployeeRecord',
      targetUserId,
      `Founder ${actor.name} permanently removed employee ${targetUserId} from organizational registry`
    );

    return true;
  }

  // --- Tasks ---
  getTasks(requestingUser: User): Task[] {
    const tasks = this.get<Task[]>('tasks', initialTasks);
    // Founder sees all tasks; Employee sees only their own assigned tasks
    if (isFounder(requestingUser.role)) {
      return tasks;
    }
    return tasks.filter((t) => t.assigneeId === requestingUser.id);
  }

  getAllTasksAdmin(requestingUser: User): Task[] {
    // Backend RBAC: Cross-company task matrix requires Founder/Director role
    if (!isFounder(requestingUser.role)) {
      this.recordAudit(
        requestingUser.name,
        'SECURITY_VIOLATION',
        'TaskMatrix',
        'company_wide',
        `Unauthorized access attempt: ${requestingUser.name} (${requestingUser.role}) tried to access company-wide task matrix`
      );
      throw new AuthorizationError(
        'Access Denied (403): Company-wide employee task matrix is restricted to Founder/Director.',
        403,
        'INSUFFICIENT_ROLE_PERMISSIONS'
      );
    }
    return this.get<Task[]>('tasks', initialTasks);
  }

  addTask(
    task: Omit<Task, 'id' | 'assignedDate' | 'creatorId'> & { assignedDate?: string; status?: Task['status'] },
    creator: User
  ): Task {
    if (!isFounder(creator.role)) {
      this.recordAudit(
        creator.name,
        'SECURITY_VIOLATION',
        'Task',
        'create',
        `Unauthorized access attempt: ${creator.name} (${creator.role}) tried to create a task`
      );
      throw new AuthorizationError(
        'Access Denied (403): Only Founder / Director can assign new company tasks.',
        403,
        'INSUFFICIENT_ROLE_PERMISSIONS'
      );
    }
    const tasks = this.get<Task[]>('tasks', initialTasks);
    const newTask: Task = {
      ...task,
      id: `tsk_${Date.now()}`,
      assignedDate: task.assignedDate || new Date().toISOString().split('T')[0],
      status: task.status || 'not_started',
      creatorId: creator.id,
    };
    tasks.unshift(newTask);
    this.set('tasks', tasks);
    this.recordAudit(creator.name, 'CREATE_TASK', 'Task', newTask.id, `Created task: "${newTask.title}" for ${newTask.assigneeName}`);
    return newTask;
  }

  updateTaskStatus(
    taskId: string,
    status: Task['status'],
    progress: number,
    actor: User,
    notes?: string
  ): void {
    const tasks = this.get<Task[]>('tasks', initialTasks);
    const idx = tasks.findIndex((t) => t.id === taskId);
    if (idx !== -1) {
      tasks[idx].status = status;
      tasks[idx].progress = progress;
      if (status === 'completed') {
        tasks[idx].completedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
        if (notes) tasks[idx].completionNotes = notes;
      }
      this.set('tasks', tasks);

      // Add Task Update
      if (notes) {
        this.addTaskUpdate(taskId, actor.name, notes, progress);
      }
      this.recordAudit(actor.name, 'UPDATE_TASK', 'Task', taskId, `Status changed to ${status} (${progress}%)`);
    }
  }

  deleteTask(taskId: string, actor: User): void {
    if (!isFounder(actor.role)) {
      this.recordAudit(
        actor.name,
        'SECURITY_VIOLATION',
        'Task',
        taskId,
        `Unauthorized access attempt: ${actor.name} (${actor.role}) tried to delete task ${taskId}`
      );
      throw new AuthorizationError(
        'Access Denied (403): Only Founder / Director can delete tasks.',
        403,
        'INSUFFICIENT_ROLE_PERMISSIONS'
      );
    }
    let tasks = this.get<Task[]>('tasks', initialTasks);
    tasks = tasks.filter((t) => t.id !== taskId);
    this.set('tasks', tasks);
    this.recordAudit(actor.name, 'DELETE_TASK', 'Task', taskId, `Deleted task ${taskId}`);
  }

  getTaskUpdates(taskId: string): TaskUpdate[] {
    const allUpdates = this.get<Record<string, TaskUpdate[]>>('task_updates', initialTaskUpdates);
    return allUpdates[taskId] || [];
  }

  addTaskUpdate(taskId: string, authorName: string, text: string, progress: number): void {
    const allUpdates = this.get<Record<string, TaskUpdate[]>>('task_updates', initialTaskUpdates);
    const list = allUpdates[taskId] || [];
    list.unshift({
      id: `upd_${Date.now()}`,
      taskId,
      authorName,
      updateText: text,
      progress,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    });
    allUpdates[taskId] = list;
    this.set('task_updates', allUpdates);
  }

  // --- Work Hours ---
  getWorkHourMethod(): WorkHourRecordingMethod {
    return this.get<WorkHourRecordingMethod>('work_hour_method', 'clock_in_out');
  }

  setWorkHourMethod(method: WorkHourRecordingMethod, actor: User): void {
    if (!isFounder(actor.role)) {
      this.recordAudit(
        actor.name,
        'SECURITY_VIOLATION',
        'WorkHourPolicy',
        'policy',
        `Unauthorized attempt to change work hour method by ${actor.name} (${actor.role})`
      );
      throw new AuthorizationError(
        'Access Denied (403): Only Founder / Director can change company work hour recording policy.',
        403,
        'INSUFFICIENT_ROLE_PERMISSIONS'
      );
    }
    this.set('work_hour_method', method);
    this.recordAudit(
      actor.name,
      'UPDATE_WORK_HOUR_POLICY',
      'WorkHourPolicy',
      'policy',
      `Updated work hour recording method to "${method}"`
    );
  }

  getWorkHours(targetEmployeeId: string, requestingUser?: User): WorkHour[] {
    // Zero-Trust RBAC: If requestingUser is passed, enforce that employees can only view their own history.
    if (requestingUser && !isFounder(requestingUser.role) && requestingUser.id !== targetEmployeeId) {
      this.recordAudit(
        requestingUser.name,
        'SECURITY_VIOLATION',
        'WorkHour',
        targetEmployeeId,
        `Unauthorized access attempt: ${requestingUser.name} (${requestingUser.role}) tried to access work hours of ${targetEmployeeId}`
      );
      throw new AuthorizationError(
        `Access Denied (403): You do not have permission to view work hour history for employee ID "${targetEmployeeId}".`,
        403,
        'WORK_HOURS_ISOLATION_VIOLATION'
      );
    }
    const list = this.get<WorkHour[]>('work_hours', initialWorkHours);
    return list.filter((w) => w.employeeId === targetEmployeeId);
  }

  getAllWorkHoursAdmin(requestingUser: User): WorkHour[] {
    // Zero-Trust RBAC: Company-wide work hours matrix requires Founder/Director role
    if (!isFounder(requestingUser.role)) {
      this.recordAudit(
        requestingUser.name,
        'SECURITY_VIOLATION',
        'WorkHour',
        'company_wide',
        `Unauthorized access attempt: ${requestingUser.name} (${requestingUser.role}) tried to access company-wide work hours`
      );
      throw new AuthorizationError(
        'Access Denied (403): Viewing company-wide employee work hours is restricted to Founder / Director.',
        403,
        'INSUFFICIENT_ROLE_PERMISSIONS'
      );
    }
    return this.get<WorkHour[]>('work_hours', initialWorkHours);
  }

  logWorkHours(entry: Omit<WorkHour, 'id'>, actor: User): WorkHour {
    const list = this.get<WorkHour[]>('work_hours', initialWorkHours);
    const newEntry: WorkHour = {
      ...entry,
      id: `wh_${Date.now()}`,
      employeeName: entry.employeeName || actor.name,
      status: entry.status || (isFounder(actor.role) ? 'approved' : 'pending'),
      recordingMethod: entry.recordingMethod || this.getWorkHourMethod(),
    };
    list.unshift(newEntry);
    this.set('work_hours', list);
    this.recordAudit(
      actor.name,
      'LOG_WORK_HOURS',
      'WorkHour',
      newEntry.id,
      `Logged ${newEntry.totalHours} hrs for ${newEntry.date} (${newEntry.status})`
    );
    return newEntry;
  }

  updateWorkHourStatus(workHourId: string, status: WorkHourStatus, actor: User): void {
    if (!isFounder(actor.role)) {
      this.recordAudit(
        actor.name,
        'SECURITY_VIOLATION',
        'WorkHour',
        workHourId,
        `Unauthorized attempt to change status of work hour ${workHourId} by ${actor.name}`
      );
      throw new AuthorizationError(
        'Access Denied (403): Only Founder / Director can approve or reject work hour submissions.',
        403,
        'INSUFFICIENT_ROLE_PERMISSIONS'
      );
    }
    const list = this.get<WorkHour[]>('work_hours', initialWorkHours);
    const idx = list.findIndex((w) => w.id === workHourId);
    if (idx !== -1) {
      list[idx].status = status;
      list[idx].approvedBy = `${actor.name} (${actor.designation || 'Director'})`;
      list[idx].approvedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
      this.set('work_hours', list);
      this.recordAudit(actor.name, 'UPDATE_WORK_HOUR_STATUS', 'WorkHour', workHourId, `Changed status to "${status}"`);
    }
  }

  getActiveClockSession(employeeId: string): ActiveClockSession | null {
    const sessions = this.get<Record<string, ActiveClockSession>>('active_clock_sessions', {});
    return sessions[employeeId] || null;
  }

  clockIn(employeeId: string, actor: User, notes?: string): ActiveClockSession {
    const sessions = this.get<Record<string, ActiveClockSession>>('active_clock_sessions', {});
    const now = new Date();
    const session: ActiveClockSession = {
      employeeId,
      clockInTime: now.toISOString(),
      date: now.toISOString().split('T')[0],
      notes,
    };
    sessions[employeeId] = session;
    this.set('active_clock_sessions', sessions);
    this.recordAudit(actor.name, 'CLOCK_IN', 'WorkHour', employeeId, `Clocked in at ${now.toLocaleTimeString()}`);
    return session;
  }

  clockOut(employeeId: string, actor: User, notes?: string): WorkHour {
    const sessions = this.get<Record<string, ActiveClockSession>>('active_clock_sessions', {});
    const session = sessions[employeeId];
    const now = new Date();
    let totalHours = 8.0;
    let clockInFormatted = '09:00 AM';

    if (session) {
      const start = new Date(session.clockInTime);
      const diffMs = now.getTime() - start.getTime();
      // Round to 2 decimal places with minimum 0.05
      totalHours = Math.max(0.1, Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100);
      clockInFormatted = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      delete sessions[employeeId];
      this.set('active_clock_sessions', sessions);
    }

    const clockOutFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newEntry: WorkHour = {
      id: `wh_${Date.now()}`,
      employeeId,
      employeeName: actor.name,
      date: now.toISOString().split('T')[0],
      clockIn: clockInFormatted,
      clockOut: clockOutFormatted,
      totalHours,
      status: isFounder(actor.role) ? 'approved' : 'pending',
      recordingMethod: 'clock_in_out',
      notes: notes || session?.notes || 'Real-time tracked work session',
    };

    const list = this.get<WorkHour[]>('work_hours', initialWorkHours);
    list.unshift(newEntry);
    this.set('work_hours', list);
    this.recordAudit(
      actor.name,
      'CLOCK_OUT',
      'WorkHour',
      newEntry.id,
      `Clocked out at ${clockOutFormatted} (${totalHours} hrs)`
    );
    return newEntry;
  }

  // --- Document Center ---
  getDocuments(requestingUser: User, targetEmployeeId?: string): EmployeeDocument[] {
    const docs = this.get<EmployeeDocument[]>('documents', initialDocuments);
    if (isFounder(requestingUser.role)) {
      if (targetEmployeeId) {
        return docs.filter((d) => d.employeeId === targetEmployeeId);
      }
      return docs;
    }
    // Strict RBAC: Employee attempting to request another employee's documents
    if (targetEmployeeId && targetEmployeeId !== requestingUser.id) {
      this.recordAudit(
        requestingUser.name,
        'SECURITY_VIOLATION',
        'Document',
        targetEmployeeId,
        `Unauthorized access attempt: ${requestingUser.name} (${requestingUser.role}) tried to access documents of employee ${targetEmployeeId}`
      );
      throw new AuthorizationError(
        `Access Denied (403): You are strictly forbidden from viewing private documents belonging to employee ID "${targetEmployeeId}".`,
        403,
        'DOCUMENT_ISOLATION_VIOLATION'
      );
    }
    // Employee can ONLY see their own documents
    return docs.filter((d) => d.employeeId === requestingUser.id);
  }

  addDocument(doc: Omit<EmployeeDocument, 'id' | 'uploadDate' | 'uploaderName'>, actor: User): EmployeeDocument {
    const docs = this.get<EmployeeDocument[]>('documents', initialDocuments);
    const newDoc: EmployeeDocument = {
      ...doc,
      id: `doc_${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0],
      uploaderName: actor.name,
    };
    docs.unshift(newDoc);
    this.set('documents', docs);
    this.recordAudit(actor.name, 'UPLOAD_DOCUMENT', 'Document', newDoc.id, `Uploaded ${newDoc.category}: "${newDoc.name}"`);
    return newDoc;
  }

  // --- Announcements ---
  getAnnouncements(): Announcement[] {
    return this.get<Announcement[]>('announcements', initialAnnouncements);
  }

  publishAnnouncement(ann: Omit<Announcement, 'id' | 'publishTime' | 'acknowledgedUserIds'>, actor: User): Announcement {
    if (!isFounder(actor.role)) {
      this.recordAudit(
        actor.name,
        'SECURITY_VIOLATION',
        'Announcement',
        'broadcast',
        `Unauthorized attempt: Employee ${actor.name} attempted to publish company announcement`
      );
      throw new AuthorizationError('Access Denied (403): Only Founder/Director can publish official company announcements.', 403, 'FORBIDDEN');
    }
    const list = this.get<Announcement[]>('announcements', initialAnnouncements);
    const newAnn: Announcement = {
      ...ann,
      id: `ann_${Date.now()}`,
      publishTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      acknowledgedUserIds: [],
    };
    list.unshift(newAnn);
    this.set('announcements', list);
    this.recordAudit(actor.name, 'PUBLISH_ANNOUNCEMENT', 'Announcement', newAnn.id, `Published announcement: "${newAnn.title}"`);
    return newAnn;
  }

  acknowledgeAnnouncement(annId: string, userId: string, userName: string): void {
    const list = this.get<Announcement[]>('announcements', initialAnnouncements);
    const item = list.find((a) => a.id === annId);
    if (item && !item.acknowledgedUserIds.includes(userId)) {
      item.acknowledgedUserIds.push(userId);
      this.set('announcements', list);
      this.recordAudit(userName, 'ACKNOWLEDGE_ANNOUNCEMENT', 'Announcement', annId, 'Confirmed receipt of announcement');
    }
  }

  // --- Messenger ---
  getMessages(): Message[] {
    return this.get<Message[]>('messages', initialMessages);
  }

  sendMessage(senderId: string, recipientId: string, content: string): Message {
    const messages = this.get<Message[]>('messages', initialMessages);
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      conversationId: 'conv_founder_emp1',
      senderId,
      recipientId,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    messages.push(newMsg);
    this.set('messages', messages);
    return newMsg;
  }

  // --- Company Roadmap ---
  getRoadmap(): RoadmapItem[] {
    return this.get<RoadmapItem[]>('roadmap', initialRoadmapItems);
  }

  addRoadmapItem(item: Omit<RoadmapItem, 'id' | 'updatedAt' | 'updatedBy'>, actor: User): RoadmapItem {
    if (!isFounder(actor.role)) {
      this.recordAudit(actor.name, 'SECURITY_VIOLATION', 'Roadmap', 'create', `Unauthorized attempt: Employee ${actor.name} tried to create roadmap item`);
      throw new AuthorizationError('Access Denied (403): Only Founder/Director can manage company roadmap milestones.', 403, 'FORBIDDEN');
    }
    const list = this.get<RoadmapItem[]>('roadmap', initialRoadmapItems);
    const newItem: RoadmapItem = {
      ...item,
      id: `rdm_${Date.now()}`,
      updatedAt: new Date().toISOString().split('T')[0],
      updatedBy: actor.name,
    };
    list.unshift(newItem);
    this.set('roadmap', list);
    this.recordAudit(actor.name, 'CREATE_ROADMAP_ITEM', 'RoadmapItem', newItem.id, `Created milestone: "${newItem.title}"`);
    return newItem;
  }

  updateRoadmapStatus(id: string, status: RoadmapItem['status'], actor: User): void {
    if (!isFounder(actor.role)) {
      this.recordAudit(actor.name, 'SECURITY_VIOLATION', 'Roadmap', id, `Unauthorized attempt: Employee ${actor.name} tried to update roadmap status`);
      throw new AuthorizationError('Access Denied (403): Only Founder/Director can edit roadmap milestones.', 403, 'FORBIDDEN');
    }
    const list = this.get<RoadmapItem[]>('roadmap', initialRoadmapItems);
    const item = list.find((r) => r.id === id);
    if (item) {
      item.status = status;
      item.updatedAt = new Date().toISOString().split('T')[0];
      item.updatedBy = actor.name;
      this.set('roadmap', list);
      this.recordAudit(actor.name, 'UPDATE_ROADMAP', 'RoadmapItem', id, `Changed status to ${status}`);
    }
  }

  // --- Finance (Founder Only) ---
  getFinanceTransactions(requestingUser: User): FinanceTransaction[] {
    if (!isFounder(requestingUser.role)) {
      this.recordAudit(requestingUser.name, 'SECURITY_VIOLATION', 'FinanceTransaction', 'all', `Unauthorized access attempt: Employee ${requestingUser.name} tried to fetch financial transactions`);
      throw new AuthorizationError('Access Denied (403): Financial records are strictly restricted to Founder/Director level.', 403, 'FINANCE_ACCESS_DENIED');
    }
    return this.get<FinanceTransaction[]>('finance_transactions', initialFinanceTransactions);
  }

  addFinanceTransaction(
    tx: Omit<FinanceTransaction, 'id' | 'creatorName'>,
    actor: User
  ): FinanceTransaction {
    if (!isFounder(actor.role)) {
      this.recordAudit(actor.name, 'SECURITY_VIOLATION', 'FinanceTransaction', 'create', `Unauthorized attempt: Employee ${actor.name} tried to record a finance transaction`);
      throw new AuthorizationError('Access Denied (403): Recording financial transactions is restricted to Founder/Director.', 403, 'FINANCE_ACCESS_DENIED');
    }
    const list = this.get<FinanceTransaction[]>('finance_transactions', initialFinanceTransactions);
    const newTx: FinanceTransaction = {
      ...tx,
      id: `ft_${Date.now()}`,
      creatorName: actor.name,
    };
    list.unshift(newTx);
    this.set('finance_transactions', list);
    this.recordAudit(actor.name, 'RECORD_FINANCE', 'FinanceTransaction', newTx.id, `${newTx.type.toUpperCase()}: $${newTx.amount.toLocaleString()} (${newTx.category})`);
    return newTx;
  }

  getGrowthMetrics(requestingUser: User) {
    if (!isFounder(requestingUser.role)) {
      this.recordAudit(requestingUser.name, 'SECURITY_VIOLATION', 'GrowthMetric', 'all', `Unauthorized attempt: Employee ${requestingUser.name} tried to view company growth metrics`);
      throw new AuthorizationError('Access Denied (403): Company growth trajectory analytics are restricted to Founder/Director.', 403, 'GROWTH_ACCESS_DENIED');
    }
    return this.get('growth_metrics', initialGrowthMetrics);
  }

  getBalanceSheet(requestingUser: User): BalanceSheetEntry[] {
    if (!isFounder(requestingUser.role)) {
      this.recordAudit(requestingUser.name, 'SECURITY_VIOLATION', 'BalanceSheet', 'all', `Unauthorized attempt: Employee ${requestingUser.name} tried to view balance sheet`);
      throw new AuthorizationError('Access Denied (403): Balance sheet statements are strictly restricted to Founder/Director.', 403, 'BALANCE_SHEET_ACCESS_DENIED');
    }
    return this.get<BalanceSheetEntry[]>('balance_sheet', initialBalanceSheet);
  }

  // --- Audit Log ---
  getAuditLogs(requestingUser: User): AuditLog[] {
    if (!isFounder(requestingUser.role)) {
      this.recordAudit(requestingUser.name, 'SECURITY_VIOLATION', 'AuditLog', 'all', `Unauthorized attempt: Employee ${requestingUser.name} tried to access audit logs`);
      throw new AuthorizationError('Access Denied (403): Security and audit logs are restricted to Founder/Director level.', 403, 'AUDIT_ACCESS_DENIED');
    }
    return this.get<AuditLog[]>('audit_logs', initialAuditLogs);
  }

  private recordAudit(user: string, action: string, entity: string, entityId: string, changeSummary: string): void {
    const logs = this.get<AuditLog[]>('audit_logs', initialAuditLogs);
    const newLog: AuditLog = {
      id: `aud_${Date.now()}`,
      user,
      action,
      entity,
      entityId,
      changeSummary,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    logs.unshift(newLog);
    this.set('audit_logs', logs.slice(0, 100)); // retain latest 100
  }
}

export const storageService = new StorageService();
