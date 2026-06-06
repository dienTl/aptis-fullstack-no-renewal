const bandScores = [
  ['A0', 0],
  ['A1', 1],
  ['A2', 2],
  ['B1', 3],
  ['B2', 4],
  ['C1', 5]
];

const overallBands = [
  ['>= 1', 'A0'],
  ['>= 2', 'A1'],
  ['>= 6', 'A2'],
  ['>= 10', 'B1'],
  ['>= 14', 'B2'],
  ['>= 18', 'C1']
];

const examples = [
  {
    title: '4. Ví dụ 1',
    rows: [
      ['Nghe', 'B2', 4],
      ['Nói', 'B2', 4],
      ['Đọc', 'B1', 3],
      ['Viết', 'B1', 3]
    ],
    total: 'Tổng điểm = 4 + 4 + 3 + 3 = 14 - Overall = B2'
  },
  {
    title: '5. Ví dụ 2',
    rows: [
      ['Nghe', 'C1', 5],
      ['Nói', 'B1', 3],
      ['Đọc', 'A2', 2],
      ['Viết', 'B2', 4]
    ],
    total: 'Tổng điểm = 5 + 3 + 2 + 4 = 14 - Overall = B2'
  },
  {
    title: '6. Ví dụ 3',
    rows: [
      ['Nghe', 'C1', 5],
      ['Nói', 'A2', 2],
      ['Đọc', 'A2', 2],
      ['Viết', 'A1', 1]
    ],
    total: 'Tổng điểm = 5 + 2 + 2 + 1 = 10 - Overall = B1'
  }
];

function Table({ headers, rows, headerClassName = 'bg-slate-900 text-white' }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-center text-sm">
        <thead>
          <tr className={headerClassName}>
            {headers.map((header) => (
              <th key={header} className="border border-slate-300 px-3 py-2 font-black">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join('-')} className="bg-white">
              {row.map((cell) => (
                <td key={cell} className="border border-slate-300 px-3 py-2">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AptisScore() {
  return (
    <div className="panel mx-auto max-w-5xl space-y-6 bg-white">
      <h1 className="text-center text-xl font-black text-blue-600">Logic tính điểm Overall Aptis</h1>

      <section className="space-y-2">
        <h2 className="font-bold">1. Quy đổi bậc sang điểm</h2>
        <Table headers={['Bậc', 'Điểm']} rows={bandScores} />
      </section>

      <section className="space-y-2">
        <h2 className="font-bold">2. Công thức tính tổng điểm</h2>
        <div className="rounded border border-cyan-300 bg-cyan-100 px-4 py-3 text-center text-sm font-black text-slate-800">
          Tổng điểm = Nghe + Nói + Đọc + Viết
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-bold">3. Quy đổi tổng điểm sang bậc Overall</h2>
        <Table headers={['Tổng điểm', 'Bậc Overall']} rows={overallBands} />
      </section>

      {examples.map((example) => (
        <section key={example.title} className="space-y-3">
          <h2 className="font-bold">{example.title}</h2>
          <Table
            headers={['Kỹ năng', 'Bậc', 'Quy đổi sang điểm']}
            rows={example.rows}
            headerClassName="bg-blue-100 text-slate-900"
          />
          <div className="rounded border border-emerald-300 bg-emerald-100 px-4 py-3 text-center text-sm font-black text-slate-800">
            {example.total}
          </div>
        </section>
      ))}
    </div>
  );
}
