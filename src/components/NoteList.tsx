import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  Star,
  ArrowUpDown,
  Plus,
  Trash2,
  FolderInput,
  Folder,
  CheckCircle2,
  Menu,
  ChevronRight,
  PanelLeftOpen,
  PanelLeftClose,
} from 'lucide-react';
import { Note, ParaCategory, PARA_CATEGORIES, Subfolder } from '../types/note';
import { getNoteMetrics } from '../utils/markdown';

interface NoteListProps {
  notes: Note[];
  folders: Subfolder[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  currentCategory: ParaCategory | 'all';
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  selectedTag: string | null;
  onCreateNote: (category?: ParaCategory, folderId?: string | null) => void;
  onDeleteNote: (id: string) => void;
  onTogglePin: (id: string) => void;
  onMoveNote: (id: string, newCategory: ParaCategory, newFolderId?: string | null) => void;
  onOpenMobileMenu: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

type SortOption = 'updated' | 'created' | 'title';

export const NoteList: React.FC<NoteListProps> = ({
  notes,
  folders,
  selectedNoteId,
  onSelectNote,
  currentCategory,
  selectedFolderId,
  onSelectFolder,
  selectedTag,
  onCreateNote,
  onDeleteNote,
  onTogglePin,
  onMoveNote,
  onOpenMobileMenu,
  isSidebarCollapsed,
  onToggleSidebar,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('updated');
  const [activeMenuNoteId, setActiveMenuNoteId] = useState<string | null>(null);

  // Folder lookup map
  const folderMap = useMemo(() => {
    const map = new Map<string, Subfolder>();
    folders.forEach((f) => map.set(f.id, f));
    return map;
  }, [folders]);

  const activeFolder = selectedFolderId ? folderMap.get(selectedFolderId) : null;

  // Filter notes based on category, folder, tag, and search query
  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) => {
        // Category filter
        if (currentCategory !== 'all' && note.category !== currentCategory) {
          return false;
        }
        // Subfolder filter
        if (selectedFolderId && note.folderId !== selectedFolderId) {
          return false;
        }
        // Tag filter
        if (selectedTag && !note.tags.includes(selectedTag)) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = note.title.toLowerCase().includes(q);
          const matchContent = note.content.toLowerCase().includes(q);
          const matchTags = note.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchContent && !matchTags) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Pinned notes always surface first
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;

        if (sortBy === 'updated') {
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        }
        if (sortBy === 'created') {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [notes, currentCategory, selectedFolderId, selectedTag, searchQuery, sortBy]);

  const currentCategoryMeta =
    currentCategory !== 'all' ? PARA_CATEGORIES[currentCategory] : null;

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <section
      className={`w-full shrink-0 bg-[#f7f9fb] border-r border-[#e0e3e5] flex flex-col h-full overflow-hidden transition-all duration-200 ease-in-out ${
        isCollapsed
          ? 'md:w-0 md:border-none md:p-0 md:opacity-0 pointer-events-none'
          : 'md:w-80 lg:w-88'
      }`}
    >
      <div className="w-full md:w-80 lg:w-88 flex flex-col h-full shrink-0">
        {/* Header zone */}
        <div className="p-3.5 border-b border-[#e6e8ea]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 truncate">
              {/* Mobile menu hamburger */}
              <button
                type="button"
                onClick={onOpenMobileMenu}
                className="md:hidden p-1 text-[#464554] hover:text-[#191c1e] cursor-pointer"
              >
                <Menu className="w-4 h-4" />
              </button>
              <div className="truncate">
                {/* Breadcrumb if subfolder is active */}
                {activeFolder ? (
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-[#767586] hover:text-[#191c1e] cursor-pointer" onClick={() => onSelectFolder(null)}>
                      {currentCategoryMeta?.name}
                    </span>
                    <ChevronRight className="w-3 h-3 text-[#767586]" />
                    <span className="font-semibold text-[#191c1e] truncate flex items-center gap-1">
                      <Folder className="w-3 h-3 text-[#4648d4] shrink-0" />
                      {activeFolder.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectFolder(null)}
                      title="View all in category"
                      className="p-0.5 text-[#767586] hover:text-[#191c1e] cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <h2 className="text-sm font-semibold tracking-tight text-[#191c1e] truncate">
                    {selectedTag
                      ? `#${selectedTag}`
                      : currentCategoryMeta
                      ? currentCategoryMeta.name
                      : 'All Notes'}
                  </h2>
                )}

                <div className="text-[11px] text-[#767586] truncate">
                  {activeFolder
                    ? `${filteredNotes.length} notes in subfolder`
                    : currentCategoryMeta
                    ? currentCategoryMeta.subtitle
                    : `${filteredNotes.length} notes total`}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* If sidebar is collapsed on desktop, show toggle button here */}
              {isSidebarCollapsed && onToggleSidebar && (
                <button
                  type="button"
                  onClick={onToggleSidebar}
                  title="Show Sidebar"
                  className="hidden md:flex p-1.5 rounded-[0.25rem] text-[#767586] hover:text-[#191c1e] hover:bg-[#eceef0] transition-colors cursor-pointer"
                >
                  <PanelLeftOpen className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  onCreateNote(
                    currentCategory === 'all' ? 'projects' : currentCategory,
                    selectedFolderId
                  )
                }
                className="p-1.5 rounded-[0.25rem] bg-[#eceef0] hover:bg-[#e0e3e5] text-[#191c1e] transition-colors cursor-pointer"
                title="Create note in this section"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>

              {/* Collapse note list button on desktop */}
              {onToggleCollapse && (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  title="Collapse Note Selection Pane"
                  className="hidden md:flex p-1.5 rounded-[0.25rem] text-[#767586] hover:text-[#191c1e] hover:bg-[#eceef0] transition-colors cursor-pointer"
                >
                  <PanelLeftClose className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

        {/* Search Input */}
        <div className="relative mb-2">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#767586]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes or content..."
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-[#ffffff] border border-[#c7c4d7] focus:border-[#4648d4] focus:outline-none rounded-[0.25rem] placeholder:text-[#767586] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#767586] hover:text-[#191c1e] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort & Filter controls */}
        <div className="flex items-center justify-between text-[11px] text-[#767586]">
          <span className="font-mono tabular-nums">
            {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
          </span>

          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3 h-3 text-[#767586]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-[#464554] hover:text-[#191c1e] focus:outline-none cursor-pointer"
            >
              <option value="updated">Recently Updated</option>
              <option value="created">Date Created</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Note List Scrollable Column */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#eceef0]">
        {filteredNotes.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-xs text-[#767586] mb-3">
              {searchQuery
                ? `No notes matching "${searchQuery}"`
                : activeFolder
                ? `No notes in subfolder "${activeFolder.name}" yet.`
                : 'No notes in this category yet.'}
            </p>
            <button
              type="button"
              onClick={() =>
                onCreateNote(
                  currentCategory === 'all' ? 'projects' : currentCategory,
                  selectedFolderId
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#4648d4] hover:bg-[#6063ee] rounded-[0.25rem] transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Note</span>
            </button>
          </div>
        ) : (
          filteredNotes.map((note) => {
            const isSelected = note.id === selectedNoteId;
            const metrics = getNoteMetrics(note.content);
            const folder = note.folderId ? folderMap.get(note.folderId) : null;
            const snippet = note.content
              .replace(/^#+.*$/gm, '')
              .replace(/\[\[(.*?)\]\]/g, '$1')
              .replace(/`.*?`/g, '')
              .trim()
              .split('\n')
              .filter(Boolean)
              .slice(0, 2)
              .join(' ');

            // Subfolders in this note's category for the move dropdown
            const categoryFolders = folders.filter((f) => f.category === note.category);

            return (
              <div
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className={`p-3.5 transition-colors cursor-pointer relative group ${
                  isSelected
                    ? 'bg-white border-l-2 border-l-[#4648d4] shadow-xs'
                    : 'hover:bg-[#f2f4f6]'
                }`}
              >
                {/* Title & Star row */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3
                    className={`text-sm font-semibold tracking-[-0.01em] line-clamp-1 ${
                      isSelected ? 'text-[#191c1e]' : 'text-[#191c1e]'
                    }`}
                  >
                    {note.title || 'Untitled Note'}
                  </h3>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePin(note.id);
                      }}
                      title={note.pinned ? 'Unpin note' : 'Pin note'}
                      className={`p-0.5 rounded cursor-pointer transition-colors ${
                        note.pinned
                          ? 'text-[#4648d4]'
                          : 'text-transparent group-hover:text-[#c7c4d7] hover:text-[#767586]'
                      }`}
                    >
                      <Star
                        className="w-3.5 h-3.5"
                        fill={note.pinned ? 'currentColor' : 'none'}
                      />
                    </button>
                  </div>
                </div>

                {/* Content snippet */}
                {snippet && (
                  <p className="text-xs text-[#464554] line-clamp-2 leading-relaxed mb-2.5">
                    {snippet}
                  </p>
                )}

                {/* Unboxed Metadata Line (Disciplined Zero-Pill) */}
                <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-[11px] text-[#767586] font-normal">
                  <div className="flex items-center gap-1 font-medium text-[#464554] truncate max-w-[160px]">
                    <span className="capitalize">{note.category}</span>
                    {folder && (
                      <>
                        <span className="text-[#767586]">/</span>
                        <span className="text-[#4648d4] truncate">{folder.name}</span>
                      </>
                    )}
                  </div>

                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    {formatDate(note.updatedAt)}
                  </span>

                  {metrics.totalTasks > 0 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                        <CheckCircle2 className="w-3 h-3 text-[#4648d4]" />
                        {metrics.completedTasks}/{metrics.totalTasks}
                      </span>
                    </>
                  )}

                  {note.tags.length > 0 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="truncate max-w-[100px]">
                        #{note.tags[0]}
                        {note.tags.length > 1 ? ` +${note.tags.length - 1}` : ''}
                      </span>
                    </>
                  )}
                </div>

                {/* Quick actions on hover */}
                <div
                  className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-[#f7f9fb] shadow-xs px-1 py-0.5 rounded-[0.25rem] border border-[#e0e3e5]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setActiveMenuNoteId(
                        activeMenuNoteId === note.id ? null : note.id
                      )
                    }
                    title="Move to category or subfolder"
                    className="p-1 hover:text-[#4648d4] text-[#767586] cursor-pointer"
                  >
                    <FolderInput className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteNote(note.id)}
                    title="Delete note"
                    className="p-1 hover:text-[#ba1a1a] text-[#767586] cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Quick move dropdown for Categories & Subfolders */}
                {activeMenuNoteId === note.id && (
                  <div
                    className="absolute right-3 top-10 z-30 bg-white border border-[#c7c4d7] rounded-[0.375rem] shadow-md py-1 w-44 text-xs text-[#191c1e] max-h-64 overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-2.5 py-1 text-[10px] text-[#767586] uppercase tracking-wider font-semibold border-b border-[#eceef0]">
                      Move to Category
                    </div>
                    {(['projects', 'areas', 'resources', 'archives'] as ParaCategory[]).map(
                      (cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            onMoveNote(note.id, cat, cat === note.category ? note.folderId : null);
                            setActiveMenuNoteId(null);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 hover:bg-[#f2f4f6] capitalize flex items-center justify-between cursor-pointer ${
                            note.category === cat
                              ? 'font-semibold text-[#4648d4]'
                              : ''
                          }`}
                        >
                          <span>{cat}</span>
                          {note.category === cat && <span>✓</span>}
                        </button>
                      )
                    )}

                    {categoryFolders.length > 0 && (
                      <>
                        <div className="px-2.5 py-1 mt-1 text-[10px] text-[#767586] uppercase tracking-wider font-semibold border-t border-b border-[#eceef0]">
                          Subfolders ({note.category})
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            onMoveNote(note.id, note.category, null);
                            setActiveMenuNoteId(null);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 hover:bg-[#f2f4f6] flex items-center justify-between cursor-pointer ${
                            !note.folderId ? 'font-semibold text-[#4648d4]' : 'text-[#767586]'
                          }`}
                        >
                          <span>(Root / No folder)</span>
                          {!note.folderId && <span>✓</span>}
                        </button>
                        {categoryFolders.map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => {
                              onMoveNote(note.id, note.category, f.id);
                              setActiveMenuNoteId(null);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 hover:bg-[#f2f4f6] truncate flex items-center justify-between cursor-pointer ${
                              note.folderId === f.id
                                ? 'font-semibold text-[#4648d4]'
                                : ''
                            }`}
                          >
                            <span className="truncate">{f.name}</span>
                            {note.folderId === f.id && <span className="shrink-0 ml-1">✓</span>}
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  </section>
);
};
