import type { AppDataService } from "./contracts";
import { httpDataService } from "./adapters/http/httpDataService";
import { mockDataService } from "./adapters/mockDataService";

export type DataSource = "mock" | "api";

function readDataSource(): DataSource {
  const raw = import.meta.env.VITE_DATA_SOURCE?.trim().toLowerCase();

  if (!raw || raw === "mock") {
    return "mock";
  }
  if (raw === "api") {
    return "api";
  }

  console.warn(
    `Unknown VITE_DATA_SOURCE "${raw}". Falling back to "mock".`
  );
  return "mock";
}

export const DATA_SOURCE = readDataSource();

export const dataService: AppDataService =
  DATA_SOURCE === "api" ? httpDataService : mockDataService;

export type {
  AppDataService,
  CreateDayEventInput,
  CreateUserPayload,
  CreateUserResult,
  DaySchedulingHints,
  DaySchedulingHintsRequest,
  LoginResponse,
  UpdateDayEventInput,
} from "./contracts";
