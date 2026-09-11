'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

const contextLabels = { PERSONAL:'Personal', COMPANY:'Company', ACADEMIC:'Academic', HACKATHON:'Hackathon' };
const filters = [
  ['ALL', 'All'],
  ['GAME', 'Game worlds'],
  ['OTHER', 'Side quests'],
  ['LIVE', 'Published'],
  ['DRAFT', 'Drafts'],
];

export default function GameList({ games, readOnly = false }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [query, setQuery] = useState('');

  const visibleGames = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return games.filter((game) => {
      const matchesFilter = filter === 'ALL'
        || (filter === 'GAME' && game.portfolioSection !== 'OTHER')
        || (filter === 'OTHER' && game.portfolioSection === 'OTHER')
        || (filter === 'LIVE' && game.published)
        || (filter === 'DRAFT' && !game.published);
      const haystack = [game.title, game.slug, game.tag, ...(game.categories || [])].join(' ').toLocaleLowerCase();
      return matchesFilter && (!needle || haystack.includes(needle));
    });
  }, [filter, games, query]);

  const handleDelete = async (id, title) => {
    if (readOnly || !window.confirm('Delete "' + title + '"? This cannot be undone.')) return;
    setDeletingId(id);
    const response = await fetch('/api/games/' + id, { method:'DELETE' });
    setDeletingId(null);
    if (!response.ok) {
      alert('Failed to delete project');
      return;
    }
    router.refresh();
  };

  return (
    <>
      <div className="admin-library-tools">
        <div className="admin-filter-tabs" role="group" aria-label="Filter project library">
          {filters.map(([value, label]) => <button key={value} type="button" className={filter === value ? 'is-active' : ''} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}
        </div>
        <label className="admin-search"><span className="sr-only">Search projects</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, category..." /><span aria-hidden="true">/</span></label>
      </div>

      {visibleGames.length === 0 ? (
        <div className="admin-empty"><span aria-hidden="true">{'�'}</span><h2>No projects match.</h2><p>Try another filter or search phrase.</p>{!readOnly && games.length === 0 && <Link href="/admin/games/new" className="admin-button admin-button-primary">Add Your First Project</Link>}</div>
      ) : (
        <div className="admin-project-grid">
          {visibleGames.map((game, index) => {
            const destination = (game.portfolioSection === 'OTHER' ? '/projects/' : '/games/') + game.slug;
            return <article key={game.id} className="admin-project-card" style={{ '--admin-accent': game.bgColor || '#61e6d1' }}>
              <div className="admin-project-visual"><span className="admin-project-number">{String(index + 1).padStart(2, '0')}</span><span className="admin-project-symbol" aria-hidden="true">{game.emoji || '&'}</span><i /></div>
              <div className="admin-project-content">
                <div className="admin-project-badges"><span>{game.portfolioSection === 'OTHER' ? 'Side quest' : 'Game world'}</span><span>{contextLabels[game.projectContext] || 'Personal'}</span><span className={'admin-badge ' + (game.published ? 'published' : 'draft')}>{game.published ? 'Live' : 'Draft'}</span></div>
                <h2>{game.title}</h2><p className="admin-project-slug">/{game.slug}</p>
                <p className="admin-project-description">{game.description}</p>
                <div className="admin-project-meta"><span>{game.tag || 'Project'}</span><span>{game.year || 'Year open'}</span></div>
                <div className="admin-project-actions">
                  {game.published && <Link href={destination} target="_blank" className="admin-button admin-button-small">View <span aria-hidden="true">{'�'}</span></Link>}
                  {!readOnly && <><Link href={'/admin/games/' + game.id + '/edit'} className="admin-button admin-button-small">Edit</Link><button type="button" className="admin-button admin-button-small admin-button-danger" onClick={() => handleDelete(game.id, game.title)} disabled={deletingId === game.id}>{deletingId === game.id ? 'Deleting...' : 'Delete'}</button></>}
                </div>
              </div>
            </article>;
          })}
        </div>
      )}
    </>
  );
}
