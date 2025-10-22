import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  cartItemId: string // Unique ID for cart item (combination of product + options)
  name: string
  price: number
  image: string
  quantity: number
  size?: string
  color?: string
  hasEmbroidery?: boolean
  embroideryFile?: string // CDN URL
  embroideryPrice?: number
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        const items = get().items
        
        // Generate unique cart item ID
        const cartItemId = `${item.id}-${item.size || 'no-size'}-${item.color || 'no-color'}-${item.hasEmbroidery ? 'embroidery' : 'no-embroidery'}-${item.embroideryFile ? 'file' : 'no-file'}`
        
        const existingItem = items.find(i => i.cartItemId === cartItemId)
        
        if (existingItem) {
          set({
            items: items.map(i =>
              i.cartItemId === cartItemId
                ? { ...i, quantity: i.quantity + 1 }
                : i
            )
          })
        } else {
          set({
            items: [...items, { ...item, cartItemId, quantity: 1 }]
          })
        }
      },
      
      removeItem: (cartItemId) => {
        set({
          items: get().items.filter(item => item.cartItemId !== cartItemId)
        })
      },
      
      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId)
          return
        }
        
        set({
          items: get().items.map(item =>
            item.cartItemId === cartItemId
              ? { ...item, quantity }
              : item
          )
        })
      },
      
      clearCart: () => {
        set({ items: [] })
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const itemPrice = item.price + (item.embroideryPrice || 0)
          return total + (itemPrice * item.quantity)
        }, 0)
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      }
    }),
    {
      name: 'cart-storage',
    }
  )
)
