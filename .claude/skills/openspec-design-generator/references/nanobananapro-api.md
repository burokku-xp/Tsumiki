# Nano Banana Pro API リファレンス

## 概要

Nano Banana Pro APIは、Googleの最新の画像生成モデル（Nano Banana 2-class）を使用して、高品質な画像を生成・編集できるAPIです。

## 認証

APIキーが必要です。nanobananaproのプラットフォームでアカウントを作成し、APIキーを取得してください。

- 公式サイト: https://nanobananaproapi.com/
- APIキーの取得: プラットフォームにサインアップしてAPIキーを取得

## Python SDK の使用方法

### インストール

```bash
pip install google-generativeai
```

### 基本的な使用方法

```python
import google.generativeai as genai

# APIキーを設定
genai.configure(api_key="YOUR_API_KEY")

# モデルの初期化
model = genai.GenerativeModel("gemini-3-pro-image")

# 画像生成
prompt = "A beautiful sunset over the mountains"
response = model.generate_content(prompt)

# 画像データの取得
image_data = response.image

# 画像の保存
with open("generated_image.png", "wb") as f:
    f.write(image_data)
```

## 主な機能

### 1. テキストから画像生成（Text-to-Image）
テキストプロンプトから画像を生成します。

### 2. 画像から画像生成（Image-to-Image）
参照画像を基に新しい画像を生成します。

### 3. セマンティック編集
画像内のオブジェクトを置き換えたり、シーンを拡張したり、詳細を調整できます。

### 4. 多言語タイポグラフィ
複数の言語で正確で読みやすいテキストを含む画像を生成できます。

### 5. スタイル一貫性
複数の画像間でキャラクターやブランディング要素の一貫性を保つことができます。

## 解像度オプション

- 1K解像度
- 2K解像度
- 4K解像度

## エラーハンドリング

API呼び出し時には適切な例外処理を実装してください：

```python
try:
    response = model.generate_content(prompt)
    image_data = response.image
except Exception as e:
    print(f"エラー: {e}")
    # エラーハンドリング
```

## 参考リンク

- 公式ドキュメント: https://nanobananaproapi.com/
- APIプラットフォーム: https://nanobananapro.cloud/
