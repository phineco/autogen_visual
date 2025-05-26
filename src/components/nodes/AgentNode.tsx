import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow';
import { AgentNodeData } from '../../types';

const AgentNode: React.FC<NodeProps<AgentNodeData>> = ({ data, selected, id }) => {
  const { setNodes } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(data.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select(); // Select all text when focused
    }
  }, [isEditing]);

  const handleNameClick = () => {
    setEditingName(data.name || '');
    setIsEditing(true);
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditingName(event.target.value);
  };

  const saveName = () => {
    if (editingName !== data.name) {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === id
            ? { ...node, data: { ...node.data, name: editingName } }
            : node
        )
      );
    }
  };

  const handleNameBlur = () => {
    saveName();
    setIsEditing(false);
  };

  const handleNameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveName();
      setIsEditing(false);
    } else if (event.key === 'Escape') {
      setIsEditing(false);
      // No save, editingName will be reset on next click or if component re-renders with new data.name
    }
  };

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
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editingName}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              className="editing-name-input"
            />
          ) : (
            <span onClick={handleNameClick} style={{ cursor: 'text' }}>
              {data.name || 'Unnamed Agent'}
            </span>
          )}
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