"use client";

import { Lexend } from 'next/font/google';
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

import ProfileForm from "@/components/ProfileForm";
import PasswordForm from "@/components/PasswordForm";

import clsx from "clsx";

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
  const { data: session } = useSession();
  const [profilePic, setProfilePic] = useState("/Images/avatar.jpg");

  // added missing UI state
  const [activeTab, setActiveTab] = useState('account');

  useEffect(() => {
      if (!session?.user?.email) return;
  
      const fetchProfile = async () => {
        const res = await fetch(`/api/user-settings?email=${session.user.email}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.image) setProfilePic(data.image);
      };
  
      fetchProfile();
    }, [session?.user?.email]);

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
            {session?.user && (
                                          <ProfileForm
                                            role={session.user.role}
                                            userId={session.user.id}
                                            initialEmail={session.user.email}
                                            initialProfilePic={profilePic}
                                            saveEndpoint="/api/user-settings"
                                          />
                                        )}
                                
                                
                                        {/* Password Form */}
                                        {session?.user && (
                                          <PasswordForm
                                            userId={session.user.id}
                                            updateEndpoint="/api/change-password"
                                          />
                                        )}
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