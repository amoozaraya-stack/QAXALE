import React, { useState } from "react";
import {
  GraduationCap,
  BookOpen,
  Code2,
  BrainCircuit,
  Cpu,
  Globe,
  Briefcase,
  CheckCircle2,
  Clock,
  Award,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Check,
  X,
  HelpCircle,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { COURSES_DATA } from "../data/learningContent";
import { Course, Lesson, QuizQuestion } from "../types";

export const LearnView: React.FC = () => {
  const { language, progress, completeLesson, createConversation, addMessageToActiveConversation, setActiveTab } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<{ [quizId: string]: number }>({});
  const [revealedQuiz, setRevealedQuiz] = useState<{ [quizId: string]: boolean }>({});

  const categories = [
    { id: "all", label: { om: "Hunda", en: "All" } },
    { id: "programming", label: { om: "Saganteessuu", en: "Programming" } },
    { id: "ai", label: { om: "AI & ML", en: "AI & ML" } },
    { id: "cs", label: { om: "Saayinsii Kompiitaraa", en: "Computer Science" } },
    { id: "digital-tech", label: { om: "Web & Dijitaalaa", en: "Web & Digital" } },
    { id: "business", label: { om: "Daldala", en: "Business" } },
  ];

  const filteredCourses = COURSES_DATA.filter((course) => {
    if (selectedCategory === "all") return true;
    return course.category === selectedCategory;
  });

  const handleOpenLesson = (course: Course, lesson: Lesson) => {
    setActiveCourse(course);
    setActiveLesson(lesson);
    setSelectedAnswers({});
    setRevealedQuiz({});
  };

  const handleSelectAnswer = (quizId: string, optionIdx: number) => {
    if (revealedQuiz[quizId]) return;
    setSelectedAnswers((prev) => ({ ...prev, [quizId]: optionIdx }));
  };

  const handleCheckQuiz = (quiz: QuizQuestion) => {
    const chosen = selectedAnswers[quiz.id];
    if (chosen === undefined) return;

    setRevealedQuiz((prev) => ({ ...prev, [quiz.id]: true }));
    if (chosen === quiz.correctIndex && activeLesson) {
      completeLesson(activeLesson.id, 50);
    }
  };

  const handleAskAiAboutLesson = () => {
    if (!activeLesson) return;
    const prompt =
      language === "om"
        ? `Mata-duree barumsaa '${activeLesson.title.om}' irratti ibsa dabalataa fi fakkeenyota qabatamaa naaf kenni.`
        : `Please give me deeper explanations and real-world examples for the lesson: '${activeLesson.title.en}'.`;

    createConversation(`Barnoota: ${activeLesson.title[language]}`);
    addMessageToActiveConversation({
      role: "user",
      content: prompt,
      mode: "step-by-step",
    });
    setActiveTab("chat");
  };

  // Lesson Detail View
  if (activeLesson && activeCourse) {
    const isCompleted = progress.completedLessonIds.includes(activeLesson.id);

    return (
      <div className="space-y-4 pb-24 animate-in fade-in duration-200">
        {/* Back Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveLesson(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === "om" ? "Koorsootaatti Deebi'i" : "Back to Courses"}</span>
          </button>

          <button
            onClick={handleAskAiAboutLesson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all active:scale-95 shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === "om" ? "AI Barsiisaa Gaafadhu" : "Ask AI Tutor"}</span>
          </button>
        </div>

        {/* Lesson Header Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-400 mb-1">
            <span className="uppercase tracking-wider">{activeCourse.title[language]}</span>
            <div className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{activeLesson.durationMin} daqiiqaa / min</span>
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-white mt-1">
            {activeLesson.title[language]}
          </h2>
          <p className="text-xs text-slate-300 mt-1">{activeLesson.summary[language]}</p>
        </div>

        {/* Lesson Content Body */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4.5 space-y-4 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
          {activeLesson.content[language]}
        </div>

        {/* Code Example Widget if present */}
        {activeLesson.codeExample && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5" /> Fakkeenya Koodii ({activeLesson.codeExample.language})
              </span>
            </div>
            <pre className="bg-slate-900 p-3 rounded-xl font-mono text-xs text-emerald-400 overflow-x-auto border border-slate-800">
              {activeLesson.codeExample.code}
            </pre>
            <p className="text-xs text-slate-400 italic">
              💡 {activeLesson.codeExample.explanation[language]}
            </p>
          </div>
        )}

        {/* Key Takeaways Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/20 rounded-2xl p-4 space-y-2">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" /> {language === "om" ? "Qabxiilee Ijoo" : "Key Takeaways"}
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {activeLesson.keyTakeaways[language].map((t, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Interactive Quiz Section */}
        {activeLesson.quiz && activeLesson.quiz.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>{language === "om" ? "Madaallii Hubannoo (Quiz)" : "Knowledge Check"}</span>
              </h4>
              <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
                +50 XP
              </span>
            </div>

            {activeLesson.quiz.map((q) => {
              const selectedIdx = selectedAnswers[q.id];
              const isRevealed = revealedQuiz[q.id];
              const isCorrect = selectedIdx === q.correctIndex;

              return (
                <div key={q.id} className="space-y-3 pt-2">
                  <p className="text-xs sm:text-sm font-semibold text-slate-100">
                    {q.question[language]}
                  </p>

                  <div className="space-y-2">
                    {q.options[language].map((opt, idx) => {
                      const isChosen = selectedIdx === idx;
                      let btnStyle = "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700";

                      if (isRevealed) {
                        if (idx === q.correctIndex) {
                          btnStyle = "bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold";
                        } else if (isChosen && !isCorrect) {
                          btnStyle = "bg-red-950/60 border-red-500 text-red-300";
                        }
                      } else if (isChosen) {
                        btnStyle = "bg-amber-500/20 border-amber-400 text-amber-300 font-bold";
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectAnswer(q.id, idx)}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {isRevealed && idx === q.correctIndex && (
                            <Check className="w-4 h-4 text-emerald-400" />
                          )}
                          {isRevealed && isChosen && !isCorrect && (
                            <X className="w-4 h-4 text-red-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {!isRevealed ? (
                    <button
                      onClick={() => handleCheckQuiz(q)}
                      disabled={selectedIdx === undefined}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                        selectedIdx !== undefined
                          ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md active:scale-95"
                          : "bg-slate-800 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      {language === "om" ? "Mirkaneessi (Submit)" : "Check Answer"}
                    </button>
                  ) : (
                    <div
                      className={`p-3 rounded-xl text-xs border ${
                        isCorrect
                          ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                          : "bg-red-950/40 border-red-500/30 text-red-300"
                      }`}
                    >
                      <p className="font-bold mb-1">
                        {isCorrect
                          ? (language === "om" ? "🎉 BAGA GAMMADDE! Sirriidha!" : "🎉 AWESOME! Correct!")
                          : (language === "om" ? "❌ Sirrii miti. Ibsa kana dubbisi:" : "❌ Not quite. Review explanation:")}
                      </p>
                      <p className="text-slate-300">{q.explanation[language]}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Complete Lesson Action */}
        <button
          onClick={() => {
            completeLesson(activeLesson.id, 50);
            setActiveLesson(null);
          }}
          className={`w-full py-3 rounded-xl font-bold text-xs transition-all shadow-lg flex items-center justify-center gap-2 ${
            isCompleted
              ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
              : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-95"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>
            {isCompleted
              ? (language === "om" ? "Xumurameera (Koorsootatti Deebi'i)" : "Completed (Back to Courses)")
              : (language === "om" ? "Xumuri & 50 XP Fudhadhu" : "Mark Complete & Earn 50 XP")}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-300">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-white">
            {language === "om" ? "Wiirtuu Barumsaa QAXALE" : "QAXALE Learning Center"}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === "om"
              ? "Saganteessuu, AI, Saayinsii Kompiitaraa & Daldala"
              : "Interactive curriculum designed for Afaan Oromoo learners"}
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === c.id
                ? "bg-amber-500 text-slate-950 shadow-sm font-bold"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            {c.label[language]}
          </button>
        ))}
      </div>

      {/* Course Cards Grid */}
      <div className="space-y-3.5">
        {filteredCourses.map((course) => {
          const completedCount = course.lessons.filter((l) =>
            progress.completedLessonIds.includes(l.id)
          ).length;
          const totalCount = course.lessons.length;
          const percent = Math.round((completedCount / totalCount) * 100);

          return (
            <div
              key={course.id}
              className="rounded-2xl bg-slate-900 border border-slate-800/90 overflow-hidden shadow-md transition-all hover:border-slate-700"
            >
              {/* Course Top Header */}
              <div className="p-4 border-b border-slate-800/80">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${course.color}20`, color: course.color }}
                    >
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {course.level}
                      </span>
                      <h3 className="text-sm font-bold text-white leading-tight">
                        {course.title[language]}
                      </h3>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-amber-400">{percent}%</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {course.description[language]}
                </p>

                {/* Progress Bar */}
                <div className="w-full bg-slate-950 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 transition-all duration-500 rounded-full"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              {/* Lessons List in Course */}
              <div className="p-2 divide-y divide-slate-800/40 bg-slate-950/40">
                {course.lessons.map((lesson) => {
                  const isDone = progress.completedLessonIds.includes(lesson.id);
                  return (
                    <div
                      key={lesson.id}
                      onClick={() => handleOpenLesson(course, lesson)}
                      className="p-2.5 rounded-xl hover:bg-slate-900 flex items-center justify-between cursor-pointer transition-colors active:scale-[0.99] group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                            isDone
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-slate-800 text-slate-400 group-hover:text-amber-400"
                          }`}
                        >
                          {isDone ? <Check className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-slate-200 group-hover:text-white">
                            {lesson.title[language]}
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            {lesson.durationMin} daqiiqaa
                          </span>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
