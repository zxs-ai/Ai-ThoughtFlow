#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# deploy-desktop.sh
# 通过 Terminal Bridge 自动打包 Tauri 应用并复制到桌面
# 用法：npm run deploy  或  bash scripts/deploy-desktop.sh
# ─────────────────────────────────────────────────────────────

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BRIDGE_RUNNER="/Users/zz/terminal-bridge/bridge-runner.py"
DESKTOP="$HOME/Desktop"
BUILD_DIR="$PROJECT_ROOT/src-tauri/target/release/bundle"

# 目标文件名（含 Pro）
DMG_DEST_NAME="Ai-ThoughtFlow-Pro_1.0.0_aarch64.dmg"
APP_DEST_NAME="Ai ThoughtFlow Pro.app"

echo ""
echo "══════════════════════════════════════════════"
echo "  🚀 Ai ThoughtFlow Pro — 自动打包部署"
echo "══════════════════════════════════════════════"
echo ""

# 1. 通过 bridge-runner 执行 tauri build（超时 600s）
python3 "$BRIDGE_RUNNER" \
    "cd '$PROJECT_ROOT' && npx tauri build" \
    "$PROJECT_ROOT" \
    600

BUILD_EXIT=$?

if [ $BUILD_EXIT -ne 0 ]; then
    echo ""
    echo "❌ 打包失败（exit $BUILD_EXIT），请检查终端输出。"
    exit 1
fi

echo ""
echo "📦 打包成功，正在复制到桌面..."

# 2. 复制产物到桌面（在当前环境执行，只是文件操作）
COPIED=0

# 查找真正的 DMG（排除 macOS 挂载时产生的 rw.* 临时文件）
DMG=$(find "$BUILD_DIR" -name "*.dmg" 2>/dev/null | grep -v '/rw\.' | head -1)

# 查找 .app bundle
APP=$(find "$BUILD_DIR" -maxdepth 4 -name "*.app" 2>/dev/null | head -1)

if [ -n "$DMG" ]; then
    # 清除桌面上同名及旧版文件
    rm -f "$DESKTOP"/*ThoughtFlow*.dmg "$DESKTOP"/rw.*.dmg 2>/dev/null
    # 复制并重命名为标准 Pro 名称
    cp -f "$DMG" "$DESKTOP/$DMG_DEST_NAME"
    echo "✅ DMG → $DESKTOP/$DMG_DEST_NAME"
    COPIED=1
fi

if [ -n "$APP" ]; then
    # 清除桌面上旧版 .app（任意名称，避免留存旧包）
    rm -rf "$DESKTOP"/*.app 2>/dev/null
    # 同步到桌面，保留 .app 原名（已是 Ai ThoughtFlow Pro.app）
    rsync -a --delete "$APP" "$DESKTOP/"
    echo "✅ .app → $DESKTOP/$(basename "$APP")"
    COPIED=1
fi

if [ "$COPIED" -eq 0 ]; then
    echo "⚠️  未找到产物，请检查 $BUILD_DIR"
    exit 1
fi

echo ""
echo "🎉 完成！桌面已更新。"
echo "   DMG: $DMG_DEST_NAME"
echo "   APP: $APP_DEST_NAME"
echo "══════════════════════════════════════════════"

