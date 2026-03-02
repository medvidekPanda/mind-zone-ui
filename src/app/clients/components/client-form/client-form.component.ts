import { ChangeDetectionStrategy, Component, effect, input, model, output } from "@angular/core";
import { FormField, form, required } from "@angular/forms/signals";

import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { DatePickerModule } from "primeng/datepicker";
import { InputTextModule } from "primeng/inputtext";
import { SelectModule } from "primeng/select";

import { FormDatepickerComponent } from "../../../shared/components/form-datepicker/form-datepicker.component";
import { FormSelectComponent } from "../../../shared/components/form-select/form-select.component";
import { Client, ClientGender, ClientPayload, ClientStatus } from "../../../shared/interfaces/client.interface";

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
  readonly clientModel = model<ClientFormModel>({
    firstName: "",
    lastName: "",
    gender: null,
    birthDate: "",
    email: "",
    status: null,
  });

  readonly clientDetail = input<Client | undefined>(undefined);

  protected readonly clientForm = form(this.clientModel, (schemaPath) => {
    required(schemaPath.firstName, { message: "Jméno je povinné" });
    required(schemaPath.lastName, { message: "Příjmení je povinné" });
  });

  protected readonly genderOptions: { label: string; value: ClientGender }[] = [
    { label: "Muž", value: ClientGender.MALE },
    { label: "Žena", value: ClientGender.FEMALE },
    { label: "Jiné", value: ClientGender.OTHER },
  ];

  protected readonly statusOptions: { label: string; value: ClientStatus }[] = [
    { label: "Aktivní", value: ClientStatus.ACTIVE },
    { label: "Neaktivní", value: ClientStatus.INACTIVE },
  ];

  readonly formChanged = output<ClientPayload>();

  constructor() {
    this.initClientFormEffect();
    this.initClientModelEffect();
  }

  private initClientFormEffect(): void {
    effect(() => {
      const client = this.clientDetail();

      if (client?.id) {
        const { firstName, lastName, birthDate, email, gender, status } = client;
        this.clientModel.set({
          firstName,
          lastName,
          birthDate,
          email,
          gender,
          status,
        });
      }
    });
  }

  private initClientModelEffect() {
    effect(() => {
      const value = this.clientForm().value();
      const isValid = this.clientForm().valid();
      const dirty = this.clientForm().dirty();

      if (value.gender !== null && value.status !== null && isValid && dirty) {
        this.formChanged.emit({
          ...value,
          /**
           * @todo user id by měl být získán z auth service nebo s možností změny jako admin
           */
          userId: "019c9b5c-0b2c-74ae-bf97-036f30651efe",
          gender: value.gender,
          status: value.status,
        });
      }
    });
  }
}
