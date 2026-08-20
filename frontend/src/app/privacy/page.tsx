import { LegalPage } from "@/components/LegalPage";

export const metadata={title:"Privacy"};
export default function Privacy(){return <LegalPage label="Our privacy promise" title="Your documents stay yours.">
 <p>The Caffeinate offers a local desktop application and a browser-local web editor. We explain which mode is processing your file before you select it.</p>
 <h2>Desktop application</h2><p>PDF rendering, editing, OCR, extraction, merging, splitting, compression, conversion, and export run on your computer. The desktop app does not send us your PDFs, filenames, extracted text, page images, or edit history.</p>
 <h2>Web editor</h2><p>The web editor loads the PDF engine into your browser and processes the document inside the current tab. Selected PDFs, extracted text, edits, and exports are not uploaded to The Caffeinate. Closing or refreshing the tab clears the editor session. Your browser or operating system may retain the original file and downloads according to your own settings.</p>
 <h2>Advertising and affiliates</h2><p>The public website may use Google AdSense, which can process device, browser, cookie, consent, and advertising data under Google&apos;s policies. Direct affiliate links may identify that a visit came from The Caffeinate. We do not send document contents, filenames, OCR output, or editing behavior to advertisers or affiliate partners.</p>
 <h2>Anonymous traffic measurement</h2><p>We use Vercel Web Analytics to understand aggregate visits, popular pages, referral sources, countries, browsers, operating systems, and device types. Vercel Analytics does not use cookies and identifies visitors with a short-lived anonymized hash. It does not receive PDF contents, filenames, extracted text, or editing actions.</p>
 <h2>Desktop sponsorship</h2><p>The desktop application does not embed Google AdSense. Clearly labeled sponsor or affiliate placements may open an external website in your normal browser. Opening a sponsor link never includes document context.</p>
 <h2>Hosting and security</h2><p>Our hosting provider receives ordinary requests for website code and assets, such as IP address, browser details, and request timing. PDF contents are not part of those requests. As with any browser tool, extensions, managed-device software, or a compromised browser may be able to observe activity outside our control.</p>
 <h2>Your choices</h2><p>You can use the desktop app without an account. Where consent is required for personalized advertising, the website will request it through an approved consent platform. You may use available privacy controls or an ad blocker.</p>
 <h2>Contact</h2><p>Questions can be sent to <a href="mailto:hello@thecaffeinate.com">hello@thecaffeinate.com</a>.</p>
 </LegalPage>}
