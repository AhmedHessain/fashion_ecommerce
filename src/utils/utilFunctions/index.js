export const validateImage = (file, setWarning) => {
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];
  if (file.size > MAX_FILE_SIZE) {
    setWarning(`Image must be less than ${MAX_FILE_SIZE / (1024 * 1024)} MB`);
    return false;
  } else if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    setWarning("Only .jpg, .jpeg, or .png files are allowed");
    return false;
  } else {
    return true;
  }
};

const matchPath = (route, path) => {
  const routeSegments = route.split("/").filter(Boolean);
  const pathSegments = path.split("/").filter(Boolean);

  if (routeSegments.length !== pathSegments.length) {
    return false; // Different number of segments
  }

  return routeSegments.every((segment, index) => {
    return segment.startsWith(":") || segment === pathSegments[index];
  });
};

export const checkRoutes = (routes, path) => {
  return routes.some((route) => matchPath(route, path));
};
