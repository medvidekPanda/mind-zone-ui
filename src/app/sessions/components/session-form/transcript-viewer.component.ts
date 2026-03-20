import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";

import { Transcript, TranscriptSegment } from "../../../shared/interfaces/session.interface";

const SPEAKER_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

@Component({
  selector: "app-transcript-viewer",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (parsedTranscript(); as t) {
      <div class="flex items-center gap-3 mb-4 text-xs text-surface-400">
        <span>Jazyk: <strong class="text-surface-600">{{ t.language }}</strong></span>
        <span>Délka: <strong class="text-surface-600">{{ formatTime(t.duration_seconds) }}</strong></span>
      </div>

      <div class="flex flex-col gap-3">
        @for (segment of t.segments; track segment.start) {
          <div class="flex gap-3">
            <div class="shrink-0 w-24 text-right pt-1">
              <span class="text-xs font-semibold block" [style.color]="speakerColor(segment.speaker)">
                {{ segment.speaker }}
              </span>
              <span class="text-xs text-surface-400 block">{{ formatTime(segment.start) }}</span>
            </div>
            <div
              class="flex-1 rounded-lg px-3 py-2 text-sm leading-relaxed border"
              [style.border-color]="speakerColor(segment.speaker) + '30'"
              [style.background-color]="speakerColor(segment.speaker) + '08'"
            >
              {{ segment.text }}
            </div>
          </div>
        }
      </div>
    } @else {
      <p class="text-sm text-surface-400 italic">Transkript nelze zobrazit.</p>
    }
  `,
})
export class TranscriptViewerComponent {
  readonly transcript = input<string | null>(null);

  private readonly speakerColorMap = new Map<string, string>();

  protected readonly parsedTranscript = computed<Transcript | null>(() => {
    const raw = this.transcript();
    if (!raw) return null;

    try {
      return JSON.parse(raw) as Transcript;
    } catch {
      return null;
    }
  });

  protected speakerColor(speaker: string): string {
    let color = this.speakerColorMap.get(speaker);
    if (!color) {
      color = SPEAKER_COLORS[this.speakerColorMap.size % SPEAKER_COLORS.length];
      this.speakerColorMap.set(speaker, color);
    }
    return color;
  }

  protected formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  }
}
