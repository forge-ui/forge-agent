"use client";

import { ChatInputBar, type ChatInputBarToggle } from "@forge-ui-official/core";

export type PillAction = {
  id: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  /** 点击后是否关闭菜单（一次性 action 设 true，toggle 类 action 保持 false） */
  closeOnClick?: boolean;
  onClick: () => void;
};

export function ChatPillBar({
  value,
  onChange,
  onSend,
  placeholder,
  actions,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  placeholder?: string;
  actions?: PillAction[];
  maxHeight?: number;
}) {
  const toggles: ChatInputBarToggle[] | undefined = actions?.map((a) => ({
    id: a.id,
    label: a.label,
    icon: a.icon,
    active: a.active,
    onClick: a.onClick,
  }));

  return (
    <ChatInputBar
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onSend={() => onSend()}
      multiline
      rows={1}
      toggles={toggles}
      showAttachment={false}
      className="shadow-sm"
    />
  );
}
