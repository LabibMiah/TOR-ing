"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
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

type TrolleyItem = {
  trolleyitem_id: number;
  contents: string;
  weight: string | null;
  colour: string | null;
  name: string;
};

type Trolley = {
  trolley_id: number;
  name: string;
  quantity: number;
  items?: TrolleyItem[];
};

type CartItem = {
  id: number;
  quantity: number;
  name: string;
  type: string | null;
  size: string | null;
  category: string | null;
  isTrolley?: boolean;
  trolleyItems?: TrolleyItem[];
};

export default function EquipmentPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedEquipmentId = searchParams.get('equipment');
  
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [trolleys, setTrolleys] = useState<Trolley[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [trolleyQuantities, setTrolleyQuantities] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [showTrolleys, setShowTrolleys] = useState(false);
  const [selectedTrolley, setSelectedTrolley] = useState<Trolley | null>(null);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [preselectedItem, setPreselectedItem] = useState<Equipment | null>(null);
  const [preselectedQuantity, setPreselectedQuantity] = useState(1);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  // Filter and search state
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Helper function to get cart from localStorage
  const getCart = (): CartItem[] => {
    if (typeof window === 'undefined') return [];
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  };

  // Helper function to save cart to localStorage
  const saveCart = (cart: CartItem[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  };

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/Login");
        return;
      }

      // Load equipment
      const { data: equipmentData } = await supabase
        .from('Equipment')
        .select('*')
        .order('Name', { ascending: true });
      
      setEquipment(equipmentData || []);

      // Load trolleys
      const { data: trolleyData } = await supabase
        .from('Trolleys')
        .select('*')
        .order('name', { ascending: true });
      
      if (trolleyData) {
        const trolleysWithItems = await Promise.all(
          trolleyData.map(async (trolley: Trolley) => {
            const { data: items } = await supabase
              .from('Trolley_Items')
              .select('*')
              .eq('trolley_id', trolley.trolley_id);
            return { ...trolley, items: items || [] };
          })
        );
        setTrolleys(trolleysWithItems);
      }
      
      // Check for preselected equipment
      if (preselectedEquipmentId && equipmentData) {
        const preselected = equipmentData.find(eq => eq.Equipment_ID === parseInt(preselectedEquipmentId));
        if (preselected) {
          setPreselectedItem(preselected);
          setPreselectedQuantity(1);
          // Auto-scroll to the preselected item
          setTimeout(() => {
            const element = document.getElementById(`equipment-${preselected.Equipment_ID}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              element.classList.add(styles.highlight);
              setTimeout(() => {
                element.classList.remove(styles.highlight);
              }, 2000);
            }
          }, 500);
        }
      }
      
      setLoading(false);
    }

    loadData();
  }, [preselectedEquipmentId]);

  const getCategories = useMemo(() => {
    const unique = [...new Set(equipment.map(item => item.Equipment_Catagory).filter((cat): cat is string => cat !== null))];
    return ["all", ...unique];
  }, [equipment]);

  const filteredEquipment = useMemo(() => {
    let filtered = equipment;
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.Equipment_Catagory === selectedCategory);
    }
    
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.Name.toLowerCase().includes(term) ||
        (item.Type && item.Type.toLowerCase().includes(term))
      );
    }
    
    return filtered;
  }, [equipment, selectedCategory, searchTerm]);

  const totalPages = Math.ceil(filteredEquipment.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEquipment = filteredEquipment.slice(startIndex, startIndex + itemsPerPage);


  const addToCart = (item: Equipment, quantity?: number) => {
    const qty = quantity || quantities[item.Equipment_ID] || 1;
    setAddingId(item.Equipment_ID);
    
    const cart = getCart();
    const existingItem = cart.find((i) => i.id === item.Equipment_ID && !i.isTrolley);
    
    const availableQty = item.Quantity || 0;
    const existingQty = existingItem?.quantity || 0;
    const totalRequested = existingQty + qty;
    
    if (totalRequested > availableQty) {
      alert(`Only ${availableQty} items available in stock. You already have ${existingQty} in your cart.`);
      setAddingId(null);
      return;
    }
    
    if (existingItem) {
      existingItem.quantity += qty;
    } else {
      cart.push({
        id: item.Equipment_ID,
        quantity: qty,
        name: item.Name,
        type: item.Type,
        size: item.Size,
        category: item.Equipment_Catagory,
        isTrolley: false
      });
    }
    
    saveCart(cart);
    setAddingId(null);
    alert(`${item.Name} added to cart!`);
    
    // Remove preselected item after adding
    if (preselectedItem?.Equipment_ID === item.Equipment_ID) {
      setPreselectedItem(null);
    }
  };

  const addPreselectedToCart = () => {
    if (preselectedItem) {
      addToCart(preselectedItem, preselectedQuantity);
    }
  };

  const addTrolleyToCart = (trolley: Trolley) => {
    const qty = trolleyQuantities[trolley.trolley_id] || 1;
    
    if (trolley.quantity < qty) {
      alert(`Only ${trolley.quantity} ${trolley.name}(s) available in stock.`);
      return;
    }
    
    const cart = getCart();
    const existingItem = cart.find((i) => i.id === trolley.trolley_id && i.isTrolley);
    
    const existingQty = existingItem?.quantity || 0;
    if (existingQty + qty > trolley.quantity) {
      alert(`You already have ${existingQty} in cart. Only ${trolley.quantity - existingQty} more available.`);
      return;
    }
    
    if (existingItem) {
      existingItem.quantity += qty;
    } else {
      cart.push({
        id: trolley.trolley_id,
        quantity: qty,
        name: trolley.name,
        type: "Trolley",
        size: null,
        category: "Trolley",
        isTrolley: true,
        trolleyItems: trolley.items
      });
    }
    
    saveCart(cart);
    alert(`${trolley.name} added to cart!`);
  };

  const viewTrolleyItems = (trolley: Trolley) => {
    setSelectedTrolley(trolley);
    setShowItemsModal(true);
  };

  const handleQuantityChange = (id: number, value: number) => {
    setQuantities(prev => ({ ...prev, [id]: value }));
  };

  const handleTrolleyQuantityChange = (id: number, value: number) => {
    setTrolleyQuantities(prev => ({ ...prev, [id]: value }));
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.pageContent}>
      <div className={styles.contentHeader}>
        <div className={styles.headerTop}>
          <h1 className={styles.contentHeaderTitle}>Equipment Catalogue</h1>
          <div className={styles.headerButtons}>
            <button 
              onClick={() => setShowTrolleys(!showTrolleys)}
              className={showTrolleys ? styles.activeTab : styles.tabBtn}
            >
              {showTrolleys ? " Equipment" : " View Trolleys"}
            </button>
          </div>
        </div>
      </div>

      <div className={styles.contentArea}>
        <div className={styles.shell}>
          {/* Preselected Item Banner */}
          {preselectedItem && (
            <div className={styles.preselectedBanner}>
              <div className={styles.preselectedContent}>
                <div>
                  <strong>Ready to order: {preselectedItem.Name}</strong>
                  <p>Quantity: {preselectedQuantity}</p>
                </div>
                <div className={styles.preselectedActions}>
                  <div className={styles.quantityControl}>
                    <button 
                      className={styles.qtyBtn}
                      onClick={() => setPreselectedQuantity(Math.max(1, preselectedQuantity - 1))}
                    >−</button>
                    <span className={styles.qtyDisplay}>{preselectedQuantity}</span>
                    <button 
                      className={styles.qtyBtn}
                      onClick={() => setPreselectedQuantity(preselectedQuantity + 1)}
                    >+</button>
                  </div>
                  <button 
                    className={styles.addToCartBtn}
                    onClick={addPreselectedToCart}
                  >
                    Add to Cart Now
                  </button>
                  <button 
                    className={styles.dismissBtn}
                    onClick={() => setPreselectedItem(null)}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {!showTrolleys ? (
            // Equipment View
            <>
              {/* Filter Bar */}
              <div className={styles.filterBar}>
                <div className={styles.searchContainer}>
                  <input
                    type="text"
                    placeholder="Search equipment by name or type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>
                <div className={styles.categoryFilter}>
                  <label>Filter by Category:</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={styles.categorySelect}
                  >
                    {getCategories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === "all" ? "All Categories" : cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.pageTitleRow}>
                <h2 className={styles.pageTitle}>Equipment</h2>
                <span className={styles.totalCount}>
                  {filteredEquipment.length} items
                </span>
              </div>

              <div className={styles.equipmentGrid}>
                {paginatedEquipment.map((item) => {
                  const availableQty = item.Quantity || 0;
                  const cart = getCart();
                  const existingItem = cart.find((i) => i.id === item.Equipment_ID && !i.isTrolley);
                  const existingQty = existingItem?.quantity || 0;
                  const remainingStock = availableQty - existingQty;
                  const currentQty = quantities[item.Equipment_ID] || 1;
                  
                  return (
                    <div 
                      key={item.Equipment_ID} 
                      id={`equipment-${item.Equipment_ID}`}
                      className={styles.equipmentCard}
                    >
                      <h4 className={styles.itemName}>{item.Name}</h4>
                      {item.Type && <span className={styles.itemType}>{item.Type}</span>}
                      {item.Size && <p><strong>Size:</strong> {item.Size}</p>}
                      <p className={styles.quantity}>
                        <strong>Available:</strong> 
                        <span className={availableQty > 0 ? styles.inStock : styles.outOfStock}>
                          {availableQty}
                        </span>
                      </p>
                      {existingQty > 0 && <p className={styles.inCart}>In cart: {existingQty}</p>}

                      {availableQty > 0 && remainingStock > 0 && (
                        <div className={styles.cardActions}>
                          <div className={styles.quantityControl}>
                            <button 
                              className={styles.qtyBtn}
                              onClick={() => {
                                const newQty = Math.max(1, currentQty - 1);
                                handleQuantityChange(item.Equipment_ID, newQty);
                              }}
                              disabled={currentQty <= 1}
                            >−</button>
                            <span className={styles.qtyDisplay}>{currentQty}</span>
                            <button 
                              className={styles.qtyBtn}
                              onClick={() => {
                                const newQty = Math.min(remainingStock, currentQty + 1);
                                handleQuantityChange(item.Equipment_ID, newQty);
                              }}
                              disabled={currentQty >= remainingStock}
                            >+</button>
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
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            // Trolleys View
            <div>
              <div className={styles.pageTitleRow}>
                <h2 className={styles.pageTitle}>Trolleys</h2>
                <span className={styles.totalCount}>
                  {trolleys.length} trolleys available
                </span>
              </div>

              <div className={styles.equipmentGrid}>
                {trolleys.map((trolley) => {
                  const currentQty = trolleyQuantities[trolley.trolley_id] || 1;
                  const cart = getCart();
                  const existingItem = cart.find((i) => i.id === trolley.trolley_id && i.isTrolley);
                  const existingQty = existingItem?.quantity || 0;
                  const remainingStock = trolley.quantity - existingQty;
                  
                  return (
                    <div key={trolley.trolley_id} className={styles.equipmentCard}>
                      <div className={styles.cardHeader}>
                        <h4 className={styles.itemName}>{trolley.name}</h4>
                        <span className={styles.itemType}>Trolley</span>
                      </div>
                      
                      <div className={styles.cardDetails}>
                        <p className={styles.quantity}>
                          <strong>Available:</strong> 
                          <span className={trolley.quantity > 0 ? styles.inStock : styles.outOfStock}>
                            {trolley.quantity}
                          </span>
                        </p>
                        {existingQty > 0 && (
                          <p className={styles.inCart}>
                            In cart: {existingQty}
                          </p>
                        )}
                        {trolley.items && trolley.items.length > 0 && (
                          <button 
                            onClick={() => viewTrolleyItems(trolley)}
                            className={styles.viewItemsBtn}
                          >
                            View Items ({trolley.items.length})
                          </button>
                        )}
                      </div>

                      {trolley.quantity > 0 && remainingStock > 0 && (
                        <div className={styles.cardActions}>
                          <div className={styles.quantityControl}>
                            <button 
                              className={styles.qtyBtn}
                              onClick={() => {
                                const newQty = Math.max(1, currentQty - 1);
                                handleTrolleyQuantityChange(trolley.trolley_id, newQty);
                              }}
                              disabled={currentQty <= 1}
                            >−</button>
                            <span className={styles.qtyDisplay}>{currentQty}</span>
                            <button 
                              className={styles.qtyBtn}
                              onClick={() => {
                                const newQty = Math.min(remainingStock, currentQty + 1);
                                handleTrolleyQuantityChange(trolley.trolley_id, newQty);
                              }}
                              disabled={currentQty >= remainingStock}
                            >+</button>
                          </div>
                          <button 
                            className={styles.addToCartBtn}
                            onClick={() => addTrolleyToCart(trolley)}
                          >
                            Add to Cart
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trolley Items Modal */}
      {showItemsModal && selectedTrolley && (
        <div className={styles.modalOverlay} onClick={() => setShowItemsModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{selectedTrolley.name} - Contents</h2>
              <button className={styles.modalClose} onClick={() => setShowItemsModal(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.itemsList}>
                {selectedTrolley.items?.map((item) => (
                  <div key={item.trolleyitem_id} className={styles.trolleyItem}>
                    <span className={styles.itemContent}>{item.contents}</span>
                    {item.colour && <span className={styles.itemColour}>Colour: {item.colour}</span>}
                    {item.weight && <span className={styles.itemWeight}>Weight: {item.weight}</span>}
                  </div>
                ))}
                {(!selectedTrolley.items || selectedTrolley.items.length === 0) && (
                  <p className={styles.noItems}>No items listed for this trolley.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className={styles.footer}>
        <p>© 2026 TORS Health Equipment - Sheffield Hallam University</p>
      </footer>
    </div>
  );
}