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
