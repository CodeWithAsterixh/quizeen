import AuthForm from '@/components/AuthForm'
import Link from 'next/link'
import React from 'react'

type Props = object

export default function Page({}: Props) {
  return (
    <div className="flex h-screen flex-col gap-9 items-center justify-center bg-gradient-to-br from-neutral-100 to-slate-300">
      <AuthForm type="register" />
      <div className="w-96 max-w-md mx-auto flex items-center justify-center">
        <h2 className="text-base  text-gray-900">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:text-blue-800">
            {" "}
            Login
          </Link>
        </h2>
      </div>
    </div>
  )
}