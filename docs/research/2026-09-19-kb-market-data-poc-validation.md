# OpenCharts - KB 시장 데이터 연결 POC 검증

검증일: 2026-09-19

## 결과

OpenCharts에 기존 데모와 분리된 읽기 전용 KB 시장 데이터 화면을 추가했다. 구현된 화면은 안전한 계좌 별칭, US/KR, 조회 시장과 종목 코드를 선택한 뒤 버튼이나 Enter로 명시적으로 조회한다. 응답은 제출한 종목의 통화, 현재가, 가능한 호가, KB 출처, 수집 시각, 가능한 제공자 시각, 지연 상태와 제한된 일봉 차트로 표시된다.

연결 화면은 데모 feed, paper engine, 주문 화면 및 telemetry 초기화 모듈을 가져오지 않는다. 데모와 연결 화면 사이의 이동은 전체 문서 이동이므로 이미 로드된 데모 런타임을 공유하지 않는다.

## 현재 대화형 실행 상태 — 2026-09-19

일반 개발 서버 시작과 안전한 계좌 목록 조회는 확인됐지만, 기본 선택 상태의 첫 조회는 실패했다. 사용자가 오류를 보고했고 root가 MU 조회에서 HTTP 503 `connection_unavailable`을 별도로 재현했다. 당시 선택된 계좌와 정확한 거절 단계 및 근본 원인은 아직 확인되지 않았다.

고정 단계 진단을 추가한 backend `2f3d73f`는 독립 spec/quality review P0=0/P1=0/P2=0과 coordinator 90개, API 23개 및 정적 검증을 통과했다. 이전 서버를 정상 종료하고 owner marker가 없는 상태에서 별도 격리한 일반 runtime으로 다시 확인한 결과, 강제 상태 삭제·sync·recovery 없이 MU/NAS와 005930/KOSPI 조회가 모두 성공했다. 두 차트는 화면에 표시됐고 console error는 0개였으며 각 조회는 snapshot request 1회만 사용했다. 성공한 일반 runtime 서버는 사용자 확인을 위해 실행 상태로 유지했다.

이후 성공은 현재 두 시험 흐름을 확인하지만 이전 503의 원인을 규명하거나 그 원인이 수정됐음을 증명하지 않는다. 기존 제한 live acceptance와 fixture/browser 결과도 각각 유효한 이력 및 배선 증거로 유지된다. 이 사실 갱신과 spot review 후 PR 게시는 진행할 수 있지만 SHIP-01은 실제 PR/CI 확인 전까지 대기다.

## 검증된 범위

| 구분 | 결과 | 의미 |
| --- | --- | --- |
| 프론트엔드 단위/컴포넌트 | 40개 통과 | 입력, US/KR 식별자, null, 숫자/날짜/시각, 요청 순서, 오류, 차트 수명주기 |
| 실제 HTTP 브라우저 fixture | 5개 통과 | Chrome에서 Vite proxy → FastAPI → coordinator → KB adapter 경로를 실행 |
| 화면 확인 | 통과 | US/KR 데스크톱과 390px 전체 모바일 차트, 가로 넘침 없음 |
| production build | 통과 | 기존 데모와 연결 화면 HTML을 모두 생성 |
| backend 집중 검증 | 283개 통과 | 최종 backend 코드의 API 23개와 adapter/coordinator 260개 |
| backend 정적 검증 | 통과 | 최종 Python mypy 176개 파일, Ruff/format, 계약 생성/diff |
| PR/원격 CI | 대기 | 아직 PR을 열지 않았으므로 로컬 결과를 CI 성공으로 표시하지 않음 |

브라우저 테스트는 normalized API 응답을 가로채지 않았다. 임시 데이터베이스와 합성 계좌를 만들고, 자격증명 공급자 및 KB provider transport만 합성 구현으로 대체했다. fixture 설정은 생성자 값만 사용하며, 환경 변수 값을 설정에 반영하지 않고 dotenv 파일을 읽지 않는 회귀 검증을 갖는다.

## 실제 KB provider 관측

아래 결과는 브라우저 fixture와 구분되는 제한된 실제 provider 관측이다. 기존 독립 검토 결과를 보존하면서, 이후 별도 일반 runtime의 실제 연결 브라우저에서 같은 두 경로를 다시 확인했다.

