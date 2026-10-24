import { Text } from "@medusajs/ui"

import Medusa from "../../../common/icons/medusa"
import NextJs from "../../../common/icons/nextjs"

const MedusaCTA = () => {
  return (
    <a
      href=""
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center rounded-full px-3 py-1.5 text-ui-fg-muted transition-colors hover:bg-ui-bg-subtle-hover hover:text-ui-fg-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-border-interactive"
      aria-label="Visit ChordRED Innovations"
    >
      <Text className="txt-compact-small-plus">
        Powered by{" "}
        <span className="font-semibold text-ui-fg-base transition-colors group-hover:text-ui-fg-interactive">
          ChordRED Innovations
        </span>
      </Text>
    </a>
  )
}

export default MedusaCTA
