<template>
  <div class="legal">
    <PublicHeader />

    <main id="main" class="pub-main">
      <header class="pub-pagehead">
        <div class="pub-container pub-container--narrow pub-pagehead__inner">
          <p class="pub-eyebrow">Policies</p>
          <h1 class="pub-display">Terms of Service</h1>
          <p class="pub-meta">
            Christ Apostolic Church International — Taifa Central Assembly (Miracle Centre)<br>
            Last updated September 2024
          </p>
        </div>
      </header>

      <div class="pub-container pub-container--narrow pub-prose">
        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you and Christ Apostolic Church International, Taifa Central Assembly (&ldquo;Church,&rdquo; &ldquo;we,&rdquo; or &ldquo;us&rdquo;) regarding your access to and use of the CACI Taifa mobile application, website, and digital member services (collectively, the &ldquo;Platform&rdquo;).
          </p>
          <p>
            By downloading, accessing, or using the Platform, or by clicking to register an account, you agree to comply with and be bound by these Terms and our <NuxtLink to="/privacypolicy">Privacy Policy</NuxtLink>. If you do not agree to these Terms, please do not use the Platform.
          </p>
        </section>

        <section>
          <h2>2. Member Accounts & Security</h2>
          <p>
            To access personalized church services—such as giving records, digital receipts, and member directories—you may be required to register a member account:
          </p>
          <ul>
            <li>You agree to provide accurate, current, and complete information during registration.</li>
            <li>You are responsible for safeguarding your login credentials and for all activities conducted under your account.</li>
            <li>You must immediately notify church administration if you suspect unauthorized access or any security breach.</li>
            <li>You may request deletion of your account at any time directly through the app or by submitting a request via our <NuxtLink to="/delete-account">Account Deletion Page</NuxtLink>.</li>
          </ul>
        </section>

        <section>
          <h2>3. Voluntary Tithes, Offerings & Digital Giving</h2>
          <p>
            The Platform enables members and well-wishers to give voluntary religious tithes, offerings, pledges, and welfare contributions digitally:
          </p>
          <ul>
            <li>
              <strong>Nature of Contributions:</strong> All funds contributed through the Platform constitute voluntary, freewill religious tithes and charitable donations to Christ Apostolic Church International - Taifa Central Assembly in support of ministry, missions, and welfare activities.
            </li>
            <li>
              <strong>Electronic Receipts:</strong> Upon successful transaction processing by third-party payment providers, an electronic donation receipt is generated and stored in your member dashboard for your personal recordkeeping.
            </li>
            <li>
              <strong>Refund Policy:</strong> Because donations are voluntary religious contributions that are deployed immediately for church operations and charity, donations are generally non-refundable. However, if an inadvertent technical duplicate transaction or demonstrable payment processing error occurs, please notify church administration at <a href="mailto:cactaifacentral@gmail.com">cactaifacentral@gmail.com</a> within 14 days of the transaction with proof of payment for investigation and resolution.
            </li>
          </ul>
        </section>

        <section>
          <h2>4. Code of Conduct & Acceptable Use</h2>
          <p>You agree to use the Platform in a manner consistent with Christian values and applicable laws. You must NOT:</p>
          <ul>
            <li>Use the Platform for any fraudulent, unlawful, or unauthorized purpose.</li>
            <li>Transmit any defamatory, offensive, harassing, obscene, or hateful content in prayer requests, comments, or public forums.</li>
            <li>Interfere with, disrupt, or attempt to compromise the integrity, security, or availability of the Platform and its servers.</li>
            <li>Harvest or scrape personal contact details of church members for commercial or unsolicited advertising purposes.</li>
          </ul>
        </section>

        <section>
          <h2>5. Intellectual Property</h2>
          <p>
            All content on the Platform—including sermons, text, audio recordings, video broadcasts, church logos, graphics, hymns, and custom software code—is the property of Christ Apostolic Church International and protected by applicable copyright and intellectual property laws. You are granted a personal, non-exclusive, non-transferable license to stream, read, and listen for non-commercial personal spiritual enrichment.
          </p>
        </section>

        <section>
          <h2>6. Disclaimer of Warranties & Limitation of Liability</h2>
          <p>
            The Platform is provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis. While we strive to maintain uninterrupted access and accurate records, the Church does not guarantee that the services will be completely error-free or uninterrupted. To the maximum extent permitted by law, Christ Apostolic Church International shall not be liable for any indirect, incidental, or consequential damages arising from your use or inability to use the Platform.
          </p>
        </section>

        <section>
          <h2>7. Governing Law</h2>
          <p>
            These Terms of Service and any disputes arising out of or related to the Platform shall be governed by and construed in accordance with the laws of the <strong>Republic of Ghana</strong>, without regard to conflict of law principles.
          </p>
        </section>

        <section>
          <h2>8. Contact Information</h2>
          <p>For questions or inquiries regarding these Terms of Service, please contact:</p>
          <div class="contact-box">
            <strong>Christ Apostolic Church International</strong><br />
            <strong>Taifa Central Assembly (Miracle Centre)</strong><br />
            Loquat Street, Taifa Central, Accra, Ghana<br />
            Telephone: <a href="tel:+233242969760">+233 24 296 9760</a> / <a href="tel:+233596270150">+233 59 627 0150</a><br />
            Email: <a href="mailto:cactaifacentral@gmail.com">cactaifacentral@gmail.com</a>
          </div>
        </section>
      </div>
    </main>

    <PublicFooter />
  </div>
</template>

<script>
export default {
  // Public site, not the admin app: no AppShell, so a signed-in visitor
  // does not get the admin sidebar stacked above this page's own header.
  layout: 'public',
  auth: false,
  name: 'TermsOfServicePage',
  head() {
    return {
      title: 'Terms of Service (EULA) | Christ Apostolic Church Int. - Taifa Central',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: 'Terms of Service and End User License Agreement (EULA) for the Christ Apostolic Church International Taifa Central mobile application and member portal.'
        }
      ]
    }
  }
}
</script>
