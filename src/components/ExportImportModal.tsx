import React, { useState } from 'react';
import {
  X,
  Download,
  Upload,
  Copy,
  Check,
  RefreshCw,
  FileJson,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Note, Subfolder } from '../types/note';
import {
  exportWorkspaceJSON,
  parseImportedJSON,
  exportNoteAsMarkdown,
} from '../utils/storage';
import { INITIAL_NOTES, INITIAL_FOLDERS } from '../data/seedData';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  folders: Subfolder[];
  onImportWorkspace: (newNotes: Note[], newFolders?: Subfolder[]) => void;
  onResetToSeed: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  notes,
  folders,
  onImportWorkspace,
  onResetToSeed,
}) => {
  const [copied, setCopied] = useState(false);
  const [pasteContent, setPasteContent] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyJSON = () => {
    const jsonStr = JSON.stringify(
      {
        app: 'Seiri',
        exportedAt: new Date().toISOString(),
        notesCount: notes.length,
        foldersCount: folders.length,
        folders,
        notes,
      },
      null,
      2
    );
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = parseImportedJSON(content);
      if (parsed && parsed.notes && parsed.notes.length > 0) {
        onImportWorkspace(parsed.notes, parsed.folders);
        setImportSuccess(
          `Successfully imported ${parsed.notes.length} notes${
            parsed.folders ? ` and ${parsed.folders.length} subfolders` : ''
          }!`
        );
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setImportError('Invalid backup file. Ensure it contains a valid notes array.');
      }
    };
    reader.readAsText(file);
  };

  const handlePasteImport = (replace: boolean) => {
    setImportError(null);
    setImportSuccess(null);
    if (!pasteContent.trim()) {
      setImportError('Please paste JSON content first.');
      return;
    }

    const parsed = parseImportedJSON(pasteContent);
    if (parsed && parsed.notes && parsed.notes.length > 0) {
      if (replace) {
        onImportWorkspace(parsed.notes, parsed.folders);
        setImportSuccess(
          `Workspace replaced with ${parsed.notes.length} imported notes${
            parsed.folders ? ` and ${parsed.folders.length} subfolders` : ''
          }.`
        );
      } else {
        // Merge notes avoiding duplicates by id
        const existingIds = new Set(notes.map((n) => n.id));
        const newNotesToAdd = parsed.notes.filter((n) => !existingIds.has(n.id));

        // Merge folders avoiding duplicates by id
        const existingFolderIds = new Set(folders.map((f) => f.id));
        const newFoldersToAdd = (parsed.folders || []).filter(
          (f) => !existingFolderIds.has(f.id)
        );

        onImportWorkspace(
          [...notes, ...newNotesToAdd],
          [...folders, ...newFoldersToAdd]
        );
        setImportSuccess(
          `Merged ${newNotesToAdd.length} new notes and ${newFoldersToAdd.length} subfolders.`
        );
      }
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setImportError('Failed to parse JSON. Please check formatting.');
    }
  };

  const handleExportAllMarkdown = () => {
    notes.forEach((note) => {
      const folder = note.folderId ? folders.find((f) => f.id === note.folderId) : null;
      exportNoteAsMarkdown(note, folder?.name);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white border border-[#c7c4d7] rounded-[0.5rem] shadow-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#e6e8ea] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileJson className="w-4 h-4 text-[#4648d4]" />
            <h3 className="text-sm font-semibold text-[#191c1e]">
              Workspace Data Management
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#767586] hover:text-[#191c1e] rounded-[0.25rem] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 max-h-[80vh] overflow-y-auto text-xs text-[#191c1e]">
          {/* Notifications */}
          {importError && (
            <div className="p-3 bg-[#ffdad6] text-[#93000a] rounded-[0.25rem] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {importSuccess && (
            <div className="p-3 bg-[#e1e0ff] text-[#07006c] rounded-[0.25rem] flex items-center gap-2 font-medium">
              <Check className="w-4 h-4 shrink-0 text-[#4648d4]" />
              <span>{importSuccess}</span>
            </div>
          )}

          {/* Export Section */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[#464554] uppercase tracking-wider text-[11px]">
              Export Workspace
            </h4>
            <p className="text-[#767586] text-xs">
              Export your entire note collection and PARA subfolders locally. You maintain full ownership of your data.
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => exportWorkspaceJSON(notes, folders)}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#4648d4] hover:bg-[#6063ee] text-white rounded-[0.25rem] font-medium transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Backup (.json)</span>
              </button>

              <button
                type="button"
                onClick={handleCopyJSON}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#eceef0] hover:bg-[#e0e3e5] text-[#191c1e] rounded-[0.25rem] font-medium transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#4648d4]" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#767586]" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleExportAllMarkdown}
                title="Download all notes as individual markdown files"
                className="flex items-center gap-1.5 px-3 py-2 bg-[#eceef0] hover:bg-[#e0e3e5] text-[#191c1e] rounded-[0.25rem] font-medium transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-[#767586]" />
                <span>Download All (.md)</span>
              </button>
            </div>
          </div>

          <div className="border-t border-[#eceef0]" />

          {/* Import Section */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[#464554] uppercase tracking-wider text-[11px]">
              Restore / Import Backup
            </h4>
            <p className="text-[#767586] text-xs">
              Upload a previously exported Seiri backup file or paste raw JSON.
            </p>

            {/* File Upload */}
            <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-[#c7c4d7] hover:border-[#4648d4] rounded-[0.375rem] bg-[#f7f9fb] cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-[#4648d4]" />
              <span className="font-medium text-[#464554]">
                Choose .json file to restore
              </span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Paste JSON */}
            <div className="space-y-2 pt-2">
              <textarea
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                placeholder="Or paste JSON array here..."
                rows={3}
                className="w-full p-2.5 bg-[#f7f9fb] border border-[#c7c4d7] focus:border-[#4648d4] focus:outline-none rounded-[0.25rem] text-xs font-mono placeholder:text-[#767586]"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handlePasteImport(false)}
                  className="flex-1 py-1.5 bg-[#eceef0] hover:bg-[#e0e3e5] text-[#191c1e] rounded-[0.25rem] font-medium transition-colors cursor-pointer"
                >
                  Merge into Current Workspace
                </button>
                <button
                  type="button"
                  onClick={() => handlePasteImport(true)}
                  className="flex-1 py-1.5 bg-[#ffdad6] hover:bg-[#ffdad6]/80 text-[#93000a] rounded-[0.25rem] font-medium transition-colors cursor-pointer"
                >
                  Replace All Notes & Folders
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-[#eceef0]" />

          {/* Seed reset option */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <div className="font-medium text-[#191c1e]">
                Reset to Sample PARA Workspace
              </div>
              <div className="text-[11px] text-[#767586]">
                Reloads initial sample Projects, Areas, Resources, Archives, and subfolders.
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (
                  confirm(
                    'Reset workspace to initial sample PARA notes and subfolders? Any unsaved local edits will be replaced.'
                  )
                ) {
                  onResetToSeed();
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#464554] hover:text-[#191c1e] hover:bg-[#eceef0] border border-[#c7c4d7] rounded-[0.25rem] font-medium transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Demo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
