export const metadata = { title: "Privacy Policy — NutriSafe" };

export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p className="legal-updated">Last updated: August 2026</p>

      <p>
        NutriSafe handles health-adjacent personal information — your medical conditions,
        allergies, and what you eat. We're specific below about exactly what we collect, why, and
        who it's shared with, rather than generic boilerplate, because for a health app that
        specificity is the point.
      </p>

      <h2>1. What we collect</h2>
      <h3>Account information</h3>
      <ul>
        <li>Email address, and a hashed password if you sign up with email (we never store your actual password — it's one-way hashed with bcrypt).</li>
        <li>Name and profile image, if you sign in with Google.</li>
      </ul>

      <h3>Health profile</h3>
      <p>Entirely optional but required for personalized results: age, gender, medical conditions, allergies, dietary preference (veg/non-veg/vegan), preferred language, and any additional notes you add.</p>

      <h3>Scan activity</h3>
      <ul>
        <li>Product names, ingredient lists, barcodes, and the AI-generated verdict, explanation, and recommendations for each scan.</li>
        <li>Label photos you upload are sent to our AI vision provider for text extraction (see below) — we do not currently keep a permanent copy of the uploaded image itself, only the extracted ingredient text and analysis result.</li>
      </ul>

      <h3>AI chat</h3>
      <p>
        Messages and any images you send to the Health AI chat are processed by our AI provider to
        generate a response, using your health profile as context. Chat conversations are not
        currently saved to a persistent chat history on our servers beyond the current session in
        your browser.
      </p>

      <h3>Diet plans</h3>
      <p>The height/weight/goal details you submit to generate a plan, and the plans you choose to save.</p>

      <h3>Payment information</h3>
      <p>
        Handled by Razorpay, our payment processor — we receive confirmation of a successful
        payment and an order reference, not your full card or bank details.
      </p>

      <h3>Usage data</h3>
      <p>A count of how many scans, chat messages, and diet plan generations you've used in the current day/month, to enforce the limits in our <a href="/legal/fair-usage">Fair Usage Policy</a>.</p>

      <h2>2. Who we share it with</h2>
      <p>We don't sell your data. We do send parts of it to the following providers, each doing a specific job:</p>
      <ul>
        <li><strong>AWS Bedrock (Amazon Web Services)</strong> — processes ingredient text, label photos, chat messages, and your health profile to generate AI analysis, OCR text extraction, and diet plans. This is the core of how the Service works.</li>
        <li><strong>MongoDB Atlas</strong> — hosts our database (all the data categories above).</li>
        <li><strong>Razorpay</strong> — processes Premium payments.</li>
        <li><strong>Google</strong> — if you sign in with Google, for authentication only.</li>
        <li><strong>Open Food Facts</strong> — a public, open barcode database we query with the barcode number you scan (not your personal information) to look up a product.</li>
        <li><strong>Serper</strong> — a search API we query with a barcode number (not your personal information) as a fallback when a product isn't in Open Food Facts.</li>
      </ul>
      <p>We don't share your health profile, scan history, or chat content with advertisers, data brokers, or anyone outside the providers listed above.</p>

      <h2>3. Why this matters more than usual: sensitive data</h2>
      <p>
        Medical conditions and allergies are sensitive personal data by most privacy laws'
        definitions, including India's Digital Personal Data Protection Act, 2023. We treat this
        data with the same care regardless of exactly which law applies to a given user — it's
        used only to personalize your analysis, never for advertising, and we don't share it
        beyond the providers above who need it to make the Service function.
      </p>

      <h2>4. How long we keep it</h2>
      <p>
        We keep your account and scan history for as long as your account is active, so your
        history and Safe Foods list stay useful over time. If you delete your account, we delete
        your personal data within a reasonable period, except where we're legally required to keep
        transaction records (for example, payment records for tax/accounting purposes).
      </p>

      <h2>5. Your rights</h2>
      <ul>
        <li><strong>Access</strong> — you can see your own profile, scan history, and saved plans directly in the app at any time.</li>
        <li><strong>Correction</strong> — edit your health profile anytime from your Profile page; it takes effect on your next scan.</li>
        <li><strong>Deletion</strong> — email <a href="mailto:support@nutrisafe.app">support@nutrisafe.app</a> to request deletion of your account and associated data. (There is currently no self-service "delete my account" button in the app — this is a manual request process today.)</li>
      </ul>

      <h2>6. Cookies and sessions</h2>
      <p>
        We use a session cookie to keep you signed in (via NextAuth.js). It's necessary for the
        Service to function and isn't used for cross-site advertising tracking.
      </p>

      <h2>7. Children's privacy</h2>
      <p>
        NutriSafe is not directed at children and we don't knowingly collect data from children
        under the age required for independent consent in their country. If you're entering
        information on behalf of a child (as their parent or guardian managing their allergy or
        condition profile), that use is on you as the account holder, not the child.
      </p>

      <h2>8. Security</h2>
      <p>
        Passwords are hashed, not stored in plain text. Data in transit is encrypted (HTTPS).
        Access to production systems is limited to those who need it to operate the Service. No
        system is perfectly secure, and we can't guarantee absolute security — but we treat this
        data with the seriousness its category warrants.
      </p>

      <h2>9. Changes to this policy</h2>
      <p>
        If we materially change what we collect or who we share it with, we'll update this page
        and the "Last updated" date above.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions, or a data request: <a href="mailto:support@nutrisafe.app">support@nutrisafe.app</a>{" "}
        (update this to your real support inbox before treating this page as final).
      </p>
    </>
  );
}
