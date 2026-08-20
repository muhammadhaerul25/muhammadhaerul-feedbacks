import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const form = await prisma.form.findUnique({ where: { slug } });
      if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 });
      return NextResponse.json({ success: true, data: form });
    }

    const forms = await prisma.form.findMany({
      orderBy: { created_at: 'desc' }
    });

    const counts = await prisma.formResponse.groupBy({
      by: ['form_id'],
      _count: { _all: true }
    });

    const countMap = counts.reduce((acc: any, curr: any) => {
      acc[curr.form_id] = curr._count._all;
      return acc;
    }, {});

    const enrichedForms = forms.map((f: any) => ({
      ...f,
      response_count: countMap[f.id] || 0
    }));

    return NextResponse.json({ success: true, count: enrichedForms.length, data: enrichedForms });
  } catch (err: any) {
    console.error('Error fetching forms:', err);
    return NextResponse.json({ error: err.message || 'Error fetching forms.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, slug, description, successMessage, isActive, customDomain, sections } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and URL Form are required.' }, { status: 400 });
    }

    const form = await prisma.form.upsert({
      where: { slug },
      update: {
        name,
        description,
        is_active: isActive,
        config: { successMessage, customDomain, sections }
      },
      create: {
        name,
        slug,
        description,
        is_active: isActive,
        config: { successMessage, customDomain, sections }
      }
    });

    return NextResponse.json({ success: true, data: form });
  } catch (err: any) {
    console.error('Error saving form:', err);
    return NextResponse.json({ error: err.message || 'Error saving form.' }, { status: 500 });
  }
}
