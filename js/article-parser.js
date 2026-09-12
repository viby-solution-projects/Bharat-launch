/**
 * BharatLaunch Editorial Article Parser
 * Converts plain text & Markdown syntax into semantic, accessible HTML.
 * Supports:
 * - Step & Phase Headings (e.g. "## Step 1: Title") -> Stylized Numeral Badges + H2
 * - Standard Headings (## H2, ### H3, #### H4)
 * - Bold (**text** or __text__), Italic (*text* or _text_)
 * - Inline links ([text](url)) with safe URL sanitization
 * - Pullquotes (> quote) & Callouts (> [!TIP], > [!NOTE], > [!IMPORTANT])
 * - Checklists (- [ ] / - [x])
 * - Unordered bullet lists (- / * / +)
 * - Ordered numbered lists (1. / 2.)
 * - Markdown tables (| Header | Header |)
 * - Horizontal dividers (---, ***)
 * - Plain paragraphs with preserved linebreaks
 */

(function(global) {
  'use strict';

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function sanitizeUrl(url) {
    if (!url) return '#';
    const clean = url.trim();
    // Allow safe protocols or relative/anchor links
    if (/^(https?:\/\/|\/|\.\/|\.\.\/|#|blog-detail\.html)/i.test(clean)) {
      return clean.replace(/"/g, '&quot;');
    }
    return '#';
  }

  function formatInlineMarkdown(text) {
    if (!text) return '';
    return text
      // Inline Code: `code`
      .replace(/`([^`]+)`/g, '<code class="article-inline-code">$1</code>')
      // Markdown Links: [text](url)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, function(match, label, href) {
        const safeHref = sanitizeUrl(href);
        const isExternal = /^https?:\/\//i.test(safeHref) && !safeHref.includes(typeof location !== 'undefined' ? location.hostname : 'bharat-launch');
        const targetRel = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
        return '<a href="' + safeHref + '" class="article-link"' + targetRel + '>' + label + '</a>';
      })
      // Bold: **text** or __text__
      .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
      .replace(/__([^_\n]+)__/g, '<strong>$1</strong>')
      // Italic: *text* or _text_
      .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
      .replace(/\b_([^_\n]+)_\b/g, '<em>$1</em>');
  }

  function parseMarkdownArticle(rawContent) {
    if (!rawContent) return '';

    // Normalize line endings
    const normalized = String(rawContent).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const rawLines = normalized.split('\n');
    const resultHtml = [];

    let i = 0;
    while (i < rawLines.length) {
      const line = rawLines[i];
      const trimmed = line.trim();

      // Empty line -> skip
      if (!trimmed) {
        i++;
        continue;
      }

      // 1. Horizontal Dividers: ---, ***, ___
      if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
        resultHtml.push('<div class="article-divider-wrap"><span class="article-divider-ornament">✦ ✦ ✦</span></div>');
        i++;
        continue;
      }

      // 2. Step & Phase Headings: ## Step 1: ..., ## Phase 2: ..., ## Pillar 1: ...
      const stepMatch = trimmed.match(/^##\s+(Step|Phase|Pillar)\s+(\d+)[:.]\s*(.*)$/i);
      if (stepMatch) {
        const type = stepMatch[1].toUpperCase();
        const num = stepMatch[2].padStart(2, '0');
        const title = formatInlineMarkdown(escapeHtml(stepMatch[3]));
        resultHtml.push(
          '<div class="article-step-heading">' +
            '<div class="article-step-badge">' + type + ' ' + num + '</div>' +
            '<h2 class="article-step-title">' + title + '</h2>' +
          '</div>'
        );
        i++;
        continue;
      }

      // Numbered Section Headings: ## 1. Title or ## 1: Title
      const numHeadingMatch = trimmed.match(/^##\s+(\d+)[:.]\s*(.*)$/);
      if (numHeadingMatch) {
        const num = numHeadingMatch[1].padStart(2, '0');
        const title = formatInlineMarkdown(escapeHtml(numHeadingMatch[2]));
        resultHtml.push(
          '<div class="article-step-heading">' +
            '<div class="article-step-badge">SECTION ' + num + '</div>' +
            '<h2 class="article-step-title">' + title + '</h2>' +
          '</div>'
        );
        i++;
        continue;
      }

      // Final Conclusion / Takeaway Heading
      const conclusionMatch = trimmed.match(/^##\s+(Conclusion|Summary|Key Takeaways?)[:.]?\s*(.*)$/i);
      if (conclusionMatch) {
        const name = conclusionMatch[1];
        const title = conclusionMatch[2] ? ': ' + formatInlineMarkdown(escapeHtml(conclusionMatch[2])) : '';
        resultHtml.push(
          '<div class="article-takeaway-heading">' +
            '<div class="article-step-badge">FINAL TAKEAWAY</div>' +
            '<h2 class="article-step-title">' + escapeHtml(name) + title + '</h2>' +
          '</div>'
        );
        i++;
        continue;
      }

      // Standard H1 / H2 / H3 / H4
      if (trimmed.startsWith('# ')) {
        resultHtml.push('<h2 class="article-h2">' + formatInlineMarkdown(escapeHtml(trimmed.slice(2))) + '</h2>');
        i++;
        continue;
      }
      if (trimmed.startsWith('## ')) {
        resultHtml.push('<h2 class="article-h2">' + formatInlineMarkdown(escapeHtml(trimmed.slice(3))) + '</h2>');
        i++;
        continue;
      }
      if (trimmed.startsWith('### ')) {
        resultHtml.push('<h3 class="article-h3">' + formatInlineMarkdown(escapeHtml(trimmed.slice(4))) + '</h3>');
        i++;
        continue;
      }
      if (trimmed.startsWith('#### ')) {
        resultHtml.push('<h4 class="article-h4">' + formatInlineMarkdown(escapeHtml(trimmed.slice(5))) + '</h4>');
        i++;
        continue;
      }

      // 3. Blockquotes & Callout Alerts: > text
      if (trimmed.startsWith('>')) {
        const quoteLines = [];
        while (i < rawLines.length && rawLines[i].trim().startsWith('>')) {
          quoteLines.push(rawLines[i].trim().replace(/^>\s*/, ''));
          i++;
        }
        const quoteContent = quoteLines.join('\n');
        const calloutMatch = quoteContent.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|KEY TAKEAWAY)\]\s*([\s\S]*)$/i);
        if (calloutMatch) {
          const type = calloutMatch[1].toUpperCase();
          const body = formatInlineMarkdown(escapeHtml(calloutMatch[2].trim()));
          resultHtml.push(
            '<div class="article-callout article-callout-tip">' +
              '<div class="article-callout-header">' +
                '<span aria-hidden="true">💡</span>' +
                '<span>' + type + '</span>' +
              '</div>' +
              '<p>' + body.replace(/\n/g, '<br />') + '</p>' +
            '</div>'
          );
        } else {
          resultHtml.push(
            '<blockquote class="article-pullquote">' +
              '<p>' + formatInlineMarkdown(escapeHtml(quoteContent)).replace(/\n/g, '<br />') + '</p>' +
            '</blockquote>'
          );
        }
        continue;
      }

      // 4. Checklist: - [ ] or - [x]
      if (/^-\s+\[([ xX])\]/.test(trimmed)) {
        const items = [];
        while (i < rawLines.length && /^-\s+\[([ xX])\]/.test(rawLines[i].trim())) {
          const m = rawLines[i].trim().match(/^-\s+\[([ xX])\]\s*(.*)$/);
          if (m) {
            const isChecked = m[1].toLowerCase() === 'x';
            const label = formatInlineMarkdown(escapeHtml(m[2]));
            items.push(
              '<li class="article-checklist-item ' + (isChecked ? 'checked' : '') + '">' +
                '<span class="checklist-box" aria-hidden="true">' + (isChecked ? '✓' : '') + '</span>' +
                '<span>' + label + '</span>' +
              '</li>'
            );
          }
          i++;
        }
        resultHtml.push('<ul class="article-checklist">' + items.join('') + '</ul>');
        continue;
      }

      // 5. Unordered List: - item, * item, + item
      if (/^[-*+]\s+/.test(trimmed)) {
        const items = [];
        while (i < rawLines.length && /^[-*+]\s+/.test(rawLines[i].trim())) {
          const itemText = rawLines[i].trim().replace(/^[-*+]\s+/, '');
          items.push('<li>' + formatInlineMarkdown(escapeHtml(itemText)) + '</li>');
          i++;
        }
        resultHtml.push('<ul class="article-bullet-list">' + items.join('') + '</ul>');
        continue;
      }

      // 6. Ordered List: 1. item, 2. item
      if (/^\d+\.\s+/.test(trimmed)) {
        const items = [];
        while (i < rawLines.length && /^\d+\.\s+/.test(rawLines[i].trim())) {
          const itemText = rawLines[i].trim().replace(/^\d+\.\s+/, '');
          items.push('<li>' + formatInlineMarkdown(escapeHtml(itemText)) + '</li>');
          i++;
        }
        resultHtml.push('<ol class="article-ordered-list">' + items.join('') + '</ol>');
        continue;
      }

      // 7. Markdown Table: | Col 1 | Col 2 | ...
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const tableLines = [];
        while (i < rawLines.length && rawLines[i].trim().startsWith('|') && rawLines[i].trim().endsWith('|')) {
          tableLines.push(rawLines[i].trim());
          i++;
        }
        if (tableLines.length >= 2) {
          const headerCells = tableLines[0].split('|').slice(1, -1).map(function(c) { return c.trim(); });
          const bodyLines = tableLines.slice(1).filter(function(l) { return !/^\|\s*[-:]+[-|\s:]*$/.test(l); });
          const tbodyRows = bodyLines.map(function(rowLine) {
            const cells = rowLine.split('|').slice(1, -1).map(function(c) { return c.trim(); });
            return '<tr>' + cells.map(function(c) { return '<td>' + formatInlineMarkdown(escapeHtml(c)) + '</td>'; }).join('') + '</tr>';
          });
          resultHtml.push(
            '<div class="article-table-wrap">' +
              '<table class="article-table">' +
                '<thead><tr>' + headerCells.map(function(h) { return '<th>' + formatInlineMarkdown(escapeHtml(h)) + '</th>'; }).join('') + '</tr></thead>' +
                '<tbody>' + tbodyRows.join('') + '</tbody>' +
              '</table>' +
            '</div>'
          );
          continue;
        }
      }

      // 8. Regular Paragraph (accumulate lines until blank line or special block)
      const paraLines = [];
      while (
        i < rawLines.length &&
        rawLines[i].trim() &&
        !/^(\-{3,}|\*{3,}|_{3,})$/.test(rawLines[i].trim()) &&
        !/^#{1,4}\s+/.test(rawLines[i].trim()) &&
        !rawLines[i].trim().startsWith('>') &&
        !/^-\s+\[([ xX])\]/.test(rawLines[i].trim()) &&
        !/^[-*+]\s+/.test(rawLines[i].trim()) &&
        !/^\d+\.\s+/.test(rawLines[i].trim()) &&
        !(rawLines[i].trim().startsWith('|') && rawLines[i].trim().endsWith('|'))
      ) {
        paraLines.push(rawLines[i].trim());
        i++;
      }

      if (paraLines.length > 0) {
        const paraText = paraLines.join('<br />');
        resultHtml.push('<p>' + formatInlineMarkdown(escapeHtml(paraText)) + '</p>');
      }
    }

    return resultHtml.join('\n');
  }

  const parser = {
    escapeHtml: escapeHtml,
    sanitizeUrl: sanitizeUrl,
    formatInlineMarkdown: formatInlineMarkdown,
    parseMarkdownArticle: parseMarkdownArticle,
    renderContent: parseMarkdownArticle
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = parser;
  }
  if (typeof window !== 'undefined') {
    window.BharatLaunchParser = parser;
  }
})(typeof window !== 'undefined' ? window : global);
