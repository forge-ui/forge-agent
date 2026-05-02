"use client";

/**
 * Diagram interactive Render — ReactFlow / xyflow。
 *
 * payload.source 在 interactive mode 下解析为 JSON：
 *   { nodes: Node[], edges: Edge[] }
 * 用户可拖拽节点 / 连线，onChange 回写 JSON。
 *
 * P4 简版：固定 default node type，不带自定义节点类型 / 自定义 edge style。
 */

import { useCallback, useState } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  applyEdgeChanges,
  applyNodeChanges,
  type OnEdgesChange,
  type OnNodesChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { ArtifactRenderProps } from "@/app/_artifacts/types";

export default function InteractiveDiagramRender({
  payload,
  readOnly,
  onChange,
}: ArtifactRenderProps<"diagram">) {
  return (
    <ReactFlowProvider>
      <Inner payload={payload} readOnly={readOnly} onChange={onChange} />
    </ReactFlowProvider>
  );
}

type FlowData = { nodes: Node[]; edges: Edge[] };

const DEFAULT_DATA: FlowData = {
  nodes: [{ id: "1", position: { x: 100, y: 100 }, data: { label: "起点" } }],
  edges: [],
};

function parseFlowData(source: string): FlowData {
  try {
    const parsed = JSON.parse(source);
    if (parsed && Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
      return parsed as FlowData;
    }
  } catch {
    /* fall through */
  }
  return DEFAULT_DATA;
}

function Inner({
  payload,
  readOnly,
  onChange,
}: ArtifactRenderProps<"diagram">) {
  const [{ nodes, edges }, setData] = useState<FlowData>(() => parseFlowData(payload.source));

  const commit = useCallback((next: FlowData) => {
    setData(next);
    onChange?.({ ...payload, source: JSON.stringify(next, null, 2) });
  }, [onChange, payload]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => commit({ nodes: applyNodeChanges(changes, nodes), edges }),
    [commit, nodes, edges],
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => commit({ nodes, edges: applyEdgeChanges(changes, edges) }),
    [commit, nodes, edges],
  );
  const onConnect = useCallback(
    (params: Connection) => commit({ nodes, edges: addEdge(params, edges) }),
    [commit, nodes, edges],
  );

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readOnly ? undefined : onNodesChange}
        onEdgesChange={readOnly ? undefined : onEdgesChange}
        onConnect={readOnly ? undefined : onConnect}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
