import React, { useState, useEffect, useRef, useMemo } from "react";
import Container from "react-bootstrap/Container";
import Stack from "react-bootstrap/Stack";
import GuessPanel from "../components/binary/GuessPanel";
import Question, {
  QuestionHandle,
  QuestionType,
} from "../components/binary/Question";
import ResultDisplay from "../components/ResultDisplay";

type QuestionModel = {
  type: QuestionType;
  initialVal: number;
  arg: number;
};

const BinaryGame = () => {
  const [guess, setGuess] = useState(0);
  const [score, setScore] = useState(0);

  const onGuessChanged = (value: number) => {
    setGuess(value);
    if (activeQuestionRef.current?.getAnswer() === value) {
      questions.shift();
      setScore((sc) => sc + 6 - questions.length);
      setQuestions([...questions]);
      setGuess(Math.floor(Math.random() * 256) - 128);
    }
  };

  const [questions, setQuestions] = useState<Array<QuestionModel>>([
    {
      type: QuestionType.DEC2BIN,
      initialVal: Math.floor(Math.random() * 256) - 128,
      arg: 0,
    },
  ]);

  const activeQuestionRef = useRef<QuestionHandle | null>(null);
  const futureQuestionsRef = useRef<HTMLDivElement | null>(null);

  const addQuestion = useMemo(
    () => () => {
      let qt = Math.floor(Math.random() * QuestionType.MAX);
      let arg = 0;
      if (qt === QuestionType.ARI_SH || qt === QuestionType.LOG_SH) {
        arg = Math.floor(Math.random() * 15) - 7;
      } else if (qt === QuestionType.ADDITION) {
        arg = Math.floor(Math.random() * 256) - 128;
      }
      let newQuestion = {
        type: qt,
        initialVal: Math.floor(Math.random() * 256) - 128,
        arg,
      };
      setQuestions((qs) => (qs.length < 5 ? [...qs, newQuestion] : qs));
      setTimeout(addQuestion, 5000);
      futureQuestionsRef.current?.scrollTo(
        0,
        futureQuestionsRef.current?.scrollHeight
      );
    },
    []
  );

  useEffect(() => {
    setTimeout(addQuestion, 5000);
  }, [addQuestion]);

  return (
    <Container className="mt-5">
      <div className="w-100">
        <Stack>
          <div
            style={{ height: "400px", overflowY: "hidden" }}
            ref={futureQuestionsRef}
          >
            {questions.length > 1
              ? questions
                  .slice(1, Math.min(6, questions.length))
                  .reverse()
                  .map((q, i) => (
                    <Question
                      key={i}
                      ref={activeQuestionRef}
                      questionType={q.type}
                      initialValue={q.initialVal}
                      arg={q.arg}
                    />
                  ))
              : undefined}
          </div>
          {questions.length > 0 ? (
            <Question
              ref={activeQuestionRef}
              questionType={questions[0].type}
              initialValue={questions[0].initialVal}
              arg={questions[0].arg}
            />
          ) : undefined}
        </Stack>

        <GuessPanel
          value={guess}
          onValueChanged={onGuessChanged}
          questionType={questions.length > 1 ? questions[0].type : undefined}
        />
        <ResultDisplay score={score} />
      </div>
    </Container>
  );
};

export default BinaryGame;
