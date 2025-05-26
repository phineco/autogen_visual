// 节点数据类型
export interface AgentNodeData {
  id: string;
  name: string;
  description: string;
  system_message: string;
  output_type: 'text' | 'json' | 'structured';
  pydantic_model?: string;
}

export interface RunnerNodeData {
  id: string;
  name?: string; // Added for inline editing
  input: string;
  context: string;
  execution_mode: 'sync' | 'async';
}

export interface FunctionToolNodeData {
  id: string;
  name: string;
  parameters: Parameter[];
  returnType: string;
  implementation: string;
}

export interface Parameter {
  id: string;
  name: string;
  type: 'str' | 'int' | 'float' | 'bool' | 'list' | 'dict';
  description?: string;
  required: boolean;
}

export type NodeType = 'agent' | 'runner' | 'functionTool';

// 工作流节点类型
export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: AgentNodeData | RunnerNodeData | FunctionToolNodeData;
}

// 工作流边类型
export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type: 'handoff' | 'tool' | 'execute';
}

// 工作流状态
export interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNode: WorkflowNode | null;
}

// 代码生成结果
export interface CodeGenerationResult {
  code: string;
  errors: string[];
  warnings: string[];
  dependencies: string[];
}