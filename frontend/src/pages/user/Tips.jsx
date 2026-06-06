import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, CheckCircle2, ClipboardCheck, Headphones, Lightbulb, Mic, PenLine, Puzzle } from 'lucide-react';

const skills = [
  {
    id: 'reading',
    label: 'Reading',
    title: 'Mẹo học Reading',
    subtitle: 'Chia theo từng part để bạn biết phần nào cần học thuộc, phần nào học theo mẹo.',
    icon: BookOpen,
    accent: 'text-teal-700 bg-teal-50 border-teal-200',
    active: 'bg-teal-700 text-white border-teal-700',
    blocks: [
      {
        badge: 'Part 1',
        heading: 'Câu hỏi đầu tiên',
        text: 'Part này bạn chỉ cần học hết các câu hỏi sau là được.',
        actions: [{ label: 'Học câu 1', to: '/reading', tone: 'primary', icon: BookOpen }]
      },
      {
        badge: 'Part 2 & 3',
        heading: 'Câu hỏi thứ hai và thứ ba',
        text: 'Part này bạn cũng cần phải học đầy đủ các câu hỏi sau.',
        actions: [{ label: 'Học câu 2 & 3', to: '/reading', tone: 'cyan', icon: Puzzle }]
      },
      {
        badge: 'Part 4',
        heading: 'Câu hỏi thứ tư',
        text: 'Part này cũng phải học thôi, học cũng không khó đâu vì số lượng câu hỏi ít.',
        actions: [{ label: 'Học câu 4', to: '/reading', tone: 'amber', icon: ClipboardCheck }]
      },
      {
        badge: 'Part 5',
        heading: 'Câu hỏi thứ năm',
        text: 'Part này bạn có thể học theo key, học theo thơ hoặc theo đoạn văn. Bạn chỉ cần học keyword là được nhé, mỗi bài có một mẹo nhỏ riêng nên bạn chỉ cần học mẹo đó là ok.',
        actions: [{ label: 'Mẹo học nhanh', to: '/reading', tone: 'green', icon: Lightbulb }]
      }
    ]
  },
  {
    id: 'listening',
    label: 'Listening',
    title: 'Mẹo học Listening',
    subtitle: 'Ưu tiên các câu dễ ăn điểm trước, sau đó học các câu khó theo mẹo riêng.',
    icon: Headphones,
    accent: 'text-blue-700 bg-blue-50 border-blue-200',
    active: 'bg-blue-700 text-white border-blue-700',
    blocks: [
      {
        badge: 'Câu 1-13',
        heading: 'Các câu này dễ ăn điểm nhất',
        text: 'Câu 1-13 có khoảng hơn 150 câu. Bạn chỉ cần học thuộc hết các câu hỏi sau là được; thực chất không cần nghe audio, cứ học thuộc đáp án, vào thi thấy đáp án giống là chọn.',
        actions: [{ label: 'Học câu 1 - 13', to: '/listening', tone: 'primary', icon: BookOpen }]
      },
      {
        badge: 'Câu 14',
        heading: 'Đây là câu khó nhất trong các phần',
        text: 'Bài này có 6 đáp án, trong đó có 2 đáp án gây nhiễu. Hội đồng Anh có thể đảo vị trí người đọc, nên mẹo là học thuộc đoạn văn và đáp án rồi vào thi cứ thế mà làm.',
        actions: [{ label: 'Học câu 14', to: '/listening', tone: 'cyan', icon: Puzzle }]
      },
      {
        badge: 'Câu 15',
        heading: 'Câu này tương đối dễ học',
        text: 'Part này cũng phải học thôi, học không khó vì số lượng câu hỏi ít.',
        wide: true,
        fastTip2: true,
        actions: [
          { label: 'Mẹo nhanh cách 1', tone: 'cyan', icon: Lightbulb, toggleFastTip1: true },
          { label: 'Mẹo nhanh cách 2', tone: 'green', icon: Lightbulb, toggleFastTip2: true },
          { label: 'Học câu 15', to: '/listening', tone: 'amber', icon: ClipboardCheck }
        ]
      },
      {
        badge: 'Câu 16 & 17',
        heading: 'Hai câu này dễ ăn điểm',
        text: 'Bạn chỉ cần học thuộc các đáp án, không cần quan tâm nhiều đến câu hỏi hay nội dung nghe. Học nhuần nhuyễn đến mức nhìn là biết đáp án.',
        actions: [{ label: 'Học câu 16 & 17', to: '/listening', tone: 'green', icon: Lightbulb }]
      }
    ]
  },
  {
    id: 'speaking',
    label: 'Speaking',
    title: 'Mẹo học Speaking',
    subtitle: 'Học theo từng part, chuẩn bị form trả lời sẵn để nói tự nhiên và đỡ bị bí ý.',
    icon: Mic,
    accent: 'text-rose-700 bg-rose-50 border-rose-200',
    active: 'bg-rose-700 text-white border-rose-700',
    blocks: [
      {
        badge: 'Part 1',
        heading: 'Part này gồm có 3 câu hỏi',
        text: 'Part này bạn chỉ cần học hết các câu hỏi sau là được, đi thi toàn xoay quanh mấy câu này thôi.',
        actions: [{ label: 'Học câu 1', to: '/speaking', tone: 'primary', icon: BookOpen }]
      },
      {
        badge: 'Part 2',
        heading: 'Mô tả 1 hình ảnh và 2 câu hỏi phụ',
        text: 'Part này có mẹo là học một form chung rồi áp dụng toàn bộ ảnh cho các form đó.',
        speakingPart2Tip: true,
        actions: [
          { label: 'Mẹo học nhanh', tone: 'green', icon: Lightbulb, toggleSpeakingPart2Tip: true },
          { label: 'Học đầy đủ câu 2', to: '/speaking', tone: 'amber', icon: ClipboardCheck }
        ]
      },
      {
        badge: 'Part 3',
        heading: 'Mô tả 2 hình ảnh và 2 câu hỏi phụ',
        text: 'Part này giống câu 2 nhưng là 2 hình ảnh. Bạn mô tả cả hai hình, đồng thời nói sự khác biệt. Câu này chỉ có học thôi nhé.',
        actions: [{ label: 'Học câu 3', to: '/speaking', tone: 'rose', icon: ClipboardCheck }]
      },
      {
        badge: 'Part 4',
        heading: 'Thường là kể về một lần gì đó trong quá khứ',
        text: 'Mẹo part này đã được trình bày đầy đủ trong phần câu hỏi 4. Bạn xem lại câu hỏi và học kỹ là được nhé.',
        actions: [{ label: 'Học câu 4', to: '/speaking', tone: 'green', icon: Lightbulb }]
      }
    ]
  },
  {
    id: 'writing',
    label: 'Writing',
    title: 'Mẹo học Writing',
    subtitle: 'Học nhanh format email Aptis, cụm từ ghi điểm và cách triển khai ví dụ.',
    icon: PenLine,
    accent: 'text-amber-700 bg-amber-50 border-amber-200',
    active: 'bg-amber-500 text-slate-950 border-amber-500',
    custom: 'writing',
    blocks: [
      {
        badge: 'Bước 1',
        heading: 'Lập dàn ý trước khi viết',
        text: 'Dành 2-3 phút ghi ý chính để bài không bị lan man và không quên luận điểm.',
        actions: [{ label: 'Luyện Writing', to: '/writing', tone: 'amber', icon: PenLine }]
      },
      {
        badge: 'Bước 2',
        heading: 'Mỗi đoạn chỉ tập trung một ý',
        text: 'Một đoạn nên có ý chính, lý do hoặc ví dụ rõ, rồi kết đoạn ngắn gọn.',
        actions: [{ label: 'Xem bài Writing', to: '/writing', tone: 'green', icon: CheckCircle2 }]
      },
      {
        badge: 'Bước 3',
        heading: 'Kiểm tra lỗi cuối bài',
        text: 'Chừa thời gian kiểm tra thì, số ít/số nhiều, mạo từ, dấu câu và chính tả.',
        actions: [{ label: 'Thực hành ngay', to: '/writing', tone: 'primary', icon: ClipboardCheck }]
      }
    ]
  },
  {
    id: 'grammar',
    label: 'Grammar',
    title: 'Mẹo học Grammar',
    subtitle: 'Tổng hợp mẹo nhận diện từ loại, hòa hợp chủ ngữ - động từ, mệnh đề quan hệ, câu điều kiện và so sánh.',
    icon: BookOpen,
    accent: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    active: 'bg-indigo-700 text-white border-indigo-700',
    custom: 'grammar',
    blocks: []
  }
];

