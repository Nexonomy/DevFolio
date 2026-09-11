import ProfileForm from '@/app/components/admin/ProfileForm';
import { getProfile } from '@/lib/profile';

export const dynamic = 'force-dynamic';

export default async function AdminProfilePage() {
  return <div className="admin-page"><ProfileForm initialProfile={await getProfile()} /></div>;
}
