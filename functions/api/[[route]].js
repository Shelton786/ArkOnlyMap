// Cloudflare Pages Functions 入口
// 该文件匹配所有 /api/* 请求，交给 Hono 应用处理。
// 环境变量 / D1 绑定通过 c.env 注入（见 wrangler.toml）。
import { handle } from 'hono/cloudflare-pages';
import { createApp } from '../../src/app.js';

export const onRequest = handle(createApp());
