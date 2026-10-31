import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Quote,
  List,
  ListOrdered,
  CheckSquare,
  Link as LinkIcon,
  Download,
  Trash2,
  Copy,
  Star,
  Columns2,
  Edit3,
  Eye,
  Calendar,
  User,
  ExternalLink,
  ChevronRight,
  ArrowUpRight,
  Tag as TagIcon,
  X,
  Plus,
  Folder,
  ArrowLeft,
  PanelLeft,
} from 'lucide-react';
import { Note, ParaCategory, PARA_CATEGORIES, EditorMode, Subfolder } from '../types/note';
import {
  getNoteBacklinks,
  getNoteMetrics,
  toggleMarkdownTask,
} from '../utils/markdown';
import { MarkdownRenderer } from './MarkdownRenderer';
import { exportNoteAsMarkdown } from '../utils/storage';

interface NoteEditorProps {
  note: Note | null;
  allNotes: Note[];
  folders: Subfolder[];
  onCreateFolder?: (name: string, category: ParaCategory) => void;
  onUpdateNote: (updated: Note) => void;
  onDeleteNote: (id: string) => void;
  onDuplicateNote: (note: Note) => void;
  onTogglePin: (id: string) => void;
  onSelectNoteById: (id: string) => void;
  onSelectNoteByTitle: (title: string) => void;
  onBackToList?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  isNoteListCollapsed?: boolean;
  onToggleNoteList?: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  allNotes,
  folders,
  onCreateFolder,
  onUpdateNote,
  onDeleteNote,
  onDuplicateNote,
  onTogglePin,
  onSelectNoteById,
  onSelectNoteByTitle,
  onBackToList,
  isSidebarCollapsed,
  onToggleSidebar,
  isNoteListCollapsed,
  onToggleNoteList,
}) => {
  const [editorMode, setEditorMode] = useState<EditorMode>('hybrid');
  const [tagInput, setTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // If no note selected
  if (!note) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-8 bg-[#f7f9fb] text-center">
        {onBackToList && (
          <button
            type="button"
            onClick={onBackToList}
            className="md:hidden mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#4648d4] bg-[#e1e0ff] hover:bg-[#c0c1ff] px-3 py-1.5 rounded-[0.25rem] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Note List</span>
          </button>
        )}
        <div className="w-12 h-12 rounded-[0.5rem] bg-[#eceef0] flex items-center justify-center text-[#767586] mb-4">
          <Edit3 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-[#191c1e] mb-1">
          No Note Selected
        </h3>
        <p className="text-xs text-[#767586] max-w-sm leading-relaxed">
          Select an existing note from the list, or create a new note in
          Projects, Areas, Resources, or Archives.
        </p>
      </main>
    );
  }

  const metrics = getNoteMetrics(note.content);
  const backlinks = getNoteBacklinks(note, allNotes);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateNote({
      ...note,
      title: e.target.value,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdateNote({
      ...note,
      content: e.target.value,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleCategoryChange = (newCat: ParaCategory) => {
    const currentFolder = note.folderId ? folders.find((f) => f.id === note.folderId) : null;
    const keepFolder = currentFolder && currentFolder.category === newCat;
    onUpdateNote({
      ...note,
      category: newCat,
      folderId: keepFolder ? note.folderId : null,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleFolderChange = (folderId: string | null) => {
    onUpdateNote({
      ...note,
      folderId: folderId || null,
      updatedAt: new Date().toISOString(),
    });
  };

  // Add tag
  const handleAddTag = () => {
    const clean = tagInput.trim().toLowerCase().replace(/^#/, '');
    if (clean && !note.tags.includes(clean)) {
      onUpdateNote({
        ...note,
        tags: [...note.tags, clean],
        updatedAt: new Date().toISOString(),
      });
      setTagInput('');
      setIsAddingTag(false);
    }
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateNote({
      ...note,
      tags: note.tags.filter((t) => t !== tagToRemove),
      updatedAt: new Date().toISOString(),
    });
  };

  // Toggle interactive task in markdown
  const handleToggleTask = (taskIndex: number) => {
    const updatedContent = toggleMarkdownTask(note.content, taskIndex);
    onUpdateNote({
      ...note,
      content: updatedContent,
      updatedAt: new Date().toISOString(),
    });
  };

  // Helper to insert markdown syntax at cursor
  const insertSyntax = (before: string, after: string = '', placeholder = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = note.content.substring(start, end) || placeholder;

    const newContent =
      note.content.substring(0, start) +
      before +
      selection +
      after +
      note.content.substring(end);

    onUpdateNote({
      ...note,
      content: newContent,
      updatedAt: new Date().toISOString(),
    });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selection.length
      );
    }, 0);
  };

  // Handle keyboard shortcuts (Cmd+B, Cmd+I)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.metaKey || e.ctrlKey) {
      if (e.key === 'b') {
        e.preventDefault();
        insertSyntax('**', '**', 'bold text');
      } else if (e.key === 'i') {
        e.preventDefault();
        insertSyntax('*', '*', 'italic text');
      } else if (e.key === 'k') {
        e.preventDefault();
        insertSyntax('[[', ']]', 'Note Title');
      }
    }
  };

  const meta = PARA_CATEGORIES[note.category];
  const availableFolders = folders.filter((f) => f.category === note.category);
  const currentFolder = note.folderId ? folders.find((f) => f.id === note.folderId) : null;

  return (
    <main className="flex-1 flex flex-col h-full bg-[#f7f9fb] overflow-hidden">
      {/* Top action & mode toolbar */}
      <div className="px-3 sm:px-6 py-2 sm:py-2.5 border-b border-[#e6e8ea] flex items-center justify-between gap-2 sm:gap-4 bg-[#f7f9fb]">
        {/* Left: Mobile Back Button + Desktop Pane Toggles + Category & Subfolder selector */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {onBackToList && (
            <button
              type="button"
              onClick={onBackToList}
              className="md:hidden flex items-center gap-1 text-xs font-semibold text-[#4648d4] hover:text-[#3323cc] py-1 px-2 bg-[#e1e0ff] rounded-[0.25rem] transition-colors cursor-pointer shrink-0"
              title="Back to notes list"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Notes</span>
            </button>
          )}

          {/* Desktop Pane Expand / Collapse Toggles */}
          <div className="hidden md:flex items-center gap-0.5 mr-1 bg-[#eceef0] p-0.5 rounded-[0.25rem]">
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                className={`p-1 rounded-[0.2rem] transition-colors cursor-pointer ${
                  !isSidebarCollapsed
                    ? 'bg-white text-[#4648d4] shadow-xs'
                    : 'text-[#767586] hover:text-[#191c1e]'
                }`}
              >
                <PanelLeft className="w-3.5 h-3.5" />
              </button>
            )}

            {onToggleNoteList && (
              <button
                type="button"
                onClick={onToggleNoteList}
                title={isNoteListCollapsed ? "Expand Note List Pane" : "Collapse Note List Pane"}
                className={`p-1 rounded-[0.2rem] transition-colors cursor-pointer ${
                  !isNoteListCollapsed
                    ? 'bg-white text-[#4648d4] shadow-xs'
                    : 'text-[#767586] hover:text-[#191c1e]'
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={note.category}
            onChange={(e) => handleCategoryChange(e.target.value as ParaCategory)}
            className="text-xs font-medium py-1 px-2 bg-white border border-[#c7c4d7] hover:border-[#4648d4] focus:outline-none focus:border-[#4648d4] rounded-[0.25rem] text-[#191c1e] transition-colors cursor-pointer capitalize"
          >
            {(['projects', 'areas', 'resources', 'archives'] as ParaCategory[]).map(
              (cat) => (
                <option key={cat} value={cat}>
                  {PARA_CATEGORIES[cat].name} ({PARA_CATEGORIES[cat].badgeLabel})
                </option>
              )
            )}
          </select>

          {/* Subfolder selector */}
          <div className="flex items-center gap-1">
            <Folder className="w-3.5 h-3.5 text-[#767586] hidden sm:block shrink-0" />
            <select
              value={note.folderId || ''}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '__new__') {
                  const name = prompt(
                    `Enter new subfolder name in ${PARA_CATEGORIES[note.category].name}:`
                  );
                  if (name && name.trim()) {
                    onCreateFolder?.(name.trim(), note.category);
                  }
                } else {
                  handleFolderChange(val ? val : null);
                }
              }}
              className="text-xs font-medium py-1 px-2 bg-white border border-[#c7c4d7] hover:border-[#4648d4] focus:outline-none focus:border-[#4648d4] rounded-[0.25rem] text-[#191c1e] transition-colors cursor-pointer max-w-[140px] truncate"
              title="Assign to subfolder"
            >
              <option value="">(No subfolder)</option>
              {availableFolders.map((f) => (
                <option key={f.id} value={f.id}>
                  📁 {f.name}
                </option>
              ))}
              <option value="__new__">+ New Subfolder...</option>
            </select>
          </div>

          {/* Optional specific attributes */}
          {note.category === 'projects' && (
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-[#767586] bg-white border border-[#c7c4d7] px-2 py-0.5 rounded-[0.25rem]">
              <Calendar className="w-3 h-3 text-[#4648d4]" />
              <input
                type="date"
                value={note.deadline || ''}
                onChange={(e) =>
                  onUpdateNote({
                    ...note,
                    deadline: e.target.value,
                    updatedAt: new Date().toISOString(),
                  })
                }
                className="bg-transparent text-[#191c1e] text-[11px] focus:outline-none cursor-pointer"
                title="Target Deadline"
              />
            </div>
          )}

          {note.category === 'areas' && (
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-[#767586] bg-white border border-[#c7c4d7] px-2 py-0.5 rounded-[0.25rem]">
              <User className="w-3 h-3 text-[#4b41e1]" />
              <input
                type="text"
                placeholder="Domain lead..."
                value={note.lead || ''}
                onChange={(e) =>
                  onUpdateNote({
                    ...note,
                    lead: e.target.value,
                    updatedAt: new Date().toISOString(),
                  })
                }
                className="bg-transparent text-[#191c1e] text-[11px] focus:outline-none w-24 placeholder:text-[#767586]"
              />
            </div>
          )}

          {note.category === 'resources' && (
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-[#767586] bg-white border border-[#c7c4d7] px-2 py-0.5 rounded-[0.25rem]">
              <ExternalLink className="w-3 h-3 text-[#4651b9]" />
              <input
                type="text"
                placeholder="Source URL..."
                value={note.sourceUrl || ''}
                onChange={(e) =>
                  onUpdateNote({
                    ...note,
                    sourceUrl: e.target.value,
                    updatedAt: new Date().toISOString(),
                  })
                }
                className="bg-transparent text-[#191c1e] text-[11px] focus:outline-none w-32 placeholder:text-[#767586]"
              />
            </div>
          )}
        </div>

        {/* View Mode controls & Note actions */}
        <div className="flex items-center gap-2">
          {/* Editor mode segmented control */}
          <div className="flex items-center p-0.5 bg-[#eceef0] rounded-[0.25rem]">
            <button
              type="button"
              onClick={() => setEditorMode('hybrid')}
              title="Edit Mode"
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-[0.2rem] transition-colors cursor-pointer ${
                editorMode === 'hybrid'
                  ? 'bg-white text-[#191c1e] shadow-xs'
                  : 'text-[#767586] hover:text-[#191c1e]'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span className="hidden sm:inline">Write</span>
            </button>
            <button
              type="button"
              onClick={() => setEditorMode('split')}
              title="Split View"
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-[0.2rem] transition-colors cursor-pointer ${
                editorMode === 'split'
                  ? 'bg-white text-[#191c1e] shadow-xs'
                  : 'text-[#767586] hover:text-[#191c1e]'
              }`}
            >
              <Columns2 className="w-3 h-3" />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              type="button"
              onClick={() => setEditorMode('preview')}
              title="Preview / Read Mode"
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-[0.2rem] transition-colors cursor-pointer ${
                editorMode === 'preview'
                  ? 'bg-white text-[#191c1e] shadow-xs'
                  : 'text-[#767586] hover:text-[#191c1e]'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span className="hidden sm:inline">Read</span>
            </button>
          </div>

          <div className="h-4 w-[1px] bg-[#e0e3e5]" />

          {/* Quick Note Utility Actions */}
          <button
            type="button"
            onClick={() => onTogglePin(note.id)}
            title={note.pinned ? 'Unpin note' : 'Pin note'}
            className={`p-1.5 rounded-[0.25rem] transition-colors cursor-pointer ${
              note.pinned
                ? 'text-[#4648d4] bg-[#e1e0ff]'
                : 'text-[#767586] hover:text-[#191c1e] hover:bg-[#eceef0]'
            }`}
          >
            <Star
              className="w-3.5 h-3.5"
              fill={note.pinned ? 'currentColor' : 'none'}
            />
          </button>

          <button
            type="button"
            onClick={() => exportNoteAsMarkdown(note, currentFolder?.name)}
            title="Download as Markdown file (.md)"
            className="p-1.5 rounded-[0.25rem] text-[#767586] hover:text-[#191c1e] hover:bg-[#eceef0] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onDuplicateNote(note)}
            title="Duplicate note"
            className="p-1.5 rounded-[0.25rem] text-[#767586] hover:text-[#191c1e] hover:bg-[#eceef0] transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onDeleteNote(note.id)}
            title="Delete note"
            className="p-1.5 rounded-[0.25rem] text-[#767586] hover:text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Markdown Quick Syntax Toolbar (Visible when writing or in split mode) */}
      {editorMode !== 'preview' && (
        <div className="px-6 py-1.5 border-b border-[#e6e8ea] flex items-center gap-1 bg-[#ffffff] overflow-x-auto text-xs text-[#464554]">
          <button
            type="button"
            onClick={() => insertSyntax('# ', '', 'Heading 1')}
            title="Heading 1"
            className="px-2 py-1 font-semibold hover:bg-[#eceef0] rounded-[0.25rem] cursor-pointer"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => insertSyntax('## ', '', 'Heading 2')}
            title="Heading 2"
            className="px-2 py-1 font-semibold hover:bg-[#eceef0] rounded-[0.25rem] cursor-pointer"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => insertSyntax('### ', '', 'Heading 3')}
            title="Heading 3"
            className="px-2 py-1 font-medium hover:bg-[#eceef0] rounded-[0.25rem] cursor-pointer"
          >
            H3
          </button>

          <div className="h-3.5 w-[1px] bg-[#e0e3e5] mx-1" />

          <button
            type="button"
            onClick={() => insertSyntax('**', '**', 'bold text')}
            title="Bold (Cmd+B)"
            className="p-1.5 hover:bg-[#eceef0] rounded-[0.25rem] cursor-pointer"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertSyntax('*', '*', 'italic text')}
            title="Italic (Cmd+I)"
            className="p-1.5 hover:bg-[#eceef0] rounded-[0.25rem] cursor-pointer"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertSyntax('~~', '~~', 'strikethrough')}
            title="Strikethrough"
            className="p-1.5 hover:bg-[#eceef0] rounded-[0.25rem] cursor-pointer"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertSyntax('`', '`', 'code')}
            title="Inline Code"
            className="p-1.5 hover:bg-[#eceef0] rounded-[0.25rem] cursor-pointer"
          >
            <Code className="w-3.5 h-3.5" />
          </button>

          <div className="h-3.5 w-[1px] bg-[#e0e3e5] mx-1" />

          <button
            type="button"
            onClick={() => insertSyntax('- [ ] ', '', 'Task item')}
            title="Task Checkbox (- [ ])"
            className="p-1.5 hover:bg-[#eceef0] rounded-[0.25rem] text-[#4648d4] cursor-pointer"
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertSyntax('- ', '', 'List item')}
            title="Bulleted List"
            className="p-1.5 hover:bg-[#eceef0] rounded-[0.25rem] cursor-pointer"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertSyntax('1. ', '', 'Numbered item')}
            title="Numbered List"
            className="p-1.5 hover:bg-[#eceef0] rounded-[0.25rem] cursor-pointer"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertSyntax('> ', '', 'Quote text')}
            title="Quote"
            className="p-1.5 hover:bg-[#eceef0] rounded-[0.25rem] cursor-pointer"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>

          <div className="h-3.5 w-[1px] bg-[#e0e3e5] mx-1" />

          {/* Wikilink insertion helper */}
          <button
            type="button"
            onClick={() => insertSyntax('[[', ']]', 'Target Note')}
            title="Insert Wikilink [[...]] (Cmd+K)"
            className="flex items-center gap-1 px-2 py-1 text-xs text-[#4648d4] hover:bg-[#e1e0ff]/60 rounded-[0.25rem] cursor-pointer font-medium"
          >
            <LinkIcon className="w-3 h-3" />
            <span>Wikilink [[...]]</span>
          </button>
        </div>
      )}

      {/* Main Canvas Scroll Area */}
      <div className="flex-1 overflow-y-auto px-6 md:px-10 lg:px-14 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Note Title Input */}
          <div>
            <input
              type="text"
              value={note.title}
              onChange={handleTitleChange}
              placeholder="Note Title..."
              className="w-full text-2xl md:text-3xl font-semibold tracking-[-0.02em] text-[#191c1e] bg-transparent border-b border-transparent hover:border-[#c7c4d7] focus:border-[#4648d4] focus:outline-none pb-2 transition-colors placeholder:text-[#767586]"
            />
          </div>

          {/* Unboxed Metadata & Tag bar (Zero-Pill discipline) */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-xs text-[#767586] pb-3 border-b border-[#eceef0]">
            <div className="flex items-center gap-1.5 font-medium text-[#4648d4] capitalize">
              <span>{meta.name}</span>
              {currentFolder && (
                <>
                  <span className="text-[#767586]">/</span>
                  <span className="text-[#191c1e] font-semibold flex items-center gap-1">
                    <Folder className="w-3 h-3 text-[#767586]" />
                    {currentFolder.name}
                  </span>
                </>
              )}
            </div>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              {metrics.words} words
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              {metrics.readingTimeMin} min read
            </span>
            {metrics.totalTasks > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {metrics.completedTasks} of {metrics.totalTasks} tasks done
                </span>
              </>
            )}

            {/* Tags row */}
            <div className="flex items-center flex-wrap gap-1.5 ml-auto">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-[11px] text-[#464554] bg-[#f2f4f6] border border-[#c7c4d7] px-1.5 py-0.5 rounded-[0.25rem]"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-[#ba1a1a] cursor-pointer"
                    title={`Remove #${tag}`}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}

              {isAddingTag ? (
                <div className="inline-flex items-center gap-1 text-[11px]">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      } else if (e.key === 'Escape') {
                        setIsAddingTag(false);
                      }
                    }}
                    placeholder="tag..."
                    autoFocus
                    className="w-16 px-1.5 py-0.5 text-xs bg-white border border-[#4648d4] rounded-[0.25rem] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="text-[#4648d4] hover:underline cursor-pointer"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingTag(false)}
                    className="text-[#767586] hover:text-[#191c1e] cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingTag(true)}
                  className="inline-flex items-center gap-1 text-[11px] text-[#767586] hover:text-[#191c1e] hover:bg-[#eceef0] px-1.5 py-0.5 rounded-[0.25rem] transition-colors cursor-pointer"
                >
                  <Plus className="w-2.5 h-2.5" />
                  <span>Tag</span>
                </button>
              )}
            </div>
          </div>

          {/* Editor Canvas content based on mode */}
          {editorMode === 'hybrid' && (
            <div className="space-y-6">
              <textarea
                ref={textareaRef}
                value={note.content}
                onChange={handleContentChange}
                onKeyDown={handleKeyDown}
                placeholder="Write your note in Markdown. Use [[Wikilinks]] to link notes together..."
                className="w-full min-h-[420px] bg-transparent text-[#191c1e] text-[15px] leading-[26px] font-normal focus:outline-none resize-y placeholder:text-[#767586]"
              />
            </div>
          )}

          {editorMode === 'split' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[460px]">
              {/* Left: Raw Markdown Editor */}
              <div className="border border-[#e0e3e5] rounded-[0.375rem] p-4 bg-white shadow-xs">
                <div className="text-[10px] text-[#767586] font-mono uppercase tracking-wider mb-2">
                  Markdown Source
                </div>
                <textarea
                  ref={textareaRef}
                  value={note.content}
                  onChange={handleContentChange}
                  onKeyDown={handleKeyDown}
                  className="w-full h-[400px] bg-transparent text-[#191c1e] text-xs font-mono leading-relaxed focus:outline-none resize-none"
                />
              </div>

              {/* Right: Live Rendered View */}
              <div className="border border-[#e0e3e5] rounded-[0.375rem] p-4 bg-[#f7f9fb] shadow-xs overflow-y-auto max-h-[460px]">
                <div className="text-[10px] text-[#767586] font-mono uppercase tracking-wider mb-2">
                  Live Preview
                </div>
                <MarkdownRenderer
                  content={note.content}
                  onToggleTask={handleToggleTask}
                  onOpenNoteByTitle={onSelectNoteByTitle}
                />
              </div>
            </div>
          )}

          {editorMode === 'preview' && (
            <div className="min-h-[400px] bg-white border border-[#e0e3e5] rounded-[0.5rem] p-6 shadow-xs">
              <MarkdownRenderer
                content={note.content}
                onToggleTask={handleToggleTask}
                onOpenNoteByTitle={onSelectNoteByTitle}
              />
            </div>
          )}

          {/* Bidirectional Backlinks & Connected Notes Drawer */}
          <div className="mt-12 pt-6 border-t border-[#e0e3e5] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-[#4648d4]" />
                <h4 className="text-xs font-semibold uppercase tracking-[0.05em] text-[#191c1e]">
                  Linked References & Backlinks
                </h4>
              </div>
              <span className="font-mono text-xs text-[#767586] tabular-nums">
                {backlinks.incoming.length + backlinks.outgoing.length} connections
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Incoming Links (Notes that link to this one) */}
              <div className="p-3.5 bg-white border border-[#c7c4d7] rounded-[0.375rem]">
                <div className="text-[11px] font-medium text-[#767586] uppercase tracking-wider mb-2">
                  Incoming Mentions ({backlinks.incoming.length})
                </div>
                {backlinks.incoming.length === 0 ? (
                  <p className="text-xs text-[#767586] italic">
                    No notes currently link to [[{note.title}]].
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {backlinks.incoming.map((inc) => (
                      <button
                        key={inc.id}
                        type="button"
                        onClick={() => onSelectNoteById(inc.id)}
                        className="w-full text-left p-2 rounded-[0.25rem] bg-[#f7f9fb] hover:bg-[#eceef0] border border-[#e0e3e5] transition-colors cursor-pointer group flex items-center justify-between"
                      >
                        <div className="truncate">
                          <span className="text-xs font-medium text-[#191c1e] group-hover:text-[#4648d4] block truncate">
                            {inc.title}
                          </span>
                          <span className="text-[10px] text-[#767586] capitalize">
                            in {inc.category}
                          </span>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#767586] group-hover:text-[#4648d4] shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Outgoing Links (Notes referenced in this note) */}
              <div className="p-3.5 bg-white border border-[#c7c4d7] rounded-[0.375rem]">
                <div className="text-[11px] font-medium text-[#767586] uppercase tracking-wider mb-2">
                  Outgoing Connections ({backlinks.outgoing.length})
                </div>
                {backlinks.outgoing.length === 0 ? (
                  <p className="text-xs text-[#767586] italic">
                    Type [[Note Title]] in the note to connect concepts.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {backlinks.outgoing.map((out) => (
                      <button
                        key={out.id}
                        type="button"
                        onClick={() => onSelectNoteById(out.id)}
                        className="w-full text-left p-2 rounded-[0.25rem] bg-[#f7f9fb] hover:bg-[#eceef0] border border-[#e0e3e5] transition-colors cursor-pointer group flex items-center justify-between"
                      >
                        <div className="truncate">
                          <span className="text-xs font-medium text-[#191c1e] group-hover:text-[#4648d4] block truncate">
                            {out.title}
                          </span>
                          <span className="text-[10px] text-[#767586] capitalize">
                            in {out.category}
                          </span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-[#767586] group-hover:text-[#4648d4] shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
