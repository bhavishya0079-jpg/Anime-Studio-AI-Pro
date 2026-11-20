
// =====================================
// ANIME STUDIO AI PRO
// Central API Connection
// =====================================

export const API_BASE_URL =
  "https://anime-studio-ai-pro.onrender.com";

async function handleResponse(response) {
  if (!response.ok) {
    let message = `Server error: ${response.status}`;

    try {
      const data = await response.json();
      message =
        data.detail ||
        data.message ||
        message;
    } catch {
      // Keep the default error message.
    }

    throw new Error(message);
  }

  return response;
}

// Send JSON requests
export async function apiRequest(
  endpoint,
  method = "GET",
  body = null
) {
  const options = {
    method,
    headers: {
      Accept: "application/json"
    }
  };

  if (body !== null) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    options
  );

  await handleResponse(response);

  const contentType =
    response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response;
}

// Upload files
export async function uploadFile(
  endpoint,
  file
) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method: "POST",
      body: formData
    }
  );

  await handleResponse(response);

  const contentType =
    response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response;
}

// Download generated files
export async function downloadFile(
  endpoint,
  body
) {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }
  );

  await handleResponse(response);

  return response.blob();
}

// API endpoint collection
export const API = {
  health: () =>
    apiRequest("/api/health"),

  generateScript: (data) =>
    apiRequest("/api/scripts/generate", "POST", data),

  generateVoice: (data) =>
    downloadFile("/api/voice/generate", data),

  generateCharacterVoices: (data) =>
    apiRequest(
      "/api/character-voice/generate",
      "POST",
      data
    ),

  generateDubbing: (data) =>
    apiRequest("/api/dubbing/generate", "POST", data),

  generateVisuals: (data) =>
    apiRequest("/api/visuals/generate", "POST", data),

  renderVideo: (data) =>
    apiRequest("/api/video/render", "POST", data),

  mixAudio: (data) =>
    apiRequest("/api/audio/mix", "POST", data),

  generateSubtitles: (data) =>
    downloadFile("/api/subtitles/generate", data),

  syncSubtitles: (data) =>
    apiRequest("/api/subtitle-sync/sync", "POST", data),

  generateYoutubeMetadata: (data) =>
    apiRequest("/api/youtube/metadata", "POST", data),

  saveProject: (data) =>
    apiRequest("/api/projects/save", "POST", data),

  getProjectHistory: () =>
    apiRequest("/api/projects/history"),

  upload: (file) =>
    uploadFile("/api/uploads/", file)
};

// Check backend connection
export async function checkBackendConnection() {
  try {
    const result = await API.health();
    return {
      connected: true,
      data: result
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message
    };
  }
}
