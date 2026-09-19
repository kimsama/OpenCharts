# KB 시장 데이터를 원본 OpenCharts 화면에 연결한 POC 검증

검증일: 2026-09-20
최종 브라우저 증거: `a707c186cbe6cdcf5e6612fe9c4a9e2186b24f4d`

## 결과

KB 시장 데이터 POC는 별도 조회 페이지가 아니라 원본 OpenCharts 화면을
사용한다. 하나의 `index.html`에서 시작한 `App`이 기존 `TradingPage`, 종목
선택 popup, `ChartPanel`, indicator와 drawing 도구를 그대로 렌더링한다.
KB mode에서 사용자는 안전한 계좌, US/KR, 조회 시장과 종목 코드를 선택하고
버튼 또는 Enter로 일봉 snapshot을 한 번 조회한다.

과거 `kb.html`과 custom lookup/chart 검증은 당시 구현의 날짜가 있는 역사
기록이다. 최종 제품에서는 해당 entry와 페이지가 제거되었으며, native
acceptance 근거로 사용하지 않는다.

## 현재 native live 관찰

검증 owner가 기존 정상 backend와 원본 native UI를 사용해 기본 계좌에서
정확히 두 번 순차 제출했다. 재시도, 다른 계좌 fallback, recovery, sync,
보유 종목, 체결 이력 또는 주문 호출은 없었다.

| 입력 | 관찰 결과 |
| --- | --- |
| MU / NAS | quote 3/3, USD 일봉 250개, `2025-09-22`~`2026-09-18`, 15분 지연, 수집 `2026-09-19T17:31:17.783385Z` |
| 005930 / KOSPI | quote 3/3, KRW 일봉 123개, `2026-03-24`~`2026-09-18`, 지연 상태 unknown/minutes null, 수집 `2026-09-19T17:31:18.221962Z` |

두 chart 모두 canvas 7개를 렌더링했다. console error, 금지된 요청,
snapshot HTTP 실패와 backend diagnostic-stage event는 각각 0개였다. 개발
환경의 집계 계측은 non-snapshot failed event 1개만 보존했고 URL과 원인은
보존하지 않았다. 과거 계좌 목록 요청 취소와 일치할 수 있지만 이번 실행이
그 귀속을 독립적으로 증명하지 않는다. 실제 snapshot 요청 두 건은 모두
성공했으며, 전체 network가 무오류였다고 표현하지 않는다.

이전 backend-only KOSPI 관찰은 `2026-03-23`부터 124개였고 현재 native
관찰은 rolling window가 이동해 `2026-03-24`부터 123개였다. 두 결과를 서로
대체하거나 모순으로 해석하지 않는다.

과거 첫 조회에서 발생한 HTTP 503 `connection_unavailable`의 원인은 아직
확인되지 않았다. 이후 성공이나 안전한 단계 진단은 그 원인 또는 특정 수정이
증명되었다는 뜻이 아니다.

## 검증한 범위

- 집중 frontend unit/client/proxy test 61개가 통과했다.
- 실제 HTTP browser test 6개가 원본 UI에서 함께 통과했다. Browser가
  normalized response를 가로채지 않고 Vite proxy, FastAPI, coordinator,
  adapter와 전용 provider transport fixture를 통과한다.
- US, KOSPI, KOSDAQ 입력과 quote/candle, 요청 순서, empty/malformed/refusal/
  timeout/offline 상태, proxy 거부를 확인했다.
- 원본 SMA, local template, drawing 추가·편집·잠금·삭제·undo·redo·reload와
  계좌/시장/조회시장/종목별 격리를 실제 canvas에서 확인했다.
- 누락된 bid/ask와 최신 volume은 누락 상태로 남는다. Volume이 필요한
  VWAP은 `unavailable`을 표시하며 실제 zero와 positive volume은 유지한다.
- Asia/Seoul과 America/New_York에서 plugin을 끈 실제 canvas axis와 native
  crosshair가 원래 거래일을 보존한다. Capture를 비운 뒤 OHLCV Tooltip과
  실제 Delta Tooltip drag가 DST 경계의 `2026-03-06`과 `2026-03-09`를 같은
  날짜로 렌더링하는 것을 별도로 확인했다.
- 390px에서 실제 ticker에 keyboard focus가 이동하고 Enter 제출, provenance
  wrapping, drawing rail과 price scale 사이의 가독성, document overflow 부재를
  확인했다.
- KB mode는 demo login/feed/tick/history/polling/telemetry와 주문 mutation을
  실행하지 않는다. Portfolio, depth와 trading panel은 데이터를 꾸미지 않고
  unavailable 상태를 표시한다.
- Default와 KB production build는 각각 1,979 modules로 통과했고 두 mode 모두
  `index.html` 하나만 생성했다.

Fixture는 합성 계좌와 provider transport만 사용한다. Builder는 별도 Python
process 안에서만 격리되며 shared process에서 복원 가능한 fixture라고
간주하지 않는다. Fixture 검증과 위 normal-runtime 관찰은 서로 다른 근거다.

프로젝트 전체 TypeScript 검사는 통과 상태가 아니다. Pre-native baseline과
최종 production source를 file/code/full-message signature multiplicity로 비교한
결과 양쪽 모두 151 occurrences, 48 signatures였고 introduced/resolved는 각각
0이었다. 이 비교를 typecheck 성공으로 표현하지 않는다.

## 로컬 실행

값이나 개인 환경 경로 대신 설정 이름과 placeholder만 사용한다.

```powershell
# 기존 demo mode
npm run dev

# 검토된 backend를 사용하는 KB mode
$env:KB_MARKET_BACKEND_PORT = "<loopback-backend-port>"
npm run dev -- --mode kb --host 127.0.0.1 --port <frontend-port> --strictPort

# 전용 fixture browser 검증
$env:KB_REPO_DIR = "<backend-worktree>"
$env:PLAYWRIGHT_CHROME_PATH = "<optional-browser-path>"
npm exec -- playwright test --config playwright.kb.config.ts
```

Backend credential 값은 frontend로 전달하지 않는다. Backend 시작과 credential
설정은 companion repository의 검토된 로컬 지침을 따른다.

## 안전 경계

- Browser proxy는 loopback backend의 계좌 목록과 snapshot GET만 허용한다.
  Method, path, query, 중복 key, encoded traversal과 redirect를 거부한다.
- Browser 응답에 app secret, token, 원시 계좌 값 또는 provider 원문 payload를
  노출하지 않는다.
- 조회 시장은 provider routing 입력이며 독립적으로 확인한 상장 거래소 증거가
  아니다.
- Snapshot 성공은 주문, 체결 이력, 보유 종목, ingest, sync, schedule,
  streaming 또는 ledger write 권한을 추가하지 않는다.

## 남은 제한

- KOSDAQ 구현과 실제 HTTP fixture는 통과했지만 live 계좌 entitlement는
  확인하지 않았다.
- DRAM provider routing은 live 검증하지 않았다.
- 관찰한 provider timestamp는 unavailable이었다.
- 자동 polling, streaming, 종목 catalog search, intraday interval과 trading은
  범위 밖이다.
- 두 companion PR, 최종 remote HEAD review와 required-check 상태는 다음
  delivery task가 기록한다. 따라서 이 문서는 아직 `SHIP-01` 완료를 주장하지
  않는다.

기존 research HTML과 standalone validation 문서는 삭제하지 않는다. 최종
native 결과와 구분되는 날짜가 있는 역사 자료로 남긴다.
