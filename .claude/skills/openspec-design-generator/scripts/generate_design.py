#!/usr/bin/env python3
"""
OpenSpec Design Generator - nanobananapro APIを使用してデザイン画像を生成

Usage:
    generate_design.py <change-id> [--prompt "custom prompt"]

環境変数:
    NANOBANANAPRO_API_KEY: nanobananapro APIキー（必須）

生成された画像は openspec/changes/<change-id>/image/ に保存されます。
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime

# .envファイルの読み込み（オプション）
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # python-dotenvがインストールされていない場合はスキップ
    pass

import google.generativeai as genai


def load_project_context(project_path):
    """project.mdを読み込んでコンテキストを取得"""
    project_file = project_path / "project.md"
    if project_file.exists():
        return project_file.read_text(encoding="utf-8")
    return ""


def load_change_context(change_path):
    """changeディレクトリのファイルを読み込んでコンテキストを取得"""
    context_parts = []
    
    # proposal.md
    proposal_file = change_path / "proposal.md"
    if proposal_file.exists():
        context_parts.append(f"## Proposal\n{proposal_file.read_text(encoding='utf-8')}")
    
    # design.md
    design_file = change_path / "design.md"
    if design_file.exists():
        context_parts.append(f"## Design\n{design_file.read_text(encoding='utf-8')}")
    
    # spec.md（複数ある可能性がある）
    specs_dir = change_path / "specs"
    if specs_dir.exists():
        for spec_dir in specs_dir.iterdir():
            if spec_dir.is_dir():
                spec_file = spec_dir / "spec.md"
                if spec_file.exists():
                    context_parts.append(f"## Spec: {spec_dir.name}\n{spec_file.read_text(encoding='utf-8')}")
    
    return "\n\n".join(context_parts)


def generate_design_prompt(project_context, change_context, custom_prompt=None):
    """デザイン生成用のプロンプトを作成"""
    if custom_prompt:
        base_prompt = custom_prompt
    else:
        base_prompt = """UIデザインのモックアップ画像を生成してください。
以下の要件を満たす、モダンで使いやすいUIデザインを提案してください。"""
    
    prompt = f"""{base_prompt}

## プロジェクトコンテキスト
{project_context}

## 変更内容
{change_context}

上記の情報を基に、実装すべき機能のUIデザインを提案してください。
VSCode拡張機能のサイドパネルに表示されるUIを想定しています。
"""
    
    return prompt


def generate_image(prompt, api_key):
    """nanobananapro APIを使用して画像を生成
    
    Returns:
        tuple: (image_data: bytes, mime_type: str) または None
    """
    import base64
    
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-3-pro-image-preview")
        
        print("画像を生成中...")
        response = model.generate_content(prompt)
        
        # レスポンスから画像データを取得
        if hasattr(response, 'candidates') and response.candidates:
            candidate = response.candidates[0]
            if hasattr(candidate, 'content') and candidate.content:
                parts = candidate.content.parts
                for part in parts:
                    # inline_data属性を確認
                    if hasattr(part, 'inline_data'):
                        inline_data = part.inline_data
                        if inline_data and hasattr(inline_data, 'data'):
                            # MIMEタイプを取得
                            mime_type = getattr(inline_data, 'mime_type', 'image/png')
                            
                            # base64エンコードされたデータをデコード
                            try:
                                # データが文字列の場合
                                if isinstance(inline_data.data, str):
                                    image_data = base64.b64decode(inline_data.data)
                                else:
                                    # 既にバイナリデータの場合
                                    image_data = inline_data.data
                                return (image_data, mime_type)
                            except Exception as decode_error:
                                print(f"⚠️  base64デコードエラー: {decode_error}")
                                # デコードに失敗した場合、そのまま返す
                                if isinstance(inline_data.data, bytes):
                                    return (inline_data.data, mime_type)
                                elif isinstance(inline_data.data, str):
                                    # 文字列の場合はそのままエンコードして返す
                                    return (inline_data.data.encode('utf-8'), mime_type)
                    
                    # テキスト部分をスキップ（画像のみを探す）
                    if hasattr(part, 'text'):
                        continue
        
        # 旧形式のフォールバック
        if hasattr(response, 'image') and response.image:
            return (response.image, 'image/png')
        
        print("エラー: 画像データが取得できませんでした")
        print(f"レスポンス構造: {type(response)}")
        if hasattr(response, 'candidates'):
            print(f"候補数: {len(response.candidates)}")
            if response.candidates:
                candidate = response.candidates[0]
                if hasattr(candidate, 'content'):
                    print(f"コンテンツパーツ数: {len(candidate.content.parts) if hasattr(candidate.content, 'parts') else 0}")
        return None
    except Exception as e:
        print(f"エラー: 画像生成に失敗しました: {e}")
        import traceback
        traceback.print_exc()
        return None


def save_image(image_data, mime_type, output_dir, change_id):
    """画像を保存
    
    Args:
        image_data: 画像データ（bytes）
        mime_type: MIMEタイプ（例: 'image/png', 'image/jpeg'）
        output_dir: 出力ディレクトリ
        change_id: change ID
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # MIMEタイプに基づいて拡張子を決定
    mime_to_ext = {
        'image/png': '.png',
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/webp': '.webp',
        'image/gif': '.gif',
    }
    ext = mime_to_ext.get(mime_type, '.png')
    
    # タイムスタンプ付きファイル名
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"design_{timestamp}{ext}"
    filepath = output_dir / filename
    
    with open(filepath, "wb") as f:
        f.write(image_data)
    
    print(f"✅ 画像を保存しました: {filepath}")
    return filepath


