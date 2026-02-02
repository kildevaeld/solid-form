import { Form, min } from './dist/index.js';


const form = new Form({
    fields: {
        username: {
            validations: [min(10)],
            required: true
        },
        password: {
            required: true
        }
    }
})

form.on('change', () => {
    console.log('Form changed', form.toJSON());
});

form.on('statusChange', (status) => {
    console.log('Form status changed to', status);
})

form.on('change:username', (event) => {
    console.log('Username changed to', event);
})

form.on('change:password', (event) => {
    console.log('Password changed to', event);
});

console.log('Dirty', form.isDirty)

form.field("username").value = "newUser"

console.log('Dirty', form.isDirty)

form.field("password").value = "newPasword"

// form.reset();

console.log('Is valid',form.isValid)


await form.validate()

console.log('Is valid',form.validationErrors)

form.field("username").value = "A very long username"

await form.validate()

console.log('Is valid',form.validationErrors)