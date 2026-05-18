import { Card } from "@heroui/react";

export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">首页/工作台</h1>
      <Card className="max-w-[400px]">
        <Card.Content>
          <p>欢迎使用新媒体内容生产助手</p>
        </Card.Content>
      </Card>
    </div>
  );
}
