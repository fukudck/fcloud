export class CopyNameService {
  static generate(name: string): string {
    const dot = name.lastIndexOf(".")
    if (dot === -1) {
      return `${name} (copy)`
    }
    const base = name.slice(0, dot)
    const ext = name.slice(dot)
    return `${base} (copy)${ext}`
  }
}
