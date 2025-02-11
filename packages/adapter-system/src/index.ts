/**
 * @File: index.ts
 * @author: 夏花
 * @time: 2025-02-06
 */

import { Adapter, AdapterOptions, Message } from '@simpleping/core';
import notifier from 'node-notifier';

export interface SystemOptions extends AdapterOptions {}

export class NotifierAdapter extends Adapter {
    public name = 'notifier';
    private options: SystemOptions;

    constructor(options: SystemOptions) {
        super();
        this.options = options;
    }

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
                        sound: message.level === 'ERROR',
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
