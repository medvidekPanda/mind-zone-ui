import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";

import { Transcript } from "../../../shared/interfaces/session.interface";

const SPEAKER_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

@Component({
  selector: "app-session-transcript-viewer",
  templateUrl: "./session-transcript-viewer.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "flex flex-1 flex-col overflow-y-auto" },
})
export class SessionTranscriptViewerComponent {
  readonly transcript = input<string | null>(null);

  protected readonly parsedTranscript = computed<Transcript | null>(() => {
    const raw = this.transcript();
    if (!raw) return null;

    try {
      return JSON.parse(raw) as Transcript;
    } catch {
      return null;
    }
  });

  protected readonly speakerColors = computed(() => {
    const transcript = this.parsedTranscript();
    if (!transcript) return new Map<string, string>();

    const speakers = [...new Set(transcript.segments.map((speaker) => speaker.speaker))];
    return new Map(speakers.map((speaker, index) => [speaker, SPEAKER_COLORS[index % SPEAKER_COLORS.length]]));
  });

  protected formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${String(secs).padStart(2, "0")}`;
  }
}
