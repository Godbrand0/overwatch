# Redux Store Implementation

This directory contains the Redux store implementation for MantleForge, providing state management for authentication and wallet connections with React Persist for state rehydration.

## Structure

```
src/store/
├── index.ts              # Main store configuration with persist setup
├── hooks.ts              # Custom Redux hooks for TypeScript support
├── slices/
│   ├── authSlice.ts      # Authentication state management
│   └── walletSlice.ts   # Wallet connection state management
└── README.md             # This file
```

## Features

### Authentication State (`authSlice.ts`)
- User data management (GitHub authentication)
- Login/logout functionality
- Persistent authentication state
- Error handling and loading states

### Wallet State (`walletSlice.ts`)
- Wallet connection status
- Address and chain information
- Connection state management
- Integration with Wagmi

### React Persist Integration
- Automatic state rehydration on app load
- Persistent storage of auth and wallet state
- Selective persistence (only auth and wallet slices)

## Usage Examples

### Authentication
```typescript
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { loginWithGithub, logout } from '@/store/slices/authSlice';

function MyComponent() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector(state => state.auth);
  
  const handleLogin = () => {
    dispatch(loginWithGithub());
  };
  
  const handleLogout = () => {
    dispatch(logout());
  };
  
  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.github_username}!</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin} disabled={isLoading}>
          {isLoading ? 'Connecting...' : 'Login with GitHub'}
        </button>
      )}
    </div>
  );
}
```

### Wallet State
```typescript
import { useAppSelector } from '@/store/hooks';

function WalletComponent() {
  const { address, isConnected, chainId } = useAppSelector(state => state.wallet);
  
  return (
    <div>
      <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
      {address && <p>Address: {address}</p>}
      {chainId && <p>Chain ID: {chainId}</p>}
    </div>
  );
}
```

## State Persistence

The store uses Redux Persist to automatically save and restore state:

- **Authentication state**: User login status, profile data, and tokens
- **Wallet state**: Connection status, address, and network information

State is persisted to localStorage and automatically rehydrated when the app loads, ensuring users remain logged in and connected across page refreshes.

## Integration Points

1. **Providers Component**: Wraps the app with Redux Provider and PersistGate
2. **WalletSync Component**: Syncs Wagmi wallet state with Redux store
3. **API Integration**: Works with existing authentication API endpoints
4. **Component Updates**: Existing components updated to use Redux state

## Benefits

1. **State Rehydration**: Users stay authenticated and connected after page refresh
2. **Centralized State**: Single source of truth for auth and wallet state
3. **Type Safety**: Full TypeScript support with proper typing
4. **Performance**: Optimized re-renders with useSelector
5. **Persistence**: Automatic state saving and restoration