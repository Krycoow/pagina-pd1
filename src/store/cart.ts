import { map } from 'nanostores';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export const cartItems = map<Record<string, CartItem>>({});

// Inicializar desde localStorage si existe (solo en el cliente)
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('asatro_cart');
  if (stored) {
    try {
      cartItems.set(JSON.parse(stored));
    } catch (e) {
      console.error('Error parsing cart from localStorage', e);
    }
  }

  // Suscribirse a los cambios para guardarlos en localStorage
  cartItems.subscribe((items) => {
    localStorage.setItem('asatro_cart', JSON.stringify(items));
    
    // Actualizar badges del carrito en el DOM
    updateCartDOM(items);
  });
}

export function addCartItem({ id, name, price, image, quantity = 1 }: Omit<CartItem, 'quantity'> & { quantity?: number }) {
  const existingEntry = cartItems.get()[id];
  
  if (existingEntry) {
    cartItems.setKey(id, {
      ...existingEntry,
      quantity: existingEntry.quantity + quantity,
    });
  } else {
    cartItems.setKey(id, {
      id,
      name,
      price,
      image,
      quantity,
    });
  }
}

export function removeCartItem(id: string) {
  const items = { ...cartItems.get() };
  delete items[id];
  cartItems.set(items);
}

export function updateCartQuantity(id: string, quantity: number) {
  const existingEntry = cartItems.get()[id];
  if (!existingEntry) return;

  if (quantity <= 0) {
    removeCartItem(id);
  } else {
    cartItems.setKey(id, {
      ...existingEntry,
      quantity,
    });
  }
}

// Función auxiliar para calcular el número de items
export function getCartTotalItems(): number {
  return Object.values(cartItems.get()).reduce(
    (acc, item) => acc + item.quantity,
    0
  );
}

// Función auxiliar para actualizar elementos sueltos del DOM 
// (ya que no usamos frameworks JS como React en todo el sitio,
// hacemos pequeñas actualizaciones de Vanilla JS)
function updateCartDOM(items: Record<string, CartItem>) {
  if (typeof document === 'undefined') return;
  
  const totalCount = Object.values(items).reduce(
    (acc, item) => acc + item.quantity,
    0
  );
  
  const countElements = document.querySelectorAll('.cart-count');
  countElements.forEach(el => {
    el.textContent = totalCount.toString();
    // Añadir animación sutil al cambiar la cantidad
    el.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(1.3)' },
      { transform: 'scale(1)' }
    ], { duration: 300 });
  });
}
