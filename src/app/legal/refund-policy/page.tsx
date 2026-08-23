export const metadata = { title: "Refund Policy — NutriSafe" };

export default function RefundPolicyPage() {
  return (
    <>
      <h1>Refund Policy</h1>
      <p className="legal-updated">Last updated: August 2026</p>

      <p>
        This policy covers NutriSafe Premium: currently ₹500 per payment for 30 days of access to
        higher usage limits and the AI Diet &amp; Workout Plan generator, processed through
        Razorpay. Renewal today is manual — you return to the Premium page and pay again; it is
        not an automatic recurring charge yet. If that changes (true auto-renewing billing), this
        page will be updated first, and the new terms will apply only to purchases made after the
        change.
      </p>

      <h2>1. 7-day money-back guarantee</h2>
      <p>
        If you're not satisfied with Premium, you can request a full refund within{" "}
        <strong>7 days</strong> of your payment — no detailed justification required. Email{" "}
        <a href="mailto:support@nutrisafe.app">support@nutrisafe.app</a> with your account email
        and (if you have it) your Razorpay order ID.
      </p>

      <h2>2. How refunds are processed</h2>
      <ul>
        <li>Refunds are issued back to your original payment method via Razorpay.</li>
        <li>Processing typically takes 5–7 business days to reflect, depending on your bank or card issuer — this part is outside our control once we've approved the refund on our end.</li>
        <li>Once a refund is issued, your account's Premium access for that period is removed.</li>
      </ul>

      <h2>3. After the 7-day window</h2>
      <p>
        Since renewal is a manual, one-payment-at-a-time action rather than an automatic recurring
        charge, there's nothing to "cancel" beyond simply not paying again — your access runs for
        the 30 days you already paid for and then lapses on its own, no action needed. Refund
        requests made after the 7-day window on a given payment are considered case-by-case —
        reach out and explain your situation.
      </p>

      <h2>4. Failed or duplicate payments</h2>
      <p>
        If a payment was deducted but your account was never upgraded to Premium (a failed
        verification, a network error mid-checkout), or if you were charged twice for the same
        upgrade, email us with the details — this is fixed at no cost to you and isn't subject to
        the 7-day window, since it's our error to correct, not a change-of-mind refund.
      </p>

      <h2>5. Contact</h2>
      <p>
        <a href="mailto:support@nutrisafe.app">support@nutrisafe.app</a>{" "}
        (update this to your real support inbox before treating this page as final).
      </p>
    </>
  );
}
