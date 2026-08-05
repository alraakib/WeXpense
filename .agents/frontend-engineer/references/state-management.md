# State Management

## Zustand (React)

### Core Concepts
- **Tiny**: Minimal API
- **TypeScript-first**: Excellent TS support
- **Middleware**: Immer, devtools, persist
- **No boilerplate**: Simple store creation

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BearStore {
  bears: number;
  increase: () => void;
  reset: () => void;
}

const useBearStore = create<BearStore>()(
  persist(
    (set) => ({
      bears: 0,
      increase: () => set((state) => ({ bears: state.bears + 1 })),
      reset: () => set({ bears: 0 }),
    }),
    { name: 'bear-storage' }
  )
);

// In component
function BearCounter() {
  const bears = useBearStore((state) => state.bears);
  const increase = useBearStore((state) => state.increase);
  return <button onClick={increase}>{bears}</button>;
}
```

---

## Redux Toolkit (React)

### Core Concepts
- **Global store**: Single source of truth
- **Slices**: Modular state management
- **Immer**: Immutable updates
- **RTK Query**: API data fetching

```typescript
import { createSlice, configureStore } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => { state.value += 1; },
    decrement: (state) => { state.value -= 1; },
  },
});

const store = configureStore({
  reducer: { counter: counterSlice.reducer },
});

// Hooks
import { useSelector, useDispatch } from 'react-redux';
const count = useSelector((state) => state.counter.value);
const dispatch = useDispatch();
dispatch(counterSlice.actions.increment());
```

---

## Pinia (Vue)

### Core Concepts
- **TypeScript-first**: Full type inference
- **Modular**: Separate stores
- **Devtools**: Vue DevTools integration

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0);
  const doubleCount = computed(() => count.value * 2);
  
  function increment() {
    count.value++;
  }
  
  return { count, doubleCount, increment };
});

// In component
const store = useCounterStore();
store.count; // reactive
store.increment(); // action
```

---

## Jotai (React)

### Core Concepts
- **Atomic state**: Modular atoms
- **No boilerplate**: Simple API
- **TypeScript**: Full type inference

```typescript
import { atom, useAtom } from 'jotai';

const countAtom = atom(0);
const doubleAtom = atom((get) => get(countAtom) * 2);

function Counter() {
  const [count, setCount] = useAtom(countAtom);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

---

## MobX (React)

### Core Concepts
- **Observable**: Automatic tracking
- **Actions**: State mutations
- **Computed**: Derived values

```typescript
import { makeObservable, observable, action, computed } from 'mobx';
import { observer } from 'mobx-react-lite';

class CounterStore {
  count = 0;
  
  constructor() {
    makeObservable(this, {
      count: observable,
      double: computed,
      increment: action,
    });
  }
  
  get double() { return this.count * 2; }
  increment() { this.count++; }
}

const Counter = observer(() => {
  const store = useMemo(() => new CounterStore(), []);
  return <button onClick={() => store.increment()}>{store.count}</button>;
});
```

## Best Practices
- Choose based on app complexity
- Use Zustand/Jotai for simple apps
- Use Redux Toolkit for large apps
- Use Pinia for Vue apps
- Use MobX for observable-heavy apps
- Keep state normalized
- Use selectors for derived data
