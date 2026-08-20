import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { formId, answers } = body;

    if (!formId || !answers) {
      return NextResponse.json({ error: 'formId and answers are required.' }, { status: 400 });
    }

    // Verify form exists and is active
    const form = await prisma.form.findUnique({
      where: { id: formId }
    });

    if (!form) {
      return NextResponse.json({ error: 'Form not found.' }, { status: 404 });
    }

    if (!form.is_active) {
      return NextResponse.json({ error: 'This form is no longer accepting responses.' }, { status: 403 });
    }

    // Save response
    const response = await prisma.formResponse.create({
      data: {
        form_id: formId,
        answers: answers
      }
    });

    const config = typeof form.config === 'string' ? JSON.parse(form.config) : form.config;
    const successMessage = (config as any)?.successMessage || 'Thank you! Your response has been submitted.';

    return NextResponse.json({ success: true, message: successMessage });
  } catch (err: any) {
    console.error('Error submitting form:', err);
    return NextResponse.json({ error: err.message || 'Error submitting form.' }, { status: 500 });
  }
}