const toneClass = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  cyan: 'bg-cyan-500 hover:bg-cyan-600 text-slate-950',
  amber: 'bg-amber-400 hover:bg-amber-500 text-slate-950',
  green: 'bg-emerald-700 hover:bg-emerald-800 text-white',
  rose: 'bg-rose-600 hover:bg-rose-700 text-white'
};

const listeningFastTip2 = [
  { no: 1, topic: 'Politics', vi: 'Chính trị', gender: 'Nam', key: 'B - M - N - B', note: 'Cả đàn ông và phụ nữ đều phải tôn trọng pháp luật.' },
  { no: 1, topic: 'Politics', vi: 'Chính trị', gender: 'Nữ', key: 'B - N - M - B', note: 'Đảo vị trí M và N ở câu trên.' },
  { no: 2, topic: 'IT & Tech', vi: 'Thông tin & Công nghệ', gender: 'Nam', key: 'M - N - N - B', note: 'Đàn ông M chê phụ nữ N vì kém công nghệ, nhưng phụ nữ N cực cá B, đều giỏi.' },
  { no: 2, topic: 'IT & Tech', vi: 'Thông tin & Công nghệ', gender: 'Nữ', key: 'N - M - M - B', note: 'Đảo vị trí M và N ở câu trên.' },
  { no: 3, topic: 'Arts', vi: 'Nghệ thuật', gender: 'Nam', key: 'M - N - B - M', note: 'Chàng trai và cô gái cùng nhảy múa, nhưng cô gái trượt chân nên M.' },
  { no: 3, topic: 'Arts', vi: 'Nghệ thuật', gender: 'Nữ', key: 'N - B - B - M', note: 'Đảo vị trí M và N ở câu trên.' },
  { no: 4, topic: 'Music', vi: 'Âm nhạc & Ca sĩ', gender: 'Nam', key: 'M - B - N - B', note: 'Đàn ông thích cả âm nhạc và ca sĩ. Phụ nữ cũng thích cả âm nhạc và ca sĩ.' },
  { no: 4, topic: 'Music', vi: 'Âm nhạc & Ca sĩ', gender: 'Nữ', key: 'N - B - M - B', note: 'Đảo vị trí M và N ở câu trên.' },
  { no: 5, topic: 'University', vi: 'Trường đại học', gender: 'Nam', key: 'B - N - M - M', note: 'Bố đưa con gái đi học, nhưng đến trường thì người yêu đón cô gái.' },
  { no: 5, topic: 'University', vi: 'Trường đại học', gender: 'Nữ', key: 'B - M - N - M', note: 'Đảo vị trí M và N ở câu trên.' },
  { no: 6, topic: 'Urban Farming', vi: 'Nông nghiệp đô thị', gender: 'Nam', key: 'N - B - M - B', note: 'Phụ nữ nói cả đàn ông và phụ nữ đều phải làm vườn.' },
  { no: 6, topic: 'Urban Farming', vi: 'Nông nghiệp đô thị', gender: 'Nữ', key: 'M - B - N - B', note: 'Đảo vị trí M và N ở câu trên.' },
  { no: 7, topic: 'Local Center', vi: 'Trung tâm cộng đồng', gender: 'Nam', key: 'M - B - N - M', note: 'Mẹ bảo Bin tìm em gái ở trung tâm cộng đồng.' },
  { no: 7, topic: 'Local Center', vi: 'Trung tâm cộng đồng', gender: 'Nữ', key: 'N - B - M - M', note: 'Đảo vị trí M và N ở câu trên.' },
  { no: 8, topic: 'Design', vi: 'Thiết kế cộng đồng', gender: 'Nam', key: 'B - N - M - B', note: 'Bố muốn bạn vẽ bản thiết kế nhà.' },
  { no: 8, topic: 'Design', vi: 'Thiết kế cộng đồng', gender: 'Nữ', key: 'B - M - N - B', note: 'Đảo vị trí M và N ở câu trên.' },
  { no: 9, topic: 'Beauty', vi: 'Sắc đẹp', gender: 'Nữ', key: 'M - N - B - M', note: 'Chỉ có phiên bản giọng Nữ. Chúng trai chọn M, phụ nữ N, cuối cùng cả hai chọn B.' },
  { no: 10, topic: 'Workplace', vi: 'Nơi làm việc', gender: 'Nữ', key: 'M - N - B - M', note: 'Chỉ có phiên bản giọng Nữ. Người đàn ông trượt phỏng vấn vì yếu làm việc, cả hai cùng nghiên cứu.' },
  { no: 11, topic: 'Actor', vi: 'Diễn viên', gender: 'Nam', key: 'M - W - B - B', note: 'Mẹo: My Win Bùa Bốn (MWBB). Tỉ lệ đúng 95%.' },
  { no: 12, topic: 'Internet', vi: 'Mạng Internet', gender: 'Nam', key: 'B - W - B - B', note: 'Mẹo: Bố Win Bùa Bốn (BWBB). Tỉ lệ đúng 95%.' },
  { no: 13, topic: 'Homeschooling', vi: 'Học tại nhà', gender: 'Nữ', key: 'M - N - M - B', note: 'Mình với Wn viết bài cho trường học.' },
  { no: 13, topic: 'Homeschooling', vi: 'Học tại nhà', gender: 'Nam', key: 'N - M - M - B', note: 'Đảo vị trí M và N ở câu trên.' }
];

