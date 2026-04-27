import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, TrendingDown, BarChart3, Menu, X, BookUser, Lightbulb, Palette, Sun, Moon, Wallet } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/ThemeProvider';
import { SyncStatus } from './SyncStatus';
import { UserMenu } from './UserMenu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import logoImg from '@/assets/logo.jpg';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Pemasukan', href: '/income', icon: TrendingUp },
  { name: 'Pengeluaran', href: '/expense', icon: TrendingDown },
  { name: 'Hutang Piutang', href: '/debt', icon: BookUser },
  { name: 'Aset Saya', href: '/assets', icon: Wallet },
  { name: 'Laporan', href: '/report', icon: BarChart3 },
  { name: 'Insights', href: '/insights', icon: Lightbulb },
];

export function Header() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  // Find current navigation item
  const currentNavItem = navigation.find(item => item.href === location.pathname);

  // Handle routes not in the main navigation
  let pageTitle = currentNavItem?.name;
  if (!pageTitle) {
    if (location.pathname === '/profile') pageTitle = 'Profil Saya';
    if (location.pathname === '/admin') pageTitle = 'Panel Admin';
  }

  const cycleTheme = () => {
    const themes: ('light' | 'dark' | 'finance-green' | 'midnight-blue')[] = ['light', 'dark', 'finance-green', 'midnight-blue'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/80 backdrop-blur-xl">
      <div className="container flex h-14 md:h-16 items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          {/* Hamburger Menu & Navigation Drawer */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                className="p-1.5 md:p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Menu"
              >
                <Menu className="h-5 w-5 md:h-6 md:w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] border-r-border/50 bg-card/95 backdrop-blur-2xl p-0">
              <SheetHeader className="p-6 border-b border-border/50">
                <SheetTitle className="flex items-center gap-3">
                  <img src={logoImg} alt="Logo" className="h-8 w-8 rounded-lg object-contain" />
                  <span className="font-serif text-xl font-bold">Pintar Keuangan</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 p-4 overflow-y-auto max-h-[calc(100vh-80px)]">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                      )}
                    >
                      <item.icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-primary")} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex items-center gap-2 md:gap-3 group min-w-0">
            <img src={logoImg} alt="Pintar Keuangan Logo" className="h-8 w-8 md:h-10 md:w-10 rounded-xl shadow-elegant object-contain group-hover:scale-105 transition-transform duration-300 shrink-0" />
            <div className="flex items-center gap-2 min-w-0">
              <div className="hidden md:block">
                <h1 className="font-serif text-base md:text-lg font-semibold text-foreground tracking-tight">
                  Pintar Keuangan
                </h1>
              </div>

              {pageTitle && (
                <>
                  <span className="text-muted-foreground/30 font-light select-none hidden md:block">|</span>
                  <span className="font-medium text-sm md:text-base text-primary animate-fade-in truncate max-w-[160px] sm:max-w-none">
                    {pageTitle}
                  </span>
                </>
              )}
            </div>
          </Link>
        </div>

        {/* Desktop Navigation - Space is now clean, horizontal nav removed */}

        {/* Right side: Theme, Sync Status & User Menu */}
        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          <button
            onClick={cycleTheme}
            className="p-1.5 md:p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-300 active:scale-95"
            title="Ganti Tema"
          >
            {theme === 'light' ? <Sun className="h-4 w-4 md:h-5 md:w-5" /> :
              theme === 'dark' ? <Moon className="h-4 w-4 md:h-5 md:w-5" /> :
                <Palette className="h-4 w-4 md:h-5 md:w-5" />}
          </button>

          <SyncStatus />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
