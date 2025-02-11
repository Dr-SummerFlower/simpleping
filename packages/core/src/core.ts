/**
 * @File: core.ts
 * @author: 夏花
 * @time: 2025-02-06
 */

/**
 * 消息级别枚举
 */
export enum MessageLevel {
    INFO = 'INFO',
    WARNING = 'WARNING',
    ERROR = 'ERROR',
}

/**
 * 消息接口
 */
export interface Message {
    level: MessageLevel;
    title: string;
    content: string;
    icon?: string;
    image?: string;
    timestamp?: string;
}

/**
 * 发送结果
 */
export interface SendResult {
    name: string;
    status: boolean;
    error?: Error;
}

export interface AdapterOptions {}

export abstract class Adapter {
    public abstract name: string;

    /**
     * 发送消息
     * @param message
     */
    public abstract send(message: Message): Promise<boolean>;
}

/**
 * 消息发送类
 */
export class SimplePing {
    private adapters: Adapter[];
    constructor(adapter: Adapter | Adapter[]) {
        this.adapters = Array.isArray(adapter) ? adapter : [adapter];
    }

    /**
     * 发送消息
     * @param message
     */
    public async send(
        message: Omit<Message, 'timestamp'>,
    ): Promise<SendResult[]> {
        const result: SendResult[] = [];
        const msg: Message = {
            ...message,
            timestamp: new Date().toISOString(),
        };
        const promises: Promise<boolean>[] = this.adapters.map(
            (adapter: Adapter): Promise<boolean> => {
                return adapter.send(msg).catch((err: Error): boolean => {
                    result.push({
                        name: adapter.name,
                        status: false,
                        error: err,
                    });
                    return false;
                });
            },
        );
        await Promise.all(promises);
        return result;
    }
}
