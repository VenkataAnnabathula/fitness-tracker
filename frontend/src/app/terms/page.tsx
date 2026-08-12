import { LegalPage } from "@/components/LegalPage";

export const metadata={title:"Beta Terms"};
export default function Terms(){return <LegalPage label="Free beta" title="Beta software terms.">
  <p>These terms apply to the free beta version of The Caffeinate desktop application. By downloading or using the beta, you agree to these terms.</p>
  <h2>Beta status</h2><p>The application is pre-release software provided for evaluation and testing. Features may change, contain defects, or behave differently across documents and computers. Keep backups of important files and review exported documents before relying on them.</p>
  <h2>Permitted use</h2><p>You may install and use the beta for personal or internal business evaluation. You may not resell, redistribute, reverse engineer, or present the application as your own product except where applicable law expressly permits otherwise.</p>
  <h2>Your documents</h2><p>You retain ownership of your documents and content. The application is designed to process them locally. You are responsible for ensuring that you have permission to edit or convert the files you open.</p>
  <h2>No warranty</h2><p>The beta is provided “as is” without warranties of any kind to the fullest extent permitted by law. We do not guarantee uninterrupted operation, compatibility with every PDF, or preservation of every document feature.</p>
  <h2>Limitation of liability</h2><p>To the fullest extent permitted by law, The Caffeinate will not be liable for indirect, incidental, or consequential damages, loss of data, or loss of business resulting from use of the beta.</p>
  <h2>Contact</h2><p>Questions can be sent to <a href="mailto:hello@thecaffeinate.com">hello@thecaffeinate.com</a>.</p>
 </LegalPage>}
