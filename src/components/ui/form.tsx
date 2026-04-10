import { Controller } from "react-hook-form"
import type { Control, FieldPath, ControllerRenderProps, FieldError as RHFError } from "react-hook-form"

import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"

interface FormFieldProps<T extends Record<string, unknown>> {
  control: Control<T>
  name: FieldPath<T>
  render: (props: {
    field: ControllerRenderProps<T, FieldPath<T>>
    fieldState: {
      error?: RHFError
    }
  }) => React.ReactElement
}

function FormField<T extends Record<string, unknown>>({
  control,
  name,
  render,
}: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => 
        render({ field, fieldState })
      }
    />
  )
}

function Form({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function FormControl({ children }: { children: React.ReactNode }) {
  return <FieldContent>{children}</FieldContent>
}

function FormLabelComponent({ children }: { children: React.ReactNode }) {
  return <FieldLabel>{children}</FieldLabel>
}

function FormMessageComponent({ children }: { children?: React.ReactNode }) {
  if (children) {
    return <FieldError>{children}</FieldError>
  }
  return null
}

export { Form, FormControl, FormField, FormLabelComponent as FormLabel, FormMessageComponent as FormMessage, Field }
