import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";

import { Transcript } from "../../../shared/interfaces/session.interface";

const SPEAKER_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

@Component({
  selector: "app-transcript-viewer",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (parsedTranscript(); as t) {
      <div class="flex items-center gap-3 mb-4 text-xs text-surface-400">
        <span
          >Jazyk: <strong class="text-surface-600">{{ t.language }}</strong></span
        >
        <span
          >Délka: <strong class="text-surface-600">{{ formatTime(t.duration_seconds) }}</strong></span
        >
      </div>

      <div class="flex flex-col gap-3">
        @for (segment of t.segments; track segment.start) {
          <div class="flex gap-3">
            <div class="shrink-0 w-24 text-right pt-1">
              <span
                class="text-xs font-semibold block"
                [style.color]="speakerColors().get(segment.speaker) ?? '#888888'"
              >
                {{ segment.speaker }}
              </span>
              <span class="text-xs text-surface-400 block">{{ formatTime(segment.start) }}</span>
            </div>
            <div
              class="flex-1 rounded-lg px-3 py-2 text-sm leading-relaxed border"
              [style.border-color]="(speakerColors().get(segment.speaker) ?? '#888888') + '30'"
              [style.background-color]="(speakerColors().get(segment.speaker) ?? '#888888') + '08'"
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
    const t = this.parsedTranscript();
    if (!t) return new Map<string, string>();
    const speakers = [...new Set(t.segments.map((s) => s.speaker))];
    return new Map(speakers.map((s, i) => [s, SPEAKER_COLORS[i % SPEAKER_COLORS.length]]));
  });

  protected formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  }
}
