import React, { useState } from 'react';
import { Modal, Button, message, Typography } from 'antd';
import { CopyOutlined, DownloadOutlined } from '@ant-design/icons';
import { CodeGenerationResult } from '../types';

const { Text, Paragraph } = Typography;

interface CodeGenerationModalProps {
  visible: boolean;
  onClose: () => void;
  codeResult: CodeGenerationResult | null;
}

const CodeGenerationModal: React.FC<CodeGenerationModalProps> = ({
  visible,
  onClose,
  codeResult,
}) => {
  const [copied, setCopied] = useState(false);

  if (!visible || !codeResult) {
    return null;
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(codeResult.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = codeResult.code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadCode = () => {
    const blob = new Blob([codeResult.code], { type: 'text/python' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'autogen_workflow.py';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content code-modal">
        <div className="modal-header">
          <h2>生成的AutoGen代码</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="modal-body">
          {codeResult.errors && codeResult.errors.length > 0 && (
            <div className="error-section">
              <h3>⚠️ 警告和错误</h3>
              <ul className="error-list">
                {codeResult.errors.map((error, index) => (
                  <li key={index} className="error-item">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="code-section">
            <div className="code-header">
              <h3>Python代码</h3>
              <div className="code-actions">
                <button
                  className={`btn btn-secondary ${copied ? 'copied' : ''}`}
                  onClick={handleCopyCode}
                >
                  {copied ? '已复制!' : '复制代码'}
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleDownloadCode}
                >
                  下载文件
                </button>
              </div>
            </div>
            
            <div className="code-container">
              <pre className="code-block">
                <code className="python">{codeResult.code}</code>
              </pre>
            </div>
          </div>
          
          {codeResult.dependencies && codeResult.dependencies.length > 0 && (
            <div className="dependencies-section">
              <h3>依赖包</h3>
              <div className="dependencies-list">
                {codeResult.dependencies.map((dep, index) => (
                  <span key={index} className="dependency-tag">
                    {dep}
                  </span>
                ))}
              </div>
              <div className="install-command">
                <strong>安装命令:</strong>
                <code>pip install {codeResult.dependencies.join(' ')}</code>
              </div>
            </div>
          )}
          
          <div className="usage-section">
            <h3>使用说明</h3>
            <ol>
              <li>确保已安装所需的依赖包</li>
              <li>设置OpenAI API密钥环境变量</li>
              <li>运行生成的Python代码</li>
              <li>根据需要调整模型配置和参数</li>
            </ol>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeGenerationModal;