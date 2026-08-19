"use client";

import { useEffect, useRef } from "react";

declare global { interface Window { adsbygoogle?: Record<string, unknown>[] } }

export function AdSlot({slot,label="Advertisement"}:{slot:string;label?:string}) {
  const requested=useRef(false);
  const client=process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const slotId=process.env[slot];

  useEffect(()=>{
    if(!client||!slotId||requested.current)return;
    requested.current=true;
    const request=()=>{try{window.adsbygoogle=window.adsbygoogle||[];window.adsbygoogle.push({});}catch{/* Ad blockers are expected. */}};
    const existing=document.querySelector<HTMLScriptElement>('script[data-caffeinate-adsense]');
    if(existing){existing.addEventListener("load",request,{once:true});if(window.adsbygoogle)request();return;}
    const script=document.createElement("script");script.async=true;script.crossOrigin="anonymous";script.dataset.caffeinateAdsense="true";
    script.src=`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
    script.addEventListener("load",request,{once:true});document.head.appendChild(script);
  },[client,slotId]);

  if(!client||!slotId)return null;
  return <aside className="site-ad" aria-label={label}><span>{label}</span><ins className="adsbygoogle" style={{display:"block"}} data-ad-client={client} data-ad-slot={slotId} data-ad-format="horizontal" data-full-width-responsive="true"/></aside>;
}
