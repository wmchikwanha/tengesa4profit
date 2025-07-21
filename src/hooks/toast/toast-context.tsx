
import { createContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react"
import { Action, actionTypes, State, ToasterToast } from "./types"
import { genId } from "./utils"
import { reducer } from "./reducer"

interface ToastContextValue {
  state: State
  toast: (props: Omit<ToasterToast, "id">) => ReturnType<typeof createToast>
  dismiss: (toastId?: string) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

// Global state for toast management outside of React context
const listeners: Array<(state: State) => void> = []
let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action, dispatch)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

export function createToast(props: Omit<ToasterToast, "id">) {
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
    update: (props: Partial<ToasterToast>) => dispatch({
      type: actionTypes.UPDATE_TOAST,
      toast: { ...props, id },
    }),
  }
}

export const ToastProvider = ({ 
  children 
}: { children: ReactNode }) => {
  const [state, setState] = useState<State>({ toasts: [] })
  
  useEffect(() => {
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

  const toast = useCallback((props: Omit<ToasterToast, "id">) => {
    return createToast(props)
  }, [])
  
  const dismiss = useCallback((toastId?: string) => {
    dispatch({ type: actionTypes.DISMISS_TOAST, toastId })
  }, [])

  const contextValue = useMemo(() => ({
    state,
    toast,
    dismiss
  }), [state, toast, dismiss])

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  )
}
