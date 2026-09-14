const storeKey = "audit-hub-state-v2";
const oldStoreKey = "audit-hub-state-v1";
const importedMegaCompanies = typeof window !== "undefined" ? window.AUDIT_HUB_MEGA_COMPANIES || [] : [];
const importedCalendarEvents = typeof window !== "undefined" ? window.AUDIT_HUB_IMPORTED_CALENDARS || [] : [];
const importedCalendarSheets = new Set([
  "Януари",
  "Февруари",
  "Март",
  "Април",
  "Май",
  "Юни",
  "Юли",
  "Август",
  "Септември",
  "Октомври",
  "Ноември",
  "Декември"
]);

const seedData = {
  session: null,
  users: [
    { id: "u-1", name: "Георги", email: "georgi@audit.local", role: "auditor", online: false, lastSeen: nowIso() },
    { id: "u-2", name: "Никол", email: "nikol@audit.local", role: "auditor", online: false, lastSeen: nowIso() },
    { id: "u-3", name: "Админ", email: "admin@audit.local", role: "admin", online: false, lastSeen: nowIso() },
    { id: "u-4", name: "Катя", email: "katya@audit.local", role: "accounting", online: false, lastSeen: nowIso() }
  ],
  companies: [
    {
      id: "c-1",
      name: "Алфа Фуудс ООД",
      bulstat: "205778901",
      contact: "Мария Иванова",
      phone: "+359 888 123 456",
      email: "office@alfa-foods.bg",
      activities: ["certification"],
      standards: [{ name: "9001", color: "blue" }, { name: "14001", color: "green" }],
      megaUrl: "https://mega.nz/folder/example-alfa",
      status: "active",
      notes: "Основен контакт за одити: Мария.",
      createdBy: "Администратор",
      updatedBy: "Администратор",
      updatedAt: nowIso()
    },
    {
      id: "c-2",
      name: "Бета Логистик АД",
      bulstat: "204441119",
      contact: "Георги Петров",
      phone: "+359 887 222 111",
      email: "audit@betalogi.bg",
      activities: ["consulting", "occupational_medicine"],
      standards: [{ name: "27001", color: "purple" }],
      megaUrl: "https://mega.nz/folder/example-beta",
      status: "active",
      notes: "Имат две локации за проверка.",
      createdBy: "Администратор",
      updatedBy: "Администратор",
      updatedAt: nowIso()
    },
    {
      id: "c-3",
      name: "Сигма Мед ЕООД",
      bulstat: "206118734",
      contact: "Елена Димитрова",
      phone: "+359 889 510 201",
      email: "admin@sigmamed.bg",
      activities: ["certification", "consulting"],
      standards: [{ name: "BSCI", color: "orange" }],
      megaUrl: "",
      status: "watch",
      notes: "Очаква се нов договор.",
      createdBy: "Администратор",
      updatedBy: "Администратор",
      updatedAt: nowIso()
    }
  ],
  audits: [
    {
      id: "a-1",
      companyId: "c-1",
      date: "2026-08-05",
      time: "10:30",
      type: "Годишен одит",
      auditor: "Николай",
      status: "upcoming",
      priority: "normal",
      notes: "Да се проверят сертификати и плащане.",
      checklist: [
        { id: "t-1", text: "Проверка на сертификати", assignee: "Николай", dueDate: "2026-08-02", status: "pending", done: false },
        { id: "t-2", text: "Потвърждение за плащане", assignee: "Администратор", dueDate: "2026-08-01", status: "pending", done: false }
      ],
      reminderDays: 7,
      reminderSent: false,
      createdBy: "Администратор",
      updatedBy: "Николай",
      updatedAt: nowIso()
    },
    {
      id: "a-2",
      companyId: "c-2",
      date: "2026-08-12",
      time: "14:00",
      type: "Последващ одит",
      auditor: "Анна",
      status: "upcoming",
      priority: "high",
      notes: "Документи в Mega папката.",
      checklist: [
        { id: "t-3", text: "Преглед на Mega папката", assignee: "Анна", dueDate: "2026-08-09", status: "done", done: true },
        { id: "t-4", text: "Потвърждение на адреса", assignee: "Анна", dueDate: "2026-08-10", status: "in_progress", done: false }
      ],
      reminderDays: 3,
      reminderSent: false,
      createdBy: "Администратор",
      updatedBy: "Анна",
      updatedAt: nowIso()
    },
    {
      id: "a-3",
      companyId: "c-3",
      date: "2026-07-28",
      time: "09:00",
      type: "Първоначален одит",
      auditor: "Николай",
      status: "done",
      priority: "normal",
      notes: "Изчаква се фактура.",
      checklist: [{ id: "t-5", text: "Изготвен протокол", assignee: "Николай", dueDate: "2026-07-28", status: "done", done: true }],
      reminderDays: 7,
      reminderSent: true,
      createdBy: "Администратор",
      updatedBy: "Николай",
      updatedAt: nowIso()
    }
  ],
  payments: [
    {
      id: "p-1",
      companyId: "c-1",
      amount: 720,
      dueDate: "2026-08-01",
      paidDate: "2026-07-25",
      status: "paid",
      invoice: "INV-2026-104",
      createdBy: "Администратор",
      updatedBy: "Администратор",
      updatedAt: nowIso()
    },
    {
      id: "p-2",
      companyId: "c-2",
      amount: 980,
      dueDate: "2026-08-08",
      paidDate: "",
      status: "pending",
      invoice: "INV-2026-109",
      createdBy: "Администратор",
      updatedBy: "Администратор",
      updatedAt: nowIso()
    },
    {
      id: "p-3",
      companyId: "c-3",
      amount: 640,
      dueDate: "2026-07-20",
      paidDate: "",
      status: "overdue",
      invoice: "INV-2026-097",
      createdBy: "Администратор",
      updatedBy: "Администратор",
      updatedAt: nowIso()
    }
  ],
  documents: [
    {
      id: "d-1",
      companyId: "c-1",
      name: "Сертификат HACCP.pdf",
      kind: "Сертификат",
      source: "Mega",
      megaUrl: "https://mega.nz/file/example-cert",
      uploadStatus: "uploaded",
      createdAt: "2026-07-23",
      createdBy: "Администратор",
      updatedBy: "Администратор",
      updatedAt: nowIso()
    }
  ],
  calendarEvents: importedCalendarEvents.map((event) => ({
    ...event,
    time: "",
    checklist: [],
    reminderDays: 7,
    reminderSent: false,
    createdBy: "Импорт Excel",
    updatedBy: "Импорт Excel",
    updatedAt: nowIso()
  })),
  activityLog: [
    {
      id: "log-1",
      at: nowIso(),
      user: "Администратор",
      action: "Създаде начални демо данни",
      entity: "Система",
      entityId: "seed"
    }
  ]
};

const state = normalizeState(loadState());
let activeView = "dashboard";
let query = "";
let selectedCompany = "all";
let selectedStatus = "all";
let selectedCompanyActivity = "all";
let selectedCompanyStandard = "all";
let auditMode = "calendar";
let calendarDate = new Date("2026-08-01T12:00:00");
let activeCompanyId = "";
let selectedCalendarType = "planned";
let supabaseClient = null;
let supabaseAuthUser = null;
let profileById = {};
let supabaseSessionBootstrapped = false;
let supabaseStatus = {
  state: "unknown",
  label: "Supabase",
  detail: "Не е проверено"
};
const SUPABASE_USAGE_LIMITS = {
  freeDatabaseBytes: 500_000_000,
  freeFileStorageBytes: 1_000_000_000,
  proDatabaseBytes: 8_000_000_000,
  proFileStorageBytes: 100_000_000_000
};
let supabaseUsage = {
  state: "idle",
  databaseBytes: 0,
  fileStorageBytes: 0,
  measuredAt: "",
  error: ""
};

function loadState() {
  const saved = localStorage.getItem(storeKey) || localStorage.getItem(oldStoreKey);
  if (!saved) return structuredClone(seedData);
  try {
    return { ...structuredClone(seedData), ...JSON.parse(saved) };
  } catch {
    return structuredClone(seedData);
  }
}

function normalizeState(data) {
  const savedUsers = data.users || [];
  data.users = seedData.users.map((user) => {
    const saved = savedUsers.find((item) => item.name === user.name);
    if (!saved) return { ...user };
    const { password: legacyPassword, ...safeSaved } = saved;
    return { ...user, ...safeSaved };
  });
  if (data.session && !data.users.some((user) => user.name === data.session.name)) {
    data.session = null;
  }
  data.activityLog ||= structuredClone(seedData.activityLog);
  data.calendarEvents ||= structuredClone(seedData.calendarEvents);
  mergeImportedCalendarEvents(data);
  data.companies ||= [];
  mergeImportedMegaCompanies(data);
  data.companies.forEach((company) => {
    company.activities = Array.isArray(company.activities) ? company.activities : [];
    company.standards = Array.isArray(company.standards) ? company.standards : [];
    if (company.status === "watch" || company.status === "archived") company.status = "inactive";
  });
  for (const list of [data.companies, data.audits, data.payments, data.documents, data.calendarEvents]) {
    list.forEach((item) => {
      item.createdBy ||= "Администратор";
      item.updatedBy ||= item.createdBy;
      item.updatedAt ||= nowIso();
    });
  }
  data.audits.forEach((audit) => {
    audit.priority ||= "normal";
    audit.checklist ||= [];
    audit.checklist = audit.checklist.map((task) => ({
      id: task.id || id("t"),
      text: task.text || "",
      assignee: task.assignee || audit.auditor || "Администратор",
      dueDate: task.dueDate || audit.date,
      status: task.status || (task.done ? "done" : "pending"),
      done: Boolean(task.done || task.status === "done")
    }));
    audit.reminderDays ||= 7;
    audit.reminderSent ||= false;
  });
  data.documents.forEach((doc) => (doc.uploadStatus ||= doc.megaUrl ? "uploaded" : "local"));
  data.calendarEvents.forEach((event) => {
    event.calendarType ||= "planned";
    event.calendarName ||= event.calendarType === "planned" ? "Планирани дейности" : "Одитори";
    event.category ||= "";
    event.color ||= calendarEventColor(event.calendarType, event.category, event.auditor);
    event.status ||= "upcoming";
    event.priority ||= "normal";
    event.time ||= "";
    event.checklist ||= [];
    event.reminderDays ||= 7;
    event.reminderSent ||= false;
  });
  applyAutomaticOverdue(data);
  return data;
}

function normalizedCompanyKey(name) {
  return String(name || "")
    .toLocaleLowerCase("bg-BG")
    .replace(/\b(еоод|оод|ад|ет|eood|ood|ltd|plc|llc|gmbh)\b/gi, "")
    .replace(/[^a-zа-я0-9]+/gi, "");
}

function megaCompanyToAppCompany(item) {
  return {
    id: item.id || id("mega"),
    name: item.name,
    bulstat: "",
    contact: "",
    phone: "",
    email: "",
    activities: [],
    standards: [],
    megaUrl: item.megaUrl || "",
    status: "active",
    notes: `Импорт от ${item.source || "Mega"}. Път: ${item.path || item.originalName || "Mega папка"}`,
    createdBy: "Mega импорт",
    updatedBy: "Mega импорт",
    updatedAt: nowIso()
  };
}

function mergeImportedMegaCompanies(targetState) {
  if (!importedMegaCompanies.length) return 0;
  const existingByKey = new Map(
    (targetState.companies || [])
      .map((company) => [normalizedCompanyKey(company.name), company])
      .filter(([key]) => Boolean(key))
  );
  const additions = [];
  importedMegaCompanies.forEach((item) => {
    const key = normalizedCompanyKey(item.name);
    if (!key) return;
    const existing = existingByKey.get(key);
    if (existing) {
      if (item.megaUrl && shouldFillImportedMegaUrl(existing.megaUrl)) {
        existing.megaUrl = item.megaUrl;
        existing.updatedBy = "Mega импорт";
        existing.updatedAt = nowIso();
      }
      return;
    }
    existingByKey.set(key, item);
    additions.push(megaCompanyToAppCompany(item));
  });
  if (additions.length) {
    targetState.companies.push(...additions);
  }
  return additions.length;
}

function shouldFillImportedMegaUrl(currentUrl) {
  if (!currentUrl) return true;
  return /^https:\/\/mega\.nz\/folder\/vvxAULDI#sc5y3rg4VtligSwYZ0D61Q\/?$/i.test(currentUrl.trim());
}

function calendarSourceKey(event) {
  return [event.calendarType, event.sourceSheet, event.sourceCell].join("|");
}

function isExcelImportedCalendarEvent(event) {
  return (
    importedCalendarSheets.has(event.sourceSheet) &&
    /^\d+:\d+$/.test(String(event.sourceCell || ""))
  );
}

function normalizedImportedAuditor(auditor) {
  const value = String(auditor || "").trim();
  if (value === "Георги") return "Георги Георгиев - одитор";
  if (value === "Катя") return "Екатерина Георгиева - одитор";
  return value;
}

function calendarCategoryLabel(category) {
  return {
    certification: "Сертификация",
    consulting: "Консултации",
    occupational_medicine: "Служба Трудова Медицина"
  }[category] || "Без категория";
}

function plannedCategoryColor(category) {
  return {
    certification: "blue",
    consulting: "green",
    occupational_medicine: "red"
  }[category] || "yellow";
}

function calendarEventColor(calendarType, category, auditor) {
  if (calendarType === "planned") return plannedCategoryColor(category);
  const normalizedAuditor = normalizedImportedAuditor(auditor).toLocaleLowerCase("bg-BG");
  if (normalizedAuditor.includes("георги георгиев")) return "green";
  if (normalizedAuditor.includes("екатерина георгиева")) return "red";
  return "neutral";
}

function importedCalendarEventToAppEvent(event) {
  return {
    ...event,
    time: event.time || "",
    checklist: event.checklist || [],
    reminderDays: event.reminderDays || 7,
    reminderSent: Boolean(event.reminderSent),
    createdBy: event.createdBy || "Импорт Excel",
    updatedBy: event.updatedBy || "Импорт Excel",
    updatedAt: event.updatedAt || nowIso()
  };
}

function buildCalendarImportPlan(existingEvents) {
  const existingById = new Map(existingEvents.map((event) => [event.id, event]));
  const existingBySource = new Map(
    existingEvents
      .filter(isExcelImportedCalendarEvent)
      .map((event) => [calendarSourceKey(event), event])
  );
  const usedExistingIds = new Set();
  const importedResults = [];
  const upserts = [];
  const staleIds = new Set();

  importedCalendarEvents.forEach((sourceEvent) => {
    const imported = importedCalendarEventToAppEvent(sourceEvent);
    const exact = existingById.get(imported.id);
    if (exact) {
      usedExistingIds.add(exact.id);
      const upgradedAuditor = normalizedImportedAuditor(exact.auditor);
      const importedColor = imported.color || calendarEventColor(imported.calendarType, imported.category, imported.auditor);
      const merged = {
        ...exact,
        auditor: upgradedAuditor,
        category: exact.category || imported.category || "",
        color: exact.color && exact.color !== "default" ? exact.color : importedColor
      };
      importedResults.push(merged);
      if (
        upgradedAuditor !== exact.auditor ||
        merged.category !== (exact.category || "") ||
        merged.color !== exact.color
      ) {
        upserts.push(merged);
      }
      return;
    }

    const previous = existingBySource.get(calendarSourceKey(imported));
    if (previous) {
      usedExistingIds.add(previous.id);
      staleIds.add(previous.id);
      const corrected = {
        ...imported,
        time: previous.time || "",
        status: previous.status || imported.status,
        priority: previous.priority || imported.priority,
        category: previous.category || imported.category || "",
        color: previous.color || imported.color,
        notes: previous.notes || imported.notes,
        checklist: previous.checklist || [],
        reminderDays: previous.reminderDays || 7,
        reminderSent: Boolean(previous.reminderSent),
        createdBy: previous.createdBy || imported.createdBy,
        updatedBy: previous.updatedBy || imported.updatedBy,
        updatedAt: nowIso()
      };
      importedResults.push(corrected);
      upserts.push(corrected);
      return;
    }

    importedResults.push(imported);
    upserts.push(imported);
  });

  existingEvents.forEach((event) => {
    if (isExcelImportedCalendarEvent(event) && !usedExistingIds.has(event.id)) {
      staleIds.add(event.id);
    }
  });

  const manualEvents = existingEvents.filter((event) => !isExcelImportedCalendarEvent(event));
  return {
    events: [...manualEvents, ...importedResults],
    upserts,
    staleIds: [...staleIds]
  };
}

function mergeImportedCalendarEvents(targetState) {
  if (!importedCalendarEvents.length) return;
  const plan = buildCalendarImportPlan(targetState.calendarEvents || []);
  targetState.calendarEvents = plan.events;
}

function applyAutomaticOverdue(targetState = state) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let changed = false;
  targetState.payments.forEach((payment) => {
    const due = new Date(`${payment.dueDate}T00:00:00`);
    if (payment.status !== "paid" && payment.dueDate && due < today && payment.status !== "overdue") {
      payment.status = "overdue";
      payment.updatedBy ||= "Система";
      payment.updatedAt = nowIso();
      changed = true;
    }
  });
  return changed;
}

function saveState() {
  localStorage.setItem(storeKey, JSON.stringify(state));
}

function nowIso() {
  return new Date().toISOString();
}

function currentUser() {
  return state.session?.name || "Администратор";
}

function canDelete() {
  return state.session?.role === "admin" || currentUser() === "Админ";
}

function userByName(name) {
  return state.users.find((user) => user.name === name);
}

function nameFromProfile(id, fallback = "Система") {
  return profileById[id]?.full_name || fallback;
}

function mapCompany(row) {
  return {
    id: row.id,
    name: row.name,
    bulstat: row.bulstat || "",
    contact: row.contact || "",
    phone: row.phone || "",
    email: row.email || "",
    activities: Array.isArray(row.activities) ? row.activities : [],
    standards: Array.isArray(row.standards) ? row.standards : [],
    megaUrl: row.mega_url || "",
    status: row.status || "active",
    notes: row.notes || "",
    createdBy: nameFromProfile(row.created_by, "Система"),
    updatedBy: nameFromProfile(row.updated_by, "Система"),
    updatedAt: row.updated_at || row.created_at || nowIso()
  };
}

function companyPayload(item) {
  return {
    name: item.name,
    bulstat: item.bulstat || null,
    contact: item.contact || null,
    phone: item.phone || null,
    email: item.email || null,
    activities: item.activities || [],
    standards: item.standards || [],
    mega_url: item.megaUrl || null,
    status: item.status || "active",
    notes: item.notes || null,
    updated_by: supabaseAuthUser?.id || null,
    updated_at: nowIso()
  };
}

function mapAudit(row, tasks = []) {
  return {
    id: row.id,
    companyId: row.company_id,
    date: row.audit_date,
    time: row.audit_time || "",
    type: row.audit_type,
    auditor: row.auditor || "",
    status: row.status || "upcoming",
    priority: row.priority || "normal",
    checklist: tasks.length ? tasks.map(mapTask) : row.checklist || [],
    reminderDays: row.reminder_days || 7,
    reminderSent: Boolean(row.reminder_sent),
    notes: row.notes || "",
    createdBy: nameFromProfile(row.created_by, "Система"),
    updatedBy: nameFromProfile(row.updated_by, "Система"),
    updatedAt: row.updated_at || row.created_at || nowIso()
  };
}

function auditPayload(item) {
  return {
    company_id: item.companyId,
    audit_date: item.date,
    audit_time: item.time || null,
    audit_type: item.type,
    auditor: item.auditor || null,
    status: item.status || "upcoming",
    priority: item.priority || "normal",
    checklist: item.checklist || [],
    reminder_days: Number(item.reminderDays || 7),
    reminder_sent: Boolean(item.reminderSent),
    notes: item.notes || null,
    updated_by: supabaseAuthUser?.id || null,
    updated_at: nowIso()
  };
}

function mapPayment(row) {
  return {
    id: row.id,
    companyId: row.company_id,
    invoice: row.invoice || "",
    amount: Number(row.amount || 0),
    dueDate: row.due_date,
    paidDate: row.paid_date || "",
    status: row.status || "pending",
    createdBy: nameFromProfile(row.created_by, "Система"),
    updatedBy: nameFromProfile(row.updated_by, "Система"),
    updatedAt: row.updated_at || row.created_at || nowIso()
  };
}

function paymentPayload(item) {
  return {
    company_id: item.companyId,
    invoice: item.invoice || null,
    amount: Number(item.amount || 0),
    due_date: item.dueDate,
    paid_date: item.paidDate || null,
    status: item.status || "pending",
    updated_by: supabaseAuthUser?.id || null,
    updated_at: nowIso()
  };
}

function mapDocument(row) {
  return {
    id: row.id,
    companyId: row.company_id,
    name: row.name,
    kind: row.kind || "",
    source: row.source || "Mega",
    megaUrl: row.mega_url || "",
    uploadStatus: row.upload_status || "local",
    createdAt: (row.created_at || nowIso()).slice(0, 10),
    createdBy: nameFromProfile(row.created_by, "Система"),
    updatedBy: nameFromProfile(row.updated_by, "Система"),
    updatedAt: row.updated_at || row.created_at || nowIso()
  };
}

function documentPayload(item) {
  return {
    company_id: item.companyId,
    name: item.name,
    kind: item.kind || null,
    source: item.source || "Mega",
    mega_url: item.megaUrl || null,
    upload_status: item.uploadStatus || "local",
    updated_by: supabaseAuthUser?.id || null,
    updated_at: nowIso()
  };
}

function mapLog(row) {
  return {
    id: row.id,
    at: row.created_at,
    user: row.actor_name || nameFromProfile(row.actor_id, "Система"),
    action: row.action,
    entity: row.entity,
    entityId: row.entity_id
  };
}

function mapTask(row) {
  return {
    id: row.id,
    text: row.title,
    assignee: row.assignee_name || nameFromProfile(row.assignee_id, ""),
    dueDate: row.due_date || "",
    status: row.status || "pending",
    done: row.status === "done"
  };
}

function taskPayload(task, auditId) {
  return {
    audit_id: auditId,
    title: task.text,
    assignee_name: task.assignee || null,
    due_date: task.dueDate || null,
    status: task.status || (task.done ? "done" : "pending"),
    updated_by: supabaseAuthUser?.id || null,
    updated_at: nowIso()
  };
}

function mapCalendarEvent(row) {
  return {
    id: row.id,
    calendarType: row.calendar_type || "planned",
    calendarName: row.calendar_type === "auditors" ? "Одитори" : "Планирани дейности",
    date: row.event_date,
    time: row.event_time || "",
    title: row.title,
    auditor: row.auditor || "",
    category: row.category || "",
    color: row.color || calendarEventColor(row.calendar_type, row.category, row.auditor),
    status: row.status || "upcoming",
    priority: row.priority || "normal",
    sourceSheet: row.source_sheet || "",
    sourceCell: row.source_cell || "",
    notes: row.notes || "",
    checklist: row.checklist || [],
    reminderDays: row.reminder_days || 7,
    reminderSent: Boolean(row.reminder_sent),
    createdBy: nameFromProfile(row.created_by, "Система"),
    updatedBy: nameFromProfile(row.updated_by, "Система"),
    updatedAt: row.updated_at || row.created_at || nowIso()
  };
}

function calendarEventPayload(item) {
  return {
    id: item.id,
    calendar_type: item.calendarType || selectedCalendarType,
    event_date: item.date,
    event_time: item.time || null,
    title: item.title,
    auditor: item.auditor || null,
    category: item.category || null,
    color: item.color || calendarEventColor(item.calendarType, item.category, item.auditor),
    status: item.status || "upcoming",
    priority: item.priority || "normal",
    source_sheet: item.sourceSheet || null,
    source_cell: item.sourceCell || null,
    notes: item.notes || null,
    checklist: item.checklist || [],
    reminder_days: Number(item.reminderDays || 7),
    reminder_sent: Boolean(item.reminderSent),
    updated_by: supabaseAuthUser?.id || null,
    updated_at: nowIso()
  };
}

function id(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function stamp(item, isNew = false) {
  if (isNew) item.createdBy = currentUser();
  item.updatedBy = currentUser();
  item.updatedAt = nowIso();
  return item;
}

function addLog(action, entity, entityId) {
  const log = {
    id: id("log"),
    at: nowIso(),
    user: currentUser(),
    action,
    entity,
    entityId
  };
  state.activityLog.unshift(log);
  state.activityLog = state.activityLog.slice(0, 200);
  if (supabaseClient && supabaseAuthUser) {
    supabaseClient
      .from("activity_log")
      .insert({
        actor_id: supabaseAuthUser.id,
        actor_name: currentUser(),
        action,
        entity,
        entity_id: String(entityId)
      })
      .then(({ error }) => {
        if (error) console.warn("Activity log insert failed", error);
      });
  }
}

function companyName(companyId) {
  return state.companies.find((company) => company.id === companyId)?.name || "Няма фирма";
}

function formatDate(date) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("bg-BG", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(`${date}T12:00:00`));
}

function formatShortDate(date) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("bg-BG", { day: "2-digit", month: "short" }).format(new Date(`${date}T12:00:00`));
}

function formatTime(date) {
  return new Intl.DateTimeFormat("bg-BG", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(date));
}

function dateInput(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function daysUntil(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${date}T00:00:00`);
  return Math.ceil((target - today) / 86400000);
}

function statusBadge(type, value) {
  const labels = {
    active: ["Активен", "ok"],
    inactive: ["Неактивен", "danger"],
    watch: ["Наблюдение", "warn"],
    archived: ["Архив", "muted"],
    paid: ["Платено", "ok"],
    pending: ["Очаква плащане", "warn"],
    overdue: ["Просрочено", "danger"],
    upcoming: ["Предстои", "info"],
    in_progress: ["В процес", "warn"],
    waiting_docs: ["Чака документи", "warn"],
    done: ["Готово", "ok"],
    cancelled: ["Отказан", "danger"],
    normal: ["Нормален", "info"],
    high: ["Висок", "danger"],
    low: ["Нисък", "muted"]
  };
  const [label, tone] = labels[value] || [value, "info"];
  return `<span class="status ${tone}">${label}</span>`;
}

function icon(name) {
  const paths = {
    menu: "M4 6h16M4 12h16M4 18h16",
    home: "M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3V10.5Z",
    users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
    calendar: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z",
    card: "M3 6h18v12H3V6Zm0 4h18",
    file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 0v6h6",
    plus: "M12 5v14M5 12h14",
    upload: "M12 16V4m0 0 5 5m-5-5-5 5M4 20h16",
    link: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
    close: "M18 6 6 18M6 6l12 12",
    logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
    edit: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z",
    trash: "M3 6h18M8 6V4h8v2M6 6l1 16h10l1-16",
    check: "m5 12 4 4L19 6",
    copy: "M8 8h12v12H8zM4 4h12v12",
    activity: "M22 12h-4l-3 8-6-16-3 8H2",
    dot: "M12 12h.01"
  };
  return `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[name]}"/></svg>`;
}

function render() {
  if (applyAutomaticOverdue()) saveState();
  if (!state.session) {
    renderLogin();
    return;
  }

  document.querySelector("#app").innerHTML = `
    <div class="app-shell">
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
          <span class="brand-mark">AH</span>
          <div class="sidebar-title">
            <strong>Audit Hub</strong>
            <span>Вътрешна система</span>
          </div>
        </div>
        <nav class="nav">
          ${navButton("dashboard", "home", "Начало")}
          ${navButton("companies", "users", "Фирми")}
          ${navButton("audits", "calendar", "Календар")}
          ${navButton("payments", "card", "Плащания")}
          ${navButton("documents", "file", "Документи")}
          ${navButton("activity", "activity", "История")}
        </nav>
        <div class="online-box">
          <strong>На линия</strong>
          ${state.users
            .map(
              (user) => `
                <span class="online-user ${user.online ? "is-online" : ""}">
                  <i></i>${escapeHtml(user.name)}
                </span>
              `
            )
            .join("")}
        </div>
        <div class="sidebar-footer">
          <span>${escapeHtml(state.session.name)}</span>
          <button class="btn ghost account-btn" data-action="open-modal" data-modal="changePassword">${icon("edit")} Смени парола</button>
          <button class="btn logout-btn" data-action="logout">${icon("logout")} Изход</button>
        </div>
      </aside>
      <main class="main">
        <header class="topbar">
          <button class="btn ghost mobile-menu" data-action="toggle-menu">${icon("menu")}</button>
          <input class="search" value="${escapeAttr(query)}" data-action="search" placeholder="Търсене по фирма, контакт, фактура или документ" />
          ${renderSupabaseStatusButton()}
          <button class="btn primary top-action" title="Нова фирма" aria-label="Нова фирма" data-action="open-modal" data-modal="company">${icon("plus")} Нова фирма</button>
        </header>
        <section class="content">${renderView()}</section>
      </main>
    </div>
    <div id="modal-root"></div>
  `;

  bindEvents();
  bootstrapSupabaseSession();
}

