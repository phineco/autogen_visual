import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow';
import { RunnerNodeData } from '../../types';

const RunnerNode: React.FC<NodeProps<RunnerNodeData>> = ({ data, selected, id }) => {
  const { setNodes } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(data.name || 'Unnamed Runner');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Update editingName if data.name changes from props (e.g. undo/redo)
    if (!isEditing) {
      setEditingName(data.name || 'Unnamed Runner');
    }
  }, [data.name, isEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleNameClick = () => {
    setEditingName(data.name || 'Unnamed Runner');
    setIsEditing(true);
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditingName(event.target.value);
  };

  const saveName = () => {
    const finalName = editingName.trim() || 'Unnamed Runner';
    if (finalName !== data.name) {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === id
            ? { ...node, data: { ...node.data, name: finalName } }
            : node
        )
      );
    }
    setEditingName(finalName); // Ensure state reflects trimmed/default name
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
      setEditingName(data.name || 'Unnamed Runner'); // Revert to original name from data
      setIsEditing(false);
    }
  };

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
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editingName}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKeyDown}
            className="editing-name-input"
            style={{ width: 'calc(100% - 20px)', margin: '0 5px' }} // Adjust width and margin
          />
        ) : (
          <div className="node-title" onClick={handleNameClick} style={{ cursor: 'text', flexGrow: 1, textAlign: 'center' }}>
            {data.name || 'Unnamed Runner'}
          </div>
        )}
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