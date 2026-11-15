import { AuthScreen } from "@/components/auth-screen";

export default async function Login({searchParams}:{searchParams:Promise<{error?:string}>}) {
  const {error} = await searchParams;
  return <AuthScreen mode="login" error={error} accountReady={Boolean(process.env.DATABASE_URL && process.env.AUTH_SECRET)}/>;
}
