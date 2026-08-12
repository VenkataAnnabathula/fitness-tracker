import Link from "next/link";

export function LegalPage({label,title,children}:{label:string;title:string;children:React.ReactNode}) {
  return <div className="legal-shell"><header className="legal-nav"><Link className="wordmark" href="/"><span className="brand-mark" aria-hidden="true"><i/><i/><i/></span><span>The Caffeinate</span></Link><Link href="/">Back to home →</Link></header><main className="legal-content"><span>{label}</span><h1>{title}</h1><p className="updated">Last updated August 12, 2026</p>{children}</main></div>;
}
