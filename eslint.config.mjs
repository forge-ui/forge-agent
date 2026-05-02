import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    ignores: [
      ".next/**",
      "dist/**",
      "next-env.d.ts",
      "node_modules/**",
      "out/**",
      "public/umo/**",
      "umo-bridge/**",
    ],
  },
];

export default eslintConfig;