function renderLogin() {
  document.querySelector("#app").innerHTML = `
    <div class="login-shell">
      <section class="login-visual">
        <span class="brand-mark">AH</span>
        <div>
          <h1>Одити, плащания и документи в един работен екран.</h1>
          <p>Обединява фирми, графици, Mega папки и статуси за малък екип с бърз достъп от телефон и десктоп.</p>
        </div>
      </section>
      <section class="login-panel">
        <form class="login-card" id="login-form">
          <span class="brand-mark">AH</span>
          <h2>Вход</h2>
          <div class="form-row">
            <label for="userName">Потребител</label>
            <select id="userName" name="userName">
              ${state.users.map((user) => `<option value="${escapeAttr(user.name)}">${escapeHtml(user.name)}</option>`).join("")}
            </select>
          </div>
          <div class="form-row">
            <label for="password">Парола</label>
            <input id="password" name="password" type="password" autocomplete="current-password" required />
          </div>
          <p class="login-error hidden" id="login-error">Грешна парола за избрания потребител.</p>
          <button class="btn primary" type="submit">Влез в системата</button>
        </form>
      </section>
    </div>
  `;

  document.querySelector("#login-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const selectedUser = state.users.find((user) => user.name === data.userName);
    const errorNode = document.querySelector("#login-error");
    errorNode.classList.add("hidden");

    try {
      await signInWithSupabase(selectedUser, data.password);
    } catch (error) {
      errorNode.textContent = `Supabase login грешка: ${error.message}`;
      errorNode.classList.remove("hidden");
      return;
    }

    if (!selectedUser) {
      document.querySelector("#login-error").classList.remove("hidden");
      return;
    }
    state.session = {
      name: selectedUser.name,
      role: selectedUser.role || "member",
      email: selectedUser.email,
      supabaseId: supabaseAuthUser?.id || null
    };
    state.users.forEach((user) => {
      if (user.name === selectedUser.name) {
        user.online = true;
        user.lastSeen = nowIso();
      }
    });
    addLog("Влезе в системата", "Потребител", selectedUser.name);
    saveState();
    render();
  });
}

function navButton(view, iconName, label) {
  return `<button class="btn ${activeView === view ? "active" : ""}" data-view="${view}">${icon(iconName)} ${label}</button>`;
}

function renderSupabaseStatusButton() {
  const usageLabel =
    supabaseUsage.state === "ready"
      ? `<small>DB ${Math.round(usagePercent(supabaseUsage.databaseBytes, SUPABASE_USAGE_LIMITS.freeDatabaseBytes))}%</small>`
      : "";
  return `
    <button class="supabase-status ${supabaseStatus.state}" data-action="check-supabase" title="${escapeAttr(supabaseStatus.detail)}">
      <span></span>
      <strong>${escapeHtml(supabaseStatus.label)}</strong>
      ${usageLabel}
    </button>
  `;
}

async function checkSupabaseConnection(showUsage = false) {
  supabaseStatus = { state: "checking", label: "Проверка...", detail: "Проверявам Supabase връзката." };
  render();

  try {
    await ensureSupabaseClient();
    const { error } = await supabaseClient.from("profiles").select("id", { count: "exact", head: true });
    if (error) {
      supabaseStatus = {
        state: "warning",
        label: "Supabase частично",
        detail: `Връзката работи, но заявката към profiles върна: ${error.message}`
      };
    } else {
      supabaseStatus = {
        state: "ok",
        label: "Supabase OK",
        detail: "Приложението вижда Supabase URL, anon key и таблицата profiles."
      };
    }
    await refreshSupabaseUsage();
  } catch (error) {
    supabaseStatus = {
      state: "error",
      label: "Supabase грешка",
      detail: error.message
    };
    supabaseUsage = {
      state: "error",
      databaseBytes: 0,
      fileStorageBytes: 0,
      measuredAt: "",
      error: error.message
    };
  }

  render();
  if (showUsage) openSupabaseUsageModal();
}

async function refreshSupabaseUsage() {
  supabaseUsage = {
    ...supabaseUsage,
    state: "loading",
    error: ""
  };

  try {
    const client = await ensureSupabaseClient();
    const { data, error } = await client.rpc("get_supabase_usage");
    if (error) {
      const missingFunction =
        error.code === "PGRST202" ||
        String(error.message || "").includes("get_supabase_usage");
      throw new Error(
        missingFunction
          ? "Липсва SQL функцията get_supabase_usage. Пусни файла supabase-usage-stats.sql в Supabase SQL Editor."
          : error.message
      );
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) throw new Error("Supabase не върна данни за използваното място.");

    supabaseUsage = {
      state: "ready",
      databaseBytes: Number(row.database_bytes) || 0,
      fileStorageBytes: Number(row.file_storage_bytes) || 0,
      measuredAt: row.measured_at || new Date().toISOString(),
      error: ""
    };
  } catch (error) {
    supabaseUsage = {
      state: "error",
      databaseBytes: 0,
      fileStorageBytes: 0,
      measuredAt: "",
      error: error.message
    };
  }

  return supabaseUsage;
}

function usagePercent(usedBytes, limitBytes) {
  if (!limitBytes) return 0;
  return Math.max(0, (Number(usedBytes) / Number(limitBytes)) * 100);
}

function usageTone(percent) {
  if (percent >= 90) return "danger";
  if (percent >= 70) return "warning";
  return "ok";
}

function formatBytes(bytes) {
  const value = Math.max(0, Number(bytes) || 0);
  const units = ["B", "KB", "MB", "GB", "TB"];
  if (!value) return "0 B";
  const unitIndex = Math.min(Math.floor(Math.log(value) / Math.log(1000)), units.length - 1);
  const amount = value / 1000 ** unitIndex;
  return `${new Intl.NumberFormat("bg-BG", {
    maximumFractionDigits: unitIndex > 1 ? 2 : 1
  }).format(amount)} ${units[unitIndex]}`;
}

function usageMeter(label, usedBytes, limitBytes, note) {
  const percent = usagePercent(usedBytes, limitBytes);
  const remaining = Math.max(0, limitBytes - usedBytes);
  const tone = usageTone(percent);
  return `
    <section class="usage-meter">
      <div class="usage-meter-head">
        <div>
          <h4>${escapeHtml(label)}</h4>
          <p>${escapeHtml(note)}</p>
        </div>
        <strong>${formatBytes(usedBytes)} / ${formatBytes(limitBytes)}</strong>
      </div>
      <div class="usage-track" aria-label="${escapeAttr(`${label}: ${percent.toFixed(1)}%`)}">
        <span class="${tone}" style="width: ${Math.min(percent, 100).toFixed(2)}%"></span>
      </div>
      <div class="usage-meter-foot">
        <span>Използвани ${percent.toFixed(1)}%</span>
        <span>Остават ${formatBytes(remaining)}</span>
      </div>
    </section>
  `;
}

function supabaseUsageModalBody() {
  if (supabaseUsage.state === "error") {
    return `
      <div class="usage-error">
        <strong>Използването не може да бъде заредено</strong>
        <p>${escapeHtml(supabaseUsage.error)}</p>
      </div>
      ${supabasePricingSummary()}
    `;
  }

  if (supabaseUsage.state !== "ready") {
    return `<div class="usage-loading">Зареждане на използваното място...</div>`;
  }

  return `
    <div class="usage-summary">
      ${usageMeter(
        "База данни",
        supabaseUsage.databaseBytes,
        SUPABASE_USAGE_LIMITS.freeDatabaseBytes,
        "Таблици, индекси и системни данни"
      )}
      ${usageMeter(
        "Файлово хранилище",
        supabaseUsage.fileStorageBytes,
        SUPABASE_USAGE_LIMITS.freeFileStorageBytes,
        "Само файловете в Supabase Storage; Mega файловете не се броят"
      )}
    </div>
    <p class="usage-measured">Измерено: ${escapeHtml(new Date(supabaseUsage.measuredAt).toLocaleString("bg-BG"))}</p>
    ${supabasePricingSummary()}
  `;
}

function supabasePricingSummary() {
  return `
    <section class="usage-pricing">
      <div class="usage-pricing-head">
        <div>
          <span class="eyebrow">След безплатния план</span>
          <h4>Pro от $25 на месец</h4>
        </div>
        <span class="price-note">цени към 31.07.2026</span>
      </div>
      <div class="usage-price-grid">
        <div>
          <strong>${formatBytes(SUPABASE_USAGE_LIMITS.proDatabaseBytes)}</strong>
          <span>диск за база включен</span>
          <small>след това $0.125 / GB</small>
        </div>
        <div>
          <strong>${formatBytes(SUPABASE_USAGE_LIMITS.proFileStorageBytes)}</strong>
          <span>файлово място включено</span>
          <small>след това $0.0213 / GB</small>
        </div>
      </div>
      <p>Free не начислява автоматично. Над 500 MB базата може да премине в режим само за четене, докато не освободиш място или не надградиш плана.</p>
    </section>
  `;
}

function openSupabaseUsageModal() {
  const root = document.querySelector("#modal-root");
  root.innerHTML = `
    <div class="modal" data-action="close-modal">
      <div class="modal-card usage-modal" role="dialog" aria-modal="true" aria-labelledby="supabase-usage-title">
        <div class="modal-head">
          <div>
            <span class="eyebrow">Състояние и лимити</span>
            <h3 id="supabase-usage-title">Използване на Supabase</h3>
          </div>
          <button class="btn ghost" title="Затвори" aria-label="Затвори" data-action="close-modal-button">${icon("close")}</button>
        </div>
        <div class="modal-body">${supabaseUsageModalBody()}</div>
      </div>
    </div>
  `;

  root.querySelector(".modal")?.addEventListener("click", (event) => {
    if (event.target.classList.contains("modal")) closeModal();
  });
  root.querySelector("[data-action='close-modal-button']")?.addEventListener("click", closeModal);
}

async function ensureSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  const configResponse = await fetch("/api/supabase-config", { cache: "no-store" });
  if (!configResponse.ok) {
    throw new Error(`Липсва /api/supabase-config (${configResponse.status}). Ако отваряш index.html локално, този endpoint работи само във Vercel.`);
  }

  const config = await configResponse.json();
  if (!config.url || !config.anonKey) {
    throw new Error("Липсват VITE_SUPABASE_URL или VITE_SUPABASE_ANON_KEY във Vercel Environment Variables.");
  }

  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  supabaseClient = createClient(config.url, config.anonKey);
  return supabaseClient;
}

async function signInWithSupabase(appUser, password) {
  if (!appUser?.email) throw new Error("Няма имейл за избрания потребител.");
  const client = await ensureSupabaseClient();
  const { data, error } = await client.auth.signInWithPassword({
    email: appUser.email,
    password
  });
  if (error) throw error;
  supabaseAuthUser = data.user;
  await ensureRemoteProfile(appUser);
  await loadRemoteData();
}

async function ensureRemoteProfile(appUser) {
  if (!supabaseClient || !supabaseAuthUser) return;
  const { error } = await supabaseClient.from("profiles").upsert({
    id: supabaseAuthUser.id,
    full_name: appUser.name,
    role: appUser.role || "member"
  });
  if (error) {
    console.warn("Profile upsert failed", error);
  }
}

async function loadRemoteData() {
  if (!supabaseClient) return;
  const [profilesRes, companiesRes, auditsRes, paymentsRes, docsRes, logsRes, tasksRes, calendarEventsRes] = await Promise.all([
    supabaseClient.from("profiles").select("*"),
    supabaseClient.from("companies").select("*").order("created_at", { ascending: false }),
    supabaseClient.from("audits").select("*").order("audit_date", { ascending: true }),
    supabaseClient.from("payments").select("*").order("due_date", { ascending: false }),
    supabaseClient.from("documents").select("*").order("created_at", { ascending: false }),
    supabaseClient.from("activity_log").select("*").order("created_at", { ascending: false }).limit(200),
    supabaseClient.from("audit_tasks").select("*"),
    supabaseClient.from("calendar_events").select("*").order("event_date", { ascending: true })
  ]);

  const firstError = [profilesRes, companiesRes, auditsRes, paymentsRes, docsRes, logsRes, tasksRes, calendarEventsRes].find((result) => result.error)?.error;
  if (firstError) throw firstError;

  profileById = Object.fromEntries((profilesRes.data || []).map((profile) => [profile.id, profile]));
  const tasksByAudit = {};
  (tasksRes.data || []).forEach((task) => {
    tasksByAudit[task.audit_id] ||= [];
    tasksByAudit[task.audit_id].push(task);
  });

  state.companies = (companiesRes.data || []).map(mapCompany);
  const megaSync = await seedMegaCompaniesToSupabase();
  state.audits = (auditsRes.data || []).map((audit) => mapAudit(audit, tasksByAudit[audit.id] || []));
  state.payments = (paymentsRes.data || []).map(mapPayment);
  state.documents = (docsRes.data || []).map(mapDocument);
  state.activityLog = (logsRes.data || []).map(mapLog);
  const calendarSync = await syncImportedCalendarEventsToSupabase(calendarEventsRes.data || []);
  state.calendarEvents = calendarSync.events;
  if (calendarSync.upserted) {
    addLog(`Синхронизира ${calendarSync.upserted} Excel календарни записа`, "Календар", "calendar_events");
  }
  if (calendarSync.removed) {
    addLog(`Премахна ${calendarSync.removed} остарели календарни записа`, "Календар", "calendar_events-stale");
  }
  if (megaSync.imported) {
    addLog(`Импортира ${megaSync.imported} фирми от Mega`, "Фирми", "mega-companies");
  }
  if (megaSync.linked) {
    addLog(`Свърза ${megaSync.linked} фирми с техните Mega папки`, "Фирми", "mega-company-folders");
  }
  applyAutomaticOverdue();
  await refreshSupabaseUsage();
  saveState();
  supabaseStatus = {
    state: "ok",
    label: "Supabase OK",
    detail: "Данните се зареждат от Supabase."
  };
}

async function bootstrapSupabaseSession() {
  if (supabaseSessionBootstrapped || !state.session) return;
  supabaseSessionBootstrapped = true;
  try {
    await ensureSupabaseClient();
    const { data, error } = await supabaseClient.auth.getUser();
    if (error || !data?.user) return;
    supabaseAuthUser = data.user;
    await loadRemoteData();
    render();
  } catch (error) {
    supabaseStatus = {
      state: "warning",
      label: "Supabase offline",
      detail: error.message
    };
  }
}

async function remoteInsert(table, payload) {
  if (!supabaseClient) return null;
  const { data, error } = await supabaseClient.from(table).insert(payload).select().single();
  if (error) throw error;
  return data;
}

