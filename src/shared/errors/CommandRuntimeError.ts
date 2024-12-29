export default class CommandRuntimeError extends Error {
  constructor(message: string) {
    super(message);
  }
}
