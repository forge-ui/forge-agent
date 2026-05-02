"use client";

/**
 * Document artifact Render — Umo iframe starts when the chat card opens panel.
 *
 * Umo Editor 是 Vue3 项目，由 forge-agent/umo-bridge/ build 输出到 public/umo/，iframe 加载。
 *
 * 状态机（简化）：
 *   - iframeReadyRef: 子端 ready 已收到，可以主动 push init
 *   - seqRef: 单调递增，子端靠 lastInitSeq 去重，因此每次 ready 都发也无副作用
 *
 * StrictMode 双 mount 时父侧 listener 会被注册两次→ ready 收到两次 → init 发两次，
 * 子端 seq 去重消化掉，无需额外守卫。
 */

import { useEffect, useRef } from "react";
import {
  BRIDGE_KINDS,
  isBridgeKind,
  type IframeToParentMessage,
  type ParentToIframeMessage,
} from "./bridge-protocol";
import type { ArtifactRenderProps } from "@/app/_artifacts/types";

const CONFIGURED_UMO_ORIGIN = process.env.NEXT_PUBLIC_UMO_ORIGIN?.replace(/\/$/, "");
const DEV_UMO_ORIGIN = process.env.NODE_ENV === "development" ? "http://127.0.0.1:3456" : "";
const UMO_ORIGIN = CONFIGURED_UMO_ORIGIN || DEV_UMO_ORIGIN;
const UMO_SRC = UMO_ORIGIN ? `${UMO_ORIGIN}/umo/index.html` : "";

export default function DocumentRender({ payload, readOnly, onChange }: ArtifactRenderProps<"document">) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const iframeReadyRef = useRef(false);
  const seqRef = useRef(0);
  const isUnsafeSameOrigin = typeof window !== "undefined" && UMO_ORIGIN === window.location.origin;

  // listener 闭包始终拿最新 props，但 useEffect 只注册一次（避免每次输入字符 add/remove）
  const stateRef = useRef({ payload, readOnly, onChange });

  useEffect(() => {
    stateRef.current = { payload, readOnly, onChange };
  });

  function sendInit() {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    const { payload: p, readOnly: ro } = stateRef.current;
    const msg: ParentToIframeMessage = {
      kind: BRIDGE_KINDS.init,
      seq: ++seqRef.current,
      content: p.content ?? "",
      readOnly: ro ?? false,
    };
    try {
      win.postMessage(msg, UMO_ORIGIN);
    } catch (err) {
      console.warn("[document-bridge] postMessage to iframe failed:", err);
    }
  }

  // payload / readOnly 变化时主动 push（已 ready 才发；未 ready 时由 ready handler 触发首次 init）
  useEffect(() => {
    if (iframeReadyRef.current) sendInit();
  }, [payload.content, readOnly]);

  useEffect(() => {
    function handler(e: MessageEvent) {
      if (e.source !== iframeRef.current?.contentWindow) return;
      if (e.origin !== UMO_ORIGIN) return;
      const data = e.data as Partial<IframeToParentMessage> | null;
      if (!data || typeof data !== "object" || !isBridgeKind(data.kind)) return;

      if (data.kind === BRIDGE_KINDS.ready) {
        iframeReadyRef.current = true;
        sendInit();
      } else if (data.kind === BRIDGE_KINDS.change && typeof data.content === "string") {
        const { readOnly: ro, onChange: oc, payload: p } = stateRef.current;
        if (ro) return;
        oc?.({ ...p, content: data.content });
      }
    }
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // iframe load 兜底：dev 下父页常用 localhost，Umo iframe 用 127.0.0.1
  // 隔离 origin。子端首次 ready 可能还不知道父 origin，因此父侧主动 init
  // 一次，让子端记录真实 parent origin，后续 change 才能稳定回传。
  function onIframeLoad() {
    iframeReadyRef.current = true;
    sendInit();
  }

  if (!UMO_SRC || isUnsafeSameOrigin) {
    return <DocumentBridgeUnavailable />;
  }

  return (
    <div className="flex h-full flex-col">
      <iframe
        ref={iframeRef}
        src={UMO_SRC}
        title="Umo Editor"
        onLoad={onIframeLoad}
        sandbox="allow-scripts allow-same-origin allow-forms"
        className="h-full w-full border-0 bg-fg-white"
      />
    </div>
  );
}

function DocumentBridgeUnavailable() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-8 text-center">
      <span className="text-sm font-semibold text-fg-grey-900">文档编辑器需要独立 origin</span>
      <p className="max-w-[360px] text-xs leading-relaxed text-fg-grey-700">
        为避免 same-origin iframe sandbox 失效，请配置 NEXT_PUBLIC_UMO_ORIGIN 指向独立域名后再启用 Umo 编辑器。
      </p>
    </div>
  );
}