def cleanup_old_images(image_dir, keep_latest=True):
    """古い画像を削除（最新以外）"""
    if not image_dir.exists():
        return
    
    image_files = sorted(image_dir.glob("design_*.png"), key=lambda p: p.stat().st_mtime)
    
    if len(image_files) <= 1:
        return
    
    # 最新以外を削除
    for img_file in image_files[:-1]:
        img_file.unlink()
        print(f"🗑️  削除: {img_file.name}")


def main():
    if len(sys.argv) < 2:
        print("Usage: generate_design.py <change-id> [--prompt \"custom prompt\"]")
        sys.exit(1)
    
    change_id = sys.argv[1]
    custom_prompt = None
    
    # カスタムプロンプトの処理
    if "--prompt" in sys.argv:
        idx = sys.argv.index("--prompt")
        if idx + 1 < len(sys.argv):
            custom_prompt = sys.argv[idx + 1]
    
    # APIキーの確認（環境変数または.envファイルから）
    api_key = os.getenv("NANOBANANAPRO_API_KEY")
    if not api_key:
        print("❌ エラー: NANOBANANAPRO_API_KEY環境変数が設定されていません")
        print("\nAPIキーの設定方法:")
        print("  1. 環境変数として設定:")
        print("     export NANOBANANAPRO_API_KEY='your-api-key'")
        print("  2. .env ファイルに設定（推奨）:")
        print("     NANOBANANAPRO_API_KEY=your-api-key")
        print("\n.envファイルを使用する場合は、python-dotenvをインストールしてください:")
        print("     pip install python-dotenv")
        sys.exit(1)
    
    # パスの設定
    workspace_root = Path.cwd()
    openspec_dir = workspace_root / "openspec"
    project_file = openspec_dir / "project.md"
    change_dir = openspec_dir / "changes" / change_id
    image_dir = change_dir / "image"
    
    # ディレクトリの確認
    if not change_dir.exists():
        print(f"❌ エラー: changeディレクトリが見つかりません: {change_dir}")
        sys.exit(1)
    
    # コンテキストの読み込み
    print(f"📖 コンテキストを読み込み中: {change_id}")
    project_context = load_project_context(openspec_dir)
    change_context = load_change_context(change_dir)
    
    if not change_context:
        print("⚠️  警告: changeディレクトリにコンテキストファイルが見つかりません")
    
    # プロンプトの生成
    prompt = generate_design_prompt(project_context, change_context, custom_prompt)
    
    # 画像の生成
    result = generate_image(prompt, api_key)
    if not result:
        sys.exit(1)
    
    # 結果の展開
    if isinstance(result, tuple) and len(result) == 2:
        image_data, mime_type = result
    else:
        # 旧形式のフォールバック
        image_data = result
        mime_type = 'image/png'
    
    # 画像の保存
    image_path = save_image(image_data, mime_type, image_dir, change_id)
    
    print(f"\n✅ デザイン画像の生成が完了しました")
    print(f"   保存先: {image_path}")
    print(f"\n画像を確認して問題なければ、古い画像を削除できます。")


if __name__ == "__main__":
    main()
