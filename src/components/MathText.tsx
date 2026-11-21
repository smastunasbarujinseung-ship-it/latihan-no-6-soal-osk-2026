import React, { useEffect, useRef } from 'react';
import katex from 'katex';

interface MathFormulaProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
}

export const MathFormula: React.FC<MathFormulaProps> = ({
  latex,
  displayMode = false,
  className = '',
}) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      katex.render(latex, containerRef.current, {
        throwOnError: false,
        displayMode,
        strict: false,
      });
    }
  }, [latex, displayMode]);

  return (
    <span
      ref={containerRef}
      className={`${displayMode ? 'block my-2 overflow-x-auto' : 'inline-block align-baseline'} ${className}`}
    />
  );
};

interface MathTextProps {
  text: string;
  className?: string;
}

type Segment =
  | { type: 'text'; content: string }
  | { type: 'inline'; content: string }
  | { type: 'display'; content: string };

function parseMathSegments(input: string): Segment[] {
  const segments: Segment[] = [];
  let idx = 0;

  while (idx < input.length) {
    const nextDisplay = input.indexOf('$$', idx);
    const nextInline = input.indexOf('$', idx);

    if (nextDisplay !== -1 && (nextInline === -1 || nextDisplay <= nextInline)) {
      if (nextDisplay > idx) {
        segments.push({ type: 'text', content: input.slice(idx, nextDisplay) });
      }
      const closeDisplay = input.indexOf('$$', nextDisplay + 2);
      if (closeDisplay === -1) {
        segments.push({ type: 'text', content: input.slice(nextDisplay) });
        break;
      }
      segments.push({ type: 'display', content: input.slice(nextDisplay + 2, closeDisplay) });
      idx = closeDisplay + 2;
    } else if (nextInline !== -1) {
      if (nextInline > idx) {
        segments.push({ type: 'text', content: input.slice(idx, nextInline) });
      }
      const closeInline = input.indexOf('$', nextInline + 1);
      if (closeInline === -1) {
        segments.push({ type: 'text', content: input.slice(nextInline) });
        break;
      }
      segments.push({ type: 'inline', content: input.slice(nextInline + 1, closeInline) });
      idx = closeInline + 1;
    } else {
      segments.push({ type: 'text', content: input.slice(idx) });
      break;
    }
  }

  return segments;
}

function renderBoldText(content: string): React.ReactNode {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-[#3B261E]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

export const MathText: React.FC<MathTextProps> = ({ text, className = '' }) => {
  const paragraphs = text.split('\n');

  return (
    <div className={`space-y-2 ${className}`}>
      {paragraphs.map((para, pIdx) => {
        if (!para.trim()) return null;
        const segments = parseMathSegments(para);
        return (
          <p key={pIdx} className="leading-relaxed">
            {segments.map((seg, sIdx) => {
              if (seg.type === 'display') {
                return <MathFormula key={sIdx} latex={seg.content} displayMode />;
              }
              if (seg.type === 'inline') {
                return <MathFormula key={sIdx} latex={seg.content} displayMode={false} />;
              }
              return <React.Fragment key={sIdx}>{renderBoldText(seg.content)}</React.Fragment>;
            })}
          </p>
        );
      })}
    </div>
  );
};
