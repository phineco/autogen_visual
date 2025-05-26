import React from 'react';
import { Form, Input, Select, Button, Space } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Node } from 'reactflow';
import { WorkflowNode, AgentNodeData, RunnerNodeData, FunctionToolNodeData } from '../types';

interface PropertyPanelProps {
  selectedNode: Node<WorkflowNode> | null;
  onUpdateNode: (nodeId: string, data: Partial<AgentNodeData | RunnerNodeData | FunctionToolNodeData>) => void;
  onDeleteNode?: () => void;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({ selectedNode, onUpdateNode, onDeleteNode }) => {
  if (!selectedNode) {
    return (
      <div className="property-panel">
        <div className="property-panel-header">
          <h3>属性面板</h3>
        </div>
        <div className="property-panel-content">
          <p>请选择一个节点来编辑其属性</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: string, value: any) => {
    onUpdateNode(selectedNode.id, { [field]: value });
  };

  const handleDelete = () => {
    if (onDeleteNode) {
      onDeleteNode();
    }
  };

  const handleParameterAdd = () => {
    if (selectedNode.type === 'functionTool') {
      const currentParams = (selectedNode.data as FunctionToolNodeData).parameters || [];
      const newParam: Parameter = {
        name: 'new_param',
        type: 'str',
        description: '',
        required: true,
      };
      handleInputChange('parameters', [...currentParams, newParam]);
    }
  };

  const handleParameterUpdate = (index: number, field: string, value: any) => {
    if (selectedNode.type === 'functionTool') {
      const currentParams = (selectedNode.data as FunctionToolNodeData).parameters || [];
      const updatedParams = currentParams.map((param, i) => 
        i === index ? { ...param, [field]: value } : param
      );
      handleInputChange('parameters', updatedParams);
    }
  };

  const handleParameterDelete = (index: number) => {
    if (selectedNode.type === 'functionTool') {
      const currentParams = (selectedNode.data as FunctionToolNodeData).parameters || [];
      const updatedParams = currentParams.filter((_, i) => i !== index);
      handleInputChange('parameters', updatedParams);
    }
  };

  const handleParameterChange = (index: number, field: string, value: string) => {
    const parameters = [...(selectedNode.data.parameters || [])];
    parameters[index] = { ...parameters[index], [field]: value };
    onUpdateNode(selectedNode.id, { parameters });
  };

  const addParameter = () => {
    const parameters = [...(selectedNode.data.parameters || [])];
    parameters.push({ name: '', type: 'str', description: '' });
    onUpdateNode(selectedNode.id, { parameters });
  };

  const removeParameter = (index: number) => {
    const parameters = [...(selectedNode.data.parameters || [])];
    parameters.splice(index, 1);
    onUpdateNode(selectedNode.id, { parameters });
  };

  const renderAgentProperties = () => {
    const agentData = selectedNode.data as AgentNodeData;
    return (
      <div className="property-section">
        <h4>Agent 属性</h4>
        <Form.Item label="名称">
          <Input
            value={agentData.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Agent名称"
          />
        </Form.Item>
        <Form.Item label="描述">
          <Input.TextArea
            value={agentData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Agent描述"
            rows={3}
          />
        </Form.Item>
        <Form.Item label="系统消息">
          <Input.TextArea
            value={agentData.system_message || ''}
            onChange={(e) => handleInputChange('system_message', e.target.value)}
            placeholder="系统消息模板"
            rows={4}
          />
        </Form.Item>
        <Form.Item label="输出类型">
          <Select
            value={agentData.output_type || 'text'}
            onChange={(value) => handleInputChange('output_type', value)}
          >
            <Select.Option value="text">文本</Select.Option>
            <Select.Option value="json">JSON</Select.Option>
            <Select.Option value="structured">结构化</Select.Option>
          </Select>
        </Form.Item>
        {agentData.output_type === 'structured' && (
          <Form.Item label="Pydantic模型">
            <Input.TextArea
              value={agentData.pydantic_model || ''}
              onChange={(e) => handleInputChange('pydantic_model', e.target.value)}
              placeholder="Pydantic模型定义"
              rows={6}
            />
          </Form.Item>
        )}
      </div>
    );
  };

  const renderRunnerProperties = () => {
    const runnerData = selectedNode.data as RunnerNodeData;
    return (
      <div className="property-section">
        <h4>Runner 属性</h4>
        <Form.Item label="输入">
          <Input.TextArea
            value={runnerData.input || ''}
            onChange={(e) => handleInputChange('input', e.target.value)}
            placeholder="输入Runner的输入内容"
            rows={3}
          />
        </Form.Item>
        <Form.Item label="执行模式">
          <Select
            value={runnerData.execution_mode || 'sync'}
            onChange={(value) => handleInputChange('execution_mode', value)}
          >
            <Select.Option value="sync">同步</Select.Option>
            <Select.Option value="async">异步</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="上下文">
          <Input.TextArea
            value={runnerData.context || ''}
            onChange={(e) => handleInputChange('context', e.target.value)}
            placeholder="输入执行上下文"
            rows={4}
          />
        </Form.Item>
      </div>
    );
  };

  const renderFunctionToolProperties = () => {
    const functionData = selectedNode.data as FunctionToolNodeData;
    return (
      <div className="property-section">
        <h4>Function Tool 属性</h4>
        <Form.Item label="函数名">
          <Input
            value={functionData.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="输入函数名"
          />
        </Form.Item>
        <Form.Item label="返回类型">
          <Input
            value={functionData.returnType || ''}
            onChange={(e) => handleInputChange('returnType', e.target.value)}
            placeholder="返回类型 (如: str, int, List[str])"
          />
        </Form.Item>
        <Form.Item label="参数列表">
          <div className="parameters-list">
            {(functionData.parameters || []).map((param, index) => (
              <div key={index} className="parameter-item">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Space>
                    <Input
                      value={param.name}
                      onChange={(e) => handleParameterUpdate(index, 'name', e.target.value)}
                      placeholder="参数名"
                      style={{ width: 120 }}
                    />
                    <Input
                      value={param.type}
                      onChange={(e) => handleParameterUpdate(index, 'type', e.target.value)}
                      placeholder="类型"
                      style={{ width: 100 }}
                    />
                    <Input
                      value={param.description}
                      onChange={(e) => handleParameterUpdate(index, 'description', e.target.value)}
                      placeholder="描述"
                      style={{ flex: 1 }}
                    />
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => handleParameterDelete(index)}
                      danger
                    />
                  </Space>
                </Space>
              </div>
            ))}
            <Button
              type="dashed"
              onClick={handleParameterAdd}
              icon={<PlusOutlined />}
              style={{ width: '100%', marginTop: 8 }}
            >
              添加参数
            </Button>
          </div>
        </Form.Item>
        <Form.Item label="函数实现">
          <Input.TextArea
            value={functionData.implementation || ''}
            onChange={(e) => handleInputChange('implementation', e.target.value)}
            placeholder="输入函数实现代码"
            rows={8}
          />
        </Form.Item>
      </div>
    );
  };

  const getNodeTypeLabel = (type: string) => {
    switch (type) {
      case 'agent': return 'Agent节点';
      case 'runner': return 'Runner节点';
      case 'functionTool': return 'Function Tool节点';
      default: return '未知节点';
    }
  };

  return (
    <div className="property-panel">
      <div className="panel-header">
        <div className="panel-header-left">
          <h3>属性面板</h3>
          <div className="node-type-badge">
            {getNodeTypeLabel(selectedNode.type)}
          </div>
        </div>
        <div className="panel-header-right">
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />}
            onClick={handleDelete}
            title="删除节点 (Delete/Backspace)"
          >
            删除
          </Button>
        </div>
      </div>
      
      <div className="panel-content">
        <div className="node-info">
          <div className="node-id">ID: {selectedNode.id}</div>
        </div>
        
        <div className="properties-form">
          {selectedNode.type === 'agent' && renderAgentProperties()}
          {selectedNode.type === 'runner' && renderRunnerProperties()}
          {selectedNode.type === 'functionTool' && renderFunctionToolProperties()}
        </div>
      </div>
    </div>
  );
};

export default PropertyPanel;