import {notFound} from "next/navigation";
import {requireUser} from "@/lib/user";
export async function requireAdmin(){
 const user=await requireUser();
 if(user.role!=="ADMIN")notFound();
 return user;
}
