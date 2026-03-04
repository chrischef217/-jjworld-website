# JJ WORLD - 화장품 브랜드 공식 홈페이지

## 📋 프로젝트 개요

**JJ WORLD**는 beautyrise.biz 홈페이지를 참고하여 제작된 모바일 중심 반응형 화장품 브랜드 홈페이지입니다. 관리자 모드를 통해 이미지와 비디오를 직접 업로드하고 관리할 수 있는 CMS 기능이 탑재되어 있습니다.

---

## ✨ 주요 기능

### 완료된 기능

#### 🎨 프론트엔드
- ✅ **메인 홈페이지** - 히어로 섹션, 브랜드 슬라이더, PR 섹션
- ✅ **모바일 중심 반응형 디자인** - 모든 디바이스에서 최적화된 레이아웃
- ✅ **네비게이션 시스템** - 데스크톱/모바일 메뉴, 언어 전환
- ✅ **6개 서브 페이지**
  - About Us (기업 스토리)
  - Brands (브랜드 소개)
  - PR (보도자료/뉴스)
  - Academy (교육 프로그램)
  - Business Contact (문의)
  - FAQ (자주 묻는 질문)

#### 🔧 관리자 모드
- ✅ **비밀번호 인증 시스템** - 하단 푸터의 ⚙️ 아이콘으로 접근, 비밀번호: 1111
- ✅ **히어로 콘텐츠 관리** - 이미지/비디오 URL 입력 및 텍스트 수정
- ✅ **브랜드 관리** - 브랜드 추가, 수정, 삭제
- ✅ **뉴스/PR 관리** - 보도자료 등록 및 관리
- ✅ **About 스토리 관리** - 기업 스토리 콘텐츠 관리
- ✅ **CRUD 기능** - 모든 콘텐츠에 대한 생성/조회/수정/삭제

#### 💾 데이터베이스
- ✅ RESTful Table API 연동
- ✅ 4개 테이블 스키마 정의
  - `hero_content` - 히어로 섹션
  - `brands` - 브랜드 정보
  - `news` - 뉴스/보도자료
  - `about_story` - 기업 스토리

---

## 🌐 페이지 구조

### 메인 사이트

| 경로 | 설명 | URI |
|------|------|-----|
| **메인 홈** | 브랜드 메인 페이지 | `/index.html` |
| **About Us** | 기업 소개 및 스토리 | `/about.html` |
| **Brands** | 브랜드 라인업 소개 | `/brands.html` |
| **PR** | 보도자료 및 뉴스 | `/pr.html` |
| **Contact** | 문의 및 오시는 길 | `/contact.html` |
| **FAQ** | 자주 묻는 질문 | `/faq.html` |

### 관리자 모드

| 경로 | 설명 | 접속 방법 |
|------|------|----------|
| **관리자 페이지** | `/admin.html` | 홈페이지 하단 푸터 ⚙️ 아이콘 클릭 → 비밀번호 `1111` 입력 |

---

## 🗂️ 프로젝트 파일 구조

```
jjworld/
├── index.html              # 메인 홈페이지
├── admin.html              # 관리자 페이지
├── about.html              # About Us 페이지
├── brands.html             # Brands 페이지
├── pr.html                 # PR 페이지
├── contact.html            # Contact 페이지
├── faq.html                # FAQ 페이지
├── css/
│   └── style.css           # 메인 스타일시트 (반응형)
├── js/
│   ├── main.js             # 프론트엔드 JavaScript
│   ├── admin.js            # 관리자 모드 JavaScript
│   └── admin-access.js     # 관리자 접속 컴포넌트
└── README.md               # 프로젝트 문서
```

---

## 📊 데이터 모델

### 1. hero_content (히어로 섹션)
```javascript
{
  id: string,
  media_type: 'image' | 'video',
  media_url: string,
  title: string,
  subtitle: string,
  is_active: boolean
}
```

### 2. brands (브랜드)
```javascript
{
  id: string,
  name: string,
  image_url: string,
  description: string,
  order: number
}
```

### 3. news (뉴스/PR)
```javascript
{
  id: string,
  title: string,
  image_url: string,
  content: string,
  date: datetime
}
```

### 4. about_story (기업 스토리)
```javascript
{
  id: string,
  image_url: string,
  content: string,
  order: number
}
```

