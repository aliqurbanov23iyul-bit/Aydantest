import { AuthScreen } from "@/components/auth-screen";

export default function Register() {
  return <AuthScreen mode="register" accountReady={Boolean(process.env.DATABASE_URL && process.env.AUTH_SECRET)}/>;
}
