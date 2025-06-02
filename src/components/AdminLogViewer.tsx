"use client"

import { useState } from "react"
import { useData } from "@/services/firebaseHelpers"
import { DB_PATH } from "@/constants"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePlayers } from "@/utils"
import { Activity, TrendingUp } from "lucide-react"

export const AdminLogViewer = () => {
  const [logType, setLogType] = useState("combat")
  const { data: combatLogs, loading: combatLoading } = useData(DB_PATH.COMBAT_LOGS)
  const { data: tradingLogs, loading: tradingLoading } = useData(DB_PATH.TRADING_LOGS)
  const { data: players } = usePlayers()

  const getPlayerName = (playerId) => {
    if (!players || !players[playerId]) return `玩家 ${playerId}`
    return `${players[playerId].number} ${players[playerId].nickname}`
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    return date.toLocaleTimeString("zh-TW", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const renderCombatLogs = () => {
    if (combatLoading) return <div className="text-center py-8">載入中...</div>
    if (!combatLogs) return <div className="text-center py-8 text-muted-foreground">無戰鬥記錄</div>

    const logs = Object.entries(combatLogs)
      .map(([key, log]) => ({ id: key, ...log }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return (
      <ScrollArea className="h-[400px] pr-2">
        <div className="space-y-3">
          {logs.map((log) => {
            if (log.type === "trait-effect") {
              return (
                <div
                  key={log.id}
                  className="border-l-4 border-purple-500 pl-3 py-3 bg-purple-50 dark:bg-purple-900/20 rounded-r-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                    <Badge
                      variant="outline"
                      className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 w-fit text-xs"
                    >
                      特性效果
                    </Badge>
                    <span className="text-xs text-muted-foreground">{formatTimestamp(log.timestamp)}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed">{log.note || `${log.trait} 觸發`}</p>
                </div>
              )
            }

            return (
              <div
                key={log.id}
                className={`border-l-4 ${log.success ? "border-green-500" : "border-red-500"} pl-3 py-3 ${log.success ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"} rounded-r-lg`}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                  <Badge variant={log.success ? "success" : "destructive"} className="w-fit text-xs">
                    {log.success ? "攻擊成功" : "攻擊失敗"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{formatTimestamp(log.timestamp)}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed">
                  <span className="font-medium">{getPlayerName(log.attackerId)}</span> 攻擊{" "}
                  <span className="font-medium">{getPlayerName(log.targetId)}</span>
                  {log.success ? `，造成 ${log.damage} 點傷害` : `，攻擊失敗並損失 ${log.damage} 點血量`}
                </p>
              </div>
            )
          })}

          {logs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>尚無戰鬥記錄</p>
            </div>
          )}
        </div>
      </ScrollArea>
    )
  }

  const renderTradingLogs = () => {
    if (tradingLoading) return <div className="text-center py-8">載入中...</div>
    if (!tradingLogs) return <div className="text-center py-8 text-muted-foreground">無交易記錄</div>

    const logs = Object.entries(tradingLogs)
      .map(([key, log]) => ({ id: key, ...log }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return (
      <ScrollArea className="h-[400px] pr-2">
        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>尚無交易記錄</p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="border-l-4 border-blue-500 pl-3 py-3 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                  <Badge
                    variant="outline"
                    className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 w-fit text-xs"
                  >
                    交易
                  </Badge>
                  <span className="text-xs text-muted-foreground">{formatTimestamp(log.timestamp)}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed">{log.description || "交易記錄"}</p>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    )
  }

  return (
    <div className="space-y-4">
      <Tabs value={logType} onValueChange={setLogType}>
        <TabsList className="grid grid-cols-2 w-full h-12">
          <TabsTrigger value="combat" className="text-sm min-h-[44px]">
            <Activity className="h-4 w-4 mr-2" />
            戰鬥日誌
          </TabsTrigger>
          <TabsTrigger value="trading" className="text-sm min-h-[44px]">
            <TrendingUp className="h-4 w-4 mr-2" />
            交易日誌
          </TabsTrigger>
        </TabsList>

        <TabsContent value="combat" className="mt-4">
          {renderCombatLogs()}
        </TabsContent>

        <TabsContent value="trading" className="mt-4">
          {renderTradingLogs()}
        </TabsContent>
      </Tabs>
    </div>
  )
}
