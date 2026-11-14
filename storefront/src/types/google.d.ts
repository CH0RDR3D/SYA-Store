/**
 * Google Identity Services (GIS) TypeScript Declarations
 */

export interface GoogleCredentialResponse {
  credential: string
  select_by?:
    | "auto"
    | "user"
    | "user_1tap"
    | "user_2tap"
    | "btn"
    | "btn_confirm"
    | "br_tap"
    | "btn_tap"
  clientId?: string
}

export interface GooglePromptMomentNotification {
  isDisplayMoment: () => boolean
  isDisplayed: () => boolean
  isNotDisplayed: () => boolean
  getNotDisplayedReason: () =>
    | "browser_not_supported"
    | "invalid_client"
    | "missing_client_id"
    | "opt_out_or_no_session"
    | "secure_http_required"
    | "suppressed_by_user"
    | "unregistered_origin"
    | "unknown_reason"
  isSkippedMoment: () => boolean
  getSkippedReason: () =>
    | "auto_cancel"
    | "user_cancel"
    | "tap_outside"
    | "issuing_failed"
  isDismissedMoment: () => boolean
  getDismissedReason: () =>
    | "credential_returned"
    | "cancel"
    | "cancel_attribute"
  getMomentType: () => "display" | "skipped" | "dismissed"
}

export interface GoogleGsiButtonConfiguration {
  type?: "standard" | "icon"
  theme?: "outline" | "filled_blue" | "filled_black"
  size?: "large" | "medium" | "small"
  text?: "signin_with" | "signup_with" | "continue_with" | "signin"
  shape?: "rectangular" | "pill" | "circle" | "square"
  logo_alignment?: "left" | "center"
  width?: string | number
  locale?: string
  click_listener?: () => void
}

export interface GoogleIdConfiguration {
  client_id: string
  callback: (response: GoogleCredentialResponse) => void
  auto_select?: boolean
  cancel_on_tap_outside?: boolean
  prompt_parent_id?: string
  nonce?: string
  context?: "signin" | "signup" | "use"
  state_cookie_domain?: string
  ux_mode?: "popup" | "redirect"
  login_uri?: string
  native_login_uri?: string
  intermediate_iframe_close_callback?: () => void
  itp_support?: boolean
  use_fedcm_for_prompt?: boolean
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleIdConfiguration) => void
          prompt: (
            momentListener?: (
              notification: GooglePromptMomentNotification
            ) => void
          ) => void
          renderButton: (
            parent: HTMLElement,
            options: GoogleGsiButtonConfiguration
          ) => void
          disableAutoSelect: () => void
          storeCredential: (credential: any, callback?: () => void) => void
          cancel: () => void
          revoke: (hint: string, callback?: (done: boolean) => void) => void
        }
      }
    }
  }
}

