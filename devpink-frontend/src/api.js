const BASE = "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

export async function apiPost(path, body, auth = false) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: auth ? authHeaders() : { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function apiGet(path, auth = false) {
  const res = await fetch(`${BASE}${path}`, {
    headers: auth ? authHeaders() : {},
  });
  return res.json();
}
