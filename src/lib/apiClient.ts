import { ofetch } from "ofetch";

//Change the BASE_URL to use the local proxy path. This ensures the browser only talks to hemacue-frontend.vercel.app, making the cookies first-party
const BASE_URL = "/api/v1";

const apiClient = ofetch.create({
  baseURL: BASE_URL,
  credentials: "include",
  onResponseError({ response }) {
    throw response._data ?? response;
  },
});

export default apiClient;
