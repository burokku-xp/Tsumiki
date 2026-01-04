# Change: UI and File Tracking Fixes

## Why
細かい修正を実施して、UIの一貫性を保ち、ワークスペース外のファイルが計測対象に含まれる問題を解決する。

1. 設定画面の背景色が主機能画面と異なり、一貫性がない
2. ワークスペース外のファイル（例：settings.json）が編集ファイルの対象に含まれてしまっている

## What Changes
- 設定画面の背景色を主機能画面と同様に `transparent` に変更
- ファイル編集追跡時にワークスペース外のファイルを除外する処理を追加

## Impact
- Affected specs: `display`, `measurement`
- Affected code:
  - `src/views/settingsView.ts` - 背景色設定の修正
  - `src/extension.ts` - ワークスペース外ファイルの除外処理
