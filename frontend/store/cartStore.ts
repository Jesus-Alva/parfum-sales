import { create } from "zustand";

type CartItem = {
  perfumeId: number;
  name: string;
  price: number;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  add: (item: CartItem) => void;
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
              ? { ...i, quantity: i.quantity + item.quantity }
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
  clear: () => set({ items: [] }),
  total: () =>
    get().items.reduce((acc, i) => acc + i.price * i.quantity, 0),
}));