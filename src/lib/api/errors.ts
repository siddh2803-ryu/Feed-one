/**
 * RFC 7807 Problem Details Response Formatter
 */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  code?: string;
}

export function createProblemDetails(
  status: number,
  title: string,
  detail: string,
  code?: string
): ProblemDetails {
  return {
    type: "https://feedone.org/errors/" + (code ? code.toLowerCase() : "general"),
    title,
    status,
    detail,
    code
  };
}
