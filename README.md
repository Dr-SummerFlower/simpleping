# Simple Ping

> [!WARNING]
> This project is still in active development. File a bug report if you meet any!\
> 此项目仍在开发阶段，如果遇到问题请发送 Issue

[![Node Version](https://img.shields.io/badge/node-22.12.0-green)](https://nodejs.org/)
[![Npm Version](https://img.shields.io/badge/npm-10.9.0-blue)](https://www.npmjs.com/)
[![Github Page](https://img.shields.io/badge/GitHub-simpleping-red?logo=github)](https://github.com/Dr-SummerFlower/simpleping.git)
[![GitHub License](https://img.shields.io/github/license/Dr-SummerFlower/simpleping)](https://github.com/Dr-SummerFlower/simpleping/blob/main/LICENSE)
[![GitHub repo size](https://img.shields.io/github/repo-size/Dr-SummerFlower/simpleping)](https://github.com/Dr-SummerFlower/simpleping)

## 简介

Simple Ping 是一个用来发送消息的npm包，灵感来自于server酱

与server酱不同的是，这个项目以npm包的形式发布，并且这个包不依赖外部服务器，你可以直接集成到你的node项目中。

## 安装
本项目采用适配器的形式`@simpleping/core`负责处理输入输出，adapter负责处理消息的格式，你可以自己实现adapter，或者使用现成的adapter。

---

npm
```
npm install @simpleping/core
```
```
npm install @simpleping/adapter-*
```

---

yarn
```
    yarn add @simpleping/core
```
```
    yarn add @simpleping/adapter-*
```

---

## 使用
```typescript
// 引入core与adapter
import { SimplePing, MessageLevel } from "@simpleping/core";
import {NotifierAdapter} from "@simpleping/adapter-system";

// 创建适配器实例与SimplePing实例
const notifier = new NotifierAdapter();
const simplePing = new SimplePing(notifier);

// 创建测试消息
const createTestMessages = () => ({
    systemUpdate: {
        level: MessageLevel.INFO,
        title: '系统更新通知',
        content: '已成功升级到v2.0.0版本',
        image: 'https://example.com/update-success.png'
    },
    diskWarning: {
        level: MessageLevel.WARNING,
        title: '存储空间警告',
        content: '系统磁盘使用率已达到85%',
        image: 'https://example.com/disk-warning.png'
    },
    serviceError: {
        level: MessageLevel.ERROR,
        title: '服务异常',
        content: '用户服务响应超时，请立即处理！',
        image: 'https://example.com/error-alert.png'
    }
});

// 发送消息
(async () => {
    const messages = createTestMessages();
    await simplePing.send(messages.systemUpdate);
    await simplePing.send(messages.diskWarning);
    await simplePing.send(messages.serviceError);
})();

```

当然，你也可以自定义适配器并应用到你的服务中
```typescript
// adapter.ts
import { SimplePing, MessageLevel } from "@simpleping/core"

export class ExampleAdapter extends Adapter {
    public name: string = 'ExampleAdapter';

    public async send(message: Message): Promise<boolean> {
        // 编写你的消息发送逻辑
        return Promise.resolve(true);
    }
}
```

## 开发指南
本项目使用lerna作为管理工具，使用yarn workspace 管理多个包。
> 使用 `git clone https://github.com/Dr-SummerFlower/simpleping.git` 克隆项目\
> 使用 `yarn install` 安装依赖。\
> 使用 `lerna run build` 编译项目。\
