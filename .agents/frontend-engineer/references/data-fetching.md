# Data Fetching & Server State

## TanStack Query (React Query)

### Core Concepts
- **Caching**: Automatic cache management
- **Deduping**: Request deduplication
- **Background refetching**: Auto-update stale data
- **Pagination**: Infinite queries
- **Mutations**: Optimistic updates

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query
function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(res => res.json()),
  });
}

// Mutation with optimistic update
function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user) => fetch('/api/users', { method: 'POST', body: JSON.stringify(user) }),
    onMutate: async (newUser) => {
      await queryClient.cancelQueries({ queryKey: ['users'] });
      const previous = queryClient.getQueryData(['users']);
      queryClient.setQueryData(['users'], (old) => [...old, newUser]);
      return { previous };
    },
    onError: (err, newUser, context) => {
      queryClient.setQueryData(['users'], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

### Best Practices
- Use query keys as dependency arrays
- Use stale time to reduce refetches
- Use enabled for dependent queries
- Use placeholderData for pagination
- Use optimistic updates for better UX

---

## SWR (React)

### Core Concepts
- **Stale-while-revalidate**: Serve stale, fetch new
- **Lightweight**: 2KB
- **Automatic**: Revalidation on focus

```typescript
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

// Query
function useUsers() {
  const { data, error, isLoading } = useSWR('/api/users', fetcher);
  return { users: data, isLoading, error };
}

// Mutation
function useCreateUser() {
  const { trigger, isMutating } = useSWRMutation(
    '/api/users',
    (url, { arg }) => fetch(url, { method: 'POST', body: JSON.stringify(arg) })
  );
  return { createUser: trigger, isMutating };
}
```

---

## Apollo Client (GraphQL)

### Core Concepts
- **GraphQL**: Query language for APIs
- **Caching**: Normalized cache
- **Subscriptions**: Real-time updates

```typescript
import { gql, useQuery, useMutation } from '@apollo/client';

const GET_USERS = gql`
  query GetUsers {
    users { id name email }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) { id name email }
  }
`;

function Users() {
  const { data, loading } = useQuery(GET_USERS);
  const [createUser] = useMutation(CREATE_USER, {
    refetchQueries: [{ query: GET_USERS }],
  });
}
```

---

## urql (GraphQL)

### Core Concepts
- **Lightweight**: Small bundle
- **Extensible**: Exchange architecture
- **TypeScript**: Full type inference

```typescript
import { gql, useQuery, useMutation } from 'urql';

const GET_USERS = gql`query { users { id name } }`;

function Users() {
  const [result] = useQuery({ query: GET_USERS });
  return <div>{result.data?.users.map(u => <div>{u.name}</div>)}</div>;
}
```

## Best Practices
- Use TanStack Query for REST APIs
- Use Apollo/urql for GraphQL APIs
- Implement proper error handling
- Use optimistic updates
- Cache invalidation strategies
- Use prefetching for better UX
