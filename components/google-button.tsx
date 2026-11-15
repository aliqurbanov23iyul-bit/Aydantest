import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { googleAvailable } from "@/lib/google-account";

export function GoogleButton() {
  return <form className="google-wrap" action={async () => {
    "use server";
    if (!googleAvailable) redirect("/login");
    await signIn("google", {redirectTo:"/dashboard"});
  }}>
    <div className="google-divider">veya</div>
    <button className="btn google-button" type="submit" disabled={!googleAvailable}><span className="google-mark" aria-hidden="true">G</span>Google ile devam et</button>
    {!googleAvailable && <small className="google-status">Google ile giriş şu anda kullanılamıyor.</small>}
  </form>;
}
