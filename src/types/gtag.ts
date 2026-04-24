// 1. Define your official event names
export const GTAG_EVENTS = {
  VIEW_ITEM: 'view_item',
  ADD_TO_CART: 'add_to_cart',
  BEGIN_CHECKOUT: 'begin_checkout',
} as const;

export type GtagEventName = typeof GTAG_EVENTS[keyof typeof GTAG_EVENTS];

// 2. THE PROMISE: Tell TypeScript fireEvent exists everywhere
declare global {
  function fireEvent(
    eventName: GtagEventName,
    params?: Record<string, unknown>
  ): void;
}

// 3. THE LOGIC: What happens when fireEvent is called
function fireEventImpl(eventName: GtagEventName, params?: Record<string, unknown>) {
  if (typeof gtag !== 'function') {
    console.warn(`gtag is not defined. Skipping event: ${eventName}`);
    return;
  }
  gtag('event', eventName, params);
}

// 4. THE FULFILLMENT: Attach it to the global browser window
(globalThis as unknown as { fireEvent: typeof fireEventImpl }).fireEvent = fireEventImpl;

export {}; // Keeps this file as a module