'use client';

import { useEffect, useState } from "react";
import { Lexend } from 'next/font/google';
import { Loader2, Trash2, UserPlus } from 'lucide-react';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function AdminUserManagement() {
  // Role labels for UI
  const roles = [
    "Rule Maintainer",
    "Rule Developer",
    "Educator",
  ];

  // Map UI role → DB role
  const roleMap = {
    "Rule Maintainer": "rule-maintainer",
    "Rule Developer": "rule-developer",
    "Educator": "educator",
  };

  function convertRoleToDisplay(dbRole) {
    const entry = Object.entries(roleMap).find(([display, value]) => value === dbRole);
    return entry ? entry[0] : dbRole;
  }

  // 🔹 FIX: Add missing states
  const [users, setUsers] = useState([]);
  const [assignedRoles, setAssignedRoles] = useState({});
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [selectedRole, setSelectedRole] = useState(roles[0]);

  useEffect(() => {
  async function fetchUsers() {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();

      setUsers(data);

      // Build mapping of which roles are assigned (always as array)
      const roleAssignments = {};
      data.forEach((u) => {
        const displayRole = convertRoleToDisplay(u.role);
        if (roles.includes(displayRole)) {
          if (!roleAssignments[displayRole]) roleAssignments[displayRole] = [];
          roleAssignments[displayRole].push(u.email);
        }
      });

      setAssignedRoles(roleAssignments);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  }

  fetchUsers();
}, []);



  const handleAssign = async () => {
  if (!emailInput.trim()) return;
  setAssigning(true);
  try {
    // Use the explicit mapping for consistency
    const dbRole = roleMap[selectedRole] || selectedRole.toLowerCase().replace(/\s+/g, "-"); 
    // e.g. "Rule Maintainer" → "rule-maintainer"

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailInput, role: dbRole }),
    });

    const result = await res.json();
    if (result.success) {
      // Ensure we always store arrays of emails per role
      setAssignedRoles((prev) => ({
        ...prev,
        [selectedRole]: [ ...(prev[selectedRole] || []), emailInput ],
      }));
      setUsers((prev) =>
        prev.map((u) =>
          u.email === emailInput ? { ...u, role: dbRole } : u
        )
      );
      setEmailInput("");
    }
  } catch (err) {
    console.error("Failed to assign role", err);
  } finally {
    setAssigning(false);
  }
};


  const handleRemove = async (role, email) => {
  const confirmRemove = confirm(`Are you sure you want to remove ${role} role from ${email}?`);
  if (!confirmRemove) return;

  try {
    const res = await fetch("/api/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const result = await res.json();

    if (result.success) {
      setUsers((prev) =>
        prev.map((u) =>
          u.email === email ? { ...u, role: "primary-user" } : u
        )
      );
      // Keep assignedRoles in sync by removing the email from the role list
      setAssignedRoles((prev) => {
        const next = { ...prev };
        next[role] = (next[role] || []).filter((e) => e !== email);
        return next;
      });
    }
  } catch (err) {
    console.error("Failed to remove role", err);
  }
};


  return (
    <div className={`p-6 md:p-10 space-y-10 ${lexend.className}`}>
      <h1 className="text-3xl font-bold mb-8 text-[var(--foreground)]">
        Manage Platform Roles
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {roles.map((role) => (
          <div
            key={role}
            className="bg-[var(--input-bg)] p-6 rounded-xl border border-[var(--border-input)] shadow-lg"
          >
            <h2 className="text-xl font-semibold text-[var(--brand-yellow)] mb-2">
              {role}
            </h2>
            <div className="text-md text-[var(--foreground)] mb-4">
              {Array.isArray(assignedRoles[role]) && assignedRoles[role].length > 0 ? (
                assignedRoles[role].map((email) => (
                  <div key={email} className="flex items-center justify-between mb-1">
                    <span>{email}</span>
                    <button
                      onClick={() => handleRemove(role, email)}
                      className="inline-flex items-center gap-2 text-red-500 border border-red-500 px-3 py-1 rounded-lg hover:bg-red-600/10 transition"
                    >
                      <Trash2 size={16} /> Remove
                    </button>
                  </div>
                ))
              ) : (
                <span className="text-[var(--text-secondary)]">Not assigned</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-[var(--input-bg)] p-8 rounded-xl border border-[var(--border-input)] shadow-xl max-w-xl">
        <h2 className="text-xl font-bold mb-4 text-[var(--foreground)]">Assign a Role</h2>
        <div className="flex flex-col gap-4">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] px-4 py-3 rounded-lg focus:outline-none"
          >
            {roles.map((role) => (
              <option key={role} value={role} >
                {role}
              </option>
            ))}
          </select>

          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="Enter email address"
            className="bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] px-4 py-3 rounded-lg focus:outline-none"
          />

          <button
            onClick={handleAssign}
            disabled={assigning || !emailInput.trim()}
            className="inline-flex items-center gap-2 bg-[var(--brand-yellow)] text-[var(--background)] font-bold px-6 py-3 rounded-full hover:brightness-110 transition-all duration-300 shadow-md text-base"
          >
            {assigning ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <UserPlus size={20} />
            )}
            Assign Role
          </button>
        </div>
      </div>
    </div>
  );
}
