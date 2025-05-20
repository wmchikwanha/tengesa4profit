
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 20
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: string
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: string
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: actionTypes.REMOVE_TOAST,
      toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action

      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }

    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

// Create a separate context for toast state management
const ToastContext = React.createContext<{
  state: State
  toast: (props: Omit<ToasterToast, "id">) => void
  dismiss: (toastId?: string) => void
}>({
  state: { toasts: [] },
  toast: () => {},
  dismiss: () => {},
})

// Create a provider component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [state, setState] = React.useState<State>({ toasts: [] })
  
  React.useEffect(() => {
    const listener = (newState: State) => {
      setState(newState)
    }
    
    listeners.push(listener)
    return () => {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  const toast = React.useCallback((props: Omit<ToasterToast, "id">) => {
    const id = genId()
    const newToast: ToasterToast = {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) {
          dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id })
        }
      },
    }
    
    dispatch({
      type: actionTypes.ADD_TOAST,
      toast: newToast,
    })
    
    return {
      id,
      dismiss: () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id }),
      update: (props: ToasterToast) => dispatch({
        type: actionTypes.UPDATE_TOAST,
        toast: { ...props, id },
      }),
    }
  }, [])
  
  const dismiss = React.useCallback((toastId?: string) => {
    dispatch({ type: actionTypes.DISMISS_TOAST, toastId })
  }, [])

  return (
    <ToastContext.Provider value={{ state, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  )
}

// Global state for toast management outside of React context
const listeners: Array<(state: State) => void> = []
let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

// Export useToast hook for components
export const useToast = () => {
  const context = React.useContext(ToastContext)
  
  if (!context) {
    // Fallback for when context is not available
    return {
      toast: (props: Omit<ToasterToast, "id">) => {
        const id = genId()
        
        dispatch({
          type: actionTypes.ADD_TOAST,
          toast: {
            ...props,
            id,
            open: true,
            onOpenChange: (open) => {
              if (!open) {
                dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id })
              }
            },
          },
        })
        
        return {
          id,
          dismiss: () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id }),
          update: (props: Partial<ToasterToast>) => dispatch({
            type: actionTypes.UPDATE_TOAST,
            toast: { ...props, id },
          }),
        }
      },
      dismiss: (toastId?: string) => dispatch({ type: actionTypes.DISMISS_TOAST, toastId }),
      toasts: memoryState.toasts,
    }
  }
  
  return {
    ...context,
    toasts: context.state.toasts,
  }
}

// Standalone toast function
export const toast = (props: Omit<ToasterToast, "id">) => {
  const id = genId()
  
  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) {
          dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id })
        }
      },
    },
  })
  
  return {
    id,
    dismiss: () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id }),
    update: (props: Partial<ToasterToast>) => dispatch({
      type: actionTypes.UPDATE_TOAST,
      toast: { ...props, id },
    }),
  }
}
