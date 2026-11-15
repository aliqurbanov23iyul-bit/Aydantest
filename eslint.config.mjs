import config from "eslint-config-next/core-web-vitals";
export default [...config, { ignores: [".next/**", "next-env.d.ts"] }];
