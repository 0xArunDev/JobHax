"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
 Briefcase,
 LayoutDashboard,
 FileText,
 Bookmark,
 Settings,
 LogOut,
 User,
 Bell,
 Menu,
 Building2,
 Users,
 PlusCircle,
 BarChart3,
 MessageSquare,
} from "lucide-react";
import { useState, useEffect } from "react";
import { logoutUserAction, getCurrentUserAction } from "@/features/auth/server/auth.actions";

interface SidebarLink {
 href: string;
 label: string;
 icon: React.ElementType;
}

interface DashboardSidebarProps {
 userType: "candidate" | "employer";
 userName?: string;
 userEmail?: string;
}

const candidateLinks: SidebarLink[] = [
 { href: "/candidate", label: "Dashboard", icon: LayoutDashboard },
 { href: "/candidate/profile", label: "My Profile", icon: User },
 { href: "/candidate/applications", label: "My Applications", icon: FileText },
 { href: "/candidate/saved-jobs", label: "Saved Jobs", icon: Bookmark },
 { href: "/candidate/messages", label: "Messages", icon: MessageSquare },
 { href: "/candidate/settings", label: "Settings", icon: Settings },
];

const employerLinks: SidebarLink[] = [
 { href: "/employer", label: "Dashboard", icon: LayoutDashboard },
 { href: "/employer/company", label: "Company Profile", icon: Building2 },
 { href: "/employer/jobs", label: "Manage Jobs", icon: Briefcase },
 { href: "/employer/post-job", label: "Post New Job", icon: PlusCircle },
 { href: "/employer/candidates", label: "Candidates", icon: Users },
 { href: "/employer/analytics", label: "Analytics", icon: BarChart3 },
 { href: "/employer/messages", label: "Messages", icon: MessageSquare },
 { href: "/employer/settings", label: "Settings", icon: Settings },
];

const SidebarContent = ({
  initials,
  displayName,
  displayEmail,
  links,
  pathname,
  onClose,
}: {
  initials: string;
  displayName: string;
  displayEmail: string;
  links: SidebarLink[];
  pathname: string;
  onClose: () => void;
}) => (
  <div className="flex h-full flex-col">
   {/* Logo */}
   <div className="flex h-16 items-center border-b border-sidebar-border px-6">
    <Link href="/" className="flex items-center gap-2">
     <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
      <Briefcase className="h-4 w-4 text-primary-foreground" />
     </div>
     <span className="text-lg font-bold text-sidebar-foreground">JobHax</span>
    </Link>
   </div>

   {/* User Info */}
   <div className="border-b border-sidebar-border p-4">
    <div className="flex items-center gap-3">
     <Avatar className="h-10 w-10 border border-primary/20">
      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
       {initials}
      </AvatarFallback>
     </Avatar>
     <div className="min-w-0 flex-1">
      <p className="truncate font-medium text-sidebar-foreground">{displayName}</p>
      <p className="truncate text-xs text-muted-foreground">{displayEmail}</p>
     </div>
     <Button variant="ghost" size="icon" className="shrink-0">
      <Bell className="h-4 w-4" />
     </Button>
    </div>
   </div>

   {/* Navigation */}
   <nav className="flex-1 space-y-1 p-4">
    {links.map((link) => (
     <Link
      key={link.href}
      href={link.href}
      onClick={onClose}
      className={cn(
       "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
       pathname === link.href
        ? "bg-sidebar-primary text-sidebar-primary-foreground"
        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
     >
      <link.icon className="h-4 w-4" />
      {link.label}
     </Link>
    ))}
   </nav>

   {/* Logout */}
   <div className="border-t border-sidebar-border p-4">
    <Button
     onClick={logoutUserAction}
     variant="ghost"
     className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
    >
     <LogOut className="h-4 w-4" />
     Sign Out
    </Button>
   </div>
  </div>
);

export function DashboardSidebar({
 userType,
 userName,
 userEmail,
}: DashboardSidebarProps) {
 const pathname = usePathname();
 const [isOpen, setIsOpen] = useState(false);
 const [fetchedUser, setFetchedUser] = useState<{
  name: string;
  userName?: string;
  email: string;
  avatarUrl?: string | null;
 } | null>(null);

 useEffect(() => {
  getCurrentUserAction().then((u) => {
   if (u) {
    setFetchedUser({
     name: u.name,
     userName: u.userName,
     email: u.email,
     avatarUrl: u.avatarUrl,
    });
   }
  });
 }, []);

 const links = userType === "candidate" ? candidateLinks : employerLinks;

 const isPlaceholder = !userName || userName === "TechCorp Inc." || userName === "John Doe";
 const displayName = fetchedUser?.name || (!isPlaceholder ? userName : "") || (userType === "employer" ? "Employer" : "Candidate");
 const displayEmail = fetchedUser?.email || (!isPlaceholder ? userEmail : "") || "";

 const initials = displayName
  .split(" ")
  .filter(Boolean)
  .map((n) => n[0])
  .join("")
  .slice(0, 2)
  .toUpperCase() || (userType === "employer" ? "EM" : "CA");

 return (
  <>
   {/* Mobile Header */}
   <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-border bg-background px-4 lg:hidden">
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
     <SheetTrigger asChild>
      <Button variant="ghost" size="icon">
       <Menu className="h-5 w-5" />
       <span className="sr-only">Toggle menu</span>
      </Button>
     </SheetTrigger>
     <SheetContent side="left" className="w-64 p-0">
      <SidebarContent
       initials={initials}
       displayName={displayName}
       displayEmail={displayEmail}
       links={links}
       pathname={pathname}
       onClose={() => setIsOpen(false)}
      />
     </SheetContent>
    </Sheet>
    <Link href="/" className="flex items-center gap-2">
     <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
      <Briefcase className="h-4 w-4 text-primary-foreground" />
     </div>
     <span className="text-lg font-bold">JobHax</span>
    </Link>
   </header>

   {/* Desktop Sidebar */}
   <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
    <SidebarContent
     initials={initials}
     displayName={displayName}
     displayEmail={displayEmail}
     links={links}
     pathname={pathname}
     onClose={() => setIsOpen(false)}
    />
   </aside>
  </>
 );
}
