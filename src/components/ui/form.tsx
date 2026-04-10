import { Controller, useFormContext } from "react-hook-form"
import type { Control, FieldPath, ControllerRenderProps, FieldErrors, FieldValues } from "react-hook-form"

import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  render: (props: {
    field: ControllerRenderProps<T, FieldPath<T>>
    fieldState: {
      error?: FieldErrors<T>
    }
  }) => React.ReactElement
}

function FormField<T extends FieldValues>({
  control,
  name,
  render,
}: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        return render({ field, fieldState })
      }}
    />
  )
}

function Form({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function FormControl({ children }: { children: React.ReactNode }) {
  return <FieldContent>{children}</FieldContent>
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return <FieldLabel>{children}</FieldLabel>
}

function FormMessage({ children }: { children?: React.ReactNode }) {
  if (children) {
    return <FieldError>{children}</FieldError>
  }
  return null
}

export { Form, FormControl, FormField, FormLabel, FormMessage }
