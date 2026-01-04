# Change: Add Measurement Features

## Why

開発者の作業量を計測するため、作業時間、保存回数、ファイル編集、行数、言語比率の計測機能が必要です。VSCode APIのイベントを活用して、自動的に計測データを収集します。

## What Changes

- 作業時間計測機能（スタート/ストップ式タイマー）
- 保存回数カウント機能（ファイル保存イベントの監視）
- 編集ファイル追跡機能（ファイル名・行数の記録）
- 変更行数計算機能（空行・コメント除外、保存時のみカウント）
- 言語比率集計機能（拡張子ベースの言語判定と集計）
- 計測データのデータベースへの保存

## Impact

- Affected specs: `measurement` (新規作成)
- Affected code:
  - `src/measurement/` (新規ディレクトリ)
  - `src/measurement/timer.ts` (新規: 作業時間計測)
  - `src/measurement/file-tracker.ts` (新規: ファイル編集追跡)
  - `src/measurement/line-counter.ts` (新規: 行数計算)
  - `src/measurement/language-detector.ts` (新規: 言語判定)
  - `src/extension.ts` (修正: イベントリスナーの登録)
