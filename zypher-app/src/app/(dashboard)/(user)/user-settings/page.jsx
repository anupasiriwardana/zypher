"use client";

import { Lexend } from 'next/font/google';
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

import ProfileForm from "@/components/ProfileForm";
import PasswordForm from "@/components/PasswordForm";
import clsx from 'clsx';
import {
  User, CreditCard, Shield, 
  Mail, Lock, Image as ImageIcon, CheckCircle, XCircle, 
  DollarSign, Calendar, FileText, 
  ClipboardList, 
  Save, KeyRound, ArrowRight, Loader2 
} from 'lucide-react';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function UserSettingsPage() {
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


  // --- Billings Tab States & Dummy Data ---
  const currentPlan = {
    name: "Pro Plan",
    price: "$29.99/month",
    features: ["Unlimited Scans", "Advanced Rule Sets", "Priority Support"],
    nextBilling: "August 15, 2025",
  };

  const availablePlans = [
    {
      id: 'basic',
      name: 'Basic Plan',
      price: '$9.99/month',
      features: ['5 Scans/month', 'Standard Rule Sets', 'Email Support'],
      buttonText: 'Downgrade',
      buttonColor: 'text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-black'
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      price: '$49.99/month',
      features: ['Unlimited Scans', 'Custom Rule Development', 'Dedicated Support', 'API Access'],
      buttonText: 'Upgrade',
      buttonColor: 'text-green-400 border-green-400 hover:bg-green-400 hover:text-black'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Contact Us',
      features: ['Custom Solutions', 'On-premise Deployment', 'SLA', 'Dedicated Account Manager'],
      buttonText: 'Contact Sales',
      buttonColor: 'text-purple-400 border-purple-400 hover:bg-purple-400 hover:text-black'
    },
  ];

  const paymentHistory = [
    { date: "Jul 15, 2025", amount: "$29.99", plan: "Pro Plan", status: "Paid", invoice: "INV-001" },
    { date: "Jun 15, 2025", amount: "$29.99", plan: "Pro Plan", status: "Paid", invoice: "INV-002" },
    { date: "May 15, 2025", amount: "$29.99", plan: "Pro Plan", status: "Paid", invoice: "INV-003" },
    { date: "Apr 15, 2025", amount: "$29.99", plan: "Pro Plan", status: "Paid", invoice: "INV-004" },
  ];

  const handlePlanAction = (planId) => {
    alert(`Action for plan: ${planId}. (Simulated)`);
    // when backend connected, this function would handle plan changes
  };

  const handleViewInvoice = (invoiceId) => {
    alert(`Viewing invoice: ${invoiceId}. (Simulated)`);
    // when backend connected, this function would fetch and display invoice details
  };


  // --- Privacy Tab Content ---
  const termsAndConditions = `
    Welcome to Zypher! These terms and conditions outline the rules and regulations for the use of Zypher's Website and services.
    By accessing this website we assume you accept these terms and conditions in full. Do not continue to use Zypher's website if you do not accept all of the terms and conditions stated on this page.

    The following terminology applies to these Terms and Conditions, Privacy Statement and Disclaimer Notice and any or all Agreements: "Client", "You" and "Your" refers to you, the person accessing this website and accepting the Company's terms and conditions. "The Company", "Ourselves", "We", "Our" and "Us", refers to our Company. "Party", "Parties", or "Us", refers to both the Client and ourselves, or either the Client or ourselves. All terms refer to the offer, acceptance and consideration of payment necessary to undertake the process of our assistance to the Client in the most appropriate manner, whether by formal meetings of a fixed duration, or any other means, for the express purpose of meeting the Client's needs in respect of provision of the Company's stated services/products, in accordance with and subject to, prevailing law of [Your Country]. Any use of the above terminology or other words in the singular, plural, capitalization and/or he/she or they, are taken as interchangeable and therefore as referring to same.

    **Cookies**
    We employ the use of cookies. By using Zypher's website you consent to the use of cookies in accordance with Zypher's privacy policy. Most of the modern interactive web sites use cookies to enable us to retrieve user details for each visit. Cookies are used in some areas of our site to enable the functionality of this area and ease of use for those people visiting. Some of our affiliate / advertising partners may also use cookies.

    **License**
    Unless otherwise stated, Zypher and/or its licensors own the intellectual property rights for all material on Zypher. All intellectual property rights are reserved. You may view and/or print pages from https://www.zypher.com for your own personal use subject to restrictions set in these terms and conditions.

    You must not:
    * Republish material from https://www.zypher.com
    * Sell, rent or sub-license material from https://www.zypher.com
    * Reproduce, duplicate or copy material from https://www.zypher.com
    * Redistribute content from Zypher (unless content is specifically made for redistribution).

    **User Comments**
    1. This Agreement shall begin on the date hereof.
    2. Certain parts of this website offer the opportunity for users to post and exchange opinions, information, material and data ('Comments') in areas of the website. Zypher does not screen, edit, publish or review Comments prior to their appearance on the website and Comments do not reflect the views or opinions of Zypher, its agents or affiliates. Comments reflect the view and opinion of the person who posts such view or opinion. To the extent permitted by applicable laws Zypher shall not be responsible or liable for the Comments or for any loss cost, liability, damages or expenses caused and or suffered as a result of any use of and/or posting of and/or appearance of the Comments on this website.
    3. Zypher reserves the right to monitor all Comments and to remove any Comments which it considers in its absolute discretion to be inappropriate, offensive or otherwise in breach of these Terms and Conditions.
    4. You warrant and represent that:
        a. You are entitled to post the Comments on our website and have all necessary licenses and consents to do so;
        b. The Comments do not infringe any intellectual property right, including without limitation copyright, patent or trademark, or other proprietary right of any third party;
        c. The Comments do not contain any defamatory, libelous, offensive, indecent or otherwise unlawful material or material which is an invasion of privacy
        d. The Comments will not be used to solicit or promote business or custom or present commercial activities or unlawful activity.
    5. You hereby grant to Zypher a non-exclusive royalty-free license to use, reproduce, edit and authorize others to use, reproduce and edit any of your Comments in any and all forms, formats or media.

    **Disclaimer**
    To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our website and the use of this website (including, without limitation, any warranties implied by law in respect of satisfactory quality, fitness for purpose and/or the use of reasonable care and skill). Nothing in this disclaimer will:
    * limit or exclude our or your liability for death or personal injury resulting from negligence;
    * limit or exclude our or your liability for fraud or fraudulent misrepresentation;
    * limit any of our or your liabilities in any way that is not permitted under applicable law; or
    * exclude any of our or your liabilities that may not be excluded under applicable law.
    The limitations and exclusions of liability set out in this Section and elsewhere in this disclaimer: (a) are subject to the preceding paragraph; and (b) govern all liabilities arising under the disclaimer or in relation to the subject matter of this disclaimer, including liabilities arising in contract, in tort (including negligence) and for breach of statutory duty.
    To the extent that the website and the information and services on the website are provided free of charge, we will not be liable for any loss or damage of any nature.
    `;

  const privacyNotice = `
    At Zypher, accessible from www.zypher.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Zypher and how we use it.

    If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us.

    This Privacy Policy applies only to our online activities and is valid for visitors to our website with regards to the information that they shared and/or collect in Zypher. This policy is not applicable to any information collected offline or via channels other than this website.

    **Consent**
    By using our website, you hereby consent to our Privacy Policy and agree to its terms.

    **Information we collect**
    The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.
    If you contact us directly, we may receive additional information about you such as your name, email address, phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.
    When you register for an Account, we may ask for your contact information, including items such as name, company name, address, email address, and telephone number.

    **How we use your information**
    We use the information we collect in various ways, including to:
    * Provide, operate, and maintain our website
    * Improve, personalize, and expand our website
    * Understand and analyze how you use our website
    * Develop new products, services, features, and functionality
    * Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes
    * Send you emails
    * Find and prevent fraud

    **Log Files**
    Zypher follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services' analytics. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.

    **Cookies and Web Beacons**
    Like any other website, Zypher uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.

    **Advertising Partners Privacy Policies**
    You may consult this list to find the Privacy Policy for each of the advertising partners of Zypher.
    Third-party ad servers or ad networks uses technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on Zypher, which are sent directly to users' browser. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.
    Note that Zypher has no access to or control over these cookies that are used by third-party advertisers.

    **Third Party Privacy Policies**
    Zypher's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
    You can choose to disable cookies through your individual browser options. To know more detailed information about cookie management with specific web browsers, it can be found at the browsers' respective websites.

    **CCPA Privacy Rights (Do Not Sell My Personal Information)**
    Under the CCPA, among other rights, California consumers have the right to:
    * Request that a business that collects a consumer's personal data disclose the categories and specific pieces of personal data that a business has collected about consumers.
    * Request that a business delete any personal data about the consumer that a business has collected.
    * Request that a business that sells a consumer's personal data, not sell the consumer's personal data.
    If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us.

    **GDPR Data Protection Rights**
    We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:
    * The right to access – You have the right to request copies of your personal data. We may charge you a small fee for this service.
    * The right to rectification – You have the right to request that we correct any information you believe is inaccurate. You also have the right to request that we complete the information you believe is incomplete.
    * The right to erasure – You have the right to request that we erase your personal data, under certain conditions.
    * The right to restrict processing – You have the right to request that we restrict the processing of your personal data, under certain conditions.
    * The right to object to processing – You have the right to object to our processing of your personal data, under certain conditions.
    * The right to data portability – You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.
    If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us.

    **Children's Information**
    Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.
    Zypher does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.
    `;


  return (
    <div className={`p-6 md:p-8 lg:p-10 ${lexend.className} animate-fadeInUp min-h-screen`}>
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[var(--foreground)]">Settings</h1>

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
          onClick={() => setActiveTab('billings')}
          className={clsx(
            "flex items-center gap-2 px-6 py-3 rounded-lg text-lg font-medium transition-all duration-300",
            activeTab === 'billings'
              ? "bg-[var(--brand-yellow)] text-[var(--background)] shadow-lg"
              : "text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
          )}
        >
          <CreditCard size={20} /> Billings
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={clsx(
            "flex items-center gap-2 px-6 py-3 rounded-lg text-lg font-medium transition-all duration-300",
            activeTab === 'privacy'
              ? "bg-[var(--brand-yellow)] text-[var(--background)] shadow-lg"
              : "text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
          )}
        >
          <Shield size={20} /> Privacy
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-[var(--input-bg)] p-8 rounded-xl shadow-xl border border-[var(--border-input)] animate-fadeInUp">
        {/* Account Tab Content */}
        {activeTab === 'account' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">Basic Information</h2>
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

        {/* Billings Tab Content */}
        {activeTab === 'billings' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">Your Current Plan</h2>
            <div className="bg-[var(--background)] p-6 rounded-lg border border-[var(--border-input)] shadow-md mb-10">
              <h3 className="text-xl font-semibold text-[var(--brand-yellow)] mb-2">{currentPlan.name}</h3>
              <p className="text-lg text-[var(--foreground)] mb-3">{currentPlan.price}</p>
              <ul className="text-[var(--text-secondary)] mb-4 space-y-1">
                {currentPlan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-400" /> {feature}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
                <Calendar size={16} /> Next Billing: {currentPlan.nextBilling}
              </p>
              <div className="mt-6 flex justify-end">
                <button className="inline-flex items-center gap-2 border-2 border-[var(--brand-yellow)] text-[var(--brand-yellow)] px-6 py-3 rounded-full hover:bg-[var(--brand-yellow)] hover:text-[var(--background)] transition-all duration-300 text-base">
                  Change Plan <ArrowRight size={16} />
                </button>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">Explore Other Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {availablePlans.map((plan) => (
                <div key={plan.id} className="bg-[var(--background)] p-6 rounded-lg border border-[var(--border-input)] shadow-md flex flex-col">
                  <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">{plan.name}</h3>
                  <p className="text-lg font-bold text-[var(--brand-yellow)] mb-3">{plan.price}</p>
                  <ul className="text-[var(--text-secondary)] mb-6 space-y-1 flex-grow">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-400" /> {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handlePlanAction(plan.id)}
                    className={clsx(
                      "inline-flex items-center justify-center gap-2 border-2 px-6 py-3 rounded-full font-bold transition-all duration-300 text-base mt-auto",
                      plan.buttonColor
                    )}
                  >
                    {plan.buttonText} <ArrowRight size={16} />
                  </button>
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">Payment History</h2>
            <div className="overflow-x-auto bg-[var(--background)] rounded-xl shadow-md border border-[var(--border-input)]">
              <table className="min-w-full divide-y divide-[var(--border-input)]">
                <thead className="bg-[var(--hover-bg)]">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Plan</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-input)]">
                  {paymentHistory.map((item, index) => (
                    <tr key={index} className="hover:bg-[var(--hover-bg)] transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)]">{item.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)]">{item.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)]">{item.plan}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={clsx("px-2 inline-flex text-xs leading-5 font-semibold rounded-full", item.status === 'Paid' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400')}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewInvoice(item.invoice)}
                          className="text-[var(--brand-yellow)] hover:underline flex items-center gap-1"
                        >
                          <FileText size={14} /> {item.invoice}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Privacy Tab Content */}
        {activeTab === 'privacy' && (
          <div className="space-y-10">
            <div>
              <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">Terms and Conditions</h2>
              <div className="bg-[var(--background)] p-6 rounded-lg border border-[var(--border-input)] shadow-md max-h-96 overflow-y-auto custom-scrollbar text-[var(--foreground)]">
                <p className="whitespace-pre-line text-sm text-[var(--text-secondary)]">
                  {termsAndConditions}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">Privacy Notice</h2>
              <div className="bg-[var(--background)] p-6 rounded-lg border border-[var(--border-input)] shadow-md max-h-96 overflow-y-auto custom-scrollbar text-[var(--foreground)]">
                <p className="whitespace-pre-line text-sm text-[var(--text-secondary)]">
                  {privacyNotice}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}