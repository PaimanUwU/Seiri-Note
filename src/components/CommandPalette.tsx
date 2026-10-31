import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  FileText,
  Plus,
  Target,
  Compass,
  Bookmark,
  Archive,
  Download,
  LayoutGrid,
  Columns3,
  X,
  ArrowRight,
  Folder,
} from 'lucide-react';
import { Note, ParaCategory, PARA_CATEGORIES, ViewMode, Subfolder } from '../types/note';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  folders: Subfolder[];
  onSelectNote: (id: string) => void;
  onCreateNote: (category: ParaCategory, folderId?: string | null) => void;
  onSelectCategory: (category: ParaCategory | 'all') => void;
  onSelectFolder?: (category: ParaCategory, folderId: string) => void;
  onToggleViewMode: (mode: ViewMode) => void;
  onOpenExportImport: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  notes,
  folders,
  onSelectNote,
  onCreateNote,
  onSelectCategory,
  onSelectFolder,
  onToggleViewMode,
  onOpenExportImport,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global keyboard shortcut to open/close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Compile list of actions and search results
  const items = React.useMemo(() => {
    const q = query.trim().toLowerCase();

    const noteResults = notes
      .filter(
        (n) =>
          !q ||
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 6)
      .map((n) => {
        const folder = n.folderId ? folders.find((f) => f.id === n.folderId) : null;
        return {
          id: `note-${n.id}`,
          title: n.title || 'Untitled Note',
          subtitle: `${PARA_CATEGORIES[n.category].name}${folder ? ` / ${folder.name}` : ''} · ${n.tags.map((t) => `#${t}`).join(' ')}`,
          icon: FileText,
          action: () => {
            onSelectNote(n.id);
            onClose();
          },
        };
      });

    const folderResults = folders
      .filter((f) => !q || f.name.toLowerCase().includes(q) || f.category.includes(q))
      .slice(0, 4)
      .map((f) => ({
        id: `folder-${f.id}`,
        title: `Subfolder: ${f.name}`,
        subtitle: `In ${PARA_CATEGORIES[f.category].name} · ${notes.filter((n) => n.folderId === f.id).length} notes`,
        icon: Folder,
        action: () => {
          onSelectFolder?.(f.category, f.id);
          onClose();
        },
      }));

    const commandResults = [
      {
        id: 'cmd-new-project',
        title: 'Create note in Projects',
        subtitle: 'Add active goal with deadline',
        icon: Target,
        action: () => {
          onCreateNote('projects');
          onClose();
        },
      },
      {
        id: 'cmd-new-area',
        title: 'Create note in Areas',
        subtitle: 'Add ongoing standard',
        icon: Compass,
        action: () => {
          onCreateNote('areas');
          onClose();
        },
      },
      {
        id: 'cmd-new-resource',
        title: 'Create note in Resources',
        subtitle: 'Add reference material',
        icon: Bookmark,
        action: () => {
          onCreateNote('resources');
          onClose();
        },
      },
      {
        id: 'cmd-new-archive',
        title: 'Create note in Archives',
        subtitle: 'Add historical note',
        icon: Archive,
        action: () => {
          onCreateNote('archives');
          onClose();
        },
      },
      {
        id: 'cmd-view-dashboard',
        title: 'Switch to PARA Dashboard Overview',
        subtitle: 'High-level 4 quadrants grid',
        icon: LayoutGrid,
        action: () => {
          onToggleViewMode('dashboard');
          onClose();
        },
      },
      {
        id: 'cmd-view-studio',
        title: 'Switch to 3-Column Studio',
        subtitle: 'Multi-pane editor workspace',
        icon: Columns3,
        action: () => {
          onToggleViewMode('studio');
          onClose();
        },
      },
      {
        id: 'cmd-export-json',
        title: 'Backup & Export Workspace',
        subtitle: 'Download full workspace JSON',
        icon: Download,
        action: () => {
          onOpenExportImport();
          onClose();
        },
      },
    ].filter(
      (c) =>
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.subtitle.toLowerCase().includes(q)
    );

    return [...folderResults, ...noteResults, ...commandResults];
  }, [
    query,
    notes,
    folders,
    onSelectNote,
    onCreateNote,
    onSelectFolder,
    onToggleViewMode,
    onOpenExportImport,
    onClose,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, items.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev <= 0 ? items.length - 1 : prev - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[selectedIndex]) {
        items[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/30 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white border border-[#c7c4d7] rounded-[0.5rem] shadow-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-3 border-b border-[#e6e8ea] flex items-center gap-2">
          <Search className="w-4 h-4 text-[#767586] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search notes and subfolders..."
            className="w-full text-sm bg-transparent text-[#191c1e] placeholder:text-[#767586] focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-[#767586] hover:text-[#191c1e] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="text-[10px] font-mono text-[#767586] bg-[#eceef0] px-1.5 py-0.5 rounded-[2px]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-1.5 space-y-0.5">
          {items.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#767586]">
              No notes or commands matching "{query}".
            </div>
          ) : (
            items.map((item, index) => {
              const isSelected = index === selectedIndex;
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`p-2 rounded-[0.25rem] flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#e1e0ff]/60 text-[#07006c]' : 'hover:bg-[#f7f9fb] text-[#191c1e]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div
                      className={`p-1 rounded-[0.25rem] shrink-0 ${
                        isSelected
                          ? 'bg-[#4648d4] text-white'
                          : 'bg-[#eceef0] text-[#464554]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-medium truncate">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-[#767586] truncate">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <ArrowRight className="w-3.5 h-3.5 text-[#4648d4] shrink-0" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-3 py-2 bg-[#f7f9fb] border-t border-[#e6e8ea] flex items-center justify-between text-[11px] text-[#767586]">
          <div className="flex items-center gap-2">
            <span>
              <kbd className="font-mono bg-[#eceef0] px-1 py-0.5 rounded-[2px]">
                ↑↓
              </kbd>{' '}
              to navigate
            </span>
            <span>
              <kbd className="font-mono bg-[#eceef0] px-1 py-0.5 rounded-[2px]">
                ↵
              </kbd>{' '}
              to select
            </span>
          </div>
          <span>Seiri</span>
        </div>
      </div>
    </div>
  );
};
