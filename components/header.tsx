"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Menu,
  Briefcase,
  LayoutDashboard,
  User,
  Settings,
  LogOut,
  Building2,
  FileText,
  Bookmark,
  ChevronDown,
  PlusCircle,
  Users,
} from "lucide-react"
import { useState, useEffect } from "react"
import { getCurrentUserAction, logoutUserAction } from "@/features/auth/server/auth.actions"

type UserInfo = {
  id: number
  name: string
  email: string
  role: "admin" | "employer" | "applicant"
  avatarUrl?: string | null
} | null

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<UserInfo>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentUserAction().then((u) => {
      setUser(u as UserInfo)
      setLoading(false)
    })
  }, [])

  const initials = user?.name
    ? user.name.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : ""

  const dashboardHref = user?.role === "employer" ? "/employer" : "/candidate"
  const isCandidate = user?.role === "applicant"
  const isEmployer = user?.role === "employer"

  const NavLinks = () => (
    <>
      <Link
        href="/"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        onClick={() => setIsOpen(false)}
      >
        Home
      </Link>
      <Link
        href="/jobs"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        onClick={() => setIsOpen(false)}
      >
        Browse Jobs
      </Link>
      <Link
        href="/about"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        onClick={() => setIsOpen(false)}
      >
        About
      </Link>
      <Link
        href="/contact"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        onClick={() => setIsOpen(false)}
      >
        Contact
      </Link>
      {isCandidate && (
        <Link
          href="/candidate/applications"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          onClick={() => setIsOpen(false)}
        >
          My Applications
        </Link>
      )}
      {isEmployer && (
        <Link
          href="/employer/post-job"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          onClick={() => setIsOpen(false)}
        >
          Post a Job
        </Link>
      )}
    </>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Briefcase className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">JobHax</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <NavLinks />
        </nav>

        {/* Desktop Auth Area */}
        <div className="hidden items-center gap-3 md:flex">
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2 pr-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[120px] truncate text-sm font-medium">
                    {user.name.split(" ")[0]}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    <span className="mt-1 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">
                      {user.role === "applicant" ? "Candidate" : user.role}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={dashboardHref} className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                {isCandidate && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/candidate/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/candidate/applications" className="cursor-pointer">
                        <FileText className="mr-2 h-4 w-4" />
                        My Applications
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/candidate/saved-jobs" className="cursor-pointer">
                        <Bookmark className="mr-2 h-4 w-4" />
                        Saved Jobs
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                {isEmployer && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/employer/company" className="cursor-pointer">
                        <Building2 className="mr-2 h-4 w-4" />
                        Company Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/employer/post-job" className="cursor-pointer">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Post a Job
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/employer/candidates" className="cursor-pointer">
                        <Users className="mr-2 h-4 w-4" />
                        View Candidates
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`${dashboardHref}/settings`} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={logoutUserAction}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px]">
            <div className="flex flex-col gap-6 pt-6">
              <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                  <Briefcase className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">JobHax</span>
              </Link>

              {user && (
                <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium truncate text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
              )}

              <nav className="flex flex-col gap-4">
                <NavLinks />
                {user && (
                  <>
                    <div className="border-t border-border pt-4">
                      <Link
                        href={dashboardHref}
                        className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
                        onClick={() => setIsOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                      </Link>
                    </div>
                    {isCandidate && (
                      <>
                        <Link href="/candidate/profile" className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary" onClick={() => setIsOpen(false)}>
                          <User className="h-4 w-4" /> My Profile
                        </Link>
                        <Link href="/candidate/saved-jobs" className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary" onClick={() => setIsOpen(false)}>
                          <Bookmark className="h-4 w-4" /> Saved Jobs
                        </Link>
                      </>
                    )}
                    {isEmployer && (
                      <Link href="/employer/post-job" className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary" onClick={() => setIsOpen(false)}>
                        <PlusCircle className="h-4 w-4" /> Post a Job
                      </Link>
                    )}
                  </>
                )}
              </nav>

              <div className="flex flex-col gap-3 pt-4 border-t border-border">
                {user ? (
                  <Button
                    variant="outline"
                    className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => { logoutUserAction(); setIsOpen(false) }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/login" onClick={() => setIsOpen(false)}>Sign In</Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link href="/register" onClick={() => setIsOpen(false)}>Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
