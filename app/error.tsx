"use client";
export default function ErrorPage({reset}:{reset:()=>void}){return <div className="landing"><div className="card stack"><h2>Bir sorun oluştu</h2><p className="muted">Bağlantınızı kontrol edin ve tekrar deneyin.</p><div><button className="btn" onClick={reset}>Tekrar dene</button></div></div></div>}
