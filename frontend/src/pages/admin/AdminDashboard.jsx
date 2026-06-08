import { Children, useEffect, useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Download, Edit3, Mic, Plus, Save, Trash2, Upload, Volume2 } from 'lucide-react';
import { api } from '../../api/client';
import UserManagement from './UserManagement';
import { durationForType, examDurationMinutes } from '../../utils/examDuration';

const types = ['READING', 'LISTENING', 'WRITING', 'SPEAKING', 'GRAMMAR', 'MIXED'];
const examMatchesSkill = (item, skill) => item.type === skill || item.type === 'MIXED';
const questionTypes = ['MULTIPLE_CHOICE', 'LISTENING_AUDIO', 'PARAGRAPH_ORDER', 'MATCHING_DROPDOWN', 'OPINION_MATCH', 'INLINE_DROPDOWN', 'PASSAGE_MATCH', 'ESSAY', 'SPEAKING_PROMPT', 'SPEAKING_IMAGE_TABLE', 'SPEAKING_COMPARE_IMAGES', 'SPEAKING_PART4_LIST'];
const questionTypeTemplates = {
  MULTIPLE_CHOICE: { content: '', optionA: '', optionB: '', optionC: '', optionD: '', optionE: '', optionF: '', audioUrl: '', imageUrl: '', imageUrl2: '', scriptText: '', correctAnswer: '', explanation: '', questionType: 'MULTIPLE_CHOICE' },
  LISTENING_AUDIO: { content: '', optionA: '', optionB: '', optionC: '', optionD: '', optionE: '', optionF: '', audioUrl: '', imageUrl: '', imageUrl2: '', scriptText: '', correctAnswer: '', explanation: '', questionType: 'LISTENING_AUDIO' },
  PARAGRAPH_ORDER: { content: 'Arrange the paragraphs in the correct order.', optionA: '', optionB: '', optionC: '', optionD: '', optionE: '', optionF: '', audioUrl: '', imageUrl: '', imageUrl2: '', scriptText: '', correctAnswer: 'A,B,C,D', explanation: '', questionType: 'PARAGRAPH_ORDER' },
  MATCHING_DROPDOWN: { content: 'Topic: ', optionA: '', optionB: '', optionC: '', optionD: '', optionE: '', optionF: '', audioUrl: '', imageUrl: '', imageUrl2: '', scriptText: '', correctAnswer: '', explanation: 'Person 1 to Person 4 answers in order.', questionType: 'MATCHING_DROPDOWN' },
  OPINION_MATCH: { content: 'Read the opinions and match each statement.', optionA: '', optionB: '', optionC: '', optionD: '', optionE: '', optionF: '', audioUrl: '', imageUrl: '', imageUrl2: '', scriptText: '', correctAnswer: '', explanation: 'Use MAN,WOMAN,BOTH in order.', questionType: 'OPINION_MATCH' },
  INLINE_DROPDOWN: { content: 'Write the sentence with [[blank]] where the dropdown should appear.', optionA: '', optionB: '', optionC: '', optionD: '', optionE: '', optionF: '', audioUrl: '', imageUrl: '', imageUrl2: '', scriptText: '', correctAnswer: '', explanation: '', questionType: 'INLINE_DROPDOWN' },
  PASSAGE_MATCH: { content: 'Topic: \n\n[PASSAGES]\nA: \nB: \nC: \nD: \n\n[QUESTIONS]\n', optionA: '', optionB: '', optionC: '', optionD: '', optionE: '', optionF: '', audioUrl: '', imageUrl: '', imageUrl2: '', scriptText: '', correctAnswer: '', explanation: 'Answers in question order, for example A,B,C,D.', questionType: 'PASSAGE_MATCH' },
  ESSAY: { content: '', optionA: '', optionB: '', optionC: '', optionD: '', optionE: '', optionF: '', audioUrl: '', imageUrl: '', imageUrl2: '', scriptText: '', correctAnswer: '', explanation: '', questionType: 'ESSAY' },
  SPEAKING_PROMPT: { content: '', optionA: '', optionB: '', optionC: '', optionD: '', optionE: '', optionF: '', audioUrl: '', imageUrl: '', imageUrl2: '', scriptText: '', correctAnswer: '', explanation: '', questionType: 'SPEAKING_PROMPT' },
  SPEAKING_IMAGE_TABLE: { content: '', optionA: '', optionB: '', optionC: '', optionD: '', optionE: '', optionF: '', audioUrl: '', imageUrl: '', imageUrl2: '', scriptText: '', correctAnswer: '', explanation: '', questionType: 'SPEAKING_IMAGE_TABLE' },
  SPEAKING_COMPARE_IMAGES: { content: 'Câu 1\nQuestion 2\nQuestion 3', optionA: '', optionB: '', optionC: '', optionD: '', optionE: '', optionF: '', audioUrl: '', imageUrl: '', imageUrl2: '', scriptText: '', correctAnswer: '', explanation: '', questionType: 'SPEAKING_COMPARE_IMAGES' },
  SPEAKING_PART4_LIST: { content: '', optionA: '', optionB: '', optionC: '', optionD: '', optionE: '', optionF: '', audioUrl: '', imageUrl: '', imageUrl2: '', scriptText: '', correctAnswer: '', explanation: '', questionType: 'SPEAKING_PART4_LIST' }
};
const emptyExam = { title: '', type: 'READING', duration: 35, transcript: '', audioUrl: '', prompt: '' };
const emptyPracticeExam = { title: '', type: 'MIXED', duration: 35, transcript: '', audioUrl: '', prompt: '' };
const emptyQuestion = { examId: '', content: '', optionA: '', optionB: '', optionC: '', optionD: '', optionE: '', optionF: '', audioUrl: '', imageUrl: '', imageUrl2: '', scriptText: '', correctAnswer: 'A', explanation: '', questionType: 'MULTIPLE_CHOICE' };
const emptyPracticeQuestion = { examId: '', content: '', optionA: '', optionB: '', optionC: '', optionD: '', optionE: '', optionF: '', audioUrl: '', imageUrl: '', imageUrl2: '', scriptText: '', correctAnswer: 'A', explanation: '', questionType: 'MULTIPLE_CHOICE' };
const emptyLesson = { title: '', type: 'READING', content: '' };
const emptyNotification = { title: '', content: '' };
const writingPart1Instruction = 'You are joining a Business club. Fill out the form. Write short answers (1-5 words) for each message (Bai nay nen tra loi dai nhat la 5 tu, viet hoa tu dau va dau cham ket thuc cau).';
const writingPart1Example = 'Example:\nQ: What is your hobby?\nA: I like listening to music.';
const defaultWritingPart1Rows = [
  { content: '', answer: '' },
  { content: '', answer: '' },
  { content: '', answer: '' },
  { content: '', answer: '' },
  { content: '', answer: '' }
];
const defaultWritingLongQuestion = {
  title: 'Câu 2 of 4 - Art club',
  instruction: "Now you've become a new member of the Art club. Fill in the form. Write in sentences. Use 20-30 words (Viết 20 đến 30 từ thôi nhé!).",
  content: '',
  answer: ''
};
const defaultWritingChatQuestion = {
  title: 'Câu 3 of 4 - Art club',
  instruction: 'You are speaking to fellow members of the Art club in a group chat. Respond to them in full sentences (30-40 words per answer).',
  rows: [
    { content: '', answer: '' },
    { content: '', answer: '' },
    { content: '', answer: '' }
  ]
};
const defaultWritingEmailQuestion = {
  title: 'Câu 4 of 4 - Email Writing',
  instruction: 'Write a short email (about 50 words) to your friend, and a longer email (120-150 words) to the president of the club.',
  context: '',
  rows: [
    { content: 'Write a short email to your friend (about 50 words).', answer: '' },
    { content: 'Write an email to the president of the club (about 120-150 words).', answer: '' }
  ]
};
const defaultGapDropdownQuestion = {
  instruction: 'Choose the word that fits in the gap. The first one is done for you.',
  intro: '',
  rows: [
    { before: '', after: '', answer: '', options: ['', '', '', '', '', ''] },
    { before: '', after: '', answer: '', options: ['', '', '', '', '', ''] },
    { before: '', after: '', answer: '', options: ['', '', '', '', '', ''] },
    { before: '', after: '', answer: '', options: ['', '', '', '', '', ''] },
    { before: '', after: '', answer: '', options: ['', '', '', '', '', ''] }
  ]
};
const defaultParagraphOrderTopicQuestion = {
  topic: '',
  instruction: 'Put the sentences below in the correct order to make a complete text.',
  rows: ['', '', '', '', ''],
  answer: ''
};
const defaultPassageMatchQuestion = {
  topic: '',
  passages: [
    { key: 'A', text: '' },
    { key: 'B', text: '' },
    { key: 'C', text: '' },
    { key: 'D', text: '' }
  ],
  questions: ['', '', '', '', '', '', ''],
  answers: ['', '', '', '', '', '', '']
};
const defaultReadingDropdownParagraphsQuestion = {
  title: 'Reading question 5 (1/11)',
  topic: '',
  instruction: '',
  rows: ['', '', '', '', '', '', ''],
  options: ['', '', '', '', '', '', '', ''],
  answers: ['', '', '', '', '', '', ''],
  tip: ''
};
const defaultListeningMatchingQuestion = {
  topic: '',
  instruction: 'Four people are discussing their views on the topic above. Complete the sentences. Use each answer only once. You will not need two of the answers.',
  audioUrl: '',
  audioUrls: ['', '', '', ''],
  transcript: '',
  options: ['', '', '', '', '', ''],
  answers: ['', '', '', '']
};
const defaultGrammarTermMatchQuestion = {
  instruction: '',
  operator: '=',
  rows: [
    { term: '', answer: '' },
    { term: '', answer: '' },
    { term: '', answer: '' },
    { term: '', answer: '' },
    { term: '', answer: '' }
  ],
  options: ['', '', '', '', '', '', '', '', '', '']
};
const defaultGrammarSentenceDropdownQuestion = {
  instruction: '',
  rows: [
    { before: '', after: '', answer: '' },
    { before: '', after: '', answer: '' },
    { before: '', after: '', answer: '' },
    { before: '', after: '', answer: '' },
    { before: '', after: '', answer: '' }
  ],
  options: ['', '', '', '', '', '', '', '', '', '']
};
const defaultListeningOpinionQuestion = {
  topic: '',
  instruction: "Listen to two people discussing potential modifications to the topic above. Read the statements and decide whose opinion matches best: the man's, the woman's, or both. Who expresses which opinion?",
  audioUrl: '',
  transcript: '',
  statements: ['', '', '', ''],
  answers: ['', '', '', '']
};
const defaultListeningGroupMcQuestion = {
  topic: '',
  audioUrl: '',
  transcript: '',
  questions: [
    { content: '', options: ['', '', ''], answer: '' },
    { content: '', options: ['', '', ''], answer: '' }
  ]
};
const defaultListeningSingleMcQuestion = {
  audioUrl: '',
  transcript: '',
  content: '',
  options: ['', '', ''],
  answer: ''
};
const defaultSpeakingQ1Rows = Array.from({ length: 10 }, () => ({ content: '', answer1: '', answer2: '' }));
const defaultSpeakingImageListQuestion = {
  title: 'Speaking II - Câu 1/37',
  imageUrl: '',
  imageUrl2: '',
  rows: [
    { content: '', answer: '' },
    { content: '', answer: '' },
    { content: '', answer: '' }
  ]
};
const defaultSpeakingPart4CardQuestion = {
  title: 'Tell me a time you saved up to buy something for yourself',
  rows: [
    { content: 'Tell me a time you saved up to buy something for yourself', answer: '' },
    { content: 'How did you feel?', answer: '' },
    { content: 'People spend too much money on unimportant things. What do you think?', answer: '' }
  ]
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [exams, setExams] = useState([]);
  const [practiceExams, setPracticeExams] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [exam, setExam] = useState(emptyExam);
  const [editingExamId, setEditingExamId] = useState(null);
  const [question, setQuestion] = useState(emptyQuestion);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [practiceExam, setPracticeExam] = useState(emptyPracticeExam);
  const [editingPracticeExamId, setEditingPracticeExamId] = useState(null);
  const [practiceQuestion, setPracticeQuestion] = useState(emptyPracticeQuestion);
  const [editingPracticeQuestionId, setEditingPracticeQuestionId] = useState(null);
  const [writingPart1ExamId, setWritingPart1ExamId] = useState('');
  const [writingPart1Rows, setWritingPart1Rows] = useState(defaultWritingPart1Rows);
  const [writingLongExamId, setWritingLongExamId] = useState('');
  const [writingLongQuestion, setWritingLongQuestion] = useState(defaultWritingLongQuestion);
  const [writingChatExamId, setWritingChatExamId] = useState('');
  const [writingChatQuestion, setWritingChatQuestion] = useState(defaultWritingChatQuestion);
  const [writingEmailExamId, setWritingEmailExamId] = useState('');
  const [writingEmailQuestion, setWritingEmailQuestion] = useState(defaultWritingEmailQuestion);
  const [gapDropdownExamId, setGapDropdownExamId] = useState('');
  const [gapDropdownQuestion, setGapDropdownQuestion] = useState(defaultGapDropdownQuestion);
  const [paragraphOrderTopicExamId, setParagraphOrderTopicExamId] = useState('');
  const [paragraphOrderTopicQuestion, setParagraphOrderTopicQuestion] = useState(defaultParagraphOrderTopicQuestion);
  const [passageMatchExamId, setPassageMatchExamId] = useState('');
  const [passageMatchQuestion, setPassageMatchQuestion] = useState(defaultPassageMatchQuestion);
  const [readingDropdownParagraphsExamId, setReadingDropdownParagraphsExamId] = useState('');
  const [readingDropdownParagraphsQuestion, setReadingDropdownParagraphsQuestion] = useState(defaultReadingDropdownParagraphsQuestion);
  const [listeningMatchingExamId, setListeningMatchingExamId] = useState('');
  const [listeningMatchingQuestion, setListeningMatchingQuestion] = useState(defaultListeningMatchingQuestion);
  const [grammarTermMatchExamId, setGrammarTermMatchExamId] = useState('');
  const [grammarTermMatchQuestion, setGrammarTermMatchQuestion] = useState(defaultGrammarTermMatchQuestion);
  const [grammarSentenceDropdownExamId, setGrammarSentenceDropdownExamId] = useState('');
  const [grammarSentenceDropdownQuestion, setGrammarSentenceDropdownQuestion] = useState(defaultGrammarSentenceDropdownQuestion);
  const [listeningOpinionExamId, setListeningOpinionExamId] = useState('');
  const [listeningOpinionQuestion, setListeningOpinionQuestion] = useState(defaultListeningOpinionQuestion);
  const [listeningGroupMcExamId, setListeningGroupMcExamId] = useState('');
  const [listeningGroupMcQuestion, setListeningGroupMcQuestion] = useState(defaultListeningGroupMcQuestion);
  const [listeningSingleMcExamId, setListeningSingleMcExamId] = useState('');
  const [listeningSingleMcQuestion, setListeningSingleMcQuestion] = useState(defaultListeningSingleMcQuestion);
  const [speakingQ1ExamId, setSpeakingQ1ExamId] = useState('');
  const [speakingQ1Rows, setSpeakingQ1Rows] = useState(defaultSpeakingQ1Rows);
  const [speakingImageListExamId, setSpeakingImageListExamId] = useState('');
  const [speakingImageListQuestion, setSpeakingImageListQuestion] = useState(defaultSpeakingImageListQuestion);
  const [speakingPart4CardExamId, setSpeakingPart4CardExamId] = useState('');
  const [speakingPart4CardQuestion, setSpeakingPart4CardQuestion] = useState(defaultSpeakingPart4CardQuestion);
  const [practiceWritingPart1ExamId, setPracticeWritingPart1ExamId] = useState('');
  const [practiceWritingPart1Rows, setPracticeWritingPart1Rows] = useState(defaultWritingPart1Rows);
  const [practiceWritingLongExamId, setPracticeWritingLongExamId] = useState('');
  const [practiceWritingLongQuestion, setPracticeWritingLongQuestion] = useState(defaultWritingLongQuestion);
  const [practiceWritingChatExamId, setPracticeWritingChatExamId] = useState('');
  const [practiceWritingChatQuestion, setPracticeWritingChatQuestion] = useState(defaultWritingChatQuestion);
  const [practiceWritingEmailExamId, setPracticeWritingEmailExamId] = useState('');
  const [practiceWritingEmailQuestion, setPracticeWritingEmailQuestion] = useState(defaultWritingEmailQuestion);
  const [practiceGapDropdownExamId, setPracticeGapDropdownExamId] = useState('');
  const [practiceGapDropdownQuestion, setPracticeGapDropdownQuestion] = useState(defaultGapDropdownQuestion);
  const [practiceParagraphOrderTopicExamId, setPracticeParagraphOrderTopicExamId] = useState('');
  const [practiceParagraphOrderTopicQuestion, setPracticeParagraphOrderTopicQuestion] = useState(defaultParagraphOrderTopicQuestion);
  const [practicePassageMatchExamId, setPracticePassageMatchExamId] = useState('');
  const [practicePassageMatchQuestion, setPracticePassageMatchQuestion] = useState(defaultPassageMatchQuestion);
  const [practiceReadingDropdownParagraphsExamId, setPracticeReadingDropdownParagraphsExamId] = useState('');
  const [practiceReadingDropdownParagraphsQuestion, setPracticeReadingDropdownParagraphsQuestion] = useState(defaultReadingDropdownParagraphsQuestion);
  const [practiceListeningMatchingExamId, setPracticeListeningMatchingExamId] = useState('');
  const [practiceListeningMatchingQuestion, setPracticeListeningMatchingQuestion] = useState(defaultListeningMatchingQuestion);
  const [practiceGrammarTermMatchExamId, setPracticeGrammarTermMatchExamId] = useState('');
  const [practiceGrammarTermMatchQuestion, setPracticeGrammarTermMatchQuestion] = useState(defaultGrammarTermMatchQuestion);
  const [practiceGrammarSentenceDropdownExamId, setPracticeGrammarSentenceDropdownExamId] = useState('');
  const [practiceGrammarSentenceDropdownQuestion, setPracticeGrammarSentenceDropdownQuestion] = useState(defaultGrammarSentenceDropdownQuestion);
  const [practiceListeningOpinionExamId, setPracticeListeningOpinionExamId] = useState('');
  const [practiceListeningOpinionQuestion, setPracticeListeningOpinionQuestion] = useState(defaultListeningOpinionQuestion);
  const [practiceListeningGroupMcExamId, setPracticeListeningGroupMcExamId] = useState('');
  const [practiceListeningGroupMcQuestion, setPracticeListeningGroupMcQuestion] = useState(defaultListeningGroupMcQuestion);
  const [practiceListeningSingleMcExamId, setPracticeListeningSingleMcExamId] = useState('');
  const [practiceListeningSingleMcQuestion, setPracticeListeningSingleMcQuestion] = useState(defaultListeningSingleMcQuestion);
  const [practiceSpeakingQ1ExamId, setPracticeSpeakingQ1ExamId] = useState('');
  const [practiceSpeakingQ1Rows, setPracticeSpeakingQ1Rows] = useState(defaultSpeakingQ1Rows);
  const [practiceSpeakingImageListExamId, setPracticeSpeakingImageListExamId] = useState('');
  const [practiceSpeakingImageListQuestion, setPracticeSpeakingImageListQuestion] = useState(defaultSpeakingImageListQuestion);
  const [practiceSpeakingPart4CardExamId, setPracticeSpeakingPart4CardExamId] = useState('');
  const [practiceSpeakingPart4CardQuestion, setPracticeSpeakingPart4CardQuestion] = useState(defaultSpeakingPart4CardQuestion);
  const [importExamId, setImportExamId] = useState('');
  const [importFile, setImportFile] = useState(null);
  const [lesson, setLesson] = useState(emptyLesson);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [notification, setNotification] = useState(emptyNotification);
  const [editingNotificationId, setEditingNotificationId] = useState(null);
  const [status, setStatus] = useState(null);
  const [templateStatus, setTemplateStatus] = useState({});

  function templateKey(name, practice = false) {
    return `${practice ? 'practice.' : 'exam.'}${name}`;
  }

  function setTemplateMessage(name, practice, type, text) {
    setTemplateStatus((current) => ({ ...current, [templateKey(name, practice)]: { type, text } }));
  }

  async function refresh() {
    try {
      const [statsRes, usersRes, examsRes, practiceExamsRes, lessonsRes, notificationsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users'),
        api.get('/admin/exams'),
        api.get('/admin/practice-exams'),
        api.get('/admin/lessons'),
        api.get('/admin/notifications')
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
      setExams(examsRes.data.data);
      setPracticeExams(practiceExamsRes.data.data);
      setLessons(lessonsRes.data.data);
      setNotifications(notificationsRes.data.data);
    } catch (error) {
      setStatus({ type: 'error', text: error.response?.data?.message || 'Cannot load admin data. Please login with admin account.' });
    }
  }

  useEffect(() => { refresh(); }, []);

  async function saveExam() {
    if (!exam.title.trim()) return setStatus({ type: 'error', text: 'Exam title is required.' });
    try {
      if (editingExamId) await api.put(`/admin/exams/${editingExamId}`, exam);
      else await api.post('/admin/exams', exam);
      setExam(emptyExam);
      setEditingExamId(null);
      setStatus({ type: 'success', text: 'Exam saved.' });
      await refresh();
    } catch (error) {
      setStatus({ type: 'error', text: error.response?.data?.message || 'Cannot save exam.' });
    }
  }

  async function saveQuestion() {
    if (!question.examId) return setStatus({ type: 'error', text: 'Please select an exam before saving question.' });
    if (!question.content.trim()) return setStatus({ type: 'error', text: 'Vui lòng nhập nội dung câu hỏi.' });
    const { examId, ...payload } = question;
    try {
      if (editingQuestionId) await api.put(`/admin/questions/${editingQuestionId}`, payload);
      else await api.post(`/admin/exams/${examId}/questions`, payload);
      setQuestion(emptyQuestion);
      setEditingQuestionId(null);
      setStatus({ type: 'success', text: 'Đã lưu câu hỏi.' });
      await refresh();
    } catch (error) {
      setStatus({ type: 'error', text: error.response?.data?.message || 'Cannot save question.' });
    }
  }

  async function savePracticeExam() {
    if (!practiceExam.title.trim()) return setStatus({ type: 'error', text: 'Practice exam title is required.' });
    try {
      if (editingPracticeExamId) await api.put(`/admin/practice-exams/${editingPracticeExamId}`, practiceExam);
      else await api.post('/admin/practice-exams', practiceExam);
      setPracticeExam(emptyPracticeExam);
      setEditingPracticeExamId(null);
      setStatus({ type: 'success', text: 'Practice exam saved.' });
      await refresh();
    } catch (error) {
      setStatus({ type: 'error', text: error.response?.data?.message || 'Cannot save practice exam.' });
    }
  }

  async function savePracticeQuestion() {
    if (!practiceQuestion.examId) return setStatus({ type: 'error', text: 'Please select a practice exam before saving question.' });
    if (!practiceQuestion.content.trim()) return setStatus({ type: 'error', text: 'Practice question content is required.' });
    const { examId, ...payload } = practiceQuestion;
    try {
      if (editingPracticeQuestionId) await api.put(`/admin/practice-questions/${editingPracticeQuestionId}`, payload);
      else await api.post(`/admin/practice-exams/${examId}/questions`, payload);
      setPracticeQuestion(emptyPracticeQuestion);
      setEditingPracticeQuestionId(null);
      setStatus({ type: 'success', text: 'Practice question saved.' });
      await refresh();
    } catch (error) {
      setStatus({ type: 'error', text: error.response?.data?.message || 'Cannot save practice question.' });
    }
  }

  function applyQuestionTypeTemplate(setter, current, type) {
    const template = questionTypeTemplates[type] || questionTypeTemplates.MULTIPLE_CHOICE;
    setter({ ...current, ...template, examId: current.examId });
  }

  function freshTemplate(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function resetSavedTemplate(name, practice = false) {
    const resetters = {
      writingPart1: practice ? () => setPracticeWritingPart1Rows(freshTemplate(defaultWritingPart1Rows)) : () => setWritingPart1Rows(freshTemplate(defaultWritingPart1Rows)),
      writingLong: practice ? () => setPracticeWritingLongQuestion(freshTemplate(defaultWritingLongQuestion)) : () => setWritingLongQuestion(freshTemplate(defaultWritingLongQuestion)),
      writingChat: practice ? () => setPracticeWritingChatQuestion(freshTemplate(defaultWritingChatQuestion)) : () => setWritingChatQuestion(freshTemplate(defaultWritingChatQuestion)),
      writingEmail: practice ? () => setPracticeWritingEmailQuestion(freshTemplate(defaultWritingEmailQuestion)) : () => setWritingEmailQuestion(freshTemplate(defaultWritingEmailQuestion)),
      gapDropdown: practice ? () => setPracticeGapDropdownQuestion(freshTemplate(defaultGapDropdownQuestion)) : () => setGapDropdownQuestion(freshTemplate(defaultGapDropdownQuestion)),
      paragraphOrderTopic: practice ? () => setPracticeParagraphOrderTopicQuestion(freshTemplate(defaultParagraphOrderTopicQuestion)) : () => setParagraphOrderTopicQuestion(freshTemplate(defaultParagraphOrderTopicQuestion)),
      passageMatch: practice ? () => setPracticePassageMatchQuestion(freshTemplate(defaultPassageMatchQuestion)) : () => setPassageMatchQuestion(freshTemplate(defaultPassageMatchQuestion)),
      readingDropdownParagraphs: practice ? () => setPracticeReadingDropdownParagraphsQuestion(freshTemplate(defaultReadingDropdownParagraphsQuestion)) : () => setReadingDropdownParagraphsQuestion(freshTemplate(defaultReadingDropdownParagraphsQuestion)),
      listeningMatching: practice ? () => setPracticeListeningMatchingQuestion(freshTemplate(defaultListeningMatchingQuestion)) : () => setListeningMatchingQuestion(freshTemplate(defaultListeningMatchingQuestion)),
      grammarTermMatch: practice ? () => setPracticeGrammarTermMatchQuestion(freshTemplate(defaultGrammarTermMatchQuestion)) : () => setGrammarTermMatchQuestion(freshTemplate(defaultGrammarTermMatchQuestion)),
      grammarSentenceDropdown: practice ? () => setPracticeGrammarSentenceDropdownQuestion(freshTemplate(defaultGrammarSentenceDropdownQuestion)) : () => setGrammarSentenceDropdownQuestion(freshTemplate(defaultGrammarSentenceDropdownQuestion)),
      listeningOpinion: practice ? () => setPracticeListeningOpinionQuestion(freshTemplate(defaultListeningOpinionQuestion)) : () => setListeningOpinionQuestion(freshTemplate(defaultListeningOpinionQuestion)),
      listeningGroupMc: practice ? () => setPracticeListeningGroupMcQuestion(freshTemplate(defaultListeningGroupMcQuestion)) : () => setListeningGroupMcQuestion(freshTemplate(defaultListeningGroupMcQuestion)),
      listeningSingleMc: practice ? () => setPracticeListeningSingleMcQuestion(freshTemplate(defaultListeningSingleMcQuestion)) : () => setListeningSingleMcQuestion(freshTemplate(defaultListeningSingleMcQuestion)),
      speakingQ1: practice ? () => setPracticeSpeakingQ1Rows(freshTemplate(defaultSpeakingQ1Rows)) : () => setSpeakingQ1Rows(freshTemplate(defaultSpeakingQ1Rows)),
      speakingImageList: practice ? () => setPracticeSpeakingImageListQuestion(freshTemplate(defaultSpeakingImageListQuestion)) : () => setSpeakingImageListQuestion(freshTemplate(defaultSpeakingImageListQuestion)),
      speakingPart4Card: practice ? () => setPracticeSpeakingPart4CardQuestion(freshTemplate(defaultSpeakingPart4CardQuestion)) : () => setSpeakingPart4CardQuestion(freshTemplate(defaultSpeakingPart4CardQuestion))
    };
    resetters[name]?.();
  }

  function updateWritingPart1Row(setter, index, key, value) {
    setter((rows) => rows.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row));
  }

  function examRequestPayload(item, overrides = {}) {
    return {
      title: item.title,
      type: item.type,
      duration: item.duration,
      transcript: item.transcript || '',
      audioUrl: item.audioUrl || '',
      prompt: item.prompt || '',
      ...overrides
    };
  }

  async function saveWritingPart1Template({ examId, rows, practice = false }) {
    if (!examId) return setTemplateMessage('writingPart1', practice, 'error', practice ? 'Please select a practice writing exam.' : 'Please select a writing exam.');
    const validRows = rows.map((row) => ({ content: row.content.trim(), answer: row.answer.trim() })).filter((row) => row.content);
    if (validRows.length !== 5) return setTemplateMessage('writingPart1', practice, 'error', 'Writing Part 1 cần đúng 5 câu hỏi.');
    try {
      const examPayload = { prompt: writingPart1Instruction, transcript: writingPart1Example };
      if (practice) await api.put(`/admin/practice-exams/${examId}`, examRequestPayload(practiceExams.find((item) => String(item.id) === String(examId)), examPayload));
      else await api.put(`/admin/exams/${examId}`, examRequestPayload(exams.find((item) => String(item.id) === String(examId)), examPayload));

      await Promise.all(validRows.map((row) => {
        const payload = {
          content: row.content,
          optionF: 'WRITING_PART1',
          correctAnswer: row.answer,
          explanation: '',
          questionType: 'ESSAY'
        };
        return practice ? api.post(`/admin/practice-exams/${examId}/questions`, payload) : api.post(`/admin/exams/${examId}/questions`, payload);
      }));
      resetSavedTemplate('writingPart1', practice);
      setTemplateMessage('writingPart1', practice, 'success', 'Đã lưu mẫu Writing Part 1 với 5 câu hỏi.');
      await refresh();
    } catch (error) {
      setTemplateMessage('writingPart1', practice, 'error', error.response?.data?.message || 'Cannot save Writing Part 1 template.');
    }
  }

  async function saveWritingLongTemplate({ examId, data, practice = false }) {
    if (!examId) return setTemplateMessage('writingLong', practice, 'error', practice ? 'Please select a practice writing exam.' : 'Please select a writing exam.');
    if (!data.content.trim()) return setTemplateMessage('writingLong', practice, 'error', 'Vui lòng nhập câu hỏi Writing.');
    try {
      const payload = {
        content: data.content.trim(),
        optionA: data.title.trim() || defaultWritingLongQuestion.title,
        optionB: data.instruction.trim() || defaultWritingLongQuestion.instruction,
        optionF: 'WRITING_LONG',
        correctAnswer: data.answer.trim(),
        explanation: '',
        questionType: 'ESSAY'
      };
      if (practice) await api.post(`/admin/practice-exams/${examId}/questions`, payload);
      else await api.post(`/admin/exams/${examId}/questions`, payload);
      resetSavedTemplate('writingLong', practice);
      setTemplateMessage('writingLong', practice, 'success', 'Writing long question saved.');
      await refresh();
    } catch (error) {
      setTemplateMessage('writingLong', practice, 'error', error.response?.data?.message || 'Cannot save writing long question.');
    }
  }

  function updateWritingChatRow(setter, index, key, value) {
    setter((current) => ({
      ...current,
      rows: current.rows.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row)
    }));
  }

  async function saveWritingChatTemplate({ examId, data, practice = false }) {
    if (!examId) return setTemplateMessage('writingChat', practice, 'error', practice ? 'Please select a practice writing exam.' : 'Please select a writing exam.');
    const rows = data.rows.map((row) => ({ content: row.content.trim(), answer: row.answer.trim() }));
    if (rows.some((row) => !row.content)) return setTemplateMessage('writingChat', practice, 'error', 'Vui lòng nhập đủ 3 câu hỏi nhóm chat.');
    try {
      const payload = {
        content: rows.map((row) => row.content).join('\n'),
        optionA: data.title.trim() || defaultWritingChatQuestion.title,
        optionB: data.instruction.trim() || defaultWritingChatQuestion.instruction,
        optionF: 'WRITING_CHAT',
        correctAnswer: rows.map((row) => row.answer).join('\n---\n'),
        explanation: '',
        questionType: 'ESSAY'
      };
      if (practice) await api.post(`/admin/practice-exams/${examId}/questions`, payload);
      else await api.post(`/admin/exams/${examId}/questions`, payload);
      resetSavedTemplate('writingChat', practice);
      setTemplateMessage('writingChat', practice, 'success', 'Writing group chat question saved.');
      await refresh();
    } catch (error) {
      setTemplateMessage('writingChat', practice, 'error', error.response?.data?.message || 'Cannot save writing group chat question.');
    }
  }

  function updateWritingEmailRow(setter, index, key, value) {
    setter((current) => ({
      ...current,
      rows: current.rows.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row)
    }));
  }

  async function saveWritingEmailTemplate({ examId, data, practice = false }) {
    if (!examId) return setTemplateMessage('writingEmail', practice, 'error', practice ? 'Please select a practice writing exam.' : 'Please select a writing exam.');
    if (!data.context.trim()) return setTemplateMessage('writingEmail', practice, 'error', 'Vui lòng nhập ngữ cảnh email.');
    if (data.rows.some((row) => !row.content.trim())) return setTemplateMessage('writingEmail', practice, 'error', 'Vui lòng nhập đủ 2 nhiệm vụ email.');
    try {
      const payload = {
        content: data.context.trim(),
        optionA: data.title.trim() || defaultWritingEmailQuestion.title,
        optionB: data.instruction.trim() || defaultWritingEmailQuestion.instruction,
        optionC: data.rows[0].content.trim(),
        optionD: data.rows[1].content.trim(),
        optionF: 'WRITING_EMAIL',
        correctAnswer: data.rows.map((row) => row.answer.trim()).join('\n---\n'),
        explanation: '',
        questionType: 'ESSAY'
      };
      if (practice) await api.post(`/admin/practice-exams/${examId}/questions`, payload);
      else await api.post(`/admin/exams/${examId}/questions`, payload);
      resetSavedTemplate('writingEmail', practice);
      setTemplateMessage('writingEmail', practice, 'success', 'Writing email question saved.');
      await refresh();
    } catch (error) {
      setTemplateMessage('writingEmail', practice, 'error', error.response?.data?.message || 'Cannot save writing email question.');
    }
  }

  function updateGapDropdownRow(setter, index, key, value) {
    setter((current) => ({
      ...current,
      rows: current.rows.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row)
    }));
  }

  function updateGapDropdownOption(setter, rowIndex, optionIndex, value) {
    setter((current) => ({
      ...current,
      rows: current.rows.map((row, currentRowIndex) => currentRowIndex === rowIndex
        ? { ...row, options: (row.options || current.options || ['', '', '', '', '', '']).map((option, currentOptionIndex) => currentOptionIndex === optionIndex ? value : option) }
        : row)
    }));
  }

  async function saveGapDropdownTemplate({ examId, data, practice = false }) {
    if (!examId) return setTemplateMessage('gapDropdown', practice, 'error', practice ? 'Please select a practice exam.' : 'Please select an exam.');
    if (data.rows.some((row) => !row.before.trim() && !row.after.trim())) return setTemplateMessage('gapDropdown', practice, 'error', 'Vui lòng nhập tất cả câu có chỗ trống.');
    const optionKeys = ['A', 'B', 'C', 'D', 'E', 'F'];
    const rows = data.rows.map((row) => ({
      before: row.before.trim(),
      after: row.after.trim(),
      answer: row.answer.trim(),
      options: (row.options || data.options || ['', '', '', '', '', '']).map((option) => option.trim())
    }));
    if (rows.some((row) => row.options.filter(Boolean).length < 2)) return setTemplateMessage('gapDropdown', practice, 'error', 'Vui lòng nhập ít nhất 2 lựa chọn cho mỗi chỗ trống.');
    if (rows.some((row) => !row.answer)) return setTemplateMessage('gapDropdown', practice, 'error', 'Please select the answer for every gap.');
    if (rows.some((row) => !row.options[optionKeys.indexOf(row.answer)])) return setTemplateMessage('gapDropdown', practice, 'error', 'The selected answer must have option text for every gap.');
    try {
      const content = [
        data.instruction.trim(),
        data.intro.trim(),
        '[QUESTIONS]',
        ...rows.map((row) => `${row.before} [[blank]] ${row.after}`.trim())
      ].filter(Boolean).join('\n');
      const firstOptions = rows[0].options;
      const rowOptions = rows.map((row) => ({
        options: row.options.map((option, index) => ({ key: optionKeys[index], text: option })).filter((option) => option.text)
      }));
      const payload = {
        content,
        optionA: firstOptions[0] || '',
        optionB: firstOptions[1] || '',
        optionC: firstOptions[2] || '',
        optionD: firstOptions[3] || '',
        optionE: firstOptions[4] || '',
        optionF: firstOptions[5] || '',
        scriptText: JSON.stringify({ gapOptions: rowOptions }),
        correctAnswer: rows.map((row) => row.answer).join(','),
        explanation: 'Gap dropdown answers in sentence order.',
        questionType: 'INLINE_DROPDOWN'
      };
      if (practice) await api.post(`/admin/practice-exams/${examId}/questions`, payload);
      else await api.post(`/admin/exams/${examId}/questions`, payload);
      resetSavedTemplate('gapDropdown', practice);
      setTemplateMessage('gapDropdown', practice, 'success', 'Gap dropdown question saved.');
      await refresh();
    } catch (error) {
      setTemplateMessage('gapDropdown', practice, 'error', error.response?.data?.message || 'Cannot save gap dropdown question.');
    }
  }

  function updateParagraphOrderTopicRow(setter, index, value) {
    setter((current) => ({
      ...current,
      rows: current.rows.map((row, rowIndex) => rowIndex === index ? value : row)
    }));
  }

  async function saveParagraphOrderTopicTemplate({ examId, data, practice = false }) {
    if (!examId) return setTemplateMessage('paragraphOrderTopic', practice, 'error', practice ? 'Please select a practice exam.' : 'Please select an exam.');
    const rows = data.rows.map((row) => row.trim());
    const answerKeys = data.answer.split(',').map((item) => item.trim()).filter(Boolean);
    if (rows.some((row) => !row)) return setTemplateMessage('paragraphOrderTopic', practice, 'error', 'Vui lòng nhập đủ 5 câu.');
    if (answerKeys.length !== 5) return setTemplateMessage('paragraphOrderTopic', practice, 'error', 'Please choose all 5 positions in the correct order.');
    if (new Set(answerKeys).size !== 5) return setTemplateMessage('paragraphOrderTopic', practice, 'error', 'Correct order cannot use the same sentence twice.');
    try {
      const payload = {
        content: `Topic: ${data.topic.trim() || 'Reading Part 2'}\n\n${data.instruction.trim() || defaultParagraphOrderTopicQuestion.instruction}`,
        optionA: rows[0],
        optionB: rows[1],
        optionC: rows[2],
        optionD: rows[3],
        optionE: rows[4],
        optionF: 'PARAGRAPH_ORDER_TOPIC',
        correctAnswer: answerKeys.join(','),
        explanation: 'Reading Part 2 sentence order.',
        questionType: 'PARAGRAPH_ORDER'
      };
      if (practice) await api.post(`/admin/practice-exams/${examId}/questions`, payload);
      else await api.post(`/admin/exams/${examId}/questions`, payload);
      resetSavedTemplate('paragraphOrderTopic', practice);
      setTemplateMessage('paragraphOrderTopic', practice, 'success', 'Paragraph order topic question saved.');
      await refresh();
    } catch (error) {
      setTemplateMessage('paragraphOrderTopic', practice, 'error', error.response?.data?.message || 'Cannot save paragraph order question.');
    }
  }

  function updatePassageMatchPassage(setter, index, value) {
    setter((current) => ({
      ...current,
      passages: current.passages.map((passage, passageIndex) => passageIndex === index ? { ...passage, text: value } : passage)
    }));
  }

  function updatePassageMatchQuestion(setter, index, key, value) {
    setter((current) => ({
      ...current,
      [key]: current[key].map((item, itemIndex) => itemIndex === index ? value : item)
    }));
  }

  async function savePassageMatchTemplate({ examId, data, practice = false }) {
    if (!examId) return setTemplateMessage('passageMatch', practice, 'error', practice ? 'Please select a practice exam.' : 'Please select an exam.');
    const passages = data.passages.map((passage) => ({ ...passage, text: passage.text.trim() }));
    const questions = data.questions.map((question) => question.trim()).filter(Boolean);
    const answers = data.answers.map((answer) => answer.trim()).filter(Boolean);
    if (!data.topic.trim()) return setTemplateMessage('passageMatch', practice, 'error', 'Vui lòng nhập chủ đề.');
    if (passages.some((passage) => !passage.text)) return setTemplateMessage('passageMatch', practice, 'error', 'Vui lòng nhập đủ 4 đoạn.');
    if (questions.length === 0) return setTemplateMessage('passageMatch', practice, 'error', 'Vui lòng nhập ít nhất một câu hỏi.');
    try {
      const content = [
        `Topic: ${data.topic.trim()}`,
        '',
        '[PASSAGES]',
        ...passages.map((passage) => `${passage.key}: ${passage.text}`),
        '',
        '[QUESTIONS]',
        ...questions
      ].join('\n');
      const payload = {
        content,
        correctAnswer: answers.join(','),
        explanation: 'Passage match answers in question order.',
        questionType: 'PASSAGE_MATCH'
      };
      if (practice) await api.post(`/admin/practice-exams/${examId}/questions`, payload);
      else await api.post(`/admin/exams/${examId}/questions`, payload);
      resetSavedTemplate('passageMatch', practice);
      setTemplateMessage('passageMatch', practice, 'success', 'Passage match question saved.');
      await refresh();
    } catch (error) {
      setTemplateMessage('passageMatch', practice, 'error', error.response?.data?.message || 'Cannot save passage match question.');
    }
  }

  function updateReadingDropdownArray(setter, key, index, value) {
    setter((current) => ({
      ...current,
      [key]: current[key].map((item, itemIndex) => itemIndex === index ? value : item)
    }));
  }

  async function saveReadingDropdownParagraphsTemplate({ examId, data, practice = false }) {
    if (!examId) return setTemplateMessage('readingDropdownParagraphs', practice, 'error', practice ? 'Please select a practice exam.' : 'Please select an exam.');
    const rows = data.rows.map((row) => row.trim());
    const options = data.options.map((option) => option.trim()).filter(Boolean);
    const answers = data.answers.map((answer) => answer.trim()).filter(Boolean);
    if (!data.topic.trim()) return setTemplateMessage('readingDropdownParagraphs', practice, 'error', 'Vui lòng nhập chủ đề.');
    if (rows.some((row) => !row)) return setTemplateMessage('readingDropdownParagraphs', practice, 'error', 'Vui lòng nhập đủ 7 đoạn.');
    if (options.length === 0) return setTemplateMessage('readingDropdownParagraphs', practice, 'error', 'Vui lòng nhập lựa chọn dropdown.');
    try {
      const content = [
        data.title.trim(),
        `Topic: ${data.topic.trim()}`,
        data.instruction.trim(),
        '',
        '[ITEMS]',
        ...rows
      ].filter((line) => line !== '').join('\n');
      const payload = {
        content,
        optionF: 'READING_DROPDOWN_PARAGRAPHS',
        scriptText: options.join('\n'),
        correctAnswer: answers.join(','),
        explanation: data.tip.trim(),
        questionType: 'MATCHING_DROPDOWN'
      };
      if (practice) await api.post(`/admin/practice-exams/${examId}/questions`, payload);
      else await api.post(`/admin/exams/${examId}/questions`, payload);
      resetSavedTemplate('readingDropdownParagraphs', practice);
      setTemplateMessage('readingDropdownParagraphs', practice, 'success', 'Reading dropdown paragraphs question saved.');
      await refresh();
    } catch (error) {
      setTemplateMessage('readingDropdownParagraphs', practice, 'error', error.response?.data?.message || 'Cannot save reading dropdown paragraphs question.');
    }
  }

  function updateListeningMatchingArray(setter, key, index, value) {
    setter((current) => ({
      ...current,
      [key]: current[key].map((item, itemIndex) => itemIndex === index ? value : item)
    }));
  }

  async function saveListeningMatchingTemplate({ examId, data, practice = false }) {
    if (!examId) return setTemplateMessage('listeningMatching', practice, 'error', practice ? 'Please select a practice listening exam.' : 'Please select a listening exam.');
    const options = data.options.map((option) => option.trim());
    const answers = data.answers.map((answer) => answer.trim());
    const audioUrls = (data.audioUrls || []).map((url) => url.trim());
    if (!data.topic.trim()) return setTemplateMessage('listeningMatching', practice, 'error', 'Vui lòng nhập chủ đề.');
    if (options.filter(Boolean).length < 4) return setTemplateMessage('listeningMatching', practice, 'error', 'Vui lòng nhập ít nhất 4 lựa chọn trả lời.');
    if (audioUrls.some((url) => !url)) return setTemplateMessage('listeningMatching', practice, 'error', 'Vui lòng nhập đủ 4 file nghe cho Person 1-4.');
    try {
      const payload = {
        content: `Topic: ${data.topic.trim()}\n${data.instruction.trim()}`,
        optionA: options[0] || '',
        optionB: options[1] || '',
        optionC: options[2] || '',
        optionD: options[3] || '',
        optionE: options[4] || '',
        optionF: 'LISTENING_MATCHING',
        audioUrl: audioUrls[0] || data.audioUrl.trim(),
        scriptText: JSON.stringify({ transcript: data.transcript.trim(), audioUrls }),
        correctAnswer: answers.join(','),
        explanation: 'Person 1 to Person 4 answers.',
        questionType: 'MATCHING_DROPDOWN'
      };
      if (practice) await api.post(`/admin/practice-exams/${examId}/questions`, payload);
      else await api.post(`/admin/exams/${examId}/questions`, payload);
      resetSavedTemplate('listeningMatching', practice);
      setTemplateMessage('listeningMatching', practice, 'success', 'Listening matching question saved.');
      await refresh();
    } catch (error) {
      setTemplateMessage('listeningMatching', practice, 'error', error.response?.data?.message || 'Cannot save listening matching question.');
    }
  }

  function updateGrammarTermMatchRow(setter, index, key, value) {
    setter((current) => ({
      ...current,
      rows: current.rows.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row)
    }));
  }

  function updateGrammarTermMatchOption(setter, index, value) {
    setter((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) => optionIndex === index ? value : option)
    }));
  }

  function addGrammarTermMatchOption(setter) {
    setter((current) => ({ ...current, options: [...current.options, ''] }));
  }

  async function saveGrammarTermMatchTemplate({ examId, data, practice = false }) {
    if (!examId) return setTemplateMessage('grammarTermMatch', practice, 'error', practice ? 'Please select a practice grammar exam.' : 'Please select a grammar exam.');
    const rows = data.rows.map((row) => ({ term: row.term.trim(), answer: row.answer.trim() }));
    const options = data.options.map((option) => option.trim()).filter(Boolean);
    const validRows = rows.filter((row) => row.term);
    if (!data.instruction.trim()) return setTemplateMessage('grammarTermMatch', practice, 'error', 'Vui lòng nhập hướng dẫn.');
    if (validRows.length < 2) return setTemplateMessage('grammarTermMatch', practice, 'error', 'Vui lòng nhập ít nhất 2 thuật ngữ.');
    if (options.length < 2) return setTemplateMessage('grammarTermMatch', practice, 'error', 'Vui lòng nhập ít nhất 2 lựa chọn.');
    if (validRows.some((row) => !row.answer)) return setTemplateMessage('grammarTermMatch', practice, 'error', 'Please choose an answer for every term.');
    if (validRows.some((row) => !options.includes(row.answer))) return setTemplateMessage('grammarTermMatch', practice, 'error', 'Every answer must exist in the options list.');
    try {
      const payload = {
        content: data.instruction.trim(),
        optionF: 'GRAMMAR_TERM_MATCH',
        scriptText: JSON.stringify({ terms: validRows.map((row) => row.term), options, operator: data.operator || '=' }),
        correctAnswer: validRows.map((row) => row.answer).join('|||'),
        explanation: 'Grammar term matching answers in row order.',
        questionType: 'MATCHING_DROPDOWN'
      };
      if (practice) await api.post(`/admin/practice-exams/${examId}/questions`, payload);
      else await api.post(`/admin/exams/${examId}/questions`, payload);
      resetSavedTemplate('grammarTermMatch', practice);
      setTemplateMessage('grammarTermMatch', practice, 'success', 'Grammar term matching question saved.');
      await refresh();
    } catch (error) {
      setTemplateMessage('grammarTermMatch', practice, 'error', error.response?.data?.message || 'Cannot save grammar term matching question.');
    }
  }

  function updateGrammarSentenceDropdownRow(setter, index, key, value) {
    setter((current) => ({
      ...current,
      rows: current.rows.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row)
    }));
  }

  function updateGrammarSentenceDropdownOption(setter, index, value) {
    setter((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) => optionIndex === index ? value : option)
    }));
  }

  function addGrammarSentenceDropdownOption(setter) {
    setter((current) => ({ ...current, options: [...current.options, ''] }));
  }

  async function saveGrammarSentenceDropdownTemplate({ examId, data, practice = false }) {
    if (!examId) return setTemplateMessage('grammarSentenceDropdown', practice, 'error', practice ? 'Please select a practice grammar exam.' : 'Please select a grammar exam.');
    const rows = data.rows.map((row) => ({ before: row.before.trim(), after: row.after.trim(), answer: row.answer.trim() }));
    const options = data.options.map((option) => option.trim()).filter(Boolean);
    const validRows = rows.filter((row) => row.before || row.after);
    if (validRows.length < 2) return setTemplateMessage('grammarSentenceDropdown', practice, 'error', 'Vui lòng nhập ít nhất 2 câu.');
    if (options.length < 2) return setTemplateMessage('grammarSentenceDropdown', practice, 'error', 'Vui lòng nhập ít nhất 2 lựa chọn.');
    if (validRows.some((row) => !row.answer)) return setTemplateMessage('grammarSentenceDropdown', practice, 'error', 'Please choose an answer for every sentence.');
    if (validRows.some((row) => !options.includes(row.answer))) return setTemplateMessage('grammarSentenceDropdown', practice, 'error', 'Every answer must exist in the options list.');
    try {
      const payload = {
        content: data.instruction.trim() || 'Choose the correct answer.',
        optionF: 'GRAMMAR_SENTENCE_DROPDOWN',
        scriptText: JSON.stringify({ rows: validRows.map(({ before, after }) => ({ before, after })), options }),
        correctAnswer: validRows.map((row) => row.answer).join('|||'),
        explanation: 'Grammar sentence dropdown answers in row order.',
        questionType: 'INLINE_DROPDOWN'
      };
      if (practice) await api.post(`/admin/practice-exams/${examId}/questions`, payload);
      else await api.post(`/admin/exams/${examId}/questions`, payload);
      resetSavedTemplate('grammarSentenceDropdown', practice);
      setTemplateMessage('grammarSentenceDropdown', practice, 'success', 'Grammar sentence dropdown question saved.');
      await refresh();
    } catch (error) {
      setTemplateMessage('grammarSentenceDropdown', practice, 'error', error.response?.data?.message || 'Cannot save grammar sentence dropdown question.');
    }
  }

  function updateListeningOpinionArray(setter, key, index, value) {
    setter((current) => ({
      ...current,
      [key]: current[key].map((item, itemIndex) => itemIndex === index ? value : item)
    }));
  }

  async function saveListeningOpinionTemplate({ examId, data, practice = false }) {
    if (!examId) return setTemplateMessage('listeningOpinion', practice, 'error', practice ? 'Please select a practice listening exam.' : 'Please select a listening exam.');
    const statements = data.statements.map((statement) => statement.trim());
    const answers = data.answers.map((answer) => answer.trim());
    if (!data.topic.trim()) return setTemplateMessage('listeningOpinion', practice, 'error', 'Vui lòng nhập chủ đề.');
    if (statements.some((statement) => !statement)) return setTemplateMessage('listeningOpinion', practice, 'error', 'Vui lòng nhập đủ 4 phát biểu.');
    try {
      const payload = {
        content: `Topic: ${data.topic.trim()}\n${data.instruction.trim()}`,
        optionA: statements[0],
        optionB: statements[1],
        optionC: statements[2],
        optionD: statements[3],
        optionF: 'LISTENING_OPINION',
        audioUrl: data.audioUrl.trim(),
        scriptText: data.transcript.trim(),
        correctAnswer: answers.join(','),
        explanation: 'Use MAN,WOMAN,BOTH in statement order.',
        questionType: 'OPINION_MATCH'
      };
      if (practice) await api.post(`/admin/practice-exams/${examId}/questions`, payload);
      else await api.post(`/admin/exams/${examId}/questions`, payload);
      resetSavedTemplate('listeningOpinion', practice);
      setTemplateMessage('listeningOpinion', practice, 'success', 'Listening opinion question saved.');
      await refresh();
    } catch (error) {
      setTemplateMessage('listeningOpinion', practice, 'error', error.response?.data?.message || 'Cannot save listening opinion question.');
    }
  }

  function updateListeningGroupMcQuestion(setter, index, key, value) {
    setter((current) => ({
      ...current,
      questions: current.questions.map((question, questionIndex) => questionIndex === index ? { ...question, [key]: value } : question)
    }));
  }

  function updateListeningGroupMcOption(setter, questionIndex, optionIndex, value) {
    setter((current) => ({
      ...current,
      questions: current.questions.map((question, index) => index === questionIndex
        ? { ...question, options: question.options.map((option, currentOptionIndex) => currentOptionIndex === optionIndex ? value : option) }
        : question)
    }));
  }

  async function saveListeningGroupMcTemplate({ examId, data, practice = false }) {
    if (!examId) return setTemplateMessage('listeningGroupMc', practice, 'error', practice ? 'Please select a practice listening exam.' : 'Please select a listening exam.');
    if (!data.topic.trim()) return setTemplateMessage('listeningGroupMc', practice, 'error', 'Vui lòng nhập chủ đề.');
    if (data.questions.some((question) => !question.content.trim())) return setTemplateMessage('listeningGroupMc', practice, 'error', 'Vui lòng nhập tất cả câu hỏi.');
    if (data.questions.some((question) => question.options.some((option) => !option.trim()))) return setTemplateMessage('listeningGroupMc', practice, 'error', 'Vui lòng nhập tất cả lựa chọn trả lời.');
    try {
      const payload = {
        content: `Topic: ${data.topic.trim()}`,
        optionF: 'LISTENING_GROUP_MC',
        audioUrl: data.audioUrl.trim(),
        scriptText: JSON.stringify(data.questions.map((question) => ({ content: question.content.trim(), options: question.options.map((option) => option.trim()) }))),
        correctAnswer: data.questions.map((question) => question.answer.trim()).join(','),
        explanation: data.transcript.trim(),
        questionType: 'MULTIPLE_CHOICE'
      };
      if (practice) await api.post(`/admin/practice-exams/${examId}/questions`, payload);
      else await api.post(`/admin/exams/${examId}/questions`, payload);
      resetSavedTemplate('listeningGroupMc', practice);
      setTemplateMessage('listeningGroupMc', practice, 'success', 'Listening multiple choice question saved.');
      await refresh();
    } catch (error) {
      setTemplateMessage('listeningGroupMc', practice, 'error', error.response?.data?.message || 'Cannot save listening multiple choice question.');
    }
  }

  function updateListeningSingleMcOption(setter, index, value) {
    setter((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) => optionIndex === index ? value : option)
    }));
  }

  async function saveListeningSingleMcTemplate({ examId, data, practice = false }) {
    if (!examId) return setTemplateMessage('listeningSingleMc', practice, 'error', practice ? 'Please select a practice listening exam.' : 'Please select a listening exam.');
    if (!data.content.trim()) return setTemplateMessage('listeningSingleMc', practice, 'error', 'Vui lòng nhập câu hỏi.');
    if (data.options.some((option) => !option.trim())) return setTemplateMessage('listeningSingleMc', practice, 'error', 'Vui lòng nhập tất cả lựa chọn trả lời.');
    try {
      const payload = {
        content: data.content.trim(),
        optionA: data.options[0].trim(),
        optionB: data.options[1].trim(),
        optionC: data.options[2].trim(),
        optionF: 'LISTENING_SINGLE_MC',
        audioUrl: data.audioUrl.trim(),
        scriptText: data.transcript.trim(),
        correctAnswer: data.answer.trim(),
        explanation: '',
        questionType: 'MULTIPLE_CHOICE'
      };
      if (practice) await api.post(`/admin/practice-exams/${examId}/questions`, payload);
      else await api.post(`/admin/exams/${examId}/questions`, payload);
      resetSavedTemplate('listeningSingleMc', practice);
      setTemplateMessage('listeningSingleMc', practice, 'success', 'Listening single choice question saved.');
      await refresh();
    } catch (error) {
      setTemplateMessage('listeningSingleMc', practice, 'error', error.response?.data?.message || 'Cannot save listening single choice question.');
    }
  }

  function updateSpeakingQ1Row(setter, index, key, value) {
    setter((rows) => rows.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row));
  }

  async function saveSpeakingQ1Template({ examId, rows, practice = false }) {
    if (!examId) return setTemplateMessage('speakingQ1', practice, 'error', practice ? 'Please select a practice speaking exam.' : 'Please select a speaking exam.');
    const validRows = rows.map((row) => ({
      content: row.content.trim(),
      answer1: row.answer1.trim(),
      answer2: row.answer2.trim()
    })).filter((row) => row.content);
    if (validRows.length === 0) return setTemplateMessage('speakingQ1', practice, 'error', 'Vui lòng nhập ít nhất một câu hỏi Speaking.');
    try {
      await Promise.all(validRows.map((row) => {
        const payload = {
          content: row.content,
          optionA: row.answer1,
          optionB: row.answer2,
          optionF: 'SPEAKING_Q1_LIST',
          questionType: 'SPEAKING_PROMPT'
        };
        return practice ? api.post(`/admin/practice-exams/${examId}/questions`, payload) : api.post(`/admin/exams/${examId}/questions`, payload);
      }));
      resetSavedTemplate('speakingQ1', practice);
      setTemplateMessage('speakingQ1', practice, 'success', 'Đã lưu danh sách Speaking Câu 1.');
      await refresh();
    } catch (error) {
      setTemplateMessage('speakingQ1', practice, 'error', error.response?.data?.message || 'Không thể lưu danh sách Speaking Câu 1.');
    }
  }

  function updateSpeakingImageListRow(setter, index, key, value) {
    setter((current) => ({
      ...current,
      rows: current.rows.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row)
    }));
  }

  function updateSpeakingPart4CardRow(setter, index, key, value) {
    setter((current) => ({
      ...current,
      rows: current.rows.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row)
    }));
  }

  async function saveSpeakingImageListTemplate({ examId, data, practice = false }) {
    if (!examId) return setTemplateMessage('speakingImageList', practice, 'error', practice ? 'Please select a practice speaking exam.' : 'Please select a speaking exam.');
    const rows = data.rows.map((row) => ({ content: row.content.trim(), answer: row.answer.trim() }));
    if (!data.imageUrl.trim()) return setTemplateMessage('speakingImageList', practice, 'error', 'Vui lòng nhập URL ảnh.');
    if (rows.some((row) => !row.content)) return setTemplateMessage('speakingImageList', practice, 'error', 'Vui lòng nhập đủ 3 câu hỏi.');
    try {
      const payload = {
        content: rows.map((row) => row.content).join('\n'),
        optionA: rows[0].answer,
        optionB: rows[1].answer,
        optionC: rows[2].answer,
        optionD: data.title.trim() || defaultSpeakingImageListQuestion.title,
        optionF: data.imageUrl2?.trim() ? 'SPEAKING_COMPARE_LIST' : 'SPEAKING_IMAGE_LIST',
        imageUrl: data.imageUrl.trim(),
        imageUrl2: data.imageUrl2?.trim() || '',
        questionType: 'SPEAKING_PROMPT'
      };
      if (practice) await api.post(`/admin/practice-exams/${examId}/questions`, payload);
      else await api.post(`/admin/exams/${examId}/questions`, payload);
      resetSavedTemplate('speakingImageList', practice);
      setTemplateMessage('speakingImageList', practice, 'success', 'Speaking image list question saved.');
      await refresh();
    } catch (error) {
      setTemplateMessage('speakingImageList', practice, 'error', error.response?.data?.message || 'Cannot save speaking image list question.');
    }
  }

  async function saveSpeakingPart4CardTemplate({ examId, data, practice = false }) {
    if (!examId) return setTemplateMessage('speakingPart4Card', practice, 'error', practice ? 'Please select a practice speaking exam.' : 'Please select a speaking exam.');
    const rows = data.rows.map((row) => ({ content: row.content.trim(), answer: row.answer.trim() }));
    if (rows.some((row) => !row.content)) return setTemplateMessage('speakingPart4Card', practice, 'error', 'Vui lòng nhập đủ 3 câu hỏi Speaking Part 4.');
    try {
      const payload = {
        content: rows.map((row) => row.content).join('\n'),
        optionA: rows[0].answer,
        optionB: rows[1].answer,
        optionC: rows[2].answer,
        optionD: data.title.trim() || rows[0].content,
        optionF: 'SPEAKING_PART4_CARD',
        questionType: 'SPEAKING_PART4_LIST'
      };
      if (practice) await api.post(`/admin/practice-exams/${examId}/questions`, payload);
      else await api.post(`/admin/exams/${examId}/questions`, payload);
      resetSavedTemplate('speakingPart4Card', practice);
      setTemplateMessage('speakingPart4Card', practice, 'success', 'Speaking Part 4 card saved.');
      await refresh();
    } catch (error) {
      setTemplateMessage('speakingPart4Card', practice, 'error', error.response?.data?.message || 'Cannot save Speaking Part 4 card.');
    }
  }

  async function importQuestions() {
    if (!importExamId) return setStatus({ type: 'error', text: 'Vui lòng chọn đề trước khi import câu hỏi.' });
    if (!importFile) return setStatus({ type: 'error', text: 'Please select a CSV file.' });
    const formData = new FormData();
    formData.append('file', importFile);
    try {
      const response = await api.post(`/admin/exams/${importExamId}/questions/import`, formData);
      const result = response.data.data;
      setImportFile(null);
      setStatus({
        type: result.errors?.length ? 'error' : 'success',
        text: `Imported ${result.imported} question(s).${result.errors?.length ? ` ${result.errors.join(' ')}` : ''}`
      });
      await refresh();
    } catch (error) {
      setStatus({ type: 'error', text: error.response?.data?.message || 'Không thể import câu hỏi.' });
    }
  }

  function downloadQuestionTemplate() {
    const rows = [
      ['content', 'optionA', 'optionB', 'optionC', 'optionD', 'optionE', 'optionF', 'audioUrl', 'scriptText', 'correctAnswer', 'explanation', 'questionType'],
      ['Topic: Protect the environment', 'Give away used items', 'Use solar panels for electricity', 'Does not use commercial cleaning products', 'Buy environmentally friendly products', 'Plant trees in the backyard', 'Reuse containers for storing food', '', '', 'A,C,D,F', 'Person 1 to Person 4 answers', 'MATCHING_DROPDOWN'],
      [`Topic: Games from childhood

[PASSAGES]
A: First opinion text.
B: Second opinion text.
C: Third opinion text.
D: Fourth opinion text.

[QUESTIONS]
Who finds today's games harder than before?
Who enjoyed playing with friends in childhood?
Who enjoys playing with their children?`, '', '', '', '', '', '', '', '', 'A,B,A', 'Passage match answers in question order', 'PASSAGE_MATCH']
    ];
    const csv = rows.map((row) => row.map(csvCell).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'question-import-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  function csvCell(value) {
    return `"${String(value).replaceAll('"', '""')}"`;
  }

  async function uploadQuestionAudio(file, setter, current) {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await api.post('/files/audio', formData);
      setter({ ...current, audioUrl: response.data.data, questionType: 'LISTENING_AUDIO' });
      setStatus({ type: 'success', text: 'Đã tải audio lên.' });
    } catch (error) {
      setStatus({ type: 'error', text: error.response?.data?.message || 'Cannot upload audio.' });
    }
  }

  async function saveLesson() {
    if (!lesson.title.trim()) return setStatus({ type: 'error', text: 'Lesson title is required.' });
    if (!lesson.content.trim()) return setStatus({ type: 'error', text: 'Lesson content is required.' });
    try {
      if (editingLessonId) await api.put(`/admin/lessons/${editingLessonId}`, lesson);
      else await api.post('/admin/lessons', lesson);
      setLesson(emptyLesson);
      setEditingLessonId(null);
      setStatus({ type: 'success', text: 'Lesson saved.' });
      await refresh();
    } catch (error) {
      setStatus({ type: 'error', text: error.response?.data?.message || 'Cannot save lesson.' });
    }
  }

  async function saveNotification() {
    if (!notification.title.trim()) return setStatus({ type: 'error', text: 'Notification title is required.' });
    if (!notification.content.trim()) return setStatus({ type: 'error', text: 'Notification content is required.' });
    try {
      if (editingNotificationId) await api.put(`/admin/notifications/${editingNotificationId}`, notification);
      else await api.post('/admin/notifications', notification);
      setNotification(emptyNotification);
      setEditingNotificationId(null);
      setStatus({ type: 'success', text: 'Notification saved.' });
      await refresh();
    } catch (error) {
      setStatus({ type: 'error', text: error.response?.data?.message || 'Cannot save notification.' });
    }
  }

  async function uploadTemplateAudio(file, onUrl) {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await api.post('/files/audio', formData);
      onUrl(response.data.data);
      setStatus({ type: 'success', text: 'Đã tải audio lên.' });
    } catch (error) {
      setStatus({ type: 'error', text: error.response?.data?.message || 'Cannot upload audio.' });
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Admin dashboard</h1>
      {status && <div className={`panel ${status.type === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-green-200 bg-green-50 text-green-800'}`}>{status.text}</div>}

      {stats && <div className="grid md:grid-cols-3 gap-3">
        <Metric label="Users" value={stats.totalUsers} />
        <Metric label="Exams" value={stats.totalExams} />
        <Metric label="Attempts" value={stats.totalAttempts} />
      </div>}

      {stats && <section className="panel space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-black">User registration stats</h2>
            <p className="text-sm text-slate-500">Track new accounts and current user status.</p>
          </div>
          <span className="rounded-md bg-blue-600 px-3 py-1 text-sm font-bold text-white">{stats.totalUsers} total</span>
        </div>
        <div className="grid md:grid-cols-3 xl:grid-cols-6 gap-3">
          <MetricCard label="Today" value={stats.userRegistrations?.today || 0} tone="teal" />
          <MetricCard label="Last 7 days" value={stats.userRegistrations?.week || 0} tone="blue" />
          <MetricCard label="Last 30 days" value={stats.userRegistrations?.month || 0} tone="amber" />
          <MetricCard label="Active users" value={stats.usersByStatus?.active || 0} tone="green" />
          <MetricCard label="Locked users" value={stats.usersByStatus?.locked || 0} tone="red" />
          <MetricCard label="Admins" value={stats.usersByRole?.admin || 0} tone="slate" />
        </div>
      </section>}

      <section className="panel space-y-3">
        <h2 className="font-black">{editingExamId ? 'Edit exam' : 'Create exam'}</h2>
        <div className="grid md:grid-cols-3 gap-2">
          <input className="input" placeholder="Tiêu đề" value={exam.title} onChange={(e) => setExam({ ...exam, title: e.target.value })} />
          <select className="input" value={exam.type} onChange={(e) => {
            const type = e.target.value;
            setExam({ ...exam, type, duration: durationForType(type, exam.duration) });
          }}>{types.map((x) => <option key={x}>{x}</option>)}</select>
          <input className="input" type="number" placeholder="Duration" value={exam.duration} onChange={(e) => setExam({ ...exam, duration: Number(e.target.value) })} />
          <input className="input" placeholder="URL audio" value={exam.audioUrl || ''} onChange={(e) => setExam({ ...exam, audioUrl: e.target.value })} />
          <textarea className="input md:col-span-2" placeholder="Prompt" value={exam.prompt || ''} onChange={(e) => setExam({ ...exam, prompt: e.target.value })} />
          <textarea className="input md:col-span-3" placeholder="Transcript" value={exam.transcript || ''} onChange={(e) => setExam({ ...exam, transcript: e.target.value })} />
        </div>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={saveExam}><Save size={16} />Lưu đề thi</button>
          {editingExamId && <button className="btn btn-muted" onClick={() => { setExam(emptyExam); setEditingExamId(null); }}>Hủy</button>}
        </div>
      </section>

      <section className="panel space-y-3">
        <h2 className="font-black">{editingQuestionId ? 'Edit question' : 'Add question'}</h2>
        {exams.length === 0 && <p className="text-sm text-red-700">Chưa có đề thi. Hãy tạo đề trước, rồi thêm câu hỏi.</p>}
        <div className="grid md:grid-cols-3 gap-2">
          <select className="input" value={question.examId} onChange={(e) => setQuestion({ ...question, examId: e.target.value })}>
            <option value="">Chọn đề thi</option>
            {exams.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
          <QuestionTypeTemplatePicker
            value={question.questionType || 'MULTIPLE_CHOICE'}
            onChange={(type) => setQuestion({ ...question, questionType: type })}
            onApply={(type) => applyQuestionTypeTemplate(setQuestion, question, type)}
          />
          <textarea className="input md:col-span-2 min-h-24" placeholder="Content" value={question.content} onChange={(e) => setQuestion({ ...question, content: e.target.value })} />
          {['optionA', 'optionB', 'optionC', 'optionD', 'optionE', 'optionF'].map((key) => <input key={key} className="input" placeholder={key} value={question[key] || ''} onChange={(e) => setQuestion({ ...question, [key]: e.target.value })} />)}
          <input className="input" placeholder="URL audio câu hỏi" value={question.audioUrl || ''} onChange={(e) => setQuestion({ ...question, audioUrl: e.target.value })} />
          <input className="input" placeholder="URL ảnh câu hỏi 1" value={question.imageUrl || ''} onChange={(e) => setQuestion({ ...question, imageUrl: e.target.value })} />
          <input className="input" placeholder="URL ảnh câu hỏi 2" value={question.imageUrl2 || ''} onChange={(e) => setQuestion({ ...question, imageUrl2: e.target.value })} />
          <label className="input flex cursor-pointer items-center">
            <input className="hidden" type="file" accept="audio/*" onChange={(e) => uploadQuestionAudio(e.target.files?.[0], setQuestion, question)} />
            <span className="text-slate-500">Upload question audio</span>
          </label>
          {question.audioUrl && <audio className="w-full md:col-span-3" controls src={question.audioUrl} />}
          <textarea className="input md:col-span-3" placeholder="Script câu hỏi Listening" value={question.scriptText || ''} onChange={(e) => setQuestion({ ...question, scriptText: e.target.value })} />
          <input className="input" placeholder="Correct answer" value={question.correctAnswer || ''} onChange={(e) => setQuestion({ ...question, correctAnswer: e.target.value })} />
          <input className="input md:col-span-2" placeholder="Explanation" value={question.explanation || ''} onChange={(e) => setQuestion({ ...question, explanation: e.target.value })} />
        </div>
        {question.questionType === 'PARAGRAPH_ORDER' && <p className="text-sm text-slate-500">Nhập các đoạn vào optionA-D, đáp án đúng theo thứ tự ví dụ: B,D,A,C.</p>}
        {question.questionType === 'MATCHING_DROPDOWN' && <p className="text-sm text-slate-500">Nhập các đáp án vào optionA-F. Đáp án đúng cho Person 1-4 theo thứ tự, ví dụ: A,C,D,F.</p>}
        {question.questionType === 'OPINION_MATCH' && <p className="text-sm text-slate-500">Nhập các statement vào optionA-D. Đáp án đúng theo thứ tự với MAN, WOMAN, BOTH, ví dụ: MAN,WOMAN,BOTH,MAN.</p>}
        {question.questionType === 'INLINE_DROPDOWN' && <p className="text-sm text-slate-500">Nhập câu có vị trí trong bảng [[blank]], ví dụ: Where is the train [[blank]] in this town? OptionA-F là các từ chọn, correctAnswer là A/B/C...</p>}
        {question.questionType === 'PASSAGE_MATCH' && <p className="text-sm text-slate-500 whitespace-pre-wrap">Nhập content theo mẫu: Topic: Games from childhood{"\n\n"}[PASSAGES]{"\n"}A: đoạn A{"\n"}B: đoạn B{"\n"}C: đoạn C{"\n"}D: đoạn D{"\n\n"}[QUESTIONS]{"\n"}Who...?{"\n"}Who...?{"\n\n"}Correct answer nhập theo thứ tự câu hỏi, ví dụ: A,B,A,D,C,D.</p>}
        {question.questionType === 'SPEAKING_PROMPT' && <p className="text-sm text-slate-500">Nhập câu hỏi speaking vào Content, đáp án mẫu 1 vào optionA, đáp án mẫu 2 vào optionB. Nếu muốn hiện ảnh + bảng câu hỏi, nhập URL ảnh vào Prompt của exam.</p>}
        {question.questionType === 'SPEAKING_IMAGE_TABLE' && <p className="text-sm text-slate-500">Loại câu hỏi ảnh + bảng: nhập ảnh riêng của câu này vào Question image URL. Content là câu hỏi, optionA/optionB là đáp án mẫu.</p>}
        {question.questionType === 'SPEAKING_COMPARE_IMAGES' && <p className="text-sm text-slate-500">Loại so sánh 2 ảnh: nhập ảnh vào URL ảnh câu hỏi 1 và 2. Content nhập 3 ý, mỗi ý một dòng. optionA/B/C là đáp án mẫu cho từng ý.</p>}
        {question.questionType === 'SPEAKING_PART4_LIST' && <p className="text-sm text-slate-500">Speaking Part 4 list: mỗi câu hỏi là 1 dòng trong bảng. Content là tên câu hỏi, optionA/optionB là đáp án mẫu.</p>}
        <button className="btn btn-primary" onClick={saveQuestion}><Plus size={16} />Lưu câu hỏi</button>
      </section>

      <TemplateGroup title="Exam question templates">
        <WritingPart1Template
          title="Writing Part 1 template"
          status={templateStatus[templateKey('writingPart1')]}
          exams={exams.filter((item) => examMatchesSkill(item, 'WRITING'))}
          examId={writingPart1ExamId}
          rows={writingPart1Rows}
          onExamChange={setWritingPart1ExamId}
          onRowChange={(index, key, value) => updateWritingPart1Row(setWritingPart1Rows, index, key, value)}
          onReset={() => setWritingPart1Rows(defaultWritingPart1Rows)}
          onSave={() => saveWritingPart1Template({ examId: writingPart1ExamId, rows: writingPart1Rows })}
        />

        <WritingLongTemplate
          title="Writing long question template"
          status={templateStatus[templateKey('writingLong')]}
          exams={exams.filter((item) => examMatchesSkill(item, 'WRITING'))}
          examId={writingLongExamId}
          data={writingLongQuestion}
          onExamChange={setWritingLongExamId}
          onChange={(key, value) => setWritingLongQuestion((current) => ({ ...current, [key]: value }))}
          onReset={() => setWritingLongQuestion(defaultWritingLongQuestion)}
          onSave={() => saveWritingLongTemplate({ examId: writingLongExamId, data: writingLongQuestion })}
        />

        <WritingChatTemplate
        title="Writing group chat template"
        status={templateStatus[templateKey('writingChat')]}
        exams={exams.filter((item) => examMatchesSkill(item, 'WRITING'))}
        examId={writingChatExamId}
        data={writingChatQuestion}
        onExamChange={setWritingChatExamId}
        onChange={(key, value) => setWritingChatQuestion((current) => ({ ...current, [key]: value }))}
        onRowChange={(index, key, value) => updateWritingChatRow(setWritingChatQuestion, index, key, value)}
        onReset={() => setWritingChatQuestion(defaultWritingChatQuestion)}
        onSave={() => saveWritingChatTemplate({ examId: writingChatExamId, data: writingChatQuestion })}
      />

      <WritingEmailTemplate
        title="Writing email template"
        status={templateStatus[templateKey('writingEmail')]}
        exams={exams.filter((item) => examMatchesSkill(item, 'WRITING'))}
        examId={writingEmailExamId}
        data={writingEmailQuestion}
        onExamChange={setWritingEmailExamId}
        onChange={(key, value) => setWritingEmailQuestion((current) => ({ ...current, [key]: value }))}
        onRowChange={(index, key, value) => updateWritingEmailRow(setWritingEmailQuestion, index, key, value)}
        onReset={() => setWritingEmailQuestion(defaultWritingEmailQuestion)}
        onSave={() => saveWritingEmailTemplate({ examId: writingEmailExamId, data: writingEmailQuestion })}
      />

      <GapDropdownTemplate
        title="Gap dropdown template"
        status={templateStatus[templateKey('gapDropdown')]}
        exams={exams}
        examId={gapDropdownExamId}
        data={gapDropdownQuestion}
        onExamChange={setGapDropdownExamId}
        onChange={(key, value) => setGapDropdownQuestion((current) => ({ ...current, [key]: value }))}
        onRowChange={(index, key, value) => updateGapDropdownRow(setGapDropdownQuestion, index, key, value)}
        onOptionChange={(rowIndex, optionIndex, value) => updateGapDropdownOption(setGapDropdownQuestion, rowIndex, optionIndex, value)}
        onReset={() => setGapDropdownQuestion(defaultGapDropdownQuestion)}
        onSave={() => saveGapDropdownTemplate({ examId: gapDropdownExamId, data: gapDropdownQuestion })}
      />

      <GrammarTermMatchTemplate
        title="Grammar business term matching template"
        status={templateStatus[templateKey('grammarTermMatch')]}
        exams={exams.filter((item) => examMatchesSkill(item, 'GRAMMAR'))}
        examId={grammarTermMatchExamId}
        data={grammarTermMatchQuestion}
        onExamChange={setGrammarTermMatchExamId}
        onChange={(key, value) => setGrammarTermMatchQuestion((current) => ({ ...current, [key]: value }))}
        onRowChange={(index, key, value) => updateGrammarTermMatchRow(setGrammarTermMatchQuestion, index, key, value)}
        onOptionChange={(index, value) => updateGrammarTermMatchOption(setGrammarTermMatchQuestion, index, value)}
        onAddOption={() => addGrammarTermMatchOption(setGrammarTermMatchQuestion)}
        onReset={() => setGrammarTermMatchQuestion(freshTemplate(defaultGrammarTermMatchQuestion))}
        onSave={() => saveGrammarTermMatchTemplate({ examId: grammarTermMatchExamId, data: grammarTermMatchQuestion })}
      />

      <GrammarSentenceDropdownTemplate
        title="Grammar sentence dropdown template"
        status={templateStatus[templateKey('grammarSentenceDropdown')]}
        exams={exams.filter((item) => examMatchesSkill(item, 'GRAMMAR'))}
        examId={grammarSentenceDropdownExamId}
        data={grammarSentenceDropdownQuestion}
        onExamChange={setGrammarSentenceDropdownExamId}
        onChange={(key, value) => setGrammarSentenceDropdownQuestion((current) => ({ ...current, [key]: value }))}
        onRowChange={(index, key, value) => updateGrammarSentenceDropdownRow(setGrammarSentenceDropdownQuestion, index, key, value)}
        onOptionChange={(index, value) => updateGrammarSentenceDropdownOption(setGrammarSentenceDropdownQuestion, index, value)}
        onAddOption={() => addGrammarSentenceDropdownOption(setGrammarSentenceDropdownQuestion)}
        onReset={() => setGrammarSentenceDropdownQuestion(freshTemplate(defaultGrammarSentenceDropdownQuestion))}
        onSave={() => saveGrammarSentenceDropdownTemplate({ examId: grammarSentenceDropdownExamId, data: grammarSentenceDropdownQuestion })}
      />

      <ParagraphOrderTopicTemplate
        title="Paragraph order topic template"
        status={templateStatus[templateKey('paragraphOrderTopic')]}
        exams={exams}
        examId={paragraphOrderTopicExamId}
        data={paragraphOrderTopicQuestion}
        onExamChange={setParagraphOrderTopicExamId}
        onChange={(key, value) => setParagraphOrderTopicQuestion((current) => ({ ...current, [key]: value }))}
        onRowChange={(index, value) => updateParagraphOrderTopicRow(setParagraphOrderTopicQuestion, index, value)}
        onReset={() => setParagraphOrderTopicQuestion(defaultParagraphOrderTopicQuestion)}
        onSave={() => saveParagraphOrderTopicTemplate({ examId: paragraphOrderTopicExamId, data: paragraphOrderTopicQuestion })}
      />

      <PassageMatchTemplate
        title="Passage match forum template"
        status={templateStatus[templateKey('passageMatch')]}
        exams={exams}
        examId={passageMatchExamId}
        data={passageMatchQuestion}
        onExamChange={setPassageMatchExamId}
        onChange={(key, value) => setPassageMatchQuestion((current) => ({ ...current, [key]: value }))}
        onPassageChange={(index, value) => updatePassageMatchPassage(setPassageMatchQuestion, index, value)}
        onQuestionChange={(index, value) => updatePassageMatchQuestion(setPassageMatchQuestion, index, 'questions', value)}
        onAnswerChange={(index, value) => updatePassageMatchQuestion(setPassageMatchQuestion, index, 'answers', value)}
        onReset={() => setPassageMatchQuestion(defaultPassageMatchQuestion)}
        onSave={() => savePassageMatchTemplate({ examId: passageMatchExamId, data: passageMatchQuestion })}
      />

      <ReadingDropdownParagraphsTemplate
        title="Reading dropdown paragraphs template"
        status={templateStatus[templateKey('readingDropdownParagraphs')]}
        exams={exams}
        examId={readingDropdownParagraphsExamId}
        data={readingDropdownParagraphsQuestion}
        onExamChange={setReadingDropdownParagraphsExamId}
        onChange={(key, value) => setReadingDropdownParagraphsQuestion((current) => ({ ...current, [key]: value }))}
        onArrayChange={(key, index, value) => updateReadingDropdownArray(setReadingDropdownParagraphsQuestion, key, index, value)}
        onReset={() => setReadingDropdownParagraphsQuestion(defaultReadingDropdownParagraphsQuestion)}
        onSave={() => saveReadingDropdownParagraphsTemplate({ examId: readingDropdownParagraphsExamId, data: readingDropdownParagraphsQuestion })}
      />

      <ListeningMatchingTemplate
        title="Listening matching template"
        status={templateStatus[templateKey('listeningMatching')]}
        exams={exams.filter((item) => examMatchesSkill(item, 'LISTENING'))}
        examId={listeningMatchingExamId}
        data={listeningMatchingQuestion}
        onExamChange={setListeningMatchingExamId}
        onChange={(key, value) => setListeningMatchingQuestion((current) => ({ ...current, [key]: value }))}
        onArrayChange={(key, index, value) => updateListeningMatchingArray(setListeningMatchingQuestion, key, index, value)}
        onAudioUpload={(file, index) => uploadTemplateAudio(file, (uploadedUrl) => updateListeningMatchingArray(setListeningMatchingQuestion, 'audioUrls', index, uploadedUrl))}
        onReset={() => setListeningMatchingQuestion(defaultListeningMatchingQuestion)}
        onSave={() => saveListeningMatchingTemplate({ examId: listeningMatchingExamId, data: listeningMatchingQuestion })}
      />

      <ListeningOpinionTemplate
        title="Listening opinion template"
        status={templateStatus[templateKey('listeningOpinion')]}
        exams={exams.filter((item) => examMatchesSkill(item, 'LISTENING'))}
        examId={listeningOpinionExamId}
        data={listeningOpinionQuestion}
        onExamChange={setListeningOpinionExamId}
        onChange={(key, value) => setListeningOpinionQuestion((current) => ({ ...current, [key]: value }))}
        onArrayChange={(key, index, value) => updateListeningOpinionArray(setListeningOpinionQuestion, key, index, value)}
        onReset={() => setListeningOpinionQuestion(defaultListeningOpinionQuestion)}
        onSave={() => saveListeningOpinionTemplate({ examId: listeningOpinionExamId, data: listeningOpinionQuestion })}
      />

      <ListeningGroupMcTemplate
        title="Listening multiple choice template"
        status={templateStatus[templateKey('listeningGroupMc')]}
        exams={exams.filter((item) => examMatchesSkill(item, 'LISTENING'))}
        examId={listeningGroupMcExamId}
        data={listeningGroupMcQuestion}
        onExamChange={setListeningGroupMcExamId}
        onChange={(key, value) => setListeningGroupMcQuestion((current) => ({ ...current, [key]: value }))}
        onQuestionChange={(index, key, value) => updateListeningGroupMcQuestion(setListeningGroupMcQuestion, index, key, value)}
        onOptionChange={(questionIndex, optionIndex, value) => updateListeningGroupMcOption(setListeningGroupMcQuestion, questionIndex, optionIndex, value)}
        onReset={() => setListeningGroupMcQuestion(defaultListeningGroupMcQuestion)}
        onSave={() => saveListeningGroupMcTemplate({ examId: listeningGroupMcExamId, data: listeningGroupMcQuestion })}
      />

      <ListeningSingleMcTemplate
        title="Listening single choice template"
        status={templateStatus[templateKey('listeningSingleMc')]}
        exams={exams.filter((item) => examMatchesSkill(item, 'LISTENING'))}
        examId={listeningSingleMcExamId}
        data={listeningSingleMcQuestion}
        onExamChange={setListeningSingleMcExamId}
        onChange={(key, value) => setListeningSingleMcQuestion((current) => ({ ...current, [key]: value }))}
        onOptionChange={(index, value) => updateListeningSingleMcOption(setListeningSingleMcQuestion, index, value)}
        onReset={() => setListeningSingleMcQuestion(defaultListeningSingleMcQuestion)}
        onSave={() => saveListeningSingleMcTemplate({ examId: listeningSingleMcExamId, data: listeningSingleMcQuestion })}
      />

      <SpeakingQ1ListTemplate
        title="Speaking Câu 1 list template"
        status={templateStatus[templateKey('speakingQ1')]}
        exams={exams.filter((item) => examMatchesSkill(item, 'SPEAKING'))}
        examId={speakingQ1ExamId}
        rows={speakingQ1Rows}
        onExamChange={setSpeakingQ1ExamId}
        onRowChange={(index, key, value) => updateSpeakingQ1Row(setSpeakingQ1Rows, index, key, value)}
        onReset={() => setSpeakingQ1Rows(defaultSpeakingQ1Rows)}
        onSave={() => saveSpeakingQ1Template({ examId: speakingQ1ExamId, rows: speakingQ1Rows })}
      />

        <SpeakingImageListTemplate
          title="Speaking image / compare question template"
          status={templateStatus[templateKey('speakingImageList')]}
          exams={exams.filter((item) => examMatchesSkill(item, 'SPEAKING'))}
          examId={speakingImageListExamId}
          data={speakingImageListQuestion}
          onExamChange={setSpeakingImageListExamId}
          onChange={(key, value) => setSpeakingImageListQuestion((current) => ({ ...current, [key]: value }))}
          onRowChange={(index, key, value) => updateSpeakingImageListRow(setSpeakingImageListQuestion, index, key, value)}
          onReset={() => setSpeakingImageListQuestion(defaultSpeakingImageListQuestion)}
          onSave={() => saveSpeakingImageListTemplate({ examId: speakingImageListExamId, data: speakingImageListQuestion })}
        />

        <SpeakingPart4CardTemplate
          title="Speaking Part 4 card template"
          status={templateStatus[templateKey('speakingPart4Card')]}
          exams={exams.filter((item) => examMatchesSkill(item, 'SPEAKING'))}
          examId={speakingPart4CardExamId}
          data={speakingPart4CardQuestion}
          onExamChange={setSpeakingPart4CardExamId}
          onChange={(key, value) => setSpeakingPart4CardQuestion((current) => ({ ...current, [key]: value }))}
          onRowChange={(index, key, value) => updateSpeakingPart4CardRow(setSpeakingPart4CardQuestion, index, key, value)}
          onReset={() => setSpeakingPart4CardQuestion(defaultSpeakingPart4CardQuestion)}
          onSave={() => saveSpeakingPart4CardTemplate({ examId: speakingPart4CardExamId, data: speakingPart4CardQuestion })}
        />
      </TemplateGroup>

      <section className="panel space-y-3">
        <h2 className="font-black">Import câu hỏi</h2>
        <div className="grid md:grid-cols-3 gap-2">
          <select className="input" value={importExamId} onChange={(e) => setImportExamId(e.target.value)}>
            <option value="">Chọn đề thi</option>
            {exams.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
          <label className="input flex items-center md:col-span-2 cursor-pointer">
            <input className="hidden" type="file" accept=".csv,text/csv" onChange={(e) => setImportFile(e.target.files?.[0] || null)} />
            <span className={importFile ? 'text-slate-900' : 'text-slate-400'}>{importFile?.name || 'Choose CSV file'}</span>
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-primary" onClick={importQuestions}><Upload size={16} />Import CSV</button>
          <button className="btn btn-muted" onClick={downloadQuestionTemplate}><Download size={16} />CSV template</button>
        </div>
      </section>

      <section className="panel space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-black">{editingPracticeExamId ? 'Edit practice exam' : 'Create practice exam'}</h2>
            <p className="text-sm text-slate-500">Đề riêng cho mục Luyện thi, không liên kết với Reading/Listening cũ.</p>
          </div>
          <span className="rounded-md bg-blue-600 px-3 py-1 text-sm font-bold text-white">{practiceExams.length} de</span>
        </div>
        <div className="grid md:grid-cols-3 gap-2">
          <input className="input" placeholder="Tiêu đề" value={practiceExam.title} onChange={(e) => setPracticeExam({ ...practiceExam, title: e.target.value })} />
          <select className="input" value={practiceExam.type} onChange={(e) => {
            const type = e.target.value;
            setPracticeExam({ ...practiceExam, type, duration: durationForType(type, practiceExam.duration) });
          }}>{['MIXED', 'LISTENING', 'READING', 'WRITING', 'SPEAKING', 'GRAMMAR'].map((x) => <option key={x}>{x}</option>)}</select>
          <input className="input" type="number" placeholder="Duration" value={practiceExam.duration} onChange={(e) => setPracticeExam({ ...practiceExam, duration: Number(e.target.value) })} />
          <input className="input" placeholder="URL audio" value={practiceExam.audioUrl || ''} onChange={(e) => setPracticeExam({ ...practiceExam, audioUrl: e.target.value })} />
          <textarea className="input md:col-span-2" placeholder="Prompt" value={practiceExam.prompt || ''} onChange={(e) => setPracticeExam({ ...practiceExam, prompt: e.target.value })} />
          <textarea className="input md:col-span-3" placeholder="Transcript" value={practiceExam.transcript || ''} onChange={(e) => setPracticeExam({ ...practiceExam, transcript: e.target.value })} />
        </div>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={savePracticeExam}><Save size={16} />Lưu đề luyện thi</button>
          {editingPracticeExamId && <button className="btn btn-muted" onClick={() => { setPracticeExam(emptyPracticeExam); setEditingPracticeExamId(null); }}>Hủy</button>}
        </div>
      </section>

      <section className="panel space-y-3">
        <h2 className="font-black">{editingPracticeQuestionId ? 'Edit practice question' : 'Add practice question'}</h2>
        {practiceExams.length === 0 && <p className="text-sm text-red-700">No practice exams found. Create a practice exam first.</p>}
        <div className="grid md:grid-cols-3 gap-2">
          <select className="input" value={practiceQuestion.examId} onChange={(e) => setPracticeQuestion({ ...practiceQuestion, examId: e.target.value })}>
            <option value="">Chọn đề luyện thi</option>
            {practiceExams.map((item) => <option key={item.id} value={item.id}>{item.title} - {item.type}</option>)}
          </select>
          <QuestionTypeTemplatePicker
            value={practiceQuestion.questionType || 'MULTIPLE_CHOICE'}
            onChange={(type) => setPracticeQuestion({ ...practiceQuestion, questionType: type })}
            onApply={(type) => applyQuestionTypeTemplate(setPracticeQuestion, practiceQuestion, type)}
          />
          <textarea className="input md:col-span-2 min-h-24" placeholder="Content" value={practiceQuestion.content} onChange={(e) => setPracticeQuestion({ ...practiceQuestion, content: e.target.value })} />
          {['optionA', 'optionB', 'optionC', 'optionD', 'optionE', 'optionF'].map((key) => <input key={key} className="input" placeholder={key} value={practiceQuestion[key] || ''} onChange={(e) => setPracticeQuestion({ ...practiceQuestion, [key]: e.target.value })} />)}
          <input className="input" placeholder="URL audio câu hỏi" value={practiceQuestion.audioUrl || ''} onChange={(e) => setPracticeQuestion({ ...practiceQuestion, audioUrl: e.target.value })} />
          <input className="input" placeholder="URL ảnh câu hỏi 1" value={practiceQuestion.imageUrl || ''} onChange={(e) => setPracticeQuestion({ ...practiceQuestion, imageUrl: e.target.value })} />
          <input className="input" placeholder="URL ảnh câu hỏi 2" value={practiceQuestion.imageUrl2 || ''} onChange={(e) => setPracticeQuestion({ ...practiceQuestion, imageUrl2: e.target.value })} />
          <label className="input flex cursor-pointer items-center">
            <input className="hidden" type="file" accept="audio/*" onChange={(e) => uploadQuestionAudio(e.target.files?.[0], setPracticeQuestion, practiceQuestion)} />
            <span className="text-slate-500">Upload question audio</span>
          </label>
          {practiceQuestion.audioUrl && <audio className="w-full md:col-span-3" controls src={practiceQuestion.audioUrl} />}
          <textarea className="input md:col-span-3" placeholder="Script câu hỏi Listening" value={practiceQuestion.scriptText || ''} onChange={(e) => setPracticeQuestion({ ...practiceQuestion, scriptText: e.target.value })} />
          <input className="input" placeholder="Correct answer" value={practiceQuestion.correctAnswer || ''} onChange={(e) => setPracticeQuestion({ ...practiceQuestion, correctAnswer: e.target.value })} />
          <input className="input md:col-span-2" placeholder="Explanation" value={practiceQuestion.explanation || ''} onChange={(e) => setPracticeQuestion({ ...practiceQuestion, explanation: e.target.value })} />
        </div>
        {practiceQuestion.questionType === 'PARAGRAPH_ORDER' && <p className="text-sm text-slate-500">Nhập các đoạn vào optionA-D, đáp án đúng theo thứ tự ví dụ: B,D,A,C.</p>}
        {practiceQuestion.questionType === 'MATCHING_DROPDOWN' && <p className="text-sm text-slate-500">Nhập các đáp án vào optionA-F. Đáp án đúng cho Person 1-4 theo thứ tự, ví dụ: A,C,D,F.</p>}
        {practiceQuestion.questionType === 'OPINION_MATCH' && <p className="text-sm text-slate-500">Nhập các statement vào optionA-D. Đáp án đúng theo thứ tự với MAN, WOMAN, BOTH, ví dụ: MAN,WOMAN,BOTH,MAN.</p>}
        {practiceQuestion.questionType === 'INLINE_DROPDOWN' && <p className="text-sm text-slate-500">Nhập câu có vị trí trong bảng [[blank]], ví dụ: Where is the train [[blank]] in this town? OptionA-F là các từ chọn, correctAnswer là A/B/C...</p>}
        {practiceQuestion.questionType === 'PASSAGE_MATCH' && <p className="text-sm text-slate-500 whitespace-pre-wrap">Nhập content theo mẫu: Topic: Games from childhood{"\n\n"}[PASSAGES]{"\n"}A: đoạn A{"\n"}B: đoạn B{"\n"}C: đoạn C{"\n"}D: đoạn D{"\n\n"}[QUESTIONS]{"\n"}Who...?{"\n"}Who...?{"\n\n"}Correct answer nhập theo thứ tự câu hỏi, ví dụ: A,B,A,D,C,D.</p>}
        {practiceQuestion.questionType === 'SPEAKING_PROMPT' && <p className="text-sm text-slate-500">Nhập câu hỏi speaking vào Content, đáp án mẫu 1 vào optionA, đáp án mẫu 2 vào optionB. Nếu muốn hiện ảnh + bảng câu hỏi, nhập URL ảnh vào Prompt của practice exam.</p>}
        {practiceQuestion.questionType === 'SPEAKING_IMAGE_TABLE' && <p className="text-sm text-slate-500">Loại câu hỏi ảnh + bảng: nhập ảnh riêng của câu này vào Question image URL. Content là câu hỏi, optionA/optionB là đáp án mẫu.</p>}
        {practiceQuestion.questionType === 'SPEAKING_COMPARE_IMAGES' && <p className="text-sm text-slate-500">Loại so sánh 2 ảnh: nhập ảnh vào URL ảnh câu hỏi 1 và 2. Content nhập 3 ý, mỗi ý một dòng. optionA/B/C là đáp án mẫu cho từng ý.</p>}
        {practiceQuestion.questionType === 'SPEAKING_PART4_LIST' && <p className="text-sm text-slate-500">Speaking Part 4 list: mỗi câu hỏi là 1 dòng trong bảng. Content là tên câu hỏi, optionA/optionB là đáp án mẫu.</p>}
        <button className="btn btn-primary" onClick={savePracticeQuestion}><Plus size={16} />Save practice question</button>
      </section>

      <TemplateGroup title="Practice question templates">
        <WritingPart1Template
          title="Practice Writing Part 1 template"
          status={templateStatus[templateKey('writingPart1', true)]}
          exams={practiceExams.filter((item) => examMatchesSkill(item, 'WRITING'))}
          examId={practiceWritingPart1ExamId}
          rows={practiceWritingPart1Rows}
          onExamChange={setPracticeWritingPart1ExamId}
          onRowChange={(index, key, value) => updateWritingPart1Row(setPracticeWritingPart1Rows, index, key, value)}
          onReset={() => setPracticeWritingPart1Rows(defaultWritingPart1Rows)}
          onSave={() => saveWritingPart1Template({ examId: practiceWritingPart1ExamId, rows: practiceWritingPart1Rows, practice: true })}
        />

        <WritingLongTemplate
          title="Practice writing long question template"
          status={templateStatus[templateKey('writingLong', true)]}
          exams={practiceExams.filter((item) => examMatchesSkill(item, 'WRITING'))}
          examId={practiceWritingLongExamId}
          data={practiceWritingLongQuestion}
          onExamChange={setPracticeWritingLongExamId}
          onChange={(key, value) => setPracticeWritingLongQuestion((current) => ({ ...current, [key]: value }))}
          onReset={() => setPracticeWritingLongQuestion(defaultWritingLongQuestion)}
          onSave={() => saveWritingLongTemplate({ examId: practiceWritingLongExamId, data: practiceWritingLongQuestion, practice: true })}
        />

        <WritingChatTemplate
        title="Practice writing group chat template"
        status={templateStatus[templateKey('writingChat', true)]}
        exams={practiceExams.filter((item) => examMatchesSkill(item, 'WRITING'))}
        examId={practiceWritingChatExamId}
        data={practiceWritingChatQuestion}
        onExamChange={setPracticeWritingChatExamId}
        onChange={(key, value) => setPracticeWritingChatQuestion((current) => ({ ...current, [key]: value }))}
        onRowChange={(index, key, value) => updateWritingChatRow(setPracticeWritingChatQuestion, index, key, value)}
        onReset={() => setPracticeWritingChatQuestion(defaultWritingChatQuestion)}
        onSave={() => saveWritingChatTemplate({ examId: practiceWritingChatExamId, data: practiceWritingChatQuestion, practice: true })}
      />

      <WritingEmailTemplate
        title="Practice writing email template"
        status={templateStatus[templateKey('writingEmail', true)]}
        exams={practiceExams.filter((item) => examMatchesSkill(item, 'WRITING'))}
        examId={practiceWritingEmailExamId}
        data={practiceWritingEmailQuestion}
        onExamChange={setPracticeWritingEmailExamId}
        onChange={(key, value) => setPracticeWritingEmailQuestion((current) => ({ ...current, [key]: value }))}
        onRowChange={(index, key, value) => updateWritingEmailRow(setPracticeWritingEmailQuestion, index, key, value)}
        onReset={() => setPracticeWritingEmailQuestion(defaultWritingEmailQuestion)}
        onSave={() => saveWritingEmailTemplate({ examId: practiceWritingEmailExamId, data: practiceWritingEmailQuestion, practice: true })}
      />

      <GapDropdownTemplate
        title="Practice gap dropdown template"
        status={templateStatus[templateKey('gapDropdown', true)]}
        exams={practiceExams}
        examId={practiceGapDropdownExamId}
        data={practiceGapDropdownQuestion}
        onExamChange={setPracticeGapDropdownExamId}
        onChange={(key, value) => setPracticeGapDropdownQuestion((current) => ({ ...current, [key]: value }))}
        onRowChange={(index, key, value) => updateGapDropdownRow(setPracticeGapDropdownQuestion, index, key, value)}
        onOptionChange={(rowIndex, optionIndex, value) => updateGapDropdownOption(setPracticeGapDropdownQuestion, rowIndex, optionIndex, value)}
        onReset={() => setPracticeGapDropdownQuestion(defaultGapDropdownQuestion)}
        onSave={() => saveGapDropdownTemplate({ examId: practiceGapDropdownExamId, data: practiceGapDropdownQuestion, practice: true })}
      />

      <GrammarTermMatchTemplate
        title="Practice grammar business term matching template"
        status={templateStatus[templateKey('grammarTermMatch', true)]}
        exams={practiceExams.filter((item) => examMatchesSkill(item, 'GRAMMAR'))}
        examId={practiceGrammarTermMatchExamId}
        data={practiceGrammarTermMatchQuestion}
        onExamChange={setPracticeGrammarTermMatchExamId}
        onChange={(key, value) => setPracticeGrammarTermMatchQuestion((current) => ({ ...current, [key]: value }))}
        onRowChange={(index, key, value) => updateGrammarTermMatchRow(setPracticeGrammarTermMatchQuestion, index, key, value)}
        onOptionChange={(index, value) => updateGrammarTermMatchOption(setPracticeGrammarTermMatchQuestion, index, value)}
        onAddOption={() => addGrammarTermMatchOption(setPracticeGrammarTermMatchQuestion)}
        onReset={() => setPracticeGrammarTermMatchQuestion(freshTemplate(defaultGrammarTermMatchQuestion))}
        onSave={() => saveGrammarTermMatchTemplate({ examId: practiceGrammarTermMatchExamId, data: practiceGrammarTermMatchQuestion, practice: true })}
      />

      <GrammarSentenceDropdownTemplate
        title="Practice grammar sentence dropdown template"
        status={templateStatus[templateKey('grammarSentenceDropdown', true)]}
        exams={practiceExams.filter((item) => examMatchesSkill(item, 'GRAMMAR'))}
        examId={practiceGrammarSentenceDropdownExamId}
        data={practiceGrammarSentenceDropdownQuestion}
        onExamChange={setPracticeGrammarSentenceDropdownExamId}
        onChange={(key, value) => setPracticeGrammarSentenceDropdownQuestion((current) => ({ ...current, [key]: value }))}
        onRowChange={(index, key, value) => updateGrammarSentenceDropdownRow(setPracticeGrammarSentenceDropdownQuestion, index, key, value)}
        onOptionChange={(index, value) => updateGrammarSentenceDropdownOption(setPracticeGrammarSentenceDropdownQuestion, index, value)}
        onAddOption={() => addGrammarSentenceDropdownOption(setPracticeGrammarSentenceDropdownQuestion)}
        onReset={() => setPracticeGrammarSentenceDropdownQuestion(freshTemplate(defaultGrammarSentenceDropdownQuestion))}
        onSave={() => saveGrammarSentenceDropdownTemplate({ examId: practiceGrammarSentenceDropdownExamId, data: practiceGrammarSentenceDropdownQuestion, practice: true })}
      />

      <ParagraphOrderTopicTemplate
        title="Practice paragraph order topic template"
        status={templateStatus[templateKey('paragraphOrderTopic', true)]}
        exams={practiceExams}
        examId={practiceParagraphOrderTopicExamId}
        data={practiceParagraphOrderTopicQuestion}
        onExamChange={setPracticeParagraphOrderTopicExamId}
        onChange={(key, value) => setPracticeParagraphOrderTopicQuestion((current) => ({ ...current, [key]: value }))}
        onRowChange={(index, value) => updateParagraphOrderTopicRow(setPracticeParagraphOrderTopicQuestion, index, value)}
        onReset={() => setPracticeParagraphOrderTopicQuestion(defaultParagraphOrderTopicQuestion)}
        onSave={() => saveParagraphOrderTopicTemplate({ examId: practiceParagraphOrderTopicExamId, data: practiceParagraphOrderTopicQuestion, practice: true })}
      />

      <PassageMatchTemplate
        title="Practice passage match forum template"
        status={templateStatus[templateKey('passageMatch', true)]}
        exams={practiceExams}
        examId={practicePassageMatchExamId}
        data={practicePassageMatchQuestion}
        onExamChange={setPracticePassageMatchExamId}
        onChange={(key, value) => setPracticePassageMatchQuestion((current) => ({ ...current, [key]: value }))}
        onPassageChange={(index, value) => updatePassageMatchPassage(setPracticePassageMatchQuestion, index, value)}
        onQuestionChange={(index, value) => updatePassageMatchQuestion(setPracticePassageMatchQuestion, index, 'questions', value)}
        onAnswerChange={(index, value) => updatePassageMatchQuestion(setPracticePassageMatchQuestion, index, 'answers', value)}
        onReset={() => setPracticePassageMatchQuestion(defaultPassageMatchQuestion)}
        onSave={() => savePassageMatchTemplate({ examId: practicePassageMatchExamId, data: practicePassageMatchQuestion, practice: true })}
      />

      <ReadingDropdownParagraphsTemplate
        title="Practice reading dropdown paragraphs template"
        status={templateStatus[templateKey('readingDropdownParagraphs', true)]}
        exams={practiceExams}
        examId={practiceReadingDropdownParagraphsExamId}
        data={practiceReadingDropdownParagraphsQuestion}
        onExamChange={setPracticeReadingDropdownParagraphsExamId}
        onChange={(key, value) => setPracticeReadingDropdownParagraphsQuestion((current) => ({ ...current, [key]: value }))}
        onArrayChange={(key, index, value) => updateReadingDropdownArray(setPracticeReadingDropdownParagraphsQuestion, key, index, value)}
        onReset={() => setPracticeReadingDropdownParagraphsQuestion(defaultReadingDropdownParagraphsQuestion)}
        onSave={() => saveReadingDropdownParagraphsTemplate({ examId: practiceReadingDropdownParagraphsExamId, data: practiceReadingDropdownParagraphsQuestion, practice: true })}
      />

      <ListeningMatchingTemplate
        title="Practice listening matching template"
        status={templateStatus[templateKey('listeningMatching', true)]}
        exams={practiceExams.filter((item) => examMatchesSkill(item, 'LISTENING'))}
        examId={practiceListeningMatchingExamId}
        data={practiceListeningMatchingQuestion}
        onExamChange={setPracticeListeningMatchingExamId}
        onChange={(key, value) => setPracticeListeningMatchingQuestion((current) => ({ ...current, [key]: value }))}
        onArrayChange={(key, index, value) => updateListeningMatchingArray(setPracticeListeningMatchingQuestion, key, index, value)}
        onAudioUpload={(file, index) => uploadTemplateAudio(file, (uploadedUrl) => updateListeningMatchingArray(setPracticeListeningMatchingQuestion, 'audioUrls', index, uploadedUrl))}
        onReset={() => setPracticeListeningMatchingQuestion(defaultListeningMatchingQuestion)}
        onSave={() => saveListeningMatchingTemplate({ examId: practiceListeningMatchingExamId, data: practiceListeningMatchingQuestion, practice: true })}
      />

      <ListeningOpinionTemplate
        title="Practice listening opinion template"
        status={templateStatus[templateKey('listeningOpinion', true)]}
        exams={practiceExams.filter((item) => examMatchesSkill(item, 'LISTENING'))}
        examId={practiceListeningOpinionExamId}
        data={practiceListeningOpinionQuestion}
        onExamChange={setPracticeListeningOpinionExamId}
        onChange={(key, value) => setPracticeListeningOpinionQuestion((current) => ({ ...current, [key]: value }))}
        onArrayChange={(key, index, value) => updateListeningOpinionArray(setPracticeListeningOpinionQuestion, key, index, value)}
        onReset={() => setPracticeListeningOpinionQuestion(defaultListeningOpinionQuestion)}
        onSave={() => saveListeningOpinionTemplate({ examId: practiceListeningOpinionExamId, data: practiceListeningOpinionQuestion, practice: true })}
      />

      <ListeningGroupMcTemplate
        title="Practice listening multiple choice template"
        status={templateStatus[templateKey('listeningGroupMc', true)]}
        exams={practiceExams.filter((item) => examMatchesSkill(item, 'LISTENING'))}
        examId={practiceListeningGroupMcExamId}
        data={practiceListeningGroupMcQuestion}
        onExamChange={setPracticeListeningGroupMcExamId}
        onChange={(key, value) => setPracticeListeningGroupMcQuestion((current) => ({ ...current, [key]: value }))}
        onQuestionChange={(index, key, value) => updateListeningGroupMcQuestion(setPracticeListeningGroupMcQuestion, index, key, value)}
        onOptionChange={(questionIndex, optionIndex, value) => updateListeningGroupMcOption(setPracticeListeningGroupMcQuestion, questionIndex, optionIndex, value)}
        onReset={() => setPracticeListeningGroupMcQuestion(defaultListeningGroupMcQuestion)}
        onSave={() => saveListeningGroupMcTemplate({ examId: practiceListeningGroupMcExamId, data: practiceListeningGroupMcQuestion, practice: true })}
      />

      <ListeningSingleMcTemplate
        title="Practice listening single choice template"
        status={templateStatus[templateKey('listeningSingleMc', true)]}
        exams={practiceExams.filter((item) => examMatchesSkill(item, 'LISTENING'))}
        examId={practiceListeningSingleMcExamId}
        data={practiceListeningSingleMcQuestion}
        onExamChange={setPracticeListeningSingleMcExamId}
        onChange={(key, value) => setPracticeListeningSingleMcQuestion((current) => ({ ...current, [key]: value }))}
        onOptionChange={(index, value) => updateListeningSingleMcOption(setPracticeListeningSingleMcQuestion, index, value)}
        onReset={() => setPracticeListeningSingleMcQuestion(defaultListeningSingleMcQuestion)}
        onSave={() => saveListeningSingleMcTemplate({ examId: practiceListeningSingleMcExamId, data: practiceListeningSingleMcQuestion, practice: true })}
      />

      <SpeakingQ1ListTemplate
        title="Practice Speaking Câu 1 list template"
        status={templateStatus[templateKey('speakingQ1', true)]}
        exams={practiceExams.filter((item) => examMatchesSkill(item, 'SPEAKING'))}
        examId={practiceSpeakingQ1ExamId}
        rows={practiceSpeakingQ1Rows}
        onExamChange={setPracticeSpeakingQ1ExamId}
        onRowChange={(index, key, value) => updateSpeakingQ1Row(setPracticeSpeakingQ1Rows, index, key, value)}
        onReset={() => setPracticeSpeakingQ1Rows(defaultSpeakingQ1Rows)}
        onSave={() => saveSpeakingQ1Template({ examId: practiceSpeakingQ1ExamId, rows: practiceSpeakingQ1Rows, practice: true })}
      />

        <SpeakingImageListTemplate
          title="Practice speaking image / compare question template"
          status={templateStatus[templateKey('speakingImageList', true)]}
          exams={practiceExams.filter((item) => examMatchesSkill(item, 'SPEAKING'))}
          examId={practiceSpeakingImageListExamId}
          data={practiceSpeakingImageListQuestion}
          onExamChange={setPracticeSpeakingImageListExamId}
          onChange={(key, value) => setPracticeSpeakingImageListQuestion((current) => ({ ...current, [key]: value }))}
          onRowChange={(index, key, value) => updateSpeakingImageListRow(setPracticeSpeakingImageListQuestion, index, key, value)}
          onReset={() => setPracticeSpeakingImageListQuestion(defaultSpeakingImageListQuestion)}
          onSave={() => saveSpeakingImageListTemplate({ examId: practiceSpeakingImageListExamId, data: practiceSpeakingImageListQuestion, practice: true })}
        />

        <SpeakingPart4CardTemplate
          title="Practice Speaking Part 4 card template"
          status={templateStatus[templateKey('speakingPart4Card', true)]}
          exams={practiceExams.filter((item) => examMatchesSkill(item, 'SPEAKING'))}
          examId={practiceSpeakingPart4CardExamId}
          data={practiceSpeakingPart4CardQuestion}
          onExamChange={setPracticeSpeakingPart4CardExamId}
          onChange={(key, value) => setPracticeSpeakingPart4CardQuestion((current) => ({ ...current, [key]: value }))}
          onRowChange={(index, key, value) => updateSpeakingPart4CardRow(setPracticeSpeakingPart4CardQuestion, index, key, value)}
          onReset={() => setPracticeSpeakingPart4CardQuestion(defaultSpeakingPart4CardQuestion)}
          onSave={() => saveSpeakingPart4CardTemplate({ examId: practiceSpeakingPart4CardExamId, data: practiceSpeakingPart4CardQuestion, practice: true })}
        />
      </TemplateGroup>

      <section className="panel">
        <h2 className="font-black mb-3">Manage practice exams</h2>
        <div className="space-y-3">
          {practiceExams.map((item) => (
            <ExamCard
              key={item.id}
              exam={item}
              onEdit={() => { setEditingPracticeExamId(item.id); setPracticeExam({ title: item.title, type: item.type, duration: item.duration, transcript: item.transcript || '', audioUrl: item.audioUrl || '', prompt: item.prompt || '' }); }}
              onDelete={async () => { if (confirm('Delete this practice exam?')) { await api.delete(`/admin/practice-exams/${item.id}`); await refresh(); } }}
              onEditQuestion={(q) => { setEditingPracticeQuestionId(q.id); setPracticeQuestion({ examId: item.id, content: q.content, optionA: q.optionA || '', optionB: q.optionB || '', optionC: q.optionC || '', optionD: q.optionD || '', optionE: q.optionE || '', optionF: q.optionF || '', audioUrl: q.audioUrl || '', imageUrl: q.imageUrl || '', imageUrl2: q.imageUrl2 || '', scriptText: q.scriptText || '', correctAnswer: q.correctAnswer || '', explanation: q.explanation || '', questionType: q.questionType || 'MULTIPLE_CHOICE' }); }}
              onDeleteQuestion={async (q) => { if (confirm('Xóa câu hỏi luyện thi này?')) { await api.delete(`/admin/practice-questions/${q.id}`); await refresh(); } }}
              onDeleteQuestions={async (questions) => {
                if (confirm(`Xóa ${questions.length} câu hỏi luyện thi đã chọn?`)) {
                  await Promise.all(questions.map((q) => api.delete(`/admin/practice-questions/${q.id}`)));
                  await refresh();
                }
              }}
            />
          ))}
        </div>
      </section>

      <section className="panel">
        <h2 className="font-black mb-3">Quản lý đề thi và câu hỏi</h2>
        <div className="space-y-3">
          {exams.map((item) => <ExamCard key={item.id} exam={item} onEdit={() => { setEditingExamId(item.id); setExam({ title: item.title, type: item.type, duration: item.duration, transcript: item.transcript || '', audioUrl: item.audioUrl || '', prompt: item.prompt || '' }); }} onDelete={async () => { if (confirm('Xóa đề thi này?')) { await api.delete(`/admin/exams/${item.id}`); await refresh(); } }} onEditQuestion={(q) => { setEditingQuestionId(q.id); setQuestion({ examId: item.id, content: q.content, optionA: q.optionA || '', optionB: q.optionB || '', optionC: q.optionC || '', optionD: q.optionD || '', optionE: q.optionE || '', optionF: q.optionF || '', audioUrl: q.audioUrl || '', imageUrl: q.imageUrl || '', imageUrl2: q.imageUrl2 || '', scriptText: q.scriptText || '', correctAnswer: q.correctAnswer || '', explanation: q.explanation || '', questionType: q.questionType || 'MULTIPLE_CHOICE' }); }} onDeleteQuestion={async (q) => { if (confirm('Xóa câu hỏi này?')) { await api.delete(`/admin/questions/${q.id}`); await refresh(); } }} onDeleteQuestions={async (questions) => { if (confirm(`Xóa ${questions.length} câu hỏi đã chọn?`)) { await Promise.all(questions.map((q) => api.delete(`/admin/questions/${q.id}`))); await refresh(); } }} />)}
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-4">
        <CrudPanel title={editingLessonId ? 'Edit lesson' : 'Create lesson'} onSave={saveLesson} editing={editingLessonId} onCancel={() => { setEditingLessonId(null); setLesson(emptyLesson); }}>
          <input className="input" placeholder="Tiêu đề" value={lesson.title} onChange={(e) => setLesson({ ...lesson, title: e.target.value })} />
          <select className="input" value={lesson.type} onChange={(e) => setLesson({ ...lesson, type: e.target.value })}>{types.map((x) => <option key={x}>{x}</option>)}</select>
          <textarea className="input min-h-32 md:col-span-2" placeholder="Content" value={lesson.content} onChange={(e) => setLesson({ ...lesson, content: e.target.value })} />
        </CrudPanel>
        <CrudPanel title={editingNotificationId ? 'Edit notification' : 'Create notification'} onSave={saveNotification} editing={editingNotificationId} onCancel={() => { setEditingNotificationId(null); setNotification(emptyNotification); }}>
          <input className="input md:col-span-2" placeholder="Tiêu đề" value={notification.title} onChange={(e) => setNotification({ ...notification, title: e.target.value })} />
          <textarea className="input min-h-32 md:col-span-2" placeholder="Content" value={notification.content} onChange={(e) => setNotification({ ...notification, content: e.target.value })} />
        </CrudPanel>
      </section>

      <section className="grid lg:grid-cols-2 gap-4">
        <ListPanel title="Lessons" rows={lessons} onEdit={(row) => { setEditingLessonId(row.id); setLesson({ title: row.title, type: row.type || 'READING', content: row.content || '' }); }} onDelete={async (row) => { if (confirm('Xóa bài học này?')) { await api.delete(`/admin/lessons/${row.id}`); await refresh(); } }} />
        <ListPanel
          title="Notifications"
          rows={notifications}
          selectable
          onEdit={(row) => { setEditingNotificationId(row.id); setNotification({ title: row.title, content: row.content || '' }); }}
          onDelete={async (row) => { if (confirm('Xóa thông báo này?')) { await api.delete(`/admin/notifications/${row.id}`); await refresh(); } }}
          onDeleteRows={async (rows) => {
            if (confirm(`Xóa ${rows.length} thông báo đã chọn?`)) {
              await Promise.all(rows.map((row) => api.delete(`/admin/notifications/${row.id}`)));
              await refresh();
            }
          }}
        />
      </section>

      <UserManagement users={users} refresh={refresh} setStatus={setStatus} />
    </div>
  );
}

function Metric({ label, value }) {
  return <div className="panel"><div className="text-sm text-slate-500">{label}</div><div className="text-3xl font-black">{value}</div></div>;
}

function MetricCard({ label, value, tone }) {
  const tones = {
    teal: 'border-teal-200 bg-teal-50 text-teal-800',
    blue: 'border-blue-200 bg-blue-50 text-blue-800',
    amber: 'border-amber-200 bg-amber-50 text-amber-800',
    green: 'border-green-200 bg-green-50 text-green-800',
    red: 'border-red-200 bg-red-50 text-red-800',
    slate: 'border-slate-200 bg-slate-50 text-slate-800'
  };
  return <div className={`rounded-lg border p-4 ${tones[tone] || tones.blue}`}><div className="text-sm font-semibold opacity-80">{label}</div><div className="mt-1 text-3xl font-black">{value}</div></div>;
}

function TemplateGroup({ title, children }) {
  const templates = Children.toArray(children);

  return (
    <section className="rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="font-black">{title}</h2>
      </div>
      <div className="space-y-3 p-4">
        {templates.map((child, index) => (
          <TemplateItem key={child.key || index} title={child.props?.title || `Template ${index + 1}`} status={child.props?.status}>
            {child}
          </TemplateItem>
        ))}
      </div>
    </section>
  );
}

function TemplateItem({ title, children, status }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (status) setOpen(true);
  }, [status]);

  return (
    <section className={`rounded-md border bg-slate-50 ${status?.type === 'error' ? 'border-red-200' : status?.type === 'success' ? 'border-green-200' : 'border-slate-200'}`}>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="min-w-0 font-black text-slate-950">{title}</span>
        <span className="rounded-md border border-slate-200 bg-white p-2 text-slate-600">
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>
      {open && (
        <div className="space-y-3 border-t border-slate-200 p-3">
          {status && <TemplateAlert status={status} />}
          {children}
        </div>
      )}
    </section>
  );
}

