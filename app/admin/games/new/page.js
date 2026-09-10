import Link from 'next/link';
import GameForm from '@/app/components/admin/GameForm';
import { isDemo } from '@/lib/portfolio';

export default function NewGamePage() {
  if (isDemo || !process.env.DATABASE_URL) {
    return (
      <div className="admin-page">
        <div className="admin-editor-unavailable">
          <p className="admin-kicker">Preview mode</p>
          <h1 className="admin-title">Connect your database to add games.</h1>
          <p>The editor is disabled in this local sample so no project changes are lost or written to an unintended database.</p>
          <Link href="/admin" className="admin-button admin-button-primary">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  return <div className="admin-page"><GameForm /></div>;
}