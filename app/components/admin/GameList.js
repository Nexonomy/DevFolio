/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { getBlobDeliveryUrl } from '@/lib/blob';

const contextLabels = { PERSONAL: 'Personal', COMPANY: 'Company', ACADEMIC: 'Academic', HACKATHON: 'Hackathon' };
const SECTIONS = [
  { value: 'GAME', label: 'Game projects', note: 'Main portfolio grid' },
  { value: 'OTHER', label: 'Additional work', note: 'Other projects row' },
];
const sectionOf = (game) => (game.portfolioSection === 'OTHER' ? 'OTHER' : 'GAME');
const byOrder = (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0);

function missingParts(game) {
  const missing = [];
  if (!game.coverImageUrl) missing.push('cover');
  if (!(game.screenshots || []).length) missing.push('screenshots');
  if (!game.contribution && !(game.contributions || []).length) missing.push('case study');
  return missing;
}

export default function GameList({ games, readOnly = false }) {
  const router = useRouter();
  const [items, setItems] = useState(games);
  const [busyId, setBusyId] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => { setItems(games); }, [games]);

  const counts = useMemo(() => ({
    ALL: items.length,
    GAME: items.filter((game) => sectionOf(game) === 'GAME').length,
    OTHER: items.filter((game) => sectionOf(game) === 'OTHER').length,
    LIVE: items.filter((game) => game.published).length,
    DRAFT: items.filter((game) => !game.published).length,
  }), [items]);

  const filters = [['ALL', 'All'], ['GAME', 'Game projects'], ['OTHER', 'Additional work'], ['LIVE', 'Live'], ['DRAFT', 'Drafts']];
  const needle = query.trim().toLocaleLowerCase();
  const matches = (game) => {
    const inFilter = filter === 'ALL'
      || (filter === 'GAME' && sectionOf(game) === 'GAME')
      || (filter === 'OTHER' && sectionOf(game) === 'OTHER')
      || (filter === 'LIVE' && game.published)
      || (filter === 'DRAFT' && !game.published);
    const haystack = [game.title, game.slug, game.tag, ...(game.categories || [])].join(' ').toLocaleLowerCase();
    return inFilter && (!needle || haystack.includes(needle));
  };
  // Reordering only makes sense on the full, unfiltered list of a section.
  const canReorder = !readOnly && !needle && ['ALL', 'GAME', 'OTHER'].includes(filter);

  const togglePublished = async (game) => {
    if (readOnly) return;
    const next = !game.published;
    setBusyId(game.id);
    setItems((current) => current.map((item) => (item.id === game.id ? { ...item, published: next } : item)));
    const response = await fetch(`/api/games/${game.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ published: next }) });
    setBusyId(null);
    if (!response.ok) {
      setItems((current) => current.map((item) => (item.id === game.id ? { ...item, published: game.published } : item)));
      setNotice(`Couldn’t update “${game.title}”. Try again.`);
      return;
    }
    setNotice(next ? `“${game.title}” is now live on the site.` : `“${game.title}” is hidden from the site.`);
  };

  const move = async (game, direction) => {
    const section = items.filter((item) => sectionOf(item) === sectionOf(game)).sort(byOrder);
    const from = section.findIndex((item) => item.id === game.id);
    const to = from + direction;
    if (to < 0 || to >= section.length) return;
    const reordered = [...section];
    [reordered[from], reordered[to]] = [reordered[to], reordered[from]];
    const previous = items;
    const orderOf = new Map(reordered.map((item, index) => [item.id, index]));
    setItems((current) => current.map((item) => (orderOf.has(item.id) ? { ...item, sortOrder: orderOf.get(item.id) } : item)));
    setBusyId(game.id);
    const response = await fetch('/api/games/reorder', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: reordered.map((item) => item.id) }) });
    setBusyId(null);
    if (!response.ok) { setItems(previous); setNotice('Couldn’t save the new order. Try again.'); return; }
    setNotice('Order saved. The site shows projects in this order.');
  };

  const handleDelete = async (game) => {
    if (readOnly || !window.confirm(`Delete “${game.title}”? This cannot be undone.`)) return;
    setBusyId(game.id);
    const response = await fetch('/api/games/' + game.id, { method: 'DELETE' });
    setBusyId(null);
    if (!response.ok) { setNotice('Failed to delete the project.'); return; }
    setItems((current) => current.filter((item) => item.id !== game.id));
    router.refresh();
  };

  const visibleSections = SECTIONS
    .filter((section) => filter !== 'GAME' || section.value === 'GAME')
    .filter((section) => filter !== 'OTHER' || section.value === 'OTHER')
    .map((section) => ({ ...section, games: items.filter((game) => sectionOf(game) === section.value).sort(byOrder) }))
    .map((section) => ({ ...section, total: section.games.length, games: section.games.filter(matches) }))
    .filter((section) => section.games.length > 0);

  return (
    <>
      <div className="admin-library-tools">
        <div className="admin-filter-tabs" role="group" aria-label="Filter project library">
          {filters.map(([value, label]) => (
            <button key={value} type="button" className={filter === value ? 'is-active' : ''} aria-pressed={filter === value} onClick={() => setFilter(value)}>
              {label} <span className="admin-filter-count">{counts[value]}</span>
            </button>
          ))}
        </div>
        <label className="admin-search"><span className="sr-only">Search projects</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, genre, category…" /><span aria-hidden="true">/</span></label>
      </div>

      {notice && <p className="admin-lib-notice" role="status">{notice}<button type="button" aria-label="Dismiss" onClick={() => setNotice('')}>×</button></p>}
      {!canReorder && !readOnly && <p className="admin-hint admin-lib-hint">Clear the search and pick All, Game projects, or Additional work to reorder.</p>}

      {visibleSections.length === 0 ? (
        <div className="admin-empty"><span aria-hidden="true">◇</span><h2>No projects match.</h2><p>Try another filter or search phrase.</p>{!readOnly && items.length === 0 && <Link href="/admin/games/new" className="admin-button admin-button-primary">Add your first project</Link>}</div>
      ) : visibleSections.map((section) => (
        <section key={section.value} className="admin-lib-section" aria-label={section.label}>
          <header className="admin-lib-section-head"><h3>{section.label}</h3><span>{section.note} · {section.total} project{section.total === 1 ? '' : 's'}</span></header>
          <ol className="admin-lib-list">
            {section.games.map((game) => {
              const position = items.filter((item) => sectionOf(item) === section.value).sort(byOrder).findIndex((item) => item.id === game.id);
              const destination = (section.value === 'OTHER' ? '/projects/' : '/games/') + game.slug;
              const missing = missingParts(game);
              const busy = busyId === game.id;
              return (
                <li key={game.id} className={`admin-lib-row${game.published ? '' : ' is-draft'}`}>
                  <span className="admin-lib-position" aria-label={`Position ${position + 1}`}>{String(position + 1).padStart(2, '0')}</span>
                  <div className="admin-lib-thumb" style={{ background: game.coverImageUrl ? (game.bgColor || '#111') : '#e8e8e8' }}>
                    <img src={game.coverImageUrl ? getBlobDeliveryUrl(game.coverImageUrl) : '/project-placeholders/coming-soon.jpg'} alt="" loading="lazy" className={game.coverImageUrl ? undefined : 'is-placeholder'} />
                  </div>
                  <div className="admin-lib-info">
                    <Link href={`/admin/games/${game.id}/edit`} className="admin-lib-title">{game.title}</Link>
                    <p>{[game.tag, contextLabels[game.projectContext] || 'Personal', game.year].filter(Boolean).join(' · ')}</p>
                    {missing.length > 0 && <p className="admin-lib-missing">Missing: {missing.join(', ')}</p>}
                  </div>
                  <label className={`admin-lib-switch${game.published ? ' is-on' : ''}`}>
                    <input type="checkbox" checked={Boolean(game.published)} disabled={readOnly || busy} onChange={() => togglePublished(game)} />
                    <span aria-hidden="true" />
                    {game.published ? 'Live' : 'Draft'}
                  </label>
                  <div className="admin-lib-actions">
                    {canReorder && (
                      <>
                        <button type="button" aria-label={`Move ${game.title} up`} disabled={busy || position === 0} onClick={() => move(game, -1)}>↑</button>
                        <button type="button" aria-label={`Move ${game.title} down`} disabled={busy || position === section.total - 1} onClick={() => move(game, 1)}>↓</button>
                      </>
                    )}
                    {game.published && <Link href={destination} target="_blank" aria-label={`View ${game.title} on the site`}>↗</Link>}
                    {!readOnly && <Link href={`/admin/games/${game.id}/edit`} className="is-primary">Edit</Link>}
                    {!readOnly && <button type="button" className="is-danger" aria-label={`Delete ${game.title}`} disabled={busy} onClick={() => handleDelete(game)}>Delete</button>}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </>
  );
}
