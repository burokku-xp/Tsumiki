import * as vscode from 'vscode';

/**
 * 変更行数計算機能
 * 空行とコメントを除外して実質的なコード行数をカウント
 */
export class LineCounter {
  /**
   * ファイルの行数をカウント（空行とコメントを除外）
   */
  public countLines(document: vscode.TextDocument): number {
    const text = document.getText();
    const lines = text.split('\n');
    const language = this.detectLanguageFromDocument(document);
    
    let count = 0;
    for (const line of lines) {
      const trimmed = line.trim();
      
      // 空行を除外
      if (trimmed.length === 0) {
        continue;
      }
      
      // コメントを除外（言語別）
      if (this.isComment(trimmed, language)) {
        continue;
      }
      
      count++;
    }
    
    return count;
  }

  /**
   * 行がコメントかどうかを判定
   */
  private isComment(line: string, language: string | null): boolean {
    if (!language) {
      return false;
    }

    const trimmed = line.trim();
    
    // 言語別のコメントパターン
    const commentPatterns: { [key: string]: RegExp[] } = {
      'typescript': [
        /^\/\//,           // 単行コメント
        /^\/\*/,           // 複数行コメント開始
        /^\*/,             // 複数行コメント継続
        /^\*\/$/,          // 複数行コメント終了
      ],
      'javascript': [
        /^\/\//,
        /^\/\*/,
        /^\*/,
        /^\*\/$/,
      ],
      'python': [
        /^#/,              // Pythonコメント
      ],
      'java': [
        /^\/\//,
        /^\/\*/,
        /^\*/,
        /^\*\/$/,
      ],
      'cpp': [
        /^\/\//,
        /^\/\*/,
        /^\*/,
        /^\*\/$/,
      ],
      'c': [
        /^\/\//,
        /^\/\*/,
        /^\*/,
        /^\*\/$/,
      ],
      'go': [
        /^\/\//,
        /^\/\*/,
        /^\*/,
        /^\*\/$/,
      ],
      'rust': [
        /^\/\//,
        /^\/\*/,           // Rustは通常 // のみだが、念のため
        /^\*/,
        /^\*\/$/,
      ],
      'html': [
        /^<!--/,           // HTMLコメント開始
        /^-->/,            // HTMLコメント終了
        /^<!--.*-->$/,     // 単行HTMLコメント
      ],
      'css': [
        /^\/\*/,
        /^\*/,
        /^\*\/$/,
      ],
      'json': [
        // JSONはコメントをサポートしない（ただし、一部のパーサーは // を許可）
        /^\/\//,
      ],
      'markdown': [
        // Markdownはコメント構文がない（HTMLコメントを使用する場合がある）
        /^<!--/,
        /^-->/,
      ],
      'yaml': [
        /^#/,
      ],
      'xml': [
        /^<!--/,
        /^-->/,
        /^<!--.*-->$/,
      ],
    };

    const patterns = commentPatterns[language.toLowerCase()];
    if (!patterns) {
      return false;
    }

    return patterns.some(pattern => pattern.test(trimmed));
  }

  /**
   * ドキュメントから言語を検出（簡易版）
   */
  private detectLanguageFromDocument(document: vscode.TextDocument): string | null {
    return document.languageId || null;
  }
}
