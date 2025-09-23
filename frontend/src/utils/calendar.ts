// Helpers around Expo Calendar for adding dosage reminders.
import * as Calendar from "expo-calendar";

export async function ensureDefaultCalendar(): Promise<string | null> {
  // 1) Check/request permissions
  const { status } = await Calendar.getCalendarPermissionsAsync();
  let finalStatus = status;
  if (status !== "granted") {
    const req = await Calendar.requestCalendarPermissionsAsync();
    finalStatus = req.status;
  }
  if (finalStatus !== "granted") return null;

  // 2) Try using the system default calendar
  const defaultCalendar = await Calendar.getDefaultCalendarAsync?.();
  if (defaultCalendar?.id) return defaultCalendar.id;

  // 3) Fallback: find a LOCAL source and create a lightweight calendar
  const sources = await Calendar.getSourcesAsync?.();
  const local = sources?.find((s) => s.type === Calendar.SourceType.LOCAL);
  if (!local) return null;
  const calId = await Calendar.createCalendarAsync({
    title: "Peptide Schedule",
    color: "#2563eb",
    entityType: Calendar.EntityTypes.EVENT,
    sourceId: local.id,
    source: local,
    name: "Peptide",
    ownerAccount: "personal",
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
  });
  return calId;
}

export async function addDoseEvents(
  items: Array<{ title: string; start: Date; end: Date; notes?: string }>
): Promise<number> {
  // 1) Ensure we have a calendar to add events to
  const calendarId = await ensureDefaultCalendar();
  if (!calendarId) return 0;
  let created = 0;
  // 2) Create each event; ignore failures to keep UX simple
  for (const it of items) {
    try {
      await Calendar.createEventAsync(calendarId, {
        title: it.title,
        startDate: it.start,
        endDate: it.end,
        notes: it.notes,
        timeZone: undefined,
      });
      created++;
    } catch {}
  }
  return created;
}


