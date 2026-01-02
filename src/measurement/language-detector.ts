import * as vscode from 'vscode';
import * as path from 'path';

/**
 * 言語検出機能
 * 拡張子ベースでプログラミング言語を判定
 */
export class LanguageDetector {
  /**
   * 拡張子から言語マッピング
   */
  private static readonly EXTENSION_TO_LANGUAGE: { [key: string]: string } = {
    // TypeScript / JavaScript
    '.ts': 'TypeScript',
    '.tsx': 'TypeScript',
    '.js': 'JavaScript',
    '.jsx': 'JavaScript',
    '.mjs': 'JavaScript',
    '.cjs': 'JavaScript',
    
    // Python
    '.py': 'Python',
    '.pyw': 'Python',
    '.pyi': 'Python',
    
    // Java
    '.java': 'Java',
    
    // C / C++
    '.c': 'C',
    '.cpp': 'C++',
    '.cc': 'C++',
    '.cxx': 'C++',
    '.h': 'C/C++',
    '.hpp': 'C++',
    '.hxx': 'C++',
    
    // Go
    '.go': 'Go',
    
    // Rust
    '.rs': 'Rust',
    
    // Web
    '.html': 'HTML',
    '.htm': 'HTML',
    '.css': 'CSS',
    '.scss': 'SCSS',
    '.sass': 'SASS',
    '.less': 'Less',
    
    // Markup / Config
    '.xml': 'XML',
    '.json': 'JSON',
    '.yaml': 'YAML',
    '.yml': 'YAML',
    '.toml': 'TOML',
    '.md': 'Markdown',
    '.markdown': 'Markdown',
    
    // Shell
    '.sh': 'Shell',
    '.bash': 'Bash',
    '.zsh': 'Zsh',
    '.fish': 'Fish',
    
    // SQL
    '.sql': 'SQL',
    
    // Other
    '.php': 'PHP',
    '.rb': 'Ruby',
    '.swift': 'Swift',
    '.kt': 'Kotlin',
    '.scala': 'Scala',
    '.clj': 'Clojure',
    '.hs': 'Haskell',
    '.ml': 'OCaml',
    '.fs': 'F#',
    '.cs': 'C#',
    '.vb': 'Visual Basic',
    '.dart': 'Dart',
    '.lua': 'Lua',
    '.r': 'R',
    '.m': 'Objective-C',
    '.mm': 'Objective-C++',
    '.pl': 'Perl',
    '.pm': 'Perl',
    '.vim': 'Vim Script',
    '.ps1': 'PowerShell',
    '.psm1': 'PowerShell',
  };

  /**
   * ファイルパスから言語を検出
   */
  public detectLanguage(filePath: string): string | null {
    const ext = path.extname(filePath).toLowerCase();
    return LanguageDetector.EXTENSION_TO_LANGUAGE[ext] || null;
  }

  /**
   * ドキュメントから言語を検出
   */
  public detectLanguageFromDocument(document: vscode.TextDocument): string | null {
    // まず拡張子から検出を試みる
    const language = this.detectLanguage(document.uri.fsPath);
    if (language) {
      return language;
    }

    // 拡張子で検出できない場合は、VSCodeの言語IDを使用
    const languageId = document.languageId;
    if (languageId && languageId !== 'plaintext') {
      // 言語IDを適切な形式に変換（例: "typescript" -> "TypeScript"）
      return this.formatLanguageName(languageId);
    }

    return null;
  }

  /**
   * 言語IDを適切な形式にフォーマット
   */
  private formatLanguageName(languageId: string): string {
    // 一般的な言語IDのマッピング
    const languageIdMap: { [key: string]: string } = {
      'typescript': 'TypeScript',
      'javascript': 'JavaScript',
      'python': 'Python',
      'java': 'Java',
      'c': 'C',
      'cpp': 'C++',
      'go': 'Go',
      'rust': 'Rust',
      'html': 'HTML',
      'css': 'CSS',
      'json': 'JSON',
      'yaml': 'YAML',
      'markdown': 'Markdown',
      'xml': 'XML',
      'sql': 'SQL',
      'php': 'PHP',
      'ruby': 'Ruby',
      'swift': 'Swift',
      'kotlin': 'Kotlin',
      'scala': 'Scala',
      'clojure': 'Clojure',
      'haskell': 'Haskell',
      'ocaml': 'OCaml',
      'fsharp': 'F#',
      'csharp': 'C#',
      'dart': 'Dart',
      'lua': 'Lua',
      'r': 'R',
      'objective-c': 'Objective-C',
      'perl': 'Perl',
      'powershell': 'PowerShell',
    };

    const mapped = languageIdMap[languageId.toLowerCase()];
    if (mapped) {
      return mapped;
    }

    // マッピングがない場合は、最初の文字を大文字にして返す
    return languageId.charAt(0).toUpperCase() + languageId.slice(1);
  }
}
