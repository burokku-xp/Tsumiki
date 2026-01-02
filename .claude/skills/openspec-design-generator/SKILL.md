---
name: openspec-design-generator
description: This skill should be used when you need to generate images using nanobananapro API. Use this skill whenever image generation is needed, especially for UI design mockups or visual content creation.
---

# Nano Banana Pro 画像生成スキル

nanobananapro APIを使用して画像を生成するためのシンプルなスキルです。

## 使用方法

nanobananapro APIを使用して画像を生成する際に、このスキルを参照してください。

### 基本的な使用方法

```python
import google.generativeai as genai

# APIキーを設定
genai.configure(api_key="YOUR_API_KEY")

# モデルの初期化
model = genai.GenerativeModel("gemini-3-pro-image")

# 画像生成
prompt = "画像生成用のプロンプト"
response = model.generate_content(prompt)

# 画像データの取得と保存
image_data = response.image
with open("output_image.png", "wb") as f:
    f.write(image_data)
```

## 環境変数

- `NANOBANANAPRO_API_KEY`: nanobananapro APIキー（必須）

## 参考

詳細なAPIリファレンスは `references/nanobananapro-api.md` を参照してください。
