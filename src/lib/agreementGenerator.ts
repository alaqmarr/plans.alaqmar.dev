interface PlanFeature {
  feature: {
    name: string;
    description?: string | null;
  };
  isIncluded: boolean;
}

interface Plan {
  name: string;
  description?: string | null;
  paymentTerms: string;
  tenureYears: number;
  features: PlanFeature[];
}

interface Client {
  name: string;
  email?: string | null;
}

export function generateAgreementText(
  client: Client,
  plan: Plan,
  offeredPrice: number,
  createdAt: Date,
  paymentStructureStr?: string | null,
): string {
  const startDate = createdAt;
  const firstViewingDate = new Date(startDate);
  firstViewingDate.setDate(firstViewingDate.getDate() + 21); // 3 weeks

  const completionDate = new Date(startDate);
  completionDate.setDate(completionDate.getDate() + 28); // 4 weeks

  const fmtDate = (d: Date) => {
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatINR = (n: number) =>
    `INR ${n.toLocaleString("en-IN")} (${numberToWords(n)} Rupees only)`;

  // Parse payment terms
  let milestones: { name: string; amount: number }[] = [];
  try {
    if (paymentStructureStr) {
      milestones = JSON.parse(paymentStructureStr);
    } else {
      milestones = [{ name: "Full Payment", amount: offeredPrice }];
    }
  } catch {
    milestones = [{ name: "Full Payment", amount: offeredPrice }];
  }

  const includedFeatures = plan.features
    .filter((f) => f.isIncluded)
    .map((f) => f.feature.name);

  const milestoneLines = milestones
    .map((m, i) => `   ${i + 1}. ${m.name} — ${formatINR(m.amount)}`)
    .join("\n");

  const featureLines = includedFeatures.map((f) => `   • ${f}`).join("\n");

  return `SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into as of ${fmtDate(startDate)}, between:

SERVICE PROVIDER:
   The Web Sensei
   Secunderabad 500015, Telangana, India
   Email: info@alaqmar.dev
   Website: https://alaqmar.dev
   Phone: +91 96184 43558

CLIENT:
   ${client.name.toUpperCase()}${client.email ? `\n   Email: ${client.email}` : ""}

(Collectively referred to as the "Parties")

────────────────────────────────────────────────────────────

1. SCOPE OF WORK

The Service Provider agrees to design, develop, and deliver a professional website under the "${plan.name}" package. The scope of work includes the following features and deliverables:

${featureLines || "   • As agreed between the parties"}

Any work outside this scope will require a separate written agreement and may attract additional charges.

────────────────────────────────────────────────────────────

2. PROJECT TIMELINE

   • Agreement Date:    ${fmtDate(startDate)}
   • First View Date:   ${fmtDate(firstViewingDate)} (3 weeks from agreement date)
   • Target Completion: ${fmtDate(completionDate)} (4 weeks from agreement date)

The client's first version viewing date shall be 3 weeks from the date of the contract, and the 4th week will be allocated for client changes. 

If any major changes are requested, the time required must be informed prior, which will not be compensated regarding the timeline. If a delay is caused from the Client's side, there will be no compensation in the timeline. However, there will be compensation from the Service Provider's end if the Service Provider is unable to meet the agreed deadline.

────────────────────────────────────────────────────────────

3. PAYMENT TERMS

The total agreed contract value is ${formatINR(offeredPrice)}.

Payment shall be made in the following installments based on project milestones:

${milestoneLines}

   • All payments are due immediately upon reaching the respective milestone.
   • Payments shall be made via UPI or bank transfer to the details provided by the Service Provider.
   • Work will commence on each new phase only upon confirmation of the preceding milestone payment.
   • The Service Provider reserves the right to request payment in advance if any third-party conditions or tools being used are affecting the pricing of the services.
   • In the event of non-payment within 7 days of a milestone, the Service Provider reserves the right to pause all work until the outstanding amount is settled.

────────────────────────────────────────────────────────────

4. INTELLECTUAL PROPERTY

Upon receipt of the final payment in full:

   (a) All design assets, code, and deliverables created specifically for this project shall become the exclusive property of the Client.
   (b) The Service Provider retains the right to display the completed work in their portfolio and marketing materials, unless the Client requests otherwise in writing.
   (c) Any third-party libraries, frameworks, or tools used in the project remain subject to their respective open-source or commercial licenses.

────────────────────────────────────────────────────────────

5. REVISIONS & CHANGE REQUESTS

   • Up to 20 rounds of revisions are included within the agreed scope during the 4th week.
   • Major changes or additional revision rounds outside the scope will be quoted separately if any third party service is involved. The time taken for these major changes will not be compensated and shall be informed prior to the commencement of the changes.

────────────────────────────────────────────────────────────

6. CONFIDENTIALITY

Both Parties agree to:

   (a) Maintain strict confidentiality of all proprietary information, business data, and trade secrets shared during the course of this engagement.
   (b) Not disclose any such information to third parties without prior written consent.
   (c) This obligation survives the termination of this Agreement for a period of 2 years.

────────────────────────────────────────────────────────────

7. TERMINATION AND CANCELLATION

   (a) Either Party may terminate this Agreement with written notice of 7 days.
   (b) If the Agreement is cancelled for any reason, there will be absolutely no refunds for payments already made.
   (c) In the event of termination by the Client after work has commenced, the Client shall pay for all work completed up to the date of termination, calculated on a pro-rata basis.
   (d) Termination does not affect any rights or obligations that have already accrued.

────────────────────────────────────────────────────────────

8. LIMITATION OF LIABILITY

The Service Provider's maximum liability under this Agreement shall be limited to the total amount paid by the Client under this Agreement. The Service Provider shall not be liable for any indirect, incidental, or consequential damages.

────────────────────────────────────────────────────────────

9. DISPUTE RESOLUTION

In the event of any dispute arising from this Agreement, the Parties shall first attempt to resolve the matter amicably through good-faith negotiations within 15 days.

If a resolution cannot be reached, the matter shall be referred to binding arbitration under the Arbitration and Conciliation Act, 1996, with the seat of arbitration in Secunderabad, Telangana, India.

────────────────────────────────────────────────────────────

10. GOVERNING LAW

This Agreement shall be governed by and construed in accordance with the laws of India. Any legal proceedings shall be subject to the exclusive jurisdiction of the courts of Secunderabad, Telangana.

────────────────────────────────────────────────────────────

11. ENTIRE AGREEMENT

This Agreement constitutes the entire understanding between the Parties with respect to its subject matter and supersedes all prior discussions, representations, and agreements. Any amendments must be made in writing and signed by both Parties.

────────────────────────────────────────────────────────────

By signing below, both Parties acknowledge that they have read, understood, and agreed to all terms and conditions set forth in this Agreement.`;
}

// Simple number-to-words for INR amounts
function numberToWords(n: number): string {
  if (n === 0) return "Zero";
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const convert = (num: number): string => {
    if (num === 0) return "";
    if (num < 20) return ones[num] + " ";
    if (num < 100)
      return tens[Math.floor(num / 10)] + " " + ones[num % 10] + " ";
    if (num < 1000)
      return ones[Math.floor(num / 100)] + " Hundred " + convert(num % 100);
    if (num < 100000)
      return (
        convert(Math.floor(num / 1000)) + "Thousand " + convert(num % 1000)
      );
    if (num < 10000000)
      return (
        convert(Math.floor(num / 100000)) + "Lakh " + convert(num % 100000)
      );
    return (
      convert(Math.floor(num / 10000000)) + "Crore " + convert(num % 10000000)
    );
  };

  return convert(n).trim();
}
