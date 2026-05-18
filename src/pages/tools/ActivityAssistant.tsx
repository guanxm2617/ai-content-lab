import { useState } from 'react'
import { Card, CardBody, Button, Input, Select, SelectItem, CheckboxGroup, Checkbox, Slider, ScrollShadow } from '@nextui-org/react'
import { Rocket, Send, Copy, Download, RefreshCcw, Loader2, History } from 'lucide-react'
import { streamZhipu } from '../../api/zhipu'
import { prompts } from '../../prompts'
import { useContentStore } from '../../stores/ContentStore'

const ActivityAssistant = () => {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [versions, setVersions] = useState<{timestamp: number, content: string}[]>([])
  const { updateStats, saveToLibrary } = useContentStore()

  const [config, setConfig] = useState({
    title: '',
    goals: [] as string[],
    type: '',
    audience: '',
    budget: 5000,
    platforms: [] as string[],
  })

  const getPlatformColor = () => {
    if (config.platforms.includes('wechat')) return 'border-微信绿'
    if (config.platforms.includes('xhs')) return 'border-小红书红'
    if (config.platforms.includes('weibo')) return 'border-微博橙'
    return 'border-primary'
  }

  const handleGenerate = async () => {
    if (!config.title) return
    setLoading(true)
    setResult('')
    
    try {
      const prompt = prompts.activity(config)
      const stream = streamZhipu([{ role: 'user', content: prompt }])
      
      let fullText = ''
      for await (const chunk of stream) {
        fullText += chunk
        setResult(fullText)
      }
      
      setVersions(prev => [{ timestamp: Date.now(), content: fullText }, ...prev])
      updateStats('activity')
      saveToLibrary({
        id: Date.now().toString(),
        toolId: 'activity',
        title: config.title,
        content: fullText,
        timestamp: Date.now(),
        platform: config.platforms.join(','),
      })
    } catch (error) {
      console.error('Generation failed', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result)
  }

  const handleDownload = () => {
    const blob = new Blob([result], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${config.title || '活动策划'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Configuration Section */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="p-4">
          <CardBody className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="text-primary" size={24} />
              <h2 className="text-xl font-bold">配置活动信息</h2>
            </div>
            
            <Input
              label="活动主题"
              placeholder="例如：春日野餐季"
              isRequired
              value={config.title}
              onValueChange={(val) => setConfig({ ...config, title: val })}
            />

            <Select
              label="活动类型"
              placeholder="选择类型"
              selectedKeys={config.type ? [config.type] : []}
              onSelectionChange={(keys) => setConfig({ ...config, type: Array.from(keys)[0] as string })}
            >
              <SelectItem key="online" value="online">线上活动</SelectItem>
              <SelectItem key="offline" value="offline">线下活动</SelectItem>
              <SelectItem key="hybrid" value="hybrid">混合模式</SelectItem>
            </Select>

            <CheckboxGroup
              label="活动目标"
              orientation="horizontal"
              value={config.goals}
              onValueChange={(val) => setConfig({ ...config, goals: val as string[] })}
            >
              <Checkbox value="brand">品牌曝光</Checkbox>
              <Checkbox value="conversion">效果转化</Checkbox>
              <Checkbox value="engagement">粉丝互动</Checkbox>
              <Checkbox value="feedback">用户调研</Checkbox>
            </CheckboxGroup>

            <Input
              label="目标受众"
              placeholder="性别/年龄/职业/兴趣"
              value={config.audience}
              onValueChange={(val) => setConfig({ ...config, audience: val })}
            />

            <div className="space-y-2">
              <p className="text-sm text-default-500">预算范围 (¥)</p>
              <Slider 
                step={1000} 
                maxValue={100000} 
                minValue={0} 
                defaultValue={5000}
                value={config.budget}
                onChange={(val) => setConfig({ ...config, budget: val as number })}
                className="max-w-md"
              />
            </div>

            <CheckboxGroup
              label="发布平台"
              orientation="horizontal"
              value={config.platforms}
              onValueChange={(val) => setConfig({ ...config, platforms: val as string[] })}
            >
              <Checkbox value="wechat">微信</Checkbox>
              <Checkbox value="xhs">小红书</Checkbox>
              <Checkbox value="weibo">微博</Checkbox>
              <Checkbox value="douyin">抖音</Checkbox>
            </CheckboxGroup>

            <Button 
              color="primary" 
              fullWidth 
              size="lg" 
              onPress={handleGenerate}
              isLoading={loading}
              startContent={!loading && <Send size={20} />}
            >
              {loading ? '策划生成中...' : '生成完整方案'}
            </Button>
          </CardBody>
        </Card>

        {versions.length > 0 && (
          <Card className="p-4">
            <CardBody>
              <div className="flex items-center gap-2 mb-4 text-default-500">
                <History size={18} />
                <span className="text-sm font-bold">历史版本 ({versions.length})</span>
              </div>
              <ScrollShadow className="max-h-[200px] space-y-2">
                {versions.map((v, i) => (
                  <Button 
                    key={v.timestamp} 
                    variant="light" 
                    fullWidth 
                    className="justify-start text-xs h-auto py-2"
                    onPress={() => setResult(v.content)}
                  >
                    第 {versions.length - i} 版 · {new Date(v.timestamp).toLocaleTimeString()}
                  </Button>
                ))}
              </ScrollShadow>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Result Section */}
      <div className="lg:col-span-2 space-y-6">
        <Card className={`min-h-[600px] border-t-4 transition-colors ${getPlatformColor()}`}>
          <CardBody className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">策划方案结果</h2>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="flat" 
                  startContent={<Copy size={16} />}
                  onPress={handleCopy}
                  isDisabled={!result}
                >
                  复制
                </Button>
                <Button 
                  size="sm" 
                  variant="flat" 
                  startContent={<Download size={16} />}
                  onPress={handleDownload}
                  isDisabled={!result}
                >
                  下载
                </Button>
                <Button 
                  size="sm" 
                  variant="flat" 
                  isIconOnly 
                  onPress={handleGenerate}
                  isDisabled={loading || !config.title}
                >
                  <RefreshCcw size={16} />
                </Button>
              </div>
            </div>

            {result ? (
              <div className="prose dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-default-700 leading-relaxed">
                  {result}
                </div>
                {loading && (
                  <div className="flex items-center gap-2 mt-4 text-primary animate-pulse">
                    <Loader2 className="animate-spin" size={20} />
                    <span>AI 正在思考并撰写细节...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-default-400 space-y-4">
                <Rocket size={64} className="opacity-20" />
                <p>在左侧填写配置并点击生成，在此查看完整方案</p>
              </div>
            )}
          </CardBody>
        </Card>

        {result && !loading && (
          <div className="flex gap-4">
            <Card className="flex-1 p-4 bg-primary/10 border-none">
              <p className="text-xs font-bold text-primary mb-2 uppercase">核心亮点</p>
              <p className="text-sm">方案已根据你的预算和受众进行了深度优化。</p>
            </Card>
            <Card className="flex-1 p-4 bg-secondary/10 border-none">
              <p className="text-xs font-bold text-secondary mb-2 uppercase">执行建议</p>
              <p className="text-sm">建议提前 2 周开始在小红书进行预热渗透。</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default ActivityAssistant
