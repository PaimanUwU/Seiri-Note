/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Note, ParaCategory, ViewMode, Subfolder } from './types/note';
import {
  loadNotesFromStorage,
  saveNotesToStorage,
  loadFoldersFromStorage,
  saveFoldersToStorage,
  loadVaultFromTauri,
  saveVaultToTauri,
} from './utils/storage';
import { INITIAL_NOTES, INITIAL_FOLDERS } from './data/seedData';
import { Sidebar } from './components/Sidebar';
import { NoteList } from './components/NoteList';
import { NoteEditor } from './components/NoteEditor';
import { DashboardView } from './components/DashboardView';
import { CommandPalette } from './components/CommandPalette';
import { ExportImportModal } from './components/ExportImportModal';

export default function App() {
  const [notes, setNotes] = useState<Note[]>(() => loadNotesFromStorage());
  const [folders, setFolders] = useState<Subfolder[]>(() => loadFoldersFromStorage());
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(() => {
    const initial = loadNotesFromStorage();
    return initial.length > 0 ? initial[0].id : null;
  });
  const [currentCategory, setCurrentCategory] = useState<ParaCategory | 'all'>('projects');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('studio');
  const [mobileView, setMobileView] = useState<'list' | 'editor'>('list');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNoteListCollapsed, setIsNoteListCollapsed] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Hydrate from Tauri native vault if available
  useEffect(() => {
    loadVaultFromTauri().then((vault) => {
      if (vault) {
        setNotes(vault.notes);
        setFolders(vault.folders);
        if (vault.notes.length > 0) {
          setSelectedNoteId((prev) =>
            vault.notes.some((n) => n.id === prev) ? prev : vault.notes[0].id
          );
        }
      }
    });
  }, []);

  // Sync notes & folders to localStorage and Tauri native vault
  useEffect(() => {
    saveNotesToStorage(notes);
    saveVaultToTauri(notes, folders);
  }, [notes, folders]);

  // Sync folders to localStorage
  useEffect(() => {
    saveFoldersToStorage(folders);
  }, [folders]);

  // Global keyboard shortcuts (Cmd+N for new note, Cmd+K for command palette)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser default save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
      }

      // New note shortcut
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        handleCreateNote(
          currentCategory === 'all' ? 'projects' : currentCategory,
          selectedFolderId
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCategory, selectedFolderId, notes]);

  // Selected note object
  const selectedNote = notes.find((n) => n.id === selectedNoteId) || null;

  // Create new note
  const handleCreateNote = useCallback(
    (category: ParaCategory = 'projects', folderId: string | null = null) => {
      const now = new Date().toISOString();
      const newId = `note-${Date.now()}`;
      const newNote: Note = {
        id: newId,
        title: 'Untitled Note',
        category,
        folderId: folderId ?? selectedFolderId,
        tags: [],
        createdAt: now,
        updatedAt: now,
        content: `# Untitled Note\n\nStart capturing your thoughts, goals, or reference materials here.\n\n- [ ] First action item\n- [ ] Second action item\n`,
      };

      setNotes((prev) => [newNote, ...prev]);
      setSelectedNoteId(newId);
      setMobileView('editor');
      if (currentCategory !== 'all' && currentCategory !== category) {
        setCurrentCategory(category);
      }
      if (folderId !== undefined) {
        setSelectedFolderId(folderId);
      }
      if (viewMode === 'dashboard') {
        setViewMode('studio');
      }
    },
    [currentCategory, selectedFolderId, viewMode]
  );

  // Create new subfolder
  const handleCreateFolder = useCallback(
    (name: string, category: ParaCategory) => {
      const newFolder: Subfolder = {
        id: `f-${Date.now()}`,
        name: name.trim(),
        category,
        createdAt: new Date().toISOString(),
      };
      setFolders((prev) => [...prev, newFolder]);
      setCurrentCategory(category);
      setSelectedFolderId(newFolder.id);
      setMobileView('list');
    },
    []
  );

  // Rename subfolder
  const handleRenameFolder = useCallback(
    (folderId: string, newName: string) => {
      setFolders((prev) =>
        prev.map((f) => (f.id === folderId ? { ...f, name: newName.trim() } : f))
      );
    },
    []
  );

  // Delete subfolder
  const handleDeleteFolder = useCallback(
    (folderId: string) => {
      setFolders((prev) => prev.filter((f) => f.id !== folderId));
      // Reset folderId on notes that were in this folder to null
      setNotes((prev) =>
        prev.map((n) => (n.folderId === folderId ? { ...n, folderId: null } : n))
      );
      if (selectedFolderId === folderId) {
        setSelectedFolderId(null);
      }
    },
    [selectedFolderId]
  );

  // Update note
  const handleUpdateNote = useCallback((updatedNote: Note) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
    );
  }, []);

  // Delete note
  const handleDeleteNote = useCallback(
    (id: string) => {
      setNotes((prev) => {
        const remaining = prev.filter((n) => n.id !== id);
        if (selectedNoteId === id) {
          const nextNoteId = remaining.length > 0 ? remaining[0].id : null;
          setSelectedNoteId(nextNoteId);
          if (!nextNoteId) {
            setMobileView('list');
          }
        }
        return remaining;
      });
    },
    [selectedNoteId]
  );

  // Duplicate note
  const handleDuplicateNote = useCallback((sourceNote: Note) => {
    const now = new Date().toISOString();
    const duplicated: Note = {
      ...sourceNote,
      id: `note-${Date.now()}`,
      title: `${sourceNote.title} (Copy)`,
      createdAt: now,
      updatedAt: now,
      pinned: false,
    };
    setNotes((prev) => [duplicated, ...prev]);
    setSelectedNoteId(duplicated.id);
    setMobileView('editor');
  }, []);

  // Toggle pinned note
  const handleTogglePin = useCallback((id: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              pinned: !n.pinned,
              updatedAt: new Date().toISOString(),
            }
          : n
      )
    );
  }, []);

  // Move note to another category or subfolder
  const handleMoveNote = useCallback(
    (id: string, newCategory: ParaCategory, newFolderId?: string | null) => {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === id
            ? {
                ...n,
                category: newCategory,
                folderId: newFolderId !== undefined ? newFolderId : (newCategory === n.category ? n.folderId : null),
                updatedAt: new Date().toISOString(),
              }
            : n
        )
      );
    },
    []
  );

  // Find or create note by title (for [[wikilinks]])
  const handleSelectNoteByTitle = useCallback(
    (title: string) => {
      const target = notes.find(
        (n) => n.title.trim().toLowerCase() === title.trim().toLowerCase()
      );
      if (target) {
        setSelectedNoteId(target.id);
        setMobileView('editor');
        if (viewMode === 'dashboard') {
          setViewMode('studio');
        }
      } else {
        // Offer to create it if it doesn't exist
        const now = new Date().toISOString();
        const newNote: Note = {
          id: `note-${Date.now()}`,
          title: title.trim(),
          category: currentCategory === 'all' ? 'resources' : currentCategory,
          folderId: selectedFolderId,
          tags: [],
          createdAt: now,
          updatedAt: now,
          content: `# ${title.trim()}\n\nNewly created from wikilink.\n`,
        };
        setNotes((prev) => [newNote, ...prev]);
        setSelectedNoteId(newNote.id);
        setMobileView('editor');
        if (viewMode === 'dashboard') {
          setViewMode('studio');
        }
      }
    },
    [notes, currentCategory, selectedFolderId, viewMode]
  );

  // Reset to initial seed data
  const handleResetToSeed = useCallback(() => {
    setNotes(INITIAL_NOTES);
    setFolders(INITIAL_FOLDERS);
    setSelectedNoteId(INITIAL_NOTES[0].id);
    setCurrentCategory('projects');
    setSelectedFolderId(null);
    setMobileView('list');
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f7f9fb] text-[#191c1e] font-sans antialiased">
      {/* Column 1: Sidebar Navigation */}
      <Sidebar
        currentCategory={currentCategory}
        selectedFolderId={selectedFolderId}
        onSelectCategory={(cat) => {
          setCurrentCategory(cat);
          setSelectedFolderId(null);
          setMobileView('list');
        }}
        onSelectFolder={(fId) => {
          setSelectedFolderId(fId);
          setMobileView('list');
        }}
        folders={folders}
        onCreateFolder={handleCreateFolder}
        onRenameFolder={handleRenameFolder}
        onDeleteFolder={handleDeleteFolder}
        selectedTag={selectedTag}
        onSelectTag={(tag) => {
          setSelectedTag(tag);
          setMobileView('list');
        }}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        notes={notes}
        onCreateNote={handleCreateNote}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenExportImport={() => setIsExportImportOpen(true)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* Main Content Area */}
      {viewMode === 'studio' ? (
        <div className="flex flex-1 h-full overflow-hidden">
          {/* Column 2: Note List (Collapsible on desktop, toggled on mobile) */}
          <div
            className={`shrink-0 h-full ${
              mobileView === 'editor' ? 'hidden md:flex' : 'flex'
            }`}
          >
            <NoteList
              notes={notes}
              folders={folders}
              selectedNoteId={selectedNoteId}
              onSelectNote={(id) => {
                setSelectedNoteId(id);
                setMobileView('editor');
              }}
              currentCategory={currentCategory}
              selectedFolderId={selectedFolderId}
              onSelectFolder={(fId) => {
                setSelectedFolderId(fId);
                setMobileView('list');
              }}
              selectedTag={selectedTag}
              onCreateNote={(cat, fId) => {
                handleCreateNote(cat, fId);
                setMobileView('editor');
              }}
              onDeleteNote={handleDeleteNote}
              onTogglePin={handleTogglePin}
              onMoveNote={handleMoveNote}
              onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
              isSidebarCollapsed={isSidebarCollapsed}
              onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
              isCollapsed={isNoteListCollapsed}
              onToggleCollapse={() => setIsNoteListCollapsed((prev) => !prev)}
            />
          </div>

          {/* Column 3: Note Editor Canvas (Expands to fill available space, toggleable on mobile) */}
          <div
            className={`flex-1 h-full ${
              mobileView === 'list' ? 'hidden md:flex' : 'flex'
            }`}
          >
            <NoteEditor
              note={selectedNote}
              allNotes={notes}
              folders={folders}
              onCreateFolder={handleCreateFolder}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
              onDuplicateNote={handleDuplicateNote}
              onTogglePin={handleTogglePin}
              onSelectNoteById={(id) => {
                setSelectedNoteId(id);
                setMobileView('editor');
              }}
              onSelectNoteByTitle={(title) => {
                handleSelectNoteByTitle(title);
                setMobileView('editor');
              }}
              onBackToList={() => setMobileView('list')}
              isSidebarCollapsed={isSidebarCollapsed}
              onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
              isNoteListCollapsed={isNoteListCollapsed}
              onToggleNoteList={() => setIsNoteListCollapsed((prev) => !prev)}
            />
          </div>
        </div>
      ) : (
        /* High-Level PARA Dashboard View */
        <DashboardView
          notes={notes}
          folders={folders}
          onOpenNote={(id) => {
            setSelectedNoteId(id);
            setViewMode('studio');
            setMobileView('editor');
          }}
          onCreateNote={(cat) => {
            handleCreateNote(cat);
            setMobileView('editor');
          }}
          onSelectCategory={(cat) => {
            setCurrentCategory(cat);
            setSelectedFolderId(null);
            setViewMode('studio');
            setMobileView('list');
          }}
          onSelectFolder={(cat, folderId) => {
            setCurrentCategory(cat);
            setSelectedFolderId(folderId);
            setViewMode('studio');
            setMobileView('list');
          }}
          onSwitchToStudio={() => setViewMode('studio')}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />
      )}

      {/* Command Palette Floating Modal (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        notes={notes}
        folders={folders}
        onSelectNote={(id) => {
          setSelectedNoteId(id);
          setViewMode('studio');
          setMobileView('editor');
        }}
        onCreateNote={(cat, fId) => {
          handleCreateNote(cat, fId);
          setMobileView('editor');
        }}
        onSelectCategory={(cat) => {
          setCurrentCategory(cat);
          setSelectedFolderId(null);
          setViewMode('studio');
          setMobileView('list');
        }}
        onSelectFolder={(cat, folderId) => {
          setCurrentCategory(cat);
          setSelectedFolderId(folderId);
          setViewMode('studio');
          setMobileView('list');
        }}
        onToggleViewMode={setViewMode}
        onOpenExportImport={() => setIsExportImportOpen(true)}
      />

      {/* Export / Import & Backup Modal */}
      <ExportImportModal
        isOpen={isExportImportOpen}
        onClose={() => setIsExportImportOpen(false)}
        notes={notes}
        folders={folders}
        onImportWorkspace={(newNotes, newFolders) => {
          setNotes(newNotes);
          if (newFolders && newFolders.length > 0) {
            setFolders(newFolders);
          }
          if (newNotes.length > 0) {
            setSelectedNoteId(newNotes[0].id);
          }
          setMobileView('list');
        }}
        onResetToSeed={handleResetToSeed}
      />
    </div>
  );
}
