"use client"

import QuizResultsTable from '@/components/QuizResultsTable'
import { getResults } from '@/lib/features/quizSlice'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { useEffect } from 'react'


export default function Page() {
    const user = useAppSelector(s => s.auth.user)
    const userCompleted = useAppSelector(s => s.quiz.userCompleted)
    const dispatch = useAppDispatch()

    useEffect(() => {
      if(user){
        dispatch(getResults(user._id))
      }
    }, [dispatch, user])

    
    
    
  return (
    <div className='w-full px-2 sm:max-w-5xl m-auto py-5 flex flex-col gap-4'>
        <QuizResultsTable results={userCompleted} />
    </div>  )
}