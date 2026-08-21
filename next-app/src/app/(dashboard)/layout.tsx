"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MessageSquare, FolderKanban, Presentation, Settings2, Mic2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Feedbacks', href: '/feedbacks', icon: MessageSquare },
  ];
  
  const managementItems = [
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'Talks', href: '/talks', icon: Mic2 },
    { name: 'Presentations', href: '/presentations', icon: Presentation },
    { name: 'Forms', href: '/forms', icon: Settings2 },
  ];

  return (
    <div className="flex w-full min-h-screen text-ink mt-1">
      {/* Sidebar */}
      <aside className="w-[280px] bg-white border-r border-line-soft flex flex-col p-6 fixed h-screen z-40 overflow-y-auto">
        <div className="px-3 mb-8">
          <div className="text-[1.1rem] font-extrabold tracking-tight">Muhammad Haerul's Portfolio</div>
        </div>

        <ul className="flex flex-col gap-1 list-none">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-full font-semibold text-[0.95rem] transition-colors ${isActive ? 'bg-google-blue-soft text-google-blue-dark' : 'text-ink-2 hover:bg-line-soft'}`}>
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              </li>
            );
          })}
          
        </ul>

        <div className="text-[0.75rem] font-extrabold uppercase text-ink-4 tracking-widest mt-4 mb-2 ml-3">Management</div>
        
        <ul className="flex flex-col gap-1 list-none">
          {managementItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-full font-semibold text-[0.95rem] transition-colors ${isActive ? 'bg-google-blue-soft text-google-blue-dark' : 'text-ink-2 hover:bg-line-soft'}`}>
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-[280px] flex flex-col">
        {children}
      </main>
    </div>
  );
}
