import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const materiId = parseInt(id, 10);
    
    if (isNaN(materiId)) {
      return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });
    }

    const materi = await prisma.materiOption.delete({
      where: { id: materiId }
    });

    return NextResponse.json({ success: true, data: materi });
  } catch (err: any) {
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Materi tidak ditemukan.' }, { status: 404 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
