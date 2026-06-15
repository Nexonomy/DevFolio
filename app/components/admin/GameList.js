'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function GameList({ games }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(id);

    const response = await fetch(`/api/games/${id}`, { method: 'DELETE' });
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
        <p>No games yet.</p>
        <Link href="/admin/games/new" className="admin-button admin-button-primary">
          Add Your First Game
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Genre</th>
            <th>Year</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game) => (
            <tr key={game.id}>
              <td>
                <strong>{game.title}</strong>
                <span className="admin-table-slug">/{game.slug}</span>
              </td>
              <td>{game.tag}</td>
              <td>{game.year || '—'}</td>
              <td>
                <span className={`admin-badge ${game.published ? 'published' : 'draft'}`}>
                  {game.published ? 'Published' : 'Draft'}
                </span>
              </td>
              <td className="admin-table-actions">
                {game.published && (
                  <Link href={`/games/${game.slug}`} target="_blank" className="admin-button admin-button-small">
                    View
                  </Link>
                )}
                <Link href={`/admin/games/${game.id}/edit`} className="admin-button admin-button-small">
                  Edit
                </Link>
                <button
                  type="button"
                  className="admin-button admin-button-small admin-button-danger"
                  onClick={() => handleDelete(game.id, game.title)}
                  disabled={deletingId === game.id}
                >
                  {deletingId === game.id ? '...' : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
