import { useState } from "react"
import type { IPlayer } from "@/interfaces"
import { Button } from "@/components/ui/button"
import clsx from "clsx"
import { toast } from "sonner"
import { handlePlayerAttack } from "@/services/combatServices"
import type { IGame } from "@/interfaces"
import { GAME_STAGE_TYPE, GAME_STAGES } from "@/constants"
import { Swords, RotateCcw, Zap } from "lucide-react"

interface AdminCombatSelectorProps {
  players: IPlayer[]
  game: IGame
  allPlayers: { [key: string]: IPlayer }
}

export const AdminCombatSelector = ({ players, game, allPlayers }: AdminCombatSelectorProps) => {
  const [attacker, setAttacker] = useState<IPlayer | null>(null)
  const [target, setTarget] = useState<IPlayer | null>(null)

  const canBeAttacker = (player: IPlayer) => !player.isResting
  const canBeTarget = (player: IPlayer) => !player.protected
  const isDisabled = (player: IPlayer) => {
    if (!attacker) return !canBeAttacker(player)
    if (!target && player.id !== attacker.id) return !canBeTarget(player)
    return false
  }
  const isCombatStage = GAME_STAGES[game.stageIndex]?.type === GAME_STAGE_TYPE.COMBAT

  const handleSelectPlayer = (player: IPlayer) => {
    if (!attacker && canBeAttacker(player)) {
      setAttacker(player)
    } else if (attacker && !target && player.id !== attacker.id && canBeTarget(player)) {
      setTarget(player)
    }
  }

  const handleReset = () => {
    setAttacker(null)
    setTarget(null)
  }

  const handleAttack = async () => {
    if (attacker && target) {
      const result = await handlePlayerAttack(attacker, target, allPlayers, game)

      if (result.success) {
        toast.success(`${attacker.nickname} 攻擊成功，對 ${target.nickname} 造成 ${result.damageDealt} 傷害`)
      } else {
        toast.error(`${attacker.nickname} 攻擊失敗，損失 ${result.damageDealt} 血量，${target.nickname} 回復同等血量`)
      }

      handleReset()
    }
  }

  const isSelected = (player: IPlayer) => {
    return attacker?.id === player.id || target?.id === player.id
  }

  return (
    <div className="space-y-6">
      {/* Player Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {players.map((player) => (
          <Button
            key={player.id}
            onClick={() => handleSelectPlayer(player)}
            disabled={isDisabled(player)}
            variant="outline"
            className={clsx(
              "flex flex-col items-center justify-center py-6 min-h-[80px] text-left relative",
              isDisabled(player) && "opacity-50 cursor-not-allowed",
              attacker?.id === player.id && "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20",
              target?.id === player.id && "ring-2 ring-red-500 bg-red-50 dark:bg-red-900/20",
              isSelected(player) && "font-bold",
            )}
          >
            <div className="text-center">
              <div className="text-base font-semibold">
                {player.number} {player.nickname}
              </div>
              <div className="text-sm text-muted-foreground mt-1">HP: {player.hp}</div>
              <div className="flex gap-1 mt-2 justify-center">
                {player.isResting && (
                  <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded">
                    休息中
                  </span>
                )}
                {player.protected && (
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-2 py-1 rounded">
                    保護區
                  </span>
                )}
              </div>
            </div>
            {attacker?.id === player.id && (
              <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full"></div>
            )}
            {target?.id === player.id && <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full"></div>}
          </Button>
        ))}
      </div>

      {/* Selection Status */}
      {(attacker || target) && (
        <div className="bg-muted p-4 rounded-lg space-y-2">
          {attacker && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>
                攻擊者：玩家 {attacker.number}（{attacker.nickname}）
              </span>
            </div>
          )}
          {target && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>
                目標：玩家 {target.number}（{target.nickname}）
              </span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleAttack}
          disabled={!attacker || !target || !isCombatStage}
          className="flex-1 min-h-[48px] text-base"
          size="lg"
        >
          <Swords className="h-5 w-5 mr-2" />
          執行攻擊
        </Button>
        <Button
          variant="outline"
          onClick={handleReset}
          className="flex-1 sm:flex-none min-h-[48px] text-base"
          size="lg"
        >
          <RotateCcw className="h-5 w-5 mr-2" />
          重新選擇
        </Button>
      </div>

      {!isCombatStage && (
        <div className="text-center text-sm text-muted-foreground bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
          <Zap className="h-4 w-4 inline mr-1" />
          當前不是戰鬥階段，無法執行攻擊
        </div>
      )}
    </div>
  )
}
