# Cloudflare Pages 배포 가이드

## 📋 사전 준비

1. **Cloudflare 계정** - https://dash.cloudflare.com 에서 가입
2. **Cloudflare API Token** - API 키 생성 필요
3. **Wrangler CLI** - 이미 프로젝트에 포함됨

---

## 🚀 배포 단계

### 1단계: R2 버킷 생성

Cloudflare R2는 파일 저장소입니다. 이미지와 비디오를 저장하는 데 사용됩니다.

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

### 5단계: R2 바인딩 설정 (중요!)

파일 업로드 기능이 작동하려면 **R2 버킷을 Pages 프로젝트에 바인딩**해야 합니다.

#### Cloudflare 대시보드에서 설정:

1. https://dash.cloudflare.com 로그인
2. **Workers & Pages** 메뉴 클릭
3. **jjworld** 프로젝트 선택
4. **Settings** 탭 → **Functions** 메뉴
5. **R2 bucket bindings** 섹션에서 **Add binding** 클릭
6. 다음 정보 입력:
   - **Variable name**: `R2` (코드에서 사용하는 이름)
   - **R2 bucket**: `jjworld-media` (생성한 버킷 이름)
7. **Save** 클릭

#### 또는 wrangler 명령어로 설정:

```bash
# R2 바인딩 설정
npx wrangler pages secret put R2 --project-name jjworld
# 값: jjworld-media
```

---

### 6단계: 배포 확인

브라우저에서 배포된 사이트 접속:
- **메인**: `https://jjworld.pages.dev`
- **관리자**: `https://jjworld.pages.dev/admin`

관리자 페이지에서 파일 업로드 테스트:
1. 비밀번호 `1111` 입력
2. 히어로/브랜드/뉴스 섹션에서 파일 선택
3. "📤 파일 업로드" 버튼 클릭
4. 업로드 성공 확인

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

### 관리자 비밀번호 변경

현재 관리자 비밀번호는 `1111`로 하드코딩되어 있습니다.  
프로덕션 환경에서는 반드시 다음 중 하나를 적용하세요:

1. **환경 변수 사용**:
```bash
npx wrangler pages secret put ADMIN_PASSWORD --project-name jjworld
```

2. **JWT 인증 구현**: Hono의 JWT 미들웨어 사용

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
