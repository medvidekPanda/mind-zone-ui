import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "attachmentStatusLabel" })
export class AttachmentStatusLabelPipe implements PipeTransform {
  transform(status?: string): string {
    switch (status) {
      case "completed":
        return "Přepis dokončen";
      case "processing":
        return "Přepisuje se...";
      case "queued":
        return "Ve frontě...";
      case "failed":
        return "Chyba zpracování";
      case "pending":
      default:
        return "Čeká na zpracování";
    }
  }
}
