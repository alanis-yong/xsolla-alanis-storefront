import { useEffect } from 'react' // 1. Add useEffect
import { Link } from 'react-router-dom'
import { CheckoutStepper } from './CheckoutStepper'
import { GTAG_EVENTS } from '../types/gtag' // 2. Import your events

interface ConfirmationPageProps {
  shippingAddress?: string
  itemCount: number
  totalPrice: number
  // If you can pass cartItems here, it's better for GA4 reporting!
  cartItems?: any[] 
}

const formatPrice = (amount: number): string =>
  `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽`

export function ConfirmationPage({ shippingAddress, itemCount, totalPrice, cartItems = [] }: ConfirmationPageProps) {
  // We move orderId outside so it's stable for the useEffect
  const orderId = `#XS-${Math.floor(1000 + Math.random() * 9000)}`

  // 3. Fire the Purchase Event
  useEffect(() => {
    fireEvent(GTAG_EVENTS.PURCHASE, {
      transaction_id: orderId, 
      value: totalPrice,  
      currency: 'RUB',
      items: cartItems.map(ci => ({
        item_id: String(ci.item.id),
        item_name: ci.item.name,
        price: ci.item.price,
        quantity: ci.quantity
      }))
    });
  }, []);

  return (
    <div className="checkout">
      <CheckoutStepper currentStep={3} />

      <div className="confirmation">
        <div className="confirmation__card">
          <div className="confirmation__icon">
            <span className="confirmation__check">✓</span>
          </div>

          <h1 className="confirmation__title">Order Confirmed!</h1>
          <p className="confirmation__subtitle">
            Thank you for your purchase. Your order {orderId} has been placed.
          </p>

          <div className="confirmation__details">
            <div className="confirmation__row">
              <span className="confirmation__label">Order ID</span>
              <span className="confirmation__value">{orderId}</span>
            </div>
            <div className="confirmation__row">
              <span className="confirmation__label">Items</span>
              <span className="confirmation__value">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
            </div>
            <div className="confirmation__row">
              <span className="confirmation__label">Total</span>
              <span className="confirmation__value">{formatPrice(totalPrice)}</span>
            </div>
            {shippingAddress && (
              <div className="confirmation__row">
                <span className="confirmation__label">Shipping</span>
                <span className="confirmation__value">{shippingAddress}</span>
              </div>
            )}
            <div className="confirmation__row">
              <span className="confirmation__label">Status</span>
              <span className="confirmation__value confirmation__value--status">Processing</span>
            </div>
          </div>

          <Link to="/" className="confirmation__btn">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
