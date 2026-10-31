import { invoke } from '@tauri-apps/api/core';
import { Note, Subfolder } from '../types/note';
import { INITIAL_NOTES, INITIAL_FOLDERS } from '../data/seedData';

const NOTES_STORAGE_KEY = 'para_note_studio_notes_v1';
const FOLDERS_STORAGE_KEY = 'para_note_studio_folders_v1';

function isTauriRuntime(): boolean {
  return (
    typeof window !== 'undefined' &&
    Boolean((window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__)
  );
}

export async function loadVaultFromTauri(): Promise<{
  notes: Note[];
  folders: Subfolder[];
} | null> {
  if (!isTauriRuntime()) return null;
  try {
    const raw = await invoke<string | null>('load_vault');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.notes) && parsed.notes.length > 0) {
      return {
        notes: parsed.notes,
        folders:
          Array.isArray(parsed.folders) && parsed.folders.length > 0
            ? parsed.folders
            : INITIAL_FOLDERS,
      };
    }
    return null;
  } catch (err) {
    console.warn('Tauri vault load fallback to localStorage:', err);
    return null;
  }
}

export async function saveVaultToTauri(
  notes: Note[],
  folders: Subfolder[]
): Promise<void> {
  if (!isTauriRuntime()) return;
  try {
    await invoke('save_vault', {
      payload: JSON.stringify({ notes, folders }, null, 2),
    });
  } catch (err) {
    console.warn('Failed to persist vault via Tauri:', err);
  }
}

export function loadNotesFromStorage(): Note[] {
  try {
    const raw = localStorage.getItem(NOTES_STORAGE_KEY);
    if (!raw) {
      saveNotesToStorage(INITIAL_NOTES);
      return INITIAL_NOTES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_NOTES;
  } catch (error) {
    console.warn('Failed to load notes from storage, using seed data:', error);
    return INITIAL_NOTES;
  }
}

export function saveNotesToStorage(notes: Note[]): void {
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Failed to save notes to localStorage:', error);
  }
}

export function loadFoldersFromStorage(): Subfolder[] {
  try {
    const raw = localStorage.getItem(FOLDERS_STORAGE_KEY);
    if (!raw) {
      saveFoldersToStorage(INITIAL_FOLDERS);
      return INITIAL_FOLDERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_FOLDERS;
  } catch (error) {
    console.warn('Failed to load folders from storage, using seed data:', error);
    return INITIAL_FOLDERS;
  }
}

export function saveFoldersToStorage(folders: Subfolder[]): void {
  try {
    localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
  } catch (error) {
    console.error('Failed to save folders to localStorage:', error);
  }
}

export function exportWorkspaceJSON(notes: Note[], folders: Subfolder[] = []): void {
  const exportData = {
    app: 'Seiri',
    version: '1.1.0',
    exportedAt: new Date().toISOString(),
    notesCount: notes.length,
    foldersCount: folders.length,
    folders,
    notes,
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `seiri-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportNoteAsMarkdown(note: Note, subfolderName?: string): void {
  const frontmatter = [
    '---',
    `title: "${note.title.replace(/"/g, '\\"')}"`,
    `category: ${note.category}`,
    subfolderName ? `subfolder: "${subfolderName.replace(/"/g, '\\"')}"` : null,
    `tags: [${note.tags.map((t) => `"${t}"`).join(', ')}]`,
    `created: ${note.createdAt}`,
    `updated: ${note.updatedAt}`,
    note.deadline ? `deadline: ${note.deadline}` : null,
    note.lead ? `lead: "${note.lead}"` : null,
    '---',
    '',
    note.content,
  ]
    .filter(Boolean)
    .join('\n');

  const blob = new Blob([frontmatter], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeTitle = note.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  a.href = url;
  a.download = `${note.category}-${safeTitle || 'note'}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface ParsedImportData {
  notes: Note[];
  folders?: Subfolder[];
}

export function parseImportedJSON(jsonString: string): ParsedImportData | null {
  try {
    const data = JSON.parse(jsonString);
    if (data && Array.isArray(data.notes)) {
      return {
        notes: data.notes,
        folders: Array.isArray(data.folders) ? data.folders : undefined,
      };
    }
    if (Array.isArray(data)) {
      return { notes: data };
    }
    return null;
  } catch (err) {
    console.error('Invalid JSON file format:', err);
    return null;
  }
}
