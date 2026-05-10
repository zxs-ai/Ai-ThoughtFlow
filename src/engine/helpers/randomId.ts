/**
 * 生成唯一 ID 的轻量工具
 * Excalidraw 要求每个元素有唯一 id
 */
export function randomId(): string {
  return Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
}
