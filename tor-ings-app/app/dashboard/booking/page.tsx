"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./booking.module.css";

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
  name: string;
  type: string | null;
  size: string | null;
  category: string | null;
};//the obbject structure for items in the cart, stored in localStorage as a JSON string. It includes the equipment ID, quantity, name, type, size, and category for each item added to the cart.

// This page is the main equipment listing page where users can browse and add items to their cart
export default function EquipmentPage() {
  const supabase = createClient();
  const router = useRouter();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);

  useEffect(() => {
    async function loadEquipment() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }// Fetch all equipment from the database, ordered by name

      const { data } = await supabase
        .from('Equipment')
        .select('*')
        .order('Name', { ascending: true });
      
      setEquipment(data || []);
      setLoading(false);
    }// On component mount, check for user session and load equipment data. If no session, redirect to login page.

    loadEquipment();
  }, []);

  // This will the equipment list into a structure grouped by category for easier rendering
  const equipmentByCategory = equipment.reduce<Record<string, Equipment[]>>((acc, item) => {
    const category = item.Equipment_Catagory || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  const handleQuantityChange = (id: number, value: number) => {
    setQuantities(prev => ({ ...prev, [id]: value }));
  };// This function updates the quantity state for a specific equipment item when the user changes the quantity selector.
  //It takes the equipment ID and the new quantity value, and updates the quantities state object accordingly.

  const incrementQuantity = (id: number, maxQty: number) => {
    setQuantities(prev => {
      const current = prev[id] || 1;
      if (current < maxQty) {
        return { ...prev, [id]: current + 1 };
      }
      return prev;
    });
  };

  const decrementQuantity = (id: number) => {
    setQuantities(prev => {
      const current = prev[id] || 1;
      if (current > 1) {
        return { ...prev, [id]: current - 1 };
      }
      return prev;
    });
  };

  const addToCart = (item: Equipment) => {
    setAddingId(item.Equipment_ID);
    
    const cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');

    const existingItem = cart.find((i: CartItem) => i.id === item.Equipment_ID);
    
    const requestedQty = quantities[item.Equipment_ID] || 1;
    const availableQty = item.Quantity || 0;
    
    // Check if adding this would exceed available stock
    const existingQty = existingItem?.quantity || 0;
    const totalRequested = existingQty + requestedQty;
    
    if (totalRequested > availableQty) {
      alert(`Only ${availableQty} items available in stock. You already have ${existingQty} in your cart.`);
      setAddingId(null);
      return;
    }
    
    if (existingItem) {
      existingItem.quantity += requestedQty;
    } else {
      cart.push({
        id: item.Equipment_ID,
        quantity: requestedQty,
        name: item.Name,
        type: item.Type,
        size: item.Size,
        category: item.Equipment_Catagory
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    setAddingId(null);
    alert(`${item.Name} added to cart!`);
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <h1 className={styles.brandTitle}>Equipment Catalogue</h1>
            <p className={styles.brandSubtitle}>
              School of Healthcare - Sheffield Hallam University
            </p>
          </div>

          <div className={styles.topActions}>
            <Link href="/dashboard" className={styles.dashboardLink}>
              ← Dashboard
            </Link>
            <Link href="/dashboard/cart" className={styles.cartLink}>
               Cart ({JSON.parse(localStorage.getItem('cart') || '[]').length})
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.shell}>
          <div className={styles.pageTitleRow}>
            <h2 className={styles.pageTitle}>Equipment Catalogue</h2>
            <span className={styles.totalCount}>
              {equipment.length} items
            </span>
          </div>

          {Object.entries(equipmentByCategory).map(([category, items]) => (
            <div key={category} className={styles.categorySection}>
              <h3 className={styles.categoryTitle}>{category}</h3>
              <div className={styles.equipmentGrid}>
                {items.map((item) => {
                  const availableQty = item.Quantity || 0;
                  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
                  const existingItem = cart.find((i: CartItem) => i.id === item.Equipment_ID);
                  const existingQty = existingItem?.quantity || 0;
                  const remainingStock = availableQty - existingQty;
                  const currentQty = quantities[item.Equipment_ID] || 1;
                  
                  return (
                    <div key={item.Equipment_ID} className={styles.equipmentCard}>
                      <div className={styles.cardHeader}>
                        <h4 className={styles.itemName}>{item.Name}</h4>
                        {item.Type && (
                          <span className={styles.itemType}>{item.Type}</span>
                        )}
                      </div>
                      
                      <div className={styles.cardDetails}>
                        {item.Size && (
                          <p><strong>Size:</strong> {item.Size}</p>
                        )}
                        <p className={styles.quantity}>
                          <strong>Available:</strong> 
                          <span className={availableQty > 0 ? styles.inStock : styles.outOfStock}>
                            {availableQty}
                          </span>
                        </p>
                        {existingQty > 0 && (
                          <p className={styles.inCart}>
                            In cart: {existingQty}
                          </p>
                        )}
                      </div>

                      {availableQty > 0 && remainingStock > 0 && (
                        <div className={styles.cardActions}>
                          <div className={styles.quantityControl}>
                            <button 
                              className={styles.qtyBtn}
                              onClick={() => decrementQuantity(item.Equipment_ID)}
                              disabled={currentQty <= 1}
                            >
                              −
                            </button>
                            <span className={styles.qtyDisplay}>{currentQty}</span>
                            <button 
                              className={styles.qtyBtn}
                              onClick={() => incrementQuantity(item.Equipment_ID, remainingStock)}
                              disabled={currentQty >= remainingStock}
                            >
                              +
                            </button>
                          </div>
                          <button 
                            className={styles.addToCartBtn}
                            onClick={() => addToCart(item)}
                            disabled={addingId === item.Equipment_ID}
                          >
                            {addingId === item.Equipment_ID ? 'Adding...' : 'Add to Cart'}
                          </button>
                        </div>
                      )}
                      
                      {availableQty === 0 && (
                        <div className={styles.outOfStockMessage}>
                          Out of stock
                        </div>
                      )}
                      
                      {availableQty > 0 && remainingStock === 0 && (
                        <div className={styles.maxStockMessage}>
                          Max quantity in cart (all {availableQty})
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className={styles.footer}>
        <p>© 2026 TORS Health Equipment - Sheffield Hallam University</p>
      </footer>
    </div>
  );
}