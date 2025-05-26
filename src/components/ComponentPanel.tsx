import React from 'react';

interface ComponentPanelProps {
  onAddNode: (type: 'agent' | 'runner' | 'functionTool', position: { x: number; y: number }) => void;
}

const ComponentPanel: React.FC<ComponentPanelProps> = ({ onAddNode }) => {
  const onDragStart = (event: React.DragEvent, nodeType: 'agent' | 'runner' | 'functionTool') => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleAddNode = (type: 'agent' | 'runner' | 'functionTool') => {
    // 在画布中央添加节点
    const position = {
      x: Math.random() * 400 + 200,
      y: Math.random() * 300 + 150,
    };
    onAddNode(type, position);
  };

  return (
    <div className="component-panel">
      <div className="panel-header">
        <h3>组件库</h3>
      </div>
      
      <div className="component-list">
        {/* Agent节点 */}
        <div
          className="component-item agent-component"
          draggable
          onDragStart={(e) => onDragStart(e, 'agent')}
          onClick={() => handleAddNode('agent')}
        >
          <div className="component-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="4" stroke="#3498db" strokeWidth="2" fill="#e3f2fd"/>
              <circle cx="12" cy="9" r="2" fill="#3498db"/>
              <path d="M8 15c0-2 1.79-3 4-3s4 1 4 3" stroke="#3498db" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
          <div className="component-info">
            <div className="component-name">Agent</div>
            <div className="component-desc">智能代理节点</div>
          </div>
        </div>

        {/* Runner节点 */}
        <div
          className="component-item runner-component"
          draggable
          onDragStart={(e) => onDragStart(e, 'runner')}
          onClick={() => handleAddNode('runner')}
        >
          <div className="component-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="4" stroke="#e74c3c" strokeWidth="2" fill="#ffebee"/>
              <polygon points="10,8 10,16 16,12" fill="#e74c3c"/>
            </svg>
          </div>
          <div className="component-info">
            <div className="component-name">Runner</div>
            <div className="component-desc">执行器节点</div>
          </div>
        </div>

        {/* Function Tool节点 */}
        <div
          className="component-item function-component"
          draggable
          onDragStart={(e) => onDragStart(e, 'functionTool')}
          onClick={() => handleAddNode('functionTool')}
        >
          <div className="component-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="4" stroke="#f39c12" strokeWidth="2" fill="#fff8e1"/>
              <path d="M8 12h8M12 8v8" stroke="#f39c12" strokeWidth="2"/>
              <circle cx="8" cy="8" r="1" fill="#f39c12"/>
              <circle cx="16" cy="8" r="1" fill="#f39c12"/>
              <circle cx="8" cy="16" r="1" fill="#f39c12"/>
              <circle cx="16" cy="16" r="1" fill="#f39c12"/>
            </svg>
          </div>
          <div className="component-info">
            <div className="component-name">Function Tool</div>
            <div className="component-desc">函数工具节点</div>
          </div>
        </div>
      </div>

      <div className="panel-footer">
        <div className="usage-tips">
          <h4>使用说明</h4>
          <ul>
            <li>拖拽组件到画布创建节点</li>
            <li>连接节点建立工作流关系</li>
            <li>点击节点配置属性参数</li>
            <li>生成AutoGen代码运行</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ComponentPanel;