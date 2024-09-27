import { V2 } from "@/types"

export const v2Equal = (p1:V2, p2:V2) => {
  return p1.x === p2.x && p1.y === p2.y
}