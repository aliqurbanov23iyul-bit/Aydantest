import type { NextConfig } from "next";
const config: NextConfig = {
  serverExternalPackages:["pdf-parse"],
  async headers(){return [{source:"/reset-password",headers:[{key:"Referrer-Policy",value:"no-referrer"}]}];},
};
export default config;
