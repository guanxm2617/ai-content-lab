import { useState, useEffect } from 'react'
import { Card, CardBody, Button, Input, Select, SelectItem, Textarea, Switch, Tab, Tabs, Chip } from '@nextui-org/react'
import { FileText, Copy, Download, Loader2, Sparkles, Image as ImageIcon, Search } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { streamZhipu } from '../../api/zhipu'
import { prompts } from '../../prompts'
import { useContentStore } from '../../stores/ContentStore'

interface ParsedResult {
  titles: { text: string; rate: string }[];
  content: string;
  seo: string[];
  images: string;
}

const ArticleAgent = () => {
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [rawResult, setRawResult] = useState('')
  const [parsed, setParsed] = useState<ParsedResult>({ titles: [], content: '', seo: [], images: '' })
  const { updateStats, saveToLibrary } = useContentStore()

  const [config, setConfig] = useState({
    title: '',
    wordCount: '800',
    outline: '',
    style: 'modern',
    tone: 'professional',
    seo: true,
    imageSuggestions: true,
  })

  useEffect(() => {
    if (location.state?.title) {
      setConfig(prev => ({ ...prev, title: location.state.title }))
    }
  }, [location.state])

  // Simple parser for the structured prompt
  useEffect(() => {
    if (!rawResult) return
    
    const parts = rawResult.split('[DELIMITER]')
    const newParsed: ParsedResult = { titles: [], content: '', seo: [], images: '' }
    
    parts.forEach(part => {
      if (part.includes('[TITLES]')) {
        const lines = part.replace('[TITLES]', '').trim().split('\n')
        newParsed.titles = lines.map(line => {
          const [text, rate] = line.split('|').map(s => s.trim())
          return { text: text || line, rate: rate || 'N/A' }
        }).filter(t => t.text)
      } else if (part.includes('[CONTENT]')) {
        newParsed.content = part.replace('[CONTENT]', '').trim()
      } else if (part.includes('[SEO]')) {
        newParsed.seo = part.replace('[SEO]', '').trim().split(',').map(s => s.trim()).filter(Boolean)
      } else if (part.includes('[IMAGES]')) {
        newParsed.images = part.replace('[IMAGES]', '').trim()
      }
    })
    
    setParsed(newParsed)
  }, [rawResult])

  const handleGenerate = async () => {
    if (!config.title) return
    setLoading(true)
    setRawResult('')
    
    try {
      const prompt = prompts.article(config)
      const stream = streamZhipu([{ role: 'user', content: prompt }])
      
      let fullText = ''
      for await (const chunk of stream) {
        fullText += chunk
        setRawResult(fullText)
      }
      
      updateStats('article')
      saveToLibrary({
        id: Date.now().toString(),
        toolId: 'article',
        title: config.title,
        content: fullText,
        timestamp: Date.now(),
      })
    } catch (error) {
      console.error('Generation failed', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(parsed.content)
  }

  const handleDownload = () => {
    const blob = new Blob([parsed.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${config.title || 'AI文章'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
      {/* Config Panel */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="p-4 shadow-sm">
          <CardBody className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="text-purple-500" size={24} />
              <h2 className="text-xl font-bold">写作配置</h2>
            </div>

            <Input
              label="文章主题"
              placeholder="输入核心主题或暂定标题"
              isRequired
              value={config.title}
              onValueChange={(val) => setConfig({ ...config, title: val })}
            />

            <Select
              label="目标字数"
              selectedKeys={[config.wordCount]}
              onSelectionChange={(keys) => setConfig({ ...config, wordCount: Array.from(keys)[0] as string })}
            >
              <SelectItem key="300" value="300">300字左右</SelectItem>
              <SelectItem key="800" value="800">800字左右</SelectItem>
              <SelectItem key="1500" value="1500">1500字左右</SelectItem>
              <SelectItem key="3000" value="3000">3000字以上</SelectItem>
            </Select>

            <Textarea
              label="文章大纲 (可选)"
              placeholder="输入大纲让 AI 创作更精准"
              value={config.outline}
              onValueChange={(val) => setConfig({ ...config, outline: val })}
            />

            <div className="grid grid-cols-2 gap-2">
              <Select
                label="文风"
                selectedKeys={[config.style]}
                onSelectionChange={(keys) => setConfig({ ...config, style: Array.from(keys)[0] as string })}
              >
                <SelectItem key="modern" value="modern">现代感</SelectItem>
                <SelectItem key="retro" value="retro">怀旧风</SelectItem>
                <SelectItem key="minimal" value="minimal">极简主义</SelectItem>
              </Select>
              <Select
                label="语气"
                selectedKeys={[config.tone]}
                onSelectionChange={(keys) => setConfig({ ...config, tone: Array.from(keys)[0] as string })}
              >
                <SelectItem key="pro" value="pro">专业</SelectItem>
                <SelectItem key="friendly" value="friendly">亲切</SelectItem>
                <SelectItem key="sharp" value="sharp">犀利</SelectItem>
              </Select>
            </div>

            <div className="flex flex-col gap-4 py-2 border-t border-default-100">
              <div className="flex items-center justify-between">
                <span className="text-sm">SEO 关键词优化</span>
                <Switch size="sm" isSelected={config.seo} onValueChange={(val) => setConfig({ ...config, seo: val })} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">视觉配图建议</span>
                <Switch size="sm" isSelected={config.imageSuggestions} onValueChange={(val) => setConfig({ ...config, imageSuggestions: val })} />
              </div>
            </div>

            <Button 
              color="secondary" 
              fullWidth 
              size="lg" 
              onPress={handleGenerate}
              isLoading={loading}
              startContent={!loading && <Sparkles size={20} />}
            >
              {loading ? 'AI 正在全力撰稿...' : (parsed.content ? '重新生成内容' : '开始智能写作')}
            </Button>
          </CardBody>
        </Card>
      </div>

      {/* Editor/Result Panel */}
      <div className="lg:col-span-3 space-y-6">
        <Card className="min-h-[700px] shadow-sm overflow-visible">
          <CardBody className="p-0">
            <Tabs 
              aria-label="Options" 
              color="secondary" 
              variant="underlined"
              classNames={{
                tabList: "gap-6 w-full relative rounded-none border-b border-divider px-8",
                cursor: "w-full bg-secondary",
                tab: "max-w-fit px-0 h-12",
                tabContent: "group-data-[selected=true]:text-secondary"
              }}
            >
              <Tab
                key="content"
                title={
                  <div className="flex items-center space-x-2">
                    <FileText size={18} />
                    <span>正文内容</span>
                  </div>
                }
              >
                <div className="p-8">
                  {parsed.content || loading ? (
                    <div className="relative">
                      <div className="absolute top-0 right-0 flex gap-2 z-10">
                         <Button size="sm" variant="flat" isIconOnly onPress={handleCopy}><Copy size={16} /></Button>
                         <Button size="sm" variant="flat" isIconOnly onPress={handleDownload}><Download size={16} /></Button>
                      </div>
                      <Textarea
                        variant="bordered"
                        placeholder="在此处编辑生成的文章..."
                        disableAnimation
                        disableAutosize
                        classNames={{
                          input: "min-h-[500px] text-lg leading-relaxed pt-8",
                        }}
                        value={parsed.content}
                        onValueChange={(val) => setParsed({ ...parsed, content: val })}
                      />
                      {loading && (
                        <div className="flex items-center gap-2 mt-4 text-secondary animate-pulse">
                          <Loader2 className="animate-spin" size={20} />
                          <span>正在注入灵感...</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-[500px] flex flex-col items-center justify-center text-default-300">
                      <FileText size={80} className="opacity-10 mb-4" />
                      <p>配置主题并启动，AI 将为你即刻成文</p>
                    </div>
                  )}
                </div>
              </Tab>
              <Tab
                key="metadata"
                title={
                  <div className="flex items-center space-x-2">
                    <Search size={18} />
                    <span>辅助增强</span>
                  </div>
                }
              >
                <div className="p-8 space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Sparkles size={20} className="text-yellow-500" />
                      备选标题建议
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {parsed.titles.map((t, i) => (
                        <Card key={i} className="p-4 border-none bg-default-50">
                          <p className="font-bold">{t.text}</p>
                          <div className="flex justify-between items-center mt-4">
                            <span className="text-xs text-default-400">预估点击率 {t.rate}</span>
                            <Button size="sm" variant="flat" color="secondary" onPress={() => setConfig({ ...config, title: t.text })}>使用</Button>
                          </div>
                        </Card>
                      ))}
                      {parsed.titles.length === 0 && !loading && <p className="text-default-400 text-sm italic">生成后在此查看标题建议</p>}
                    </div>
                  </div>

                  {parsed.seo.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold">SEO 关键词</h3>
                      <div className="flex flex-wrap gap-2">
                        {parsed.seo.map(tag => <Chip key={tag} variant="flat" color="secondary">{tag}</Chip>)}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <ImageIcon size={20} className="text-blue-500" />
                      配图建议
                    </h3>
                    <div className="p-6 bg-default-50 rounded-xl space-y-4">
                      {parsed.images ? (
                        <p className="text-sm text-default-600 leading-relaxed whitespace-pre-wrap">{parsed.images}</p>
                      ) : (
                        <p className="text-default-400 text-sm italic">生成后在此查看视觉配图建议</p>
                      )}
                    </div>
                  </div>
                </div>
              </Tab>
            </Tabs>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default ArticleAgent
