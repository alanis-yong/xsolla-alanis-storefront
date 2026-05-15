// src/types/gtag.ts

export const GTAG_EVENTS = {
  VIEW_ITEM: 'view_item',
  ADD_TO_CART: 'add_to_cart',
  BEGIN_CHECKOUT: 'begin_checkout',
  ADD_SHIPPING_INFO: 'add_shipping_info',
  ADD_PAYMENT_INFO: 'add_payment_info',
  PURCHASE: 'purchase',
  UPDATE_CART_QUANTITY: 'update_cart_quantity',
  REMOVE_FROM_CART: 'remove_from_cart',
  CLEAR_CART: 'clear_cart',
  PAYMENT_FAILED: 'payment_failed',
} as const;

export type GtagEventName = typeof GTAG_EVENTS[keyof typeof GTAG_EVENTS];

declare global {
  function fireEvent(eventName: GtagEventName, params?: Record<string, unknown>): void;
}

function fireEventImpl(eventName: GtagEventName, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    // We manually inject 'debug_mode': true into the parameters
    window.gtag('event', eventName, {
      ...params,
      'debug_mode': true, transport_type: 'beacon' 
    });
    console.log(`🚀 [GA4 Debug] Sent: ${eventName}`, params);
  } else {
    console.warn('❌ gtag not found');
  }
}

(globalThis as any).fireEvent = fireEventImpl;

export {};
