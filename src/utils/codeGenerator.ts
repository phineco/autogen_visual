import { WorkflowNode, WorkflowEdge, CodeGenerationResult, AgentNodeData, RunnerNodeData, FunctionToolNodeData } from '../types';

export function generateCode(nodes: WorkflowNode[], edges: WorkflowEdge[]): CodeGenerationResult {
  const errors: string[] = [];
  const dependencies = ['autogen-agentchat', 'autogen-ext'];
  
  // 验证工作流
  const validationErrors = validateWorkflow(nodes, edges);
  errors.push(...validationErrors);
  
  // 分类节点
  const agentNodes = nodes.filter(n => n.type === 'agent') as (WorkflowNode & { data: AgentNodeData })[];
  const runnerNodes = nodes.filter(n => n.type === 'runner') as (WorkflowNode & { data: RunnerNodeData })[];
  const functionNodes = nodes.filter(n => n.type === 'functionTool') as (WorkflowNode & { data: FunctionToolNodeData })[];
  
  // 构建连接关系映射
  const connections = buildConnectionMap(edges);
  
  // 生成代码段
  const imports = generateImports(nodes, edges);
  const pydanticModels = generatePydanticModels(agentNodes);
  const functionTools = generateFunctionTools(functionNodes);
  const modelClient = generateModelClient();
  const agents = generateAgents(agentNodes, connections);
  const runners = generateRunners(runnerNodes, agentNodes, connections);
  const mainFunction = generateMainFunction(runnerNodes, agentNodes);
  
  // 组合完整代码
  const codeParts = [
    imports,
    pydanticModels,
    functionTools,
    modelClient,
    agents,
    runners,
    mainFunction
  ].filter(part => part.trim().length > 0);
  
  const code = codeParts.join('\n\n');
  
  return {
    code,
    errors,
    dependencies
  };
}

function validateWorkflow(nodes: WorkflowNode[], edges: WorkflowEdge[]): string[] {
  const errors: string[] = [];
  
  if (nodes.length === 0) {
    errors.push('工作流中没有节点');
    return errors;
  }
  
  const agentNodes = nodes.filter(n => n.type === 'agent');
  const runnerNodes = nodes.filter(n => n.type === 'runner');
  
  if (agentNodes.length === 0) {
    errors.push('工作流中至少需要一个Agent节点');
  }
  
  if (runnerNodes.length === 0) {
    errors.push('工作流中至少需要一个Runner节点来执行任务');
  }
  
  // 检查Runner是否连接到Agent
  runnerNodes.forEach(runner => {
    const hasAgentConnection = edges.some(edge => 
      edge.target === runner.id && nodes.find(n => n.id === edge.source)?.type === 'agent'
    );
    if (!hasAgentConnection) {
      errors.push(`Runner节点 "${runner.data.input || runner.id}" 没有连接到任何Agent`);
    }
  });
  
  // 检查Agent名称是否唯一
  const agentNames = agentNodes.map(n => n.data.name).filter(name => name);
  const duplicateNames = agentNames.filter((name, index) => agentNames.indexOf(name) !== index);
  if (duplicateNames.length > 0) {
    errors.push(`Agent名称重复: ${duplicateNames.join(', ')}`);
  }
  
  return errors;
}

function buildConnectionMap(edges: WorkflowEdge[]) {
  const connections: { [key: string]: string[] } = {};
  
  edges.forEach(edge => {
    if (!connections[edge.target]) {
      connections[edge.target] = [];
    }
    connections[edge.target].push(edge.source);
  });
  
  return connections;
}

function generateImports(nodes: WorkflowNode[], edges: WorkflowEdge[]): string {
  const imports = [
    'import asyncio',
    'from autogen_agentchat.agents import AssistantAgent',
    'from autogen_ext.models.openai import OpenAIChatCompletionClient'
  ];
  
  // 检查是否需要其他导入
  const hasRunner = nodes.some(n => n.type === 'runner');
  const hasFunctionTools = nodes.some(n => n.type === 'functionTool');
  const hasMultipleAgents = nodes.filter(n => n.type === 'agent').length > 1;
  
  if (hasFunctionTools) {
    imports.push('from autogen_agentchat.base import Response');
    imports.push('from autogen_agentchat.messages import TextMessage');
  }
  
  if (hasMultipleAgents) {
    imports.push('from autogen_agentchat.teams import RoundRobinGroupChat');
    imports.push('from autogen_agentchat.conditions import TextMentionTermination');
    imports.push('from autogen_agentchat.ui import Console');
  }
  
  return imports.join('\n');
}

