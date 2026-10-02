import { create } from "zustand";

export type CartItem = {
  perfumeId: number;
  name: string;
  brand: string;
  imageUrl: string;
  price: number;
  stock: number;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  add: (item: CartItem) => void;
  updateQuantity: (perfumeId: number, quantity: number) => void;
  remove: (perfumeId: number) => void;
  clear: () => void;
  total: () => number;
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  add: (item) =>
    set((state) => {
      const found = state.items.find((i) => i.perfumeId === item.perfumeId);
      if (found) {
        return {
          items: state.items.map((i) =>
            i.perfumeId === item.perfumeId
              ? { ...i, ...item, quantity: Math.min(i.stock, i.quantity + item.quantity) }
              : i
          ),
        };
      }
      return { items: [...state.items, item] };
    }),
  remove: (perfumeId) =>
    set((state) => ({
      items: state.items.filter((i) => i.perfumeId !== perfumeId),
    })),
  updateQuantity: (perfumeId, quantity) =>
    set((state) => ({
      items: state.items.map((item) => item.perfumeId === perfumeId
        ? { ...item, quantity: Math.max(1, Math.min(item.stock, quantity)) }
        : item),
    })),
  clear: () => set({ items: [] }),
  total: () =>
    get().items.reduce((acc, i) => acc + i.price * i.quantity, 0),
}));
