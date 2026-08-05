# UI Libraries & Component Systems

## shadcn/ui

### Core Concepts
- **Copy-paste components**: Not an npm package
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible primitives
- **Customizable**: Full control over components

### Installation
```bash
npx shadcn@latest init
npx shadcn@latest add button
```

### Usage
```typescript
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

function LoginForm() {
  return (
    <Card className="p-6 max-w-sm mx-auto">
      <form>
        <Input placeholder="Email" className="mb-4" />
        <Button type="submit" className="w-full">Login</Button>
      </form>
    </Card>
  );
}
```

---

## Radix UI

### Core Concepts
- **Headless**: No styling, just logic
- **Accessible**: WCAG compliant
- **Unstyled**: Bring your own styles

```typescript
import * as Dialog from '@radix-ui/react-dialog';

function MyDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>Open</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/50 fixed inset-0" />
        <Dialog.Content className="bg-white p-6 rounded-lg">
          <Dialog.Title>Dialog Title</Dialog.Title>
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

---

## Headless UI

### Core Concepts
- **Accessible**: Built for accessibility
- **Tailwind friendly**: Works perfectly with Tailwind
- **Unstyled**: Full design control

```typescript
import { Menu, Transition } from '@headlessui/react';

function Dropdown() {
  return (
    <Menu>
      <Menu.Button>Options</Menu.Button>
      <Transition
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
      >
        <Menu.Items>
          <Menu.Item><a href="/profile">Profile</a></Menu.Item>
          <Menu.Item><a href="/settings">Settings</a></Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
```

---

## Material UI (MUI)

### Core Concepts
- **Material Design**: Google's design system
- **Complete**: Full component library
- **Customizable**: Theme system

```typescript
import { Button, TextField, Box } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: { primary: { main: '#1976d2' } },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Box>
        <TextField label="Email" />
        <Button variant="contained">Submit</Button>
      </Box>
    </ThemeProvider>
  );
}
```

---

## Chakra UI

### Core Concepts
- **Component-based**: Pre-built components
- **Accessible**: WCAG compliant
- **Customizable**: Theme-based styling

```typescript
import { ChakraProvider, Button, Input, VStack } from '@chakra-ui/react';

function App() {
  return (
    <ChakraProvider>
      <VStack spacing={4}>
        <Input placeholder="Email" />
        <Button colorScheme="blue">Submit</Button>
      </VStack>
    </ChakraProvider>
  );
}
```

## Best Practices
- Use shadcn/ui for Tailwind projects
- Use Radix/Headless UI for custom designs
- Use MUI for enterprise Material Design
- Use Chakra for quick prototyping
- Ensure accessibility
- Customize theme to match brand
