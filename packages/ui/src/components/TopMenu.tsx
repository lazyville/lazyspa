import React from 'react'

export interface TopMenuProps {
  onNewGame?: () => void
  onReset?: () => void
  onHelp?: () => void
  onRecord?: () => void
  onShare?: () => void
}

export const TopMenu: React.FC<TopMenuProps> = ({
  onNewGame,
  onReset,
  onHelp,
  onRecord,
  onShare,
}) => {
  return (
    <nav className="flex gap-2 p-2 bg-gray-200 text-sm">
      <button onClick={onNewGame}>New Game</button>
      <button onClick={onReset}>Reset</button>
      <button onClick={onHelp}>Help</button>
      <button onClick={onRecord}>Record</button>
      <button onClick={onShare}>Share</button>
    </nav>
  )
}

export default TopMenu
