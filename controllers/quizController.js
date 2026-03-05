const path = require("path");
const sequelize = require("sequelize");
const SQL = require("../models/Connections/SQL-Driver"); // your Sequelize instance
const initModels = require("../models/index"); // path to index.js
const models = initModels(SQL); // initialize models
const { course, course_student, student } = models;
const Quiz = require("../models/NOSQL/Quiz.js");
function getCurrentTime() {
  let now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();

  // Pad hours and minutes with leading zeros if necessary
  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;

  return `${hours}:${minutes}`;
}
exports.addQuiz = async (req, res) => {
  try {
    const { course_id } = req.params;
    const {
      title,
      description,
      start_date,
      start_time,
      duration,
      total_points,
      questions,
    } = req.body;

    const nowDate = new Date().toISOString().split("T")[0];
    const nowTime = getCurrentTime(); // HH:MM
    console.log(nowDate, nowTime);
    console.log(start_date, start_time);
    console.log(nowDate > start_date);
    if (nowDate > start_date) {
      return res.status(400).json({
        status: "failure",
        message: "You can't make a past quiz",
      });
    } else if (
      nowDate === start_date &&
      nowTime.toString() > start_time.toString()
    ) {
      return res.status(400).json({
        status: "failure",
        message: "You can't make a past quiz",
      });
    }

    let totalMarks = 0;
    for (let question of questions) {
      totalMarks += question.points;
    }
    if (totalMarks != total_points) {
      return res.status(400).json({
        error: "Total marks don't match the total points of the questions",
      });
    }

    const newQuiz = await new Quiz({
      course_id: course_id,
      title: title,
      description: description,
      start_date: start_date,
      start_time: start_time,
      duration: duration,
      total_points: total_points,
      questions: questions,
    }).save();

    res.status(201).json({
      status: "success",
      data: newQuiz,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
exports.deleteQuiz = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    const deletedQuiz = await Quiz.findByIdAndDelete(quiz_id);
    if (!deletedQuiz) {
      return res.status(404).json({
        status: "failure",
        message: "Quiz not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Quiz Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
exports.getAllQuizes = async (req, res) => {
  try {
    const { course_id } = req.params;
    const allQuizes = await Quiz.find({ course_id: course_id });

    if (!allQuizes) {
      return res.status(404).json({
        status: "failure",
        message: "this course doesn't have any quiz",
      });
    }
    res.status(200).json({
      status: "success",
      data: allQuizes,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
exports.getQuiz = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    const quiz = await Quiz.findById(quiz_id);
    if (!quiz) {
      return res.status(404).json({
        status: "failure",
        message: "quiz not found",
      });
    }
    res.status(200).json({
      status: "success",
      data: quiz,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

async function calculateNewMarks(quiz_id, newQuestions) {
  const quiz = await Quiz.findById(quiz_id);
  if (!quiz) throw new Error("Quiz not found");

  const questionsMap = {};
  for (const q of newQuestions) {
    questionsMap[q.question_text] = q;
  }

  for (const submission of quiz.Submissions) {
    let newMark = 0;

    submission.questions_submission = submission.questions_submission.map(
      (qs) => {
        const newQuestion = questionsMap[qs.question_text];
        if (!newQuestion) return qs;

        const correctOptions = newQuestion.options
          .filter((opt) => opt.isCorrectAnswer)
          .map((opt) => opt.option_text);

        const updatedCorrectAnswerText = correctOptions.join(", ");
        const isCorrect = correctOptions.includes(qs.choosed_answer);

        if (isCorrect) {
          newMark += newQuestion.points;
        }

        return {
          ...qs,
          correct_answer: updatedCorrectAnswerText || "No correct answer found",
        };
      }
    );

    submission.mark = newMark;
  }

  await quiz.save();
}

exports.editQuiz = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    const {
      title,
      description,
      start_date,
      start_time,
      duration,
      total_points,
      questions,
    } = req.body;

    const nowDate = new Date().toISOString().split("T")[0];
    const nowTime = getCurrentTime(); // HH:MM

    if (
      nowDate > start_date ||
      (nowDate === start_date && nowTime > start_time)
    ) {
      return res.status(400).json({
        status: "failure",
        message: "You can't make a past quiz",
      });
    }

    let totalMarks = 0;
    for (let question of questions) {
      totalMarks += question.points;
    }

    if (totalMarks != total_points) {
      return res.status(400).json({
        error: "Total marks don't match the total points of the questions",
      });
    }

    const existingQuiz = await Quiz.findById(quiz_id);

    if (!existingQuiz) {
      return res.status(404).json({
        status: "failure",
        message: "Quiz not found",
      });
    }

    if (existingQuiz.Submissions && existingQuiz.Submissions.length > 0) {
      await calculateNewMarks(quiz_id, questions);
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      quiz_id,
      {
        title,
        description,
        start_date,
        start_time,
        duration,
        total_points,
        questions,
      },
      { new: true }
    );

    res.status(200).json({
      status: "success",
      message: "quiz updated successfully",
      data: updatedQuiz,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours < 10 ? "0" + hours : hours}:${mins < 10 ? "0" + mins : mins}`;
}

exports.getQuizesForCourseForStudent = async (req, res) => {
  try {
    const { course_id } = req.params;
    const quizes = await Quiz.find({ course_id: course_id }).select(
      "-questions -Submissions"
    );

    if (!quizes) {
      return res.status(404).json({
        status: "failure",
        message: "no quizes found",
      });
    }
    let student_id;
    if (req.role === "student") {
      student_id = req.user.id;
    } else {
      student_id = req.params.student_id;
    }
    const nowDate = new Date().toISOString().split("T")[0]; // YEAR-MONTH-DAY
    const nowTime = getCurrentTime(); // HH:MM

    let allQuizes = [];
    for (let oneQuiz of quizes) {
      const startDate = oneQuiz.start_date;
      const startTime = oneQuiz.start_time; // HH:MM
      const duration = oneQuiz.duration; // in minutes

      // Convert start_time to minutes
      const startTimeInMinutes = timeToMinutes(startTime);

      // Calculate the end time by adding duration to start time
      const endTimeInMinutes = startTimeInMinutes + duration;
      const endTime = minutesToTime(endTimeInMinutes); // Convert back to HH:MM format

      const toPushQuiz = {
        quiz_id: oneQuiz._id,
        title: oneQuiz.title,
        description: oneQuiz.description,
        start_date: oneQuiz.start_date,
        start_time: oneQuiz.start_time,
        end_time: endTime, // Add the calculated end time
        duration: oneQuiz.duration,
        total_points: oneQuiz.total_points,
        able_to_view: oneQuiz.able_to_view,
        status: "", // Start with an empty status
      };
      const quiz = await Quiz.findById(oneQuiz._id).select("Submissions");

      if (!quiz) {
        console.error("Quiz not found");
        return false;
      }

      const foundSubmission = quiz.Submissions.find(
        (submission) => submission.student_id === student_id
      );
      isQuizSubmitted = !!foundSubmission;
      console.log("student_id", student_id);
      // Check if the current date and time are past the start and end times of the quiz
      if (nowDate > startDate || (nowDate === startDate && nowTime > endTime)) {
        if (isQuizSubmitted) {
          toPushQuiz.status = "finished";
        } else {
          toPushQuiz.status = "not submitted";
        }
      } else if (
        nowDate === startDate &&
        nowTime >= startTime &&
        nowTime <= endTime
      ) {
        // If current time is between start_time and end_time
        if (!isQuizSubmitted) toPushQuiz.status = "able to start";
        else toPushQuiz.status = "finished";
      } else if (
        nowDate < startDate ||
        (nowDate === startDate && nowTime < startTime)
      ) {
        // If the quiz is upcoming
        toPushQuiz.status = "Upcoming";
      }

      allQuizes.push(toPushQuiz);
    }

    res.status(200).json({
      status: "success",
      data: allQuizes,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
exports.getQuizToStart = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    console.log(quiz_id);
    const startedQuiz = await Quiz.find({ _id: quiz_id }).select(
      "-able_to_view -Submissions"
    );

    res.status(200).json({
      status: "success",
      data: startedQuiz,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
exports.submitQuiz = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    const student_id = req.user?.id;

    if (!student_id) {
      return res
        .status(400)
        .json({ status: "failure", message: "Student ID missing" });
    }

    const { answers } = req.body;
    const quiz = await Quiz.findById(quiz_id);
    if (!quiz) {
      return res
        .status(404)
        .json({ status: "failure", message: "Quiz not found" });
    }

    let totalPoint = 0;

    // Map questions by ID or text for quick lookup
    const questionsMap = {};
    for (const q of quiz.questions) {
      questionsMap[q.question_text] = q; // Using question_text as key
    }

    // Function to check if student's chosen answer is correct
    function isAnswerCorrect(question, choosedAnswer) {
      if (Array.isArray(choosedAnswer)) {
        return choosedAnswer.some((ans) => {
          return question.options.some(
            (opt) =>
              opt._id.toString() === ans._id && opt.isCorrectAnswer === true
          );
        });
      } else {
        return question.options.some(
          (opt) =>
            opt._id.toString() === choosedAnswer._id &&
            opt.isCorrectAnswer === true
        );
      }
    }

    // Calculate total score based on correct answers
    for (const oneAnswer of answers) {
      const questionId = oneAnswer._id;
      const choosedAnswer = oneAnswer.choosed_answer;
      const question = questionsMap[oneAnswer.question_text];
      if (!question) continue;

      if (isAnswerCorrect(question, choosedAnswer)) {
        totalPoint += question.points;
      }
    }

    // Build submission object including student's answers and the correct answers
    const submission = {
      student_id: student_id,
      mark: totalPoint,
      questions_submission: answers.map((ans) => {
        let choosedAnswerText = "";
        let correctAnswerText = "";

        // Extract student's chosen answer text
        if (Array.isArray(ans.choosed_answer)) {
          choosedAnswerText = ans.choosed_answer
            .map((a) => a.choosed_answer)
            .filter((text) => text)
            .join(", ");
        } else if (ans.choosed_answer && ans.choosed_answer.choosed_answer) {
          choosedAnswerText = ans.choosed_answer.choosed_answer;
        }
        if (!choosedAnswerText) choosedAnswerText = "No answer";

        // Find the original question from quiz questions
        const originalQuestion = questionsMap[ans.question_text];

        if (originalQuestion) {
          // Get all correct options texts concatenated
          correctAnswerText = originalQuestion.options
            .filter((opt) => opt.isCorrectAnswer)
            .map((opt) => opt.option_text)
            .join(", ");
        }

        return {
          question_text: ans.question_text || "No question text",
          choosed_answer: choosedAnswerText,
          correct_answer: correctAnswerText || "No correct answer found",
        };
      }),
      submited_at: new Date().toISOString().split("T")[0], // Current date as YYYY-MM-DD
    };

    // Add submission to quiz and save
    quiz.Submissions.push(submission);
    await quiz.save();

    // Respond with success and total score
    res.status(201).json({
      status: "success",
      totalPoints: totalPoint,
      data: submission,
    });
  } catch (error) {
    // Handle unexpected errors
    res.status(500).json({ error: error.message });
  }
};

exports.showQuizMark = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    let student_id;

    if (req.role === "parent") {
      student_id = req.params.student_id;
    } else if (req.role === "student") {
      student_id = req.user.id;
    } else {
      student_id = req.params.student_id;
    }

    const quiz = await Quiz.findById(quiz_id);
    if (!quiz) {
      return res.status(404).json({
        status: "failure",
        message: "Quiz not found",
      });
    }

    const submission = quiz.Submissions.find(
      (sub) => sub.student_id === student_id
    );

    if (submission) {
      const detailedQuestions = submission.questions_submission.map((qs) => {
        const originalQuestion = quiz.questions.find(
          (q) => q.question_text === qs.question_text
        );

        let choices = [];
        let points = 0;

        if (originalQuestion) {
          choices = originalQuestion.options.map((opt) => ({
            option_text: opt.option_text,
            isCorrectAnswer: opt.isCorrectAnswer,
          }));
          points = originalQuestion.points;
        }

        return {
          question_text: qs.question_text,
          choosed_answer: qs.choosed_answer,
          correct_answer: qs.correct_answer || "",
          choices,
          points,
        };
      });

      return res.status(200).json({
        status: "success",
        data: {
          submited_at: submission.submited_at,
          mark: submission.mark,
          quiz_title: quiz.title,
          quiz_description: quiz.description,
          total_points: quiz.total_points,
          questions: detailedQuestions,
        },
      });
    } else {
      return res.status(200).json({
        status: "success",
        data: {
          submited_at: "Not submitted",
          mark: "Don't have mark",
          questions: [],
        },
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.showQuizSubmissions = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    const findedCourse = await Quiz.findById(quiz_id);
    if (!findedCourse) {
      return res
        .status(404)
        .json({ status: "failure", message: "Quiz not found" });
    }

    const StudentsInCourse = await course_student.findAll({
      where: {
        course_id: findedCourse.course_id,
      },
      attributes: [],
      include: {
        model: student,
        as: "student",
        attributes: ["student_id", "first_name", "last_name"],
      },
    });

    const finalSubmissions = [];

    for (const oneStudent of StudentsInCourse) {
      const studentData = oneStudent.student;
      const fullName = `${studentData.first_name} ${studentData.last_name}`;

      // Find the student's submission in the quiz submissions
      const submission = findedCourse.Submissions.find(
        (sub) => sub.student_id === studentData.student_id
      );

      if (submission) {
        // For each question answered by the student, build detailed info
        const detailedQuestions = submission.questions_submission.map((qs) => {
          // Find the original question in quiz.questions by matching question_text
          const originalQuestion = findedCourse.questions.find(
            (q) => q.question_text === qs.question_text
          );

          // If found original question, prepare correct answers and all choices
          let correctAnswersText = [];
          let allChoices = [];

          if (originalQuestion) {
            correctAnswersText = originalQuestion.options
              .filter((opt) => opt.isCorrectAnswer)
              .map((opt) => opt.option_text);

            allChoices = originalQuestion.options.map((opt) => opt.option_text);
          }

          return {
            question_text: qs.question_text,
            student_answer: qs.choosed_answer,
            correct_answer: correctAnswersText.join(", "),
            choices: allChoices,
          };
        });

        finalSubmissions.push({
          fullName,
          submited_at: submission.submited_at,
          mark: submission.mark,
          questions: detailedQuestions,
        });
      } else {
        // No submission found for this student
        finalSubmissions.push({
          fullName,
          submited_at: "Not submitted",
          mark: "Not marked",
          questions: [],
        });
      }
    }

    res.status(200).json({
      status: "success",
      data: finalSubmissions,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

exports.publicQuizMarks = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    const { able_to_view } = req.body; // true false
    const updatedQuiz = await Quiz.findById(quiz_id);

    if (!updatedQuiz) {
      return res.status(400).json({
        status: "failure",
        message: "the quiz not found",
      });
    }

    updatedQuiz.able_to_view = able_to_view;
    await updatedQuiz.save();

    res.status(201).json({
      status: "sucess",
      message: `the Ability to view marks is ${able_to_view}`,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
