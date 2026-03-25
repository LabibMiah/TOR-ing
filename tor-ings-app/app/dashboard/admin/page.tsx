"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./restock.module.css";
import Equipment from "../equipment/page";

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
};

export default function AdminPage() {
  const supabase = createClient();
  const router = useRouter();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [updateID, setUpdateId] = useState<number | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage: number = 20;
  
  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Get all unique categories and types
  const allCategories: string[] = useMemo(() => {
    const unique = [...new Set(equipment.map((item: Equipment) => item.Equipment_Catagory).filter((cat): cat is string => cat !== null))];
    return ["all", ...unique];
  }, [equipment]);

  const allTypes: string[] = useMemo(() => {
    const unique = [...new Set(equipment.map((item: Equipment) => item.Type).filter((type): type is string => type !== null))];
    return ["all", ...unique];
  }, [equipment]);

  // Get available categories based on selected type
  const availableCategories: string[] = useMemo(() => {
    let filtered: Equipment[] = equipment;
    
    if (selectedType !== "all") {
      filtered = filtered.filter((item: Equipment) => item.Type === selectedType);
    }
    
    const unique = [...new Set(filtered.map((item: Equipment) => item.Equipment_Catagory).filter((cat): cat is string => cat !== null))];
    return ["all", ...unique];
  }, [equipment, selectedType]);

  // Get available types based on selected category
  const availableTypes: string[] = useMemo(() => {
    let filtered: Equipment[] = equipment;
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter((item: Equipment) => item.Equipment_Catagory === selectedCategory);
    }
    
    const unique = [...new Set(filtered.map((item: Equipment) => item.Type).filter((type): type is string => type !== null))];
    return ["all", ...unique];
  }, [equipment, selectedCategory]);

  // Filter equipment based on category, type, and search term
  const filteredEquipment: Equipment[] = useMemo(() => {
    let filtered: Equipment[] = equipment;
    
    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((item: Equipment) => item.Equipment_Catagory === selectedCategory);
    }
    
    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter((item: Equipment) => item.Type === selectedType);
    }
    
    // Filter by search term
    if (searchTerm.trim() !== "") {
      const term: string = searchTerm.toLowerCase();
      filtered = filtered.filter((item: Equipment) => 
        item.Name.toLowerCase().includes(term) ||
        (item.Type !== null && item.Type.toLowerCase().includes(term)) ||
        (item.Equipment_Catagory !== null && item.Equipment_Catagory.toLowerCase().includes(term))
      );
    }
    
    return filtered;
  }, [equipment, selectedCategory, selectedType, searchTerm]);

  // Pagination calculations
  const totalPages: number = Math.ceil(filteredEquipment.length / itemsPerPage);
  const startIndex: number = (currentPage - 1) * itemsPerPage;
  const paginatedEquipment: Equipment[] = filteredEquipment.slice(startIndex, startIndex + itemsPerPage);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedType, searchTerm]);

  // Handle category change - reset type if needed
  const handleCategoryChange = (newCategory: string): void => {
    setSelectedCategory(newCategory);
    // Reset type if the current type is not available with the new category
    if (selectedType !== "all") {
      // We need to check if the current type exists in the new category
      // This will be validated by the availableTypes memo after state update
    }
  };

  // Handle type change - reset category if needed
  const handleTypeChange = (newType: string): void => {
    setSelectedType(newType);
    // Reset category if the current category is not available with the new type
    if (selectedCategory !== "all") {
      // This will be validated by the availableCategories memo after state update
    }
  };

  useEffect(() => {
    async function loadEquipment(): Promise<void> {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from('Equipment')
        .select('*')
        .order('Name', { ascending: true });
      
      setEquipment((data as Equipment[]) || []);
      setLoading(false);
    }

    loadEquipment();
  }, [supabase, router]);

  // Use useEffect to reset invalid filters AFTER the available options have been recalculated
  // This is safe because we only run it when availableCategories/availableTypes change,
  // not when the selected values change directly
  useEffect(() => {
    if (selectedCategory !== "all" && !availableCategories.includes(selectedCategory)) {
      setSelectedCategory("all");
    }
  }, [availableCategories]); // Only depends on availableCategories, not on selectedCategory

  useEffect(() => {
    if (selectedType !== "all" && !availableTypes.includes(selectedType)) {
      setSelectedType("all");
    }
  }, [availableTypes]); // Only depends on availableTypes, not on selectedType

  const handleQuantityChange = (id: number, value: number): void => {
    setQuantities((prev: Record<number, number>) => ({ ...prev, [id]: value }));
  };

  const incrementQuantity = (id: number,): void => {
      const current: number = quantities[id] || 1;
      handleQuantityChange(id, current + 1);
  };

  const decrementQuantity = (id: number): void => {
      const current: number = quantities[id] || 1;
      handleQuantityChange(id, current - 1);
  };

  async function updateQuantity(id: number, value: number): Promise<void> {
    const current: number = quantities[id] || 1;
    const newvalue = value + current;
    const{data: error} = await supabase
    .from('Equipment')
    .update({ Quantity: newvalue })
    .eq('Equipment_ID', id)
    .select()
    setLoading(false);
  };

