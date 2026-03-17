import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from "@angular/core";
import { FormField, form, readonly, required } from "@angular/forms/signals";

import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { DatePickerModule } from "primeng/datepicker";
import { InputTextModule } from "primeng/inputtext";
import { SelectModule } from "primeng/select";

import { FormDatepickerComponent } from "../../../shared/components/form-datepicker/form-datepicker.component";
import { FormSelectComponent } from "../../../shared/components/form-select/form-select.component";
import { Client, ClientGender, ClientPayload, ClientStatus } from "../../../shared/interfaces/client.interface";
import { ClientStore } from "../../../shared/store/client.store";

type ClientFormModel = Omit<Client, "id" | "createdAt" | "updatedAt" | "gender" | "status"> & {
  gender: ClientGender | null;
  status: ClientStatus | null;
};

@Component({
  selector: "app-client-form",
  imports: [
    ButtonModule,
    CardModule,
    FormField,
    FormDatepickerComponent,
    FormSelectComponent,
    InputTextModule,
    DatePickerModule,
    SelectModule,
  ],
  templateUrl: "./client-form.component.html",
  host: { class: "flex flex-col" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientFormComponent {
  private readonly clientStore = inject(ClientStore);

  private readonly clientModel = signal<ClientFormModel>({
    firstName: "",
    lastName: "",
    gender: null,
    birthDate: "",
    email: "",
    phone: "",
    status: null,
  });

  readonly clientDetail = computed(() => this.clientStore.client());
  readonly readonly = input<boolean>(false);
  readonly showActions = input<boolean>(false);

  readonly saved = output<void>();
  readonly cancelled = output<void>();

  protected readonly genderOptions: { label: string; value: ClientGender }[] = [
    { label: "Muž", value: ClientGender.MALE },
    { label: "Žena", value: ClientGender.FEMALE },
    { label: "Jiné", value: ClientGender.OTHER },
  ];

  protected readonly statusOptions: { label: string; value: ClientStatus }[] = [
    { label: "Aktivní", value: ClientStatus.ACTIVE },
    { label: "Neaktivní", value: ClientStatus.INACTIVE },
  ];

  protected readonly clientForm = form(this.clientModel, (schemaPath) => {
    required(schemaPath.firstName, { message: "Jméno je povinné" });
    required(schemaPath.lastName, { message: "Příjmení je povinné" });

    readonly(schemaPath.gender, this.readonly);
    readonly(schemaPath.status, this.readonly);
    readonly(schemaPath.birthDate, this.readonly);
    readonly(schemaPath.email, this.readonly);
    readonly(schemaPath.phone, this.readonly);
    readonly(schemaPath.firstName, this.readonly);
    readonly(schemaPath.lastName, this.readonly);
  });

  constructor() {
    effect(() => {
      const client = this.clientDetail();

      if (client?.id) {
        const { firstName, lastName, birthDate, email, phone, gender, status } = client;
        this.clientModel.set({
          firstName,
          lastName,
          birthDate,
          email,
          phone: phone ?? "",
          gender,
          status,
        });
      }
    });
  }

  protected save(): void {
    const f = this.clientForm();
    if (!f.valid()) return;

    const value = f.value() as ClientFormModel;
    if (value.gender === null || value.status === null) return;

    const payload: ClientPayload = {
      ...value,
      gender: value.gender,
      status: value.status,
    };

    const client = this.clientDetail();
    if (client?.id) {
      this.clientStore.updateClient({ id: client.id, payload });
    } else {
      this.clientStore.createClient(payload);
    }

    this.saved.emit();
  }

  protected cancel(): void {
    this.cancelled.emit();
  }
}
