# 後中醫英文單字練習器 — PWA 版

這份已經改造成 **PWA(漸進式網頁應用程式)**,可以「安裝」到手機/電腦桌面,並支援**離線使用**。

## 📦 檔案清單(這些檔案要放在「同一個資料夾」)

| 檔案 | 用途 |
|------|------|
| `index.html` | 主程式(已加上 PWA 掛鉤)|
| `manifest.webmanifest` | App 資訊(名稱、圖示、顏色)|
| `sw.js` | Service worker(離線快取)|
| `icon-192.png` / `icon-512.png` | 標準圖示 |
| `icon-maskable-512.png` | 可遮罩圖示(Android 自適應)|
| `apple-touch-icon.png` | iOS 主畫面圖示 |
| `favicon-32.png` | 瀏覽器分頁小圖示 |

## ⚠️ 最重要的一點：必須用「網址」開啟,不能用 file://

PWA 的離線功能(service worker)**只在 `https://` 或 `localhost` 下才會啟動**。
直接用瀏覽器打開 `index.html`(網址列是 `file:///...`)的話,網頁本身能正常用,但**不會有安裝/離線功能**。

所以要把這整個資料夾放到一個「靜態網站空間」。以下任選一種:

### 方法 A：GitHub Pages(免費,推薦)
1. 開一個 GitHub repo,把這 8 個檔案上傳上去
2. Repo → Settings → Pages → Source 選 `main` branch、`/ (root)`
3. 幾分鐘後會給你一個網址,例如 `https://你的帳號.github.io/repo名/`
4. 用手機 Chrome/Safari 打開那個網址即可

### 方法 B：Netlify Drop(最快,免註冊也能試)
1. 到 https://app.netlify.com/drop
2. 把整個資料夾拖進去
3. 馬上得到一個 `https://....netlify.app` 網址

### 方法 C：Cloudflare Pages / Vercel
同理,把資料夾當成靜態網站部署即可。

### 方法 D：本機測試(電腦上先試跑)
在資料夾裡開終端機:
```bash
python3 -m http.server 8000
```
然後瀏覽器開 `http://localhost:8000` —— 這樣 PWA 功能就會啟動。

## 📲 怎麼「安裝」到手機

**iPhone(Safari)**
1. 用 Safari 開啟你的網址
2. 點下方「分享」按鈕 → 「加入主畫面」
3. 主畫面就會出現「後醫英文」App 圖示,點開是全螢幕、無網址列

**Android(Chrome)**
1. 用 Chrome 開啟你的網址
2. 通常會自動跳出「安裝應用程式」提示;或點右上角選單 →「安裝應用程式 / 加到主畫面」

**桌面(Chrome / Edge)**
網址列右側會出現一個「安裝」圖示,點下去就能像 App 一樣開。

## 🔄 之後要更新內容怎麼辦

1. 改好 `index.html`(例如又加了新單字)
2. 打開 `sw.js`,把最上面的 `const CACHE_VERSION = "v1";` 改成 `"v2"`(數字遞增)
3. 重新上傳/部署
4. 使用者下次開啟 App 時會自動抓到新版

> 不改版號的話,因為離線快取的關係,使用者可能還會看到舊版。

## 💡 離線行為說明

- **第一次**要在**有網路**的狀態下開啟一次(讓 service worker 把程式和字型快取下來)
- 之後就算沒網路也能開、能練習
- 學習進度存在瀏覽器 `localStorage`,離線一樣會記錄
- 發音功能(Web Speech)離線時是否可用,取決於裝置本身有沒有內建離線語音;這部分由作業系統決定,非本程式能控制

## 🎨 圖示

圖示是用 App 主題色(赭色漸層 + 奶油色「醫」字 + Noto Serif CJK)自動產生的。
想換成別的字或顏色,跟我說一聲就能重新產。