const listeningFastTip1 = [
  { topic: 'Music and Singer', answer: '2010' },
  { topic: 'The Local Central', answer: '2011' },
  { topic: 'Urban Farming', answer: '1020' },
  { topic: 'Information Technology', answer: '2110' },
  { topic: 'Art', answer: '2101' },
  { topic: 'Politics', answer: '0210' },
  { topic: 'Community Design', answer: '0120' },
  { topic: 'University', answer: '0121' },
  { topic: 'Subject and Beauty', answer: '1202' },
  { topic: 'Change in Workplace', answer: '1201' },
  { topic: 'Actor', answer: '1200' },
  { topic: 'Internet', answer: '0200' },
  { topic: 'Home schooling', answer: '1220' }
];

function TipButton({ action, fastTip1Open, fastTip2Open, speakingPart2Open, onToggleFastTip1, onToggleFastTip2, onToggleSpeakingPart2 }) {
  const Icon = action.icon;
  if (action.toggleSpeakingPart2Tip) {
    return (
      <button type="button" className={`btn w-full ${toneClass[action.tone]}`} onClick={onToggleSpeakingPart2}>
        <Icon size={17} />
        {speakingPart2Open ? 'Ẩn mẹo học nhanh' : action.label}
      </button>
    );
  }
  if (action.toggleFastTip1) {
    return (
      <button type="button" className={`btn w-full ${toneClass[action.tone]}`} onClick={onToggleFastTip1}>
        <Icon size={17} />
        {fastTip1Open ? 'Ẩn mẹo nhanh cách 1' : action.label}
      </button>
    );
  }
  if (action.toggleFastTip2) {
    return (
      <button type="button" className={`btn w-full ${toneClass[action.tone]}`} onClick={onToggleFastTip2}>
        <Icon size={17} />
        {fastTip2Open ? 'Ẩn mẹo nhanh cách 2' : action.label}
      </button>
    );
  }
  return (
    <Link to={action.to} className={`btn w-full ${toneClass[action.tone]}`}>
      <Icon size={17} />
      {action.label}
    </Link>
  );
}

