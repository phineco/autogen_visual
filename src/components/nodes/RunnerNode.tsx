import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { RunnerNodeData } from '../../types';

const RunnerNode: React.FC<NodeProps<RunnerNodeData>> = ({ data, selected }) => {
  return (
    <div className={`custom-node runner-node ${selected ? 'selected' : ''}`}>
      {/* 输入连接点 */}
      <Handle
        type="target"
        position={Position.Top}
        id="runner-input"
        className="handle handle-input"
      />
      
      {/* 节点内容 */}
      <div className="node-header runner-header">
        <div className="node-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <polygon points="10,8 10,16 16,12" fill="#e74c3c"/>
          </svg>
        </div>
        <div className="node-title">Runner</div>
      </div>
      
      <div className="node-body">
        <div className="node-field">
          <label>执行模式:</label>
          <span className={`execution-mode ${data.execution_mode}`}>
            {data.execution_mode === 'async' ? '异步' : '同步'}
          </span>
        </div>
        
        {data.input && (
          <div className="node-field">
            <label>任务:</label>
            <span className="field-task">
              {data.input.length > 40 
                ? `${data.input.substring(0, 40)}...` 
                : data.input
              }
            </span>
          </div>
        )}
        
        {data.context && (
          <div className="node-field">
            <label>上下文:</label>
            <span className="field-context">
              {data.context.length > 30 
                ? `${data.context.substring(0, 30)}...` 
                : data.context
              }
            </span>
          </div>
        )}
      </div>
      
      <div className="node-status">
        <div className="status-indicator ready">
          <span className="status-dot"></span>
          <span className="status-text">就绪</span>
        </div>
      </div>
    </div>
  );
};

export default RunnerNode;