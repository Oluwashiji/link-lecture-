/**
 * offlineChatService.js
 * ----------------------
 * Pure, dependency-free, keyword-based rule engine used as the last-resort
 * fallback when no AI provider is available. It makes no network calls and
 * has no external dependencies, so it can never itself fail — this is what
 * guarantees the chatbot always responds to the user.
 */

const INTENTS = [
  {
    name: 'greeting',
    keywords: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy'],
    response: "Hi! I'm LL Assistant. I can help you find course materials, check assignments, announcements, timetables, and more. What do you need?"
  },
  {
    name: 'course_materials',
    keywords: ['material', 'materials', 'note', 'notes', 'lecture note', 'slide', 'slides', 'pdf', 'document', 'resource', 'resources', 'textbook'],
    response: "You can find lecture materials and notes in the Materials section of your dashboard. Use the search bar there to filter by course code, title, or tag."
  },
  {
    name: 'assignments',
    keywords: ['assignment', 'assignments', 'homework', 'coursework', 'submit', 'submission', 'deadline'],
    response: "Assignments and submission deadlines are posted under your course pages. Check the Assignments tab on your dashboard, and be sure to submit before the stated deadline."
  },
  {
    name: 'announcements',
    keywords: ['announcement', 'announcements', 'news', 'update', 'updates', 'notice'],
    response: "Announcements from your department and lecturers are posted in the Announcements section of the dashboard, so check there for the latest updates."
  },
  {
    name: 'timetable',
    keywords: ['timetable', 'schedule', 'class time', 'when is', 'lecture time', 'exam time'],
    response: "Your class timetable is available on the Timetable page, showing all your scheduled lectures by day and time for your department and level."
  },
  {
    name: 'lecturers',
    keywords: ['lecturer', 'lecturers', 'professor', 'instructor', 'teacher', 'tutor', 'staff'],
    response: "You can find lecturer contact information and their courses under the Lecturers or Staff Directory section of the platform."
  },
  {
    name: 'department',
    keywords: ['department', 'faculty', 'programme', 'program', 'course of study'],
    response: "Department information, including available courses and programme structure, can be found on your Department page after logging in."
  },
  {
    name: 'auth',
    keywords: ['login', 'log in', 'sign in', 'signin', 'register', 'sign up', 'signup', 'password', 'forgot password', 'account'],
    response: "To log in, use your registered email and password on the login page. If you don't have an account yet, use the Register page. Forgot your password? Use the 'Forgot Password' link on the login screen."
  },
  {
    name: 'exams',
    keywords: ['exam', 'exams', 'examination', 'examinations', 'test', 'quiz', 'cbt', 'past question'],
    response: "Examination schedules and past questions, where available, are posted in the Examinations section. Check with your department for official exam timetables."
  },
  {
    name: 'help',
    keywords: ['help', 'support', 'issue', 'problem', 'not working', 'error', 'trouble', 'contact'],
    response: "I'm here to help! You can also reach platform support through the Contact/Support link in the footer, or speak with your department admin for account-specific issues."
  },
  {
    name: 'about',
    keywords: ['what is lecture-link', 'about lecture-link', 'what can you do', 'who are you', 'what is this platform'],
    response: "Lecture-Link is an AI-enhanced departmental learning portal where you can access course materials, assignments, announcements, timetables, and connect with your department, all in one place."
  },
];

const DEFAULT_FALLBACK =
  "I'm currently operating in offline assistance mode. I can help with course materials, assignments, announcements, lecturers, examinations, timetables, and general information about the LECTURE-LINK portal.";

/**
 * Returns a predefined response for the best-matching intent, or the
 * default fallback message if nothing matches.
 * @param {string} message
 * @returns {string}
 */
function getOfflineReply(message) {
  if (!message || !message.trim()) return DEFAULT_FALLBACK;
  const text = message.toLowerCase();

  for (const intent of INTENTS) {
    if (intent.keywords.some(kw => text.includes(kw))) {
      return intent.response;
    }
  }
  return DEFAULT_FALLBACK;
}

module.exports = { getOfflineReply, DEFAULT_FALLBACK, INTENTS };
