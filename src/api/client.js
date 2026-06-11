import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  withCredentials: true
});

export function getErrorMessage(error) {
  return error?.response?.data?.message || "Something went wrong. Please try again.";
}
