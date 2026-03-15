import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { createWhatsAppOrder } from "@/lib/api";

const CartDrawer = () => {
  const {
    items,
    isOpen,
    setIsOpen,
    removeItem,
    updateQuantity,
    totalPrice,
    totalItems,
    clearCart,
  } = useCart();

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        items: items.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
      };

      return createWhatsAppOrder(payload);
    },
    onSuccess: (result) => {
      toast.success("Order ready on WhatsApp");
      window.open(result.whatsapp_url, "_blank", "noopener,noreferrer");
      clearCart();
      setIsOpen(false);
    },
    onError: () => {
      toast.error("Could not start checkout. Please try again.");
    },
  });

  const handleCheckout = () => {
    if (items.length === 0 || checkoutMutation.isPending) {
      return;
    }

    checkoutMutation.mutate();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-foreground/30 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-background z-50 flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div className="flex items-center gap-3">
                <ShoppingBag size={18} className="text-foreground" />
                <h2 className="heading-display text-xl text-foreground">
                  Your Cart ({totalItems})
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag
                    size={40}
                    className="text-muted-foreground/30 mb-4"
                  />
                  <p className="text-body text-muted-foreground mb-6">
                    Your cart is empty
                  </p>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="btn-ghost text-xs"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      className="flex gap-4"
                    >
                      <Link
                        to={`/product/${item.product.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="w-20 h-20 bg-card rounded-sm overflow-hidden shrink-0"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <h4 className="heading-display text-base text-foreground truncate">
                          {item.product.name}
                        </h4>
                        <p className="font-body text-sm text-muted-foreground">
                          R{item.product.price.toFixed(2)}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
                            }
                            aria-label="Decrease item quantity"
                            className="w-7 h-7 flex items-center justify-center border border-border rounded-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="font-body text-sm text-foreground w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                            aria-label="Increase item quantity"
                            className="w-7 h-7 flex items-center justify-center border border-border rounded-sm text-muted-foreground hover:text-foreground transition-colors"
                            disabled={item.quantity >= item.product.stock}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-muted-foreground/50 hover:text-foreground transition-colors"
                          aria-label="Remove item"
                        >
                          <X size={14} />
                        </button>
                        <p className="font-body text-sm font-medium text-foreground">
                          R{(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border px-6 py-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-body text-xs uppercase tracking-[0.15em] text-muted-foreground">
                    Subtotal
                  </span>
                  <span className="heading-display text-xl text-foreground">
                    R{totalPrice.toFixed(2)}
                  </span>
                </div>
                <p className="text-body text-muted-foreground text-xs">
                  Shipping calculated at checkout
                </p>
                <button
                  className="btn-rose w-full"
                  onClick={handleCheckout}
                  disabled={checkoutMutation.isPending}
                >
                  {checkoutMutation.isPending
                    ? "Preparing checkout..."
                    : "Checkout"}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
