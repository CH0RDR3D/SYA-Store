import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | SYA Store",
  description:
    "How SYA General Dealers Ltd. collects, uses, shares, and protects personal information on SYA Store.",
}

const effectiveDate = "8 November 2026"

const privacySections = [
  {
    title: "1. Who we are",
    paragraphs: [
      "This Privacy Policy explains how SYA General Dealers Ltd., operating as SYA Store, handles personal information through our website and services in Zambia.",
      "Our registered location is Plot No. 430B Lamasat Complex 2, Makeni-Bonaventure, Linda Road, Lusaka, Zambia. For privacy requests, email info@syastore.com, syageneraldealers@outlook.com, or s.y.a.generaldealers@gmail.com.",
    ],
  },
  {
    title: "2. Information we collect",
    paragraphs: [
      "We may collect your name, email address, phone number, delivery and billing addresses, account credentials, order history, payment status, and customer-support communications.",
      "When you sign in with Google, we receive the profile information Google makes available to us, such as your name, email address, and profile identifier, subject to the permissions you approve.",
      "We may automatically collect device and usage information, IP address, approximate location, browser and operating system details, page interactions, cookies, and security logs.",
    ],
  },
  {
    title: "3. How we use information",
    paragraphs: [
      "We use personal information to create and manage accounts, process orders and payments, provide delivery and collection services, answer requests, prevent fraud, improve the website, and comply with legal obligations.",
      "With your consent where required, we may use your email address or phone number to send service messages, promotional offers, newsletters, or SMS updates. Transactional messages necessary for an order or account may still be sent without marketing consent.",
    ],
  },
  {
    title: "4. Services we use",
    paragraphs: [
      "Our website may use Google Sign-In, Google Maps, Lenco payment services, Resend for transactional email, Twilio for SMS, analytics tools, and newsletter services. These providers process information under their own terms and privacy policies to provide the relevant service to SYA Store.",
      "Payment card information is handled by the relevant payment provider. SYA Store does not use its website to store complete payment-card details.",
    ],
  },
  {
    title: "5. Cookies and analytics",
    paragraphs: [
      "We use necessary cookies to operate the store, maintain sessions and carts, remember preferences, protect against abuse, and support checkout. We may also use analytics and advertising cookies to understand website performance and measure campaigns.",
      "You can control cookies through your browser settings. Blocking necessary cookies may prevent parts of the website from working correctly.",
    ],
  },
  {
    title: "6. Sharing information",
    paragraphs: [
      "We may share information with payment providers, courier and delivery partners, email and SMS providers, analytics providers, hosting services, professional advisers, and authorities when required by law.",
      "We do not sell personal information. Providers may receive only the information needed to perform their services for SYA Store.",
    ],
  },
  {
    title: "7. Children and minors",
    paragraphs: [
      "The website is intended for users aged 13 and over. Users under 18 should use it only with the permission and supervision of a parent or legal guardian.",
      "If we learn that personal information was provided by a child without appropriate permission, we will take reasonable steps to review and delete it or obtain the required permission, subject to applicable law.",
    ],
  },
  {
    title: "8. Retention and security",
    paragraphs: [
      "We retain personal information for as long as needed for accounts, transactions, customer support, fraud prevention, legal records, and other legitimate business purposes. Retention periods vary according to the type of information and applicable requirements.",
      "We use reasonable technical and organizational safeguards, but no internet service or electronic storage can be guaranteed to be completely secure.",
    ],
  },
  {
    title: "9. Your choices and rights",
    paragraphs: [
      "Subject to applicable law, you may ask to access, correct, delete, restrict, or receive a copy of your personal information, or object to certain uses. You may also withdraw marketing consent at any time.",
      "To exercise a request or report a concern, contact us using the contact details above. We may need to verify your identity and may decline requests where an exemption applies.",
    ],
  },
  {
    title: "10. Changes to this policy",
    paragraphs: [
      "We may update this policy when our services, providers, or legal obligations change. The effective date at the top will indicate the latest revision. Significant changes may be communicated through the website or account notices.",
    ],
  },
]

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-base)] py-10 sm:py-14">
      <article className="content-container mx-auto max-w-4xl px-4 sm:px-6">
        <header className="border-b border-[var(--surface-border)] pb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-500">
            SYA General Dealers Ltd.
          </p>
          <h1 className="mt-3 text-3xl font-black text-[var(--text-primary)] sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">
            How SYA Store collects and uses information when you visit, create an account, shop, or contact us.
          </p>
          <p className="mt-4 text-xs text-[var(--text-muted)]">
            Effective date: {effectiveDate}
          </p>
        </header>

        <div className="divide-y divide-[var(--surface-border)]">
          {privacySections.map((section) => (
            <section key={section.title} className="py-6">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                {section.title}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-3 text-sm leading-7 text-[var(--text-secondary)]"
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </article>
    </main>
  )
}
