# Cloudflare Pages 배포 가이드

## 📋 사전 준비

1. **Cloudflare 계정** - https://dash.cloudflare.com 에서 가입
2. **Cloudflare API Token** - API 키 생성 필요 (Pages 권한 포함)
3. **Wrangler CLI** - 이미 프로젝트에 포함됨

---

## 🚀 배포 단계

### 1단계: R2 버킷 생성

Cloudflare R2는 파일 저장소입니다. 이미지와 비디오를 저장하는 데 사용됩니다.

**옵션 A: Cloudflare 대시보드에서 생성 (권장)**
1. https://dash.cloudflare.com 로그인
2. **R2** 메뉴 클릭
3. **Create bucket** 버튼 클릭
4. Bucket name: `jjworld-media` 입력
5. **Create bucket** 클릭

**옵션 B: CLI로 생성**
```bash
# R2 버킷 생성
npx wrangler r2 bucket create jjworld-media
```

**주의**: R2 버킷 이름은 `wrangler.jsonc`에 설정된 이름과 일치해야 합니다.

---

### 2단계: 프로젝트 빌드

로컬에서 프로젝트를 빌드하여 `dist/` 디렉토리를 생성합니다.

```bash
npm run build
```

빌드 결과:
- `dist/_worker.js` - Hono 백엔드 코드
- `dist/` - 정적 파일 (HTML, CSS, JS, 이미지)

---

### 3단계: Cloudflare Pages 프로젝트 생성

**옵션 A: Cloudflare 대시보드에서 생성 (권장)**
1. https://dash.cloudflare.com 로그인
2. **Workers & Pages** 메뉴 클릭
3. **Create application** 버튼 클릭
4. **Pages** 탭 선택
5. **Connect to Git** 또는 **Direct Upload** 선택
   - **Direct Upload** 사용 시: 
     - Project name: `jjworld` 입력
     - Production branch: `main` 선택

**옵션 B: CLI로 생성 (API 권한 필요)**
```bash
# 프로젝트 생성 (최초 1회만)
npx wrangler pages project create jjworld --production-branch main
```

---

### 4단계: Pages에 배포

```bash
# dist 디렉토리를 배포
npx wrangler pages deploy dist --project-name jjworld
```

배포 완료 후 다음과 같은 URL을 받게 됩니다:
- **Production URL**: `https://jjworld.pages.dev`
- **Branch URL**: `https://main.jjworld.pages.dev`

---

### 5단계: R2 바인딩 및 환경 변수 설정 (중요!)

파일 업로드 기능과 JWT 인증이 작동하려면 **바인딩과 환경 변수 설정**이 필요합니다.

#### Cloudflare 대시보드에서 설정:

1. https://dash.cloudflare.com 로그인
2. **Workers & Pages** 메뉴 클릭
3. **jjworld** 프로젝트 선택
4. **Settings** 탭 → **Functions** 메뉴

**R2 Bucket Bindings:**
5. **R2 bucket bindings** 섹션에서 **Add binding** 클릭
6. 다음 정보 입력:
   - **Variable name**: `R2` (코드에서 사용하는 이름)
   - **R2 bucket**: `jjworld-media` (생성한 버킷 이름)
7. **Save** 클릭

**Environment Variables (선택사항):**
8. **Environment Variables** 섹션에서 다음 변수 추가:
   - **Variable name**: `JWT_SECRET`
   - **Value**: 강력한 랜덤 문자열 (예: 64자 랜덤 문자열)
   - **Environment**: Production 선택
   
   - **Variable name**: `ADMIN_PASSWORD`
   - **Value**: 새로운 관리자 비밀번호 (기본값 1111 대체)
   - **Environment**: Production 선택

9. **Save** 클릭

#### 또는 wrangler 명령어로 설정:

```bash
# 환경 변수 설정
npx wrangler pages secret put JWT_SECRET --project-name jjworld
# 입력: 강력한 랜덤 문자열

npx wrangler pages secret put ADMIN_PASSWORD --project-name jjworld
# 입력: 새로운 관리자 비밀번호
```

**주의**: 환경 변수를 설정하지 않으면 기본값이 사용됩니다:
- `JWT_SECRET`: `default-jwt-secret-change-in-production` (보안 취약)
- `ADMIN_PASSWORD`: `1111` (보안 취약)

---

### 6단계: 배포 확인 및 테스트

브라우저에서 배포된 사이트 접속:
- **메인**: `https://jjworld.pages.dev`
- **관리자**: `https://jjworld.pages.dev/admin`

