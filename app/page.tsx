"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [threshold, setThreshold] = useState<number>(0);
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // 設定を読み込む
  useEffect(() => {
    console.log("[Popup] useEffect実行");
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.sync.get(
        ["bookmarkThreshold", "filterEnabled"],
        (result) => {
          console.log("[Popup] Storage読み込み結果:", result);
          if (result.bookmarkThreshold !== undefined) {
            setThreshold(result.bookmarkThreshold);
          }
          if (result.filterEnabled !== undefined) {
            setIsEnabled(result.filterEnabled);
          }
        }
      );
    }
  }, []);

  // 設定を保存
  const handleSave = () => {
    console.log("[Popup] handleSave実行:", { threshold, isEnabled });
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.sync.set(
        {
          bookmarkThreshold: threshold,
          filterEnabled: isEnabled,
        },
        () => {
          console.log("[Popup] Storage保存完了");
          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 2000);

          // アクティブなタブに設定変更を通知
          sendUpdateToTab();
        }
      );
    }
  };

  // タブに更新メッセージを送信
  const sendUpdateToTab = () => {
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: "UPDATE_FILTER",
            threshold: threshold,
            enabled: isEnabled,
          });
        }
      });
    }
  };

  // チェックボックス変更時の処理
  const handleToggleEnabled = (checked: boolean) => {
    setIsEnabled(checked);

    // 即座に反映
    if (typeof chrome !== "undefined" && chrome.storage && chrome.tabs) {
      chrome.storage.sync.set({ filterEnabled: checked }, () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, {
              type: "UPDATE_FILTER",
              threshold: threshold,
              enabled: checked,
            });
          }
        });
      });
    }
  };

  return (
    <div
      style={{
        width: "380px",
        minHeight: "400px",
        padding: "20px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        boxSizing: "border-box",
      }}
    >
      <h1
        style={{
          fontSize: "20px",
          marginBottom: "16px",
          fontWeight: "600",
          color: "#333",
        }}
      >
        Pixiv ブックマークフィルター
      </h1>

      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <span style={{ fontSize: "15px", color: "#333", fontWeight: "500" }}>
            フィルターを有効にする
          </span>
          <div
            onClick={() => handleToggleEnabled(!isEnabled)}
            style={{
              position: "relative",
              width: "44px",
              height: "24px",
              backgroundColor: isEnabled ? "#0ea5e9" : "#ccc",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "background-color 0.3s",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "2px",
                left: isEnabled ? "22px" : "2px",
                width: "20px",
                height: "20px",
                backgroundColor: "white",
                borderRadius: "50%",
                transition: "left 0.3s",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: "8px" }}>
          <label
            htmlFor="threshold"
            style={{
              display: "block",
              fontSize: "14px",
              marginBottom: "6px",
              color: "#555",
            }}
          >
            ブックマーク数の閾値
          </label>
          <input
            id="threshold"
            type="number"
            min="0"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            disabled={!isEnabled}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "15px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              backgroundColor: isEnabled ? "white" : "#f5f5f5",
              color: isEnabled ? "#333" : "#999",
            }}
          />
          <p
            style={{
              fontSize: "12px",
              color: "#777",
              marginTop: "6px",
            }}
          >
            この数値以下のブックマーク数の作品を非表示にします
          </p>
        </div>
      </div>

      <button
        onClick={handleSave}
        style={{
          width: "100%",
          padding: "12px",
          fontSize: "15px",
          fontWeight: "500",
          backgroundColor: isSaved ? "#10b981" : "#0ea5e9",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          transition: "background-color 0.2s",
        }}
        onMouseOver={(e) => {
          if (!isSaved) {
            e.currentTarget.style.backgroundColor = "#0284c7";
          }
        }}
        onMouseOut={(e) => {
          if (!isSaved) {
            e.currentTarget.style.backgroundColor = "#0ea5e9";
          }
        }}
      >
        {isSaved ? "✓ 保存しました" : "設定を保存"}
      </button>

      <div
        style={{
          marginTop: "16px",
          padding: "12px",
          backgroundColor: "#f0f9ff",
          borderRadius: "6px",
          fontSize: "12px",
          color: "#0369a1",
        }}
      >
        <strong>使い方:</strong> Pixivの小説一覧ページで設定が適用されます。
      </div>
    </div>
  );
}
