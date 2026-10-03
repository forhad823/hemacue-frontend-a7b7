import { ofetch } from "ofetch";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const apiClient = ofetch.create({
  baseURL: BASE_URL,
  credentials: "include",
  onResponseError({ response }) {
    // Optional: normalize thrown errors. ofetch throws FetchError with .data = response body.
    throw response._data ?? response;
  },
});

export default apiClient;
