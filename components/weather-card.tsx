"use client"

import { Cloud, Droplets, Wind } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WeatherResult } from "@/lib/types"

interface WeatherCardProps {
  data: WeatherResult
}

export function WeatherCard({ data }: WeatherCardProps) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          {data.location} 天气
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-4xl font-bold">
            {data.temperature}
            {data.unit}
          </div>
          <div className="text-muted-foreground text-xl">{data.condition}</div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <span className="text-muted-foreground">湿度</span>
            <span className="font-medium">{data.humidity}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-gray-500" />
            <span className="text-muted-foreground">风速</span>
            <span className="font-medium">{data.windSpeed} km/h</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
