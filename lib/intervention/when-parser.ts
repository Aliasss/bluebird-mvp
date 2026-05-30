// 행동 계획 자유 텍스트 "when"을 best-effort로 KST 기준 planned_at(UTC ISO)으로 변환.
// 파싱 실패 시 null → 호출자가 planned_at을 비워둔다(날짜 미지정 그룹).
// 한국 전용 앱: KST(UTC+9, DST 없음) 고정. 알림 용도 아님 — 정렬·그룹화 전용.

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_HOUR = 12; // 날짜만 있을 때 정오(KST) — UTC 변환 시 같은 KST 날짜 보존

function kstParts(instant: Date): { y: number; mo: number; d: number } {
  const shifted = new Date(instant.getTime() + KST_OFFSET_MS);
  return { y: shifted.getUTCFullYear(), mo: shifted.getUTCMonth() + 1, d: shifted.getUTCDate() };
}

function kstWallClockToUtcIso(y: number, mo: number, d: number, h: number, mi: number): string {
  const asIfUtc = Date.UTC(y, mo - 1, d, h, mi, 0, 0);
  return new Date(asIfUtc - KST_OFFSET_MS).toISOString();
}

function parseTime(s: string): { h: number; mi: number } | null {
  const colon = s.match(/(\d{1,2}):(\d{2})/);
  if (colon) {
    const h = Number(colon[1]);
    const mi = Number(colon[2]);
    if (h <= 23 && mi <= 59) return { h, mi };
  }
  const kor = s.match(/(\d{1,2})시(?:\s*(\d{1,2})분)?/);
  if (kor) {
    let h = Number(kor[1]);
    const mi = kor[2] ? Number(kor[2]) : 0;
    if (/오후|저녁|밤/.test(s) && h < 12) h += 12;
    if (h <= 23 && mi <= 59) return { h, mi };
  }
  return null;
}

export function parseWhenToPlannedAt(when: string | null | undefined, now: Date): string | null {
  if (!when) return null;
  const raw = when.split(',')[0].trim();
  if (!raw) return null;

  const time = parseTime(raw);
  const h = time?.h ?? DEFAULT_HOUR;
  const mi = time?.mi ?? 0;
  const today = kstParts(now);

  if (/오늘/.test(raw)) {
    return kstWallClockToUtcIso(today.y, today.mo, today.d, h, mi);
  }
  if (/내일/.test(raw)) {
    const t = new Date(now.getTime() + KST_OFFSET_MS + DAY_MS);
    return kstWallClockToUtcIso(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate(), h, mi);
  }
  if (/모레/.test(raw)) {
    const t = new Date(now.getTime() + KST_OFFSET_MS + 2 * DAY_MS);
    return kstWallClockToUtcIso(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate(), h, mi);
  }

  const slash = raw.match(/(\d{1,2})\/(\d{1,2})/);
  if (slash) {
    const mo = Number(slash[1]);
    const d = Number(slash[2]);
    if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) {
      return kstWallClockToUtcIso(today.y, mo, d, h, mi);
    }
  }
  const kor = raw.match(/(\d{1,2})월\s*(\d{1,2})일/);
  if (kor) {
    const mo = Number(kor[1]);
    const d = Number(kor[2]);
    if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) {
      return kstWallClockToUtcIso(today.y, mo, d, h, mi);
    }
  }
  return null;
}
