/**
 * @File: index.ts
 * @author: 夏花
 * @time: 2025-03-24
 */

import { Adapter, AdapterOptions, Message } from 'simpleping/core';
import WebSocket from 'ws';

export interface WsOptions extends AdapterOptions {
    url: string;
    reconnectAttempts?: number;
    reconnectInterval?: number;
    protocols?: string | string[];
}

export class WsAdapter extends Adapter {
    public name = 'ws';
    private options: WsOptions;
    private ws: WebSocket | null = null;
    private isConnected = false;
    private reconnectCount = 0;

    constructor(options: WsOptions) {
        super();
        this.options = {
            reconnectAttempts: 3,
            reconnectInterval: 3000,
            ...options,
        };
        this.connect();
    }

    private connect(): void {
        this.ws = new WebSocket(this.options.url, this.options.protocols);

        this.ws.on('open', () => {
            this.isConnected = true;
            this.reconnectCount = 0;
        });

        this.ws.on('error', (error) => {
            console.error(`[WS Adapter Error]:`, error);
            this.handleReconnect();
        });

        this.ws.on('close', () => {
            this.isConnected = false;
            this.handleReconnect();
        });
    }

    private handleReconnect(): void {
        if (this.reconnectCount < this.options.reconnectAttempts!) {
            setTimeout(() => {
                this.reconnectCount++;
                this.connect();
            }, this.options.reconnectInterval);
        }
    }

    public send(message: Message): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (!this.isConnected || !this.ws) {
                return reject(
                    new Error('WebSocket connection not established'),
                );
            }

            try {
                const messageStr = JSON.stringify(message);

                this.ws.send(messageStr, (error) => {
                    error ? reject(error) : resolve(true);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    public close(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}
