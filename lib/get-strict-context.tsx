'use client';

import * as React from 'react';

/**
 * Creates a strict React context with a provider and hook.
 * The hook will throw an error if used outside the provider.
 *
 * @param name - The name of the context (for error messages)
 * @returns A tuple containing [Provider, useHook]
 */
export function getStrictContext<T>(name: string) {
  const Context = React.createContext<T | null>(null);

  function Provider({ value, children }: { value: T; children: React.ReactNode }) {
    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  function useContext() {
    const context = React.useContext(Context);
    if (context === null) {
      throw new Error(`use${name} must be used within a ${name}Provider`);
    }
    return context;
  }

  return [Provider, useContext] as const;
}
