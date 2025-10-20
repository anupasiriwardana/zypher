"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function TermsAgreement({ roleId }) {
  const { data: session } = useSession();
  const [role, setRole] = useState(null);
  const [startDate, setStartDate] = useState("");

  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchRole = async () => {
      try {
        // Fetch role details
        const res = await fetch(`/api/roles/${roleId}`);
        if (!res.ok) return;
        const data = await res.json();
        setRole(data);

        // Use user's createdAt as start date
        setStartDate(new Date(session.user.createdAt).toLocaleDateString());
      } catch (err) {
        console.error(err);
      }
    };

    fetchRole();
  }, [roleId, session?.user?.email, session?.user?.createdAt]);

  if (!role) return <p>Loading terms...</p>;

  // Build responsibilities list
  const responsibilitiesText = role.responsibilities.map(r => `- ${r}`).join("\n");

  // Terms template
  const employmentTerms = `
This Employment Agreement ("Agreement") is made effective as of ${startDate}, by and between Zypher Inc. ("the Company") and ${session.user.email} ("the Employee").

**1. Position and Duties:**
The Employee is employed in the position of ${role.title}. The Employee shall perform duties as reasonably assigned by the Company, including but not limited to:
${responsibilitiesText}

**2. Employment Relationship:**
The Employee's employment with the Company is on an "at-will" basis. This means that either the Employee or the Company may terminate the employment relationship at any time, for any reason, with or without cause, and with or without notice.

**3. Compensation and Benefits:**
a. Compensation: ${role.compensationInfo || "N/A"}
b. Benefits: ${role.benefits || "N/A"}

**4. Confidentiality:**
The Employee acknowledges that during the course of employment, they will have access to and be entrusted with confidential and proprietary information of the Company and agrees not to disclose it.

**5. Intellectual Property:**
All work product created by the Employee relating to the Company's business shall be the sole property of the Company.

**6. Non-Solicitation:**
During the term of employment and for a period of twelve (12) months following termination, the Employee agrees not to solicit Company employees, clients, or partners.

**7. Governing Law:**
This Agreement shall be governed by the laws of the State of [Your State/Jurisdiction].

**8. Entire Agreement:**
This Agreement constitutes the entire understanding and supersedes all prior agreements.

By accepting and continuing your employment with Zypher Inc., you acknowledge and agree to these terms.
`;

  return (
    <div className="bg-[var(--input-bg)] p-6 rounded-lg border border-[var(--border-input)] shadow-md max-h-96 overflow-y-auto custom-scrollbar text-[var(--foreground)]">
      <pre className="whitespace-pre-wrap text-sm">{employmentTerms}</pre>
    </div>
  );
}
