import { computed, inject } from "@angular/core";

import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from "@ngrx/signals";

import { CALENDAR_GRID_HEIGHT_PX } from "../constants/calendar.constants";
import type { CalendarBlock, WeekDay } from "../interfaces/calendar.interface";
import { type Client, ClientGender, ClientStatus } from "../interfaces/client.interface";
import {
  calendarEventHeight,
  composeDayTime,
  snapToGrid,
  startOfWeek,
  stripTime,
  toDateKey,
} from "../utils/calendar.utils";
import { ClientStore } from "./client.store";

const MOCK_CLIENTS: Client[] = [
  {
    id: "c-demo-1",
    firstName: "Jan",
    lastName: "Novák",
    gender: ClientGender.MALE,
    birthDate: "1990-01-15",
    status: ClientStatus.ACTIVE,
    email: "jan.novak@example.com",
    createdAt: "1970-01-01T00:00:00.000Z",
    updatedAt: "1970-01-01T00:00:00.000Z",
  },
  {
    id: "c-demo-2",
    firstName: "Marie",
    lastName: "Svobodová",
    gender: ClientGender.FEMALE,
    birthDate: "1985-06-22",
    status: ClientStatus.ACTIVE,
    email: "marie.s@example.com",
    createdAt: "1970-01-01T00:00:00.000Z",
    updatedAt: "1970-01-01T00:00:00.000Z",
  },
  {
    id: "c-demo-3",
    firstName: "Petr",
    lastName: "Dvořák",
    gender: ClientGender.MALE,
    birthDate: "1992-11-03",
    status: ClientStatus.PENDING,
    email: "petr.dvorak@example.com",
    createdAt: "1970-01-01T00:00:00.000Z",
    updatedAt: "1970-01-01T00:00:00.000Z",
  },
];

type CalendarPageState = {
  blocks: CalendarBlock[];
  draggedBlock: CalendarBlock | null;
  /** Distance from block top to pointer at drag start (px), for drop placement. */
  dragGrabOffsetYPx: number;
  mockClients: Client[];
  weekAnchorMs: number;
};

const initialState = (): CalendarPageState => ({
  blocks: [],
  draggedBlock: null,
  dragGrabOffsetYPx: 0,
  mockClients: MOCK_CLIENTS,
  weekAnchorMs: startOfWeek(new Date()).getTime(),
});

export const CalendarPageStore = signalStore(
  withState(initialState()),

  withComputed(({ mockClients, weekAnchorMs }) => ({
    clientOptions: computed(() =>
      mockClients().map((client) => ({
        label: `${client.firstName} ${client.lastName}`,
        value: client.id,
      })),
    ),

    weekDays: computed((): WeekDay[] => {
      const anchor = new Date(weekAnchorMs());
      const today = stripTime(new Date()).getTime();
      return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(anchor);
        date.setDate(anchor.getDate() + index);
        return {
          date,
          dayNum: date.getDate(),
          isoKey: toDateKey(date),
          isToday: stripTime(date).getTime() === today,
          weekdayShort: new Intl.DateTimeFormat("cs-CZ", { weekday: "short" }).format(date),
        };
      });
    }),

    weekTitle: computed(() => {
      const anchor = new Date(weekAnchorMs());
      const weekEnd = new Date(anchor);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const sameMonth = anchor.getMonth() === weekEnd.getMonth();
      const monthFormatter = new Intl.DateTimeFormat("cs-CZ", { month: "long" });
      const year = anchor.getFullYear();

      if (sameMonth) {
        return `${monthFormatter.format(anchor)} ${year}`;
      }

      return `${monthFormatter.format(anchor)} – ${monthFormatter.format(weekEnd)} ${year}`;
    }),
  })),

  withMethods((store, clientStore = inject(ClientStore)) => ({
    addConsultationBlock: (clientId: string, startMs: number, durationMin: number): void => {
      const endMs = startMs + durationMin * 60_000;
      const newBlock: CalendarBlock = {
        id: `mock-${crypto.randomUUID()}`,
        clientId,
        startMs,
        endMs,
      };

      patchState(store, { blocks: [...store.blocks(), newBlock] });
    },

    applyDrop: (day: WeekDay, yInColumn: number): void => {
      const dragged = store.draggedBlock();
      if (!dragged) return;

      const blockHeightPx = calendarEventHeight(dragged);
      const maxTopY = Math.max(0, CALENDAR_GRID_HEIGHT_PX - blockHeightPx);
      const topY = Math.max(0, Math.min(yInColumn - store.dragGrabOffsetYPx(), maxTopY));

      const startMs = snapToGrid(composeDayTime(day.date, topY));

      const duration = dragged.endMs - dragged.startMs;
      const endMs = startMs + duration;

      patchState(store, {
        blocks: store.blocks().map((block) => (block.id === dragged.id ? { ...block, startMs, endMs } : block)),
        draggedBlock: null,
        dragGrabOffsetYPx: 0,
      });
    },

    clearDraggedBlock: (): void => {
      patchState(store, { draggedBlock: null, dragGrabOffsetYPx: 0 });
    },

    formatSlotLabel: (ms: number): string =>
      new Intl.DateTimeFormat("cs-CZ", {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(ms)),

    goToday: (): void => {
      patchState(store, { weekAnchorMs: startOfWeek(new Date()).getTime() });
    },

    navigateWeek: (deltaWeeks: number): void => {
      const next = new Date(store.weekAnchorMs());
      next.setDate(next.getDate() + deltaWeeks * 7);
      patchState(store, { weekAnchorMs: startOfWeek(next).getTime() });
    },

    resolveClientLabel: (clientId: string): string => {
      const fromList = clientStore.clients().find((item) => item.id === clientId);
      if (fromList) return `${fromList.firstName} ${fromList.lastName}`;

      const fromMock = store.mockClients().find((item) => item.id === clientId);
      if (fromMock) return `${fromMock.firstName} ${fromMock.lastName}`;

      return "Neznámý klient";
    },

    seedMockBlocks: (): void => {
      const monday = stripTime(new Date(store.weekAnchorMs()));
      const blocks: CalendarBlock[] = [
        {
          id: "mock-1",
          clientId: "c-demo-1",
          startMs: monday.getTime() + (9 * 60 + 0) * 60_000,
          endMs: monday.getTime() + (10 * 60 + 0) * 60_000,
        },
        {
          id: "mock-2",
          clientId: "c-demo-2",
          startMs: monday.getTime() + (14 * 60 + 30) * 60_000,
          endMs: monday.getTime() + (15 * 60 + 45) * 60_000,
        },
        {
          id: "mock-3",
          clientId: "c-demo-3",
          startMs: monday.getTime() + 86400000 + (10 * 60 + 0) * 60_000,
          endMs: monday.getTime() + 86400000 + (11 * 60 + 0) * 60_000,
        },
      ];
      patchState(store, { blocks });
    },

    startDragging: (block: CalendarBlock, grabOffsetYPx: number): void => {
      patchState(store, {
        draggedBlock: { ...block },
        dragGrabOffsetYPx: Math.max(0, grabOffsetYPx),
      });
    },
  })),

  withHooks({
    onInit: (store) => {
      store.seedMockBlocks();
    },
  }),
);
