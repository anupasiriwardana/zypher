"use client";

import { useState } from 'react';
import { 
  Save, 
  KeyRound, 
  Loader2, 
  CheckCircle, 
  XCircle,
  Image as ImageIcon,
  Info
} from 'lucide-react';
import clsx from 'clsx';

export default function AccountSection() {
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com'); 
  const [profilePic, setProfilePic] = useState('/Images/avatar.jpg');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [accountFeedback, setAccountFeedback] = useState(null);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setAccountFeedback(null);
    setIsSavingAccount(true);

    //api call to change profile details
    await new Promise(resolve => setTimeout(resolve, 1500));
    setAccountFeedback({ type: 'success', message: 'Profile updated successfully!' });
    setIsSavingAccount(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setAccountFeedback(null);
    setIsSavingAccount(true);
    if (newPassword !== confirmNewPassword) {
      setAccountFeedback({ type: 'error', message: 'New passwords do not match.' });
      setIsSavingAccount(false);
      return;
    }
    if (newPassword.length < 8) {
      setAccountFeedback({ type: 'error', message: 'New password must be at least 8 characters.' });
      setIsSavingAccount(false);
      return;
    }
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setAccountFeedback({ type: 'success', message: 'Password changed successfully!' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setIsSavingAccount(false);
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
      // should connect the backend API to upload the image
      setAccountFeedback({ type: 'info', message: 'Profile picture uploaded. Click Save Changes to confirm.' });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">Basic Information</h2>
      <form onSubmit={handleProfileSave} className="space-y-6 mb-10">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Profile Picture */}
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[var(--brand-yellow)] flex-shrink-0">
            <img
              src={profilePic}
              alt="Profile Avatar"
              className="w-full h-full object-cover"
              onError={(e) => { e.target.onerror = null; e.target.src = '/Images/placeholder-avatar.png'; }} // Fallback
            />
            <label htmlFor="profile-pic-upload" className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
              <ImageIcon size={24} className="text-white" />
              <input
                id="profile-pic-upload"
                type="file"
                accept="image/*"
                onChange={handleProfilePicChange}
                className="hidden"
              />
            </label>
          </div>
          {/* Name & Email Fields */}
          <div className="flex-grow space-y-4 w-full">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                disabled // Email read-only for security
                className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--text-secondary)] cursor-not-allowed"
              />
            </div>
          </div>
        </div>
        {accountFeedback && accountFeedback.type !== 'info' && ( 
          <div className={clsx(
            "p-3 rounded-lg text-sm flex items-center gap-2",
            accountFeedback.type === 'success' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
          )}>
            {accountFeedback.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
            <span>{accountFeedback.message}</span>
          </div>
        )}
        {accountFeedback && accountFeedback.type === 'info' && ( 
          <div className="p-3 rounded-lg text-sm flex items-center gap-2 bg-blue-600/20 text-blue-400">
            <Info size={18} />
            <span>{accountFeedback.message}</span>
          </div>
        )}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-[var(--brand-yellow)] text-[var(--background)] font-bold px-6 py-3 rounded-full hover:brightness-110 transition-all duration-300 shadow-md text-base"
            disabled={isSavingAccount}
          >
            {isSavingAccount ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            Save Changes
          </button>
        </div>
      </form>

      <div className="border-t border-[var(--border-input)] pt-10">
        <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-6">
          <div>
            <label htmlFor="current-password" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Current Password</label>
            <input
              type="password"
              id="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all duration-200"
              required
              disabled={isSavingAccount}
            />
          </div>
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">New Password</label>
            <input
              type="password"
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all duration-200"
              required
              disabled={isSavingAccount}
            />
          </div>
          <div>
            <label htmlFor="confirm-new-password" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Confirm New Password</label>
            <input
              type="password"
              id="confirm-new-password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all duration-200"
              required
              disabled={isSavingAccount}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-[var(--brand-yellow)] text-[var(--background)] font-bold px-6 py-3 rounded-full hover:brightness-110 transition-all duration-300 shadow-md text-base"
              disabled={isSavingAccount}
            >
              {isSavingAccount ? <Loader2 size={20} className="animate-spin" /> : <KeyRound size={20} />}
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}