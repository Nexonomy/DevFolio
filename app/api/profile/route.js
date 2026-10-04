import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { getProfile, saveProfile } from '@/lib/profile';
import { revalidatePortfolio } from '@/lib/revalidate-portfolio';

export async function GET() {
  try { return NextResponse.json(await getProfile()); }
  catch (error) { console.error('GET /api/profile error:', error); return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 }); }
}

export async function PUT(request) {
  try {
    if (!(await requireAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const saved = await saveProfile(await request.json());
    revalidatePortfolio();
    return NextResponse.json(saved);
  } catch (error) {
    console.error('PUT /api/profile error:', error);
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 400 });
  }
}
