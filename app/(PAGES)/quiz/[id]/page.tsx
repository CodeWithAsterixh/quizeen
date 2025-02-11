"use client"
import GoBack from '@/components/GoBack'
import Details from '@/components/Quiz/Details'
import QuestionComponent from '@/components/Quiz/Question'
import { fetchQuizById } from '@/lib/features/quizSlice'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'


export default function Page() {
    const currentQuiz = useAppSelector(s => s.quiz.currentQuiz)
    const {id} = useParams<{id:string}>()
    const dispatch = useAppDispatch()
    useEffect(() => {
        if(id){
            dispatch(fetchQuizById(id))
        }
      
    }, [dispatch, id])

    useEffect(() => {
      console.log(currentQuiz)
    }, [currentQuiz])
    
    
  return (
    <div className='w-full max-w-3xl m-auto py-5 flex flex-col gap-4'>
        <GoBack to="/"/>
        <Details/>
        <QuestionComponent/>
    </div>
  )
}