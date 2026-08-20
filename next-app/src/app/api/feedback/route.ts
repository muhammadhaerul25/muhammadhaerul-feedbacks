import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: { created_at: 'desc' }
    });
    return NextResponse.json({ success: true, count: feedbacks.length, data: feedbacks });
  } catch (err: any) {
    console.error('Error fetching feedback:', err);
    return NextResponse.json({ error: err.message || 'Terjadi kesalahan saat mengambil data feedback.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { namaLengkap, email, rating, alasan, pesanKesan, materi } = body;

    if (!namaLengkap || !email || !rating || !alasan || !pesanKesan) {
      return NextResponse.json({ error: 'Semua field harus diisi.' }, { status: 400 });
    }

    const feedback = await prisma.feedback.create({
      data: {
        nama_lengkap: namaLengkap,
        email: email,
        rating: parseInt(rating, 10),
        alasan: alasan,
        pesan_kesan: pesanKesan,
        materi: materi || null,
        source: 'Umum'
      }
    });

    return NextResponse.json({ success: true, data: feedback });
  } catch (err: any) {
    console.error('Error inserting feedback:', err);
    return NextResponse.json({ error: err.message || 'Terjadi kesalahan saat menyimpan data feedback.' }, { status: 500 });
  }
}
