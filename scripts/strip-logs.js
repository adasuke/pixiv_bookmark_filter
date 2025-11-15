#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * JavaScriptファイルからconsole.log/debug/info呼び出しを削除
 * 複数行にわたるconsole呼び出しにも対応
 */
function stripConsoleLogs(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, "utf8");

  // console.log, console.debug, console.info の呼び出しを削除
  // 複数行にわたる呼び出しにも対応（括弧の対応を見る）
  content = content.replace(/console\.(log|debug|info)\s*\([^)]*\);?/g, "");

  // より複雑な複数行のconsole呼び出しに対応
  // 開き括弧から閉じ括弧までを探す
  let modified = true;
  while (modified) {
    const before = content;
    content = content.replace(
      /console\.(log|debug|info)\s*\([^()]*(?:\([^()]*\)[^()]*)*\);?/g,
      ""
    );
    modified = before !== content;
  }

  // 空行の連続を1行にまとめる
  content = content.replace(/\n{3,}/g, "\n\n");

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Stripped console logs from: ${filePath}`);
}

// コマンドライン引数からファイルリストを取得
const files = process.argv.slice(2);

if (files.length === 0) {
  console.error("Usage: node strip-logs.js <file1> <file2> ...");
  process.exit(1);
}

files.forEach(stripConsoleLogs);
