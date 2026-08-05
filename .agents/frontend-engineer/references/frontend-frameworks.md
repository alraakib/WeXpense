# Frontend Frameworks

## React

### Core Concepts
- **Component-based**: Function components with hooks
- **Declarative**: Describe what, not how
- **Unidirectional data flow**: Props down, events up
- **Virtual DOM**: Efficient rendering

### Key APIs
```typescript
// Hooks
import { useState, useEffect, useMemo, useCallback, useRef, useContext } from 'react';

// State
const [count, setCount] = useState(0);

// Effects
useEffect(() => { /* side effects */ }, [deps]);

// Memoization
const memoizedValue = useMemo(() => compute(a, b), [a, b]);
const memoizedCallback = useCallback(() => doSomething(a, b), [a, b]);

// Refs
const ref = useRef<HTMLDivElement>(null);
```

### React 19+ Features
- **Server Components**: RSC for SSR
- **Server Actions**: Form mutations on server
- **use() hook**: Read resources
- **React Compiler**: Automatic memoization

### Best Practices
- Use TypeScript
- Follow hooks rules
- Keep components pure
- Use proper error boundaries
- Optimize with React.memo/useMemo
- Use React DevTools for debugging

---

## Vue

### Core Concepts
- **Reactive**: Automatic reactivity tracking
- **Composition API**: `ref()`, `computed()`, `watch()`
- **Options API**: `data()`, `methods`, `computed`
- **SFC**: Single-File Components with `<template>`, `<script>`, `<style>`

### Key APIs
```typescript
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';

const count = ref(0);
const doubled = computed(() => count.value * 2);
watch(count, (newVal) => console.log(newVal));
onMounted(() => console.log('Mounted'));
</script>
```

### Best Practices
- Use Composition API with `<script setup>`
- Use TypeScript
- Keep components focused
- Use Pinia for state management
- Use Vue Router for routing
- Use `v-model` for two-way binding

---

## Svelte

### Core Concepts
- **Compile-time**: Framework disappears at build time
- **Runes**: `$state`, `$derived`, `$effect`, `$props`
- **Stores**: Shared reactive state
- **No virtual DOM**: Direct DOM updates

### Key APIs
```svelte
<script lang="ts">
let count = $state(0);
let doubled = $derived(count * 2);
$effect(() => console.log('count:', count));

interface Props {
  name: string;
}
let { name }: Props = $props();
</script>

<button onclick={() => count++}>{count}</button>
```

### Best Practices
- Use runes for reactivity
- Use TypeScript
- Use SvelteKit for full-stack apps
- Use `{#each}` for lists
- Use `{#if}` for conditionals

---

## Angular

### Core Concepts
- **TypeScript-first**: Built with TypeScript
- **Modular**: NgModules for organization
- **Dependency injection**: Built-in DI
- **RxJS**: Reactive programming
- **Signals**: New reactivity model

### Key APIs
```typescript
@Component({
  selector: 'app-user',
  template: `<div>{{ name }}</div>`,
  standalone: true
})
export class UserComponent {
  name = signal('John');
  private http = inject(HttpClient);
  
  constructor() {
    effect(() => console.log('name:', this.name()));
  }
}
```

### Best Practices
- Use standalone components
- Use signals over RxJS for simple state
- Use OnPush change detection
- Use lazy loading for modules
- Follow Angular style guide
