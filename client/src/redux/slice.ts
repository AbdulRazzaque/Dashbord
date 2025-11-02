import type { ProductData } from "@/types";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice: number;
  quantity: number;
  total: number;
  image: string;
  size: string;
  color: string;
  sku: string;
  discount: number;
  availableStock: number;
  attributes: { id: string; name: string; value: string }[];
  // Set-specific fields
  isSet?: boolean;
  setSize?: number;
  setLabel?: string;
  distribution?: Array<{
    color: string;
    sizes: Array<{ size: string; qty: number }>;
  }>;
}

// Define wishlist item interface
export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  discount: number;
}

// Define the state interface
export interface CartState {
  items: CartItem[];
  wishlist: WishlistItem[];
  total: number;
}

// Define the initial state
const initialState: CartState = {
  items: [],
  wishlist: [],
  total: 0,
};

// Helper function to calculate the total
const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.total, 0);
};

// Define the slice
export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Add to cart action
    addToCart: (
      state,
      action: PayloadAction<ProductData & { quantity?: number }>
    ) => {
      const product = action.payload;
      const quantity = action.payload.quantity || 1;
      const variant = product.variants[0];

      const attributes = variant.attributes.map((attr) => ({
        id: attr.attributeId._id,
        name: attr.attributeId.name,
        value: attr.value,
      }));

      const size = attributes.find((attr) => attr.name === "Size")?.value || "";
      const color =
        attributes.find((attr) => attr.name === "Color")?.value || "";

      // Check if this is a set variant
      const isSet = variant.setDetails?.isSet || false;
      const setSize = variant.setDetails?.setSize;
      const setLabel = variant.setDetails?.setLabel;
      const distribution = variant.setDetails?.distribution;

      // Create unique ID based on whether it's a set or individual item
      const itemId = isSet
        ? `${product._id}-set-${setSize}`
        : `${product._id}-${size}-${color}`;

      const price = variant.rate;
      const total = price * quantity;

      const existingItem = state.items.find((item) => item.id === itemId);

      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.total = existingItem.price * existingItem.quantity;
      } else {
        state.items.push({
          id: itemId,
          productId: product._id,
          name: product.name,
          price,
          originalPrice: variant.mrp,
          quantity,
          total,
          image: product.featureImg,
          size,
          color,
          sku: variant.sku || "",
          discount: variant.discount || 0,
          availableStock: variant.quantity,
          attributes,
          // Add set-specific data
          isSet,
          setSize,
          setLabel,
          distribution,
        });
      }

      state.total = calculateTotal(state.items);
    },

    // Remove from cart action
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      state.total = calculateTotal(state.items);
    },

    // Update quantity action
    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
        item.total = item.price * item.quantity; // Fix: update individual total
        state.total = calculateTotal(state.items); // Fix: update overall total
      }
    },

    // Clear cart action
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
    },
    // Add to wishlist action
    addToWishlist: (state, action: PayloadAction<ProductData>) => {
      const product = action.payload;
      const variant = product.variants[0];

      // Check if the product is already in the wishlist
      const exists = state.wishlist.some(
        (item) => item.productId === product._id
      );

      if (!exists) {
        state.wishlist.push({
          id: `wishlist-${product._id}`,
          productId: product._id,
          name: product.name,
          price: variant.rate,
          originalPrice: variant.mrp,
          image: product.featureImg,
          discount: variant.discount || 0,
        });
      }
    },
    // Remove from wishlist action
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.wishlist = state.wishlist.filter(
        (item) => item.productId !== action.payload
      );
    },
    // Check if an item is in wishlist
    toggleWishlist: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      const exists = state.wishlist.some(
        (item) => item.productId === productId
      );

      if (exists) {
        state.wishlist = state.wishlist.filter(
          (item) => item.productId !== productId
        );
      } else {
        // Find product in cart to get details
        const cartItem = state.items.find(
          (item) => item.productId === productId
        );
        // if (cartItem) {
        //   state.wishlist.push({
        //     id: `wishlist-${productId}`,
        //     productId: productId,
        //     name: cartItem.,
        //     price: cartItem.price,
        //     originalPrice: cartItem.originalPrice,
        //     image: cartItem.image,
        //     discount: cartItem.discount || 0,
        //   });
        // }
      }
    },
  },
});

// Export actions
export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
} = cartSlice.actions;

// Export reducer
export const cartReducer = cartSlice.reducer;
