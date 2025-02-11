/**
 * @File: index.ts
 * @author: 夏花
 * @time: 2025-02-07
 */

import {
    DWClient,
    DWClientDownStream,
    RobotMessage,
    TOPIC_ROBOT,
} from 'dingtalk-stream';
import axios, { AxiosResponse } from 'axios';
import { Adapter, AdapterOptions, Message } from '@simpleping/core';

export interface DingtalkOptions extends AdapterOptions {
    clientId: string;
    clientSecret: string;
    webhookurl: string;
}

export class DingtalkAdapter extends Adapter {
    public name: string = 'dingtalk';
    private options: DingtalkOptions;
    private lastMessage: Message | null = null;
    private client: DWClient;

    constructor(options: DingtalkOptions) {
        super();
        this.options = options;
        this.client = new DWClient({
            clientId: this.options.clientId,
            clientSecret: this.options.clientSecret,
        });
        this.client
            .registerCallbackListener(
                TOPIC_ROBOT,
                async (res: DWClientDownStream): Promise<void> => {
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

                    const accessToken: string =
                        await this.client.getAccessToken();
                    const result: AxiosResponse<any, any> = await axios({
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
                },
            )
            .connect();
    }

    send(message: Message): Promise<boolean> {
        this.lastMessage = message;
        return new Promise<boolean>((resolve: any, reject: any) => {
            try {
                const result: Promise<AxiosResponse<any, any>> = axios({
                    method: 'POST',
                    url: this.options.webhookurl,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    data: {
                        msgtype: 'markdown',
                        markdown: {
                            title: message.title,
                            text:
                                `#### ${message.level}:${message.title}\n` +
                                `${message.content}\n` +
                                message.image
                                    ? `![](${message.image})`
                                    : '',
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
}
