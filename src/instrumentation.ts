export async function register() {
  if (process.env.NODE_ENV !== "production") return;

  const noop = () => {};

  // Preserve errors, silence others server-side
  // eslint-disable-next-line no-console
  console.log = noop as typeof console.log;
  // eslint-disable-next-line no-console
  console.info = noop as typeof console.info;
  // eslint-disable-next-line no-console
  console.warn = noop as typeof console.warn;
  // eslint-disable-next-line no-console
  console.debug = noop as typeof console.debug;
  // eslint-disable-next-line no-console
  console.trace = noop as typeof console.trace;
}
