import React from 'react';
import { Menu, Bell, Search, User as UserIcon } from 'lucide-react';
import { Input } from './ui/Input';
import { useAppStore } from '../store';

interface HeaderProps {
  setSidebarOpen: (val: boolean) => void;
}

export function Header({ setSidebarOpen }: HeaderProps) {
  const { currentUser } = useAppStore();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        <button 
          className="lg:hidden text-slate-500 hover:text-slate-700"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={24} />
        </button>
        <div className="max-w-md w-full hidden sm:flex items-center relative">
          <Search className="absolute left-3 text-slate-400" size={18} />
          <Input 
            placeholder="Search customers, loans..." 
            className="pl-10 bg-slate-50 border-slate-200"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative text-slate-500 hover:text-slate-700">
          <Bell size={20} />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-slate-700 leading-none">{currentUser?.name}</p>
            <p className="text-xs text-slate-500 mt-1">{currentUser?.role}</p>
          </div>
          <div className="h-8 w-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
            {currentUser?.name.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}
