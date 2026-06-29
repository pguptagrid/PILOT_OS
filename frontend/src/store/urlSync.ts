export const syncUrlFromState = (
  page: string,
  sessionId: string | null,
  userId: number | undefined,
  talkiniaSubRoute?: string
) => {
  if (typeof window === "undefined") return;
  let path = "/";
  if (page === "landing") {
    path = "/";
  } else if (page === "profile") {
    path = `/profile/${userId || "me"}`;
  } else if (page === "settings") {
    path = "/settings";
  } else if (page === "meetings") {
    const sub = talkiniaSubRoute || "/";
    path = `/meetings${sub === "/" ? "" : sub}`;
  } else if (page === "chat") {
    path = "/chat";
  } else if (page === "guideline") {
    path = "/guideline";
  } else if (["ppt", "care", "email", "dashboard"].includes(page)) {
    const prefix = page === "dashboard" ? "dashboard" : page;
    path = sessionId ? `/${prefix}/${sessionId}` : `/${prefix}`;
  } else {
    path = `/${page}`;
  }
  
  if (window.location.pathname !== path) {
    window.history.pushState(null, "", path);
  }
};
