# Cloudflare Pages 배포 설정

이 프로젝트는 데이터베이스 없이 정적 사이트로 먼저 배포됩니다.

## 배포 후 D1 연결 방법

1. Cloudflare 대시보드 → Workers & Pages → jjworld 프로젝트
2. Settings → Functions → D1 database bindings
3. Add binding:
   - Variable name: `DB`
   - D1 database: `jjworld-db`
4. Save

데이터베이스 연결 후 관리자 모드가 작동합니다.
