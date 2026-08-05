# Forms

## React Hook Form

### Core Concepts
- **Performance**: Uncontrolled inputs
- **TypeScript**: Full type inference
- **Validation**: Zod/Yup/Joi integration

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  
  const onSubmit = (data: FormData) => console.log(data);
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      <input type="password" {...register('password')} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Best Practices
- Use Zod for validation schemas
- Use `useFormContext` for nested forms
- Use `useFieldArray` for dynamic fields
- Optimize with `shouldUnregister`

---

## Formik (React)

### Core Concepts
- **Declarative**: Form components
- **Validation**: Schema-based
- **Error handling**: Automatic

```typescript
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const schema = Yup.object({
  email: Yup.string().email().required(),
  password: Yup.string().min(8).required(),
});

function LoginForm() {
  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validationSchema={schema}
      onSubmit={(values) => console.log(values)}
    >
      <Form>
        <Field name="email" type="email" />
        <ErrorMessage name="email" component="div" />
        <Field name="password" type="password" />
        <button type="submit">Submit</button>
      </Form>
    </Formik>
  );
}
```

---

## VeeValidate (Vue)

### Core Concepts
- **Composition API**: Vue-friendly
- **Validation**: Schema-based
- **TypeScript**: Full support

```typescript
<script setup lang="ts">
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';

const schema = toTypedSchema(z.object({
  email: z.string().email(),
  password: z.string().min(8),
}));

const { handleSubmit } = useForm({ validationSchema: schema });
const { value: email, errorMessage: emailError } = useField('email');
const { value: password, errorMessage: passwordError } = useField('password');
</script>

<template>
  <form @submit="handleSubmit">
    <input v-model="email" />
    <span>{{ emailError }}</span>
    <input v-model="password" type="password" />
    <button type="submit">Submit</button>
  </form>
</template>
```

## Validation Best Practices
- Use Zod for validation schemas
- Validate on both client and server
- Show errors inline near fields
- Disable submit while invalid
- Use debounced validation
- Support multi-step forms
