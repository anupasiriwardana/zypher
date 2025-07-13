"use client";

import { useState, useMemo } from 'react';
import { Lexend } from 'next/font/google';
import clsx from 'clsx';
import Image from 'next/image';

import {
  User, Users, ClipboardList, 
  Mail, Lock, Image as ImageIcon, CheckCircle, XCircle, Info,
  Save, KeyRound, UserPlus, Briefcase, Calendar, 
  Loader2,
  ArrowRight, X,
} from 'lucide-react';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function RuleMaintainerSettingsPage() {
  const [activeTab, setActiveTab] = useState('assign-roles');

  // --- Account Tab States (Simplified) ---
  const [maintainerName, setMaintainerName] = useState('Jane Zypher');
  const [maintainerEmail, setMaintainerEmail] = useState('jane.zypher@zypher.com');
  const [maintainerProfilePic, setMaintainerProfilePic] = useState('/Images/avatar.jpg');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [accountFeedback, setAccountFeedback] = useState(null);

  // --- Assign Roles Tab States & Data ---
  const [teamMembers, setTeamMembers] = useState([
    { id: 'dev-001', name: 'Alice Developer', email: 'alice.dev@zypher.com', role: 'Rule Developer', activeStatus: 'Current', startDate: '2025-06-01', profilePic: '/Images/avatar.jpg', skills: 'Python, Golang, Regex, Kubernetes, Static Analysis, CI/CD pipelines', experience: '5+ years in security engineering and software development. Specialized in automated vulnerability scanning.' },
    { id: 'imp-001', name: 'Bob Implementor', email: 'bob.imp@zypher.com', role: 'Rule Implementor', activeStatus: 'Current', startDate: '2025-06-15', profilePic: '/Images/avatar.jpg', skills: 'Terraform, CloudFormation, AWS, Azure, Infrastructure-as-Code (IaC) implementation', experience: '3 years in DevOps and cloud infrastructure. Strong focus on implementing security policies at the infrastructure level.' },
    { id: 'dev-past-001', name: 'Charlie Code', email: 'charlie.code@zypher.com', role: 'Rule Developer', activeStatus: 'Past', startDate: '2024-01-01', endDate: '2025-05-31', profilePic: '/Images/avatar.jpg', skills: 'C++, Java, SAST Tools', experience: 'Led the initial development phase for 1.0 release.' },
    { id: 'imp-past-001', name: 'Diana DevOps', email: 'diana.devops@zypher.com', role: 'Rule Implementor', activeStatus: 'Past', startDate: '2024-05-01', endDate: '2025-06-14', profilePic: '/Images/avatar.jpg', skills: 'Jenkins, Terraform, AWS', experience: 'Managed implementation for infrastructure rules.' },
  ]);

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Rule Developer');
  const [newMemberSkills, setNewMemberSkills] = useState('');
  const [newMemberExperience, setNewMemberExperience] = useState('');
  const [newMemberProfilePic, setNewMemberProfilePic] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [assignRolesFeedback, setAssignRolesFeedback] = useState(null);

  // Modal State for Member Details
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const openMemberModal = (member) => {
    setSelectedMember(member);
    setShowMemberModal(true);
  };
  
  const closeMemberModal = () => {
    setShowMemberModal(false);
    setSelectedMember(null);
  };

  const handleAddTeamMember = async (e) => {
    e.preventDefault();
    setAssignRolesFeedback(null);
    if (!newMemberName.trim() || !newMemberEmail.trim()) {
      setAssignRolesFeedback({ type: 'error', message: 'Name and Email are required.' });
      return;
    }

    setIsAddingMember(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const roleToAssign = newMemberRole;
    const currentDate = new Date().toISOString().split('T')[0];

    const updatedMembers = teamMembers.map(member => {
      // If a member has the same role and is currently 'Current', mark them as 'Past'
      if (member.role === roleToAssign && member.activeStatus === 'Current') {
        return {
          ...member,
          activeStatus: 'Past',
          endDate: currentDate,
        };
      }
      return member;
    });

    const newId = `temp-${Date.now()}`;
    const newMember = {
      id: newId,
      name: newMemberName,
      email: newMemberEmail,
      role: roleToAssign,
      activeStatus: 'Current',
      startDate: currentDate,
      profilePic: newMemberProfilePic || '/Images/placeholder-avatar.png',
      skills: newMemberSkills,
      experience: newMemberExperience,
    };

    setTeamMembers([...updatedMembers, newMember]);
    setAssignRolesFeedback({ type: 'success', message: `Successfully assigned ${newMemberName} as the current ${roleToAssign}.` });

    setNewMemberName('');
    setNewMemberEmail('');
    setNewMemberRole('Rule Developer');
    setNewMemberSkills('');
    setNewMemberExperience('');
    setNewMemberProfilePic('');
    setIsAddingMember(false);
  };

  // function to calculate the work duration of past and current members
  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return "N/A";
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
        return `${diffDays} days`;
    }
    
    const diffMonths = Math.floor(diffDays / 30.44);
    if (diffMonths < 12) {
        return `${diffMonths} months`;
    }
    
    const diffYears = Math.floor(diffMonths / 12);
    const remainingMonths = diffMonths % 12;
    
    if (diffYears > 0 && remainingMonths > 0) {
        return `${diffYears}yr ${remainingMonths}mo`;
    } else if (diffYears > 0) {
        return `${diffYears} years`;
    } else {
        return `${diffMonths} months`;
    }
  };

  // --- Terms and Agreements Tab Content ---
  const employmentTerms = `
        This Employment Agreement ("Agreement") is made effective as of the date of the Employee’s commencement of employment, by and between Zypher Inc. ("the Company") and [Employee Name] ("the Employee").

            1. Position and Duties
            The Employee is employed in the position of Rule Maintainer. The Employee shall report to the Manager of Rule Governance and perform all duties as assigned by the Company. These duties include, but are not limited to:

            Overseeing the full lifecycle of custom rule development, from inception to deployment.

            Reviewing and validating rule requests and specifications.

            Assigning tasks to Rule Developers and Rule Implementors.

            Ensuring the quality, integrity, and security of all rules within the system.

            Maintaining detailed documentation for all rules and related processes.

            Collaborating with other teams to ensure rules align with business and security objectives.

            2. Employment Relationship
            The Employee's employment with the Company is on an "at-will" basis. This means that either the Employee or the Company may terminate the employment relationship at any time, for any reason, with or without cause, and with or without notice.

            3. Compensation and Benefits
            a. Compensation: The Employee's gross salary shall be [Your Salary/Hourly Rate], paid in accordance with the Company’s regular payroll schedule.
            b. Benefits: The Employee will be eligible for standard Company benefits, which may include health insurance, paid time off (PTO), and other benefits, as per the current Company policy and subject to any eligibility requirements. The Company reserves the right to modify or terminate benefit plans at its sole discretion.

            4. Confidentiality
            The Employee acknowledges that during the course of employment, they will have access to and be entrusted with confidential and proprietary information ("Confidential Information") of the Company. This includes, but is not limited to:

            Trade secrets, patents, copyrights, and business strategies.

            Financial information, business plans, and marketing materials.

            Client lists, client data, and vendor information.

            All technical and non-technical information related to the Company’s products, software, and services.

            The Employee agrees to hold all Confidential Information in strict confidence and will not, at any time during or after their employment, directly or indirectly, use, disclose, or disseminate any Confidential Information to any third party without the express written consent of the Company.

            5. Intellectual Property
            The Employee agrees that all work product, including but not limited to any inventions, discoveries, designs, software, code, and improvements ("Inventions") that the Employee may conceive, create, or develop, either alone or with others, during the course of their employment and that relate to the Company’s business, shall be the sole property of the Company. The Employee agrees to assign all rights, title, and interest in such Inventions to the Company.

            6. Non-Solicitation
            During the term of employment and for a period of [e.g., twelve (12)] months following the termination of employment, the Employee agrees not to solicit, directly or indirectly, any employees, clients, or business partners of the Company to leave their employment or business relationship with the Company.

            7. Governing Law
            This Agreement shall be governed by and construed in accordance with the laws of the State of [Your State/Jurisdiction], without regard to its conflict of laws principles.

            8. Entire Agreement
            This Agreement, along with any documents or policies referenced herein, constitutes the entire understanding and agreement between the parties with respect to the subject matter hereof and supersedes all prior and contemporaneous agreements, negotiations, and discussions.

            By accepting and continuing your employment with Zypher Inc., you acknowledge and agree to these terms.
    `;
    
    const inputStyle = "w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] focus:border-transparent transition-all duration-200 shadow-inner";

  return (
    <div className={`p-6 md:p-8 lg:p-10 ${lexend.className} animate-fadeInUp min-h-screen`}>
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[var(--foreground)]">Maintainer Settings</h1>

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
          onClick={() => setActiveTab('assign-roles')}
          className={clsx(
            "flex items-center gap-2 px-6 py-3 rounded-lg text-lg font-medium transition-all duration-300",
            activeTab === 'assign-roles'
              ? "bg-[var(--brand-yellow)] text-[var(--background)] shadow-lg"
              : "text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
          )}
        >
          <Users size={20} /> Assign Roles
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
            <form onSubmit={(e) => { e.preventDefault(); handleProfileSave(e); }} className="space-y-6 mb-10">
              {/* Profile Picture and Name/Email Section */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[var(--brand-yellow)] flex-shrink-0">
                  <Image src={maintainerProfilePic} alt="Maintainer Avatar" width={96} height={96} className="w-full h-full object-cover" />
                  <label htmlFor="profile-pic-upload" className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                    <ImageIcon size={24} className="text-white" />
                    <input id="profile-pic-upload" type="file" accept="image/*" onChange={(e) => handleProfilePicChange(e)} className="hidden" />
                  </label>
                </div>
                <div className="flex-grow space-y-4 w-full">
                  <div><label htmlFor="maintainer-name" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Name</label><input type="text" id="maintainer-name" value={maintainerName} onChange={(e) => setMaintainerName(e.target.value)} className={inputStyle} /></div>
                  <div><label htmlFor="maintainer-email" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email</label><input type="email" id="maintainer-email" value={maintainerEmail} disabled className={clsx(inputStyle, "cursor-not-allowed text-[var(--text-secondary)]")} /></div>
                </div>
              </div>
              {accountFeedback && (
                <div className={clsx("p-3 rounded-lg text-sm flex items-center gap-2", accountFeedback.type === 'success' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400')}>
                  {accountFeedback.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                  <span>{accountFeedback.message}</span>
                </div>
              )}
              <div className="flex justify-end">
                <button type="submit" className="inline-flex items-center gap-2 bg-[var(--brand-yellow)] text-[var(--background)] font-bold px-6 py-3 rounded-full hover:brightness-110 shadow-md transition-all duration-300 text-base" disabled={isSavingAccount}>
                  {isSavingAccount ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />} Save Changes
                </button>
              </div>
            </form>
            <div className="border-t border-[var(--border-input)] pt-10">
              <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">Change Password</h2>
              <form onSubmit={(e) => { e.preventDefault(); handleChangePassword(e); }} className="space-y-6">
                <div><label htmlFor="current-password" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Current Password</label><input type="password" id="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputStyle} required /></div>
                <div><label htmlFor="new-password" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">New Password</label><input type="password" id="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputStyle} required /></div>
                <div><label htmlFor="confirm-new-password" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Confirm New Password</label><input type="password" id="confirm-new-password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className={inputStyle} required /></div>
                <div className="flex justify-end">
                  <button type="submit" className="inline-flex items-center gap-2 bg-[var(--brand-yellow)] text-[var(--background)] font-bold px-6 py-3 rounded-full hover:brightness-110 shadow-md transition-all duration-300 text-base" disabled={isSavingAccount}>
                    {isSavingAccount ? <Loader2 size={20} className="animate-spin" /> : <KeyRound size={20} />} Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assign Roles Tab Content */}
        {activeTab === 'assign-roles' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">Assign Roles and Manage Team</h2>
            
            <div className="bg-[var(--background)] p-8 rounded-xl shadow-lg border border-[var(--border-input)] mb-10">
              <h3 className="text-xl font-semibold text-[var(--brand-yellow)] mb-6 flex items-center gap-3">
                <UserPlus size={24} /> Onboard New Member
              </h3>
              <form onSubmit={handleAddTeamMember} className="space-y-6">
                
                {/* Profile Details (Name, Email, Role, Profile Pic) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label htmlFor="new-member-name" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Name</label>
                    <input type="text" id="new-member-name" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} placeholder="Full Name" className={inputStyle} required disabled={isAddingMember} />
                  </div>
                  <div>
                    <label htmlFor="new-member-email" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Email</label>
                    <input type="email" id="new-member-email" value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} placeholder="Email Address" className={inputStyle} required disabled={isAddingMember} />
                  </div>
                  <div>
                    <label htmlFor="new-member-role" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Role to Assign</label>
                    <div className="relative">
                      <select id="new-member-role" value={newMemberRole} onChange={(e) => setNewMemberRole(e.target.value)} className={clsx(inputStyle, "appearance-none pr-8")} disabled={isAddingMember}>
                        <option value="Rule Developer">Rule Developer</option>
                        <option value="Rule Implementor">Rule Implementor</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[var(--text-secondary)]"><svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z"/></svg></div>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="new-member-pic" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Profile Pic URL</label>
                    <input type="url" id="new-member-pic" value={newMemberProfilePic} onChange={(e) => setNewMemberProfilePic(e.target.value)} placeholder="Paste URL" className={inputStyle} disabled={isAddingMember} />
                  </div>
                </div>

                {/* Skills and Experience*/}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="new-member-skills" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Skills (Comma separated)</label>
                    <textarea id="new-member-skills" value={newMemberSkills} onChange={(e) => setNewMemberSkills(e.target.value)} rows="4" placeholder="Python, Golang, Regex, AWS..." className={clsx(inputStyle, "resize-y")} disabled={isAddingMember}></textarea>
                  </div>
                  <div>
                    <label htmlFor="new-member-experience" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Experience Summary</label>
                    <textarea id="new-member-experience" value={newMemberExperience} onChange={(e) => setNewMemberExperience(e.target.value)} rows="4" placeholder="Brief summary of professional experience..." className={clsx(inputStyle, "resize-y")} disabled={isAddingMember}></textarea>
                  </div>
                </div>

                {/* Feedback and Submit Button */}
                {assignRolesFeedback && (
                  <div className={clsx(
                    "p-4 rounded-lg text-sm flex items-center gap-3",
                    assignRolesFeedback.type === 'success' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
                  )}>
                    {assignRolesFeedback.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                    <span className="font-medium">{assignRolesFeedback.message}</span>
                  </div>
                )}
                <div className="flex justify-end">
                  <button type="submit" className="inline-flex items-center gap-3 bg-[var(--brand-yellow)] text-[var(--background)] font-bold px-8 py-3 rounded-full hover:brightness-110 transition-all duration-300 shadow-xl text-base" disabled={isAddingMember}>
                    {isAddingMember ? <Loader2 size={20} className="animate-spin" /> : <UserPlus size={20} />} Add Member
                  </button>
                </div>
              </form>
            </div>

            {/* Table of Roles (Role History) */}
            <h3 className="text-xl font-semibold text-[var(--foreground)] mb-6 flex items-center gap-3">
              <Briefcase size={24} /> Role History
            </h3>
            <div className="overflow-x-auto bg-[var(--background)] rounded-xl shadow-lg border border-[var(--border-input)]">
              <table className="min-w-full divide-y divide-[var(--border-input)]">
                <thead className="bg-[var(--hover-bg)]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Active Time</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-input)]">
                  {teamMembers.map((member) => (
                    <tr 
                      key={member.id} 
                      onClick={() => openMemberModal(member)}
                      className="hover:bg-[var(--hover-bg)] transition-colors duration-200 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Image src={member.profilePic || '/Images/placeholder-avatar.png'} alt={member.name} width={40} height={40} className="rounded-full object-cover border-2 border-[var(--brand-yellow)]" />
                          <div className="text-sm font-medium text-[var(--foreground)]">{member.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--brand-yellow)] font-medium">
                        {member.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={clsx(
                          "px-3 py-1 rounded-full text-xs font-semibold",
                          member.activeStatus === 'Current' ? 'bg-green-600/20 text-green-400' : 'bg-blue-600/20 text-blue-400'
                        )}>
                          {member.activeStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                        {calculateDuration(member.startDate, member.endDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="text-[var(--brand-yellow)] hover:underline flex items-center gap-1">
                          View Profile <ArrowRight size={14} />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Terms and Agreements Tab Content */}
        {activeTab === 'terms-agreements' && (
          <div className="space-y-10">
            <div>
              <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">Employment Terms with Zypher</h2>
              <div className="bg-[var(--background)] p-6 rounded-lg border border-[var(--border-input)] shadow-md max-h-96 overflow-y-auto custom-scrollbar text-[var(--foreground)]">
                <p className="whitespace-pre-line text-sm text-[var(--text-secondary)]">
                  {employmentTerms}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Member Details Modal */}
      {showMemberModal && selectedMember && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-70 flex justify-center items-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[var(--input-bg)] rounded-xl shadow-2xl border border-[var(--border-input)] p-8 w-full max-w-3xl transform transition-all duration-300 scale-100 animate-slideUp">
            <div className="flex justify-between items-center mb-6 border-b border-[var(--border-input)] pb-4">
              <h3 className="text-3xl font-bold text-[var(--foreground)] flex items-center gap-3">
                <User size={30} /> {selectedMember.name}
              </h3>
              <button onClick={closeMemberModal} className="text-[var(--text-secondary)] hover:text-[var(--brand-yellow)] transition-colors">
                <X size={28} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1 flex flex-col items-center space-y-6 p-4 rounded-lg bg-[var(--background)] border border-[var(--border-input)] shadow-inner">
                <Image
                  src={selectedMember.profilePic || '/Images/placeholder-avatar.png'}
                  alt={selectedMember.name}
                  width={150}
                  height={150}
                  className="rounded-full object-cover border-4 border-[var(--brand-yellow)] shadow-lg"
                />
                <div className="text-center w-full">
                  <p className="text-2xl font-bold text-[var(--foreground)]">{selectedMember.role}</p>
                  <p className="text-sm text-[var(--text-secondary)] flex items-center justify-center gap-2 mt-1">
                    <Mail size={16} /> {selectedMember.email}
                  </p>
                  <p className={clsx(
                    "mt-3 px-4 py-1 rounded-full text-xs font-semibold",
                    selectedMember.activeStatus === 'Current' ? 'bg-green-600/20 text-green-400' : 'bg-blue-600/20 text-blue-400'
                  )}>
                    {selectedMember.activeStatus}
                  </p>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    <span className="font-semibold text-[var(--foreground)]">Active Time:</span> {calculateDuration(selectedMember.startDate, selectedMember.endDate)}
                  </p>
                </div>
              </div>

              <div className="md:col-span-2 space-y-6">
                <div className="bg-[var(--background)] p-6 rounded-lg border border-[var(--border-input)] shadow-inner">
                  <h4 className="text-xl font-semibold text-[var(--brand-yellow)] mb-3 flex items-center gap-2">
                    <Info size={20} /> Skills
                  </h4>
                  <p className="text-[var(--foreground)] whitespace-pre-line leading-relaxed">{selectedMember.skills}</p>
                </div>
                
                <div className="bg-[var(--background)] p-6 rounded-lg border border-[var(--border-input)] shadow-inner">
                  <h4 className="text-xl font-semibold text-[var(--brand-yellow)] mb-3 flex items-center gap-2">
                    <Briefcase size={20} /> Experience Summary
                  </h4>
                  <p className="text-[var(--foreground)] whitespace-pre-line leading-relaxed">{selectedMember.experience}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}