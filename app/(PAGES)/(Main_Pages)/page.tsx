"use client"

import Loader from '@/components/loader';
import QuizCard from '@/components/QuizCard';
import { fetchQuizzes } from '@/lib/features/quizSlice'; // Action for fetching quizzes
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { ArrowRightCircleIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

const HomePage = () => {
  const dispatch = useAppDispatch();
  const { quizzes, loading, error } = useAppSelector(state=> state.quiz);
  
  useEffect(() => {
    dispatch(fetchQuizzes()); 
    
  }, [dispatch]);

  if (loading) return <Loader/>;
  if (error) return <div>Error loading quizzes: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Recent Quizzes</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {quizzes?.length === 0 ? (
            <div className="col-span-full text-center">
              <p>No quizzes available at the moment.</p>
            </div>
          ) : (
            quizzes?.slice(-4).toReversed().map((quiz) => (
              <QuizCard
                key={quiz._id}
                quiz={
                  {title:quiz.title,
                duration:quiz.duration,
                questionsCount:'questions' in quiz ? quiz.questions.length : 0,
                _id:quiz._id,}
                }
              />
            ))
          )}
        </div>

        <span className="w-full flex items-center justify-center mt-4">
        <Link href="/quizzes" className='py-2 px-4 bg-neutral-900 group text-neutral-200 rounded-md flex items-center justify-center gap-3'>
        See all quizzes
        <ArrowRightCircleIcon className=' group-hover:animate-bounce-right'/>
        </Link>
        </span>
        
      </div>
    </div>
  );
};

export default HomePage;
