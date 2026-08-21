import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const talk = await prisma.talk.findUnique({ where: { id } });
    if (!talk) return NextResponse.json({ error: 'Talk not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: talk });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { event, organizer, place, date, jumlah_peserta, poster_url, slides } = body;

    if (!event) {
      return NextResponse.json({ error: 'Nama event harus diisi.' }, { status: 400 });
    }

    const talk = await prisma.talk.update({
      where: { id },
      data: {
        event,
        organizer: organizer || null,
        place: place || null,
        date: date ? new Date(date) : null,
        jumlah_peserta: jumlah_peserta ? parseInt(jumlah_peserta, 10) : null,
        poster_url: poster_url || null,
        slides: slides || [],
      },
    });

    return NextResponse.json({ success: true, data: talk });
  } catch (err: any) {
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Talk not found.' }, { status: 404 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.talk.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Talk not found.' }, { status: 404 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
