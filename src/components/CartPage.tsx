import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { CartItem } from '../hooks/useCartReducer'
import { createOrder } from '../api/api'
import { GTAG_EVENTS } from '../types/gtag'


interface CartPageProps {
  cartItems: CartItem[]
  totalPrice: number
  onRemoveFromCart: (itemId: number) => void
  onClearCart: () => void
  onUpdateQuantity: (itemId: number, newQuantity: number) => void
}

const formatPrice = (amount: number): string =>
  `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽`

export function CartPage({ cartItems, totalPrice, onRemoveFromCart, onClearCart,onUpdateQuantity }: CartPageProps) {
  const navigate = useNavigate()
  const [paying, setPaying] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 6000)
  }

  const handlePay = async () => {
  setPaying(true)
  try {
    const line_items = cartItems.map(({ item, quantity }) => ({
      item_id: item.id,
      quantity,
      price: item.price,
    }))

    // --- 🟢 SCENARIO 1: SUCCESS (Uncomment to demo purchase) ---
    /*
    const response = await createOrder(line_items, totalPrice)
    fireEvent(GTAG_EVENTS.PURCHASE, {
      transaction_id: response?.order_id || `T_${Date.now()}`,
      value: totalPrice,
      currency: 'RUB',
      items: cartItems.map(ci => ({
        item_id: String(ci.item.id),
        item_name: ci.item.name,
        price: ci.item.price,
        quantity: ci.quantity
      }))
    })
    showToast('success', 'Payment successful!')
    onClearCart()
    navigate('/checkout/confirmation')
    */

    // --- 🔴 SCENARIO 2: FAILURE (Uncomment to demo "Red Numbers") ---
    // If Demoing failure, you can use line_items here to show what failed
    console.log('Attempting payment for:', line_items); 
    throw new Error("REJECTED: Insufficient Funds")

  } catch (err: any) {
    fireEvent(GTAG_EVENTS.PAYMENT_FAILED, {
      error_type: 'PAYMENT_GATEWAY_ERROR',
      reason: err.message
    })
    showToast('error', `Payment failed: ${err.message}`)
  } finally {
    setPaying(false)
  }
}

  return (
    <>
      {toast && (
        <div className={`toast toast--${toast.type}`}>{toast.message}</div>
      )}

      <div className="cart-page">
        <div className="cart-page__header">
          <h1 className="cart-page__title">Your Cart</h1>
          <p className="cart-page__subtitle">
            {cartItems.length === 0
              ? <>Your cart is empty — <Link to="/" className="cart-page__link">browse the store</Link></>
              : `${cartItems.length} ${cartItems.length === 1 ? 'item' : 'items'}`
            }
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <svg width="64" height="64" viewBox="0 0 56 56" fill="none">
              <circle cx="28" cy="28" r="27" stroke="#e0e0f0" strokeWidth="2" />
              <path d="M17 20h3l3 14h12l3-10H22" stroke="#c0c0d8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="25" cy="38" r="1.5" fill="#c0c0d8" />
              <circle cx="34" cy="38" r="1.5" fill="#c0c0d8" />
            </svg>
            <p>Nothing here yet.</p>
            <Link to="/" className="cart-empty__cta">Go to store →</Link>
          </div>
        ) : (
          <div className="cart-page__grid">
            {/* Cart item list */}
            <div className="cart-list">
              {cartItems.map(({ item, quantity }) => (
                <div key={item.id} className="cart-row">
                  <div className="cart-row__info">
                    <p className="cart-row__name">{item.name}</p>
                    <span className="cart-row__unit">{formatPrice(item.price)} each</span>
                  </div>
                  <div className="cart-row__qty">
  <div className="qty-controls">
    {/* Decrease Button */}
    <button 
      className="qty-btn"
      onClick={() => onUpdateQuantity(item.id, Math.max(1, quantity - 1))}
      disabled={quantity <= 1}
    >
      −
    </button>

    <span className="cart-row__qty-value">{quantity}</span>

    {/* Increase Button */}
    <button 
      className="qty-btn"
      onClick={() => onUpdateQuantity(item.id, quantity + 1)}
    >
      +
    </button>
  </div>
</div>
                  <span className="cart-row__subtotal">{formatPrice(item.price * quantity)}</span>
                  <button
                    className="cart-row__remove"
                    onClick={() => onRemoveFromCart(item.id)}
                    aria-label={`Remove ${item.name}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button className="cart-list__clear" onClick={onClearCart}>
                Clear cart
              </button>
            </div>

            {/* Order summary */}
            <div className="order-summary">
              <h2 className="order-summary__title">Order Summary</h2>
              {cartItems.map(({ item, quantity }) => (
                <div key={item.id} className="summary-row">
                  <span className="summary-row__label">{item.name} × {quantity}</span>
                  <span className="summary-row__value">{formatPrice(item.price * quantity)}</span>
                </div>
              ))}
              <hr className="order-summary__divider" />
              <div className="order-summary__total">
                <span>Total</span>
                <span className="order-summary__price">{formatPrice(totalPrice)}</span>
              </div>
              <button
                className="checkout-button"
                onClick={handlePay}
                disabled={cartItems.length === 0}
              >
                Proceed to Checkout →
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
