const WINDOWS_DOWNLOAD = "https://github.com/VenkataAnnabathula/fitness-tracker/releases/download/v0.4.0-beta/The-Caffeinate-0.4.0-windows-x64.exe";

const features = [
  { number: "01", title: "Edit text for free", copy: "Fix embedded PDF text, add notes, highlight details, whiteout content, and preview the finished result—without a watermark." },
  { number: "02", title: "Organize anything", copy: "Merge documents, split page ranges, rotate pages, remove what you do not need, and export a clean new copy." },
  { number: "03", title: "Extract for AI", copy: "Use private OCR to turn scanned documents into focused TXT or structured Markdown for search, notes, and AI workflows." },
  { number: "04", title: "Convert and compress", copy: "Convert images and PDF pages or shrink image-heavy documents, entirely on your computer." },
];

const privacyFacts = [
  ["No uploads", "Your documents are processed on your computer, not transferred to our servers."],
  ["No account", "Open the app and work. No sign-in, profile, or document history in the cloud."],
  ["No tracking", "No document analytics and no hidden file telemetry."],
  ["Fresh exports", "Your original stays untouched until you choose where to save a new copy."],
];

function BrandMark() {
  return <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>;
}

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function Home() {
  return <div className="site-shell">
    <header className="nav-wrap">
      <a className="wordmark" href="#top" aria-label="The Caffeinate home"><BrandMark /><span>The Caffeinate</span></a>
      <nav aria-label="Main navigation"><a href="#features">Features</a><a href="#ai-ready">AI-ready</a><a href="#pricing">Pricing</a><a href="#privacy">Privacy</a></nav>
      <a className="nav-cta" href="#download">Download free <Arrow /></a>
    </header>

    <main id="top">
      <section className="hero section-pad">
        <div className="hero-copy">
          <div className="eyebrow"><span className="pulse" /> Private PDF tools for Mac &amp; Windows</div>
          <h1>Edit PDFs for free.<br/><em>Keep them private.</em></h1>
          <p className="hero-lede">Fix text without a subscription. Upgrade to private OCR and turn scanned documents into clean, AI-ready text and Markdown—entirely on your computer.</p>
          <div className="hero-actions">
            <a className="primary-button" href="#download">Download free beta <span>↓</span></a>
            <a className="text-button" href="#privacy">See how privacy works <Arrow /></a>
          </div>
          <div className="hero-note"><span>◆</span> No account&nbsp;&nbsp;·&nbsp;&nbsp;No cloud processing&nbsp;&nbsp;·&nbsp;&nbsp;No document tracking</div>
        </div>

        <div className="product-scene" aria-label="Preview of The Caffeinate PDF editor">
          <div className="editor-window">
            <div className="editor-topbar">
              <div className="mini-brand"><BrandMark /><span>proposal.pdf</span></div>
              <div className="editor-tools"><span>Select</span><span>Text</span><span>Highlight</span><span>PDF Tools</span></div>
              <b>Export PDF</b>
            </div>
            <div className="editor-body">
              <aside className="page-rail"><small>Pages</small>{[1,2,3].map(page=><div className={`mini-page ${page===2?"active":""}`} key={page}><i /><span>{page}</span></div>)}</aside>
              <div className="document-stage">
                <div className="page-chip">Page 2 of 3 · Scroll continuously</div>
                <article className="paper">
                  <div className="paper-kicker">Project proposal</div><div className="paper-title">A calmer way to<br/>work with documents.</div>
                  <div className="paper-rule"/><p>Private files should stay private. Review every detail, make the changes you need, and save a fresh copy.</p>
                  <div className="highlight-line">Processed locally on this computer.</div><div className="paper-lines"><i/><i/><i/></div>
                </article>
              </div>
              <aside className="properties-panel"><small>Properties</small><div className="property-empty"><b>Aa</b><span>Select an object to edit its appearance.</span></div></aside>
            </div>
          </div>
          <div className="floating-card float-private"><span className="status-icon">✓</span><div><b>Stays on your device</b><small>0 files uploaded</small></div></div>
          <div className="floating-card float-tools"><span>PRO · AI-READY</span><b>OCR · TXT · Markdown</b></div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Privacy summary"><span>100% local processing</span><i/><span>Works offline after install</span><i/><span>Your original stays untouched</span></section>

      <section className="feature-section section-pad" id="features">
        <div className="section-heading"><div><span className="section-label">Everything you need</span><h2>One private workspace.<br/>A lot less PDF friction.</h2></div><p>Every utility is designed to feel straightforward, stay out of your way, and finish the job without a server in the middle.</p></div>
        <div className="feature-grid">{features.map(feature=><article className="feature-card" key={feature.number}><span>{feature.number}</span><h3>{feature.title}</h3><p>{feature.copy}</p><div className={`feature-visual visual-${feature.number}`}><i/><i/><i/></div></article>)}</div>
      </section>

      <section className="ai-section section-pad" id="ai-ready">
        <div className="ai-copy"><span className="section-label">Built for the AI workflow</span><h2>Send the signal.<br/><em>Leave out the noise.</em></h2><p>A scanned PDF is useful to read, but awkward to reuse. The Caffeinate Pro extracts it locally, keeps the structure that matters, and lets you choose only the pages you need.</p><ul><li>Export clean plain text for simple prompts</li><li>Export structured Markdown with headings and lists</li><li>Remove repeated headers, footers, and page numbers</li><li>See an approximate token estimate before export</li></ul><small>Cleaner input can reduce unnecessary AI token usage. Actual token counts vary by model.</small></div>
        <div className="ai-card" aria-label="AI-ready export preview"><div className="ai-card-top"><span>AI-READY EXPORT</span><b>Processed locally</b></div><div className="ai-file"><span>annual-report.pdf</span><b>86 pages</b></div><div className="ai-arrow">↓</div><div className="ai-output"><div><span>SELECTED</span><b>14 pages</b></div><div><span>CLEAN TEXT</span><b>18,420 words</b></div><div><span>ESTIMATED INPUT</span><b>≈ 25,000 tokens</b></div></div><div className="ai-removed"><span>✓ Repeated headers removed</span><span>✓ Page numbers removed</span><span>✓ Saved as .md or .txt</span></div></div>
      </section>

      <section className="pricing-section section-pad" id="pricing">
        <div className="section-heading"><div><span className="section-label">Simple plans</span><h2>Start free.<br/>Pay when work gets serious.</h2></div><p>Privacy is included in every plan. Pro tools are unlocked during beta so you can help us make them excellent before paid licenses launch.</p></div>
        <div className="pricing-grid">
          <article><span className="plan-name">FREE</span><h3>$0</h3><p>Forever</p><ul><li>Edit embedded PDF text</li><li>Annotate, highlight, and sign</li><li>Rotate and remove pages</li><li>Preview and export without watermarks</li><li>Local processing</li></ul><a href="#download">Download free <Arrow/></a></article>
          <article className="featured-plan"><div className="founding-badge">FOUNDING PRICE</div><span className="plan-name">PRO</span><h3>$29</h3><p>One-time at launch</p><ul><li>Everything in Free</li><li>Private OCR for scanned PDFs</li><li>AI-ready TXT and Markdown</li><li>Merge, split, compress, and convert</li><li>Batch tools and document security</li></ul><a href="mailto:hello@thecaffeinate.com?subject=The%20Caffeinate%20Founding%20Pro">Reserve founding Pro <Arrow/></a><small>Planned regular price: $49. No payment is collected during beta.</small></article>
          <article><span className="plan-name">BUSINESS</span><h3>Let’s talk</h3><p>For teams of 5+</p><ul><li>Everything in Pro</li><li>Volume and offline licensing</li><li>MSI and PKG deployment</li><li>Managed updates and invoicing</li><li>Priority support</li></ul><a href="mailto:hello@thecaffeinate.com?subject=The%20Caffeinate%20Business">Contact us <Arrow/></a></article>
        </div>
      </section>

      <section className="privacy-section section-pad" id="privacy">
        <div className="privacy-orbit" aria-hidden="true"><div className="orbit-ring ring-one"/><div className="orbit-ring ring-two"/><div className="privacy-core"><BrandMark/><b>YOUR PDF</b><span>stays here</span></div><span className="orbit-tag tag-cloud">No cloud</span><span className="orbit-tag tag-account">No account</span><span className="orbit-tag tag-tracking">No tracking</span></div>
        <div className="privacy-copy"><span className="section-label light">Privacy is the product</span><h2>Your files are not<br/>our business model.</h2><p>Most online PDF tools begin by uploading your document. The Caffeinate begins—and ends—on your computer.</p><div className="privacy-list">{privacyFacts.map(([title,copy])=><div key={title}><span>✓</span><p><b>{title}</b>{copy}</p></div>)}</div><a href="/privacy">Read our plain-language privacy promise <Arrow /></a></div>
      </section>

      <section className="workflow-section section-pad">
        <div className="section-heading compact"><div><span className="section-label">The local workflow</span><h2>Open. Edit. Preview. Save.</h2></div></div>
        <div className="workflow"><div><span>1</span><b>Open locally</b><p>Choose a PDF from your computer.</p></div><i>→</i><div><span>2</span><b>Make it yours</b><p>Edit pages and use private utilities.</p></div><i>→</i><div><span>3</span><b>Preview first</b><p>Review the exact finished document.</p></div><i>→</i><div><span>4</span><b>Save anywhere</b><p>Export a fresh copy you control.</p></div></div>
      </section>

      <section className="products-section section-pad" id="products">
        <div className="section-heading"><div><span className="section-label">The Caffeinate collection</span><h2>Small utilities.<br/>Serious privacy.</h2></div><p>PDF is only the first cup. We are building a family of focused desktop tools that respect your files and your attention.</p></div>
        <div className="product-row"><article className="product-current"><div><span>AVAILABLE IN BETA</span><h3>The Caffeinate PDF</h3><p>Free text editing plus private OCR and AI-ready extraction.</p></div><BrandMark/></article><article><span>COMING NEXT</span><h3>Images</h3><p>Resize, convert, compress, and clean up images without uploading them.</p></article><article><span>ON THE MENU</span><h3>Converter</h3><p>Simple local conversions for the formats you use every day.</p></article></div>
      </section>

      <section className="download-section section-pad" id="download">
        <div className="download-copy"><span className="section-label light">Version 0.4.0 · Free Windows beta</span><h2>Your private PDF workspace is ready.</h2><p>Edit text for free and test Pro tools while they are unlocked during beta. Your feedback will shape the paid launch.</p><div className="beta-warning">The Windows beta is currently unsigned, so Windows may show a security warning. The Mac release will follow after licensing, signing, and notarization are ready.</div></div>
        <div className="download-cards">
          <div className="download-card coming-soon-card" aria-label="Mac version coming soon"><span className="platform-icon apple">●</span><div><small>MACOS · APPLE SILICON</small><b>Mac version coming soon</b><em>Waiting for licensing, signing, and notarization</em></div><span className="soon-pill">SOON</span></div>
          <a href={WINDOWS_DOWNLOAD} className="download-card"><span className="platform-icon windows"><i/><i/><i/><i/></span><div><small>FOR 64-BIT WINDOWS</small><b>Download for Windows</b><em>Windows 10 or 11 · 42 MB</em></div><Arrow/></a>
          <p>By downloading, you agree to the <a href="/terms">beta terms</a>. Need help? <a href="mailto:hello@thecaffeinate.com">hello@thecaffeinate.com</a></p>
        </div>
      </section>
    </main>

    <footer><div><a className="wordmark footer-brand" href="#top"><BrandMark/><span>The Caffeinate</span></a><p>Private desktop utilities for focused work.</p></div><div className="footer-links"><div><b>Product</b><a href="#features">Features</a><a href="#pricing">Pricing</a><a href="#download">Downloads</a></div><div><b>Trust</b><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/refunds">Refunds</a></div><div><b>Contact</b><a href="mailto:hello@thecaffeinate.com">Email us</a><a href="mailto:hello@thecaffeinate.com?subject=The%20Caffeinate%20Business">Business</a></div></div><div className="footer-bottom"><span>© 2026 The Caffeinate</span><span>Made for files that should stay yours.</span></div></footer>
  </div>;
}
