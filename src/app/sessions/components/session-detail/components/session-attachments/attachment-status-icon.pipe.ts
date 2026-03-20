import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "attachmentStatusIcon" })
export class AttachmentStatusIconPipe implements PipeTransform {
  transform(status?: string): string {
    switch (status) {
      case "completed":
        return "pi-check-circle";
      case "processing":
        return "pi-spin pi-spinner";
      case "failed":
        return "pi-exclamation-circle";
      case "queued":
      case "pending":
      default:
        return "pi-clock";
    }
  }
}
