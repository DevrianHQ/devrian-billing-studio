import React from 'react';
import { DevrianLogoMark } from './DevrianLogoMark';
import { BusinessProfile } from '../../types';
import {
  FileEdit,
  Clock,
  Users,
  LayoutDashboard,
  Settings,
  FileText,
} from 'lucide-react';

export type AppPage = 'create' | 'history' | 'clients' | 'dashboard' | 'settings' | 'policies';

interface NavbarProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  business: BusinessProfile;
  docCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  business,
  docCount,
}) => {
  const navItems: { id: AppPage; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'create', label: 'Create', icon: <FileEdit size={14} /> },
    { id: 'history', label: 'History', icon: <Clock size={14} />, badge: docCount },
    { id: 'clients', label: 'Clients', icon: <Users size={14} /> },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={14} /> },
    { id: 'policies', label: 'Terms & Policies', icon: <FileText size={14} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={14} /> },
  ];

  return (
    <header className="h-16 bg-[#0E0E0E] border-b border-neutral-800 px-4 sm:px-6 flex items-center justify-between select-none z-30 shrink-0">
      {/* Brand logo & Studio badge */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('create')}>
        <DevrianLogoMark logoUrl={business.logoDataUrl} className="h-6 w-auto object-contain" />
        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-neutral-800">
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-neutral-400">
            Billing Studio
          </span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex items-center gap-1 sm:gap-2">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                isActive
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              {item.icon}
              <span className="hidden md:inline">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-neutral-900 text-neutral-300 border border-neutral-700 ml-0.5">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};

