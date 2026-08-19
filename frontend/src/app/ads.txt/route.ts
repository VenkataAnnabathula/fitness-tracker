export const dynamic="force-dynamic";

export function GET(){
  const publisher=process.env.ADSENSE_PUBLISHER_ID?.replace(/^pub-/,"");
  const body=publisher?`google.com, pub-${publisher}, DIRECT, f08c47fec0942fa0\n`:`# AdSense publisher ID has not been configured.\n`;
  return new Response(body,{headers:{"content-type":"text/plain; charset=utf-8","cache-control":"public, max-age=3600"}});
}
