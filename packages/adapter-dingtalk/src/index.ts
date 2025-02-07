/**
 * @File: index.ts
 * @author: 夏花
 * @time: 2025-02-07
 */

import {
    DWClient,
    DWClientDownStream,
    EventAck,
    RobotMessage,
    TOPIC_ROBOT,
} from 'dingtalk-stream';
import axios from 'axios';
import { Adapter, Message } from '@simpleping/core';

export class DingtalkAdapter extends Adapter {
    public name: string = 'dingtalk';
    private options: any;
    private lastMessage: Message | null = null;
    private client: DWClient;

    constructor(options: any) {
        super();
        this.options = options;
        this.client = new DWClient({
            clientId: this.options.clientId,
            clientSecret: this.options.clientSecret,
        });
        this.client
            .registerCallbackListener(TOPIC_ROBOT, async (res) => {
                const { text, senderStaffId, sessionWebhook } = JSON.parse(
                    res.data,
                ) as RobotMessage;
                const body = {
                    at: {
                        atUserIds: [senderStaffId],
                        isAtAll: false,
                    },
                    text: {
                        content: `${this.lastMessage?.level}: ${this.lastMessage?.title} ${this.lastMessage?.content}`,
                    },
                    msgtype: 'text',
                };

                const accessToken = await this.client.getAccessToken();
                const result = await axios({
                    url: sessionWebhook,
                    method: 'POST',
                    responseType: 'json',
                    data: body,
                    headers: {
                        'x-acs-dingtalk-access-token': accessToken,
                    },
                });
                if (result?.data) {
                    this.client.socketCallBackResponse(
                        res.headers.messageId,
                        result.data,
                    );
                }
            })
            .connect();
    }

    send(message: Message): Promise<boolean> {
        this.lastMessage = message;
        return new Promise<boolean>((resolve: any, reject: any) => {
            try {
                const result = axios({
                    method: 'POST',
                    url: this.options.webhookurl,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    data: {
                        msgtype: 'text',
                        text: {
                            content: this.text(message),
                        },
                    },
                });
                result.then(
                    (response: any) => {
                        if (response.status === 200) resolve(true);
                        else resolve(false);
                    },
                    (error: any) => {
                        reject(error);
                    },
                );
            } catch (e) {
                reject(e);
            }
        });
    }
    text(message: Message): string | undefined {
        switch (message.level) {
            case 'INFO':
                return `## <font  color="#0095da">${message.level}</font>: ${message.title}\n#### ${message.content}`;
            case 'WARNING':
                return `## <font  color="#fd7e14">${message.level}</font>: ${message.title}\n#### ${message.content}`;
            case 'ERROR':
                return `## <font  color="#ff4444">${message.level}</font>: ${message.title}\n#### ${message.content}`;
        }
    }
}