function ListeningFastTip1Table() {
  return (
    <div className="mt-4 rounded-lg border border-cyan-100 bg-cyan-50/60 p-3">
      <h4 className="mb-3 text-center text-2xl font-black text-blue-600">Mẹo nhớ Listening - Câu 15</h4>
      <div className="rounded-lg border-l-4 border-blue-600 bg-white p-4 text-sm text-slate-700 shadow-sm">
        <div className="font-black text-slate-900">Quy tắc nhớ:</div>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li><b>M (1)</b> - Man là con số 1</li>
          <li><b>W (2)</b> - Woman là con số 2</li>
          <li><b>B (0)</b> - Both/cả hai là con số 0</li>
        </ul>
        <p className="mt-3"><b>Ví dụ:</b> Music and Singer - 2010 (nữ đọc trước), nam đọc trước thì đảo 1 ↔ 2 thành <b>1020</b></p>
        <p className="mt-1 text-amber-700"><b>Mẹo nhớ:</b> Ca sĩ sinh năm 2010</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="button" className="btn bg-emerald-700 text-white hover:bg-emerald-800">Play</button>
          <span className="text-sm font-bold text-blue-600">Đã nghe: 0 giây</span>
        </div>
        <p className="mt-3 text-red-600"><b>Lưu ý 1:</b> Ví dụ bạn nghe audio để thấy từ giây thứ 12 trở về trước chỉ là giới thiệu, giây thứ 13 mới bắt đầu biết người nói trước là nữ hay nam.</p>
        <p className="mt-2 text-red-600"><b>Lưu ý 2:</b> Dưới đây là đáp án cho nữ đọc trước, nếu nam đọc trước bạn đảo 1 cho 2 và 2 cho 1 là được, 0 giữ nguyên.</p>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-[720px] w-full text-center text-sm">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-3 py-3">Chủ đề</th>
              <th className="px-3 py-3">Đáp án<br /><span className="text-xs">(Nữ đọc trước)</span></th>
              <th className="px-3 py-3">Mẹo dễ nhớ</th>
            </tr>
          </thead>
          <tbody>
            {listeningFastTip1.map((row) => (
              <tr key={row.topic} className="border-b border-slate-100 last:border-0">
                <td className="px-3 py-3">{row.topic}</td>
                <td className="px-3 py-3 font-black">{row.answer}</td>
                <td className="px-3 py-3">
                  <span className="inline-flex rounded border border-blue-600 px-2 py-1 text-xs font-semibold text-blue-600">Xem mẹo</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ListeningFastTip2Table() {
  return (
    <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50/60 p-3">
      <div className="mb-3 flex gap-2 rounded-md bg-blue-100 px-3 py-2 text-sm text-blue-900">
        <Lightbulb size={17} className="mt-0.5 shrink-0" />
        <p><b>Hướng dẫn học nhanh:</b> Hãy chú ý giọng đọc đầu tiên: Nam hay Nữ để chọn dãy đáp án phù hợp. Các ký tự B, M, N, W đại diện cho các nhóm đáp án cần nhớ.</p>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-[920px] w-full text-left text-sm">
          <thead className="bg-slate-800 text-xs uppercase text-white">
            <tr>
              <th className="px-3 py-3">#</th>
              <th className="px-3 py-3">Topic chủ đề</th>
              <th className="px-3 py-3">Giọng trước</th>
              <th className="px-3 py-3">Đáp án key</th>
              <th className="px-3 py-3">Ghi chú / mẹo nhớ</th>
            </tr>
          </thead>
          <tbody>
            {listeningFastTip2.map((row, index) => (
              <tr key={`${row.no}-${row.topic}-${row.gender}-${index}`} className="border-b border-slate-100 last:border-0">
                <td className="px-3 py-3 font-semibold text-slate-500">{row.no}</td>
                <td className="px-3 py-3">
                  <div className="font-bold text-slate-900">{row.topic}</div>
                  <div className="text-xs text-slate-500">{row.vi}</div>
                </td>
                <td className="px-3 py-3">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${row.gender === 'Nam' ? 'bg-sky-100 text-sky-700' : 'bg-pink-100 text-pink-700'}`}>
                    {row.gender}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className="inline-flex rounded bg-red-50 px-2 py-1 font-mono text-xs font-black text-red-600">{row.key}</span>
                </td>
                <td className="px-3 py-3 text-slate-600">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SpeakingPart2Tip() {
  return (
    <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50/50 p-4">
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h4 className="text-2xl font-black text-slate-900">Describe the picture?</h4>
          <span className="text-3xl leading-none text-slate-400">x</span>
        </div>
        <div className="space-y-6 p-4 text-base leading-7 text-slate-700">
          <div>
            <h5 className="mb-3 text-xl font-black text-slate-900">Đáp án:</h5>
            <h5 className="text-xl font-black text-slate-900">Công thức:</h5>
          </div>

          <div className="space-y-4">
            <p><b>Bước 1:</b> Trong bức tranh, tôi thấy có ... người. Họ/cô ấy/anh ấy đang ... (mô tả hành động hoặc tình huống trong bức tranh). Điều này cho thấy rằng họ/cô ấy/anh ấy ...</p>
            <p><b>Bước 2:</b> Theo tôi, bức tranh này rất thú vị vì ... (nêu lý do tại sao bạn thích bức tranh hoặc hành động trong đó).</p>
            <p><b>Bước 3:</b> Mọi người nên ... (nêu ý nghĩa hoặc thông điệp bạn muốn truyền tải từ bức tranh) vì ... (giải thích lý do hoặc tác động của hành động đó).</p>
          </div>

          <div className="space-y-4">
            <h5 className="text-xl font-black text-slate-900">Formula:</h5>
            <p><b>Step 1:</b> In the picture, I can see ... people. They/she/he are/is ... (mô tả họ đang làm gì). This can help they/she/he ... (các điều tốt....)</p>
            <p><b>Step 2:</b> For me, I find this picture very interesting because it can help me to ... (giúp bạn tốt hơn về gì đó).</p>
            <p><b>Step 3:</b> I think, People should ... (nội dung bức tranh) because ... (nó giúp chúng ta.....).</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SampleBox({ title, children }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-black text-slate-900">{title}</h3>
        <button type="button" className="rounded border border-blue-600 px-2 py-1 text-xs font-semibold text-blue-600">Xem chép</button>
      </div>
      <div className="space-y-3 text-sm leading-6 text-slate-700">{children}</div>
    </article>
  );
}

function Red({ children }) {
  return <span className="font-semibold text-red-600">{children}</span>;
}

function WritingTipsContent() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border-l-4 border-cyan-500 bg-cyan-50 p-4 text-sm text-slate-700">
        <b>Mẹo nhanh:</b> Có 2 email một email ngắn khoảng 50 từ cho bạn cùng CLB và một email dài 120-150 từ cho quản lý CLB. Thay đổi đúng trong các ô <Red>[ngoặc vuông]</Red>. Đi chuẩn form khoảng 8.25 điểm writing.
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="font-black">Form mẫu</h3>
        <p className="mt-2 text-sm text-slate-700">Đây là 1 form mẫu viết thư, bạn có thể dùng <Red>ChatGPT</Red> để nhờ nó sửa lại cho khác đi, bản thành phần lớn của riêng bạn.</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="font-bold text-slate-900">1. Email cho bạn</div>
            <p className="text-sm text-slate-500">(khoảng 50 từ, tiếng Anh)</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="font-bold text-slate-900">2. Email cho quản lý CLB</div>
            <p className="text-sm text-slate-500">(khoảng 120-150 từ, tiếng Anh)</p>
          </div>
        </div>
      </section>

      <SampleBox title="1. Email cho bạn (~50 từ, tiếng Anh)">
        <p>Hi <Red>[Tên của người bạn - tên người không dấu]</Red>,</p>
        <p>I've just read the notice about <Red>[sự kiện/nội dung câu hỏi]</Red>. Honestly, I feel <Red>[delighted / disappointed / surprised]</Red> because I had expected <Red>[suy nghĩ của bạn]</Red>.</p>
        <p>For now, I plan to <Red>[kế hoạch của bạn]</Red>. What do you think?</p>
        <p>Best,</p>
      </SampleBox>

      <SampleBox title="2. Email cho quản lý CLB (120-150 từ, tiếng Anh)">
        <p>Dear <Red>[Sir/Madam]</Red>,</p>
        <p>My name is <Red>[Tên đầy đủ của bạn]</Red>, and I am a member of <Red>[Tên câu lạc bộ]</Red>. I am writing to share my opinion about the recent announcement regarding <Red>[sự kiện]</Red>.</p>
        <p>In my view, the plan is <Red>[opinion 1]</Red>, and it also makes me feel <Red>[opinion 2]</Red>. If possible, I suggest <Red>[kiến nghị]</Red> because <Red>[nguyên nhân]</Red>. In addition, we could <Red>[kiến nghị 2]</Red> to improve <Red>[sự cải thiện gì đó]</Red>.</p>
        <p>A short Q&A session and a feedback form would also make the event more useful and interactive. Thank you for considering my ideas.</p>
        <p>Yours faithfully,</p>
      </SampleBox>

      <section className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="font-black">Gợi ý từ cho Opinion</h3>
          <p className="mt-2 text-sm"><b>Opinion 1:</b> difficult, challenging, practical, meaningful, useful, valuable, beneficial, inspiring, innovative, creative, effective, important, necessary.</p>
          <p className="mt-2 text-sm"><b>Tích cực khác:</b> excellent, realistic, encouraged, motivated, happy, hopeful, confident, inspired, proud.</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="font-black">Từ vựng thay thế</h3>
          <p className="mt-2 text-sm"><b>Tiêu cực:</b> unclear, unsuitable, unnecessary, unhelpful, confusing, ineffective, disappointing, problematic, risky.</p>
          <p className="mt-2 text-sm"><b>Trung lập:</b> useful, concerned, disappointed, confused, surprised, upset, uncertain.</p>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-xl font-black">Ví dụ: Book Club</h3>
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6">
          <p><b>Đề bài:</b> BOOK CLUB has invited a famous author to the public by inviting a famous author as a speaker. What kind of author do you suggest? What topic should the speaker speak on?</p>
          <p className="mt-2"><b>Gợi ý:</b> The manager, writing an email to the manager of the club. Tell the manager about your opinion.</p>
        </div>
      </section>

      <SampleBox title="Ví dụ email cho bạn (~50 từ, tiếng Anh)">
        <p>Hi Minh,</p>
        <p>I've just read the Book Club notice about <Red>inviting a famous author</Red>. Honestly, I feel <Red>excited</Red> because I expected <Red>an inspiring talk</Red>. For now, I plan to <Red>join the event and prepare some câu hỏi</Red>. What do you think?</p>
        <p>Best,</p>
        <p>An</p>
      </SampleBox>

      <SampleBox title="Ví dụ email cho quản lý (120-150 từ, tiếng Anh)">
        <p>Dear Manager,</p>
        <p>My name is <Red>An Nguyen</Red>, and I am a member of the <Red>Book Club</Red>. I am writing to share my opinion about the announcement regarding <Red>inviting a famous author</Red>.</p>
        <p>In my view, the plan is <Red>excellent</Red> and it also makes me feel <Red>inspired</Red>. If possible, I suggest inviting <Red>a bestselling contemporary novelist</Red> because their works are relatable to both students and the general public. In addition, we could ask the speaker to focus on <Red>stories that mirror modern life</Red> to improve engagement and social awareness.</p>
        <p>I also recommend including a short reading from the author's latest book, followed by a Q&A session. A feedback form at the end would help us gather opinions for future events.</p>
        <p>Sincerely,</p>
        <p><Red>An Nguyen</Red></p>
      </SampleBox>
    </div>
  );
}

const grammarSections = [
  {
    id: 'intro',
    title: 'Giới thiệu',
    body: [
      'Về cơ bản thì ngữ pháp này không tính điểm trực tiếp, nhưng nó là nền tảng để giám khảo chấm điểm viết và nói của bạn.',
      'Khi gặp bài chọn từ loại, ưu tiên soi vị trí đứng của từ: trước/sau danh từ, sau động từ to be, trước danh từ số nhiều/không đếm được.'
    ]
  },
  {
    id: 'summary',
    title: 'Tổng hợp',
    cards: [
      { title: 'Noun', chips: ['a/an/the + N', 'Adj + N', 'Prep + N/V-ing'], text: 'Đếm được số nhiều: few, a few, many, several, a number of... Không đếm được: much, little, a little, a great deal of... Cả hai: some, a lot of, lots of, all.' },
      { title: 'Adj', chips: ['a/an/the + adj + N', 'No + adj + N', 'Become + adj'], text: 'V-ed = bị động/cảm xúc của người nhận tác động, ví dụ interested. V-ing = chủ động/tính chất gây ra cảm xúc, ví dụ interesting.' },
      { title: 'Adv', chips: ['be + adv + V-ing/V-ed', 'aux + adv + V'], text: 'Trạng từ thường là adj + ly. Vị trí hay gặp: sau to be, giữa trợ động từ và động từ chính, hoặc đầu câu để bổ nghĩa cả mệnh đề.' },
      { title: 'S-V', chips: ['Each/Every/One of -> số ít', 'A number of -> số nhiều', 'The number of -> số ít'], text: 'Either/Neither thường theo B. Chủ ngữ số ít đi với động từ số ít; chủ ngữ số nhiều đi với động từ số nhiều.' },
      { title: 'Rel. clause', chips: ['who', 'whose', 'which', 'S, V, which V'], text: 'who dùng cho người; whose chỉ sở hữu; which dùng cho vật hoặc cả mệnh đề đứng trước.' },
      { title: 'If', chips: ['0: hiện tại-hiện tại', '1: hiện tại-will/can V', '2: were/V2-would/could V', '3: had V3-would/could have V3'], text: 'Xác định loại câu điều kiện bằng thì ở mệnh đề if và mệnh đề chính.' },
      { title: 'So sánh', chips: ['as...as', 'not as...as', 'adj ngắn + er than', 'more + adj dài + than', 'the + adj-est', 'the most + adj'], text: 'Bất quy tắc: good -> better -> best; bad -> worse -> worst; many/much -> more -> most; little -> less -> least.' }
    ]
  },
  {
    id: 'noun',
    title: 'I. Danh từ',
    body: [
      'Danh từ thường đứng sau a/an/the, tính từ, sở hữu cách, lượng từ hoặc giới từ.',
      'Sau giới từ dùng danh từ hoặc V-ing: interested in learning, reason for choosing.',
      'Cẩn thận danh từ đếm được và không đếm được để chọn few/many hoặc little/much.'
    ]
  },
  {
    id: 'adj',
    title: 'II. Tính từ',
    body: [
      'Tính từ đứng trước danh từ hoặc sau to be/linking verbs như become, seem, feel, look.',
      'V-ed thường nói cảm xúc của người: I am interested. V-ing nói tính chất của vật/sự việc: The lesson is interesting.',
      'Sau no thường là adjective + noun: no clear reason, no useful information.'
    ]
  },
  {
    id: 'adv',
    title: 'III. Trạng từ',
    body: [
      'Trạng từ bổ nghĩa cho động từ, tính từ, trạng từ khác hoặc cả câu.',
      'Dấu hiệu nhanh: nhiều trạng từ kết thúc bằng -ly như carefully, quickly, clearly.',
      'Vị trí hay gặp: be + adv + V-ed/V-ing hoặc auxiliary + adv + V.'
    ]
  },
  {
    id: 'sv',
    title: 'IV. Hòa hợp chủ ngữ - động từ',
    body: [
      'Each, every, one of thường đi với động từ số ít.',
      'A number of đi với động từ số nhiều, nhưng the number of đi với động từ số ít.',
      'Either/neither thường chia theo danh từ gần động từ hơn trong cấu trúc either A or B / neither A nor B.'
    ]
  },
  {
    id: 'relative',
    title: 'V. Mệnh đề quan hệ',
    body: [
      'who dùng thay người làm chủ ngữ/tân ngữ trong mệnh đề quan hệ.',
      'whose dùng để chỉ sở hữu: the student whose book was lost.',
      'which dùng cho vật hoặc thay cả mệnh đề phía trước khi có dấu phẩy.'
    ]
  },
  {
    id: 'if',
    title: 'VI. Câu điều kiện',
    body: [
      'Loại 0: If + hiện tại đơn, hiện tại đơn. Dùng cho sự thật hiển nhiên.',
      'Loại 1: If + hiện tại đơn, will/can + V. Dùng cho khả năng ở tương lai.',
      'Loại 2: If + V2/were, would/could + V. Dùng cho giả định hiện tại.',
      'Loại 3: If + had V3, would/could have V3. Dùng cho giả định quá khứ.'
    ]
  },
  {
    id: 'compare',
    title: 'VII. So sánh',
    body: [
      'Bằng nhau: as + adj/adv + as. Không bằng: not as/so + adj/adv + as.',
      'Hơn: adj ngắn + er + than; more + adj dài + than.',
      'Nhất: the + adj-est hoặc the most + adj.',
      'Bất quy tắc cần nhớ: good/better/best, bad/worse/worst, much/more/most, little/less/least.'
    ]
  }
];

function GrammarTipsContent() {
  const [open, setOpen] = useState(grammarSections.map((section) => section.id));
  const [query, setQuery] = useState('');
  const visible = grammarSections.filter((section) => {
    const haystack = [section.title, ...(section.body || []), ...(section.cards || []).flatMap((card) => [card.title, card.text, ...card.chips])].join(' ').toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  const toggle = (id) => setOpen((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <aside className="panel h-fit lg:sticky lg:top-6">
        <h3 className="text-xl font-black">Mục lục</h3>
        <nav className="mt-4 space-y-1">
          {grammarSections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={`w-full rounded-md px-3 py-2 text-left font-semibold ${open.includes(section.id) ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'}`}
              onClick={() => toggle(section.id)}
            >
              {section.title}
            </button>
          ))}
        </nav>
        <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
          <button type="button" className="btn btn-muted w-full shadow-none" onClick={() => setOpen(grammarSections.map((section) => section.id))}>Mở tất cả</button>
          <button type="button" className="btn btn-muted w-full shadow-none" onClick={() => setOpen([])}>Thu tất cả</button>
          <input className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm nhanh theo từ khóa..." />
        </div>
      </aside>

      <div className="space-y-4">
        <div className="rounded-lg border border-cyan-200 bg-cyan-100 p-4 text-lg text-cyan-950">
          <b>Mẹo nhanh:</b> Khi gặp bài chọn từ loại, ưu tiên soi vị trí đứng để quyết định noun/adj/adv.
        </div>
        {visible.map((section) => (
          <section key={section.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-2xl font-black">{section.title}</h3>
              <button type="button" className="btn btn-muted shadow-none" onClick={() => toggle(section.id)}>{open.includes(section.id) ? 'Thu gọn' : 'Mở'}</button>
            </div>
            {open.includes(section.id) && (
              <div className="mt-4">
                {section.body && <div className="space-y-2 text-slate-700">{section.body.map((line) => <p key={line}>{line}</p>)}</div>}
                {section.cards && (
                  <div className="grid gap-3 md:grid-cols-2">
                    {section.cards.map((card) => (
                      <article key={card.title} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <h4 className="font-black">{card.title}</h4>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {card.chips.map((chip) => <span key={chip} className="rounded bg-slate-900 px-2 py-1 text-xs font-bold text-white">{chip}</span>)}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-700">{card.text}</p>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

export default function Tips() {
  const location = useLocation();
  const initial = skills.some((skill) => `#${skill.id}` === location.hash) ? location.hash.slice(1) : 'reading';
  const [activeId, setActiveId] = useState(initial);
  const [fastTip1Open, setFastTip1Open] = useState(false);
  const [fastTip2Open, setFastTip2Open] = useState(false);
  const [speakingPart2Open, setSpeakingPart2Open] = useState(false);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      if (skills.some((skill) => skill.id === id)) setActiveId(id);
    }
  }, [location.hash]);

  const activeSkill = skills.find((skill) => skill.id === activeId) || skills[0];
  const ActiveIcon = activeSkill.icon;

  return (
    <div className="space-y-5">
      <section className="panel bg-[linear-gradient(135deg,#ffffff_0%,#eef7ff_55%,#fff4df_100%)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 font-bold text-amber-600">
              <Lightbulb size={20} />
              <span>Học mẹo Aptis</span>
            </div>
            <h1 className="page-title mt-2 text-3xl font-black">Mẹo học theo từng kỹ năng</h1>
            <p className="mt-2 max-w-2xl text-slate-600">Chọn kỹ năng bên dưới để xem mẹo học được chia theo part/câu, dễ ôn và dễ bấm vào luyện.</p>
          </div>
          <Link to={`/${activeSkill.id}`} className="btn btn-primary w-full lg:w-auto">Luyện {activeSkill.label}</Link>
        </div>
      </section>

      <section className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {skills.map((skill) => {
          const Icon = skill.icon;
          const selected = activeSkill.id === skill.id;
          return (
            <button
              key={skill.id}
              type="button"
              className={`btn justify-start border ${selected ? skill.active : `${skill.accent} shadow-none`}`}
              onClick={() => {
                setActiveId(skill.id);
                setFastTip1Open(false);
                setFastTip2Open(false);
                setSpeakingPart2Open(false);
              }}
            >
              <Icon size={18} />
              {skill.label}
            </button>
          );
        })}
      </section>

      <section id={activeSkill.id} className="panel scroll-mt-6">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className={`grid h-12 w-12 place-items-center rounded-lg border ${activeSkill.accent}`}>
              <ActiveIcon size={24} />
            </span>
            <div>
              <h2 className="text-2xl font-black">{activeSkill.title}</h2>
              <p className="text-sm text-slate-500">{activeSkill.subtitle}</p>
            </div>
          </div>
          <div className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600">
            {activeSkill.blocks.length} phần cần học
          </div>
        </div>

        {activeSkill.custom === 'grammar' ? (
          <div className="mt-4">
            <GrammarTipsContent />
          </div>
        ) : activeSkill.custom === 'writing' ? (
          <div className="mt-4">
            <WritingTipsContent />
          </div>
        ) : (
          <div className="mt-4 grid gap-3 xl:grid-cols-2">
            {activeSkill.blocks.map((block, index) => (
              <article key={block.heading} className={`rounded-lg border border-slate-200 bg-white p-4 shadow-sm ${block.wide ? 'xl:col-span-2' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-black uppercase tracking-wide text-slate-400">{block.badge}</div>
                    <h3 className="mt-1 text-lg font-black text-slate-900">{block.heading}</h3>
                  </div>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-sm font-black text-slate-500">{index + 1}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{block.text}</p>
                <div className={`mt-4 grid gap-2 ${block.actions.length >= 3 ? 'md:grid-cols-3' : block.actions.length === 2 ? 'md:grid-cols-2' : ''}`}>
                  {block.actions.map((action) => (
                    <TipButton
                      key={action.label}
                      action={action}
                      fastTip1Open={fastTip1Open}
                      fastTip2Open={fastTip2Open}
                      speakingPart2Open={speakingPart2Open}
                      onToggleFastTip1={() => {
                        setFastTip1Open((value) => !value);
                        setFastTip2Open(false);
                      }}
                      onToggleFastTip2={() => {
                        setFastTip2Open((value) => !value);
                        setFastTip1Open(false);
                      }}
                      onToggleSpeakingPart2={() => setSpeakingPart2Open((value) => !value)}
                    />
                  ))}
                </div>
                {block.fastTip2 && fastTip1Open && <ListeningFastTip1Table />}
                {block.fastTip2 && fastTip2Open && <ListeningFastTip2Table />}
                {block.speakingPart2Tip && speakingPart2Open && <SpeakingPart2Tip />}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
