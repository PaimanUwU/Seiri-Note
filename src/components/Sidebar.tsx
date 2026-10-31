import React, { useState } from 'react';
import {
  Target,
  Compass,
  Bookmark,
  Archive,
  Plus,
  LayoutGrid,
  Columns3,
  Download,
  Command,
  Tag,
  FileText,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderPlus,
  MoreVertical,
  Edit2,
  Trash2,
  Check,
  X,
  PanelLeftClose,
} from 'lucide-react';
import { Note, ParaCategory, PARA_CATEGORIES, ViewMode, Subfolder } from '../types/note';

interface SidebarProps {
  currentCategory: ParaCategory | 'all';
  selectedFolderId: string | null;
  onSelectCategory: (category: ParaCategory | 'all') => void;
  onSelectFolder: (folderId: string | null) => void;
  folders: Subfolder[];
  onCreateFolder: (name: string, category: ParaCategory) => void;
  onRenameFolder: (folderId: string, newName: string) => void;
  onDeleteFolder: (folderId: string) => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  viewMode: ViewMode;
  onToggleViewMode: (mode: ViewMode) => void;
  notes: Note[];
  onCreateNote: (category?: ParaCategory, folderId?: string | null) => void;
  onOpenCommandPalette: () => void;
  onOpenExportImport: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentCategory,
  selectedFolderId,
  onSelectCategory,
  onSelectFolder,
  folders,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  selectedTag,
  onSelectTag,
  viewMode,
  onToggleViewMode,
  notes,
  onCreateNote,
  onOpenCommandPalette,
  onOpenExportImport,
  isOpenMobile,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
}) => {
  // Category expansion state (all expanded by default for instant access)
  const [expandedCategories, setExpandedCategories] = useState<Record<ParaCategory, boolean>>({
    projects: true,
    areas: true,
    resources: true,
    archives: false,
  });

  // State for creating a new subfolder inline
  const [creatingFolderCategory, setCreatingFolderCategory] = useState<ParaCategory | null>(null);
  const [newFolderName, setNewFolderName] = useState('');

  // State for renaming a subfolder inline
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState('');

  // State for active folder menu dropdown
  const [activeMenuFolderId, setActiveMenuFolderId] = useState<string | null>(null);

  // Compute counts per category
  const categoryCounts: Record<ParaCategory | 'all', number> = {
    all: notes.length,
    projects: notes.filter((n) => n.category === 'projects').length,
    areas: notes.filter((n) => n.category === 'areas').length,
    resources: notes.filter((n) => n.category === 'resources').length,
    archives: notes.filter((n) => n.category === 'archives').length,
  };

  // Compute count for each subfolder
  const folderCounts = React.useMemo(() => {
    const map: Record<string, number> = {};
    notes.forEach((note) => {
      if (note.folderId) {
        map[note.folderId] = (map[note.folderId] || 0) + 1;
      }
    });
    return map;
  }, [notes]);

  // Extract all distinct tags with counts
  const tagCounts = React.useMemo(() => {
    const map: Record<string, number> = {};
    notes.forEach((note) => {
      note.tags.forEach((tag) => {
        map[tag] = (map[tag] || 0) + 1;
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [notes]);

  const navItems: Array<{
    id: ParaCategory;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'projects', icon: Target },
    { id: 'areas', icon: Compass },
    { id: 'resources', icon: Bookmark },
    { id: 'archives', icon: Archive },
  ];

  const toggleCategoryExpand = (cat: ParaCategory, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleStartCreateFolder = (cat: ParaCategory, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCategories((prev) => ({ ...prev, [cat]: true }));
    setCreatingFolderCategory(cat);
    setNewFolderName('');
  };

  const handleConfirmCreateFolder = () => {
    if (creatingFolderCategory && newFolderName.trim()) {
      onCreateFolder(newFolderName.trim(), creatingFolderCategory);
      setCreatingFolderCategory(null);
      setNewFolderName('');
    }
  };

  const handleStartRename = (folder: Subfolder, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuFolderId(null);
    setEditingFolderId(folder.id);
    setEditFolderName(folder.name);
  };

  const handleConfirmRename = (folderId: string) => {
    if (editFolderName.trim()) {
      onRenameFolder(folderId, editFolderName.trim());
      setEditingFolderId(null);
      setEditFolderName('');
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 shrink-0 bg-[#f7f9fb] border-r border-[#e0e3e5] flex flex-col justify-between transition-all duration-200 ease-in-out ${
          isOpenMobile
            ? 'w-68 translate-x-0'
            : isCollapsed
            ? 'w-0 -translate-x-full md:translate-x-0 md:w-0 overflow-hidden border-none pointer-events-none'
            : '-translate-x-full md:translate-x-0 w-68 md:w-64 lg:w-70'
        }`}
      >
        {/* Top brand & actions */}
        <div className="flex flex-col h-full overflow-y-auto w-68 md:w-64 lg:w-70">
          {/* Brand header */}
          <div className="p-4 pb-3 border-b border-[#e6e8ea] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-[0.25rem] bg-[#4648d4] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                S
              </div>
              <div>
                <span className="text-sm font-semibold tracking-tight text-[#191c1e] block">
                  Seiri
                </span>
                <span className="text-[11px] text-[#767586] block">
                  Local-first workspace
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Quick Command shortcut trigger */}
              <button
                type="button"
                onClick={onOpenCommandPalette}
                title="Search & Commands (Cmd+K)"
                className="p-1.5 rounded-[0.25rem] text-[#767586] hover:text-[#191c1e] hover:bg-[#eceef0] transition-colors cursor-pointer"
              >
                <Command className="w-3.5 h-3.5" />
              </button>

              {/* Collapse sidebar button */}
              {onToggleCollapse && (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  title="Collapse Sidebar"
                  className="hidden md:flex p-1.5 rounded-[0.25rem] text-[#767586] hover:text-[#191c1e] hover:bg-[#eceef0] transition-colors cursor-pointer"
                >
                  <PanelLeftClose className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="p-3">
            <button
              type="button"
              onClick={() => {
                onCreateNote(
                  currentCategory === 'all' ? 'projects' : currentCategory,
                  selectedFolderId
                );
                onCloseMobile();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-white bg-[#4648d4] hover:bg-[#6063ee] active:bg-[#3323cc] rounded-[0.25rem] transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Note</span>
              <kbd className="ml-auto text-[10px] text-white/70 font-mono bg-[#3323cc]/40 px-1 py-0.5 rounded-[2px]">
                ⌘N
              </kbd>
            </button>
          </div>

          {/* View switcher: Studio vs Dashboard */}
          <div className="px-3 pb-2">
            <div className="flex items-center p-0.5 bg-[#eceef0] rounded-[0.25rem]">
              <button
                type="button"
                onClick={() => onToggleViewMode('studio')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1 text-xs font-medium rounded-[0.2rem] transition-all cursor-pointer ${
                  viewMode === 'studio'
                    ? 'bg-white text-[#191c1e] shadow-xs'
                    : 'text-[#767586] hover:text-[#191c1e]'
                }`}
              >
                <Columns3 className="w-3 h-3" />
                <span>Studio</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleViewMode('dashboard')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1 text-xs font-medium rounded-[0.2rem] transition-all cursor-pointer ${
                  viewMode === 'dashboard'
                    ? 'bg-white text-[#191c1e] shadow-xs'
                    : 'text-[#767586] hover:text-[#191c1e]'
                }`}
              >
                <LayoutGrid className="w-3 h-3" />
                <span>Dashboard</span>
              </button>
            </div>
          </div>

          {/* Navigation Categories & Subfolders Tree */}
          <div className="px-2 py-1 space-y-1">
            <div className="px-2.5 py-1 text-[11px] font-medium text-[#767586] uppercase tracking-[0.05em] flex items-center justify-between">
              <span>PARA Structure</span>
            </div>

            {/* All notes */}
            <button
              type="button"
              onClick={() => {
                onSelectCategory('all');
                onSelectFolder(null);
                onSelectTag(null);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[0.25rem] text-xs transition-colors cursor-pointer ${
                currentCategory === 'all' && selectedTag === null && selectedFolderId === null
                  ? 'bg-[#eceef0] text-[#191c1e] font-medium'
                  : 'text-[#464554] hover:bg-[#f2f4f6] hover:text-[#191c1e]'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-[#767586]" />
                <span>All Notes</span>
              </div>
              <span className="font-mono text-[11px] text-[#767586] tabular-nums">
                {categoryCounts.all}
              </span>
            </button>

            {/* 4 PARA Sections with Collapsible Subfolders */}
            {navItems.map(({ id, icon: Icon }) => {
              const meta = PARA_CATEGORIES[id];
              const isCategoryActive =
                currentCategory === id && selectedFolderId === null && selectedTag === null;
              const isExpanded = expandedCategories[id];
              const catFolders = folders.filter((f) => f.category === id);

              return (
                <div key={id} className="space-y-0.5">
                  {/* Category Root Header */}
                  <div
                    onClick={() => {
                      onSelectCategory(id);
                      onSelectFolder(null);
                      onSelectTag(null);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-[0.25rem] text-xs transition-colors cursor-pointer group ${
                      isCategoryActive
                        ? 'bg-[#eceef0] text-[#191c1e] font-semibold'
                        : 'text-[#464554] hover:bg-[#f2f4f6] hover:text-[#191c1e]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      {/* Expand / Collapse toggle */}
                      <button
                        type="button"
                        onClick={(e) => toggleCategoryExpand(id, e)}
                        className="p-0.5 hover:text-[#191c1e] text-[#767586] cursor-pointer rounded"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                      </button>

                      <Icon
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isCategoryActive
                            ? 'text-[#4648d4]'
                            : 'text-[#767586] group-hover:text-[#191c1e]'
                        }`}
                      />
                      <span className="truncate">{meta.name}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Add subfolder button on hover */}
                      <button
                        type="button"
                        onClick={(e) => handleStartCreateFolder(id, e)}
                        title={`New subfolder in ${meta.name}`}
                        className="p-0.5 rounded text-[#767586] hover:text-[#4648d4] hover:bg-[#e0e3e5] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <FolderPlus className="w-3.5 h-3.5" />
                      </button>

                      <span className="font-mono text-[11px] text-[#767586] tabular-nums">
                        {categoryCounts[id]}
                      </span>
                    </div>
                  </div>

                  {/* Subfolders list (when expanded) */}
                  {isExpanded && (
                    <div className="pl-6 pr-1 space-y-0.5 border-l border-[#e0e3e5] ml-3.5 my-0.5">
                      {/* Inline New Subfolder Input */}
                      {creatingFolderCategory === id && (
                        <div className="flex items-center gap-1 py-1 px-1.5 bg-white border border-[#4648d4] rounded-[0.25rem] my-1 shadow-xs">
                          <Folder className="w-3 h-3 text-[#4648d4] shrink-0" />
                          <input
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleConfirmCreateFolder();
                              if (e.key === 'Escape') setCreatingFolderCategory(null);
                            }}
                            placeholder="Subfolder name..."
                            autoFocus
                            className="w-full text-xs bg-transparent focus:outline-none text-[#191c1e] placeholder:text-[#767586]"
                          />
                          <button
                            type="button"
                            onClick={handleConfirmCreateFolder}
                            className="p-0.5 text-[#4648d4] hover:bg-[#e1e0ff] rounded cursor-pointer"
                            title="Create subfolder"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setCreatingFolderCategory(null)}
                            className="p-0.5 text-[#767586] hover:bg-[#eceef0] rounded cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {/* Subfolder Items */}
                      {catFolders.map((folder) => {
                        const isFolderActive =
                          currentCategory === id &&
                          selectedFolderId === folder.id &&
                          selectedTag === null;
                        const count = folderCounts[folder.id] || 0;
                        const isEditingThis = editingFolderId === folder.id;

                        if (isEditingThis) {
                          return (
                            <div
                              key={folder.id}
                              className="flex items-center gap-1 py-1 px-1.5 bg-white border border-[#4648d4] rounded-[0.25rem] my-0.5"
                            >
                              <input
                                type="text"
                                value={editFolderName}
                                onChange={(e) => setEditFolderName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleConfirmRename(folder.id);
                                  if (e.key === 'Escape') setEditingFolderId(null);
                                }}
                                autoFocus
                                className="w-full text-xs bg-transparent focus:outline-none text-[#191c1e]"
                              />
                              <button
                                type="button"
                                onClick={() => handleConfirmRename(folder.id)}
                                className="p-0.5 text-[#4648d4] hover:bg-[#e1e0ff] rounded cursor-pointer"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingFolderId(null)}
                                className="p-0.5 text-[#767586] hover:bg-[#eceef0] rounded cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={folder.id}
                            className="relative group/folder"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                onSelectCategory(id);
                                onSelectFolder(folder.id);
                                onSelectTag(null);
                                onCloseMobile();
                              }}
                              className={`w-full flex items-center justify-between px-2 py-1 rounded-[0.25rem] text-xs transition-colors cursor-pointer ${
                                isFolderActive
                                  ? 'bg-[#e1e0ff] text-[#07006c] font-medium'
                                  : 'text-[#464554] hover:bg-[#f2f4f6] hover:text-[#191c1e]'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <Folder className={`w-3 h-3 shrink-0 ${isFolderActive ? 'text-[#4648d4]' : 'text-[#767586]'}`} />
                                <span className="truncate">{folder.name}</span>
                              </div>

                              <div className="flex items-center gap-1">
                                <span className="font-mono text-[10px] text-[#767586] tabular-nums">
                                  {count}
                                </span>

                                {/* Folder options trigger */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuFolderId(
                                      activeMenuFolderId === folder.id ? null : folder.id
                                    );
                                  }}
                                  className="p-0.5 rounded text-[#767586] hover:text-[#191c1e] opacity-0 group-hover/folder:opacity-100 transition-opacity cursor-pointer"
                                  title="Folder settings"
                                >
                                  <MoreVertical className="w-3 h-3" />
                                </button>
                              </div>
                            </button>

                            {/* Dropdown Menu for Folder */}
                            {activeMenuFolderId === folder.id && (
                              <div
                                className="absolute right-0 top-6 z-30 bg-white border border-[#c7c4d7] rounded-[0.375rem] shadow-sm py-1 w-32 text-xs text-[#191c1e]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={(e) => handleStartRename(folder, e)}
                                  className="w-full text-left px-2.5 py-1.5 hover:bg-[#f2f4f6] flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Edit2 className="w-3 h-3 text-[#767586]" />
                                  <span>Rename</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (
                                      confirm(
                                        `Delete folder "${folder.name}"? Notes inside will be moved to root.`
                                      )
                                    ) {
                                      onDeleteFolder(folder.id);
                                      setActiveMenuFolderId(null);
                                    }
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 hover:bg-[#ffdad6] text-[#ba1a1a] flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3 text-[#ba1a1a]" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {catFolders.length === 0 && creatingFolderCategory !== id && (
                        <div className="py-1 px-2 text-[11px] text-[#767586] italic flex items-center justify-between">
                          <span>No subfolders</span>
                          <button
                            type="button"
                            onClick={(e) => handleStartCreateFolder(id, e)}
                            className="text-[#4648d4] hover:underline cursor-pointer"
                          >
                            + add
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Tags list */}
          {tagCounts.length > 0 && (
            <div className="px-2 pt-4 pb-2">
              <div className="px-2.5 py-1 text-[11px] font-medium text-[#767586] uppercase tracking-[0.05em] flex items-center justify-between">
                <span>Tags</span>
                {selectedTag && (
                  <button
                    type="button"
                    onClick={() => onSelectTag(null)}
                    className="text-[10px] text-[#4648d4] hover:underline cursor-pointer lowercase"
                  >
                    clear
                  </button>
                )}
              </div>
              <div className="space-y-0.5 mt-1">
                {tagCounts.slice(0, 8).map(([tag, count]) => {
                  const isTagActive = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        onSelectTag(isTagActive ? null : tag);
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1 text-xs rounded-[0.25rem] transition-colors cursor-pointer ${
                        isTagActive
                          ? 'bg-[#e1e0ff] text-[#07006c] font-medium'
                          : 'text-[#464554] hover:bg-[#f2f4f6]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <Tag className="w-3 h-3 text-[#767586] shrink-0" />
                        <span className="truncate">#{tag}</span>
                      </div>
                      <span className="font-mono text-[10px] text-[#767586] tabular-nums shrink-0 ml-1">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Footer utilities */}
          <div className="p-3 border-t border-[#e6e8ea] space-y-1">
            <button
              type="button"
              onClick={onOpenExportImport}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-[#464554] hover:text-[#191c1e] hover:bg-[#eceef0] rounded-[0.25rem] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Download className="w-3.5 h-3.5 text-[#767586]" />
                <span>Export / Backup</span>
              </div>
              <span className="text-[10px] text-[#767586]">JSON</span>
            </button>

            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-[#464554] hover:text-[#191c1e] hover:bg-[#eceef0] rounded-[0.25rem] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Command className="w-3.5 h-3.5 text-[#767586]" />
                <span>Command Menu</span>
              </div>
              <kbd className="font-mono text-[10px] text-[#767586] bg-[#eceef0] px-1 py-0.5 rounded-[2px]">
                ⌘K
              </kbd>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
