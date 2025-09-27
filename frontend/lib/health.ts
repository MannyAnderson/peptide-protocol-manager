// Thin wrapper around expo-health with graceful fallbacks if unavailable.

export type HealthDay = {
  date: string; // YYYY-MM-DD
  steps: number | null;
  heartRateAvg: number | null;
  weightAvg: number | null;
};

type ExpoHealthModule = {
  isAvailableAsync?: () => Promise<boolean>;
  requestPermissionsAsync?: (opts: { read: string[]; write?: string[] }) => Promise<{ granted: boolean } | boolean>;
  // Optional sample APIs; we branch on existence
  getStepCountForDayAsync?: (date: Date) => Promise<number>;
  getHeartRateSamplesAsync?: (start: Date, end: Date) => Promise<Array<{ startDate: string | Date; endDate: string | Date; value: number }>>;
  getWeightSamplesAsync?: (start: Date, end: Date) => Promise<Array<{ startDate: string | Date; endDate: string | Date; value: number }>>;
};

async function loadModule(): Promise<ExpoHealthModule | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - dynamic import for optional module
    const mod = await import("expo-health");
    return mod as ExpoHealthModule;
  } catch {
    return null;
  }
}

export async function requestPermissions(): Promise<boolean> {
  const Health = await loadModule();
  if (!Health || !Health.requestPermissionsAsync) return false;
  try {
    const res = await Health.requestPermissionsAsync({ read: ["steps", "heartRate", "weight"] });
    if (typeof res === "boolean") return res;
    return !!res?.granted;
  } catch {
    return false;
  }
}

function toYMD(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function readLast7Days(): Promise<HealthDay[]> {
  const Health = await loadModule();
  const today = new Date();
  const days: HealthDay[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push({ date: toYMD(d), steps: null, heartRateAvg: null, weightAvg: null });
  }

  if (!Health) return days;

  // Steps per day (if available)
  if (Health.getStepCountForDayAsync) {
    await Promise.all(
      days.map(async (day) => {
        try {
          const [y, m, dd] = day.date.split("-").map((n) => Number(n));
          const date = new Date(y, (m || 1) - 1, dd || 1);
          // iOS counts local day; this is a simple approximation
          const steps = await Health.getStepCountForDayAsync!(date);
          if (Number.isFinite(steps)) day.steps = steps as number;
        } catch {
          // ignore
        }
      })
    );
  }

  // Heart rate average across the day
  if (Health.getHeartRateSamplesAsync) {
    await Promise.all(
      days.map(async (day) => {
        try {
          const start = new Date(`${day.date}T00:00:00`);
          const end = new Date(`${day.date}T23:59:59`);
          const samples = await Health.getHeartRateSamplesAsync!(start, end);
          if (samples && samples.length) {
            const vals = samples.map((s) => Number(s.value)).filter((v) => Number.isFinite(v));
            if (vals.length) day.heartRateAvg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
          }
        } catch {
          // ignore
        }
      })
    );
  }

  // Weight average across the day (usually one sample)
  if (Health.getWeightSamplesAsync) {
    await Promise.all(
      days.map(async (day) => {
        try {
          const start = new Date(`${day.date}T00:00:00`);
          const end = new Date(`${day.date}T23:59:59`);
          const samples = await Health.getWeightSamplesAsync!(start, end);
          if (samples && samples.length) {
            const vals = samples.map((s) => Number(s.value)).filter((v) => Number.isFinite(v));
            if (vals.length) day.weightAvg = Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2));
          }
        } catch {
          // ignore
        }
      })
    );
  }

  return days;
}


