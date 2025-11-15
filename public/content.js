// Pixiv Bookmark Filter - Content Script

console.log("[Pixiv Filter] Content script starting...");
console.log("[Pixiv Filter] Current URL:", window.location.href);

// 設定を取得
let bookmarkThreshold = 0;
let filterEnabled = true;

// 初期設定を読み込む
chrome.storage.sync.get(["bookmarkThreshold", "filterEnabled"], (result) => {
  bookmarkThreshold = result.bookmarkThreshold ?? 0;
  filterEnabled = result.filterEnabled ?? true;
  console.log("[Pixiv Filter] 設定読み込み:", {
    bookmarkThreshold,
    filterEnabled,
    result,
  });
  applyFilter();
});

// ポップアップからの設定更新を監視
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[Pixiv Filter] メッセージ受信:", message);
  if (message.type === "UPDATE_FILTER") {
    bookmarkThreshold = message.threshold;
    filterEnabled = message.enabled;
    console.log("[Pixiv Filter] 設定更新:", {
      bookmarkThreshold,
      filterEnabled,
    });
    applyFilter();
  }
});

// フィルターを適用する関数
function applyFilter() {
  console.log("[Pixiv Filter] applyFilter() 実行開始");
  console.log("[Pixiv Filter] 現在の設定:", {
    bookmarkThreshold,
    filterEnabled,
  });

  // 小説一覧のアイテムを取得
  // GTMトラッキング用のクラスを持つa要素を含むli要素を探す（これらのクラスは変わりにくい）
  const coverLinks = document.querySelectorAll(
    'a[class*="gtm-novel-searchpage-result-cover"]'
  );
  const novelItems = Array.from(coverLinks)
    .map((link) => link.closest("li"))
    .filter((li) => li !== null);

  if (novelItems.length === 0) {
    console.log("[Pixiv Filter] 小説アイテムが見つかりません");
    console.log("[Pixiv Filter] DOM確認:", {
      ulCount: document.querySelectorAll("ul").length,
      liCount: document.querySelectorAll("li").length,
      coverLinks: document.querySelectorAll(
        'a[class*="gtm-novel-searchpage-result"]'
      ).length,
    });
    return;
  }

  console.log(`[Pixiv Filter] ${novelItems.length}件の作品を検出`);

  let hiddenCount = 0;
  let shownCount = 0;
  let debugSamples = [];

  novelItems.forEach((item, index) => {
    // フィルターが無効な場合は全て表示
    if (!filterEnabled) {
      item.style.display = "";
      shownCount++;
      return;
    }

    // ブックマーク数を取得
    const bookmarkCount = getBookmarkCount(item);

    // 最初の3件をデバッグ出力
    if (index < 3) {
      debugSamples.push({
        index,
        bookmarkCount,
        threshold: bookmarkThreshold,
        willHide: bookmarkCount !== null && bookmarkCount <= bookmarkThreshold,
      });
    }

    // 閾値以下の作品を非表示
    if (bookmarkCount !== null && bookmarkCount <= bookmarkThreshold) {
      item.style.display = "none";
      hiddenCount++;
    } else {
      item.style.display = "";
      shownCount++;
    }
  });

  console.log("[Pixiv Filter] デバッグサンプル（最初の3件）:", debugSamples);
  console.log(
    `[Pixiv Filter] 適用完了 - 表示: ${shownCount}件, 非表示: ${hiddenCount}件`
  );
}

// ブックマーク数を取得する関数
function getBookmarkCount(element) {
  // デバッグ用: 要素のHTMLを確認（最初の1つだけ）
  if (!window.pixivFilterDebugDone) {
    console.log(
      "[Pixiv Filter] 要素のHTML構造サンプル:",
      element.innerHTML.substring(0, 800)
    );
    window.pixivFilterDebugDone = true;
  }

  // ハートアイコン（SVG）を探す - fill-rule="evenodd"を持つpathがハートマーク
  const heartPath = element.querySelector('svg path[fill-rule="evenodd"]');

  if (!heartPath) {
    // ハートアイコンがない = ブックマーク数0
    return 0;
  }

  // ハートSVGから親要素を辿って、数字のみを含むspan要素を探す
  let searchElement = heartPath;
  for (let i = 0; i < 6; i++) {
    searchElement = searchElement.parentElement;
    if (!searchElement) break;

    // このレベルおよび子要素で数字のみを含むspanを探す
    const spans = searchElement.querySelectorAll("span");
    for (const span of spans) {
      // SVGを含まないspanで、テキストが数字とカンマのみの場合
      if (!span.querySelector("svg") && !span.querySelector("path")) {
        const text = span.textContent.trim();
        // 数字とカンマのみで構成されているか確認（文字数や「分」などが含まれないようにする）
        if (/^[\d,]+$/.test(text) && text.length <= 10) {
          const number = parseInt(text.replace(/,/g, ""), 10);
          if (!isNaN(number) && number >= 0 && number < 1000000000) {
            console.log(
              `[Pixiv Filter] ブックマーク数検出: ${number} (テキスト: "${text}")`
            );
            return number;
          }
        }
      }
    }
  }

  // 見つからない場合は1以上と判断（ハートアイコンはあるため）
  return 1;
}

// ページの動的な変更を監視（無限スクロール対応）
const observer = new MutationObserver((mutations) => {
  // 新しい要素が追加された場合にフィルターを再適用
  let shouldReapply = false;

  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length > 0) {
      mutation.addedNodes.forEach((node) => {
        // li要素が追加された場合
        if (
          node.nodeName === "LI" ||
          (node.querySelector && node.querySelector("li"))
        ) {
          shouldReapply = true;
        }
      });
    }
  });

  if (shouldReapply) {
    // 連続して実行されないように少し遅延
    setTimeout(applyFilter, 100);
  }
});

// body要素全体を監視
observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// 初回実行（ページ読み込み完了後）
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(applyFilter, 500);
  });
} else {
  setTimeout(applyFilter, 500);
}

// ポップアップからのメッセージを受信
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[Pixiv Filter] メッセージ受信:", message);

  if (message.type === "SETTINGS_UPDATED") {
    // 設定を更新
    bookmarkThreshold = message.settings.bookmarkThreshold;
    filterEnabled = message.settings.filterEnabled;

    console.log("[Pixiv Filter] 設定を更新しました:", {
      bookmarkThreshold,
      filterEnabled,
    });

    // フィルターを即座に再適用
    applyFilter();

    sendResponse({ success: true });
  }

  return true; // 非同期レスポンスを許可
});

console.log("[Pixiv Filter] Content script loaded");
