# @kildevaeld/solid-form2 Example

A complete example project showcasing the features of `@kildevaeld/solid-form2`, a modern form management library for Solid.js.

## Features Demonstrated

- **Form Creation**: Creating and managing forms with initial values
- **Field Management**: Creating individual form fields with state management
- **Field Arrays**: Handling dynamic lists of form fields (interests)
- **Validation**: Field-level validation and error handling
- **Form State**: Managing form submission, loading, and error states
- **Styling**: Modern, responsive UI with Tailwind-inspired styling

## Quick Start

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`

### Build

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Project Structure

```
src/
├── index.tsx              # Entry point
├── App.tsx                # Main application component
├── style.css              # Global styles
├── components/
│   └── UserForm.tsx       # User registration form example
└── styles/
    └── UserForm.css       # Form-specific styles
```

## Example Features

The UserForm component demonstrates:

- Creating a form with multiple field types
- Text inputs (firstName, lastName)
- Email input (email)
- Number input (age)
- Textarea (bio)
- Dynamic field arrays (interests list)
- Form submission handling
- Field validation and error display
- Reset functionality
- Loading state during submission

## Technologies

- **Vite**: Lightning-fast build tool
- **Solid.js**: Reactive JavaScript UI library
- **TypeScript**: Type-safe JavaScript
- **@kildevaeld/solid-form2**: Form management library

## License

MIT
