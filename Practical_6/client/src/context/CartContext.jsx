import { createContext, useCallback, useMemo, useReducer } from 'react'

export const CartContext = createContext(null)

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { product } = action
      const existing = state.items[product._id]
      const nextQty = existing ? existing.quantity + 1 : 1
      return {
        ...state,
        items: {
          ...state.items,
          [product._id]: { product, quantity: nextQty },
        },
      }
    }
    case 'SET_QTY': {
      const { productId, quantity } = action
      if (quantity <= 0) {
        const next = { ...state.items }
        delete next[productId]
        return { ...state, items: next }
      }
      const existing = state.items[productId]
      if (!existing) return state
      return {
        ...state,
        items: {
          ...state.items,
          [productId]: { ...existing, quantity },
        },
      }
    }
    case 'REMOVE': {
      const { productId } = action
      const next = { ...state.items }
      delete next[productId]
      return { ...state, items: next }
    }
    case 'CLEAR': {
      return { ...state, items: {} }
    }
    default:
      return state
  }
}

const initialState = { items: {} }

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  const add = useCallback((product) => dispatch({ type: 'ADD', product }), [])
  const setQty = useCallback((productId, quantity) => dispatch({ type: 'SET_QTY', productId, quantity }), [])
  const remove = useCallback((productId) => dispatch({ type: 'REMOVE', productId }), [])
  const clear = useCallback(() => dispatch({ type: 'CLEAR' }), [])

  const cartItems = useMemo(() => Object.values(state.items), [state.items])

  const value = useMemo(
    () => ({
      itemsById: state.items,
      cartItems,
      add,
      setQty,
      remove,
      clear,
    }),
    [state.items, cartItems, add, setQty, remove, clear]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
