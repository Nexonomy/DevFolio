import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { requireAuth } from '@/lib/api-auth';
import { isDemo } from '@/lib/portfolio';

export async function POST(request) {
  try {
    const session = await requireAuth();
    if (!session) return NextResponse.json({ error:'Unauthorized' }, { status:401 });

    const file = (await request.formData()).get('file');
    if (!file || typeof file === 'string') return NextResponse.json({ error:'No file provided' }, { status:400 });
    if (!file.type.startsWith('image/')) return NextResponse.json({ error:'File must be an image' }, { status:400 });

    if (isDemo) {
      const directory = path.join(process.cwd(), 'public', 'demo-uploads');
      await mkdir(directory, { recursive:true });
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const name = Date.now() + '-' + safeName;
      await writeFile(path.join(directory, name), Buffer.from(await file.arrayBuffer()));
      return NextResponse.json({ url:'/demo-uploads/' + name });
    }

    const blob = await put('games/' + Date.now() + '-' + file.name, file, {
      access:'public',
      token:process.env.BLOB_READ_WRITE_TOKEN,
    });
    return NextResponse.json({ url:blob.url });
  } catch (error) {
    console.error('POST /api/upload error:', error);
    return NextResponse.json({ error:'Failed to upload file' }, { status:500 });
  }
}
