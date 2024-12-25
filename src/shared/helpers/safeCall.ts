// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function safeCall<T extends (...args: any[]) => any>(
  fn: T,
  ...args: Parameters<T>
) {
  try {
    return fn(...args);
  } catch (error) {
    console.error(error);
  }
}
