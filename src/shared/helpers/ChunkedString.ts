/**
 * A class that helps to split a string into chunks of a maximum length
 *
 * @example
 * ```ts
 * const chunked = new ChunkedString(15); // max length of 15 characters
 * const text = "Hello, world!"; // 12 characters
 * chunked.addLine(text);
 * chunked.addLine(text);
 * console.log(chunked.get()); // ["Hello, world!", "Hello, world!"]
 * ```
 */
export class ChunkedString {
  private chunks: string[] = [];

  constructor(private readonly maxLength: number) {}

  public addLine(str: string) {
    if (
      !this.lastChunk() ||
      this.lastChunk()!.length + str.length >= this.maxLength
    ) {
      this.chunks.push(str);
    } else {
      this.chunks[this.chunks.length - 1] += `\n${str}`;
    }
  }

  public lastChunk() {
    return this.chunks[this.chunks.length - 1];
  }

  public get() {
    return this.chunks;
  }
}
