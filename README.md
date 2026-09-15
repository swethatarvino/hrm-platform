# 🏢 White-Label HRM & Executive Management Platform

> Built according to the **8-Page Finalized Developer Specification** (Employee Management • Work Tracking • Founder/Director Visibility • Selected Finance & Growth).

---

## 🚀 How to Run this in Visual Studio Code (Step-by-Step)

Follow these simple steps on your computer:

### Step 1: Open the Project in VS Code
1. Open **Visual Studio Code**.
2. Click **File → Open Folder...** (or press `Ctrl + K, Ctrl + O`).
3. Browse to and select:
   ```text
   C:\Users\anand\.gemini\antigravity\scratch\hrm-platform
   ```
4. Click **Select Folder**. You will now see all the project files in your left sidebar.

### Step 2: Open the Built-in Terminal
1. Press `Ctrl + ~` (or go to top menu: **Terminal → New Terminal**).
2. You will see the PowerShell or command prompt at the bottom of VS Code.

### Step 3: Install Dependencies
Type this command and press Enter:
```bash
npm install
```
*(This downloads React, Tailwind CSS, and Lucide icons specified in `package.json`)*

### Step 4: Start the Application
Type this command and press Enter:
```bash
npm run dev
```

### Step 5: Open in Your Browser
Open your browser and visit:
```text
http://localhost:5173
```
You will immediately see the complete application running!

---

## 💡 How to Test Both Roles (Crucial for Learning)

At the top right of the application header, you have a **1-Click Role Switcher**:
* **Founder View:**
  * Displays the **Executive Dashboard**, **Team Work Matrix**, **Strategic Roadmap**, **Important Announcements Publisher**, **Executive Finance Summary (Cash Inflow, Outflow, Investments)**, **Company Growth Graphs**, and **Quarterly Balance Sheet**.
* **Employee View:**
  * Displays the **Personal Employee Workspace**, **My Tasks & Progress Updates**, **Clock-In / Clock-Out Work Hours**, **Encrypted Document Vault**, **Announcements Reader**, and **Direct 1-on-1 Messenger**.

---

## 🎨 How to Adapt for ANY Client Organization (White-Label)

You asked:
> *"if any clients ask it for their organization i will change accordingly"*

You can change the branding in two ways:

### Method 1: Live in the Web Interface (For Client Demos)
1. Click the **"Brand & Theming"** button in the top navigation bar.
2. Select a pre-built preset (e.g., *Tech Startup (Blue)*, *FinTech & Capital (Emerald)*, *Indian IT Services (Indigo & ₹)*, or *Creative Media (Purple)*).
3. Or type the client's custom company name, logo badge text, currency symbol (`$`, `₹`, `€`, `£`), and hex color code.
4. Click **Save & Apply Theme**. The entire platform, navigation, buttons, and badges will instantly re-theme!

### Method 2: In Code (Before Delivering to Client)
Open [`src/config/organization.config.ts`](./src/config/organization.config.ts) in VS Code. Simply edit:
```typescript
export const defaultOrganizationConfig: OrganizationConfig = {
  name: "Client Organization Name",
  tagline: "Enterprise Management Workspace",
  logoText: "CLNT",
  currencySymbol: "$", // or "₹", "€", "£"
  currencyCode: "USD",
  primaryColor: "#2563eb", // Client's primary brand color
  fiscalYearStartMonth: 1,
  workHourRecordingMethod: 'clock_in_out',
  supportEmail: "ops@clientdomain.com",
};
```

---

## 📚 Code Architecture & Educational Guide

Here is where each module from the specification lives in this codebase:

```text
hrm-platform/
├── src/
│   ├── config/
│   │   └── organization.config.ts    # Centralized white-label engine & theme presets
│   ├── types/
│   │   └── index.ts                  # All 16 Data Models from Section 10 of Spec
│   ├── services/
│   │   ├── mockData.ts               # Seed database for both Founder & Employee
│   │   └── storageService.ts         # Local persistence & RBAC security layer
│   ├── context/
│   │   ├── AuthContext.tsx           # Manages current user and Founder vs Employee role
│   │   └── OrgContext.tsx            # Injects dynamic CSS theme variables
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx            # Brand header, role switcher & customizer trigger
│   │   │   └── Sidebar.tsx           # Navigation enforcing Section 8 route rules
│   │   ├── dashboard/
│   │   │   ├── EmployeeDashboard.tsx # 5 widgets from Section 7 of Spec
│   │   │   └── FounderDashboard.tsx  # 7 executive widgets from Section 7 of Spec
│   │   └── modules/
│   │       ├── ProfileModule.tsx     # Editable info vs protected fields (Section 3)
│   │       ├── TasksModule.tsx       # Work tracking, status, progress % (Section 3 & 4)
│   │       ├── WorkHoursModule.tsx   # Clock-in/out & hours log (Section 3)
│   │       ├── DocumentCenterModule.tsx # Categorized secure vault (Section 3)
│   │       ├── AnnouncementsModule.tsx  # Founder broadcast & employee receipts (Section 3 & 4)
│   │       ├── MessengerModule.tsx   # 1-on-1 direct chat (Section 3)
│   │       ├── RoadmapModule.tsx     # Milestones Kanban board (Section 4)
│   │       ├── TeamVisibilityModule.tsx # Company task matrix & filters (Section 4)
│   │       ├── FinanceModule.tsx     # Inflow, Outflow, Investments (Section 5)
│   │       ├── GrowthModule.tsx      # Monthly/Quarterly growth charts (Section 6)
│   │       ├── BalanceSheetModule.tsx# Categorized balance sheet (Section 6)
│   │       ├── AuditLogModule.tsx    # Management traceability logs (Section 12)
│   │       └── WhiteLabelSettingsModal.tsx # Live rebranding tool
│   ├── App.tsx                       # Main application router
│   ├── main.tsx                      # Root React entry point
│   └── index.css                     # Tailwind CSS & dynamic brand color variables
├── package.json
└── vite.config.ts
```
