import blockchainGuide from '../content/blockchain.md?raw';

const parseMarkdown = (markdown) => {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];

  let paragraph = [];
  let list = null;
  let code = null;

  const flushParagraph = () => {
    const text = paragraph.join(' ').trim();
    if (text) blocks.push({ type: 'p', text });
    paragraph = [];
  };

  const flushList = () => {
    if (list && list.items.length) blocks.push(list);
    list = null;
  };

  const flushCode = () => {
    if (code) blocks.push(code);
    code = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.startsWith('```')) {
      if (code) {
        flushCode();
      } else {
        flushParagraph();
        flushList();
        code = { type: 'code', text: '' };
      }
      continue;
    }

    if (code) {
      code.text += `${rawLine}\n`;
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    const headingMatch = line.match(/^(#{1,4})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      const level = headingMatch[1].length;
      blocks.push({ type: 'h', level, text: headingMatch[2].trim() });
      continue;
    }

    const bulletMatch = line.match(/^[-*]\s+(.*)$/);
    if (bulletMatch) {
      flushParagraph();
      if (!list) list = { type: 'ul', items: [] };
      list.items.push(bulletMatch[1].trim());
      continue;
    }

    paragraph.push(line.trim());
  }

  flushCode();
  flushParagraph();
  flushList();

  return blocks;
};

const MarkdownBlocks = ({ markdown }) => {
  const blocks = parseMarkdown(markdown);

  return (
    <div className="space-y-4">
      {blocks.map((b, idx) => {
        if (b.type === 'h') {
          const className =
            b.level === 1
              ? 'text-3xl font-bold text-white'
              : b.level === 2
                ? 'text-2xl font-semibold text-white'
                : b.level === 3
                  ? 'text-xl font-semibold text-white'
                  : 'text-lg font-semibold text-white';
          return (
            <div key={idx} className="pt-2">
              <div className={className}>{b.text}</div>
            </div>
          );
        }

        if (b.type === 'p') {
          return (
            <p key={idx} className="text-gray-300 text-sm leading-relaxed">
              {b.text}
            </p>
          );
        }

        if (b.type === 'ul') {
          return (
            <ul key={idx} className="text-gray-300 text-sm leading-relaxed space-y-1 ml-4 list-disc">
              {b.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }

        if (b.type === 'code') {
          return (
            <pre
              key={idx}
              className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-auto text-xs text-gray-200"
            >
              <code>{b.text.trimEnd()}</code>
            </pre>
          );
        }

        return null;
      })}
    </div>
  );
};

export default function Learn() {
  return (
    <div className="space-y-6">
      <div className="border border-white/10 bg-black/20 backdrop-blur-xl rounded-2xl p-8">
        <h2 className="text-2xl font-semibold mb-2 text-white">📚 Learn</h2>
        <p className="text-gray-400 text-sm">
          This page is generated directly from the project’s blockchain guide.
        </p>
      </div>

      <div className="border border-white/10 bg-black/20 backdrop-blur-xl rounded-2xl p-8">
        <MarkdownBlocks markdown={blockchainGuide} />
      </div>
    </div>
  );
}
