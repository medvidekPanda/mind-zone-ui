import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "attachmentStatusIcon", standalone: true })
export class AttachmentStatusIconPipe implements PipeTransform {
  transform(status?: string): string {
    switch (status) {
      case "ready":
        return "pi-check-circle";
      case "transcribing":
        return "pi-spin pi-spinner";
      case "analyzing":
        return "pi-spin pi-spinner";
      case "error":
        return "pi-exclamation-circle";
      default:
        return "pi-clock";
    }
  }
}