const UpdateEquipment = (item: Equipment): void => {
    setUpdateId(item.Equipment_ID);
    
    const cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem: CartItem | undefined = cart.find((i: CartItem) => i.id === item.Equipment_ID);
    const requestedQty: number = quantities[item.Equipment_ID] || 1;
    const currentQty: number = item.Quantity || 0;
    const existingQty: number = existingItem?.quantity || 0;
    const updatedQty: number = existingQty + requestedQty;
  };

  // Generate page numbers with ellipsis
  const getPageNumbersWithEllipsis = (): (number | string)[] => {
    const total: number = totalPages;
    const current: number = currentPage;
    const delta: number = 2;
    
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;
    
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      }
    }
    
    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }
    
    return rangeWithDots;
  };

  const goToPage = (page: number): void => {
    const pageNum: number = Number(page);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  const handlePageInput = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLInputElement;
      goToPage(parseInt(target.value));
    }
  };

  const handleGoToPage = (): void => {
    const input = document.querySelector(`.${styles.pageInput}`) as HTMLInputElement;
    if (input) {
      goToPage(parseInt(input.value));
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.pageContent}>
      <div className={styles.contentHeader}>
        <h1 className={styles.contentHeaderTitle}>Equipment Catalogue</h1>
      </div>

      <div className={styles.contentArea}>
        <div className={styles.shell}>
          {/* Search Bar */}
          <div className={styles.filterBar}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search equipment by name, type, or category..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          {/* Dual Filters - Category and Type side by side */}
          <div className={styles.dualFilters}>
            <div className={styles.filterGroup}>
              <label>Filter by Category:</label>
              <select
                value={selectedCategory}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}
                className={styles.filterSelect}
              >
                {availableCategories.map((cat: string) => (
                  <option key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Filter by Type:</label>
              <select
                value={selectedType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedType(e.target.value)}
                className={styles.filterSelect}
              >
                {availableTypes.map((type: string) => (
                  <option key={type} value={type}>
                    {type === "all" ? "All Types" : type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.pageTitleRow}>
            <h2 className={styles.pageTitle}>Equipment Catalogue</h2>
            <span className={styles.totalCount}>
              {filteredEquipment.length} items
            </span>
          </div>

          {/* Equipment Grid */}
          <div className={styles.equipmentGrid}>
            {paginatedEquipment.map((item: Equipment) => {
              const availableQty: number = item.Quantity || 0;
              const cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
              const existingItem: CartItem | undefined = cart.find((i: CartItem) => i.id === item.Equipment_ID);
              const existingQty: number = existingItem?.quantity || 0;
              const currentQty: number = quantities[item.Equipment_ID] || 1;
              
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

                  {availableQty >= 0 && (
                    <div className={styles.cardActions}>
                      <div className={styles.quantityControl}>
                        <button 
                          className={styles.qtyBtn}
                          onClick={() => decrementQuantity(item.Equipment_ID)}
                        >
                          −
                        </button>
                        <span className={styles.qtyDisplay}>{currentQty}</span>
                        <button 
                          className={styles.qtyBtn}
                          onClick={() => incrementQuantity(item.Equipment_ID)} 
                        >
                          +
                        </button>
                      </div>
                      <button 
                        className={styles.updateQuanBtn}
                        onClick={() => updateQuantity(item.Equipment_ID,item.Quantity|| 1 )
                        }
                      >
                        {updateID === item.Equipment_ID ? 'Adding...' : 'Update Quantity'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <div className={styles.paginationControls}>
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className={styles.pageBtn}
                >
                  « First
                </button>
                <button
                  onClick={() => setCurrentPage((prev: number) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={styles.pageBtn}
                >
                  ‹ Prev
                </button>
                
                {getPageNumbersWithEllipsis().map((page: number | string, index: number) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className={styles.ellipsis}>...</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page as number)}
                      className={`${styles.pageNum} ${currentPage === page ? styles.activePage : ""}`}
                    >
                      {page}
                    </button>
                  )
                ))}
                <button
                  onClick={() => setCurrentPage((prev: number) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={styles.pageBtn}
                >
                  Next ›
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className={styles.pageBtn}
                >
                  Last »
                </button>
                
                <div className={styles.paginationInfo}>
                  <span className={styles.pageInfoText}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    placeholder="Go to"
                    className={styles.pageInput}
                    onKeyDown={handlePageInput}
                  />
                  <button
                    onClick={handleGoToPage}
                    className={styles.goToBtn}
                  >
                    Go
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className={styles.footer}>
        <p>© 2026 TORS Health Equipment - Sheffield Hallam University</p>
      </footer>
    </div>
  );
}