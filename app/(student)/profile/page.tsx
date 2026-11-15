import {requireUser} from "@/lib/user";
import {Header} from "@/components/ui";
import {ProfileForm} from "@/components/profile-forms";
export default async function Profile(){const user=await requireUser();return <div className="stack"><Header title="Profil" detail={user.email}/><ProfileForm {...user}/></div>;}
