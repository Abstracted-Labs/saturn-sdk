import React from "react";
import { DocsThemeConfig } from "nextra-theme-docs";

const config: DocsThemeConfig = {
  logo: <span>🪐 Saturn SDK</span>,
  project: {
    link: "https://github.com/InvArch/saturn-sdk",
  },
  chat: {
    link: "https://discord.com/invite/invarch",
  },
  docsRepositoryBase: "https://github.com/InvArch/saturn-sdk/docs",
  footer: {
    text: "InvArch Corporation",
  },
  useNextSeoProps() {
    return {
      titleTemplate: "%s - Saturn SDK",
    };
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content="Saturn SDK"></meta>
      <meta property="og:title" content="Saturn SDK" />
      <meta property="og:description" content="Saturn SDK" />
      <meta name="twitter:site" content="@InvArchNetwork" />
    </>
  ),
  darkMode: true,
};

export default config;
