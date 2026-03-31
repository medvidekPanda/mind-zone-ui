import { ChangeDetectionStrategy, Component, computed, effect, inject, output, signal } from "@angular/core";
import { FormField, form, readonly, required } from "@angular/forms/signals";

import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { DatePickerModule } from "primeng/datepicker";
import { InputTextModule } from "primeng/inputtext";
import { SelectModule } from "primeng/select";

import { FormDatepickerComponent } from "../../../shared/components/form-datepicker/form-datepicker.component";
import { FormSelectComponent } from "../../../shared/components/form-select/form-select.component";
import { CLIENT_GENDER_OPTIONS, CLIENT_STATUS_OPTIONS } from "../../../shared/constants/client.constants";
import { Client, ClientGender, ClientPayload, ClientStatus } from "../../../shared/interfaces/client.interface";
import { ClientStore } from "../../../shared/store/client.store";

type ClientFormModel = Omit<Client, "id" | "createdAt" | "updatedAt" | "gender" | "status" | "phone"> & {
  gender: ClientGender | null;
  status: ClientStatus | null;
  phone: string;
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

  private readonly formReadonly = computed(() => !this.isEditing());

  readonly cancelled = output<void>();

  constructor() {
    this.syncFormWithClientDetail();
  }

  protected readonly clientDetail = computed(() => this.clientStore.client());

  protected readonly clientForm = form(this.clientModel, (schemaPath) => {
    required(schemaPath.firstName, { message: "Jméno je povinné" });
    required(schemaPath.lastName, { message: "Příjmení je povinné" });

    readonly(schemaPath.birthDate, this.formReadonly);
    readonly(schemaPath.email, this.formReadonly);
    readonly(schemaPath.firstName, this.formReadonly);
    readonly(schemaPath.gender, this.formReadonly);
    readonly(schemaPath.lastName, this.formReadonly);
    readonly(schemaPath.phone, this.formReadonly);
    readonly(schemaPath.status, this.formReadonly);
  });

  protected readonly genderOptions = CLIENT_GENDER_OPTIONS;
  protected readonly isEditing = computed(() => this.clientStore.isEditing() || !this.clientStore.client()?.id);
  protected readonly showActions = computed(() => this.isEditing());
  protected readonly statusOptions = CLIENT_STATUS_OPTIONS;

  protected cancel(): void {
    this.cancelled.emit();
  }

  protected save(): void {
    const currentForm = this.clientForm();
    if (!currentForm.valid()) return;

    const formValue = currentForm.value() as ClientFormModel;
    if (formValue.gender === null || formValue.status === null) return;

    const payload: ClientPayload = {
      ...formValue,
      gender: formValue.gender,
      status: formValue.status,
    };

    const client = this.clientDetail();
    if (client?.id) {
      this.clientStore.updateClient({ id: client.id, payload });
    } else {
      this.clientStore.createClient(payload);
    }
  }

  private syncFormWithClientDetail(): void {
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
}
