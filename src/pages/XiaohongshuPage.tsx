import React, { useState, useEffect } from 'react';
import { 
  Card, CardHeader, CardBody, Input, Textarea, Select, SelectItem, 
  Button, Divider, Badge, ScrollShadow, Tooltip, Progress,
  Snippet, CardFooter
} from '@nextui-org/react';
import { 
  FiSend, FiCopy, FiRefreshCw, FiImage, FiHeart, FiSmile, 
  FiUsers, FiTarget, FiHash, FiZap 
} from 'react-icons/fi';
import { streamZhipu } from '../api/zhipu';
import { useContentStore } from '../stores/contentStore';

const CONTENT_TYPES = [
  { label: '种草', value: '种草', icon: '🌱' },
  { label: '测评', value: '测评', icon: '🔍' },
  { label: '教程', value: '教程', icon: '📝' },
  { label: '好物分享', value: '好物分享', icon: '🎁' },
  { label: '护肤心得', value: '护肤心得', icon: '✨' },
];

const XiaohongshuPage = () => {
  const { setConfig, configs, updateStats, saveToLibrary } = useContentStore();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const savedConfig = configs['xiaohongshu'] || {};
  
  const [config, setLocalConfig] = useState({
    productName: (savedConfig as any).productName || '',
    features: (savedConfig as any).features || '',
    experience: (savedConfig as any).experience || '',
    type: (savedConfig as any).type || '种草',
    audience: (savedConfig as any).audience || '',
    style: (savedConfig as any).style || '',
  });

  const [result, setResult] = useState({
    titles: [] as string[],
    content: '',
    images: [] as string[],
  });

  const [rawOutput, setRawOutput] = useState('');

  const handleConfigChange = (key: string, value: string) => {
    const newConfig = { ...config, [key]: value };
    setLocalConfig(newConfig);
    setConfig('xiaohongshu', newConfig as any);
  };

  const generate = async () => {
    if (!config.productName) return;
    
    setLoading(true);
    setProgress(10);
    setResult({ titles: [], content: '', images: [] });
    setRawOutput('');
    
    const prompt = `你是一个专业的小红书博主，擅长创作爆款内容。请根据以下信息生成小红书风格的内容：
产品名称：${config.productName}
产品特点：${config.features}
使用体验：${config.experience}
内容类型：${config.type}
目标人群：${config.audience}
风格偏好：${config.style}

输出要求：
1. 生成3-5个吸引人的爆款标题。
2. 正文内容：开头要瞬间抓住眼球，多使用emoji，中间要有条理，结尾有互动引导（如“你们觉得呢？”、“评论区告诉我”），并带上5-8个相关话题标签（#xxx）。
3. 给出3条具体的配图建议（构图、背景、滤镜或文字贴纸建议）。

请严格按照以下JSON格式输出，不要包含任何多余文字：
{
  "titles": ["标题1", "标题2", "标题3"],
  "content": "正文内容...",
  "images": ["建议1", "建议2", "建议3"]
}`;

    try {
      let fullText = '';
      setProgress(30);
      
      for await (const chunk of streamZhipu([{ role: 'system', content: '你是一个JSON生成助手。' }, { role: 'user', content: prompt }])) {
        fullText += chunk;
        setRawOutput(fullText);
        // 简单模拟进度
        setProgress(prev => Math.min(prev + 2, 90));
      }
      
      setProgress(95);
      
      try {
        const jsonStr = fullText.substring(fullText.indexOf('{'), fullText.lastIndexOf('}') + 1);
        const parsed = JSON.parse(jsonStr);
        setResult(parsed);
        
        // 保存到库和更新统计
        updateStats('xiaohongshu');
        saveToLibrary({
          id: Date.now().toString(),
          toolId: 'xiaohongshu',
          title: parsed.titles[0] || config.productName,
          content: parsed.content,
          createdAt: Date.now(),
          metadata: { titles: parsed.titles, images: parsed.images }
        });
      } catch (e) {
        console.error('Failed to parse result', e);
        // 如果JSON解析失败，尝试从文本中提取（简单版）
        setResult(prev => ({ ...prev, content: fullText }));
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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-danger-50 rounded-2xl">
            <FiHeart className="text-2xl text-danger" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">小红书图文生成器</h1>
            <p className="text-sm text-default-500">快速生成高点击、高互动的爆款笔记内容</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 配置区 */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-none bg-content1/50 backdrop-blur-md shadow-sm">
            <CardHeader className="flex gap-2 items-center">
              <FiZap className="text-danger" />
              <span className="font-bold">内容配置</span>
            </CardHeader>
            <Divider />
            <CardBody className="gap-5">
              <Input 
                label="产品/主题名称" 
                placeholder="例如：多功能空气炸锅" 
                variant="bordered"
                value={config.productName} 
                onChange={e => handleConfigChange('productName', e.target.value)}
                startContent={<FiTarget className="text-default-400" />}
              />
              <Textarea 
                label="产品特点" 
                placeholder="列出产品的核心卖点，每行一个..." 
                variant="bordered"
                value={config.features} 
                onChange={e => handleConfigChange('features', e.target.value)}
              />
              <Textarea 
                label="使用体验" 
                placeholder="分享你的真实感受，让内容更有说服力..." 
                variant="bordered"
                value={config.experience} 
                onChange={e => handleConfigChange('experience', e.target.value)}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Select 
                  label="内容类型" 
                  variant="bordered"
                  selectedKeys={[config.type]} 
                  onSelectionChange={keys => handleConfigChange('type', Array.from(keys)[0] as string)}
                >
                  {CONTENT_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value} startContent={<span>{t.icon}</span>}>
                      {t.label}
                    </SelectItem>
                  ))}
                </Select>
                <Input 
                  label="风格偏好" 
                  placeholder="如：精致生活感" 
                  variant="bordered"
                  value={config.style} 
                  onChange={e => handleConfigChange('style', e.target.value)}
                  startContent={<FiSmile className="text-default-400" />}
                />
              </div>

              <Input 
                label="目标人群" 
                placeholder="如：独居青年、健身达人..." 
                variant="bordered"
                value={config.audience} 
                onChange={e => handleConfigChange('audience', e.target.value)}
                startContent={<FiUsers className="text-default-400" />}
              />
            </CardBody>
            <CardFooter>
              <Button 
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold"
                size="lg"
                isLoading={loading} 
                onClick={generate}
                startContent={!loading && <FiSend />}
              >
                开始生成爆款内容
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* 结果区 */}
        <div className="lg:col-span-7 space-y-6">
          {loading && (
            <Card className="border-none shadow-none bg-transparent">
              <CardBody className="py-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-danger font-medium animate-pulse">正在为您构思内容...</span>
                  <span>{progress}%</span>
                </div>
                <Progress 
                  size="sm" 
                  color="danger" 
                  value={progress} 
                  className="max-w-md"
                />
              </CardBody>
            </Card>
          )}

          <Card className="border-none bg-content1/50 backdrop-blur-md shadow-sm h-full min-h-[600px]">
            <CardHeader className="flex justify-between items-center">
              <div className="flex gap-2 items-center">
                <FiZap className="text-warning" />
                <span className="font-bold">生成结果</span>
              </div>
              {result.content && (
                <div className="flex gap-2">
                  <Tooltip content="重新生成">
                    <Button isIconOnly size="sm" variant="flat" onClick={generate}><FiRefreshCw /></Button>
                  </Tooltip>
                </div>
              )}
            </CardHeader>
            <Divider />
            <ScrollShadow className="h-[calc(100vh-250px)]">
              <CardBody className="gap-6 pb-20">
                {!result.content && !loading ? (
                  <div className="flex flex-col items-center justify-center h-full text-default-400 gap-4 mt-20">
                    <div className="p-6 bg-default-100 rounded-full">
                      <FiSend className="text-4xl" />
                    </div>
                    <p>在左侧填写配置并点击生成，即刻获取灵感</p>
                  </div>
                ) : (
                  <>
                    {/* 爆款标题区 */}
                    {result.titles.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-danger font-semibold">
                          <FiZap /> 爆款标题建议
                        </div>
                        <div className="flex flex-col gap-2">
                          {result.titles.map((t, i) => (
                            <div key={i} className="flex items-center gap-2 group">
                              <Snippet 
                                hideSymbol 
                                size="sm" 
                                className="w-full bg-rose-50 border border-rose-100 text-rose-700"
                                tooltipProps={{ content: "点击复制标题" }}
                              >
                                {t}
                              </Snippet>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 正文内容区 */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-danger font-semibold">
                          <FiSmile /> 正文内容
                        </div>
                        {result.content && (
                          <Button 
                            size="sm" 
                            variant="flat" 
                            color="danger" 
                            startContent={<FiCopy />}
                            onClick={() => {
                              navigator.clipboard.writeText(result.content);
                              // 这里可以加一个 toast
                            }}
                          >
                            复制正文
                          </Button>
                        )}
                      </div>
                      <div className="relative group">
                        <div className="whitespace-pre-wrap p-5 bg-white border border-default-200 rounded-2xl min-h-[300px] text-default-800 leading-relaxed shadow-inner">
                          {result.content || rawOutput || '正在码字中...'}
                        </div>
                      </div>
                    </div>

                    {/* 配图建议区 */}
                    {result.images.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-danger font-semibold">
                          <FiImage /> 配图建议
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {result.images.map((s, i) => (
                            <div key={i} className="flex gap-3 p-3 bg-default-50 rounded-xl border border-default-100 items-start">
                              <div className="mt-1 flex-shrink-0 w-5 h-5 bg-rose-200 text-rose-700 rounded-full flex items-center justify-center text-xs font-bold">
                                {i + 1}
                              </div>
                              <p className="text-sm text-default-600">{s}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardBody>
            </ScrollShadow>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default XiaohongshuPage;
