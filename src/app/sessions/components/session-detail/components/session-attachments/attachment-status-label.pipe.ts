import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "attachmentStatusLabel", standalone: true })
export class AttachmentStatusLabelPipe implements PipeTransform {
  transform(status?: string): string {
    switch (status) {
      case "ready":
        return "Připraveno";
      case "transcribing":
        return "Přepisuje se...";
      case "analyzing":
        return "Analyzuje se...";
      case "error":
        return "Chyba zpracování";
      default:
        return "Čeká na zpracování";
    }
  }
}
