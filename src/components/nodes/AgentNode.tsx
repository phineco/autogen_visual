import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { AgentNodeData } from '../../types';

const AgentNode: React.FC<NodeProps<AgentNodeData>> = ({ data, selected }) => {
  return (
    <div className={`custom-node agent-node ${selected ? 'selected' : ''}`}>
      {/* 输入连接点 */}
      <Handle
        type="target"
        position={Position.Left}
        id="agent-input"
        className="handle handle-input"
      />
      
      {/* 节点内容 */}
      <div className="node-header agent-header">
        <div className="node-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="9" r="2" fill="#3498db"/>
            <path d="M8 15c0-2 1.79-3 4-3s4 1 4 3" stroke="#3498db" strokeWidth="1.5" fill="none"/>
          </svg>
        </div>
        <div className="node-title">Agent</div>
      </div>
      
      <div className="node-body">
        <div className="node-field">
          <label>名称:</label>
          <span>{data.name || 'Unnamed Agent'}</span>
        </div>
        
        {data.description && (
          <div className="node-field">
            <label>描述:</label>
            <span className="field-description">{data.description}</span>
          </div>
        )}
        
        {data.system_message && (
          <div className="node-field">
            <label>系统消息:</label>
            <span className="field-message">
              {data.system_message.length > 50 
                ? `${data.system_message.substring(0, 50)}...` 
                : data.system_message
              }
            </span>
          </div>
        )}
        
        {data.output_type && data.output_type !== 'none' && (
          <div className="node-field">
            <label>输出类型:</label>
            <span className="field-tag">{data.output_type}</span>
          </div>
        )}
      </div>
      
      {/* 输出连接点 */}
      <Handle
        type="source"
        position={Position.Right}
        id="agent-output"
        className="handle handle-output"
      />
      
      {/* 底部连接点用于连接到Runner */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="agent-to-runner"
        className="handle handle-runner"
      />
    </div>
  );
};

export default AgentNode;