"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./users.module.css";

type User = {
  user_id: string;
  email: string;
  tier: string;
  forename: string | null;
  account_type: string | null;
  created_at: string;
};

type Stats = {
  total: number;
  tier1: number;
  tier2: number;
  tier3: number;
  tier4: number;
};

export default function AdminUsersPage() {
  const supabase = createClient();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [updatingTierId, setUpdatingTierId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [selectedTier, setSelectedTier] = useState<string>("");
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [showTierModal, setShowTierModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    async function checkAdminAndLoad() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: account } = await supabase
        .from('accounts')
        .select('tier')
        .eq('user_id', user.id)
        .single();

      if (account?.tier !== "Tier 4") {
        router.push("/dashboard");
        return;
      }

      await loadUsers();
    }
    checkAdminAndLoad();
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Please log in again');
      }
      
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server error - please try again');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Failed to load users (${response.status})`);
      }
      
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error loading users:", error);
      alert(error instanceof Error ? error.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  const openResetModal = useCallback((user: User) => {
    setSelectedUser(user);
    setNewPassword("");
    setConfirmPassword("");
    setShowResetModal(true);
  }, []);

  const closeResetModal = useCallback(() => {
    setShowResetModal(false);
    setSelectedUser(null);
    setNewPassword("");
    setConfirmPassword("");
  }, []);

  const openTierModal = useCallback((user: User) => {
    setSelectedUser(user);
    setSelectedTier(user.tier);
    setShowTierModal(true);
  }, []);

  const closeTierModal = useCallback(() => {
    setShowTierModal(false);
    setSelectedUser(null);
    setSelectedTier("");
  }, []);

  const updateTier = useCallback(async () => {
    if (!selectedUser) return;
    
    setUpdatingTierId(selectedUser.user_id);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          userId: selectedUser.user_id,
          newTier: selectedTier
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update tier');
      }
      
      alert(`Tier updated to ${selectedTier} for ${selectedUser.forename || selectedUser.email}`);
      closeTierModal();
      await loadUsers();
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error updating tier:", error);
      alert(`Failed to update tier: ${errorMessage}`);
    } finally {
      setUpdatingTierId(null);
    }
  }, [selectedUser, selectedTier, loadUsers]);

  const resetPassword = useCallback(async () => {
    if (!selectedUser) return;
    
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    
    setResettingId(selectedUser.user_id);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          userId: selectedUser.user_id,
          newPassword: newPassword
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }
      
      alert(`Password reset successfully for ${selectedUser.forename || selectedUser.email}`);
      closeResetModal();
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error resetting password:", error);
      alert(`Failed to reset password: ${errorMessage}`);
    } finally {
      setResettingId(null);
    }
  }, [selectedUser, newPassword, confirmPassword, closeResetModal]);

  const filteredUsers = useMemo((): User[] => {
    return users.filter((user: User) => {
      if (!searchTerm) return true;
      const term: string = searchTerm.toLowerCase();
      return (
        user.forename?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.tier.toLowerCase().includes(term) ||
        user.account_type?.toLowerCase().includes(term) ||
        user.user_id.toLowerCase().includes(term)
      );
    });
  }, [users, searchTerm]);

  const stats = useMemo((): Stats => ({
    total: users.length,
    tier1: users.filter((u: User) => u.tier === "Tier 1").length,
    tier2: users.filter((u: User) => u.tier === "Tier 2").length,
    tier3: users.filter((u: User) => u.tier === "Tier 3").length,
    tier4: users.filter((u: User) => u.tier === "Tier 4").length,
  }), [users]);

  const getTierBadgeClass = useCallback((tier: string): string => {
    switch(tier) {
      case "Tier 1": return styles.tier1;
      case "Tier 2": return styles.tier2;
      case "Tier 3": return styles.tier3;
      case "Tier 4": return styles.tier4;
      default: return styles.tierDefault;
    }
  }, []);

  const formatDate = useCallback((date: string): string => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }, []);

  if (loading) return <div className={styles.loading}>Loading users...</div>;

  return (
    <div className={styles.pageContent}>
      <div className={styles.contentHeader}>
        <div className={styles.headerTop}>
          <h1 className={styles.contentHeaderTitle}>Manage Users</h1>
          <Link href="/dashboard/admin" className={styles.backToAdminBtn}>
            ← Back to Admin Panel
          </Link>
        </div>
        <p className={styles.contentHeaderSubtitle}>View and manage all system users</p>
      </div>

      <div className={styles.contentArea}>
        <div className={styles.shell}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.total}</div>
              <div className={styles.statLabel}>Total Users</div>
            </div>
            <div className={`${styles.statCard} ${styles.statTier1}`}>
              <div className={styles.statValue}>{stats.tier1}</div>
              <div className={styles.statLabel}>Tier 1</div>
            </div>
            <div className={`${styles.statCard} ${styles.statTier2}`}>
              <div className={styles.statValue}>{stats.tier2}</div>
              <div className={styles.statLabel}>Tier 2</div>
            </div>
            <div className={`${styles.statCard} ${styles.statTier3}`}>
              <div className={styles.statValue}>{stats.tier3}</div>
              <div className={styles.statLabel}>Tier 3</div>
            </div>
            <div className={`${styles.statCard} ${styles.statTier4}`}>
              <div className={styles.statValue}>{stats.tier4}</div>
              <div className={styles.statLabel}>Tier 4</div>
            </div>
          </div>

          <div className={styles.controlsBar}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search by name, email, tier, or ID..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <button onClick={loadUsers} className={styles.refreshBtn}>
              Refresh
            </button>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Tier</th>
                  <th>Account Type</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user: User) => {
                  const isResetting: boolean = resettingId === user.user_id;
                  const isUpdatingTier: boolean = updatingTierId === user.user_id;
                  
                  return (
                    <tr key={user.user_id}>
                      <td className={styles.userName}>
                        {user.forename || "Not set"}
                      </td>
                      <td className={styles.userEmail}>{user.email}</td>
                      <td>
                        <span className={`${styles.tierBadge} ${getTierBadgeClass(user.tier)}`}>
                          {user.tier}
                        </span>
                      </td>
                      <td className={styles.accountType}>
                        {user.account_type || "Students"}
                      </td>
                      <td className={styles.joinDate}>
                        {formatDate(user.created_at)}
                      </td>
                      <td className={styles.actions}>
                        <button
                          onClick={() => openTierModal(user)}
                          disabled={isUpdatingTier}
                          className={styles.tierBtn}
                        >
                          {isUpdatingTier ? "Updating..." : "Change Tier"}
                        </button>
                        <button
                          onClick={() => openResetModal(user)}
                          disabled={isResetting}
                          className={styles.resetBtn}
                        >
                          {isResetting ? "Resetting..." : "Reset Password"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className={styles.emptyState}>
              <p>No users found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Reset Password Modal */}
      {showResetModal && selectedUser && (
        <div className={styles.modalOverlay} onClick={closeResetModal}>
          <div className={styles.modal} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Reset Password</h2>
              <button className={styles.modalClose} onClick={closeResetModal}>×</button>
            </div>
            <div className={styles.modalBody}>
              <p>Reset password for: <strong>{selectedUser.forename || selectedUser.email}</strong></p>
              <div className={styles.formGroup}>
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 6 characters)"
                  className={styles.modalInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className={styles.modalInput}
                />
              </div>
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className={styles.errorMessage}>Passwords do not match</p>
              )}
              {newPassword && newPassword.length < 6 && (
                <p className={styles.errorMessage}>Password must be at least 6 characters</p>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={closeResetModal}>
                Cancel
              </button>
              <button
                className={styles.saveBtn}
                onClick={resetPassword}
                disabled={!newPassword || newPassword !== confirmPassword || newPassword.length < 6}
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Tier Modal */}
      {showTierModal && selectedUser && (
        <div className={styles.modalOverlay} onClick={closeTierModal}>
          <div className={styles.modal} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Change User Tier</h2>
              <button className={styles.modalClose} onClick={closeTierModal}>×</button>
            </div>
            <div className={styles.modalBody}>
              <p>Change tier for: <strong>{selectedUser.forename || selectedUser.email}</strong></p>
              <div className={styles.formGroup}>
                <label>Select Tier</label>
                <select
                  value={selectedTier}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedTier(e.target.value)}
                  className={styles.modalSelect}
                >
                  <option value="Tier 1">Tier 1</option>
                  <option value="Tier 2">Tier 2</option>
                  <option value="Tier 3">Tier 3</option>
                  <option value="Tier 4">Tier 4</option>
                </select>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={closeTierModal}>
                Cancel
              </button>
              <button
                className={styles.saveBtn}
                onClick={updateTier}
                disabled={selectedTier === selectedUser.tier}
              >
                Update Tier
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