function generatePydanticModels(agentNodes: (WorkflowNode & { data: AgentNodeData })[]): string {
  const models: string[] = [];
  
  agentNodes.forEach(agent => {
    if (agent.data.output_type === 'custom' && agent.data.pydantic_model) {
      models.push(agent.data.pydantic_model);
    }
  });
  
  if (models.length > 0) {
    return 'from pydantic import BaseModel\n\n' + models.join('\n\n');
  }
  
  return '';
}

function generateFunctionTools(functionNodes: (WorkflowNode & { data: FunctionToolNodeData })[]): string {
  if (functionNodes.length === 0) return '';
  
  const functions: string[] = [];
  
  functionNodes.forEach(func => {
    const params = func.data.parameters || [];
    const paramStr = params.map(p => `${p.name}: ${p.type}`).join(', ');
    const returnType = func.data.returnType || 'str';
    
    let functionCode = `def ${func.data.name}(${paramStr}) -> ${returnType}:`;
    
    if (func.data.implementation) {
      const lines = func.data.implementation.split('\n');
      const indentedLines = lines.map(line => line.trim() ? `    ${line}` : line);
      functionCode += '\n' + indentedLines.join('\n');
    } else {
      functionCode += '\n    """TODO: 实现函数逻辑"""\n    pass';
    }
    
    functions.push(functionCode);
  });
  
  return functions.join('\n\n');
}

function generateModelClient(): string {
  return `def get_model_client() -> OpenAIChatCompletionClient:
    return OpenAIChatCompletionClient(
        model="gpt-4o",
        # api_key="your-api-key-here",  # 或使用环境变量 OPENAI_API_KEY
    )`;
}

function generateAgents(agentNodes: (WorkflowNode & { data: AgentNodeData })[], connections: { [key: string]: string[] }): string {
  if (agentNodes.length === 0) return '';
  
  const agentDefinitions: string[] = [];
  
  agentNodes.forEach(agent => {
    const agentName = agent.data.name || 'unnamed_agent';
    const variableName = agentName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    let agentCode = `${variableName} = AssistantAgent(\n`;
    agentCode += `    name="${agentName}",\n`;
    agentCode += `    model_client=get_model_client(),\n`;
    
    if (agent.data.description) {
      agentCode += `    description="${agent.data.description}",\n`;
    }
    
    if (agent.data.system_message) {
      agentCode += `    system_message="${agent.data.system_message}",\n`;
    }
    
    agentCode += ')';
    
    agentDefinitions.push(agentCode);
  });
  
  return agentDefinitions.join('\n\n');
}

function generateRunners(runnerNodes: (WorkflowNode & { data: RunnerNodeData })[], agentNodes: (WorkflowNode & { data: AgentNodeData })[], connections: { [key: string]: string[] }): string {
  if (runnerNodes.length === 0) return '';
  
  // 这里简化处理，实际应该根据连接关系生成更复杂的执行逻辑
  return '';
}

function generateMainFunction(runnerNodes: (WorkflowNode & { data: RunnerNodeData })[], agentNodes: (WorkflowNode & { data: AgentNodeData })[]): string {
  if (runnerNodes.length === 0 || agentNodes.length === 0) {
    return 'if __name__ == "__main__":\n    print("请添加Agent和Runner节点来生成可执行代码")';
  }
  
  const hasAsyncRunner = runnerNodes.some(r => r.data.execution_mode === 'async');
  const firstRunner = runnerNodes[0];
  const task = firstRunner.data.input || 'Hello World!';
  
  if (agentNodes.length === 1) {
    // 单个Agent的简单执行
    const agentName = agentNodes[0].data.name || 'unnamed_agent';
    const variableName = agentName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    if (hasAsyncRunner) {
      return `async def main() -> None:
    model_client = get_model_client()
    try:
        result = await ${variableName}.run(task="${task}")
        print(result)
    finally:
        await model_client.close()

if __name__ == "__main__":
    asyncio.run(main())`;
    } else {
      return `def main() -> None:
    model_client = get_model_client()
    try:
        result = ${variableName}.run_sync(task="${task}")
        print(result)
    finally:
        model_client.close()

if __name__ == "__main__":
    main()`;
    }
  } else {
    // 多个Agent的团队执行
    const agentVariables = agentNodes.map(agent => {
      const agentName = agent.data.name || 'unnamed_agent';
      return agentName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    });
    
    return `async def main() -> None:
    model_client = get_model_client()
    
    # 创建终止条件
    termination = TextMentionTermination("TERMINATE")
    
    # 创建团队
    team = RoundRobinGroupChat(
        [${agentVariables.join(', ')}],
        termination_condition=termination
    )
    
    try:
        # 运行团队对话
        await Console(team.run_stream(task="${task}"))
    finally:
        await model_client.close()

if __name__ == "__main__":
    asyncio.run(main())`;
  }
}