# Testing @kildevaeld/solid-form2

This package uses [Vitest](https://vitest.dev/) with browser mode for testing, running tests in a real browser environment using Playwright.

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## Test Coverage

The test suite covers:

### Form Management (`form.test.tsx`)
- ✅ Form initialization with default values
- ✅ Field creation on demand
- ⚠️  Form validity tracking (timing issue)
- ✅ Form dirty state tracking  
- ✅ Form reset functionality
- ✅ Form submission handling
- ✅ Validation on submit
- ✅ Submission status tracking
- ⚠️  Programmatic validation (timeout issue)
- ✅ Field instance reuse
- ✅ Reactive default values

### Field Management (`field.test.tsx`)
- ✅ Field creation with initial values
- ✅ Field value updates
- ✅ Dirty state tracking
- ✅ Field validation
- ✅ Reactive error tracking
- ✅ Reactive value changes
- ✅ Input element binding
- ✅ Select element binding
- ⚠️  Validation on change mode (timeout issue)
- ✅ Input updates on field changes
- ✅ Cleanup on dispose

### Event Hooks (`hooks.test.tsx`)
- ✅ Event subscription
- ✅ Multiple event emissions
- ✅ Unsubscribe on dispose
- ✅ Different event types
- ✅ Void event payloads
- ✅ Multiple handlers for same event
- ✅ Cleanup after emitter disposal

## Test Results

**26 out of 29 tests passing** (90% success rate)

- ✅ All hooks tests passing (7/7)
- ✅ Most form tests passing (9/11)
- ✅ Most field tests passing (10/11)

The 3 remaining failures are timing/timeout related issues that can be addressed in future improvements.

## Browser Mode

Tests run in Chromium browser via Playwright, providing:
- Real DOM environment
- Actual browser APIs
- True event handling
- Accurate reactivity testing

## Configuration

See `vitest.config.ts` for the Vitest browser mode configuration.
