import { ArrowUpRight, Instagram } from "lucide-react";
function TikTok({size}:{size:number}) {
 return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.6 0h-3.9v16.4a3.45 3.45 0 1 1-3-3.42V8.99a7.42 7.42 0 1 0 6.96 7.41V8.06A10.34 10.34 0 0 0 22.7 10V6a6.04 6.04 0 0 1-6.1-6Z"/></svg>;
}
const links=[
 {name:"Instagram",url:"https://www.instagram.com/ok4nnerr/",icon:Instagram,style:"instagram"},
 {name:"TikTok",url:"https://www.tiktok.com/@ok4nnerr",icon:TikTok,style:"tiktok"},
];
export function SocialFooter(){
 return <footer className="social-footer"><div className="social-inner">
  <p className="powered">Powered by <strong>@ok4nnerr</strong></p>
  <div className="social-links">{links.map(({name,url,icon:Icon,style})=><a href={url} key={name} className={"social-link "+style} target="_blank" rel="noopener noreferrer">
   <span className="social-icon"><Icon size={22}/></span><span className="social-label"><strong>{name}</strong><small>@ok4nnerr</small></span><ArrowUpRight size={18}/>
  </a>)}</div>
 </div></footer>;
}
