import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Flag, GripVertical, Lightbulb, Mic, PenLine, RotateCcw, Volume2, XCircle } from 'lucide-react';
import { api } from '../../api/client';
import { examDurationMinutes } from '../../utils/examDuration';

export default function ExamRunner() {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [essayText, setEssayText] = useState('');
  const [recordingUrl, setRecordingUrl] = useState('');
  const [result, setResult] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [checkedQuestions, setCheckedQuestions] = useState([]);
  const [visibleAnswers, setVisibleAnswers] = useState({});
  const [answerPrompt, setAnswerPrompt] = useState(null);
  const [speakingPart4Prompt, setSpeakingPart4Prompt] = useState(null);
  const [speakingQ1Answer, setSpeakingQ1Answer] = useState(null);
  const [speakingImageAnswer, setSpeakingImageAnswer] = useState(null);
  const [activeSpeakingTabs, setActiveSpeakingTabs] = useState({});
  const [activeSpeakingGroupIndex, setActiveSpeakingGroupIndex] = useState(0);
  const [showParagraph, setShowParagraph] = useState(false);
  const [showScript, setShowScript] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeSpeakingImageListIndex, setActiveSpeakingImageListIndex] = useState(0);
  const [draggingParagraphOrder, setDraggingParagraphOrder] = useState(null);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const questionRefs = useRef([]);

  useEffect(() => {
    api.get(`/exams/${id}`).then((r) => {
      setExam(r.data.data);
      setTimeLeftSeconds(examDurationMinutes(r.data.data) * 60);
    });
  }, [id]);

  useEffect(() => {
    if (!exam || result || submitting || timeLeftSeconds === null) return undefined;
    if (timeLeftSeconds <= 0) {
      submit();
      return undefined;
    }
    const timer = setTimeout(() => setTimeLeftSeconds((seconds) => Math.max((seconds || 0) - 1, 0)), 1000);
    return () => clearTimeout(timer);
  }, [answers, essayText, exam, recordingUrl, result, submitting, timeLeftSeconds]);

  if (!exam) return null;

  async function submit() {
    if (result || submitting) return;
    setSubmitting(true);
    const submittedAnswers = { ...answers };
    exam.questions?.forEach((q) => {
      if (q.questionType === 'PARAGRAPH_ORDER' && !submittedAnswers[q.id]) submittedAnswers[q.id] = orderValue(q).join(',');
    });
    setAnswers(submittedAnswers);
    const submittedEssayText = exam.type === 'WRITING' ? writingEssayText(submittedAnswers) : essayText;
    setEssayText(submittedEssayText);
    try {
      const durationSeconds = examDurationMinutes(exam) * 60;
      const timeSpentSeconds = Math.max(durationSeconds - (timeLeftSeconds || 0), 0);
      const r = await api.post(`/exams/${id}/submit`, { answers: submittedAnswers, essayText: submittedEssayText, recordingUrl, timeSpentSeconds });
      setResult(r.data.data);
      setShowReview(true);
    } finally {
      setSubmitting(false);
    }
  }

  function formatTime(seconds) {
    const safeSeconds = Math.max(seconds || 0, 0);
    const minutes = Math.floor(safeSeconds / 60);
    const remainder = safeSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  }

  function optionClass(q, key) {
    if (!isQuestionReviewed(q)) return 'text-slate-950';
    const selected = answers[q.id] === key;
    const correct = q.correctAnswer?.trim()?.toUpperCase() === key;
    if (correct) return 'font-semibold text-green-800';
    if (selected) return 'font-semibold text-red-800';
    return 'text-slate-600';
  }

  function groupMcValue(q) {
    const current = answers[q.id]?.split(',') || [];
    return [0, 1].map((index) => current[index] || '');
  }

  function setGroupMcValue(q, index, value) {
    const next = groupMcValue(q);
    next[index] = value;
    setAnswers({ ...answers, [q.id]: next.join(',') });
  }

  function listeningGroupMcData(q) {
    let questions = [];
    try {
      questions = JSON.parse(q.scriptText || '[]');
    } catch {
      questions = [];
    }
    const topic = (q.content || '').replace(/^topic:\s*/i, '').trim();
    return { topic, questions: Array.isArray(questions) ? questions : [] };
  }

  function renderListeningGroupMc(q) {
    const data = listeningGroupMcData(q);
    const selected = groupMcValue(q);
    return (
      <div className="space-y-4">
        {q.audioUrl && (
          <div className="rounded-md bg-red-600 px-4 py-3">
            <audio controls src={q.audioUrl} className="w-full accent-white" />
          </div>
        )}
        <div className="rounded-md bg-slate-100 p-5">
          <h3 className="text-lg font-black text-slate-950">Topic: {data.topic}</h3>
          <div className="mt-5 space-y-6">
            {data.questions.map((item, questionIndex) => (
              <div key={questionIndex} className={`space-y-3 rounded-md border p-3 ${subAnswerClass(q, questionIndex)}`}>
                <div className="text-sm text-slate-950">{questionIndex + 1}. {item.content}</div>
                <div className="space-y-2">
                  {(item.options || []).map((option, optionIndex) => {
                    const key = ['A', 'B', 'C'][optionIndex];
                    return (
                      <label key={key} className="flex items-center gap-3 text-sm text-slate-950">
                        <input type="radio" name={`${q.id}-${questionIndex}`} checked={selected[questionIndex] === key} disabled={questionLocked(q)} onChange={() => setGroupMcValue(q, questionIndex, key)} />
                        <span>{option}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        {q.explanation && (
          <button className="btn btn-primary stable-nav-btn" onClick={() => setShowParagraph((value) => !value)}>
            {showParagraph ? 'Hide paragraph' : 'Show paragraph'}
          </button>
        )}
        {showParagraph && q.explanation && <div className="panel whitespace-pre-wrap">{q.explanation}</div>}
      </div>
    );
  }

  function renderListeningSingleMc(q) {
    return (
      <div className="space-y-4">
        {q.audioUrl && (
          <div className="rounded-md bg-red-600 px-4 py-3">
            <audio controls src={q.audioUrl} className="w-full accent-white" />
          </div>
        )}
        <div className="rounded-md bg-slate-100 p-5">
          <div className="mb-4 font-black text-slate-950">{q.content}</div>
          <div className="space-y-3">
            {['A', 'B', 'C'].map((key) => q[`option${key}`] && (
              <label key={key} className="flex items-center gap-3 text-sm text-slate-950">
                <input type="radio" name={q.id} checked={answers[q.id] === key} disabled={questionLocked(q)} onChange={() => setAnswers({ ...answers, [q.id]: key })} />
                <span>{q[`option${key}`]}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function reviewState(q) {
    return isAnswerCorrect(q);
  }

  function normalizeAnswer(value) {
    return value ? value.replace(/\s+/g, '').toUpperCase() : '';
  }

  function isAnswerCorrect(q) {
    const selected = answers[q.id];
    const correct = normalizeAnswer(q.correctAnswer);
    return Boolean(selected && correct && normalizeAnswer(selected) === correct);
  }

  function isQuestionReviewed(q) {
    return showReview || checkedQuestions.includes(q.id);
  }

  function questionLocked(q) {
    return isQuestionReviewed(q);
  }

  function answerParts(value) {
    const separator = (value || '').includes('|||') ? '|||' : ',';
    return (value || '').split(separator).map((item) => item.trim());
  }

  function subAnswerClass(q, index) {
    if (!isQuestionReviewed(q)) return 'border-slate-200 bg-white';
    const correct = answerParts(q.correctAnswer)[index] || '';
    const selected = answerParts(answers[q.id])[index] || '';
    if (!correct) return 'border-slate-200 bg-white';
    return normalizeAnswer(selected) === normalizeAnswer(correct)
      ? 'border-green-500 bg-green-50'
      : 'border-red-500 bg-red-50';
  }

  function optionTextByKey(options, key) {
    return options.find((option) => normalizeAnswer(option.key) === normalizeAnswer(key))?.text || key || '';
  }

  function inlineDropdownFeedback(q, index, parts, options) {
    if (!isQuestionReviewed(q)) return null;
    const correctKey = answerParts(q.correctAnswer)[index] || '';
    const selectedKey = answerParts(answers[q.id])[index] || '';
    const correctText = optionTextByKey(options, correctKey);
    const selectedText = optionTextByKey(options, selectedKey);
    const correct = normalizeAnswer(selectedKey) === normalizeAnswer(correctKey);
    return (
      <div className={`mt-4 overflow-hidden rounded-lg border bg-white ${correct ? 'border-green-100' : 'border-red-100'}`}>
        <div className={`flex items-center gap-2 border-b px-4 py-3 font-black ${correct ? 'border-green-100 text-green-700' : 'border-red-100 text-red-700'}`}>
          {correct ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
          {correct ? 'Chính xác' : 'Chưa chính xác'}
        </div>
        <div className="space-y-4 p-4">
          <div className="rounded-md border border-slate-200 bg-white px-4 py-3 italic text-slate-950">
            {parts[0]} <span className={`rounded px-2 py-0.5 font-black not-italic ${correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{selectedText || '...'}</span> {parts.slice(1).join('')}
          </div>
          <div className="text-slate-600">Đáp án đúng: <b className="text-green-700">{correctText}</b></div>
          <div className="rounded-md border border-blue-100 bg-blue-50 p-3 text-blue-900">
            <div className="mb-1 font-black uppercase text-blue-800">Giải thích</div>
            Bạn chọn: {selectedText || 'chưa chọn'}. Đáp án đúng là: {correctText}.
          </div>
        </div>
      </div>
    );
  }

  function hasAnswer(q) {
    if (isSpeakingPrompt(q)) return true;
    if (q.questionType === 'PARAGRAPH_ORDER') return true;
    if (q.optionF === 'GRAMMAR_TERM_MATCH') return grammarTermMatchValue(q).every(Boolean);
    if (q.optionF === 'GRAMMAR_SENTENCE_DROPDOWN') return grammarSentenceDropdownValue(q).every(Boolean);
    if (q.optionF === 'LISTENING_GROUP_MC') return groupMcValue(q).every(Boolean);
    if (isWritingQuestion(q)) {
      if (isWritingEmailQuestion(q)) return writingEmailPrompts(q).every((_, index) => Boolean((writingChatValue(q)[index] || '').trim()));
      if (isWritingChatQuestion(q)) return writingChatPrompts(q).every((_, index) => Boolean((writingChatValue(q)[index] || '').trim()));
      return Boolean((answers[q.id] || '').trim());
    }
    return Boolean(answers[q.id]);
  }

  function isSpeakingPrompt(q) {
    return q.questionType === 'SPEAKING_PROMPT';
  }

  function isSpeakingImageQuestion(q) {
    return q.questionType === 'SPEAKING_IMAGE_TABLE';
  }

  function isSpeakingCompareQuestion(q) {
    return q.questionType === 'SPEAKING_COMPARE_IMAGES';
  }

  function isSpeakingPart4Question(q) {
    return q.questionType === 'SPEAKING_PART4_LIST';
  }

  function sampleAnswers(q) {
    if (q.answerText) return [q.answerText];
    const optionAnswers = [q.optionA, q.optionB].filter((answer) => answer?.trim());
    if (optionAnswers.length > 0) return optionAnswers.slice(0, 2);
    return [q.correctAnswer || q.explanation || q.scriptText || ''].filter((answer) => answer?.trim());
  }

  function toggleSampleAnswer(q) {
    openAnswerPrompt({
      label: 'Đáp án mẫu',
      title: q.content || 'Đáp án',
      text: modalAnswerText(q)
    });
  }

  function questionImageUrl(q) {
    const image = q.imageUrl?.trim() || exam.prompt?.trim() || '';
    if (/^(https?:\/\/|\/|data:image\/)/i.test(image)) return image;
    return '';
  }

  function questionImageUrl2(q) {
    const image = q.imageUrl2?.trim() || '';
    if (/^(https?:\/\/|\/|data:image\/)/i.test(image)) return image;
    return '';
  }

  function isSpeakingImageTable() {
    return (exam.questions || []).some((q) => isSpeakingImageQuestion(q) || isSpeakingCompareQuestion(q));
  }

  function speakingImageGroups() {
    return (exam.questions || [])
      .filter((q) => isSpeakingImageQuestion(q) || isSpeakingCompareQuestion(q))
      .map((q) => ({ imageUrl: questionImageUrl(q), imageUrl2: questionImageUrl2(q), compare: isSpeakingCompareQuestion(q), questions: speakingImageQuestionRows(q) }));
  }

  function standardQuestions() {
    if (exam.type === 'MIXED') return exam.questions || [];
    return (exam.questions || []).filter((q) => !isSpeakingImageQuestion(q) && !isSpeakingCompareQuestion(q) && !isSpeakingPart4Question(q) && !isSpeakingQ1ListQuestion(q) && !isSpeakingImageListQuestion(q));
  }

  function speakingPart4Questions() {
    return (exam.questions || []).filter((q) => isSpeakingPart4Question(q));
  }

  function isSpeakingQ1ListQuestion(q) {
    return q.optionF === 'SPEAKING_Q1_LIST';
  }

  function speakingQ1Questions() {
    return (exam.questions || []).filter((q) => isSpeakingQ1ListQuestion(q));
  }

  function isSpeakingImageListQuestion(q) {
    return q.optionF === 'SPEAKING_IMAGE_LIST' || q.optionF === 'SPEAKING_COMPARE_LIST';
  }

  function speakingImageListQuestions() {
    return (exam.questions || []).filter((q) => isSpeakingImageListQuestion(q));
  }

  function speakingImageQuestionRows(q) {
    const lines = (q.content || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (lines.length <= 1) return [q];
    const answerSlots = [q.optionA, q.optionB, q.optionC, q.optionD, q.optionE, q.optionF, q.correctAnswer, q.explanation, q.scriptText];
    return lines.map((line, index) => ({
      ...q,
      id: `${q.id}-${index}`,
      content: line,
      answerText: answerSlots[index] || ''
    }));
  }

  function speakingPart4CardRows(q) {
    const lines = (q.content || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const questions = (lines.length > 0 ? lines : [q.content || 'Speaking Part 4 question']).slice(0, 3);
    const answers = [q.optionA, q.optionB, q.optionC, q.correctAnswer, q.explanation, q.scriptText];
    return questions.map((content, index) => ({ content, answer: answers[index] || '' }));
  }

  function speakingPart4CardTitle(q) {
    return q.optionD?.trim() || speakingPart4CardRows(q)[0]?.content || q.content || 'Speaking Part 4';
  }

  function speakingPart4CardAnswerText(q) {
    return speakingPart4CardRows(q)
      .map((row, index) => `${index + 1}. ${row.content}\n${row.answer || 'Chưa có câu trả lời mẫu.'}`)
      .join('\n\n');
  }

  function renderSpeakingPart4Card(q, index, compact = false) {
    const rows = speakingPart4CardRows(q);
    const title = speakingPart4CardTitle(q);
    return (
      <section key={q.id} className={`${compact ? '' : 'overflow-hidden'} rounded-lg border border-purple-300 bg-white shadow-sm`}>
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-5">
          <div className="flex min-w-0 items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg border border-purple-200 bg-purple-100 text-xl font-black text-purple-700 shadow-md shadow-purple-100">{index + 1}</span>
            <div className="min-w-0">
              <h2 className="text-xl font-black leading-tight text-slate-950">{title}</h2>
              <p className="mt-2 text-sm text-slate-500">Trả lời cả 3 câu hỏi trong 120 giây</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-muted"><Flag size={16} />Báo lỗi</button>
            <button type="button" className="btn bg-purple-600 text-white hover:bg-purple-500"><Mic size={17} />Ghi âm (120s)</button>
          </div>
        </div>
        <div className="space-y-4 px-5 pb-5">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-purple-100 font-black text-purple-700">{rowIndex + 1}</span>
              <div className="font-bold leading-7 text-slate-950">{row.content}</div>
            </div>
          ))}
        </div>
        <div className="border-t border-purple-100 bg-purple-50 px-5 py-5">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-md border border-purple-300 bg-white px-4 py-3 font-bold text-slate-950"
            onClick={() => openAnswerPrompt({ label: 'Câu trả lời mẫu', title, text: speakingPart4CardAnswerText(q) })}
          >
            <span className="flex items-center gap-2"><Volume2 size={18} className="text-purple-600" />Câu trả lời mẫu</span>
            <ChevronDown size={18} className="text-purple-600" />
          </button>
        </div>
      </section>
    );
  }

  function activeSpeakingQuestion(group, groupIndex) {
    return group.questions[activeSpeakingTabs[groupIndex] || 0] || group.questions[0];
  }

  function activeSpeakingIndex(groupIndex) {
    return activeSpeakingTabs[groupIndex] || 0;
  }

  function goToSpeakingQuestion(groupIndex, nextIndex) {
    setActiveSpeakingTabs((tabs) => ({ ...tabs, [groupIndex]: nextIndex }));
  }

  function modalAnswerText(q) {
    return sampleAnswers(q).join('\n\n') || 'Chưa có đáp án mẫu.';
  }

  function openAnswerPrompt(prompt) {
    setAnswerPrompt({
      label: prompt.label || 'Đáp án',
      title: prompt.title || 'Đáp án',
      text: prompt.text || 'Chưa có đáp án.'
    });
  }

  function renderAnswerPrompt() {
    if (!answerPrompt) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={() => setAnswerPrompt(null)}>
        <div className="w-full max-w-2xl overflow-hidden rounded-md bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-cyan-50 p-5">
            <div>
              <div className="text-xs font-black uppercase text-cyan-700">{answerPrompt.label}</div>
              <h3 className="mt-1 text-xl font-black leading-7 text-slate-950">{answerPrompt.title}</h3>
            </div>
            <button type="button" className="rounded-md p-2 text-slate-500 hover:bg-white hover:text-slate-950" onClick={() => setAnswerPrompt(null)} aria-label="Đóng đáp án"><XCircle size={22} /></button>
          </div>
          <div className="p-5">
            <div className="whitespace-pre-wrap rounded-md border border-cyan-100 bg-cyan-50 p-4 leading-7 text-slate-900">{answerPrompt.text}</div>
          </div>
        </div>
      </div>
    );
  }

  function renderSpeakingAnswerList(q) {
    const answers = sampleAnswers(q);
    if (answers.length === 0) return <div className="mt-3 rounded-md border border-blue-100 bg-blue-50 p-3 text-sm text-blue-950">Chưa có đáp án mẫu.</div>;
    return (
      <div className="mt-3 space-y-2">
        {answers.map((answer, answerIndex) => (
          <div key={answerIndex} className="rounded-md border border-blue-100 bg-blue-50 p-3 text-blue-950">
            <div className="mb-1 text-xs font-black uppercase text-blue-700">Đáp án mẫu {answerIndex + 1}</div>
            <div className="whitespace-pre-wrap leading-7">{answer}</div>
          </div>
        ))}
      </div>
    );
  }

  function renderSpeakingPart4List() {
    const questions = speakingPart4Questions();
    if (questions.length === 0) return null;
    return (
      <div className="space-y-5">
        {questions.map((q, index) => renderSpeakingPart4Card(q, index))}
        {speakingPart4Prompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
            <div className="w-full max-w-2xl overflow-hidden rounded-md bg-white shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-cyan-50 to-white p-5">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-md bg-cyan-100 px-3 py-1 text-xs font-black uppercase text-cyan-800">
                    <Volume2 size={14} /> Đáp án mẫu
                  </div>
                  <h3 className="mt-1 text-xl font-black leading-7 text-slate-950">{speakingPart4Prompt.content}</h3>
                </div>
                <button type="button" className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950" onClick={() => setSpeakingPart4Prompt(null)} aria-label="Đóng đáp án">
                  <XCircle size={22} />
                </button>
              </div>
              <div className="p-5">
                <div className="rounded-md border border-cyan-100 bg-cyan-50 p-4 whitespace-pre-wrap leading-7 text-slate-900">{modalAnswerText(speakingPart4Prompt)}</div>
              </div>
              <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-4">
                <button type="button" className="rounded-md bg-slate-900 px-5 py-2 font-semibold text-white hover:bg-slate-700" onClick={() => setSpeakingPart4Prompt(null)}>Dong</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderSpeakingQ1List() {
    const questions = speakingQ1Questions();
    if (questions.length === 0) return null;
    return (
      <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg shadow-slate-200/70">
        <div className="px-5 py-4">
          <h2 className="text-2xl font-black text-slate-950">Speaking Câu 1 list</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="w-16 px-4 py-3 font-black text-slate-950">STT</th>
                <th className="px-4 py-3 font-black text-slate-950">Tên câu hỏi</th>
                <th className="w-36 px-4 py-3 font-black text-slate-950">Đáp án 1</th>
                <th className="w-36 px-4 py-3 font-black text-slate-950">Đáp án 2</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q, index) => (
                <tr key={q.id} className="border-b border-white bg-slate-100">
                  <td className="px-4 py-3 align-top font-black text-slate-950">{index + 1}</td>
                  <td className="px-4 py-3 align-top text-slate-950">{q.content}</td>
                  <td className="px-4 py-3 align-top">
                    <button type="button" className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400" onClick={() => openAnswerPrompt({ title: q.content, label: 'Đáp án 1', text: q.optionA || 'Chưa có đáp án.' })}>Xem đáp án</button>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <button type="button" className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400" onClick={() => openAnswerPrompt({ title: q.content, label: 'Đáp án 2', text: q.optionB || 'Chưa có đáp án.' })}>Xem đáp án</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {speakingQ1Answer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
            <div className="w-full max-w-xl overflow-hidden rounded-md bg-white shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-cyan-50 p-5">
                <div>
                  <div className="text-xs font-black uppercase text-cyan-700">{speakingQ1Answer.label}</div>
                  <h3 className="mt-1 text-xl font-black text-slate-950">{speakingQ1Answer.title}</h3>
                </div>
                <button type="button" className="rounded-md p-2 text-slate-500 hover:bg-white hover:text-slate-950" onClick={() => setSpeakingQ1Answer(null)} aria-label="Đóng đáp án"><XCircle size={22} /></button>
              </div>
              <div className="p-5">
                <div className="whitespace-pre-wrap rounded-md border border-cyan-100 bg-cyan-50 p-4 leading-7 text-slate-900">{speakingQ1Answer.text}</div>
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }

  function renderSpeakingImageList() {
    const items = speakingImageListQuestions();
    if (items.length === 0) return null;
    const activeIndex = Math.min(activeSpeakingImageListIndex, items.length - 1);
    const q = items[activeIndex];
    const rows = (q.content || '').split(/\r?\n/).map((line, index) => ({ question: line.trim(), answer: [q.optionA, q.optionB, q.optionC][index] || '' })).filter((row) => row.question);
    return (
      <section className="space-y-5">
        <div className={q.imageUrl2 ? 'grid gap-8 md:grid-cols-2 md:items-center' : 'flex justify-center'}>
          {q.imageUrl && <div className="flex justify-center"><img className="max-h-72 rounded-sm object-contain" src={q.imageUrl} alt="Speaking image 1" /></div>}
          {q.imageUrl2 && <div className="flex justify-center"><img className="max-h-72 rounded-sm object-contain" src={q.imageUrl2} alt="Speaking image 2" /></div>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left">
            <thead><tr><th className="border border-slate-300 px-2 py-2 font-black">Câu hỏi</th><th className="w-64 border border-slate-300 px-2 py-2 font-black">Đáp án</th></tr></thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td className="border border-slate-300 px-2 py-3">{row.question}</td>
                  <td className="border border-slate-300 px-2 py-3"><button type="button" className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400" onClick={() => openAnswerPrompt({ title: row.question, label: 'Đáp án', text: row.answer || 'Chưa có đáp án.' })}>Xem đáp án</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="question-action-bar md:left-[260px]">
          <div className="question-action-grid question-action-grid--three">
            <button type="button" className="btn btn-muted question-action-btn" disabled={activeIndex === 0} onClick={() => setActiveSpeakingImageListIndex((index) => Math.max(index - 1, 0))}>Back</button>
            <button type="button" className="btn btn-primary question-action-btn" disabled={activeIndex >= items.length - 1} onClick={() => setActiveSpeakingImageListIndex((index) => Math.min(index + 1, items.length - 1))}>Next</button>
            <button type="button" className="btn btn-primary question-action-btn" disabled={submitting} onClick={submit}>
              <CheckCircle2 size={16} />{submitting ? 'Đang nộp...' : 'Nộp bài'}
            </button>
          </div>
        </div>
        {speakingImageAnswer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
            <div className="w-full max-w-xl overflow-hidden rounded-md bg-white shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-cyan-50 p-5">
                <h3 className="text-xl font-black text-slate-950">{speakingImageAnswer.title}</h3>
                <button type="button" className="rounded-md p-2 text-slate-500 hover:bg-white hover:text-slate-950" onClick={() => setSpeakingImageAnswer(null)} aria-label="Đóng đáp án"><XCircle size={22} /></button>
              </div>
              <div className="p-5"><div className="whitespace-pre-wrap rounded-md border border-cyan-100 bg-cyan-50 p-4 leading-7 text-slate-900">{speakingImageAnswer.text}</div></div>
            </div>
          </div>
        )}
      </section>
    );
  }

  function renderMixedSpeakingQ1ListQuestion(q) {
    return (
      <div className="space-y-4 rounded-lg bg-white p-4">
        <div className="text-sm font-semibold text-slate-500">Speaking Câu 1</div>
        <p className="text-lg font-bold leading-7 text-slate-900">{q.content}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400" onClick={() => openAnswerPrompt({ title: q.content, label: 'Đáp án 1', text: q.optionA || 'Chưa có đáp án.' })}>Xem đáp án 1</button>
          <button type="button" className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400" onClick={() => openAnswerPrompt({ title: q.content, label: 'Đáp án 2', text: q.optionB || 'Chưa có đáp án.' })}>Xem đáp án 2</button>
        </div>
      </div>
    );
  }

  function renderMixedSpeakingImageListQuestion(q) {
    const rows = (q.content || '').split(/\r?\n/).map((line, index) => ({ question: line.trim(), answer: [q.optionA, q.optionB, q.optionC][index] || '' })).filter((row) => row.question);
    return (
      <div className="space-y-5 rounded-lg bg-white p-4">
        <div className={q.imageUrl2 ? 'grid gap-6 md:grid-cols-2 md:items-center' : 'flex justify-center'}>
          {q.imageUrl && <div className="flex justify-center"><img className="max-h-72 rounded-sm object-contain" src={q.imageUrl} alt="Speaking image 1" /></div>}
          {q.imageUrl2 && <div className="flex justify-center"><img className="max-h-72 rounded-sm object-contain" src={q.imageUrl2} alt="Speaking image 2" /></div>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-left">
            <thead><tr><th className="border border-slate-300 px-3 py-2 font-black">Câu hỏi</th><th className="w-44 border border-slate-300 px-3 py-2 font-black">Đáp án</th></tr></thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="border border-slate-300 px-3 py-3">{row.question}</td>
                  <td className="border border-slate-300 px-3 py-3">
                    <button type="button" className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400" onClick={() => openAnswerPrompt({ title: row.question, label: 'Đáp án', text: row.answer || 'Chưa có đáp án.' })}>Xem đáp án</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function renderMixedSpeakingPart4Question(q) {
    return renderSpeakingPart4Card(q, 0, true);
  }

  function writingQuestions() {
    return exam.type === 'WRITING' ? (exam.questions || []) : [];
  }

  function isWritingQuestion(q) {
    return ['WRITING_PART1', 'WRITING_LONG', 'WRITING_CHAT', 'WRITING_EMAIL'].includes(q.optionF);
  }

  function isListeningQuestion(q) {
    return q.questionType === 'LISTENING_AUDIO' || (q.optionF || '').startsWith('LISTENING_') || Boolean(q.audioUrl && q.scriptText);
  }

  function writingInstruction() {
    return exam.prompt?.trim() || 'You are joining a Business club. Fill out the form. Write short answers (1-5 words) for each message (Bai nay nen tra loi dai nhat la 5 tu, viet hoa tu dau va dau cham ket thuc cau).';
  }

  function writingExample() {
    const text = exam.transcript?.trim();
    if (text) return text;
    return 'Example:\nQ: What is your hobby?\nA: I like listening to music.';
  }

  function writingSampleAnswers(q) {
    if (isWritingEmailQuestion(q)) return [q.correctAnswer || q.explanation || q.scriptText || ''].filter((answer) => answer?.trim());
    if (isWritingChatQuestion(q)) return [q.correctAnswer || q.explanation || q.scriptText || ''].filter((answer) => answer?.trim());
    if (isWritingLongQuestion(q)) return [q.correctAnswer || q.explanation || q.scriptText || ''].filter((answer) => answer?.trim());
    const samples = [q.correctAnswer, q.optionA, q.optionB].filter((answer) => answer?.trim());
    if (samples.length > 0) return samples;
    return [q.explanation || q.scriptText || ''].filter((answer) => answer?.trim());
  }

  function isWritingLongQuestion(q) {
    return q.optionF === 'WRITING_LONG';
  }

  function isWritingChatQuestion(q) {
    return q.optionF === 'WRITING_CHAT';
  }

  function isWritingEmailQuestion(q) {
    return q.optionF === 'WRITING_EMAIL';
  }

  function isWritingPart1Question(q) {
    return q.optionF === 'WRITING_PART1' || (!isWritingLongQuestion(q) && !isWritingChatQuestion(q) && !isWritingEmailQuestion(q));
  }

  function writingQuestionGroups() {
    const questions = writingQuestions();
    const part1Questions = questions.filter(isWritingPart1Question);
    let part1Added = false;
    return questions.reduce((groups, q) => {
      if (isWritingPart1Question(q)) {
        if (!part1Added) {
          groups.push({ id: 'writing-part1', type: 'part1', questions: part1Questions });
          part1Added = true;
        }
        return groups;
      }
      groups.push({ id: q.id, type: 'single', question: q });
      return groups;
    }, []);
  }

  function checkWritingGroup(group) {
    const ids = group.type === 'part1' ? group.questions.map((q) => q.id) : writingHintKeys(group.question);
    setCheckedQuestions((current) => Array.from(new Set([...current, ...ids])));
    setVisibleAnswers((current) => ids.reduce((next, id) => ({ ...next, [id]: true }), { ...current }));
  }

  function writingEmailPrompts(q) {
    return [q.optionC, q.optionD].filter((prompt) => prompt?.trim());
  }

  function writingChatPrompts(q) {
    return (q.content || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  }

  function writingChatValue(q) {
    try {
      const parsed = JSON.parse(answers[q.id] || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function setWritingChatAnswer(q, index, value) {
    const next = [...writingChatValue(q)];
    next[index] = value;
    setWritingAnswer(q, JSON.stringify(next));
  }

  function renderWritingSuggestedAnswer(q) {
    const samples = writingSampleAnswers(q);
    return (
      <div className="rounded-md border border-blue-100 bg-blue-50 p-4">
        <div className="mb-2 text-xs font-black uppercase text-blue-700">Đáp án gợi ý</div>
        {samples.length > 0 ? (
          <div className="space-y-2">
            {samples.map((sample, sampleIndex) => (
              <div key={sampleIndex} className="rounded-md border border-blue-200 bg-white px-3 py-3 text-sm leading-7 text-slate-950 whitespace-pre-wrap">{sample}</div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-blue-200 bg-white px-3 py-3 text-sm text-slate-500">Chưa có đáp án gợi ý.</div>
        )}
      </div>
    );
  }

  function wordCount(value) {
    return value.trim() ? value.trim().split(/\s+/).length : 0;
  }

  function writingEssayText(sourceAnswers = answers) {
    return writingQuestions()
      .map((q, index) => `${index + 1}. ${q.content}\n${sourceAnswers[q.id] || ''}`)
      .join('\n\n');
  }

  function setWritingAnswer(q, value) {
    const nextAnswers = { ...answers, [q.id]: value };
    setAnswers(nextAnswers);
    setEssayText(writingEssayText(nextAnswers));
  }

  function renderWritingHint(q) {
    const samples = writingSampleAnswers(q);
    const hasExplanation = Boolean(q.explanation?.trim());
    return (
      <div className="overflow-hidden rounded-md border border-blue-100 bg-white">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 bg-blue-50 px-4 py-3 text-left text-sm font-black text-blue-700"
          onClick={() => toggleSampleAnswer(q)}
        >
          <span className="flex items-center gap-2"><Lightbulb size={16} className="text-amber-500" />Đáp án gợi ý & Giải thích</span>
          <ChevronDown size={18} className={`shrink-0 transition ${visibleAnswers[q.id] ? 'rotate-180' : ''}`} />
        </button>
        {visibleAnswers[q.id] && (
          <div className="space-y-3 border-t border-blue-100 p-4">
            <div>
              <div className="mb-2 text-xs font-black uppercase text-slate-500">Đáp án gợi ý</div>
              {samples.length > 0 ? (
                <div className="space-y-2">
                  {samples.map((sample, sampleIndex) => (
                    <div key={sampleIndex} className="rounded-md border border-blue-200 bg-slate-50 px-3 py-3 text-sm leading-7 text-slate-950">{sample}</div>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border border-blue-200 bg-slate-50 px-3 py-3 text-sm text-slate-500">Chưa có đáp án gợi ý.</div>
              )}
            </div>
            {hasExplanation && (
              <div>
                <div className="mb-2 text-xs font-black uppercase text-slate-500">Giai thich</div>
                <div className="rounded-md border border-amber-100 bg-amber-50 px-3 py-3 text-sm leading-7 text-slate-900">{q.explanation}</div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  function renderWritingCompactHint(q) {
    const samples = writingSampleAnswers(q);
    const answerText = samples.length > 0 ? samples.join(' / ') : 'Chưa có đáp án gợi ý.';
    return (
      <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-sm leading-6 text-slate-900">
        <span className="font-black text-blue-700">Đáp án: </span>{answerText}
        {q.explanation?.trim() && <span className="ml-2 text-slate-600">({q.explanation})</span>}
      </div>
    );
  }

  function writingPromptHintKey(q, promptIndex) {
    return `${q.id}-prompt-${promptIndex}`;
  }

  function writingHintKeys(q) {
    if (isWritingEmailQuestion(q)) return writingEmailPrompts(q).map((_, index) => writingPromptHintKey(q, index));
    if (isWritingChatQuestion(q)) return writingChatPrompts(q).map((_, index) => writingPromptHintKey(q, index));
    return [q.id];
  }

  function writingPromptHintText(q, promptIndex) {
    const samples = writingSampleAnswers(q);
    const separatedAnswers = samples.flatMap((sample) => sample.split(/\r?\n\s*---+\s*\r?\n/).map((part) => part.trim()).filter(Boolean));
    if (separatedAnswers.length > 1) return separatedAnswers[promptIndex] || separatedAnswers[0];
    const lines = samples.flatMap((sample) => sample.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !/^---+$/.test(line)));
    return lines[promptIndex] || samples[promptIndex] || samples[0] || 'Chưa có đáp án gợi ý.';
  }

  function renderWritingHintButton(q, hintKey = q.id) {
    return (
      <button type="button" className="btn btn-muted w-fit px-3 py-2 text-sm shadow-none" onClick={() => setVisibleAnswers((current) => ({ ...current, [hintKey]: !current[hintKey] }))}>
        Goi y
      </button>
    );
  }

  function renderWritingPromptHint(q, promptIndex) {
    return (
      <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-sm leading-6 text-slate-900 whitespace-pre-wrap">
        <span className="font-black text-blue-700">Đáp án: </span>{writingPromptHintText(q, promptIndex)}
      </div>
    );
  }

  function renderWritingForm() {
    const questions = writingQuestions();
    if (questions.length === 0) {
      return <textarea className="input min-h-56" placeholder="Type your writing answer" value={essayText} onChange={(e) => setEssayText(e.target.value)} />;
    }
    const groups = writingQuestionGroups();
    const activeIndex = Math.min(currentQuestionIndex, groups.length - 1);
    const group = groups[activeIndex];

    function writingGroupTitle() {
      if (group.type === 'part1') return `Câu ${activeIndex + 1} of ${groups.length}`;
      const q = group.question;
      return q.optionA || `Câu ${activeIndex + 1}`;
    }

    function writingGroupSubtitle() {
      if (group.type === 'part1') return '';
      const q = group.question;
      if (isWritingEmailQuestion(q)) return q.optionB || 'Write two emails.';
      if (isWritingChatQuestion(q)) return q.optionB || 'Respond in full sentences.';
      if (isWritingLongQuestion(q)) return q.optionB || 'Write in sentences. Use 20-30 words.';
      return '';
    }

    function renderWritingQuestion(q, index) {
      if (isWritingEmailQuestion(q)) {
        return (
          <div className="space-y-4">
            {q.content?.trim() && (
              <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                {q.content}
              </div>
            )}
            {writingEmailPrompts(q).map((prompt, promptIndex) => (
              <div key={promptIndex} className="space-y-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <label className="text-base font-black leading-7 text-slate-950" htmlFor={`writing-${q.id}-${promptIndex}`}>{prompt}</label>
                  <span className="rounded-md border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-black uppercase text-blue-700">Email {promptIndex + 1}</span>
                </div>
                <textarea
                  id={`writing-${q.id}-${promptIndex}`}
                  className="input min-h-36"
                  value={writingChatValue(q)[promptIndex] || ''}
                  onChange={(event) => setWritingChatAnswer(q, promptIndex, event.target.value)}
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {renderWritingHintButton(q, writingPromptHintKey(q, promptIndex))}
                  <div className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">Word Count: {wordCount(writingChatValue(q)[promptIndex] || '')}</div>
                </div>
                {visibleAnswers[writingPromptHintKey(q, promptIndex)] && renderWritingPromptHint(q, promptIndex)}
              </div>
            ))}
          </div>
        );
      }

      if (isWritingChatQuestion(q)) {
        return (
          <div className="space-y-4">
            {writingChatPrompts(q).map((prompt, promptIndex) => (
              <div key={promptIndex} className="space-y-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <label className="text-base font-black leading-7 text-slate-950" htmlFor={`writing-${q.id}-${promptIndex}`}>{prompt}</label>
                  <span className="rounded-md border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-black uppercase text-blue-700">Message {promptIndex + 1}</span>
                </div>
                <textarea
                  id={`writing-${q.id}-${promptIndex}`}
                  className="input min-h-24"
                  value={writingChatValue(q)[promptIndex] || ''}
                  onChange={(event) => setWritingChatAnswer(q, promptIndex, event.target.value)}
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {renderWritingHintButton(q, writingPromptHintKey(q, promptIndex))}
                  <div className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">Word Count: {wordCount(writingChatValue(q)[promptIndex] || '')}</div>
                </div>
                {visibleAnswers[writingPromptHintKey(q, promptIndex)] && renderWritingPromptHint(q, promptIndex)}
              </div>
            ))}
          </div>
        );
      }

      if (isWritingLongQuestion(q)) {
        return (
          <div className="space-y-4">
            <div className="space-y-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <label className="block text-base font-black leading-7 text-slate-950" htmlFor={`writing-${q.id}`}>{q.content}</label>
              <textarea
                id={`writing-${q.id}`}
                className="input min-h-44"
                value={answers[q.id] || ''}
                onChange={(event) => setWritingAnswer(q, event.target.value)}
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                {renderWritingHintButton(q)}
                <div className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">Word Count: {wordCount(answers[q.id] || '')}</div>
              </div>
            </div>
            {visibleAnswers[q.id] && renderWritingSuggestedAnswer(q)}
          </div>
        );
      }

      return (
        <div className="space-y-3">
          <label className="block font-black text-slate-950" htmlFor={`writing-${q.id}`}>{index + 1}. {q.content}</label>
          <input
            id={`writing-${q.id}`}
            className="input"
            placeholder="Type your answer here"
            value={answers[q.id] || ''}
            onChange={(event) => setWritingAnswer(q, event.target.value)}
          />
          {renderWritingHintButton(q)}
          {visibleAnswers[q.id] && renderWritingCompactHint(q)}
        </div>
      );
    }

    return (
      <section className="flex flex-col rounded-md border border-slate-200 bg-white shadow-lg shadow-slate-200/70">
        <div className="shrink-0 space-y-4 border-b border-slate-200 bg-slate-50/70 p-4">
          <div>
            <h2 className="text-2xl font-black leading-tight text-slate-950 sm:text-3xl">{writingGroupTitle()}</h2>
            {writingGroupSubtitle() && <p className="mt-2 font-semibold leading-7 text-slate-950">{writingGroupSubtitle()}</p>}
          </div>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
            <div className="flex items-start gap-3 rounded-md border border-blue-100 bg-blue-50 p-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-blue-600 text-white"><PenLine size={18} /></span>
              <div>
                <div className="text-xs font-black uppercase text-blue-700">Huong dan</div>
                <p className="mt-1 font-semibold leading-6 text-slate-950">{writingInstruction()}</p>
              </div>
            </div>
            <div className="rounded-md border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-900">
              <div className="mb-1 text-xs font-black uppercase text-slate-500">Example</div>
              <div className="whitespace-pre-wrap">{writingExample()}</div>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4">
          {group.type === 'part1' ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {group.questions.map((q, index) => renderWritingQuestion(q, index))}
            </div>
          ) : (
            renderWritingQuestion(group.question, activeIndex)
          )}
        </div>
        <div className="question-action-bar md:left-[260px]">
          <div className="question-action-grid">
            <button type="button" className="btn btn-muted question-action-btn" disabled={activeIndex === 0} onClick={() => setCurrentQuestionIndex((index) => Math.max(index - 1, 0))}>Back</button>
            <button type="button" className="btn btn-primary question-action-btn" onClick={() => checkWritingGroup(group)}>Check</button>
            <button type="button" className="btn btn-primary question-action-btn" disabled={activeIndex >= groups.length - 1} onClick={() => setCurrentQuestionIndex((index) => Math.min(index + 1, groups.length - 1))}>Next</button>
            <button type="button" className="btn btn-primary question-action-btn" disabled={submitting} onClick={submit}>
              <CheckCircle2 size={16} />{submitting ? 'Đang nộp...' : 'Nộp bài'}
            </button>
          </div>
        </div>
      </section>
    );
  }

  function renderMixedWritingQuestion(q, index) {
    if (isWritingEmailQuestion(q)) {
      return (
        <div className="space-y-4">
          {q.content?.trim() && <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">{q.content}</div>}
          {writingEmailPrompts(q).map((prompt, promptIndex) => (
            <div key={promptIndex} className="space-y-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <label className="text-base font-black leading-7 text-slate-950" htmlFor={`mixed-writing-${q.id}-${promptIndex}`}>{prompt}</label>
                <span className="rounded-md border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-black uppercase text-blue-700">Email {promptIndex + 1}</span>
              </div>
              <textarea id={`mixed-writing-${q.id}-${promptIndex}`} className="input min-h-36" value={writingChatValue(q)[promptIndex] || ''} onChange={(event) => setWritingChatAnswer(q, promptIndex, event.target.value)} />
              <div className="flex flex-wrap items-center justify-between gap-3">
                {renderWritingHintButton(q, writingPromptHintKey(q, promptIndex))}
                <div className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">Word Count: {wordCount(writingChatValue(q)[promptIndex] || '')}</div>
              </div>
              {visibleAnswers[writingPromptHintKey(q, promptIndex)] && renderWritingPromptHint(q, promptIndex)}
            </div>
          ))}
        </div>
      );
    }
    if (isWritingChatQuestion(q)) {
      return (
        <div className="space-y-4">
          {writingChatPrompts(q).map((prompt, promptIndex) => (
            <div key={promptIndex} className="space-y-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <label className="text-base font-black leading-7 text-slate-950" htmlFor={`mixed-writing-${q.id}-${promptIndex}`}>{prompt}</label>
                <span className="rounded-md border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-black uppercase text-blue-700">Message {promptIndex + 1}</span>
              </div>
              <textarea id={`mixed-writing-${q.id}-${promptIndex}`} className="input min-h-24" value={writingChatValue(q)[promptIndex] || ''} onChange={(event) => setWritingChatAnswer(q, promptIndex, event.target.value)} />
              <div className="flex flex-wrap items-center justify-between gap-3">
                {renderWritingHintButton(q, writingPromptHintKey(q, promptIndex))}
                <div className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">Word Count: {wordCount(writingChatValue(q)[promptIndex] || '')}</div>
              </div>
              {visibleAnswers[writingPromptHintKey(q, promptIndex)] && renderWritingPromptHint(q, promptIndex)}
            </div>
          ))}
        </div>
      );
    }
    if (isWritingLongQuestion(q)) {
      return (
        <div className="space-y-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <label className="block text-base font-black leading-7 text-slate-950" htmlFor={`mixed-writing-${q.id}`}>{q.content}</label>
          <textarea id={`mixed-writing-${q.id}`} className="input min-h-44" value={answers[q.id] || ''} onChange={(event) => setWritingAnswer(q, event.target.value)} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            {renderWritingHintButton(q)}
            <div className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">Word Count: {wordCount(answers[q.id] || '')}</div>
          </div>
          {visibleAnswers[q.id] && renderWritingSuggestedAnswer(q)}
        </div>
      );
    }
    return (
      <div className="space-y-3">
        <label className="block font-black text-slate-950" htmlFor={`mixed-writing-${q.id}`}>{index + 1}. {q.content}</label>
        <input id={`mixed-writing-${q.id}`} className="input" placeholder="Type your answer here" value={answers[q.id] || ''} onChange={(event) => setWritingAnswer(q, event.target.value)} />
        {renderWritingHintButton(q)}
        {visibleAnswers[q.id] && renderWritingCompactHint(q)}
      </div>
    );
  }

  function checkQuestion(q) {
    const nextAnswers = { ...answers };
    if (q.questionType === 'PARAGRAPH_ORDER' && !nextAnswers[q.id]) {
      nextAnswers[q.id] = orderValue(q).join(',');
    }
    setAnswers(nextAnswers);
    setCheckedQuestions((ids) => ids.includes(q.id) ? ids : [...ids, q.id]);
  }

  function resetQuestion(q) {
    setAnswers((current) => {
      const next = { ...current };
      delete next[q.id];
      return next;
    });
    setCheckedQuestions((ids) => ids.filter((questionId) => questionId !== q.id));
    setVisibleAnswers((current) => ({ ...current, [q.id]: false }));
  }

  function resetExam() {
    setAnswers({});
    setEssayText('');
    setRecordingUrl('');
    setResult(null);
    setShowReview(false);
    setCheckedQuestions([]);
    setVisibleAnswers({});
    setShowParagraph(false);
    setShowScript(false);
    setCurrentQuestionIndex(0);
    setActiveSpeakingImageListIndex(0);
    setTimeLeftSeconds(examDurationMinutes(exam) * 60);
  }

  function goToNextQuestion(index) {
    setShowParagraph(false);
    setShowScript(false);
    setCurrentQuestionIndex(Math.min(index + 1, (standardQuestions().length || 1) - 1));
  }

  function goToPreviousQuestion(index) {
    setShowParagraph(false);
    setShowScript(false);
    setCurrentQuestionIndex(Math.max(index - 1, 0));
  }

  function jumpToQuestion(index) {
    setShowParagraph(false);
    setShowScript(false);
    setCurrentQuestionIndex(index);
  }

  function isReadingPart23Question(q) {
    if (exam.type !== 'READING') return false;
    return q.optionF === 'PARAGRAPH_ORDER_TOPIC' || q.questionType === 'PARAGRAPH_ORDER' || q.questionType === 'PASSAGE_MATCH' || q.questionType === 'OPINION_MATCH';
  }

  function readingPartLabel(q) {
    if (q.optionF === 'PARAGRAPH_ORDER_TOPIC' || q.questionType === 'PARAGRAPH_ORDER') return 'Reading Part 2';
    return 'Reading Part 3';
  }

  function questionChipClass(q, index, activeIndex) {
    const active = index === activeIndex;
    const reviewed = isQuestionReviewed(q);
    const answered = Boolean(answers[q.id]);
    if (active) return 'border-blue-600 bg-blue-600 text-white shadow-sm';
    if (reviewed && isAnswerCorrect(q)) return 'border-green-500 bg-green-50 text-green-700';
    if (reviewed) return 'border-red-500 bg-red-50 text-red-700';
    if (answered) return 'border-teal-500 bg-teal-50 text-teal-700';
    return 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700';
  }

  function renderReadingQuestionSwitcher(activeQuestion, activeIndex) {
    if (!isReadingPart23Question(activeQuestion)) return null;
    const questions = standardQuestions();
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-wide text-blue-700">{readingPartLabel(activeQuestion)}</div>
            <div className="mt-1 text-sm font-semibold text-slate-600">Câu {activeIndex + 1}/{questions.length}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {questions.map((question, index) => (
              <button
                key={question.id}
                type="button"
                className={`min-h-10 rounded-md border px-3 text-sm font-black transition ${questionChipClass(question, index, activeIndex)}`}
                onClick={() => jumpToQuestion(index)}
              >
                Câu {index + 1}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button type="button" className="btn btn-muted stable-nav-btn justify-center shadow-none" disabled={activeIndex === 0} onClick={() => goToPreviousQuestion(activeIndex)}>
              <ChevronLeft size={17} />Truoc
            </button>
            <button type="button" className="btn btn-primary stable-nav-btn justify-center shadow-none" disabled={activeIndex >= questions.length - 1} onClick={() => goToNextQuestion(activeIndex)}>
              Sau<ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  function paragraphText() {
    return exam.prompt || exam.transcript || '';
  }

  function paragraphOptions(q) {
    const technicalMarkers = new Set([
      'PARAGRAPH_ORDER_TOPIC',
      'READING_DROPDOWN_PARAGRAPHS',
      'LISTENING_MATCHING',
      'LISTENING_OPINION',
      'LISTENING_GROUP_MC',
      'LISTENING_SINGLE_MC',
      'WRITING_PART1',
      'WRITING_LONG',
      'WRITING_CHAT',
      'WRITING_EMAIL',
      'SPEAKING_Q1_LIST',
      'SPEAKING_IMAGE_LIST',
      'SPEAKING_COMPARE_LIST',
      'GRAMMAR_TERM_MATCH',
      'GRAMMAR_SENTENCE_DROPDOWN'
    ]);
    const keys = ['A', 'B', 'C', 'D', 'E', 'F'];
    return keys
      .map((key) => ({ key, text: (q[`option${key}`] || '').trim() }))
      .filter((option) => option.text && !technicalMarkers.has(option.text));
  }

  function dropdownOptions(q) {
    return ['A', 'B', 'C', 'D', 'E', 'F'].filter((key) => q[`option${key}`]).map((key) => ({ key, text: q[`option${key}`] }));
  }

  function inlineDropdownOptions(q, index) {
    try {
      const parsed = JSON.parse(q.scriptText || '{}');
      const options = parsed.gapOptions?.[index]?.options;
      if (Array.isArray(options) && options.length > 0) {
        return options
          .map((option, optionIndex) => typeof option === 'string' ? { key: String.fromCharCode(65 + optionIndex), text: option } : option)
          .filter((option) => option?.text);
      }
    } catch {
      // Older inline dropdown câu hỏi store one shared option list in optionA-F.
    }
    return dropdownOptions(q);
  }

  function grammarSentenceDropdownData(q) {
    try {
      const parsed = JSON.parse(q.scriptText || '{}');
      return {
        instruction: q.content || '',
        rows: Array.isArray(parsed.rows) ? parsed.rows.filter((row) => row?.before || row?.after) : [],
        options: Array.isArray(parsed.options) ? parsed.options.filter(Boolean) : []
      };
    } catch {
      return { instruction: q.content || '', rows: [], options: [] };
    }
  }

  function grammarSentenceDropdownValue(q) {
    const current = answerParts(answers[q.id]);
    return grammarSentenceDropdownData(q).rows.map((_, index) => current[index] || '');
  }

  function setGrammarSentenceDropdownValue(q, index, value) {
    const next = grammarSentenceDropdownValue(q);
    next[index] = value;
    setAnswers({ ...answers, [q.id]: next.join('|||') });
  }

  function renderGrammarSentenceDropdown(q) {
    const data = grammarSentenceDropdownData(q);
    const values = grammarSentenceDropdownValue(q);
    return (
      <div className="rounded-lg bg-slate-50 p-4">
        {data.instruction && <p className="mb-5 font-black text-slate-950">{data.instruction}</p>}
        <div className="space-y-5">
          {data.rows.map((row, index) => (
            <div key={index} className={`flex flex-wrap items-center gap-3 rounded-md border p-3 text-base text-slate-950 ${subAnswerClass(q, index)}`}>
              <span>{row.before}</span>
              <select className="inline-select" value={values[index]} disabled={questionLocked(q)} onChange={(e) => setGrammarSentenceDropdownValue(q, index, e.target.value)}>
                <option value="">Chọn</option>
                {data.options.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
              {row.after && <span>{row.after}</span>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  function matchingValue(q) {
    const current = answers[q.id]?.split(',') || [];
    return [0, 1, 2, 3].map((index) => current[index] || '');
  }

  function setMatchingValue(q, index, value) {
    const next = matchingValue(q);
    next[index] = value;
    setAnswers({ ...answers, [q.id]: next.join(',') });
  }

  function grammarTermMatchData(q) {
    try {
      const parsed = JSON.parse(q.scriptText || '{}');
      return {
        instruction: q.content || 'Match each term with its synonym from the options list.',
        terms: Array.isArray(parsed.terms) ? parsed.terms.filter(Boolean) : [],
        options: Array.isArray(parsed.options) ? parsed.options.filter(Boolean) : [],
        operator: parsed.operator || '='
      };
    } catch {
      return { instruction: q.content || 'Match each term with its synonym from the options list.', terms: [], options: [], operator: '=' };
    }
  }

  function grammarTermMatchValue(q) {
    const current = answerParts(answers[q.id]);
    return grammarTermMatchData(q).terms.map((_, index) => current[index] || '');
  }

  function setGrammarTermMatchValue(q, index, value) {
    const next = grammarTermMatchValue(q);
    next[index] = value;
    setAnswers({ ...answers, [q.id]: next.join('|||') });
  }

  function renderGrammarTermMatch(q) {
    const data = grammarTermMatchData(q);
    const values = grammarTermMatchValue(q);
    return (
      <div className="rounded-lg bg-slate-50 p-4">
        <p className="font-black text-slate-950">{data.instruction}</p>
        <div className="mt-6 max-w-xl space-y-3">
          {data.terms.map((term, index) => (
            <div key={`${term}-${index}`} className={`grid min-w-0 grid-cols-[minmax(0,140px)_20px_minmax(0,1fr)] items-center gap-3 rounded-md border p-3 ${subAnswerClass(q, index)}`}>
              <span className="font-black text-slate-950">{term}</span>
              <span className="font-black">{data.operator}</span>
              <select className="input" value={values[index]} disabled={questionLocked(q)} onChange={(e) => setGrammarTermMatchValue(q, index, e.target.value)}>
                <option value="">Chọn đáp án</option>
                {data.options.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function parseReadingTopicItems(content) {
    const parts = (content || '').split(/\[ITEMS\]/i);
    const beforeItems = parts[0] || '';
    const afterItems = parts.slice(1).join('[ITEMS]');
    const beforeLines = beforeItems.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const topicIndex = beforeLines.findIndex((line) => /^topic:/i.test(line));
    const title = topicIndex > 0 ? beforeLines.slice(0, topicIndex).join(' ') : beforeLines[0]?.replace(/\s*topic:.*$/i, '').trim();
    const topicLine = topicIndex >= 0 ? beforeLines[topicIndex] : beforeLines.find((line) => /topic:/i.test(line));
    const topic = topicLine ? topicLine.replace(/^.*?topic:\s*/i, '').trim() : '';
    const instruction = topicIndex >= 0 ? beforeLines.slice(topicIndex + 1).join('\n').trim() : '';
    const rows = afterItems.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).slice(0, 7);
    return { title: title || 'Reading question', topic, instruction, rows };
  }

  function readingDropdownParagraphData(q) {
    const parsed = parseReadingTopicItems(q.content);
    const lines = (q.content || '').split(/\r?\n/);
    const options = (q.scriptText || '').split(/\r?\n/).map((line, index) => ({ key: line.trim() || String(index + 1), text: line.trim() })).filter((option) => option.text);
    return {
      title: parsed.title || lines[0]?.trim() || 'Reading question',
      topic: parsed.topic,
      instruction: parsed.instruction,
      rows: parsed.rows,
      options
    };
  }

  function readingDropdownValue(q) {
    const current = answers[q.id]?.split(',') || [];
    const count = readingDropdownParagraphData(q).rows.length;
    return Array.from({ length: count }, (_, index) => current[index] || '');
  }

  function setReadingDropdownValue(q, index, value) {
    const next = readingDropdownValue(q);
    next[index] = value;
    setAnswers({ ...answers, [q.id]: next.join(',') });
  }

  function listeningMatchingData(q) {
    const lines = (q.content || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const topicLine = lines.find((line) => /^topic:/i.test(line));
    let transcript = q.scriptText || '';
    let audioUrls = [];
    try {
      const parsed = JSON.parse(q.scriptText || '{}');
      transcript = parsed.transcript || '';
      audioUrls = Array.isArray(parsed.audioUrls) ? parsed.audioUrls : [];
    } catch {
      transcript = q.scriptText || '';
    }
    return {
      topic: topicLine ? topicLine.replace(/^topic:\s*/i, '') : '',
      instruction: lines.filter((line) => !/^topic:/i.test(line)).join(' '),
      transcript,
      audioUrls
    };
  }

  function renderListeningMatching(q) {
    const data = listeningMatchingData(q);
    return (
      <div className="space-y-4">
        {q.audioUrl && data.audioUrls.length === 0 && (
          <div className="rounded-md bg-red-600 px-4 py-3">
            <audio controls src={q.audioUrl} className="w-full accent-white" />
          </div>
        )}
        {data.transcript && (
          <button type="button" className="btn btn-muted stable-nav-btn" onClick={() => setShowScript((value) => !value)}>
            {showScript ? 'Hide script' : 'Show script'}
          </button>
        )}
        {showScript && data.transcript && <div className="panel whitespace-pre-wrap">{data.transcript}</div>}
        <div className="rounded-md bg-slate-100 p-5">
          <h3 className="text-lg font-black text-slate-950">Topic: {data.topic}</h3>
          <p className="mt-5 text-sm leading-7 text-slate-950">{data.instruction}</p>
          <div className="mt-5 space-y-3">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className={`grid gap-3 rounded-md border p-3 md:grid-cols-[110px_minmax(0,1fr)] md:items-center ${subAnswerClass(q, index)}`}>
                <span className="text-sm font-semibold text-slate-950">Person {index + 1}</span>
                <div className="space-y-2">
                  {data.audioUrls[index] && <audio controls src={data.audioUrls[index]} className="w-full" />}
                  <select className="input" value={matchingValue(q)[index]} disabled={questionLocked(q)} onChange={(e) => setMatchingValue(q, index, e.target.value)}>
                    <option value="">-- Chọn đáp án --</option>
                    {dropdownOptions(q).map((option) => (
                      <option key={option.key} value={option.key}>{option.text}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderReadingDropdownParagraphs(q) {
    const data = readingDropdownParagraphData(q);
    const values = readingDropdownValue(q);
    return (
      <div className="space-y-4">
        <h2 className="text-3xl font-black text-slate-950">{data.title}</h2>
        {data.topic && <h3 className="text-2xl font-black text-red-600">TOPIC: {data.topic}</h3>}
        <div className="flex flex-wrap gap-2">
          {data.rows.length > 0 && <button type="button" className="rounded-md bg-slate-600 px-3 py-2 text-sm font-semibold text-white" onClick={() => setShowParagraph((value) => !value)}>{showParagraph ? 'An noi dung' : 'Xem noi dung'}</button>}
          {q.explanation && <button type="button" className="rounded-md bg-slate-600 px-3 py-2 text-sm font-semibold text-white" onClick={() => setShowScript((value) => !value)}>Xem meo</button>}
        </div>
        {showScript && q.explanation && <div className="rounded-md border border-amber-100 bg-amber-50 p-3 whitespace-pre-wrap">{q.explanation}</div>}
        <div className="space-y-4">
          {data.rows.map((row, index) => (
            <div key={index} className={`space-y-2 rounded-md border p-3 ${subAnswerClass(q, index)}`}>
              <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2">
                <span>{index + 1}.</span>
                <select className="input" value={values[index]} disabled={questionLocked(q)} onChange={(e) => setReadingDropdownValue(q, index, e.target.value)}>
                  <option value=""></option>
                  {data.options.map((option) => <option key={option.key} value={option.key}>{option.text}</option>)}
                </select>
              </div>
              {showParagraph && <p className="leading-7 text-slate-950">{row}</p>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  function opinionStatements(q) {
    return ['A', 'B', 'C', 'D'].filter((key) => q[`option${key}`]).map((key) => q[`option${key}`]);
  }

  function opinionValue(q) {
    const current = answers[q.id]?.split(',') || [];
    return [0, 1, 2, 3].map((index) => current[index] || '');
  }

  function setOpinionValue(q, index, value) {
    const next = opinionValue(q);
    next[index] = value;
    setAnswers({ ...answers, [q.id]: next.join(',') });
  }

  function listeningOpinionData(q) {
    const lines = (q.content || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const topicLine = lines.find((line) => /^topic:/i.test(line));
    return {
      topic: topicLine ? topicLine.replace(/^topic:\s*/i, '') : '',
      instruction: lines.filter((line) => !/^topic:/i.test(line)).join(' ')
    };
  }

  function renderListeningOpinion(q) {
    const data = listeningOpinionData(q);
    return (
      <div className="space-y-4">
        {q.audioUrl && (
          <div className="rounded-md bg-red-600 px-4 py-3">
            <audio controls src={q.audioUrl} className="w-full accent-white" />
          </div>
        )}
        <div className="rounded-md bg-slate-100 p-5">
          <h3 className="text-lg font-black text-slate-950">Topic: {data.topic}</h3>
          <p className="mt-5 text-sm leading-7 text-slate-950">{data.instruction}</p>
          <div className="mt-5 space-y-4">
            {opinionStatements(q).map((statement, index) => (
              <div key={index} className={`grid gap-3 rounded-md border p-3 md:grid-cols-[minmax(0,1fr)_210px] md:items-center ${subAnswerClass(q, index)}`}>
                <span className="text-sm text-slate-950">{index + 1}. {statement}</span>
                <select className="input" value={opinionValue(q)[index]} disabled={questionLocked(q)} onChange={(e) => setOpinionValue(q, index, e.target.value)}>
                  <option value="">-- Chọn đáp án --</option>
                  <option value="MAN">Man</option>
                  <option value="WOMAN">Woman</option>
                  <option value="BOTH">Both</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderInlineDropdown(q) {
    const lines = (q.content || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const questionStart = lines.findIndex((line) => line === '[QUESTIONS]');
    const promptLines = questionStart >= 0 ? lines.slice(0, questionStart) : [];
    const gapLines = questionStart >= 0 ? lines.slice(questionStart + 1) : lines.filter((line) => line.includes('[[blank]]'));
    if (gapLines.length > 1) {
      const values = (answers[q.id] || '').split(',');
      const setValue = (index, value) => {
        const next = [...values];
        next[index] = value;
        setAnswers({ ...answers, [q.id]: next.join(',') });
      };
      return (
        <div className="space-y-4">
          {promptLines.map((line, index) => <p key={index} className="text-base leading-7 text-slate-950">{line}</p>)}
          <div className="space-y-4">
            {gapLines.map((line, index) => {
              const parts = line.split('[[blank]]');
              const options = inlineDropdownOptions(q, index);
              const selectedKey = values[index] || '';
              const correctKey = answerParts(q.correctAnswer)[index] || '';
              const selectTone = isQuestionReviewed(q)
                ? normalizeAnswer(selectedKey) === normalizeAnswer(correctKey)
                  ? 'border-green-300 bg-green-50 text-green-700'
                  : 'border-red-300 bg-red-50 text-red-700'
                : '';
              return (
                <div key={index} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-center gap-4 text-base text-slate-950">
                    <span>{parts[0]}</span>
                    <select className={`inline-select ${selectTone}`} value={selectedKey} disabled={questionLocked(q)} onChange={(e) => setValue(index, e.target.value)}>
                      <option value="">-- Chọn --</option>
                      {options.map((option) => (
                        <option key={option.key} value={option.key}>{option.text}</option>
                      ))}
                    </select>
                    <span>{parts.slice(1).join('')}</span>
                  </div>
                  {inlineDropdownFeedback(q, index, parts, options)}
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    const parts = q.content.split('[[blank]]');
    const options = inlineDropdownOptions(q, 0);
    const selectedKey = answers[q.id] || '';
    const correctKey = answerParts(q.correctAnswer)[0] || '';
    const selectTone = isQuestionReviewed(q)
      ? normalizeAnswer(selectedKey) === normalizeAnswer(correctKey)
        ? 'border-green-300 bg-green-50 text-green-700'
        : 'border-red-300 bg-red-50 text-red-700'
      : '';
    return (
      <div className="rounded-md border border-slate-200 bg-white p-4 text-lg">
        <div className="flex flex-wrap items-center gap-2">
          <span>{parts[0]}</span>
          <select className={`inline-select ${selectTone}`} value={selectedKey} disabled={questionLocked(q)} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}>
            <option value="">-- Chọn --</option>
            {options.map((option) => (
              <option key={option.key} value={option.key}>{option.text}</option>
            ))}
          </select>
          <span>{parts.slice(1).join('')}</span>
        </div>
        {inlineDropdownFeedback(q, 0, parts, options)}
      </div>
    );
  }

  function parsePassageMatch(q) {
    const lines = (q.content || '').split(/\r?\n/);
    const passages = [];
    const questions = [];
    let topic = '';
    let section = '';
    let currentPassage = null;

    lines.forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line) return;
      if (/^topic:/i.test(line)) {
        topic = line.replace(/^topic:\s*/i, '');
        return;
      }
      if (/^\[passages\]/i.test(line)) {
        section = 'passages';
        currentPassage = null;
        return;
      }
      if (/^\[questions\]/i.test(line)) {
        section = 'questions';
        currentPassage = null;
        return;
      }
      if (section === 'passages') {
        const match = line.match(/^([A-F])\s*:\s*(.*)$/i);
        if (match) {
          currentPassage = { key: match[1].toUpperCase(), text: match[2] };
          passages.push(currentPassage);
        } else if (currentPassage) {
          currentPassage.text = `${currentPassage.text} ${line}`.trim();
        }
        return;
      }
      if (section === 'questions') questions.push(line.replace(/^\d+[\).]\s*/, ''));
    });

    return { topic, passages, questions };
  }

  function passageMatchValue(q) {
    const { questions } = parsePassageMatch(q);
    const current = answers[q.id]?.split(',') || [];
    return questions.map((_, index) => current[index] || '');
  }

  function setPassageMatchValue(q, index, value) {
    const next = passageMatchValue(q);
    next[index] = value;
    setAnswers({ ...answers, [q.id]: next.join(',') });
  }

  function renderPassageMatch(q) {
    const data = parsePassageMatch(q);
    const values = passageMatchValue(q);
    return (
      <div className="rounded-lg bg-slate-50 p-4">
        {data.topic && <h3 className="mb-4 text-2xl font-black text-red-600">Topic: {data.topic}</h3>}
        <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <div className="space-y-4">
            <p className="font-bold">Here is the perspective of four people on the topic. Read the content and answer the questions.</p>
            {data.passages.map((passage) => (
              <p key={passage.key} className="text-slate-900 leading-relaxed"><b>{passage.key}:</b> {passage.text}</p>
            ))}
          </div>
          <div className="space-y-4">
            <p className="font-bold">Read the opinions and choose A, B, C, or D.</p>
            {data.questions.map((question, index) => (
              <div key={index} className={`grid min-w-0 gap-2 rounded-md border p-3 md:grid-cols-[minmax(0,1fr)_130px] md:items-center ${subAnswerClass(q, index)}`}>
                <span>{question}</span>
                <select className="input" value={values[index]} disabled={questionLocked(q)} onChange={(e) => setPassageMatchValue(q, index, e.target.value)}>
                  <option value="">--</option>
                  {data.passages.map((passage) => <option key={passage.key} value={passage.key}>{passage.key}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function orderValue(q) {
    const current = answers[q.id]?.split(',').filter(Boolean);
    return current?.length ? current : paragraphOptions(q).map((item) => item.key);
  }

  function paragraphOrderHeader(q) {
    const lines = (q.content || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const topicLine = lines.find((line) => /^topic:/i.test(line));
    return {
      topic: topicLine ? topicLine.replace(/^topic:\s*/i, '') : '',
      instruction: lines.filter((line) => !/^topic:/i.test(line)).join(' ')
    };
  }

  function paragraphOrderCorrectKeys(q) {
    const keys = answerParts(q.correctAnswer).filter(Boolean);
    return keys.length ? keys : paragraphOptions(q).map((item) => item.key);
  }

  function questionHeading(q) {
    if (q.optionF === 'READING_DROPDOWN_PARAGRAPHS') return readingDropdownParagraphData(q).title;
    if (q.optionF === 'LISTENING_MATCHING') return 'Listen and match each person.';
    if (q.optionF === 'GRAMMAR_TERM_MATCH') return 'Match each business term with its synonym.';
    if (q.optionF === 'GRAMMAR_SENTENCE_DROPDOWN') return 'Choose the correct word.';
    if (q.optionF === 'LISTENING_OPINION') return 'Listen and choose whose opinion matches.';
    if (q.optionF === 'LISTENING_GROUP_MC' || q.optionF === 'LISTENING_SINGLE_MC') return 'Listen and choose the correct answer.';
    if (q.questionType === 'INLINE_DROPDOWN') return 'Choose the correct word.';
    if (q.questionType === 'PASSAGE_MATCH') return 'Read the passage and match each question.';
    if (q.questionType === 'PARAGRAPH_ORDER') return 'Arrange the sentences in the correct order.';
    return q.content;
  }

  function hasOwnQuestionHeading(q) {
    return isWritingQuestion(q) || isSpeakingPrompt(q) || isSpeakingQ1ListQuestion(q) || isSpeakingImageListQuestion(q) || isSpeakingPart4Question(q);
  }

  function hasOwnAudioLayout(q) {
    return ['LISTENING_GROUP_MC', 'LISTENING_SINGLE_MC', 'LISTENING_MATCHING', 'LISTENING_OPINION'].includes(q.optionF);
  }

  function paragraphOrderCard(q, key, index, tone = 'neutral', dragProps = {}) {
    const tones = {
      neutral: 'border-slate-200 bg-white text-slate-950',
      correct: 'border-green-500 bg-green-50 text-slate-950',
      wrong: 'border-red-500 bg-red-50 text-slate-950'
    };
    const { draggable = false, dragging = false, dropTarget = false, ...handlers } = dragProps;
    return (
      <div
        key={`${key}-${index}`}
        draggable={draggable}
        className={`flex items-start gap-3 rounded-md border p-4 text-base transition ${draggable ? 'cursor-grab active:cursor-grabbing' : ''} ${dragging ? 'opacity-50 ring-2 ring-blue-300' : ''} ${dropTarget ? 'border-blue-500 bg-blue-50' : tones[tone] || tones.neutral}`}
        {...handlers}
      >
        <GripVertical size={18} className={`mt-1 shrink-0 ${draggable ? 'text-blue-500' : 'text-slate-400'}`} />
        <span className="min-w-0 flex-1">{q[`option${key}`]}</span>
        {tone === 'correct' && <CheckCircle2 size={18} className="mt-1 shrink-0 text-green-600" />}
        {tone === 'wrong' && <XCircle size={18} className="mt-1 shrink-0 text-red-600" />}
      </div>
    );
  }

  function renderParagraphOrder(q) {
    const selectedOrder = orderValue(q);
    const correctOrder = paragraphOrderCorrectKeys(q);
    const reviewed = isQuestionReviewed(q);
    const locked = questionLocked(q);
    return (
      <div className={reviewed ? 'grid gap-6 lg:grid-cols-2' : 'space-y-2'}>
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <h3 className="mb-4 text-xl font-black text-slate-950">{reviewed ? 'Thứ tự của bạn' : 'Sắp xếp câu'}</h3>
          <div className="space-y-3">
            {selectedOrder.map((key, orderIndex) => {
              const tone = !reviewed ? 'neutral' : key === correctOrder[orderIndex] ? 'correct' : 'wrong';
              const dragging = draggingParagraphOrder?.questionId === q.id && draggingParagraphOrder?.index === orderIndex;
              const dropTarget = draggingParagraphOrder?.questionId === q.id && draggingParagraphOrder?.overIndex === orderIndex && draggingParagraphOrder?.index !== orderIndex;
              return (
                <div key={key} className="select-none">
                  {paragraphOrderCard(q, key, orderIndex, tone, {
                    draggable: !locked && !reviewed,
                    dragging,
                    dropTarget,
                    onDragStart: (event) => startParagraphOrderDrag(event, q, orderIndex),
                    onDragOver: (event) => overParagraphOrderDrag(event, q, orderIndex),
                    onDragLeave: () => leaveParagraphOrderDrag(q, orderIndex),
                    onDrop: (event) => dropParagraphOrder(event, q, orderIndex),
                    onDragEnd: endParagraphOrderDrag
                  })}
                  {!locked && !reviewed && (
                    <div className="mt-1 text-xs font-semibold text-slate-400">Keo tha de doi vi tri</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {reviewed && (
          <div className="rounded-md border border-slate-200 bg-white p-4">
            <h3 className="mb-4 text-xl font-black text-slate-950">Thứ tự đúng</h3>
            <div className="space-y-3">
              {correctOrder.map((key, index) => paragraphOrderCard(q, key, index, 'correct'))}
            </div>
          </div>
        )}
      </div>
    );
  }

  function startParagraphOrderDrag(event, q, index) {
    setDraggingParagraphOrder({ questionId: q.id, index, overIndex: index });
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(index));
  }

  function overParagraphOrderDrag(event, q, overIndex) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDraggingParagraphOrder((current) => {
      if (!current || current.questionId !== q.id || current.overIndex === overIndex) return current;
      return { ...current, overIndex };
    });
  }

  function leaveParagraphOrderDrag(q, overIndex) {
    setDraggingParagraphOrder((current) => {
      if (!current || current.questionId !== q.id || current.overIndex !== overIndex) return current;
      return { ...current, overIndex: current.index };
    });
  }

  function dropParagraphOrder(event, q, targetIndex) {
    event.preventDefault();
    const sourceIndex = draggingParagraphOrder?.questionId === q.id
      ? draggingParagraphOrder.index
      : Number(event.dataTransfer.getData('text/plain'));
    reorderParagraphOrder(q, sourceIndex, targetIndex);
    setDraggingParagraphOrder(null);
  }

  function endParagraphOrderDrag() {
    setDraggingParagraphOrder(null);
  }

  function reorderParagraphOrder(q, sourceIndex, targetIndex) {
    const next = [...orderValue(q)];
    if (sourceIndex === targetIndex || sourceIndex < 0 || targetIndex < 0 || sourceIndex >= next.length || targetIndex >= next.length) return;
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    setAnswers({ ...answers, [q.id]: next.join(',') });
  }

  return (
    <div className="exam-runner-page space-y-4 pb-44 md:pb-28">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div><h1 className="text-2xl font-black leading-tight sm:text-3xl">{exam.title}</h1><p className="text-slate-500">{exam.type} - {examDurationMinutes(exam)} phút</p></div>
        <div className="flex flex-col gap-2 sm:items-end">
          <div className={`rounded-md border px-4 py-2 text-lg font-black ${timeLeftSeconds <= 60 && !showReview ? 'border-red-200 bg-red-50 text-red-700' : 'border-blue-100 bg-blue-50 text-blue-700'}`}>
            Thời gian: {formatTime(timeLeftSeconds)}
          </div>
          {showReview && (
            <button type="button" className="btn btn-muted w-fit" onClick={resetExam}>
              <RotateCcw size={16} />Làm lại đề
            </button>
          )}
        </div>
      </div>
      {exam.audioUrl && <audio controls src={exam.audioUrl} className="w-full" />}
      {isSpeakingImageTable() && (
        <section className="space-y-8">
          {speakingImageGroups().slice(activeSpeakingGroupIndex, activeSpeakingGroupIndex + 1).map((group) => {
            const groupIndex = activeSpeakingGroupIndex;
            const activeQuestion = activeSpeakingQuestion(group, groupIndex);
            const activeIndex = activeSpeakingIndex(groupIndex);
            const groupCount = speakingImageGroups().length;
            const theme = group.compare
              ? {
                  card: 'border-orange-200 bg-orange-50',
                  circle: 'bg-orange-500',
                  imageBorder: 'border-orange-100 bg-orange-50',
                  activeTab: 'border-orange-500 bg-orange-500 text-white',
                  answerBorder: 'border-orange-300',
                  icon: 'text-orange-600',
                  next: 'bg-orange-500 hover:bg-orange-600',
                  divider: 'border-orange-100'
                }
              : {
                  card: 'border-emerald-100 bg-emerald-50',
                  circle: 'bg-emerald-500',
                  imageBorder: 'border-emerald-100 bg-emerald-50',
                  activeTab: 'border-emerald-500 bg-emerald-500 text-white',
                  answerBorder: 'border-emerald-300',
                  icon: 'text-emerald-600',
                  next: 'bg-emerald-500 hover:bg-emerald-600',
                  divider: 'border-emerald-100'
                };
            return (
              <div key={group.imageUrl || group.questions[0]?.id} className={`overflow-hidden rounded-lg border shadow-sm ${theme.card}`}>
                <div className="flex items-center gap-3 px-5 py-4">
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-lg font-black text-white ${theme.circle}`}>{groupIndex + 1}</span>
                  <h2 className="text-lg font-black text-slate-950">{group.compare ? 'Compare & Provide Reasons' : exam.title}</h2>
                </div>

                {(group.imageUrl || group.imageUrl2) && (
                  <div className="mx-5 grid gap-4 md:grid-cols-2">
                    {group.imageUrl && (
                      <div className={`relative overflow-hidden rounded-lg border shadow-md ${theme.imageBorder}`}>
                        {group.compare && <span className="absolute left-3 top-3 rounded-md bg-slate-900 px-2 py-1 text-xs font-black text-white">Hinh 1</span>}
                        <img className="mx-auto aspect-[4/2.65] w-full object-cover" src={group.imageUrl} alt="Hinh 1" />
                      </div>
                    )}
                    {group.imageUrl2 && (
                      <div className={`relative overflow-hidden rounded-lg border shadow-md ${theme.imageBorder}`}>
                        {group.compare && <span className="absolute left-3 top-3 rounded-md bg-slate-900 px-2 py-1 text-xs font-black text-white">Hinh 2</span>}
                        <img className="mx-auto aspect-[4/2.65] w-full object-cover" src={group.imageUrl2} alt="Hinh 2" />
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-wrap gap-2">
                    {group.questions.map((q, questionIndex) => (
                      <button
                        key={q.id}
                        type="button"
                        className={`rounded-md border px-4 py-2 font-bold ${activeQuestion?.id === q.id ? theme.activeTab : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'}`}
                        onClick={() => setActiveSpeakingTabs((tabs) => ({ ...tabs, [groupIndex]: questionIndex }))}
                      >
                        Câu {questionIndex + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {activeQuestion && (
                  <div className="px-5 pb-5">
                    <div className="rounded-lg bg-white px-4 py-4 text-base font-black text-slate-950 shadow-sm">
                      <div className="whitespace-pre-wrap break-words">{activeQuestion.content}</div>
                    </div>
                  </div>
                )}

                {activeQuestion && (
                  <div className={`border-t bg-white/60 px-5 py-5 ${theme.divider}`}>
                    <button
                      type="button"
                      className={`flex w-full items-center justify-between rounded-md border bg-white px-4 py-3 font-bold text-slate-950 ${theme.answerBorder}`}
                      onClick={() => toggleSampleAnswer(activeQuestion)}
                    >
                      <span className="flex items-center gap-2"><Volume2 size={18} className={theme.icon} />Xem đáp án mẫu</span>
                      <ChevronDown size={18} className={`${theme.icon} transition`} />
                    </button>
                    <div className="mt-4 rounded-md border border-slate-200 bg-white/70 px-4 py-4 text-center text-sm text-slate-500">
                      Nhấn nút <b className={theme.icon}>Ghi âm</b> để bắt đầu thu giọng của bạn (khoảng 30-45 giây)
                    </div>
                    <div className="question-action-bar md:left-[260px]">
                      <div className="question-action-grid question-action-grid--five">
                        <button type="button" className="btn btn-muted question-action-btn" disabled={groupIndex === 0} onClick={() => setActiveSpeakingGroupIndex((index) => Math.max(index - 1, 0))}>Back</button>
                        <button type="button" className="btn btn-muted question-action-btn"><Flag size={16} />Báo lỗi</button>
                        <button type="button" className={`btn question-action-btn text-white ${theme.next}`}><Mic size={17} />Ghi âm</button>
                        <button type="button" className={`btn question-action-btn text-white ${theme.next}`} disabled={groupIndex >= groupCount - 1} onClick={() => setActiveSpeakingGroupIndex((index) => Math.min(index + 1, groupCount - 1))}>Next</button>
                        <button type="button" className="btn btn-primary question-action-btn" disabled={submitting} onClick={submit}>
                          <CheckCircle2 size={16} />{submitting ? 'Đang nộp...' : 'Nộp bài'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}
      {exam.type !== 'MIXED' && renderSpeakingQ1List()}
      {exam.type !== 'MIXED' && renderSpeakingImageList()}
      {exam.type !== 'MIXED' && renderSpeakingPart4List()}
      {exam.type === 'WRITING' && renderWritingForm()}
      {exam.type !== 'WRITING' && standardQuestions().map((q, i) => {
        if (i !== currentQuestionIndex) return null;
        return (
        <div className="space-y-3" key={q.id} ref={(node) => { questionRefs.current[i] = node; }}>
          {renderReadingQuestionSwitcher(q, i)}
          <div className="rounded-lg bg-slate-100 p-4 sm:p-6">
          <div className={`${hasOwnQuestionHeading(q) ? 'mb-3' : 'mb-5'} flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between`}>
            {!hasOwnQuestionHeading(q) && <div className="min-w-0 font-bold">{i + 1}. {questionHeading(q)}</div>}
            {isQuestionReviewed(q) && (
              <span className={`inline-flex items-center gap-1 text-sm font-bold ${reviewState(q) ? 'text-green-700' : 'text-red-700'}`}>
                {reviewState(q) ? <CheckCircle2 size={17} /> : <XCircle size={17} />}
                {reviewState(q) ? 'Correct' : 'Review'}
              </span>
            )}
          </div>
          {q.audioUrl && !hasOwnAudioLayout(q) && <audio controls src={q.audioUrl} className="mb-3 w-full" />}
          {isSpeakingQ1ListQuestion(q) ? (
            renderMixedSpeakingQ1ListQuestion(q)
          ) : isSpeakingImageListQuestion(q) ? (
            renderMixedSpeakingImageListQuestion(q)
          ) : isSpeakingPart4Question(q) ? (
            renderMixedSpeakingPart4Question(q)
          ) : isWritingQuestion(q) ? (
            renderMixedWritingQuestion(q, i)
          ) : isSpeakingPrompt(q) ? (
            <div className="space-y-3 rounded-lg bg-white p-4">
              <div className="text-sm font-semibold text-slate-500">Câu hỏi speaking</div>
              <p className="text-lg font-bold leading-7 text-slate-900">{q.content}</p>
              <button type="button" className="btn btn-primary w-full sm:w-auto" onClick={() => toggleSampleAnswer(q)}>
                Hiện đáp án
              </button>
            </div>
          ) : q.optionF === 'LISTENING_SINGLE_MC' ? (
            renderListeningSingleMc(q)
          ) : q.optionF === 'LISTENING_GROUP_MC' ? (
            renderListeningGroupMc(q)
          ) : q.questionType === 'PASSAGE_MATCH' ? (
            renderPassageMatch(q)
          ) : q.questionType === 'INLINE_DROPDOWN' ? (
            q.optionF === 'GRAMMAR_SENTENCE_DROPDOWN' ? renderGrammarSentenceDropdown(q) : <div className="rounded-lg bg-slate-50 p-4">{renderInlineDropdown(q)}</div>
          ) : q.questionType === 'OPINION_MATCH' ? (
            q.optionF === 'LISTENING_OPINION' ? renderListeningOpinion(q) : (
            <div className="space-y-3 rounded-lg bg-slate-50 p-4">
              {opinionStatements(q).map((statement, index) => (
                <div key={index} className={`grid min-w-0 gap-2 rounded-md border p-3 md:grid-cols-[minmax(0,1fr)_220px] md:items-center ${subAnswerClass(q, index)}`}>
                  <div><b>{index + 1}.</b> {statement}</div>
                  <select className="input" value={opinionValue(q)[index]} disabled={questionLocked(q)} onChange={(e) => setOpinionValue(q, index, e.target.value)}>
                    <option value="">-- Chọn đáp án --</option>
                    <option value="MAN">Man</option>
                    <option value="WOMAN">Woman</option>
                    <option value="BOTH">Both</option>
                  </select>
                </div>
              ))}
            </div>
            )
          ) : q.questionType === 'MATCHING_DROPDOWN' ? (
            q.optionF === 'LISTENING_MATCHING' ? renderListeningMatching(q) : q.optionF === 'READING_DROPDOWN_PARAGRAPHS' ? renderReadingDropdownParagraphs(q) : q.optionF === 'GRAMMAR_TERM_MATCH' ? renderGrammarTermMatch(q) : (
            <div className="space-y-3 rounded-lg bg-slate-50 p-4">
              {[0, 1, 2, 3].map((index) => {
                const selected = matchingValue(q)[index];
                return (
                  <div key={index} className={`grid min-w-0 gap-2 rounded-md border p-3 md:grid-cols-[100px_minmax(0,1fr)] md:items-center ${subAnswerClass(q, index)}`}>
                    <div className="font-semibold">Person {index + 1}</div>
                    <select className="input" value={selected} disabled={questionLocked(q)} onChange={(e) => setMatchingValue(q, index, e.target.value)}>
                      <option value="">-- Chọn đáp án --</option>
                      {dropdownOptions(q).map((option) => (
                        <option key={option.key} value={option.key}>{option.text}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
            )
          ) : q.questionType === 'PARAGRAPH_ORDER' ? (
            <div className="space-y-2">
              {q.optionF === 'PARAGRAPH_ORDER_TOPIC' && (() => {
                const header = paragraphOrderHeader(q);
                return (
                  <div className="mb-5 space-y-4">
                    {header.topic && <h3 className="text-2xl font-black text-red-600">Topic: {header.topic}</h3>}
                    {header.instruction && <p className="font-semibold text-slate-950">{header.instruction}</p>}
                  </div>
                );
              })()}
              {renderParagraphOrder(q)}
            </div>
          ) : ['A', 'B', 'C', 'D'].map((k) => q[`option${k}`] && (
            <label key={k} className={`mb-3 flex min-w-0 items-start gap-3 text-base transition ${optionClass(q, k)}`}>
              <input
                type="radio"
                name={q.id}
                checked={answers[q.id] === k}
                disabled={questionLocked(q)}
                onChange={() => setAnswers({ ...answers, [q.id]: k })}
              />
              <span className="min-w-0 flex-1">{q[`option${k}`]}</span>
              {isQuestionReviewed(q) && normalizeAnswer(q.correctAnswer) === k && <span className="ml-auto text-xs font-bold text-green-700">Correct answer</span>}
              {isQuestionReviewed(q) && answers[q.id] === k && normalizeAnswer(q.correctAnswer) !== k && <span className="ml-auto text-xs font-bold text-red-700">Your answer</span>}
            </label>
          ))}
          </div>
          {!isListeningQuestion(q) && paragraphText() && (
            <button className="btn btn-primary stable-nav-btn" onClick={() => setShowParagraph((value) => !value)}>
              {showParagraph ? 'Hide paragraph' : 'Show paragraph'}
            </button>
          )}
          {!isListeningQuestion(q) && showParagraph && paragraphText() && <div className="panel whitespace-pre-wrap">{paragraphText()}</div>}
          {isListeningQuestion(q) && !hasOwnAudioLayout(q) && q.scriptText && (
            <button className="btn btn-muted stable-nav-btn" onClick={() => setShowScript((value) => !value)}>
              {showScript ? 'Hide script' : 'Show script'}
            </button>
          )}
          {showScript && !hasOwnAudioLayout(q) && q.scriptText && <div className="panel whitespace-pre-wrap">{q.scriptText}</div>}
          {isQuestionReviewed(q) && (
            <div className="mt-3 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-950">
              <b>Answer: {q.correctAnswer || 'No answer'}.</b>
              {q.questionType === 'PARAGRAPH_ORDER' && answers[q.id] && <span> Your order: {answers[q.id]}.</span>}
              {q.questionType === 'MATCHING_DROPDOWN' && answers[q.id] && <span> Your answers: {answers[q.id]}.</span>}
              {q.questionType === 'OPINION_MATCH' && answers[q.id] && <span> Your answers: {answers[q.id]}.</span>}
              {q.questionType === 'INLINE_DROPDOWN' && answers[q.id] && <span> Your answer: {answers[q.id]}.</span>}
              {q.questionType === 'PASSAGE_MATCH' && answers[q.id] && <span> Your answers: {answers[q.id]}.</span>}
              {q.explanation && <span> {q.explanation}</span>}
              {!answers[q.id] && <div className="mt-1 font-semibold text-amber-700">You did not answer this question.</div>}
            </div>
          )}
          {!showReview && (
            <div className="question-action-bar md:left-[260px]">
              <div className="question-action-grid question-action-grid--five">
                <button className="btn btn-muted question-action-btn" disabled={i === 0} onClick={() => goToPreviousQuestion(i)}>Quay lại</button>
                <button className="btn btn-muted question-action-btn" disabled={!answers[q.id] && !isQuestionReviewed(q)} onClick={() => resetQuestion(q)}>
                  <RotateCcw size={16} />Làm lại câu
                </button>
                {isSpeakingPrompt(q) || isSpeakingQ1ListQuestion(q) || isSpeakingImageListQuestion(q) || isSpeakingPart4Question(q) ? (
                  <button className="btn btn-primary question-action-btn" onClick={() => toggleSampleAnswer(q)}>
                    Hiện đáp án
                  </button>
                ) : (
                  <button className="btn btn-primary question-action-btn" disabled={questionLocked(q) || !hasAnswer(q)} onClick={() => checkQuestion(q)}>Check answer</button>
                )}
                <button className="btn btn-muted question-action-btn" disabled={i >= standardQuestions().length - 1} onClick={() => goToNextQuestion(i)}>Next question</button>
                <button type="button" className="btn btn-primary question-action-btn" disabled={submitting} onClick={submit}>
                  <CheckCircle2 size={16} />{submitting ? 'Đang nộp...' : 'Nộp bài'}
                </button>
              </div>
            </div>
          )}
        </div>
        );
      })}
      {exam.type === 'SPEAKING' && !isSpeakingImageTable() && exam.questions?.some((q) => !isSpeakingPrompt(q) && !isSpeakingImageQuestion(q) && !isSpeakingCompareQuestion(q) && !isSpeakingPart4Question(q)) && <input className="input" placeholder="URL bản ghi sau khi tải lên" value={recordingUrl} onChange={(e) => setRecordingUrl(e.target.value)} />}
      {renderAnswerPrompt()}
      {result && (
        <div className="panel border-l-4 border-l-teal-500">
          <b>Score: {Math.round(result.score)}/50{result.cefrLevel ? ` - CEFR ${result.cefrLevel}` : ''}</b>
          <p>Correct: {result.totalCorrect}/{result.totalQuestions}</p>
          {result.aiFeedback && <pre className="whitespace-pre-wrap text-sm">{result.aiFeedback}</pre>}
        </div>
      )}
      {false && !showReview && (
        <div className="exam-submit-bar fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur md:left-[260px]">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-600">Hết giờ hệ thống sẽ tự nộp bài.</div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className={`rounded-md px-3 py-2 text-center text-sm font-black ${timeLeftSeconds <= 60 ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                {formatTime(timeLeftSeconds)}
              </div>
              <button type="button" className="btn btn-primary w-full sm:w-auto" disabled={submitting} onClick={submit}>
                <CheckCircle2 size={16} />{submitting ? 'Đang nộp...' : 'Nộp bài'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
