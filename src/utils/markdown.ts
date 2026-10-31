import React from 'react';
import { Note } from '../types/note';

/**
 * Extracts all [[Wikilinks]] from a text string.
 */
export function extractWikilinks(text: string): string[] {
  if (!text) return [];
  const regex = /\[\[(.*?)\]\]/g;
  const matches: string[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    const title = match[1].trim();
    if (title && !matches.includes(title)) {
      matches.push(title);
    }
  }
  return matches;
}

/**
 * Calculates bidirectional backlinks for a specific note.
 */
export function getNoteBacklinks(
  targetNote: Note,
  allNotes: Note[]
): { incoming: Note[]; outgoing: Note[] } {
  const targetTitleLower = targetNote.title.trim().toLowerCase();

  // Notes that mention [[Target Title]]
  const incoming = allNotes.filter((note) => {
    if (note.id === targetNote.id) return false;
    const links = extractWikilinks(note.content).map((l) => l.toLowerCase());
    return links.includes(targetTitleLower);
  });

  // Outgoing links in current note that point to valid existing notes
  const outgoingTitles = extractWikilinks(targetNote.content).map((l) =>
    l.toLowerCase()
  );
  const outgoing = allNotes.filter(
    (note) =>
      note.id !== targetNote.id &&
      outgoingTitles.includes(note.title.trim().toLowerCase())
  );

  return { incoming, outgoing };
}

/**
 * Computes word count, character count, estimated reading time, and tasks.
 */
export function getNoteMetrics(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const chars = content.length;
  const readingTimeMin = Math.max(1, Math.ceil(words / 200));

  const totalTasks = (content.match(/- \[( |x|X)\]/g) || []).length;
  const completedTasks = (content.match(/- \[(x|X)\]/g) || []).length;

  return {
    words,
    chars,
    readingTimeMin,
    totalTasks,
    completedTasks,
  };
}

/**
 * Toggles a markdown task item at a specific line or occurrence.
 */
export function toggleMarkdownTask(
  content: string,
  taskLineIndex: number
): string {
  const lines = content.split('\n');
  let currentTaskIndex = 0;

  const updatedLines = lines.map((line) => {
    const isTask = /^- \[( |x|X)\] (.*)$/.test(line);
    if (!isTask) return line;

    if (currentTaskIndex === taskLineIndex) {
      currentTaskIndex++;
      if (line.startsWith('- [ ]')) {
        return line.replace('- [ ]', '- [x]');
      } else {
        return line.replace(/^- \[(x|X)\]/, '- [ ]');
      }
    }

    currentTaskIndex++;
    return line;
  });

  return updatedLines.join('\n');
}
