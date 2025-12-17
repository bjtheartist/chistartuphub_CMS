import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { 
  LayoutDashboard, 
  Calendar, 
  Image as ImageIcon,
  Target, 
  Settings, 
  LogOut, 
  Menu,
  ChevronDown,
  BarChart3,
  FileText,
  Lightbulb,
  Building2,
  Palette
} from "lucide-react";
import { useState, createContext, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Brand context for global brand selection
interface BrandContextType {
  selectedBrandId: number | null;
  setSelectedBrandId: (id: number | null) => void;
  selectedBrand: { id: number; name: string; slug: string; primaryColor: string | null } | null;
}

export const BrandContext = createContext<BrandContextType>({
  selectedBrandId: null,
  setSelectedBrandId: () => {},
  selectedBrand: null,
});

export const useBrand = () => useContext(BrandContext);

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const { data: brands } = trpc.brands.list.useQuery();
  
  const selectedBrand = brands?.find((b: { id: number; name: string; slug: string; primaryColor: string | null }) => b.id === selectedBrandId) || null;

  return (
    <BrandContext.Provider value={{ selectedBrandId, setSelectedBrandId, selectedBrand }}>
      {children}
    </BrandContext.Provider>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const { selectedBrandId, setSelectedBrandId, selectedBrand } = useBrand();
  const { data: brands } = trpc.brands.list.useQuery();

  // Redirect to login if not authenticated
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-brand-blue animate-spin mx-auto mb-4"></div>
          <p className="font-mono font-bold">LOADING SYSTEM...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    window.location.href = getLoginUrl();
    return null;
  }

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Calendar, label: "Content Calendar", href: "/calendar" },
    { icon: FileText, label: "Review Drafts", href: "/drafts" },
    { icon: Lightbulb, label: "Market Intel", href: "/market-intel" },
    { icon: Palette, label: "Design Studio", href: "/design" },
    { icon: ImageIcon, label: "Asset Library", href: "/assets" },
    { icon: Target, label: "Goals", href: "/goals" },
    { icon: BarChart3, label: "Analytics", href: "/analytics" },
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

      {/* Brand Switcher */}
      <div className="p-4 border-b-2 border-gray-800">
        <p className="font-mono text-xs text-gray-500 mb-2">ACTIVE BRAND</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-gray-900 border-2 border-gray-700 hover:border-brand-blue transition-colors">
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 border border-white flex items-center justify-center"
                  style={{ backgroundColor: selectedBrand?.primaryColor || '#2563EB' }}
                >
                  <Building2 size={14} />
                </div>
                <span className="font-mono text-sm font-bold truncate">
                  {selectedBrand?.name || "All Brands"}
                </span>
              </div>
              <ChevronDown size={16} className="text-gray-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-black border-2 border-white">
            <DropdownMenuItem 
              onClick={() => setSelectedBrandId(null)}
              className="font-mono text-sm cursor-pointer hover:bg-brand-blue"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gray-700 border border-white flex items-center justify-center">
                  <Building2 size={12} />
                </div>
                <span>All Brands</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-700" />
            {brands?.map((brand: { id: number; name: string; slug: string; primaryColor: string | null }) => (
              <DropdownMenuItem 
                key={brand.id}
                onClick={() => setSelectedBrandId(brand.id)}
                className={`font-mono text-sm cursor-pointer hover:bg-brand-blue ${selectedBrandId === brand.id ? 'bg-gray-800' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-5 h-5 border border-white flex items-center justify-center"
                    style={{ backgroundColor: brand.primaryColor || '#2563EB' }}
                  >
                    <span className="text-[10px] font-bold">{brand.name.charAt(0)}</span>
                  </div>
                  <span className="truncate">{brand.name}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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
        <div className="px-4 py-2 border-b border-gray-800 mb-2">
          <p className="font-mono text-xs text-gray-500">LOGGED IN AS</p>
          <p className="font-mono text-sm font-bold text-white truncate">{user?.name || user?.email || "User"}</p>
        </div>
        <button 
          onClick={() => logout()}
          className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white cursor-pointer transition-colors w-full"
        >
          <LogOut size={20} />
          <span className="font-mono font-bold uppercase text-sm">Logout</span>
        </button>
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
