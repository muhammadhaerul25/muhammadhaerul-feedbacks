import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const talks = await prisma.talk.findMany({
      orderBy: { date: 'desc' },
    });
    return NextResponse.json({ success: true, data: talks });
  } catch (err: any) {
    console.error('Error fetching talks:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event, organizer, place, date, jumlah_peserta, poster_url, slides } = body;

    if (!event) {
      return NextResponse.json({ error: 'Nama event harus diisi.' }, { status: 400 });
    }

    const talk = await prisma.talk.create({
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
    console.error('Error creating talk:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
