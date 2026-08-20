import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import FormRenderer from './FormRenderer';

export default async function PublicFormPage({ params }: { params: Promise<{ slug: string }> }) {
  // Wait for params in Next.js 15+
  const { slug } = await params;

  const form = await prisma.form.findUnique({
    where: { slug }
  });

  if (!form) {
    notFound();
  }

  const config = typeof form.config === 'string' ? JSON.parse(form.config) : (form.config || {});
  
  return (
    <main className="min-h-screen bg-[#fcfdff] font-sans selection:bg-google-blue/20">
      <FormRenderer 
        form={{ 
          id: form.id, 
          name: form.name, 
          description: form.description, 
          isActive: form.is_active 
        }} 
        config={config} 
      />
    </main>
  );
}
