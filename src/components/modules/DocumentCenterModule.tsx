import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { EmployeeDocument, DocumentCategory } from '../../types';
import {
  FolderLock,
  Upload,
  FileText,
  Download,
  ShieldCheck,
  CheckCircle,
  FileBadge,
  Eye,
  Lock,
} from 'lucide-react';

export const DocumentCenterModule: React.FC = () => {
  const { currentUser, role, isFounder } = useAuth();
  const [documents, setDocuments] = useState<EmployeeDocument[]>(() =>
    storageService.getDocuments(currentUser)
  );
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState<DocumentCategory>('ID Proofs');
  const [docFile, setDocFile] = useState<string>('Employee_Verification_2026.pdf');
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const categories: ('All' | DocumentCategory)[] = [
    'All',
    'Offer Letter',
    'ID Proofs',
    'Policies',
    'Tax Forms',
  ];

  const refreshDocs = () => {
    setDocuments(storageService.getDocuments(currentUser));
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.addDocument(
      {
        employeeId: currentUser.id,
        category: docCategory,
        name: docName,
        fileName: docFile,
        fileSize: '1.2 MB',
        version: 'v1.0',
        privateUrl: '#',
      },
      currentUser
    );
    setIsUploadOpen(false);
    setDocName('');
    refreshDocs();
  };

  const handleSimulateSecureDownload = (doc: EmployeeDocument) => {
    setDownloadNotice(`Generated secure token for "${doc.name}" (Expires in 15 mins). Download simulated.`);
    setTimeout(() => setDownloadNotice(null), 3500);
  };

  const filteredDocs = documents.filter((d) => {
    if (activeCategory === 'All') return true;
    return d.category === activeCategory;
  });

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {isFounder ? 'Company Document Vault & Management' : 'My Personal Document Center'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Section 3: Confidential storage for Offer Letters, ID Proofs, Corporate Policies, and Tax Forms.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm self-start"
        >
          <Upload className="w-4 h-4" /> Upload Document
        </button>
      </div>

      {/* Security Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-emerald-900">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
        <div>
          <span className="font-bold">Zero-Public-URL Privacy Guard:</span> All documents are encrypted and
          accessible solely through short-lived secure authorization tokens according to RBAC specifications.
        </div>
      </div>

      {downloadNotice && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.length === 0 ? (
          <div className="col-span-2 bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
            <FolderLock className="w-10 h-10 mx-auto mb-2 opacity-40" />
            No documents found under this category.
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-brand-500 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {doc.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{doc.name}</h4>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{doc.version}</span>
                </div>

                <div className="mt-4 bg-slate-50 p-2.5 rounded-xl text-[11px] text-slate-500 space-y-1">
                  <div className="flex justify-between">
                    <span>File:</span>
                    <span className="font-mono font-medium text-slate-700 truncate max-w-[200px]">
                      {doc.fileName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uploaded:</span>
                    <span className="text-slate-700">{doc.uploadDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uploader:</span>
                    <span className="text-slate-700">{doc.uploaderName}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">{doc.fileSize}</span>
                <button
                  onClick={() => handleSimulateSecureDownload(doc)}
                  className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Secure Download
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Upload Confidential Document</h3>
            <p className="text-xs text-slate-500 mt-0.5">Files are strictly private and restricted by role.</p>

            <form onSubmit={handleUpload} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Display Title</label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. Passport Identification Document"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value as DocumentCategory)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 bg-white"
                >
                  <option value="Offer Letter">Offer Letter</option>
                  <option value="ID Proofs">ID Proofs</option>
                  <option value="Policies">Policies</option>
                  <option value="Tax Forms">Tax Forms</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select File (PDF, PNG, JPG up to 10MB)</label>
                <input
                  type="text"
                  value={docFile}
                  onChange={(e) => setDocFile(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold cursor-pointer"
                >
                  Upload & Encrypt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
