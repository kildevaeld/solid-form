# Solid forms


```ts

import { createForm, required } from "@kildevaeld/solid-form"


function App() {

  const api = createForm({
    defaultValues: () => ({
      name: 'Rasmus'
    }),
    validations: {
      name: [required()]
    },
    async submit(values) => {

    }
  })

  return <form submit={api.submit}>
    <div classlist={{invalid: api.field('name').isValid()}}>
      <label>Name<label>
      <input type="text" ref={api.field('name')} />
    </div>
    <button type="submit" disabled={api.isSubmitting()}>Submit</button>
  <form>
}

```