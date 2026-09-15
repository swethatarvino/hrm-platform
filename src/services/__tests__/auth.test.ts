import { authService, AuthorizationError } from '../authService';
import { storageService } from '../storageService';
import { initialUsers } from '../mockData';
import { isFounder, isEmployee } from '../../types';
import { verifyPassword } from '../cryptoUtils';

export interface TestResult {
  id: string;
  name: string;
  status: 'passed' | 'failed';
  message: string;
  durationMs: number;
}

/**
 * Module 1: Comprehensive Authentication and Authorization Test Suite
 * Validates role-based authentication, salted password hashing,
 * admin employee creation, and zero-trust backend authorization.
 */
export async function runAuthTestSuite(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  const record = (id: string, name: string, fn: () => void | Promise<void>) => {
    const start = performance.now();
    try {
      fn();
      results.push({
        id,
        name,
        status: 'passed',
        message: 'Assertion passed successfully.',
        durationMs: Math.round(performance.now() - start),
      });
    } catch (err: any) {
      results.push({
        id,
        name,
        status: 'failed',
        message: err?.message || 'Assertion failed',
        durationMs: Math.round(performance.now() - start),
      });
    }
  };

  // Test 1: Employee login
  record('TEST-1', 'Employee Login Authentication & Role Determination', () => {
    const session = authService.authenticate('david.miller@apextech.io', 'Password@123');
    if (!session.token) throw new Error('No token returned for employee session');
    if (session.user.role !== 'EMPLOYEE') {
      throw new Error(`Expected role EMPLOYEE, received: ${session.user.role}`);
    }
    const payload = authService.verifyToken(session.token);
    if (payload.sub !== 'usr_emp_1') throw new Error('Token payload sub mismatch');
    if (payload.role !== 'EMPLOYEE') throw new Error('Token payload role mismatch');
  });

  // Test 2: Founder login
  record('TEST-2', 'Founder/Director Login Authentication & Role Determination', () => {
    const session = authService.authenticate('shwetha@apextech.io', 'Password@123');
    if (!session.token) throw new Error('No token returned for founder session');
    if (session.user.role !== 'FOUNDER_DIRECTOR') {
      throw new Error(`Expected role FOUNDER_DIRECTOR, received: ${session.user.role}`);
    }
    const payload = authService.verifyToken(session.token);
    if (!isFounder(payload.role)) throw new Error('isFounder check failed on founder token');
  });

  // Test 3: Invalid login
  record('TEST-3', 'Invalid Login Credentials Rejection (401)', () => {
    let errorThrown = false;
    try {
      authService.authenticate('nonexistent.user@company.com', 'WrongPassword!123');
    } catch (e: any) {
      errorThrown = true;
      if (!(e instanceof AuthorizationError)) {
        throw new Error('Expected AuthorizationError instance');
      }
      if (e.statusCode !== 401) {
        throw new Error(`Expected status code 401, received: ${e.statusCode}`);
      }
    }
    if (!errorThrown) throw new Error('Authentication succeeded for invalid credentials');
  });

  // Test 4: Protected route / token verification
  record('TEST-4', 'Protected Token Validation & Expiry Guard (401)', () => {
    let rejected = false;
    try {
      authService.verifyToken('invalid.malformed.token');
    } catch (e: any) {
      rejected = true;
      if (e.statusCode !== 401) throw new Error('Expected 401 for malformed token');
    }
    if (!rejected) throw new Error('Malformed token was not rejected');
  });

  // Test 5: Employee attempting restricted API access (Finance / Private Docs)
  record('TEST-5', 'Employee Attempting Restricted API Access (403 Forbidden)', () => {
    const employeeUser = initialUsers.find((u) => u.role === 'EMPLOYEE')!;

    // Case A: Employee trying to access management finance transactions
    let financeBlocked = false;
    try {
      storageService.getFinanceTransactions(employeeUser);
    } catch (e: any) {
      financeBlocked = true;
      if (e.statusCode !== 403) throw new Error(`Expected 403 for finance access, got ${e.statusCode}`);
    }
    if (!financeBlocked) throw new Error('Employee was able to fetch management finance records');

    // Case B: Employee trying to access another employee's private documents
    let docsBlocked = false;
    try {
      storageService.getDocuments(employeeUser, 'usr_founder');
    } catch (e: any) {
      docsBlocked = true;
      if (e.statusCode !== 403) throw new Error(`Expected 403 for other employee docs, got ${e.statusCode}`);
    }
    if (!docsBlocked) throw new Error('Employee was able to query another employee documents');

    // Case C: Employee trying to access another employee's employment details
    let employmentBlocked = false;
    try {
      storageService.getEmploymentDetails('usr_founder', employeeUser);
    } catch (e: any) {
      employmentBlocked = true;
      if (e.statusCode !== 403) throw new Error(`Expected 403 for protected employment details, got ${e.statusCode}`);
    }
    if (!employmentBlocked) throw new Error('Employee was able to read another employee private record');
  });

  // Test 6: Founder accessing employee management
  record('TEST-6', 'Founder Accessing Employee Management (Authorized)', () => {
    const founderUser = initialUsers.find((u) => u.role === 'FOUNDER_DIRECTOR')!;

    // Founder can access company-wide task matrix
    const allTasks = storageService.getAllTasksAdmin(founderUser);
    if (!Array.isArray(allTasks) || allTasks.length === 0) {
      throw new Error('Founder failed to retrieve admin task matrix');
    }

    // Founder can view another employee's employment details
    const empDetails = storageService.getEmploymentDetails('usr_emp_1', founderUser);
    if (!empDetails) throw new Error('Founder was unable to view employee employment details');

    // Founder can view financial transactions
    const finances = storageService.getFinanceTransactions(founderUser);
    if (!Array.isArray(finances)) throw new Error('Founder was unable to view finance ledger');
  });

  // Test 7: Admin creates employee with salted hashed password
  const testNewEmail = `test.employee.${Date.now()}@apextech.io`;
  const testNewPassword = 'TestEmpSecurePass@2026';
  let createdUserId = '';

  record('TEST-7', 'Admin Creates Employee with Salted Hashed Password', () => {
    const founderUser = initialUsers.find((u) => u.role === 'FOUNDER_DIRECTOR')!;

    const res = authService.createEmployeeByAdmin(founderUser, {
      name: 'Rohan Sharma',
      personalEmail: 'rohan.sharma.personal@gmail.com',
      email: testNewEmail,
      password: testNewPassword,
      department: 'Engineering',
      designation: 'Backend Engineer',
      employmentStatus: 'Full-Time',
    });

    if (!res.user || res.user.role !== 'EMPLOYEE') {
      throw new Error(`Expected newly created user to have role EMPLOYEE, got: ${res.user?.role}`);
    }
    if (!res.employeeId.startsWith('EMP-')) {
      throw new Error(`Invalid employeeId format: ${res.employeeId}`);
    }

    createdUserId = res.user.id;

    // Verify stored credential is cryptographically hashed with salt
    const credentials = authService.getCredentials();
    const cred = credentials.find((c) => c.userId === res.user.id);
    if (!cred) throw new Error('No credential saved in database for new employee');
    if (!cred.salt || cred.salt.length < 8) throw new Error('Missing or weak salt for credential');
    if (!cred.passwordHash || cred.passwordHash === testNewPassword) {
      throw new Error('Password was stored in plain-text instead of being hashed!');
    }

    // Verify hash matches
    const isValid = verifyPassword(testNewPassword, cred.salt, cred.passwordHash);
    if (!isValid) throw new Error('Password hash does not verify against stored salt and hash');
  });

  // Test 8: Newly created employee logs in and role is resolved as EMPLOYEE
  record('TEST-8', 'Newly Created Employee Login & Role Resolution', () => {
    const session = authService.authenticate(testNewEmail, testNewPassword);
    if (!session.token) throw new Error('No token returned for newly created employee');
    if (session.user.role !== 'EMPLOYEE') {
      throw new Error(`Expected role EMPLOYEE, received: ${session.user.role}`);
    }
    const payload = authService.verifyToken(session.token);
    if (payload.role !== 'EMPLOYEE') {
      throw new Error(`Expected token role EMPLOYEE, received: ${payload.role}`);
    }
  });

  // Test 9: Non-Admin blocked from creating employee
  record('TEST-9', 'Non-Admin Blocked from Creating Employee (403 Forbidden)', () => {
    const employeeUser = initialUsers.find((u) => u.role === 'EMPLOYEE')!;
    let blocked = false;
    try {
      authService.createEmployeeByAdmin(employeeUser, {
        name: 'Malicious Attempt',
        personalEmail: 'malicious.personal@gmail.com',
        email: 'malicious@apextech.io',
        password: 'Password@123',
        department: 'Executive',
        designation: 'Director',
      });
    } catch (e: any) {
      blocked = true;
      if (e.statusCode !== 403) throw new Error(`Expected 403 Forbidden, got ${e.statusCode}`);
    }
    if (!blocked) throw new Error('Non-admin was able to invoke createEmployeeByAdmin!');
  });

  // Test 10: Module 4 - Employee logs work hours
  let createdWorkHourId = '';
  record('TEST-10', 'Module 4: Employee Logs Work Hours (Pending Status)', () => {
    const employeeUser = initialUsers.find((u) => u.role === 'EMPLOYEE')!;
    const entry = storageService.logWorkHours(
      {
        employeeId: employeeUser.id,
        date: '2026-09-11',
        clockIn: '09:00 AM',
        clockOut: '05:30 PM',
        totalHours: 8.5,
        status: 'pending',
        notes: 'Built Module 4 test suite and verified work hours',
        recordingMethod: 'manual',
      },
      employeeUser
    );

    if (!entry.id.startsWith('wh_')) throw new Error('Invalid work hour ID generated');
    if (entry.status !== 'pending') throw new Error(`Expected status pending, got: ${entry.status}`);
    if (entry.totalHours !== 8.5) throw new Error(`Expected 8.5 totalHours, got: ${entry.totalHours}`);
    createdWorkHourId = entry.id;
  });

  // Test 11: Module 4 - Employee data isolation on work hours
  record('TEST-11', 'Module 4: Work Hours Privacy Isolation (403 Forbidden)', () => {
    const employeeUser = initialUsers.find((u) => u.role === 'EMPLOYEE')!;
    let blocked = false;
    try {
      // Employee attempting to query another employee's work hours
      storageService.getWorkHours('usr_founder', employeeUser);
    } catch (e: any) {
      blocked = true;
      if (e.statusCode !== 403) throw new Error(`Expected 403 Forbidden, got: ${e.statusCode}`);
    }
    if (!blocked) throw new Error('Employee was able to fetch another employee work hours!');
  });

  // Test 12: Module 4 - Founder company-wide work hours view & approval
  record('TEST-12', 'Module 4: Founder Company-Wide View & Approval Action', () => {
    const founderUser = initialUsers.find((u) => u.role === 'FOUNDER_DIRECTOR')!;
    const allHours = storageService.getAllWorkHoursAdmin(founderUser);
    if (!Array.isArray(allHours) || allHours.length === 0) {
      throw new Error('Founder failed to retrieve company-wide work hours');
    }

    // Founder approves the work hour created in TEST-10
    if (createdWorkHourId) {
      storageService.updateWorkHourStatus(createdWorkHourId, 'approved', founderUser);
      const updatedList = storageService.getAllWorkHoursAdmin(founderUser);
      const target = updatedList.find((w) => w.id === createdWorkHourId);
      if (!target || target.status !== 'approved') {
        throw new Error('Failed to update work hour status to approved');
      }
    }
  });

  // Test 13: Module 4 - Configurable recording method policy
  record('TEST-13', 'Module 4: Configurable Recording Policy & Non-Admin Guard', () => {
    const founderUser = initialUsers.find((u) => u.role === 'FOUNDER_DIRECTOR')!;
    const employeeUser = initialUsers.find((u) => u.role === 'EMPLOYEE')!;

    // Founder can set policy
    storageService.setWorkHourMethod('manual', founderUser);
    if (storageService.getWorkHourMethod() !== 'manual') {
      throw new Error('Failed to update recording policy to manual');
    }

    storageService.setWorkHourMethod('clock_in_out', founderUser);
    if (storageService.getWorkHourMethod() !== 'clock_in_out') {
      throw new Error('Failed to update recording policy to clock_in_out');
    }

    // Employee blocked from changing policy
    let policyBlocked = false;
    try {
      storageService.setWorkHourMethod('timesheet', employeeUser);
    } catch (e: any) {
      policyBlocked = true;
      if (e.statusCode !== 403) throw new Error(`Expected 403 Forbidden, got: ${e.statusCode}`);
    }
    if (!policyBlocked) throw new Error('Employee was able to alter company work hour recording policy!');
  });

  // Test 14: Founder updates employee compensation package
  record('TEST-14', 'Founder Updates Employee Compensation Package (Authorized)', () => {
    const founderUser = initialUsers.find((u) => u.role === 'FOUNDER_DIRECTOR')!;
    const employeeUser = initialUsers.find((u) => u.role === 'EMPLOYEE')!;

    const updatedDetails = storageService.updateEmploymentDetails(
      employeeUser.id,
      { compensation: '$155,000 / annum + 15% Bonus Tier' },
      founderUser
    );

    if (updatedDetails.compensation !== '$155,000 / annum + 15% Bonus Tier') {
      throw new Error(`Expected compensation to be updated, got: ${updatedDetails.compensation}`);
    }

    const fetched = storageService.getEmploymentDetails(employeeUser.id, founderUser);
    if (fetched?.compensation !== '$155,000 / annum + 15% Bonus Tier') {
      throw new Error('Fetched compensation does not match updated value');
    }
  });

  // Test 15: Non-Admin blocked from removing an employee
  record('TEST-15', 'Non-Admin Blocked from Removing Employee (403 Forbidden)', () => {
    const employeeUser = initialUsers.find((u) => u.role === 'EMPLOYEE')!;
    let blocked = false;
    try {
      authService.removeEmployeeByAdmin(employeeUser, 'usr_emp_2');
    } catch (e: any) {
      blocked = true;
      if (e.statusCode !== 403) throw new Error(`Expected 403 Forbidden, got ${e.statusCode}`);
    }
    if (!blocked) throw new Error('Non-admin was able to remove an employee!');
  });

  // Test 16: Guard against removing Founder/Director account
  record('TEST-16', 'Guard Against Removing Founder Account (Protected)', () => {
    const founderUser = initialUsers.find((u) => u.role === 'FOUNDER_DIRECTOR')!;
    let blocked = false;
    try {
      authService.removeEmployeeByAdmin(founderUser, founderUser.id);
    } catch (e: any) {
      blocked = true;
      if (e.statusCode !== 400) throw new Error(`Expected 400 Bad Request, got ${e.statusCode}`);
    }
    if (!blocked) throw new Error('System permitted deleting the executive Founder account!');
  });

  // Test 17: Founder creates temporary employee and removes them
  record('TEST-17', 'Founder Successfully Removes Employee & Purges Login Access', () => {
    const founderUser = initialUsers.find((u) => u.role === 'FOUNDER_DIRECTOR')!;
    
    // 1. Create a test employee
    const created = authService.createEmployeeByAdmin(founderUser, {
      name: 'Temporary Worker',
      personalEmail: 'temp.worker.personal@gmail.com',
      email: 'temp.worker@apextech.io',
      password: 'Password@123',
      department: 'Engineering',
      designation: 'Contractor',
    });

    // 2. Verify account is initially created and can authenticate
    const session = authService.authenticate('temp.worker@apextech.io', 'Password@123');
    if (!session.token) throw new Error('Test employee failed initial login');

    // 3. Founder removes employee
    const res = authService.removeEmployeeByAdmin(founderUser, created.user.id);
    if (!res.success) throw new Error('Founder removeEmployeeByAdmin failed');

    // 4. Verify user is removed from active list
    const allUsers = authService.getAllUsers();
    if (allUsers.some((u) => u.id === created.user.id)) {
      throw new Error('Removed user still visible in active user directory');
    }

    // 5. Verify removed employee can no longer log in
    let loginBlocked = false;
    try {
      authService.authenticate('temp.worker@apextech.io', 'Password@123');
    } catch (e: any) {
      loginBlocked = true;
      if (e.statusCode !== 401) throw new Error(`Expected 401 Unauthorized, got: ${e.statusCode}`);
    }
    if (!loginBlocked) throw new Error('Removed employee was still able to authenticate!');
  });

  // Test 18: Founder updates employee records & profile photo
  record('TEST-18', 'Founder Modifies Employee Records & Photo (Zero-Trust Verified)', () => {
    const founderUser = initialUsers.find((u) => u.role === 'FOUNDER_DIRECTOR')!;
    const employeeUser = initialUsers.find((u) => u.role === 'EMPLOYEE')!;

    const newPhotoUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200';
    const updatedUser = authService.updateUserRecord(founderUser, employeeUser.id, {
      name: 'David Miller (Lead Architect)',
      designation: 'Principal Architect',
      department: 'Engineering',
      avatarUrl: newPhotoUrl,
    });

    if (updatedUser.designation !== 'Principal Architect') {
      throw new Error(`Expected designation Principal Architect, got: ${updatedUser.designation}`);
    }
    if (updatedUser.avatarUrl !== newPhotoUrl) {
      throw new Error('Avatar photo URL was not updated');
    }

    // Verify non-admin blocked from modifying another employee
    const otherEmployee = initialUsers.find((u) => u.id === 'usr_emp_2')!;
    let peerBlocked = false;
    try {
      authService.updateUserRecord(otherEmployee, employeeUser.id, {
        designation: 'Hacked Title',
      });
    } catch (e: any) {
      peerBlocked = true;
      if (e.statusCode !== 403) throw new Error(`Expected 403 Forbidden, got ${e.statusCode}`);
    }
    if (!peerBlocked) throw new Error('Peer employee was able to alter another employee records!');
  });

  return results;
}
