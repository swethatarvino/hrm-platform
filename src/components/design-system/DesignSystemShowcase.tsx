import React, { useState } from 'react';
import { PageHeader } from '../ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input, Select, Textarea, Checkbox, SearchInput } from '../ui/FormControls';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../ui/Table';
import { Pagination } from '../ui/Pagination';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { SkeletonCard, SkeletonTable } from '../ui/Skeleton';
import { EmptyState, ErrorState } from '../ui/FeedbackStates';
import { useToast } from '../../context/ToastContext';
import {
  Layers,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Send,
  Eye,
  Download,
  Filter,
} from 'lucide-react';

export const DesignSystemShowcase: React.FC = () => {
  const toast = useToast();

  // State for interactive widgets
  const [btnLoading, setBtnLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [showSkeletons, setShowSkeletons] = useState(false);

  // Sample data for Table & Pagination
  const sampleData = [
    { id: 'EMP-1001', name: 'Sarah Jenkins', role: 'Managing Director', dept: 'Leadership', status: 'success', statusLabel: 'Active' },
    { id: 'EMP-1002', name: 'David Miller', role: 'Lead Developer', dept: 'Engineering', status: 'success', statusLabel: 'Active' },
    { id: 'EMP-1003', name: 'Elena Rostova', role: 'Staff Product Designer', dept: 'Design', status: 'warning', statusLabel: 'On Leave' },
    { id: 'EMP-1004', name: 'Marcus Chen', role: 'Operations Coordinator', dept: 'Operations', status: 'info', statusLabel: 'Probation' },
    { id: 'EMP-1005', name: 'Priya Sharma', role: 'DevOps Specialist', dept: 'Engineering', status: 'error', statusLabel: 'Blocked' },
    { id: 'EMP-1006', name: 'Liam O\'Connor', role: 'QA Automation Lead', dept: 'Engineering', status: 'neutral', statusLabel: 'Draft' },
  ];

  const handleConfirmAction = () => {
    setConfirmLoading(true);
    setTimeout(() => {
      setConfirmLoading(false);
      setIsConfirmOpen(false);
      toast.success('Action Confirmed', 'The destructive operation was completed safely.');
    }, 1000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* 1. Page Header with Breadcrumbs */}
      <PageHeader
        title="Architecture & Design System Foundation"
        description="Module 0: Enterprise UI component library and visual language guidelines. Every future HRM module reuses these accessible primitives."
        breadcrumbs={[
          { label: 'HRM Platform' },
          { label: 'System Design' },
          { label: 'Component Library', active: true },
        ]}
        badge={
          <Badge variant="brand" size="md" withDot>
            Production Foundation
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSkeletons(!showSkeletons)}
            >
              Toggle Skeletons ({showSkeletons ? 'On' : 'Off'})
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Layers className="w-3.5 h-3.5" />}
              onClick={() => toast.info('Design System Ready', 'All 15 component primitives are initialized.')}
            >
              Test Toast Notification
            </Button>
          </div>
        }
      />

      {/* 2. Visual Language & Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>1. Buttons & Semantic Actions</CardTitle>
          <CardDescription>
            High-contrast accessible buttons supporting primary, secondary, destructive, outline, ghost, and loading states.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Primary Action
            </Button>
            <Button variant="secondary">Secondary Action</Button>
            <Button
              variant="destructive"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={() => setIsConfirmOpen(true)}
            >
              Destructive Action
            </Button>
            <Button variant="outline">Outline Action</Button>
            <Button variant="ghost">Ghost Action</Button>
            <Button variant="link">Text Link Action</Button>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3">
            <span className="text-xs text-slate-500 font-semibold mr-2">Sizes:</span>
            <Button variant="primary" size="xs">Extra Small (xs)</Button>
            <Button variant="primary" size="sm">Small (sm)</Button>
            <Button variant="primary" size="md">Medium (md)</Button>
            <Button variant="primary" size="lg">Large (lg)</Button>
            <Button
              variant="secondary"
              size="sm"
              isLoading={btnLoading}
              onClick={() => {
                setBtnLoading(true);
                setTimeout(() => setBtnLoading(false), 1500);
              }}
            >
              {btnLoading ? 'Processing...' : 'Click for Loading State'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 3. Status Badges */}
      <Card>
        <CardHeader>
          <CardTitle>2. Status Badges & Indicators</CardTitle>
          <CardDescription>
            Semantic color tokens for entity statuses across the application lifecycle.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="success" withDot>Success / Completed</Badge>
            <Badge variant="warning" withDot>Warning / At Risk / Pending</Badge>
            <Badge variant="error" withDot>Error / Blocked / Urgent</Badge>
            <Badge variant="info" withDot>Information / In Progress</Badge>
            <Badge variant="brand" withDot>Brand Accent / Leadership</Badge>
            <Badge variant="neutral" withDot>Neutral / Draft / Archived</Badge>
          </div>
        </CardContent>
      </Card>

      {/* 4. Form Controls */}
      <Card>
        <CardHeader>
          <CardTitle>3. Form Controls & Search Input</CardTitle>
          <CardDescription>
            Reusable inputs with floating helper text, error validations, required markers, and search clearing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Input
              label="Standard Text Input"
              placeholder="e.g. Employee Full Name"
              helperText="Informative hint for input criteria"
              required
            />
            <Input
              label="Input with Error State"
              defaultValue="invalid-email-address"
              error="Please provide a valid company email address"
            />
            <Select
              label="Dropdown Select"
              options={[
                { value: 'engineering', label: 'Engineering Department' },
                { value: 'design', label: 'Product Design' },
                { value: 'finance', label: 'Operations & Finance' },
              ]}
              helperText="Choose functional organizational unit"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <SearchInput
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onClear={() => setSearchValue('')}
              placeholder="Live searchable input with auto-clear..."
            />
            <div className="flex items-center gap-4">
              <Checkbox
                label="Require Founder Approval"
                description="Flags this work item for Director sign-off"
                defaultChecked
              />
            </div>
          </div>

          <Textarea
            label="Descriptive Textarea"
            rows={2}
            placeholder="Enter detailed acceptance criteria or work log notes..."
          />
        </CardContent>
      </Card>

      {/* 5. Data Table & Pagination */}
      <Card>
        <CardHeader action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="xs" leftIcon={<Filter className="w-3 h-3" />}>
              Filter
            </Button>
            <Button
              variant="primary"
              size="xs"
              leftIcon={<Plus className="w-3 h-3" />}
              onClick={() => setIsModalOpen(true)}
            >
              Open Modal Dialog
            </Button>
          </div>
        }>
          <CardTitle>4. Reusable Data Table & Pagination</CardTitle>
          <CardDescription>
            Standard enterprise table layout with alternating hover highlights, monospace columns, and pagination controls.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {showSkeletons ? (
            <SkeletonTable rows={4} cols={5} />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead alignRight>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleData.slice(0, pageSize).map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono font-bold text-slate-800">{row.id}</TableCell>
                      <TableCell className="font-semibold text-slate-900">{row.name}</TableCell>
                      <TableCell className="text-slate-600">{row.dept}</TableCell>
                      <TableCell className="text-slate-600">{row.role}</TableCell>
                      <TableCell>
                        <Badge variant={row.status as any} size="sm" withDot>
                          {row.statusLabel}
                        </Badge>
                      </TableCell>
                      <TableCell alignRight>
                        <Button
                          variant="ghost"
                          size="xs"
                          leftIcon={<Eye className="w-3 h-3" />}
                          onClick={() => toast.info('View Record', `Opened profile for ${row.name}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-4 border-t border-slate-100">
                <Pagination
                  currentPage={currentPage}
                  totalPages={3}
                  totalItems={sampleData.length}
                  pageSize={pageSize}
                  onPageChange={(p) => setCurrentPage(p)}
                  onPageSizeChange={(s) => setPageSize(s)}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 6. Feedback & Empty States */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>5. Empty State Pattern</CardTitle>
            <CardDescription>
              User guidance when zero records exist or after applying clearing filters.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="No Pending Work Updates"
              description="All assigned employee deliverables for this reporting cycle have been completed."
              action={{
                label: 'Assign Deliverable',
                onClick: () => toast.success('Trigger Action', 'Create deliverable flow initiated.'),
                icon: <Plus className="w-3.5 h-3.5" />,
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Error State Pattern</CardTitle>
            <CardDescription>
              Graceful degradation when network or server exceptions happen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ErrorState
              title="Unable to Retrieve Financial Ledger"
              message="The backend authorization token timed out or connection was reset."
              onRetry={() => toast.info('Retrying...', 'Re-authenticating session tokens.')}
            />
          </CardContent>
        </Card>
      </div>

      {/* 7. Interactive Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Reusable Modal Dialog"
        description="Supports Escape key dismiss, backdrop blur, keyboard navigation, and custom action footers."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setIsModalOpen(false);
                toast.success('Modal Saved', 'Form inputs captured cleanly.');
              }}
            >
              Save Changes
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Modal Input Example" placeholder="e.g. Enter milestone name" />
          <Textarea label="Modal Notes" rows={3} placeholder="Additional commentary..." />
          <p className="text-[11px] text-slate-500">
            Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-slate-700">Esc</kbd> to close.
          </p>
        </div>
      </Modal>

      {/* 8. Destructive Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmAction}
        isLoading={confirmLoading}
        title="Confirm Destructive Action"
        description="Are you sure you want to permanently delete this record? This action cannot be reversed and will be audited in the Director security ledger."
        confirmLabel="Yes, Delete Record"
        cancelLabel="Keep Record"
        variant="destructive"
      />
    </div>
  );
};
