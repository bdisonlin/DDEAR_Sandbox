# DDEAR Sandbox - Digital Twin & VPP Simulator

DDEAR Sandbox 是一個結合虛擬電廠 (VPP, Virtual Power Plant)、分散式能源管理 (DERMS) 以及數位分身 (Digital Twin) 概念的模擬平台。本平台允許企業動態添加不同的能源資產（如：太陽能光電、儲能系統、風力發電、台電需量反應排程等），並即時評估其對整體用電曲線、再生能源佔比 (RE%)、以及尖載/電費的影響。

## 架構說明

本專案採用前後端分離微服務架構，目前分為以下幾個模組：

1. **Frontend (React + Vite)**：具備現代化 UI 介面的數位分身控制面板。
2. **Backend Engine (Python + FastAPI)**：核心模擬引擊，負責處理複雜的時間序列能源模型計算。
3. **Core API Gateway (Golang)**：*(🚧 準備中，預留作為高併發連線使用的 API 閘道器)*

---

## 系統需求

- **Node.js** (v18 或更高版本，建議使用 v20+)
- **Python** (v3.9 或更高版本)
- **Git**

---

## 🚀 啟動專案詳細步驟

要完整運行這個 Sandbox，您需要開啟 **兩個終端機視窗 (Terminal)** 分別啟動後端引擎與前端畫面。

### 步驟 1：啟動 Python 模擬引擎 (API)

這個引擎負責接收前端設定的資產，計算出全新的負載曲線。

1. 打開您的終端機，並進入 Python 後端資料夾：
   ```bash
   cd ~/Documents/python/DDEAR_Sandbox/backend-simulator
   ```

2. 建立 Python 虛擬環境 (Virtual Environment) 確保套件獨立：
   ```bash
   python3 -m venv venv
   ```

3. 啟動虛擬環境：
   - **Mac/Linux**: 
     ```bash
     source venv/bin/activate
     ```
   - **Windows**: 
     ```bash
     .\venv\Scripts\activate
     ```

4. 安裝所需的 Python 套件 (FastAPI, uvicorn, pandas, numpy 等)：
   ```bash
   pip install -r requirements.txt
   ```

5. 啟動 FastAPI 伺服器：
   ```bash
   python3 main.py
   ```
   > 成功啟動後，您應該會看到 `INFO: Uvicorn running on http://0.0.0.0:8001` 的訊息。不要關閉這個終端機。

---

### 步驟 2：啟動前端 Dashboard 模組

1. 打開 **全新的一個終端機視窗**，進入前端專案資料夾：
   ```bash
   cd ~/Documents/python/DDEAR_Sandbox/frontend
   ```

2. 安裝必要的 Node.js 依賴套件 (如果您是第一次拉下專案)：
   ```bash
   npm install
   ```
   *(註：本專案使用 Tailwind CSS, Zustand, Recharts, Lucide-React)*

3. 啟動 Vite 開發伺服器：
   ```bash
   npm run dev
   ```

4. 專案啟動後，依據終端機顯示的 URL（通常為 `http://localhost:5173/`），打開您的網頁瀏覽器即可操作 DDEAR Sandbox。

---

## 預期操作流程

1. 點擊 Dashboard 儀表板左下的 **"Add Asset" (新增資產)**。
2. 選擇「Battery Storage (儲能)」或「Solar PV (太陽能)」，並輸入容量參數 (例如：100 kW)。
3. 在資產清單勾選欲啟用的組合。
4. 點擊右上角 **"Run Simulation" (執行模擬)**。
5. 觀看右側的折線圖如何根據您的佈局即時變化，並檢視上方卡片的 RE 佔比增幅與節省度數。

---

## 🛠 常見問題與排除 (Troubleshooting)

**Q1: 啟動前端 `npm run dev` 後，開啟網頁卻顯示一片空白？**
**A1:** 這是因為前、後端資料結構不一致導致的錯誤。當您或系統升級了後端引擎（例如 `engine.py` 加入了 YoY 或 MoM 等新指標計算），但**忘記重新啟動 FastAPI 伺服器**，前端在接收到舊版格式時會因為缺少必要欄位產生崩潰（雖然目前已加入防呆機制避免全白，但仍會卡在無法讀取最新指標的情況）。
👉 **解決方式（重新啟動程序）**：
1. 回到正在執行後端的那個終端機視窗。
2. 按下 `Ctrl + C` 終止目前的 Python 服務。
3. 重新執行 `python main.py` （或使用對應的指令）重新啟動引擎。
4. 回到瀏覽器按下 `F5` 重新整理網頁，即可恢復正常運作並讀取最新數據！
