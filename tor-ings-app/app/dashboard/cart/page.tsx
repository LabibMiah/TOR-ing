"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./cart.module.css";
import { User } from '@supabase/supabase-js';

type Equipment = {
  Equipment_ID: number;
  Name: string;
  Type: string | null;
  Size: string | null;
  Quantity: number | null;
  Equipment_Catagory: string | null;
};

type CartItem = {
  id: number;
  quantity: number;
  details?: Equipment;
};

export default function CartPage() {
  const supabase = createClient();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState<string>("User");

  useEffect(() => {
    async function loadCart() {
      console.log("1. Starting to load cart...");
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.log("2. No user found, redirecting to login");
        router.push("/login");
        return;
      }

      console.log("3. User authenticated:", user.id);
      setUser(user);

      // Fetch user data from accounts table
      console.log("4. Fetching user account data...");
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('forename')
        .eq('user_id', user.id)
        .single();
      
      console.log("5. Account data:", account);
      if (accountError) console.log("5a. Account error:", accountError);
      
      const name = account?.forename || user.email?.split('@')[0] || "User";
      setDisplayName(name);
      console.log("6. Display name set to:", name);

      const savedCart = localStorage.getItem('cart');
      console.log("7. Saved cart from localStorage:", savedCart);
      
      if (savedCart) {
        const cart: Omit<CartItem, 'details'>[] = JSON.parse(savedCart);
        console.log("8. Parsed cart items:", cart);
        
        if (cart.length > 0) {
          console.log("9. Fetching equipment details for IDs:", cart.map(item => item.id));
          
          const { data, error } = await supabase
            .from('Equipment')
            .select('*')
            .in('Equipment_ID', cart.map(item => item.id));
          
          console.log("10. Equipment data from DB:", data);
          console.log("10a. Equipment error:", error);
          
          if (data) {
            const itemsWithDetails: CartItem[] = cart.map(cartItem => {
              const details = (data as Equipment[]).find(d => d.Equipment_ID === cartItem.id);
              
              // CRITICAL FIX: Ensure quantity is treated as a number
              const dbQuantity = details?.Quantity;
              const numericQuantity = dbQuantity !== null && dbQuantity !== undefined 
                ? Number(dbQuantity) 
                : 0;
              
              console.log(`11. Item ${cartItem.id}:`, {
                cartQuantity: cartItem.quantity,
                dbRawValue: dbQuantity,
                dbQuantity: numericQuantity,
                type: typeof dbQuantity,
                name: details?.Name
              });
              
              return {
                ...cartItem,
                details: details ? {
                  ...details,
                  Quantity: numericQuantity // Ensure it's a number
                } : undefined
              };
            });
            console.log("12. Final cart items with details:", itemsWithDetails);
            setCartItems(itemsWithDetails);
          }
        } else {
          console.log("9. Cart is empty array");
          setCartItems([]);
        }
      } else {
        console.log("7a. No cart found in localStorage");
        setCartItems([]);
      }
      
      setLoading(false);
      console.log("13. Loading complete");
    }

    loadCart();
  }, [router, supabase]);

  const updateQuantity = (id: number, newQty: number) => {
    const item = cartItems.find(item => item.id === id);
    // Ensure availableQty is a number
    const availableQty = Number(item?.details?.Quantity) || 0;
    
    console.log(`Updating item ${id}:`, {
      newQty,
      availableQty,
      currentItem: item
    });
    
    // Don't allow quantity to exceed available stock
    if (newQty > availableQty) {
      alert(`Only ${availableQty} items available in stock`);
      return;
    }

    const updated = cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQty } : item
    );
    setCartItems(updated);
    
    const toSave = updated.map(({ details, ...rest }) => rest);
    localStorage.setItem('cart', JSON.stringify(toSave));
  };

  const removeItem = (id: number) => {
    const updated = cartItems.filter(item => item.id !== id);
    setCartItems(updated);
    
    const toSave = updated.map(({ details, ...rest }) => rest);
    localStorage.setItem('cart', JSON.stringify(toSave));
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <h1 className={styles.brandTitle}>Your Shopping Cart</h1>
            <p className={styles.brandSubtitle}>
              School of Healthcare - Sheffield Hallam University
            </p>
          </div>

          <div className={styles.topActions}>
            <Link href="/dashboard" className={styles.browseBtn}>
               ← Dashboard
            </Link>
            
            <Link href="/dashboard/booking" className={styles.browseBtn}>
              Continue Shopping
            </Link>
           </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.shell}>
          {cartItems.length === 0 ? (
            <div className={styles.emptyCart}>
              <div className={styles.emptyCartIcon}>🛒</div>
              <h2>Your cart is empty</h2>
              <p>Looks like you haven't added any equipment yet.</p>
              <Link href="/dashboard/booking" className={styles.browseBtn}>
                Browse Equipment
              </Link>
            </div>
          ) : (
            <>
              <div className={styles.cartHeader}>
                <h2>Cart Items ({cartItems.length})</h2>
                <span>Welcome, {displayName}</span>
              </div>

              <div className={styles.cartGrid}>
                <div className={styles.cartItems}>
                  {cartItems.map((item) => {
                    // CRITICAL FIX: Ensure quantity is treated as a number
                    const availableQty = Number(item.details?.Quantity) || 0;
                    
                    console.log(`Rendering item ${item.id}:`, {
                      name: item.details?.Name,
                      availableQty,
                      currentCartQty: item.quantity
                    });
                    
                    // Generate options based on ACTUAL available quantity
                    const maxSelectable = Math.min(availableQty, 5);
                    const options = [];
                    
                    for (let i = 1; i <= maxSelectable; i++) {
                      options.push(
                        <option key={i} value={i}>{i}</option>
                      );
                    }
                    
                    return (
                      <div key={item.id} className={styles.cartItem}>
                        <div className={styles.itemInfo}>
                          <h3>{item.details?.Name || 'Unknown Item'}</h3>
                          <p className={styles.itemDetails}>
                            Type: {item.details?.Type || 'N/A'} | 
                            Size: {item.details?.Size || 'N/A'} |
                            Category: {item.details?.Equipment_Catagory || 'N/A'}
                          </p>
                          <p className={styles.stockInfo}>
                            Available in stock: <strong>{availableQty}</strong>
                          </p>
                          {availableQty < item.quantity && (
                            <p className={styles.warning}>
                              ⚠️ You have {item.quantity} in cart but only {availableQty} available
                            </p>
                          )}
                        </div>

                        <div className={styles.itemActions}>
                          <div className={styles.quantityControl}>
                            <label>Qty:</label>
                            <select 
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                            >
                              {options.length > 0 ? options : (
                                <option value={item.quantity}>{item.quantity}</option>
                              )}
                            </select>
                          </div>

                          <button 
                            onClick={() => removeItem(item.id)}
                            className={styles.removeBtn}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className={styles.orderSummary}>
                  <h3>Order Summary</h3>
                  <div className={styles.summaryRow}>
                    <span>Items</span>
                    <span>{totalItems}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Different Items</span>
                    <span>{cartItems.length}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Estimated Delivery</span>
                    <span>Free</span>
                  </div>
                  
                  <Link href="/dashboard/rooms" className={styles.checkoutBtn}>
                    Select Room & Confirm
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <p>© 2026 TORS Health Equipment - Sheffield Hallam University</p>
      </footer>
    </div>
  );
}