import { createContext, useContext, useState } from 'react'

const LayoutContext = createContext()

export function LayoutProvider({ children }) {
    const [hideSidebar, setHideSidebar] = useState(false)
    const [fullWidth, setFullWidth] = useState(false)

    return (
        <LayoutContext.Provider value={{ hideSidebar, setHideSidebar, fullWidth, setFullWidth }}>
            {children}
        </LayoutContext.Provider>
    )
}

export function useLayout() {
    return useContext(LayoutContext)
}
