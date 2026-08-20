import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const materi = await prisma.materiOption.findMany({
      orderBy: { created_at: 'desc' }
    });
    return NextResponse.json({ success: true, data: materi });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name } = body;
    
    if (!name) {
      return NextResponse.json({ error: 'Nama materi harus diisi.' }, { status: 400 });
    }

    const materi = await prisma.materiOption.create({
      data: { name }
    });

    return NextResponse.json({ success: true, data: materi });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
