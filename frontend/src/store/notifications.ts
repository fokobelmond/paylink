import { create } from 'zustand'

interface NotificationState {
  unreadCount: number
  setUnreadCount: (count: number) => void
  incrementUnread: () => void
  decrementUnread: () => void
  clearUnread: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 2, // Valeur initiale pour la démo
  
  setUnreadCount: (count: number) => set({ unreadCount: count }),
  
  incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  
  decrementUnread: () => set((state) => ({ 
    unreadCount: Math.max(0, state.unreadCount - 1) 
  })),
  
  clearUnread: () => set({ unreadCount: 0 }),
}))

