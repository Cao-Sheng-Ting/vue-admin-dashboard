interface DashboardCardItem {
  key: string
  label: string
}

export interface DashboardCardConfig {
  group: string
  groupLabel: string
  items: DashboardCardItem[]
}
