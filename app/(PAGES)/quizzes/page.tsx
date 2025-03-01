"use client";

import Loader from "@/components/loader";
import QuizCard from "@/components/QuizCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchQuizzes } from "@/lib/features/quizSlice"; // Action for fetching quizzes
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { Quiz } from "@/types";
import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";

const QuizzesPage = () => {
  const dispatch = useAppDispatch();
  const { quizzes, loading, error } = useAppSelector((state) => state.quiz);
  const [searchFilterInput, setSearchFilterInput] = useState("");

  const filteredQuiz = quizzes.filter(
    (quiz) =>
      quiz.title.includes(searchFilterInput) ||
      quiz.description?.includes(searchFilterInput)||
      quiz.createdBy.includes(searchFilterInput)
  )
  const [searchFilter, setSearchFilter] = useState<Quiz[]>(filteredQuiz);

  useEffect(() => {
    setSearchFilterInput("")

    return()=>{
      setSearchFilterInput("")
    }
  }, [])
  

  useEffect(() => {
    dispatch(fetchQuizzes());
  }, [dispatch]);
  const handleSearch = () => {
    setSearchFilter(
      filteredQuiz
    );
  };

  if (loading) return <Loader />;
  if (error) return <div>Error loading quizzes: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl px-4 font-bold text-center text-gray-800 mb-8">
          Available Quizzes
        </h1>
        <div className="w-full bg-gray-100 p-2 mx-auto mb-4 flex justify-center items-center gap-2 sticky top-11 sm:top-14">
          <Input
            onChange={(e) => setSearchFilterInput(e.target.value)}
            className="border-neutral-400 border-[1px] max-w-md"
            placeholder="Search for quiz"
            type="text"
          />
          <Button onClick={handleSearch} variant={"outline"}>
            <SearchIcon />
            Search
          </Button>
        </div>
        <div className="px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {searchFilter?.length === 0 ? (
            <div className="col-span-full text-center">
              <p>No quizzes available at the moment.</p>
            </div>
          ) : (
            searchFilter
              .toReversed()
              .map((quiz) => (
                <QuizCard
                  key={quiz._id}
                  quiz={{
                    title: quiz.title,
                    duration: quiz.duration,
                    questionsCount:
                      "questions" in quiz ? quiz.questions.length : 0,
                    _id: quiz._id,
                  }}
                />
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizzesPage;
