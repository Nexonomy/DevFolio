'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const contextLabels = { PERSONAL:'Personal', COMPANY:'Company', ACADEMIC:'Academic', HACKATHON:'Hackathon' };

export default function GameList({ games, readOnly = false }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id, title) => {
    if (readOnly || !window.confirm('Delete "' + title + '"? This cannot be undone.')) return;
    setDeletingId(id);
    const response = await fetch('/api/games/' + id, { method:'DELETE' });
    setDeletingId(null);
    if (!response.ok) {
      alert('Failed to delete game');
      return;
    }
    router.refresh();
  };

  if (games.length === 0) {
    return (
      <div className="admin-empty">
        <span aria-hidden="true">◇</span>
        <h2>The shelf is empty.</h2>
        <p>{readOnly ? 'Projects will appear after the database is configured.' : 'Add your first portfolio project to begin.'}</p>
        {!readOnly && <Link href="/admin/games/new" className="admin-button admin-button-primary">Add Your First Project</Link>}
      </div>
    );
  }

  return (
    <div className="admin-project-grid">
      {games.map((game, index) => {
        const destination = (game.portfolioSection === 'OTHER' ? '/projects/' : '/games/') + game.slug;
        return (
          <article key={game.id} className="admin-project-card" style={{ '--admin-accent': game.bgColor || '#61e6d1' }}>
            <div className="admin-project-visual">
              <span className="admin-project-number">{String(index + 1).padStart(2, '0')}</span>
              <span className="admin-project-symbol" aria-hidden="true">{game.emoji || '✦'}</span>
              <i />
            </div>
            <div className="admin-project-content">
              <div className="admin-project-badges">
                <span>{game.portfolioSection === 'OTHER' ? 'Side quest' : 'Game world'}</span>
                <span>{contextLabels[game.projectContext] || 'Personal'}</span>
                <span className={'admin-badge ' + (game.published ? 'published' : 'draft')}>{game.published ? 'Live' : 'Draft'}</span>
              </div>
              <h2>{game.title}</h2>
              <p className="admin-project-slug">/{game.slug}</p>
              <p className="admin-project-description">{game.description}</p>
              <div className="admin-project-meta"><span>{game.tag || 'Project'}</span><span>{game.year || 'Year open'}</span></div>
              <div className="admin-project-actions">
                {game.published && <Link href={destination} target="_blank" className="admin-button admin-button-small">View project <span aria-hidden="true">↗</span></Link>}
                {readOnly ? (
                  <span className="admin-readonly-label">Preview only</span>
                ) : (
                  <>
                    <Link href={'/admin/games/' + game.id + '/edit'} className="admin-button admin-button-small">Edit</Link>
                    <button type="button" className="admin-button admin-button-small admin-button-danger" onClick={() => handleDelete(game.id, game.title)} disabled={deletingId === game.id}>{deletingId === game.id ? 'Deleting…' : 'Delete'}</button>
                  </>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
