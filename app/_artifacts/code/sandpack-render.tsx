"use client";

/**
 * Heavy Sandpack runtime. Keep this file out of the runnable gate bundle.
 */

import { Sandpack } from "@codesandbox/sandpack-react";

type SandpackRenderProps = {
  template: "react" | "vanilla" | "static";
  entry: string;
  content: string;
};

export default function SandpackRender({ template, entry, content }: SandpackRenderProps) {
  return (
    <Sandpack
      template={template}
      files={{ [entry]: content }}
      theme="light"
      options={{
        autorun: true,
        recompileMode: "delayed",
        recompileDelay: 800,
        showNavigator: false,
        showLineNumbers: true,
        showInlineErrors: true,
        wrapContent: true,
        editorHeight: "100%",
      }}
    />
  );
}
