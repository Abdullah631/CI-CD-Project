import { vi } from "vitest";

export const mockAxios = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  patch: vi.fn(),
  create: vi.fn(),
};

export const mockAxiosResponse = (data, status = 200) => ({
  status,
  data,
  statusText: "OK",
  headers: {},
  config: {},
});

export const mockAxiosError = (message = "Request failed", status = 400) => ({
  response: {
    status,
    data: {
      detail: message,
      error: message,
    },
    statusText: "Bad Request",
  },
  message,
  config: {},
});
