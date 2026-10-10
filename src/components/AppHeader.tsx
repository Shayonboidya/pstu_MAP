import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, Map, Menu, X } from 'lucide-react'
import { useState } from 'react'

export function AppHeader() {
  const { user, signOut, isAdmin, isVisitor } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <Map className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl tracking-tight">PSTU Campus Map</span>
          </Link>
        </div>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-6 md:flex">
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link to="/" className="hover:text-primary transition-colors">
              Map
            </Link>
            {!isVisitor && (
              <Link to="/my-submissions" className="hover:text-primary transition-colors">
                My Submissions
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4 pl-6 border-l">
            {user ? (
              <>
                {isAdmin && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/admin">Admin Dashboard</Link>
                  </Button>
                )}
                <div className="flex items-center gap-2">
                  <div className="hidden md:flex flex-col text-right">
                    <span className="text-sm font-medium">{user.display_name || user.id}</span>
                    <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                  </div>
                  <Button variant="secondary" size="sm" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <Button asChild size="sm">
                <Link to="/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container mx-auto py-4 px-4 flex flex-col gap-4">
            <Button variant="ghost" asChild className="justify-start">
              <Link to="/">Map</Link>
            </Button>
            {!isVisitor && (
              <Button variant="ghost" asChild className="justify-start">
                <Link to="/my-submissions">My Submissions</Link>
              </Button>
            )}
            {isAdmin && (
              <Button variant="ghost" asChild className="justify-start">
                <Link to="/admin">Admin Dashboard</Link>
              </Button>
            )}
            {user ? (
              <>
                <div className="border-t border-border pt-4">
                  <p className="text-sm font-medium mb-2">{user.display_name || user.id}</p>
                  <p className="text-xs text-muted-foreground capitalize mb-4">{user.role}</p>
                  <Button variant="secondary" size="sm" className="w-full" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <Button asChild className="w-full" variant="secondary">
                <Link to="/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
