export type ParaCategory = 'projects' | 'areas' | 'resources' | 'archives';

export interface Subfolder {
  id: string;
  name: string;
  category: ParaCategory;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: ParaCategory;
  folderId?: string | null; // Optional subfolder ID
  tags: string[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  pinned?: boolean;
  deadline?: string; // Optional deadline for projects
  lead?: string; // Optional lead/domain for areas
  sourceUrl?: string; // Optional reference link for resources
}

export type ViewMode = 'studio' | 'dashboard';
export type EditorMode = 'hybrid' | 'split' | 'preview';

export interface ParaCategoryMeta {
  id: ParaCategory;
  name: string;
  subtitle: string;
  definition: string;
  badgeLabel: string;
  accentColor: string;
  borderColor: string;
  example: string;
}

export const PARA_CATEGORIES: Record<ParaCategory, ParaCategoryMeta> = {
  projects: {
    id: 'projects',
    name: 'Projects',
    subtitle: 'Active goals with clear completion deadlines',
    definition: 'Series of tasks linked to a goal, with a fixed finish line.',
    badgeLabel: 'Active Goals',
    accentColor: '#4648d4',
    borderColor: '#c0c1ff',
    example: 'App v2 Launch, Q4 Audit, Rebrand Proposal',
  },
  areas: {
    id: 'areas',
    name: 'Areas',
    subtitle: 'Ongoing spheres of activity and standards',
    definition: 'Spheres of activity with a standard to be maintained over time.',
    badgeLabel: 'Standards',
    accentColor: '#4b41e1',
    borderColor: '#c3c0ff',
    example: 'Physical Health, Engineering Standards, Finances',
  },
  resources: {
    id: 'resources',
    name: 'Resources',
    subtitle: 'Topics or themes of continuous interest & reference',
    definition: 'Topics or reference materials that could be useful in the future.',
    badgeLabel: 'References',
    accentColor: '#4651b9',
    borderColor: '#bdc2ff',
    example: 'Design Systems, Distributed Systems, Book Summaries',
  },
  archives: {
    id: 'archives',
    name: 'Archives',
    subtitle: 'Inactive items from the other three categories',
    definition: 'Completed, paused, or retired projects and historical records.',
    badgeLabel: 'Historical',
    accentColor: '#767586',
    borderColor: '#c7c4d7',
    example: 'Completed 2025 Audits, Retired Codebases, Past Sprints',
  },
};
