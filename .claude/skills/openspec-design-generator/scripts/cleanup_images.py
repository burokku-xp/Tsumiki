#!/usr/bin/env python3
"""
OpenSpec Design Image Cleanup - 古いデザイン画像を削除

Usage:
    cleanup_images.py <change-id>

最新の画像以外を削除します。
"""

import sys
from pathlib import Path


def cleanup_old_images(image_dir):
    """古い画像を削除（最新以外）"""
    if not image_dir.exists():
        print(f"⚠️  画像ディレクトリが見つかりません: {image_dir}")
        return
    
    image_files = sorted(image_dir.glob("design_*.png"), key=lambda p: p.stat().st_mtime)
    
    if len(image_files) <= 1:
        print("ℹ️  削除する画像がありません（1枚以下）")
        return
    
    # 最新以外を削除
    deleted_count = 0
    for img_file in image_files[:-1]:
        img_file.unlink()
        print(f"🗑️  削除: {img_file.name}")
        deleted_count += 1
    
    print(f"\n✅ {deleted_count}個の古い画像を削除しました")
    print(f"   残り: {image_files[-1].name}")


def main():
    if len(sys.argv) < 2:
        print("Usage: cleanup_images.py <change-id>")
        sys.exit(1)
    
    change_id = sys.argv[1]
    
    # パスの設定
    workspace_root = Path.cwd()
    change_dir = workspace_root / "openspec" / "changes" / change_id
    image_dir = change_dir / "image"
    
    # ディレクトリの確認
    if not change_dir.exists():
        print(f"❌ エラー: changeディレクトリが見つかりません: {change_dir}")
        sys.exit(1)
    
    # クリーンアップの実行
    print(f"🧹 古い画像をクリーンアップ中: {change_id}")
    cleanup_old_images(image_dir)


if __name__ == "__main__":
    main()