| 시장 | 종목 / 조회 시장 | 관측 결과 |
| --- | --- | --- |
| US | MU / NAS | 현재 연결 브라우저 수집 시각 `2026-09-19T14:05:49.696897Z`, USD, quote 3개 값, 일봉 250개, 15분 지연; 기존 상태 0024 이력 유지 |
| KR | 005930 / KOSPI | 현재 연결 브라우저 수집 시각 `2026-09-19T14:09:10.346522Z`, KRW, quote 3개 값, 일봉 124개, 지연/제공자 시각 unknown/null, `2026-03-23`부터 `2026-09-18`; 기존 상태 200/A/0024 이력 유지 |

KOSDAQ 경로는 provider 형식과 실제 HTTP fixture로 검증했지만 실제 계좌 entitlement는 확인하지 않았다. DRAM의 provider routing도 실제 검증하지 않았다. 따라서 어느 결과도 KOSDAQ 또는 DRAM의 live entitlement나 Nasdaq 상장을 주장하지 않는다. 화면의 “조회 시장”은 provider routing 값이며 독립적으로 확인된 상장 거래소가 아니다.

## 안전 경계

- browser proxy는 고정 loopback backend의 계좌 목록과 snapshot GET만 허용한다.
- method, path, query key/value, 중복 query, 인코딩된 slash/traversal 및 redirect를 거부한다.
- browser는 앱 비밀키, token, 원 계좌번호, provider 원문 payload를 받지 않는다.
- 조회는 quote 1회와 제한된 일봉 read뿐이다. 주문, 체결 이력, 보유 종목, sync, canonical commit 및 ledger write 권한을 추가하지 않는다.
- 실패한 새 identity는 이전 차트를 지우며 crypto/demo 데이터로 대체하지 않는다.
- 늦게 끝난 이전 요청은 US/KR 전환, 계좌 변경 및 unmount 이후 결과를 덮어쓸 수 없다.

## 로컬 실행 구성

구성은 값이 아닌 이름과 placeholder로만 공유한다.

- `KB_REPO_DIR=<backend-worktree>`: 브라우저 fixture가 사용할 backend 작업 디렉터리
- `KB_MARKET_BACKEND_PORT=<loopback-port>`: kb mode proxy의 고정 backend port
- `PLAYWRIGHT_CHROME_PATH=<browser-path>`: Chrome channel 대신 로컬 실행 파일을 명시할 때만 사용하는 선택값

일반 OpenCharts 데모 mode에는 KB proxy가 추가되지 않는다. 연결 화면용 개발 서버는 `kb` mode에서 별도 미사용 port로 실행한다.

## 요구사항 결과

| 요구사항 | 결과 |
| --- | --- |
| QUERY-01..04 | 완료 — 명시 제출, 양 시장 입력, provenance, 오류와 최신 요청 소유권 검증 |
| DATA-01 | 완료 — US fixed read 및 MU/NAS 실제 관측 |
| DATA-02 | 완료, 제한 명시 — KR fixed read 및 005930/KOSPI 실제 관측; KOSDAQ live 미확인 |
| DATA-03 | 완료 — null 보존, identity/date/number/timestamp fail-closed, routing/listing 분리 |
| SAFE-01 | 완료 — fixed read/proxy와 secret/raw payload 비노출 |
| SAFE-02 | 완료 — 연결 entry와 demo/feed/paper/telemetry 격리 |
| VERIFY-01 | 완료 — 집중 테스트, 정적 검증과 production build |
| VERIFY-02 | 완료, 제한 명시 — 현재 일반 연결 브라우저의 MU/NAS 및 005930/KOSPI 관측; 이전 503 원인과 KOSDAQ/DRAM live 미확인 |
| SHIP-01 | 대기 — 두 PR, 최종 remote HEAD 리뷰와 required checks는 후속 단계 |

## 남은 제한

- streaming, 자동 polling, 종목 검색, intraday interval과 주문 기능은 범위 밖이다.
- provider가 제공하지 않은 bid/ask, volume, 제공자 시각 및 지연 값은 추정하거나 0으로 만들지 않는다.
- 프로젝트 전체 TypeScript baseline에는 기존 진단이 남아 있다. 원본과 변경 후 비교는 동일한 151개였으며 이 POC가 새 진단을 추가하지 않았다. 이 사실은 전체 typecheck 성공을 뜻하지 않는다.
- PR과 remote CI가 아직 없으므로 SHIP-01은 완료가 아니다.
