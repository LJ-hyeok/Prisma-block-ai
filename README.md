# 프리즈마 블록 (Prisma Block) — 웹 퍼즐 & AI 오토파일럿

8×8 격자 보드에 블록을 배치해 가로·세로 줄을 완성하는 웹 퍼즐 게임입니다.
유지보수와 팀원 간 협업이 용이하도록 역할별 모듈 구조(`src/`)로 분리되어 있으며, **파일 더블클릭(`file://`)**, **Live Server**, **Vite(`npm run dev`)** 환경 모두에서 즉시 동작합니다.

---

## 폴더 및 파일 구조

```text
Puzzle/
├── main.html                 # 메인 HTML 문서 (레이아웃 및 스크립트 로드)
├── package.json              # Vite 개발 서버 및 빌드 스크립트 설정
├── vite.config.js            # Vite 환경 설정
└── src/
    ├── styles/
    │   └── main.css          # 커스텀 스타일 (글래스모피즘 패널, 트레이 슬롯 등)
    ├── config/
    │   └── constants.js      # 보드 크기(8x8), 블록 모양(SHAPES), 색상 테마(PALETTE)
    ├── utils/
    │   └── storage.js        # 최고 점수 LocalStorage 저장/불러오기
    ├── audio/
    │   └── sound.js          # Web Audio API 기반 효과음 신디사이저
    ├── core/
    │   ├── board.js          # 보드 생성, 배치 가능 판정, 줄 완성 검사, 가상 배치 시뮬레이션
    │   ├── state.js          # 게임 전역 상태(보드, 트레이, 점수, 콤보, 드래그, AI 상태) 관리
    │   └── game.js           # 블록 배치, 점수/콤보 계산, 되돌리기(Undo), 새 게임 진행 로직
    ├── ui/
    │   ├── dom.js            # DOM 요소 참조 및 상단 점수판/오버레이 HUD 업데이트
    │   ├── renderer.js       # 보드/트레이/드래그 캔버스 렌더링, 파티클 및 플로팅 텍스트 효과
    │   └── input.js          # 마우스/터치 드래그 앤 드롭, 탭 배치, 버튼 및 모달 이벤트
    ├── ai/
    │   ├── aiEngine.js       # AI 보드 상태 평가 함수(균형형/공격형/생존형) 및 1수 선행 탐색
    │   └── aiController.js   # AI 자동 플레이 타이머, 1수 힌트 실행 및 컨트롤 패널 이벤트
    └── main.js               # 앱 초기화 진입점(Entry Point)
```

---

## 작업별 수정 가이드 (협업 시 참고)

| 작업 내용 | 수정할 파일 |
| :--- | :--- |
| **새로운 블록 모양 추가 / 색상 변경** | `src/config/constants.js` |
| **점수 공식 / 콤보 보너스 / 게임 규칙 수정** | `src/core/game.js`, `src/core/board.js` |
| **AI 알고리즘 / 전략별 가중치 튜닝** | `src/ai/aiEngine.js` |
| **AI 속도 및 오토파일럿 UI 동작 수정** | `src/ai/aiController.js` |
| **블록 그래픽 / 파티클 / 애니메이션 수정** | `src/ui/renderer.js` |
| **효과음 변경 및 사운드 추가** | `src/audio/sound.js` |
| **드래그 감도 및 터치/클릭 조작감 수정** | `src/ui/input.js` |
| **전체 레이아웃 및 디자인 스타일 수정** | `main.html`, `src/styles/main.css` |

---

## 실행 방법

1. **가장 간단한 실행 (설치 불필요)**
   - `main.html` 파일을 브라우저에서 바로 열거나(더블클릭), VS Code의 **Live Server** 확장으로 실행합니다.
2. **Vite 개발 서버 실행**
   ```bash
   npm install
   npm run dev
   ```

