
import { Card, CardBody, Button } from '@nextui-org/react'
import { useContentStore } from '../stores/ContentStore'
import { Trash2, Copy } from 'lucide-react'

const ContentLibrary = () => {
  const { library, deleteFromLibrary } = useContentStore()
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">内容库</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {library.map((item) => (
          <Card key={item.id}>
            <CardBody className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="font-bold">{item.title}</h3>
                <Button size="sm" isIconOnly variant="flat" color="danger" onPress={() => deleteFromLibrary(item.id)}>
                  <Trash2 size={16} />
                </Button>
              </div>
              <p className="text-sm text-default-500 line-clamp-3">{item.content}</p>
              <div className="flex justify-between items-center text-xs text-default-400">
                <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                <Button size="sm" variant="flat" startContent={<Copy size={14} />}>复制</Button>
              </div>
            </CardBody>
          </Card>
        ))}
        {library.length === 0 && <div className="col-span-full text-center p-12 text-default-400">内容库还是空的</div>}
      </div>
    </div>
  )
}
export default ContentLibrary
