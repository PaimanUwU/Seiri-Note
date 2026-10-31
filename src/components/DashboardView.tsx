import React from 'react';
import {
  Target,
  Compass,
  Bookmark,
  Archive,
  Plus,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  Menu,
  Folder,
} from 'lucide-react';
import { Note, ParaCategory, PARA_CATEGORIES, Subfolder } from '../types/note';
import { getNoteMetrics } from '../utils/markdown';

interface DashboardViewProps {
  notes: Note[];
  folders: Subfolder[];
  onOpenNote: (id: string) => void;
  onCreateNote: (category: ParaCategory) => void;
  onSelectCategory: (category: ParaCategory) => void;
  onSelectFolder: (category: ParaCategory, folderId: string) => void;
  onSwitchToStudio: () => void;
  onOpenMobileMenu: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  notes,
  folders,
  onOpenNote,
  onCreateNote,
  onSelectCategory,
  onSelectFolder,
  onSwitchToStudio,
  onOpenMobileMenu,
}) => {
  const categories: Array<{
    id: ParaCategory;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'projects', icon: Target },
    { id: 'areas', icon: Compass },
    { id: 'resources', icon: Bookmark },
    { id: 'archives', icon: Archive },
  ];

  const folderMap = React.useMemo(() => {
    const map = new Map<string, Subfolder>();
    folders.forEach((f) => map.set(f.id, f));
    return map;
  }, [folders]);

  // Overall workspace stats
  const totalNotes = notes.length;
  const totalTasks = notes.reduce(
    (acc, n) => acc + getNoteMetrics(n.content).totalTasks,
    0
  );
  const completedTasks = notes.reduce(
    (acc, n) => acc + getNoteMetrics(n.content).completedTasks,
    0
  );

  return (
    <main className="flex-1 bg-[#f7f9fb] flex flex-col h-full overflow-y-auto">
      {/* Top dashboard bar */}
      <div className="px-6 md:px-10 py-5 border-b border-[#e6e8ea] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f7f9fb]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden p-1.5 text-[#464554] hover:text-[#191c1e] cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-semibold tracking-[-0.02em] text-[#191c1e]">
                PARA Overview
              </h1>
              <span className="text-xs text-[#767586] font-mono tabular-nums">
                · {totalNotes} notes · {folders.length} subfolders
              </span>
            </div>
            <p className="text-xs text-[#464554] mt-0.5">
              Projects, Areas, Resources, and Archives organizational framework.
            </p>
          </div>
        </div>

        {/* Global stats & Quick Action */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 text-xs text-[#767586] px-3 py-1.5 bg-white border border-[#c7c4d7] rounded-[0.25rem]">
            <span>Tasks Progress</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums font-medium text-[#4648d4]">
              {completedTasks}/{totalTasks} done
            </span>
          </div>

          <button
            type="button"
            onClick={onSwitchToStudio}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#4648d4] hover:bg-[#6063ee] rounded-[0.25rem] transition-colors shadow-xs cursor-pointer"
          >
            <span>Open Studio Canvas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4 Quadrants Grid */}
      <div className="p-6 md:p-10 max-w-6xl mx-auto w-full space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map(({ id, icon: Icon }) => {
            const meta = PARA_CATEGORIES[id];
            const catNotes = notes.filter((n) => n.category === id);
            const catFolders = folders.filter((f) => f.category === id);
            const totalCatTasks = catNotes.reduce(
              (acc, n) => acc + getNoteMetrics(n.content).totalTasks,
              0
            );

            return (
              <div
                key={id}
                className="bg-white border border-[#c7c4d7] hover:border-[#4648d4] transition-all rounded-[0.5rem] p-5 shadow-xs flex flex-col justify-between group"
              >
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-[0.25rem] bg-[#f2f4f6] flex items-center justify-center text-[#4648d4] group-hover:bg-[#e1e0ff] transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-semibold text-[#191c1e]">
                            {meta.name}
                          </h2>
                          <span className="text-[11px] font-mono tabular-nums text-[#767586]">
                            ({catNotes.length})
                          </span>
                        </div>
                        <span className="text-[11px] text-[#464554] block">
                          {meta.subtitle}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onCreateNote(id)}
                      title={`Add note to ${meta.name}`}
                      className="p-1.5 rounded-[0.25rem] text-[#767586] hover:text-[#4648d4] hover:bg-[#eceef0] transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-[#767586] leading-relaxed mb-3 border-b border-[#eceef0] pb-2.5">
                    {meta.definition}
                  </p>

                  {/* Subfolders Quick Links in this Quadrant */}
                  {catFolders.length > 0 && (
                    <div className="mb-3.5">
                      <div className="text-[10px] text-[#767586] uppercase tracking-wider font-medium mb-1.5">
                        Subfolders ({catFolders.length})
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {catFolders.map((f) => {
                          const count = notes.filter((n) => n.folderId === f.id).length;
                          return (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => onSelectFolder(id, f.id)}
                              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-[0.25rem] text-[11px] bg-[#f7f9fb] hover:bg-[#e1e0ff] hover:text-[#07006c] text-[#464554] border border-[#e0e3e5] transition-colors cursor-pointer font-medium"
                              title={`View ${count} notes in ${f.name}`}
                            >
                              <Folder className="w-3 h-3 text-[#4648d4]" />
                              <span>{f.name}</span>
                              <span className="font-mono text-[10px] text-[#767586] tabular-nums">
                                ({count})
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Notes List inside Quadrant */}
                  <div className="space-y-2 mb-4">
                    {catNotes.length === 0 ? (
                      <div className="py-4 text-center text-xs text-[#767586] italic">
                        No active notes in this quadrant.
                      </div>
                    ) : (
                      catNotes.slice(0, 3).map((note) => {
                        const m = getNoteMetrics(note.content);
                        const folder = note.folderId ? folderMap.get(note.folderId) : null;
                        return (
                          <div
                            key={note.id}
                            onClick={() => onOpenNote(note.id)}
                            className="p-2.5 rounded-[0.25rem] bg-[#f7f9fb] hover:bg-[#eceef0] border border-[#e0e3e5] hover:border-[#c7c4d7] transition-all cursor-pointer flex items-center justify-between gap-2 group/item"
                          >
                            <div className="truncate flex-1">
                              <span className="text-xs font-medium text-[#191c1e] group-hover/item:text-[#4648d4] truncate block">
                                {note.title}
                              </span>
                              <div className="flex items-center gap-2 text-[10px] text-[#767586] mt-0.5">
                                {folder && (
                                  <span className="text-[#4648d4] font-medium truncate max-w-[120px]">
                                    📁 {folder.name}
                                  </span>
                                )}
                                {note.deadline && (
                                  <span className="flex items-center gap-1 font-mono">
                                    <Calendar className="w-2.5 h-2.5 text-[#4648d4]" />
                                    {note.deadline}
                                  </span>
                                )}
                                {m.totalTasks > 0 && (
                                  <span className="flex items-center gap-1 font-mono">
                                    <CheckCircle2 className="w-2.5 h-2.5 text-[#4648d4]" />
                                    {m.completedTasks}/{m.totalTasks}
                                  </span>
                                )}
                                <span>{m.words} words</span>
                              </div>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-[#767586] group-hover/item:text-[#4648d4] shrink-0" />
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Footer action to open category */}
                <div className="pt-2 border-t border-[#eceef0] flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => onSelectCategory(id)}
                    className="font-medium text-[#4648d4] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View all {catNotes.length} notes</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <span className="text-[11px] text-[#767586] font-mono">
                    {totalCatTasks > 0 ? `${totalCatTasks} tasks total` : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* PARA Philosophy quick reference callout */}
        <div className="p-4 rounded-[0.5rem] bg-[#f2f4f6] border border-[#c7c4d7] text-xs text-[#464554] space-y-2">
          <div className="font-semibold text-[#191c1e] flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#4648d4]" />
            <span>Tiago Forte's P.A.R.A. Subfolder Structure</span>
          </div>
          <p className="leading-relaxed">
            Subfolders allow deep nesting within each pillar while preserving clear actionability: group active initiatives inside <strong>Projects</strong>, domains of responsibility inside <strong>Areas</strong>, subject repositories in <strong>Resources</strong>, and retrospective records in <strong>Archives</strong>.
          </p>
        </div>
      </div>
    </main>
  );
};
