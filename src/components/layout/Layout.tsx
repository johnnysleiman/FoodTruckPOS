import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  UtensilsCrossed,
  Menu as MenuIcon,
  Maximize,
  Minimize,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from 'lucide-react';
import { useIsDesktop } from '../../hooks/useMediaQuery';
import { MobileDrawer } from './MobileDrawer';
import { useAuth } from '../../contexts/AuthContext';

// Fullscreen utilities
const enterFullscreen = () => {
  const elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if ((elem as unknown as { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen) {
    (elem as unknown as { webkitRequestFullscreen: () => void }).webkitRequestFullscreen();
  } else if ((elem as unknown as { msRequestFullscreen?: () => void }).msRequestFullscreen) {
    (elem as unknown as { msRequestFullscreen: () => void }).msRequestFullscreen();
  }
};

const exitFullscreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if ((document as unknown as { webkitExitFullscreen?: () => void }).webkitExitFullscreen) {
    (document as unknown as { webkitExitFullscreen: () => void }).webkitExitFullscreen();
  } else if ((document as unknown as { msExitFullscreen?: () => void }).msExitFullscreen) {
    (document as unknown as { msExitFullscreen: () => void }).msExitFullscreen();
  }
};

const getIsFullscreen = () => {
  return !!(
    document.fullscreenElement ||
    (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement ||
    (document as unknown as { msFullscreenElement?: Element }).msFullscreenElement
  );
};

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { signOut, profile } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(getIsFullscreen());
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };

  // Navigation items
  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/menu', label: 'Menu', icon: UtensilsCrossed },
    { path: '/admin/inventory', label: 'Inventory', icon: Package },
    { path: '/admin/sales', label: 'Sales', icon: ShoppingCart },
  ];

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            duration: 6000,
          },
        }}
      />
      <div className="flex h-screen bg-gray-50">
        {/* Desktop Sidebar */}
        {isDesktop && (
          <aside className={`bg-white border-r border-gray-200 flex-shrink-0 transition-all duration-300 flex flex-col ${isSidebarCollapsed ? 'w-16' : 'w-64'}`}>
            <div className={`border-b border-gray-200 flex items-center ${isSidebarCollapsed ? 'p-3 justify-center' : 'p-4 justify-between'}`}>
              {!isSidebarCollapsed && (
                <div>
                  <h1 className="text-xl font-bold text-primary">POS Admin</h1>
                  <p className="text-xs text-gray-500">Dashboard</p>
                </div>
              )}
              <div className={`flex ${isSidebarCollapsed ? 'flex-col gap-2' : 'gap-1'}`}>
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                >
                  {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </button>
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600"
                  title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                >
                  {isSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                </button>
              </div>
            </div>

            <nav className={`p-2 space-y-1 ${isSidebarCollapsed ? 'px-2' : 'px-3'} flex-1`}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary'
                        : 'text-gray-700 hover:bg-gray-50'
                    } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                    title={isSidebarCollapsed ? item.label : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isSidebarCollapsed && <span className="font-medium">{item.label}</span>}
                  </Link>
                );
              })}
            </nav>

            {/* Logout Section */}
            <div className={`border-t border-gray-200 p-3 ${isSidebarCollapsed ? 'px-2' : 'px-3'}`}>
              {!isSidebarCollapsed && profile && (
                <div className="px-3 py-2 mb-2">
                  <p className="text-sm font-medium text-gray-900 truncate">{profile.email}</p>
                  <p className="text-xs text-gray-500 capitalize">{profile.role}</p>
                </div>
              )}
              <button
                onClick={handleLogout}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-red-600 hover:bg-red-50 w-full ${isSidebarCollapsed ? 'justify-center' : ''}`}
                title={isSidebarCollapsed ? 'Logout' : undefined}
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                {!isSidebarCollapsed && <span className="font-medium">Logout</span>}
              </button>
            </div>
          </aside>
        )}

        {/* Mobile/Tablet Header */}
        {!isDesktop && (
          <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-20 flex items-center justify-between px-4">
            <div className="flex items-center">
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="p-2 -ml-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
                aria-label="Open menu"
              >
                <MenuIcon className="w-6 h-6 text-gray-700" />
              </button>
              <h1 className="ml-3 text-xl font-bold text-primary">POS Admin</h1>
            </div>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-primary hover:bg-primary-dark transition-colors text-white"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </header>
        )}

        {/* Mobile Drawer */}
        <MobileDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          navItems={navItems}
        />

        {/* Main Content */}
        <main className={`flex-1 overflow-auto ${!isDesktop ? 'pt-14' : ''}`}>
          <Outlet />
        </main>
      </div>
    </>
  );
}