#### JWT 인증 테스트:
1. 관리자 페이지 접속
2. 비밀번호 입력 (기본값: `1111` 또는 설정한 비밀번호)
3. JWT 토큰 발급 및 자동 로그인 확인
4. 로그아웃 버튼이 우측 상단에 표시되는지 확인

#### 파일 업로드 테스트:
1. 히어로/브랜드/뉴스 섹션에서 파일 선택
2. "📤 파일 업로드" 버튼 클릭
3. 업로드 성공 메시지 및 URL 자동 입력 확인
4. **📁 파일 관리** 섹션에서 업로드된 파일 확인

#### 파일 관리 테스트:
1. **📁 파일 관리** 탭 클릭
2. 업로드된 파일 목록이 표시되는지 확인
3. **📋 복사** 버튼으로 URL 복사 테스트
4. **🗑️** 버튼으로 파일 삭제 테스트

---

## 🔄 업데이트 배포

코드를 수정한 후 다시 배포하려면:

```bash
# 1. 빌드
npm run build

# 2. 배포
npx wrangler pages deploy dist --project-name jjworld
```

---

## 🛠️ 문제 해결

### R2 버킷 접근 오류

**증상**: "R2 storage not configured" 오류 발생

**해결책**:
1. Cloudflare 대시보드에서 R2 바인딩 설정 확인
2. Variable name이 정확히 `R2`인지 확인
3. R2 버킷 이름이 `jjworld-media`인지 확인

### 파일 업로드 실패

**증상**: 파일 업로드 시 에러

**해결책**:
1. 파일 크기 확인 (최대 10MB)
2. 파일 포맷 확인 (JPEG, PNG, GIF, WebP, MP4, WebM)
3. 브라우저 콘솔에서 에러 메시지 확인

### 정적 파일 404 오류

**증상**: CSS, JS, 이미지가 로드되지 않음

**해결책**:
1. `npm run build` 실행 확인
2. `dist/` 디렉토리에 파일이 있는지 확인
3. 경로가 `/css/style.css` 형식인지 확인

---

## 📊 배포 상태 모니터링

```bash
# Pages 프로젝트 목록
npx wrangler pages project list

# 배포 내역 확인
npx wrangler pages deployment list --project-name jjworld

# R2 버킷 목록
npx wrangler r2 bucket list

# R2 파일 목록 확인
npx wrangler r2 object list jjworld-media
```

---

## 🔒 보안 설정

### JWT Secret 생성

강력한 JWT Secret을 생성하려면:

```bash
# 64자 랜덤 문자열 생성 (Linux/Mac)
openssl rand -base64 48

# 또는 Node.js로 생성
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

생성된 문자열을 `JWT_SECRET` 환경 변수로 설정하세요.

### 관리자 비밀번호 변경

**방법 1: 환경 변수 설정 (권장)**
```bash
npx wrangler pages secret put ADMIN_PASSWORD --project-name jjworld
```

**방법 2: Cloudflare 대시보드**
- Settings → Functions → Environment Variables
- Variable name: `ADMIN_PASSWORD`
- Value: 새로운 강력한 비밀번호

### API 토큰 보안

**현재 보안 기능**:
- JWT 기반 인증 (24시간 유효)
- 파일 업로드/삭제 API는 JWT로 보호
- 토큰 만료 시 자동 로그아웃
- localStorage에 안전하게 저장

**추가 권장 사항**:
1. HTTPS 강제 사용 (Cloudflare Pages 기본값)
2. Rate limiting 설정 (Cloudflare 대시보드)
3. CORS 정책 검토
4. 정기적인 JWT Secret 교체

---

## 💰 비용 안내

### Cloudflare Pages
- **무료 플랜**: 월 500회 빌드, 무제한 요청
- **유료 플랜**: $20/월, 월 5000회 빌드

### Cloudflare R2
- **무료 플랜**: 
  - 저장 용량: 10GB
  - Class A 작업: 월 100만회 (업로드)
  - Class B 작업: 월 1000만회 (다운로드)
- **초과 시**: 
  - 저장: $0.015/GB/월
  - 작업: 매우 저렴

대부분의 소규모 프로젝트는 **무료 플랜으로 충분**합니다.

---

## 📞 문의

배포 중 문제가 발생하면:
- Cloudflare 문서: https://developers.cloudflare.com/pages/
- Wrangler 문서: https://developers.cloudflare.com/workers/wrangler/
- GitHub Issues: https://github.com/chrischef217/-jjworld-website/issues