---

## 🚀 사용 방법

### 1. 일반 사용자 (방문자)
1. `index.html` 페이지로 접속
2. 네비게이션을 통해 원하는 페이지 이동
3. 모바일에서는 햄버거 메뉴 사용

### 2. 관리자
#### 접속 방법
1. **홈페이지 하단 푸터의 관리자 아이콘(⚙️) 클릭**
2. 비밀번호 입력: `1111`
3. 관리자 페이지로 자동 이동

또는 브라우저에서 `admin.html`로 직접 접속

#### 관리 기능
각 섹션별 기능:
   - **히어로 관리**: 메인 비주얼 이미지/비디오 URL 입력
   - **브랜드 관리**: 브랜드 추가, 이미지 URL 입력, 순서 지정
   - **뉴스 관리**: 보도자료 등록, 썸네일 이미지 URL 입력
   - **About 관리**: 기업 스토리 작성, 이미지 URL 입력

#### 이미지/비디오 URL 예시
- Unsplash: `https://images.unsplash.com/photo-xxxxx`
- 직접 호스팅: `https://yoursite.com/images/photo.jpg`
- YouTube (비디오): `https://www.youtube.com/embed/xxxxx`

---

## 🎨 디자인 특징

### 반응형 브레이크포인트
- **모바일**: ~767px (기본 우선 디자인)
- **태블릿**: 768px ~ 1023px
- **데스크톱**: 1024px ~ 1399px
- **대형 데스크톱**: 1400px+

### 컬러 팔레트
- Primary: `#000000` (블랙)
- Secondary: `#333333` (다크 그레이)
- Accent: `#2c2855` (퍼플/네이비)
- Background: `#f5f5f5` (라이트 그레이)

### 주요 UX 기능
- 부드러운 스크롤
- 모바일 메뉴 슬라이드
- 이미지 호버 효과
- 브랜드 자동 슬라이더

---

## 📱 RESTful API 엔드포인트

관리자 모드에서 사용하는 API:

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/tables/{table}?limit=100` | 레코드 목록 조회 |
| GET | `/tables/{table}?sort=field` | 정렬된 목록 조회 |
| GET | `/tables/{table}/{id}` | 단일 레코드 조회 |
| POST | `/tables/{table}` | 새 레코드 생성 |
| PUT | `/tables/{table}/{id}` | 레코드 전체 수정 |
| DELETE | `/tables/{table}/{id}` | 레코드 삭제 |

---

## 🔜 향후 개발 계획

### 미구현 기능
- [ ] 다국어 지원 (한국어/영어 전환)
- [ ] 이미지 파일 직접 업로드 (현재는 URL만 지원)
- [ ] 제품 상세 페이지
- [ ] 검색 기능
- [ ] 회원가입/로그인
- [ ] 온라인 쇼핑몰 통합

### 추천 개선 사항
1. **이미지 최적화**: CDN 사용 및 WebP 포맷 적용
2. **SEO 최적화**: 메타 태그 및 구조화된 데이터 추가
3. **성능 개선**: Lazy loading 구현
4. **보안 강화**: 관리자 인증 시스템 추가
5. **애널리틱스**: Google Analytics 또는 유사 도구 연동

---

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Design**: Mobile-First Responsive Design
- **Database**: RESTful Table API
- **Asset Storage**: External URL (Unsplash, CDN 등)

---

## 📄 라이선스

Copyright © 2025 JJ WORLD. All rights reserved.

**관리자 비밀번호**: `1111`

---

## 📞 문의

- **전화**: 1577-0000
- **이메일**: info@jjworld.com
- **주소**: 서울시 강남구 테헤란로 123

---

## 🎯 참고사항

- 본 프로젝트는 beautyrise.biz 홈페이지의 구조와 레이아웃을 참고하여 제작되었습니다
- 모든 이미지와 비디오는 외부 URL로 관리됩니다 (직접 업로드 기능 없음)
- **관리자 접속**: 모든 페이지 하단 푸터의 ⚙️ 아이콘 클릭 → 비밀번호 `1111` 입력
- 관리자 페이지는 기본 비밀번호로 보호되며, 실제 운영시 보안 강화 권장
- 모바일 최적화를 최우선으로 설계되었습니다
