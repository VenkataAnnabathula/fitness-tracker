const MAC_DOWNLOAD = "https://github.com/VenkataAnnabathula/fitness-tracker/releases/download/v0.3.1-beta/The-Caffeinate-0.3.1-arm64-beta.dmg";
const WINDOWS_DOWNLOAD = "https://github.com/VenkataAnnabathula/fitness-tracker/releases/download/v0.3.1-beta/The-Caffeinate-0.3.1-windows-x64.exe";

const features = [
  { number: "01", title: "Edit with context", copy: "Scroll through every page, adjust text, add notes, highlight details, whiteout content, and preview the finished result." },
  { number: "02", title: "Organize anything", copy: "Merge documents, split page ranges, rotate pages, remove what you do not need, and export a clean new copy." },
  { number: "03", title: "Convert locally", copy: "Turn JPG, PNG, BMP, and TIFF images into PDFs—or export PDF pages as crisp PNG or JPG files." },
  { number: "04", title: "Shrink the heavy stuff", copy: "Compress image-heavy documents with light, balanced, or strong optimization, entirely on your computer." },
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
      <nav aria-label="Main navigation"><a href="#features">Features</a><a href="#privacy">Privacy</a><a href="#products">Products</a></nav>
      <a className="nav-cta" href="#download">Get the beta <Arrow /></a>
    </header>

    <main id="top">
      <section className="hero section-pad">
        <div className="hero-copy">
          <div className="eyebrow"><span className="pulse" /> Private PDF tools for Mac &amp; Windows</div>
          <h1>Wake up your PDFs.<br/><em>Keep them private.</em></h1>
          <p className="hero-lede">Edit, merge, split, compress, and convert documents without handing them to the cloud. The Caffeinate works locally, where your files belong.</p>
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
          <div className="floating-card float-tools"><span>PDF TOOLS</span><b>Merge · Split · Compress</b></div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Privacy summary"><span>100% local processing</span><i/><span>Works offline after install</span><i/><span>Your original stays untouched</span></section>

      <section className="feature-section section-pad" id="features">
        <div className="section-heading"><div><span className="section-label">Everything you need</span><h2>One private workspace.<br/>A lot less PDF friction.</h2></div><p>Every utility is designed to feel straightforward, stay out of your way, and finish the job without a server in the middle.</p></div>
        <div className="feature-grid">{features.map(feature=><article className="feature-card" key={feature.number}><span>{feature.number}</span><h3>{feature.title}</h3><p>{feature.copy}</p><div className={`feature-visual visual-${feature.number}`}><i/><i/><i/></div></article>)}</div>
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
        <div className="product-row"><article className="product-current"><div><span>AVAILABLE IN BETA</span><h3>The Caffeinate PDF</h3><p>Edit, organize, convert, and optimize PDFs locally.</p></div><BrandMark/></article><article><span>COMING NEXT</span><h3>Images</h3><p>Resize, convert, compress, and clean up images without uploading them.</p></article><article><span>ON THE MENU</span><h3>Converter</h3><p>Simple local conversions for the formats you use every day.</p></article></div>
      </section>

      <section className="download-section section-pad" id="download">
        <div className="download-copy"><span className="section-label light">Version 0.3.1 · Free beta</span><h2>Your private PDF workspace is ready.</h2><p>Try the beta, put it through real work, and tell us what would make it indispensable.</p><div className="beta-warning">Beta builds are currently unsigned. Your computer may show a security warning during installation.</div></div>
        <div className="download-cards">
          <a href={MAC_DOWNLOAD} className="download-card"><span className="platform-icon apple">●</span><div><small>FOR APPLE SILICON</small><b>Download for Mac</b><em>macOS 12 or newer · 48 MB</em></div><Arrow/></a>
          <a href={WINDOWS_DOWNLOAD} className="download-card"><span className="platform-icon windows"><i/><i/><i/><i/></span><div><small>FOR 64-BIT WINDOWS</small><b>Download for Windows</b><em>Windows 10 or 11 · 42 MB</em></div><Arrow/></a>
          <p>By downloading, you agree to the <a href="/terms">beta terms</a>. Need help? <a href="mailto:hello@thecaffeinate.com">hello@thecaffeinate.com</a></p>
        </div>
      </section>
    </main>

    <footer><div><a className="wordmark footer-brand" href="#top"><BrandMark/><span>The Caffeinate</span></a><p>Private desktop utilities for focused work.</p></div><div className="footer-links"><div><b>Product</b><a href="#features">Features</a><a href="#download">Downloads</a><a href="#products">What’s next</a></div><div><b>Trust</b><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/refunds">Refunds</a></div><div><b>Contact</b><a href="mailto:hello@thecaffeinate.com">Email us</a><a href="https://github.com/VenkataAnnabathula" target="_blank" rel="noreferrer">GitHub</a></div></div><div className="footer-bottom"><span>© 2026 The Caffeinate</span><span>Made for files that should stay yours.</span></div></footer>
  </div>;
}
