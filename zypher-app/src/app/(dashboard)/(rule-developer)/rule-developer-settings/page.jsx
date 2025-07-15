"use client";

import { useState } from 'react';
import { Lexend } from 'next/font/google';
import clsx from 'clsx';
import Image from 'next/image';

import {
  User, ClipboardList, 
  Mail, Lock, Image as ImageIcon, CheckCircle, XCircle, Info, 
  Save, KeyRound, Loader2 
} from 'lucide-react';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function RuleDeveloperSettingsPage() {
  const [activeTab, setActiveTab] = useState('account');

  const [developerName, setDeveloperName] = useState('Alice Developer');
  const [developerEmail, setDeveloperEmail] = useState('alice.dev@zypher.com');
  const [developerProfilePic, setDeveloperProfilePic] = useState('/Images/avatar.jpg'); 
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [accountFeedback, setAccountFeedback] = useState(null);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setAccountFeedback(null);
    setIsSavingAccount(true);
    //API call
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
        setDeveloperProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
      setAccountFeedback({ type: 'info', message: 'Profile picture uploaded. Click Save Changes to confirm.' });
    }
  };

  const employmentTermsDeveloper = `
    This Employment Agreement ("Agreement") is made effective as of [Start Date], by and between Zypher Inc. ("the Company") and [Rule Developer Name] ("the Employee").

    **1. Position and Duties:**
    The Employee is employed in the position of Rule Developer. The Employee shall perform duties as reasonably assigned by the Company, including but not limited to:
    - Designing, developing, and implementing custom rules for the Zypher platform.
    - Writing high-quality, efficient, and secure code for rule logic.
    - Collaborating with Rule Maintainers to understand rule requirements and specifications.
    - Participating in code reviews and ensuring adherence to coding standards.
    - Debugging and troubleshooting rule-related issues.
    - Contributing to the continuous improvement of the rule development process.

    **2. Employment Relationship:**
    The Employee's employment with the Company is on an "at-will" basis. This means that either the Employee or the Company may terminate the employment relationship at any time, for any reason, with or without cause, and with or without notice.

    **3. Compensation and Benefits:**
    a. **Compensation:** The Employee's gross salary shall be [Your Salary/Hourly Rate], paid in accordance with the Company’s regular payroll schedule.
    b. **Benefits:** The Employee will be eligible for standard Company benefits, which may include health insurance, paid time off (PTO), and other benefits, as per the current Company policy and subject to any eligibility requirements. The Company reserves the right to modify or terminate benefit plans at its sole discretion.

    **4. Confidentiality:**
    The Employee acknowledges that during the course of employment, they will have access to and be entrusted with confidential and proprietary information ("Confidential Information") of the Company. This includes, but is not limited to:
    - Trade secrets, patents, copyrights, and business strategies.
    - Financial information, business plans, and marketing materials.
    - All technical and non-technical information related to the Company’s products, software, and rule logic.

    The Employee agrees to hold all Confidential Information in strict confidence and will not, at any time during or after their employment, directly or indirectly, use, disclose, or disseminate any Confidential Information to any third party without the express written consent of the Company.

    **5. Intellectual Property:**
    The Employee agrees that all work product, including but not limited to any inventions, discoveries, designs, software, code, and improvements ("Inventions") that the Employee may conceive, create, or develop, either alone or with others, during the course of their employment and that relate to the Company’s business, shall be the sole property of the Company. The Employee agrees to assign all rights, title, and interest in such Inventions to the Company.

    **6. Non-Solicitation:**
    During the term of employment and for a period of [e.g., twelve (12)] months following the termination of employment, the Employee agrees not to solicit, directly or indirectly, any employees, clients, or business partners of the Company to leave their employment or business relationship with the Company.

    **7. Governing Law:**
    This Agreement shall be governed by and construed in accordance with the laws of the State of [Your State/Jurisdiction], without regard to its conflict of laws principles.

    **8. Entire Agreement:**
    This Agreement, along with any documents or policies referenced herein, constitutes the entire understanding and agreement between the parties with respect to the subject matter hereof and supersedes all prior and contemporaneous agreements, negotiations, and discussions.

    By accepting and continuing your employment with Zypher Inc., you acknowledge and agree to these terms.
  `;


  const inputStyle = "w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all duration-200 shadow-inner";


  return (
    <div className={`p-6 md:p-8 lg:p-10 ${lexend.className} animate-fadeInUp min-h-screen`}>
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[var(--foreground)]">Developer Settings</h1>

      {/* Tabs Navigation */}
      <div className="bg-[var(--input-bg)] rounded-xl p-2 mb-8 shadow-md border border-[var(--border-input)] flex flex-wrap justify-center sm:justify-start gap-2">
        <button
          onClick={() => setActiveTab('account')}
          className={clsx(
            "flex items-center gap-2 px-6 py-3 rounded-lg text-lg font-medium transition-all duration-300",
            activeTab === 'account'
              ? "bg-[var(--brand-yellow)] text-[var(--background)] shadow-lg"
              : "text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
          )}
        >
          <User size={20} /> Account
        </button>
        <button
          onClick={() => setActiveTab('terms-agreements')}
          className={clsx(
            "flex items-center gap-2 px-6 py-3 rounded-lg text-lg font-medium transition-all duration-300",
            activeTab === 'terms-agreements'
              ? "bg-[var(--brand-yellow)] text-[var(--background)] shadow-lg"
              : "text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
          )}
        >
          <ClipboardList size={20} /> Terms & Agreements
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-[var(--input-bg)] p-8 rounded-xl shadow-xl border border-[var(--border-input)] animate-fadeInUp">

        {activeTab === 'account' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">Your Profile Information</h2>
            <form onSubmit={handleProfileSave} className="space-y-6 mb-10">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Profile Picture */}
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[var(--brand-yellow)] flex-shrink-0">
                  <Image
                    src={developerProfilePic}
                    alt="Developer Profile Avatar"
                    width={96}
                    height={96}
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
                    <label htmlFor="developer-name" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Name</label>
                    <input
                      type="text"
                      id="developer-name"
                      value={developerName}
                      onChange={(e) => setDeveloperName(e.target.value)}
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label htmlFor="developer-email" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email</label>
                    <input
                      type="email"
                      id="developer-email"
                      value={developerEmail}
                      disabled
                      className={clsx(inputStyle, "cursor-not-allowed text-[var(--text-secondary)]")}
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
                    className={inputStyle}
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
                    className={inputStyle}
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
                    className={inputStyle}
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
        )}

        {/* Terms and Agreements Tab Content */}
        {activeTab === 'terms-agreements' && (
          <div className="space-y-10">
            <div>
              <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">Employment Agreement for Rule Developer</h2>
              <div className="bg-[var(--background)] p-6 rounded-lg border border-[var(--border-input)] shadow-md max-h-96 overflow-y-auto custom-scrollbar text-[var(--foreground)]">
                <p className="whitespace-pre-line text-sm text-[var(--text-secondary)]">
                  {employmentTermsDeveloper}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}