import type { Metadata } from "next";
import "./styles.css";
export const metadata:Metadata={title:"AkademiAI · Sınav Hazırlık Platformu",description:"Derslerine özel testler oluştur ve sınavlarına hazırlan."};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="tr"><body>{children}</body></html>;
}
