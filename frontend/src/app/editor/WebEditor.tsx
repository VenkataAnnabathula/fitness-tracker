"use client";

/* eslint-disable @next/next/no-img-element -- PDF previews use browser-local Blob URLs that Next Image cannot optimize. */

import Link from "next/link";
import { ChangeEvent, MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import type * as MuPDFType from "mupdf";

type PDFDocument = MuPDFType.PDFDocument;
type PDFPage = MuPDFType.PDFPage;
type PagePreview = { index: number; url: string; width: number; height: number };
type Notice = { kind: "success" | "error" | "info"; text: string } | null;

const SOURCE_URL = "https://github.com/VenkataAnnabathula/the-caffeinate/tree/main/frontend";

function BrandMark() {
  return <span className="brand-mark" aria-hidden="true"><i/><i/><i/></span>;
}

function safeName(name: string, suffix = "-edited.pdf") {
  const stem = name.replace(/\.pdf$/i, "").replace(/[^a-zA-Z0-9._ -]+/g, "").trim() || "document";
  return `${stem}${suffix}`;
}

function quadToRect(quad: MuPDFType.Quad): MuPDFType.Rect {
  const xs = [quad[0], quad[2], quad[4], quad[6]];
  const ys = [quad[1], quad[3], quad[5], quad[7]];
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

function downloadBytes(bytes: Uint8Array, filename: string, type: string) {
  const blob = new Blob([new Uint8Array(bytes)], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export function WebEditor() {
  const mupdfRef = useRef<typeof MuPDFType | null>(null);
  const documentRef = useRef<PDFDocument | null>(null);
  const previewUrlsRef = useRef<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [previews, setPreviews] = useState<PagePreview[]>([]);
  const [selectedPage, setSelectedPage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [addText, setAddText] = useState("");
  const [fontSize, setFontSize] = useState(12);
  const [placingText, setPlacingText] = useState(false);

  const revokePreviews = useCallback(() => {
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrlsRef.current = [];
  }, []);

  useEffect(() => () => {
    revokePreviews();
    documentRef.current?.destroy();
  }, [revokePreviews]);

  const renderDocument = useCallback(async (preferredPage?: number) => {
    const mupdf = mupdfRef.current;
    const pdf = documentRef.current;
    if (!mupdf || !pdf) return;

    setBusy(true);
    revokePreviews();
    const next: PagePreview[] = [];
    try {
      const count = pdf.countPages();
      for (let index = 0; index < count; index += 1) {
        setProgress(`Rendering page ${index + 1} of ${count}`);
        const page = pdf.loadPage(index) as PDFPage;
        const bounds = page.getBounds();
        const renderScale = Math.min(1.65, 1200 / Math.max(1, bounds[2] - bounds[0]));
        const pixmap = page.toPixmap(mupdf.Matrix.scale(renderScale, renderScale), mupdf.ColorSpace.DeviceRGB, false, true);
        const png = new Uint8Array(pixmap.asPNG());
        const url = URL.createObjectURL(new Blob([png], { type: "image/png" }));
        previewUrlsRef.current.push(url);
        next.push({ index, url, width: bounds[2] - bounds[0], height: bounds[3] - bounds[1] });
        pixmap.destroy();
        page.destroy();
        await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
      }
      setPreviews(next);
      setSelectedPage(Math.max(0, Math.min(preferredPage ?? selectedPage, count - 1)));
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Could not render this PDF." });
    } finally {
      setBusy(false);
      setProgress("");
    }
  }, [revokePreviews, selectedPage]);

  async function openPdf(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setNotice({ kind: "error", text: "Choose a PDF file." });
      return;
    }
    setBusy(true);
    setProgress("Opening locally in your browser");
    try {
      const mupdf = mupdfRef.current ?? await import("mupdf");
      mupdfRef.current = mupdf;
      const bytes = new Uint8Array(await file.arrayBuffer());
      const nextDocument = new mupdf.PDFDocument(bytes);
      if (nextDocument.needsPassword()) {
        nextDocument.destroy();
        throw new Error("Password-protected PDFs are not supported in this first web release.");
      }
      documentRef.current?.destroy();
      documentRef.current = nextDocument;
      setFileName(file.name);
      setSelectedPage(0);
      setNotice({ kind: "success", text: "Opened locally. Nothing was uploaded." });
      await renderDocument(0);
    } catch (error) {
      setBusy(false);
      setProgress("");
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Could not open this PDF." });
    }
  }

  async function mergePdf(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    const mupdf = mupdfRef.current;
    const pdf = documentRef.current;
    if (!file || !mupdf || !pdf) return;
    setBusy(true);
    setProgress("Merging pages locally");
    try {
      const other = new mupdf.PDFDocument(new Uint8Array(await file.arrayBuffer()));
      const incoming = other.countPages();
      for (let index = 0; index < incoming; index += 1) pdf.graftPage(pdf.countPages(), other, index);
      other.destroy();
      setNotice({ kind: "success", text: `Added ${incoming} page${incoming === 1 ? "" : "s"}.` });
      await renderDocument();
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Could not merge that PDF." });
      setBusy(false);
      setProgress("");
    }
  }

  async function rotatePage() {
    const pdf = documentRef.current;
    if (!pdf) return;
    const page = pdf.loadPage(selectedPage) as PDFPage;
    const object = page.getObject();
    const current = object.getInheritable("Rotate");
    const angle = current.isNumber() ? current.asNumber() : 0;
    object.put("Rotate", (angle + 90) % 360);
    current.destroy();
    object.destroy();
    page.destroy();
    setNotice({ kind: "success", text: `Rotated page ${selectedPage + 1}.` });
    await renderDocument(selectedPage);
  }

  async function deletePage() {
    const pdf = documentRef.current;
    if (!pdf) return;
    if (pdf.countPages() <= 1) {
      setNotice({ kind: "error", text: "A PDF needs at least one page." });
      return;
    }
    pdf.deletePage(selectedPage);
    const next = Math.min(selectedPage, pdf.countPages() - 1);
    setNotice({ kind: "success", text: `Removed page ${selectedPage + 1}.` });
    await renderDocument(next);
  }

  async function movePage(direction: -1 | 1) {
    const pdf = documentRef.current;
    if (!pdf) return;
    const destination = selectedPage + direction;
    if (destination < 0 || destination >= pdf.countPages()) return;
    const order = Array.from({ length: pdf.countPages() }, (_, index) => index);
    [order[selectedPage], order[destination]] = [order[destination], order[selectedPage]];
    pdf.rearrangePages(order);
    setNotice({ kind: "success", text: `Moved page to position ${destination + 1}.` });
    await renderDocument(destination);
  }

  async function replaceMatches() {
    const pdf = documentRef.current;
    if (!pdf || !findText.trim()) return;
    setBusy(true);
    setProgress("Replacing matching text");
    let total = 0;
    try {
      for (let pageIndex = 0; pageIndex < pdf.countPages(); pageIndex += 1) {
        const page = pdf.loadPage(pageIndex) as PDFPage;
        const matches = page.search(findText.trim(), 1_000);
        const rects: MuPDFType.Rect[] = [];
        for (const match of matches) {
          for (const quad of match) {
            const rect = quadToRect(quad);
            rects.push(rect);
            const redact = page.createAnnotation("Redact");
            redact.setRect(rect);
            redact.update();
          }
        }
        if (rects.length) {
          page.applyRedactions(false);
          for (const rect of rects) {
            if (!replaceText) continue;
            const replacement = page.createAnnotation("FreeText");
            replacement.setRect([rect[0], rect[1] - 1, Math.max(rect[2], rect[0] + 40), rect[3] + 2]);
            replacement.setContents(replaceText);
            replacement.setDefaultAppearance("Helv", Math.max(6, rect[3] - rect[1]), [0, 0, 0]);
            replacement.setBorderWidth(0);
            replacement.update();
          }
          total += rects.length;
        }
        page.destroy();
      }
      setNotice(total ? { kind: "success", text: `Replaced ${total} match${total === 1 ? "" : "es"}. Review the preview before saving.` } : { kind: "info", text: "No matching text was found." });
      await renderDocument(selectedPage);
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Text replacement failed." });
      setBusy(false);
      setProgress("");
    }
  }

  async function highlightMatches() {
    const pdf = documentRef.current;
    if (!pdf || !findText.trim()) return;
    setBusy(true);
    setProgress("Adding highlights");
    let total = 0;
    for (let pageIndex = 0; pageIndex < pdf.countPages(); pageIndex += 1) {
      const page = pdf.loadPage(pageIndex) as PDFPage;
      const matches = page.search(findText.trim(), 1_000);
      for (const quads of matches) {
        const highlight = page.createAnnotation("Highlight");
        highlight.setQuadPoints(quads);
        highlight.setColor([1, 0.76, 0.2]);
        highlight.update();
        total += 1;
      }
      page.destroy();
    }
    setNotice(total ? { kind: "success", text: `Highlighted ${total} match${total === 1 ? "" : "es"}.` } : { kind: "info", text: "No matching text was found." });
    await renderDocument(selectedPage);
  }

  async function placeText(event: MouseEvent<HTMLImageElement>, preview: PagePreview) {
    const pdf = documentRef.current;
    if (!pdf || !placingText || !addText.trim()) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * preview.width;
    const y = ((event.clientY - rect.top) / rect.height) * preview.height;
    const page = pdf.loadPage(preview.index) as PDFPage;
    const annotation = page.createAnnotation("FreeText");
    annotation.setRect([x, y, Math.min(preview.width - 8, x + 260), Math.min(preview.height - 8, y + fontSize * 3)]);
    annotation.setContents(addText.trim());
    annotation.setDefaultAppearance("Helv", fontSize, [0, 0, 0]);
    annotation.setBorderWidth(0);
    annotation.update();
    page.destroy();
    setPlacingText(false);
    setSelectedPage(preview.index);
    setNotice({ kind: "success", text: `Added text to page ${preview.index + 1}.` });
    await renderDocument(preview.index);
  }

  function exportPdf() {
    const pdf = documentRef.current;
    if (!pdf) return;
    setBusy(true);
    setProgress("Preparing your PDF locally");
    window.setTimeout(() => {
      try {
        const buffer = pdf.saveToBuffer({ garbage: 4, compress: true, compress_images: true });
        const bytes = new Uint8Array(buffer.asUint8Array());
        buffer.destroy();
        downloadBytes(bytes, safeName(fileName), "application/pdf");
        setNotice({ kind: "success", text: "Your edited PDF was downloaded." });
      } catch (error) {
        setNotice({ kind: "error", text: error instanceof Error ? error.message : "Could not export the PDF." });
      } finally {
        setBusy(false);
        setProgress("");
      }
    }, 0);
  }

  function extractText() {
    const pdf = documentRef.current;
    if (!pdf) return;
    const pages: string[] = [];
    for (let index = 0; index < pdf.countPages(); index += 1) {
      const page = pdf.loadPage(index);
      const structured = page.toStructuredText("preserve-whitespace");
      pages.push(structured.asText().trim());
      structured.destroy();
      page.destroy();
    }
    downloadBytes(new TextEncoder().encode(pages.join("\n\n--- Page break ---\n\n")), safeName(fileName, ".txt"), "text/plain;charset=utf-8");
    setNotice({ kind: "success", text: "Extracted text was downloaded." });
  }

  function exportCurrentPage() {
    const mupdf = mupdfRef.current;
    const pdf = documentRef.current;
    if (!mupdf || !pdf) return;
    const split = new mupdf.PDFDocument();
    split.graftPage(0, pdf, selectedPage);
    const buffer = split.saveToBuffer({ garbage: 4, compress: true });
    const bytes = new Uint8Array(buffer.asUint8Array());
    buffer.destroy();
    split.destroy();
    downloadBytes(bytes, safeName(fileName, `-page-${selectedPage + 1}.pdf`), "application/pdf");
    setNotice({ kind: "success", text: `Downloaded page ${selectedPage + 1} as a separate PDF.` });
  }

  const hasDocument = previews.length > 0;

  return <div className="web-editor-shell">
    <header className="web-editor-header">
      <Link className="wordmark" href="/"><BrandMark/><span>The Caffeinate</span></Link>
      <div className="local-badge"><span>●</span> Browser-local · no upload</div>
      <div className="header-actions">
        <label className="button secondary">Open PDF<input type="file" accept="application/pdf,.pdf" onChange={openPdf}/></label>
        <button className="button primary" disabled={!hasDocument || busy} onClick={exportPdf}>Download PDF</button>
      </div>
    </header>

    {!hasDocument ? <main className="editor-welcome">
      <section className="drop-card">
        <BrandMark/>
        <span className="section-label">Private web editor</span>
        <h1>Wake up your PDF.<br/><em>Without uploading it.</em></h1>
        <p>Open a PDF and edit it entirely inside this browser tab. The file never travels to The Caffeinate&apos;s servers.</p>
        <label className="button primary large">Choose a PDF<input type="file" accept="application/pdf,.pdf" onChange={openPdf}/></label>
        <small>Free · No account · No watermark · Works best with modern desktop browsers</small>
      </section>
      <div className="welcome-facts"><span>✓ Continuous page preview</span><span>✓ Search, replace, highlight</span><span>✓ Add, rotate, delete, reorder</span><span>✓ Merge and extract text</span></div>
      <p className="source-offer">Powered by MuPDF.js under GNU AGPL v3. <a href={SOURCE_URL} target="_blank" rel="noreferrer">View the corresponding source code ↗</a></p>
    </main> : <main className="editor-workspace">
      <aside className="editor-sidebar">
        <div className="file-panel"><small>DOCUMENT</small><strong title={fileName}>{fileName}</strong><span>{previews.length} page{previews.length === 1 ? "" : "s"}</span></div>
        <div className="tool-section">
          <small>TEXT TOOLS</small>
          <label>Find<input value={findText} onChange={(event) => setFindText(event.target.value)} placeholder="Text in the PDF"/></label>
          <label>Replace with<input value={replaceText} onChange={(event) => setReplaceText(event.target.value)} placeholder="New text (blank deletes)"/></label>
          <div className="button-row"><button onClick={replaceMatches} disabled={busy || !findText.trim()}>Replace all</button><button onClick={highlightMatches} disabled={busy || !findText.trim()}>Highlight</button></div>
          <p>Replacement works best when the new text is close in length to the original.</p>
        </div>
        <div className="tool-section">
          <small>ADD TEXT</small>
          <textarea value={addText} onChange={(event) => setAddText(event.target.value)} placeholder="Type text, then click a page" rows={3}/>
          <label>Size<input type="number" min="6" max="72" value={fontSize} onChange={(event) => setFontSize(Number(event.target.value) || 12)}/></label>
          <button className={placingText ? "active-tool" : ""} disabled={!addText.trim()} onClick={() => setPlacingText((value) => !value)}>{placingText ? "Click the page…" : "Place text"}</button>
        </div>
        <div className="tool-section">
          <small>PAGE {selectedPage + 1}</small>
          <div className="button-row"><button onClick={() => movePage(-1)} disabled={selectedPage === 0}>Move up</button><button onClick={() => movePage(1)} disabled={selectedPage === previews.length - 1}>Move down</button></div>
          <div className="button-row"><button onClick={rotatePage}>Rotate 90°</button><button className="danger" onClick={deletePage}>Delete</button></div>
        </div>
        <div className="tool-section export-tools">
          <small>DOCUMENT TOOLS</small>
          <label className="sidebar-file">Merge another PDF<input type="file" accept="application/pdf,.pdf" onChange={mergePdf}/></label>
          <button onClick={exportCurrentPage}>Download this page</button>
          <button onClick={extractText}>Download text</button>
        </div>
      </aside>

      <section className="document-workspace">
        <div className="workspace-toolbar"><span>Page {selectedPage + 1} of {previews.length}</span><div><button onClick={() => setZoom((value) => Math.max(.6, value - .1))}>−</button><b>{Math.round(zoom * 100)}%</b><button onClick={() => setZoom((value) => Math.min(1.8, value + .1))}>+</button></div></div>
        {notice && <div className={`editor-notice ${notice.kind}`} role="status"><span>{notice.text}</span><button aria-label="Dismiss message" onClick={() => setNotice(null)}>×</button></div>}
        <div className={`continuous-pages ${placingText ? "placing" : ""}`}>
          {previews.map((preview) => <article data-page={preview.index} className={`pdf-page ${selectedPage === preview.index ? "selected" : ""}`} key={preview.index} style={{ width: `${Math.max(320, preview.width * zoom)}px` }} onClick={() => setSelectedPage(preview.index)}>
            <div className="page-label">Page {preview.index + 1}</div>
            <img src={preview.url} alt={`PDF page ${preview.index + 1}`} draggable={false} onClick={(event) => placeText(event, preview)}/>
          </article>)}
        </div>
      </section>
      <aside className="page-strip"><small>PAGES</small>{previews.map((preview) => <button className={selectedPage === preview.index ? "selected" : ""} key={preview.index} onClick={() => {setSelectedPage(preview.index); document.querySelector(`[data-page='${preview.index}']`)?.scrollIntoView({behavior:"smooth"});}}><img src={preview.url} alt=""/><span>{preview.index + 1}</span></button>)}</aside>
    </main>}

    {busy && <div className="busy-overlay" role="status" aria-live="polite"><div className="spinner"/><strong>{progress || "Working locally"}</strong><span>Please keep this tab open.</span></div>}
    <footer className="editor-footer"><span>Your document stays in this browser tab.</span><a href={SOURCE_URL} target="_blank" rel="noreferrer">AGPL source ↗</a><Link href="/privacy">Privacy</Link><Link href="/">Home</Link></footer>
  </div>;
}
