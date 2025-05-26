import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  NodeMouseHandler,
  ReactFlowProvider,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button, Layout, message } from 'antd';
import ComponentPanel from './components/ComponentPanel';
import { PropertyPanel } from './components/PropertyPanel';
import CodeGenerationModal from './components/CodeGenerationModal';
import AgentNode from './components/nodes/AgentNode';
import RunnerNode from './components/nodes/RunnerNode';
import FunctionToolNode from './components/nodes/FunctionToolNode';
import { WorkflowNode, WorkflowEdge, NodeType, AgentNodeData, RunnerNodeData, FunctionToolNodeData } from './types';
import { generateCode } from './utils/codeGenerator';
import './index.css';

const nodeTypes = {
  agent: AgentNode,
  runner: RunnerNode,
  functionTool: FunctionToolNode,
};

const App: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<WorkflowNode>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node<WorkflowNode> | null>(null);
  const [isCodeModalVisible, setIsCodeModalVisible] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<any>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  // 删除选中的节点
  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) => eds.filter((edge) => 
        edge.source !== selectedNode.id && edge.target !== selectedNode.id
      ));
      setSelectedNode(null);
      message.success('节点已删除');
    }
  }, [selectedNode, setNodes, setEdges]);

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNode) {
        event.preventDefault();
        deleteSelectedNode();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNode, deleteSelectedNode]);

  const isValidConnection = useCallback((connection: Connection) => {
    const sourceNode = nodes.find(node => node.id === connection.source);
    const targetNode = nodes.find(node => node.id === connection.target);
    
    if (!sourceNode || !targetNode) return false;
    
    // 连接规则验证
    if (sourceNode.type === 'agent' && targetNode.type === 'agent') {
      return true; // handoff
    }
    if (sourceNode.type === 'functionTool' && targetNode.type === 'agent') {
      return true; // tool
    }
    if (sourceNode.type === 'agent' && targetNode.type === 'runner') {
      return true; // execute
    }
    
    return false;
  }, [nodes]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (isValidConnection(params)) {
        const sourceNode = nodes.find(node => node.id === params.source);
        const targetNode = nodes.find(node => node.id === params.target);
        
        let edgeType: 'handoff' | 'tool' | 'execute' = 'handoff';
        if (sourceNode?.type === 'functionTool' && targetNode?.type === 'agent') {
          edgeType = 'tool';
        } else if (sourceNode?.type === 'agent' && targetNode?.type === 'runner') {
          edgeType = 'execute';
        }
        
        const newEdge = {
          ...params,
          type: edgeType,
          id: `${params.source}-${params.target}`,
        };
        
        setEdges((eds) => addEdge(newEdge, eds));
      }
    },
    [isValidConnection, nodes, setEdges]
  );

  const updateNodeData = useCallback((nodeId: string, newData: Partial<AgentNodeData | RunnerNodeData | FunctionToolNodeData>) => {
    setNodes((nds) => 
      nds.map((node) => {
        if (node.id === nodeId) {
          const updatedNode = {
            ...node,
            data: { ...node.data, ...newData },
          };
          // 更新选中节点
          if (selectedNode && selectedNode.id === nodeId) {
            setSelectedNode(updatedNode);
          }
          return updatedNode;
        }
        return node;
      })
    );
  }, [selectedNode, setNodes]);

  const addNode = useCallback((type: NodeType) => {
    const id = `${type}-${Date.now()}`;
    let data: AgentNodeData | RunnerNodeData | FunctionToolNodeData;
    
    switch (type) {
      case 'agent':
        data = {
          id,
          name: 'New Agent',
          description: '',
          system_message: '',
          output_type: 'text',
        };
        break;
      case 'runner':
        data = {
          id,
          name: 'New Runner', // Added name field
          input: '',
          context: '',
          execution_mode: 'sync',
        };
        break;
      case 'functionTool':
        data = {
          id,
          name: 'new_function',
          parameters: [],
          returnType: 'str',
          implementation: '',
        };
        break;
    }
    
    setNodes((nds) => nds.concat({
      id,
      type,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data,
    }));
  }, [setNodes]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      
      if (typeof type === 'undefined' || !type || !reactFlowInstance) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      addNode(type as NodeType);
    },
    [reactFlowInstance, addNode]
  );

  const handleGenerateCode = useCallback(() => {
    const workflowNodes: WorkflowNode[] = nodes.map(node => ({
      id: node.id,
      type: node.type as NodeType,
      position: node.position,
      data: node.data
    }));
    const result = generateCode(workflowNodes, edges);
    setGeneratedCode(result);
    setIsCodeModalVisible(true);
  }, [nodes, edges]);

  const handleSaveWorkflow = useCallback(() => {
    const workflow = { nodes, edges };
    const dataStr = JSON.stringify(workflow, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'workflow.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [nodes, edges]);

  const handleLoadWorkflow = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workflow = JSON.parse(e.target?.result as string);
          setNodes(workflow.nodes || []);
          setEdges(workflow.edges || []);
        } catch (error) {
          console.error('Failed to load workflow:', error);
        }
      };
      reader.readAsText(file);
    }
  }, [setNodes, setEdges]);

  const onNodeClick: NodeMouseHandler = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  return (
    <div className="app">
      {/* 顶部导航栏 */}
      <header className="app-header">
        <div className="header-left">
          <h1>AutoGen Agents Workflow Designer</h1>
        </div>
        <div className="header-right">
          <input
            type="file"
            accept=".json"
            onChange={handleLoadWorkflow}
            style={{ display: 'none' }}
            id="load-workflow"
          />
          <button
            className="btn btn-secondary"
            onClick={() => document.getElementById('load-workflow')?.click()}
          >
            加载工作流
          </button>
          <button className="btn btn-secondary" onClick={handleSaveWorkflow}>
            保存工作流
          </button>
          <button className="btn btn-primary" onClick={handleGenerateCode}>
            生成代码
          </button>
        </div>
      </header>

      <div className="app-content">
        {/* 左侧组件面板 */}
        <ComponentPanel onAddNode={addNode} />

        {/* 中央画布区域 */}
        <div className="canvas-container">
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-left"
            >
              <Controls />
              <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
          </ReactFlowProvider>
        </div>

        {/* 右侧属性面板 */}
        <PropertyPanel
          selectedNode={selectedNode}
          onUpdateNode={updateNodeData}
          onDeleteNode={deleteSelectedNode}
        />
      </div>

      {/* 代码生成弹窗 */}
      <CodeGenerationModal
        visible={isCodeModalVisible}
        onClose={() => setIsCodeModalVisible(false)}
        codeResult={generatedCode}
      />
    </div>
  );
}

export default App;