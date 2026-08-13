import { LegalPage } from "@/components/LegalPage";

export const metadata={title:"Privacy"};
export default function Privacy(){return <LegalPage label="Our privacy promise" title="Your documents stay yours.">
  <p>The Caffeinate is designed so that the documents you open remain on your computer. We do not operate a document-processing cloud service, and the desktop application does not upload your PDFs to us.</p>
  <h2>What the desktop application does not collect</h2><ul><li>Your PDF documents or images</li><li>Text extracted from your documents</li><li>Your document names or editing history</li><li>Document analytics or content telemetry</li><li>Account or profile information—the beta requires no account</li></ul>
  <h2>Local processing</h2><p>Opening, rendering, editing, OCR, text extraction, Markdown generation, merging, splitting, compressing, converting, and exporting happen on your computer. Working files and AI-ready exports are stored locally and are not transmitted to The Caffeinate.</p>
  <h2>The website</h2><p>Our website may receive ordinary technical requests required to deliver web pages and installer downloads, such as an IP address and browser information handled by our hosting providers. We do not receive the documents you process in the desktop app.</p>
  <h2>Future analytics</h2><p>We do not currently include document analytics in the beta. If we introduce optional crash reporting or product analytics, we will describe it here and provide meaningful choices before collecting it.</p>
  <h2>Contact</h2><p>Questions about privacy can be sent to <a href="mailto:hello@thecaffeinate.com">hello@thecaffeinate.com</a>.</p>
 </LegalPage>}
