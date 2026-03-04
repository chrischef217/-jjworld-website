# JJ WORLD - Cloudflare Pages Deployment

## 자동 배포 설정 완료 ✅

이 프로젝트는 Cloudflare Pages와 GitHub Actions를 통해 자동 배포됩니다.

## 🚀 배포 방법

### 1. GitHub 저장소 생성

1. GitHub에 로그인
2. 새 저장소 생성 (예: `jjworld-website`)
3. 저장소를 public 또는 private으로 설정

### 2. 코드 업로드

로컬에서 다음 명령 실행:

```bash
# Git 초기화
git init

# 모든 파일 추가
git add .

# 커밋
git commit -m "Initial commit: JJ WORLD website"

# 원격 저장소 연결
git remote add origin https://github.com/YOUR_USERNAME/jjworld-website.git

# 푸시
git branch -M main
git push -u origin main
```

### 3. Cloudflare Pages 연결

1. **Cloudflare 대시보드 접속**
   - https://dash.cloudflare.com

2. **Workers & Pages → Create application**
   - "Pages" 탭 선택
   - "Connect to Git" 클릭

3. **GitHub 연동**
   - "Connect GitHub" 클릭
   - 저장소 선택: `jjworld-website`
   - "Begin setup" 클릭

4. **빌드 설정**
   - Project name: `jjworld`
   - Production branch: `main`
   - Build command: (비워둠)
   - Build output directory: `/`
   - "Save and Deploy" 클릭

### 4. D1 데이터베이스 연결

배포 완료 후:

1. **Settings → Functions → D1 database bindings**
2. "Add binding" 클릭
3. Variable name: `DB`
4. D1 database: `jjworld-db` 선택
5. "Save" 클릭

### 5. wrangler.toml 업데이트

D1 데이터베이스 ID 가져오기:

```bash
# Cloudflare 대시보드에서 확인
# Workers & Pages → D1 → jjworld-db → Database ID 복사
```

`wrangler.toml` 파일에서 `YOUR_DATABASE_ID_HERE`를 실제 ID로 변경:

```toml
database_id = "실제-데이터베이스-ID"
```

변경 후 Git 커밋 & 푸시하면 자동 재배포됩니다!

---

## 🎉 완료!

이제 GitHub에 푸시할 때마다 자동으로 Cloudflare Pages에 배포됩니다!

**배포 URL**: `https://jjworld.pages.dev`

---

## 📝 추가 설정

### 커스텀 도메인 연결

Cloudflare Pages 프로젝트 → Custom domains → Add domain

### 환경 변수 설정

Settings → Environment variables

---

## 🔐 보안

- `.env` 파일은 `.gitignore`에 추가됨
- API 키나 비밀번호는 환경 변수로 관리
- 관리자 비밀번호는 변경 권장

---

## 📚 문서

자세한 내용은 메인 README.md를 참고하세요.
