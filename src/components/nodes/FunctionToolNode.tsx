import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow';
import { FunctionToolNodeData } from '../../types';

const FunctionToolNode: React.FC<NodeProps<FunctionToolNodeData>> = ({ data, selected, id }) => {
  const { setNodes } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(data.name || 'unnamed_function');
  const inputRef = useRef<HTMLInputElement>(null);

  // Update editingName if data.name changes from props (e.g. undo/redo or property panel)
  // and not currently editing
  useEffect(() => {
    if (!isEditing) {
      setEditingName(data.name || 'unnamed_function');
    }
  }, [data.name, isEditing]);

  // Focus and select input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleNameClick = () => {
    setEditingName(data.name || 'unnamed_function'); // Ensure current name is used
    setIsEditing(true);
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditingName(event.target.value);
  };

  const saveName = () => {
    const finalName = editingName.trim() || 'unnamed_function';
    if (finalName !== data.name) {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === id
            ? { ...node, data: { ...node.data, name: finalName } }
            : node
        )
      );
    }
    setEditingName(finalName); // Update state to reflect trimmed/defaulted name
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
      setEditingName(data.name || 'unnamed_function'); // Revert to original name from data
      setIsEditing(false);
    }
  };

  return (
    <div className={`custom-node function-node ${selected ? 'selected' : ''}`}>
      {/* 节点内容 */}
      <div className="node-header function-header">
        <div className="node-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M8 12h8M12 8v8" stroke="#f39c12" strokeWidth="2"/>
            <circle cx="8" cy="8" r="1" fill="#f39c12"/>
            <circle cx="16" cy="8" r="1" fill="#f39c12"/>
            <circle cx="8" cy="16" r="1" fill="#f39c12"/>
            <circle cx="16" cy="16" r="1" fill="#f39c12"/>
          </svg>
        </div>
        <div className="node-title">Function Tool</div>
      </div>
      
      <div className="node-body">
        <div className="node-field">
          <label>函数名:</label>
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
            <span
              className="function-name"
              onClick={handleNameClick}
              style={{ cursor: 'text' }}
            >
              {data.name || 'unnamed_function'}
            </span>
          )}
        </div>
        
        <div className="node-field">
          <label>返回类型:</label>
          <span className="return-type">{data.returnType || 'str'}</span>
        </div>
        
        {data.parameters && data.parameters.length > 0 && (
          <div className="node-field">
            <label>参数:</label>
            <div className="parameters-preview">
              {data.parameters.slice(0, 3).map((param: any, index: number) => (
                <span key={index} className="parameter-tag">
                  {param.name}: {param.type}
                </span>
              ))}
              {data.parameters.length > 3 && (
                <span className="parameter-more">+{data.parameters.length - 3} more</span>
              )}
            </div>
          </div>
        )}
        
        {data.implementation && (
          <div className="node-field">
            <label>实现:</label>
            <div className="implementation-preview">
              <code>
                {data.implementation.split('\n')[0].length > 30
                  ? `${data.implementation.split('\n')[0].substring(0, 30)}...`
                  : data.implementation.split('\n')[0]
                }
              </code>
            </div>
          </div>
        )}
      </div>
      
      <div className="node-footer">
        <div className="function-status">
          <span className="status-indicator">
            {data.implementation ? '✓' : '⚠'}
          </span>
          <span className="status-text">
            {data.implementation ? '已实现' : '待实现'}
          </span>
        </div>
      </div>
      
      {/* 输出连接点 */}
      <Handle
        type="source"
        position={Position.Right}
        id="function-output"
        className="handle handle-output"
      />
    </div>
  );
};

export default FunctionToolNode;