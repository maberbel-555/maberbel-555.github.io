/* Progressive enhancement only. All page content is already in the HTML. */
(() => {
  'use strict';
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  if (menu && nav) {
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
        nav.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); menu.focus();
      }
    });
  }
  document.querySelector('[data-print]')?.addEventListener('click', () => window.print());

  const dataNode = document.getElementById('publication-data');
  if (!dataNode) return;
  let publications;
  try { publications = Object.fromEntries(Object.values(JSON.parse(dataNode.textContent)).map(p => [p.key, p])); }
  catch (err) { console.error('Publication metadata could not be read.', err); return; }

  const papers = [...document.querySelectorAll('.paper')];
  const typeButtons = [...document.querySelectorAll('[data-filter]')];
  const selectedButton = document.getElementById('selected-filter');
  const empty = document.getElementById('filter-empty');
  const status = document.getElementById('filter-status');
  let activeType = 'all', selectedOnly = false;
  function updateFilters() {
    let hasVisible = false;
    papers.forEach(paper => {
      const visible = (activeType === 'all' || paper.dataset.type === activeType) && (!selectedOnly || paper.dataset.selected === 'true');
      paper.hidden = !visible; hasVisible ||= visible;
    });
    typeButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === activeType)));
    selectedButton.setAttribute('aria-pressed', String(selectedOnly));
    empty.hidden = hasVisible;
    // Deliberately announce a state, never a publication total.
    status.textContent = hasVisible ? 'Publication filter updated.' : 'No publications match the selected filters.';
  }
  typeButtons.forEach(button => button.addEventListener('click', () => { activeType = button.dataset.filter; updateFilters(); }));
  selectedButton.addEventListener('click', () => { selectedOnly = !selectedOnly; updateFilters(); });
  document.getElementById('reset-filters').addEventListener('click', () => { activeType = 'all'; selectedOnly = false; updateFilters(); });

  // Bibliography is generated from the same fields as the public record.
  // A publisher-supplied override may be pasted in the editor for special cases.
  const texChars = {
    '\u00e1':"{\\'a}", '\u00c1':"{\\'A}", '\u00e9':"{\\'e}", '\u00c9':"{\\'E}",
    '\u00ed':"{\\'i}", '\u00cd':"{\\'I}", '\u00f3':"{\\'o}", '\u00d3':"{\\'O}",
    '\u00fa':"{\\'u}", '\u00da':"{\\'U}", '\u00f1':'{\\~n}', '\u00d1':'{\\~N}',
    '\u00e4':'{\\"a}', '\u00c4':'{\\"A}', '\u00f6':'{\\"o}', '\u00d6':'{\\"O}',
    '\u00fc':'{\\"u}', '\u00dc':'{\\"U}', '\u00e7':'{\\c c}', '\u00c7':'{\\c C}',
    '\u2013':'--', '\u2014':'---', '&':'\\&', '%':'\\%', '#':'\\#', '_':'\\_', '$':'\\$'
  };
  function tex(value) { return [...String(value ?? '')].map(c => texChars[c] ?? c).join(''); }
  function bibtex(p) {
    if (p.bibtex_override?.trim()) return p.bibtex_override.trim() + '\n';
    const kind = p.publication_type === 'journal' ? 'article' : (p.publication_type === 'proceedings' ? 'inproceedings' : 'misc');
    const fields = [ ['title', '{' + tex(p.title) + '}'], ['author', p.authors.map(a => tex(a.family) + ', ' + tex(a.given)).join(' and ')], ['year', String(p.year)] ];
    if (p.journal) fields.push([kind === 'inproceedings' ? 'booktitle' : 'journal', tex(p.journal)]);
    for (const key of ['volume', 'number', 'pages']) if (p[key]) fields.push([key, tex(p[key])]);
    if (p.doi) fields.push(['doi', p.doi]);
    if (p.arxiv) { fields.push(['eprint', p.arxiv], ['archivePrefix', 'arXiv']); }
    if (p.arxiv) fields.push(['url', 'https://arxiv.org/abs/' + p.arxiv]);
    else if (p.doi) fields.push(['url', 'https://doi.org/' + p.doi]);
    return '@' + kind + '{' + p.key + ',\n' + fields.map(([key,value]) => '  ' + key + ' = {' + value + '}').join(',\n') + '\n}\n';
  }
  const dialog = document.getElementById('citation-dialog');
  const output = document.getElementById('bibtex-output');
  const message = document.getElementById('copy-status');
  let activeKey = '', activeBib = '';
  document.querySelectorAll('[data-cite]').forEach(button => button.addEventListener('click', () => {
    const p = publications[button.dataset.cite];
    if (!p) return;
    activeKey = p.key; activeBib = bibtex(p);
    output.textContent = activeBib;
    document.getElementById('citation-title').textContent = p.title;
    message.textContent = '';
    document.getElementById('copy-citation').querySelector('span').textContent = 'Copy citation';
    dialog.showModal();
    document.getElementById('close-citation').focus();
  }));
  document.getElementById('close-citation').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => {
    if (e.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
  });
  document.getElementById('copy-citation').addEventListener('click', async () => {
    let copied = false;
    try { if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(activeBib); copied = true; } }
    catch { /* Files and embedded previews may deny clipboard permission. */ }
    if (!copied) {
      const field = document.createElement('textarea');
      field.value = activeBib;field.setAttribute('aria-label','Citation to copy');
      field.style.cssText = 'position:fixed;left:0;top:0;opacity:0;width:1px;height:1px';
      dialog.append(field);field.focus();field.select();
      try { copied = document.execCommand('copy'); } catch { copied = false; }
      field.remove();document.getElementById('copy-citation').focus();
    }
    if (copied) {
      document.getElementById('copy-citation').querySelector('span').textContent = 'Copied';
      message.textContent = 'Citation copied to the clipboard.';
    } else {
      const range = document.createRange();range.selectNodeContents(output);
      window.getSelection().removeAllRanges();window.getSelection().addRange(range);
      message.textContent = 'Copy permission is unavailable. The citation is selected; press Ctrl+C or use Download .bib.';
    }
  });
  document.getElementById('download-citation').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([activeBib],{type:'application/x-bibtex;charset=utf-8'}));
    const a = document.createElement('a');a.href=url;a.download=activeKey+'.bib';
    document.body.append(a);a.click();a.remove();
    setTimeout(() => URL.revokeObjectURL(url),2000);
  });
})();
