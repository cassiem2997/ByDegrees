import { TemperaturePreset } from "@/lib/types";

export const TEMP_TEMPLATE_KEY = "temp-core-v1";

export const DEFAULT_TEMPERATURE_PRESETS: TemperaturePreset[] = [
  { id: "11111111-1111-4111-8111-111111111111", templateKey: TEMP_TEMPLATE_KEY, label: "28°C+", minTemp: 28, maxTemp: null, sortOrder: 1 },
  { id: "22222222-2222-4222-8222-222222222222", templateKey: TEMP_TEMPLATE_KEY, label: "27~23°C", minTemp: 23, maxTemp: 27, sortOrder: 2 },
  { id: "33333333-3333-4333-8333-333333333333", templateKey: TEMP_TEMPLATE_KEY, label: "22~20°C", minTemp: 20, maxTemp: 22, sortOrder: 3 },
  { id: "44444444-4444-4444-8444-444444444444", templateKey: TEMP_TEMPLATE_KEY, label: "19~17°C", minTemp: 17, maxTemp: 19, sortOrder: 4 },
  { id: "55555555-5555-4555-8555-555555555555", templateKey: TEMP_TEMPLATE_KEY, label: "16~12°C", minTemp: 12, maxTemp: 16, sortOrder: 5 },
  { id: "66666666-6666-4666-8666-666666666666", templateKey: TEMP_TEMPLATE_KEY, label: "11~9°C", minTemp: 9, maxTemp: 11, sortOrder: 6 },
  { id: "77777777-7777-4777-8777-777777777777", templateKey: TEMP_TEMPLATE_KEY, label: "8~5°C", minTemp: 5, maxTemp: 8, sortOrder: 7 },
  { id: "88888888-8888-4888-8888-888888888888", templateKey: TEMP_TEMPLATE_KEY, label: "4°C-", minTemp: null, maxTemp: 4, sortOrder: 8 }
];
