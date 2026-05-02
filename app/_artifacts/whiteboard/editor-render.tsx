"use client";

/**
 * Heavy Excalidraw editor. Loaded only after the whiteboard gate.
 */

import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import type { ArtifactRenderProps } from "@/app/_artifacts/types";

type ExcalidrawElement = Record<string, unknown>;

export default function WhiteboardEditorRender({
  payload,
  readOnly,
  onChange,
}: ArtifactRenderProps<"whiteboard">) {
  return (
    <div className="h-full w-full">
      <Excalidraw
        // 切 artifact 时 ArtifactPanel 用 instance key 强制 remount，组件内部
        // 不需要再做额外 cleanup。
        initialData={{
          elements: payload.elements as never,
          appState: { viewBackgroundColor: "var(--fg-grey-50)", ...(payload.appState ?? {}) },
        }}
        viewModeEnabled={readOnly}
        onChange={(elements, appState) => {
          if (readOnly) return;
          onChange?.({
            elements: elements as unknown as ExcalidrawElement[],
            appState: appState as unknown as Record<string, unknown>,
          });
        }}
      />
    </div>
  );
}
