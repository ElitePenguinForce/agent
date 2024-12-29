/**
 * Safely calls a function and logs any errors that occur
 *
 * @param fn The function to call
 * @param args The arguments to pass to the function
 * @returns The result of the function call
 */
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
