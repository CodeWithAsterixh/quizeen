"use client"

import React from 'react'
import { Button } from './ui/button'
import { DialogClose } from './ui/dialog'
import UseModal from './Modal'
import { useAppDispatch } from '@/lib/hooks'
import { logout } from '@/lib/features/authSlice'
import { clearQuizState } from '@/lib/features/quizSlice'

type Props = {
    trigger:React.ReactNode
}

export default function LogOutModal({trigger}: Props) {
    const dispatch = useAppDispatch()
   const handleLogout = () => {
      dispatch(logout());
      dispatch(clearQuizState());
    };
  return (
    <UseModal
          trigger={
            trigger
          }
          contentHeader={{
            title: "Delete Account",
            description: <strong>
              Are you sure you want to Log out your account?<br/>Your info won{"'"}t be saved!
            </strong>,
          }}
          contentFooter={{
            children: (
              <div className="w-[20rem] max-w-full flex flex-col gap-3">
                <DialogClose asChild>
                  <Button variant={"default"}>Cancel</Button>
                </DialogClose>
                <Button
                  variant={"secondary"}
                  onClick={handleLogout} 
                >
                  Yes, Log out
                </Button>
              </div>
            ),
          }}
        ></UseModal>
  )
}