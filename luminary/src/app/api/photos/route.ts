// src/app/api/photos/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { deleteImage } from '@/lib/cloudinary';

// GET /api/photos — fetch photos with optional search/filter params
export async function GET(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const q         = searchParams.get('q');
  const occasion  = searchParams.get('occasion');
  const person    = searchParams.get('person');
  const tags      = searchParams.get('tags');
  const favorites = searchParams.get('favorites');

  const supabase = createAdminClient();
  let query = supabase
    .from('photos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (q)         query = query.textSearch('search_vector', q, { type: 'websearch' });
  if (occasion)  query = query.eq('occasion', occasion);
  if (person)    query = query.eq('name', person);
  if (tags)      query = query.contains('tags', tags.split(','));
  if (favorites) query = query.eq('favorite', true);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/photos?id=xxx — delete from Supabase + Cloudinary
export async function DELETE(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const supabase = createAdminClient();

  // Fetch photo to get cloudinary_id
  const { data: photo } = await supabase
    .from('photos')
    .select('cloudinary_id, user_id')
    .eq('id', id)
    .single();

  if (!photo || photo.user_id !== userId)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Delete from Cloudinary
  await deleteImage(photo.cloudinary_id);

  // Delete from Supabase
  const { error } = await supabase.from('photos').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

// PATCH /api/photos — update photo fields (tags, favorite, etc.)
export async function PATCH(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('photos')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