async function seedMegaCompaniesToSupabase() {
  if (!supabaseClient || !importedMegaCompanies.length) return { imported: 0, linked: 0 };
  const existingByKey = new Map(
    state.companies
      .map((company) => [normalizedCompanyKey(company.name), company])
      .filter(([key]) => Boolean(key))
  );
  const linkUpdates = importedMegaCompanies
    .map((item) => ({ item, company: existingByKey.get(normalizedCompanyKey(item.name)) }))
    .filter(({ item, company }) => company && item.megaUrl && shouldFillImportedMegaUrl(company.megaUrl));

  let linked = 0;
  for (let index = 0; index < linkUpdates.length; index += 100) {
    const chunk = linkUpdates.slice(index, index + 100);
    const rows = chunk.map(({ item, company }) => ({
      id: company.id,
      ...companyPayload({ ...company, megaUrl: item.megaUrl })
    }));
    const { data, error } = await supabaseClient
      .from("companies")
      .upsert(rows, { onConflict: "id" })
      .select();
    if (error) throw error;
    const savedById = new Map((data || []).map((row) => [row.id, mapCompany(row)]));
    chunk.forEach(({ company }) => {
      const saved = savedById.get(company.id);
      if (saved) Object.assign(company, saved);
    });
    linked += data?.length || 0;
  }

  const seen = new Set(existingByKey.keys());
  const missing = importedMegaCompanies
    .filter((item) => {
      const key = normalizedCompanyKey(item.name);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((item) => {
      const company = megaCompanyToAppCompany(item);
      return {
        name: company.name,
        bulstat: null,
        contact: null,
        phone: null,
        email: null,
        mega_url: company.megaUrl || null,
        status: "active",
        notes: company.notes,
        created_by: supabaseAuthUser?.id || null,
        updated_by: supabaseAuthUser?.id || null,
        updated_at: nowIso()
      };
    });

  let imported = 0;
  for (let index = 0; index < missing.length; index += 100) {
    const chunk = missing.slice(index, index + 100);
    const { data, error } = await supabaseClient.from("companies").insert(chunk).select();
    if (error) throw error;
    const savedCompanies = (data || []).map(mapCompany);
    state.companies.unshift(...savedCompanies);
    imported += savedCompanies.length;
  }
  return { imported, linked };
}

async function syncImportedCalendarEventsToSupabase(remoteRows) {
  const existingEvents = remoteRows.map(mapCalendarEvent);
  if (!importedCalendarEvents.length) {
    return { events: existingEvents, upserted: 0, removed: 0 };
  }

  const plan = buildCalendarImportPlan(existingEvents);
  const existingIds = new Set(existingEvents.map((event) => event.id));
  let upserted = 0;

  for (let index = 0; index < plan.upserts.length; index += 100) {
    const chunk = plan.upserts.slice(index, index + 100);
    const rows = chunk.map((event) => ({
      ...calendarEventPayload(event),
      ...(!existingIds.has(event.id) ? { created_by: supabaseAuthUser?.id || null } : {})
    }));
    const { data, error } = await supabaseClient
      .from("calendar_events")
      .upsert(rows, { onConflict: "id" })
      .select();
    if (error) throw error;
    upserted += data?.length || 0;
  }

  let removed = 0;
  if (canDelete()) {
    for (let index = 0; index < plan.staleIds.length; index += 100) {
      const chunk = plan.staleIds.slice(index, index + 100);
      const { data, error } = await supabaseClient
        .from("calendar_events")
        .delete()
        .in("id", chunk)
        .select("id");
      if (error) throw error;
      removed += data?.length || 0;
    }
  }

  return { events: plan.events, upserted, removed };
}

async function remoteUpdate(table, idValue, payload) {
  if (!supabaseClient) return null;
  const { data, error } = await supabaseClient.from(table).update(payload).eq("id", idValue).select().single();
  if (error) throw error;
  return data;
}

async function remoteDelete(table, idValue) {
  if (!supabaseClient) return;
  const { error } = await supabaseClient.from(table).delete().eq("id", idValue);
  if (error) throw error;
}

async function syncAuditTasks(auditId, checklist) {
  if (!supabaseClient) return;
  const deleteResult = await supabaseClient.from("audit_tasks").delete().eq("audit_id", auditId);
  if (deleteResult.error) throw deleteResult.error;
  if (!checklist?.length) return;
  const rows = checklist.map((task) => taskPayload(task, auditId));
  const insertResult = await supabaseClient.from("audit_tasks").insert(rows);
  if (insertResult.error) throw insertResult.error;
}

function renderView() {
  const views = {
    dashboard: renderDashboard,
    companies: renderCompanies,
    audits: renderAudits,
    payments: renderPayments,
    documents: renderDocuments,
    companyProfile: renderCompanyProfile,
    notifications: renderNotifications,
    activity: renderActivity
  };
  return views[activeView]();
}

function filteredCompanies() {
  const needle = query.trim().toLowerCase();
  return state.companies.filter((company) => {
    const matchesQuery =
      !needle ||
      [company.name, company.contact, company.phone, company.email, company.bulstat, company.notes]
        .concat((company.activities || []).map(companyActivityLabel))
        .concat((company.standards || []).map((standard) => standard.name))
        .concat(company.megaUrl || "")
        .join(" ")
        .toLowerCase()
        .includes(needle);
    const matchesStatus = selectedStatus === "all" || company.status === selectedStatus;
    const matchesActivity = selectedCompanyActivity === "all" || (company.activities || []).includes(selectedCompanyActivity);
    const matchesStandard = selectedCompanyStandard === "all" || (company.standards || []).some((standard) => standard.name === selectedCompanyStandard);
    return matchesQuery && matchesStatus && matchesActivity && matchesStandard;
  });
}

function companyActivityLabel(value) {
  return { certification: "Сертификация", consulting: "Консултация", occupational_medicine: "СТМ" }[value] || value;
}

function renderCompanyActivities(company) {
  const activities = company.activities || [];
  return activities.length
    ? `<div class="company-tags">${activities.map((activity) => `<span class="activity-tag">${escapeHtml(companyActivityLabel(activity))}</span>`).join("")}</div>`
    : `<span class="cell-empty">—</span>`;
}

function renderCompanyStandards(company) {
  const standards = company.standards || [];
  return standards.length
    ? `<div class="company-tags">${standards.map((standard) => `<span class="standard-tag ${escapeAttr(standard.color || "blue")}">${escapeHtml(standard.name)}</span>`).join("")}</div>`
    : `<span class="cell-empty">—</span>`;
}

function renderDashboard() {
  const upcomingAudits = state.audits
    .filter((audit) => audit.status === "upcoming" || audit.status === "waiting_docs" || audit.status === "in_progress")
    .sort((a, b) => a.date.localeCompare(b.date));
  const unpaid = state.payments.filter((payment) => payment.status !== "paid");
  const overdue = state.payments.filter((payment) => payment.status === "overdue");
  const revenue = state.payments.filter((payment) => payment.status === "paid").reduce((sum, payment) => sum + Number(payment.amount), 0);
  const reminders = upcomingAudits.filter((audit) => {
    const days = daysUntil(audit.date);
    return !audit.reminderSent && days >= 0 && days <= Number(audit.reminderDays || 7);
  });

  return `
    <div class="page-head">
      <div>
        <h2>Работно табло</h2>
        <p>Най-важното за одити, плащания, документи, Mega папки и история.</p>
      </div>
      <div class="card-actions">
        <button class="btn primary" data-action="open-modal" data-modal="audit">${icon("calendar")} Нов одит</button>
        <button class="btn accent" data-action="open-modal" data-modal="document">${icon("upload")} Качи документ</button>
      </div>
    </div>
    <div class="stats-grid">
      <div class="stat"><span>Фирми</span><strong>${state.companies.length}</strong></div>
      <div class="stat"><span>Предстоящи одити</span><strong>${upcomingAudits.length}</strong></div>
      <div class="stat"><span>Неплатени</span><strong>${unpaid.length}</strong></div>
      <div class="stat"><span>Платено общо</span><strong>${revenue} лв.</strong></div>
    </div>
    <section class="panel reminder-panel">
      <div class="panel-head">
        <h3>Автоматични напомняния преди одит</h3>
        <span class="status ${reminders.length ? "warn" : "ok"}">${reminders.length ? `${reminders.length} активни` : "няма спешни"}</span>
      </div>
      ${renderReminderList(reminders)}
    </section>
    <div class="dashboard-grid">
      <section class="panel">
        <div class="panel-head">
          <h3>Следващи одити</h3>
          <button class="btn ghost" data-view="audits">${icon("calendar")} Всички</button>
        </div>
        ${renderAuditList(upcomingAudits.slice(0, 5), true)}
      </section>
      <section class="panel">
        <div class="panel-head">
          <h3>Плащания за внимание</h3>
          <button class="btn ghost" data-view="payments">${icon("card")} Всички</button>
        </div>
        ${overdue.length ? renderPaymentSummary(overdue.concat(unpaid.filter((p) => p.status !== "overdue")).slice(0, 5)) : renderPaymentSummary(unpaid.slice(0, 5))}
      </section>
    </div>
    <section class="panel activity-panel">
      <div class="panel-head">
        <h3>Последни промени</h3>
        <button class="btn ghost" data-view="activity">${icon("activity")} История</button>
      </div>
      ${renderActivityList(state.activityLog.slice(0, 6))}
    </section>
  `;
}

function renderCompanies() {
  const companies = filteredCompanies();
  return `
    <div class="page-head">
      <div>
        <h2>Фирми и контакти</h2>
        <p>Табличен регистър с дейности, стандарти, контакти и текущ статус.</p>
      </div>
      <button class="btn primary" data-action="open-modal" data-modal="company">${icon("plus")} Добави фирма</button>
    </div>
    ${renderCompanyToolbar()}
    <section class="panel company-table-panel">
      <div class="table-wrap">
        <table class="company-table">
          <thead><tr><th>Фирма</th><th>Дейност</th><th>Стандарти</th><th>Булстат</th><th>Контакти</th><th>Статус</th></tr></thead>
          <tbody>
            ${companies.length ? companies.map((company) => `
              <tr>
                <td class="company-name-cell">
                  <button class="company-name-link" data-action="company-profile" data-id="${company.id}">${escapeHtml(company.name)}</button>
                  <div class="company-row-actions">
                    <button class="icon-btn compact" title="Редактирай" data-action="open-modal" data-modal="company" data-id="${company.id}">${icon("edit")}</button>
                    ${company.megaUrl ? `<a class="icon-btn compact" title="Mega папка" href="${escapeAttr(company.megaUrl)}" target="_blank" rel="noreferrer">${icon("link")}</a>` : ""}
                    ${canDelete() ? `<button class="icon-btn compact danger" title="Изтрий" data-action="delete" data-kind="company" data-id="${company.id}">${icon("trash")}</button>` : ""}
                  </div>
                </td>
                <td>${renderCompanyActivities(company)}</td>
                <td>${renderCompanyStandards(company)}</td>
                <td class="nowrap">${escapeHtml(company.bulstat || "—")}</td>
                <td><div class="contact-cell">${company.email ? `<a href="mailto:${escapeAttr(company.email)}">${escapeHtml(company.email)}</a>` : ""}${company.phone ? `<a href="tel:${escapeAttr(company.phone)}">${escapeHtml(company.phone)}</a>` : ""}${!company.email && !company.phone ? "—" : ""}</div></td>
                <td>${statusBadge("company", company.status)}</td>
              </tr>`).join("") : `<tr><td colspan="6"><div class="empty">Няма намерени фирми.</div></td></tr>`}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderCompanyToolbar() {
  const standards = [...new Set(state.companies.flatMap((company) => (company.standards || []).map((standard) => standard.name)).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "bg-BG"));
  return `
    <div class="toolbar company-toolbar">
      <div class="filters">
        ${companyFilter()}
        <select data-action="company-activity-filter">
          ${[["all", "Всички дейности"], ["certification", "Сертификация"], ["consulting", "Консултация"], ["occupational_medicine", "СТМ"]].map(([value, label]) => option(value, label, selectedCompanyActivity)).join("")}
        </select>
        <select data-action="company-standard-filter">
          ${option("all", "Всички стандарти", selectedCompanyStandard)}
          ${standards.map((standard) => option(standard, standard, selectedCompanyStandard)).join("")}
        </select>
        ${statusFilter([["all", "Всички статуси"], ["active", "Активен"], ["inactive", "Неактивен"]])}
        <button class="btn ghost" data-action="clear-company-filters">Изчисти филтрите</button>
      </div>
      <button class="btn ghost" data-action="export-csv" data-kind="company">${icon("file")} Експорт CSV</button>
    </div>`;
}

function filteredAudits() {
  return state.audits
    .filter((audit) => selectedCompany === "all" || audit.companyId === selectedCompany)
    .filter((audit) => selectedStatus === "all" || audit.status === selectedStatus)
    .filter((audit) => {
      const needle = query.trim().toLowerCase();
      if (!needle) return true;
      return [companyName(audit.companyId), audit.type, audit.auditor, audit.notes, audit.status].join(" ").toLowerCase().includes(needle);
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

function renderAudits() {
  const events = filteredCalendarEvents();
  const calendarTitle = selectedCalendarType === "planned" ? "Планирани дейности" : "Одитори";
  return `
    <div class="page-head">
      <div>
        <h2>Календар</h2>
        <p>Два независими календара с общ достъп, редакция, статуси, списък и календарен изглед.</p>
      </div>
      <button class="btn primary" data-action="open-modal" data-modal="calendarEvent">${icon("plus")} Нов запис</button>
    </div>
    <div class="calendar-switch">
      <button class="${selectedCalendarType === "planned" ? "active" : ""}" data-action="calendar-type" data-type="planned">Планирани дейности</button>
      <button class="${selectedCalendarType === "auditors" ? "active" : ""}" data-action="calendar-type" data-type="auditors">Одитори</button>
    </div>
    ${
      selectedCalendarType === "planned"
        ? `<div class="calendar-legend">
            <span><i class="calendar-dot certification"></i> Сертификация</span>
            <span><i class="calendar-dot consulting"></i> Консултации</span>
            <span><i class="calendar-dot occupational"></i> Служба Трудова Медицина</span>
          </div>`
        : `<div class="calendar-legend">
            <span><i class="auditor-dot georgi"></i> Георги Георгиев - одитор</span>
            <span><i class="auditor-dot ekaterina"></i> Екатерина Георгиева - одитор</span>
          </div>`
    }
    <div class="toolbar">
      <div class="filters">
        ${statusFilter([
          ["all", "Всички статуси"],
          ["upcoming", "Предстои"],
          ["in_progress", "В процес"],
          ["waiting_docs", "Чака документи"],
          ["done", "Готово"],
          ["cancelled", "Отказан"]
        ])}
      </div>
      <div class="segmented">
        <button class="${auditMode === "calendar" ? "active" : ""}" data-action="audit-mode" data-mode="calendar">Календар</button>
        <button class="${auditMode === "list" ? "active" : ""}" data-action="audit-mode" data-mode="list">Списък</button>
      </div>
    </div>
    ${
      auditMode === "calendar"
        ? `<section class="panel">${renderCalendarEvents(events)}</section><section class="panel audit-tools">${renderCalendarEventTools(events.length, calendarTitle)}</section>`
        : `<section class="panel">${renderCalendarEventList(events)}</section><section class="panel audit-tools">${renderCalendarEventTools(events.length, calendarTitle)}</section>`
    }
  `;
}

function renderCalendar(audits) {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - startOffset);
  const cells = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const iso = dateInput(date);
    const dayAudits = audits.filter((audit) => audit.date === iso);
    return `
      <button class="calendar-cell ${date.getMonth() !== month ? "outside" : ""}" data-action="open-modal" data-modal="audit" data-date="${iso}">
        <strong>${date.getDate()}</strong>
        ${dayAudits
          .slice(0, 3)
          .map((audit) => `<span class="calendar-chip ${audit.status}">${escapeHtml(companyName(audit.companyId))}</span>`)
          .join("")}
        ${dayAudits.length > 3 ? `<em>+${dayAudits.length - 3}</em>` : ""}
      </button>
    `;
  });

  return `
    <div class="calendar-head">
      <button class="btn ghost" data-action="month-prev">Назад</button>
      <h3>${new Intl.DateTimeFormat("bg-BG", { month: "long", year: "numeric" }).format(calendarDate)}</h3>
      <button class="btn ghost" data-action="month-next">Напред</button>
    </div>
    <div class="calendar-weekdays">
      <span>Пон</span><span>Вто</span><span>Сря</span><span>Чет</span><span>Пет</span><span>Съб</span><span>Нед</span>
    </div>
    <div class="calendar-grid">${cells.join("")}</div>
  `;
}

function renderAuditTools() {
  const count = filteredAudits().length;
  return `
    <div class="panel-head"><h3>Инструменти за одити</h3></div>
    <div class="tool-grid">
      <button class="btn ghost" data-action="export-csv" data-kind="audits">${icon("file")} Експорт CSV (${count})</button>
      <button class="btn ghost" data-action="open-modal" data-modal="audit">${icon("plus")} Бързо добавяне</button>
    </div>
  `;
}

function filteredCalendarEvents() {
  return state.calendarEvents
    .filter((event) => event.calendarType === selectedCalendarType)
    .filter((event) => selectedStatus === "all" || event.status === selectedStatus)
    .filter((event) => {
      const needle = query.trim().toLowerCase();
      if (!needle) return true;
      return [event.title, event.auditor, event.notes, event.sourceSheet, event.calendarName].join(" ").toLowerCase().includes(needle);
    })
    .sort((a, b) => `${a.date} ${a.time || ""}`.localeCompare(`${b.date} ${b.time || ""}`));
}

function calendarAuditorClass(event) {
  const auditor = normalizedImportedAuditor(event.auditor).toLocaleLowerCase("bg-BG");
  if (auditor.includes("георги георгиев")) return "auditor-georgi";
  if (auditor.includes("екатерина георгиева")) return "auditor-ekaterina";
  return "auditor-neutral";
}

function calendarEventVisualClass(event) {
  if (event.calendarType === "planned") {
    return `planned-${event.color || plannedCategoryColor(event.category)}`;
  }
  return calendarAuditorClass(event);
}

function renderCalendarEvents(events) {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - startOffset);
  const cells = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const iso = dateInput(date);
    const dayEvents = events.filter((event) => event.date === iso);
    return `
      <button class="calendar-cell ${date.getMonth() !== month ? "outside" : ""}" data-action="open-modal" data-modal="calendarEvent" data-date="${iso}">
        <strong>${date.getDate()}</strong>
        ${dayEvents
          .slice(0, 4)
          .map(
            (event) =>
              `<span class="calendar-chip ${event.status} ${calendarEventVisualClass(event)}" data-action="edit-calendar-event" data-id="${event.id}" title="${escapeAttr(
                event.calendarType === "planned"
                  ? `${calendarCategoryLabel(event.category)}: ${event.title}`
                  : event.auditor
                    ? `${normalizedImportedAuditor(event.auditor)}: ${event.title}`
                    : event.title
              )}">${escapeHtml(event.title)}</span>`
          )
          .join("")}
        ${dayEvents.length > 4 ? `<em>+${dayEvents.length - 4}</em>` : ""}
      </button>
    `;
  });

  return `
    <div class="calendar-head">
      <button class="btn ghost" data-action="month-prev">Назад</button>
      <h3>${new Intl.DateTimeFormat("bg-BG", { month: "long", year: "numeric" }).format(calendarDate)}</h3>
      <button class="btn ghost" data-action="month-next">Напред</button>
    </div>
    <div class="calendar-weekdays">
      <span>Пон</span><span>Вто</span><span>Сря</span><span>Чет</span><span>Пет</span><span>Съб</span><span>Нед</span>
    </div>
    <div class="calendar-grid">${cells.join("")}</div>
  `;
}

function renderCalendarEventList(events) {
  if (!events.length) return `<div class="empty">Няма записи за избрания календар.</div>`;
  return `
    <div class="calendar-list">
      ${events
        .map((event) => {
          const days = daysUntil(event.date);
          const dayText = days < 0 ? "минал" : days === 0 ? "днес" : `${days} дни`;
          return `
            <div class="calendar-item audit-row ${calendarEventVisualClass(event)}">
              <div class="date-badge audit-date">
                <strong>${formatShortDate(event.date)}</strong>
                <small>${event.time || ""}</small>
              </div>
              <div class="audit-main">
                <strong>${escapeHtml(event.title)}</strong>
                <div class="meta">
                  <span>${escapeHtml(event.calendarName)}${event.auditor ? ` · ${escapeHtml(event.auditor)}` : ""}</span>
                  ${event.calendarType === "planned" ? `<span>Категория: ${escapeHtml(calendarCategoryLabel(event.category))}</span>` : ""}
                  <span>${escapeHtml(event.notes || "")}</span>
                  <span>Източник: ${escapeHtml(event.sourceSheet || "ръчно")} ${escapeHtml(event.sourceCell || "")}</span>
                  <span>Последно: ${escapeHtml(event.updatedBy)} · ${formatTime(event.updatedAt)}</span>
                </div>
              </div>
              <div class="card-actions audit-actions">
                <span class="status ${days < 0 ? "danger" : days <= 7 ? "warn" : "info"}">${dayText}</span>
                ${statusBadge("audit", event.status)}
                ${statusBadge("priority", event.priority)}
                <select class="inline-select" data-action="calendar-event-status" data-id="${event.id}">
                  ${auditStatusOptions(event.status)}
                </select>
                <button class="icon-btn" title="Редактирай" data-action="open-modal" data-modal="calendarEvent" data-id="${event.id}">${icon("edit")}</button>
                ${canDelete() ? `<button class="icon-btn danger" title="Изтрий" data-action="delete-calendar-event" data-id="${event.id}">${icon("trash")}</button>` : ""}
              </div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderCalendarEventTools(count, title) {
  return `
    <div class="panel-head"><h3>Инструменти: ${escapeHtml(title)}</h3></div>
    <div class="tool-grid">
      <button class="btn ghost" data-action="export-csv" data-kind="calendarEvents">${icon("file")} Експорт CSV (${count})</button>
      <button class="btn ghost" data-action="open-modal" data-modal="calendarEvent">${icon("plus")} Бързо добавяне</button>
    </div>
  `;
}

function renderReminderList(reminders) {
  if (!reminders.length) return `<div class="empty">Няма одити, които да изискват напомняне в зададения срок.</div>`;
  return `
    <div class="activity-list">
      ${reminders
        .map(
          (audit) => `
            <div class="activity-item">
              <div class="date-badge">${daysUntil(audit.date)}<small>дни</small></div>
              <div>
                <strong>${escapeHtml(companyName(audit.companyId))}</strong>
                <div class="meta">
                  <span>${formatDate(audit.date)} · ${escapeHtml(audit.type)} · напомняне ${audit.reminderDays} дни преди одита</span>
                  <span>${audit.reminderSent ? "Маркирано като изпратено" : "Готово за изпращане/интеграция с имейл"}</span>
                </div>
              </div>
              <button class="btn ghost" data-action="reminder-sent" data-id="${audit.id}">${icon("check")} Изпратено</button>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderCompanyPaymentHistory(companyId) {
  const payments = state.payments.filter((payment) => payment.companyId === companyId);
  if (!payments.length) return `<div class="payment-history muted-text">Няма плащания.</div>`;
  return `
    <div class="payment-history">
      <strong>История на плащанията</strong>
      ${payments
        .slice(0, 4)
        .map(
          (payment) => `
            <span>
              ${escapeHtml(payment.invoice || "без фактура")} · ${payment.amount} лв. · ${formatDate(payment.dueDate)}
              ${statusBadge("payment", payment.status)}
            </span>
          `
        )
        .join("")}
    </div>
  `;
}

function renderMegaQueue(docs) {
  const queued = docs.filter((doc) => doc.uploadStatus === "queued");
  if (!queued.length) return "";
  return `
    <section class="panel mega-queue">
      <div class="panel-head">
        <h3>Mega качване</h3>
        <span class="status warn">${queued.length} чакащи</span>
      </div>
      <div class="activity-list">
        ${queued
          .map(
            (doc) => `
              <div class="activity-item">
                <div class="date-badge file-badge">${icon("upload")}</div>
                <div>
                  <strong>${escapeHtml(doc.name)}</strong>
                  <div class="meta">
                    <span>${escapeHtml(companyName(doc.companyId))} · ще се качи в Mega папката на фирмата</span>
                    <span>В статичното MVP това е опашка; реалното качване минава през backend Mega интеграция.</span>
                  </div>
                </div>
                <button class="btn primary" data-action="mega-uploaded" data-id="${doc.id}">${icon("check")} Маркирай качено</button>
              </div>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function megaUploadLabel(status) {
  return {
    uploaded: "качено",
    queued: "чака качване",
    local: "локален запис"
  }[status || "local"];
}

function renderPayments() {
  const payments = state.payments
    .filter((payment) => selectedCompany === "all" || payment.companyId === selectedCompany)
    .filter((payment) => selectedStatus === "all" || payment.status === selectedStatus)
    .filter((payment) => {
      const needle = query.trim().toLowerCase();
      if (!needle) return true;
      return [companyName(payment.companyId), payment.invoice, payment.status].join(" ").toLowerCase().includes(needle);
    });

  return `
    <div class="page-head">
      <div>
        <h2>Плащания</h2>
        <p>Кой е платил, кой не е платил и кои срокове наближават.</p>
      </div>
      <button class="btn primary" data-action="open-modal" data-modal="payment">${icon("plus")} Ново плащане</button>
    </div>
    ${renderToolbar("payment")}
    <section class="panel">
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Фирма</th><th>Фактура</th><th>Сума</th><th>Падеж</th><th>Платено</th><th>Статус</th><th>Последно</th><th>Действия</th></tr>
          </thead>
          <tbody>
            ${payments
              .map(
                (payment) => `
                  <tr>
                    <td>${escapeHtml(companyName(payment.companyId))}</td>
                    <td>${escapeHtml(payment.invoice)}</td>
                    <td>${payment.amount} лв.</td>
                    <td>${formatDate(payment.dueDate)}</td>
                    <td>${payment.paidDate ? formatDate(payment.paidDate) : "-"}</td>
                    <td>${statusBadge("payment", payment.status)}</td>
                    <td>${escapeHtml(payment.updatedBy)} · ${formatTime(payment.updatedAt)}</td>
                    <td>
                      <div class="mini-actions">
                        <button class="icon-btn" title="Платено" data-action="quick-status" data-kind="payment" data-id="${payment.id}" data-status="paid">${icon("check")}</button>
                        <button class="icon-btn" title="Редактирай" data-action="open-modal" data-modal="payment" data-id="${payment.id}">${icon("edit")}</button>
                        ${canDelete() ? `<button class="icon-btn danger" title="Изтрий" data-action="delete" data-kind="payment" data-id="${payment.id}">${icon("trash")}</button>` : ""}
                      </div>
                    </td>
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderDocuments() {
  const docs = state.documents
    .filter((doc) => selectedCompany === "all" || doc.companyId === selectedCompany)
    .filter((doc) => {
      const needle = query.trim().toLowerCase();
      if (!needle) return true;
      return [doc.name, doc.kind, doc.source, companyName(doc.companyId), doc.megaUrl].join(" ").toLowerCase().includes(needle);
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return `
    <div class="page-head">
      <div>
        <h2>Документи и Mega</h2>
        <p>Качени документи, външни Mega линкове и папки към фирмите.</p>
      </div>
      <button class="btn accent" data-action="open-modal" data-modal="document">${icon("upload")} Качи документ</button>
    </div>
    ${renderToolbar("document")}
    ${renderMegaQueue(docs)}
    <section class="panel">
      <div class="document-list">
        ${
          docs.length
            ? docs
                .map(
                  (doc) => `
                    <div class="document-item">
                      <div class="date-badge file-badge">${icon("file")}</div>
                      <div>
                        <strong>${escapeHtml(doc.name)}</strong>
                        <div class="meta">
                          <span>${escapeHtml(companyName(doc.companyId))} · ${escapeHtml(doc.kind)} · ${formatDate(doc.createdAt)}</span>
                          <span>Последно: ${escapeHtml(doc.updatedBy)} · ${formatTime(doc.updatedAt)}</span>
                          <span>Статус Mega: ${megaUploadLabel(doc.uploadStatus)}</span>
                        </div>
                      </div>
                      <div class="card-actions">
                        ${
                          doc.megaUrl
                            ? `<a class="btn primary" href="${escapeAttr(doc.megaUrl)}" target="_blank" rel="noreferrer">${icon("link")} Отвори</a>`
                            : `<span class="status warn">Няма Mega линк</span>`
                        }
                        ${
                          doc.uploadStatus === "queued"
                            ? `<button class="btn ghost" data-action="mega-uploaded" data-id="${doc.id}">${icon("check")} Качено</button>`
                            : ""
                        }
                        <button class="icon-btn" title="Редактирай" data-action="open-modal" data-modal="document" data-id="${doc.id}">${icon("edit")}</button>
                        ${canDelete() ? `<button class="icon-btn danger" title="Изтрий" data-action="delete" data-kind="document" data-id="${doc.id}">${icon("trash")}</button>` : ""}
                      </div>
                    </div>
                  `
                )
                .join("")
            : `<div class="empty">Няма документи.</div>`
        }
      </div>
    </section>
  `;
}

function renderCompanyProfile() {
  const company = state.companies.find((item) => item.id === activeCompanyId) || state.companies[0];
  if (!company) return `<div class="empty">Няма избрана фирма.</div>`;
  const audits = state.audits.filter((audit) => audit.companyId === company.id).sort((a, b) => b.date.localeCompare(a.date));
  const payments = state.payments.filter((payment) => payment.companyId === company.id).sort((a, b) => b.dueDate.localeCompare(a.dueDate));
  const docs = state.documents.filter((doc) => doc.companyId === company.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const logs = state.activityLog.filter((log) => log.entityId === company.id || log.action.includes(company.name));
  const totalPaid = payments.filter((payment) => payment.status === "paid").reduce((sum, payment) => sum + Number(payment.amount), 0);
  const totalDue = payments.filter((payment) => payment.status !== "paid").reduce((sum, payment) => sum + Number(payment.amount), 0);

  return `
    <div class="page-head">
      <div>
        <h2>${escapeHtml(company.name)}</h2>
        <p>Пълен профил на фирма: одити, плащания, документи, Mega папка и история.</p>
      </div>
      <div class="card-actions">
        <button class="btn ghost" data-view="companies">Назад</button>
        <button class="btn primary" data-action="open-modal" data-modal="company" data-id="${company.id}">${icon("edit")} Редактирай</button>
      </div>
    </div>
    <div class="stats-grid">
      <div class="stat"><span>Одити</span><strong>${audits.length}</strong></div>
      <div class="stat"><span>Документи</span><strong>${docs.length}</strong></div>
      <div class="stat"><span>Платено</span><strong>${totalPaid} лв.</strong></div>
      <div class="stat"><span>Неплатено</span><strong>${totalDue} лв.</strong></div>
    </div>
    <section class="panel profile-panel">
      <div class="profile-grid">
        <div>
          <h3>Данни</h3>
          <div class="meta profile-meta">
            <span>Булстат: ${escapeHtml(company.bulstat || "-")}</span>
            <span>Контакт: ${escapeHtml(company.contact || "-")}</span>
            <span>Телефон: ${escapeHtml(company.phone || "-")}</span>
            <span>Имейл: ${escapeHtml(company.email || "-")}</span>
            <span>Статус: ${statusBadge("company", company.status)}</span>
            <span>Последно: ${escapeHtml(company.updatedBy)} · ${formatTime(company.updatedAt)}</span>
          </div>
        </div>
        <div>
          <h3>Mega папка</h3>
          ${
            company.megaUrl
              ? `<a class="btn primary" href="${escapeAttr(company.megaUrl)}" target="_blank" rel="noreferrer">${icon("link")} Отвори Mega папка</a>`
              : `<button class="btn ghost" data-action="open-modal" data-modal="mega" data-company="${company.id}">${icon("link")} Добави Mega папка</button>`
          }
          <p class="muted-text">${escapeHtml(company.notes || "Няма бележки.")}</p>
        </div>
      </div>
    </section>
    <div class="dashboard-grid">
      <section class="panel">
        <div class="panel-head"><h3>Всички одити</h3><button class="btn ghost" data-action="open-modal" data-modal="audit" data-company="${company.id}">${icon("plus")} Одит</button></div>
        ${renderAuditList(audits, false)}
      </section>
      <section class="panel">
        <div class="panel-head"><h3>История на плащанията</h3><button class="btn ghost" data-action="open-modal" data-modal="payment" data-company="${company.id}">${icon("plus")} Плащане</button></div>
        ${renderPaymentSummary(payments)}
      </section>
    </div>
    <div class="dashboard-grid">
      <section class="panel">
        <div class="panel-head"><h3>Документи</h3><button class="btn ghost" data-action="open-modal" data-modal="document" data-company="${company.id}">${icon("upload")} Документ</button></div>
        ${renderProfileDocuments(docs)}
      </section>
      <section class="panel">
        <div class="panel-head"><h3>История за фирмата</h3></div>
        ${renderActivityList(logs.slice(0, 8))}
      </section>
    </div>
  `;
}

function renderProfileDocuments(docs) {
  if (!docs.length) return `<div class="empty">Няма документи за тази фирма.</div>`;
  return `
    <div class="document-list">
      ${docs
        .map(
          (doc) => `
            <div class="document-item compact-doc">
              <div>
                <strong>${escapeHtml(doc.name)}</strong>
                <div class="meta"><span>${escapeHtml(doc.kind)} · ${formatDate(doc.createdAt)} · Mega: ${megaUploadLabel(doc.uploadStatus)}</span></div>
              </div>
              ${doc.megaUrl ? `<a class="btn primary" href="${escapeAttr(doc.megaUrl)}" target="_blank" rel="noreferrer">${icon("link")} Отвори</a>` : `<span class="status warn">няма линк</span>`}
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderNotifications() {
  const notifications = getNotifications();
  return `
    <div class="page-head">
      <div>
        <h2>Известия</h2>
        <p>Одити след 7 дни, одити утре, неплатени фактури, просрочия и липсващи документи.</p>
      </div>
    </div>
    <section class="panel">
      ${
        notifications.length
          ? `<div class="activity-list">${notifications
              .map(
                (note) => `
                  <div class="activity-item notification-item">
                    <div class="date-badge ${note.tone}">${note.badge}<small>${note.small}</small></div>
                    <div>
                      <strong>${escapeHtml(note.title)}</strong>
                      <div class="meta"><span>${escapeHtml(note.detail)}</span></div>
                    </div>
                    <span class="status ${note.tone}">${note.type}</span>
                  </div>
                `
              )
              .join("")}</div>`
          : `<div class="empty">Няма активни известия.</div>`
      }
    </section>
  `;
}

function renderActivity() {
  return `
    <div class="page-head">
      <div>
        <h2>История</h2>
        <p>Тук се записва кой потребител е направил промяна. Историята няма бутон за изтриване.</p>
      </div>
    </div>
    <section class="panel">${renderActivityList(state.activityLog)}</section>
  `;
}

function renderActivityList(logs) {
  if (!logs.length) return `<div class="empty">Още няма записани промени.</div>`;
  return `
    <div class="activity-list">
      ${logs
        .map(
          (log) => `
            <div class="activity-item">
              <div class="date-badge audit-log-badge">${icon("activity")}</div>
              <div>
                <strong>${escapeHtml(log.action)}</strong>
                <div class="meta">
                  <span>${escapeHtml(log.user)} · ${escapeHtml(log.entity)} · ${formatTime(log.at)}</span>
                </div>
              </div>
              <span class="status muted">заключено</span>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function getNotifications() {
  const notes = [];
  state.audits.forEach((audit) => {
    const days = daysUntil(audit.date);
    const missingTasks = (audit.checklist || []).filter((task) => task.status !== "done").length;
    if (days === 7) {
      notes.push({
        tone: "info",
        badge: "7",
        small: "дни",
        type: "одит",
        title: `Одит след 7 дни: ${companyName(audit.companyId)}`,
        detail: `${formatDate(audit.date)} · ${audit.time} · ${audit.type}`
      });
    }
    if (days === 1) {
      notes.push({
        tone: "warn",
        badge: "1",
        small: "ден",
        type: "утре",
        title: `Одит утре: ${companyName(audit.companyId)}`,
        detail: `${audit.time} · отговорник ${audit.auditor}`
      });
    }
    if (missingTasks > 0 && days >= 0 && days <= 14) {
      notes.push({
        tone: "warn",
        badge: missingTasks,
        small: "задачи",
        type: "документи",
        title: `Липсващи задачи/документи: ${companyName(audit.companyId)}`,
        detail: `${missingTasks} незавършени checklist задачи преди одита на ${formatDate(audit.date)}`
      });
    }
  });

  state.payments.forEach((payment) => {
    if (payment.status === "overdue") {
      notes.push({
        tone: "danger",
        badge: "!",
        small: "падеж",
        type: "просрочено",
        title: `Просрочено плащане: ${companyName(payment.companyId)}`,
        detail: `${payment.invoice} · ${payment.amount} лв. · падеж ${formatDate(payment.dueDate)}`
      });
    } else if (payment.status === "pending") {
      const days = daysUntil(payment.dueDate);
      if (days >= 0 && days <= 7) {
        notes.push({
          tone: "warn",
          badge: days,
          small: "дни",
          type: "неплатено",
          title: `Неплатена фактура: ${companyName(payment.companyId)}`,
          detail: `${payment.invoice} · ${payment.amount} лв. · падеж ${formatDate(payment.dueDate)}`
        });
      }
    }
  });

  state.companies.forEach((company) => {
    const hasDocs = state.documents.some((doc) => doc.companyId === company.id);
    if (!hasDocs) {
      notes.push({
        tone: "info",
        badge: "0",
        small: "док.",
        type: "липсват",
        title: `Няма документи: ${company.name}`,
        detail: "Добави документ или Mega линк към фирмата."
      });
    }
  });

  return notes;
}

function renderToolbar(type) {
  const statusSets = {
    company: [
      ["all", "Всички статуси"],
      ["active", "Активен"],
      ["watch", "Наблюдение"],
      ["archived", "Архив"]
    ],
    payment: [
      ["all", "Всички статуси"],
      ["paid", "Платено"],
      ["pending", "Очаква плащане"],
      ["overdue", "Просрочено"]
    ],
    document: [["all", "Всички документи"]]
  };
  return `
    <div class="toolbar">
      <div class="filters">
        ${companyFilter()}
        ${statusFilter(statusSets[type] || [["all", "Всички статуси"]])}
      </div>
      <button class="btn ghost" data-action="export-csv" data-kind="${type}">${icon("file")} Експорт CSV</button>
    </div>
  `;
}

function companyFilter() {
  return `
    <select data-action="company-filter">
      <option value="all">Всички фирми</option>
      ${state.companies
        .map((company) => `<option value="${company.id}" ${selectedCompany === company.id ? "selected" : ""}>${escapeHtml(company.name)}</option>`)
        .join("")}
    </select>
  `;
}

function statusFilter(options) {
  return `
    <select data-action="status-filter">
      ${options.map(([value, label]) => `<option value="${value}" ${selectedStatus === value ? "selected" : ""}>${label}</option>`).join("")}
    </select>
  `;
}

function renderAuditList(audits, compact = false) {
  if (!audits.length) return `<div class="empty">Няма одити за показване.</div>`;
  return `
    <div class="calendar-list">
      ${audits
        .map((audit) => {
          const days = daysUntil(audit.date);
          const dayText = days < 0 ? "минал" : days === 0 ? "днес" : `${days} дни`;
          return `
            <div class="calendar-item audit-row">
              <div class="date-badge audit-date">
                <strong>${formatShortDate(audit.date)}</strong>
                <small>${audit.time || ""}</small>
              </div>
              <div class="audit-main">
                <strong>${escapeHtml(companyName(audit.companyId))}</strong>
                <div class="meta">
                  <span>${escapeHtml(audit.type)} · ${escapeHtml(audit.auditor)}</span>
                  <span>${escapeHtml(audit.notes || "")}</span>
                  <span>Checklist: ${completedTasks(audit)}/${audit.checklist.length} готови · Напомняне: ${audit.reminderDays} дни преди</span>
                  ${renderTaskPreview(audit)}
                  <span>Последно: ${escapeHtml(audit.updatedBy)} · ${formatTime(audit.updatedAt)}</span>
                </div>
              </div>
              <div class="card-actions audit-actions">
                <span class="status ${days < 0 ? "danger" : days <= 7 ? "warn" : "info"}">${dayText}</span>
                ${statusBadge("audit", audit.status)}
                ${statusBadge("priority", audit.priority)}
                ${
                  compact
                    ? ""
                    : `
                      <select class="inline-select" data-action="quick-status" data-kind="audit" data-id="${audit.id}">
                        ${auditStatusOptions(audit.status)}
                      </select>
                      <button class="icon-btn" title="Дублирай" data-action="duplicate-audit" data-id="${audit.id}">${icon("copy")}</button>
                      <button class="icon-btn" title="Редактирай" data-action="open-modal" data-modal="audit" data-id="${audit.id}">${icon("edit")}</button>
                      ${canDelete() ? `<button class="icon-btn danger" title="Изтрий" data-action="delete" data-kind="audit" data-id="${audit.id}">${icon("trash")}</button>` : ""}
                    `
                }
              </div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function completedTasks(audit) {
  return (audit.checklist || []).filter((task) => task.done).length;
}

function renderTaskPreview(audit) {
  if (!audit.checklist?.length) return "";
  return `
    <span class="task-preview">
      ${audit.checklist
        .slice(0, 3)
        .map((task) => `${taskStatusLabel(task.status)}: ${task.text} (${task.assignee}, ${formatDate(task.dueDate)})`)
        .join(" · ")}
    </span>
  `;
}

function taskStatusLabel(status) {
  return {
    pending: "чака",
    in_progress: "в процес",
    done: "готово"
  }[status || "pending"];
}

function formatChecklistForForm(checklist) {
  return checklist.map((task) => `${task.status || (task.done ? "done" : "pending")} | ${task.text} | ${task.assignee || ""} | ${task.dueDate || ""}`).join("\n");
}

function parseChecklist(text = "") {
  return String(text)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (/^\[[ x]\]/i.test(line)) {
        const done = /^\[x\]/i.test(line);
        const clean = line.replace(/^\[[ x]\]\s*/i, "");
        return { id: id("t"), text: clean, assignee: currentUser(), dueDate: "", status: done ? "done" : "pending", done };
      }
      const [rawStatus, rawText, rawAssignee, rawDueDate] = line.split("|").map((part) => part?.trim() || "");
      const status = ["pending", "in_progress", "done"].includes(rawStatus) ? rawStatus : "pending";
      return {
        id: id("t"),
        text: rawText || rawStatus,
        assignee: rawAssignee || currentUser(),
        dueDate: rawDueDate,
        status,
        done: status === "done"
      };
    });
}

function auditStatusOptions(selected) {
  return [
    ["upcoming", "Предстои"],
    ["in_progress", "В процес"],
    ["waiting_docs", "Чака документи"],
    ["done", "Готово"],
    ["cancelled", "Отказан"]
  ]
    .map(([value, label]) => `<option value="${value}" ${selected === value ? "selected" : ""}>${label}</option>`)
    .join("");
}

function renderPaymentSummary(payments) {
  if (!payments.length) return `<div class="empty">Няма неплатени суми.</div>`;
  return `
    <div class="activity-list">
      ${payments
        .map(
          (payment) => `
            <div class="activity-item">
              <div class="date-badge amount-badge">${payment.amount}<small>лв.</small></div>
              <div>
                <strong>${escapeHtml(companyName(payment.companyId))}</strong>
                <div class="meta">
                  <span>${escapeHtml(payment.invoice)} · падеж ${formatDate(payment.dueDate)}</span>
                </div>
              </div>
              ${statusBadge("payment", payment.status)}
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function bindEvents() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      activeView = button.dataset.view;
      selectedStatus = "all";
      document.querySelector("#sidebar")?.classList.remove("open");
      render();
    });
  });

  document.querySelectorAll("[data-action='open-modal']").forEach((button) => {
    button.addEventListener("click", () => openModal(button.dataset.modal, button.dataset.company || "", button.dataset.id || "", button.dataset.date || ""));
  });

  document.querySelectorAll("[data-action='edit-calendar-event']").forEach((item) => {
    item.addEventListener("click", (event) => {
      event.stopPropagation();
      openModal("calendarEvent", "", item.dataset.id || "");
    });
  });

  document.querySelector("[data-action='check-supabase']")?.addEventListener("click", () => {
    checkSupabaseConnection(true);
  });

  document.querySelectorAll("[data-action='company-profile']").forEach((button) => {
    button.addEventListener("click", () => {
      activeCompanyId = button.dataset.id;
      activeView = "companyProfile";
      render();
    });
  });

  document.querySelector("[data-action='toggle-menu']")?.addEventListener("click", () => {
    document.querySelector("#sidebar").classList.toggle("open");
  });

  document.querySelector("[data-action='logout']")?.addEventListener("click", async () => {
    const user = state.users.find((item) => item.name === currentUser());
    if (user) {
      user.online = false;
      user.lastSeen = nowIso();
    }
    addLog("Излезе от системата", "Потребител", currentUser());
    if (supabaseClient) {
      await supabaseClient.auth.signOut();
    }
    supabaseAuthUser = null;
    state.session = null;
    saveState();
    render();
  });

  document.querySelector("[data-action='search']")?.addEventListener("input", (event) => {
    query = event.target.value;
    render();
  });

  document.querySelector("[data-action='company-filter']")?.addEventListener("change", (event) => {
    selectedCompany = event.target.value;
    render();
  });

  document.querySelector("[data-action='status-filter']")?.addEventListener("change", (event) => {
    selectedStatus = event.target.value;
    render();
  });

  document.querySelector("[data-action='company-activity-filter']")?.addEventListener("change", (event) => {
    selectedCompanyActivity = event.target.value;
    render();
  });

  document.querySelector("[data-action='company-standard-filter']")?.addEventListener("change", (event) => {
    selectedCompanyStandard = event.target.value;
    render();
  });

  document.querySelector("[data-action='clear-company-filters']")?.addEventListener("click", () => {
    selectedCompany = "all";
    selectedStatus = "all";
    selectedCompanyActivity = "all";
    selectedCompanyStandard = "all";
    query = "";
    render();
  });

  document.querySelectorAll("[data-action='audit-mode']").forEach((button) => {
    button.addEventListener("click", () => {
      auditMode = button.dataset.mode;
      render();
    });
  });

  document.querySelectorAll("[data-action='calendar-type']").forEach((button) => {
    button.addEventListener("click", () => {
      selectedCalendarType = button.dataset.type;
      selectedStatus = "all";
      render();
    });
  });

  document.querySelector("[data-action='month-prev']")?.addEventListener("click", () => {
    calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1);
    render();
  });

  document.querySelector("[data-action='month-next']")?.addEventListener("click", () => {
    calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1);
    render();
  });

  document.querySelectorAll("[data-action='quick-status']").forEach((control) => {
    control.addEventListener("change", () => updateStatus(control.dataset.kind, control.dataset.id, control.value));
    control.addEventListener("click", () => {
      if (control.tagName === "BUTTON") updateStatus(control.dataset.kind, control.dataset.id, control.dataset.status);
    });
  });

  document.querySelectorAll("[data-action='calendar-event-status']").forEach((control) => {
    control.addEventListener("change", () => updateCalendarEventStatus(control.dataset.id, control.value));
  });

  document.querySelectorAll("[data-action='delete']").forEach((button) => {
    button.addEventListener("click", () => deleteItem(button.dataset.kind, button.dataset.id));
  });

  document.querySelectorAll("[data-action='delete-calendar-event']").forEach((button) => {
    button.addEventListener("click", () => deleteCalendarEvent(button.dataset.id));
  });

  document.querySelectorAll("[data-action='duplicate-audit']").forEach((button) => {
    button.addEventListener("click", () => duplicateAudit(button.dataset.id));
  });

  document.querySelectorAll("[data-action='export-csv']").forEach((button) => {
    button.addEventListener("click", () => exportCsv(button.dataset.kind));
  });

  document.querySelectorAll("[data-action='reminder-sent']").forEach((button) => {
    button.addEventListener("click", () => markReminderSent(button.dataset.id));
  });

  document.querySelectorAll("[data-action='mega-uploaded']").forEach((button) => {
    button.addEventListener("click", () => markMegaUploaded(button.dataset.id));
  });
}

function openModal(type, companyId = "", itemId = "", defaultDate = "") {
  const templates = {
    company: companyForm,
    audit: auditForm,
    payment: paymentForm,
    document: documentForm,
    calendarEvent: calendarEventForm,
    mega: megaForm,
    changePassword: changePasswordForm
  };
  const item = findItem(type, itemId);
  document.querySelector("#modal-root").innerHTML = `
    <div class="modal" data-action="close-modal">
      <div class="modal-card" role="dialog" aria-modal="true">
        <div class="modal-head">
          <h3>${modalTitle(type, item)}</h3>
          <button class="btn ghost" data-action="close-modal-button">${icon("close")}</button>
        </div>
        <div class="modal-body">${templates[type](companyId, item, defaultDate)}</div>
      </div>
    </div>
  `;

  document.querySelector(".modal").addEventListener("click", (event) => {
    if (event.target.classList.contains("modal")) closeModal();
  });
  document.querySelectorAll("[data-action='close-modal-button']").forEach((button) => {
    button.addEventListener("click", closeModal);
  });
  document.querySelector(".modal form").addEventListener("submit", handleForm);
  document.querySelector("[data-action='add-standard']")?.addEventListener("click", () => {
    document.querySelector("#company-standards")?.insertAdjacentHTML("beforeend", standardFormRow());
  });
  document.querySelector("#company-standards")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action='remove-standard']");
    if (button) button.closest(".standard-form-row")?.remove();
  });
  document.querySelector("#doc-file")?.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) document.querySelector("#doc-name").value = file.name;
  });
}

function closeModal() {
  document.querySelector("#modal-root").innerHTML = "";
}

function findItem(type, itemId) {
  const lists = {
    company: state.companies,
    audit: state.audits,
    payment: state.payments,
    document: state.documents,
    calendarEvent: state.calendarEvents
  };
  return lists[type]?.find((item) => item.id === itemId) || null;
}

function modalTitle(type, item) {
  const titles = {
    company: item ? "Редакция на фирма" : "Нова фирма",
    audit: item ? "Редакция на одит" : "Нов одит",
    payment: item ? "Редакция на плащане" : "Ново плащане",
    document: item ? "Редакция на документ" : "Качване на документ",
    calendarEvent: item ? "Редакция на календарен запис" : "Нов календарен запис",
    mega: "Mega папка",
    changePassword: "Смяна на парола"
  };
  return titles[type];
}

function companyOptions(selected = "") {
  return state.companies.map((company) => `<option value="${company.id}" ${selected === company.id ? "selected" : ""}>${escapeHtml(company.name)}</option>`).join("");
}

function companyForm(companyId, item) {
  return `
    <form data-form="company">
      <input type="hidden" name="id" value="${escapeAttr(item?.id || "")}" />
      <div class="form-grid">
        ${field("name", "Име на фирма", "text", item?.name || "", true)}
        ${field("bulstat", "Булстат", "text", item?.bulstat || "")}
        ${field("contact", "Лице за контакт", "text", item?.contact || "")}
        ${field("phone", "Телефон", "tel", item?.phone || "")}
        ${field("email", "Имейл", "email", item?.email || "")}
        <fieldset class="form-row full company-activities-field">
          <legend>Дейност</legend>
          <div class="checkbox-grid">
            ${activityCheckbox("certification", "Сертификация", item?.activities)}
            ${activityCheckbox("consulting", "Консултация", item?.activities)}
            ${activityCheckbox("occupational_medicine", "СТМ", item?.activities)}
          </div>
        </fieldset>
        <div class="form-row full">
          <div class="field-label-row"><label>Стандарти</label><button class="btn ghost small" type="button" data-action="add-standard">${icon("plus")} Добави стандарт</button></div>
          <div id="company-standards" class="standards-form-list">
            ${(item?.standards?.length ? item.standards : [{ name: "", color: "blue" }]).map((standard) => standardFormRow(standard)).join("")}
          </div>
        </div>
        ${field("megaUrl", "Mega папка", "url", item?.megaUrl || "")}
        <div class="form-row">
          <label for="status">Статус</label>
          <select id="status" name="status">
            ${option("active", "Активен", item?.status)}
            ${option("inactive", "Неактивен", item?.status)}
          </select>
        </div>
        <div class="form-row full">
          <label for="notes">Бележки</label>
          <textarea id="notes" name="notes" rows="3">${escapeHtml(item?.notes || "")}</textarea>
        </div>
      </div>
      ${formActions()}
    </form>
  `;
}

function activityCheckbox(value, label, selected = []) {
  return `<label class="checkbox-choice"><input type="checkbox" name="activities" value="${escapeAttr(value)}" ${(selected || []).includes(value) ? "checked" : ""} /><span>${escapeHtml(label)}</span></label>`;
}

function standardFormRow(standard = { name: "", color: "blue" }) {
  const colors = [["blue", "Син"], ["green", "Зелен"], ["red", "Червен"], ["orange", "Оранжев"], ["purple", "Лилав"], ["gray", "Сив"]];
  return `<div class="standard-form-row"><input name="standardName" type="text" value="${escapeAttr(standard.name || "")}" placeholder="напр. 9001 или BSCI" /><select name="standardColor">${colors.map(([value, label]) => option(value, label, standard.color || "blue")).join("")}</select><button class="icon-btn danger" type="button" title="Премахни" data-action="remove-standard">${icon("trash")}</button></div>`;
}

function auditForm(companyId, item, defaultDate) {
  return `
    <form data-form="audit">
      <input type="hidden" name="id" value="${escapeAttr(item?.id || "")}" />
      <div class="form-grid">
        <div class="form-row">
          <label for="companyId">Фирма</label>
          <select id="companyId" name="companyId" required>${companyOptions(item?.companyId || companyId)}</select>
        </div>
        ${field("date", "Дата", "date", item?.date || defaultDate || "", true)}
        ${field("time", "Час", "time", item?.time || "10:00", true)}
        ${field("type", "Тип одит", "text", item?.type || "Годишен одит", true)}
        ${field("auditor", "Одитор", "text", item?.auditor || "", true)}
        <div class="form-row">
          <label for="status">Статус</label>
          <select id="status" name="status">
            ${auditStatusOptions(item?.status || "upcoming")}
          </select>
        </div>
        <div class="form-row">
          <label for="priority">Приоритет</label>
          <select id="priority" name="priority">
            ${option("low", "Нисък", item?.priority)}
            ${option("normal", "Нормален", item?.priority || "normal")}
            ${option("high", "Висок", item?.priority)}
          </select>
        </div>
        ${field("reminderDays", "Напомняне дни преди одита", "number", item?.reminderDays || 7, true)}
        <div class="form-row full">
          <label for="notes">Бележки</label>
          <textarea id="notes" name="notes" rows="3">${escapeHtml(item?.notes || "")}</textarea>
        </div>
        <div class="form-row full">
          <label for="checklist">Checklist задачи</label>
          <textarea id="checklist" name="checklist" rows="5" placeholder="pending | Проверка на документи | Николай | 2026-08-02&#10;in_progress | Потвърждение на час | Анна | 2026-08-03&#10;done | Изпратен протокол | Администратор | 2026-08-04">${escapeHtml(formatChecklistForForm(item?.checklist || []))}</textarea>
        </div>
      </div>
      ${formActions()}
    </form>
  `;
}

function calendarEventForm(companyId, item, defaultDate) {
  const calendarType = item?.calendarType || selectedCalendarType;
  return `
    <form data-form="calendarEvent">
      <input type="hidden" name="id" value="${escapeAttr(item?.id || "")}" />
      <div class="form-grid">
        <div class="form-row">
          <label for="calendarType">Календар</label>
          <select id="calendarType" name="calendarType" required>
            ${option("planned", "Планирани дейности", calendarType)}
            ${option("auditors", "Одитори", calendarType)}
          </select>
        </div>
        ${field("date", "Дата", "date", item?.date || defaultDate || "", true)}
        ${field("time", "Час", "time", item?.time || "")}
        ${field("title", "Запис", "text", item?.title || "", true)}
        ${field("auditor", "Одитор/отговорник", "text", item?.auditor || "")}
        <div class="form-row full">
          <span class="form-label">Категория / цвят</span>
          <div class="category-choice-grid">
            ${categoryChoice("", "Без категория", "yellow", item?.category || "")}
            ${categoryChoice("certification", "Сертификация", "blue", item?.category)}
            ${categoryChoice("consulting", "Консултации", "green", item?.category)}
            ${categoryChoice("occupational_medicine", "Служба Трудова Медицина", "red", item?.category)}
          </div>
        </div>
        <div class="form-row">
          <label for="status">Статус</label>
          <select id="status" name="status">
            ${auditStatusOptions(item?.status || "upcoming")}
          </select>
        </div>
        <div class="form-row">
          <label for="priority">Приоритет</label>
          <select id="priority" name="priority">
            ${option("low", "Нисък", item?.priority)}
            ${option("normal", "Нормален", item?.priority || "normal")}
            ${option("high", "Висок", item?.priority)}
          </select>
        </div>
        ${field("reminderDays", "Напомняне дни преди", "number", item?.reminderDays || 7, true)}
        <div class="form-row full">
          <label for="notes">Бележки</label>
          <textarea id="notes" name="notes" rows="3">${escapeHtml(item?.notes || "")}</textarea>
        </div>
        <div class="form-row full">
          <label for="checklist">Checklist задачи</label>
          <textarea id="checklist" name="checklist" rows="5" placeholder="pending | Проверка на документи | Георги | 2026-08-02&#10;in_progress | Потвърждение на час | Екатерина | 2026-08-03&#10;done | Изпратен протокол | Админ | 2026-08-04">${escapeHtml(formatChecklistForForm(item?.checklist || []))}</textarea>
        </div>
      </div>
      ${formActions()}
    </form>
  `;
}

function paymentForm(companyId, item) {
  return `
    <form data-form="payment">
      <input type="hidden" name="id" value="${escapeAttr(item?.id || "")}" />
      <div class="form-grid">
        <div class="form-row">
          <label for="companyId">Фирма</label>
          <select id="companyId" name="companyId" required>${companyOptions(item?.companyId || companyId)}</select>
        </div>
        ${field("invoice", "Фактура", "text", item?.invoice || "", true)}
        ${field("amount", "Сума", "number", item?.amount || "", true)}
        ${field("dueDate", "Падеж", "date", item?.dueDate || "", true)}
        ${field("paidDate", "Дата на плащане", "date", item?.paidDate || "")}
        <div class="form-row">
          <label for="status">Статус</label>
          <select id="status" name="status">
            ${option("pending", "Очаква плащане", item?.status)}
            ${option("paid", "Платено", item?.status)}
            ${option("overdue", "Просрочено", item?.status)}
          </select>
        </div>
      </div>
      ${formActions()}
    </form>
  `;
}

function documentForm(companyId, item) {
  return `
    <form data-form="document">
      <input type="hidden" name="id" value="${escapeAttr(item?.id || "")}" />
      <div class="form-grid">
        <div class="form-row">
          <label for="companyId">Фирма</label>
          <select id="companyId" name="companyId" required>${companyOptions(item?.companyId || companyId)}</select>
        </div>
        ${field("kind", "Тип документ", "text", item?.kind || "Одитен документ", true)}
        <div class="form-row full">
          <label for="doc-file">Файл</label>
          <input id="doc-file" name="file" type="file" />
        </div>
        ${field("name", "Име на документа", "text", item?.name || "", true, "doc-name")}
        ${field("megaUrl", "Mega линк към файла", "url", item?.megaUrl || "")}
        ${field("createdAt", "Дата", "date", item?.createdAt || new Date().toISOString().slice(0, 10), true)}
        <label class="check-row full">
          <input type="checkbox" name="queueMegaUpload" value="yes" ${item?.uploadStatus === "queued" ? "checked" : ""} />
          <span>Добави в опашка за качване към Mega</span>
        </label>
      </div>
      ${formActions("Запази документ")}
    </form>
  `;
}

function megaForm(companyId) {
  const company = state.companies.find((item) => item.id === companyId);
  return `
    <form data-form="mega">
      <input type="hidden" name="companyId" value="${escapeAttr(companyId)}" />
      <div class="form-row">
        <label for="megaUrl">Mega папка</label>
        <input id="megaUrl" name="megaUrl" type="url" value="${escapeAttr(company?.megaUrl || "")}" required placeholder="https://mega.nz/folder/..." />
      </div>
      ${formActions("Запази Mega линк")}
    </form>
  `;
}

function changePasswordForm() {
  return `
    <form data-form="changePassword">
      <div class="form-row">
        <label for="currentPassword">Стара парола</label>
        <input id="currentPassword" name="currentPassword" type="password" autocomplete="current-password" required />
      </div>
      <div class="form-row">
        <label for="newPassword">Нова парола</label>
        <input id="newPassword" name="newPassword" type="password" minlength="4" autocomplete="new-password" required />
      </div>
      <div class="form-row">
        <label for="confirmPassword">Повтори новата парола</label>
        <input id="confirmPassword" name="confirmPassword" type="password" minlength="4" autocomplete="new-password" required />
      </div>
      <p class="form-note">Паролата се сменя за текущия потребител: ${escapeHtml(currentUser())}</p>
      ${formActions("Смени парола")}
    </form>
  `;
}

function option(value, label, selected) {
  return `<option value="${value}" ${selected === value ? "selected" : ""}>${label}</option>`;
}

function categoryChoice(value, label, color, selected) {
  return `
    <label class="category-choice ${color}">
      <input type="radio" name="category" value="${escapeAttr(value)}" ${selected === value ? "checked" : ""} />
      <i aria-hidden="true"></i>
      <span>${escapeHtml(label)}</span>
    </label>
  `;
}

function field(name, label, type, value = "", required = false, elementId = name) {
  return `
    <div class="form-row">
      <label for="${elementId}">${label}</label>
      <input id="${elementId}" name="${name}" type="${type}" value="${escapeAttr(value)}" ${required ? "required" : ""} />
    </div>
  `;
}

function formActions(label = "Запази") {
  return `
    <div class="form-actions">
      <button class="btn primary" type="submit">${label}</button>
      <button class="btn ghost" type="button" data-action="close-modal-button">Отказ</button>
    </div>
  `;
}

async function handleForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  const kind = form.dataset.form;
  const isEdit = Boolean(data.id);

  try {
    if (kind === "company") {
      const item = isEdit ? findItem("company", data.id) : { id: id("c") };
      const standardNames = formData.getAll("standardName");
      const standardColors = formData.getAll("standardColor");
      const standards = standardNames.map((name, index) => ({ name: String(name).trim(), color: standardColors[index] || "blue" })).filter((standard) => standard.name);
      Object.assign(item, stamp({ ...item, name: data.name, bulstat: data.bulstat, contact: data.contact, phone: data.phone, email: data.email, activities: formData.getAll("activities"), standards, megaUrl: data.megaUrl, status: data.status, notes: data.notes }, !isEdit));
      if (supabaseClient && supabaseAuthUser) {
        const payload = companyPayload(item);
        const saved = isEdit
          ? await remoteUpdate("companies", item.id, payload)
          : await remoteInsert("companies", { ...payload, created_by: supabaseAuthUser.id });
        Object.assign(item, mapCompany(saved));
      }
      if (!isEdit) state.companies.push(item);
      addLog(`${isEdit ? "Редактира" : "Добави"} фирма: ${data.name}`, "Фирма", item.id);
    }

    if (kind === "audit") {
      const item = isEdit ? findItem("audit", data.id) : { id: id("a") };
      Object.assign(
        item,
        stamp(
          {
            ...item,
            companyId: data.companyId,
            date: data.date,
            time: data.time,
            type: data.type,
            auditor: data.auditor,
            status: data.status,
            priority: data.priority,
            reminderDays: Number(data.reminderDays || 7),
            reminderSent: false,
            notes: data.notes,
            checklist: parseChecklist(data.checklist)
          },
          !isEdit
        )
      );
      if (supabaseClient && supabaseAuthUser) {
        const payload = auditPayload(item);
        const saved = isEdit
          ? await remoteUpdate("audits", item.id, payload)
          : await remoteInsert("audits", { ...payload, created_by: supabaseAuthUser.id });
        await syncAuditTasks(saved.id, item.checklist);
        Object.assign(item, mapAudit(saved, item.checklist.map((task) => ({ ...taskPayload(task, saved.id), id: task.id }))));
      }
      if (!isEdit) state.audits.push(item);
      addLog(`${isEdit ? "Редактира" : "Добави"} одит: ${companyName(data.companyId)}`, "Одит", item.id);
    }

    if (kind === "calendarEvent") {
      const item = isEdit ? findItem("calendarEvent", data.id) : { id: id("ce") };
      Object.assign(
        item,
        stamp(
          {
            ...item,
            calendarType: data.calendarType,
            calendarName: data.calendarType === "auditors" ? "Одитори" : "Планирани дейности",
            date: data.date,
            time: data.time,
            title: data.title,
            auditor: data.auditor,
            category: data.category || "",
            color: calendarEventColor(data.calendarType, data.category, data.auditor),
            status: data.status,
            priority: data.priority,
            reminderDays: Number(data.reminderDays || 7),
            reminderSent: false,
            sourceSheet: item.sourceSheet || "",
            sourceCell: item.sourceCell || "",
            notes: data.notes,
            checklist: parseChecklist(data.checklist)
          },
          !isEdit
        )
      );
      if (supabaseClient && supabaseAuthUser) {
        const payload = calendarEventPayload(item);
        const saved = isEdit
          ? await remoteUpdate("calendar_events", item.id, payload)
          : await remoteInsert("calendar_events", { ...payload, created_by: supabaseAuthUser.id });
        Object.assign(item, mapCalendarEvent(saved));
      }
      if (!isEdit) state.calendarEvents.push(item);
      selectedCalendarType = item.calendarType;
      addLog(`${isEdit ? "Редактира" : "Добави"} календарен запис: ${data.title}`, item.calendarName, item.id);
    }

    if (kind === "payment") {
      const item = isEdit ? findItem("payment", data.id) : { id: id("p") };
      Object.assign(item, stamp({ ...item, companyId: data.companyId, invoice: data.invoice, amount: Number(data.amount), dueDate: data.dueDate, paidDate: data.paidDate, status: data.status }, !isEdit));
      if (supabaseClient && supabaseAuthUser) {
        const payload = paymentPayload(item);
        const saved = isEdit
          ? await remoteUpdate("payments", item.id, payload)
          : await remoteInsert("payments", { ...payload, created_by: supabaseAuthUser.id });
        Object.assign(item, mapPayment(saved));
      }
      if (!isEdit) state.payments.push(item);
      addLog(`${isEdit ? "Редактира" : "Добави"} плащане: ${data.invoice}`, "Плащане", item.id);
    }

    if (kind === "document") {
      const item = isEdit ? findItem("document", data.id) : { id: id("d") };
      Object.assign(
        item,
        stamp(
          {
            ...item,
            companyId: data.companyId,
            name: data.name,
            kind: data.kind,
            source: data.megaUrl ? "Mega" : "Локален запис",
            megaUrl: data.megaUrl,
            uploadStatus: data.queueMegaUpload === "yes" && !data.megaUrl ? "queued" : data.megaUrl ? "uploaded" : "local",
            createdAt: data.createdAt
          },
          !isEdit
        )
      );
      if (supabaseClient && supabaseAuthUser) {
        const payload = documentPayload(item);
        const saved = isEdit
          ? await remoteUpdate("documents", item.id, payload)
          : await remoteInsert("documents", { ...payload, created_by: supabaseAuthUser.id });
        Object.assign(item, mapDocument(saved));
      }
      if (!isEdit) state.documents.push(item);
      addLog(`${isEdit ? "Редактира" : "Добави"} документ: ${data.name}`, "Документ", item.id);
    }

    if (kind === "mega") {
      const company = state.companies.find((item) => item.id === data.companyId);
      if (company) {
        company.megaUrl = data.megaUrl;
        stamp(company);
        if (supabaseClient && supabaseAuthUser) {
          const saved = await remoteUpdate("companies", company.id, companyPayload(company));
          Object.assign(company, mapCompany(saved));
        }
        addLog(`Промени Mega папка: ${company.name}`, "Фирма", company.id);
      }
    }

    if (kind === "changePassword") {
      const user = state.users.find((item) => item.name === currentUser());
      if (data.newPassword !== data.confirmPassword) {
        alert("Новата парола и повторението не съвпадат.");
        return;
      }
      if (supabaseClient && supabaseAuthUser) {
        const current = userByName(currentUser());
        const verify = await supabaseClient.auth.signInWithPassword({
          email: current.email,
          password: data.currentPassword
        });
        if (verify.error) {
          alert("Старата парола не е вярна.");
          return;
        }
        const { error } = await supabaseClient.auth.updateUser({ password: data.newPassword });
        if (error) throw error;
      } else {
        alert("За смяна на парола е необходима активна Supabase сесия.");
        return;
      }
      user.lastSeen = nowIso();
      addLog("Смени своята парола", "Потребител", user.id);
    }

    saveState();
    closeModal();
    render();
  } catch (error) {
    alert(`Supabase записът не мина: ${error.message}`);
  }
}

async function updateStatus(kind, itemId, status) {
  const item = findItem(kind === "audit" ? "audit" : "payment", itemId);
  if (!item) return;
  item.status = status;
  if (kind === "payment" && status === "paid" && !item.paidDate) item.paidDate = new Date().toISOString().slice(0, 10);
  stamp(item);
  try {
    if (supabaseClient && supabaseAuthUser) {
      if (kind === "audit") await remoteUpdate("audits", item.id, auditPayload(item));
      if (kind === "payment") await remoteUpdate("payments", item.id, paymentPayload(item));
    }
    addLog(`Промени статус на ${kind === "audit" ? "одит" : "плащане"}: ${status}`, kind === "audit" ? "Одит" : "Плащане", item.id);
    saveState();
    render();
  } catch (error) {
    alert(`Supabase статусът не се записа: ${error.message}`);
  }
}

async function updateCalendarEventStatus(itemId, status) {
  const item = findItem("calendarEvent", itemId);
  if (!item) return;
  item.status = status;
  stamp(item);
  try {
    if (supabaseClient && supabaseAuthUser) await remoteUpdate("calendar_events", item.id, calendarEventPayload(item));
    addLog(`Промени статус на календарен запис: ${status}`, item.calendarName, item.id);
    saveState();
    render();
  } catch (error) {
    alert(`Supabase статусът не се записа: ${error.message}`);
  }
}

async function deleteCalendarEvent(itemId) {
  if (!canDelete()) {
    alert("Само Админ може да трие записи.");
    return;
  }
  const item = findItem("calendarEvent", itemId);
  if (!item) return;
  if (!confirm("Сигурни ли сте, че искате да изтриете календарния запис? Историята на промяната ще остане.")) return;
  try {
    if (supabaseClient && supabaseAuthUser) await remoteDelete("calendar_events", itemId);
    state.calendarEvents = state.calendarEvents.filter((event) => event.id !== itemId);
    addLog(`Изтри календарен запис: ${item.title}`, item.calendarName, item.id);
    saveState();
    render();
  } catch (error) {
    alert(`Supabase изтриването не мина: ${error.message}`);
  }
}

async function deleteItem(kind, itemId) {
  if (!canDelete()) {
    alert("Само Админ може да трие записи.");
    return;
  }
  const labels = { company: "фирмата", audit: "одита", payment: "плащането", document: "документа" };
  if (!confirm(`Сигурни ли сте, че искате да изтриете ${labels[kind]}? Историята на промяната ще остане.`)) return;
  const lists = { company: state.companies, audit: state.audits, payment: state.payments, document: state.documents };
  const item = findItem(kind, itemId);
  try {
    if (supabaseClient && supabaseAuthUser) {
      const table = { company: "companies", audit: "audits", payment: "payments", document: "documents" }[kind];
      await remoteDelete(table, itemId);
    }
    const index = lists[kind].findIndex((entry) => entry.id === itemId);
    if (index >= 0) lists[kind].splice(index, 1);
    if (kind === "company") {
      state.audits = state.audits.filter((audit) => audit.companyId !== itemId);
      state.payments = state.payments.filter((payment) => payment.companyId !== itemId);
      state.documents = state.documents.filter((doc) => doc.companyId !== itemId);
    }
    addLog(`Изтри ${labels[kind]}: ${item?.name || item?.invoice || item?.type || itemId}`, labels[kind], itemId);
    saveState();
    render();
  } catch (error) {
    alert(`Supabase изтриването не мина: ${error.message}`);
  }
}

async function duplicateAudit(itemId) {
  const audit = findItem("audit", itemId);
  if (!audit) return;
  const copy = stamp({ ...audit, id: id("a"), date: audit.date, status: "upcoming", notes: `${audit.notes || ""} (копие)` }, true);
  try {
    if (supabaseClient && supabaseAuthUser) {
      const saved = await remoteInsert("audits", { ...auditPayload(copy), created_by: supabaseAuthUser.id });
      await syncAuditTasks(saved.id, copy.checklist);
      Object.assign(copy, mapAudit(saved, copy.checklist.map((task) => ({ ...taskPayload(task, saved.id), id: task.id }))));
    }
    state.audits.push(copy);
    addLog(`Дублира одит: ${companyName(copy.companyId)}`, "Одит", copy.id);
    saveState();
    render();
  } catch (error) {
    alert(`Supabase дублирането не мина: ${error.message}`);
  }
}

async function markReminderSent(itemId) {
  const audit = findItem("audit", itemId);
  if (!audit) return;
  audit.reminderSent = true;
  stamp(audit);
  try {
    if (supabaseClient && supabaseAuthUser) await remoteUpdate("audits", audit.id, auditPayload(audit));
    addLog(`Маркира напомняне като изпратено: ${companyName(audit.companyId)}`, "Одит", audit.id);
    saveState();
    render();
  } catch (error) {
    alert(`Supabase напомнянето не се записа: ${error.message}`);
  }
}

async function markMegaUploaded(itemId) {
  const doc = findItem("document", itemId);
  if (!doc) return;
  doc.uploadStatus = "uploaded";
  doc.source = "Mega";
  stamp(doc);
  try {
    if (supabaseClient && supabaseAuthUser) await remoteUpdate("documents", doc.id, documentPayload(doc));
    addLog(`Маркира документ като качен към Mega: ${doc.name}`, "Документ", doc.id);
    saveState();
    render();
  } catch (error) {
    alert(`Supabase Mega статусът не се записа: ${error.message}`);
  }
}

function exportCsv(kind) {
  const rows = {
    company: filteredCompanies().map((c) => [c.name, (c.activities || []).map(companyActivityLabel).join("; "), (c.standards || []).map((s) => s.name).join("; "), c.bulstat, [c.email, c.phone].filter(Boolean).join("; "), c.status === "active" ? "Активен" : "Неактивен"]),
    payment: state.payments.map((p) => [companyName(p.companyId), p.invoice, p.amount, p.dueDate, p.paidDate, p.status]),
    document: state.documents.map((d) => [companyName(d.companyId), d.name, d.kind, d.createdAt, d.megaUrl]),
    audits: filteredAudits().map((a) => [companyName(a.companyId), a.date, a.time, a.type, a.auditor, a.status, a.priority]),
    calendarEvents: filteredCalendarEvents().map((event) => [event.calendarName, event.date, event.time, event.title, event.auditor, event.status, event.priority, event.sourceSheet, event.sourceCell])
  }[kind];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${kind}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  addLog(`Експортира CSV: ${kind}`, "Експорт", kind);
  saveState();
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value = "") {
  return escapeHtml(value);
}

render();
