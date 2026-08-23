export const metadata = { title: "Fair Usage Policy — NutriSafe" };

export default function FairUsagePage() {
  return (
    <>
      <h1>Fair Usage Policy</h1>
      <p className="legal-updated">Last updated: August 2026</p>

      <p>
        Every scan, chat message, and diet plan NutriSafe generates runs on a real AI model — it
        costs us real money every time, unlike a typical app feature that's nearly free to serve
        once it's built. This page explains, plainly, what the current limits are and why —
        exactly what's enforced in the app right now, not aspirational numbers.
      </p>

      <h2>1. Current limits</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "1.5rem" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
            <th style={{ padding: "8px 12px 8px 0" }}>Feature</th>
            <th style={{ padding: "8px 12px" }}>Free</th>
            <th style={{ padding: "8px 12px" }}>Premium</th>
            <th style={{ padding: "8px 0" }}>Resets</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
            <td style={{ padding: "8px 12px 8px 0" }}>Scans (barcode, photo, or manual)</td>
            <td style={{ padding: "8px 12px" }}>10 / day</td>
            <td style={{ padding: "8px 12px" }}>60 / day</td>
            <td style={{ padding: "8px 0" }}>Daily, midnight UTC</td>
          </tr>
          <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
            <td style={{ padding: "8px 12px 8px 0" }}>Health AI chat messages</td>
            <td style={{ padding: "8px 12px" }}>15 / day</td>
            <td style={{ padding: "8px 12px" }}>60 / day</td>
            <td style={{ padding: "8px 0" }}>Daily, midnight UTC</td>
          </tr>
          <tr>
            <td style={{ padding: "8px 12px 8px 0" }}>Diet &amp; Workout Plan generations</td>
            <td style={{ padding: "8px 12px" }}>Not available on Free</td>
            <td style={{ padding: "8px 12px" }}>10 / month</td>
            <td style={{ padding: "8px 0" }}>1st of each month</td>
          </tr>
        </tbody>
      </table>
      <p>
        You can see your own real-time usage against these limits any time on your{" "}
        <a href="/dashboard">Dashboard</a> or on the <a href="/scan">Scan page</a>.
      </p>

      <h2>2. What happens when you hit a limit</h2>
      <p>
        The action is blocked with a clear message telling you the limit and when it resets — you
        won't be charged or have a scan "wasted" silently; the request is rejected before any AI
        call is made. If you're on the Free plan, upgrading to Premium raises your limit
        immediately, no waiting for the reset.
      </p>

      <h2>3. Why limits exist at all</h2>
      <p>
        Honestly: an unlimited free AI feature isn't a business, it's a liability. Without any cap,
        a single account (or a script) could run up an unbounded bill with zero revenue attached.
        These limits exist to keep the Service around, not to nickel-and-dime normal use — the Free
        tier's limits are set well above what a typical person checking a few packaged foods a day
        would ever hit.
      </p>

      <h2>4. These numbers may change</h2>
      <p>
        These specific limits are a starting point, not permanent. As we learn the real cost of
        running the Service at scale, we may adjust them — always with this page updated first and
        never reduced retroactively for something you've already been told you have. If a limit
        changes materially, we'll aim to give existing users advance notice, not a silent cutoff.
      </p>

      <h2>5. What doesn't count against your limit</h2>
      <ul>
        <li>Viewing your existing scan history, saved diet plans, or Safe Foods list.</li>
        <li>Editing your health profile.</li>
        <li>A request that's rejected for being over the limit — you're not charged a "used" slot for something that never ran.</li>
      </ul>

      <h2>6. Abuse</h2>
      <p>
        Deliberately working around these limits (automated scripting, multiple accounts to reset a
        quota, etc.) is a violation of our <a href="/legal/terms">Terms of Service</a> and may
        result in account suspension.
      </p>

      <h2>7. Contact</h2>
      <p>
        Think a limit is wrong for a legitimate use case? Tell us:{" "}
        <a href="mailto:support@nutrisafe.app">support@nutrisafe.app</a>{" "}
        (update this to your real support inbox before treating this page as final).
      </p>
    </>
  );
}
