import { useReducer, useEffect, useState } from 'react'
import type { Item } from './useItems'
import { getCart, addCartItem } from '../api/api'
import { GTAG_EVENTS } from '../types/gtag';

export interface CartItem {
  item: Item
  quantity: number
}

type Action =
  | { type: 'ADD'; item: Item, newQuantity: number, existing: boolean }
  | { type: 'REMOVE'; itemId: number }
  | { type: 'CLEAR' }
  | { type: 'INIT'; cartItems: CartItem[] }

const cartReducer = (state: CartItem[], action: Action): CartItem[] => {
  switch (action.type) {
    case 'INIT':
      return action.cartItems
    case 'ADD':
      if(action.existing){
        return state.map(ci => ci.item.id === action.item.id ? {...ci, quantity: action.newQuantity}: ci)
      }
      return [...state, {item: action.item,quantity: action.newQuantity}]
    case 'REMOVE':
      return state.filter(ci => ci.item.id !== action.itemId)
    case 'CLEAR':
      return []
    default:
      return state
  }
}

export const useCart = (items: Item[]) => {
  const [cartItems, dispatch] = useReducer(cartReducer, [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if(items.length === 0) return;
    const fetch = async () => {
      try {
        setLoading(true)
        const data = await getCart()
        const parsedData = data.map((entry: {item_id: number, quantity: number}) => {
          const item = items.find(ci => ci.id === entry.item_id)
          if(!item) return null
          return {item, quantity: entry.quantity}
        }).filter(Boolean)
        dispatch({type: 'INIT', cartItems: parsedData})
      } catch (error: any) {
        setError('Cart no good')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [items])

  const addToCart = async (item: Item) => {
  const exist = cartItems.find(ci => ci.item.id === item.id);
  const newQuantity = exist ? exist.quantity + 1 : 1
  
  dispatch({type: 'ADD', item, newQuantity, existing: !!exist})

  // Fire specific event based on if it's a NEW item or an INCREASE
  if (exist) {
    fireEvent(GTAG_EVENTS.UPDATE_CART_QUANTITY, {
      item_id: String(item.id),
      item_name: item.name,
      new_quantity: newQuantity,
      change_type: 'increase'
    });
  } else {
    fireEvent(GTAG_EVENTS.ADD_TO_CART, {
      currency: 'MYR',
      value: item.price / 100,
      items: [{
        item_id: String(item.id),
        item_name: item.name,
        price: item.price / 100,
        quantity: 1
      }]
    });
  }

  try {
    await addCartItem(item.id, newQuantity)
  } catch (error: any){
    setError('Add to cart failed')
  }
}

  const removeFromCart = (itemId: number) => {
  const itemToRemove = cartItems.find(ci => ci.item.id === itemId);
  
  if (itemToRemove) {
    fireEvent(GTAG_EVENTS.REMOVE_FROM_CART, {
      item_id: String(itemId),
      item_name: itemToRemove.item.name,
      current_quantity: itemToRemove.quantity - 1
    });
  }

  dispatch({type: 'REMOVE', itemId})
}

  const clearCart = () => {
  fireEvent(GTAG_EVENTS.CLEAR_CART, {
    items_count: cartItems.length,
    total_value: totalPrice / 100
  });

  dispatch({type: 'CLEAR'});
}

  const totalItems = cartItems.reduce((sum, ci) => sum + ci.quantity, 0)
  const totalPrice = cartItems.reduce((sum, ci) => sum + ci.item.price * ci.quantity,0)
  return { cartItems, addToCart, removeFromCart, clearCart, totalItems, totalPrice, loading, error }
}
