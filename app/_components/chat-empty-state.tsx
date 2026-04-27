"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ChatInputBar, type ChatInputBarToggle } from "@forge-ui/react";
import { GlobalLinear, LightbulbBoldDuotone, PaperclipLinear } from "solar-icon-set";
import { DEFAULT_APP_SLUG, getAppBySlug } from "@/app/_mock/apps";
import { asset } from "@/lib/asset";

const USER_NAME = "Alex";

export function ChatEmptyState() {
  const params = useParams<{ appId?: string }>();
  const slug = params?.appId ?? DEFAULT_APP_SLUG;
  const app = getAppBySlug(slug) ?? getAppBySlug(DEFAULT_APP_SLUG)!;
  const [draft, setDraft] = useState("");
  const [mode, setMode] = useState<"think" | "search" | null>(null);

  const toggles: ChatInputBarToggle[] = [
    {
      id: "think",
      label: "深度思考",
      icon: <LightbulbBoldDuotone size={15} color={mode === "think" ? "#fff" : "#52525B"} />,
      active: mode === "think",
      onClick: () => setMode(mode === "think" ? null : "think"),
    },
    {
      id: "search",
      label: "联网搜索",
      icon: <GlobalLinear size={15} color={mode === "search" ? "#fff" : "#52525B"} />,
      active: mode === "search",
      onClick: () => setMode(mode === "search" ? null : "search"),
    },
    {
      id: "upload",
      label: "上传文件",
      icon: <PaperclipLinear size={15} color="#52525B" />,
      onClick: () => {},
    },
  ];

  return (
    <div className="relative flex h-full min-h-[calc(100vh-80px)] flex-col">
      {/* 右上角 3D 吉祥物 */}
      {app.heroIllustration && (
        <img
          src={asset(app.heroIllustration)}
          alt=""
          aria-hidden
          className="pointer-events-none absolute right-0 top-[-40px] hidden h-[260px] w-auto object-contain md:block"
        />
      )}

      {/* 上半:欢迎语水平+垂直居中 */}
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="font-display text-4xl font-bold tracking-fg text-fg-black">
            你好，{USER_NAME} <span className="inline-block">👋</span>
          </h1>
          <p className="text-base text-fg-grey-700">
            我是 <span className="font-semibold text-fg-black">{app.name}</span>，{app.description}
          </p>
        </div>
      </div>

      {/* 下半:输入框水平居中,贴底部留呼吸 */}
      <div className="flex justify-center px-4 pb-10">
        <ChatInputBar
          className="w-full max-w-[820px]"
          multiline
          rows={3}
          placeholder="输入你的问题，或直接下达任务..."
          value={draft}
          onChange={setDraft}
          onSend={(msg) => console.log("send", msg)}
          toggles={toggles}
        />
      </div>
    </div>
  );
}
