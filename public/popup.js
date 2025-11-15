// ポップアップのJavaScript

// DOM要素の取得
const filterEnabledToggle = document.getElementById("filterEnabled");
const bookmarkThresholdInput = document.getElementById("bookmarkThreshold");
const saveButton = document.getElementById("saveButton");
const statusMessage = document.getElementById("statusMessage");

// 初期化: 保存済みの設定を読み込む
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get({
      filterEnabled: false,
      bookmarkThreshold: 100,
    });

    filterEnabledToggle.checked = result.filterEnabled;
    bookmarkThresholdInput.value = result.bookmarkThreshold;
  } catch (error) {
    console.error("[Popup] 設定の読み込みエラー:", error);
    showStatus("設定の読み込みに失敗しました", "error");
  }
}

// 設定を保存する
async function saveSettings() {
  const filterEnabled = filterEnabledToggle.checked;
  const bookmarkThreshold = parseInt(bookmarkThresholdInput.value, 10);

  if (isNaN(bookmarkThreshold) || bookmarkThreshold < 0) {
    showStatus("ブックマーク数は0以上の数値を入力してください", "error");
    return;
  }

  const settings = {
    filterEnabled,
    bookmarkThreshold,
  };

  try {
    await chrome.storage.sync.set(settings);
    showStatus("設定を保存しました", "success");

    // コンテンツスクリプトに設定変更を通知
    notifyContentScripts(settings);
  } catch (error) {
    console.error("[Popup] 設定の保存エラー:", error);
    showStatus("設定の保存に失敗しました", "error");
  }
}

// コンテンツスクリプトに設定変更を通知
async function notifyContentScripts(settings) {
  try {
    const tabs = await chrome.tabs.query({
      url: "https://www.pixiv.net/tags/*/novels*",
    });

    for (const tab of tabs) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: "SETTINGS_UPDATED",
          settings,
        });
      } catch (error) {
        console.warn(`[Popup] タブ ${tab.id} への通知に失敗:`, error);
      }
    }
  } catch (error) {
    console.error("[Popup] タブ取得エラー:", error);
  }
}

// ステータスメッセージを表示
function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;

  // 3秒後に非表示
  setTimeout(() => {
    statusMessage.className = "status-message";
  }, 3000);
}

// イベントリスナーの設定
saveButton.addEventListener("click", saveSettings);

// トグルスイッチの変更時も保存（即座に反映）
filterEnabledToggle.addEventListener("change", saveSettings);

// 初期化
loadSettings();
