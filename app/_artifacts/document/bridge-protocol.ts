/**
 * Document artifact iframe ↔ parent postMessage 协议。
 *
 * 双端共享（forge-agent React 父侧 + umo-bridge Vue iframe 子侧），
 * 两端 import 同一份避免字符串散落。
 */

export const BRIDGE_KINDS = {
  init: "umo:init",
  ready: "umo:ready",
  change: "umo:change",
} as const;

export type BridgeKind = (typeof BRIDGE_KINDS)[keyof typeof BRIDGE_KINDS];

/** 父 → iframe */
export type ParentToIframeMessage = {
  kind: typeof BRIDGE_KINDS.init;
  seq: number;
  content: string;
  readOnly: boolean;
};

/** iframe → 父 */
export type IframeToParentMessage =
  | { kind: typeof BRIDGE_KINDS.ready }
  | { kind: typeof BRIDGE_KINDS.change; content: string };

export type BridgeMessage = ParentToIframeMessage | IframeToParentMessage;

/** Exhaustive check helper —— 收到未知 kind 时记录但不崩。 */
export function isBridgeKind(value: unknown): value is BridgeKind {
  return (
    value === BRIDGE_KINDS.init ||
    value === BRIDGE_KINDS.ready ||
    value === BRIDGE_KINDS.change
  );
}
