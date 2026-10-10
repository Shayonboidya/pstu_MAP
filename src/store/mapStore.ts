import { create } from 'zustand'
import type { Location } from '../types'

interface MapState {
  center: [number, number]
  setCenter: (lat: number, lng: number) => void
  zoom: number
  setZoom: (zoom: number) => void
  selectedLocation: Location | null
  setSelectedLocation: (location: Location | null) => void
  visibleLocations: Location[]
  setVisibleLocations: (locations: Location[]) => void
  showSidebar: boolean
  toggleSidebar: () => void
  setIsSidebarOpen: (open: boolean) => void
}

export const useMapStore = create<MapState>((set) => ({
  center: [22.3361, 91.2259], // PSTU general location
  setCenter: (lat: number, lng: number) => set({ center: [lat, lng] }),
  zoom: 16,
  setZoom: (zoom: number) => set({ zoom }),
  selectedLocation: null,
  setSelectedLocation: (location: Location | null) => set({ selectedLocation: location }),
  visibleLocations: [],
  setVisibleLocations: (locations: Location[]) => set({ visibleLocations: locations }),
  showSidebar: true,
  toggleSidebar: () => set((state) => ({ showSidebar: !state.showSidebar })),
  setIsSidebarOpen: (open: boolean) => set({ showSidebar: open }),
}))
