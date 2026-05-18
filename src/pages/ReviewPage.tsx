import React, { useState } from 'react';
import { 
  Card, CardHeader, CardBody, Textarea, Button, Divider, 
  CheckboxGroup, Checkbox, Progress, Chip, ScrollShadow, 
  Tabs, Tab, CardFooter, Accordion, AccordionItem, Avatar
} from '@nextui-org/react';
import { 
  FiSearch, FiAlertCircle, FiCheckCircle, FiInfo, FiFileText, 
  FiActivity, FiTarget, FiEdit3, FiShield, FiAlertTriangle, FiArrowRight
} from 'react-icons/fi';
import { streamZhipu } from '../api/zhipu';
import { useContentStore } from '../stores/contentStore';

interface Issue {
  type: '错别字' | '敏感词' | '事实错误' | '逻辑问题' | '风格建议' | '原创性';
  level: 'danger' | 'warning' | 'primary' | 'secondary' | 'success';
  content: string;
  suggestion: string;
  description: string;
}

const ReviewPage = () => {
  const { updateStats, saveToLibrary } = useContentStore();
  const [text, setText] = useState('');
  const [options, setOptions] = useState(['错别字检查', '敏感词过滤', '逻辑检测']);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rawOutput, setRawOutput] = useState('');
  const [result, setResult] = useState<{
    score: number;
    rating: string;
    summary: string;
    issues: Issue[];
  } | null>(null);

  const analyze = async () => {
    if (!text) return;
    
    setLoading(true);
    setProgress(10);
    setResult(null);
    setRawOutput('');
    
    const prompt = `你是一个资深的专业编辑和文章审核专家。请对以下文本进行深度审核。你的目标是提供建设性的反馈，帮助作者提升文章质量，而不仅仅是找错误。

文本内容：${text}
审核项：${options.join(', ')}

输出要求：
1. 给出整体评分（0-100）和评级（优秀/良好/合格/需修改）。
2. 提供一段简短的整体审核总结。
3. 列出发现的具体问题或改进建议。每个问题必须包含：
   - type: (错别字/敏感词/事实错误/逻辑问题/风格建议/原创性)
   - level: (danger/warning/primary/secondary/success)
   - content: 原文相关片段
   - suggestion: 具体的修改建议
   - description: 为什么要这样修改的解释（体现建设性）

请严格按照以下JSON格式输出，不要包含任何多余文字：
{
  "score": 85,
  "rating": "良好",
  "summary": "文章结构清晰，但在表达上可以更精炼...",
  "issues": [
    {
      "type": "风格建议",
      "level": "primary",
      "content": "这里是原文片段",
      "suggestion": "建议修改为...",
      "description": "这样修改可以增强读者的代入感"
    }
  ]
}`;

    try {
      let fullText = '';
      setProgress(30);
      
      for await (const chunk of streamZhipu([{ role: 'system', content: '你是一个专业的文档审核JSON生成器。' }, { role: 'user', content: prompt }])) {
        fullText += chunk;
        setRawOutput(fullText);
        setProgress(prev => Math.min(prev + 1, 90));
      }
      
      setProgress(95);
      
      try {
        const jsonStr = fullText.substring(fullText.indexOf('{'), fullText.lastIndexOf('}') + 1);
        const parsed = JSON.parse(jsonStr);
        setResult(parsed);
        
        // 保存到库
        updateStats('review');
        saveToLibrary({
          id: Date.now().toString(),
          toolId: 'review',
          title: `审核：${text.substring(0, 15)}...`,
          content: text,
          createdAt: Date.now(),
          metadata: { score: parsed.score, rating: parsed.rating, issues: parsed.issues }
        });
      } catch (e) {
        console.error('Failed to parse result', e);
      }
      setProgress(100);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 500);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'danger': return 'danger';
      case 'warning': return 'warning';
      case 'primary': return 'primary';
      case 'secondary': return 'secondary';
      case 'success': return 'success';
      default: return 'default';
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case '错别字': return <FiEdit3 />;
      case '敏感词': return <FiShield />;
      case '事实错误': return <FiAlertCircle />;
      case '逻辑问题': return <FiActivity />;
      case '风格建议': return <FiTarget />;
      default: return <FiInfo />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary-50 rounded-2xl text-primary">
          <FiShield className="text-2xl" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">文章审核助手</h1>
          <p className="text-sm text-default-500">AI 智能审校，提供全方位的合规性与质量优化建议</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-none bg-content1/50 backdrop-blur-md shadow-sm">
            <CardHeader className="flex gap-2 items-center">
              <FiFileText className="text-primary" />
              <span className="font-bold">内容输入</span>
            </CardHeader>
            <Divider />
            <CardBody className="gap-4">
              <Textarea 
                placeholder="在此粘贴文章正文或上传文档内容进行审核..." 
                minRows={15} 
                variant="bordered"
                value={text} 
                onChange={e => setText(e.target.value)}
                classNames={{
                  input: "text-base leading-relaxed"
                }}
              />
              <div className="p-4 bg-default-50 rounded-xl space-y-3">
                <span className="text-sm font-semibold text-default-600 block">审核维度配置</span>
                <CheckboxGroup 
                  orientation="horizontal" 
                  value={options} 
                  onValueChange={setOptions}
                  color="primary"
                  size="sm"
                >
                  <Checkbox value="错别字检查">错别字检查</Checkbox>
                  <Checkbox value="敏感词过滤">敏感词过滤</Checkbox>
                  <Checkbox value="事实核查">事实核查</Checkbox>
                  <Checkbox value="逻辑检测">逻辑检测</Checkbox>
                  <Checkbox value="风格润色">风格润色建议</Checkbox>
                </CheckboxGroup>
              </div>
            </CardBody>
            <CardFooter>
              <Button 
                color="primary" 
                size="lg"
                className="w-full font-bold"
                isLoading={loading} 
                onClick={analyze}
                startContent={!loading && <FiSearch />}
              >
                立即开始全方位审核
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          {loading && (
            <Card className="border-none shadow-none bg-transparent">
              <CardBody className="py-2">
                <div className="flex justify-between text-xs mb-1 text-primary font-medium">
                  <span className="animate-pulse">AI 专家正在深度审阅中...</span>
                  <span>{progress}%</span>
                </div>
                <Progress size="sm" color="primary" value={progress} />
              </CardBody>
            </Card>
          )}

          {!result && !loading ? (
            <Card className="h-full min-h-[500px] border-none bg-content1/50 backdrop-blur-md shadow-sm flex items-center justify-center p-10 text-center">
              <div className="space-y-4">
                <div className="mx-auto w-20 h-20 bg-default-100 rounded-full flex items-center justify-center text-default-400">
                  <FiSearch size={40} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">准备就绪</h3>
                  <p className="text-default-500 text-sm mt-2">在左侧粘贴内容并开始审核，AI 将从多维度为您查漏补缺</p>
                </div>
              </div>
            </Card>
          ) : result ? (
            <div className="space-y-6">
              <Card className="border-none bg-content1 shadow-sm">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col items-center">
                      <div className="relative flex items-center justify-center mb-2">
                        <Progress
                          size="lg"
                          radius="full"
                          value={result.score}
                          color={result.score > 80 ? "success" : result.score > 60 ? "warning" : "danger"}
                          className="h-28 w-28"
                        />
                        <span className="absolute text-3xl font-bold">{result.score}</span>
                      </div>
                      <span className="text-xs text-default-500">综合质量评分</span>
                    </div>
                    <div className="flex-1 ml-6 space-y-2">
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold">审核等级:</h2>
                        <Chip 
                          color={result.score > 80 ? "success" : result.score > 60 ? "warning" : "danger"} 
                          variant="shadow"
                          size="lg"
                          className="font-bold"
                        >
                          {result.rating}
                        </Chip>
                      </div>
                      <p className="text-sm text-default-600 line-clamp-3 italic">"{result.summary}"</p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card className="border-none bg-content1 shadow-sm overflow-hidden">
                <CardHeader className="flex gap-2 items-center bg-default-50 py-3">
                  <FiAlertTriangle className="text-warning" />
                  <span className="font-bold">审核建议清单 ({result.issues.length})</span>
                </CardHeader>
                <Divider />
                <ScrollShadow className="h-[calc(100vh-450px)]">
                  <CardBody className="p-0">
                    {result.issues.length > 0 ? (
                      <Accordion variant="light" selectionMode="multiple" className="px-2">
                        {result.issues.map((issue, i) => (
                          <AccordionItem
                            key={i}
                            aria-label={issue.type}
                            startContent={
                              <div className={`p-2 rounded-lg bg-${getLevelColor(issue.level)}-50 text-${getLevelColor(issue.level)}`}>
                                {getIssueIcon(issue.type)}
                              </div>
                            }
                            subtitle={<Chip size="sm" variant="flat" color={getLevelColor(issue.level)}>{issue.type}</Chip>}
                            title={<span className="font-semibold text-sm line-clamp-1">{issue.suggestion}</span>}
                          >
                            <div className="space-y-3 pb-4">
                              <div className="p-3 bg-default-50 rounded-lg border border-default-100">
                                <span className="text-xs font-bold text-default-400 block mb-1">相关原文：</span>
                                <p className="text-sm text-default-700">{issue.content}</p>
                              </div>
                              <div>
                                <span className="text-xs font-bold text-default-400 block mb-1">优化思路：</span>
                                <p className="text-sm text-default-600">{issue.description}</p>
                              </div>
                              <Button 
                                size="sm" 
                                color={getLevelColor(issue.level)} 
                                variant="flat" 
                                className="w-full"
                                startContent={<FiEdit3 />}
                              >
                                采用建议并复制修改方案
                              </Button>
                            </div>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-success">
                        <FiCheckCircle size={40} className="mb-4" />
                        <p className="font-bold">未发现显著问题</p>
                        <p className="text-xs text-default-400 mt-1">文章质量极佳，建议直接发布</p>
                      </div>
                    )}
                  </CardBody>
                </ScrollShadow>
                <Divider />
                <CardFooter className="bg-default-50">
                  <Button color="success" className="w-full font-bold" variant="solid" startContent={<FiCheckCircle />}>
                    生成最终优化版本
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ) : (
            <div className="p-4 bg-default-50 rounded-xl border border-dashed border-default-300 animate-pulse h-full">
              <div className="h-4 w-3/4 bg-default-200 rounded mb-4"></div>
              <div className="h-20 bg-default-200 rounded mb-4"></div>
              <div className="h-4 w-1/2 bg-default-200 rounded"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
