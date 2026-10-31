import React from 'react';
import { Check, Link as LinkIcon } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  onToggleTask?: (taskIndex: number) => void;
  onOpenNoteByTitle?: (title: string) => void;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  onToggleTask,
  onOpenNoteByTitle,
}) => {
  if (!content) {
    return (
      <div className="py-8 text-sm text-[#767586] italic">
        Empty note content. Start typing to write your thoughts...
      </div>
    );
  }

  // Parse inline text: bold, italic, code, and [[wikilinks]]
  const renderInlineText = (text: string, keyPrefix: string): React.ReactNode[] => {
    // Regex for wikilinks [[...]], code `...`, bold **...**, italic *...*
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let idx = 0;

    // Pattern matches [[wikilink]], `code`, **bold**, *italic*, ~~strike~~
    const inlineRegex = /(\[\[.*?\]\]|`.*?`|\*\*.*?\*\*|\*.*?\*|~~.*?~~)/g;
    let lastIndex = 0;
    let match;

    while ((match = inlineRegex.exec(text)) !== null) {
      // Text before match
      if (match.index > lastIndex) {
        parts.push(
          <span key={`${keyPrefix}-txt-${idx++}`}>
            {text.substring(lastIndex, match.index)}
          </span>
        );
      }

      const token = match[0];

      // [[Wikilink]]
      if (token.startsWith('[[') && token.endsWith(']]')) {
        const linkTitle = token.slice(2, -2).trim();
        parts.push(
          <button
            key={`${keyPrefix}-wiki-${idx++}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenNoteByTitle?.(linkTitle);
            }}
            title={`Open note "${linkTitle}"`}
            className="inline-flex items-center gap-1 mx-0.5 px-1.5 py-0.5 rounded-[0.25rem] text-xs font-medium text-[#4648d4] bg-[#e1e0ff]/70 hover:bg-[#c0c1ff] transition-colors cursor-pointer border border-[#c0c1ff]/60"
          >
            <LinkIcon className="w-2.5 h-2.5 opacity-70" />
            <span className="underline decoration-dotted underline-offset-2">
              {linkTitle}
            </span>
          </button>
        );
      }
      // Inline `code`
      else if (token.startsWith('`') && token.endsWith('`')) {
        const codeText = token.slice(1, -1);
        parts.push(
          <code
            key={`${keyPrefix}-code-${idx++}`}
            className="font-mono text-xs px-1.5 py-0.5 bg-[#e0e3e5] text-[#191c1e] rounded-[0.25rem] border border-[#c7c4d7]/50"
          >
            {codeText}
          </code>
        );
      }
      // **bold**
      else if (token.startsWith('**') && token.endsWith('**')) {
        const boldText = token.slice(2, -2);
        parts.push(
          <strong
            key={`${keyPrefix}-b-${idx++}`}
            className="font-semibold text-[#191c1e]"
          >
            {boldText}
          </strong>
        );
      }
      // *italic*
      else if (token.startsWith('*') && token.endsWith('*')) {
        const italicText = token.slice(1, -1);
        parts.push(
          <em key={`${keyPrefix}-i-${idx++}`} className="italic">
            {italicText}
          </em>
        );
      }
      // ~~strike~~
      else if (token.startsWith('~~') && token.endsWith('~~')) {
        const strikeText = token.slice(2, -2);
        parts.push(
          <span
            key={`${keyPrefix}-s-${idx++}`}
            className="line-through text-[#767586]"
          >
            {strikeText}
          </span>
        );
      }

      lastIndex = match.index + token.length;
    }

    if (lastIndex < text.length) {
      parts.push(
        <span key={`${keyPrefix}-end-${idx++}`}>
          {text.substring(lastIndex)}
        </span>
      );
    }

    return parts;
  };

  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = '';
  let taskCounter = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block detection
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        inCodeBlock = false;
        renderedElements.push(
          <div
            key={`codeblock-${i}`}
            className="my-4 rounded-[0.375rem] border border-[#c7c4d7] bg-[#eceef0] p-3 overflow-x-auto text-xs font-mono text-[#191c1e]"
          >
            {codeLang && (
              <div className="text-[10px] text-[#767586] uppercase tracking-wider mb-2 font-mono">
                {codeLang}
              </div>
            )}
            <pre className="leading-relaxed">
              <code>{codeBuffer.join('\n')}</code>
            </pre>
          </div>
        );
        codeBuffer = [];
        codeLang = '';
      } else {
        // Start of code block
        inCodeBlock = true;
        codeLang = line.trim().slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Empty lines
    if (line.trim() === '') {
      renderedElements.push(
        <div key={`empty-${i}`} className="h-3" aria-hidden="true" />
      );
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      renderedElements.push(
        <h1
          key={`h1-${i}`}
          className="text-2xl md:text-3xl font-semibold tracking-[-0.02em] text-[#191c1e] mt-6 mb-3 first:mt-0"
        >
          {renderInlineText(line.slice(2), `h1-${i}`)}
        </h1>
      );
      continue;
    }

    if (line.startsWith('## ')) {
      renderedElements.push(
        <h2
          key={`h2-${i}`}
          className="text-xl md:text-2xl font-semibold tracking-[-0.01em] text-[#191c1e] mt-5 mb-2.5"
        >
          {renderInlineText(line.slice(3), `h2-${i}`)}
        </h2>
      );
      continue;
    }

    if (line.startsWith('### ')) {
      renderedElements.push(
        <h3
          key={`h3-${i}`}
          className="text-base md:text-lg font-medium text-[#191c1e] mt-4 mb-2"
        >
          {renderInlineText(line.slice(4), `h3-${i}`)}
        </h3>
      );
      continue;
    }

    // Blockquote (Zero thick left border: flat subtle card container)
    if (line.startsWith('> ')) {
      renderedElements.push(
        <div
          key={`quote-${i}`}
          className="p-3 my-3 bg-[#f2f4f6] border border-[#c7c4d7]/70 rounded-[0.25rem] text-sm text-[#464554] italic leading-relaxed"
        >
          {renderInlineText(line.slice(2), `quote-${i}`)}
        </div>
      );
      continue;
    }

    // Interactive Checkbox / Task Item
    const taskMatch = line.match(/^- \[( |x|X)\] (.*)$/);
    if (taskMatch) {
      const isChecked = taskMatch[1].toLowerCase() === 'x';
      const taskText = taskMatch[2];
      const thisTaskIndex = taskCounter++;

      renderedElements.push(
        <div
          key={`task-${i}`}
          className="flex items-start gap-3 my-1.5 py-0.5 group"
        >
          <button
            type="button"
            onClick={() => onToggleTask?.(thisTaskIndex)}
            className={`w-4 h-4 mt-1 rounded-[2px] border transition-colors flex items-center justify-center shrink-0 cursor-pointer ${
              isChecked
                ? 'bg-[#4648d4] border-[#4648d4] text-white shadow-xs'
                : 'border-[#767586] hover:border-[#4648d4] bg-white'
            }`}
            aria-label={isChecked ? 'Mark task uncompleted' : 'Mark task completed'}
          >
            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
          </button>
          <div
            className={`text-[15px] leading-[26px] flex-1 select-text ${
              isChecked ? 'line-through text-[#767586]' : 'text-[#191c1e]'
            }`}
          >
            {renderInlineText(taskText, `task-${i}`)}
          </div>
        </div>
      );
      continue;
    }

    // Bulleted list item
    if (line.startsWith('- ') || line.startsWith('* ')) {
      renderedElements.push(
        <div key={`li-${i}`} className="flex items-start gap-2.5 my-1 ml-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#767586] mt-2.5 shrink-0" />
          <div className="text-[15px] leading-[26px] text-[#191c1e] flex-1">
            {renderInlineText(line.slice(2), `li-${i}`)}
          </div>
        </div>
      );
      continue;
    }

    // Numbered list item
    const numMatch = line.match(/^(\d+)\. (.*)$/);
    if (numMatch) {
      renderedElements.push(
        <div key={`num-${i}`} className="flex items-start gap-2.5 my-1 ml-1">
          <span className="font-mono text-xs text-[#767586] mt-1 shrink-0 w-4 tabular-nums">
            {numMatch[1]}.
          </span>
          <div className="text-[15px] leading-[26px] text-[#191c1e] flex-1">
            {renderInlineText(numMatch[2], `num-${i}`)}
          </div>
        </div>
      );
      continue;
    }

    // Standard paragraph
    renderedElements.push(
      <p
        key={`p-${i}`}
        className="text-[15px] leading-[26px] text-[#191c1e] mb-2"
      >
        {renderInlineText(line, `p-${i}`)}
      </p>
    );
  }

  // Handle unclosed code block if any
  if (inCodeBlock && codeBuffer.length > 0) {
    renderedElements.push(
      <div
        key="codeblock-unclosed"
        className="my-4 rounded-[0.375rem] border border-[#c7c4d7] bg-[#eceef0] p-3 overflow-x-auto text-xs font-mono text-[#191c1e]"
      >
        <pre className="leading-relaxed">
          <code>{codeBuffer.join('\n')}</code>
        </pre>
      </div>
    );
  }

  return <div className="markdown-body space-y-1">{renderedElements}</div>;
};
