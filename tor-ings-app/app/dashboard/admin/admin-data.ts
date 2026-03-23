export type ReportMetric = {
  label: string;
  value: string;
  detail: string;
};

export type RequestBreakdown = {
  period: string;
  requests: number;
  cost: number;
};

export type AccountRecord = {
  id: string;
  name: string;
  role: string;
  department: string;
  status: "Active" | "Pending" | "Suspended";
  lastLogin: string;
};

export type ScheduleItem = {
  id: string;
  practical: string;
  room: string;
  date: string;
  time: string;
  lead: string;
  equipmentReady: "Ready" | "Pending" | "Review";
};

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  requestsThisMonth: number;
  accountStatus: "Active" | "Pending" | "Suspended";
};

export const reportMetrics: ReportMetric[] = [
  {
    label: "Item requests",
    value: "248",
    detail: "Total requests raised across current tracking period.",
  },
  {
    label: "Monthly cost",
    value: "GBP 5,420",
    detail: "Estimated spend for practical sessions this month.",
  },
  {
    label: "Average per practical",
    value: "GBP 338",
    detail: "Average fulfillment cost across scheduled practicals.",
  },
  {
    label: "Completion rate",
    value: "93%",
    detail: "Requests fulfilled without escalation or stock delay.",
  },
];

export const requestBreakdown: RequestBreakdown[] = [
  { period: "Today", requests: 14, cost: 310 },
  { period: "This week", requests: 58, cost: 1240 },
  { period: "This month", requests: 160, cost: 3540 },
  { period: "This year", requests: 248, cost: 5420 },
];

export const chartData = [
  { label: "Mon", value: 8 },
  { label: "Tue", value: 13 },
  { label: "Wed", value: 10 },
  { label: "Thu", value: 17 },
  { label: "Fri", value: 12 },
  { label: "Sat", value: 4 },
];

export const accountRecords: AccountRecord[] = [
  {
    id: "ACC-1001",
    name: "Amelia Carter",
    role: "TORS Admin",
    department: "Operations",
    status: "Active",
    lastLogin: "23 Mar 2026, 09:10",
  },
  {
    id: "ACC-1002",
    name: "Owen Hughes",
    role: "Lab Coordinator",
    department: "Simulation Suite",
    status: "Pending",
    lastLogin: "22 Mar 2026, 16:30",
  },
  {
    id: "ACC-1003",
    name: "Priya Shah",
    role: "Lecturer",
    department: "Clinical Skills",
    status: "Active",
    lastLogin: "23 Mar 2026, 08:05",
  },
  {
    id: "ACC-1004",
    name: "Jacob Reed",
    role: "Technician",
    department: "Stores",
    status: "Suspended",
    lastLogin: "17 Mar 2026, 11:52",
  },
];

export const scheduleItems: ScheduleItem[] = [
  {
    id: "SCH-301",
    practical: "Cardiology Practical",
    room: "Simulation Lab 1",
    date: "24 Mar 2026",
    time: "09:00 - 11:00",
    lead: "Dr. Priya Shah",
    equipmentReady: "Ready",
  },
  {
    id: "SCH-302",
    practical: "Emergency Response Demo",
    room: "Lab B",
    date: "24 Mar 2026",
    time: "13:00 - 15:00",
    lead: "Owen Hughes",
    equipmentReady: "Pending",
  },
  {
    id: "SCH-303",
    practical: "Respiratory Assessment",
    room: "Clinical Skills Suite",
    date: "25 Mar 2026",
    time: "10:00 - 12:30",
    lead: "Amelia Carter",
    equipmentReady: "Review",
  },
];

export const userRecords: UserRecord[] = [
  {
    id: "USR-2101",
    name: "Mia Thompson",
    email: "mia.thompson@shu.ac.uk",
    department: "Nursing",
    role: "Student Support",
    requestsThisMonth: 4,
    accountStatus: "Active",
  },
  {
    id: "USR-2102",
    name: "Ethan Walker",
    email: "ethan.walker@shu.ac.uk",
    department: "Paramedic Science",
    role: "Lecturer",
    requestsThisMonth: 11,
    accountStatus: "Active",
  },
  {
    id: "USR-2103",
    name: "Sophia Green",
    email: "sophia.green@shu.ac.uk",
    department: "Occupational Therapy",
    role: "Lab Assistant",
    requestsThisMonth: 6,
    accountStatus: "Pending",
  },
  {
    id: "USR-2104",
    name: "Noah Wilson",
    email: "noah.wilson@shu.ac.uk",
    department: "Physiotherapy",
    role: "Technician",
    requestsThisMonth: 2,
    accountStatus: "Suspended",
  },
  {
    id: "USR-2105",
    name: "Isla Roberts",
    email: "isla.roberts@shu.ac.uk",
    department: "Diagnostic Radiography",
    role: "Lecturer",
    requestsThisMonth: 8,
    accountStatus: "Active",
  },
];
