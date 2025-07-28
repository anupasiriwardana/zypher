'use client';

import { useState } from 'react';
import { Lexend } from 'next/font/google';
import { Loader2, Trash2, UserPlus } from 'lucide-react';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const roles = [
  'Rule Maintainer',
  'Rule Developer',
  'Rule Implementer',
  'Educator',
];

const allUsersMock = [
  { name: "Alice", email: "alice@zypher.com", role: "Developer" },
  { name: "Bob", email: "bob@zypher.com", role: "Developer" },
  { name: "Charlie", email: "charlie@zypher.com", role: "Developer" },
  { name: "Dana", email: "dana@zypher.com", role: "Developer" },
];

export default function AdminUserManagement() {
  const [assigning, setAssigning] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [users, setUsers] = useState(allUsersMock);
  const [selectedRole, setSelectedRole] = useState(roles[0]);
  const [assignedRoles, setAssignedRoles] = useState({
    'Rule Maintainer': 'maintainer@zypher.com',
    'Rule Developer': 'developer@zypher.com',
    'Rule Implementer': 'implementer@zypher.com',
    'Educator': 'educator@zypher.com',
  });

  const handleAssign = () => {
    if (!emailInput.trim()) return;
    setAssigning(true);
    setTimeout(() => {
      setAssignedRoles((prev) => ({ ...prev, [selectedRole]: emailInput }));
      setEmailInput('');
      setAssigning(false);
    }, 1000);
  };

  const handleRemove = (role) => {
    setAssignedRoles((prev) => ({ ...prev, [role]: null }));
  };

  return (
    <div className={`p-6 md:p-10 space-y-10 ${lexend.className}`}>
      <h1 className="text-3xl font-bold text-[var(--foreground)]">User Management</h1>

        <div className="bg-[var(--input-bg)] p-6 rounded-xl border border-[var(--border-input)]">
        <h2 className="text-xl font-semibold mb-4">All Registered Users</h2>
        <div className="overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="text-[var(--text-secondary)] border-b border-[var(--border-input)]">
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Email</th>
                <th className="py-2 px-4">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={i} className="border-b border-[var(--border-input)]">
                  <td className="py-2 px-4">{user.name}</td>
                  <td className="py-2 px-4">{user.email}</td>
                  <td className="py-2 px-4">{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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
            <p className="text-md text-[var(--foreground)] mb-4">
              {assignedRoles[role] || <span className="text-[var(--text-secondary)]">Not assigned</span>}
            </p>
            {assignedRoles[role] ? (
              <button
                onClick={() => handleRemove(role)}
                className="inline-flex items-center gap-2 text-red-500 border border-red-500 px-4 py-2 rounded-lg hover:bg-red-600/10 transition"
              >
                <Trash2 size={18} /> Remove Role
              </button>
            ) : null}
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
              <option key={role} value={role} disabled={!!assignedRoles[role]}>
                {role} {assignedRoles[role] ? '(Already Assigned)' : ''}
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
