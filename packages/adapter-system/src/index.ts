/**
 * @File: index.ts
 * @author: 夏花
 * @time: 2025-02-06
 */

import { Adapter, Message } from '@simpleping/core';
import notifier from 'node-notifier';

/**
 * 系统消息适配器
 */
export class NotifierAdapter extends Adapter {
    public name = 'notifier';

    /**
     * 发送消息
     * @param message
     */
    send(message: Message): Promise<boolean> {
        return new Promise((resolve: any, reject: any): void => {
            try {
                notifier.notify(
                    {
                        title: `${message.level}: ${message.title}`,
                        message: message.content,
                        icon: message.image,
                        sound: message.level === 'error',
                    },
                    (err: Error | null): void => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(true);
                    },
                );
            } catch (err) {
                reject(err);
            }
        });
    }
}
