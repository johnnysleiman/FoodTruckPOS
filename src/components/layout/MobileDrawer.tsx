// ============================================
// MOBILE DRAWER COMPONENT
// Slide-out navigation drawer for mobile/tablet portrait
// ============================================

import { X, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
}

export function MobileDrawer({ isOpen, onClose, navItems }: MobileDrawerProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();
  const prevPathRef = useRef(location.pathname);

  const handleLogout = async () => {
    onClose();
    await signOut();
    navigate('/admin/login');
  };

  // Close drawer when route changes
  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      onClose();
    }
    prevPathRef.current = location.pathname;
  }, [location.pathname, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white z-50 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h1 className="text-xl font-bold text-primary">Rusty Lab</h1>
            <p className="text-sm text-gray-500">Dashboard</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary'
                    : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="border-t border-gray-200 p-3">
          {profile && (
            <div className="px-4 py-2 mb-2">
              <p className="text-sm font-medium text-gray-900 truncate">{profile.email}</p>
              <p className="text-xs text-gray-500 capitalize">{profile.role}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-red-600 hover:bg-red-50 active:bg-red-100 w-full"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
