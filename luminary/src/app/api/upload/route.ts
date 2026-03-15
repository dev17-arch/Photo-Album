// src/app/api/upload/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/cloudinary';
import { createAdminClient } from '@/lib/supabase';
import { UploadPayload } from '@/types';

export const maxDuration = 30; // Vercel max for hobby plan

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: UploadPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { file, name, occasion, description, tags, date } = body;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  // 1. Upload to Cloudinary
  let cloudinaryResult;
  try {
    cloudinaryResult = await uploadImage(file, `luminary/${userId}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Cloudinary upload failed: ${msg}` }, { status: 500 });
  }

  // 2. Save metadata to Supabase
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('photos')
    .insert({
      user_id:      userId,
      name:         name || 'Unknown',
      occasion:     occasion || null,
      description:  description || null,
      date:         date || new Date().toISOString().split('T')[0],
      tags:         tags || [],
      favorite:     false,
      cloudinary_id: cloudinaryResult.cloudinary_id,
      url:           cloudinaryResult.url,
      width:         cloudinaryResult.width,
      height:        cloudinaryResult.height,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
