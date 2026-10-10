import { Outlet } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'

export function MainLayout() {
  return (
    <div className="flex h-full flex-col bg-background">
      <AppHeader />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
