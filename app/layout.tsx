import type { Metadata } from "next";
import { SocialFooter } from "@/components/social-footer";
import "./styles.css";
import "./motion.css";
import "./course-art.css";
export const metadata:Metadata={title:"AydanTest · Sınav Hazırlık Platformu",description:"Derslerine özel testler oluştur ve sınavlarına hazırlan."};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="tr"><body><div className="site-content">{children}</div><SocialFooter/></body></html>;
}
