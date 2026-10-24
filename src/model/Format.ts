export class Format {
  static number(value: number): string {
    return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(10)));
  }

  static xml(value: string): string {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  static text(value: string): string {
    return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  }
}
