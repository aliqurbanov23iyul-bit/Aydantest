import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { googleAvailable } from "@/lib/google-account";

export function GoogleButton() {
  if (!googleAvailable) return null;
  return <form action={async()=>{
    "use server";
    if (!googleAvailable) redirect("/login");
    await signIn("google",{redirectTo:"/dashboard"});
  }}><button className="btn google-button" type="submit"><span className="google-mark" aria-hidden="true">G</span>Google ile devam et</button></form>;
}