function TemplateAlert({ status }) {
  return (
    <div className={`rounded-md border px-4 py-3 text-sm font-semibold ${status.type === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-green-200 bg-green-50 text-green-800'}`}>
      {status.text}
    </div>
  );
}

function QuestionTypeTemplatePicker({ value, onChange, onApply }) {
  return (
    <div className="grid gap-2 md:col-span-2 md:grid-cols-[minmax(0,1fr)_auto]">
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        {questionTypes.map((x) => <option key={x}>{x}</option>)}
      </select>
      <button type="button" className="btn btn-muted" onClick={() => onApply(value)}>
        Apply template
      </button>
    </div>
  );
}

function WritingPart1Template({ title, exams, examId, rows, onExamChange, onRowChange, onReset, onSave }) {
  return (
    <section className="panel space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-black">{title}</h2>
          <p className="text-sm text-slate-500">Tạo nhanh 5 câu Writing Part 1, mỗi câu có câu hỏi và đáp án gợi ý.</p>
        </div>
        <span className="rounded-md bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">5 cau</span>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_1.2fr]">
        <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4">
          <select className="input" value={examId} onChange={(e) => onExamChange(e.target.value)}>
            <option value="">Select writing exam</option>
            {exams.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
          <div className="rounded-md border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-700">
            <div className="font-black text-slate-950">Instruction</div>
            <p>{writingPart1Instruction}</p>
          </div>
          <div className="rounded-md border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-700">
            <div className="font-black text-slate-950">Example</div>
            <pre className="font-sans">{writingPart1Example}</pre>
          </div>
        </div>

        <div className="space-y-3">
          {rows.map((row, index) => (
            <div key={index} className="rounded-md border border-slate-200 bg-white p-3">
              <div className="mb-2 font-black text-slate-950">Câu {index + 1}</div>
              <div className="grid gap-2 md:grid-cols-2">
                <input className="input" placeholder="Nhập câu hỏi" value={row.content} onChange={(e) => onRowChange(index, 'content', e.target.value)} />
                <input className="input" placeholder="Nhập đáp án gợi ý" value={row.answer} onChange={(e) => onRowChange(index, 'answer', e.target.value)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="btn btn-primary" onClick={onSave}><Plus size={16} />Lưu 5 câu Writing</button>
        <button className="btn btn-muted" onClick={onReset}>Đặt lại mẫu</button>
      </div>
    </section>
  );
}

function WritingLongTemplate({ title, exams, examId, data, onExamChange, onChange, onReset, onSave }) {
  return (
    <section className="panel space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-black">{title}</h2>
          <p className="text-sm text-slate-500">Tạo câu Writing dạng textarea, có tiêu đề, yêu cầu, word count và nút xem đáp án.</p>
        </div>
        <span className="rounded-md bg-cyan-50 px-3 py-1 text-sm font-bold text-cyan-700">20-30 words</span>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_1.3fr]">
        <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4">
          <select className="input" value={examId} onChange={(e) => onExamChange(e.target.value)}>
            <option value="">Select writing exam</option>
            {exams.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
          <input className="input" placeholder="Tiêu đề, ví dụ: Câu 2 of 4 - Art club" value={data.title} onChange={(e) => onChange('title', e.target.value)} />
          <textarea className="input min-h-28" placeholder="Instruction" value={data.instruction} onChange={(e) => onChange('instruction', e.target.value)} />
        </div>

        <div className="space-y-3 rounded-md border border-slate-200 bg-white p-4">
          <input className="input" placeholder="Nhập câu hỏi, ví dụ: Tell me a painting or a photo that you like" value={data.content} onChange={(e) => onChange('content', e.target.value)} />
          <textarea className="input min-h-32" placeholder="Nhập đáp án gợi ý" value={data.answer} onChange={(e) => onChange('answer', e.target.value)} />
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            <div className="mb-2 font-black text-slate-950">Xem trước</div>
            <div className="text-2xl font-black text-slate-950">{data.title || defaultWritingLongQuestion.title}</div>
            <p className="mt-3 font-semibold">{data.instruction || defaultWritingLongQuestion.instruction}</p>
            <p className="mt-5">{data.content || 'Tell me a painting or a photo that you like'}</p>
            <div className="mt-2 h-28 rounded-md border border-slate-200 bg-white"></div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="btn btn-primary" onClick={onSave}><Plus size={16} />Save writing question</button>
        <button className="btn btn-muted" onClick={onReset}>Đặt lại mẫu</button>
      </div>
    </section>
  );
}

function WritingChatTemplate({ title, exams, examId, data, onExamChange, onChange, onRowChange, onReset, onSave }) {
  return (
    <section className="panel space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-black">{title}</h2>
          <p className="text-sm text-slate-500">Tạo câu Writing có 3 message, mỗi message có textarea và word count riêng.</p>
        </div>
        <span className="rounded-md bg-cyan-50 px-3 py-1 text-sm font-bold text-cyan-700">3 answers</span>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_1.4fr]">
        <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4">
          <select className="input" value={examId} onChange={(e) => onExamChange(e.target.value)}>
            <option value="">Select writing exam</option>
            {exams.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
          <input className="input" placeholder="Tiêu đề, ví dụ: Câu 3 of 4 - Art club" value={data.title} onChange={(e) => onChange('title', e.target.value)} />
          <textarea className="input min-h-28" placeholder="Instruction" value={data.instruction} onChange={(e) => onChange('instruction', e.target.value)} />
        </div>

        <div className="space-y-3">
          {data.rows.map((row, index) => (
            <div key={index} className="rounded-md border border-slate-200 bg-white p-3">
              <div className="mb-2 font-black text-slate-950">Message {index + 1}</div>
              <textarea className="input min-h-20" placeholder="Nhập message/câu hỏi" value={row.content} onChange={(e) => onRowChange(index, 'content', e.target.value)} />
              <textarea className="input mt-2 min-h-24" placeholder="Nhập đáp án gợi ý" value={row.answer} onChange={(e) => onRowChange(index, 'answer', e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
        <div className="mb-2 font-black text-slate-950">Xem trước</div>
        <div className="text-2xl font-black text-slate-950">{data.title || defaultWritingChatQuestion.title}</div>
        <p className="mt-3 font-semibold">{data.instruction || defaultWritingChatQuestion.instruction}</p>
        <div className="mt-4 space-y-4">
          {data.rows.map((row, index) => (
            <div key={index}>
              <p>{row.content || `Message ${index + 1}`}</p>
              <div className="mt-2 h-20 rounded-md border border-slate-200 bg-white"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="btn btn-primary" onClick={onSave}><Plus size={16} />Save group chat question</button>
        <button className="btn btn-muted" onClick={onReset}>Đặt lại mẫu</button>
      </div>
    </section>
  );
}

function WritingEmailTemplate({ title, exams, examId, data, onExamChange, onChange, onRowChange, onReset, onSave }) {
  return (
    <section className="panel space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-black">{title}</h2>
          <p className="text-sm text-slate-500">Tạo câu Writing Email có 2 bài viết: email ngắn và email dài.</p>
        </div>
        <span className="rounded-md bg-cyan-50 px-3 py-1 text-sm font-bold text-cyan-700">2 emails</span>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_1.4fr]">
        <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4">
          <select className="input" value={examId} onChange={(e) => onExamChange(e.target.value)}>
            <option value="">Select writing exam</option>
            {exams.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
          <label className="space-y-1">
            <span className="text-sm font-black text-slate-700">Tieu de</span>
            <input className="input" placeholder="Câu 4 of 4 - Email Writing" value={data.title} onChange={(e) => onChange('title', e.target.value)} />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-black text-slate-700">Huong dan</span>
            <textarea className="input min-h-24" placeholder="Write a short email..." value={data.instruction} onChange={(e) => onChange('instruction', e.target.value)} />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-black text-slate-700">Viết câu hỏi / đề bài chung</span>
            <textarea className="input min-h-32" placeholder="Nhập nội dung đề bài chung ở đây" value={data.context} onChange={(e) => onChange('context', e.target.value)} />
          </label>
        </div>

        <div className="space-y-3">
          {data.rows.map((row, index) => (
            <div key={index} className="rounded-md border border-slate-200 bg-white p-3">
              <div className="mb-2 font-black text-slate-950">{index === 0 ? 'Short email' : 'Long email'}</div>
              <label className="space-y-1">
                <span className="text-sm font-black text-slate-700">Viết yêu cầu câu hỏi</span>
                <textarea className="input min-h-20" placeholder="Nhập yêu cầu email" value={row.content} onChange={(e) => onRowChange(index, 'content', e.target.value)} />
              </label>
              <label className="mt-2 block space-y-1">
                <span className="text-sm font-black text-slate-700">Đáp án gợi ý</span>
                <textarea className="input min-h-28" placeholder="Nhập đáp án gợi ý" value={row.answer} onChange={(e) => onRowChange(index, 'answer', e.target.value)} />
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
        <div className="mb-2 font-black text-slate-950">Xem trước</div>
        <div className="text-2xl font-black text-slate-950">{data.title || defaultWritingEmailQuestion.title}</div>
        <p className="mt-3 font-semibold">{data.instruction || defaultWritingEmailQuestion.instruction}</p>
        <p className="mt-4 whitespace-pre-wrap leading-7">{data.context || 'Email context...'}</p>
        {data.rows.map((row, index) => (
          <div key={index} className="mt-4">
            <p className="font-black">{row.content}</p>
            <div className="mt-2 h-24 rounded-md border border-slate-200 bg-white"></div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="btn btn-primary" onClick={onSave}><Plus size={16} />Save email question</button>
        <button className="btn btn-muted" onClick={onReset}>Đặt lại mẫu</button>
      </div>
    </section>
  );
}

function GapDropdownTemplate({ title, exams, examId, data, onExamChange, onChange, onRowChange, onOptionChange, onReset, onSave }) {
  const optionKeys = ['A', 'B', 'C', 'D', 'E', 'F'];
  return (
    <section className="panel space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-black">{title}</h2>
          <p className="text-sm text-slate-500">Tạo câu chọn từ điền vào chỗ trống, gồm 5 dòng dropdown như mẫu.</p>
        </div>
        <span className="rounded-md bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">INLINE_DROPDOWN</span>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_1.5fr]">
        <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4">
          <select className="input" value={examId} onChange={(e) => onExamChange(e.target.value)}>
            <option value="">Chọn đề thi</option>
            {exams.map((item) => <option key={item.id} value={item.id}>{item.title} - {item.type}</option>)}
          </select>
          <label className="space-y-1">
            <span className="text-sm font-black text-slate-700">Huong dan</span>
            <textarea className="input min-h-20" value={data.instruction} onChange={(e) => onChange('instruction', e.target.value)} />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-black text-slate-700">Mo dau / loi chao</span>
            <textarea className="input min-h-20" value={data.intro} onChange={(e) => onChange('intro', e.target.value)} />
          </label>
        </div>

        <div className="space-y-3">
          {data.rows.map((row, index) => (
            <div key={index} className="rounded-md border border-slate-200 bg-white p-3">
              <div className="mb-2 font-black text-slate-950">Gap {index + 1}</div>
              <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_120px]">
                <input className="input" placeholder="Text before dropdown" value={row.before} onChange={(e) => onRowChange(index, 'before', e.target.value)} />
                <input className="input" placeholder="Text after dropdown" value={row.after} onChange={(e) => onRowChange(index, 'after', e.target.value)} />
                <select className="input" value={row.answer} onChange={(e) => onRowChange(index, 'answer', e.target.value)}>
                  <option value="">Answer</option>
                  {optionKeys.map((key) => <option key={key} value={key}>{key}</option>)}
                </select>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {(row.options || ['', '', '', '', '', '']).map((option, optionIndex) => (
                  <input
                    key={optionIndex}
                    className="input"
                    placeholder={`Gap ${index + 1} option ${optionKeys[optionIndex]}`}
                    value={option}
                    onChange={(e) => onOptionChange(index, optionIndex, e.target.value)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
        <div className="mb-2 font-black text-slate-950">Xem trước</div>
        <p>{data.instruction}</p>
        <p className="mt-4">{data.intro}</p>
        <div className="mt-4 space-y-3">
          {data.rows.map((row, index) => (
            <div key={index} className="rounded-md border border-slate-200 bg-white p-3">
              <div>{row.before} <span className="inline-block min-w-24 rounded-md border border-slate-300 px-3 py-2 text-center text-slate-400">select</span> {row.after}</div>
              <div className="mt-2 text-xs text-slate-500">
                {(row.options || []).map((option, optionIndex) => option ? `${optionKeys[optionIndex]}. ${option}` : '').filter(Boolean).join(' | ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="btn btn-primary" onClick={onSave}><Plus size={16} />Save gap dropdown question</button>
        <button className="btn btn-muted" onClick={onReset}>Đặt lại mẫu</button>
      </div>
    </section>
  );
}

function GrammarTermMatchTemplate({ title, exams, examId, data, onExamChange, onChange, onRowChange, onOptionChange, onAddOption, onReset, onSave }) {
  const options = data.options.filter(Boolean);
  return (
    <section className="panel space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-black">{title}</h2>
          <p className="text-sm text-slate-500">Tạo câu Grammar dạng ghép thuật ngữ với từ đồng nghĩa bằng dropdown.</p>
        </div>
        <span className="rounded-md bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">GRAMMAR_TERM_MATCH</span>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_1.4fr]">
        <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4">
          <select className="input" value={examId} onChange={(e) => onExamChange(e.target.value)}>
            <option value="">Select grammar exam</option>
            {exams.map((item) => <option key={item.id} value={item.id}>{item.title} - {item.type}</option>)}
          </select>
          <textarea className="input min-h-24" placeholder="Instruction" value={data.instruction} onChange={(e) => onChange('instruction', e.target.value)} />
          <select className="input" value={data.operator || '='} onChange={(e) => onChange('operator', e.target.value)}>
            <option value="=">=</option>
            <option value="+">+</option>
          </select>
          <div className="rounded-md border border-slate-200 bg-white p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="font-black text-slate-950">Options list</span>
              <button type="button" className="btn btn-muted py-1 text-sm" onClick={onAddOption}><Plus size={14} />Add option</button>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {data.options.map((option, index) => (
                <input key={index} className="input" placeholder={`Lựa chọn ${index + 1}`} value={option} onChange={(e) => onOptionChange(index, e.target.value)} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {data.rows.map((row, index) => (
            <div key={index} className="rounded-md border border-slate-200 bg-white p-3">
              <div className="mb-2 font-black text-slate-950">Term {index + 1}</div>
              <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <input className="input" placeholder="Term, ví dụ: revenue" value={row.term} onChange={(e) => onRowChange(index, 'term', e.target.value)} />
                <select className="input" value={row.answer} onChange={(e) => onRowChange(index, 'answer', e.target.value)}>
                  <option value="">Correct synonym</option>
                  {options.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        <div className="mb-4 font-black text-slate-950">Xem trước</div>
        <p className="font-black text-slate-950">{data.instruction || defaultGrammarTermMatchQuestion.instruction}</p>
        <div className="mt-6 max-w-xl space-y-3">
          {data.rows.map((row, index) => (
            <div key={index} className="grid grid-cols-[minmax(0,140px)_20px_minmax(0,1fr)] items-center gap-3">
              <span className="font-black text-slate-950">{row.term || `term ${index + 1}`}</span>
              <span className="font-black">{data.operator || '='}</span>
              <span className="rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-400">Chọn đáp án</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="btn btn-primary" onClick={onSave}><Plus size={16} />Save grammar matching question</button>
        <button className="btn btn-muted" onClick={onReset}>Đặt lại mẫu</button>
      </div>
    </section>
  );
}

function GrammarSentenceDropdownTemplate({ title, exams, examId, data, onExamChange, onChange, onRowChange, onOptionChange, onAddOption, onReset, onSave }) {
  const options = data.options.filter(Boolean);
  return (
    <section className="panel space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-black">{title}</h2>
          <p className="text-sm text-slate-500">Tạo câu Grammar dạng câu định nghĩa có dropdown chọn từ.</p>
        </div>
        <span className="rounded-md bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">GRAMMAR_SENTENCE_DROPDOWN</span>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_1.5fr]">
        <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4">
          <select className="input" value={examId} onChange={(e) => onExamChange(e.target.value)}>
            <option value="">Select grammar exam</option>
            {exams.map((item) => <option key={item.id} value={item.id}>{item.title} - {item.type}</option>)}
          </select>
          <textarea className="input min-h-20" placeholder="Instruction, ví dụ: Choose the correct word." value={data.instruction} onChange={(e) => onChange('instruction', e.target.value)} />
          <div className="rounded-md border border-slate-200 bg-white p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="font-black text-slate-950">Dropdown options</span>
              <button type="button" className="btn btn-muted py-1 text-sm" onClick={onAddOption}><Plus size={14} />Add option</button>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {data.options.map((option, index) => (
                <input key={index} className="input" placeholder={`Lựa chọn ${index + 1}`} value={option} onChange={(e) => onOptionChange(index, e.target.value)} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {data.rows.map((row, index) => (
            <div key={index} className="rounded-md border border-slate-200 bg-white p-3">
              <div className="mb-2 font-black text-slate-950">Sentence {index + 1}</div>
              <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_180px]">
                <input className="input" placeholder="Text before dropdown" value={row.before} onChange={(e) => onRowChange(index, 'before', e.target.value)} />
                <input className="input" placeholder="Text after dropdown" value={row.after} onChange={(e) => onRowChange(index, 'after', e.target.value)} />
                <select className="input" value={row.answer} onChange={(e) => onRowChange(index, 'answer', e.target.value)}>
                  <option value="">Correct answer</option>
                  {options.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        <div className="mb-4 font-black text-slate-950">Xem trước</div>
        {data.instruction && <p className="mb-4 font-black text-slate-950">{data.instruction}</p>}
        <div className="space-y-5">
          {data.rows.map((row, index) => (
            <div key={index} className="flex flex-wrap items-center gap-3 text-base text-slate-950">
              <span>{row.before || `Sentence ${index + 1}`}</span>
              <span className="rounded-md border border-slate-200 bg-white px-4 py-2 text-slate-500">Chọn</span>
              {row.after && <span>{row.after}</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="btn btn-primary" onClick={onSave}><Plus size={16} />Save sentence dropdown question</button>
        <button className="btn btn-muted" onClick={onReset}>Đặt lại mẫu</button>
      </div>
    </section>
  );
}

function ParagraphOrderTopicTemplate({ title, exams, examId, data, onExamChange, onChange, onRowChange, onReset, onSave }) {
  const optionKeys = ['A', 'B', 'C', 'D', 'E'];
  const answerOrder = data.answer ? data.answer.split(',').map((item) => item.trim()) : ['', '', '', '', ''];
  const correctRows = answerOrder.map((key) => data.rows[optionKeys.indexOf(key)] || '').filter(Boolean);
  function setAnswerPosition(index, value) {
    const next = [...answerOrder];
    next[index] = value;
    onChange('answer', next.join(','));
  }
  return (
    <section className="panel space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-black">{title}</h2>
          <p className="text-sm text-slate-500">Tạo Reading Part 2: nhập 5 câu bị xáo trộn và chọn thứ tự đúng để học viên sắp xếp.</p>
        </div>
        <span className="rounded-md bg-red-50 px-3 py-1 text-sm font-bold text-red-700">PARAGRAPH_ORDER</span>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_1.45fr]">
        <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4">
          <select className="input" value={examId} onChange={(e) => onExamChange(e.target.value)}>
            <option value="">Chọn đề thi</option>
            {exams.map((item) => <option key={item.id} value={item.id}>{item.title} - {item.type}</option>)}
          </select>
          <label className="space-y-1">
            <span className="text-sm font-black text-slate-700">Tieu de / chu de hien thi</span>
            <input className="input" placeholder="Vi du: Homework for Next Week (Version 2)" value={data.topic} onChange={(e) => onChange('topic', e.target.value)} />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-black text-slate-700">Huong dan</span>
            <textarea className="input min-h-24" placeholder="Instruction" value={data.instruction} onChange={(e) => onChange('instruction', e.target.value)} />
          </label>
          <div className="rounded-md border border-slate-200 bg-white p-3">
            <div className="mb-2 font-black text-slate-950">Thứ tự đúng</div>
            <div className="grid gap-2 sm:grid-cols-5">
              {answerOrder.map((key, index) => (
                <label key={index} className="space-y-1">
                  <span className="text-xs font-black text-slate-600">Vi tri {index + 1}</span>
                  <select className="input" value={key} onChange={(e) => setAnswerPosition(index, e.target.value)}>
                    <option value="">--</option>
                    {optionKeys.map((optionKey) => <option key={optionKey} value={optionKey}>{optionKey}</option>)}
                  </select>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {data.rows.map((row, index) => (
            <div key={index} className="rounded-md border border-slate-200 bg-white p-3">
              <div className="mb-2 flex items-center gap-2 font-black text-slate-950">
                <span className="grid h-7 w-7 place-items-center rounded-md bg-blue-50 text-blue-700">{optionKeys[index]}</span>
                Sentence {optionKeys[index]}
              </div>
              <textarea className="input min-h-20" placeholder={`Nhập câu ${optionKeys[index]}`} value={row} onChange={(e) => onRowChange(index, e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        <div className="mb-3 font-black text-slate-950">Xem trước Reading Part 2</div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-md border border-slate-200 bg-white p-4">
            <h3 className="mb-4 text-xl font-black text-slate-950">{data.topic || 'Reading Part 2 title'}</h3>
            <div className="space-y-3">
              {data.rows.map((row, index) => (
                <div key={index} className="flex items-start gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 text-slate-950">
                  <span className="mt-1 text-slate-400">⠿</span>
                  <span>{row || `Sentence ${optionKeys[index]}`}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-md border border-slate-200 bg-white p-4">
            <h3 className="mb-4 text-xl font-black text-slate-950">Thứ tự đúng</h3>
            <div className="space-y-3">
              {(correctRows.length ? correctRows : Array.from({ length: 5 }, (_, index) => `Correct sentence ${index + 1}`)).map((row, index) => (
                <div key={index} className="flex items-start gap-3 rounded-md border border-green-500 bg-green-50 px-4 py-3 text-slate-950">
                  <span className="mt-1 text-slate-400">⠿</span>
                  <span className="min-w-0 flex-1">{row}</span>
                  <CheckCircle2 size={18} className="mt-1 shrink-0 text-green-600" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="btn btn-primary" onClick={onSave}><Plus size={16} />Save paragraph order question</button>
        <button className="btn btn-muted" onClick={onReset}>Đặt lại mẫu</button>
      </div>
    </section>
  );
}

function PassageMatchTemplate({ title, exams, examId, data, onExamChange, onChange, onPassageChange, onQuestionChange, onAnswerChange, onReset, onSave }) {
  const answerKeys = ['A', 'B', 'C', 'D'];
  return (
    <section className="panel space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-black">{title}</h2>
          <p className="text-sm text-slate-500">Tạo Reading forum: 4 đoạn A-D và các câu hỏi chọn người phù hợp.</p>
        </div>
        <span className="rounded-md bg-red-50 px-3 py-1 text-sm font-bold text-red-700">PASSAGE_MATCH</span>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_1.4fr]">
        <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4">
          <select className="input" value={examId} onChange={(e) => onExamChange(e.target.value)}>
            <option value="">Chọn đề thi</option>
            {exams.map((item) => <option key={item.id} value={item.id}>{item.title} - {item.type}</option>)}
          </select>
          <input className="input" placeholder="Topic, ví dụ: Games from childhood" value={data.topic} onChange={(e) => onChange('topic', e.target.value)} />
          {data.passages.map((passage, index) => (
            <label key={passage.key} className="block space-y-1">
              <span className="text-sm font-black text-slate-700">Passage {passage.key}</span>
              <textarea className="input min-h-28" placeholder={`Nhập nội dung passage ${passage.key}`} value={passage.text} onChange={(e) => onPassageChange(index, e.target.value)} />
            </label>
          ))}
        </div>

        <div className="space-y-3">
          {data.questions.map((question, index) => (
            <div key={index} className="rounded-md border border-slate-200 bg-white p-3">
              <div className="mb-2 font-black text-slate-950">Câu {index + 1}</div>
              <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_120px]">
                <input className="input" placeholder="Nhập câu hỏi" value={question} onChange={(e) => onQuestionChange(index, e.target.value)} />
                <select className="input" value={data.answers[index] || ''} onChange={(e) => onAnswerChange(index, e.target.value)}>
                  <option value="">Answer</option>
                  {answerKeys.map((key) => <option key={key} value={key}>{key}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
        <div className="mb-2 font-black text-slate-950">Xem trước</div>
        <h3 className="text-2xl font-black text-red-600">Topic: {data.topic || '...'}</h3>
        <div className="mt-4 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
          <div className="space-y-3">
            <p className="font-bold text-slate-950">Here is the perspective of four people on the above topic. Please read the content and answer the question.</p>
            {data.passages.map((passage) => (
              <p key={passage.key}><b>{passage.key}:</b> {passage.text || `Passage ${passage.key}`}</p>
            ))}
          </div>
          <div className="space-y-3">
            <p className="font-bold text-slate-950">Đọc bốn ý kiến trong diễn đàn, rồi trả lời câu hỏi.</p>
            {data.questions.map((question, index) => (
              <div key={index} className="grid gap-2 md:grid-cols-[minmax(0,1fr)_90px]">
                <span>{question || `Câu ${index + 1}`}</span>
                <span className="rounded-md border border-slate-200 bg-white px-3 py-2 text-center text-slate-400">select</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="btn btn-primary" onClick={onSave}><Plus size={16} />Save passage match question</button>
        <button className="btn btn-muted" onClick={onReset}>Đặt lại mẫu</button>
      </div>
    </section>
  );
}

function ReadingDropdownParagraphsTemplate({ title, exams, examId, data, onExamChange, onChange, onArrayChange, onReset, onSave }) {
  return (
    <section className="panel space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-black">{title}</h2>
          <p className="text-sm text-slate-500">Tạo Reading question có topic, 7 đoạn văn và dropdown phía trên mỗi đoạn.</p>
        </div>
        <span className="rounded-md bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">MATCHING_DROPDOWN</span>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_1.5fr]">
        <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4">
          <select className="input" value={examId} onChange={(e) => onExamChange(e.target.value)}>
            <option value="">Chọn đề thi</option>
            {exams.map((item) => <option key={item.id} value={item.id}>{item.title} - {item.type}</option>)}
          </select>
          <input className="input" placeholder="Tiêu đề, ví dụ: Reading question 5 (1/11)" value={data.title} onChange={(e) => onChange('title', e.target.value)} />
          <input className="input" placeholder="Topic, ví dụ: Mountain (Mountain summits)" value={data.topic} onChange={(e) => onChange('topic', e.target.value)} />
          <textarea className="input min-h-20" placeholder="Instruction / noi dung an hien khi bam Xem noi dung" value={data.instruction} onChange={(e) => onChange('instruction', e.target.value)} />
          <textarea className="input min-h-20" placeholder="Meo / explanation" value={data.tip} onChange={(e) => onChange('tip', e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            {data.options.map((option, index) => (
              <input key={index} className="input" placeholder={`Dropdown option ${index + 1}`} value={option} onChange={(e) => onArrayChange('options', index, e.target.value)} />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {data.rows.map((row, index) => (
            <div key={index} className="rounded-md border border-slate-200 bg-white p-3">
              <div className="mb-2 font-black text-slate-950">Paragraph {index + 1}</div>
              <textarea className="input min-h-24" placeholder="Nhập đoạn văn" value={row} onChange={(e) => onArrayChange('rows', index, e.target.value)} />
              <input className="input mt-2" placeholder="Đáp án đúng cho đoạn này" value={data.answers[index] || ''} onChange={(e) => onArrayChange('answers', index, e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
        <div className="mb-2 font-black text-slate-950">Xem trước</div>
        <h3 className="text-3xl font-black text-slate-950">{data.title || 'Reading question 5 (1/11)'}</h3>
        <p className="mt-3 text-2xl font-black text-red-600">TOPIC: {data.topic || '...'}</p>
        <div className="mt-4 space-y-3">
          {data.rows.map((row, index) => (
            <div key={index}>
              <div className="mb-2 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2">
                <span>{index + 1}.</span>
                <span className="rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-400">dropdown</span>
              </div>
              <p>{row || `Paragraph ${index + 1}`}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="btn btn-primary" onClick={onSave}><Plus size={16} />Save reading dropdown question</button>
        <button className="btn btn-muted" onClick={onReset}>Đặt lại mẫu</button>
      </div>
    </section>
  );
}

function ListeningMatchingTemplate({ title, exams, examId, data, onExamChange, onChange, onArrayChange, onAudioUpload, onReset, onSave }) {
  const answerKeys = ['A', 'B', 'C', 'D', 'E', 'F'];
  const audioUrls = data.audioUrls || ['', '', '', ''];
  return (
    <section className="panel space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-black">{title}</h2>
          <p className="text-sm text-slate-500">Tạo Listening có audio, topic và dropdown Person 1-4.</p>
        </div>
        <span className="rounded-md bg-red-50 px-3 py-1 text-sm font-bold text-red-700">LISTENING</span>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_1.4fr]">
        <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4">
          <select className="input" value={examId} onChange={(e) => onExamChange(e.target.value)}>
            <option value="">Select listening exam</option>
            {exams.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
          <input className="input" placeholder="Topic, ví dụ: Protect the environment" value={data.topic} onChange={(e) => onChange('topic', e.target.value)} />
          <textarea className="input min-h-24" placeholder="Instruction" value={data.instruction} onChange={(e) => onChange('instruction', e.target.value)} />
          <textarea className="input min-h-32" placeholder="Đoạn văn / transcript ẩn hiện khi bấm Show paragraph" value={data.transcript} onChange={(e) => onChange('transcript', e.target.value)} />
          <div className="space-y-2 rounded-md border border-slate-200 bg-white p-3">
            <div className="font-black text-slate-950">Audio cho từng Person</div>
            {audioUrls.map((url, index) => (
              <div key={index} className="grid gap-2 md:grid-cols-[1fr_auto]">
                <input className="input" placeholder={`Person ${index + 1} audio URL`} value={url} onChange={(e) => onArrayChange('audioUrls', index, e.target.value)} />
                <label className="btn btn-muted cursor-pointer justify-center">
                  Upload
                  <input className="hidden" type="file" accept="audio/*" onChange={(e) => onAudioUpload?.(e.target.files?.[0], index)} />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-md border border-slate-200 bg-white p-3">
            <div className="mb-2 font-black text-slate-950">Answer options</div>
            <div className="grid gap-2 md:grid-cols-2">
              {data.options.map((option, index) => (
                <input key={index} className="input" placeholder={`Lựa chọn ${answerKeys[index]}`} value={option} onChange={(e) => onArrayChange('options', index, e.target.value)} />
              ))}
            </div>
          </div>
          <div className="rounded-md border border-slate-200 bg-white p-3">
            <div className="mb-2 font-black text-slate-950">Correct answers</div>
            <div className="grid gap-2 md:grid-cols-2">
              {data.answers.map((answer, index) => (
                <label key={index} className="grid gap-1">
                  <span className="text-sm font-black text-slate-700">Person {index + 1}</span>
                  <select className="input" value={answer} onChange={(e) => onArrayChange('answers', index, e.target.value)}>
                    <option value="">Answer</option>
                    {answerKeys.map((key) => <option key={key} value={key}>{key}</option>)}
                  </select>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
        <div className="mb-2 font-black text-slate-950">Xem trước</div>
        <div className="space-y-2">
          {audioUrls.map((url, index) => (
            <div key={index} className="rounded-md bg-red-600 px-4 py-3 text-white">Person {index + 1}: {url ? 'Audio ready' : 'Chưa có audio'}</div>
          ))}
        </div>
        <div className="mt-4 rounded-md bg-slate-100 p-4">
          <h3 className="font-black text-slate-950">Topic: {data.topic || '...'}</h3>
          <p className="mt-4">{data.instruction}</p>
          <div className="mt-4 space-y-2">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="grid gap-2 md:grid-cols-[90px_minmax(0,1fr)]">
                <span>Person {index + 1}</span>
                <span className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-400">-- Chọn đáp án --</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="btn btn-primary" onClick={onSave}><Plus size={16} />Save listening matching question</button>
        <button className="btn btn-muted" onClick={onReset}>Đặt lại mẫu</button>
      </div>
    </section>
  );
}

function ListeningOpinionTemplate({ title, exams, examId, data, onExamChange, onChange, onArrayChange, onReset, onSave }) {
  const answerOptions = ['MAN', 'WOMAN', 'BOTH'];
  return (
    <section className="panel space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-black">{title}</h2>
          <p className="text-sm text-slate-500">Tạo Listening chọn ý kiến của Man, Woman hoặc Both cho 4 statements.</p>
        </div>
        <span className="rounded-md bg-red-50 px-3 py-1 text-sm font-bold text-red-700">OPINION_MATCH</span>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_1.4fr]">
        <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4">
          <select className="input" value={examId} onChange={(e) => onExamChange(e.target.value)}>
            <option value="">Select listening exam</option>
            {exams.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
          <input className="input" placeholder="URL audio" value={data.audioUrl} onChange={(e) => onChange('audioUrl', e.target.value)} />
          <input className="input" placeholder="Topic, ví dụ: Changes in the workplace" value={data.topic} onChange={(e) => onChange('topic', e.target.value)} />
          <textarea className="input min-h-24" placeholder="Instruction" value={data.instruction} onChange={(e) => onChange('instruction', e.target.value)} />
          <textarea className="input min-h-32" placeholder="Đoạn văn / transcript ẩn hiện khi bấm Show paragraph" value={data.transcript} onChange={(e) => onChange('transcript', e.target.value)} />
        </div>

        <div className="space-y-3">
          {data.statements.map((statement, index) => (
            <div key={index} className="rounded-md border border-slate-200 bg-white p-3">
              <div className="mb-2 font-black text-slate-950">Statement {index + 1}</div>
              <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_160px]">
                <input className="input" placeholder="Nhập statement" value={statement} onChange={(e) => onArrayChange('statements', index, e.target.value)} />
                <select className="input" value={data.answers[index] || ''} onChange={(e) => onArrayChange('answers', index, e.target.value)}>
                  <option value="">Answer</option>
                  {answerOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
        <div className="mb-2 font-black text-slate-950">Xem trước</div>
        <div className="rounded-md bg-red-600 px-4 py-3 text-white">Trình phát audio</div>
        <div className="mt-4 rounded-md bg-slate-100 p-4">
          <h3 className="font-black text-slate-950">Topic: {data.topic || '...'}</h3>
          <p className="mt-4">{data.instruction}</p>
          <div className="mt-4 space-y-3">
            {data.statements.map((statement, index) => (
              <div key={index} className="grid gap-2 md:grid-cols-[minmax(0,1fr)_180px]">
                <span>{index + 1}. {statement || `Statement ${index + 1}`}</span>
                <span className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-400">-- Chọn đáp án --</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="btn btn-primary" onClick={onSave}><Plus size={16} />Save listening opinion question</button>
        <button className="btn btn-muted" onClick={onReset}>Đặt lại mẫu</button>
      </div>
    </section>
  );
}

function ListeningGroupMcTemplate({ title, exams, examId, data, onExamChange, onChange, onQuestionChange, onOptionChange, onReset, onSave }) {
  const optionKeys = ['A', 'B', 'C'];
  return (
    <section className="panel space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-black">{title}</h2>
          <p className="text-sm text-slate-500">Tạo Listening có audio và 2 câu trắc nghiệm, mỗi câu 3 lựa chọn.</p>
        </div>
        <span className="rounded-md bg-red-50 px-3 py-1 text-sm font-bold text-red-700">MULTIPLE_CHOICE</span>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_1.4fr]">
        <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4">
          <select className="input" value={examId} onChange={(e) => onExamChange(e.target.value)}>
            <option value="">Select listening exam</option>
            {exams.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
          <input className="input" placeholder="URL audio" value={data.audioUrl} onChange={(e) => onChange('audioUrl', e.target.value)} />
          <input className="input" placeholder="Chủ đề, ví dụ: A break from studying" value={data.topic} onChange={(e) => onChange('topic', e.target.value)} />
          <textarea className="input min-h-32" placeholder="Đoạn văn / transcript ẩn hiện khi bấm Show paragraph" value={data.transcript} onChange={(e) => onChange('transcript', e.target.value)} />
        </div>

        <div className="space-y-3">
          {data.questions.map((question, questionIndex) => (
            <div key={questionIndex} className="rounded-md border border-slate-200 bg-white p-3">
              <div className="mb-2 font-black text-slate-950">Câu {questionIndex + 1}</div>
              <input className="input" placeholder="Nhập câu hỏi" value={question.content} onChange={(e) => onQuestionChange(questionIndex, 'content', e.target.value)} />
              <div className="mt-2 grid gap-2">
                {question.options.map((option, optionIndex) => (
                  <input key={optionIndex} className="input" placeholder={`Lựa chọn ${optionKeys[optionIndex]}`} value={option} onChange={(e) => onOptionChange(questionIndex, optionIndex, e.target.value)} />
                ))}
              </div>
              <select className="input mt-2" value={question.answer} onChange={(e) => onQuestionChange(questionIndex, 'answer', e.target.value)}>
                <option value="">Correct answer</option>
                {optionKeys.map((key) => <option key={key} value={key}>{key}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
        <div className="mb-2 font-black text-slate-950">Xem trước</div>
        <div className="rounded-md bg-red-600 px-4 py-3 text-white">Trình phát audio</div>
        <div className="mt-4 rounded-md bg-slate-100 p-4">
          <h3 className="font-black text-slate-950">Topic: {data.topic || '...'}</h3>
          <div className="mt-4 space-y-5">
            {data.questions.map((question, questionIndex) => (
              <div key={questionIndex}>
                <div className="mb-2">{questionIndex + 1}. {question.content || `Câu ${questionIndex + 1}`}</div>
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex}>○ {option || `Lựa chọn ${optionKeys[optionIndex]}`}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="btn btn-primary" onClick={onSave}><Plus size={16} />Lưu câu hỏi Listening trắc nghiệm nhóm</button>
        <button className="btn btn-muted" onClick={onReset}>Đặt lại mẫu</button>
      </div>
    </section>
  );
}

function ListeningSingleMcTemplate({ title, exams, examId, data, onExamChange, onChange, onOptionChange, onReset, onSave }) {
  const optionKeys = ['A', 'B', 'C'];
  return (
    <section className="panel space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-black">{title}</h2>
          <p className="text-sm text-slate-500">Tạo Listening có audio và 1 câu trắc nghiệm, 3 lựa chọn.</p>
        </div>
        <span className="rounded-md bg-red-50 px-3 py-1 text-sm font-bold text-red-700">MULTIPLE_CHOICE</span>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_1.4fr]">
        <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4">
          <select className="input" value={examId} onChange={(e) => onExamChange(e.target.value)}>
            <option value="">Select listening exam</option>
            {exams.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
          <input className="input" placeholder="URL audio" value={data.audioUrl} onChange={(e) => onChange('audioUrl', e.target.value)} />
          <textarea className="input min-h-32" placeholder="Đoạn văn / transcript ẩn hiện khi bấm Show paragraph" value={data.transcript} onChange={(e) => onChange('transcript', e.target.value)} />
        </div>

        <div className="space-y-3 rounded-md border border-slate-200 bg-white p-3">
          <input className="input" placeholder="Nhập câu hỏi" value={data.content} onChange={(e) => onChange('content', e.target.value)} />
          {data.options.map((option, index) => (
            <input key={index} className="input" placeholder={`Lựa chọn ${optionKeys[index]}`} value={option} onChange={(e) => onOptionChange(index, e.target.value)} />
          ))}
          <select className="input" value={data.answer} onChange={(e) => onChange('answer', e.target.value)}>
            <option value="">Correct answer</option>
            {optionKeys.map((key) => <option key={key} value={key}>{key}</option>)}
          </select>
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
        <div className="mb-2 font-black text-slate-950">Xem trước</div>
        <div className="rounded-md bg-red-600 px-4 py-3 text-white">Trình phát audio</div>
        <div className="mt-4 rounded-md bg-slate-100 p-4">
          <div className="mb-4 font-black text-slate-950">{data.content || 'Nội dung câu hỏi'}</div>
          <div className="space-y-2">
            {data.options.map((option, index) => <div key={index}>○ {option || `Lựa chọn ${optionKeys[index]}`}</div>)}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="btn btn-primary" onClick={onSave}><Plus size={16} />Lưu câu hỏi Listening trắc nghiệm đơn</button>
        <button className="btn btn-muted" onClick={onReset}>Đặt lại mẫu</button>
      </div>
    </section>
  );
}

function SpeakingQ1ListTemplate({ title, exams, examId, rows, onExamChange, onRowChange, onReset, onSave }) {
  return (
    <section className="panel space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-black">{title}</h2>
          <p className="text-sm text-slate-500">Tạo bảng Speaking Câu 1 gồm câu hỏi, đáp án 1 và đáp án 2.</p>
        </div>
        <span className="rounded-md bg-cyan-50 px-3 py-1 text-sm font-bold text-cyan-700">SPEAKING_PROMPT</span>
      </div>

      <select className="input" value={examId} onChange={(e) => onExamChange(e.target.value)}>
        <option value="">Chọn đề Speaking</option>
        {exams.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
      </select>

      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={index} className="rounded-md border border-slate-200 bg-white p-3">
            <div className="mb-2 font-black text-slate-950">Câu {index + 1}</div>
            <div className="grid gap-2 md:grid-cols-[1.3fr_1fr_1fr]">
              <input className="input" placeholder="Tên câu hỏi" value={row.content} onChange={(e) => onRowChange(index, 'content', e.target.value)} />
              <textarea className="input min-h-20" placeholder="Đáp án 1" value={row.answer1} onChange={(e) => onRowChange(index, 'answer1', e.target.value)} />
              <textarea className="input min-h-20" placeholder="Đáp án 2" value={row.answer2} onChange={(e) => onRowChange(index, 'answer2', e.target.value)} />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
        <div className="mb-2 font-black text-slate-950">Xem trước</div>
        <h3 className="text-2xl font-black text-slate-950">Speaking Câu 1 list</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-2 py-2">STT</th>
                <th className="px-2 py-2">Tên câu hỏi</th>
                <th className="px-2 py-2">Đáp án 1</th>
                <th className="px-2 py-2">Đáp án 2</th>
              </tr>
            </thead>
            <tbody>
              {rows.filter((row) => row.content).slice(0, 3).map((row, index) => (
                <tr key={index} className="bg-slate-100">
                  <td className="px-2 py-2 font-black">{index + 1}</td>
                  <td className="px-2 py-2">{row.content}</td>
                  <td className="px-2 py-2"><span className="rounded-md bg-cyan-500 px-3 py-2 text-slate-950">Xem đáp án</span></td>
                  <td className="px-2 py-2"><span className="rounded-md bg-cyan-500 px-3 py-2 text-slate-950">Xem đáp án</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="btn btn-primary" onClick={onSave}><Plus size={16} />Lưu danh sách Speaking Q1</button>
        <button className="btn btn-muted" onClick={onReset}>Đặt lại mẫu</button>
      </div>
    </section>
  );
}

function SpeakingImageListTemplate({ title, exams, examId, data, onExamChange, onChange, onRowChange, onReset, onSave }) {
  return (
    <section className="panel space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-black">{title}</h2>
          <p className="text-sm text-slate-500">Tạo câu Speaking có tiêu đề, ảnh và bảng 3 câu hỏi với nút xem đáp án.</p>
        </div>
        <span className="rounded-md bg-cyan-50 px-3 py-1 text-sm font-bold text-cyan-700">SPEAKING_IMAGE</span>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <select className="input" value={examId} onChange={(e) => onExamChange(e.target.value)}>
          <option value="">Chọn đề Speaking</option>
          {exams.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
        </select>
        <input className="input" placeholder="Tiêu đề" value={data.title} onChange={(e) => onChange('title', e.target.value)} />
        <input className="input" placeholder="URL ảnh 1" value={data.imageUrl} onChange={(e) => onChange('imageUrl', e.target.value)} />
        <input className="input" placeholder="URL ảnh 2 (tùy chọn)" value={data.imageUrl2 || ''} onChange={(e) => onChange('imageUrl2', e.target.value)} />
      </div>

      <div className="space-y-3">
        {data.rows.map((row, index) => (
          <div key={index} className="rounded-md border border-slate-200 bg-white p-3">
            <div className="mb-2 font-black text-slate-950">Câu {index + 1}</div>
            <div className="grid gap-2 md:grid-cols-[1fr_1fr]">
              <input className="input" placeholder="Nhập câu hỏi" value={row.content} onChange={(e) => onRowChange(index, 'content', e.target.value)} />
              <textarea className="input min-h-20" placeholder="Nhập đáp án" value={row.answer} onChange={(e) => onRowChange(index, 'answer', e.target.value)} />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
        <div className="mb-2 font-black text-slate-950">Xem trước</div>
        <h3 className="text-2xl font-black text-slate-950">{data.title}</h3>
        <div className={`mt-3 grid gap-6 ${data.imageUrl2 ? 'md:grid-cols-2' : 'place-items-center'}`}>
          <div className="grid h-36 w-64 place-items-center rounded-md border border-slate-200 bg-white text-slate-400">Ảnh</div>
          {data.imageUrl2 && <div className="grid h-36 w-64 place-items-center rounded-md border border-slate-200 bg-white text-slate-400">Ảnh 2</div>}
        </div>
        <table className="mt-4 w-full text-left">
          <thead><tr><th className="border px-2 py-2">Câu hỏi</th><th className="border px-2 py-2">Đáp án</th></tr></thead>
          <tbody>{data.rows.map((row, index) => <tr key={index}><td className="border px-2 py-2">{row.content || `Câu ${index + 1}`}</td><td className="border px-2 py-2">Xem đáp án</td></tr>)}</tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="btn btn-primary" onClick={onSave}><Plus size={16} />Lưu câu Speaking có ảnh</button>
        <button className="btn btn-muted" onClick={onReset}>Đặt lại mẫu</button>
      </div>
    </section>
  );
}

function SpeakingPart4CardTemplate({ title, status, exams, examId, data, onExamChange, onChange, onRowChange, onReset, onSave }) {
  return (
    <section className="panel space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-black">{title}</h2>
          <p className="text-sm text-slate-500">Tạo 1 giao diện Speaking Part 4 gồm 3 câu hỏi, trả lời trong 120 giây.</p>
        </div>
        <span className="rounded-md bg-purple-50 px-3 py-1 text-sm font-bold text-purple-700">SPEAKING_PART4_CARD</span>
      </div>

      {status && (
        <div className={`rounded-md px-3 py-2 text-sm font-semibold ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {status.text}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-[1fr_2fr]">
        <select className="input" value={examId} onChange={(e) => onExamChange(e.target.value)}>
          <option value="">Chọn đề Speaking</option>
          {exams.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
        </select>
        <input className="input" placeholder="Tiêu đề card" value={data.title} onChange={(e) => onChange('title', e.target.value)} />
      </div>

      <div className="space-y-3">
        {data.rows.map((row, index) => (
          <div key={index} className="rounded-md border border-slate-200 bg-white p-3">
            <div className="mb-2 font-black text-slate-950">Câu {index + 1}</div>
            <div className="grid gap-2 md:grid-cols-[1fr_1fr]">
              <input className="input" placeholder={`Câu hỏi ${index + 1}`} value={row.content} onChange={(e) => onRowChange(index, 'content', e.target.value)} />
              <textarea className="input min-h-20" placeholder="Câu trả lời mẫu" value={row.answer} onChange={(e) => onRowChange(index, 'answer', e.target.value)} />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-purple-200 bg-purple-50 p-4">
        <div className="rounded-md border border-purple-300 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div className="flex min-w-0 items-center gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-purple-200 bg-purple-100 text-lg font-black text-purple-700 shadow-md">1</span>
              <div className="min-w-0">
                <h3 className="text-lg font-black text-slate-950">{data.title || data.rows[0]?.content || 'Speaking Part 4'}</h3>
                <p className="mt-1 text-sm text-slate-500">Trả lời cả 3 câu hỏi trong 120 giây</p>
              </div>
            </div>
            <button type="button" className="rounded-md bg-purple-600 px-5 py-3 font-bold text-white"><Mic size={16} className="inline" /> Ghi âm (120s)</button>
          </div>
          <div className="space-y-4 p-5">
            {data.rows.map((row, index) => (
              <div key={index} className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-purple-100 font-black text-purple-700">{index + 1}</span>
                <div className="font-bold text-slate-950">{row.content || `Question ${index + 1}`}</div>
              </div>
            ))}
          </div>
          <div className="border-t border-purple-100 bg-purple-50 p-5">
            <div className="rounded-md border border-purple-300 bg-white px-4 py-3 font-bold text-slate-950"><Volume2 size={16} className="mr-2 inline text-purple-600" />Câu trả lời mẫu</div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="btn btn-primary" onClick={onSave}><Plus size={16} />Lưu Speaking Part 4 card</button>
        <button className="btn btn-muted" onClick={onReset}>Đặt lại mẫu</button>
      </div>
    </section>
  );
}

function CrudPanel({ title, children, onSave, editing, onCancel }) {
  return <div className="panel space-y-3"><h2 className="font-black">{title}</h2><div className="grid md:grid-cols-2 gap-2">{children}</div><div className="flex gap-2"><button className="btn btn-primary" onClick={onSave}><Save size={16} />Lưu</button>{editing && <button className="btn btn-muted" onClick={onCancel}>Hủy</button>}</div></div>;
}

function ListPanel({ title, rows, onEdit, onDelete, selectable = false, onDeleteRows }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const selectedRows = rows.filter((row) => selectedIds.includes(row.id));
  const allSelected = rows.length > 0 && selectedIds.length === rows.length;

  function toggleRow(id) {
    setSelectedIds((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
  }

  async function deleteSelected() {
    if (selectedRows.length === 0 || !onDeleteRows) return;
    await onDeleteRows(selectedRows);
    setSelectedIds([]);
  }

  return (
    <div className="panel">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-black">{title}</h2>
        {selectable && rows.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <input type="checkbox" checked={allSelected} onChange={(e) => setSelectedIds(e.target.checked ? rows.map((row) => row.id) : [])} />
              Chọn tất cả
            </label>
            <button className="btn btn-muted text-red-700" disabled={selectedRows.length === 0} onClick={deleteSelected}>
              <Trash2 size={15} />Xóa đã chọn ({selectedRows.length})
            </button>
          </div>
        )}
      </div>
      {rows.map((row) => (
        <div key={row.id} className="flex items-start justify-between gap-2 border-b py-2">
          <label className="flex min-w-0 flex-1 items-start gap-3">
            {selectable && <input className="mt-1" type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => toggleRow(row.id)} />}
            <span className="min-w-0">
              <b>{row.title}</b>
              <p className="text-sm text-slate-500 line-clamp-2">{row.type ? `${row.type} - ` : ''}{row.content}</p>
            </span>
          </label>
          <Actions onEdit={() => onEdit(row)} onDelete={() => onDelete(row)} />
        </div>
      ))}
    </div>
  );
}

function ExamCard({ exam, onEdit, onDelete, onEditQuestion, onDeleteQuestion, onDeleteQuestions }) {
  const [open, setOpen] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const questionCount = exam.questions?.length || 0;
  const selectedQuestions = (exam.questions || []).filter((q) => selectedQuestionIds.includes(q.id));
  const allSelected = questionCount > 0 && selectedQuestionIds.length === questionCount;

  function toggleQuestion(id) {
    setSelectedQuestionIds((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
  }

  async function deleteSelectedQuestions() {
    if (selectedQuestions.length === 0) return;
    await onDeleteQuestions(selectedQuestions);
    setSelectedQuestionIds([]);
  }

  return (
    <div className="border border-slate-200 rounded-lg p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <b>{exam.title}</b>
          <p className="text-sm text-slate-500">{exam.type} - {examDurationMinutes(exam)} phút - {questionCount} câu hỏi</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-muted" onClick={() => setOpen((value) => !value)}>
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {open ? 'Ẩn câu hỏi' : 'Xem câu hỏi'}
          </button>
          <Actions onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
      {open && (
        <div className="mt-2 max-h-96 space-y-1 overflow-y-auto rounded-md border border-slate-100 bg-white p-2">
          {questionCount === 0 && <p className="text-sm text-slate-500">Chưa có câu hỏi.</p>}
          {questionCount > 0 && (
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-md bg-slate-100 p-2">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => setSelectedQuestionIds(e.target.checked ? exam.questions.map((q) => q.id) : [])}
                />
                Chọn tất cả
              </label>
              <button className="btn btn-muted text-red-700" disabled={selectedQuestions.length === 0} onClick={deleteSelectedQuestions}>
                <Trash2 size={15} />Xóa mục đã chọn ({selectedQuestions.length})
              </button>
            </div>
          )}
          {exam.questions?.map((q, index) => (
            <div key={q.id} className="flex items-start justify-between gap-2 bg-slate-50 rounded-md p-2 text-sm">
              <label className="flex min-w-0 flex-1 items-start gap-2">
                <input className="mt-1" type="checkbox" checked={selectedQuestionIds.includes(q.id)} onChange={() => toggleQuestion(q.id)} />
                <span>
                  <span className="mr-2 rounded bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700">{q.questionType || 'MULTIPLE_CHOICE'}</span>
                  {index + 1}. {q.content}
                </span>
              </label>
              <Actions onEdit={() => onEditQuestion(q)} onDelete={() => onDeleteQuestion(q)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Actions({ onEdit, onDelete }) {
  return <div className="flex gap-1"><button className="btn btn-muted" onClick={onEdit}><Edit3 size={15} /></button><button className="btn btn-muted text-red-700" onClick={onDelete}><Trash2 size={15} /></button></div>;
}
