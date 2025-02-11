/**
 * @File: index.ts
 * @author: 夏花
 * @time: 2025-02-07
 */

import { Adapter, AdapterOptions, Message } from '@simpleping/core';
import nodemailer from 'nodemailer';
import art from 'art-template';

export interface EmailOptions extends AdapterOptions {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
}

export class EmailAdapter extends Adapter {
    public name = 'email';
    private options: EmailOptions;
    private transporter: nodemailer.Transporter;
    public emailSendOptions: { from: string; to: string };

    constructor(
        options: EmailOptions,
        emailSendOptions: { from: string; to: string },
    ) {
        super();
        this.options = options;
        this.transporter = nodemailer.createTransport({
            host: options.host,
            port: options.port,
            secure: options.secure,
            auth: options.auth,
        });
        this.emailSendOptions = emailSendOptions;
    }

    send(message: Message): Promise<boolean> {
        return new Promise((resolve: any, reject: any): void => {
            try {
                this.transporter.sendMail(
                    {
                        from: this.emailSendOptions.from,
                        to: this.emailSendOptions.to,
                        subject: `${message.level}: ${message.title}`,
                        html: this.artTemplate(message),
                    },
                    (error: Error | null, info: any): void => {
                        if (error) {
                            reject(error);
                            return;
                        }
                        resolve(true);
                    },
                );
            } catch (e) {
                reject(e);
            }
        });
    }

    artTemplate(message: Message): string {
        const html =
            '<!DOCTYPE html>\n' +
            '<html>\n' +
            '<head>\n' +
            '    <meta charset="UTF-8">\n' +
            '</head>\n' +
            '<body>\n' +
            '    <div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; max-width: 600px; margin: 20px auto; border-radius: 8px; background: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">\n' +
            '        <!-- 头部 -->\n' +
            "        <div style=\"{{if level=='INFO'}}background: #E8F5E9;{{else if level=='WARNING'}}background: #FFF3E0;{{else}}background: #FFEBEE;{{/if}} padding: 16px 20px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid rgba(0,0,0,0.05);\">\n" +
            '            <!-- 图标区域 -->\n' +
            '            <div style="flex-shrink: 0;">\n' +
            '                {{if icon}}\n' +
            '                <img src="{{icon}}" style="width: 24px; height: 24px; object-fit: contain;">\n' +
            '                {{else}}\n' +
            '                <svg style="width:24px;height:24px;{{if level==\'INFO\'}}color:#4CAF50;{{else if level==\'WARNING\'}}color:#FF9800;{{else}}color:#F44336;{{/if}}" viewBox="0 0 24 24">\n' +
            "                    {{if level=='INFO'}}\n" +
            '                    <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>\n' +
            "                    {{else if level=='WARNING'}}\n" +
            '                    <path fill="currentColor" d="M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"/>\n' +
            '                    {{else}}\n' +
            '                    <path fill="currentColor" d="M11 15h2v2h-2zm0-8h2v6h-2zm1-5C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>\n' +
            '                    {{/if}}\n' +
            '                </svg>\n' +
            '                {{/if}}\n' +
            '            </div>\n' +
            '\n' +
            '            <!-- 标题 -->\n' +
            "            <div style=\"font-size: 17px; font-weight: 600; {{if level=='INFO'}}color:#0095da;{{else if level=='WARNING'}}color:#fd7e14;{{else if level=='ERROR'}}color:#ff4444;{{/if}}\">\n" +
            '                {{title}}\n' +
            '            </div>\n' +
            '        </div>\n' +
            '\n' +
            '        <!-- 内容主体 -->\n' +
            '        <div style="padding: 18px 20px; color: #424242; line-height: 1.6;">\n' +
            '            <div style="margin-bottom: {{if image}}12px{{else}}0{{/if}};">{{content}}</div>\n' +
            '\n' +
            '            {{if image}}\n' +
            '            <img src="{{image}}" style="max-width: 100%; height: auto; border-radius: 6px; border: 1px solid rgba(0,0,0,0.08);">\n' +
            '            {{/if}}\n' +
            '        </div>\n' +
            '\n' +
            '        {{if timestamp}}\n' +
            '        <!-- 时间戳 -->\n' +
            '        <div style="padding: 12px 20px; background: #f5f5f5; color: #757575; font-size: 13px; text-align: right; border-top: 1px solid rgba(0,0,0,0.05);">\n' +
            '            {{timestamp}}\n' +
            '        </div>\n' +
            '        {{/if}}\n' +
            '    </div>\n' +
            '</body>\n' +
            '</html>';
        const template = art.compile(html);
        return template({
            level: message.level,
            title: message.title,
            content: message.content,
            icon: message.icon,
            image: message.image,
            timestamp: message.timestamp,
            levelColor:
                message.level === 'ERROR'
                    ? '#f44336'
                    : message.level === 'WARNING'
                      ? '#ff9800'
                      : '#4caf50',
        });
    }
}
