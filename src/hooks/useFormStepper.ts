import { useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Works with *partial* route tails like "screening/medical-history".
 * It finds the first tail that is a substring of the current pathname
 * and uses the segment in front of that tail as a stable “base”.
 */
export const useFormStepper = (orderedRoutes: string[]) => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  /** Detect which tail is inside the current path */
  const { index, basePath } = useMemo(() => {
    const currentPathname = pathname || "";
    for (let i = 0; i < orderedRoutes.length; i++) {
      const tail = orderedRoutes[i];
      const pos = currentPathname.indexOf(tail);
      if (pos !== -1) {
        return { index: i, basePath: currentPathname.slice(0, pos) };
      }
    }
    return { index: -1, basePath: "" };
  }, [pathname, orderedRoutes]);

  const hasPrevious = index > 0;
  const hasNext     = index > -1 && index < orderedRoutes.length - 1;
  const isLastForm  = index === orderedRoutes.length - 1;

  /** Preserve the existing query-string (`search`) on every move */
  const goPrevious = useCallback(() => {
    if (hasPrevious) navigate(basePath + orderedRoutes[index - 1] + search);
  }, [hasPrevious, index, basePath, orderedRoutes, search, navigate]);

  const goNext = useCallback(() => {
    if (hasNext) navigate(basePath + orderedRoutes[index + 1] + search);
  }, [hasNext, index, basePath, orderedRoutes, search, navigate]);

  return { hasPrevious, hasNext, isLastForm, goPrevious, goNext };
};
