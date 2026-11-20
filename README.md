# 🎓 QuizletFree

> A modern, 100% free flashcard and study platform built to replace expensive study subscriptions. Study with **3D Flashcards**, **Adaptive Learn Mode**, **Custom Practice Tests**, and **Speed Match Games** — completely free forever, with zero ads and zero paywalls.

---

## ⚡ Quick Start: Running the App

### Prerequisites
Make sure you have **Node.js** (v18 or higher) and **npm** installed on your computer.

### 1. Installation
In your project directory, install the required dependencies:
```bash
npm install
```

### 2. Start the Local Development Server
Run the development server with live reload:
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:5173
```

### 3. Build for Production (Optional)
To generate an optimized production bundle:
```bash
npm run build
```
To preview the production build locally:
```bash
npm run preview
```

### Available NPM Scripts
| Command | Purpose |
|---|---|
| `npm run dev` | Starts the Vite development server with Hot Module Replacement (HMR) at `localhost:5173`. |
| `npm run build` | Compiles TypeScript and builds production-ready static assets in `/dist`. |
| `npm run preview` | Spins up a local web server to preview the `/dist` production build. |

---

## 📖 How to Use QuizletFree

### 1. 🎴 3D Flashcards Mode
- **Flip Cards**: Click anywhere on the card, or press <kbd>Space</kbd> / <kbd>↑</kbd> / <kbd>↓</kbd> to flip between front and back.
- **Navigate**: Click the next/prev buttons, or use the <kbd>←</kbd> and <kbd>→</kbd> arrow keys.
- **Audio Pronunciation (TTS)**: Click the speaker icon (<kbd>🔊</kbd>) on either side of the card to hear native voice pronunciation powered by the Web Speech API.
- **Star Tricky Terms**: Press <kbd>S</kbd> or click the star icon (<kbd>★</kbd>) on any card to tag it. You can then toggle **"Study Starred (n)"** to drill only the cards you haven't memorized yet.
- **Swap Term & Definition**: Click **"Term First" / "Definition First"** to reverse the prompt direction.
- **Shuffle & Fullscreen**: Use the shuffle button to randomize card order, or the fullscreen button for distraction-free focus.
- **Deck Inspection**: Scroll down beneath the flashcard to review all terms in the set in a clean list, with quick audio pronunciation and star toggling for each row.

---

### 2. 🧠 Adaptive Learn Mode *(Free Quizlet Plus Alternative)*
Quizlet puts its famous Learn mode behind a paid subscription ($35+/yr). QuizletFree includes it 100% free:
- **Mastery Levels**:
  - 🟥 **Not Studied** (0 correct answers)
  - 🟨 **Familiar** (1 correct answer)
  - 🟩 **Mastered** (2 consecutive correct answers)
- **Smart Distractors**: Generates plausible 4-option multiple choice questions using definitions and terms from other cards in the same set.
- **Instant Correction**: Immediate visual feedback shows you why an answer is correct or incorrect. Wrong answers reset the card to the review queue until mastered.
- **End of Round Summary**: See your mastery percentage, review unmastered cards, or celebrate complete deck mastery with a burst of victory confetti.

---

### 3. ✍️ Write & Active Recall Mode
- **Active Recall**: Type the exact term corresponding to the displayed definition.
- **Smart Typo & Punctuation Tolerance**: Automatically handles case differences, extra spacing, parentheses, and punctuation so minor formatting variations aren't penalized.
- **"I was right!" Override**: If your answer was technically correct or used an acceptable synonym, click **"Override: I was right!"** to grant credit without breaking your study flow.
- **Streak Tracker**: Keeps track of your consecutive correct streak.

---

### 4. 📝 Practice Test Mode (Full Exam Generator)
- **Custom Exam Configuration**:
  - Choose how many questions to include (from 1 up to the entire set).
  - Select question types:
    - **Written Questions**: Type in the answer.
    - **Matching Blocks**: Match multiple terms with their corresponding definitions in a block.
    - **Multiple Choice**: 4-option questions.
    - **True / False**: Evaluate whether a paired term and definition statement is correct.
  - Choose whether to answer with *Terms* or *Definitions*.
- **Automatic Scoring & Review**:
  - Instant percentage score and letter grade (e.g., `94% Grade: A`).
  - Full question-by-question breakdown highlighting your answers and the correct solutions.
  - One-click button to retake the test or configure a fresh set of questions.

---

### 5. ⚡ Match Game Mode
- **Speed Matching**: Shuffles terms and definitions into an interactive grid of clickable tiles.
- **Stopwatch**: Real-time timer measuring down to tenths of a second (0.1s).
- **Game Mechanics**:
  - Click a term and its matching definition: tiles flash green and vanish.
  - Mismatched selections flash red with a subtle shake and incur a **+1.0 second penalty**.
- **Personal Best Leaderboards**: Tracks and saves your record fastest time for each study set in `localStorage`.

---

### 6. 🛠️ Creating, Editing & Importing Sets

#### Creating a New Study Set:
1. Click the **"+ Create Set"** button in the top navigation bar.
2. Enter a **Title**, optional **Description**, and **Category / Tag** (e.g. *Languages*, *Science*, *Technology*, *Geography*).
3. Select the **Term Audio Language** and **Definition Audio Language** to ensure accurate Text-to-Speech pronunciation (supports Spanish, French, German, Japanese, English, etc.).
4. Add card rows with Terms and Definitions.
5. Reorder, duplicate, swap single cards, or click **"Swap All Terms & Definitions"** to flip the entire set.
6. Click **"Save Set"**.

#### 📥 Importing from Quizlet, Anki, Excel, or Google Sheets:
1. In Quizlet: Open any set $\rightarrow$ Click the **`...`** menu $\rightarrow$ Click **"Export"** $\rightarrow$ Click **"Copy text"**.
   *(Or copy columns directly from Excel / Google Sheets)*.
2. In QuizletFree: Click **"Import Text"** in the set editor (or click the import icon in the header).
3. Paste the copied text into the textarea.
4. Select your delimiter:
   - Between term and definition: **Tab** (Quizlet/Sheets default), **Comma (CSV)**, **Dash (` - `)**, or **Semicolon (`;`)**.
   - Between cards: **New Line** or **Semicolon**.
5. Check the live table preview at the bottom to verify card parsing.
6. Click **"Add Cards to Set"**.

#### 📤 Exporting Sets:
- Open the **Import & Export** modal:
  - **Tab-Separated (Quizlet / Anki format)**: 1-click copy to paste directly into Quizlet or Anki.
  - **CSV format**: 1-click copy to paste into spreadsheets.
  - **Full Library Backup**: Click **"Download Backup (.json)"** to save all your sets, cards, study progress, and match high scores to a portable file.
  - **Restore**: Upload a previously exported `.json` file to restore your entire library on any computer or browser.

---

## ⌨️ Keyboard Shortcuts Reference

| Shortcut | Action |
|---|---|
| <kbd>Space</kbd> | Flip flashcard front / back |
| <kbd>←</kbd> | Previous flashcard |
| <kbd>→</kbd> | Next flashcard |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Flip flashcard |
| <kbd>S</kbd> | Star / Unstar current card |
| <kbd>1</kbd>, <kbd>2</kbd>, <kbd>3</kbd>, <kbd>4</kbd> | Select option in Learn mode |
| <kbd>Enter</kbd> | Submit answer in Write mode |
| <kbd>Esc</kbd> | Close open modals or exit fullscreen |

---

## 📚 Preloaded Starter Sets: Official HSK 1 through 5 (SayMei)
The app comes pre-packaged with **all 3,600 official vocabulary words** directly from the [SayMei HSK Vocabulary Lists](https://www.saymei.app/tools/hsk-vocabulary-list) (HSK 3.0 standard), complete with Hanzi, Pinyin, parts of speech, and English definitions with native Mandarin Chinese (`zh-CN`) Text-to-Speech:
1. **HSK 1**: All **300 words** (Beginner vocabulary: greetings, numbers, basic nouns and verbs)
2. **HSK 2**: All **200 words** (Elementary vocabulary: daily activities, travel, food, and dining)
3. **HSK 3**: All **500 words** (Intermediate vocabulary: emotions, workplace, relationships, health, and opinions)
4. **HSK 4**: All **1,000 words** (Upper-Intermediate vocabulary: abstract concepts, idioms, and professional terms)
5. **HSK 5**: All **1,600 words** (Advanced vocabulary: academic, formal, news, and specialized discourse)

> *Need to restore the starter sets? Click the circular reset icon (<kbd>↺</kbd>) in the top navigation bar at any time.*

---

## 🛡️ Privacy & Offline Storage
- **100% Client-Side**: All flashcards, study progress, starred items, and high scores are saved locally in your browser's `localStorage`.
- **No Account Required**: No logins, no tracking, and no external databases.
- **Offline Synthesizer**: Sound effects (card flips, correct answers, tile matches, victories) are synthesized dynamically via the browser's **Web Audio API**, meaning zero external sound files need to be downloaded.

---

## 🧰 Tech Stack
- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite 5](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with full Dark Mode support
- **Icons**: [Lucide React](https://lucide.dev/)
- **Audio & Speech**: Web Speech API (`speechSynthesis`) & Web Audio API (`AudioContext`)
- **Animations & FX**: CSS 3D Transforms & [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
