import type { Metadata } from "next";
import { WebEditor } from "./WebEditor";
import "./editor.css";

export const metadata: Metadata = {
  title: "Private Web PDF Editor",
  description: "Edit PDFs locally in your browser. Your document never uploads to The Caffeinate.",
};

export default function EditorPage() {
  return <WebEditor />;
}
