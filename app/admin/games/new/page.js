import Link from 'next/link';
import GameForm from '@/app/components/admin/GameForm';
import { isDemo } from '@/lib/portfolio';

export default function NewGamePage() {
  if (!isDemo && !process.env.DATABASE_URL) {
    return (
      <div className="admin-page">
        <div className="admin-editor-unavailable">
          <p className="admin-kicker">Database unavailable</p>
          <h1 className="admin-title">Connect your database to add projects.</h1>
          <p>Set DATABASE_URL, then return to the editor.</p>
          <Link href="/admin" className="admin-button admin-button-primary">Back to dashboard</Link>
        </div>
      </div>
    );
  }
  return <div className="admin-page"><GameForm /></div>;
}
