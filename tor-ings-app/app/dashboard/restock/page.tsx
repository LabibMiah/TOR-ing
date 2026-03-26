"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./restock.module.css";

type Equipment = {
  Equipment_ID: number;
  Name: string;
  Type: string | null;
  Quantity: number | null;
  Equipment_Catagory: string | null;
};

type Trolley = {
  trolley_id: number;
  name: string;
  quantity: number;
  items?: TrolleyItem[];
};

type TrolleyItem = {
  trolleyitem_id: number;
  contents: string;
  weight: string | null;
  colour: string | null;
  name: string;
};

type RestockRequest = {
  request_id: string;
  item_type: "equipment" | "trolley";
  item_id: number;
  item_name: string;
  requested_quantity: number;
  reason: string | null;
  status: "pending" | "confirmed" | "declined";
  requested_by: string;
  requested_by_name: string;
  created_at: string;
  reviewed_by: string | null;
  reviewed_by_name: string | null;
  reviewed_at: string | null;
  notes: string | null;
};

export default function RestockPage() {
  const supabase = createClient();
  const router = useRouter();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [trolleys, setTrolleys] = useState<Trolley[]>([]);
  const [requests, setRequests] = useState<RestockRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [userTier, setUserTier] = useState("");
  const [userName, setUserName] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedType, setSelectedType] = useState<"equipment" | "trolley">("equipment");
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [selectedTrolley, setSelectedTrolley] = useState<Trolley | null>(null);
  const [requestQuantity, setRequestQuantity] = useState(1);
  const [requestReason, setRequestReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [equipmentSearchTerm, setEquipmentSearchTerm] = useState("");
  const [trolleySearchTerm, setTrolleySearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RestockRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<"confirm" | "decline">("confirm");

  useEffect(() => {
    async function checkAccessAndLoad() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: account } = await supabase
        .from("accounts")
        .select("tier, forename")
        .eq("user_id", user.id)
        .single();

      if (!account) {
        router.push("/dashboard");
        return;
      }

      setUserTier(account.tier);
      setUserName(account.forename || user.email?.split("@")[0] || "User");

      const tierNumber = parseInt(account.tier.split(" ")[1]);
      if (tierNumber < 2) {
        router.push("/dashboard");
        return;
      }

      await loadEquipment();
      await loadTrolleys();
      await loadRequests();
      setLoading(false);
    }
    checkAccessAndLoad();
  }, []);

  const loadEquipment = async () => {
    const { data } = await supabase
      .from("Equipment")
      .select("*")
      .order("Name", { ascending: true });
    
    if (data) {
      setEquipment(data);
    }
  };

  const loadTrolleys = async () => {
    const { data } = await supabase
      .from("Trolleys")
      .select("*")
      .order("name", { ascending: true });
    
    if (data) {
      const trolleysWithItems = await Promise.all(
        data.map(async (trolley) => {
          const { data: items } = await supabase
            .from("Trolley_Items")
            .select("*")
            .eq("trolley_id", trolley.trolley_id);
          return { ...trolley, items: items || [] };
        })
      );
      setTrolleys(trolleysWithItems);
    }
  };

  const loadRequests = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const response = await fetch("/api/restock", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const data = await response.json();
    if (response.ok) {
      setRequests(data.requests || []);
    }
  };

  const filteredEquipment = useMemo(() => {
    if (!equipmentSearchTerm) return equipment;
    const term = equipmentSearchTerm.toLowerCase();
    return equipment.filter(eq => 
      eq.Name.toLowerCase().includes(term) ||
      (eq.Equipment_Catagory && eq.Equipment_Catagory.toLowerCase().includes(term)) ||
      (eq.Type && eq.Type.toLowerCase().includes(term))
    );
  }, [equipment, equipmentSearchTerm]);

  const filteredTrolleys = useMemo(() => {
    if (!trolleySearchTerm) return trolleys;
    const term = trolleySearchTerm.toLowerCase();
    return trolleys.filter(t => 
      t.name.toLowerCase().includes(term)
    );
  }, [trolleys, trolleySearchTerm]);

  const submitRequest = async () => {
    if (selectedType === "equipment" && !selectedEquipment) {
      alert("Please select equipment");
      return;
    }
    if (selectedType === "trolley" && !selectedTrolley) {
      alert("Please select a trolley");
      return;
    }
    if (requestQuantity < 1) {
      alert("Please enter a valid quantity");
      return;
    }

    setSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch("/api/restock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          item_type: selectedType,
          item_id: selectedType === "equipment" ? selectedEquipment!.Equipment_ID : selectedTrolley!.trolley_id,
          item_name: selectedType === "equipment" ? selectedEquipment!.Name : selectedTrolley!.name,
          requested_quantity: requestQuantity,
          reason: requestReason,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit request");
      }

      alert("Restock request submitted successfully");
      setShowRequestModal(false);
      setSelectedEquipment(null);
      setSelectedTrolley(null);
      setRequestQuantity(1);
      setRequestReason("");
      setEquipmentSearchTerm("");
      setTrolleySearchTerm("");
      await loadRequests();
    } catch (error) {
      console.error("Error submitting request:", error);
      alert(error instanceof Error ? error.message : "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const reviewRequest = async () => {
    if (!selectedRequest) return;

    setUpdatingId(selectedRequest.request_id);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const statusValue = reviewAction === "confirm" ? "confirmed" : "declined";
      
      const response = await fetch("/api/restock", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          request_id: selectedRequest.request_id,
          status: statusValue,
          notes: reviewNotes,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to review request");
      }

      alert(`Request ${reviewAction === "confirm" ? "confirmed" : "declined"} successfully`);
      setShowReviewModal(false);
      setSelectedRequest(null);
      setReviewNotes("");
      await loadRequests();
      await loadEquipment();
      await loadTrolleys();
    } catch (error) {
      console.error("Error reviewing request:", error);
      alert(error instanceof Error ? error.message : "Failed to review request");
    } finally {
      setUpdatingId(null);
    }
  };

  const openReviewModal = (request: RestockRequest, action: "confirm" | "decline") => {
    setSelectedRequest(request);
    setReviewAction(action);
    setReviewNotes("");
    setShowReviewModal(true);
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      if (filter !== "all" && request.status !== filter) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          request.item_name.toLowerCase().includes(term) ||
          request.requested_by_name.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [requests, filter, searchTerm]);

  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    confirmed: requests.filter((r) => r.status === "confirmed").length,
    declined: requests.filter((r) => r.status === "declined").length,
  }), [requests]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "confirmed":
        return styles.statusConfirmed;
      case "pending":
        return styles.statusPending;
      case "declined":
        return styles.statusDeclined;
      default:
        return styles.statusDefault;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canCreateRequests = userTier === "Tier 2" || userTier === "Tier 3" || userTier === "Tier 4";
  const canReviewRequests = userTier === "Tier 3" || userTier === "Tier 4";

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.pageContent}>
      <div className={styles.contentHeader}>
        <div className={styles.headerTop}>
          <h1 className={styles.contentHeaderTitle}>Restock Requests</h1>
          <div className={styles.headerButtons}>
            {canCreateRequests && (
              <button
                onClick={() => setShowRequestModal(true)}
                className={styles.newRequestBtn}
              >
                + New Request
              </button>
            )}
            <Link href="/dashboard" className={styles.backBtn}>
              ← Dashboard
            </Link>
          </div>
        </div>
        <p className={styles.contentHeaderSubtitle}>
          Request restocking of equipment or trolleys
        </p>
      </div>

      <div className={styles.contentArea}>
        <div className={styles.shell}>
          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.total}</div>
              <div className={styles.statLabel}>Total Requests</div>
            </div>
            <div className={`${styles.statCard} ${styles.statPending}`}>
              <div className={styles.statValue}>{stats.pending}</div>
              <div className={styles.statLabel}>Pending</div>
            </div>
            <div className={`${styles.statCard} ${styles.statConfirmed}`}>
              <div className={styles.statValue}>{stats.confirmed}</div>
              <div className={styles.statLabel}>Confirmed</div>
            </div>
            <div className={`${styles.statCard} ${styles.statDeclined}`}>
              <div className={styles.statValue}>{stats.declined}</div>
              <div className={styles.statLabel}>Declined</div>
            </div>
          </div>

          {/* Controls */}
          <div className={styles.controlsBar}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search by item or requester..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.filterContainer}>
              <label>Filter:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="declined">Declined</option>
              </select>
            </div>
            <button onClick={loadRequests} className={styles.refreshBtn}>
              Refresh
            </button>
          </div>

          {/* Requests Table */}
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Item</th>
                  <th>Requested By</th>
                  <th>Quantity</th>
                  <th>Reason</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                  </tr>
                </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.request_id}>
                    <td className={styles.itemType}>
                      {request.item_type === "equipment" ? " Equipment" : " Trolley"}
                    </td>
                    <td className={styles.itemName}>{request.item_name}</td>
                    <td className={styles.requestedBy}>{request.requested_by_name}</td>
                    <td className={styles.quantity}>{request.requested_quantity}</td>
                    <td className={styles.reason}>{request.reason || "-"}</td>
                    <td className={styles.date}>{formatDate(request.created_at)}</td>
                    <td className={styles.statusCell}>
                      <span className={`${styles.statusBadge} ${getStatusBadgeClass(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className={styles.actions}>
                      {request.status === "pending" && canReviewRequests && (
                        <>
                          <button
                            onClick={() => openReviewModal(request, "confirm")}
                            disabled={updatingId === request.request_id}
                            className={styles.confirmBtn}
                          >
                            Confirm
          </button>
                          <button
                            onClick={() => openReviewModal(request, "decline")}
                            disabled={updatingId === request.request_id}
                            className={styles.declineBtn}
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {request.status !== "pending" && (
                        <span className={styles.reviewedBy}>
                          {request.reviewed_by_name && `by ${request.reviewed_by_name}`}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRequests.length === 0 && (
            <div className={styles.emptyState}>
              <p>No restock requests found.</p>
              {canCreateRequests && (
                <button onClick={() => setShowRequestModal(true)} className={styles.createFirstBtn}>
                  Create your first request
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* New Request Modal */}
      {showRequestModal && (
        <div className={styles.modalOverlay} onClick={() => setShowRequestModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>New Restock Request</h2>
              <button className={styles.modalClose} onClick={() => setShowRequestModal(false)}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              {/* Item Type Selection */}
              <div className={styles.formGroup}>
                <label>Item Type</label>
                <div className={styles.typeToggle}>
                  <button
                    type="button"
                    onClick={() => setSelectedType("equipment")}
                    className={`${styles.typeBtn} ${selectedType === "equipment" ? styles.activeType : ""}`}
                  >
                     Equipment
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedType("trolley")}
                    className={`${styles.typeBtn} ${selectedType === "trolley" ? styles.activeType : ""}`}
                  >
                     Trolley
                  </button>
                </div>
              </div>

              {/* Equipment Section */}
              {selectedType === "equipment" && (
                <>
                  <div className={styles.formGroup}>
                    <label>Search Equipment</label>
                    <input
                      type="text"
                      placeholder="Type to search equipment..."
                      value={equipmentSearchTerm}
                      onChange={(e) => setEquipmentSearchTerm(e.target.value)}
                      className={styles.searchInput}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Select Equipment *</label>
                    <div className={styles.equipmentSelectWrapper}>
                      <select
                        value={selectedEquipment?.Equipment_ID || ""}
                        onChange={(e) => {
                          const eq = equipment.find((eq) => eq.Equipment_ID === parseInt(e.target.value));
                          setSelectedEquipment(eq || null);
                        }}
                        className={styles.equipmentSelect}
                        size={Math.min(filteredEquipment.length + 1, 8)}
                      >
                        <option value="">-- Select equipment --</option>
                        {filteredEquipment.map((eq) => (
                          <option key={eq.Equipment_ID} value={eq.Equipment_ID}>
                            {eq.Name} (Stock: {eq.Quantity || 0})
                          </option>
                        ))}
                      </select>
                    </div>
                    {filteredEquipment.length === 0 && equipmentSearchTerm && (
                      <p className={styles.noResults}>No equipment found matching "{equipmentSearchTerm}"</p>
                    )}
                  </div>

                  {selectedEquipment && (
                    <div className={styles.selectedInfo}>
                      <p><strong>Selected:</strong> {selectedEquipment.Name}</p>
                      <p><strong>Current Stock:</strong> {selectedEquipment.Quantity || 0}</p>
                    </div>
                  )}
                </>
              )}

              {/* Trolley Section */}
              {selectedType === "trolley" && (
                <>
                  <div className={styles.formGroup}>
                    <label>Search Trolley</label>
                    <input
                      type="text"
                      placeholder="Type to search trolley..."
                      value={trolleySearchTerm}
                      onChange={(e) => setTrolleySearchTerm(e.target.value)}
                      className={styles.searchInput}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Select Trolley *</label>
                    <div className={styles.equipmentSelectWrapper}>
                      <select
                        value={selectedTrolley?.trolley_id || ""}
                        onChange={(e) => {
                          const trolley = trolleys.find((t) => t.trolley_id === parseInt(e.target.value));
                          setSelectedTrolley(trolley || null);
                        }}
                        className={styles.equipmentSelect}
                        size={Math.min(filteredTrolleys.length + 1, 8)}
                      >
                        <option value="">-- Select trolley --</option>
                        {filteredTrolleys.map((t) => (
                          <option key={t.trolley_id} value={t.trolley_id}>
                            {t.name} (Stock: {t.quantity || 0})
                          </option>
                        ))}
                      </select>
                    </div>
                    {filteredTrolleys.length === 0 && trolleySearchTerm && (
                      <p className={styles.noResults}>No trolley found matching "{trolleySearchTerm}"</p>
                    )}
                  </div>

                  {selectedTrolley && (
                    <div className={styles.selectedInfo}>
                      <p><strong>Selected:</strong> {selectedTrolley.name}</p>
                      <p><strong>Current Stock:</strong> {selectedTrolley.quantity || 0}</p>
                      {selectedTrolley.items && selectedTrolley.items.length > 0 && (
                        <p><strong>Contains:</strong> {selectedTrolley.items.length} items</p>
                      )}
                    </div>
                  )}
                </>
              )}

              <div className={styles.formGroup}>
                <label>Quantity to Restock *</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={requestQuantity}
                  onChange={(e) => setRequestQuantity(parseInt(e.target.value) || 1)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Reason (optional)</label>
                <textarea
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  placeholder="Why is this restock needed?"
                  className={styles.textarea}
                  rows={3}
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowRequestModal(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                className={styles.submitBtn}
                onClick={submitRequest}
                disabled={
                  (selectedType === "equipment" && !selectedEquipment) ||
                  (selectedType === "trolley" && !selectedTrolley) ||
                  requestQuantity < 1 ||
                  submitting
                }
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Request Modal */}
      {showReviewModal && selectedRequest && (
        <div className={styles.modalOverlay} onClick={() => setShowReviewModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{reviewAction === "confirm" ? "Confirm" : "Decline"} Restock Request</h2>
              <button className={styles.modalClose} onClick={() => setShowReviewModal(false)}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <p><strong>Type:</strong> {selectedRequest.item_type === "equipment" ? "Equipment" : "Trolley"}</p>
              <p><strong>Item:</strong> {selectedRequest.item_name}</p>
              <p><strong>Requested By:</strong> {selectedRequest.requested_by_name}</p>
              <p><strong>Quantity:</strong> {selectedRequest.requested_quantity}</p>
              <p><strong>Reason:</strong> {selectedRequest.reason || "No reason provided"}</p>

              <div className={styles.formGroup}>
                <label>Notes (optional)</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder={reviewAction === "confirm" ? "Add any notes about this restock..." : "Why is this request being declined?"}
                  className={styles.textarea}
                  rows={3}
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowReviewModal(false)}
                disabled={updatingId === selectedRequest.request_id}
              >
                Cancel
              </button>
              <button
                className={reviewAction === "confirm" ? styles.confirmReviewBtn : styles.declineReviewBtn}
                onClick={reviewRequest}
                disabled={updatingId === selectedRequest.request_id}
              >
                {updatingId === selectedRequest.request_id ? "Processing..." : (reviewAction === "confirm" ? "Confirm Request" : "Decline Request")}
              </button>
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