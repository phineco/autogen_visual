AutoGen Agents 可视化工作流设计器实现需求
我需要设计并实现一个可视化界面，让用户能够通过拖放组件方式创建AutoGen Agents工作流，并生成对应的代码。
项目需求如下：
1. 功能概述
创建一个基于Web的可视化编辑器，允许用户:
从组件库拖放不同类型的组件到画布上
通过连接线连接组件，建立关系
配置组件参数（如Agent的name、description, system_message等）
生成可运行的AutoGen Agents SDK代码
2. 技术栈
前端框架: React 18+
工作流编辑器库: React Flow
UI组件库: 不限，可使用ElementUI、Ant Design、Material UI或自定义组件
状态管理: React Context或Redux
构建工具: Vite
3. 界面布局
应用界面分为以下几个主要区域:
顶部导航栏
应用名称: "AutoGen Agents Workflow Designer"
生成代码按钮
可选: 保存/加载按钮
左侧组件面板
可拖动的组件类型:
Agent节点
Runner节点
Function Tool节点
每个组件有图标和名称
底部可添加简要使用说明
中央画布区域
可拖放区域，用于构建工作流
支持平移和缩放
节点之间可建立连接关系
右侧属性面板（可选）
显示当前选中节点的详细属性
提供属性编辑界面
代码生成弹窗
展示生成的AutoGen Agents SDK代码
提供复制按钮
可选: 代码高亮显示
4. 组件设计
4.1 Agent节点
外观: 圆角矩形，顶部蓝色边框
基本属性:
name: 文本输入框
description: 文本输入框
system_message: 多行文本输入框
output_type: 下拉选择（无/自定义Pydantic模型）
扩展属性:
handoffs: 显示已连接的其他Agent
tools: 显示已连接的Function Tools
4.2 Runner节点
外观: 圆角矩形，顶部红色边框
基本属性:
input: 文本输入框
执行模式: 切换按钮(同步/异步)
context: 可选配置
注意: Runner节点应连接到一个Agent节点
4.3 Function Tool节点
外观: 圆角矩形，顶部黄色边框
基本属性:
name: 文本输入框
parameters: 可添加/删除的参数列表
returnType: 下拉选择(str, int, float, bool, list, dict, None)
implementation: 代码编辑区
4.5 连接关系设计
Agent → Agent: 表示handoff关系
Function → Agent: 表示tool关系
Agent → Runner: 表示执行关系
5. 代码生成器实现
代码生成器需要根据画布上的节点和连接关系，生成有效的AutoGen Agents SDK代码。生成的代码应包括:
必要的导入语句（agents、asyncio等）
Pydantic模型定义（如果需要）
Function Tool 定义
Agent 定义，包括name、description、system_message、handoffs、tools
Runner执行代码，根据选择生成同步或异步版本
代码生成逻辑示例:
对于每个Function Tool节点，生成@function_tool装饰器函数
对于每个Agent节点，生成Agent实例
对于连接到Agent的Function节点，添加到Agent的tools参数
对于连接到Agent的其他Agent节点，添加到handoffs参数
对于Runner节点，生成对应的Runner.run或Runner.run_sync代码
如果有异步执行，添加asyncio.run(main())代码
6. 用户交互设计
组件拖放:
用户从左侧面板拖动组件到画布
拖放时应显示可放置位置的提示
节点连接:
节点有输入/输出连接点
用户可以拖动连接线连接不同节点
连接时应验证是否为有效连接
节点配置:
点击节点可选中并显示配置选项
节点可展开/折叠以显示/隐藏详细选项
节点大小应根据内容自适应
代码生成:
点击"生成代码"按钮显示弹窗
代码应格式化并高亮显示
提供复制到剪贴板功能
7. 样式设计
整体风格建议:
简洁现代的界面
柔和的色彩方案
充分的留白
清晰的视觉层次
节点颜色编码:
Agent: 蓝色(#3498db)顶部边框
Runner: 红色(#e74c3c)顶部边框
Function Tool: 黄色(#f39c12)顶部边框
Guardrail: 紫色(#9b59b6)顶部边框
8. 示例参考
参考下面的Agent代码示例，实现相应的可视化表示:
示例1: 基本Agent
Python
import asyncio
from autogen_agentchat.agents import AssistantAgent
from autogen_ext.models.openai import OpenAIChatCompletionClient
async def main() -> None:
model_client = OpenAIChatCompletionClient(model="gpt-4o")
agent = AssistantAgent("assistant", model_client=model_client)
print(await agent.run(task="Say 'Hello World!'"))
await model_client.close()
asyncio.run(main())
示例2: Handoffs
python
import asyncio
import sys
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.conditions import TextMentionTermination
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.ui import Console
from autogen_ext.models.openai import OpenAIChatCompletionClient
Nvidia NIM
def get_model_client_NIM() -> OpenAIChatCompletionClient:  # type: ignore
return OpenAIChatCompletionClient(
model="meta/llama-3.3-70b-instruct",
api_key="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",
base_url="https://integrate.api.nvidia.com/v1",
model_capabilities={
"json_output": True,
"vision": False,
"function_calling": True,
},
)
planner_agent = AssistantAgent(
"planner_agent",
model_client=get_model_client_NIM(),
description="一个能够帮助规划行程的智能助手",
system_message="你是一个能够根据用户需求提供旅行规划建议的智能助手。",
)
local_agent = AssistantAgent(
"local_agent",
model_client=get_model_client_NIM(),
description="一个能够推荐当地活动和景点的在地助手",
system_message="你是一个能够为用户推荐地道有趣的当地活动和景点的智能助手，可以充分利用所提供的任何背景信息。",
)
language_agent = AssistantAgent(
"language_agent",
model_client=get_model_client_NIM(),
description="一个能够提供目的地语言建议的智能助手",
system_message="你是一个能够审查旅行计划的智能助手，负责就如何最好地应对目的地的语言或沟通挑战提供重要/关键提示。如果计划中已经包含了语言提示，你可以说明计划是令人满意的，并解释原因。",
)
travel_summary_agent = AssistantAgent(
"travel_summary_agent",
model_client=get_model_client_NIM(),
description="一个能够总结旅行计划的智能助手",
system_message="你是一个能够整合其他助手的所有建议和意见并提供详细最终旅行计划的智能助手。你必须确保最终计划是完整且连贯的。你的最终回复必须是完整的计划。当计划完整且所有观点都已整合后，你可以回复'TERMINATE'。",
)
termination = TextMentionTermination("TERMINATE")
group_chat = RoundRobinGroupChat(
[planner_agent, local_agent, language_agent, travel_summary_agent], termination_condition=termination
)
taskStr = "制定一个泰国三日游计划."
print(sys.argv)
if len(sys.argv) > 1:
taskStr = sys.argv[1]
asyncio.run(Console(group_chat.run_stream(task=taskStr)))
示例3: Function Tools
Python
import asyncio
from autogen_agentchat.agents import UserProxyAgent
from autogen_agentchat.conditions import TextMentionTermination
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.ui import Console
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_ext.agents.web_surfer import MultimodalWebSurfer
async def main() -> None:
model_client = OpenAIChatCompletionClient(model="gpt-4o")
# The web surfer will open a Chromium browser window to perform web browsing tasks.
web_surfer = MultimodalWebSurfer("web_surfer", model_client, headless=False, animate_actions=True)
# The user proxy agent is used to get user input after each step of the web surfer.
# NOTE: you can skip input by pressing Enter.
user_proxy = UserProxyAgent("user_proxy")
# The termination condition is set to end the conversation when the user types 'exit'.
termination = TextMentionTermination("exit", sources=["user_proxy"])
# Web surfer and user proxy takes turns in a round-robin fashion.
team = RoundRobinGroupChat([web_surfer, user_proxy], termination_condition=termination)
try:
# Start the team and wait for it to terminate.
await Console(team.run_stream(task="Find information about AutoGen and write a short summary."))
finally:
await web_surfer.close()
await model_client.close()
asyncio.run(main())
9. 扩展功能（如果可能）
如果时间和资源允许，可以考虑以下扩展功能:
保存/加载: 允许用户保存工作流为JSON并重新加载
示例模板: 提供几个预设的工作流模板
实时预览: 在编辑过程中实时更新生成的代码
导出功能: 允许导出Python文件
错误验证: 检测并提示工作流中的潜在问题
调试视图: 提供简单的调试界面，显示工作流执行路径
导入功能: 从现有Python代码导入并创建可视化工作流
请根据以上需求实现这个AutoGen Agents可视化工作流设计器。设计应该直观易用，让用户能够轻松创建复杂的Agent工作流并生成可用的Python代码。