import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Calendar, 
  Image as ImageIcon, 
  Settings, 
  LogOut, 
  Menu,
  X,
  BarChart3,
  Users
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Calendar, label: "Content Calendar", href: "/calendar" },
    { icon: ImageIcon, label: "Asset Library", href: "/assets" },
    { icon: BarChart3, label: "Analytics", href: "/analytics" },
    { icon: Users, label: "Community", href: "/community" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full bg-black text-white border-r-4 border-black">
      <div className="p-6 border-b-2 border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-blue rounded-none flex items-center justify-center border-2 border-white shadow-[2px_2px_0px_0px_#FCD34D]">
            <span className="font-mono font-bold text-xl text-white">CS</span>
          </div>
          <div>
            <h1 className="font-mono font-bold text-lg leading-none tracking-tighter">CHISTARTUP</h1>
            <span className="text-xs font-mono text-brand-yellow">HUB CMS v1.0</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div 
                className={`
                  flex items-center gap-3 px-4 py-3 cursor-pointer transition-all border-2
                  ${isActive 
                    ? "bg-brand-blue border-white text-white shadow-[4px_4px_0px_0px_#FFFFFF] translate-x-[-2px] translate-y-[-2px]" 
                    : "border-transparent hover:border-gray-700 hover:bg-gray-900 text-gray-300"}
                `}
              >
                <item.icon size={20} />
                <span className="font-mono font-bold uppercase text-sm">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t-2 border-gray-800">
        <div className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white cursor-pointer transition-colors">
          <LogOut size={20} />
          <span className="font-mono font-bold uppercase text-sm">Logout</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 fixed inset-y-0 left-0 z-50">
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="p-0 w-64 border-r-4 border-black bg-black">
          <NavContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-black text-white flex items-center justify-between px-4 border-b-4 border-brand-blue sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-blue border border-white flex items-center justify-center">
              <span className="font-mono font-bold text-sm">CS</span>
            </div>
            <span className="font-mono font-bold">CMS</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)} className="text-white hover:bg-gray-800">
            <Menu />
          </Button>
        </header>

        <div className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
