"use client"

import { useActionState } from "react"

import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import GoogleAutoSignIn from "../google-auto-signin"
import Input from "@modules/common/components/input"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { login } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const initialState = null

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, initialState)

  const errorMessage =
    message?.state === "error"
      ? message.error
      : message?.state === "verification_required"
        ? `Check ${message.email} for your verification link, then sign in again.`
        : null

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="login-page"
    >
      <h1 className="text-large-semi uppercase mb-6">Welcome back</h1>
      <GoogleAutoSignIn />
      <div className="relative w-full my-4 flex items-center justify-center">
        <div className="border-t border-ui-border-base w-full" />
        <span className="bg-ui-bg-base px-3 text-xs uppercase tracking-wider text-ui-fg-muted shrink-0">
          Or continue with email
        </span>
      </div>
      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="Email"
            name="email"
            type="email"
            title="Enter a valid email address."
            autoComplete="email"
            required
            data-testid="email-input"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={errorMessage} data-testid="login-error-message" />
        <div className="mt-6">
          <SubmitButton data-testid="sign-in-button" className="w-full">
            Sign in
          </SubmitButton>
        </div>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        Not a member?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="underline"
          data-testid="register-button"
        >
          Join us
        </button>
        .
      </span>
    </div>
  )
}

export default Login
