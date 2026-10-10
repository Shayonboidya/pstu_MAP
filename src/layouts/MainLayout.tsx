import { Outlet } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'

interface MainLayoutProps {
  children?: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-full flex-col bg-background">
      <AppHeader />
      <main className="flex-1 overflow-hidden">
        {children || <Outlet />}
      </main>
    </div>
  )
}
